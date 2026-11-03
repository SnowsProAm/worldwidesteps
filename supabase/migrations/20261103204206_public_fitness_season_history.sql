-- Public, read-only Fitness honours for athletes who opt into leaderboards.
-- Raw season archives and their existing RLS policies remain unchanged.
begin;

create or replace function public.get_public_fitness_season_titles()
returns table(profile_id uuid, title_count integer)
language sql stable security definer set search_path = ''
as $$
  select r.profile_id, count(distinct r.season_id)::integer
  from public.leaderboard_season_results r
  join public.seasons s on s.id = r.season_id
  join public.profiles p on p.id = r.profile_id
  where r.sport_id = 'Fitness' and r.scope_type = 'global'
    and r.eligible = true and r.display_rank = 1 and r.score > 0
    and s.finish < (now() at time zone 'UTC')
    and p.show_on_leaderboards = true
    and p.id not in ('1b824f5f-a287-4166-83e3-d6c2a9caa8e8'::uuid, '580da2f2-f424-43d4-a859-304fa6d52915'::uuid, '6f14d57e-c69f-4859-8a57-c02b2af30710'::uuid)
    and exists (select 1 from public.sport_profiles sp where sp.profile_id = p.id and sp.sport_id = 'Fitness' and sp.active = true)
  group by r.profile_id;
$$;

create or replace function public.get_public_fitness_season_history(p_profile_id uuid)
returns table(season_id smallint, season_name text, scope_type text, steps bigint, rank integer, tied boolean, tie_group_size integer, finished_at timestamp without time zone)
language sql stable security definer set search_path = ''
as $$
  select r.season_id, r.season_name, r.scope_type, r.score,
    case when r.eligible then coalesce(r.display_rank, r.dense_rank) else null end,
    r.tied, r.tie_group_size, s.finish
  from public.leaderboard_season_results r
  join public.seasons s on s.id = r.season_id
  join public.profiles p on p.id = r.profile_id
  where r.profile_id = p_profile_id and r.sport_id = 'Fitness'
    and r.scope_type in ('global', 'national', 'regional') and r.score > 0
    and s.finish < (now() at time zone 'UTC')
    and p.show_on_leaderboards = true
    and p.id not in ('1b824f5f-a287-4166-83e3-d6c2a9caa8e8'::uuid, '580da2f2-f424-43d4-a859-304fa6d52915'::uuid, '6f14d57e-c69f-4859-8a57-c02b2af30710'::uuid)
    and exists (select 1 from public.sport_profiles sp where sp.profile_id = p.id and sp.sport_id = 'Fitness' and sp.active = true)
  order by r.season_id desc, r.scope_type;
$$;

revoke all on function public.get_public_fitness_season_titles() from public, anon, authenticated;
revoke all on function public.get_public_fitness_season_history(uuid) from public, anon, authenticated;
grant execute on function public.get_public_fitness_season_titles() to anon, authenticated, service_role;
grant execute on function public.get_public_fitness_season_history(uuid) to anon, authenticated, service_role;
comment on function public.get_public_fitness_season_titles() is 'Public Global first-place season counts for active Fitness athletes visible on leaderboards; includes tied firsts and completed seasons only.';
comment on function public.get_public_fitness_season_history(uuid) is 'Public completed Fitness season scores and ranks for one leaderboard-visible active athlete. No private profile details or historical location keys.';
notify pgrst, 'reload schema';
commit;
