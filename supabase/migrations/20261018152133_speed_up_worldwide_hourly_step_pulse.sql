-- Aggregate repeated syncs before the profile join. Materialize eligible
-- countries once; otherwise the planner can recalculate it for every row.
create or replace function public.worldwide_hourly_step_pulse()
returns table (bucket_start timestamptz, country text, steps bigint, athletes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with per_athlete_hour as materialized (
    select l.profile_id,
           date_trunc('hour', l.created_at) as hour_start,
           sum(l.steps_added)::bigint as steps
    from public.step_update_log l
    where l.sport_id = 'Fitness'
      and l.steps_added > 0
      and l.created_at >= date_trunc('hour', now()) - interval '23 hours'
      and l.created_at <= now()
    group by l.profile_id, date_trunc('hour', l.created_at)
  ), recent as materialized (
    select h.profile_id, h.hour_start, h.steps,
           nullif(btrim(coalesce(nullif(btrim(p.current_country), ''), p.country)), '') as athlete_country
    from per_athlete_hour h
    join public.profiles p on p.id = h.profile_id
  ), eligible_countries as materialized (
    select athlete_country
    from recent
    where athlete_country is not null
    group by athlete_country
    having count(distinct profile_id) >= 3
  )
  select r.hour_start, null::text, sum(r.steps)::bigint, count(*)::bigint
  from recent r
  group by r.hour_start
  union all
  select r.hour_start, r.athlete_country, sum(r.steps)::bigint, count(*)::bigint
  from recent r
  join eligible_countries c on c.athlete_country = r.athlete_country
  group by r.hour_start, r.athlete_country;
$$;

revoke all on function public.worldwide_hourly_step_pulse() from public;
grant execute on function public.worldwide_hourly_step_pulse() to anon, authenticated, service_role;
