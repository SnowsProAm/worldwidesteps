// Built by Solomon
import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal, faRuler, faTrophy, faEarthEurope, faPersonRunning, faArrowRight, faArrowRotateRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png";
import countryCodes from "./assets/country-codes.json";
import GlobeScene from "./GlobeScene.jsx";
import WorldSiteFooter from "./WorldSiteFooter.jsx";
import { worldwideStepTotal } from "./worldwideStepTotal.js";
const DailyStepsChart = lazy(()=>import("./DailyStepsChart.jsx"));

// Store review accounts are not public competitors. IDs match the mobile app reviewer list.
const STORE_REVIEWER_IDS = new Set([
  "1b824f5f-a287-4166-83e3-d6c2a9caa8e8",
  "6f14d57e-c69f-4859-8a57-c02b2af30710",
]);

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
const LIGHT = {
  mode: "light",
  accent: "#0C69C8",
  accentBgSubtle: "rgba(12,105,200,0.05)",
  accentBgLight:  "rgba(12,105,200,0.10)",
  accentBorder:   "rgba(12,105,200,0.15)",
  accentGlow:     "rgba(12,105,200,0.18)",
  accentGrad:     "linear-gradient(135deg, #0C69C8 0%, #0A1D44 100%)",
  bg:             "#FFFFFF",
  bgCard:         "#FFFFFF",
  bgAlt:          "#EDF0F5",
  bgElevated:     "#FFFFFF",
  border:         "rgba(10,29,68,0.08)",
  borderMedium:   "rgba(10,29,68,0.12)",
  shadowMd:       "0 4px 16px rgba(10,29,68,0.08)",
  shadowLg:       "0 12px 48px rgba(10,29,68,0.14)",
  shadowGlow:     "0 0 40px rgba(12,105,200,0.08)",
  text:           "#0F1629",
  textSecondary:  "#3D4A6B",
  textMuted:      "#67758b",
  headerBg:       "rgba(255,255,255,0.95)",
  scrollbarThumb: "rgba(10,29,68,0.12)",
  cyan:           "#0284C7",
  cyanBg:         "rgba(2,132,199,0.06)",
  cyanBorder:     "rgba(2,132,199,0.15)",
  emerald:        "#059669",
  emeraldBg:      "rgba(5,150,105,0.06)",
  emeraldBorder:  "rgba(5,150,105,0.15)",
  amber:          "#D97706",
  amberBg:        "rgba(217,119,6,0.06)",
  rose:           "#DC2626",
};

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const makeCSS = () => `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  html { font-size:16px; scroll-behavior:smooth; scroll-padding-top:90px; }
  #root { overflow-x:clip; }
  body { font-family:'DM Sans',sans-serif; color:#0A1D44; background:#fff; -webkit-font-smoothing:antialiased; }
  a { color:inherit; text-decoration:none; }
  button { font:inherit; cursor:pointer; }
  a:focus-visible,button:focus-visible,input:focus-visible { outline:3px solid #0C69C8; outline-offset:5px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes globeFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
  .fu,.fu2,.fu3,.fu4 { animation:fadeUp .8s both; }
  .insights-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .world-header { position:sticky; top:0; z-index:100; min-height:76px; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; background:rgba(255,255,255,.94); backdrop-filter:blur(16px); border-bottom:1px solid #e7edf5; }
  .world-brand { display:flex; align-items:center; gap:10px; color:#0A1D44; font-family:'Sora',sans-serif; font-weight:700; font-size:17px; letter-spacing:-.6px; }
  .world-brand img { width:30px; height:30px; object-fit:contain; }
  .world-header nav { display:flex; gap:28px; font-size:13px; font-weight:600; color:#53617a; }
  .world-header nav a { min-height:44px; display:flex; align-items:center; }
  .world-header nav a:hover,.text-action:hover { color:#0C69C8; }
  .main-pad { width:100%; padding:58px 24px 0; }
  .section-eyebrow { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:1.7px; text-transform:uppercase; color:#0C69C8; margin-bottom:14px; }
  .hero-grid { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,1fr); gap:20px; align-items:center; }
  .hero-content { position:relative; z-index:1; min-width:0; }
  .hero-content h1 { font-family:'Sora',sans-serif; font-size:clamp(34px,4.5vw,62px); font-weight:700; line-height:1.14; letter-spacing:-2.5px; }
  .grad-text { background:linear-gradient(110deg,#0C69C8,#0A1D44); background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-intro { color:#53617a; font-size:16px; line-height:1.8; margin:20px 0 30px; }
  .hero-slogan { display:block; font-family:'Sora',sans-serif; font-size:clamp(18px,2vw,22px); font-weight:600; color:#0A1D44; letter-spacing:-.5px; margin-bottom:6px; }
  .world-total { padding:0; }
  .world-total-label { font-size:12px; font-weight:700; color:#53617a; margin-bottom:5px; }
  .world-total-value { display:flex; align-items:center; gap:5px; }
  .world-total-number { font-family:'Sora',sans-serif; font-size:clamp(34px,5.6vw,80px); font-weight:700; letter-spacing:-3px; color:#0C69C8; font-variant-numeric:tabular-nums; line-height:1.2; white-space:nowrap; }
  .world-total-delta { min-height:22px; margin-top:4px; color:#047857; font-size:12px; font-weight:700; font-variant-numeric:tabular-nums; }
  .world-total-delta[data-direction="down"] { color:#b42318; }
  .world-total-note { display:block; color:#67758b; font-size:11px; line-height:1.6; margin-top:8px; }
  .hero-actions { display:flex; align-items:center; flex-wrap:wrap; gap:24px; margin-top:28px; }
  .primary-action { min-height:48px; padding:14px 18px; display:inline-flex; gap:16px; align-items:center; justify-content:center; border:0; border-radius:6px; background:linear-gradient(115deg,#0C69C8,#084c98); color:#fff; font-weight:600; font-size:13px; box-shadow:0 5px 15px #0c69c81a; transition:transform .2s,box-shadow .2s; }
  .primary-action:hover { transform:translateY(-2px); box-shadow:0 8px 20px #0c69c82a; }
  .text-action { min-height:44px; display:inline-flex; align-items:center; gap:12px; font-size:13px; font-weight:600; }
  .world-globe { position:relative; aspect-ratio:1; width:100%; max-width:510px; margin:auto; }
  .globe-canvas { position:absolute; inset:0; transition:opacity .5s; }
  .globe-canvas canvas { width:100%; height:100%; display:block; }
  .globe-halo { position:absolute; inset:10%; border-radius:50%; background:radial-gradient(circle,#0c69c80e,transparent 70%); }
  .globe-fallback { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; transition:opacity .5s; }
  .globe-caption { position:absolute; bottom:1%; width:100%; text-align:center; color:#67758b; font-size:11px; letter-spacing:.2px; }
  .world-summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid #e7edf5; border-bottom:1px solid #e7edf5; margin-top:48px; padding:24px 0; }
  .world-summary > div { display:flex; align-items:center; justify-content:center; gap:18px; padding:0 14px; }
  .world-summary > div+div { border-left:1px solid #e7edf5; }
  .world-summary svg { color:#0C69C8; font-size:24px; }
  .world-summary strong { display:block; font-family:'Sora',sans-serif; font-weight:700; font-size:32px; font-variant-numeric:tabular-nums; line-height:1.2; }
  .world-summary strong small { font-size:16px; font-weight:500; }
  .world-summary > div > div > span { display:block; font-size:11px; color:#67758b; margin-top:5px; }
  .hero-mb,.section-mb { margin-bottom:64px; }
  .milestone-section { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; padding:30px 32px; background:linear-gradient(105deg,#f2f7fd,#f9fbfe); border-left:3px solid #0C69C8; }
  .milestone-section .section-eyebrow { margin-bottom:10px; }
  .milestone-section h2 { font-family:'Sora',sans-serif; font-weight:600; font-size:21px; letter-spacing:-.6px; line-height:1.5; }
  .milestone-section p { color:#53617a; font-size:12px; margin-top:6px; line-height:1.6; }
  .milestone-labels { display:flex; justify-content:space-between; gap:12px; font-size:12px; font-weight:600; margin-bottom:10px; color:#0C69C8; }
  .milestone-track { height:8px; background:#dae6f5; overflow:hidden; }
  .milestone-track > div { height:100%; background:linear-gradient(90deg,#0A1D44,#0C69C8); transition:width 1s ease; }
  .chart-loading { height:220px; display:flex; align-items:center; justify-content:center; font-size:13px; color:#67758b; }
  .timeline-chart { padding:20px 10px; border:1px solid #e7edf5; border-radius:10px; }
  .lb-table-head,.lb-table-row { display:grid; grid-template-columns:44px minmax(0,1fr) 110px 120px 64px; gap:10px; align-items:center; }
  .country-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
  .country-toolbar { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:20px; }
  .country-search { width:100%; max-width:420px; }
  .country-search label { display:block; font-size:12px; font-weight:600; margin-bottom:8px; }
  .country-search-field { display:flex; align-items:center; gap:12px; min-height:48px; padding:0 14px; border:1px solid #b9c8dc; border-radius:14px; background:#fff; }
  .country-search-field:focus-within { outline:2px solid #0C69C8; outline-offset:3px; border-color:#0C69C8; }
  .country-search-field > svg { color:#53617a; flex-shrink:0; }
  .country-search input { width:100%; min-width:0; min-height:46px; border:0; background:transparent; color:#0A1D44; font:inherit; font-size:16px; }
  .country-search input::placeholder { color:#67758b; }
  .country-search input:focus-visible { outline:none; }
  .country-search input::-webkit-search-cancel-button { display:none; }
  .country-search button { min-height:44px; min-width:44px; border:0; background:transparent; color:#0C69C8; font-size:12px; font-weight:600; padding:0 6px; }
  .country-results { color:#53617a; font-size:12px; line-height:1.6; padding-bottom:4px; }
  .card { transition:transform .2s,border-color .2s; }
  .card:hover { transform:translateY(-2px); border-color:#0c69c850 !important; }
  .world-footer { border-top:1px solid #e7edf5; display:flex; justify-content:space-between; gap:24px; padding:36px 0; align-items:center; }
  .world-footer h2 { font-family:'Sora',sans-serif; font-size:17px; font-weight:600; }
  .world-footer p { color:#67758b; font-size:12px; line-height:1.7; margin-top:8px; }
  .world-footer a { color:#0C69C8; font-size:12px; font-weight:600; min-height:44px; display:flex; align-items:center; gap:14px; white-space:nowrap; }
  .countries-expand { display:flex; align-items:center; gap:12px; min-height:44px; margin:16px auto 0; padding:8px 0; border:0; background:transparent; color:#0C69C8; font-size:13px; font-weight:600; }
  .empty-state { padding:28px; font-size:13px; color:#53617a; line-height:1.7; }
  .load-error { min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:24px; padding:24px; text-align:center; }
  .load-error > svg { color:#0C69C8; font-size:44px; }
  .load-error p { max-width:420px; color:#53617a; line-height:1.7; }
  .data-notice { font-size:12px; background:#f2f7fd; padding:16px; margin-bottom:24px; color:#53617a; }
  .data-notice button { border:0; background:transparent; color:#0C69C8; text-decoration:underline; min-height:44px; padding:0 10px; }
  @media (max-width:1000px) { .country-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media (max-width:760px) {
    .main-pad { padding:34px 16px 0; }
    .world-header { min-height:68px; padding:10px 16px; }
    .world-brand { font-size:14px; gap:8px; letter-spacing:-.4px; }
    .world-brand img { width:26px; height:26px; }
    .world-header nav { font-size:11px; gap:14px; }
    .countries-nav { display:none !important; }
    .hero-grid { grid-template-columns:1fr; gap:12px; }
    .hero-content h1 { font-size:clamp(32px,7.8vw,52px); letter-spacing:-1.5px; }
    .hero-intro { font-size:14px; margin:16px 0 24px; }
    .world-total-number { font-size:clamp(32px,10vw,62px); letter-spacing:-1.5px; }
    .hero-actions { gap:12px 22px; margin-top:24px; }
    .world-globe { max-width:340px; margin:0 auto; }
    .world-summary { margin-top:20px; padding:22px 0; }
    .world-summary > div { flex-direction:column; gap:9px; padding:0 6px; text-align:center; }
    .world-summary svg { font-size:18px; }
    .world-summary strong { font-size:clamp(20px,5.6vw,27px); }
    .world-summary strong small { font-size:12px; }
    .world-summary > div > div > span { font-size:10px; line-height:1.5; }
    .hero-mb,.section-mb { margin-bottom:44px; }
    .milestone-section { grid-template-columns:1fr; gap:22px; padding:22px 20px; }
    .milestone-section h2 { font-size:18px; }
    .world-footer { flex-direction:column; align-items:flex-start; gap:12px; }
  }
  @media (max-width:600px) { .lb-table-head,.lb-table-row { grid-template-columns:32px minmax(0,1fr) 86px; gap:8px; } .lb-hide-mobile { display:none !important; } }
  @media (max-width:420px) { .country-grid { grid-template-columns:1fr; } .primary-action { padding:13px 14px; gap:12px; font-size:12px; } .text-action { font-size:12px; } }
  @media (prefers-reduced-motion:reduce) {
    html { scroll-behavior:auto; }
    *,*::before,*::after { animation:none !important; transition:none !important; }
  }
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt     = n => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(Math.round(n));
const fmtFull = n => (n||0).toLocaleString();
const dayLbl  = d => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});

const normaliseSearch = value => value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
const COUNTRY_ISO = {
  ...countryCodes,
  "Ireland":"ie","Republic of Ireland":"ie",
  "United Kingdom":"gb","UK":"gb","Great Britain":"gb","England":"gb","Scotland":"gb","Wales":"gb",
  "United States":"us","USA":"us","United States of America":"us",
  "France":"fr","Germany":"de","Spain":"es","Italy":"it",
  "Australia":"au","Canada":"ca","Nigeria":"ng","South Africa":"za",
  "Brazil":"br","Portugal":"pt","Netherlands":"nl","Belgium":"be",
  "Sweden":"se","Norway":"no","Denmark":"dk","Finland":"fi",
  "Poland":"pl","Ukraine":"ua","Romania":"ro","Czech Republic":"cz",
  "Austria":"at","Switzerland":"ch","Greece":"gr","Hungary":"hu",
  "New Zealand":"nz","Japan":"jp","China":"cn","India":"in",
  "South Korea":"kr","Mexico":"mx","Argentina":"ar","Chile":"cl",
  "Colombia":"co","Peru":"pe","Venezuela":"ve","Ecuador":"ec",
  "Ghana":"gh","Kenya":"ke","Ethiopia":"et","Tanzania":"tz",
  "Uganda":"ug","Rwanda":"rw","Zimbabwe":"zw","Zambia":"zm",
  "Cameroon":"cm","Senegal":"sn","Ivory Coast":"ci","Morocco":"ma",
  "Egypt":"eg","Tunisia":"tn","Algeria":"dz","Libya":"ly",
  "Saudi Arabia":"sa","UAE":"ae","United Arab Emirates":"ae",
  "Qatar":"qa","Kuwait":"kw","Bahrain":"bh","Oman":"om","Jordan":"jo",
  "Israel":"il","Turkey":"tr","Iran":"ir","Pakistan":"pk",
  "Bangladesh":"bd","Sri Lanka":"lk","Nepal":"np","Philippines":"ph",
  "Indonesia":"id","Malaysia":"my","Singapore":"sg","Thailand":"th",
  "Vietnam":"vn","Russia":"ru","Iceland":"is","Luxembourg":"lu",
  "Malta":"mt","Cyprus":"cy","Slovakia":"sk","Slovenia":"si",
  "Croatia":"hr","Serbia":"rs","Bulgaria":"bg","Lithuania":"lt",
  "Latvia":"lv","Estonia":"ee","Moldova":"md","Albania":"al",
  "North Macedonia":"mk","Bosnia and Herzegovina":"ba","Montenegro":"me",
};

const COUNTRY_LOOKUP = new Map(Object.entries(COUNTRY_ISO).map(([name,iso])=>[normaliseSearch(name),iso]));
const isoFor  = c => COUNTRY_LOOKUP.get(normaliseSearch(String(c||""))) || null;
const flagUrl = c => { const iso=isoFor(c); return iso?`https://flagcdn.com/w40/${iso}.png`:null; };

