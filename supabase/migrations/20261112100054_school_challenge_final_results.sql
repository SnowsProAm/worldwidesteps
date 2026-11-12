begin;

-- Only challenge credits are closed; normal app and school step tracking continue.
create or replace function school_challenge_private.accepts_credit(p_day date, p_received_at timestamptz)
returns boolean language sql immutable strict set search_path = '' as $$
  select p_day between date '2026-10-12' and date '2026-11-12'
    and p_received_at >= timestamptz '2026-10-12 00:00:00 Europe/Dublin'
    and p_received_at < timestamptz '2026-11-13 00:00:00 Europe/Dublin';
$$;
revoke all on function school_challenge_private.accepts_credit(date, timestamptz) from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.school_challenge_record_member_credit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.school_challenge_member_credits
    (membership_id, last_lifetime_steps, credited_steps, updated_at)
  select u.id, greatest(coalesce(u.lifetime_steps, 0), 0), 0, now()
  from public.user_institutes u
  join public.institutes i on i.id = u.institute_id
  left join public.institution_workspaces w on w.id = i.workspace_id
  where u.profile_id = new.profile_id and u.status = 'Active'::public.institute_status
    and i.institute_type = 'School' and not coalesce(i.teams, false)
    and i.is_active and i.archived_at is null
    and lower(btrim(i.country)) = 'ireland'
    and coalesce(i.brand_settings->>'demo_seed', '') = ''
    and coalesce(w.workspace_kind, '') <> 'demo_template'
    and not (coalesce(w.live_dashboard_settings, '{}'::jsonb) ? 'demo_seed')
  on conflict (membership_id) do update set
    credited_steps = public.school_challenge_member_credits.credited_steps
      + case when school_challenge_private.accepts_credit(new.day, clock_timestamp())
               then greatest(excluded.last_lifetime_steps - public.school_challenge_member_credits.last_lifetime_steps, 0)
               else 0 end,
    last_lifetime_steps = greatest(public.school_challenge_member_credits.last_lifetime_steps, excluded.last_lifetime_steps),
    updated_at = now();
  return new;
end $function$;


-- Preserve the current public projection and its eligibility rules.
CREATE OR REPLACE FUNCTION school_challenge_private.live_results()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
 SET statement_timeout TO '8s'
