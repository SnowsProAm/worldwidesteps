-- Public, aggregate-only hourly step activity for the Worldwide Steps pulse.
-- Event time is when steps were recorded by the app, not proof of a live walk.
create index if not exists step_update_log_fitness_created_at_idx
  on public.step_update_log (sport_id, created_at desc);

create or replace function public.worldwide_hourly_step_pulse()
returns table (
  bucket_start timestamptz,
  country text,
  steps bigint,
  athletes bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with recent as materialized (
    select
      l.profile_id,
      l.steps_added,
      date_trunc('hour', l.created_at) as hour_start,
      nullif(btrim(coalesce(nullif(btrim(p.current_country), ''), p.country)), '') as athlete_country
    from public.step_update_log l
    join public.profiles p on p.id = l.profile_id
    where l.sport_id = 'Fitness'
      and l.steps_added > 0
      and l.created_at >= date_trunc('hour', now()) - interval '23 hours'
      and l.created_at <= now()
  ), eligible_countries as (
    -- Country detail is shown only when at least three athletes contributed.
    select athlete_country
    from recent
    where athlete_country is not null
    group by athlete_country
    having count(distinct profile_id) >= 3
  )
  select r.hour_start, null::text, sum(r.steps_added)::bigint, count(distinct r.profile_id)::bigint
  from recent r
  group by r.hour_start
  union all
  select r.hour_start, r.athlete_country, sum(r.steps_added)::bigint, count(distinct r.profile_id)::bigint
  from recent r
  join eligible_countries c on c.athlete_country = r.athlete_country
  group by r.hour_start, r.athlete_country;
$$;

revoke all on function public.worldwide_hourly_step_pulse() from public;
grant execute on function public.worldwide_hourly_step_pulse() to anon, authenticated, service_role;
