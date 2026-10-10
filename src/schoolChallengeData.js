export const REFRESH_INTERVAL = 60_000;
export const number = new Intl.NumberFormat('en-IE');
export const safeCount = value => Math.max(0, Math.floor(Number(value) || 0));
export const searchKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function safeLogo(value) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
  catch { return null; }
}

export function normalizeChallenge(payload) {
  if (!payload || !Array.isArray(payload.schools) || !Array.isArray(payload.students)) {
    throw new Error('The school leaderboard response is incomplete.');
  }
  const schools = payload.schools.map(school => ({
    id: String(school.id), name: String(school.name || 'School'),
    county: String(school.county || ''), country: String(school.country || 'Ireland'),
    logo_url: safeLogo(school.logo_url), total_steps: safeCount(school.total_steps),
    member_count: safeCount(school.member_count),
    top_student: school.top_student ? {
      alias: String(school.top_student.alias), display_name: String(school.top_student.display_name || school.top_student.alias), avatar_url: safeLogo(school.top_student.avatar_url), steps: safeCount(school.top_student.steps),
    } : null,
  })).sort((a, b) => b.total_steps - a.total_steps || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  schools.forEach((school, index) => {
    school.rank = school.total_steps > 0 && index > 0 && school.total_steps === schools[index - 1].total_steps ? schools[index - 1].rank : index + 1;
  });
  return {
    schools,
    students: payload.students.map(student => ({
      alias: String(student.alias), display_name: String(student.display_name || student.alias), avatar_url: safeLogo(student.avatar_url), steps: safeCount(student.steps),
      rank: safeCount(student.rank), school_id: String(student.school_id),
      school_name: String(student.school_name), county: String(student.county || ''),
      country: String(student.country || 'Ireland'), logo_url: safeLogo(student.logo_url),
    })).sort((a, b) => b.steps - a.steps || a.alias.localeCompare(b.alias)).slice(0, 3),
    season: payload.season || null,
    scoring: payload.scoring,
    totalSteps: schools.reduce((sum, school) => sum + school.total_steps, 0),
    totalParticipants: schools.reduce((sum, school) => sum + school.member_count, 0),
    counties: [...new Set(schools.map(school => school.county).filter(Boolean))].sort(),
    updatedAt: payload.updated_at,
  };
}

export function filterSchools(schools, query, county) {
  const key = searchKey(query.trim());
  return schools.filter(school => (!county || school.county === county)
    && searchKey(`${school.name} ${school.county}`).includes(key));
}

export function rankMovements(before, after) {
  const oldRanks = new Map((before || []).map(school => [school.id, school.rank]));
  return Object.fromEntries(after.filter(school => oldRanks.has(school.id))
    .map(school => [school.id, oldRanks.get(school.id) - school.rank]));
}
