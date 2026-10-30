import {studyWindPosition} from './software-study.mjs?v=25';
import {bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage} from './compound-lod.mjs?v=25';

// Wind moves the specimen through a stationary inspection volume. Undo its
// structural displacement so proximity and refinements follow the real organ.
export function restCamera(eye,cfg,time=0){
 const direction=(cfg.direction??0)*Math.PI/180,e=[Math.cos(direction),0,Math.sin(direction)],motion={height:10,wind:0,gust:0,direction:0,...cfg},at=b=>eye.map((v,k)=>v-e[k]*b),error=b=>{const p=at(b),q=studyWindPosition(p,0,0,0,motion,time);return(q[0]-eye[0])*e[0]+(q[2]-eye[2])*e[2];};let b=0;
 for(let i=0;i<8;i++){const f=error(b);if(Math.abs(f)<1e-9)break;const derivative=(error(b+.0001)-f)/.0001;if(Math.abs(derivative)<.05)break;b-=f/derivative;}return at(b);
}
export function createInspectionField(region){
 if(!region)return null;const eye=region.center,radius=region.radius;
 const visible=(p,extent=0)=>{if(!region.forward)return true;const v=p.map((x,k)=>x-eye[k]),along=v.reduce((s,x,k)=>s+x*region.forward[k],0);return along+extent>=0&&Math.sqrt(Math.max(0,v.reduce((s,x)=>s+x*x,0)-along*along))<=Math.max(0,along)*(region.cone??.75)+extent*1.5+.025;};
 const near=(p,extent=0,reach=radius)=>Math.hypot(p[0]-eye[0],p[1]-eye[1],p[2]-eye[2])<=Math.min(radius,reach)+extent&&visible(p,extent);
 function path(points,r0=0){let best=Infinity,t=0;
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],d=b.map((v,k)=>v-a[k]),q=eye.map((v,k)=>v-a[k]),u=Math.max(0,Math.min(1,q.reduce((s,v,k)=>s+v*d[k],0)/(d.reduce((s,v)=>s+v*v,0)||1))),sample=u=>a.map((v,k)=>v+d[k]*u),candidates=visible(sample(u),r0)?[u]:[0,.25,.5,.75,1];for(const f of candidates){const p=sample(f),distance=Math.hypot(...p.map((v,k)=>v-eye[k]))-r0;if(distance<best&&visible(p,r0)){best=distance;t=(i+f)/(points.length-1);}}}
  return{near:best<=radius,distance:best,t};
 }
 function geometryNear(vertices,start=0,end=vertices.length,padding=.004){
  const limit=(radius+padding)**2;
  for(let i=start;i<end;i+=42){const center=[0,1,2].map(k=>(vertices[i+k]+vertices[i+14+k]+vertices[i+28+k])/3),extent=Math.max(...[0,14,28].map(o=>Math.hypot(...center.map((v,k)=>vertices[i+o+k]-v))));if(near(center,extent+padding)&&triangleDistance2(vertices,i,eye)<=limit)return true;}
  return false;
 }
 return{...region,near,path,geometryNear};
}

