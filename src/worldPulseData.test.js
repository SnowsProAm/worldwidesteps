import test from "node:test";
import assert from "node:assert/strict";
import { buildPulseHours, pulseCountries } from "./worldPulseData.js";

test("hourly pulse aligns countries to the same UTC hours and fills missing hours", () => {
  const rows = [
    { bucket_start: "2026-10-11T16:00:00Z", country: null, steps: 150, athletes: 5 },
    { bucket_start: "2026-10-11T16:00:00Z", country: "Ireland", steps: 100, athletes: 3 },
    { bucket_start: "2026-10-10T17:00:00Z", country: "Ireland", steps: 20, athletes: 2 },
    { bucket_start: "2026-10-10T16:00:00Z", country: "Ireland", steps: 999, athletes: 1 },
  ];
  const now = "2026-10-11T16:42:00Z";
  const world = buildPulseHours(rows, "", now);
  const ireland = buildPulseHours(rows, "Ireland", now);

  assert.equal(world.length, 24);
  assert.equal(world[0].date.toISOString(), "2026-10-10T17:00:00.000Z");
  assert.equal(world[0].steps, 0);
  assert.equal(world[23].steps, 150);
  assert.equal(ireland[0].steps, 20);
  assert.equal(ireland[23].steps, 100);
  assert.equal(ireland.reduce((sum, hour) => sum + hour.steps, 0), 120);
});

test("country filter lists only countries returned by the pulse", () => {
  assert.deepEqual(pulseCountries([
    { country: null }, { country: "Ireland" }, { country: "Brazil" }, { country: "Ireland" },
  ]), ["Brazil", "Ireland"]);
});
