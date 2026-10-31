import assert from 'node:assert/strict';
import {lowerBranchFoliage} from '../dist/foliage-growth.mjs';
import {buildTreeArchitecture} from '../dist/architecture.mjs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
const cfg={height:8,spread:1,levels:3,density:45,shoots:2,seed:2847,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,rootDepth:1,rootSpread:1,view:'tree'};
for(const type of ['oak','birch','pine','maple','eucalyptus','fagus-sylvatica']){
 const c={...cfg,type,leafSize:SPECIES[type].length},architecture=buildTreeArchitecture(c),plan=lowerBranchFoliage(c,architecture.records,20000,40);
 assert(plan.sites.length>0);assert(plan.nodes<=plan.budget&&plan.budget<=20000*.22);
 assert.deepEqual(plan,lowerBranchFoliage(c,architecture.records,20000,40));
 for(const site of plan.sites){assert(site.height<.78);assert(site.t>.25&&site.t<.92);assert(site.relativeAge>=0&&site.relativeAge<=1);}
 const s=buildSpecimen(c,{preview:false,detail:'far'}),f=s.stats.lowerBranchFill;
 assert(f.shoots>0&&f.sites.length===f.shoots);assert(f.nodes<=f.budget);assert(s.vertices.every(Number.isFinite));
 for(const site of f.sites)assert(Math.hypot(...site.base.map((v,k)=>v-site.surface[k]))<.0001,'Lower shoot is not attached to bark');
 console.log(type+': '+f.shoots+' connected lower shoots, '+f.nodes+' added nodes within '+f.budget+' budget');
}
assert.equal(lowerBranchFoliage({...cfg,type:'monkeytail'},[],10000,30).sites.length,0,'Do not invent woody foliage on a tufted specialist');
