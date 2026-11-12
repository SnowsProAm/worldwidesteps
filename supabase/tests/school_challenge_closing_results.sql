begin;

do $test$
begin
  if school_challenge_private.accepts_credit(date '2026-10-12', timestamptz '2026-10-11 22:59:59.999+00')
    or not school_challenge_private.accepts_credit(date '2026-10-12', timestamptz '2026-10-11 23:00:00+00')
    or not school_challenge_private.accepts_credit(date '2026-11-12', timestamptz '2026-11-12 23:59:59.999+00')
    or school_challenge_private.accepts_credit(date '2026-11-12', timestamptz '2026-11-13 00:00:00+00')
    or school_challenge_private.accepts_credit(date '2026-11-13', timestamptz '2026-11-12 12:00:00+00')
    or school_challenge_private.accepts_credit(date '2026-10-11', timestamptz '2026-10-12 12:00:00+00') then
    raise exception 'Challenge credit boundaries are incorrect';
  end if;
  if has_function_privilege('anon', 'school_challenge_private.capture_final_results()', 'execute')
    or has_table_privilege('authenticated', 'school_challenge_private.final_results', 'select') then
    raise exception 'Private results must remain private';
  end if;
  if pg_get_functiondef('public.school_challenge_record_member_credit()'::regprocedure)
    not like '%school_challenge_private.accepts_credit(new.day, clock_timestamp())%' then
    raise exception 'Live credit trigger does not enforce the cutoff';
  end if;
  if now() < timestamptz '2026-11-13 00:00:00+00' then
    perform school_challenge_private.capture_final_results();
    if exists (select 1 from school_challenge_private.final_results) then
      raise exception 'Results were published before the deadline';
    end if;
  end if;
end;
$test$;

-- Isolated future-clock fixture. No real score or published result is modified.
create temporary table closing_fixture (id integer);
do $fixture$
declare definition text;
begin
  definition := pg_get_functiondef('school_challenge_private.capture_final_results()'::regprocedure);
  definition := replace(definition, 'school_challenge_private.capture_final_results()', 'pg_temp.capture_fixture()');
  definition := replace(definition, '2026-11-13 00:00:00 Europe/Dublin', '2026-11-12 00:00:00 Europe/Dublin');
  definition := replace(definition, 'school_challenge_private.live_results()',
    $json$' {"schools":[{"id":"fixture","name":"Fixture School","total_steps":100}],"students":[]}'::jsonb$json$);
  execute definition;
  definition := pg_get_functiondef('public.get_public_school_step_challenge()'::regprocedure);
  definition := replace(definition, 'public.get_public_school_step_challenge()', 'pg_temp.public_fixture()');
  definition := replace(definition, '2026-11-13 00:00:00 Europe/Dublin', '2026-11-12 00:00:00 Europe/Dublin');
  execute definition;
end;
$fixture$;

do $assert$
declare first_capture timestamptz; result jsonb;
begin
  if (pg_temp.public_fixture()->>'result_status') <> 'finalizing' then
    raise exception 'Unsaved results must be finalizing';
  end if;
  perform pg_temp.capture_fixture();
  select captured_at into first_capture from school_challenge_private.final_results;
  perform pg_temp.capture_fixture();
  if first_capture is distinct from (select captured_at from school_challenge_private.final_results) then
    raise exception 'Closing snapshot was overwritten';
  end if;
  result := pg_temp.public_fixture();
  if result->>'result_status' <> 'final' or result#>>'{schools,0,name}' <> 'Fixture School' then
    raise exception 'Public results did not use the frozen snapshot';
  end if;
  if exists (select 1 from cron.job where jobname='irish-school-challenge-2026-close' and active) then
    raise exception 'Successful closing capture did not deactivate its job';
  end if;
end;
$assert$;

rollback;
