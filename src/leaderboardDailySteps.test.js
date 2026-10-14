import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyStepGain, localDayKey } from './leaderboardDailySteps.js';

test('local day key uses the viewer calendar date', () => {
  assert.equal(localDayKey(new Date(2026, 9, 14, 23, 30)), '2026-10-14');
});

test('daily gain only includes positive steps synced for today', () => {
  const today = '2026-10-14';
  assert.equal(dailyStepGain({ todays_steps: 63601, last_steps_date: today }, today), 63601);
  assert.equal(dailyStepGain({ todays_steps: 63601, last_steps_date: '2026-10-13' }, today), 0);
  assert.equal(dailyStepGain({ todays_steps: 0, last_steps_date: today }, today), 0);
  assert.equal(dailyStepGain({ todays_steps: -50, last_steps_date: today }, today), 0);
});
