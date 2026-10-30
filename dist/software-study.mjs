// A depth-buffered material renderer for leaf and shoot studies when neither
// WebGPU nor WebGL2 is available. It uses the actual curved specimen triangles;
// UV detail and wind share the same moving vertex positions, including veins.
import {barkSample} from './wood.mjs?v=25';
import {createLeafSurfaceTexture,LEAF_ANATOMY} from './leaf-anatomy.mjs?v=25';
import {indexGeometry} from './indexed-geometry.mjs?v=25';
import {bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage} from './compound-lod.mjs?v=25';
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function studyWindPosition(p,kind,phase,flutter,cfg,time){
 let [x,y,z]=p;if(['wood','bark'].includes(cfg.view))return[x,y,z];
 if(kind>=0&&kind<1.5){
  const h=Math.max(y-cfg.height*.045,0)/(cfg.height*.955),gust=1+cfg.gust*(Math.sin(time*.7)+Math.sin(time*1.3+x*.2))*.5,sway=(Math.sin(time*1.1-y*.35)+.35*Math.sin(time*2.3+z*.5))*cfg.wind*gust,b=h*h*.28*sway*(cfg.type==='monkeytail'?.15:1);
  x+=b*Math.cos(cfg.direction*Math.PI/180);z+=b*Math.sin(cfg.direction*Math.PI/180);
  if(kind>.5){const f=Math.sin(time*7+phase+x*1.5)*flutter*cfg.leafSize*.08*cfg.wind*gust;y+=f;x+=f*.6;}
 }return[x,y,z];
}
// Whole-canopy primitives use the same position-dependent wind as GPU studies.
// Missing local weights mean structural sway only; bases never get a free offset.
export function primitiveWindPosition(p,primitive,cfg,time){return studyWindPosition(p,primitive.kind,primitive.phase??0,(primitive.flutterAt?.(p)??0)*(primitive.card?(cfg.renderFlutterScale??1):1),cfg,time);}
export function createSoftwareStudy(){
 let vertices,indices,projected,woodData,textures,patchTextures,bladeOutline,signature='',patchSignature='',metricWidth=0,image,depth,width=0,height=0;
 const gamma=Uint8ClampedArray.from({length:4096},(_,i)=>Math.round(Math.pow(i/4095,1/2.2)*255));
 function upload(input,cfg){
  // Shared grid vertices are projected once per frame, rather than six times.
  const packed=indexGeometry(input);vertices=packed.vertices;indices=packed.indices;projected=new Float64Array(vertices.length/14*7);bladeOutline=cfg.bladeOutline;
  woodData=null;if(['wood','bark'].includes(cfg.view)||cfg.inspection){woodData=new Float32Array(vertices.length/14*2);for(let i=0;i<vertices.length;i+=14)if(vertices[i+9]<.1){const sample=barkSample(cfg.type,[vertices[i+12],vertices[i+13]],vertices[i+10],vertices[i+9]),o=i/14*2;woodData[o]=(1.13-.75*sample.dark)*(.70+.45*sample.color);woodData[o+1]=sample.roughness;}if(['wood','bark'].includes(cfg.view)){textures=null;patchTextures=null;signature='';patchSignature='';return;}}if(LEAF_ANATOMY[cfg.type].venation==='needle'){textures=null;patchTextures=null;signature='';patchSignature='';return;}const key=cfg.type+':'+cfg.leafSize;
  if(key!==signature){const p=LEAF_ANATOMY[cfg.type],needle=p.venation==='needle';metricWidth=needle?.004:cfg.type==='monkeytail'?Math.max(.002,Math.min(.008,cfg.leafSize*.024)):cfg.leafSize*cfg.widthRatio*2;textures=[false,true].map(under=>createLeafSurfaceTexture(cfg.type,cfg.leafSize,metricWidth,under,{height:512}));signature=key;}
  const patchKey=cfg.view==='surface'?key+':'+cfg.surfacePosition:'';
  if(patchKey!==patchSignature){patchTextures=patchKey?[false,true].map(under=>createLeafSurfaceTexture(cfg.type,cfg.leafSize,metricWidth,under,{bounds:[.20,(cfg.surfacePosition??.55)-.18,.80,(cfg.surfacePosition??.55)+.18]})):null;patchSignature=patchKey;}
 }
 function render({vp,eye,sun,cfg,time,width:w,height:h,near=.0001}){
  if(width!==w||height!==h){width=w;height=h;image={width:w,height:h,data:new Uint8ClampedArray(w*h*4)};depth=new Float32Array(w*h);}
  const pixels=image.data;depth.fill(Infinity);
  for(let y=0;y<h;y++){const t=y/h,r=232-15*t,g=237-14*t,b=225-22*t;for(let x=0;x<w;x++){const i=(y*w+x)*4;pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;pixels[i+3]=255;}}
  for(let i=0;i<vertices.length;i+=14){const p=studyWindPosition(vertices.subarray(i,i+3),vertices[i+9],vertices[i+10],vertices[i+11],cfg,time),x=p[0],y=p[1],z=p[2],ww=vp[3]*x+vp[7]*y+vp[11]*z+vp[15],o=i/14*7;projected[o]=(vp[0]*x+vp[4]*y+vp[8]*z+vp[12])/ww*w*.5+w*.5;projected[o+1]=h*.5-(vp[1]*x+vp[5]*y+vp[9]*z+vp[13])/ww*h*.5;projected[o+2]=ww;projected[o+3]=1/ww;projected[o+4]=x;projected[o+5]=y;projected[o+6]=z;}
  sun=norm(sun);
  for(let tri=0;tri<indices.length;tri+=3){
   const ai=indices[tri],bi=indices[tri+1],ci=indices[tri+2],a=ai*14,b=bi*14,c=ci*14,A=ai*7,B=bi*7,C=ci*7;
   if(projected[A+2]<near||projected[B+2]<near||projected[C+2]<near)continue;
   const ax=projected[A],ay=projected[A+1],bx=projected[B],by=projected[B+1],cx=projected[C],cy=projected[C+1],area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
   if(Math.abs(area)<.015)continue;
   const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(w-1,Math.ceil(Math.max(ax,bx,cx))),minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(h-1,Math.ceil(Math.max(ay,by,cy)));
   if(minX>maxX||minY>maxY)continue;
   const kind=vertices[a+9],leaf=kind>.5&&kind<1.15,under=kind>1.005&&kind<1.05||cfg.view==='tree'&&leaf&&kind<1.005&&area>0,texture=leaf&&kind<1.05?textures?.[under?1:0]:null;
   if(leaf&&area>0&&cfg.view!=='tree')continue; // Closed finite leaves have their own reverse face.
   const p0=[projected[A+4],projected[A+5],projected[A+6]],p1=[projected[B+4],projected[B+5],projected[B+6]],p2=[projected[C+4],projected[C+5],projected[C+6]],e1=sub(p1,p0),e2=sub(p2,p0),du1=vertices[b+12]-vertices[a+12],dv1=vertices[b+13]-vertices[a+13],du2=vertices[c+12]-vertices[a+12],dv2=vertices[c+13]-vertices[a+13],det=du1*dv2-du2*dv1;
   const tangent=Math.abs(det)>1e-12?norm(e1.map((v,i)=>(v*dv2-e2[i]*dv1)/det)):[0,0,0],bitangent=Math.abs(det)>1e-12?norm(e1.map((v,i)=>(e2[i]*du1-v*du2)/det)):[0,0,0],facing=area<0?1:-1;
   // Keep relief below the current pixel footprint to avoid sparkly pore aliasing.
   const materialScale=clamp(Math.sqrt(Math.abs(area))*.35,0,1);
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const wa=((bx-x-.5)*(cy-y-.5)-(by-y-.5)*(cx-x-.5))/area,wb=((cx-x-.5)*(ay-y-.5)-(cy-y-.5)*(ax-x-.5))/area,wc=1-wa-wb;
    if(wa<-.00001||wb<-.00001||wc<-.00001)continue;
    const iz=wa*projected[A+3]+wb*projected[B+3]+wc*projected[C+3],z=1/iz,index=y*w+x;if(z>=depth[index])continue;
    const aa=wa*projected[A+3]*z,bb=wb*projected[B+3]*z,cc=wc*projected[C+3]*z;
    if(kind>.975&&kind<.995){const u=vertices[a+12]*aa+vertices[b+12]*bb+vertices[c+12]*cc,v=vertices[a+13]*aa+vertices[b+13]*bb+vertices[c+13]*cc;if(Math.abs(u-.5)*2*1.10>(bladeOutline?.(v,u<.5?-1:1)??1))continue;}
    if(kind>1.19&&kind<1.50){const u=vertices[a+12]*aa+vertices[b+12]*bb+vertices[c+12]*cc,v=vertices[a+13]*aa+vertices[b+13]*bb+vertices[c+13]*cc,jac=kind>1.40,fever=kind>1.30&&!jac,pairs=jac?Math.round((kind-1.40)*100)+6:Math.round((kind-(fever?1.30:1.20))*100),coverage=kind<1.2?pineSprayCoverage(u,v,Math.round((kind-1.191)*1000)):kind>1.485?redwoodSprayCoverage(u,v):bipinnateCoverage(u,v,pairs,jac?16:fever?13:9,jac);if(!coverage)continue;}
    let nx=(vertices[a+3]*aa+vertices[b+3]*bb+vertices[c+3]*cc)*facing,ny=(vertices[a+4]*aa+vertices[b+4]*bb+vertices[c+4]*cc)*facing,nz=(vertices[a+5]*aa+vertices[b+5]*bb+vertices[c+5]*cc)*facing,tone=1,rough=kind>1.05&&kind<1.15?.48:.65;
    if(woodData&&kind<.10){tone=woodData[ai*2]*aa+woodData[bi*2]*bb+woodData[ci*2]*cc;rough=woodData[ai*2+1]*aa+woodData[bi*2+1]*bb+woodData[ci*2+1]*cc;}if(texture){const u=clamp(vertices[a+12]*aa+vertices[b+12]*bb+vertices[c+12]*cc,0,.99999),v=clamp(vertices[a+13]*aa+vertices[b+13]*bb+vertices[c+13]*cc,0,.99999);let tex=texture;const patch=patchTextures?.[under?1:0];if(patch&&u>patch.bounds[0]&&u<patch.bounds[2]&&v>patch.bounds[1]&&v<patch.bounds[3])tex=patch;const [u0,v0,u1,v1]=tex.bounds,tx=clamp((u-u0)/(u1-u0)*tex.width-.5,0,tex.width-1),ty=clamp((v-v0)/(v1-v0)*tex.height-.5,0,tex.height-1),ix=Math.floor(tx),iy=Math.floor(ty),fx=tx-ix,fy=ty-iy,o=(iy*tex.width+ix)*4,ox=(iy*tex.width+Math.min(tex.width-1,ix+1))*4,oy=(Math.min(tex.height-1,iy+1)*tex.width+ix)*4,oxy=(Math.min(tex.height-1,iy+1)*tex.width+Math.min(tex.width-1,ix+1))*4,d=tex.data;
     const sample=k=>(d[o+k]*(1-fx)+d[ox+k]*fx)*(1-fy)+(d[oy+k]*(1-fx)+d[oxy+k]*fx)*fy,tu=sample(0)*materialScale,tv=sample(1)*materialScale;nx-=tangent[0]*tu+bitangent[0]*tv;ny-=tangent[1]*tu+bitangent[1]*tv;nz-=tangent[2]*tu+bitangent[2]*tv;tone=sample(2);rough=sample(3);}
    const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    // Evaluate the view direction per pixel. A single direction per triangle
    // produces bright horizontal facets at macro camera distances.
    let vx=eye[0]-(p0[0]*aa+p1[0]*bb+p2[0]*cc),vy=eye[1]-(p0[1]*aa+p1[1]*bb+p2[1]*cc),vz=eye[2]-(p0[2]*aa+p1[2]*bb+p2[2]*cc);const vl=Math.hypot(vx,vy,vz)||1;vx=vx/vl+sun[0];vy=vy/vl+sun[1];vz=vz/vl+sun[2];const hl=Math.hypot(vx,vy,vz)||1;
    const nd=nx*sun[0]+ny*sun[1]+nz*sun[2],nh=Math.max(0,(nx*vx+ny*vy+nz*vz)/hl),spec=leaf?Math.pow(nh,Math.max(8,2/Math.pow(rough,4)-2))*.085:woodData?Math.pow(nh,Math.max(4,2/Math.pow(rough,4)-2))*.014:0,light=.39+.70*Math.max(0,nd)+(leaf?.22*Math.pow(Math.max(0,-nd),1.4):0);
    const o=index*4;for(let k=0;k<3;k++){let base=vertices[a+6+k]*aa+vertices[b+6+k]*bb+vertices[c+6+k]*cc;if(leaf&&under&&!LEAF_ANATOMY[cfg.type].concolorous)base=base*.79+[.24,.34,.20][k]*.21;if(leaf&&under&&LEAF_ANATOMY[cfg.type].scales)base=base*.4+[.43,.44,.30][k]*.6;const value=clamp(base*tone*light+spec,0,1);pixels[o+k]=gamma[Math.round(value*4095)];}depth[index]=z;
   }
  }
  return image;
 }
 return{upload,render,get vertexCount(){return vertices?.length/14||0;}};
}
