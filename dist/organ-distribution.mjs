// Seeded, locally correlated variation. These distributions describe
// representative poses/stages; they are not calibrated flowering calendars.
export const organHash=x=>{const a=Math.sin(x*127.1+311.7)*43758.5453;return a-Math.floor(a);};
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);},add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s);
export function organDirection(type,twig,position,seed,{pendant=false,index=0}={}){
 const r=i=>organHash(seed*.731+index*17.31+i*1.79),az=r(2)*Math.PI*2,radial=norm([position[0],.05,position[2]]),random=[Math.cos(az)*Math.sqrt(1-(2*r(3)-1)**2),2*r(3)-1,Math.sin(az)*Math.sqrt(1-(2*r(3)-1)**2)];
 if(pendant||['maple','dawnredwood','baobab','sausagetree'].includes(type))return norm([random[0]*(.16+.28*r(7)),-.85-.20*r(5),random[2]*(.16+.28*r(8))]);
 if(type==='sakura'||type==='redbud')return norm(add(add(mul(radial,.48),mul(norm(twig),.20)),mul(random,.94)));
 if(type==='monkeytail'||type==='jacaranda'||type==='ginkgo')return norm([random[0]*.38,.85+.25*r(4),random[2]*.38]);
 return norm(add(mul(norm(twig),.70),add(mul(random,.55),[0,.12,0])));
}
export function blossomDevelopment(cfg,seed,index,{study=false,stage='open'}={}){
 const cluster=organHash(seed*.63+31),local=organHash(seed*.91+index*17.71+13),roll=organHash(seed+index*13.77+81)*Math.PI*2;
 if(study&&cfg.flowerLayout!=='cluster')return{opening:stage==='bud'?.10:stage==='late'?1:.94,stage,roll};
 if(study&&stage==='bud')return{opening:.07+.13*local,stage:'bud',roll};
 const progress=cfg.season==='spring'?(cfg.springProgress??.78):.35,age=.60*cluster+.40*local+.18*(progress-.35),budChance=study?.06:progress<.3?.14:.035;
 if(local<budChance)return{opening:.09+.16*organHash(seed+index*6.7),stage:'bud',roll};
 const partial=local<(study?.30:progress<.3?.35:.18),opening=partial?.32+.47*organHash(seed+index*13.9):.84+.16*Math.max(0,Math.min(1,age)),late=age>.79||study&&stage==='late';
 return{opening:late?.90+.10*local:opening,stage:late?'late':opening<.70?'opening':'open',roll};
}
