export const localDayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const dailyStepGain = (profile, today) => {
  const steps = Number(profile?.todays_steps);
  return profile?.last_steps_date === today && Number.isFinite(steps) && steps > 0 ? steps : 0;
};
