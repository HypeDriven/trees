// Geometric reproductive structures, in metres. Surface amplitudes and
// developmental stages are illustrative; these are not scans or growth models.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)},mix=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))]};
const hash=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export const FRUIT_NOTES={
 pine:{name:'Seed cone',source:'https://www.treesandshrubsonline.org/articles/pinus/pinus-sylvestris/',text:'Ovoid to conical seed cones, with overlapping woody scales, rhombic exposed faces, transverse keels and blunt dorsal umbos. A cone is a reproductive structure, not a botanical fruit. Opening is a drying response; it is independent of the season control here.'},
 oak:{name:'Stalked acorn',source:'https://plants.ces.ncsu.edu/plants/quercus-robur/',text:'An ovoid nut on a long stalk, with a scaly cup covering about a quarter to a third of its length. The cup, rim, shell and apical scar are separate geometric details.'},
 willow:{name:'Female fruiting catkin',source:'https://plants.ces.ncsu.edu/plants/salix-babylonica/',text:'A female fruiting catkin carries many small capsules. At seed release the two valves part and reveal seeds with silky hairs. This study represents a female tree.'},
 birch:{name:'Fruiting catkin',source:'https://plants.ces.ncsu.edu/plants/betula-pendula/',text:'A pendant cylindrical fruiting catkin, with overlapping three-lobed bracts and small winged nutlets. These are not woody pine scales.'}
};

