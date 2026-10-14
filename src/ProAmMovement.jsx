import React from 'react';

/** Decorative SVGs: no extra bundle, no interaction required, reduced-motion in CSS. */
export default function ProAmMovement() {
  return <div className="proam-movement" aria-hidden="true">
    <span className="proam-motion-icon motion-steps">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <g className="step-left"><path d="M22 8c-5-2-10 1-11 7-2 8 0 15 4 16 5 1 8-3 10-10 2-6 2-11-3-13Z"/><path d="M14 36c-3 1-3 7 0 10 2 3 6 2 8 0 2-3 1-7-2-9-2-1-4-2-6-1Z"/></g>
        <g className="step-right"><path d="M44 18c5-2 10 1 11 7 2 8 0 15-4 16-5 1-8-3-10-10-2-6-2-11 3-13Z"/><path d="M52 46c3 1 3 7 0 10-2 3-6 2-8 0-2-3-1-7 2-9 2-1 4-2 6-1Z"/></g>
      </svg>
    </span>
    <span className="proam-motion-icon motion-globe">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="32" cy="32" r="24"/><ellipse cx="32" cy="32" rx="11" ry="24"/><path d="M10 23h44M10 41h44M8 32h48"/>
        <ellipse className="globe-orbit" cx="32" cy="32" rx="30" ry="11" transform="rotate(-32 32 32)" strokeWidth="2.7"/>
      </svg>
    </span>
    <span className="proam-motion-icon motion-pulse">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 53S8 39 8 23a13 13 0 0 1 24-7 13 13 0 0 1 24 7c0 16-24 30-24 30Z" strokeOpacity=".3"/>
        <path className="heartbeat-line" d="M5 32h15l6-12 9 25 7-15 5 2h12"/>
      </svg>
    </span>
  </div>;
}
