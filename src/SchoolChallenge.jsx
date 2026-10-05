import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowUp, faArrowDown, faArrowRotateRight, faTrophy, faGraduationCap, faLocationDot, faMagnifyingGlass, faXmark, faGift, faShoePrints, faPause, faPlay, faGlobe, faExpand, faLeaf, faChevronDown, faCircleInfo, faCheck } from '@fortawesome/free-solid-svg-icons';
import { AutumnLeaves, GiftBox, WalkingDoodle, SchoolBus } from './SchoolChallengeArt';
import { filterSchools, number } from './schoolChallengeData';
import { useSchoolChallenge } from './useSchoolChallenge';
import './schoolChallenge.css';

const Icon = ({ icon, ...props }) => <FontAwesomeIcon icon={icon} aria-hidden="true" {...props} />;
const logo = '/favicon.png';

function AnimatedNumber({ value, paused, className = '' }) {
  const [display, setDisplay] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    if (paused || current.current === value) { current.current = value; setDisplay(value); return; }
    const from = current.current, started = performance.now();
    let frame;
    const tick = now => {
      const progress = Math.min((now - started) / 1000, 1);
      current.current = Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3)));
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, paused]);
  return <span className={`sc-number ${className}`}><span className="sc-sr-only">{number.format(value)}</span><span aria-hidden="true">{number.format(display)}</span></span>;
}

function Crest({ url, name, large = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return <span className={`sc-crest ${large ? 'sc-crest-large' : ''}`}>
    {url && !failed ? <img src={url} alt={`${name} crest`} loading="lazy" onError={() => setFailed(true)} />
      : <span className="sc-crest-fallback" aria-label={`${name} crest unavailable`}><Icon icon={faGraduationCap} /></span>}
  </span>;
}

function StudentAvatar({ student, large = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [student?.avatar_url]);
  return <span className={`sc-student-avatar ${large ? 'sc-student-avatar-large' : ''}`}>
    {student?.avatar_url && !failed ? <img src={student.avatar_url} alt="" loading="lazy" onError={() => setFailed(true)} />
      : <Icon icon={faShoePrints} />}
  </span>;
}

function Cheque({ expanded = false }) {
  return <div className={`sc-cheque ${expanded ? 'sc-cheque-expanded' : ''}`}>
    <div className="sc-cheque-top"><span className="sc-cheque-brand"><img src={logo} alt="" />Snows ProAm</span><span>SCHOOL CHALLENGE</span></div>
    <div className="sc-cheque-pay"><span>TOP SCHOOL PRIZE</span><strong>Ireland’s top school</strong></div>
    <div className="sc-cheque-value"><span>For your school</span><strong>€1,000<span>.00</span></strong></div>
    <div className="sc-cheque-bottom"><span>Where Athletes Belong</span><span className="sc-cheque-signature">Snows ProAm</span></div>
    <div className="sc-cheque-seal"><Icon icon={faTrophy} /><span>1ST<br />SCHOOL</span></div>
  </div>;
}

function PrizeDialog({ prize, onClose, leader, paused }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current, previousFocus = document.activeElement;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close(); document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      else document.querySelector('.sc-live-controls button:not([disabled])')?.focus();
    };
  }, []);
  const school = prize === 'school';
  return <dialog ref={ref} className="sc-dialog" aria-labelledby="sc-prize-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="sc-dialog-content">
      <button className="sc-icon-button sc-dialog-close" onClick={onClose} aria-label="Close prize reveal" autoFocus><Icon icon={faXmark} /></button>
      <p className="sc-eyebrow">{school ? 'A big win for your whole school' : 'A little mystery. A lot to walk for.'}</p>
      <h2 id="sc-prize-title">{school ? 'Small steps. A €1,000 possibility.' : 'Something good is on its way.'}</h2>
      <motion.div className={`sc-reveal-art ${school ? '' : 'sc-gift-open'}`} initial={paused ? false : { opacity: 0, y: 35, rotate: -5, scale: .88 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 15 }}>
        {school ? <Cheque expanded /> : <GiftBox tone={prize === '2' ? 'lilac' : prize === '3' ? 'peach' : 'blue'} />}
        {!paused && <div className="sc-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</div>}
      </motion.div>
      <p>{school ? '€1,000 for the school that finishes on top. Keep moving together and give your school something to celebrate.' : 'The national student prize line-up is still under wraps. Check back here for the reveal.'}</p>
      {school && leader?.total_steps > 0 && <div className="sc-reveal-leader"><Crest url={leader.logo_url} name={leader.name} /><span><small>Currently leading · final result still to come</small><strong>{leader.name}</strong></span></div>}
      <span className="sc-prize-fineprint">{school ? 'Prize preview · final eligibility, dates and award details to be confirmed.' : 'Mystery prize preview · contents and award details to be confirmed.'}</span>
      <button className="sc-primary" onClick={onClose}>Back to the challenge <Icon icon={faArrowRight} /></button>
    </div>
  </dialog>;
}