export function buildFruit(mesh,cfg,{base=[0,0,0],axis=[0,-1,0],fine=false,stage=cfg.fruitStage??'mature',seed=cfg.seed??2847}={}){
 axis=norm(axis);const [u,v]=frame(axis),rnd=(i,a,b)=>mix(a,b,hash(seed+i*1.73)),type=cfg.type;
 const details={type,stage,scales:0,capsules:0,bracts:0,wingedSeeds:0,silkyHairs:0,seeds:0,seedPairs:0,scaleRecords:[]};let focus=null;
 function tri(a,b,c,na,nb,nc,col,kind,uv,phase=0){const geometric=cross(sub(b,a),sub(c,a));if(length(geometric)<1e-15)return;let colors=Array.isArray(col[0])?col:[col,col,col];if(dot(geometric,add(add(na,nb),nc))<0){[b,c]=[c,b];[nb,nc]=[nc,nb];[uv[1],uv[2]]=[uv[2],uv[1]];[colors[1],colors[2]]=[colors[2],colors[1]]}for(const [i,p,n,tex]of [[0,a,na,uv[0]],[1,b,nb,uv[1]],[2,c,nc,uv[2]]])mesh.v(p,n,colors[i],kind,phase,0,tex);}
 // A closed, finite-thickness patch. The same geometry feeds GPU, preview,
 // shadows and OBJ, including the concealed underside and exposed scale rim.
 function patch(point,rows,cols,col,kind,thickness,metric,phase=0){
  const rings=[];
  for(let j=0;j<=rows;j++){const t=j/rows,ring=[];for(let k=0;k<=cols;k++){
   const x=k/cols*2-1,p=point(t,x),dt=sub(point(Math.min(1,t+.0003),x),point(Math.max(0,t-.0003),x)),dx=sub(point(t,Math.min(1,x+.0003)),point(t,Math.max(-1,x-.0003))),n0=norm(cross(dx,dt)),n=length(n0)>.5?n0:u;
   ring.push({p,n,t,x,uv:[(x+1)*.5*metric[0],t*metric[1]]});
  }rings.push(ring)}
  function quad(q,back=false){const sign=back?-1:1,pts=q.map(a=>add(a.p,mul(a.n,thickness*.5*sign))),ns=q.map(a=>mul(a.n,sign)),co=q.map(a=>(typeof col==='function'?col(a.t,a.x):col).map(c=>c*(back?.62:1)));
   tri(pts[0],pts[1],pts[2],ns[0],ns[1],ns[2],[co[0],co[1],co[2]],kind,[q[0].uv,q[1].uv,q[2].uv],phase);tri(pts[2],pts[1],pts[3],ns[2],ns[1],ns[3],[co[2],co[1],co[3]],kind,[q[2].uv,q[1].uv,q[3].uv],phase);
   mesh.preview.push({pts:[pts[0],pts[1],pts[3],pts[2]],n:ns[0],c:co[0],kind,phase});
  }
  for(let j=0;j<rows;j++)for(let k=0;k<cols;k++){const q=[rings[j][k],rings[j+1][k],rings[j][k+1],rings[j+1][k+1]];quad(q);if(thickness)quad(q,true)}
  if(thickness){const edge=[];for(let k=0;k<cols;k++)edge.push([rings[0][k],rings[0][k+1]],[rings[rows][k+1],rings[rows][k]]);for(let j=0;j<rows;j++)edge.push([rings[j+1][0],rings[j][0]],[rings[j][cols],rings[j+1][cols]]);
   for(const [a,b]of edge){const p=add(a.p,mul(a.n,thickness*.5)),q=add(b.p,mul(b.n,thickness*.5)),r=add(a.p,mul(a.n,-thickness*.5)),s=add(b.p,mul(b.n,-thickness*.5)),n=norm(cross(sub(q,p),sub(r,p))),co=(typeof col==='function'?col(a.t,a.x):col).map(c=>c*.77);tri(p,q,r,n,n,n,co,kind,[a.uv,b.uv,a.uv],phase);tri(r,q,s,n,n,n,co,kind,[a.uv,b.uv,b.uv],phase);mesh.preview.push({pts:[p,q,s,r],n,c:co,kind,phase});}
  }
 }
 function length(p){return Math.hypot(...p)}
 function lathe(p,d,len,radius,col,kind=.36,rows=fine?40:6,sides=fine?40:8){const [a,b]=frame(d);patch((t,x)=>{const angle=(x+1)*Math.PI,r=radius(t);return add(add(p,mul(d,len*t)),add(mul(a,Math.cos(angle)*r),mul(b,Math.sin(angle)*r)))},rows,sides,col,kind,0,[TAU*Math.max(radius(.35),radius(.5)),len],seed*.013);}
 function stalk(len,radius){lathe(base,axis,len,t=>radius*(1-.25*t),[.25,.19,.11],.36,fine?16:3,fine?14:5);return add(base,mul(axis,len));}
 function wing(p,d,w,l,col){const [a,b]=frame(d);patch((t,x)=>add(add(p,mul(d,l*t)),add(mul(a,x*w*Math.pow(Math.sin(Math.PI*t),.65)),mul(b,l*.05*Math.sin(t*Math.PI)*x*x))),fine?12:2,fine?6:2,col,.42,fine?.000025:0,[w*2,l],seed*.07);}

 if(type==='pine'){
  const young=stage==='developing',L=young?rnd(1,.016,.024):rnd(1,.038,.062),radius=L*(young?.29:.28),p=stalk(rnd(2,.004,.008),L*.025),opening=young?0:stage==='released'?Math.max(.75,cfg.coneOpening??.45):clamp(cfg.coneOpening??.45,0,1),count=fine?88:55;
  const coneRadius=t=>radius*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.65)*(1.18-.34*t),core=L*.075;
  lathe(p,axis,L,t=>Math.max(core*Math.pow(Math.sin(Math.PI*t),.6),coneRadius(t)*mix(.88,.20,opening)),young?[.23,.29,.13]:[.18,.115,.065],.32,fine?40:8,fine?24:8);
  let focusScore=-Infinity;
  for(let i=0;i<count;i++){
   const t=.045+.91*(i+.5)/count,theta=i*GOLD+seed*.03,rr=coneRadius(t),inner=Math.min(core,rr*.55),H=L*(.22+.025*hash(i+seed))*mix(.4,1,Math.sqrt(Math.sin(Math.PI*t))),angleWidth=.46*mix(.55,1,Math.sin(Math.PI*t)),alpha=opening*(.72+.10*hash(seed-i)),thickness=L*(young?.006:.010),phase=rnd(i+8,0,60);
   function point(q,x){
    const width=q<.52?.35*q/.52:q<.75?.35+.65*(q-.52)/.23:(1-q)/.25,angle=theta+x*angleWidth*width,hinge=t*L-H*.44;
    const keel=Math.max(0,1-Math.abs(q-.76)/.15)*Math.pow(Math.max(0,1-Math.abs(x)),.40),umbo=Math.exp(-Math.pow((q-.77)/.065,2)-Math.pow(x/.24,2));
    let r=inner+(rr-inner)*smooth(0,.61,q)+L*(.010*keel+.004*umbo-.002*x*x*width),z=t*L+(q-.44)*H;
    if(fine)r+=Math.sin(x*94+q*7+phase)*L*.00007*Math.sin(q*Math.PI);
    const dr=r-inner,dz=z-hinge;r=inner+dr*Math.cos(alpha)+dz*Math.sin(alpha);z=hinge-dr*Math.sin(alpha)+dz*Math.cos(alpha);
    return add(add(p,mul(axis,z)),add(mul(u,Math.cos(angle)*r),mul(v,Math.sin(angle)*r)));
   }
   const co=(young?[.25,.31,.15]:[.33,.225,.135]).map(c=>c*rnd(i+100,.83,1.13));const scaleColor=(q,x)=>{const scar=Math.exp(-Math.pow((q-.77)/.042,2)-Math.pow(x/.15,2)),wear=smooth(.82,1,q)*.12+smooth(.65,1,Math.abs(x))*.08;return co.map(c=>c*(1+wear-.40*scar));};patch(point,fine?24:3,fine?18:2,scaleColor,.32,thickness,[rr*angleWidth*2,H],phase);details.scales++;
   const face=point(.77,0),score=face[2]-Math.abs(t-.5)*L*.4;if(score>focusScore){focus=face;focusScore=score;}
   if(fine)details.scaleRecords.push({t,azimuth:theta,hinge:add(p,mul(axis,t*L-H*.44)),face,thickness,keel:L*.010,umbo:L*.004,spine:false});
   if(fine&&opening>.65&&t>.3&&t<.7&&i%13===0){const q=point(.23,0),side=add(mul(u,-Math.sin(theta)),mul(v,Math.cos(theta)));for(let s of [-1,1]){const seedPoint=add(q,mul(side,s*L*.035));lathe(seedPoint,axis,L*.05,a=>L*.022*Math.sin(Math.PI*a),[.20,.12,.06],.34,8,10);wing(seedPoint,axis,L*.022,L*.18,[.52,.39,.22]);details.wingedSeeds++;}details.seedPairs++;}
  }
  details.length=L;details.opening=opening;details.attachment=[...base];details.bodyBase=p;details.stalkLength=length(sub(p,base));
 }else if(type==='oak'){
  const young=stage==='developing',L=rnd(1,.023,.031)*(young?.62:1),r=L*.31,p=stalk(rnd(2,.028,.045),.00085),col=young?[.30,.36,.13]:[.39,.245,.105];
  lathe(p,axis,L,t=>r*Math.pow(Math.sin(Math.PI*t),.5)*(1.05-.22*t),col,.34,fine?64:10,fine?64:12);
  lathe(p,axis,L*.30,t=>r*1.11*Math.pow(Math.sin(t*Math.PI*.5),.65),[.26,.22,.13],.36,fine?30:6,fine?48:10);
  const count=fine?96:28;for(let i=0;i<count;i++){let t=.06+.87*(i+.5)/count,a=i*GOLD,rad=r*1.115*Math.pow(Math.sin(t*Math.PI*.5),.65),center=add(add(p,mul(axis,L*.30*t)),add(mul(u,Math.cos(a)*rad),mul(v,Math.sin(a)*rad))),side=add(mul(u,-Math.sin(a)),mul(v,Math.cos(a))),out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),size=L*.075;
   patch((q,x)=>add(center,add(mul(axis,(q-.5)*size*1.5),add(mul(side,x*size*Math.sin(q*Math.PI)),mul(out,size*.22*Math.sin(q*Math.PI)*(1-x*x))))),fine?8:2,fine?6:2,[.25,.22,.14].map(c=>c*rnd(i+10,.84,1.15)),.36,fine?.00010:0,[size*2,size*1.5],i);details.scales++;
  }
  lathe(add(p,mul(axis,L*.975)),axis,L*.025,t=>r*.065*Math.sin(Math.PI*t),[.22,.13,.06],.34,8,12);details.length=L;details.cupCoverage=.30;focus=add(add(p,mul(axis,L*.20)),mul(u,r));
 }else if(type==='willow'){
  const L=rnd(1,.026,.036),p=stalk(.006,.00045),opened=stage==='released',young=stage==='developing',count=fine?34:14;lathe(p,axis,L,t=>.00065*(1-.65*t),[.29,.32,.12],.38,fine?32:7,8);
  for(let i=0;i<count;i++){
   const t=.07+.86*(i+.5)/count,a=i*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),q=add(add(p,mul(axis,L*t)),mul(out,.0005)),d=norm(add(mul(out,.65),mul(axis,.65))),[side,n]=frame(d),len=rnd(i+4,.0028,.0042),width=len*.22;
   for(let sign of [-1,1]){patch((s,x)=>add(add(q,mul(d,len*s)),add(mul(side,x*width*Math.sin(Math.PI*s)),mul(n,sign*width*Math.sin(Math.PI*s)*(opened?1+s*2.5:1)))),fine?16:3,fine?8:2,young?[.30,.36,.12]:opened?[.39,.29,.16]:[.29,.34,.13],.38,fine?.000055:0,[width*2,len],i);}
   details.capsules++;if(opened&&fine){lathe(add(q,mul(d,len*.62)),d,.0011,s=>.00014*Math.sin(Math.PI*s),[.29,.20,.10],.34,6,8);details.seeds++;}if(opened){for(let k=0;k<(fine?10:2);k++){const z=k*GOLD+i,dir=norm(add(d,[Math.cos(z)*.8,Math.sin(z)*.35,Math.sin(z)*.8])),origin=add(q,mul(d,len*.7)),[edge]=frame(dir),hair=rnd(k+i+9,.003,.006);patch((s,x)=>add(add(origin,mul(dir,hair*s)),add(mul(edge,x*.000012),mul(n,Math.sin(s*4+i)*hair*.15*s))),fine?8:2,1,[.73,.72,.60],.44,0,[.000024,hair],i);details.silkyHairs++;}}
  }details.length=L;focus=add(add(p,mul(axis,L*.5)),mul(u,.003));
 }else{
  const L=rnd(1,.023,.033),p=stalk(.011,.0006),young=stage==='developing',released=stage==='released',count=fine?78:25;lathe(p,axis,L,t=>.0015*Math.pow(Math.sin(Math.PI*t),.4),[.26,.23,.12],.36,fine?40:8,10);
  for(let i=0;i<count;i++){
   if(released&&i%4===0)continue;const t=.025+.95*(i+.5)/count,a=i*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(v,Math.cos(a))),q=add(add(p,mul(axis,L*t)),mul(out,released?.0021:.0018)),size=.0021;
   patch((s,x)=>{const lobes=.65+.35*Math.cos(x*Math.PI*2),w=size*Math.sin(Math.PI*s);return add(q,add(mul(axis,(s-.5)*size*1.4+lobes*size*.4*s),add(mul(side,x*w),mul(out,size*.25*Math.sin(s*Math.PI)*(1-x*x)))));},fine?12:3,fine?10:2,young?[.29,.33,.12]:[.37,.265,.14],.36,fine?.00007:0,[size*2,size*1.8],i);details.bracts++;
   if(fine&&i%(released?2:3)===0){const nut=add(q,mul(out,.00035));lathe(nut,axis,.0018,s=>.0005*Math.sin(Math.PI*s),[.31,.20,.095],.34,8,10);for(let sign of [-1,1])wing(nut,norm(add(mul(side,sign),mul(axis,.15))),.00075,.0022,young?[.40,.43,.19]:[.55,.42,.24]);details.wingedSeeds++;}
  }details.length=L;focus=add(add(p,mul(axis,L*.5)),mul(u,.003));
 }
 return{...details,focus,inspectDistance:type==='pine'?.038:type==='oak'?.028:.018};
}
