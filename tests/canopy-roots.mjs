import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
const base={height:10,spread:1,levels:3,density:68,shoots:3,seed:2847,season:'summer',maturity:.65,reproductive:false,rootSpread:1,rootDepth:1.2,rootBranching:2,fineRoots:true};
for(const type of Object.keys(SPECIES)){
 const cfg={...base,...(type==='monkeytail'?{height:1.1,rootDepth:.25}:{}),type,view:'tree',leafSize:SPECIES[type].length};let r=buildSpecimen(cfg,{preview:false});
 assert(r.stats.apicalContinuations>0);assert.equal(r.stats.coveredTips,r.stats.terminalTips,`${type} skipped living terminal foliage`);assert(r.stats.terminalTips>0);
 assert(r.stats.tipGaps.every(gap=>gap<SPECIES[type].leaf[0]*.25),`${type} left a long naked tip`);
 assert(r.stats.leafyShoots>=r.stats.structuralTips);assert(r.stats.leaves>(type==='monkeytail'?12:5000));assert(r.vertices.byteLength<(SPECIES[type].region?320:256)*1024*1024);
 const root=r.rootSystem;assert(root&&root.stats.primary>=8);assert(root.stats.lateral>root.stats.primary);assert(root.stats.feeder>0);assert(root.stats.sinkers>0);
 for(const c of root.stats.connections){let parent=root.segments[c.parent];assert(parent.points.some(p=>p.every((v,i)=>v===c.start[i])),`${type} floating root attachment`)}
 assert(root.segments.some(s=>s.points.some(p=>p[1]<-.1)));assert(root.stats.depth<=cfg.rootDepth+.05);
 let frozen=0;for(let i=0;i<r.vertices.length;i+=14)if(r.vertices[i+9]<0){assert(r.vertices[i+9]<-.001);frozen++}assert(frozen>1000);
 const rootState=JSON.stringify(root.segments);r=null;
 const study=buildSpecimen({...cfg,view:'roots'},{preview:false});assert.equal(JSON.stringify(study.rootSystem.segments),rootState,'Root study must expose the same root system');assert.equal(study.stats.leaves,0);assert(study.vertices.every(Number.isFinite));
 const noFine=buildSpecimen({...cfg,view:'roots',fineRoots:false},{preview:false});assert.equal(noFine.stats.roots.feeder,0);assert.equal(noFine.stats.roots.primary,study.stats.roots.primary);
 console.log(type+': all terminal shoots covered; connected, stationary root hierarchy and matching root study passed');
}
const a=buildSpecimen({...base,type:'oak',view:'roots',leafSize:.09,rootBranching:1},{preview:false}),b=buildSpecimen({...base,type:'oak',view:'roots',leafSize:.09,rootBranching:3},{preview:false});assert(b.stats.roots.segments>a.stats.roots.segments);
console.log('Root branching/detail controls passed');
