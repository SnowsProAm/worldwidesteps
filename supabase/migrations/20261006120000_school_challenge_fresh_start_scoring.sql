begin;

-- The public leaderboard keeps current school totals as a warm-up until the
-- challenge starts. From Irish midnight on 12 October, score only daily steps
-- recorded for 12 October through 12 November. No existing app totals reset.
-- Respect show_on_leaderboards; never expose contacts, codes or profile IDs.
create or replace function public.get_public_school_step_challenge()
returns jsonb
language sql stable security definer
set search_path = ''
set statement_timeout = '8s'
as $function$
with season as (
  select s.id, s.display_name, s.start, s.finish
  from public.seasons s
  where s.start <= (now() at time zone 'UTC')
    and s.finish > (now() at time zone 'UTC')
  order by s.start desc limit 1
), school_members as materialized (
  select distinct u.profile_id
  from public.user_institutes u
  join public.institutes i on i.id = u.institute_id
  left join public.institution_workspaces w on w.id = i.workspace_id
  where u.status = 'Active'
    and i.institute_type = 'School' and i.is_active and i.archived_at is null
    and not coalesce(i.teams, false)
    and lower(btrim(i.country)) = 'ireland'
    and coalesce(i.brand_settings->>'demo_seed', '') = ''
    and coalesce(w.workspace_kind, '') <> 'demo_template'
    and not (coalesce(w.live_dashboard_settings, '{}'::jsonb) ? 'demo_seed')
), event_steps as materialized (
  select d.profile_id, sum(greatest(d.steps, 0))::bigint as steps
  from school_members m
  join public.daily_step_snapshots d on d.profile_id = m.profile_id
  where d.day between date '2026-10-12' and date '2026-11-12'
    and d.day <= (now() at time zone 'Europe/Dublin')::date
  group by d.profile_id
), grouped as (
  -- Same eligibility, branding and workspace deduplication as the app's
  -- institute leaderboard, without its 100-row page limit.
  select i.id, coalesce(i.workspace_id, i.id) as logical_school_id,
    coalesce(nullif(btrim(w.name), ''), i.name) as name,
    i.country, i.state_province as county,
    coalesce(nullif(w.logo_url, ''), nullif(i.brand_logo_url, ''), i.image_url) as logo_url,
    case when now() < timestamptz '2026-10-12 00:00:00+01:00'
      then coalesce(sum(u.steps) filter (where u.status = 'Active'), 0)
      else coalesce(sum(coalesce(e.steps, 0)) filter (where u.status = 'Active'), 0)
    end::bigint as total_steps,
    count(distinct u.profile_id) filter (where u.status = 'Active') as member_count
  from public.institutes i
  left join public.institution_workspaces w on w.id = i.workspace_id
  left join public.user_institutes u on u.institute_id = i.id
  left join event_steps e on e.profile_id = u.profile_id
  where i.institute_type = 'School' and i.is_active and i.archived_at is null
    and not coalesce(i.teams, false)
    and lower(btrim(i.country)) = 'ireland'
    and coalesce(i.brand_settings->>'demo_seed', '') = ''
    and coalesce(w.workspace_kind, '') <> 'demo_template'
    and not (coalesce(w.live_dashboard_settings, '{}'::jsonb) ? 'demo_seed')
  group by i.id, w.name, w.logo_url
), schools as (
  select distinct on (logical_school_id) * from grouped
  order by logical_school_id, total_steps desc, id
), school_staff as (
  -- Teacher status takes precedence over legacy Student memberships, including
  -- staff membership in the paired year-group institute or a different school.
  select i.profile_id from public.institutes i
  where i.institute_type = 'School' and i.archived_at is null
  union
  select a.profile_id from public.institute_admins a
  join public.institutes i on i.id = a.institute_id
  where i.institute_type = 'School' and i.archived_at is null
  union
  select w.owner_profile_id from public.institution_workspaces w
  join public.institutes i on i.workspace_id = w.id
  where i.institute_type = 'School' and i.archived_at is null
  union
  select m.profile_id from public.workspace_members m
  join public.institutes i on i.workspace_id = m.workspace_id
  where i.institute_type = 'School' and i.archived_at is null
    and lower(m.role) in ('owner', 'admin', 'manager', 'teacher', 'staff')
  union
  select u.profile_id from public.user_institutes u
  join public.institutes i on i.id = u.institute_id
  left join public.institute_teams t on t.id = u.team_id
  where i.institute_type = 'School' and i.archived_at is null
    and u.status = 'Active'
    and (u.association_type in ('Teacher', 'Lecturer', 'Employee', 'Coach', 'Manager')
      or lower(btrim(t.type)) = 'staff')
), student_members as (
  select s.id as school_id, u.profile_id,
    max(case when now() < timestamptz '2026-10-12 00:00:00+01:00'
      then greatest(u.steps, 0) else greatest(coalesce(e.steps, 0), 0) end)::bigint as steps
  from schools s
  join public.user_institutes u on u.institute_id = s.id
  join public.profiles p on p.id = u.profile_id
  left join event_steps e on e.profile_id = u.profile_id
  where u.status = 'Active' and u.association_type = 'Student'
    and p.show_on_leaderboards is true
    and not exists (select 1 from school_staff staff where staff.profile_id = p.id)
    and u.profile_id not in ('1b824f5f-a287-4166-83e3-d6c2a9caa8e8'::uuid, '6f14d57e-c69f-4859-8a57-c02b2af30710'::uuid)
  group by s.id, u.profile_id
), students as (
  select school_id, profile_id, steps,
    'Walker ' || upper(substr(md5('school-challenge-public-v1:' || profile_id::text || ':' || coalesce((select id::text from season), 'current')), 1, 6)) as alias
  from student_members where steps > 0
), student_display as (
  select s.*, coalesce(nullif(btrim(p.username), ''), nullif(btrim(p.name), ''), s.alias) as display_name,
    nullif(btrim(p.profile_img), '') as avatar_url
  from students s join public.profiles p on p.id = s.profile_id
), national as (
  -- A walker with more than one school membership occupies one national spot.
  select distinct on (profile_id) * from student_display
  order by profile_id, steps desc, school_id
), top_three as (
  select n.alias, n.display_name, n.avatar_url, n.steps, s.id as school_id, s.name as school_name,
    s.county, s.country, s.logo_url,
    rank() over (order by n.steps desc) as rank
  from national n join schools s on s.id = n.school_id
  order by n.steps desc, n.alias, s.id limit 3
), school_rows as (
  select s.id, s.name, s.country, s.county, s.logo_url, s.total_steps,
    s.member_count, case when s.total_steps > 0
      then rank() over (order by s.total_steps desc)
      else row_number() over (order by s.total_steps desc, s.name, s.id)
    end as rank,
    (select jsonb_build_object('alias', t.alias, 'display_name', t.display_name, 'avatar_url', t.avatar_url, 'steps', t.steps)
      from student_display t where t.school_id = s.id
      order by t.steps desc, t.alias limit 1) as top_student
  from schools s
)
select jsonb_build_object(
  'updated_at', now(),
  'scoring', case when now() < timestamptz '2026-10-12 00:00:00+01:00'
    then 'warmup_school_totals' else 'challenge_steps_oct12_nov12_2026' end,
  'season', (select jsonb_build_object('id', id, 'name', display_name,
    'start', to_char(start, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'finish', to_char(finish, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) from season),
  'schools', coalesce((select jsonb_agg(to_jsonb(r) order by r.total_steps desc, r.name, r.id) from school_rows r), '[]'::jsonb),
  'students', coalesce((select jsonb_agg(to_jsonb(t) order by t.steps desc, t.alias) from top_three t), '[]'::jsonb)
);
$function$;

-- This is a new function: remove PostgreSQL's default PUBLIC execution grant.
revoke all on function public.get_public_school_step_challenge() from public;
grant execute on function public.get_public_school_step_challenge() to anon, authenticated, service_role;
comment on function public.get_public_school_step_challenge() is
'Public Irish school challenge: warm-up totals before 12 October 2026; challenge-day steps thereafter. Opted-in student names/photos only; no contacts, profile IDs or join codes.';

commit;
