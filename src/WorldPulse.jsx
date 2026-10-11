import React, { useEffect, useMemo, useState } from "react";
import { buildPulseHours, pulseCountries } from "./worldPulseData.js";
import "./worldPulse.css";

const hourLabel = (date, timeZone) => new Intl.DateTimeFormat("en-IE", {
  hour: "numeric", minute: "2-digit", hour12: true, timeZone,
}).format(date);
const dayLabel = (date, timeZone) => new Intl.DateTimeFormat("en-IE", {
  weekday: "short", timeZone,
}).format(date);

const number = (value) => Math.max(0, Number(value) || 0).toLocaleString("en-IE");
const axisHours = [0, 6, 12, 18, 23];

export default function WorldPulse({ rows = [], loading = false, error = false, onRetry, updatedAt }) {
  const [country, setCountry] = useState("");
  const [selectedHour, setSelectedHour] = useState(23);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const countries = useMemo(() => pulseCountries(rows), [rows]);
  useEffect(() => {
    if (country && !countries.includes(country)) {
      setCountry("");
      setSelectedHour(23);
    }
  }, [countries, country]);
  const hours = useMemo(() => buildPulseHours(rows, country, clock), [clock, country, rows]);

  const total = hours.reduce((sum, hour) => sum + hour.steps, 0);
  const peak = Math.max(1, ...hours.map((hour) => hour.steps));
  const peakHour = hours.reduce((best, hour) => hour.steps > best.steps ? hour : best, hours[0]);
  const current = hours[23];
  const inspected = hours[selectedHour];
  const focusName = country || "Worldwide";
  const displayZone = country === "Ireland" ? "Europe/Dublin" : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const timeContext = country === "Ireland" ? "Ireland time" : "your time";
  const currentTime = hourLabel(new Date(clock), displayZone);
  const selectedTime = `${dayLabel(inspected.date, displayZone)} ${hourLabel(inspected.date, displayZone)}`;
  const peakTime = `${dayLabel(peakHour.date, displayZone)} ${hourLabel(peakHour.date, displayZone)}`;
  const hasData = rows.length > 0;
  const unavailable = !hasData && (loading || error);

  return (
    <section className="world-pulse" aria-labelledby="world-pulse-title">
      <div className="world-pulse-grain" aria-hidden="true" />
      <div className="world-pulse-inner">
        <div className="world-pulse-topline">
          <div>
            <h2 id="world-pulse-title">A day of steps, together.</h2>
            <p>Follow tracked steps around the world, hour by hour. Each bar covers the same hour everywhere.</p>
          </div>
          <label className="world-pulse-filter">
            <span>Focus on a country</span>
            <select value={country} onChange={(event) => { setCountry(event.target.value); setSelectedHour(23); }}>
              <option value="">Worldwide</option>
              {countries.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        </div>

        <div className="world-pulse-stage">
          <div className="world-pulse-main-number">
            <span className="world-pulse-number-label">{focusName} · last 24 hours</span>
            <strong className="world-pulse-number" key={`${country}:${total}`}>{unavailable ? "—" : number(total)}</strong>
            <span className="world-pulse-number-unit">steps tracked</span>
          </div>
          <div className="world-pulse-orbit" aria-hidden="true"><span /><span /><span /></div>
          <div className="world-pulse-metrics">
            <div className="world-pulse-metric"><strong>{unavailable ? "—" : number(current.steps)}</strong><span>steps tracked this hour</span></div>
            <div className="world-pulse-metric"><strong>{unavailable ? "—" : number(current.athletes)}</strong><span>athletes adding steps this hour</span></div>
            <div className="world-pulse-metric"><strong>{unavailable ? "—" : number(peakHour.steps)}</strong><span>steps in the busiest hour</span></div>
          </div>
        </div>

        <div className="world-pulse-clockline">
          <span>Tracked steps each hour</span>
          <span>Now {currentTime} · {timeContext}</span>
        </div>

        {loading && !hasData ? (
          <div className="world-pulse-state" role="status">Loading the last 24 hours…</div>
        ) : error && !hasData ? (
          <div className="world-pulse-state" role="alert">Hourly activity is unavailable. <button type="button" onClick={onRetry}>Try again</button></div>
        ) : !hasData ? (
          <div className="world-pulse-state" role="status">No tracked steps in the last 24 hours yet. Check back soon.</div>
        ) : (
          <>
            <div className="world-pulse-chart">
              <div className="world-pulse-bars" role="img" aria-label={`${focusName}: ${number(total)} steps tracked in the last 24 hours. Busiest hour ${peakTime}, ${timeContext}, with ${number(peakHour.steps)} steps.`}
                onClick={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setSelectedHour(Math.min(23, Math.max(0, Math.floor((event.clientX - bounds.left) / bounds.width * 24))));
                }}>
                {hours.map((hour, index) => (
                  <div className={`world-pulse-bar-track${index === selectedHour ? " is-selected" : ""}${index === 23 ? " is-current" : ""}`} key={hour.date.toISOString()}>
                    <div className="world-pulse-bar" style={{ height: `${hour.steps > 0 ? Math.max(5, hour.steps / peak * 100) : 2}%` }} />
                  </div>
                ))}
              </div>
              <input className="world-pulse-scrubber" type="range" min="0" max="23" value={selectedHour} onChange={(event) => setSelectedHour(Number(event.target.value))}
                aria-label="Explore hourly steps" aria-valuetext={`${selectedTime}, ${timeContext}: ${number(inspected.steps)} steps tracked by ${number(inspected.athletes)} athletes`} />
            </div>
            <div className="world-pulse-axis" aria-hidden="true">{axisHours.map((index) => <span key={index}>{index === 23 ? "Now" : `${dayLabel(hours[index].date, displayZone)} ${hourLabel(hours[index].date, displayZone)}`}</span>)}</div>
            <div className="world-pulse-inspection" aria-live="polite">
              <strong>{selectedTime} · {timeContext}</strong>
              <span>{number(inspected.steps)} steps · {number(inspected.athletes)} athletes</span>
            </div>
          </>
        )}
        <div className="world-pulse-footnote">
          <span>Tracked steps appear when they sync to Snows ProAm, sometimes after a walk. Country views show after three athletes track steps.</span>
          <span>{updatedAt ? `Updated ${hourLabel(updatedAt, displayZone)} ${timeContext}` : "Updates every minute"}{error && hasData ? " · Showing the last available data" : ""}</span>
        </div>
      </div>
    </section>
  );
}
