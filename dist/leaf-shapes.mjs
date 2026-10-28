// Blade-space outlines: x and y are fractions of expanded blade length.
// Unlike a width-by-height envelope, a contour preserves backward-facing
// lobe shoulders, rounded sinuses and a cordate petiole insertion.
const mirror=half=>[...half,...half.slice(1,-1).reverse().map(([x,y])=>[-x,y])];
function curve(out,control,end,n=5){const start=out.at(-1);for(let j=1;j<=n;j++){const t=j/n,s=1-t;out.push([s*s*start[0]+2*s*t*control[0]+t*t*end[0],s*s*start[1]+2*s*t*control[1]+t*t*end[1]]);}}
export function leafContour(type,{fine=true,phase=0}={}){
 let half=[[0,0]];
 if(type==='maple'){
  if(!fine)half=[[0,0],[.18,-.015],[.38,.10],[.27,.29],[.43,.40],[.57,.68],[.34,.58],[.205,.53],[.20,.69],[.18,.81],[0,1]];
  else{
   curve(half,[.08,-.055],[.18,-.015]);half.push([.28,.045],[.38,.10],[.34,.18],[.35,.225],[.305,.235]);
   curve(half,[.245,.27],[.28,.32]);half.push([.38,.355],[.43,.40],[.48,.47],[.45,.475],[.52,.57],[.57,.68],[.465,.645],[.43,.67],[.405,.625],[.34,.58]);
   curve(half,[.23,.49],[.205,.53]);curve(half,[.178,.57],[.20,.68]);half.push([.245,.78],[.18,.765],[.19,.835],[.13,.815],[.095,.86],[0,1]);
  }
 }else if(type==='sweetgum'){
  if(!fine)return mirror([[0,0],[.22,.02],[.40,.25],[.59,.56],[.30,.46],[.215,.43],[.18,.70],[0,1]]);
  curve(half,[.10,-.055],[.24,.035],fine?8:2);curve(half,[.35,.14],[.48,.32],fine?7:2);half.push([.59,.56]);
  curve(half,[.32,.49],[.215,.43],fine?7:2);curve(half,[.18,.42],[.195,.52],fine?6:2);half.push([.17,.72],[0,1]);
  if(fine){const serrated=[half[0]];for(let i=1;i<half.length;i++){const a=half[i-1],b=half[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L>.018&&i>3&&i!==half.length-1){const teeth=Math.max(1,Math.round(L/.035));for(let k=0;k<teeth;k++){const t=(k+.57)/teeth;serrated.push([a[0]+dx*t+dy/L*.009,a[1]+dy*t-dx/L*.009]);serrated.push([a[0]+dx*(k+1)/teeth,a[1]+dy*(k+1)/teeth]);}}else serrated.push(b);}half=serrated;}
 }else if(type==='redbud'){
  curve(half,[.13,-.19],[.32,-.13],fine?12:3);curve(half,[.66,-.05],[.58,.31],fine?18:5);curve(half,[.51,.62],[.19,.82],fine?18:5);curve(half,[.065,.91],[0,1],fine?10:3);
 }else throw new Error('No contour for '+type);
 return mirror(half).map(([x,y])=>[x*(1+.018*Math.sin(phase+y*6.1))*(x<0?1+.015*Math.sin(phase*1.7):1),y]);
}
export const PALMATE_VEINS={
 maple:[[0,1],[.57,.68],[-.57,.68],[.38,.10],[-.38,.10]],
 sweetgum:[[0,1],[.59,.56],[-.59,.56]],
 redbud:[[0,1],[.50,.53],[-.50,.53],[.49,.03],[-.49,.03]]
};
export function veinDistance(type,x,y){let distance=1;for(const [a,b]of PALMATE_VEINS[type]){const t=Math.max(0,Math.min(1,(x*a+y*b)/(a*a+b*b)));distance=Math.min(distance,Math.hypot(x-a*t,y-b*t));}return distance;}
// Ear clipping preserves the concave sinuses without triangles bridging them.
export function triangulateContour(points){
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const inside=(p,a,b,c)=>cross(a,b,p)>=-1e-10&&cross(b,c,p)>=-1e-10&&cross(c,a,p)>=-1e-10;
 const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1]},0),ids=points.map((_,i)=>i);if(area<0)ids.reverse();const result=[];
 while(ids.length>3){let found=false;for(let k=0;k<ids.length;k++){const a=ids[(k+ids.length-1)%ids.length],b=ids[k],c=ids[(k+1)%ids.length];if(cross(points[a],points[b],points[c])<=1e-10)continue;if(ids.some(i=>i!==a&&i!==b&&i!==c&&inside(points[i],points[a],points[b],points[c])))continue;result.push([a,b,c]);ids.splice(k,1);found=true;break;}if(!found)throw new Error('Invalid blade contour');}
 result.push(ids);return result;
}
