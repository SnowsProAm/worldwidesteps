import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChallenge, filterSchools, rankMovements, safeLogo } from './schoolChallengeData.js';

const school = (id, name, steps, county = 'Dublin') => ({ id, name, total_steps: steps, county });
const normalize = schools => normalizeChallenge({ schools, students: [] });

test('sorts totals numerically, preserves tied national ranks and includes zero-step schools', () => {
  const result = normalize([school('d', 'New school', 0), school('a', 'Zebra', '99'), school('b', 'Abbey', '100'), school('c', 'Cavan', 99)]);
  assert.deepEqual(result.schools.map(s => [s.id, s.rank]), [['b', 1], ['c', 2], ['a', 2], ['d', 4]]);
  assert.equal(result.totalSteps, 298);
});
test('county and accent-insensitive search retain national rank', () => {
  const { schools } = normalize([school('a', 'Abbey', 100), school('b', 'Coláiste Cholmcille', 50, 'Donegal')]);
  assert.equal(filterSchools(schools, 'colaiste', 'Donegal')[0].rank, 2);
  assert.equal(filterSchools(schools, 'Coláiste', 'Dublin').length, 0);
  assert.equal(filterSchools(schools, 'donegal', '').length, 1);
});
test('rank changes describe actual movements and do not invent movements for new schools', () => {
  const before = normalize([school('a', 'A', 100), school('b', 'B', 90)]).schools;
  const after = normalize([school('a', 'A', 100), school('b', 'B', 120), school('c', 'C', 1)]).schools;
  assert.deepEqual(rankMovements(before, after), { b: 1, a: -1 });
});
test('public model only keeps permitted display fields and safe images', () => {
  const result = normalize([{ ...school('a', 'A', 10), access_code: 'PRIVATE', email: 'private@example.test', profile_id: 'private-id', logo_url: 'javascript:alert(1)', top_student: { alias: 'Walker ABC123', steps: 4, profile_id: 'private-id', name: 'Private name' } }]);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE|private-id|Private name|example.test/);
  assert.equal(result.schools[0].logo_url, null);
  assert.equal(safeLogo('https://media.snowsproam.com/crest.png'), 'https://media.snowsproam.com/crest.png');
});
test('invalid data is an error, while a valid empty competition is an empty state', () => {
  assert.throws(() => normalizeChallenge(null));
  assert.throws(() => normalizeChallenge({ schools: [] }));
  assert.equal(normalize([]).totalSteps, 0);
});

test('national prizes keep multiple students from the same school and actual public identity', () => {
  const students = [1,2,3].map(n => ({ alias: `Walker ${n}`, display_name: `student${n}`, avatar_url: n === 3 ? 'javascript:bad()' : 'https://media.snowsproam.com/avatar.png', school_id: 'same-school', school_name: 'School', rank: n, steps: 100-n, email: 'hidden@test.invalid' }));
  const result = normalizeChallenge({ schools: [], students });
  assert.equal(result.students.length, 3);
  assert.deepEqual(result.students.map(s => s.display_name), ['student1','student2','student3']);
  assert.equal(result.students[0].avatar_url, students[0].avatar_url);
  assert.equal(result.students[2].avatar_url, null);
  assert.ok(result.students.every(s => s.school_id === 'same-school'));
  assert.doesNotMatch(JSON.stringify(result), /hidden@test/);
});
