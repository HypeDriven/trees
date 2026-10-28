import {buildNeedle,fascicleParameters,NEEDLE_REFERENCES} from './needle-anatomy.mjs?v=19';
import {organHash,organDirection} from './organ-distribution.mjs?v=19';
import {buildFlowers,FLOWER_NOTES} from './flowers.mjs?v=19';
import {leafContour,triangulateContour,PALMATE_VEINS,veinDistance} from './leaf-shapes.mjs?v=19';
import {EAST_ASIAN_SPECIES} from './east-asia.mjs?v=19';
import {buildEastAsianOrgan} from './east-asia-organs.mjs?v=19';
import {jacarandaPinnaScale,bipinnatePinnaScale,pineNeedleLayout} from './compound-lod.mjs?v=19';
import {buildGardenFlowers} from './garden-flowers.mjs?v=19';
import {SOUTH_AFRICAN_SPECIES} from './south-africa.mjs?v=19';
import {buildFruit,FRUIT_NOTES} from './fruit.mjs?v=19';
import {shootGrowth,leafDevelopment,shootNodePosition,springPhenology,FOLIAGE_REFERENCES} from './foliage-growth.mjs?v=19';
import {buildTreeArchitecture,ARCHITECTURE_NOTES} from './architecture.mjs?v=19';
import {LEAF_ANATOMY,dichotomousVeinDistance} from './leaf-anatomy.mjs?v=19';
import {woodTube,woodRadius} from './wood.mjs?v=19';
import {buildRootSystem,ROOT_PROFILES} from './roots.mjs?v=19';
// All geometry uses metres. Traits are a morphological model, not a growth simulator.
export {NEEDLE_REFERENCES,ARCHITECTURE_NOTES,FOLIAGE_REFERENCES,FRUIT_NOTES,FLOWER_NOTES};
export const SPECIES = {
 ...SOUTH_AFRICAN_SPECIES,...EAST_ASIAN_SPECIES,
 oak: {name:'English oak',latin:'Quercus robur',family:'Fagaceae',leaf:[.05,.15],length:.09,petiole:[.002,.006],width:.34,bud:.005,veins:6,rows:10,twig:[.23,.19,.12],leafColor:[.11,.23,.045],fall:[.40,.23,.055],source:'https://www.worldfloraonline.org/taxon/wfo-0000292858',habit:'Broad, irregular crown; sturdy, sinuous limbs.',traits:['Alternate leaves; rounded lobes and basal auricles','Short petiole · 2–6 mm','Clustered terminal buds; stalked acorns'],range:'Blade length 50–150 mm; modeled within that typical range.',limitations:'Lobe number, pubescence and acorn form vary. Juvenile oaks can retain dead leaves; that variability is not simulated.'},
 willow:{name:'Weeping willow',latin:'Salix babylonica',family:'Salicaceae',leaf:[.075,.15],length:.11,petiole:[.003,.006],width:.075,bud:.003,veins:15,rows:8,twig:[.34,.31,.075],leafColor:[.25,.35,.10],fall:[.61,.48,.085],source:'https://plants.ces.ncsu.edu/plants/salix-babylonica/',habit:'Low forks and spreading boughs; slender hanging shoots.',traits:['Alternate, lanceolate leaves with fine serrations','Glaucous lower surface; short petioles','Appressed single-scale lateral buds; no terminal bud'],range:'Blade length 75–150 mm; blade width varies with length.',limitations:'The spring study models a female specimen. Many cultivated weeping willows are hybrids; this is not a model of every cultivar.'},
 pine:{name:'Scots pine',latin:'Pinus sylvestris',family:'Pinaceae',leaf:[.038,.089],length:.06,petiole:[.002,.004],width:.001,bud:.01,veins:0,rows:6,twig:[.32,.23,.10],leafColor:[.12,.25,.19],fall:[.12,.25,.19],source:'https://plants.ces.ncsu.edu/plants/pinus-sylvestris/',habit:'Whorled scaffold branches; irregular crown with maturity.',traits:['Two twisted needles per fascicle, with a basal sheath','Evergreen foliage; orange-red upper bark','Scaly seed cones; spring candles and pollen cones'],range:'Needle length 38–89 mm; widths are modeled at 1–2 mm.',limitations:'Needle cohorts are simplified. Cone development spans more than one season; cone stages and scale counts are illustrative rather than a complete developmental sequence.'},
 birch:{name:'Silver birch',latin:'Betula pendula',family:'Betulaceae',leaf:[.032,.075],length:.05,petiole:[.012,.025],width:.33,bud:.004,veins:6,rows:12,twig:[.20,.12,.075],leafColor:[.20,.34,.065],fall:[.64,.49,.07],source:'https://plants.ces.ncsu.edu/plants/betula-pendula/',habit:'Slender leader, ascending limbs and drooping fine twigs.',traits:['Alternate deltoid leaves, doubly serrate margins','White older branches; brown, resin-warty fine twigs','Horizontal lenticels; male and female catkins'],range:'Blade length 32–75 mm; petiole length varies independently.',limitations:'Bark becomes darker with maturity. Leaf and shoot proportions vary across the silver-birch complex; individual populations are not resolved.'}
};
export function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const frame=d=>{let u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))]};
const contourSpans=Object.fromEntries(Object.keys(PALMATE_VEINS).map(type=>[type,leafContour(type)]));
export function bladeWidth(type,t,side=1){
 // A span is retained for callers; concave blades are built from their full contour.
 if(contourSpans[type]){let width=0,points=contourSpans[type];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=t&&b[1]>t)||(b[1]<=t&&a[1]>t))width=Math.max(width,Math.abs(a[0]+(b[0]-a[0])*(t-a[1])/(b[1]-a[1])));}return width/SPECIES[type].width;}
 if(type==='redbud'&&t===0)return .52;
 if(t<=0||t>=1)return 0;
 if(type==='redbud')return (.52+.48*Math.pow(Math.sin(Math.PI*t),.65))*Math.pow(1-t,.55);
 if(type==='ginkgo')return Math.pow(t,.75);
 if(type==='dawnredwood')return Math.pow(Math.sin(Math.PI*t),.35)*(1-.25*t);
 if(type==='sakura')return Math.pow(Math.sin(Math.PI*Math.pow(t,.80)),.85)*(.92+.08*(1-Math.abs((t*38%1)*2-1)));
 if(type==='oak'){// Five rounded lateral lobes, obovate outline and basal auricles.
  const envelope=Math.pow(Math.sin(Math.PI*t),.55)*(.58+.55*t);
  const lobes=.72+.28*Math.cos((t-.08)*Math.PI*10+side*.14);
  return envelope*lobes+.24*Math.exp(-Math.pow((t-.055)/.035,2));
 }
 if(type==='jacaranda')return Math.pow(Math.sin(Math.PI*Math.pow(t,.84)),.82)*(t>.76?Math.pow((1-t)/.24,.30):1);
 if(type==='monkeytail')return t<.82?(.88+.12*Math.sin(t*Math.PI))*(1+.015*Math.sin(t*150)):Math.pow((1-t)/.18,.70);
 if(type==='eucalyptus')return Math.pow(Math.sin(Math.PI*Math.pow(t,.85)),.92);
 if(type==='fevertree')return Math.pow(Math.sin(Math.PI*t),.43)*(1-.08*t);
 if(type==='baobab')return Math.pow(Math.sin(Math.PI*Math.pow(t,.90)),.80);
 if(type==='sausagetree')return Math.pow(Math.sin(Math.PI*Math.pow(t,.92)),.67)*(1+.022*Math.sin(t*Math.PI*7));
 if(type==='karee')return Math.pow(Math.sin(Math.PI*t),.83);
 if(type==='sweetthorn')return Math.pow(Math.sin(Math.PI*t),.40)*(1-.12*t);
 if(type==='marula')return Math.pow(Math.sin(Math.PI*Math.pow(t,.88)),.74);
 if(type==='wildolive')return Math.pow(Math.sin(Math.PI*t),.85);
 if(type==='yellowwood')return Math.pow(Math.sin(Math.PI*t),.38);
 if(type==='birch'){let e=t<.30?t/.30:Math.pow((1-t)/.70,1.35);let tooth=(1-Math.abs((t*16%1)*2-1))*.13+(1-Math.abs((t*32%1)*2-1))*.055;return e*(.82+tooth)}
 return Math.pow(Math.sin(Math.PI*Math.pow(t,.78)),.9)*(1+.04*(1-Math.abs((t*32%1)*2-1)));
}
class Mesh {
 constructor(){this.a=new Float32Array(14*65536);this.used=0;this.preview=[];this.batches=[];}
 reserve(n){if(this.used+n<=this.a.length)return;let a=new Float32Array(Math.max(this.a.length*2,this.used+n));a.set(this.a);this.a=a}
 v(p,n,c,kind,phase,flutter,uv){this.reserve(14);let o=this.used,a=this.a;for(let i=0;i<3;i++){a[o+i]=p[i];a[o+3+i]=n[i];a[o+6+i]=c[i]}a[o+9]=kind;a[o+10]=phase;a[o+11]=flutter;a[o+12]=uv[0];a[o+13]=uv[1];this.used+=14}
 tri(a,b,c,n,col,kind=0,phase=0,fl=[0,0,0],uv=[[0,0],[0,0],[0,0]]){this.v(a,n,col,kind,phase,fl[0],uv[0]);this.v(b,n,col,kind,phase,fl[1],uv[1]);this.v(c,n,col,kind,phase,fl[2],uv[2])}
}
export function buildSpecimen(cfg,{hidden=false,preview=true}={}){
 const phenology=springPhenology(cfg),sp=SPECIES[cfg.type],pineLike=cfg.type==='pine'||cfg.type==='chinesepine',random=seeded(cfg.seed),R=(a,b)=>a+(b-a)*random(),m=new Mesh(),fine=cfg.view!=='tree',mature=cfg.maturity??.6;
 if(!preview)m.preview={push(){}};let rootSystem=null;let inspectFocus=null,inspectDistance=null,woodStats={tubes:0,collars:0,rootFlares:0};let records=[],leaves=0,fascicles=0,buds=0,flowers=0,fruits=0,petioles=0,stats={flowerArrangements:[],needleFascicles:[],leafAnatomy:[],leafGlands:0,leafHairs:0,retainedShoots:0,pineCards:0,pineVariants:[],sprayCards:0,spurs:[],deciduousSprays:0,compoundLeaves:0,pinnae:0,compoundRecords:[],spinePairs:0,oppositePairs:[],whorls:[],rosettes:[],flowerDetails:[],fruitDetails:[],organGrowth:[],leafLengths:[],petioleLengths:[],fascicleSizes:[],leafNodes:0,terminalBuds:0};
 function surfaceQuad(a,b,c,d,n,col,kind=0,phase=0,uv=[[0,0],[0,1],[1,0],[1,1]],fl=[0,0,0,0]){let cr=cross(sub(b,a),sub(c,a));if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){m.tri(a,c,b,n,col,kind,phase,[fl[0],fl[2],fl[1]],[uv[0],uv[2],uv[1]]);m.tri(c,d,b,n,col,kind,phase,[fl[2],fl[3],fl[1]],[uv[2],uv[3],uv[1]])}else{m.tri(a,b,c,n,col,kind,phase,[fl[0],fl[1],fl[2]],[uv[0],uv[1],uv[2]]);m.tri(c,b,d,n,col,kind,phase,[fl[2],fl[1],fl[3]],[uv[2],uv[1],uv[3]])}}
 function tube(points,r0,r1,col,kind=0,sides=6,ridge=0){if(kind===0){let downward=points[0][1]>points.at(-1)[1]&&points.at(-1)[1]<.05;let root=points[0][1]<.01&&r0>.04,collar=cfg.type!=='monkeytail'&&!root&&!downward&&points[0][1]>.1&&r0>.007;let result=woodTube(m,points,r0,r1,cfg.type,{fine:['wood','bark','roots','fruit'].includes(cfg.view),macro:cfg.view==='bark'&&woodStats.tubes===0,focusT:cfg.barkPosition??.44,maturity:mature,treeHeight:cfg.height,root,collar,preview,cap:['wood','bark','roots','fruit'].includes(cfg.view)});if(result.study)woodStats.study=result.study;woodStats.tubes++;woodStats.collars+=Number(collar);woodStats.rootFlares+=Number(root);return result}let rings=[],distance=0;for(let j=0;j<points.length;j++){if(j)distance+=Math.hypot(...sub(points[j],points[j-1]));let d=norm(sub(points[Math.min(j+1,points.length-1)],points[Math.max(0,j-1)])),[u,v]=frame(d),t=j/(points.length-1),radius=r0*(1-t)+r1*t;let rr=[];for(let k=0;k<=sides;k++){let a=k/sides*Math.PI*2,flute=1+ridge*(.5+.5*Math.sin(a*9+distance*.5));let n=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));rr.push({p:add(points[j],mul(n,radius*flute)),n,uv:[k/sides,distance]})}rings.push(rr)}for(let j=0;j<rings.length-1;j++)for(let k=0;k<sides;k++){let a=rings[j][k],b=rings[j+1][k],c=rings[j][k+1],d=rings[j+1][k+1];let n=norm(add(a.n,c.n));surfaceQuad(a.p,b.p,c.p,d.p,n,col,kind,0,[a.uv,b.uv,c.uv,d.uv]);m.preview.push({pts:[a.p,b.p,d.p,c.p],n,c:col,kind,phase:0})}}
 function solid(p,dir,len,width,col,kind=.3,scales=false){let [u,v]=frame(dir),sides=fine?12:4,rows=fine?(scales?10:6):2;let rings=[];for(let j=0;j<=rows;j++){let t=j/rows,rr=Math.sin(Math.PI*t)*width*(1-.3*t);rings.push(Array.from({length:sides+1},(_,k)=>{let a=k/sides*6.283,scale=scales?1+.15*Math.sin(k*2.4+j*3.3):1;return add(add(p,mul(dir,len*t)),mul(add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),rr*scale))}))}for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){let a=rings[j][k],b=rings[j+1][k],c=rings[j][k+1],d=rings[j+1][k+1];let n=norm(cross(sub(b,a),sub(c,a))),shade=scales?.74+.26*((j+k)%3)/2:1,co=col.map(x=>x*shade);surfaceQuad(a,b,c,d,n,co,kind);m.preview.push({pts:[a,b,d,c],n,c:co,kind,phase:0})}}
 function bud(p,dir,terminal=false){if(cfg.type==='monkeytail'||(cfg.type==='willow'&&terminal))return;let len=sp.bud*R(.8,1.2),col=pineLike?[.34,.17,.065]:[.24,.12,.055];if(fine)solid(p,dir,len,len*.27,col,.3,cfg.type!=='willow');else{let [u,v]=frame(dir),a=add(p,mul(u,len*.25)),b=add(p,add(mul(u,-len*.15),mul(v,len*.22))),c=add(p,add(mul(u,-len*.15),mul(v,-len*.22))),top=add(p,mul(dir,len));for(let pts of [[a,b,top],[b,c,top],[c,a,top],[a,c,b]]){let n=norm(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])));m.tri(...pts,n,col,.3);if(preview)m.preview.push({pts,n,c:col,kind:.3,phase:0})}}buds++;if(terminal)stats.terminalBuds++}
 function lamina(p,axis,len,phase,kind=1,expansion=1,compoundPart=false,planeNormal=null,form={}){
  let [side,up]=planeNormal?[norm(cross(axis,planeNormal)),planeNormal]:frame(axis);if(sp.region&&!planeNormal){const aligned=['leaf','surface'].includes(cfg.view),roll=R(aligned?-.08:-1.1,aligned?.08:1.1),old=side;side=add(mul(side,Math.cos(roll)),mul(up,Math.sin(roll)));up=add(mul(up,Math.cos(roll)),mul(old,-Math.sin(roll)));}let twist=R(-.12,.12),rows=fine?(compoundPart?(cfg.type==='jacaranda'&&cfg.view==='shoot'?8:24):96):sp.rows,width=cfg.type==='monkeytail'?Math.max(.001,Math.min(.004,len*sp.width)):len*sp.width,fold=R(.06,.13)+(1-expansion)*.24,flutterScale=len/cfg.leafSize,color=cfg.season==='autumn'?sp.fall:sp.leafColor;
  let tint=R(.93,1.07)*(cfg.season==='spring'?1.10:1)*(1+(1-expansion)*.12),col=color.map(x=>x*tint);if(cfg.season==='autumn'&&['maple','sweetgum'].includes(cfg.type)){let gold=R(0,1);col=col.map((c,i)=>c*(1-gold)+[.75,.48,.055][i]*gold);}
  if(PALMATE_VEINS[cfg.type]){contouredLamina(p,axis,side,up,len,phase,col,kind,expansion,fold,twist);return;}
  const point=(t,x,underside=false)=>{
   const w=bladeWidth(cfg.type,t,x<0?-1:1)*width;
   if(cfg.type==='ginkgo'){
    const theta=x*1.02,r=t*len*(1-(form.ginkgoNotch??.14)*Math.exp(-Math.pow(x/.12,2)))*(1+.009*Math.cos(x*25)),rib=Math.exp(-Math.pow(dichotomousVeinDistance(x*.5+.5,t)/.004,2)),relief=(underside?-.00017:.000012)*rib;
    return add(p,add(mul(axis,Math.cos(theta)*r),add(mul(side,Math.sin(theta)*r),mul(up,-r*r/len*.065+relief-(underside?.00011:0)))));
   }
   let center=add(p,add(mul(axis,len*(t-(cfg.type==='redbud'?.16*Math.pow(Math.abs(x),.7)*Math.pow(1-t,3):0))),add(mul(up,len*(-.12*t*t+.035*Math.sin(t*6.28))),mul(side,['karee','eucalyptus'].includes(cfg.type)?len*.12*Math.sin(Math.PI*t)*t:0))));
   let mid=Math.exp(-Math.pow(x/.045,2))*(1-t*.65),f=((t-Math.abs(x)*.13-x*x*.06)*sp.veins)%1,dist=Math.min(Math.abs(f),1-Math.abs(f)),vein=sp.veins?Math.exp(-Math.pow(dist/.045,2)):0;
   if(['maple','sweetgum','redbud'].includes(cfg.type)){let closest=1;const angles=cfg.type==='sweetgum'?[0,-.95,.95]:[0,-.60,.60,-1.05,1.05];for(const a of angles)closest=Math.min(closest,Math.abs(x*w*Math.cos(a)-len*t*Math.sin(a)));vein=Math.exp(-Math.pow(closest/.00016,2));mid*=.4;}
   const thickness=LEAF_ANATOMY[cfg.type].thickness,relief=(underside?-thickness-.00010*mid-.00003*vein:.000025*mid+.000008*vein)*(compoundPart&&sp.compound==='bipinnate'?.60:1);
   return add(center,add(mul(side,x*w),mul(up,(cfg.type==='monkeytail'?Math.abs(x)*w*.75-.00018*Math.exp(-Math.pow(x/.08,2))*(1-t):Math.abs(x)*w*fold)+twist*t*x*w+relief-(cfg.type==='wildolive'?w*.20*Math.pow(Math.abs(x),8):0))));
  };
  if(!fine&&sp.region&&!sp.outline){const tv=[[.5,0],[0,.30],[1,.30],[0,.70],[1,.70],[.5,1]],pts=tv.map(([x,t])=>point(t,x*2-1));for(const i of[0,1,2,1,3,2,3,4,2,3,5,4])m.v(pts[i],up,col,kind,phase,tv[i][1]*flutterScale,tv[i]);
  }else if(!fine){const edgeSamples=['maple','sweetgum'].includes(cfg.type)?28:cfg.type==='redbud'?9:cfg.type==='sakura'?6:cfg.type==='sweetthorn'?4:cfg.type==='willow'?6:10,boundary=[];for(let j=0;j<edgeSamples;j++){let t=j/edgeSamples;boundary.push([t,-1])}for(let j=edgeSamples;j>0;j--){let t=j/edgeSamples;boundary.push([t,1])}if(['maple','sweetgum'].includes(cfg.type)){const stops=cfg.type==='maple'?[0,.22,.34,.53,.68,.83,1]:[0,.20,.42,.60,.79,1];boundary.splice(0,boundary.length,...stops.map(t=>[t,-1]),...stops.slice(1,-1).reverse().map(t=>[t,1]));}if(cfg.type==='ginkgo')boundary.splice(0,boundary.length,[0,0],...Array.from({length:15},(_,j)=>[1,-1+j/7]));if(cfg.type==='redbud')boundary.push([0,1]);if(cfg.type==='redbud')for(let j=9;j>=0;j--)boundary.push([0,j/5-1]);const center=point(.5,0);for(let i=0;i<boundary.length;i++){let [t,x]=boundary[i],[tt,xx]=boundary[(i+1)%boundary.length],a=point(t,x),b=point(tt,xx),n=norm(cross(sub(a,center),sub(b,center)));for(let [p,uv,fl]of [[center,[.5,.5],.5],[a,[x*.5+.5,t],t],[b,[xx*.5+.5,tt],tt]])m.v(p,n,col,kind,phase,fl*flutterScale,uv)}}else{
  const columns=fine?(cfg.type==='ginkgo'?32:compoundPart?(cfg.type==='jacaranda'&&cfg.view==='shoot'?2:4):8):2;
  function normalAt(t,x,underside){let dx=sub(point(t,Math.min(1,x+2/columns),underside),point(t,Math.max(-1,x-2/columns),underside)),dt=sub(point(Math.min(.9999,t+1/rows),x,underside),point(Math.max(.0001,t-1/rows),x,underside));let n=norm(cross(dx,dt));if(Math.hypot(...n)<.5)n=up;return underside?mul(n,-1):n}
  for(let back=0;back<(fine?2:1);back++)for(let j=0;j<rows;j++)for(let k=0;k<columns;k++){let t=j/rows,s=(j+1)/rows,x=k/columns*2-1,y=(k+1)/columns*2-1,coords=[[t,x],[s,x],[t,y],[s,y]],pts=coords.map(([t,x])=>point(t,x,!!back)),ns=coords.map(([t,x])=>normalAt(t,x,!!back)),indices=back?[0,1,2,2,1,3]:[0,2,1,2,3,1];for(let q of indices){let [tt,xx]=coords[q];m.v(pts[q],ns[q],col,back?1.02:kind,phase,tt*flutterScale,[xx*.5+.5,tt])}}
  }
  if(fine){for(let sign of [-1,1])for(let j=0;j<rows;j++){let t=j/rows,s=(j+1)/rows;surfaceQuad(point(t,sign),point(s,sign),point(t,sign,true),point(s,sign,true),mul(side,sign),col.map(c=>c*.8),kind,phase,[[sign*.5+.5,t],[sign*.5+.5,s],[sign*.5+.5,t],[sign*.5+.5,s]],[t,s,t,s].map(x=>x*flutterScale))}}
  if(fine&&['ginkgo','redbud'].includes(cfg.type)){const t=cfg.type==='ginkgo'?1:0;for(let k=0;k<32;k++){const x=-1+k/16,xx=x+.0625;surfaceQuad(point(t,x),point(t,xx),point(t,x,true),point(t,xx,true),mul(axis,t?1:-1),col.map(c=>c*.8),kind,phase,[[x*.5+.5,t],[xx*.5+.5,t],[x*.5+.5,t],[xx*.5+.5,t]]);}}
  if(fine&&cfg.type==='sakura'){for(let j=0;j<44;j++){const t=.08+.83*j/44,x=(j%3-1)*.035,a=point(t,x,true),b=add(a,add(mul(up,-.00022),mul(axis,.00012))),c=add(a,mul(side,.000012));m.tri(a,b,c,side,[.55,.60,.40],.2);stats.leafHairs++;}}
  inspectFocus=point(cfg.surfacePosition??.55,0);
  // The software preview uses the same lobed/serrated outline at lower shading fidelity.
  let outline=[];for(let j=0;j<=rows;j+=fine?2:1)outline.push(point(j/rows,-1));for(let j=rows;j>=0;j-=fine?2:1)outline.push(point(j/rows,1));if(cfg.type==='ginkgo')outline=[point(0,0),...Array.from({length:33},(_,j)=>point(1,-1+j/16))];if(cfg.type==='redbud')for(let j=15;j>=0;j--)outline.push(point(0,-1+j/8));let veins=[];if(fine&&cfg.type==='ginkgo'){for(let k=0;k<17;k++)veins.push(Array.from({length:20},(_,j)=>point(j/19,-.95+k*.11875)));}else if(fine){veins.push(Array.from({length:25},(_,j)=>point(j/24,0)));for(let k=1;k<=sp.veins;k++){let t=.08+k/(sp.veins+1)*.72;for(let sign of [-1,1])veins.push(Array.from({length:9},(_,j)=>point(Math.min(.98,t+j/8*.16),sign*j/8)))}}m.preview.push({pts:outline,n:up,c:col,kind,phase,veins,size:len});leaves++;stats.leafLengths.push(len);if(fine)stats.leafAnatomy.push({type:cfg.type,venation:LEAF_ANATOMY[cfg.type].venation,thickness:LEAF_ANATOMY[cfg.type].thickness,expansion,rows,curved:true});
 }
 function contouredLamina(p,axis,side,up,len,phase,col,kind,expansion,fold,twist){
  const contour=leafContour(cfg.type,{fine,phase}),triangles=triangulateContour(contour),ratio=sp.width,flutterScale=len/cfg.leafSize,subdivisions=fine?(cfg.view==='surface'?4:cfg.view==='shoot'?1:3):0;
  const point=([x,y],back=false)=>{const vein=Math.exp(-Math.pow(veinDistance(cfg.type,x,y)/.006,2)),curl=-.085*y*y+.018*Math.sin(y*5.2),z=len*(curl+Math.abs(x)*fold*.50+twist*x*y)+(back?-LEAF_ANATOMY[cfg.type].thickness-.00007*vein:.00002*vein);return add(p,add(mul(axis,y*len),add(mul(side,x*len),mul(up,z))));};
  const normal=(q,back)=>{const [x,y]=q,dx=sub(point([x+.001,y],back),point([x-.001,y],back)),dy=sub(point([x,y+.001],back),point([x,y-.001],back)),n=norm(cross(dx,dy));return back?mul(n,-1):n;};
  const emit=(a,b,c,back)=>{for(const q of(back?[a,c,b]:[a,b,c]))m.v(point(q,back),normal(q,back),col,back?1.02:kind,phase,Math.max(0,q[1])*flutterScale,[.5+q[0]/(2*ratio),q[1]]);};
  const subdivide=(a,b,c,level,back)=>{if(!level){emit(a,b,c,back);return;}const mid=(a,b)=>a.map((v,i)=>(v+b[i])*.5),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);subdivide(a,ab,ca,level-1,back);subdivide(ab,b,bc,level-1,back);subdivide(ca,bc,c,level-1,back);subdivide(ab,bc,ca,level-1,back);};
  for(let back=0;back<(fine?2:1);back++)for(const ids of triangles)subdivide(...ids.map(i=>contour[i]),subdivisions,!!back);
  if(fine)for(let j=0;j<contour.length;j++)for(let k=0;k<2**subdivisions;k++){const start=contour[j],end=contour[(j+1)%contour.length],a=start.map((v,i)=>v+(end[i]-v)*k/(2**subdivisions)),b=start.map((v,i)=>v+(end[i]-v)*(k+1)/(2**subdivisions)),out=norm(add(mul(side,b[1]-a[1]),mul(axis,a[0]-b[0])));surfaceQuad(point(a),point(b),point(a,true),point(b,true),out,col.map(c=>c*.82),kind,phase,[[.5+a[0]/(2*ratio),a[1]],[.5+b[0]/(2*ratio),b[1]],[.5+a[0]/(2*ratio),a[1]],[.5+b[0]/(2*ratio),b[1]]]);}
  const veins=[];for(const end of PALMATE_VEINS[cfg.type]){veins.push(Array.from({length:24},(_,i)=>point(end.map(v=>v*i/23))));if(fine){const L=Math.hypot(...end),d=end.map(v=>v/L),side=[-d[1],d[0]];for(let j=0;j<4;j++)for(const sign of[-1,1]){const t=.24+j*.17,start=end.map(v=>v*t),dir=norm([d[0]+side[0]*sign*.85,d[1]+side[1]*sign*.85,0]),length=.18*(1-t);veins.push(Array.from({length:8},(_,i)=>point(start.map((v,k)=>v+dir[k]*length*i/7))));}}}
  m.preview.push({pts:contour.map(q=>point(q)),n:up,c:col,kind,phase,veins:fine?veins:[],size:len});inspectFocus=point([0,cfg.surfacePosition??.55]);leaves++;stats.leafLengths.push(len);
  if(fine)stats.leafAnatomy.push({type:cfg.type,contour:contour.map(q=>q.map(v=>v*len)),primaryVeins:PALMATE_VEINS[cfg.type].map(q=>q.map(v=>v*len)),venation:'palmate',expansion,curved:true,thickness:LEAF_ANATOMY[cfg.type].thickness});
 }
 function petioleGlands(p,axis,length){if(cfg.type!=='sakura'||!fine)return;const [side]=frame(axis),at=add(p,mul(axis,length*.88));for(const sign of[-1,1])solid(add(at,mul(side,sign*.00065)),axis,.0012,.00065,[.36,.22,.12],.3);stats.leafGlands+=2;}
 function compoundCard(p,axis,len,phase,pairs){
  let [side,up]=frame(axis);const roll=R(-1.05,1.05),old=side;side=add(mul(side,Math.cos(roll)),mul(up,Math.sin(roll)));up=add(mul(up,Math.cos(roll)),mul(old,-Math.sin(roll)));const L=len*(cfg.type==='jacaranda'?40:16),W=len*(cfg.type==='jacaranda'?12:5.5),col=(cfg.season==='autumn'?sp.fall:sp.leafColor).map(c=>c*R(.93,1.07)),kind=cfg.type==='jacaranda'?1.40+(pairs-6)*.01:(cfg.type==='fevertree'?1.30:1.20)+pairs*.01;
  const point=(t,x)=>add(add(p,mul(axis,L*t)),add(mul(side,x*W),mul(up,L*.10*Math.sin(t*Math.PI)*x*x))),uv=[[0,0],[0,1],[1,0],[1,1]],pts=uv.map(([x,t])=>point(t,x*2-1));
  for(const i of [0,2,1,2,3,1])m.v(pts[i],up,col,kind,phase,uv[i][1]*L/cfg.leafSize,uv[i]);
  if(preview){for(let j=0;j<pairs;j++)for(const hand of [-1,1]){const t=.16+j*.66/(pairs-1),scale=cfg.type==='jacaranda'?jacarandaPinnaScale(j/(pairs-1)):bipinnatePinnaScale(j/(pairs-1),cfg.type==='fevertree'),outline=[point(t,hand*.025),point(t-.025,hand*.48*scale),point(t+(cfg.type==='jacaranda'?.07:.10)*scale,hand*.94*scale),point(t+.035+(cfg.type==='jacaranda'?.07:.10)*scale,hand*.48*scale)];m.preview.push({pts:outline,n:up,c:col,kind:1,phase,size:len});}if(cfg.type==='jacaranda')m.preview.push({pts:[point(.84,0),point(.90,-.075),point(.997,0),point(.90,.075)],n:up,c:col,kind:1,phase,size:len});}
  const count=sp.terminalPinna?(pairs*2+1)*(2*sp.cardLeafletPairs+1):pairs*4*(sp.cardLeafletPairs??9);leaves+=count;stats.leafLengths.push(len);stats.compoundLeaves++;stats.pinnae+=pairs*2+(sp.terminalPinna?1:0);stats.compoundRecords.push({length:L,pinnae:pairs*2+(sp.terminalPinna?1:0),leaflets:count,leafletPairs:sp.cardLeafletPairs??9,pairs,terminalLeaflet:false,lod:'cutout'});
 }
 function radialLeaf(p,axis,len,phase,expansion){
  let [side,up]=frame(axis);const angle=R(cfg.view==='leaf'?-.15:-.8,cfg.view==='leaf'?.15:.8),old=side;side=add(mul(side,Math.cos(angle)),mul(up,Math.sin(angle)));up=add(mul(up,Math.cos(angle)),mul(old,-Math.sin(angle)));
  const palmate=sp.compound==='palmate',count=palmate?(random()<.5?5:7):3,pl=R(...sp.petiole)*(.55+.45*expansion),hub=add(p,mul(axis,pl)),attachments=[];
  fine?tube([p,hub],palmate?.001:.00065,palmate?.0007:.0004,sp.twig,.2,6):petioleRibbon(p,hub,palmate?.0008:.0005,sp.twig);petioles++;stats.petioleLengths.push(pl);
  for(let k=0;k<count;k++){const center=(count-1)/2,a=(k-center)*(palmate?4.0/(count-1):.68),d=norm(add(mul(axis,Math.cos(a)),mul(side,Math.sin(a)))),scale=1-(palmate?.30:.17)*Math.abs(k-center)/center,leafLength=Math.max(sp.leaf[0]*expansion,Math.min(sp.leaf[1]*expansion,len*scale));lamina(hub,d,leafLength,phase+k*.22,1,expansion,true,up);if(fine)attachments.push([...hub]);}
  stats.compoundLeaves++;stats.compoundRecords.push({length:pl+len,leaflets:count,pinnae:0,pairs:palmate?null:1,terminalLeaflet:true,arrangement:sp.compound,...(fine?{hub,attachments}:{} )});
 }
 function compoundLeaf(p,axis,len,phase,expansion=1){
  if(['palmate','trifoliate'].includes(sp.compound)){radialLeaf(p,axis,len,phase,expansion);return;}
  if(!fine&&sp.compound==='bipinnate'){compoundCard(p,axis,len,phase,Math.floor(R(...(sp.pinnaPairs?[sp.pinnaPairs[0],sp.pinnaPairs[1]+1]:[3,6]))));return;}
  let [side,up]=frame(axis);const roll=R(cfg.view==='leaf'?-.15:-.95,cfg.view==='leaf'?.15:.95),old=side;side=add(mul(side,Math.cos(roll)),mul(up,Math.sin(roll)));up=add(mul(up,Math.cos(roll)),mul(old,-Math.sin(roll)));const bipinnate=sp.compound==='bipinnate',pairs=bipinnate?Math.floor(R(...(sp.pinnaPairs?[sp.pinnaPairs[0],sp.pinnaPairs[1]+1]:[3,5]))):Math.floor(R(...(sp.leafPairs?[sp.leafPairs[0],sp.leafPairs[1]+1]:[4,7]))),L=bipinnate?len*(cfg.type==='jacaranda'?40:16):(cfg.type==='sausagetree'?Math.max(.18,Math.min(.50,len/expansion*3.8)):Math.max(.09,Math.min(.25,len/expansion*4.7)))*expansion,start=add(p,mul(axis,L*.10)),end=add(p,mul(axis,L*(bipinnate?.84:1))),before=leaves;
  const stem=(a,b,r)=>fine?tube([a,b],r,r*.55,sp.twig,.2,5):petioleRibbon(a,b,r,sp.twig);
  stem(p,end,bipinnate?.00025:.0006);petioles++;stats.petioleLengths.push((sp.petiole[0]+sp.petiole[1])*.5);let pinnae=0,pinnaRecords=[];
  for(let k=0;k<pairs+(sp.terminalPinna?1:0);k++){
   const jac=cfg.type==='jacaranda',terminalPinna=!!sp.terminalPinna&&k===pairs,position=k/Math.max(1,pairs-1),t=.15+.85*position,q=terminalPinna?end:bipinnate?add(p,mul(axis,L*(.16+.66*position))):mix(start,end,t);
   for(let sign of (terminalPinna?[1]:[-1,1])){
    const d=terminalPinna?axis:norm(add(mul(side,sign),mul(axis,jac?.28+.28*position:.22))),size=len*(.80+.20*Math.sin(Math.PI*(k+.5)/pairs));
    if(bipinnate){const PL=jac?(terminalPinna?L*.16:len*12*jacarandaPinnaScale(position)*R(.96,1.04)):len*5.5*bipinnatePinnaScale(position,cfg.type==='fevertree')*R(.96,1.04),pinnaAt=s=>add(q,add(mul(d,PL*s),mul(axis,PL*.08*Math.sin(Math.PI*s)))),tip=pinnaAt(1),lp=jac?Math.max(7,Math.min(20,Math.round(9+11*(terminalPinna?.55:jacarandaPinnaScale(position))))):Math.floor(R(...(sp.leafletPairs?[sp.leafletPairs[0],sp.leafletPairs[1]+1]:[7,11]))),pinnaSide=norm(cross(d,up));
     if(fine)tube(Array.from({length:6},(_,j)=>pinnaAt(j/5)),.00016,.00008,sp.twig,.2,5);else stem(q,tip,.00016);pinnae++;
     pinnaRecords.push({position:terminalPinna?1:position,length:PL,leafletPairs:lp,terminal:terminalPinna,start:q,tip});
     for(let j=0;j<lp;j++)for(let hand of [-1,1]){const s=jac?.10+.84*j/(lp-1):.13+.83*j/(lp-1),pos=pinnaAt(s+(jac?hand*.003:0)),leafAxis=jac?norm(add(mul(pinnaSide,hand),mul(d,.18+.15*s))):norm(add(mul(axis,hand),mul(d,.18))),taper=jac?(.60+.40*Math.sin(Math.PI*s))*(1-.35*s*s):(.72+.28*Math.sin(Math.PI*s))*(1-.24*s*s),leafLen=Math.max(sp.leaf[0]*expansion,Math.min(sp.leaf[1]*expansion,size*(.92+.08*Math.sin(j))*taper));lamina(pos,leafAxis,leafLen,phase+k*.7+j*.13,1,expansion,true,up);}
     if(sp.terminalPinna)lamina(tip,d,Math.max(sp.leaf[0]*expansion,len*.78),phase+k,1,expansion,true,up);
     // Petiolar/pinna glands are represented in the close organ study.
     if(fine&&!sp.terminalPinna)solid(add(q,mul(up,.0002)),up,.00045,.00024,[.18,.24,.07],.3);
    }else{const stalk=add(q,mul(d,.003));stem(q,stalk,.0003);lamina(stalk,d,Math.max(sp.leaf[0]*expansion,size),phase+k*.7,1,expansion,true,up);}
   }
  }
  if(!bipinnate)lamina(end,axis,len,phase+4,1,expansion,true,up);
  stats.compoundLeaves++;stats.pinnae+=pinnae;stats.compoundRecords.push({length:L,pinnae,leaflets:leaves-before,pairs,terminalLeaflet:!bipinnate,...(bipinnate?{pinnaRecords}:{} )});
 }
 function dawnSpray(p,axis,len,phase){
  let [side,up]=frame(axis),roll=R(-.5,.5),old=side;side=add(mul(side,Math.cos(roll)),mul(up,Math.sin(roll)));up=add(mul(up,Math.cos(roll)),mul(old,-Math.sin(roll)));
  const L=len*4.5,W=len,point=(t,x)=>add(p,add(mul(axis,L*t),add(mul(side,W*x),mul(up,L*.04*Math.sin(Math.PI*t)*x*x)))),uv=[[0,0],[0,1],[1,0],[1,1]],pts=uv.map(([x,t])=>point(t,x*2-1)),col=(cfg.season==='autumn'?sp.fall:sp.leafColor).map(c=>c*R(.93,1.07));
  for(const i of[0,2,1,2,3,1])m.v(pts[i],up,col,1.49,phase,uv[i][1]*4.5,uv[i]);
  if(preview&&stats.sprayCards%24===0)for(let j=0;j<8;j++)for(const sign of[-1,1]){const t=.08+j*.70/7,scale=bipinnatePinnaScale(j/7,true),q=[point(t,0),point(t+.045,sign*.55*scale),point(t+.11,sign*.94*scale),point(t+.065,sign*.55*scale)];m.preview.push({pts:q,n:up,c:col,kind:1,phase,size:len});}
  stats.sprayCards++;leaves+=48;stats.leafLengths.push(len);inspectFocus=point(.5,0);
 }
 function leafOrgan(base,ax,len,phase,expansion=1,form={}){
  if(cfg.type==='dawnredwood'&&!fine){const [side]=frame(ax),end=add(base,mul(ax,len*5));petioleRibbon(base,end,.00045,sp.twig);dawnSpray(end,ax,len,phase);for(let j=0;j<2;j++)for(const sign of[-1,1])dawnSpray(add(base,mul(ax,len*(1.1+j*2.4))),norm(add(mul(ax,.35),mul(side,sign*.94))),len*(.92+.07*j),phase+j+sign*.3);return;}
  if(sp.compound){compoundLeaf(base,ax,len,phase,expansion);return;}
  const pl=R(...sp.petiole)*(.55+.45*expansion),end=add(base,mul(ax,pl));fine?tube([base,end],.00045,.0003,sp.twig,.2,4):petioleRibbon(base,end,.0004,sp.twig);petioles++;stats.petioleLengths.push(pl);petioleGlands(base,ax,pl);lamina(end,ax,len,phase,1,expansion,false,null,form);
 }
 function spines(p,axis,out){const [side]=frame(axis),len=cfg.type==='fevertree'?R(.025,.075):R(.018,.045);for(let hand of [-1,1])solid(p,norm(add(mul(side,hand),mul(axis,.18))),len,len*.036,[.62,.61,.49],.3);stats.spinePairs++;}
 function pineCohort(p,axis,len,phase){
  const [u,v]=frame(axis),roll=R(0,6.283),col=sp.leafColor.map(c=>c*R(.90,1.08)),W=len*.85,L=len*1.8;
  for(let hand=0;hand<2;hand++){const variant=Math.floor(organHash(phase+hand*17)*8),a=roll+hand*(1.0+organHash(phase+31)*.90),side=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),up=norm(cross(side,axis)),point=(x,y)=>add(p,add(mul(axis,y*L),mul(side,x*W))),uv=[[0,0],[0,1],[1,0],[1,1]],pts=uv.map(([x,y])=>point(x*2-1,y));
   for(const i of[0,2,1,2,3,1])m.v(pts[i],up,col,1.191+variant*.001,phase,uv[i][1]*L/cfg.leafSize,uv[i]);
   if(preview&&stats.pineCards%3===0)for(const needle of pineNeedleLayout(variant)){const base=point(needle.a[0]/.85,needle.a[1]/1.8),tip=point(needle.b[0]/.85,needle.b[1]/1.8),width=mul(side,needle.width*len);m.preview.push({pts:[sub(base,width),add(base,width),tip],n:up,c:col,kind:1.1,phase,size:len});}

   stats.pineCards++;stats.pineVariants.push(variant);leaves+=24;for(let j=0;j<12;j++){fascicles++;stats.fascicleSizes.push(2);}stats.leafLengths.push(len);
  }
 }
 function needlePair(base,axis,len,phase,expansion=1){
  const parameters=fascicleParameters(cfg.type,cfg.seed,phase),[sharedSide,sharedUp]=frame(axis),end=add(base,mul(axis,parameters.sheathLength*(.65+.35*expansion))),col=sp.leafColor.map(x=>x*(.94+.12*organHash(phase+9))),records=[];
  tube(Array.from({length:6},(_,i)=>mix(base,end,i/5)),parameters.width*.58,parameters.width*.53,[.36,.27,.16],.2,fine?12:5);
  for(const hand of[-1,1]){
   const direction=norm(add(axis,mul(sharedUp,hand*parameters.divergence))),factor=1+(organHash(parameters.seed+hand*17)-.5)*.036,length=Math.max(sp.leaf[0]*expansion,Math.min(sp.leaf[1]*expansion,len*factor)),width=Math.max(cfg.type==='chinesepine'?.001:.0012,Math.min(cfg.type==='chinesepine'?.0015:.002,parameters.width*(1+(organHash(parameters.seed+hand*29)-.5)*.035))),detail=buildNeedle(m,cfg,{base:end,axis:direction,length,phase:phase+hand*.17,sharedSide,hand,parameters:{...parameters,width},fine,macro:cfg.view==='surface'&&leaves===0,colour:col});
   stats.leafAnatomy.push(detail);stats.leafLengths.push(length);records.push(detail);if(!stats.needleStudy&&['leaf','surface'].includes(cfg.view)){stats.needleStudy=detail;inspectFocus=cfg.needleFace==='flat'?detail.flatFocus:detail.convexFocus;inspectDistance=detail.inspectDistance;}leaves++;
  }
  fascicles++;stats.fascicleSizes.push(2);stats.needleFascicles.push({base:[...base],axis:[...axis],sheathLength:Math.hypot(...sub(end,base)),width:parameters.width,needles:records,expansion});
 }
 function flowerSolid(p,axis,L,W,col,kind=.3,scales=false){const key=cfg.seed+p[0]*173+p[1]*71+p[2]*193+stats.flowerArrangements.length*.37,d=organDirection(cfg.type,axis,p,key,{pendant:axis[1]<-.6}),scale=.86+.28*organHash(key+17);solid(p,d,L*scale,W*scale,col,kind,scales);stats.flowerArrangements.push({axis:d,length:L*scale,width:W*scale,base:[...p]});}
 function southernFlower(base){
  if(cfg.type==='fevertree'||cfg.type==='karee'){for(let k=0;k<3;k++){const q=add(base,[(k-1)*.009,-.006,k*.003]);flowerSolid(q,[0,1,0],cfg.type==='fevertree'?.012:.003,cfg.type==='fevertree'?.006:.0015,cfg.type==='fevertree'?[.75,.59,.045]:[.43,.45,.19],.3,true);flowers++;}return;}
  const baobab=cfg.type==='baobab',d=organDirection(cfg.type,[0,-1,0],base,cfg.seed+base[0]*73+base[1]*131,{pendant:true}),[side,up]=frame(d),stalk=baobab?.18:.40,p=add(base,mul(d,stalk)),L=baobab?.065:.08,color=baobab?[.78,.76,.63]:[.30,.055,.09],rows=fine?16:3,columns=fine?8:2;
  fine?tube([base,p],baobab?.0015:.002,.0009,sp.twig,.2,6):petioleRibbon(base,p,.001,sp.twig);
  for(let k=0;k<5;k++){const a=k*6.283/5,out=add(mul(side,Math.cos(a)),mul(up,Math.sin(a))),edge=norm(cross(d,out));const point=(t,x)=>add(p,add(mul(d,L*(baobab?.3*Math.sin(t*Math.PI):t)),add(mul(out,baobab?L*t:L*(.12+.65*t*t)),add(mul(edge,x*L*(baobab?.48:.42)*Math.sin(Math.PI*t)),mul(d,L*.08*Math.sin(x*7+t*12)*t)))));for(let j=0;j<rows;j++)for(let z=0;z<columns;z++){const t=j/rows,tt=(j+1)/rows,x=z/columns*2-1,xx=(z+1)/columns*2-1,q=[point(t,x),point(tt,x),point(t,xx),point(tt,xx)],n=norm(cross(sub(q[1],q[0]),sub(q[2],q[0])));surfaceQuad(...q,n,color,.3);m.preview.push({pts:[q[0],q[1],q[3],q[2]],n,c:color,kind:.3,phase:0});}}
  if(baobab)for(let k=0;k<(fine?36:9);k++){const a=k*2.399963,q=add(p,mul(d,.035)),tip=add(q,[Math.cos(a)*.028,.040,Math.sin(a)*.028]);fine?tube([p,q,tip],.00028,.00014,[.74,.67,.34],.2,3):petioleRibbon(p,tip,.0002,[.74,.67,.34]);}
  flowers++;
 }
 function reproductive(p,dir,{fruit=true,flower=true,oldWood=false}={}){
  if(!cfg.reproductive)return;let [u]=frame(dir);
  if(EAST_ASIAN_SPECIES[cfg.type]&&!pineLike){
   const bloom=cfg.season==='spring'&&(cfg.type!=='redbud'||oldWood||fine)&&(!sp.earlyBloom||fine||((Math.sin(p[0]*173+p[1]*71+p[2]*193+cfg.seed)*43758.5453)%1+1)%1<phenology.bloom);
   if(flower&&bloom){const detail=buildEastAsianOrgan(m,cfg,{mode:'flower',base:p,axis:organDirection(cfg.type,dir,p,cfg.seed+Math.floor(p[0]*151+p[1]*71+p[2]*193)),fine,seed:Math.floor(R(1,999999))});flowers+=detail.flowers;stats.flowerDetails.push({...detail,oldWood,attachment:[...p]});}
   const ripe=['summer','autumn'].includes(cfg.season),sparse=cfg.type!=='sakura'||Math.sin((p[0]*.7+p[1]*.5+p[2])*31)>.7;
   if(fruit&&ripe&&sparse){const detail=buildFruit(m,cfg,{base:p,axis:organDirection(cfg.type,dir,p,cfg.seed+p[0]*111+p[1]*73,{pendant:true}),fine,stage:cfg.season==='summer'?'developing':'mature',seed:Math.floor(R(1,999999))});fruits++;stats.fruitDetails.push(detail);}return;
  }
  if(['jacaranda','monkeytail','eucalyptus'].includes(cfg.type)){
   const blooms=cfg.type==='jacaranda'?cfg.season==='spring':['spring','summer'].includes(cfg.season);
   if(flower&&blooms){const detail=buildGardenFlowers(m,cfg,{base:p,axis:organDirection(cfg.type,dir,p,cfg.seed+p[1]*73+p[0]*131),fine,seed:Math.floor(R(1,999999))});flowers+=detail.flowers;stats.flowerDetails.push(detail);}
   if(fruit&&(cfg.type!=='monkeytail'||['summer','autumn'].includes(cfg.season))){const detail=buildFruit(m,cfg,{base:p,axis:cfg.type==='monkeytail'?[.1,1,.1]:[.1,-1,.1],fine,stage:cfg.type==='monkeytail'&&cfg.season==='autumn'?'released':'mature',seed:Math.floor(R(1,999999))});stats.fruitDetails.push(detail);fruits++;}return;
  }
  function addFruit(axis,stage,offset=[0,0,0]){const detail=buildFruit(m,cfg,{base:add(p,offset),axis,fine,stage,seed:Math.floor(R(1,999999))});stats.fruitDetails.push(detail);fruits++;}
  if(SOUTH_AFRICAN_SPECIES[cfg.type]){
   const fruitSeason=cfg.type==='karee'?['spring','summer'].includes(cfg.season):cfg.type==='baobab'?['summer','autumn','winter'].includes(cfg.season):cfg.type==='sausagetree'?['summer','autumn','winter'].includes(cfg.season):cfg.type==='wildolive'?['autumn','winter'].includes(cfg.season):['summer','autumn'].includes(cfg.season);
   if(fruit&&fruitSeason)addFruit(norm([.12,-1,.08]),cfg.type==='marula'?'developing':sp.compound==='bipinnate'&&cfg.season==='autumn'?'released':'mature');
   if(flower&&['baobab','sausagetree','karee','fevertree'].includes(cfg.type)){const blooms=cfg.type==='baobab'?cfg.season==='summer':cfg.type==='karee'?['winter','spring'].includes(cfg.season):['spring','summer'].includes(cfg.season);if(blooms)southernFlower(p);}
   if(flower&&((cfg.type==='sweetthorn'&&cfg.season==='summer')||(cfg.type==='wildolive'&&['spring','summer'].includes(cfg.season))||(cfg.type==='marula'&&cfg.season==='spring'))){
    const col=cfg.type==='sweetthorn'?[.74,.58,.035]:cfg.type==='marula'?[.42,.14,.15]:[.72,.73,.51],heads=cfg.type==='sweetthorn'?3:2;
    for(let k=0;k<heads;k++){const tip=add(p,add(mul(u,(k-1)*.011),[0,.014,0]));fine?tube([p,tip],.00035,.0002,sp.twig,.2,5):petioleRibbon(p,tip,.0003,sp.twig);flowerSolid(tip,[0,1,0],.009,.0045,col,.3,true);flowers++;}
   }return;
  }
  if(fruit&&cfg.type==='oak'&&['summer','autumn'].includes(cfg.season)){
   const count=fine?2:1;for(let k=0;k<count;k++)addFruit(norm([.12+(k?-.24:0),-1,.08]),cfg.season==='summer'?'developing':'mature',[k*.008,0,0]);
  }
  if(flower&&cfg.type==='oak'&&cfg.season==='spring'){for(let k=0;k<2;k++){flowerSolid(add(p,mul(u,k*.008)),norm([.2,-1,.1]),.045,.0025,[.45,.42,.1],.3,true);flowers++;}}
  if(flower&&cfg.type==='willow'&&cfg.season==='spring'){flowerSolid(p,norm(add(mul(dir,.4),[0,1,0])),.025,.003,[.28,.36,.10],.3,true);flowers++;}
  if(fruit&&cfg.type==='willow'&&cfg.season==='summer')addFruit(norm([.15,-1,.08]),'released');
  if(flower&&cfg.type==='birch'&&(cfg.season==='spring'||cfg.season==='winter')){for(let k=0;k<2;k++){flowerSolid(add(p,mul(u,k*.006)),[0,-1,0],cfg.season==='spring'?.05:.025,.003,cfg.season==='spring'?[.43,.33,.10]:[.25,.15,.08],.3,true);flowers++;}if(cfg.season==='spring'){flowerSolid(add(p,mul(u,-.008)),[0,1,0],.02,.0025,[.25,.35,.07],.3,true);flowers++;}}
  if(fruit&&cfg.type==='birch'&&['summer','autumn'].includes(cfg.season))addFruit(norm([.10,-1,.04]),cfg.season==='summer'?'developing':'mature');
  if(pineLike){
   if(fruit)addFruit(norm(add(mul(dir,-.48),[0,-.7,0])),'mature');
   if(flower&&cfg.season==='spring'){if(cfg.type==='chinesepine'){const detail=buildFlowers(m,cfg,{base:p,axis:dir,fine,seed:Math.floor(R(1,999999))});stats.flowerDetails.push(detail);return;}let top=add(p,mul(dir,.04));flowerSolid(top,dir,.045,.003,[.48,.43,.18],.3,true);for(let k=0;k<3;k++)flowerSolid(add(top,mul(u,k*.004)),dir,.01,.002,[.55,.35,.08],.3,true);flowerSolid(add(top,mul(dir,.04)),dir,.006,.002,[.39,.12,.13],.3,true);flowers+=4;}
  }
 }

 let sampledShoots=0,foliageNodes=null,flowerSitesPerShoot=12;
 stats.terminalTips=0;stats.coveredTips=0;stats.tipGaps=[];stats.leafyShoots=0;stats.apicalContinuations=0;
 function petioleRibbon(base,end,radius,col){const d=norm(sub(end,base)),[u,v]=frame(d),side=mul(u,radius);if(!fine&&cfg.type==='eucalyptus'){m.tri(sub(base,side),add(base,side),end,v,col,.2);return;}surfaceQuad(sub(base,side),sub(end,side),add(base,side),add(end,side),v,col,.2)}

 function rosette(rec){
  const p=rec.points.at(-1),d=norm(sub(p,rec.points.at(-2))),[u,v]=frame(d),count=3+Math.round(cfg.density/25),growth=shootGrowth(cfg,rec.id??0);let emitted=0;
  if(!hidden&&cfg.season!=='winter')for(let k=0;k<count;k++){const a=k*2.399963+rec.phase,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),axis=norm(add(mul(d,.65),mul(out,.75))),development=leafDevelopment(cfg,sp,growth,k/Math.max(1,count-1),k);lamina(p,axis,development.length,rec.phase+k,1,development.expansion);stats.organGrowth.push({...development,shoot:stats.leafyShoots});emitted++;}
  stats.rosettes.push({apex:[...p],leaves:emitted});stats.leafNodes+=emitted;stats.leafyShoots++;stats.terminalTips++;if(emitted){stats.coveredTips++;stats.tipGaps.push(0);}
  reproductive(p,d,{fruit:rec.fruit||fine});
 }
 function foliage(rec){if(cfg.type==='monkeytail'){rosette(rec);return;}let points=rec.points,d=norm(sub(points.at(-1),points.at(-2))),n=rec.nodes??(cfg.view==='shoot'?(cfg.type==='dawnredwood'?18:sp.compound?Math.round(3+cfg.density*.025):pineLike?Math.round(24+cfg.density*.20):Math.round(({maple:4,oak:7,birch:7,sakura:7,ginkgo:8,sweetgum:7,redbud:6,wildolive:7,eucalyptus:9,willow:16,yellowwood:17}[cfg.type]??8)+cfg.density*.035)):foliageNodes??Math.round(16+cfg.density*.25)),leafPhase=R(0,6.28),growth=shootGrowth(cfg,rec.id??rec.phase*1000),shootLength=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...sub(p,points[i])),0),endNode=1-Math.min(.003,Math.min(.0015,sp.leaf[0]*.18)/Math.max(.001,shootLength));const at=t=>{let a=t*(points.length-1),i=Math.min(points.length-2,Math.floor(a));return mix(points[i],points[i+1],a-i)};
  if(cfg.type==='oak'){bud(points.at(-1),d,true);for(let k=0;k<3;k++){let a=k*2.094;bud(add(points.at(-1),[.002*Math.cos(a),-.003,.002*Math.sin(a)]),norm(add(d,[Math.cos(a)*.5,0,Math.sin(a)*.5])),true)}}else if(cfg.type!=='willow')bud(points.at(-1),d,true);
  for(let i=0;i<n;i++){let t=n===1?endNode:cfg.type==='marula'?.60+(endNode-.60)*shootNodePosition(i/(n-1),growth.active):.12+(endNode-.12)*shootNodePosition(i/(n-1),growth.active),p=at(t),a=(sp.twoRanked?0:sp.whorl?i*Math.PI/3:(cfg.type==='wildolive'||sp.opposite)?i*Math.PI*.5:i*2.399963)+rec.phase,pi=Math.min(points.length-2,Math.floor(t*(points.length-1))),localTang=norm(sub(points[pi+1],points[pi])),[u,v]=frame(localTang),out=norm(add(mul(u,Math.cos(a)),mul(v,Math.sin(a))));let ax=norm(add(mul(localTang,.35),mul(out,.95)));
   if(cfg.type==='dawnredwood')ax=norm(add(mul(localTang,.55),mul(out,.85)));
   if(cfg.type==='eucalyptus')ax=norm(add(ax,[0,-.65,0]));
   if(cfg.type==='karee')ax=norm(add(ax,[0,-.22,0]));
   if(cfg.type==='willow')ax=norm(add(ax,[0,-.65,0]));
   let base=add(p,mul(out,rec.r0*(1-t)+rec.r1*t));stats.leafNodes++;if(fine||cfg.season==='winter'||i%5===0)bud(base,norm(add(mul(localTang,.8),mul(out,.2))));
   if(sp.compound==='bipinnate'&&cfg.type!=='jacaranda'&&(fine||i%2===0))spines(base,localTang,out);
   if(cfg.type==='jacaranda'&&cfg.view==='tree'&&cfg.season==='spring'&&Math.sin(rec.phase*37)>.0)continue;
   if(sp.earlyBloom&&cfg.season==='spring'&&((Math.sin(rec.phase*19.7+i*3.71)*437.53)%1+1)%1>phenology.leafPresence)continue;
   if(hidden||(cfg.season==='winter'&&!pineLike&&!sp.evergreen))continue;
   const development=leafDevelopment(cfg,sp,growth,i/Math.max(1,n-1),i);let len=development.length;if(growth.active)ax=norm(add(ax,mul(localTang,(1-development.expansion)*1.25)));stats.organGrowth.push({...development,position:t,base:[...base],axis:[...ax],shoot:stats.leafyShoots});
   if(pineLike&&!fine){if(i%4===0||i===n-1)pineCohort(base,ax,len,leafPhase+i);}else if(pineLike){needlePair(base,ax,len,leafPhase+i,development.expansion)}else{if(cfg.type==='ginkgo'&&i%3===0){const spurLength=R(.008,.018),hub=add(base,mul(ax,spurLength));fine?tube([base,hub],.0015,.0012,sp.twig,.2,6):petioleRibbon(base,hub,.0013,sp.twig);for(let partner=0;partner<3;partner++){const a=partner*2.094,fan=norm(add(mul(ax,.75),add(mul(u,Math.cos(a)*.65),mul(v,Math.sin(a)*.65))));leafOrgan(hub,fan,len*(.90+partner*.045),leafPhase+i+partner*.6,development.expansion,{ginkgoNotch:R(.025,.09)});}stats.spurs.push({node:i,leaves:3,length:spurLength});}else leafOrgan(base,ax,len,leafPhase+i,development.expansion);if(cfg.type==='wildolive'||sp.opposite){const otherBase=add(p,mul(out,-(rec.r0*(1-t)+rec.r1*t))),otherAxis=norm(add(mul(localTang,.35+(growth.active?(1-development.expansion)*1.25:0)),mul(out,-.95)));leafOrgan(otherBase,otherAxis,len*R(.97,1.03),leafPhase+i+.15,development.expansion);stats.oppositePairs.push({node:i,axis:a});}if(sp.whorl){for(let partner=1;partner<sp.whorl;partner++){let aa=a+partner*6.283185/sp.whorl,oo=norm(add(mul(u,Math.cos(aa)),mul(v,Math.sin(aa)))),bb=add(p,mul(oo,rec.r0*(1-t)+rec.r1*t)),dd=norm(add(mul(localTang,.35),mul(oo,.95)));leafOrgan(bb,dd,len,leafPhase+i+partner*.19,development.expansion);if(fine)bud(bb,localTang);}stats.whorls.push({node:i,members:sp.whorl});}if(cfg.type==='willow'&&cfg.season==='spring'&&i<2){solid(base,out,.004,.001,[.29,.36,.09],.3)}}
  }
  stats.leafyShoots++;if(rec.terminal){stats.terminalTips++;if(!hidden&&(pineLike||sp.evergreen||cfg.season!=='winter')){stats.coveredTips++;stats.tipGaps.push(Math.hypot(...sub(points.at(-1),at(endNode))))}}
  if((cfg.type==='jacaranda'||cfg.type==='sakura')&&cfg.season==='spring'){const count=cfg.type==='sakura'&&!fine?Math.min(flowerSitesPerShoot,4+Math.round(cfg.density*.08)):1;for(let j=0;j<count;j++)reproductive(at(count===1?1:.16+.84*(j+.5)/count),d,{fruit:rec.fruit&&j===0});return;}
  if((rec.fruit&&(!['baobab','sausagetree'].includes(cfg.type)||Math.sin(rec.phase*88)>.65))||fine)reproductive(at(.83),d,{fruit:!pineLike||fine});
 }
 let seasonalFans=0;
 function redwoodFans(rec){
  if(cfg.type!=='dawnredwood'||cfg.season==='winter'||rec.depth<1||rec.depth>2||seasonalFans>=700)return;
  const points=rec.points,L=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...sub(p,points[i])),0),sites=Math.min(12,Math.floor(L/.27));
  for(let j=0;j<sites&&seasonalFans<700;j++)for(const sign of[-1,1]){const t=.15+.75*(j+.5)/sites,a=t*(points.length-1),i=Math.min(points.length-2,Math.floor(a)),p=mix(points[i],points[i+1],a-i),dir=norm(sub(points[i+1],points[i])),[side]=frame(dir),axis=norm(add(mul(dir,.32),add(mul(side,sign*.90),[0,-.10,0]))),len=R(.40,.75),pts=path(p,axis,len,-.12,.012,5);tube(pts,.0025,.00065,sp.twig,.2,4);foliage({points:pts,r0:.0025,r1:.00065,phase:rec.phase+j*.47+sign*.3,terminal:false,fruit:false,nodes:6});seasonalFans++;}
 }
 // Skeleton: alternate lateral shoots on angiosperms; whorled scaffolds on pine.
 function path(p,d,len,droop=0,wiggle=.04,steps=9){let pts=[p],dir=norm(d),a=R(0,6.28);for(let i=1;i<=steps;i++){dir=norm(add(dir,[Math.sin(a+i*.7)*wiggle,droop/steps,Math.cos(a+i*.8)*wiggle]));p=add(p,mul(dir,len/steps));if(p[1]<.025)p=[p[0],.025,p[2]];pts.push(p)}return pts}
 function rec(points,r0,r1,depth,phase=R(0,6.28),fruit=false){let r={points,r0,r1,depth,phase,fruit,children:0};records.push(r);return r}
 if(cfg.view==='flower'){
  const twig=[[-.012,-.002,-.002],[0,0,0],[.012,.001,.002]];tube(twig,.0018,.0013,sp.twig,0);const detail=buildFlowers(m,cfg,{base:twig[1],axis:[0,0,1],fine:true,study:true});stats.flowerDetails.push(detail);flowers=detail.flowers;inspectFocus=detail.focus;inspectDistance=detail.inspectDistance;stats.flowerStudy=detail;
 }else if(cfg.view==='roots'){let baseRadius=buildTreeArchitecture(cfg).baseRadius;tube([[0,0,0],[.01,baseRadius*1.6,0],[0,Math.max(.55,baseRadius*2.6),0]],baseRadius,baseRadius*.82,sp.twig,0);rootSystem=buildRootSystem(m,cfg,{preview,study:true,baseRadius});
 }else if(cfg.view==='wood'||cfg.view==='bark'){
  const part=cfg.woodPart||'junction';let main,rad;
  if(cfg.type==='monkeytail'){main=[[0,0,0],[.004,.12,0],[-.003,.24,.004],[.006,.38,.002],[.003,.48,0]];rad=.024;rec(main,rad,.020,0);tube(main,rad,.020,sp.twig,0);if(part==='junction'){let p=main[2],pts=[p,add(p,[.035,.055,.005]),add(p,[.075,.16,.015])];rec(pts,.016,.012,1);tube(pts,.016,.012,sp.twig,0);}}else if(part==='branch'){
   main=[[0,.25,0],[.22,.34,.025],[.52,.47,.01],[.85,.58,.04],[1.1,.60,.015]];rad=.055;
   rec(main,rad,.018,1);tube(main,rad,.018,sp.twig,0);
   for(let k=0;k<2;k++){let p=main[k+1],pts=[p,add(p,[.05,.12,.08]),add(p,[.11,.30,.13])];rec(pts,.018,.004,2);tube(pts,.018,.004,sp.twig,0)}
  }else{
   main=[[0,0,0],[.008,.35,.008],[-.012,.75,0],[.005,1.1,.012],[.018,1.55,0],[.008,1.8,.006]];rad=.18;rec(main,rad,.145,0);tube(main,rad,.145,sp.twig,0);
   if(part==='junction'){let p=main[2],pts=[p,add(p,[.17,.11,.02]),add(p,[.38,.32,.06]),add(p,[.65,.50,.08]),add(p,[.88,.59,.04])];rec(pts,.075,.035,1);tube(pts,.075,.035,sp.twig,0)}
  }
  let focusT=cfg.barkPosition??.44,at=focusT*(main.length-1),i=Math.min(main.length-2,Math.floor(at)),p=mix(main[i],main[i+1],at-i),radius=woodRadius(rad,cfg.type==='monkeytail'?.020:part==='branch'?.018:.145,focusT);inspectFocus=add(p,[0,0,radius+.003]);inspectDistance=cfg.view==='bark'?(cfg.type==='monkeytail'?.055:['sakura','birch','fevertree','eucalyptus'].includes(cfg.type)?.15:.23):null;if(cfg.view==='bark'&&woodStats.study)inspectFocus=woodStats.study.focus;
 }else if(cfg.view==='fruit'){
  const twig=[[-.032,.027,.002],[0,.025,0],[.032,.028,-.002]];if(!(cfg.type==='marula'&&cfg.fruitStage!=='developing'))tube(twig,.003,.002,sp.twig,0);const detail=buildFruit(m,cfg,{base:twig[1],axis:cfg.type==='monkeytail'?norm([.08,1,.08]):norm([.08,-1,.08]),fine:true});stats.fruitDetails.push(detail);fruits=1;inspectFocus=detail.focus;inspectDistance=detail.inspectDistance;
 }else if(cfg.view==='leaf'||cfg.view==='surface'){
  // Leaf study remains at natural scale; its UV surface supports a close material study.
  if(pineLike){needlePair([0,0,0],norm([.15,1,0]),cfg.leafSize,1)}else if(sp.compound&&cfg.view==='leaf'){compoundLeaf([0,0,0],[0,1,0],cfg.leafSize,1);}else{let pl=sp.compound&&cfg.view==='surface'?(sp.leafletPetiole??(sp.petiole[0]+sp.petiole[1])*.5):(sp.petiole[0]+sp.petiole[1])*.5;let p=[0,pl,0];if(pl>0){tube([[0,0,0],p],.0005,.0003,sp.twig,.2,8);petioles=1;stats.petioleLengths=[pl];petioleGlands([0,0,0],[0,1,0],pl);}lamina(p,[0,1,0],cfg.leafSize,1)}
 }else if(cfg.view==='shoot'){
  const len=cfg.type==='monkeytail'?.18:cfg.type==='dawnredwood'?.065:cfg.type==='willow'?.55:.34,dir=cfg.type==='willow'?norm([.3,-1,0]):norm([.15,1,0]);let start=cfg.type==='willow'?[0,.55,0]:[0,0,0];let r=rec(path(start,dir,len,cfg.type==='willow'?-.3:0,.025,14),cfg.type==='monkeytail'?.023:.003,cfg.type==='monkeytail'?.019:.0007,4);r.terminal=true;foliage(r);tube(r.points,r.r0,r.r1,sp.twig,.2,10);
 }else{
  const h=cfg.height,architecture=buildTreeArchitecture(cfg),baseRadius=architecture.baseRadius;records=architecture.records;stats.architecture=architecture.stats;stats.apicalContinuations=architecture.stats.apicalContinuations;
  const tips=records.filter(r=>r.children===0),shootCount=tips.length,requestedExtras=Math.max(0,Math.min(4,Math.round(cfg.shoots??3))),targetNodesRaw=sp.compound==='bipinnate'?6500+cfg.density*450:sp.compound==='pinnate'?9000+cfg.density*100:pineLike?Math.min(70000,26000+cfg.density*650):Math.min(cfg.type==='willow'?62000:49000,(cfg.type==='willow'?18000:16000)+cfg.density*(cfg.type==='willow'?540:430)),targetNodes=cfg.type==='chinesepine'?Math.min(85000,55000+cfg.density*500):cfg.type==='maple'?(22000+cfg.density*300)*.5:cfg.type==='sweetgum'?22000+cfg.density*300:cfg.type==='redbud'?12000+cfg.density*120:cfg.type==='sakura'?18000+cfg.density*300:cfg.type==='ginkgo'?14000+cfg.density*180:cfg.type==='dawnredwood'?(18000+cfg.density*250)*.5:cfg.type==='jacaranda'?(7000+cfg.density*100)*.5:cfg.type==='eucalyptus'?55000+cfg.density*850:cfg.type==='baobab'?9000+cfg.density*60:cfg.type==='fevertree'?4000+cfg.density*220:cfg.type==='sausagetree'?(7000+cfg.density*90)/3:cfg.type==='karee'?22000+cfg.density*480:cfg.type==='wildolive'?(65000+cfg.density*950)*.5:cfg.type==='yellowwood'?(60000+cfg.density*950)*Math.min(2.8,Math.pow(cfg.height/10,1.5)):targetNodesRaw,extras=Math.min(requestedExtras,Math.max(0,Math.floor(targetNodes/(shootCount*4))-1)),shootMultiplier=pineLike?1:1+extras;stats.structuralTips=shootCount;stats.sideShootsPerTip=pineLike?0:extras;foliageNodes=Math.max(sp.compound?1:4,Math.min(cfg.type==='yellowwood'?200:cfg.type==='fevertree'?60:cfg.type==='baobab'?40:cfg.type==='sausagetree'?28:cfg.type==='sweetthorn'?90:cfg.type==='chinesepine'?100:pineLike?64:cfg.type==='marula'?40:90,Math.floor(targetNodes/(shootCount*shootMultiplier))));
  flowerSitesPerShoot=Math.max(1,Math.floor(6000/(shootCount*shootMultiplier)));
  for(let r of records){if(cfg.type==='dawnredwood'&&cfg.season==='winter'&&r.children===0&&r.r0<.004){stats.deciduousSprays++;continue;}let col=sp.twig;if(r.depth<3){if(cfg.type==='birch')col=r.r0>.018?[.72,.71,.62]:sp.twig;else if(pineLike)col=r.points[0][1]>h*.32?[.42,.20,.075]:[.23,.17,.12];else col=cfg.type==='willow'?[.25,.23,.17]:[.27,.23,.17]}
   if(pineLike&&r.children>0&&r.depth>0&&r.fruit){let i=Math.floor((r.points.length-1)*.72),d=norm(sub(r.points[i+1],r.points[i]));reproductive(r.points[i],d,{flower:false});}
   tube(r.points,r.r0,r.r1,col,0,r.depth===0?40:r.depth===1?14:r.depth===2?8:5,r.depth<2&&cfg.type!=='birch'?.10*mature:0);
   redwoodFans(r);
   if(cfg.type==='dawnredwood'&&cfg.season!=='winter'&&r.children>0&&r.depth>=2&&r.r0<.08)foliage({...r,fruit:false,terminal:false});
   if((cfg.type==='yellowwood'||['ginkgo','maple','sweetgum','chinesepine'].includes(cfg.type))&&r.children>0&&r.depth>=2&&r.r0<(['chinesepine','ginkgo'].includes(cfg.type)?.035:.022)){foliage({...r,fruit:false,terminal:false});stats.retainedShoots++;}
   if(cfg.type==='sakura'&&cfg.reproductive&&cfg.season==='spring'&&r.children>0&&r.depth>=2&&r.r0<.025){const length=r.points.slice(1).reduce((s,p,i)=>s+Math.hypot(...sub(p,r.points[i])),0),sites=Math.max(3,Math.min(18,Math.round(length/.055)));for(let j=0;j<sites;j++){const t=.08+.84*(j+.5+(organHash(cfg.seed+r.phase+j*31)-.5)*.45)/sites,at=t*(r.points.length-1),idx=Math.floor(at),tangent=norm(sub(r.points[idx+1],r.points[idx])),[u,v]=frame(tangent),azimuth=r.phase+j*2.399963+organHash(j+r.phase)*.45,out=add(mul(u,Math.cos(azimuth)),mul(v,Math.sin(azimuth))),p=add(mix(r.points[idx],r.points[idx+1],at-idx),mul(out,r.r0*(1-t)+r.r1*t));reproductive(p,tangent,{fruit:false,oldWood:true});}}
   if(cfg.type==='redbud'&&cfg.reproductive&&cfg.season==='spring'&&r.children>0&&r.r0>.006&&r.r0<.12){for(const t of[.12,.25,.38,.51,.64,.77,.90]){let idx=Math.floor(t*(r.points.length-1)),tangent=norm(sub(r.points[idx+1],r.points[idx])),[u,v]=frame(tangent),out=add(mul(u,Math.cos(r.phase+t*9)),mul(v,Math.sin(r.phase+t*9))),p=add(r.points[idx],mul(out,(r.r0*(1-t)+r.r1*t)*1.05));reproductive(p,tangent,{fruit:false,oldWood:true});}}
   if(r.children===0){r.terminal=true;foliage(r);if(!pineLike&&cfg.type!=='monkeytail'){for(let k=0;k<extras;k++){let t=cfg.type==='maple'?.30+.45*(Math.floor(k/2)+.5)/Math.ceil(extras/2):.25+.55*(k+.5)/Math.max(1,extras),idx=Math.min(r.points.length-2,Math.floor(t*(r.points.length-1))),p=r.points[idx],d=norm(sub(r.points[idx+1],p)),[u,v]=frame(d),a=r.phase+(cfg.type==='maple'?Math.floor(k/2)*Math.PI/2+k%2*Math.PI:k*2.399963),radial=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),axis=norm(add(mul(d,.25),radial));if(cfg.type==='willow')axis=norm(add(mul(d,.65),add(mul(radial,.3),[0,-.4,0])));if(cfg.type==='birch')axis=norm(add(mul(d,.6),add(mul(radial,.4),[0,-.25,0])));let len=cfg.type==='willow'?Math.min(R(.35,.65),p[1]*.85):R(.20,.34),pts=path(p,axis,len,cfg.type==='willow'?-.8:.12,.025,3),shoot={points:pts,r0:.0018,r1:.00035,phase:a,fruit:random()<.05,terminal:true};tube(pts,.0018,.00035,sp.twig,.2,3);foliage(shoot)}}sampledShoots++;}
  }

  rootSystem=buildRootSystem(m,cfg,{preview,study:false,baseRadius});

 }
 let vertices=m.a.slice(0,m.used),bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},aboveGroundBounds={min:[Infinity,0,Infinity],max:[-Infinity,0,-Infinity]};for(let i=0;i<vertices.length;i+=14)for(let k=0;k<3;k++){bounds.min[k]=Math.min(bounds.min[k],vertices[i+k]);bounds.max[k]=Math.max(bounds.max[k],vertices[i+k]);if(vertices[i+1]>=0){aboveGroundBounds.min[k]=Math.min(aboveGroundBounds.min[k],vertices[i+k]);aboveGroundBounds.max[k]=Math.max(aboveGroundBounds.max[k],vertices[i+k])}}
 return{vertices,preview:preview?m.preview:[],bounds,aboveGroundBounds,rootSystem,inspectFocus,inspectDistance,stats:{...stats,leaves,fascicles,buds,flowers,fruits,petioles,branches:records.length,wood:woodStats,roots:rootSystem?.stats??null},stride:14};
}
