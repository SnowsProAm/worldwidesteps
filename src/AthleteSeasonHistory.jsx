import React, { useEffect, useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faXmark } from '@fortawesome/free-solid-svg-icons';
import { supabase } from './supabaseClient';
import { loadAthleteSeasonHistory, SEASON_SCOPES, scopeLabel, seasonTitleCounts } from './athleteSeasonHistoryData.js';
import './athleteSeasonHistory.css';

export default function AthleteSeasonHistory({ athlete, C, onClose }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(document.activeElement);
  const headingId = useId();
  const descriptionId = useId();
  const [scope, setScope] = useState('global');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    setStatus('loading');
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
    loadAthleteSeasonHistory(supabase, athlete.pid, controller.signal)
      .then(rows => {
        if (active) { setResults(rows); setStatus('ready'); }
      })
      .catch(() => { if (active && (!controller.signal.aborted || timedOut)) setStatus('error'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [athlete.pid, attempt]);

  const counts = seasonTitleCounts(results);
  const visibleResults = results.filter(result => result.scope === scope);
  const fmt = value => value.toLocaleString('en-GB');
  return <dialog ref={dialogRef} className="athlete-history-dialog" aria-labelledby={headingId} aria-describedby={descriptionId}
    onCancel={onClose} onClose={event => { if (!event.currentTarget.open) onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    style={{ '--history-surface': C.bgCard, '--history-text': C.text, '--history-muted': C.textMuted, '--history-line': C.borderMedium, '--history-accent': C.accent, '--history-tint': C.accentBgLight, '--history-gold': C.mode === 'dark' ? '#E8C77E' : '#856000' }}>
    <div className="athlete-history-inner">
      <header className="athlete-history-heading">
        <div><p className="athlete-history-eyebrow">Past seasons &amp; titles</p><h2 id={headingId}>{athlete.name}</h2><p id={descriptionId}>{athlete.username || 'Fitness athlete'} · Completed Fitness seasons</p></div>
        <button type="button" className="athlete-history-close" aria-label="Close season history" onClick={onClose} autoFocus><FontAwesomeIcon icon={faXmark} aria-hidden="true" /></button>
      </header>
      <div className="athlete-history-body">
        {status === 'loading' && <p className="athlete-history-state" role="status">Loading past seasons…</p>}
        {status === 'error' && <div className="athlete-history-state" role="alert"><p>We couldn’t load this athlete’s season history. Check your connection and try again.</p><button type="button" className="athlete-history-retry" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
        {status === 'ready' && <>
          <div className="athlete-history-totals" aria-label="Completed season titles">{SEASON_SCOPES.map(item => <span key={item}><FontAwesomeIcon icon={faTrophy} aria-hidden="true" /><strong>{counts[item]}</strong> {scopeLabel(item)}</span>)}</div>
          <p className="athlete-history-note">First-place finishes in completed seasons. Tied firsts count.</p>
          <div className="athlete-history-scopes" role="group" aria-label="Season leaderboard scope">{SEASON_SCOPES.map(item => <button type="button" key={item} aria-pressed={scope === item} onClick={() => setScope(item)}>{scopeLabel(item)}</button>)}</div>
          {visibleResults.length ? <table className="athlete-history-table" aria-label={`${scopeLabel(scope)} season results`}>
            <thead><tr><th scope="col">Season</th><th scope="col">Steps</th><th scope="col">Finish</th></tr></thead>
            <tbody>{visibleResults.map(result => <tr key={result.seasonId}><th scope="row">{result.name}</th><td>{fmt(result.steps)}</td><td className={result.rank === 1 ? 'athlete-history-first' : undefined}>
              {result.rank === 1 && <FontAwesomeIcon icon={faTrophy} aria-hidden="true" />}{result.rank ? `${result.tied ? 'T-' : '#'}${result.rank}` : 'Unranked'}
              {result.tied && result.tieGroupSize > 1 && <span className="athlete-history-tie">{fmt(result.tieGroupSize)} tied</span>}
            </td></tr>)}</tbody>
          </table> : <p className="athlete-history-state">No completed {scopeLabel(scope).toLowerCase()} season results yet.</p>}
        </>}
      </div>
    </div>
  </dialog>;
}
