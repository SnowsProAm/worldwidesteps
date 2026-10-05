import { test } from 'node:test';
import assert from 'node:assert/strict';
import { walkingLeg, walkingGroupSteps, runningStepTotal, GROUP_ARRIVAL_STEPS } from './schoolWalkMotion.js';
test('planted feet stay fixed on the pavement as the body advances',()=>{for(const speed of [48,68,75]){const a=walkingLeg(.08,speed),b=walkingLeg(.18,speed);assert.equal(a.planted,true);assert.equal(b.planted,true);assert.ok(Math.abs((speed*.08+a.x)-(speed*.18+b.x))<1e-8);assert.equal(a.y,b.y);}});
test('the other part of the stride lifts the foot and bends the knee',()=>{const p=walkingLeg(.62,68);assert.equal(p.planted,false);assert.ok(p.y<87);assert.ok(Number.isFinite(p.kneeX)&&Number.isFinite(p.kneeY));});

test('all seven students contribute and the display never falls as they arrive or the scene repeats',()=>{
  let previous=0,carried=0,last=0;
  for(const time of [0,8,12,17,21,25,0,8,12]){
    const cycle=walkingGroupSteps(time,700,54);
    const next=runningStepTotal(previous,cycle,carried);
    assert.ok(next.total>=last);
    previous=cycle;carried=next.carried;last=next.total;
  }
  assert.ok(last>walkingGroupSteps(25,700,54));
});
test('the seven walkers reach the collective arrival total on every viewport journey',()=>{
  for (const [distance,speed] of [[178,34],[700,54],[1100,54]]) {
    assert.equal(walkingGroupSteps(8,distance,speed)>0,true);
    assert.equal(walkingGroupSteps(10+distance/speed,distance,speed),GROUP_ARRIVAL_STEPS);
  }
});
