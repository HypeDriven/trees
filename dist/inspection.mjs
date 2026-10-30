import {studyWindPosition} from './software-study.mjs?v=23';
import {bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage} from './compound-lod.mjs?v=23';

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
 return{...region,near,path};
}

// Conservative occupied cells include entire triangle bounds, so a camera
// near the middle of a long branch is detected as well as one near a vertex.
export function createSurfaceProximity(vertices,bounds,cell=.18){
 const span=bounds.max.map((v,k)=>v-bounds.min[k]);cell=Math.max(cell,...span.map(v=>v/280));const min=bounds.min.map(v=>v-cell),dims=span.map(v=>Math.ceil(v/cell)+3),[nx,ny,nz]=dims,data=new Uint8Array(nx*ny*nz),index=(x,y,z)=>(z*ny+y)*nx+x;
 for(let i=0;i<vertices.length;i+=42){if(vertices[i+9]>=1.5||vertices[i+1]<-.003&&vertices[i+15]<-.003&&vertices[i+29]<-.003)continue;const lo=[],hi=[];for(let k=0;k<3;k++){lo[k]=Math.max(0,Math.floor((Math.min(vertices[i+k],vertices[i+14+k],vertices[i+28+k])-min[k])/cell));hi[k]=Math.min(dims[k]-1,Math.floor((Math.max(vertices[i+k],vertices[i+14+k],vertices[i+28+k])-min[k])/cell));}for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)data.fill(1,index(lo[0],y,z),index(hi[0],y,z)+1);}
 return{cell,bytes:data.byteLength,nearest(p,limit=1.15){let best=limit;const lo=p.map((v,k)=>Math.max(0,Math.floor((v-limit-min[k])/cell))),hi=p.map((v,k)=>Math.min(dims[k]-1,Math.floor((v+limit-min[k])/cell)));for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){if(!data[index(x,y,z)])continue;const xyz=[x,y,z],d=Math.hypot(...p.map((v,k)=>Math.max(min[k]+xyz[k]*cell-v,0,v-(min[k]+(xyz[k]+1)*cell))));if(d<best)best=d;}return best;}};
}
export function inspectionRegion({eye,direction=null,aspect=1,cfg,time=0,proximity,current=null}){
 if(!proximity)return null;const center=restCamera(eye,cfg,time),distance=proximity.nearest(center),limit=current?1.05:.78;if(distance>limit)return null;
 const delta=direction?restCamera(eye.map((v,k)=>v+direction[k]),cfg,time).map((v,k)=>v-center[k]):null,forward=delta?delta.map(v=>v/(Math.hypot(...delta)||1)):null,cone=Math.tan(Math.min(1.2,Math.atan(Math.tan(.3)*Math.max(1,aspect))+.20)),radius=Math.max(.44,distance+.25),move=current?Math.hypot(...center.map((v,k)=>v-current.center[k])):Infinity,turn=current?.forward&&forward?current.forward.reduce((s,v,k)=>s+v*forward[k],0):1;
 return current&&move<Math.min(.16,current.radius*.25)&&radius<=current.radius+.12&&turn>.985?current:{center,radius,forward,cone};
}

// Used only for an explicit double click, not on the frame path. Intersections
// use the same deformed vertices as rendering, including pinned leaf bases.
export function pickSurface(vertices,origin,direction,cfg,time=0){
 let closest=Infinity,hit=null;const dot=(a,b)=>a.reduce((s,v,k)=>s+v*b[k],0),sub=(a,b)=>a.map((v,k)=>v-b[k]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 for(let i=0;i<vertices.length;i+=42){const kind=vertices[i+9];if(kind>=1.5)continue;const p=[0,14,28].map(o=>studyWindPosition(vertices.subarray(i+o,i+o+3),vertices[i+o+9],vertices[i+o+10],vertices[i+o+11]*(kind>1.19?(cfg.renderFlutterScale??1):1),cfg,time)),e1=sub(p[1],p[0]),e2=sub(p[2],p[0]),h=cross(direction,e2),det=dot(e1,h);if(Math.abs(det)<1e-12)continue;const s=sub(origin,p[0]),u=dot(s,h)/det;if(u<0||u>1)continue;const q=cross(s,e1),v=dot(direction,q)/det;if(v<0||u+v>1)continue;const uv=[12,13].map(k=>vertices[i+k]*(1-u-v)+vertices[i+14+k]*u+vertices[i+28+k]*v);if(kind>.975&&kind<.995&&Math.abs(uv[0]-.5)*2*1.10>(cfg.bladeOutline?.(uv[1],uv[0]<.5?-1:1)??1))continue;if(kind>1.19&&kind<1.5){const jac=kind>1.4,fever=kind>1.3&&!jac,pairs=jac?Math.round((kind-1.4)*100)+6:Math.round((kind-(fever?1.3:1.2))*100),coverage=kind<1.2?pineSprayCoverage(...uv,Math.round((kind-1.191)*1000)):kind>1.485?redwoodSprayCoverage(...uv):bipinnateCoverage(...uv,pairs,jac?16:fever?13:9,jac);if(!coverage)continue;}const t=dot(e2,q)/det;if(t>.0001&&t<closest){closest=t;hit={point:origin.map((v,k)=>v+direction[k]*t),kind,distance:t};}}
 return hit;
}
