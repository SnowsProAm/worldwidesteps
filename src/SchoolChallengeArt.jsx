import React, { useId } from 'react';

export function GiftBox({ tone = 'blue', className = '' }) {
  const colors = { blue: ['#75ceff', '#329deb', '#084bb0'], lilac: ['#c7a4ff', '#a675ed', '#6132b3'], peach: ['#ffc179', '#ff986e', '#c64548'], mint: ['#9af0d4', '#49cfae', '#127e65'] };
  const [light, dark, ribbon] = colors[tone];
  return <svg viewBox="0 0 150 150" className={`sc-gift ${className}`} aria-hidden="true">
    <ellipse cx="77" cy="130" rx="45" ry="8" fill="#152f4d" opacity=".06" />
    <g className="sc-gift-body">
      <path d="M28 68 78 52 127 69 127 117 78 136 28 117Z" fill={light} />
      <path d="m78 85 49-16v48l-49 19Z" fill={dark} />
      <path d="m51 77 12 4v49l-12-5Zm47 1 12-4v50l-12 5Z" fill={ribbon} opacity=".8" />
      <path d="m89 103 0-3c0-8 13-12 13-4 0 4-6 7-6 11" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" /><circle cx="96" cy="114" r="1.8" fill="white" />
    </g>
    <g className="sc-gift-lid">
      <path d="m23 63 54-18 55 18-54 20Z" fill={light} />
      <path d="m23 63 55 20v13L23 77Z" fill={dark} /><path d="m78 83 54-20v14L78 96Z" fill={ribbon} opacity=".7" />
      <path d="m49 54 55 19 13-5-56-18Z" fill={ribbon} /><path d="m98 52-52 20 13 4 53-20Z" fill={ribbon} />
      <path d="M77 49C39 53 41 18 58 27c11 5 19 22 19 22Zm0 0c36-1 31-34 17-25-10 7-17 25-17 25Z" fill="none" stroke={ribbon} strokeWidth="7" strokeLinejoin="round" />
      <path d="m77 48-14 16m14-16 13 13" stroke={ribbon} strokeWidth="6" strokeLinecap="round" />
    </g>
    <path className="sc-gift-spark" d="m125 28 2 7 7 2-7 2-2 7-2-7-7-2 7-2Zm-105 62 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill={ribbon} />
  </svg>;
}

export function WalkingDoodle() {
  return <svg className="sc-walking-doodle" viewBox="0 0 440 210" fill="none" aria-hidden="true">
    <path d="M8 161c57-26 92 55 160 7s100-10 148-27 77-40 119-17" stroke="#549adb" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
    <g stroke="#0a559c" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <g className="sc-walker">
        <path d="M201 52c-18-15-22 9-9 14 13 5 22-10 12-16" fill="#fff3cf" />
        <path d="m195 69-8 42 27 7 4-38-21-12Z" fill="#bdaeFA" />
        <path d="m213 76 17 21 17-10m-56-7-17 19-12-2" />
        <g className="sc-walker-leg-a"><path d="m192 113-12 30-23 9" /><path d="m158 149-12 6 3 8 27-8-7-7Z" fill="white" /></g>
        <g className="sc-walker-leg-b"><path d="m208 117 12 24 20 6" /><path d="m237 144-2 10 27 5c4-6-8-9-13-12Z" fill="white" /></g>
        <path d="m187 53 1-11m5 8 3-13m3 12 6-8" />
      </g>
      <g transform="translate(105 140) rotate(-22)"><ellipse rx="5" ry="10" fill="#8c62e1" stroke="none" /><path d="m-4 14 8 0" stroke="#8db8e5" strokeWidth="6" /></g>
      <g transform="translate(78 132) rotate(-30)"><ellipse rx="5" ry="10" fill="#8c62e1" stroke="none" /><path d="m-4 14 8 0" stroke="#8db8e5" strokeWidth="6" /></g>
      <path d="m272 67 8-10m0 19 14-2m-147-19-9-7" stroke="#d7a566" strokeWidth="2" />
    </g>
    <path d="M327 112c-14-12-4-27 8-33 1 15 10 32-8 33Z" fill="#ecccaa" opacity=".7" /><path d="m328 92-3 24" stroke="#c29869" />
  </svg>;
}

export function AutumnLeaves() {
  const leafId = useId().replaceAll(':', '');
  return <div className="sc-leaves" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map(index => <svg key={index} viewBox="0 0 64 78" style={{ '--leaf': index, '--leaf-size': `${31 + (index % 3) * 4}px`, '--leaf-drift': `${index % 2 ? -30 : 30}px` }}>
    <defs><linearGradient id={`${leafId}-${index}`} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#d99835" /><stop offset=".52" stopColor="#ba6f22" /><stop offset="1" stopColor="#87451c" /></linearGradient></defs>
    <path d="m32 4 5 15 6-5-1 17 12-8-1 11 8 1-12 13 4 6-17 3-4 9-4-9-17-3 4-6L3 35l8-1-1-11 12 8-1-17 6 5Z" fill={`url(#${leafId}-${index})`} stroke="#8f521d" strokeWidth=".6" strokeLinejoin="round" />
    <path d="m32 13 0 47-3 15m3-23L13 37m19 8 17-12M32 36l-7-13m7 9 6-11m-6 34 11-4m-11 4-13-4" stroke="#edc578" strokeWidth=".9" fill="none" strokeLinecap="round" />
    <path d="m32 14 2 31-2 17" stroke="#7e4117" opacity=".45" fill="none" />
  </svg>)}</div>;
}

export function SchoolBus() {
  return <div className="sc-bus-lane" aria-hidden="true"><div className="sc-bus-drive"><img src="/schools/yellow-school-bus.webp" width="768" height="384" alt="" className="sc-school-bus" /></div></div>;
}
