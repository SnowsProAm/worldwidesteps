-- Run against the linked database after the retirement migration. All probe
-- writes roll back, including any effects from existing sport-profile triggers.
begin;

do $$
declare
  fitness_id uuid;
  athlete_id uuid;
begin
  if exists (select 1 from public.sport_profiles where sport_id = 'Track') then
    raise exception 'A retired Track profile still exists';
  end if;
  if exists (select 1 from public.sports where id = 'Track' and active) then
    raise exception 'Track is still selectable';
  end if;
  if exists (
    select 1 from public.track_retirement_audit a
    left join public.sport_profiles f
      on f.profile_id = a.profile_id and f.sport_id = 'Fitness'
    where f.id is null or coalesce(f.lifetime_steps, 0) < greatest(
      coalesce((a.track_profile->>'lifetime_steps')::bigint, 0),
      coalesce((a.fitness_before->>'lifetime_steps')::bigint, 0)
    )
  ) then
    raise exception 'A migrated athlete lost lifetime steps or their Fitness profile';
  end if;
  if exists (
    select 1 from public.track_retirement_audit
    where fitness_before is not null
      and (fitness_before - 'lifetime_steps') is distinct from (fitness_after - 'lifetime_steps')
  ) then
    raise exception 'The migration changed existing Fitness settings or scores';
  end if;
  if exists (
    select 1 from public.track_retirement_audit a
    left join public.archived_sport_profiles archived
      on archived.profile_id = a.profile_id and archived.sport_id = 'Track'
    where a.fitness_before is not null and archived.id is null
  ) then
    raise exception 'The existing score archive did not retain a deleted Track profile';
  end if;
  if has_table_privilege('anon', 'public.track_retirement_audit', 'select')
    or has_table_privilege('authenticated', 'public.track_retirement_audit', 'select') then
    raise exception 'Retirement audit records are accessible to client roles';
  end if;

  select id, profile_id into fitness_id, athlete_id
  from public.sport_profiles where sport_id = 'Fitness' order by id limit 1;

  begin
    insert into public.sport_profiles (profile_id, sport_id, trophies)
    values (athlete_id, 'Track', 0);
    raise exception 'A client can recreate Track';
  exception when check_violation then
    if sqlerrm <> 'Track has been retired. Use Fitness.' then raise; end if;
  end;

  begin
    update public.sport_profiles set sport_id = 'Track' where id = fitness_id;
    raise exception 'A client can change Fitness back into Track';
  exception when check_violation then
    if sqlerrm <> 'Track has been retired. Use Fitness.' then raise; end if;
  end;

  update public.sport_profiles set sport_id = 'Fitness' where id = fitness_id;
end;
$$;

rollback;

select 'Track retirement and Fitness preservation checks passed' as result;
