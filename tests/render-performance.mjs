import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {indexGeometry} from '../dist/indexed-geometry.mjs';
import {uploadGeometry} from '../dist/mesh-buffers.mjs';
import {selectRenderDetail,omitBuriedTriangles} from '../dist/render-detail.mjs';
import {getSurfaceAtlas} from '../dist/surface-cache.mjs';
const cfg=(type,view='tree')=>({type,view,height:type==='monkeytail'?1.1:10,spread:1,leafSize:SPECIES[type].length,seed:2847,levels:2,shoots:1,density:38,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,rootDepth:1.5,rootSpread:1,woodPart:'trunk',barkPosition:.44,surfacePosition:.55,shootStage:'extending'});
// Every attribute participates in identity, including material and wind fields.
const input=new Float32Array(14*12);for(let i=0;i<12;i++){input.set([1,2,3,0,1,0,.2,.3,.4,1,.7,.2,.5,.5],i*14);if(i>=3)input[i*14+9+(i%5)]+=.001*(i+1);}
const indexed=indexGeometry(input);assert(indexed.vertexCount>8);
const words=new Uint32Array(input.buffer),actual=new Uint32Array(indexed.vertices.buffer);for(let i=0;i<indexed.indices.length;i++)for(let k=0;k<14;k++)assert.equal(actual[indexed.indices[i]*14+k],words[i*14+k]);
globalThis.GPUBufferUsage={INDEX:16,COPY_DST:8};const uploads=[],destroyed=[],device={limits:{maxBufferSize:56*3*3},createBuffer(o){assert(o.size<=this.limits.maxBufferSize);return{size:o.size,destroy(){destroyed.push(this)}};},queue:{writeBuffer(...args){uploads.push(args);}}};
const split=uploadGeometry(device,new Float32Array(14*3*8),{indexed:true,usage:12,groundVertices:6});assert.equal(split.parts.reduce((n,p)=>n+p.indexCount,0),24);assert.equal(split.parts.reduce((n,p)=>n+p.shadowCount,0),18);assert(split.parts.every(p=>p.indexBuffer));split.destroy();assert.equal(destroyed.length,split.parts.length*2);
assert.equal(selectRenderDetail({view:'tree',distance:40,leafLength:.09}),'far');assert.equal(selectRenderDetail({view:'bark',distance:.02}),'full');assert.equal(selectRenderDetail({view:'surface',distance:.015}),'full');assert.equal(selectRenderDetail({view:'leaf',distance:2,mode:'full'}),'full');
// Below-grade omission keeps all exposed and plane-crossing root faces.
const roots=new Float32Array(14*9);for(let i=0;i<9;i++){roots[i*14+9]=-.04;roots[i*14+1]=i<3?-.2:i<6?(i===3?.01:-.2):.02;}const visible=omitBuriedTriangles(roots);assert.equal(visible.length,14*6);assert.deepEqual(visible,roots.slice(14*3));
for(const type of Object.keys(SPECIES)){
 const c=cfg(type),full=buildSpecimen(c,{preview:false}),auto=buildSpecimen(c,{preview:false,detail:'far',omitBuried:true});
 assert.equal(auto.stats.leaves,full.stats.leaves,`${type}: LOD changed leaf density`);assert.deepEqual(auto.stats.leafLengths,full.stats.leafLengths,`${type}: seeded biological dimensions drifted`);assert.equal(auto.stats.coveredTips,full.stats.coveredTips);assert.deepEqual(auto.rootSystem.segments,full.rootSystem.segments);
 assert(auto.vertices.length<=full.vertices.length,`${type}: coarse LOD increased triangles`);assert(auto.vertices.every(Number.isFinite));
 for(let i=0;i<auto.vertices.length;i+=42)assert(!(auto.vertices[i+9]<0&&auto.vertices[i+1]<-.003&&auto.vertices[i+15]<-.003&&auto.vertices[i+29]<-.003));
 const packed=indexGeometry(auto.vertices);assert(packed.bytes<auto.vertices.byteLength*1.08);
 console.log(type+': same organs/roots, visible collars retained, '+Math.round((1-auto.vertices.length/full.vertices.length)*100)+'% fewer display triangles');
}
for(const [type,view]of[['oak','bark'],['oak','leaf'],['chinesepine','surface']]){
 const c=cfg(type,view),full=buildSpecimen(c,{preview:false}),near=buildSpecimen(c,{preview:false,detail:'near'});assert(near.vertices.length<full.vertices.length*.55);assert.deepEqual(buildSpecimen(c,{preview:false}).vertices,full.vertices,'Full-detail export must remain deterministic and independent of display LOD');
}
const atlas=getSurfaceAtlas(cfg('oak'),SPECIES.oak.width);assert.equal(atlas.layers,12);assert.equal(atlas.levels.length,9);assert.strictEqual(atlas,getSurfaceAtlas(cfg('oak'),SPECIES.oak.width));assert.equal(atlas.levels.at(-1).data.length,12*4);
const base=atlas.levels[0].data;let upper=0,lower=0;for(let i=0;i<256*256;i++){upper+=base[i*4+3];lower+=base[(256*256+i)*4+3];}assert(lower>upper*1.1,'Leaf faces must retain different roughness');let minSlope=255,maxSlope=0,minTone=255,maxTone=0;for(let i=0;i<256*256*4;i+=4){minSlope=Math.min(minSlope,base[i]);maxSlope=Math.max(maxSlope,base[i]);minTone=Math.min(minTone,base[i+2]);maxTone=Math.max(maxTone,base[i+2]);}assert(maxSlope-minSlope>=4&&maxTone-minTone>20,'Cached material must retain non-flat normals and anatomical tone variation');
console.log('Exact indexing, buffer limits, close-up restoration, export identity, root clipping and linear mipmapped materials passed');
