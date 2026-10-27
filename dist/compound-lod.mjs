// Whole-tree sweet-thorn foliage uses alpha-cut compound-leaf surfaces.
// Close organ studies retain explicit rachises, pinnae and individual leaflets.
// Keep this coverage function in agreement with both GPU shader versions.
export function bipinnateCoverage(x,y,pairs=4,leafletPairs=9,terminal=false){
 const u=Math.abs(x-.5)*2,rowStep=.66/(pairs-1),slope=terminal?.05:.10,row=Math.round((y-.16-u*slope)/rowStep),center=.16+row*rowStep+u*slope;
 if(y>(terminal?.999:.95)||y<.03||u>.98)return 0;
 if(u<.004)return 1;
 if(terminal&&y>.835&&u<.12){const z=(y-.84)/.14,cell=Math.round(z*15),dy=(z-cell/15)/.024,dx=(u-.055)/.050;if(cell>=0&&cell<=15&&dx*dx+dy*dy<1)return 1;}
 if(row<0||row>=pairs)return 0;
 if(u<.94&&Math.abs(y-center)<.0015)return 1;
 const spacing=.8/(leafletPairs-1),column=Math.round((u-.10)/spacing),dx=(u-(.10+column*spacing))/Math.min(.035,spacing*.35),dy=(Math.abs(y-center)-(terminal?.015:.041))/(terminal?.013:leafletPairs>9?.0272:.034);
 return column>=0&&column<leafletPairs&&dx*dx+dy*dy<1?1:0;
}
