// Additional South African garden specimens. Jacaranda and river red gum
// are introduced; monkey's tail is a native fibrous-stemmed perennial.
export const GARDEN_SPECIES={
 jacaranda:{name:'Jacaranda',latin:'Jacaranda mimosifolia',family:'Bignoniaceae',leaf:[.003,.012],length:.007,petiole:[.025,.05],leafletPetiole:0,width:.14,bud:.003,veins:5,rows:4,twig:[.30,.25,.18],leafColor:[.15,.30,.07],fall:[.55,.44,.10],compound:'bipinnate',pinnaPairs:[7,14],leafletPairs:[7,20],cardLeafletPairs:16,terminalPinna:true,opposite:true,region:'South African gardens',introduced:true,fruitStudySpan:.16,source:'https://biodiversityadvisor.sanbi.org/search/detail/352061a0-edb2-43c9-b5b9-ed053ce81552',habit:'Short irregular bole and broad, uneven spreading crown with gently arching boughs.',traits:['Opposite fern-like bipinnate leaves; a terminal pinna ends the rachis','Blue-violet tubular flowers in loose terminal panicles','Flattened woody capsules split into two valves and release winged seeds'],range:'Leaflet length 3–12 mm; representative complete leaves 0.15–0.40 m long.',limitations:'Introduced from South America. Spring represents the largely leafless flowering phase; summer has full foliage. Flower density, leaf counts and capsule opening are illustrative, not a fitted local calendar.'},
 monkeytail:{name:'South African monkey’s tail',latin:'Xerophyta retinervis',family:'Velloziaceae',leaf:[.075,.50],length:.24,petiole:[0,0],width:.012,bud:.001,veins:0,rows:12,twig:[.075,.060,.042],leafColor:[.20,.29,.085],fall:[.43,.33,.14],growthForm:'xerophyte',heightRange:[.3,1.8],rootDepthRange:[.10,.65],organStudySpan:.60,region:'South Africa',fruitStudySpan:.25,source:'https://pza.sanbi.org/xerophyta-retinervis',habit:'Stumpy black fibrous axes, mainly basal branching, ending in sheathed tufts of 3–7 keeled leaves and separate slender flower stalks.',traits:['A native perennial, not a large woody tree','Persistent leaf bases form a fibrous stem jacket; root strands descend within it','Overlapping fan-shaped sheaths blend the terminal tuft into the fibrous stem', 'One to three six-tepalled flowers on separate slender 75–155 mm stalks'],range:'Representative stems 0.3–1.8 m high; blades 75–500 mm long and 2–8 mm wide.',limitations:'Winter is a leafless dry-phase snapshot. Rehydration physiology, fire history and internal root transport are not simulated. Stem sections represent the fibrous jacket rather than ordinary bark and annual wood rings.'},
 eucalyptus:{name:'River red gum',latin:'Eucalyptus camaldulensis',family:'Myrtaceae',leaf:[.12,.22],length:.17,petiole:[.012,.015],width:.045,bud:.006,veins:16,rows:10,twig:[.36,.20,.14],leafColor:[.20,.30,.21],fall:[.20,.30,.21],evergreen:true,heightRange:[5,35],organStudySpan:.28,region:'South African gardens',introduced:true,fruitStudySpan:.13,source:'https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f',habit:'Tall irregular bole, massive winding spreading limbs and pendulous adult foliage.',traits:['Alternate adult leaves, narrow, often sickle-shaped and similarly coloured on both faces','Smooth mottled peeling bark with occasional rough basal patches','Cream stamen-rich umbels; woody capsules with a raised rim and projecting valves'],range:'Adult blade target 120–220 mm; petioles 12–15 mm. Juvenile opposite broad leaves are not represented.',limitations:'An introduced Australian eucalyptus common in South Africa. This is an adult river red gum profile, not every gum species or subspecies. Bark colours, gland relief, flowering and valve positions are procedural approximations.'}
};
export const GARDEN_PRESETS={
 jacaranda:{height:12,spread:1,leafSize:.007,density:72,rootDepth:1.3,season:'spring'},
 monkeytail:{height:1.1,spread:1,leafSize:.24,density:65,rootDepth:.25},
 eucalyptus:{height:22,spread:.9,leafSize:.17,density:72,rootDepth:1.7}
};
export const GARDEN_CROWNS={
 jacaranda:{radius:.024,trunk:.36,lean:.07,bend:.22,taper:.37,scaffolds:9,start:.43,up:.60,length:.50,leader:.38,spread:.74},
 eucalyptus:{radius:.026,trunk:.60,lean:.045,bend:.18,taper:.25,scaffolds:11,start:.38,up:.42,length:.37,leader:.30,spread:.74}
};
export const GARDEN_REFERENCES=[
 ['Jacaranda leaves, flower panicles and capsules','https://biodiversityadvisor.sanbi.org/search/detail/352061a0-edb2-43c9-b5b9-ed053ce81552'],
 ['Monkey’s-tail stem, roots and seasonal habit','https://pza.sanbi.org/xerophyta-retinervis'],
 ['Monkey’s-tail blades and flowers','https://biodiversityadvisor.sanbi.org/search/detail/dcd59946-9213-4565-9cd1-9feb45dfc9d9'],
 ['Monkey’s-tail crowns, sheaths and flowering stalks — Flora Zambesiaca','https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:67155-1/general-information'],
 ['River red gum adult anatomy','https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f'],
 ['River red gum in South Africa','https://www.arc.agric.za/arc-ppri/Pages/River-red-gum-%28Eucalyptus-camaldulensis%29-%28Myrtaceae%29.aspx']
];

