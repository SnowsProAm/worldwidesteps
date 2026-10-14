import React from 'react';

export default function ProAmHeroBackdrop() {
  return <div className="proam-hero-backdrop" aria-hidden="true">
    <svg viewBox="0 0 680 560" fill="none">
      <defs><radialGradient id="proam-globe-wash"><stop stopColor="#d5eaff" stopOpacity=".8"/><stop offset="1" stopColor="#eef7ff" stopOpacity=".2"/></radialGradient></defs>
      <circle cx="340" cy="275" r="210" fill="url(#proam-globe-wash)"/>
      <g stroke="#81b7e5" strokeWidth="1" opacity=".48">
        <circle cx="340" cy="275" r="200"/>
        <ellipse cx="340" cy="275" rx="142" ry="200"/>
        <ellipse cx="340" cy="275" rx="65" ry="200"/>
        <ellipse cx="340" cy="275" rx="200" ry="65"/>
        <ellipse cx="340" cy="275" rx="200" ry="142"/>
        <path d="M140 275h400M340 75v400"/>
      </g>
      <g className="proam-global-orbit" stroke="#509ee1" strokeWidth="2" strokeDasharray="3 10" opacity=".5">
        <ellipse cx="340" cy="275" rx="294" ry="133" transform="rotate(-28 340 275)"/>
        <ellipse cx="340" cy="275" rx="260" ry="183" transform="rotate(38 340 275)"/>
      </g>
      <g className="proam-route-traveller"><circle cx="340" cy="75" r="7" fill="#1479d4"/><circle cx="340" cy="75" r="15" stroke="#1479d4" opacity=".35"/></g>
      <g className="proam-route-traveller route-second"><circle cx="140" cy="275" r="5" fill="#1479d4"/></g>
      <g fill="#4e9cdd" className="proam-beacon"><circle cx="560" cy="155" r="5"/><circle cx="560" cy="155" r="19" fill="none" stroke="#73b0e3"/></g>
      <g fill="#4e9cdd" className="proam-beacon beacon-second"><circle cx="110" cy="395" r="5"/><circle cx="110" cy="395" r="20" fill="none" stroke="#73b0e3"/></g>
      <g className="proam-trail" stroke="#8ebee5" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9"><path d="M70 490Q105 410 80 320T135 120"/><path d="M565 460Q625 390 594 300T620 100"/></g>
    </svg>
    <span className="proam-floating-step floating-step-left"><svg viewBox="0 0 32 40" fill="currentColor"><ellipse cx="9" cy="12" rx="5" ry="9" transform="rotate(-20 9 12)"/><ellipse cx="11" cy="27" rx="4" ry="5"/><ellipse cx="24" cy="22" rx="5" ry="9" transform="rotate(20 24 22)"/><ellipse cx="22" cy="36" rx="4" ry="4"/></svg></span>
    <span className="proam-floating-step floating-step-right"><svg viewBox="0 0 32 40" fill="currentColor"><ellipse cx="9" cy="12" rx="5" ry="9" transform="rotate(-20 9 12)"/><ellipse cx="11" cy="27" rx="4" ry="5"/><ellipse cx="24" cy="22" rx="5" ry="9" transform="rotate(20 24 22)"/><ellipse cx="22" cy="36" rx="4" ry="4"/></svg></span>
  </div>;
}
