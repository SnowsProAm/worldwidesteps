import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { challengeSchedule, CHALLENGE_START, CHALLENGE_END, COUNTDOWN_OPEN } from './schoolChallengeSchedule.js';
describe('Irish challenge schedule', () => {
  it('starts at Irish midnight on 12 October', () => { assert.equal(challengeSchedule(CHALLENGE_START - 1).phase, 'upcoming'); assert.equal(challengeSchedule(CHALLENGE_START).phase, 'active'); assert.equal(challengeSchedule(CHALLENGE_START).day, 1); });
  it('moves the launch meter through the countdown week while challenge progress stays at zero', () => {
    assert.equal(challengeSchedule(COUNTDOWN_OPEN).launchProgress, 0);
    assert.equal(challengeSchedule(COUNTDOWN_OPEN + (CHALLENGE_START - COUNTDOWN_OPEN) / 2).launchProgress, 50);
    assert.equal(challengeSchedule(CHALLENGE_START - 1).progress, 0);
    assert.equal(challengeSchedule(CHALLENGE_START).launchProgress, 100);
  });
  it('counts calendar days across the clock change', () => { assert.equal(challengeSchedule(Date.parse('2026-10-26T00:30:00Z')).day, 15); });
  it('tracks completed days across the full challenge without splitting the months', () => {
    assert.deepEqual([challengeSchedule(CHALLENGE_START).dateLabel, challengeSchedule(CHALLENGE_START).completedDays], ['12 October', 0]);
    assert.deepEqual([challengeSchedule(Date.parse('2026-11-01T00:00:00Z')).dateLabel, challengeSchedule(Date.parse('2026-11-01T00:00:00Z')).completedDays], ['1 November', 20]);
    assert.deepEqual([challengeSchedule(CHALLENGE_END - 1).dateLabel, challengeSchedule(CHALLENGE_END - 1).completedDays], ['12 November', 31]);
  });
  it('includes 12 November and finishes at midnight', () => { assert.equal(challengeSchedule(CHALLENGE_END - 1).day, 32); assert.equal(challengeSchedule(CHALLENGE_END - 1).phase, 'active'); assert.equal(challengeSchedule(CHALLENGE_END).phase, 'finished'); assert.equal(challengeSchedule(CHALLENGE_END).progress, 100); });
});