const FlagImg = ({ country, size=28 }) => {
  const url = flagUrl(country);
  const [failedUrl,setFailedUrl]=useState(null);
  if (!url || failedUrl===url) return <span role="img" aria-label={country} style={{width:size*1.4,height:size,fontSize:size*0.75,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FontAwesomeIcon icon={faEarthEurope} aria-hidden="true" /></span>;
  return <img src={url} alt={country} style={{width:size*1.4,height:size,objectFit:"cover",borderRadius:4,flexShrink:0,display:"block"}} onError={()=>setFailedUrl(url)}/>;
};

const AnimNum = ({ value, duration=1200, format=fmtFull }) => {
  const [v,setV] = useState(0);
  const current = useRef(0);
  useEffect(()=>{
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    const finish=()=>{cancelAnimationFrame(frame);current.current=value;setV(value);};
    const from=current.current, start=performance.now()+(from===0 ? 200 : 0);
    const tick=now=>{
      const p=Math.min(1,Math.max(0,(now-start)/duration));
      const next=Math.round(from+(value-from)*p);
      current.current=next;setV(next);
      if(p<1)frame=requestAnimationFrame(tick);
    };
    if(motion.matches || from===value)finish();else frame=requestAnimationFrame(tick);
    const change=()=>{if(motion.matches)finish();};
    motion.addEventListener("change",change);
    return()=>{cancelAnimationFrame(frame);motion.removeEventListener("change",change);};
  },[value,duration]);
  return <span>{format(v)}</span>;
};

const SHead = ({C,tag,title,sub}) => (
  <div style={{marginBottom:20}}>
    <div className="section-eyebrow">{tag}</div>
    <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(20px,4vw,26px)",fontWeight:800,color:C.text,letterSpacing:-0.4,marginBottom:6,lineHeight:1.2}}>{title}</h2>
    {sub&&<p style={{fontSize:13,color:C.textSecondary,lineHeight:1.65,maxWidth:520}}>{sub}</p>}
  </div>
);

const Avatar = ({profile,C,size=36}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = profile
    ? `${(profile.name||"")[0]||""}${(profile.surname||"")[0]||""}`.toUpperCase()||(profile.username||"?")[0].toUpperCase()
    : "?";
  const colors = ["#0C69C8","#0A1D44","#38BDF8","#34D399","#FBBF24"];
  const idx = (profile?.username||"").charCodeAt(0)%colors.length;
  if (profile?.profile_img && !imageFailed) {
    return <img className="avatar" src={profile.profile_img} alt={initials} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={()=>setImageFailed(true)}/>;
  }
  return (
    <div style={{width:size,height:size,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*0.36),fontWeight:700,flexShrink:0,background:`${colors[idx]}20`,border:`1px solid ${colors[idx]}40`,color:colors[idx]}}>
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════
   FETCH HELPER
═══════════════════════════════════════════ */
const fetchAll = async (table, columns, orderCol, sportId = null) => {
  const PAGE = 1000;
  let rows = [], from = 0;
  while (true) {
    let q = supabase.from(table).select(columns);
    if (sportId) q = q.eq("sport_id", sportId);
    if (orderCol) q = q.order(orderCol, { ascending: true });
    q = q.range(from, from + PAGE - 1);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
};

// Older step syncs were written to step_update_log before the daily snapshot
// and event tables were introduced. Keep the public insights page complete for
// that history by rebuilding daily rows from the durable step log when the
// newer tables are empty.
const snapshotsFromStepLog = rows => {
  const grouped = {};
  (rows || []).forEach(row => {
    if (!row.profile_id || !row.created_at) return;
    const day = row.created_at.slice(0, 10);
    const key = `${row.profile_id}:${day}`;
    if (!grouped[key]) grouped[key] = { profile_id: row.profile_id, day, steps: 0, calories: 0, distance_m: 0, tracking_mode: "step_log" };
    grouped[key].steps += Math.max(0, Number(row.steps_added) || 0);
  });
  return Object.values(grouped);
};

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function InsightsDashboard() {
  const C = LIGHT;
  const [reducedMotion,setReducedMotion]=useState(()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(()=>{const q=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReducedMotion(q.matches);q.addEventListener("change",update);return()=>q.removeEventListener("change",update);},[]);
  const [reloadKey,setReloadKey]=useState(0);
  const refreshRef=useRef(()=>{});
  const [showAllCountries,setShowAllCountries]=useState(false);
  const [countrySearch,setCountrySearch]=useState("");
  const countrySearchInput=useRef(null);
  const [loadError,setLoadError]=useState(false);
  const [partialError,setPartialError]=useState(false);
  const [snapshots,    setSnapshots]    = useState([]);
  const [profiles,     setProfiles]     = useState({});
  const [sportProfiles,setSportProfiles]= useState([]);
  const [activities,   setActivities]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [updateError,  setUpdateError]  = useState(false);
  const [initialSteps, setInitialSteps] = useState(null);

  useEffect(()=>{
    let active=true, busy=false, hasLoaded=false, lastDetailsAt=0;
    const refresh = async () => {
      if (!active || busy || document.hidden) return;
      if (!navigator.onLine) {
        if (hasLoaded) setUpdateError(true);
        else { setLoading(false); setLoadError(true); }
        return;
      }
      busy=true;
      const includeDetails = !hasLoaded || Date.now()-lastDetailsAt >= 60_000;
      try {
        const results = await Promise.allSettled([
          fetchAll("profiles",             "id,username,name,surname,profile_img,country,current_country,level", null),
          fetchAll("sport_profiles",       "profile_id,sport_id,trophies,lifetime_steps,league", null, "Fitness"),
          ...(includeDetails ? [
            fetchAll("daily_step_snapshots", "profile_id,day,steps,calories,distance_m,tracking_mode", "day"),
            fetchAll("step_update_log",      "profile_id,steps_added,created_at", "created_at"),
            fetchAll("activities",           "profile_id,distance_m,calories,created_at,started_at", "created_at"),
          ] : []),
        ]);

        if (!active) return;
        const [profs, sProfs, snaps, stepLog, activityRows] = results;
        if (!hasLoaded && (profs.status === "rejected" || sProfs.status === "rejected")) throw new Error("Worldwide data unavailable");
        if (profs.status === "fulfilled") {
          const map = {};
          profs.value.forEach(p => { map[p.id] = p; });
          setProfiles(map);
        }
        if (sProfs.status === "fulfilled") {
          setInitialSteps(previous => previous ?? worldwideStepTotal(sProfs.value));
          setSportProfiles(sProfs.value);
        }
        if (includeDetails) {
          if (snaps.status === "fulfilled") {
            if (snaps.value.length) setSnapshots(snaps.value);
            else if (stepLog.status === "fulfilled") setSnapshots(snapshotsFromStepLog(stepLog.value));
          }
          if (activityRows.status === "fulfilled") setActivities(activityRows.value);
          if (results.slice(2).every(result => result.status === "fulfilled")) lastDetailsAt=Date.now();
        }
        if (includeDetails) setPartialError(results.slice(2).some(result => result.status === "rejected"));
        setUpdateError(results.slice(0,2).some(result => result.status === "rejected"));
        hasLoaded=true;
        setLoadError(false);
      } catch (err) {
        console.error("Dashboard load error:", err);
        if(active) hasLoaded ? setUpdateError(true) : setLoadError(true);
      } finally {
        busy=false;
        if(active)setLoading(false);
      }
    };
    const onVisible=()=>{if(!document.hidden)refresh();};
    refreshRef.current=refresh;
    refresh();
    const interval=setInterval(refresh,15_000);
    window.addEventListener("online",refresh);
    window.addEventListener("offline",refresh);
    document.addEventListener("visibilitychange",onVisible);
    return()=>{
      active=false;
      clearInterval(interval);
      window.removeEventListener("online",refresh);
      window.removeEventListener("offline",refresh);
      document.removeEventListener("visibilitychange",onVisible);
    };
  },[reloadKey]);

  const fitnessProfiles=useMemo(()=>sportProfiles.filter(sp=>sp.sport_id==="Fitness"),[sportProfiles]);

  const M = useMemo(()=>{
    // Fitness is the source of truth for worldwide steps and athletes. Keep
    // returning a complete zero-value model while data is empty so slow/public
    // requests cannot leave the dashboard with a null metrics object.
    const lifetimeStepsByProfile = {};
    fitnessProfiles.forEach(sp => {
      if (!sp.profile_id) return;
      const lifetimeSteps = Math.max(0, Number(sp.lifetime_steps) || 0);
      lifetimeStepsByProfile[sp.profile_id] = Math.max(
        lifetimeStepsByProfile[sp.profile_id] || 0,
        lifetimeSteps
      );
    });
    const totalSteps  = worldwideStepTotal(fitnessProfiles);
    const fitnessIds=new Set(Object.keys(lifetimeStepsByProfile));
    const fitnessSnapshots=snapshots.filter(s=>fitnessIds.has(s.profile_id));
    const snapshotDist = fitnessSnapshots.reduce((a,s)=>a+(Number(s.distance_m)||0),0);
    const totalDist   = snapshotDist || activities.filter(s=>fitnessIds.has(s.profile_id)).reduce((a,s)=>a+(Number(s.distance_m)||0),0);
    const uniqueUsers = Object.keys(lifetimeStepsByProfile).length;
    // Daily trend
    const bd={};
    fitnessSnapshots.forEach(s=>{
      if(!bd[s.day]) bd[s.day]={steps:0,cal:0,users:new Set()};
      bd[s.day].steps+=s.steps||0;
      bd[s.day].cal+=s.calories||0;
      bd[s.day].users.add(s.profile_id);
    });
    const dailyTrend=Object.entries(bd).sort(([a],[b])=>a.localeCompare(b)).map(([day,d])=>({day:dayLbl(day),steps:d.steps,cal:d.cal,users:d.users.size}));

    // Leaderboard ranked by the athlete's highest trophy total. Lifetime steps
    // remain the athlete-level maximum rather than whichever sport won the rank.
    const trophyMap = {};
    fitnessProfiles.forEach(sp => {
      const pid = sp.profile_id;
      if (!pid) return;
      const lifetimeSteps = Math.max(0, Number(sp.lifetime_steps) || 0);
      if (!trophyMap[pid]) {
        trophyMap[pid] = {
          trophies:      sp.trophies      || 0,
          lifetimeSteps,
          league:        sp.league        || 1,
          globalRank:    sp.global_rank   || 0,
        };
        return;
      }
      trophyMap[pid].lifetimeSteps = Math.max(trophyMap[pid].lifetimeSteps, lifetimeSteps);
      if ((sp.trophies || 0) > trophyMap[pid].trophies) {
        trophyMap[pid].trophies   = sp.trophies   || 0;
        trophyMap[pid].league     = sp.league     || 1;
        trophyMap[pid].globalRank = sp.global_rank|| 0;
      }
    });
    const leaderboard = Object.entries(trophyMap)
      .filter(([pid]) => !STORE_REVIEWER_IDS.has(pid))
      .sort(([,a],[,b]) => b.trophies - a.trophies)
      .slice(0, 8)
      .map(([pid, u], i) => ({ rank: i+1, pid, ...u }));

    return { totalSteps,totalDist,uniqueUsers,dailyTrend,leaderboard };
  },[snapshots,fitnessProfiles,activities]);

  const countryData = useMemo(()=>{
    if(!Object.keys(profiles).length) return {countries:[],totalCountries:0,totalWithCountry:0,noCountryCount:0};
    const fitnessIds = new Set(fitnessProfiles.map(sp => sp.profile_id));
    const cc={};
    let missingProfiles = 0;
    let noCountryCount = 0;
    fitnessIds.forEach(pid=>{
      const p=profiles[pid];
      if(!p) { missingProfiles++; return; }
      const country = p.current_country?.trim() || p.country?.trim() || null;
      if(country){ cc[country]=(cc[country]||0)+1; }
      else { noCountryCount++; }
    });
    if(missingProfiles > 0) console.log(`countryData: ${missingProfiles} profile_ids from sport_profiles not found in profiles table`);
    return {
      countries: Object.entries(cc).sort(([,a],[,b])=>b-a).map(([country,count])=>({country,count})),
      noCountryCount,
      totalCountries: Object.keys(cc).length,
      totalWithCountry: Object.values(cc).reduce((a,b)=>a+b,0),
    };
  },[profiles,fitnessProfiles]);

  const countryQuery=normaliseSearch(countrySearch);
  const matchingCountries=useMemo(()=>countryData.countries.filter(({country})=>{
    if(!countryQuery || normaliseSearch(country).includes(countryQuery)) return true;
    const iso=isoFor(country);
    return iso && Object.entries(COUNTRY_ISO).some(([alias,code])=>code===iso && normaliseSearch(alias).includes(countryQuery));
  }),[countryData.countries,countryQuery]);
  const visibleCountries=countryQuery || showAllCountries ? matchingCountries : matchingCountries.slice(0,8);
  const clearCountrySearch=()=>{setCountrySearch("");countrySearchInput.current?.focus();};

  const nextMilestone=(Math.floor(M.totalSteps/10000000)+1)*10000000;
  const milestoneProgress=Math.min(100,(M.totalSteps/nextMilestone)*100);
  const stepsSinceLoad=initialSteps === null ? 0 : M.totalSteps-initialSteps;

  if(loading) return(
    <div role="status" style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{makeCSS(C)}</style>
      <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.accent,animation:"spin 0.75s linear infinite"}}/>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:13,color:C.textMuted,fontWeight:600}}>Gathering worldwide steps…</div>
    </div>
  );

  if(loadError) return <main className="load-error">
    <style>{makeCSS(C)}</style>
    <FontAwesomeIcon icon={faEarthEurope} aria-hidden="true" />
    <h1>World Wide Steps</h1>
    <p role="alert">We could not load worldwide activity. Check your connection and try again.</p>
    <button className="primary-action" onClick={()=>setReloadKey(v=>v+1)}><FontAwesomeIcon icon={faArrowRotateRight} aria-hidden="true" /> Try again</button>
  </main>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{makeCSS(C)}</style>

      <header className="world-header">
        <a href="#top" className="world-brand"><img src={logo} alt="" /><span>World Wide Steps</span></a>
        <nav aria-label="Page navigation"><a href="/schools">Schools</a><a href="#leaderboard">Leaderboard</a><a className="countries-nav" href="#countries">Countries</a></nav>
      </header>
      <main className="main-pad" id="top">
        {(partialError||updateError)&&<div className="data-notice" role="status">{!navigator.onLine ? "You’re offline. Showing the last loaded figures; updates will resume when you reconnect." : "Some figures could not update. Showing the last loaded values and trying again automatically."} <button onClick={()=>refreshRef.current()}>Try again</button></div>}
        <section className="world-hero hero-mb" aria-labelledby="world-title">
          <div className="hero-grid">
            <div className="hero-content fu">
              <div className="section-eyebrow"><FontAwesomeIcon icon={faEarthEurope} aria-hidden="true" /> A world in motion</div>
              <h1 id="world-title">Small steps.<br/><span className="grad-text">Worldwide impact.</span></h1>
              <p className="hero-intro"><strong className="hero-slogan">Where Athletes Belong</strong>See how far we are moving together.</p>
              <div className="world-total" aria-label="Total lifetime steps worldwide">
                <div className="world-total-label">Steps taken worldwide</div>
                <div className="world-total-value">
                  <div className="world-total-number"><AnimNum value={M.totalSteps}/></div>
                </div>
                {stepsSinceLoad !== 0 && <div className="world-total-delta" data-direction={stepsSinceLoad > 0 ? "up" : "down"}>{stepsSinceLoad > 0 ? "+" : "−"}<AnimNum value={Math.abs(stepsSinceLoad)} duration={900}/>{stepsSinceLoad < 0 ? " fewer steps" : " new steps"} since this page loaded</div>}
                <div className="world-total-note">All time steps recorded on Snows ProAm</div>
              </div>
              <div className="hero-actions"><a className="primary-action" href="#leaderboard">Explore the leaderboard <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></a><a className="text-action" href="#countries">Meet the world <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></a></div>
            </div>
            <GlobeScene/>
          </div>
          <div className="world-summary">
            <div><FontAwesomeIcon icon={faPersonRunning} aria-hidden="true"/><div><strong><AnimNum value={M.uniqueUsers}/></strong><span>Fitness athletes worldwide</span></div></div>
            <div><FontAwesomeIcon icon={faEarthEurope} aria-hidden="true"/><div><strong><AnimNum value={countryData.totalCountries}/></strong><span>Countries represented</span></div></div>
            <div><FontAwesomeIcon icon={faRuler} aria-hidden="true"/><div><strong><AnimNum value={Math.round(M.totalDist/1000)}/> <small>km</small></strong><span>Recorded distance</span></div></div>
          </div>
        </section>

        <section className="milestone-section section-mb" aria-labelledby="milestone-title">
          <div><div className="section-eyebrow">Our next milestone</div><h2 id="milestone-title">Together, towards {nextMilestone/1000000} million.</h2><p><AnimNum value={nextMilestone-M.totalSteps}/> more steps to get there.</p></div>
          <div className="milestone-meter"><div className="milestone-labels"><span><AnimNum value={M.totalSteps}/> steps</span><span><AnimNum value={Math.floor(milestoneProgress)}/>%</span></div><div className="milestone-track" role="progressbar" aria-label="Progress towards the next worldwide step milestone" aria-valuenow={M.totalSteps} aria-valuemin={0} aria-valuemax={nextMilestone}><div style={{width:`${milestoneProgress}%`}}/></div><span className="world-total-note">Real steps. Shared progress.</span></div>
        </section>

        {M.dailyTrend.some(d=>d.steps>0)&&<section className="section-mb" aria-label="Daily step activity">
          <SHead C={C} tag="Daily activity" title="The world keeps moving" sub="Recorded steps across the community, day by day."/>
          <div className="timeline-chart"><Suspense fallback={<div className="chart-loading" role="status">Loading daily activity…</div>}><DailyStepsChart data={M.dailyTrend} reducedMotion={reducedMotion}/></Suspense></div>
        </section>}

        {/* ── LEADERBOARD ── */}
        <section className="section-mb fu3" id="leaderboard">
          <SHead C={C} tag="Top Athletes" title="Meet the pace setters" sub="Real athletes setting the pace. Ranked by trophies earned across the community."/>
          <div role="table" aria-label="Worldwide athlete rankings" style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:C.shadowMd}}>
            <div role="row" className="lb-table-head" style={{padding:"11px 16px",background:C.bgAlt,borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.4}}>
              <div role="columnheader">#</div>
              <div role="columnheader">Athlete</div>
              <div role="columnheader" style={{textAlign:"right"}}>Trophies</div>
              <div role="columnheader" className="lb-hide-mobile" style={{textAlign:"right"}}>Lifetime Steps</div>
              <div role="columnheader" className="lb-hide-mobile" style={{textAlign:"right"}}>League</div>
            </div>
            {!M.leaderboard.length&&<p className="empty-state">The first athletes will appear here as activity is recorded.</p>}
            {(M?.leaderboard||[]).map((u,i)=>{
              const profile=profiles[u.pid];
              const maxT=M.leaderboard[0]?.trophies||1;
              const pct=Math.round((u.trophies/maxT)*100);
              const medal=i<3;
              const rowCol=i===0?C.amber:i===1?"#94A3B8":i===2?"#C97B3A":C.accent;
              const displayName=profile?[profile.name,profile.surname].filter(Boolean).join(" ")||profile.username||`@${u.pid.slice(0,8)}`:`@${u.pid.slice(0,8)}`;
              const username=profile?.username?`@${profile.username}`:null;
              const country=profile?.country||profile?.current_country||null;
              return(
                <div role="row" key={u.pid} className="lb-table-row" style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:i===0?`${C.amber}05`:"transparent",transition:"background 0.15s ease"}}>
                  <div role="cell" style={{width:32,height:32,borderRadius:8,background:i<3?`${rowCol}18`:C.bgAlt,border:`1px solid ${i<3?rowCol+"30":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:medal?13:11,fontWeight:800,color:rowCol}}>
                    {medal ? <><FontAwesomeIcon icon={faMedal} aria-hidden="true" /><span className="insights-sr-only">Rank {u.rank}</span></> : u.rank}
                  </div>
                  <div role="cell" style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                    <Avatar profile={profile} C={C} size={32}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"120px"}}>{displayName}</span>
                        {country&&<FlagImg country={country} size={14}/>}
                        {profile?.level&&(
                          <span style={{fontSize:10,fontWeight:600,color:C.textMuted,whiteSpace:"nowrap"}}>Level {profile.level}</span>
                        )}
                      </div>
                      {username&&<div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginBottom:4}}>{username}</div>}
                      <div style={{height:3,borderRadius:99,background:C.bgAlt,overflow:"hidden"}}>
                        <div className="bar-fill" style={{height:"100%",width:`${pct}%`,background:C.accentGrad,borderRadius:99}}/>
                      </div>
                    </div>
                  </div>
                  {/* Trophies */}
                  <div role="cell" style={{textAlign:"right",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:800,color:i<3?rowCol:C.text}}>
                    <FontAwesomeIcon icon={faTrophy} aria-hidden="true" /> <AnimNum value={u.trophies}/>
                  </div>
                  {/* Lifetime Steps */}
                  <div role="cell" className="lb-hide-mobile" style={{textAlign:"right",fontSize:12,fontWeight:600,color:C.textSecondary}}>
                    <AnimNum value={u.lifetimeSteps} format={fmt}/>
                  </div>
                  {/* League */}
                  <div role="cell" className="lb-hide-mobile" style={{textAlign:"right",fontSize:12,fontWeight:600,color:C.textSecondary}}>
                    L{u.league}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

          <section className="section-mb fu4" id="countries">
            <SHead C={C} tag="Across the globe" title="Many countries. One community." sub="Discover where our Fitness athletes call home."/>
            <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 18px",boxShadow:C.shadowMd}}>
              {countryData.countries.length>0&&<div className="country-toolbar">
                <div className="country-search">
                  <label htmlFor="country-search">Search countries</label>
                  <div className="country-search-field">
                    <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true"/>
                    <input ref={countrySearchInput} id="country-search" type="search" placeholder="Find your country" value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")clearCountrySearch();}} aria-controls="country-list" aria-describedby="country-results" autoComplete="off" spellCheck={false}/>
                    {countrySearch&&<button type="button" aria-label="Clear country search" onClick={clearCountrySearch}>Clear</button>}
                  </div>
                </div>
                <p className="country-results" id="country-results" role="status" aria-live="polite" aria-atomic="true">{countryQuery?`${matchingCountries.length} ${matchingCountries.length===1?"country":"countries"} found`:`Showing ${visibleCountries.length} of ${countryData.totalCountries} countries`}</p>
              </div>}
              {!countryData.countries.length&&<p className="empty-state">Countries will appear here as athletes add their location.</p>}
              {countryQuery&&!matchingCountries.length&&<p className="empty-state">No countries found for “{countrySearch.trim()}”. Try another name or clear your search to see every country.</p>}
              <div className="country-grid" id="country-list">
                {visibleCountries.map(c=>{
                  const max=countryData.countries[0]?.count||1;
                  const pct=Math.round((c.count/max)*100);
                  return(
                    <div key={c.country} className="card" style={{padding:"14px 16px",borderRadius:14,background:C.bgAlt,border:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                          <FlagImg country={c.country} size={22}/>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.5}}>{c.country}</div>
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:500}}><AnimNum value={c.count}/> athlete{c.count!==1?"s":""}</div>
                          </div>
                        </div>
                        {c.country===countryData.countries[0]?.country&&<span style={{fontSize:11,fontWeight:700,color:C.accent,flexShrink:0}}>#1</span>}
                      </div>
                      <div style={{height:3,borderRadius:99,background:C.border}}>
                        <div style={{height:"100%",width:`${pct}%`,background:C.accentGrad,borderRadius:99,transition:"width 1.2s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!countryQuery&&countryData.countries.length>8&&<button className="countries-expand" aria-expanded={showAllCountries} aria-controls="country-list" onClick={()=>setShowAllCountries(v=>!v)}>{showAllCountries?"Show fewer countries":`See all ${countryData.totalCountries} countries`} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true"/></button>}
              {countryData.noCountryCount > 0 && (
                <div style={{fontSize:10,color:C.textMuted,textAlign:"center",marginTop:12}}>
                  + {countryData.noCountryCount} athletes without country set
                </div>
              )}
              <div style={{fontSize:11,color:C.textSecondary,textAlign:"center",marginTop:6,fontWeight:600}}>
                Total: <AnimNum value={countryData.totalWithCountry + countryData.noCountryCount}/> Fitness athletes
              </div>
            </div>
          </section>

        <WorldSiteFooter />

      </main>
    </div>
  );
}