const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),norm=a=>mul(a,1/(Math.hypot(...a)||1));
export function buildXerophytaArchitecture(cfg){
 let seed=cfg.seed^0x2b19a7;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},R=(a,b)=>a+(b-a)*random(),h=cfg.height,records=[];
 const radius=Math.max(.015,Math.min(.028,h*.021)),at=(r,t)=>{const v=t*(r.points.length-1),i=Math.min(r.points.length-2,Math.floor(v)),f=v-i;return add(mul(r.points[i],1-f),mul(r.points[i+1],f));};
 function stem(p,d,len,r0,parent=null,t=0,role='lateral',phase=R(0,6.283)){
  const points=[[...p]],start=norm(d);let dir=start;
  for(let j=1;j<=18;j++){const q=(j-.5)/18,goal=norm([start[0]+Math.sin(q*4+phase)*.10*q,Math.max(.65,start[1]),start[2]+Math.cos(q*3+phase)*.10*q]);dir=j===1?start:norm(add(mul(dir,.55),mul(goal,.45)));p=add(p,mul(dir,len/18));points.push(p);}
  const r={id:records.length,points,r0,r1:r0*.86,depth:parent?parent.depth+1:0,parent:parent?.id??null,attachment:t,role,phase,children:0,fruit:true};records.push(r);if(parent)parent.children++;return r;
 }
 const main=stem([0,0,0],[.025,1,-.018],h,radius,null,0,'trunk');
 const basal=2+Math.min(2,Math.round((cfg.shoots??3)/2));
 for(let k=0;k<basal;k++){const a=k*2.399963+R(-.2,.2),t=.04+.035*k,p=at(main,t);stem(p,norm([Math.cos(a)*R(.20,.40),1,Math.sin(a)*R(.20,.40)]),h*R(.57,.86),radius*R(.65,.84),main,t,'scaffold');}
 const forks=Math.max(0,Math.min(2,Math.round(Math.min(2,(cfg.levels-1)*.65)*random())));
 for(let k=0;k<forks;k++){const t=.52+.35*(k+.5)/forks,p=at(main,t),a=k*2.399963+1.2;stem(p,norm([Math.cos(a)*.55,1,Math.sin(a)*.55]),h*R(.23,.35),radius*.62,main,t,'scaffold');}
 // The main axis itself carries a crown; no thin appended wooden extension.
 for(const r of records)r.crown=true;
 let maxY=Math.max(...records.flatMap(r=>r.points.map(p=>p[1]))),scale=h/maxY;for(const r of records)r.points=r.points.map(p=>[p[0]*scale*(cfg.spread??1),p[1]*scale,p[2]*scale*(cfg.spread??1)]);
 const terminals=records.filter(r=>r.crown);return{records,baseRadius:radius,stats:{profile:'monkeytail',trunkHeight:main.points.at(-1)[1],height:h,scaffolds:records.filter(r=>r.role==='scaffold').length,terminals:terminals.length,apicalContinuations:0,pendulousTips:0,upturnedTips:terminals.length,notes:GARDEN_SPECIES.monkeytail.habit}};
}
