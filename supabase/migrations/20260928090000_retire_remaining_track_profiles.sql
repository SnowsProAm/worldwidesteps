-- The owner explicitly authorised retiring Track and retaining Fitness progress.
-- Preserve the complete legacy records before deleting duplicate sport profiles.
begin;

lock table public.sport_profiles in share row exclusive mode;

create table if not exists public.track_retirement_audit (
  track_profile_id uuid primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_profile jsonb not null,
  fitness_before jsonb,
  fitness_after jsonb,
  retired_at timestamptz not null default now()
);

alter table public.track_retirement_audit enable row level security;
revoke all on public.track_retirement_audit from public, anon, authenticated;
grant all on public.track_retirement_audit to service_role;

-- Refuse an unexpected cascade rather than deleting historical match results.
do $$
begin
  if exists (select 1 from public.game_stats where sport_id = 'Track') then
    raise exception 'Track has game stats that need a separate preservation plan';
  end if;
end;
$$;

insert into public.track_retirement_audit (
  track_profile_id, profile_id, track_profile, fitness_before
)
select t.id, t.profile_id, to_jsonb(t), to_jsonb(f)
from public.sport_profiles t
left join public.sport_profiles f
  on f.profile_id = t.profile_id and f.sport_id = 'Fitness'
where t.sport_id = 'Track'
on conflict (track_profile_id) do nothing;

-- Lifetime counters overlap across these two sports. Keep the maximum, never
-- add them together or award another trophy delta for already recorded steps.
select set_config('app.snows_step_sync', 'on', true);
update public.sport_profiles f
set lifetime_steps = greatest(coalesce(f.lifetime_steps, 0), coalesce(t.lifetime_steps, 0))
from public.sport_profiles t
where f.profile_id = t.profile_id
  and f.sport_id = 'Fitness' and t.sport_id = 'Track'
  and coalesce(t.lifetime_steps, 0) > coalesce(f.lifetime_steps, 0);

-- If a Track-only account remains, rename its existing profile so its scores,
-- settings, activation state and identity carry across without adding a sport.
update public.sport_profiles t
set sport_id = 'Fitness'
where t.sport_id = 'Track'
  and not exists (
    select 1 from public.sport_profiles f
    where f.profile_id = t.profile_id and f.sport_id = 'Fitness'
  );

-- The existing delete trigger archives score fields and removes only the
-- retired sport's World Chat memberships. Fitness memberships stay intact.
delete from public.sport_profiles t
where t.sport_id = 'Track'
  and exists (
    select 1 from public.sport_profiles f
    where f.profile_id = t.profile_id and f.sport_id = 'Fitness'
  );

update public.track_retirement_audit a
set fitness_after = to_jsonb(f)
from public.sport_profiles f
where f.profile_id = a.profile_id and f.sport_id = 'Fitness'
  and a.fitness_after is null;

update public.sports set active = false where id = 'Track' and active;

create or replace function public.prevent_retired_track_profile()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if lower(btrim(new.sport_id)) = 'track' then
    raise exception 'Track has been retired. Use Fitness.' using errcode = '23514';
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.sport_profiles'::regclass
      and tgname = 'prevent_retired_track_profile'
  ) then
    create trigger prevent_retired_track_profile
      before insert or update of sport_id on public.sport_profiles
      for each row execute function public.prevent_retired_track_profile();
  end if;

  if exists (select 1 from public.sport_profiles where sport_id = 'Track') then
    raise exception 'Track retirement did not remove every legacy profile';
  end if;
  if exists (
    select 1 from public.track_retirement_audit a
    left join public.sport_profiles f
      on f.profile_id = a.profile_id and f.sport_id = 'Fitness'
    where f.id is null
      or coalesce(f.lifetime_steps, 0) < greatest(
        coalesce((a.track_profile->>'lifetime_steps')::bigint, 0),
        coalesce((a.fitness_before->>'lifetime_steps')::bigint, 0)
      )
  ) then
    raise exception 'Track retirement failed to preserve a lifetime step counter';
  end if;
end;
$$;

commit;
