// Built by Solomon
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png";

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
const DARK = {
  mode: "dark",
  accent: "#0C69C8",
  accentBgSubtle: "rgba(12,105,200,0.08)",
  accentBgLight:  "rgba(12,105,200,0.14)",
  accentBorder:   "rgba(12,105,200,0.20)",
  accentGlow:     "rgba(12,105,200,0.30)",
  accentGrad:     "linear-gradient(135deg, #0C69C8 0%, #0A1D44 100%)",
  bg:             "#0A0A0A",
  bgCard:         "#141414",
  bgAlt:          "#111111",
  bgElevated:     "#1E1E1E",
  border:         "rgba(255,255,255,0.08)",
  borderMedium:   "rgba(255,255,255,0.12)",
  shadowMd:       "0 4px 16px rgba(0,0,0,0.4)",
  shadowLg:       "0 12px 48px rgba(0,0,0,0.7)",
  shadowGlow:     "0 0 40px rgba(12,105,200,0.15)",
  text:           "#FAFAFA",
  textSecondary:  "rgba(255,255,255,0.70)",
  textMuted:      "rgba(255,255,255,0.40)",
  headerBg:       "rgba(10,10,10,0.92)",
  scrollbarThumb: "rgba(255,255,255,0.12)",
  cyan:           "#38BDF8",
  cyanBg:         "rgba(56,189,248,0.07)",
  cyanBorder:     "rgba(56,189,248,0.18)",
  emerald:        "#34D399",
  emeraldBg:      "rgba(52,211,153,0.07)",
  emeraldBorder:  "rgba(52,211,153,0.18)",
  amber:          "#FBBF24",
  amberBg:        "rgba(251,191,36,0.07)",
  rose:           "#F87171",
};

