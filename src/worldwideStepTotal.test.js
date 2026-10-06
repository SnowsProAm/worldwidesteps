import test from "node:test";
import assert from "node:assert/strict";
import { worldwideStepTotal } from "./worldwideStepTotal.js";

test("worldwide total counts each Fitness athlete's highest lifetime steps", () => {
  assert.equal(worldwideStepTotal([
    { profile_id: "a", sport_id: "Fitness", lifetime_steps: 120 },
    { profile_id: "a", sport_id: "Fitness", lifetime_steps: 100 },
    { profile_id: "b", sport_id: "Fitness", lifetime_steps: "45" },
    { profile_id: "c", sport_id: "Running", lifetime_steps: 500 },
    { profile_id: "d", sport_id: "Fitness", lifetime_steps: -10 },
  ]), 165);
});

test("a refreshed Fitness roster includes updated steps and new athletes", () => {
  const before = [{ profile_id: "a", sport_id: "Fitness", lifetime_steps: 120 }];
  const after = [
    { profile_id: "a", sport_id: "Fitness", lifetime_steps: 140 },
    { profile_id: "b", sport_id: "Fitness", lifetime_steps: 35 },
  ];
  assert.equal(worldwideStepTotal(before), 120);
  assert.equal(worldwideStepTotal(after), 175);
});
