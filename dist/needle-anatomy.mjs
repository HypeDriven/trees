// Semicircular two-needle pine anatomy in metres. Stomatal row counts draw
// on primary seedling observations, not a universal mature-tree calibration.
import {organHash as hash} from './organ-distribution.mjs?v=19';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const NEEDLE_ARC=Math.PI/(Math.PI+2);
export const NEEDLE_REFERENCES=[['Chinese pine botanical description','https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=210001654'],['Pine needle anatomy and stomatal rows, seedling study','https://pmc.ncbi.nlm.nih.gov/articles/PMC4063482/'],['Chinese pine variation in needle longevity','https://pubmed.ncbi.nlm.nih.gov/12670800/']];
export function fascicleParameters(type,seed,phase){
 const chinese=type==='chinesepine',r=i=>hash(seed*.17+phase*31.71+i*1.93),specimen=hash(seed+11),width=chinese?clamp(.00105+.00016*specimen+.00031*r(3),.001,.0015):.0012+.00075*r(3);
 return{width,divergence:.045+.105*r(4),curve:(chinese?.025:.04)+r(5)*(chinese?.09:.12),sideCurve:(r(6)-.5)*.055,twist:(r(7)>.5?1:-1)*(chinese?.10+.52*r(8):.65+1.25*r(8)),sheathLength:chinese?.010+.010*r(9):.003+.003*r(9),convexRows:6+(r(10)>.45?1:0),flatRows:5+(r(11)>.65?1:0),porePitch:.000085+.000018*r(12),seed:seed+phase*71};
}
function rowCenters(parameters){const a=[];for(let j=0;j<parameters.convexRows;j++)a.push((j+.5)/parameters.convexRows*NEEDLE_ARC);for(let j=0;j<parameters.flatRows;j++)a.push(NEEDLE_ARC+(j+.5)/parameters.flatRows*(1-NEEDLE_ARC));return a;}
export function needleRelief(u,y,width,p){
 const convex=u<NEEDLE_ARC,n=convex?p.convexRows:p.flatRows,local=convex?u/NEEDLE_ARC:(u-NEEDLE_ARC)/(1-NEEDLE_ARC),row=clamp(Math.floor(local*n),0,n-1),center=convex?(row+.5)/n*NEEDLE_ARC:NEEDLE_ARC+(row+.5)/n*(1-NEEDLE_ARC),perimeter=width*.5*(Math.PI+2),dx=(u-center)*perimeter,offset=hash(p.seed+row*19.3+(convex?0:73)),phase=y/p.porePitch+offset,dy=(phase-Math.floor(phase)-.5)*p.porePitch,r2=(dx/.000011)**2+(dy/.000024)**2,pit=-.000012*Math.exp(-r2*2.2),rim=.0000024*Math.exp(-Math.pow((Math.sqrt(r2)-1.12)/.30,2)),channel=-.0000014*Math.exp(-Math.pow(dx/.000028,2));
 return{height:pit+rim+channel,pit:Math.exp(-r2*2.2),wax:Math.exp(-Math.pow(dx/.000030,2)),row,convex};
}
export function buildNeedle(mesh,cfg,{base,axis,length,phase,sharedSide,hand=1,parameters,macro=false,fine=true,colour}){
 const p=parameters,R=length,side0=norm(sub(sharedSide,mul(axis,dot(sharedSide,axis)))),side=mul(side0,hand),up=norm(cross(side,axis)),radius=p.width*.5,perimeter=radius*(Math.PI+2),focusT=cfg.surfacePosition??.55,halfWindow=Math.min(.15,.0055/R),lo=Math.max(.03,focusT-halfWindow),hi=Math.min(.94,focusT+halfWindow),rows=fine?96:3;
 let ts=Array.from({length:rows+1},(_,i)=>i/rows),us=[...Array.from({length:17},(_,i)=>i/16*NEEDLE_ARC),...Array.from({length:9},(_,i)=>NEEDLE_ARC+i/8*(1-NEEDLE_ARC))];
 if(macro){const count=Math.ceil((hi-lo)*R/.000015);for(let i=0;i<=count;i++)ts.push(lo+(hi-lo)*i/count);for(const center of rowCenters(p))for(const distance of[-.000033,-.000022,-.000011,0,.000011,.000022,.000033])us.push(clamp(center+distance/perimeter,0,1));}
 const unique=a=>[...new Set(a.map(v=>Math.round(v*1e10)/1e10))].sort((a,b)=>a-b);ts=unique(ts);us=unique(us);
 function sample(t,u){
  const angle=t*p.twist,U=add(mul(side,Math.cos(angle)),mul(up,Math.sin(angle))),V=add(mul(up,Math.cos(angle)),mul(side,-Math.sin(angle))),center=add(base,add(mul(axis,R*t),add(mul(up,R*p.curve*t*t),mul(side,R*p.sideCurve*Math.sin(Math.PI*t)*t)))),taper=Math.max(.012,1-Math.pow(t,9)),theta=u/NEEDLE_ARC*Math.PI,convex=u<=NEEDLE_ARC,x=convex?Math.cos(theta):-1+2*(u-NEEDLE_ARC)/(1-NEEDLE_ARC),y=convex?Math.sin(theta):0,normal=convex?add(mul(U,Math.cos(theta)),mul(V,Math.sin(theta))):mul(V,-1),surface=macro&&t>=lo&&t<=hi?needleRelief(u,t*R,p.width,p):{height:0,pit:0},fade=macro?Math.min(1,Math.max(0,Math.min(t-lo,hi-t)*R/.00025)):0,point=add(center,add(mul(U,x*radius*taper),add(mul(V,y*radius*taper),mul(normal,surface.height*fade))));
  return{p:point,n:normal,c:colour.map((v,i)=>v*(1-surface.pit*.045)*(1-(surface.wax??0)*.12)+[.32,.40,.29][i]*(surface.wax??0)*.12),uv:[u,t*R],flutter:t*R/cfg.leafSize};
 }
 const grid=ts.map(t=>us.map(u=>sample(t,u))),kind=1.10+p.convexRows*.001+p.flatRows*.0001;
 for(let j=0;j<ts.length;j++)for(let k=0;k<us.length;k++){const q=grid[j][k],a=grid[j][Math.max(0,k-1)].p,b=grid[j][Math.min(us.length-1,k+1)].p,c=grid[Math.max(0,j-1)][k].p,d=grid[Math.min(ts.length-1,j+1)][k].p;if(us[k]>NEEDLE_ARC+1e-5||us[k]<NEEDLE_ARC-1e-5){let n=norm(cross(sub(b,a),sub(d,c)));if(dot(n,q.n)<0)n=mul(n,-1);q.n=n;}}
 for(let j=0;j<ts.length-1;j++)for(let k=0;k<us.length-1;k++){const q=[grid[j][k],grid[j+1][k],grid[j][k+1],grid[j+1][k+1]],n=norm(add(q[0].n,q[2].n)),order=dot(cross(sub(q[1].p,q[0].p),sub(q[2].p,q[0].p)),n)<0?[0,2,1,2,3,1]:[0,1,2,2,1,3];for(const i of order){const v=q[i];mesh.v(v.p,v.n,v.c,kind,phase,v.flutter,v.uv);}}
 for(const end of[0,ts.length-1]){const ring=grid[end],center=ring.reduce((s,q)=>add(s,mul(q.p,1/ring.length)),[0,0,0]),n=mul(axis,end?1:-1);for(let k=0;k<us.length-1;k++){let a=ring[k],b=ring[k+1];if(dot(cross(sub(a.p,center),sub(b.p,center)),n)<0)[a,b]=[b,a];for(const q of[{p:center,uv:[.5,ts[end]*R],flutter:ts[end]*R/cfg.leafSize,c:colour},a,b])mesh.v(q.p,n,q.c,kind,phase,q.flutter,q.uv);}}
 const convex=sample(focusT,NEEDLE_ARC*.5),flat=sample(focusT,NEEDLE_ARC+(1-NEEDLE_ARC)*.5);
 mesh.preview.push({pts:[sample(0,0).p,sample(.6,0).p,sample(1,0).p,sample(.6,NEEDLE_ARC).p,sample(0,NEEDLE_ARC).p],n:up,c:colour,kind,phase,size:R});
 return{type:cfg.type,phase,crossSection:'semicircular',width:p.width,length:R,perimeter,longitudinalRows:ts.length-1,crossSectionSamples:us.length-1,stomatalFaces:2,convexRows:p.convexRows,flatRows:p.flatRows,porePitch:p.porePitch,geometricStomata:macro,modelledPitDepth:.000012,flatNormal:mul(up,-1),divergence:p.divergence,twist:p.twist,curve:p.curve,convexFocus:convex.p,convexNormal:convex.n,flatFocus:flat.p,flatSurfaceNormal:flat.n,inspectDistance:.015,axis:[...axis],base:[...base]};
}
