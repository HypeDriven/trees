import assert from 'node:assert/strict';
import {BARK_PROFILES,woodTube} from '../dist/wood.mjs';
import {SPECIES,buildSpecimen} from '../dist/botany.mjs';
const spans={};
for(const type of Object.keys(SPECIES)){
 let min=Infinity,max=-Infinity,count=0,bent=0;const radius=type==='monkeytail'?.024:.16,mesh={preview:{push(){}},v(p,n,c,k){count++;assert(p.every(Number.isFinite)&&n.every(Number.isFinite));if(k<.1){const radial=Math.hypot(p[0],p[2]);min=Math.min(min,radial);max=Math.max(max,radial);if(Math.abs((p[0]*n[0]+p[2]*n[2])/radial)<.96)bent++;}}};
 const result=woodTube(mesh,[[0,0,0],[0,1,0]],radius,radius,type,{fine:true,macro:true,focusT:.44,maturity:.8,preview:false});
 assert(result.study.axialSpacing<.0014);assert(result.study.circumferentialSpacing<.0021);assert(result.study.length<.30,'Macro resolution was spread over the entire trunk');assert(count>400000);assert(BARK_PROFILES[type]);
 spans[type]=max-min;
 if(['oak','willow','ginkgo','maple','sweetthorn','marula','yellowwood','dawnredwood','chinesepine'].includes(type)){assert(max-min>.003,type+' has no actual coarse geometry');assert(bent>1000,type+' displaced bark has cylinder normals');}
 console.log(type+': physical '+((max-min)*1000).toFixed(2)+' mm relief range; macro spacing and displaced normals passed');
}
assert(spans.oak>spans.fevertree*6&&spans.ginkgo>spans.sakura*2,'Smooth species must not inherit deeply fissured bark');
function signature(preview){let count=0,total=0;const mesh={preview:{push(){}},v(p,n){count++;if(count%127===0)total+=p[0]+p[1]*3+p[2]*7+n[0]*11+n[2]*13;}};const result=woodTube(mesh,[[0,0,0],[0,1,0]],.16,.16,'oak',{fine:true,macro:true,preview});return[count,total,result.sides,result.rings];}
assert.deepEqual(signature(true),signature(false),'Software preview drops bark geometry detail');
const first=buildSpecimen({type:'oak',view:'bark',woodPart:'trunk',height:10,leafSize:.09,seed:2847,maturity:.8,barkPosition:.2},{preview:false}),second=buildSpecimen({type:'oak',view:'bark',woodPart:'trunk',height:10,leafSize:.09,seed:2847,maturity:.8,barkPosition:.8},{preview:false});
assert(second.inspectFocus[1]-first.inspectFocus[1]>1);assert(first.vertices.byteLength<48*1024*1024);assert(second.vertices.byteLength<48*1024*1024);
console.log('Bark study follows the selected physical surface and retains the same geometry in GPU/software paths');
