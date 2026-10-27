// Adult organ ranges in metres; regional crown and root settings are
// illustrative profiles, not fixed dimensions or a calibrated growth model.
export const SOUTH_AFRICAN_SPECIES={
 sweetthorn:{name:'Sweet thorn',latin:'Vachellia karroo',family:'Fabaceae',leaf:[.004,.007],length:.006,petiole:[.006,.014],width:.19,bud:.002,veins:0,rows:4,twig:[.34,.17,.10],leafColor:[.13,.27,.065],fall:[.42,.36,.12],compound:'bipinnate',region:'South Africa',source:'https://pza.sanbi.org/vachellia-karroo',habit:'Low divisions and an irregular rounded, spreading crown.',traits:['Bipinnate leaves with paired pinnae and tiny paired leaflets','Paired straight, pale stipular spines','Yellow flower heads; flat, curved, splitting pods'],range:'Leaflet length 4–7 mm. Leaf study shows a complete bipinnate leaf; Surface study isolates a leaflet.',limitations:'A rounded inland form is represented, not every coastal or shrubby form. Winter represents a dry/cold deciduous phase. Pinna counts and spine lengths vary. Root depth and branching remain adjustable approximations.'},
 marula:{name:'Marula',latin:'Sclerocarya birrea subsp. afra',family:'Anacardiaceae',leaf:[.025,.065],length:.045,petiole:[.018,.035],width:.28,bud:.005,veins:9,rows:8,twig:[.37,.32,.23],leafColor:[.19,.34,.075],fall:[.56,.44,.13],compound:'pinnate',region:'South Africa',source:'https://pza.sanbi.org/sclerocarya-birrea',habit:'Stout upright bole and large limbs support a broad rounded crown.',traits:['Pinnate leaves with a terminal leaflet, crowded near shoot ends','Grey flaking bark; stout branchlets','Female specimen with green drupes; fallen fruit ripens yellow'],range:'Leaflet target 25–65 mm; representative complete leaves about 18–25 cm. Southern African marula, also published as subsp. caffra.',limitations:'Fruit studies show a detached ripe drupe. Attached fruit stays green: final yellow ripening normally follows abscission. The model represents a female tree; germination, fruit flesh and internal stone anatomy are not simulated.'},
 wildolive:{name:'Wild olive',latin:'Olea europaea subsp. cuspidata',family:'Oleaceae',leaf:[.02,.09],length:.048,petiole:[.002,.006],width:.12,bud:.002,veins:8,rows:8,twig:[.30,.29,.20],leafColor:[.18,.27,.12],fall:[.18,.27,.12],evergreen:true,region:'South Africa',source:'https://pza.sanbi.org/olea-europaea-subsp-africana',habit:'Dense spreading crown on an irregular, twisted framework.',traits:['Opposite, decussate evergreen leaves; entire, rolled margins','Dark upper surface; pale, finely scaled underside','Small axillary drupes ripen purple-black'],range:'Blade length 20–90 mm. This African wild olive is also widely named subsp. africana.',limitations:'Local leaf proportions and crown form vary. Fine underside scales are a procedural material approximation. Seasonal controls show representative stages, not a regional monthly calendar.'},
 yellowwood:{name:'Real yellowwood',latin:'Podocarpus latifolius',family:'Podocarpaceae',leaf:[.035,.06],length:.048,petiole:[.001,.003],width:.085,bud:.003,veins:0,rows:8,twig:[.25,.29,.17],leafColor:[.105,.25,.10],fall:[.105,.25,.10],evergreen:true,region:'South Africa',source:'https://pza.sanbi.org/podocarpus-latifolius',habit:'Tall forest bole with an irregular rounded crown and spreading branches.',traits:['Single, flat evergreen leaves with a strong central midrib','Longitudinally fissured grey bark peeling in narrow strips','Female seed cone: exposed seed above a fleshy receptacle'],range:'Adult blade length 35–60 mm. Juvenile leaves can be longer; this preset represents adult foliage.',limitations:'A female forest-form tree is represented. Its fleshy receptacle is not a botanical fruit or a woody pine cone. Exposed mountain forms and juvenile foliage are not modeled.'}
};
export const SOUTH_AFRICAN_PRESETS={
 sweetthorn:{height:8,spread:1,leafSize:.006,density:72,rootDepth:2.2},
 marula:{height:12,spread:1,leafSize:.045,density:70,rootDepth:2.1},
 wildolive:{height:8,spread:1,leafSize:.048,density:78,rootDepth:1.2},
 yellowwood:{height:20,spread:.85,leafSize:.048,density:72,rootDepth:1.8}
};
export const SOUTH_AFRICAN_REFERENCES=[
 ['Sweet thorn leaflet / pod dimensions','https://apps.worldagroforestry.org/treedb/index.php?keyattribute=Deciduous&theNode=Botanic'],
 ['Marula compound foliage and roots','https://apps.worldagroforestry.org/treedb2/AFTPDFS/Sclerocarya_birrea_ssp._caffra.PDF'],
 ['Wild olive blade and surface anatomy','https://pza.sanbi.org/sites/default/files/info_library/oleaeuropafric.pdf'],
 ['Yellowwood adult leaves and seed cones','https://opus.sanbi.org/bitstreams/bc8be93e-4e49-42bb-af72-057e09277a7a/download']
];
export const SOUTH_AFRICAN_CROWNS={
 sweetthorn:{radius:.023,trunk:.34,lean:.08,bend:.25,taper:.34,scaffolds:8,start:.43,up:.50,length:.57,leader:.40},
 marula:{radius:.031,trunk:.44,lean:.035,bend:.13,taper:.43,scaffolds:7,start:.51,up:.90,length:.47,leader:.40},
 wildolive:{radius:.029,trunk:.29,lean:.11,bend:.40,taper:.42,scaffolds:9,start:.36,up:.65,length:.52,leader:.47},
 yellowwood:{radius:.019,trunk:.72,lean:.025,bend:.08,taper:.16,scaffolds:12,start:.50,up:.40,length:.33,leader:.26}
};
