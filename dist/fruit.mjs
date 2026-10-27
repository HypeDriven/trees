// Geometric reproductive structures, in metres. Surface amplitudes and
// developmental stages are illustrative; these are not scans or growth models.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)},mix=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))]};
const hash=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export const FRUIT_NOTES={
 jacaranda:{name:'Flattened woody capsule',source:'https://biodiversityadvisor.sanbi.org/search/detail/352061a0-edb2-43c9-b5b9-ed053ce81552',text:'A rounded, strongly flattened woody capsule with two finite-thickness valves. Release separates the valves to expose thin winged seeds. Older capsules can persist alongside new flowers.'},
 monkeytail:{name:'Bristly seed capsule',source:'https://pza.sanbi.org/xerophyta-retinervis',text:'An oblong capsule on a slender peduncle, with coarse brown emergences. The release study separates the three loculicidal sectors and shows sample small seeds; it does not simulate dispersal.'},
 eucalyptus:{name:'Woody gum-nut umbel',source:'https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f',text:'An umbel of small hemispherical woody capsules. Each has a thick raised rim, a recessed interior and four projecting valves. The release study opens the valve gaps and reveals sample seeds.'},
 baobab:{name:'Velvety woody capsule',source:'https://apps.worldagroforestry.org/treedb2/speciesprofile.php?Spid=143',text:'A pendant ovoid capsule with a woody shell and dense yellow-brown surface hairs. The capsule is indehiscent: it stays closed. Curved stalk, shell mottling, apical scar and fine surface fuzz are modeled.'},
 fevertree:{name:'Segmented seed pod',source:'https://apps.worldagroforestry.org/treedb/AFTPDFS/Acacia_xanthophloea.PDF',text:'A flattened, lightly curved pale brown pod with constrictions between seeds. The valves and edge sutures are separate geometry; the release study reveals the enclosed brown seeds.'},
 sausagetree:{name:'Pendant sausage fruit',source:'https://pza.sanbi.org/kigelia-africana',text:'A long grey-brown woody fruit supported by a rope-like hanging stalk. The closed shell has irregular coarse grain, lenticel-like flecks and an apical scar. Seed release through decay is not represented by opening valves.'},
 karee:{name:'Small drupe panicle',source:'https://pza.sanbi.org/searsia-lancea',text:'A branching female fruit cluster with small, slightly flattened drupes, ripening yellowish to brown. Each drupe has its own stalk, glossy skin and a small scar.'},
 sweetthorn:{name:'Curved seed pod',source:'https://pza.sanbi.org/vachellia-karroo',text:'Flat, sickle-shaped pods develop from green to dry brown. Two finite-thickness valves carry seed bulges and raised sutures; release separates the valves to reveal compressed seeds.'},
 marula:{name:'Detached marula drupe',source:'https://pza.sanbi.org/sclerocarya-birrea',text:'A female tree bears green, round to oval drupes. Final yellow ripening normally takes place after the fruit falls. The ripe study is detached; the whole-tree model retains green fruit. Skin mottling, fine pores and an apical scar are modeled.'},
 wildolive:{name:'Wild olive drupe',source:'https://pza.sanbi.org/sites/default/files/info_library/oleaeuropafric.pdf',text:'Small fleshy drupes ripen from green to purple-black. The surface has fine pale speckles, a short stalk, basal calyx and a small apical point. This is the small wild fruit, not a large cultivated olive.'},
 yellowwood:{name:'Seed and receptacle',source:'https://pza.sanbi.org/podocarpus-latifolius',text:'A female seed cone has an exposed grey-blue seed on a thickened fleshy receptacle which ripens red-purple. The seed and receptacle are separate geometry and materials. This reduced conifer cone has no woody pine scales.'},
 pine:{name:'Seed cone',source:'https://www.treesandshrubsonline.org/articles/pinus/pinus-sylvestris/',text:'Ovoid to conical seed cones, with overlapping woody scales, rhombic exposed faces, transverse keels and blunt dorsal umbos. A cone is a reproductive structure, not a botanical fruit. Opening is a drying response; it is independent of the season control here.'},
 oak:{name:'Stalked acorn',source:'https://plants.ces.ncsu.edu/plants/quercus-robur/',text:'An ovoid nut on a long stalk, with a scaly cup covering about a quarter to a third of its length. The cup, rim, shell and apical scar are separate geometric details.'},
 willow:{name:'Female fruiting catkin',source:'https://plants.ces.ncsu.edu/plants/salix-babylonica/',text:'A female fruiting catkin carries many small capsules. At seed release the two valves part and reveal seeds with silky hairs. This study represents a female tree.'},
 birch:{name:'Fruiting catkin',source:'https://plants.ces.ncsu.edu/plants/betula-pendula/',text:'A pendant cylindrical fruiting catkin, with overlapping three-lobed bracts and small winged nutlets. These are not woody pine scales.'}
};

