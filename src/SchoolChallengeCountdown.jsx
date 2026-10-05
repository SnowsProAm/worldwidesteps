import React, { useEffect, useState } from 'react';
import { challengeSchedule } from './schoolChallengeSchedule';
export default function SchoolChallengeCountdown() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 15000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);
  const { phase, day, days, hours, minutes, progress } = challengeSchedule(now);
  return <section className={`sc-countdown sc-countdown-${phase}`} aria-label="Challenge dates and progress">
    <div className="sc-countdown-copy"><span className="sc-eyebrow">12 October – 12 November 2026 · Irish time</span><h3>{phase === 'upcoming' ? 'The countdown is on.' : phase === 'active' ? 'Every day. Every step.' : 'That’s a wrap!'}</h3><p>{phase === 'upcoming' ? 'Lace up. Your school’s next chapter starts soon.' : phase === 'active' ? `Day ${day} of 32 · keep your school moving.` : 'The challenge has finished. Thank you for every step.'}</p></div>
    {phase !== 'finished' && <div className="sc-countdown-clock"><span>{phase === 'upcoming' ? 'Until we start' : 'Time left to step'}</span><div>{[[days, 'days'], [hours, 'hours'], [minutes, 'mins']].map(([value, label]) => <span key={label}><strong>{String(value).padStart(2, '0')}</strong><small>{label}</small></span>)}</div></div>}
    <div className="sc-countdown-progress"><div className="sc-countdown-labels"><span>{phase === 'upcoming' ? 'Ready at the starting line' : phase === 'active' ? 'Challenge progress' : 'Challenge complete'}</span><span>{Math.floor(progress)}%</span></div><div role="progressbar" aria-label="Challenge time elapsed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress)} className="sc-countdown-track"><span style={{ width: `${progress}%` }} /></div><div className="sc-countdown-labels"><span>12 Oct · Start</span><span>12 Nov · Finish</span></div></div>
  </section>;
}
