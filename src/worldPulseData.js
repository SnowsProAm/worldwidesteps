const hourKey = (date) => {
  const hour = new Date(date);
  hour.setUTCMinutes(0, 0, 0);
  return hour.toISOString();
};

export const pulseCountries = (rows) => [...new Set(rows.map((row) => row.country).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

export const buildPulseHours = (rows, country, now) => {
  const currentHour = new Date(hourKey(now)).getTime();
  const byHour = new Map(rows
    .filter((row) => row.country === (country || null))
    .map((row) => [hourKey(row.bucket_start), row]));

  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(currentHour - (23 - index) * 3_600_000);
    const row = byHour.get(date.toISOString());
    return { date, steps: Math.max(0, Number(row?.steps) || 0), athletes: Math.max(0, Number(row?.athletes) || 0) };
  });
};