AS $function$
with season as (
  select s.id, s.display_name, s.start, s.finish
  from public.seasons s
  where s.start <= (now() at time zone 'UTC')
    and s.finish > (now() at time zone 'UTC')
  order by s.start desc limit 1
), candidates as (
  select i.id, coalesce(i.workspace_id, i.id) logical_school_id,
    coalesce(nullif(btrim(w.name), ''), i.name) name,
    i.country, i.state_province county,
    coalesce(nullif(w.logo_url, ''), nullif(i.brand_logo_url, ''), i.image_url) logo_url,
    b.data
  from public.institutes i
  left join public.institution_workspaces w on w.id = i.workspace_id
  cross join lateral (select public.get_school_challenge_breakdown(i.id) data) b
  where i.institute_type = 'School' and i.is_active and i.archived_at is null
    and not coalesce(i.teams, false) and lower(btrim(i.country)) = 'ireland'
    and coalesce(i.brand_settings->>'demo_seed', '') = ''
    and coalesce(w.workspace_kind, '') <> 'demo_template'
    and not (coalesce(w.live_dashboard_settings, '{}'::jsonb) ? 'demo_seed')
), schools as (
  select distinct on (logical_school_id) * from candidates
  order by logical_school_id, (data->>'total_steps')::bigint desc, id
), student_display as (
  select sc.school_id, sc.profile_id, sc.steps,
    'Walker ' || upper(substr(md5('school-challenge-public-v1:' || sc.profile_id::text || ':' ||
      coalesce((select id::text from season), 'current')), 1, 6)) alias,
    coalesce(nullif(btrim(p.username), ''),
      'Walker ' || upper(substr(md5('school-challenge-public-v1:' || sc.profile_id::text || ':' ||
      coalesce((select id::text from season), 'current')), 1, 6))) display_name,
    nullif(btrim(p.profile_img), '') avatar_url
  from school_challenge_private.student_scores() sc
  join schools s on s.id = sc.school_id
  join public.profiles p on p.id = sc.profile_id
  where sc.steps > 0
), national as (
  select distinct on (profile_id) * from student_display
  order by profile_id, steps desc, school_id
), top_three as (
  select n.alias, n.display_name, n.avatar_url, n.steps,
    s.id school_id, s.name school_name, s.county, s.country, s.logo_url,
    rank() over (order by n.steps desc) rank
  from national n join schools s on s.id = n.school_id
  order by n.steps desc, n.alias, s.id limit 3
), school_rows as (
  select s.id, s.name, s.country, s.county, s.logo_url,
    (s.data->>'total_steps')::bigint total_steps,
    (s.data->>'member_count')::bigint member_count,
    s.data->'year_groups' year_groups,
    case when (s.data->>'total_steps')::bigint > 0
      then rank() over (order by (s.data->>'total_steps')::bigint desc)
      else row_number() over (order by (s.data->>'total_steps')::bigint desc, s.name, s.id)
    end rank,
    (select jsonb_build_object('alias', t.alias, 'display_name', t.display_name,
      'avatar_url', t.avatar_url, 'steps', t.steps)
     from student_display t where t.school_id = s.id
     order by t.steps desc, t.alias limit 1) top_student
  from schools s
)
select jsonb_build_object(
  'updated_at', now(),
  'scoring', 'challenge_students_from_oct12_2026',
  'season', (select jsonb_build_object('id', id, 'name', display_name,
    'start', to_char(start, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'finish', to_char(finish, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) from season),
  'schools', coalesce((select jsonb_agg(to_jsonb(r) order by r.total_steps desc, r.name, r.id)
    from school_rows r), '[]'::jsonb),
  'students', coalesce((select jsonb_agg(to_jsonb(t) order by t.steps desc, t.alias)
    from top_three t), '[]'::jsonb)
);
$function$;

revoke all on function school_challenge_private.live_results() from public, anon, authenticated;

create table if not exists school_challenge_private.final_results (
  challenge_key text primary key check (challenge_key = 'irish-schools-2026'),
  ends_at timestamptz not null,
  captured_at timestamptz not null default clock_timestamp(),
  payload jsonb not null check (
    jsonb_typeof(payload->'schools') = 'array' and jsonb_typeof(payload->'students') = 'array'
  )
);
alter table school_challenge_private.final_results enable row level security;
revoke all on school_challenge_private.final_results from public, anon, authenticated;

-- Runs independently of site visits. Retry each minute until capture succeeds.
create or replace function school_challenge_private.capture_final_results()
returns void language plpgsql security definer set search_path = '' as $$
declare
  job_id bigint;
begin
  if clock_timestamp() < timestamptz '2026-11-13 00:00:00 Europe/Dublin' then
    return;
  end if;
  -- Wait for any pre-cutoff credit writes before taking the closing snapshot.
  lock table public.school_challenge_member_credits in share mode;
  insert into school_challenge_private.final_results (challenge_key, ends_at, payload)
  values ('irish-schools-2026', timestamptz '2026-11-13 00:00:00 Europe/Dublin',
    school_challenge_private.live_results())
  on conflict (challenge_key) do nothing;
  select jobid into job_id from cron.job where jobname = 'irish-school-challenge-2026-close';
  if job_id is not null then
    perform cron.alter_job(job_id, active := false);
  end if;
end;
$$;
revoke all on function school_challenge_private.capture_final_results() from public, anon, authenticated;

-- Public reads never write/finalise results and expose only the existing public fields.
create or replace function public.get_public_school_step_challenge()
returns jsonb language plpgsql stable security definer
set search_path = '' set statement_timeout = '8s' as $$
declare
  result jsonb;
  captured timestamptz;
  status text := 'active';
begin
  if now() >= timestamptz '2026-11-13 00:00:00 Europe/Dublin' then
    select payload, captured_at into result, captured
    from school_challenge_private.final_results where challenge_key = 'irish-schools-2026';
    if result is null then
      result := jsonb_build_object('schools', '[]'::jsonb, 'students', '[]'::jsonb,
        'scoring', 'challenge_students_from_oct12_2026');
      status := 'finalizing';
    else
      status := 'final';
    end if;
  else
    result := school_challenge_private.live_results();
  end if;
  return result || jsonb_build_object(
    'updated_at', now(), 'result_status', status, 'results_captured_at', captured,
    'challenge_starts_at', timestamptz '2026-10-12 00:00:00 Europe/Dublin',
    'challenge_ends_at', timestamptz '2026-11-13 00:00:00 Europe/Dublin');
end;
$$;
revoke all on function public.get_public_school_step_challenge() from public;
grant execute on function public.get_public_school_step_challenge() to anon, authenticated, service_role;
comment on function public.get_public_school_step_challenge() is
  'Public Irish school challenge standings, 12 October through 12 November 2026 Irish time. Frozen closing results are served after midnight.';

select cron.schedule('irish-school-challenge-2026-close', '* * * * *',
  'select school_challenge_private.capture_final_results()');

commit;
