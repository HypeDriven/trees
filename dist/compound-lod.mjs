// Whole-tree sweet-thorn foliage uses alpha-cut compound-leaf surfaces.
// Close organ studies retain explicit rachises, pinnae and individual leaflets.
// Keep this coverage function in agreement with both GPU shader versions.
export function jacarandaPinnaScale(t){
 t=Math.max(0,Math.min(1,t));
 return (.66+.34*Math.sin(Math.PI*t))*(1-.56*Math.pow(t,1.7));
}
function jacarandaCoverage(x,y,pairs,leafletPairs){
 if(y<.03||y>.997)return 0;
 if(x<.0035&&y<.985)return 1;
 if(y>=.84&&x<.13){
  const z=(y-.84)/.145,cell=Math.round(z*13),s=cell/13,scale=(.60+.40*Math.sin(Math.PI*s))*(1-.40*s*s),dx=(x-.055*scale)/(.050*scale),dy=(z-s)/.028;
  if(cell>=0&&cell<=13&&dx*dx+dy*dy<1)return 1;
 }
 const step=.66/(pairs-1),row=Math.round((y-.16-x*.07)/step);
 if(row<0||row>=pairs)return 0;
 const scale=jacarandaPinnaScale(row/(pairs-1)),u=x/scale,center=.16+row*step+x*.07;
 if(u<.94&&Math.abs(y-center)<.0015)return 1;
 const spacing=.8/(leafletPairs-1),column=Math.round((u-.10)/spacing),s=column/(leafletPairs-1),leafScale=(.62+.38*Math.sin(Math.PI*s))*(1-.28*s*s),dx=(u-(.10+column*spacing))/Math.min(.035,spacing*.35),dy=(Math.abs(y-center)-.015*leafScale)/(.013*leafScale);
 return column>=0&&column<leafletPairs&&dx*dx+dy*dy<1?1:0;
}
export function bipinnateCoverage(x,y,pairs=4,leafletPairs=9,terminal=false){
 const u=Math.abs(x-.5)*2;
 if(terminal)return jacarandaCoverage(u,y,pairs,leafletPairs);
 const rowStep=.66/(pairs-1),row=Math.round((y-.16-u*.10)/rowStep),center=.16+row*rowStep+u*.10;
 if(y>.95||y<.03||u>.98)return 0;
 if(u<.004)return 1;
 if(row<0||row>=pairs)return 0;
 if(u<.94&&Math.abs(y-center)<.0015)return 1;
 const spacing=.8/(leafletPairs-1),column=Math.round((u-.10)/spacing),dx=(u-(.10+column*spacing))/Math.min(.035,spacing*.35),dy=(Math.abs(y-center)-.041)/(leafletPairs>9?.0272:.034);
 return column>=0&&column<leafletPairs&&dx*dx+dy*dy<1?1:0;
}
