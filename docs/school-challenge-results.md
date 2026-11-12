# Irish school challenge closing results

The challenge covers 12 October–12 November 2026 in Europe/Dublin: start inclusive at `2026-10-11T23:00:00Z`, end exclusive at `2026-11-13T00:00:00Z`.

Only the dedicated `school_challenge_member_credits.credited_steps` ledger supplies challenge totals. A step event must have a day within the challenge and reach the challenge credit trigger before the end. Late submissions, including backdated 12 November events, do not add challenge credit. Existing app steps, lifetime steps and monthly school tracking continue normally. The existing eligibility rules, group totals and student privacy projection are unchanged.

The private `irish-school-challenge-2026-close` database job runs each minute. At midnight it waits for existing ledger writes, saves the existing public school and student projection in `school_challenge_private.final_results`, then deactivates itself. The primary key prevents subsequent runs from replacing results. Failures leave the job active to retry; public reads never execute a finalisation action.

The public RPC returns `result_status` (`active`, `finalizing`, `final`), `results_captured_at`, challenge boundaries and a fresh server `updated_at`. It serves the saved projection after closure, preventing later membership edits or season changes from changing published winners. If the snapshot is not ready, the page says so and refreshes automatically. It never calls pre-midnight standings winners, including when offline. A server-anchored clock detects midnight in an already open page. Positive tied school leaders remain joint winners; no unconfirmed prize arrangements are invented.

The site polls every 10 seconds while visible and online, and on focus/reconnection. Only the school challenge is closed; the Worldwide Steps homepage total stays live.

Verification: `npm test`, `npm run build`, and `supabase db query --linked -f supabase/tests/school_challenge_closing_results.sql`. The SQL test uses transaction rollback and temporary function copies to exercise the future closing branch without publishing results early or notifying users.
