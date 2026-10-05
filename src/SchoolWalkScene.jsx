import React, { useEffect, useRef } from 'react';
import { walkingLeg, WALK_CYCLE, walkingGroupSteps, runningStepTotal } from './schoolWalkMotion';
import './schoolWalkScene.css';

function Student({ tone, skin, hair, variant, hairStyle = "short", index }) {
  return <svg viewBox="0 0 56 96" className={`sw-student sw-student-${variant}`} style={{ "--person": index }}>
    <g stroke="#214767" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g className="sw-leg sw-leg-back"><path d="M27 55 23 74 16 87" fill="none" strokeWidth="6" stroke="#405575"/><path d="m12 86 7 1 3 5H10Z" fill="#fff"/></g>
      <path d="M18 29c-9-2-12 4-12 12v12l10 3 7-18Z" fill={tone}/>
      <g className="sw-body"><path d="M25 26c-8 0-11 10-10 29l22 2 2-24-9-7" fill={tone}/><path d="m25 27 3 12 5-10" fill="white"/><path d="m28 34 3 12 3-12" fill="#2669ab"/>
      {hairStyle === 'long' && <path d="M23 6c-7 8-4 22-8 31l14 4 10-7-1-25Z" fill={hair}/>}
      {hairStyle === 'ponytail' && <path d="M23 8C9 4 9 14 15 23l-2 14c10-4 8-15 6-21l9-1Z" fill={hair}/>}
      {hairStyle === 'bob' && <path d="M23 7c-9 9-7 19-8 26l17 3 9-9-3-19Z" fill={hair}/>}
      <path d="M24 11c0-8 17-9 18 0l-1 7 4 3-5 2c-1 7-10 9-14 2Z" fill={skin}/><path d="M24 17c-6-14 2-20 12-16 7 1 8 7 6 11l-8-5-4 12Z" fill={hair}/>{hairStyle === 'curly' && <path d="M21 15c-7-1-6-8-1-9-4-6 4-10 8-7 3-6 10-4 11 1 7-1 9 7 4 11l-11-3-4 11Z" fill={hair}/>}
      <circle cx="38" cy="16" r=".7" fill="#214767" stroke="none"/>
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
  const ref = useRef(null);
  useEffect(() => {
    const scene = ref.current;
    const bus = scene.querySelector('.sw-bus');
    const bubble = scene.querySelector('.sw-step-bubbles');
    const label = bubble.querySelector('span');
    const people = [...scene.querySelectorAll('.sw-student')].map(svg => ({ svg, body: svg.querySelector('.sw-body'), arm: svg.querySelector('.sw-arm'), legs: [...svg.querySelectorAll('.sw-leg')].map(leg => ({ line: leg.children[0], shoe: leg.children[1] })) }));
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = scene.clientWidth, visible = true, frame = 0, last = 0, elapsed = 0;
    let completedSteps = 0, previousCycleSteps = 0;
    const paint = (time, still = false) => {
      const mobile = width <= 600, busWidth = mobile ? 150 : 220, schoolWidth = mobile ? 100 : 170;
      const scale = (mobile ? 58 : 78) / 96, speed = mobile ? 34 : 54;
      const stop = width * .28 - busWidth + 22;
      const start = stop + busWidth * .82 - 29 * scale;
      const end = width - (mobile ? 7 : 22) - schoolWidth / 2 - 29 * scale;
      const duration = Math.max(22, 13 + (end - start) / speed);
      const t = time % duration;
      const busX = t < 6 ? -busWidth + (stop + busWidth) * (t / 6) : t <= 11 ? stop : stop + (width + busWidth - stop) * Math.min(1, (t - 11) / 7);
      bus.style.transform = `translate3d(${busX}px,0,0)`;
      bus.style.opacity = still ? '0' : '1';
      let sumX = 0, walkers = 0;
      people.forEach(({ svg, body, arm, legs }, index) => {
        const exitAt = 7 + index * .42, walkingTime = Math.max(0, t - exitAt - .45);
        const distance = Math.min(end - start, walkingTime * speed);
        const x = still ? width * .2 + index * Math.min(30, width * .065) : start + distance;
        const opacity = still ? 1 : t < exitAt ? 0 : Math.min(1, (t - exitAt) / .25, Math.max(0, (end - start - distance) / 16));
        const stepDown = still ? 0 : -12 * Math.max(0, 1 - (t - exitAt) / .45);
        svg.style.transform = `translate3d(${x}px,${stepDown}px,0)`;
        svg.style.opacity = String(opacity);
        const gaitTime = still ? .12 : walkingTime;
        const bob = -Math.cos(gaitTime / WALK_CYCLE * Math.PI * 4) * .8;
        body.setAttribute('transform', `translate(0 ${bob})`);
        arm.setAttribute('transform', `rotate(${Math.sin(gaitTime / WALK_CYCLE * Math.PI * 2) * 16} 34 34)`);
        legs.forEach(({ line, shoe }, leg) => {
          const p = walkingLeg(gaitTime, speed / scale, leg * .5);
          line.setAttribute('d', `M29 ${p.hipY} Q${p.kneeX} ${p.kneeY} ${p.x} ${p.y - 2}`);
          shoe.setAttribute('d', `M${p.x - 4} ${p.y - 3} L${p.x + 3} ${p.y - 3} L${p.x + 9} ${p.y + 1} Q${p.x + 10} ${p.y + 3} ${p.x + 5} ${p.y + 3} L${p.x - 5} ${p.y + 3} Z`);
        });
        if (opacity > .2 && !still) { walkers++; sumX += x;  }
      });
      const cycleSteps = walkingGroupSteps(t, end - start, speed);
      const running = runningStepTotal(previousCycleSteps, cycleSteps, completedSteps);
      completedSteps = running.carried; previousCycleSteps = cycleSteps;
      const totalSteps = running.total;
      bubble.style.opacity = walkers && totalSteps ? '1' : '0';
      bubble.style.transform = `translate3d(${walkers ? sumX / walkers : 0}px,0,0)`;
      const text = `+${totalSteps} steps`;
      if (label.textContent !== text) label.textContent = text;
    };
    const tick = now => { if (last) elapsed += Math.min(now - last, 80) / 1000; last = now; paint(elapsed); frame = requestAnimationFrame(tick); };
    const sync = () => { cancelAnimationFrame(frame); last = 0; if (preference.matches) paint(0, true); else if (visible && !document.hidden) frame = requestAnimationFrame(tick); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    const resize = new ResizeObserver(() => { width = scene.clientWidth; paint(elapsed, preference.matches); });
    observer.observe(scene); resize.observe(scene);
    preference.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
    paint(0, preference.matches); sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, []);

  return <div ref={ref} className="school-walk-scene" aria-hidden="true">
    <div className="sw-path"/><SchoolBuilding />
    <div className="sw-bus"><img src="/schools/yellow-school-bus.webp" width="768" height="384" alt=""/></div>
    <div className="sw-walking-group">
      <div className="sw-step-bubbles"><span>+0 steps</span></div>
      <Student tone="#88c9b0" skin="#f1c59e" hair="#e2bc65" hairStyle="ponytail" variant="three" index={0}/>
      <Student tone="#88bde8" skin="#b57950" hair="#342c2c" hairStyle="curly" variant="two" index={1}/>
      <Student tone="#9eaedc" skin="#edc4a3" hair="#30343b" variant="two" index={2}/>
      <Student tone="#baa4e8" skin="#a56c49" hair="#302a32" hairStyle="long" variant="one" index={3}/>
      <Student tone="#e6a9ab" skin="#f3cbb0" hair="#a55d39" hairStyle="bob" variant="one" index={4}/>
      <Student tone="#e8c17e" skin="#aa704e" hair="#3b3235" hairStyle="long" variant="three" index={5}/>
      <Student tone="#a7ccbd" skin="#f0cfae" hair="#d5b06b" variant="one" index={6}/>
    </div>
    <span className="sw-caption">Walk the last little bit.</span>
  </div>;
}
