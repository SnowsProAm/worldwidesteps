import { useEffect, useRef, useState } from 'react';
import { challengeClockNow } from './schoolChallengeSchedule';

export function useSchoolChallengeClock(serverUpdatedAt) {
  const [now, setNow] = useState(null);
  const anchor = useRef(null);
  useEffect(() => {
    const receivedAt = performance.now();
    const serverTime = challengeClockNow(serverUpdatedAt, receivedAt, receivedAt);
    if (serverTime === null) return;
    anchor.current = { serverUpdatedAt, receivedAt };
    setNow(serverTime);
  }, [serverUpdatedAt]);
  useEffect(() => {
    const update = () => {
      if (anchor.current) setNow(challengeClockNow(anchor.current.serverUpdatedAt, anchor.current.receivedAt, performance.now()));
    };
    const timer = setInterval(update, 1000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return now;
}
