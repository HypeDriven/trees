// Attach to the triangles that are actually rendered, including coarse polygonal
// stems and displaced bark, rather than a different idealized circular tube.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function linearStemSample(points,t){
 const x=clamp(t,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(x));return{center:mix(points[i],points[i+1],x-i),axis:norm(sub(points[i+1],points[i]))};
}
function rayTriangle(origin,dir,a,b,c){
 const e1=sub(b,a),e2=sub(c,a),h=cross(dir,e2),det=dot(e1,h);if(Math.abs(det)<1e-15)return null;
 const s=sub(origin,a),u=dot(s,h)/det;if(u<-.000001||u>1.000001)return null;
 const q=cross(s,e1),v=dot(dir,q)/det;if(v<-.000001||u+v>1.000001)return null;
 const distance=dot(e2,q)/det;return distance>=0?{point:add(origin,mul(dir,distance)),normal:norm(cross(e1,e2)),distance}:null;
}
function closestPoint(p,a,b,c){
 const e=sub(b,a),f=sub(c,a),q=sub(p,a),n=cross(e,f),ee=dot(e,e),ff=dot(f,f),ef=dot(e,f),den=ee*ff-ef*ef;
 if(Math.abs(den)>1e-24){const u=(ff*dot(q,e)-ef*dot(q,f))/den,v=(ee*dot(q,f)-ef*dot(q,e))/den;if(u>=0&&v>=0&&u+v<=1)return sub(p,mul(n,dot(q,n)/dot(n,n)));}
 let best=null,distance=Infinity;for(const [edgeA,edgeB]of[[a,b],[b,c],[c,a]]){const e=sub(edgeB,edgeA),t=clamp(dot(sub(p,edgeA),e)/Math.max(1e-30,dot(e,e)),0,1),q=add(edgeA,mul(e,t)),d=Math.hypot(...sub(p,q));if(d<distance){best=q;distance=d;}}return best;
}
export function createStemSurface(rings){
 const sides=rings[0].points.length-1;
 function interval(t){let lo=0,hi=rings.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(rings[mid].t<=t)lo=mid;else hi=mid;}return lo;}
 function sample(t){t=clamp(t,0,1);const j=interval(t),a=rings[j],b=rings[j+1],f=(t-a.t)/(b.t-a.t);return{center:mix(a.center,b.center,f),axis:norm(sub(b.center,a.center)),j,f};}
 function attachment(t,out,embed=.00008){
  const s=sample(t),dir=norm(sub(out,mul(s.axis,dot(out,s.axis)))),ring=rings[s.j],u=norm(sub(ring.points[0].p,ring.center)),v=norm(cross(u,ring.axis)),azimuth=(Math.atan2(dot(dir,v),dot(dir,u))+Math.PI*2)%(Math.PI*2),k0=Math.floor(azimuth/(Math.PI*2)*sides);let hit=null;
  // Curved ring planes can move the intersection into an adjacent axial cell.
  for(let j=Math.max(0,s.j-1);j<=Math.min(rings.length-2,s.j+1);j++)for(let offset=-1;offset<=1;offset++){
   const k=(k0+offset+sides)%sides,a=rings[j].points[k].p,b=rings[j+1].points[k].p,c=rings[j].points[k+1].p,d=rings[j+1].points[k+1].p;
   for(const tri of[[a,b,c],[c,b,d]]){const h=rayTriangle(s.center,dir,...tri);if(h&&(!hit||h.distance<hit.distance))hit=h;}
  }
  // A very sharp bend can rotate a low-sided ring beyond the angular shortcut.
  if(!hit)for(let j=Math.max(0,s.j-2);j<=Math.min(rings.length-2,s.j+2);j++)for(let k=0;k<sides;k++){
   const a=rings[j].points[k].p,b=rings[j+1].points[k].p,c=rings[j].points[k+1].p,d=rings[j+1].points[k+1].p;
   for(const tri of[[a,b,c],[c,b,d]]){const h=rayTriangle(s.center,dir,...tri);if(h&&(!hit||h.distance<hit.distance))hit=h;}
  }
  // At open end rings a normal ray can leave the loft. Project onto its nearest
  // real side triangle instead of placing a leaf beyond the end or inventing bark.
  if(!hit){const target=add(s.center,mul(dir,Math.hypot(...sub(ring.points[k0].p,ring.center))));let best=Infinity;
   for(let j=Math.max(0,s.j-2);j<=Math.min(rings.length-2,s.j+2);j++)for(let k=0;k<sides;k++){
    const a=rings[j].points[k].p,b=rings[j+1].points[k].p,c=rings[j].points[k+1].p,d=rings[j+1].points[k+1].p;
    for(const tri of[[a,b,c],[c,b,d]]){const point=closestPoint(target,...tri),error=Math.hypot(...sub(target,point));if(error<best){best=error;hit={point,normal:norm(cross(sub(tri[1],tri[0]),sub(tri[2],tri[0]))),distance:Math.hypot(...sub(point,s.center)),projected:true};}}
   }
  }
  if(dot(hit.normal,dir)<0)hit.normal=mul(hit.normal,-1);
  const overlap=Math.min(embed,hit.distance*.08);return{base:sub(hit.point,mul(hit.normal,overlap)),surface:hit.point,center:s.center,axis:s.axis,normal:hit.normal,radius:hit.distance,overlap};
 }
 return{sample,attachment};
}
