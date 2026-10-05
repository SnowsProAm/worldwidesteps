import React from 'react';
import './schoolWalkScene.css';

function Student({ tone, skin, hair, variant }) {
  return <svg viewBox="0 0 56 96" className={`sw-student sw-student-${variant}`}>
    <g stroke="#214767" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g className="sw-leg sw-leg-back"><path d="M27 55 23 74 16 87" fill="none" strokeWidth="6" stroke="#405575"/><path d="m12 86 7 1 3 5H10Z" fill="#fff"/></g>
      <path d="M18 29c-9-2-12 4-12 12v12l10 3 7-18Z" fill={tone}/>
      <g className="sw-body"><path d="M25 26c-8 0-11 10-10 29l22 2 2-24-9-7" fill={tone}/><path d="m25 27 3 12 5-10" fill="white"/><path d="m28 34 3 12 3-12" fill="#2669ab"/>
      <path d="M24 11c0-8 17-9 18 0l-1 7 4 3-5 2c-1 7-10 9-14 2Z" fill={skin}/><path d="M24 17c-6-14 2-20 12-16 7 1 8 7 6 11l-8-5-4 12Z" fill={hair}/><circle cx="38" cy="16" r=".7" fill="#214767" stroke="none"/>
      <g className="sw-arm"><path d="m34 34 5 17 10 5" fill="none" stroke={tone} strokeWidth="7"/><path d="m47 54 4 2" stroke={skin} strokeWidth="5"/></g></g>
      <g className="sw-leg sw-leg-front"><path d="m32 55 2 20 9 12" fill="none" strokeWidth="6" stroke="#405575"/><path d="m39 87 7-2 7 6-13 2Z" fill="#fff"/></g>
      <path d="m15 31 7 13" stroke="#fff" opacity=".6" />
    </g>
  </svg>;
}
function SchoolBuilding() {
  return <svg viewBox="0 0 210 150" className="sw-school"><g stroke="#426686" strokeWidth="1.8" strokeLinejoin="round"><path d="M16 70h178v68H16Z" fill="#eaf5ff"/><path d="m9 70 29-24h136l29 24Z" fill="#bacbec"/><path d="M75 48h61v90H75Z" fill="#fff4d7"/><path d="m67 49 38-30 39 30Z" fill="#99b5de"/><path d="M95 104h22v34H95Z" fill="#6594bd"/><path d="M105 104v34"/><path d="M104 19V3m0 0 25 7-25 7" fill="#bba6ec"/><circle cx="105" cy="63" r="10" fill="white"/><path d="m105 56 0 7 5 2"/><path d="M6 140h198" stroke="#88b89d" strokeWidth="4"/>{[30,52,148,171].map(x=><g key={x}><rect x={x} y="84" width="12" height="18" rx="2" fill="#a8d9ef"/><rect x={x} y="112" width="12" height="15" rx="2" fill="#a8d9ef"/></g>)}<path d="M84 88h43" stroke="#7794ac" strokeWidth="3"/><path d="M1 127c-1-22 22-22 22 0m164 0c-1-22 22-22 22 0" fill="#b7ddc7"/></g></svg>;
}
export default function SchoolWalkScene() {
  return <div className="school-walk-scene" aria-hidden="true">
    <div className="sw-path"/><SchoolBuilding />
    <div className="sw-bus"><img src="/schools/yellow-school-bus.webp" width="768" height="384" alt=""/></div>
    <div className="sw-walking-group">
      <div className="sw-step-bubbles"><span>+12 steps</span><span>+24 steps</span><span>+36 steps ✦</span></div>
      <Student tone="#baa4e8" skin="#a56c49" hair="#362d34" variant="one"/>
      <Student tone="#88bde8" skin="#f1c59e" hair="#604234" variant="two"/>
      <Student tone="#88c9b0" skin="#d49a70" hair="#333844" variant="three"/>
    </div>
    <span className="sw-caption">Walk the last little bit.</span>
  </div>;
}
