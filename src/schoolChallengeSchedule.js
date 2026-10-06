// Irish local dates: BST at the start, GMT after the October clock change.
export const CHALLENGE_START = Date.parse('2026-10-12T00:00:00+01:00');
export const CHALLENGE_END = Date.parse('2026-11-13T00:00:00+00:00'); // Includes all of 12 November.
export const COUNTDOWN_OPEN = Date.parse('2026-10-05T00:00:00+01:00');
const DAY = 86400000;
export function challengeSchedule(now = Date.now()) {
  const phase = now < CHALLENGE_START ? 'upcoming' : now < CHALLENGE_END ? 'active' : 'finished';
  const remaining = Math.max(0, (phase === 'upcoming' ? CHALLENGE_START : CHALLENGE_END) - now);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Dublin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => Number(date.find(item => item.type === type).value);
  const day = Math.max(1, Math.min(32, Math.round((Date.UTC(part('year'), part('month') - 1, part('day')) - Date.UTC(2026, 9, 12)) / DAY) + 1));
  const dateLabel = `${part('day')} ${new Intl.DateTimeFormat('en-IE', { timeZone: 'Europe/Dublin', month: 'long' }).format(now)}`;
  return { phase, day, completedDays: Math.max(0, day - 1), dateLabel,
    days: Math.floor(remaining / DAY), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60,
    launchProgress: Math.max(0, Math.min(100, (now - COUNTDOWN_OPEN) / (CHALLENGE_START - COUNTDOWN_OPEN) * 100)),
    progress: Math.max(0, Math.min(100, (now - CHALLENGE_START) / (CHALLENGE_END - CHALLENGE_START) * 100)) };
}
