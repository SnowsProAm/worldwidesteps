import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseSeasonHistory, seasonTitleCounts, loadGlobalSeasonTitles, loadAthleteSeasonHistory } from './athleteSeasonHistoryData.js';

const now = new Date('2026-11-03T12:00:00Z');
const row = (overrides = {}) => ({ season_id: 10, season_name: 'Season 10', scope_type: 'global', steps: 400000, rank: 1, tied: false, tie_group_size: 1, finished_at: '2026-11-01T00:00:00', ...overrides });
const client = response => {
  const calls = [];
  return { calls, rpc: (...args) => { calls.push(args); return { abortSignal: async () => response }; } };
};

test('only completed, recorded seasons appear, with newest first and no duplicate season/scope rows', () => {
  const history = normaliseSeasonHistory([row(), row(), row({ season_id: 9 }), row({ season_id: 11, finished_at: '2026-12-01T00:00:00' }), row({ season_id: 8, steps: 0 }), row({ season_id: 7, finished_at: 'invalid' }), row({ scope_type: 'unknown' })], now);
  assert.deepEqual(history.map(result => result.seasonId), [10, 9]);
});

test('first-place titles stay separate by scope, count ties and exclude podium finishes and unranked activity', () => {
  const history = normaliseSeasonHistory([row({ tied: true, tie_group_size: 2 }), row({ scope_type: 'national' }), row({ scope_type: 'regional' }), row({ season_id: 9, rank: 2 }), row({ season_id: 8, rank: null })], now);
  assert.deepEqual(seasonTitleCounts(history), { global: 1, national: 1, regional: 1 });
  assert.equal(history.find(result => result.seasonId === 8).rank, null);
  assert.equal(history.find(result => result.scope === 'global' && result.seasonId === 10).tieGroupSize, 2);
});

test('public Global title counts use the dedicated read RPC and ignore invalid counts', async () => {
  const api = client({ data: [{ profile_id: 'champion', title_count: 6 }, { profile_id: 'zero', title_count: 0 }, { profile_id: 'invalid', title_count: 'bad' }], error: null });
  assert.deepEqual(await loadGlobalSeasonTitles(api), { champion: 6 });
  assert.deepEqual(api.calls, [['get_public_fitness_season_titles']]);
});

test('athlete history requests only the selected profile and normalises its results', async () => {
  const api = client({ data: [row({ finished_at: '2000-01-01T00:00:00' })], error: null });
  assert.equal((await loadAthleteSeasonHistory(api, 'selected-athlete'))[0].rank, 1);
  assert.deepEqual(api.calls, [['get_public_fitness_season_history', { p_profile_id: 'selected-athlete' }]]);
});

test('a failed history lookup is an error, while a successful empty history stays empty', async () => {
  await assert.rejects(loadAthleteSeasonHistory(client({ data: null, error: new Error('Unavailable') }), 'athlete'), /Unavailable/);
  assert.deepEqual(await loadAthleteSeasonHistory(client({ data: [], error: null }), 'athlete'), []);
});
