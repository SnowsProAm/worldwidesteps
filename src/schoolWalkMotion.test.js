import { test } from 'node:test';
import assert from 'node:assert/strict';
import { walkingLeg } from './schoolWalkMotion.js';
test('planted feet stay fixed on the pavement as the body advances',()=>{for(const speed of [48,68,75]){const a=walkingLeg(.08,speed),b=walkingLeg(.18,speed);assert.equal(a.planted,true);assert.equal(b.planted,true);assert.ok(Math.abs((speed*.08+a.x)-(speed*.18+b.x))<1e-8);assert.equal(a.y,b.y);}});
test('the other part of the stride lifts the foot and bends the knee',()=>{const p=walkingLeg(.62,68);assert.equal(p.planted,false);assert.ok(p.y<87);assert.ok(Number.isFinite(p.kneeX)&&Number.isFinite(p.kneeY));});
