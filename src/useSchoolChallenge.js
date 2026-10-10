import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { normalizeChallenge, rankMovements, REFRESH_INTERVAL } from './schoolChallengeData';

export function useSchoolChallenge() {
  const [state, setState] = useState({ data: null, loading: navigator.onLine, refreshing: false, error: false, offline: !navigator.onLine, movements: {} });
  const refreshRef = useRef(() => {});
  useEffect(() => {
    let active = true, busy = false, controller;
    const refresh = async () => {
      if (!active || busy || document.hidden || !navigator.onLine) return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      setState(previous => ({ ...previous, refreshing: true }));
      try {
        const { data, error } = await supabase.rpc('get_public_school_step_challenge').abortSignal(controller.signal);
        if (error) throw error;
        const normalized = normalizeChallenge(data);
        if (active) setState(previous => ({ ...previous, data: normalized, loading: false, refreshing: false,
          error: false, movements: previous.data?.scoring === normalized.scoring ? rankMovements(previous.data?.schools, normalized.schools) : {} }));
      } catch {
        if (active) setState(previous => ({ ...previous, loading: false, refreshing: false, error: true }));
      } finally { clearTimeout(timeout); busy = false; }
    };
    const connection = () => {
      setState(previous => ({ ...previous, offline: !navigator.onLine, loading: navigator.onLine ? previous.loading : false }));
      if (navigator.onLine) refresh();
    };
    const visibility = () => { if (!document.hidden) refresh(); };
    refreshRef.current = refresh;
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      active = false; controller?.abort(); clearInterval(interval);
      window.removeEventListener('online', connection); window.removeEventListener('offline', connection);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const refresh = useCallback(() => refreshRef.current(), []);
  return { ...state, refresh };
}
