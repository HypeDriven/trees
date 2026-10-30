import {createInspectionField} from './inspection.mjs?v=25';
import {inspectionEquivalent} from './maximum-detail.mjs?v=25';
// Source triangle ranges survive indexing: indices keep their original order.
// Replace a nearby part without rebuilding or uploading the distant specimen.
export function visibleRanges(count,excluded=[],start=0){
 const end=start+count,ranges=[];let cursor=start;
 for(const part of excluded){const a=Math.max(start,part.start),b=Math.min(end,part.start+part.count);if(b<=cursor||a>=end)continue;if(a>cursor)ranges.push({start:cursor-start,count:a-cursor});cursor=Math.max(cursor,b);}
 if(cursor<end)ranges.push({start:cursor-start,count:end-cursor});return ranges;
}
export function sortedExclusions(chunks){return chunks.map(({start,count})=>({start,count})).sort((a,b)=>a.start-b.start);}
export function composeGeometry(base,chunks,stride=14){
 const ordered=[...chunks].sort((a,b)=>a.start-b.start),size=base.length+ordered.reduce((n,p)=>n+p.vertices.length-p.count*stride,0),out=new Float32Array(size);let source=0,target=0;
 for(const p of ordered){const end=p.start*stride;out.set(base.subarray(source,end),target);target+=end-source;out.set(p.vertices,target);target+=p.vertices.length;source=(p.start+p.count)*stride;}
 out.set(base.subarray(source),target);return out;
}
export function drawGeometry(pass,geometry,excluded=[],shadow=false){
 for(const part of geometry.parts){pass.setVertexBuffer(0,part.buffer);if(part.indexBuffer)pass.setIndexBuffer(part.indexBuffer,'uint32');
  for(const range of visibleRanges(shadow?part.shadowCount:part.indexCount,excluded,part.sourceStart??0)){if(part.indexBuffer)pass.drawIndexed(range.count,1,range.start);else pass.draw(range.count,1,range.start);}
 }
}
export function selectParts(parts,region){
 if(!region)return[];const f=createInspectionField(region);
 return parts.map(p=>{const center=p.min.map((v,k)=>(v+p.max[k])*.5),extent=Math.hypot(...p.max.map((v,k)=>(v-p.min[k])*.5)),distance=Math.hypot(...f.center.map((v,k)=>Math.max(p.min[k]-v,0,v-p.max[k])));return{p,distance,visible:distance<=f.radius+.005&&f.near(center,extent+.005)};}).filter(x=>x.visible).sort((a,b)=>({reproductive:0,wood:1}[a.p.kind]??2)-({reproductive:0,wood:1}[b.p.kind]??2)||a.distance-b.distance).map(x=>x.p);
}
export class RetainedRefiner{
 constructor(parts,{build,apply,error=()=>{}}){this.parts=parts;this.build=build;this.apply=apply;this.error=error;this.chunks=new Map();this.selected=[];this.region=null;this.running=false;this.stopped=false;}
 update(region){this.region=region;this.selected=selectParts(this.parts,region);const ids=new Set(this.selected.map(p=>p.id));for(const id of this.chunks.keys())if(!ids.has(id))this.chunks.delete(id);this.publish();this.pump();}
 publish(){const chunks=this.selected.map(p=>this.chunks.get(p.id)?.chunk).filter(Boolean);this.apply(chunks,{region:this.region,pending:chunks.length<this.selected.length||this.running});}
 async pump(){
  if(this.running||this.stopped||!this.region)return;
  // Complete missing anatomy before refreshing an already detailed bark patch.
  // A moving camera must never starve a visible flower's first fine mesh.
  const part=this.selected.find(p=>!this.chunks.has(p.id))??this.selected.find(p=>p.sensitive&&!inspectionEquivalent(this.chunks.get(p.id).region,this.region));if(!part)return;
  const region=this.region;this.running=true;this.publish();
  try{const chunk=await this.build(part,region,this.selected.map(p=>p.id));if(!this.stopped&&this.selected.some(p=>p.id===part.id))this.chunks.set(part.id,{chunk,region});}
  catch(error){if(!this.stopped){this.stopped=true;this.error(error);}}
  finally{this.running=false;if(!this.stopped){this.publish();this.pump();}}
 }
 stop(){this.stopped=true;}
}
