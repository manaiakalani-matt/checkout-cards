import test from 'node:test';
import assert from 'node:assert/strict';
import {routes} from '../routes.js';
import {scores,points,steps,matchingRoutes,selectScores,validateBackup} from '../logic.js';
const all={min:2,max:170,finish:'',darts:'',progress:'all'};
test('all 151 chart routes plus 38 basic routes are valid double-out finishes',()=>{
  assert.equal(routes.filter(r=>r.source==='chart').length,151);
  assert.equal(scores.length,162);
  const unique=new Set();
  for(const route of routes){
    assert.ok(route.segments.length>=1&&route.segments.length<=3);
    assert.match(route.segments.at(-1),/^D(?:B|\d+)$/);
    assert.equal(route.segments.reduce((s,x)=>s+points(x),0),route.score,JSON.stringify(route));
    assert.ok(steps(route).every(s=>s.remaining>=2));
    const key=`${route.score}:${route.segments.join(',')}`;assert.ok(!unique.has(key),key);unique.add(key);
  }
  for(const bogey of [169,168,166,165,163,162,159])assert.ok(!scores.includes(bogey));
});
test('170 has two treble twenties and bull, without a trailing zero',()=>{
  assert.deepEqual(steps(matchingRoutes(170,all)[0]),[{remaining:170,segment:'T20',points:60},{remaining:110,segment:'T20',points:60},{remaining:50,segment:'DB',points:50}]);
});
test('65 retains all three distinct chart routes, including all in two dart mode',()=>{
  assert.deepEqual(matchingRoutes(65,{...all,darts:'2'}).map(r=>r.segments),[['SB','D20'],['T11','D16'],['T15','D10']]);
});
test('filters combine range, exact darts, finishing double, and mastery',()=>{
  const f={...all,min:60,max:70,darts:'2',finish:'D16',progress:'learning'};
  assert.deepEqual(selectScores(f,[]),[65,62]);assert.deepEqual(selectScores(f,[65]),[62]);
  assert.deepEqual(selectScores({...f,progress:'mastered'},[65]),[65]);
  assert.equal(matchingRoutes(95,{...all,darts:'2'}).length,1);
  assert.equal(matchingRoutes(110,{...all,darts:'2'})[0].segments.at(-1),'DB');
});
test('backup validation accepts only recognised scores and versions',()=>{
  assert.deepEqual(validateBackup({app:'checkout-cards',version:1,mastered:[65,65,170]}),[65,170]);
  for(const bad of [null,{}, {app:'checkout-cards',version:1,mastered:[169]}, {app:'checkout-cards',version:1,mastered:['65']}])assert.throws(()=>validateBackup(bad));
});
