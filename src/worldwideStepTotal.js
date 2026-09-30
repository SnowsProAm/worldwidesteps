export const worldwideStepTotal = sportProfiles => {
  const lifetimeStepsByProfile = new Map();
  sportProfiles.forEach(profile => {
    if (profile.sport_id !== "Fitness" || !profile.profile_id) return;
    const steps = Math.max(0, Number(profile.lifetime_steps) || 0);
    lifetimeStepsByProfile.set(profile.profile_id, Math.max(lifetimeStepsByProfile.get(profile.profile_id) || 0, steps));
  });
  return [...lifetimeStepsByProfile.values()].reduce((total, steps) => total + steps, 0);
};
