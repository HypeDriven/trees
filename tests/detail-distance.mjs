import assert from 'node:assert/strict';
import {selectRenderDetail} from '../dist/render-detail.mjs';
import {inspectionRegion} from '../dist/inspection.mjs';
const fieldPerDistance=2*Math.tan(.3);
for(const [view,originalDistance]of [['tree',.09*800/(160*fieldPerDistance)],['wood',.20/fieldPerDistance],['bark',.20/fieldPerDistance],['leaf',.065/fieldPerDistance],['shoot',.065/fieldPerDistance],['surface',.035/fieldPerDistance]]){
 assert.equal(selectRenderDetail({view,distance:originalDistance*2.99}),'full',view);
 assert.notEqual(selectRenderDetail({view,distance:originalDistance*3.01}),'full',view);
}
const probe=distance=>inspectionRegion({eye:[0,0,0],cfg:{wind:0},proximity:{nearest:()=>distance}});
assert(probe(.78*2.99));assert.equal(probe(.78*3.01),null);
assert.equal(selectRenderDetail({view:'tree',distance:40}),'far');
assert.equal(selectRenderDetail({view:'leaf',distance:2,mode:'full'}),'full');
console.log('Highest-detail thresholds and surface inspection extend to 3× their original distance');
