export const SEASON_SCOPES = ['global', 'national', 'regional'];
export const scopeLabel = scope => scope === 'national' ? 'National' : scope === 'regional' ? 'Regional' : 'Global';

export function normaliseSeasonHistory(rows, now = new Date()) {
  const seasons = new Map();
  for (const row of rows || []) {
    if (row.season_id == null || !SEASON_SCOPES.includes(row.scope_type)) continue;
    const rawFinish = row.finished_at;
    const finishedAt = rawFinish ? Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(rawFinish) ? rawFinish : `${rawFinish}Z`) : NaN;
    if (!Number.isFinite(finishedAt) || finishedAt > now.getTime()) continue;
    const steps = Number(row.steps);
    if (!Number.isFinite(steps) || steps <= 0) continue;
    const rank = row.rank == null ? null : Number(row.rank);
    const result = {
      seasonId: Number(row.season_id), name: row.season_name || `Season ${row.season_id}`,
      scope: row.scope_type, steps, rank: Number.isInteger(rank) && rank > 0 ? rank : null,
      tied: row.tied === true, tieGroupSize: Number(row.tie_group_size) || 1,
    };
    seasons.set(`${result.seasonId}:${result.scope}`, result);
  }
  return [...seasons.values()].sort((a, b) => b.seasonId - a.seasonId || a.scope.localeCompare(b.scope));
}

export function seasonTitleCounts(results) {
  const counts = { global: 0, national: 0, regional: 0 };
  const counted = new Set();
  for (const result of results) {
    const key = `${result.seasonId}:${result.scope}`;
    if (result.rank === 1 && SEASON_SCOPES.includes(result.scope) && !counted.has(key)) {
      counted.add(key);
      counts[result.scope] += 1;
    }
  }
  return counts;
}

export async function loadGlobalSeasonTitles(client, signal) {
  const { data, error } = await client.rpc('get_public_fitness_season_titles').abortSignal(signal);
  if (error) throw error;
  return Object.fromEntries((data || []).filter(row => Number.isInteger(Number(row.title_count)) && Number(row.title_count) > 0).map(row => [row.profile_id, Number(row.title_count)]));
}

export async function loadAthleteSeasonHistory(client, profileId, signal) {
  const { data, error } = await client.rpc('get_public_fitness_season_history', { p_profile_id: profileId }).abortSignal(signal);
  if (error) throw error;
  return normaliseSeasonHistory(data);
}