function StudentPodium({ students, loading, unavailable, paused, reveal }) {
  return <div className="sc-student-podium">{[0, 1, 2].map(index => {
    const student = students[index];
    return <motion.article layout={!paused} key={student?.alias || index} className={`sc-podium-card sc-podium-${index + 1}`}>
      <div className="sc-podium-place"><span>{student?.rank || index + 1}</span><span>{index === 0 ? 'Leading the way' : index === 1 ? 'Making every step count' : 'One to watch'}</span><Icon icon={index === 0 ? faTrophy : faShoePrints} /></div>
      {student ? <>
        <div className="sc-podium-identity"><StudentAvatar student={student} large /><Crest url={student.logo_url} name={student.school_name} /></div>
        <h3>{student.display_name}</h3><p className="sc-podium-school">{student.school_name}</p>
        <p className="sc-location"><Icon icon={faLocationDot} />{student.county || 'County not listed'} · {student.country}</p>
        <strong className="sc-podium-steps"><AnimatedNumber value={student.steps} paused={paused} /><small>steps</small></strong>
      </> : <div className="sc-podium-waiting"><Icon icon={faShoePrints} /><h3>{loading ? 'Finding the front-runners…' : unavailable ? 'Standings are taking a breather.' : 'Your next step could be here.'}</h3><p>{loading ? 'Loading student standings' : unavailable ? 'Reconnect or retry above to see the student leaders.' : 'A student will appear here when eligible steps are recorded.'}</p></div>}
      <button className="sc-podium-prize" onClick={() => reveal(String(index + 1))}><GiftBox tone={index === 0 ? 'blue' : index === 1 ? 'lilac' : 'peach'} /><span><strong>Mystery prize</strong><small>Your place. Your prize.</small></span><Icon icon={faArrowRight} /></button>
    </motion.article>;
  })}</div>;
}

function SchoolRow({ school, movement, maxSteps, paused, onPrize }) {
  const first = school.rank === 1 && school.total_steps > 0;
  return <motion.li layout={paused ? false : 'position'} transition={{ layout: { type: 'spring', stiffness: 95, damping: 19 } }} className={`sc-school-row ${first ? 'sc-leading' : ''}`}>
    <div className="sc-rank"><span className={school.rank <= 3 && school.total_steps > 0 ? `sc-medal sc-medal-${school.rank}` : ''}><span className="sc-sr-only">Rank </span>{school.rank}</span>
      {movement !== 0 && movement != null && <span className={`sc-movement ${movement > 0 ? 'sc-up' : 'sc-down'}`} aria-label={`${Math.abs(movement)} ${Math.abs(movement) === 1 ? 'place' : 'places'} ${movement > 0 ? 'up' : 'down'} since last update`}><Icon icon={movement > 0 ? faArrowUp : faArrowDown} />{Math.abs(movement)}</span>}
    </div>
    <div className="sc-school-identity"><Crest url={school.logo_url} name={school.name} /><div><h3>{school.name}</h3><p className="sc-location"><span className="sc-irish-flag" aria-hidden="true" />{school.county ? `${school.county} · ` : ''}{school.country}</p>{first && <button className="sc-leading-prize" onClick={onPrize}>Leading the €1,000 school prize <Icon icon={faArrowRight} /></button>}</div></div>
    <div className="sc-school-total"><strong><AnimatedNumber value={school.total_steps} paused={paused} /></strong><span>{school.total_steps > 0 ? 'steps together' : 'Ready for the first steps'}</span><div className="sc-step-track" aria-hidden="true"><div style={{ width: `${Math.max(0, school.total_steps / (maxSteps || 1) * 100)}%` }} /></div></div>
    <div className={`sc-school-student ${school.top_student ? '' : 'sc-school-student-empty'}`}><StudentAvatar student={school.top_student} /><div><small>TOP STUDENT</small>{school.top_student ? <><strong>{school.top_student.display_name}</strong><span><AnimatedNumber value={school.top_student.steps} paused={paused} /> steps</span></> : <><strong>Who’ll lead the way?</strong><span>First student steps coming soon</span></>}</div>{first && <button className="sc-small-gift" onClick={() => onPrize('student')} aria-label="Explore student mystery prizes"><GiftBox /></button>}</div>
  </motion.li>;
}

