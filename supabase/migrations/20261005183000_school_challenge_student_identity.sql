begin;

-- Public leaderboard projection. Respect show_on_leaderboards, matching the app.
-- Ghost Mode controls location only. Never expose contacts, join codes, or profile IDs.
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
), grouped as (
  -- Same eligibility, branding, totals and workspace deduplication as the
  -- app's get_institute_leaderboard_page, without its 100-row page limit.
  select i.id, coalesce(i.workspace_id, i.id) as logical_school_id,
    coalesce(nullif(btrim(w.name), ''), i.name) as name,
    i.country, i.state_province as county,
    coalesce(nullif(w.logo_url, ''), nullif(i.brand_logo_url, ''), i.image_url) as logo_url,
    coalesce(sum(u.steps) filter (where u.status = 'Active'), 0)::bigint as total_steps,
    count(distinct u.profile_id) filter (where u.status = 'Active') as member_count
  from public.institutes i
  left join public.institution_workspaces w on w.id = i.workspace_id
  left join public.user_institutes u on u.institute_id = i.id
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
), student_members as (
  select s.id as school_id, u.profile_id, max(greatest(u.steps, 0))::bigint as steps
  from schools s
  join public.user_institutes u on u.institute_id = s.id
  join public.profiles p on p.id = u.profile_id
  where u.status = 'Active' and u.association_type = 'Student'
    and p.show_on_leaderboards is true
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
    s.member_count, rank() over (order by s.total_steps desc) as rank,
    (select jsonb_build_object('alias', t.alias, 'display_name', t.display_name, 'avatar_url', t.avatar_url, 'steps', t.steps)
      from student_display t where t.school_id = s.id
      order by t.steps desc, t.alias limit 1) as top_student
  from schools s
)
select jsonb_build_object(
  'updated_at', now(),
  'scoring', 'current_school_totals',
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
'Public Irish school challenge: school totals and opted-in student leaderboard names/photos, no contacts, locations, profile IDs or join codes.';

commit;
