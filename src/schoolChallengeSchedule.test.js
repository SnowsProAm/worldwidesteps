import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { challengeSchedule, CHALLENGE_START, CHALLENGE_END } from './schoolChallengeSchedule.js';
describe('Irish challenge schedule', () => {
  it('starts at Irish midnight on 12 October', () => { assert.equal(challengeSchedule(CHALLENGE_START - 1).phase, 'upcoming'); assert.equal(challengeSchedule(CHALLENGE_START).phase, 'active'); assert.equal(challengeSchedule(CHALLENGE_START).day, 1); });
  it('counts calendar days across the clock change', () => { assert.equal(challengeSchedule(Date.parse('2026-10-26T00:30:00Z')).day, 15); });
  it('includes 12 November and finishes at midnight', () => { assert.equal(challengeSchedule(CHALLENGE_END - 1).day, 32); assert.equal(challengeSchedule(CHALLENGE_END - 1).phase, 'active'); assert.equal(challengeSchedule(CHALLENGE_END).phase, 'finished'); assert.equal(challengeSchedule(CHALLENGE_END).progress, 100); });
});