export default function SchoolChallenge() {
  const { data, loading, refreshing, error, offline, movements, checkedAt, refresh } = useSchoolChallenge();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    // Also covers static hosts that serve the root HTML for /schools.
    document.title = 'Irish Secondary School Step Challenge | Snows ProAm';
    const metadata = {
      description: 'Your school. Your county. Every step counts. Follow Ireland’s secondary school step leaderboard, national student pacesetters and the €1,000 school prize with Snows ProAm.',
      'og:title': document.title,
      'og:description': 'Walk together. Climb the leaderboard. Make your school proud. Live Irish school standings and the €1,000 school prize.',
      'og:url': 'https://worldwidesteps.com/schools',
      'theme-color': '#ffffff',
    };
    for (const [name, content] of Object.entries(metadata)) {
      document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.setAttribute('content', content);
    }
  }, []);
  const [motionPaused, setMotionPaused] = useState(false);
  const paused = Boolean(reducedMotion || motionPaused);
  const [view, setView] = useState('schools');
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('');
  const [prize, setPrize] = useState(null);
  const schools = data?.schools || [];
  const visibleSchools = useMemo(() => filterSchools(schools, query, county), [schools, query, county]);
  const leader = schools[0];
  const live = Boolean(data && !error && !offline);
  const seasonName = data?.season?.name;
  const autumn = new Date().getMonth() >= 8 && new Date().getMonth() <= 10;
  const selectView = next => setView(next);
  const tabKeys = event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 'schools' : event.key === 'End' ? 'students' : view === 'schools' ? 'students' : 'schools';
      selectView(next); document.getElementById(`sc-tab-${next}`)?.focus();
    }
  };
  return <MotionConfig reducedMotion={paused ? 'always' : 'never'}><div className={`school-challenge ${paused ? 'sc-motion-paused' : ''}`}>
    <a className="sc-skip" href="#sc-leaderboard">Skip to leaderboard</a>
    <header className="sc-header"><a href="/" className="sc-brand"><img src={logo} alt="" /><span><strong>Snows ProAm</strong><small>WORLD WIDE STEPS</small></span></a>
      <nav aria-label="Main navigation"><a href="/" className="sc-world-link">Worldwide</a><a href="/schools" aria-current="page">Schools<span className="sc-nav-dot" /></a><a href="#sc-prizes">The prizes</a></nav>
      <a className="sc-header-cta" href="#sc-how">Get involved <Icon icon={faArrowRight} /></a>
    </header>

    <main id="sc-main">
      <section className="sc-hero" aria-labelledby="sc-title">
        {autumn && <AutumnLeaves />}
        <div className="sc-hero-copy"><div className="sc-season-tag"><Icon icon={autumn ? faLeaf : faShoePrints} /><strong>{seasonName || 'Current season'}</strong></div>

          <h1 id="sc-title">Irish Secondary School<br /><span>Step Challenge.</span></h1>

          <div className="sc-hero-actions"><a className="sc-primary" href="#sc-leaderboard">Find your school <Icon icon={faArrowRight} /></a><a className="sc-text-link" href="#sc-prizes">Check out the prizes <Icon icon={faGift} /></a></div>
          <div className="sc-hero-community"><span className="sc-mini-crests">{schools.slice(0, 3).map(school => <Crest key={school.id} url={school.logo_url} name={school.name} />)}</span><span>{data ? <><strong>{schools.length} schools.</strong> One big challenge.</> : 'One school community. One step at a time.'}</span></div>
        </div>
        <div className="sc-hero-prize"><span className="sc-art-sticker sc-sticker-move" aria-hidden="true">LET’S<br />MOVE!</span><span className="sc-art-sticker sc-sticker-star" aria-hidden="true">✦</span><span className="sc-prize-note">Your school could win this.<svg viewBox="0 0 85 60" aria-hidden="true"><path d="M5 4c35-7 52 16 45 43m-9-9 9 11 12-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
          <button className="sc-cheque-button" onClick={() => setPrize('school')} aria-label="Reveal the €1,000 top school prize"><Cheque /><span className="sc-cheque-tap"><Icon icon={faExpand} /> Tap to take a closer look</span></button>
          <WalkingDoodle /><span className="sc-doodle-caption">Big school energy.</span>
        </div>
        <SchoolBus />
      </section>

      <section className="sc-community-stats" aria-label="Challenge at a glance"><div className="sc-stat-total"><span className="sc-stat-icon"><Icon icon={faShoePrints} /></span><div><span>Every school. Every step.</span><strong>{data ? <AnimatedNumber value={data.totalSteps} paused={paused} /> : loading ? <span className="sc-skeleton sc-number-skeleton" /> : '—'}<small>steps together</small></strong></div></div>
        <div><strong>{data ? schools.length : '—'}</strong><span>schools moving</span></div><div><strong>{data ? data.counties.length : '—'}</strong><span>counties represented</span></div><div className="sc-stat-prize"><strong>€1,000</strong><span>for the top school</span></div>
      </section>

      <section className="sc-leaderboard-section" id="sc-leaderboard" aria-labelledby="sc-league-heading">
        <div className="sc-section-heading"><div><p className="sc-eyebrow">School pride. On the line.</p><h2 id="sc-league-heading">The leaderboard<span className="sc-heading-dot">.</span></h2><p>Find your crew. Follow the climb. Cheer them on.</p></div>
          <div className="sc-live-controls"><span className={`sc-live-label ${live ? '' : 'sc-not-live'}`}><i />{offline ? 'Offline' : error ? 'Updates interrupted' : loading ? 'Connecting' : 'Updating live'}</span><button className="sc-icon-button" disabled={refreshing || offline} onClick={refresh} aria-label="Refresh school leaderboard"><Icon className={refreshing ? 'sc-spin' : ''} icon={faArrowRotateRight} /></button></div>
        </div>
        <div className="sc-leaderboard-toolbar"><div className="sc-tabs" role="tablist" aria-label="Leaderboard view"><button role="tab" id="sc-tab-schools" aria-controls="sc-panel-schools" aria-selected={view === 'schools'} tabIndex={view === 'schools' ? 0 : -1} onKeyDown={tabKeys} onClick={() => selectView('schools')}><Icon icon={faGraduationCap} />Schools<span>{data ? schools.length : '—'}</span></button><button role="tab" id="sc-tab-students" aria-controls="sc-panel-students" aria-selected={view === 'students'} tabIndex={view === 'students' ? 0 : -1} onKeyDown={tabKeys} onClick={() => selectView('students')}><Icon icon={faTrophy} />National top 3</button></div>
          {view === 'schools' && <div className="sc-filters"><div className="sc-search"><Icon icon={faMagnifyingGlass} /><label className="sc-sr-only" htmlFor="sc-school-search">Search school or county</label><input id="sc-school-search" type="search" placeholder="Find your school…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="Clear school search"><Icon icon={faXmark} /></button>}</div><div className="sc-county-select"><label className="sc-sr-only" htmlFor="sc-county">Filter by county</label><select id="sc-county" value={county} onChange={event => setCounty(event.target.value)}><option value="">All counties</option>{data?.counties.map(name => <option key={name}>{name}</option>)}</select><Icon icon={faChevronDown} /></div></div>}
        </div>
        {(offline || error) && <div className="sc-notice" role="status"><Icon icon={faCircleInfo} /><p>{offline ? 'You’re offline.' : 'We couldn’t update the leaderboard.'} {data ? 'Your last loaded standings are still here.' : 'Check your connection to load the schools.'} {offline ? 'We’ll reconnect automatically.' : 'We’ll try again automatically.'}</p>{!offline && <button onClick={refresh} disabled={refreshing}>{refreshing ? 'Retrying…' : 'Try again'}</button>}</div>}

        <div role="tabpanel" id="sc-panel-schools" aria-labelledby="sc-tab-schools" hidden={view !== 'schools'} tabIndex={0}>
          {loading ? <div className="sc-loading" role="status" aria-label="Loading school leaderboard">{[0, 1, 2, 3, 4].map(item => <div key={item} className="sc-skeleton-row"><span className="sc-skeleton" /><span className="sc-skeleton" /><span className="sc-skeleton" /></div>)}<span className="sc-sr-only">Loading school leaderboard…</span></div> : data && <>
            <div className="sc-table-head" aria-hidden="true"><span>RANK</span><span>SCHOOL / COUNTY</span><span>TOTAL STEPS</span><span>THEIR PACESETTER</span></div>
            <ol className="sc-school-list" aria-label="Schools ranked by total steps">{visibleSchools.map(school => <SchoolRow key={school.id} school={school} movement={movements[school.id]} maxSteps={leader?.total_steps} paused={paused} onPrize={kind => setPrize(kind === 'student' ? '1' : 'school')} />)}</ol>
            {!visibleSchools.length && <div className="sc-empty"><Icon icon={faGraduationCap} /><h3>{schools.length ? 'Let’s find your school.' : 'The starting line is ready.'}</h3><p>{schools.length ? 'No schools match that search. Try a shorter name or a different county.' : 'Participating schools will appear here as they join the challenge.'}</p>{schools.length ? <button className="sc-primary" onClick={() => { setQuery(''); setCounty(''); }}>Show all schools</button> : <a className="sc-primary" href="#sc-how">How to get involved <Icon icon={faArrowRight} /></a>}</div>}
            <div className="sc-league-footer"><span role="status">{visibleSchools.length} of {schools.length} schools{(query || county) ? ' · national ranks retained' : ' · ranked by school steps'}</span><span><Icon icon={faCheck} />{checkedAt ? `Checked ${checkedAt.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Waiting for update'} · refreshes every 10s</span></div>
          </>}
        </div>

        <div role="tabpanel" id="sc-panel-students" aria-labelledby="sc-tab-students" hidden={view !== 'students'} tabIndex={0}><div className="sc-student-intro"><div><h3>The national student podium.</h3><p>The top 3 students across every school. One school can have more than one winner.</p></div><span className="sc-country-pill"><span className="sc-irish-flag" />Ireland</span></div><StudentPodium students={data?.students || []} loading={loading} unavailable={!data && (error || offline)} paused={paused} reveal={setPrize} /></div>
        <p className="sc-privacy-note"><Icon icon={faCircleInfo} />Student names and photos follow the app’s leaderboard visibility setting.</p>
      </section>

      <section id="sc-prizes" className="sc-prizes-section" aria-labelledby="sc-prizes-heading"><div className="sc-prize-section-copy"><p className="sc-eyebrow">Worth walking for</p><h2 id="sc-prizes-heading">Big steps.<br />Big surprises.</h2><p>A big prize for your school.<br />A few surprises for the students<br className="sc-desktop-break" /> who go the extra mile.</p><button className="sc-text-link" onClick={() => setPrize('school')}>Explore the €1,000 school prize <Icon icon={faArrowRight} /></button></div>
        <div className="sc-mystery-prizes"><div className="sc-prize-track-heading"><span>National student prizes</span><span className="sc-soft-pill">The reveal is coming</span></div><div className="sc-gift-grid">{['blue', 'lilac', 'peach'].map((tone, index) => <button key={tone} className={`sc-prize-box sc-prize-box-${tone}`} onClick={() => setPrize(String(index + 1))}><span className="sc-prize-position">{['1ST', '2ND', '3RD'][index]} STUDENT</span><GiftBox tone={tone} /><strong>Mystery prize</strong><span>To be revealed <Icon icon={faArrowRight} /></span></button>)}</div><p>Prize previews. Contents, eligibility and award details to be confirmed.</p></div>
      </section>

      <section id="sc-how" className="sc-how-section" aria-labelledby="sc-how-heading"><div className="sc-section-heading"><div><p className="sc-eyebrow">Ready, set, step.</p><h2 id="sc-how-heading">Your school. Your move.</h2></div><Icon icon={faShoePrints} /></div><div className="sc-how-grid"><article><span>01</span><h3>Find your school.</h3><p>Open Snows ProAm and join your school through your teacher or school coordinator.</p></article><article><span>02</span><h3>Make your move.</h3><p>A walk to school. A lunchtime lap. Open the app to sync your steps and help your school climb.</p></article><article><span>03</span><h3>Cheer each other on.</h3><p>Follow the live standings, celebrate your pacesetters, and see what you can do together.</p></article></div><div className="sc-how-bottom"><span>Can’t see your school? Let’s get your community moving.</span><a href="mailto:support@snowsproam.com?subject=Irish%20Secondary%20School%20Step%20Challenge">Get in touch <Icon icon={faArrowRight} /></a></div></section>

      <section className="sc-about" aria-label="About the standings"><details className="sc-display-settings"><summary>Display settings <Icon icon={faChevronDown} /></summary><div><p>{reducedMotion ? 'Reduced motion is on in your device settings.' : 'Control decorative motion and animated step counters.'}</p><button className="sc-motion-setting" aria-label={paused ? 'Resume animations' : 'Pause animations'} aria-pressed={paused} disabled={Boolean(reducedMotion)} title={reducedMotion ? 'Reduced motion follows your device settings' : paused ? 'Resume animations' : 'Pause animations'} onClick={() => setMotionPaused(value => !value)}><Icon icon={paused ? faPlay : faPause} />{paused ? 'Resume animations' : 'Pause animations'}</button></div></details><details><summary>How the leaderboard works <Icon icon={faChevronDown} /></summary><div><p>School positions use the current totals of active members in the app’s School group. Only active Irish school workspaces are included; demo workspaces and duplicate year-group views are excluded. These are school challenge totals, which may include steps from before the current app season.</p><p>Student spotlights show active students who have enabled leaderboard visibility, using their leaderboard names and photos. School admins are excluded from student prize rankings. The national top three ranks individual students across all schools, so multiple students can represent the same school. Equal step totals share a rank; tied entries are displayed in a stable order.</p><p>Standings refresh every 10 seconds while this page is visible and online. Steps appear after they sync from the app. {seasonName ? `${seasonName} is the current app season. ` : ''}A current lead is not a final prize award. Competition dates, prize eligibility and final award details will be confirmed here.</p></div></details></section>
    </main>

    <footer className="sc-footer"><a className="sc-brand" href="/"><img src={logo} alt="" /><span><strong>Snows ProAm</strong><small>Where Athletes Belong</small></span></a><p>Every step belongs to something bigger.</p><a href="/"><Icon icon={faGlobe} />Explore World Wide Steps <Icon icon={faArrowRight} /></a></footer>
    {prize && <PrizeDialog prize={prize} onClose={() => setPrize(null)} leader={leader} paused={paused} />}
  </div></MotionConfig>;
}
