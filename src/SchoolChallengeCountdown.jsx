import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoePrints } from '@fortawesome/free-solid-svg-icons';
import { challengeSchedule } from './schoolChallengeSchedule';
export default function SchoolChallengeCountdown() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 15000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);
  const { phase, completedDays, dateLabel, days, hours, minutes, launchProgress, progress } = challengeSchedule(now);
  const meterProgress = phase === 'upcoming' ? launchProgress : progress;
  return <section className={`sc-countdown sc-countdown-${phase}`} aria-label="Challenge dates and progress">
    <div className="sc-countdown-copy"><span className="sc-eyebrow">12 October – 12 November 2026 · Irish time</span><h3>{phase === 'upcoming' ? 'The countdown is on.' : phase === 'active' ? 'Every day. Every step.' : 'That’s a wrap!'}</h3><p>{phase === 'upcoming' ? 'The next big school challenge is getting closer.' : phase === 'active' ? `Today: ${dateLabel}. Keep your school moving.` : 'The challenge has finished. Thank you for every step.'}</p></div>
    {phase === 'upcoming' && <div className="sc-countdown-clock"><span>Until we start</span><div>{[[days, 'days'], [hours, 'hours'], [minutes, 'mins']].map(([value, label]) => <span key={label}><strong key={value}>{String(value).padStart(2, '0')}</strong><small>{label}</small></span>)}</div></div>}
    {phase === 'active' && <div className="sc-countdown-daycount"><span>Days completed</span><div><strong key={completedDays}>{completedDays}</strong><small>full days<br />since 12 October</small></div></div>}
    {phase === 'upcoming' && <div className="sc-countdown-reset"><span className="sc-reset-zero" aria-hidden="true">0</span><p><strong>Every school starts at 0 steps on 12 October.</strong> Today’s standings are a warm-up. Only steps recorded during the challenge count towards the prizes.</p></div>}
    <div className="sc-countdown-progress"><div className="sc-countdown-labels"><span>{phase === 'upcoming' ? 'The walk to the starting line' : phase === 'active' ? 'Challenge progress' : 'Challenge complete'}</span><span>{Math.floor(meterProgress)}%</span></div><div role="progressbar" aria-label={phase === 'upcoming' ? 'Countdown week progress towards 12 October' : 'Challenge time elapsed'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(meterProgress)} className="sc-countdown-track" style={{ '--sc-progress': `${meterProgress}%` }}><span className="sc-countdown-fill" /><span className="sc-countdown-runner" aria-hidden="true"><FontAwesomeIcon icon={faShoePrints} /></span></div><div className="sc-countdown-labels"><span>{phase === 'upcoming' ? '5 Oct · Countdown began' : '12 Oct · Start'}</span><span>{phase === 'upcoming' ? '12 Oct · Fresh start' : '12 Nov · Finish'}</span></div></div>
  </section>;
}