function segmentDistance2(p,a,b){const x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],u=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y+(p[2]-a[2])*z)/(x*x+y*y+z*z||1)));return(p[0]-a[0]-x*u)**2+(p[1]-a[1]-y*u)**2+(p[2]-a[2]-z*u)**2;}
function triangleDistance2(vertices,i,p){
 const a=vertices.subarray(i,i+3),b=vertices.subarray(i+14,i+17),c=vertices.subarray(i+28,i+31),e=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],f=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],q=[p[0]-a[0],p[1]-a[1],p[2]-a[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],ee=dot(e,e),ff=dot(f,f),ef=dot(e,f),qe=dot(q,e),qf=dot(q,f),det=ee*ff-ef*ef;
 if(det>1e-24){const u=(ff*qe-ef*qf)/det,v=(ee*qf-ef*qe)/det;if(u>=0&&v>=0&&u+v<=1)return(q[0]-e[0]*u-f[0]*v)**2+(q[1]-e[1]*u-f[1]*v)**2+(q[2]-e[2]*u-f[2]*v)**2;}
 return Math.min(segmentDistance2(p,a,b),segmentDistance2(p,b,c),segmentDistance2(p,c,a));
}
// Occupied cells accelerate exact surface distance; their size no longer
// controls close-up quality or hides millimetre-scale camera movements.
export function createSurfaceProximity(vertices,bounds,cell=.18){
 const span=bounds.max.map((v,k)=>v-bounds.min[k]);cell=Math.max(cell,...span.map(v=>v/280));const min=bounds.min.map(v=>v-cell),dims=span.map(v=>Math.ceil(v/cell)+3),[nx,ny,nz]=dims,count=nx*ny*nz,counts=new Uint32Array(count),index=(x,y,z)=>(z*ny+y)*nx+x;
 function cells(i,visit){if(vertices[i+9]>=1.5||vertices[i+1]<-.003&&vertices[i+15]<-.003&&vertices[i+29]<-.003)return;const lo=[],hi=[];for(let k=0;k<3;k++){lo[k]=Math.max(0,Math.floor((Math.min(vertices[i+k],vertices[i+14+k],vertices[i+28+k])-min[k])/cell));hi[k]=Math.min(dims[k]-1,Math.floor((Math.max(vertices[i+k],vertices[i+14+k],vertices[i+28+k])-min[k])/cell));}for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++)visit(index(x,y,z));}
 for(let i=0;i<vertices.length;i+=42)cells(i,c=>counts[c]++);
 const offsets=new Uint32Array(count+1);for(let i=0;i<count;i++)offsets[i+1]=offsets[i]+counts[i];const refs=new Uint32Array(offsets[count]),cursor=offsets.slice(0,-1),marks=new Uint32Array(vertices.length/42);let stamp=0;
 for(let i=0;i<vertices.length;i+=42)cells(i,c=>{refs[cursor[c]++]=i/42;});
 return{cell,bytes:offsets.byteLength+refs.byteLength+marks.byteLength,nearest(p,limit=1.15){if(++stamp===0xffffffff){marks.fill(0);stamp=1;}let best=limit*limit;const lo=p.map((v,k)=>Math.max(0,Math.floor((v-limit-min[k])/cell))),hi=p.map((v,k)=>Math.min(dims[k]-1,Math.floor((v+limit-min[k])/cell)));for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){const c=index(x,y,z);if(offsets[c]===offsets[c+1])continue;const xyz=[x,y,z],d=p.reduce((s,v,k)=>s+Math.max(min[k]+xyz[k]*cell-v,0,v-(min[k]+(xyz[k]+1)*cell))**2,0);if(d>best)continue;for(let r=offsets[c];r<offsets[c+1];r++){const t=refs[r];if(marks[t]===stamp)continue;marks[t]=stamp;best=Math.min(best,triangleDistance2(vertices,t*42,p));}}return Math.sqrt(best);}};
}
export function inspectionRegion({eye,direction=null,aspect=1,height=800,cfg,time=0,proximity,current=null}){
 if(!proximity)return null;const center=restCamera(eye,cfg,time),distance=proximity.nearest(center),limit=current?1.05:.78;if(distance>limit)return null;
 const delta=direction?restCamera(eye.map((v,k)=>v+direction[k]),cfg,time).map((v,k)=>v-center[k]):null,forward=delta?delta.map(v=>v/(Math.hypot(...delta)||1)):null,cone=Math.tan(Math.min(1.2,Math.atan(Math.tan(.3)*Math.max(1,aspect))+.20)),radius=Math.max(.16,distance+.08),move=current?Math.hypot(...center.map((v,k)=>v-current.center[k])):Infinity,turn=current?.forward&&forward?current.forward.reduce((s,v,k)=>s+v*forward[k],0):1;
 return current&&move<.003&&radius<=current.radius+.12&&turn>.9995?current:{center,radius,forward,cone,camera:[...eye],cameraForward:direction?[...direction]:null,height,time};
}

// Used only for an explicit double click, not on the frame path. Intersections
// use the same deformed vertices as rendering, including pinned leaf bases.
export function pickSurface(vertices,origin,direction,cfg,time=0){
 let closest=Infinity,hit=null,excludedIndex=0;const excluded=cfg.excludedRanges??[];const dot=(a,b)=>a.reduce((s,v,k)=>s+v*b[k],0),sub=(a,b)=>a.map((v,k)=>v-b[k]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 for(let i=0;i<vertices.length;i+=42){const vertex=i/14;while(excludedIndex<excluded.length&&excluded[excludedIndex].start+excluded[excludedIndex].count<=vertex)excludedIndex++;if(excludedIndex<excluded.length&&excluded[excludedIndex].start<=vertex)continue;const kind=vertices[i+9];if(kind>=1.5)continue;const p=[0,14,28].map(o=>studyWindPosition(vertices.subarray(i+o,i+o+3),vertices[i+o+9],vertices[i+o+10],vertices[i+o+11]*(kind>1.19?(cfg.renderFlutterScale??1):1),cfg,time)),e1=sub(p[1],p[0]),e2=sub(p[2],p[0]),h=cross(direction,e2),det=dot(e1,h);if(Math.abs(det)<1e-12)continue;const s=sub(origin,p[0]),u=dot(s,h)/det;if(u<0||u>1)continue;const q=cross(s,e1),v=dot(direction,q)/det;if(v<0||u+v>1)continue;const uv=[12,13].map(k=>vertices[i+k]*(1-u-v)+vertices[i+14+k]*u+vertices[i+28+k]*v);if(kind>.975&&kind<.995&&Math.abs(uv[0]-.5)*2*1.10>(cfg.bladeOutline?.(uv[1],uv[0]<.5?-1:1)??1))continue;if(kind>1.19&&kind<1.5){const jac=kind>1.4,fever=kind>1.3&&!jac,pairs=jac?Math.round((kind-1.4)*100)+6:Math.round((kind-(fever?1.3:1.2))*100),coverage=kind<1.2?pineSprayCoverage(...uv,Math.round((kind-1.191)*1000)):kind>1.485?redwoodSprayCoverage(...uv):bipinnateCoverage(...uv,pairs,jac?16:fever?13:9,jac);if(!coverage)continue;}const t=dot(e2,q)/det;if(t>.0001&&t<closest){closest=t;hit={point:origin.map((v,k)=>v+direction[k]*t),kind,distance:t};}}
 return hit;
}