const LIGHT = {
  mode: "light",
  accent: "#0C69C8",
  accentBgSubtle: "rgba(12,105,200,0.05)",
  accentBgLight:  "rgba(12,105,200,0.10)",
  accentBorder:   "rgba(12,105,200,0.15)",
  accentGlow:     "rgba(12,105,200,0.18)",
  accentGrad:     "linear-gradient(135deg, #0C69C8 0%, #0A1D44 100%)",
  bg:             "#F5F7FA",
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
  textMuted:      "#7A87A8",
  headerBg:       "rgba(245,247,250,0.95)",
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
const makeCSS = (C) => `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
  html { font-size: 16px; }
  body { font-family:'DM Sans',sans-serif; background:${C.bg}; color:${C.text}; overflow-x:hidden; }
  a { color:inherit; text-decoration:none; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${C.scrollbarThumb}; border-radius:99px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes countUp  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes orbit    { from{transform:rotateZ(0deg) rotateX(55deg)} to{transform:rotateZ(360deg) rotateX(55deg)} }
  @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes glow     { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pRing    { 0%{transform:scale(1);opacity:0.5} 70%,100%{transform:scale(2.2);opacity:0} }

  .fu  { animation:fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }
  .fu2 { animation:fadeUp 0.65s 0.08s  cubic-bezier(0.16,1,0.3,1) both; }
  .fu3 { animation:fadeUp 0.65s 0.16s  cubic-bezier(0.16,1,0.3,1) both; }
  .fu4 { animation:fadeUp 0.65s 0.24s  cubic-bezier(0.16,1,0.3,1) both; }
  .fu5 { animation:fadeUp 0.65s 0.32s  cubic-bezier(0.16,1,0.3,1) both; }

  .card { transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.2s ease; }
  .card:hover { transform:translateY(-2px); box-shadow:${C.shadowLg}; border-color:${C.accentBorder} !important; }

  .stat-num { animation:countUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
  .globe-float { animation:floatY 5s ease-in-out infinite; }

  .globe-ring {
    position:absolute; border-radius:50%;
    border:1px solid ${C.accentBorder};
    animation:orbit 14s linear infinite;
  }
  .live-dot {
    width:6px; height:6px; border-radius:50%;
    background:${C.emerald};
    box-shadow:0 0 8px ${C.emerald};
    animation:glow 1.6s ease-in-out infinite;
  }
  .bar-fill {
    position:relative; overflow:hidden;
    transition:width 1.3s cubic-bezier(0.16,1,0.3,1);
  }
  .bar-fill::after {
    content:'';position:absolute;inset:0;
    background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%);
    background-size:200% 100%;
    animation:shimmer 2.8s linear infinite;
  }
  .ticker-wrap { display:block; position:relative; width:100%; max-width:100vw; height:34px; overflow:hidden; white-space:nowrap; contain:layout paint; isolation:isolate; }
  .ticker-inner { position:absolute; top:8px; left:0; display:inline-flex; width:max-content; max-width:none; animation:ticker 28s linear infinite; }
  .theme-toggle { transition:transform 0.2s ease; }
  .theme-toggle:hover { transform:rotate(15deg) scale(1.1); }
  .grad-text {
    background:linear-gradient(135deg,#0C69C8 0%,#0A1D44 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; }
  .avatar-placeholder { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
  .flag { font-size:18px; }

  .hero-grid { display:grid; grid-template-columns:1fr 380px; gap:56px; align-items:center; }
  @media (max-width:860px) { .hero-grid { grid-template-columns:1fr; gap:36px; } .hero-globe-wrap { display:flex; justify-content:center; } }

  .stat-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
  @media (min-width:640px) { .stat-grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; } }
  @media (min-width:900px) { .stat-grid { grid-template-columns:repeat(6,minmax(0,1fr)); gap:12px; } }

  .stat-num-big {
    display:block;
    max-width:100%;
    min-width:0;
    font-family:'Sora',sans-serif;
    font-size:clamp(15px,1.55vw,21px);
    font-weight:800;
    letter-spacing:0;
    line-height:1.08;
    white-space:nowrap;
    font-variant-numeric:tabular-nums;
  }
  @media (min-width:900px) { .stat-num-big { font-size:clamp(13px,1.18vw,18px); } }
  @media (max-width:420px) { .stat-grid { grid-template-columns:1fr 1fr; } .stat-num-big { font-size:clamp(13px,4vw,16px); } }

  .three-col { display:grid; grid-template-columns:1.6fr 1fr 1fr; gap:16px; }
  @media (max-width:860px) { .three-col { grid-template-columns:1fr; } }

  .lb-table-head, .lb-table-row { display:grid; grid-template-columns:44px 1fr 110px 120px 64px; gap:10px; align-items:center; }
  @media (max-width:600px) { .lb-table-head, .lb-table-row { grid-template-columns:36px 1fr 88px; } .lb-hide-mobile { display:none !important; } }

  .hero-pills { display:flex; gap:10px; flex-wrap:wrap; }

  .effect-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
  @media (max-width:860px) { .effect-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:480px) { .effect-grid { grid-template-columns:1fr; } }

  .country-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }
  @media (max-width:480px) { .country-grid { grid-template-columns:1fr 1fr; } }

  .closing-stats { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .closing-stat-item { padding:15px 20px; border-radius:14px; text-align:center; min-width:100px; }

  .hourly-pills { display:flex; gap:12px; margin-top:18px; flex-wrap:wrap; justify-content:center; }

  @media (max-width:480px) { .globe-wrap-inner { transform:scale(0.78); transform-origin:center top; } }

  .main-pad { max-width:1280px; margin:0 auto; padding:36px 16px 80px; }
  @media (min-width:640px) { .main-pad { padding:48px 24px 96px; } }

  .section-mb { margin-bottom:40px; }
  @media (min-width:640px) { .section-mb { margin-bottom:52px; } }

  .hero-mb { margin-bottom:48px; }
  @media (min-width:640px) { .hero-mb { margin-bottom:64px; } }
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt     = n => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(Math.round(n));
const fmtFull = n => (n||0).toLocaleString();
const dayLbl  = d => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});

const COUNTRY_ISO = {
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

const isoFor  = c => COUNTRY_ISO[c] || null;
const flagUrl = c => { const iso=isoFor(c); return iso?`https://flagcdn.com/w40/${iso}.png`:null; };

const FlagImg = ({ country, size=28 }) => {
  const url = flagUrl(country);
  if (!url) return <span style={{fontSize:size*0.75,lineHeight:1}}>🌍</span>;
  return <img src={url} alt={country} style={{width:size*1.4,height:size,objectFit:"cover",borderRadius:4,flexShrink:0,display:"block"}} onError={e=>{e.target.style.display="none";}}/>;
};

const AnimNum = ({ value }) => {
  const [v,setV] = useState(0);
  const raf = useRef(null);
  useEffect(()=>{
    const dur=1400,t0=performance.now();
    const tick=now=>{
      const p=Math.min(1,(now-t0)/dur);
      setV(Math.round((1-Math.pow(1-p,4))*value));
      if(p<1) raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[value]);
  return <span className="stat-num">{v.toLocaleString()}</span>;
};

const Globe = ({ C, totalSteps, activeUsers, totalKm }) => {
  const dots=[
    {t:"30%",l:"48%",d:"0s",s:9},{t:"44%",l:"53%",d:"0.6s",s:7},
    {t:"37%",l:"43%",d:"1.1s",s:5},{t:"54%",l:"51%",d:"1.6s",s:7},
    {t:"32%",l:"57%",d:"0.9s",s:5},{t:"49%",l:"39%",d:"1.3s",s:8},
  ];
  return (
    <div className="hero-globe-wrap">
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,position:"relative"}}>
        <div style={{position:"absolute",width:320,height:320,borderRadius:"50%",background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 68%)`,filter:"blur(48px)",pointerEvents:"none"}}/>
        <div className="globe-float globe-wrap-inner" style={{position:"relative",width:220,height:220}}>
          {[{i:-18,dur:"14s"},{i:-36,dur:"20s",dir:"reverse"},{i:-56,dur:"28s"}].map((r,idx)=>(
            <div key={idx} className="globe-ring" style={{inset:r.i,animationDuration:r.dur,animationDirection:r.dir||"normal",borderColor:idx===1?C.cyanBorder:C.accentBorder}}/>
          ))}
          <div style={{width:220,height:220,borderRadius:"50%",overflow:"hidden",position:"relative",
            background:C.mode==="dark"
              ?"radial-gradient(circle at 32% 32%,#1E4E9A 0%,#0A2260 35%,#030B1F 100%)"
              :"radial-gradient(circle at 32% 32%,#60A5FA 0%,#1D4ED8 40%,#0A1D44 100%)",
            boxShadow:C.mode==="dark"
              ?"inset -18px -18px 50px rgba(0,0,0,0.9),inset 8px 8px 30px rgba(12,105,200,0.12),0 0 60px rgba(12,105,200,0.18)"
              :"inset -18px -18px 50px rgba(10,29,68,0.25),inset 8px 8px 30px rgba(96,165,250,0.25),0 0 40px rgba(12,105,200,0.12)",
          }}>
            {[22,42,62].map(t=><div key={t} style={{position:"absolute",left:0,right:0,top:`${t}%`,height:1,background:"rgba(255,255,255,0.05)"}}/>)}
            {[20,40,60,80].map(l=><div key={l} style={{position:"absolute",top:0,bottom:0,left:`${l}%`,width:1,background:"rgba(255,255,255,0.05)"}}/>)}
            <div style={{position:"absolute",top:"27%",left:"45%",width:36,height:42,borderRadius:"50% 44% 54% 40%",background:"rgba(12,105,200,0.45)",boxShadow:"0 0 18px rgba(12,105,200,0.7)"}}/>
            {dots.map((d,i)=>{
              const col=i%3===0?C.accent:i%3===1?C.cyan:C.emerald;
              return(
                <div key={i} style={{position:"absolute",top:d.t,left:d.l,width:d.s,height:d.s,borderRadius:"50%",background:col,boxShadow:`0 0 ${d.s*2}px ${col}`,animation:`glow 2s ${d.d} ease-in-out infinite`}}>
                  <div style={{position:"absolute",inset:"-50%",borderRadius:"50%",background:col,opacity:0.25,animation:`pRing 2s ${d.d} ease-out infinite`}}/>
                </div>
              );
            })}
            <div style={{position:"absolute",top:"8%",left:"12%",width:65,height:48,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,0.16) 0%,transparent 70%)"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:28,textAlign:"center"}}>
          {[
            {label:"Lifetime steps",value:fmt(totalSteps),color:C.accent},
            {label:"Athletes",value:String(activeUsers),color:C.cyan},
            {label:"Kilometres",value:`${(totalKm/1000).toFixed(0)}K`,color:C.emerald},
          ].map(s=>(
            <div key={s.label}>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(16px,4vw,20px)",fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,fontWeight:600,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChartTip = ({active,payload,label,C}) => {
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:C.bgElevated,border:`1px solid ${C.borderMedium}`,borderRadius:10,padding:"10px 14px",boxShadow:C.shadowMd}}>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:5,fontWeight:600}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{fontSize:13,fontWeight:700,color:p.color||C.accent}}>{fmtFull(Math.round(p.value))} {p.name}</div>)}
    </div>
  );
};

const StatCard = ({C,icon,label,value,sub,col,delay="0s"}) => (
  <div className="card fu" style={{animationDelay:delay,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 12px",boxShadow:C.shadowMd,position:"relative",overflow:"hidden",minWidth:0}}>
    <div style={{position:"absolute",top:-24,right:-24,width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${col}14 0%,transparent 70%)`,pointerEvents:"none"}}/>
    <div style={{width:36,height:36,borderRadius:10,background:`${col}10`,border:`1px solid ${col}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:10}}>{icon}</div>
    <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{label}</div>
    <div className="stat-num-big" style={{color:C.text}}>
      <AnimNum value={typeof value==="number"?value:0}/>
    </div>
    {sub&&<div style={{fontSize:11,color:C.textMuted,marginTop:3,lineHeight:1.3}}>{sub}</div>}
  </div>
);

const SHead = ({C,tag,title,sub}) => (
  <div style={{marginBottom:20}}>
    <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"4px 12px",borderRadius:999,background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`,fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:C.accent}}/>
      {tag}
    </div>
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
const fetchAll = async (table, columns, orderCol) => {
  const PAGE = 1000;
  let rows = [], from = 0;
  while (true) {
    let q = supabase.from(table).select(columns);
    if (orderCol) q = q.order(orderCol, { ascending: true });
    q = q.range(from, from + PAGE - 1);
    const { data, error } = await q;
    if (error) { console.error(`fetchAll error on ${table}:`, error); break; }
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
  const navigate = (destination) => {
    if (typeof destination === "number") {
      window.history.go(destination);
      return;
    }
    window.location.href = destination;
  };
  const [isDark, setIsDark] = useState(()=>{
    try{return localStorage.getItem("spa-theme")==="dark";}catch{return false;}
  });
  const C = isDark ? DARK : LIGHT;
  const toggleTheme = useCallback(()=>{
    setIsDark(v=>{const n=!v;try{localStorage.setItem("spa-theme",n?"dark":"light");}catch{}return n;});
  },[]);

  const [snapshots,    setSnapshots]    = useState([]);
  const [events,       setEvents]       = useState([]);
  const [profiles,     setProfiles]     = useState({});
  const [sportProfiles,setSportProfiles]= useState([]);
  const [activities,   setActivities]   = useState([]);
  const [eventsCount,  setEventsCount]  = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const [snaps, evts, profs, countResult, sProfs, stepLog, activityRows] = await Promise.all([
          fetchAll("daily_step_snapshots", "profile_id,day,steps,calories,distance_m,tracking_mode", "day"),
          fetchAll("step_update_events",   "recorded_at,selected_sport", "recorded_at"),
          fetchAll("profiles",             "id,username,name,surname,profile_img,country,current_country,region,level,xp,device_type", null),
          supabase.from("step_update_events").select("*", { count: "exact", head: true }),
          fetchAll("sport_profiles",       "profile_id,sport_id,trophies,lifetime_steps,league,global_rank,national_rank,regional_rank", null),
          fetchAll("step_update_log",      "profile_id,steps_added,created_at", "created_at"),
          fetchAll("activities",           "profile_id,distance_m,calories,created_at,started_at", "created_at"),
        ]);

        const effectiveSnapshots = snaps.length ? snaps : snapshotsFromStepLog(stepLog);
        const effectiveEvents = evts.length ? evts : stepLog.map(row => ({ recorded_at: row.created_at, selected_sport: "step_log" }));
        setSnapshots(effectiveSnapshots);
        setEvents(effectiveEvents);
        setEventsCount(countResult.count || effectiveEvents.length);
        setSportProfiles(sProfs);
        setActivities(activityRows);

        const map = {};
        profs.forEach(p => { map[p.id] = p; });
        setProfiles(map);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const M = useMemo(()=>{
    // A profile can have multiple sport rows carrying the same lifetime counter.
    // Use the highest counter per athlete so worldwide steps are all-time without
    // double-counting athletes who have both Track and Fitness profiles. Keep
    // returning a complete zero-value model while data is empty so slow/public
    // requests cannot leave the dashboard with a null metrics object.
    const lifetimeStepsByProfile = {};
    sportProfiles.forEach(sp => {
      if (!sp.profile_id) return;
      const lifetimeSteps = Math.max(0, Number(sp.lifetime_steps) || 0);
      lifetimeStepsByProfile[sp.profile_id] = Math.max(
        lifetimeStepsByProfile[sp.profile_id] || 0,
        lifetimeSteps
      );
    });
    const totalSteps  = Object.values(lifetimeStepsByProfile).reduce((a,steps)=>a+steps,0);
    const trackedSteps= snapshots.reduce((a,s)=>a+(s.steps||0),0);
    const snapshotCal  = snapshots.reduce((a,s)=>a+(Number(s.calories)||0),0);
    const snapshotDist = snapshots.reduce((a,s)=>a+(Number(s.distance_m)||0),0);
    const totalCal    = snapshotCal || activities.reduce((a,s)=>a+(Number(s.calories)||0),0);
    const totalDist   = snapshotDist || activities.reduce((a,s)=>a+(Number(s.distance_m)||0),0);
    const uniqueUsers = Object.keys(lifetimeStepsByProfile).length;
    const avgSteps    = snapshots.length ? Math.round(trackedSteps/snapshots.length) : 0;
    const maxSingle   = snapshots.reduce((max, snapshot) => Math.max(max, snapshot.steps || 0), 0);

    // Daily trend
    const bd={};
    snapshots.forEach(s=>{
      if(!bd[s.day]) bd[s.day]={steps:0,cal:0,users:new Set()};
      bd[s.day].steps+=s.steps||0;
      bd[s.day].cal+=s.calories||0;
      bd[s.day].users.add(s.profile_id);
    });
    const dailyTrend=Object.entries(bd).sort(([a],[b])=>a.localeCompare(b)).map(([day,d])=>({day:dayLbl(day),steps:d.steps,cal:d.cal,users:d.users.size}));

    // Leaderboard — ranked by the athlete's highest trophy total. Lifetime steps
    // remain the athlete-level maximum rather than whichever sport won the rank.
    const trophyMap = {};
    sportProfiles.forEach(sp => {
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
      .sort(([,a],[,b]) => b.trophies - a.trophies)
      .slice(0, 8)
      .map(([pid, u], i) => ({ rank: i+1, pid, ...u }));

    // Platform — only Track/Fitness users, with device breakdown
    const trackFitnessIds = new Set(
      sportProfiles.filter(sp => sp.sport_id === "Track" || sp.sport_id === "Fitness").map(sp => sp.profile_id)
    );
    const pf = {};
    let noDeviceCount = 0;
    trackFitnessIds.forEach(pid => {
      const p = profiles[pid];
      if (!p) return;
      const d = (p.device_type || "").toLowerCase().trim();
      if (!d || d === "unknown") { noDeviceCount++; return; }
      pf[d] = (pf[d] || 0) + 1;
    });
    const platformData = Object.entries(pf).map(([name, value]) => ({
      name: name[0].toUpperCase() + name.slice(1),
      value,
    }));
    const platformTotal = Object.values(pf).reduce((a, b) => a + b, 0);

    // Sports — unique athletes per sport from sport_profiles, no duplicates within each sport
    const fitnessUsers = new Set();
    const trackUsers   = new Set();
    sportProfiles.forEach(sp => {
      const sport = (sp.sport_id || "").toLowerCase().trim();
      if (sport === "fitness") fitnessUsers.add(sp.profile_id);
      if (sport === "track")   trackUsers.add(sp.profile_id);
    });
    // Calculate overlap (users in both sports)
    const bothSports = new Set([...fitnessUsers].filter(p => trackUsers.has(p))).size;
    const sportsData = [
      { name: "Fitness", count: fitnessUsers.size, icon: "🏃", color: "#0C69C8" },
      { name: "Track",   count: trackUsers.size,   icon: "🏟️", color: "#38BDF8" },
    ].filter(s => s.count > 0);

    // Hourly activity
    const hrs=Array(24).fill(0);
    events.forEach(e=>{if(e.recorded_at) hrs[new Date(e.recorded_at).getUTCHours()]++;});
    const hourlyActivity=hrs.map((count,h)=>({hour:h===0?"12am":h<12?`${h}am`:h===12?"12pm":`${h-12}pm`,count}));

    // Day of week
    const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dow=Array(7).fill(null).map((_,i)=>({day:DOW[i],steps:0,n:0}));
    snapshots.forEach(s=>{const d=new Date(s.day).getDay();dow[d].steps+=s.steps||0;dow[d].n++;});
    const dowData=dow.map(d=>({day:d.day,avg:d.n?Math.round(d.steps/d.n):0}));

    // Streak change
    const ud={};
    snapshots.forEach(s=>{if(!ud[s.profile_id]) ud[s.profile_id]=[];ud[s.profile_id].push({day:s.day,steps:s.steps});});
    let deltas=[],pairs=0;
    Object.values(ud).forEach(days=>{
      const sorted=days.sort((a,b)=>a.day.localeCompare(b.day));
      sorted.forEach((d,i)=>{if(i===0)return;const diff=(new Date(d.day)-new Date(sorted[i-1].day))/86400000;if(diff===1){deltas.push(d.steps-sorted[i-1].steps);pairs++;}});
    });
    const avgStreakChange=pairs?Math.round(deltas.reduce((a,v)=>a+v,0)/pairs):0;
    const activeIds=new Set(snapshots.map(s=>s.profile_id));

    return {
      totalSteps,totalCal,totalDist,uniqueUsers,avgSteps,maxSingle,
      avgStreakChange,
      totalEvents: eventsCount,
      pairs,activeIds,platformData,sportsData,dailyTrend,leaderboard,dowData,hourlyActivity,
      sportsOverlap: bothSports,
      platformTotal,
      noDeviceCount,
      trackFitnessTotal: trackFitnessIds.size,
      fitnessCount: fitnessUsers.size,
      trackCount: trackUsers.size,
    };
  },[snapshots,events,eventsCount,profiles,sportProfiles,activities]);

  const countryData = useMemo(()=>{
    if(!M||!Object.keys(profiles).length) return [];
    // Get all profile_ids from sport_profiles (Track and Fitness only)
    const trackFitnessIds = new Set(
      sportProfiles
        .filter(sp => sp.sport_id === "Track" || sp.sport_id === "Fitness")
        .map(sp => sp.profile_id)
    );
    const cc={};
    let missingProfiles = 0;
    let noCountryCount = 0;
    trackFitnessIds.forEach(pid=>{
      const p=profiles[pid];
      if(!p) { missingProfiles++; return; }
      const country = p.current_country || p.country || null;
      if(country){ cc[country]=(cc[country]||0)+1; }
      else { noCountryCount++; }
    });
    if(missingProfiles > 0) console.log(`countryData: ${missingProfiles} profile_ids from sport_profiles not found in profiles table`);
    return {
      countries: Object.entries(cc).sort(([,a],[,b])=>b-a).slice(0,8).map(([country,count])=>({country,count})),
      noCountryCount,
      totalWithCountry: Object.values(cc).reduce((a,b)=>a+b,0),
    };
  },[M,profiles,sportProfiles]);

  const ticker=useMemo(()=>{
    if(!M) return [];
    return[
      `🏃 ${fmtFull(M.totalSteps)} lifetime steps logged`,
      `🌍 ${M.uniqueUsers} athletes on the platform`,
      `📏 ${(M.totalDist/1000).toFixed(0)} km total distance`,
      `🔥 ${fmtFull(M.totalCal)} calories burned`,
      `⚡ ${fmtFull(M.totalEvents)} sync events captured`,
      `🏆 ${fmtFull(M.maxSingle)} steps in a single day — peak performer`,
      `📈 Consecutive days → avg ${M.avgStreakChange>0?"+":""}${fmtFull(M.avgStreakChange)} steps`,
    ];
  },[M]);

  const PIE=[C.accent,C.cyan,C.emerald,C.amber,C.rose];

  if(loading) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{makeCSS(C)}</style>
      <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.accent,animation:"spin 0.75s linear infinite"}}/>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:13,color:C.textMuted,fontWeight:600}}>Loading insights…</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{makeCSS(C)}</style>

      {/* ── HEADER ── */}
      <header style={{position:"sticky",top:0,zIndex:100,height:56,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.headerBg,backdropFilter:"blur(20px) saturate(1.2)",WebkitBackdropFilter:"blur(20px) saturate(1.2)",borderBottom:`1px solid ${C.border}`}}>
        <button onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.bgElevated,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src={logo} alt="Snows ProAm" style={{width:18,height:18,objectFit:"contain"}}/>
          </div>
          <span style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>
            <span style={{color:C.accent}}>World Wide Steps</span>
          </span>
        </button>
        <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:999,background:C.emeraldBg,border:`1px solid ${C.emeraldBorder}`,fontSize:10,fontWeight:700,color:C.emerald,letterSpacing:0.4}}>
          <div className="live-dot"/>LIVE
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="theme-toggle" onClick={toggleTheme} style={{width:32,height:32,borderRadius:8,background:C.bgElevated,border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <FontAwesomeIcon icon={isDark?faSun:faMoon} style={{fontSize:12}}/>
          </button>
          <button onClick={()=>navigate(-1)} style={{fontSize:12,fontWeight:500,color:C.textSecondary,padding:"5px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bgElevated,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ← Back
          </button>
        </div>
      </header>

      {/* ── TICKER ── */}
      {ticker.length>0&&(
        <div className="ticker-wrap" style={{background:C.accentBgSubtle,borderBottom:`1px solid ${C.accentBorder}`}}>
          <div className="ticker-inner">
            {[...ticker,...ticker].map((t,i)=>(
              <span key={i} style={{padding:"0 32px",fontSize:11,fontWeight:600,color:C.textSecondary,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:8}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:C.accent,flexShrink:0}}/>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="main-pad">

        {/* ── HERO ── */}
        <div className="fu hero-mb">
          <div className="hero-grid">
            <div>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(32px,5vw,56px)",fontWeight:900,lineHeight:1.05,letterSpacing:-1.5,color:C.text,marginBottom:16}}>
                Where <span className="grad-text">competition</span><br/>drives movement.
              </h1>
              <p style={{fontSize:"clamp(14px,2.5vw,16px)",lineHeight:1.75,color:C.textSecondary,maxWidth:460,marginBottom:28}}>
                Real athletes. Real steps. The leaderboard creates curiosity, curiosity creates consistency, and consistency becomes identity.
              </p>
              <div className="hero-pills">
                {[
                  {icon:"🔥",text:`${M?.uniqueUsers} active athletes`,col:C.amber},
                  {icon:"📈",text:`${fmtFull(M?.totalSteps)} lifetime steps`,col:C.accent},
                  {icon:"⚡",text:`${fmtFull(M?.totalEvents)} sync events`,col:C.cyan},
                ].map(p=>(
                  <div key={p.text} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:10,background:C.bgCard,border:`1px solid ${C.border}`,fontSize:12,fontWeight:600,boxShadow:C.shadowMd}}>
                    <span>{p.icon}</span><span style={{color:p.col}}>{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <Globe C={C} totalSteps={M?.totalSteps||0} activeUsers={M?.uniqueUsers||0} totalKm={M?.totalDist||0}/>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="stat-grid section-mb">
          <StatCard C={C} icon="👣" label="Lifetime Steps" value={M?.totalSteps||0}                   sub={`across ${M?.uniqueUsers} athletes`} col={C.accent}  delay="0s"/>
          <StatCard C={C} icon="🔥" label="Calories"     value={M?.totalCal||0}                     sub="total burned"                        col={C.amber}   delay="0.05s"/>
          <StatCard C={C} icon="📏" label="Kilometres"   value={Math.round((M?.totalDist||0)/1000)} sub="total distance"                      col={C.emerald} delay="0.10s"/>
          <StatCard C={C} icon="⚡" label="Sync Events"  value={M?.totalEvents||0}                  sub="tracking hits"                       col={C.cyan}    delay="0.15s"/>
          <StatCard C={C} icon="🏆" label="Peak Day"     value={M?.maxSingle||0}                    sub="single athlete"                      col={C.rose}    delay="0.20s"/>
          <StatCard C={C} icon="📆" label="Avg/Day"      value={M?.avgSteps||0}                     sub="per recorded entry"                  col={C.accent}  delay="0.25s"/>
        </div>

        {/* ── DAILY TREND ── */}
        <section className="section-mb fu2">
          <SHead C={C} tag="Activity Timeline" title="Steps tracked daily" sub="Each spike tells a story — watch how group energy ripples on competition days."/>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"20px 12px",boxShadow:C.shadowMd}}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={M?.dailyTrend||[]} margin={{top:5,right:5,bottom:5,left:0}}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.35}/>
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fill:C.textMuted,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)} width={38}/>
                <Tooltip content={p=><ChartTip {...p} C={C}/>}/>
                <Area type="monotone" dataKey="steps" name="steps" stroke={C.accent} strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{r:5,fill:C.accent,stroke:C.bg,strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>

            <div style={{marginTop:16,padding:"14px 14px",borderRadius:12,background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:15}}>💡</span>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>The Leaderboard Effect</div>
              </div>
              <div className="effect-grid">
                {(()=>{
                  const activeCount = Object.keys(profiles).filter(pid=>{
                    const days=snapshots.filter(s=>s.profile_id===pid).map(s=>s.day);
                    const weeks={};
                    days.forEach(d=>{
                      const week=`${new Date(d).getFullYear()}-W${Math.ceil(new Date(d).getDate()/7)}`;
                      if(!weeks[week]) weeks[week]=0;
                      weeks[week]++;
                    });
                    return Object.values(weeks).some(count=>count>=3);
                  }).length;
                  const activePct=M?.uniqueUsers?Math.round((activeCount/M.uniqueUsers)*100):0;

                  const improvements=[];
                  Object.keys(profiles).forEach(pid=>{
                    const days=snapshots.filter(s=>s.profile_id===pid).sort((a,b)=>a.day.localeCompare(b.day));
                    if(days.length<7) return;
                    const firstWeekAvg=days.slice(0,7).reduce((a,s)=>a+s.steps,0)/7;
                    const lastWeekAvg=days.slice(-7).reduce((a,s)=>a+s.steps,0)/7;
                    if(firstWeekAvg>0) improvements.push(((lastWeekAvg-firstWeekAvg)/firstWeekAvg)*100);
                  });
                  const avgImprovement=improvements.length?Math.round(improvements.reduce((a,v)=>a+v,0)/improvements.length):0;

                  let bestStreak=0,bestStreakPid=null;
                  Object.keys(profiles).forEach(pid=>{
                    const days=snapshots.filter(s=>s.profile_id===pid).map(s=>s.day).sort();
                    let streak=1,max=1;
                    for(let i=1;i<days.length;i++){const diff=(new Date(days[i])-new Date(days[i-1]))/86400000;if(diff===1){streak++;max=Math.max(max,streak);}else{streak=1;}}
                    if(max>bestStreak){bestStreak=max;bestStreakPid=pid;}
                  });
                  const streakProfile=bestStreakPid?profiles[bestStreakPid]:null;
                  const streakName=streakProfile?[streakProfile.name,streakProfile.surname].filter(Boolean).join(" ")||streakProfile.username:"Unknown";

                  const topDay=snapshots.reduce((best,s)=>(s.steps||0)>(best?.steps||0)?s:best,null);
                  const topDayProfile=topDay?profiles[topDay.profile_id]:null;
                  const topDayName=topDayProfile?[topDayProfile.name,topDayProfile.surname].filter(Boolean).join(" ")||topDayProfile.username:"Unknown";

                  const cards=[
                    {icon:"🎯",label:"Training Consistency",stat:`${activePct}%`,sub:"athletes log 3+ days/week",col:C.accent},
                    {icon:"📈",label:"Platform Progress",stat:avgImprovement>=0?`+${avgImprovement}%`:`${Math.abs(avgImprovement)}%`,sub:avgImprovement>=0?"more steps vs when joined":"fewer steps vs when joined",col:avgImprovement>=0?C.emerald:C.rose},
                    {icon:"🔥",label:"Top Streak",stat:`${bestStreak} days`,sub:streakName,col:C.amber},
                    {icon:"👑",label:"Best Single Day",stat:fmtFull(topDay?.steps||0),sub:`${topDayName} — ${topDay?new Date(topDay.day).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}`,col:C.rose},
                  ];

                  return cards.map(card=>(
                    <div key={card.label} style={{borderRadius:14,padding:"16px",position:"relative",overflow:"hidden",background:C.bgCard,border:`1px solid ${card.col}40`,boxShadow:C.shadowMd}}>
                      <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${card.col}14 0%,transparent 70%)`,pointerEvents:"none"}}/>
                      <div style={{width:36,height:36,borderRadius:10,background:`${card.col}10`,border:`1px solid ${card.col}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:10}}>{card.icon}</div>
                      <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{card.label}</div>
                      <div style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(20px,3vw,26px)",fontWeight:800,color:C.text,letterSpacing:-0.5,marginBottom:3}}>{card.stat}</div>
                      <div style={{fontSize:11,color:C.textMuted,marginTop:2,lineHeight:1.3}}>{card.sub}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* ── LEADERBOARD ── */}
        <section className="section-mb fu3">
          <SHead C={C} tag="Top Athletes" title="Leading the pack" sub="The athletes driving the culture. Every rank checked is a step taken tomorrow."/>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden",boxShadow:C.shadowMd}}>
            <div className="lb-table-head" style={{padding:"11px 16px",background:C.bgAlt,borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.4}}>
              <div>#</div>
              <div>Athlete</div>
              <div style={{textAlign:"right"}}>Trophies</div>
              <div className="lb-hide-mobile" style={{textAlign:"right"}}>Lifetime Steps</div>
              <div className="lb-hide-mobile" style={{textAlign:"right"}}>League</div>
            </div>
            {(M?.leaderboard||[]).map((u,i)=>{
              const profile=profiles[u.pid];
              const maxT=M.leaderboard[0]?.trophies||1;
              const pct=Math.round((u.trophies/maxT)*100);
              const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
              const rowCol=i===0?C.amber:i===1?"#94A3B8":i===2?"#C97B3A":C.accent;
              const displayName=profile?[profile.name,profile.surname].filter(Boolean).join(" ")||profile.username||`@${u.pid.slice(0,8)}`:`@${u.pid.slice(0,8)}`;
              const username=profile?.username?`@${profile.username}`:null;
              const country=profile?.country||profile?.current_country||null;
              return(
                <div key={u.pid} className="lb-table-row" style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:i===0?`${C.amber}05`:"transparent",transition:"background 0.15s ease"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:i<3?`${rowCol}18`:C.bgAlt,border:`1px solid ${i<3?rowCol+"30":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:medal?13:11,fontWeight:800,color:rowCol}}>
                    {medal||u.rank}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                    <Avatar profile={profile} C={C} size={32}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"120px"}}>{displayName}</span>
                        {country&&<FlagImg country={country} size={14}/>}
                        {profile?.level&&(
                          <span style={{fontSize:9,fontWeight:700,color:C.accent,padding:"1px 5px",borderRadius:999,background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`,whiteSpace:"nowrap"}}>Lv {profile.level}</span>
                        )}
                      </div>
                      {username&&<div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginBottom:4}}>{username}</div>}
                      <div style={{height:3,borderRadius:99,background:C.bgAlt,overflow:"hidden"}}>
                        <div className="bar-fill" style={{height:"100%",width:`${pct}%`,background:C.accentGrad,borderRadius:99}}/>
                      </div>
                    </div>
                  </div>
                  {/* Trophies */}
                  <div style={{textAlign:"right",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:800,color:i<3?rowCol:C.text}}>
                    🏆 {fmtFull(u.trophies)}
                  </div>
                  {/* Lifetime Steps */}
                  <div className="lb-hide-mobile" style={{textAlign:"right",fontSize:12,fontWeight:600,color:C.textSecondary}}>
                    {fmt(u.lifetimeSteps)}
                  </div>
                  {/* League */}
                  <div className="lb-hide-mobile" style={{textAlign:"right",fontSize:12,fontWeight:600,color:C.textSecondary}}>
                    L{u.league}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3-COL ── */}
        <div className="three-col section-mb fu4">
          {/* Weekly rhythm */}
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 18px",boxShadow:C.shadowMd}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Weekly Rhythm</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>Avg steps by weekday</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={M?.dowData||[]} margin={{top:0,right:0,bottom:0,left:0}}>
                <XAxis dataKey="day" tick={{fill:C.textMuted,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip content={p=><ChartTip {...p} C={C}/>}/>
                <Bar dataKey="avg" name="avg steps" radius={[5,5,0,0]}>
                  {(M?.dowData||[]).map((entry,i)=>{
                    const maxA=Math.max(...(M?.dowData||[]).map(d=>d.avg));
                    return<Cell key={i} fill={entry.avg===maxA?C.accent:C.accentBgLight}/>;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platforms — from profiles.device_type, unique users */}
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 18px",boxShadow:C.shadowMd}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.cyan,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Platforms</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>Device breakdown</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <PieChart width={140} height={140}>
                <Pie data={M?.platformData||[]} cx={65} cy={65} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {(M?.platformData||[]).map((_,i)=><Cell key={i} fill={PIE[i%PIE.length]} stroke="none"/>)}
                </Pie>
                <Tooltip content={p=><ChartTip {...p} C={C}/>}/>
              </PieChart>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {(M?.platformData||[]).map((p,i)=>{
                const pct=M.platformTotal?Math.round((p.value/M.platformTotal)*100):0;
                return(
                  <div key={p.name} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:PIE[i],flexShrink:0}}/>
                    <span style={{flex:1,fontSize:12,fontWeight:600,color:C.textSecondary}}>{p.name}</span>
                    <span style={{fontSize:12,fontWeight:800,color:C.text}}>{pct}%</span>
                    <span style={{fontSize:11,color:C.textMuted}}>({p.value})</span>
                  </div>
                );
              })}
              {M?.noDeviceCount > 0 && (
                <div style={{fontSize:10,color:C.textMuted,textAlign:"center",marginTop:4}}>
                  + {M.noDeviceCount} without device info
                </div>
              )}
              <div style={{fontSize:11,color:C.textSecondary,textAlign:"center",marginTop:6,fontWeight:600}}>
                Total: {M.platformTotal + (M.noDeviceCount || 0)} Track/Fitness athletes
              </div>
            </div>
          </div>

          {/* Sport activity — unique athletes per sport from sport_profiles */}
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 18px",boxShadow:C.shadowMd}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.emerald,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Sport Activity</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>Track vs Fitness</div>
            </div>
            {(M?.sportsData||[]).length>0?(
              <>
                <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
                  {(M?.sportsData||[]).map(s=>{
                    const max=Math.max(...(M?.sportsData||[]).map(d=>d.count))||1;
                    const pct=Math.round((s.count/max)*100);
                    return(
                      <div key={s.name}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:18}}>{s.icon}</span>
                            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{s.name}</span>
                          </div>
                          <span style={{fontSize:12,fontWeight:800,color:C.text}}>{fmtFull(s.count)} athletes</span>
                        </div>
                        <div style={{height:7,borderRadius:99,background:C.bgAlt}}>
                          <div style={{height:"100%",width:`${pct}%`,background:C.accentGrad,borderRadius:99,transition:"width 1.2s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                  {M?.sportsOverlap > 0 && (
                    <div style={{fontSize:11,color:C.textMuted,textAlign:"center",marginTop:4}}>
                      {M.sportsOverlap} athlete{M.sportsOverlap !== 1 ? 's' : ''} in both sports
                    </div>
                  )}
                  <div style={{fontSize:11,color:C.textSecondary,textAlign:"center",marginTop:8,fontWeight:600}}>
                    Total: {M.fitnessCount + M.trackCount - (M.sportsOverlap || 0)} unique athletes
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                  <PieChart width={110} height={110}>
                    <Pie data={M?.sportsData||[]} cx={50} cy={50} innerRadius={32} outerRadius={50} paddingAngle={4} dataKey="count">
                      {(M?.sportsData||[]).map((s,i)=><Cell key={i} fill={s.color} stroke="none"/>)}
                    </Pie>
                    <Tooltip content={p=><ChartTip {...p} C={C}/>}/>
                  </PieChart>
                </div>
              </>
            ):(
              <div style={{fontSize:13,color:C.textMuted,textAlign:"center",padding:"24px 0"}}>No sport data yet</div>
            )}
          </div>
        </div>

        {/* ── COUNTRY ── */}
        {countryData.countries && countryData.countries.length > 0 && (
          <section className="section-mb fu4">
            <SHead C={C} tag="Global Reach" title="Where our athletes are" sub="Communities forming across countries — every flag represents real people moving."/>
            <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 18px",boxShadow:C.shadowMd}}>
              <div className="country-grid">
                {countryData.countries.map((c,i)=>{
                  const max=countryData.countries[0]?.count||1;
                  const pct=Math.round((c.count/max)*100);
                  return(
                    <div key={c.country} className="card" style={{padding:"14px 16px",borderRadius:14,background:C.bgAlt,border:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                          <FlagImg country={c.country} size={22}/>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.country}</div>
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:500}}>{c.count} athlete{c.count!==1?"s":""}</div>
                          </div>
                        </div>
                        {i===0&&<span style={{fontSize:9,fontWeight:700,color:C.accent,padding:"2px 6px",borderRadius:999,background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`,flexShrink:0}}>#1</span>}
                      </div>
                      <div style={{height:3,borderRadius:99,background:C.border}}>
                        <div style={{height:"100%",width:`${pct}%`,background:C.accentGrad,borderRadius:99,transition:"width 1.2s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {countryData.noCountryCount > 0 && (
                <div style={{fontSize:10,color:C.textMuted,textAlign:"center",marginTop:12}}>
                  + {countryData.noCountryCount} athletes without country set
                </div>
              )}
              <div style={{fontSize:11,color:C.textSecondary,textAlign:"center",marginTop:6,fontWeight:600}}>
                Total: {countryData.totalWithCountry + (countryData.noCountryCount || 0)} Track/Fitness athletes
              </div>
            </div>
          </section>
        )}

        {/* ── HOURLY ── */}
        <section className="section-mb fu5">
          <SHead C={C} tag="Engagement Patterns" title="When athletes are most active" sub="Peak sync times reveal when athletes check the leaderboard and push for more steps."/>
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 14px",boxShadow:C.shadowMd}}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={M?.hourlyActivity||[]} margin={{top:5,right:5,bottom:5,left:0}}>
                <XAxis dataKey="hour" tick={{fill:C.textMuted,fontSize:9,fontWeight:600}} axisLine={false} tickLine={false} interval={2}/>
                <YAxis hide/>
                <Tooltip content={p=><ChartTip {...p} C={C}/>}/>
                <Bar dataKey="count" name="syncs" radius={[4,4,0,0]}>
                  {(M?.hourlyActivity||[]).map((entry,i)=>{
                    const maxC=Math.max(...(M?.hourlyActivity||[]).map(h=>h.count));
                    const int=maxC?entry.count/maxC:0;
                    return<Cell key={i} fill={int>0.7?C.accent:int>0.4?C.accentBgLight:C.accentBgSubtle}/>;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="hourly-pills">
              {[
                {icon:"🌅",label:"Morning rush",time:"6–9am",color:C.amber},
                {icon:"☀️",label:"Lunchtime peak",time:"12–2pm",color:C.emerald},
                {icon:"🌆",label:"Evening check-in",time:"7–10pm",color:C.accent},
              ].map(h=>(
                <div key={h.label} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 14px",borderRadius:11,background:C.bgAlt,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:15}}>{h.icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text}}>{h.label}</div>
                    <div style={{fontSize:10,color:h.color,fontWeight:600}}>{h.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING ── */}
        <section className="fu5">
          <div style={{borderRadius:24,padding:"clamp(28px,5vw,48px)",background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`,boxShadow:C.shadowGlow}}>
            <div style={{maxWidth:680,margin:"0 auto",textAlign:"center"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:999,background:C.accentBgLight,border:`1px solid ${C.accentBorder}`,fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:0.5,marginBottom:20}}>
                📊 The Insight
              </div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(24px,4vw,36px)",fontWeight:900,letterSpacing:-0.8,color:C.text,marginBottom:16,lineHeight:1.2}}>
                Competition creates <span className="grad-text">curiosity</span>.<br/>
                Curiosity creates <span className="grad-text">consistency</span>.
              </h2>
              <p style={{fontSize:"clamp(13px,2vw,15px)",lineHeight:1.75,color:C.textSecondary,marginBottom:28}}>
                Athletes on Snows ProAm don't just track steps — they benchmark themselves against peers, get curious about the leaderboard, and come back the next day to improve.
              </p>
              <div className="closing-stats">
                {[
                  {v:`${M?.uniqueUsers}+`,l:"Tracked athletes"},
                  {v:fmt(M?.totalSteps||0),l:"Lifetime steps logged"},
                  {v:`${((M?.totalDist||0)/1000).toFixed(0)}km`,l:"Distance covered"},
                  {v:String(countryData.countries?.length||0),l:"Countries active"},
                ].map(s=>(
                  <div key={s.l} className="closing-stat-item" style={{background:C.bgCard,border:`1px solid ${C.border}`,boxShadow:C.shadowMd}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(20px,3vw,26px)",fontWeight:900,color:C.accent}}>{s.v}</div>
                    <div style={{fontSize:11,fontWeight:600,color:C.textMuted,marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{marginTop:24,padding:"18px 20px",background:C.accentBgSubtle,border:`1px solid ${C.accentBorder}`,borderRadius:14,fontSize:13,color:C.textSecondary,lineHeight:1.65,textAlign:"center"}}>
            <div style={{fontWeight:700,color:C.text,marginBottom:4}}>Questions?</div>
            <a href="mailto:support@snowsproam.com" style={{color:C.accent,fontWeight:600}}>support@snowsproam.com</a>
          </div>
        </section>

      </div>
    </div>
  );
}
