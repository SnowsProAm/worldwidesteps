-- Read-only smoke checks against the linked project after deployment.
with payload as (select public.get_public_school_step_challenge() as data),
school_rows as (select jsonb_array_elements(data->'schools') as school from payload),
app_rows as (select * from public.get_public_institute_leaderboard('School', 'National', 'Ireland', null))
select
  to_regprocedure('public.get_public_school_step_challenge()') is not null as function_exists,
  has_function_privilege('anon', 'public.get_public_school_step_challenge()', 'EXECUTE') as public_execution,
  not ((select data::text from payload) ~ '(access_code|profile_id|email|surname|username|profile_img)') as no_private_fields,
  (select data->>'scoring' from payload) = case
    when now() < timestamptz '2026-10-12 00:00:00+01:00' then 'warmup_school_totals'
    else 'challenge_steps_oct12_nov12_2026'
  end as scoring_phase_matches_clock,
  not exists (
    select 1 from school_rows s join app_rows a on a.id::text = s.school->>'id'
    where s.school->>'name' <> a.name
       or (now() < timestamptz '2026-10-12 00:00:00+01:00'
         and (s.school->>'total_steps')::bigint <> a.total_steps)
  ) as warmup_totals_and_names_match_app,
  not exists (
    select 1 from school_rows s join public.institutes i on i.id::text = s.school->>'id'
    where not i.is_active or i.archived_at is not null or i.teams or i.institute_type <> 'School'
  ) as only_active_canonical_schools,
  (select count(*) = count(distinct school->>'id') from school_rows) as unique_school_rows,
  not exists (
    select 1 from payload, jsonb_array_elements(data->'students') s
    join public.profiles p on p.username = s->>'display_name'
    join public.institute_admins a on a.profile_id = p.id
    join public.institutes i on i.id = a.institute_id
    where i.institute_type = 'School' and i.is_active and i.archived_at is null
  ) as no_school_admins_in_student_prizes,
  jsonb_array_length((select data->'students' from payload)) <= 3 as at_most_three_students,
  (select data->'season'->>'name' from payload) as current_season,
  (select count(*) from school_rows) as school_count;
