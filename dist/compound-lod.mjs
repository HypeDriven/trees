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
export function bipinnatePinnaScale(t,fever=false){
 t=Math.max(0,Math.min(1,t));return (fever?.72:.68)+(fever?.28:.32)*Math.sin(Math.PI*t)- (fever?.13:.16)*Math.pow(t,1.7);
}
export function bipinnateCoverage(x,y,pairs=4,leafletPairs=9,terminal=false){
 const u=Math.abs(x-.5)*2;
 if(terminal)return jacarandaCoverage(u,y,pairs,leafletPairs);
 const rowStep=.66/(pairs-1),row=Math.round((y-.16-u*.10)/rowStep),center=.16+row*rowStep+u*.10;
 if(row<0||row>=pairs)return u<.004&&y>=.03&&y<=.86?1:0;
 const scale=bipinnatePinnaScale(row/(pairs-1),leafletPairs>9),px=u/scale;
 if(y>.95||y<.03||u>.98)return 0;
 if(u<.004&&y<.86)return 1;
 if(row<0||row>=pairs)return 0;
 if(px<.94&&Math.abs(y-center)<.0015)return 1;
 const spacing=.8/(leafletPairs-1),column=Math.round((px-.10)/spacing),s=column/(leafletPairs-1),leafScale=(.72+.28*Math.sin(Math.PI*s))*(1-.24*s*s),dx=(px-(.10+column*spacing))/Math.min(.035,spacing*.35),dy=(Math.abs(y-center)-.041*leafScale)/((leafletPairs>9?.0272:.034)*leafScale);
 return column>=0&&column<leafletPairs&&dx*dx+dy*dy<1?1:0;
}

// Opposite simple leaves on a deciduous branchlet: not a compound leaf.
export function redwoodSprayCoverage(x,y){
 const u=Math.abs(x-.5)*2,step=.74/23,row=Math.round((y-.08-u*.12)/step),center=.08+row*step+u*.12;
 if(y<.035||y>.985)return 0;if(u<.006&&y<.95)return 1;if(row<0||row>23)return 0;
 const scale=bipinnatePinnaScale(row/23,true),s=u/scale,width=.013*Math.pow(Math.max(0,Math.sin(Math.PI*s)),.55)*(1-.18*s);
 return s>=.02&&s<.96&&Math.abs(y-center)<width?1:0;
}

// Twelve two-needle fascicles projected onto one cohort card. Distances are
// fractions of needle length, so the silhouettes remain about 1.2 mm wide
// for a 100 mm needle. A crossed pair of cards represents twenty-four fascicles.
export function pineSprayCoverage(x,y){
 const p=[(x-.5)*2*.85,y*1.8];
 for(let j=0;j<12;j++)for(let k=0;k<2;k++){
  const sign=j%2?1:-1,a=[0,(.05+j*.032)*1.8],b=[sign*(.60+k*.035),a[1]+.75+k*.04],d=b.map((v,i)=>v-a[i]),q=p.map((v,i)=>v-a[i]),t=Math.max(0,Math.min(1,(q[0]*d[0]+q[1]*d[1])/(d[0]*d[0]+d[1]*d[1]))),width=.006*(1-.8*Math.pow(t,8));
  if(Math.hypot(q[0]-d[0]*t,q[1]-d[1]*t)<width)return 1;
 }
 return 0;
}