export function buildFruit(mesh,cfg,{base=[0,0,0],axis=[0,-1,0],fine=false,attached=['tree','shoot'].includes(cfg.view),stage=cfg.fruitStage??'mature',seed=cfg.seed??2847}={}){
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

 if(type==='jacaranda'){
  const young=stage==='developing',D=rnd(1,.04,.060)*(young?.70:1),R=D*.5,H=D*.075,p=stalk(.010,.0008),opening=stage==='released'?.65:0,col=young?[.26,.33,.13]:[.28,.20,.12];
  for(const sign of [-1,1])patch((t,x)=>{const width=R*Math.pow(Math.sin(Math.PI*t),.52),bulge=Math.sqrt(Math.max(0,1-x*x))*Math.sin(Math.PI*t);return add(add(p,mul(axis,D*t)),add(mul(u,x*width),mul(v,sign*(H*bulge+D*opening*.30*Math.sin(Math.PI*t)))));},fine?80:10,fine?40:6,(t,x)=>col.map(c=>c*(.90+.12*Math.sin(t*27+x*8))),.32,fine?.0008:.0004,[D,D],seed);
  if(opening)for(let k=0;k<(fine?10:3);k++){const t=.23+.52*(k+.5)/(fine?10:3),q=add(add(p,mul(axis,D*t)),mul(u,rnd(k+5,-D*.23,D*.23))),length=rnd(k+12,.010,.015);patch((a,x)=>add(q,add(mul(axis,length*(a-.5)),mul(u,x*length*.55*Math.pow(Math.sin(Math.PI*a),.55)))),fine?18:3,fine?12:2,[.58,.48,.30],.42,fine?.000025:0,[length,length],k);lathe(add(q,mul(axis,-.0015)),axis,.003,a=>.0012*Math.sin(Math.PI*a),[.28,.18,.075],.34,8,10);details.wingedSeeds++;}
  details.length=D;details.valves=2;details.opening=opening;details.capsules=1;details.flattened=true;focus=add(add(p,mul(axis,D*.50)),mul(v,H+D*opening*.30));
 }else if(type==='monkeytail'){
  const young=stage==='developing',L=rnd(1,.013,.019),r=.0045,p=stalk(rnd(2,.10,.15),.00055),opening=stage==='released'?.0035:0,col=young?[.26,.33,.12]:[.29,.21,.12];
  const shell=(t,a,sector)=>{const rr=r*Math.pow(Math.sin(Math.PI*t),.35),spread=opening*Math.sin(Math.PI*t),sa=sector*TAU/3;return add(add(p,mul(axis,L*t)),add(add(mul(u,Math.cos(a)*rr),mul(v,Math.sin(a)*rr)),add(mul(u,Math.cos(sa)*spread),mul(v,Math.sin(sa)*spread))));};
  for(let k=0;k<3;k++)patch((t,x)=>shell(t,k*TAU/3+x*Math.PI/3,k),fine?48:8,fine?18:4,col,.36,fine?.00022:0,[r*TAU/3,L],seed+k);
  if(fine)for(let k=0;k<128;k++){const t=.06+.88*(k+.5)/128,a=k*GOLD,sector=Math.floor((((a+Math.PI/3)%TAU)+TAU)%TAU/(TAU/3)),q=shell(t,a,sector),out=norm(add(mul(u,Math.cos(a)),mul(v,Math.sin(a)))),edge=norm(cross(out,axis));patch((s,x)=>add(q,add(mul(out,.0016*s),add(mul(axis,.0007*s),mul(edge,x*.000055*(1-s))))),3,1,[.27,.18,.095],.36,0,[.00011,.002],k);details.surfaceHairs=(details.surfaceHairs??0)+1;}
  if(opening&&fine)for(let k=0;k<12;k++){const q=add(p,add(mul(axis,L*(.15+.65*k/12)),mul(u,rnd(k+7,-.001,.001))));lathe(q,axis,.0008,t=>.00025*Math.sin(Math.PI*t),[.08,.065,.04],.34,5,6);details.seeds++;}
  details.length=L;details.valves=3;details.capsules=1;details.opening=opening;focus=add(add(p,mul(axis,L*.55)),mul(u,r+opening));
 }else if(type==='eucalyptus'){
  details.valves=0;
  const young=stage==='developing',count=fine?9:7,p=stalk(.010,.00065),L=rnd(1,.0055,.008),r=L*.55,opened=stage==='released',col=young?[.29,.35,.16]:[.35,.26,.17];
  for(let k=0;k<count;k++){
   const a=k*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),q=add(p,add(mul(out,.010),mul(axis,.003))),d=norm(add(mul(axis,.35),mul(out,.9))),[aa,bb]=frame(d);lathe(p,norm(sub(q,p)),length(sub(q,p)),t=>.00038*(1-.3*t),[.34,.24,.15],.36,fine?4:2,fine?6:4);
   lathe(q,d,L,t=>r*Math.sqrt(t)*(1-.04*t),col,.36,fine?44:4,fine?40:6);lathe(add(q,mul(d,L*.38)),d,L*.62,t=>r*.82*Math.sqrt(t),col.map(c=>c*.55),.36,fine?32:3,fine?40:6);
   patch((t,x)=>{const angle=(x+1)*Math.PI,rr=r*(.82+.18*t);return add(add(q,mul(d,L+.00035*Math.sin(Math.PI*t))),add(mul(aa,Math.cos(angle)*rr),mul(bb,Math.sin(angle)*rr)));},fine?6:1,fine?40:6,col.map(c=>c*1.1),.36,0,[r*.18,TAU*r],seed+k);
   for(let valve=0;valve<4;valve++){const angle=valve*TAU/4,radial=add(mul(aa,Math.cos(angle)),mul(bb,Math.sin(angle))),edge=norm(cross(d,radial));patch((t,x)=>add(add(q,mul(d,L*(.76+.40*t))),add(mul(radial,r*(.78*(1-t)+(opened?.66:.18)*t)),mul(edge,x*r*.42*(1-t)))),fine?12:2,fine?8:1,col,.36,fine?.00013:0,[r,L*.4],valve);details.valves++;}
   if(opened&&fine){lathe(add(q,mul(d,L*.75)),d,.0007,t=>.00028*Math.sin(Math.PI*t),[.40,.29,.12],.34,5,6);details.seeds++;}details.capsules++;if(k===0)focus=add(add(q,mul(d,L)),mul(aa,r*.4));
  }details.length=L;details.raisedRims=count;details.projectingValves=true;
 }else if(type==='pine'){
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
 }else if(type==='sweetthorn'||type==='fevertree'){
  const fever=type==='fevertree',L=rnd(1,fever?.065:.08,fever?.13:.135)*(stage==='developing'?.70:1),W=rnd(2,fever?.0045:.0035,fever?.006:.0045),p=stalk(.009,.0005),count=Math.floor(rnd(3,7,12)),opened=stage==='released',col=stage==='developing'?[.23,.32,.10]:(fever?[.46,.35,.17]:[.34,.23,.12]);
  const center=t=>add(add(p,mul(axis,L*t)),mul(u,L*(fever?.07:.20)*Math.sin(Math.PI*t))),width=t=>W*Math.pow(Math.sin(Math.PI*t),.38)*(1-(fever?.25:.12)*Math.cos(t*count*TAU)),gap=t=>opened?L*.075*Math.sin(Math.PI*t):0;
  for(const sign of [-1,1]){
   patch((t,x)=>{const seedBulge=.0008*Math.pow(.5+.5*Math.cos((t-.04)*count*TAU),4)*(1-x*x),round=(1-x*x)*.00055;return add(center(t),add(mul(u,x*width(t)),mul(v,sign*(round+seedBulge+gap(t)))));},fine?100:14,fine?12:4,(t,x)=>col.map(c=>c*(.90+.10*Math.sin(t*count*TAU)**2+.06*Math.abs(x))),.36,fine?.00024:0,[W*2,L],seed);
   // Both longitudinal sutures remain distinct raised geometric strips.
   for(const edge of [-1,1])patch((t,x)=>add(center(t),add(mul(u,edge*width(t)+x*.00018),mul(v,sign*(gap(t)+.00026*Math.sin(Math.PI*(x+1)*.5))))),fine?80:12,2,col.map(c=>c*.75),.36,fine?.00008:0,[.00036,L],seed+1);
  }
  if(opened)for(let k=0;k<count;k++){const t=.09+.82*(k+.5)/count,q=add(center(t),mul(v,-gap(t)*.5)),d=norm(add(axis,mul(u,.25)));lathe(q,d,.006,s=>.0018*Math.pow(Math.sin(Math.PI*s),.6),[.27,.21,.12],.34,fine?24:5,fine?18:6);details.seeds++;}
  details.length=L;details.valves=2;details.sutures=2;details.opening=opened?1:0;focus=add(center(.52),mul(v,gap(.52)+.0014));
 }else if(type==='baobab'||type==='sausagetree'){
  const sausage=type==='sausagetree',young=stage==='developing',L=rnd(1,sausage?.32:.13,sausage?.65:.25)*(young?.62:1),r=L*(sausage?.105:.29),stalkLength=attached?rnd(2,sausage?.70:.18,sausage?1.35:.35):rnd(2,sausage?.45:.08,sausage?.75:.14),stalkRadius=sausage?.003:.0015;
  const center=t=>add(add(base,mul(axis,stalkLength*t)),add(mul(u,stalkLength*.018*Math.sin(t*Math.PI*1.7)),mul(v,stalkLength*.012*Math.sin(t*Math.PI*2))));
  patch((t,x)=>{const angle=(x+1)*Math.PI;return add(center(t),add(mul(u,Math.cos(angle)*stalkRadius),mul(v,Math.sin(angle)*stalkRadius)));},fine?80:10,fine?16:6,[.29,.245,.15],.36,0,[TAU*stalkRadius,stalkLength],seed);
  const p=center(1),col=young?[.29,.35,.15]:sausage?[.37,.34,.27]:[.43,.34,.19],shape=t=>Math.pow(Math.sin(Math.PI*t),sausage?.25:.54)*(sausage?(1-.06*t):(.94+.16*Math.sin(t*Math.PI)));
  const shell=(t,angle)=>{const wave=sausage?Math.sin(angle*17+t*9)*.00035:.0002*Math.sin(angle*23+t*12),grain=(Math.sin(angle*73+t*119+seed)+Math.sin(angle*151-t*87+seed))*(fine?(sausage?.00018:.00006):.000025),rr=Math.max(0,r*shape(t)+Math.sin(Math.PI*t)*(wave+grain));return add(add(p,mul(axis,L*t)),add(add(mul(u,Math.cos(angle)*rr),mul(v,Math.sin(angle)*rr)),mul(u,sausage?L*.025*Math.sin(Math.PI*t):0)));};
  patch((t,x)=>shell(t,(x+1)*Math.PI),fine?144:12,fine?96:12,(t,x)=>{const spot=hash(Math.floor(t*180)*151+Math.floor((x+1)*150)+seed);return col.map(c=>c*(.92+.09*Math.sin(t*31+x*7)+(spot>.94?.08:0)));},sausage?.395:.405,0,[TAU*r,L],seed);
  lathe(add(p,mul(axis,L*.996)),axis,L*.008,t=>r*.08*Math.sin(Math.PI*t),[.24,.20,.13],.36,8,12);
  if(!sausage&&fine){const hairs=640;for(let k=0;k<hairs;k++){const t=.03+.94*(k+.5)/hairs,a=k*GOLD,q=shell(t,a),normal=norm(add(mul(u,Math.cos(a)),mul(v,Math.sin(a)))),edge=norm(cross(normal,axis)),tip=add(q,add(mul(normal,rnd(k+8,.00045,.00085)),mul(axis,.0003)));patch((s,x)=>add(add(q,mul(sub(tip,q),s)),mul(edge,x*.000018*(1-s))),2,1,[.58,.49,.31],.405,0,[.000036,.0008],k);}details.surfaceHairs=hairs;}
  details.length=L;details.stalkLength=stalkLength;details.woodyShell=true;details.indehiscent=true;details.capsules=sausage?0:1;details.largeFruits=sausage?1:0;focus=shell(.52,0);
 }else if(type==='karee'){
  const young=stage==='developing',L=.0048,count=fine?18:7,p=stalk(.010,.00045),col=young?[.30,.35,.13]:[.45,.34,.14];
  for(let k=0;k<count;k++){const t=(k+.5)/count,a=k*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),origin=add(p,mul(axis,.025*t)),tip=add(origin,add(mul(out,.006+.011*Math.sin(Math.PI*t)),mul(axis,.004))),dir=norm(sub(tip,origin)),len=length(sub(tip,origin));lathe(origin,dir,len,s=>.00025*(1-.35*s),[.30,.25,.13],.36,fine?8:2,5);lathe(tip,axis,L,s=>L*.55*Math.pow(Math.sin(Math.PI*s),.48),col.map(c=>c*rnd(k+9,.91,1.09)),.34,fine?28:6,fine?24:8);lathe(add(tip,mul(axis,L*.98)),axis,.00016,s=>.00023*Math.sin(Math.PI*s),[.23,.17,.10],.34,5,8);}
  details.length=L;details.drupes=count;details.panicleLength=.035;focus=add(p,mul(u,.012));
 }else if(type==='marula'||type==='wildolive'){
  const young=stage==='developing',olive=type==='wildolive',L=olive?rnd(1,.008,.012):rnd(1,.032,.042),r=L*(olive?.43:.49),p=stalk(olive?.006:.012,olive?.0004:.0009),col=young?(olive?[.28,.35,.12]:[.30,.40,.13]):olive?[.055,.036,.075]:[.72,.56,.16];
  lathe(p,axis,L,t=>r*Math.pow(Math.sin(Math.PI*t),.52)*(1-.07*t),(t,x)=>{const fleck=hash(Math.floor(t*170)*197+Math.floor(x*240)+seed),mottle=.90+.10*Math.sin(t*37+x*16);return col.map((c,i)=>c*mottle+(fleck>.93?(olive?.06:.035):0)+(young?0:i===0?.008:0));},.34,fine?96:10,fine?96:14);
  // Persistent basal calyx and apical stigma scar.
  for(let k=0;k<(olive?4:5);k++){const a=k*TAU/(olive?4:5),d=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),side=norm(cross(axis,d)),size=olive?.00075:.0014;patch((t,x)=>add(p,add(mul(d,t*size),add(mul(axis,-size*.12*Math.sin(t*Math.PI)),mul(side,x*size*.35*Math.sin(t*Math.PI))))),fine?10:2,4,[.25,.22,.12],.36,fine?.00006:0,[size*.7,size],k);}
  lathe(add(p,mul(axis,L*.99)),axis,L*.025,t=>L*.018*Math.sin(Math.PI*t),olive?[.12,.08,.07]:[.40,.28,.12],.34,8,12);
  details.length=L;details.drupes=1;details.detachedRipe=!young&&!olive;details.skin='speckled dielectric';focus=add(add(p,mul(axis,L*.52)),mul(u,r));
 }else if(type==='yellowwood'){
  const young=stage==='developing',p=stalk(.007,.0005),R=rnd(1,.009,.013),S=rnd(2,.007,.011),receptacle=young?[.27,.36,.13]:[.40,.075,.18];
  lathe(p,axis,R,t=>R*.44*Math.pow(Math.sin(Math.PI*t),.34)*(1+.13*Math.sin(t*TAU)),receptacle,.38,fine?64:8,fine?64:12);
  const seedBase=add(p,mul(axis,R*.88));lathe(seedBase,axis,S,t=>S*.44*Math.pow(Math.sin(Math.PI*t),.5),young?[.21,.31,.18]:[.27,.31,.34],.34,fine?64:8,fine?64:12);
  lathe(add(seedBase,mul(axis,S*.98)),axis,.00035,t=>.00023*Math.sin(Math.PI*t),[.17,.19,.17],.34,8,10);
  details.length=R*.88+S;details.receptacles=1;details.exposedSeeds=1;details.seeds=1;focus=add(add(seedBase,mul(axis,S*.48)),mul(u,S*.44));
 }else{
  const L=rnd(1,.023,.033),p=stalk(.011,.0006),young=stage==='developing',released=stage==='released',count=fine?78:25;lathe(p,axis,L,t=>.0015*Math.pow(Math.sin(Math.PI*t),.4),[.26,.23,.12],.36,fine?40:8,10);
  for(let i=0;i<count;i++){
   if(released&&i%4===0)continue;const t=.025+.95*(i+.5)/count,a=i*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(v,Math.cos(a))),q=add(add(p,mul(axis,L*t)),mul(out,released?.0021:.0018)),size=.0021;
   patch((s,x)=>{const lobes=.65+.35*Math.cos(x*Math.PI*2),w=size*Math.sin(Math.PI*s);return add(q,add(mul(axis,(s-.5)*size*1.4+lobes*size*.4*s),add(mul(side,x*w),mul(out,size*.25*Math.sin(s*Math.PI)*(1-x*x)))));},fine?12:3,fine?10:2,young?[.29,.33,.12]:[.37,.265,.14],.36,fine?.00007:0,[size*2,size*1.8],i);details.bracts++;
   if(fine&&i%(released?2:3)===0){const nut=add(q,mul(out,.00035));lathe(nut,axis,.0018,s=>.0005*Math.sin(Math.PI*s),[.31,.20,.095],.34,8,10);for(let sign of [-1,1])wing(nut,norm(add(mul(side,sign),mul(axis,.15))),.00075,.0022,young?[.40,.43,.19]:[.55,.42,.24]);details.wingedSeeds++;}
  }details.length=L;focus=add(add(p,mul(axis,L*.5)),mul(u,.003));
 }
 return{...details,focus,inspectDistance:type==='jacaranda'?.035:type==='monkeytail'?.018:type==='eucalyptus'?.016:type==='baobab'?.060:type==='sausagetree'?.070:type==='fevertree'?.028:type==='karee'?.016:type==='pine'?.038:type==='sweetthorn'?.028:type==='marula'?.030:type==='oak'?.028:.018};
}
