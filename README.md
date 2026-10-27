# StarHermit Trees

Buildless procedural tree and organ editor with native WebGPU, WebGL2 compatibility and a simplified Canvas2D preview. Serve `dist/` over HTTPS or localhost. No runtime JavaScript dependencies.

## Run locally

```sh
git clone https://github.com/HypeDriven/trees.git
cd trees
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Use HTTPS when hosting remotely so WebGPU is available. WebGL2 and Canvas2D are compatibility paths. No build step or package installation is needed to run the app.

## License

[PolyForm Noncommercial 1.0.0](LICENSE), with the same additional StarHermit.com game permission as `HypeDriven/starhermit-engine`. See the full terms in `LICENSE`. Third-party resources retain their own terms; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Morphology
`dist/botany.mjs` contains sourced profiles for fifteen species (fourteen trees and one fibrous-stemmed perennial), including the original Quercus robur, Salix babylonica, Pinus sylvestris and Betula pendula. South African profiles are defined in `dist/south-africa.mjs`, with the garden specimens in `dist/garden-species.mjs`. Geometry uses metres. Typical expanded leaf/needle length ranges constrain the mature-size control. Developing organs can be smaller. Species differ in lamina outline, petiole proportions, buds, branching habit, bark, reproductive structures and seasonal foliage. Pine needles occur in pairs and remain in winter. Wild olive and jacaranda have opposite decussate leaf pairs; sausage tree uses whorls of three pinnate leaves. The remaining broadleaf presets use alternate attachment sites. Wild olive, yellowwood, karee and river red gum remain evergreen through winter; the thorn trees use a dry/cold deciduous winter phase.

Whole-tree crowns keep seasonal foliage on every terminal shoot and use reduced organ geometry for interactive rendering. All internal branches have an apical continuation. Leaf density and leafy side-shoot controls add foliage; ancillary shoot complexity adapts at extreme depth/density combinations to preserve all terminal clusters within the GPU budget. Shoot, leaf and surface studies resolve individual organs, including upper and lower lamina surfaces and a finite blade edge. Crown maturity is a shape/art direction control, not an age or growth calculation.

## South African species

- **African baobab — Adansonia digitata:** swollen bole, irregular heavy limbs, palmate adult leaves and velvety closed woody capsules.
- **Fever tree — Vachellia xanthophloea:** high spreading crown, powdery yellow-green bark, finer bipinnate foliage, paired spines and lightly curved seed pods.
- **Sausage tree — Kigelia africana:** broad hanging boughs, pinnate leaves in whorls of three, maroon trumpet flowers and long-stalked, closed woody fruits.
- **Karee — Searsia lancea:** low rounded crown, drooping sprays, evergreen trifoliate leaves, coarse bark and small female drupe panicles.
- **Sweet thorn — Vachellia karroo:** irregular low forks, bipinnate foliage, paired pale spines, dark fissured bark, curved splitting pods and a taproot-biased root profile.
- **Marula — Sclerocarya birrea subsp. afra:** stout bole, rounded crown, pinnate leaves clustered near shoot ends, flaking grey bark and female drupes. The southern taxon is also published as subsp. caffra.
- **Wild olive — Olea europaea subsp. cuspidata:** a dense irregular crown, opposite decussate evergreen leaves with pale scaled undersides, furrowed grey bark and small purple-black drupes. Also widely named subsp. africana.
- **Real yellowwood — Podocarpus latifolius:** tall forest habit, narrow single evergreen leaves, strip-like fissured bark and exposed seeds above fleshy receptacles. This conifer does not bear a woody pine cone.

## Additional South African specimens

- **Jacaranda — Jacaranda mimosifolia:** introduced South American garden tree; short bole and arching irregular crown, opposite bipinnate leaves with a broad middle, progressively shorter distal pinnae, pointed elliptic pinnules and an unpaired terminal pinna, violet tubular spring flower panicles, and flattened two-valved woody capsules with winged seeds. The preset opens in a representative spring bloom phase; summer gives full foliage.
- **South African monkey’s tail — Xerophyta retinervis:** native perennial, modeled at 0.3–1.8 m stem height. Black fibrous stems have persistent leaf bases, 3–7 long keeled blades per terminal rosette, six-tepalled mauve flowers with six stamens, and bristly three-valved capsules. Its small fibrous root network, stem surface, cut faces and reduced stem sway differ from ordinary trees. Winter is a bare dry-phase snapshot.
- **River red gum — Eucalyptus camaldulensis:** introduced Australian eucalyptus common in South Africa; tall irregular bole, winding spreading limbs, hanging falcate adult leaves with similarly coloured faces, mottled smooth bark and curled peeling strips on thicker stems. Flowers have cream stamen-rich umbels; woody gum nuts have raised rims and four projecting valves. Juvenile opposite broad leaves are not represented.

Sources: [SANBI jacaranda morphology](https://biodiversityadvisor.sanbi.org/search/detail/352061a0-edb2-43c9-b5b9-ed053ce81552), [SANBI monkey’s tail](https://pza.sanbi.org/xerophyta-retinervis), [SANBI monkey’s-tail dimensions](https://biodiversityadvisor.sanbi.org/search/detail/dcd59946-9213-4565-9cd1-9feb45dfc9d9), [Royal Botanic Gardens Victoria river red gum](https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f), and [South African ARC river red gum](https://www.arc.agric.za/arc-ppri/Pages/River-red-gum-%28Eucalyptus-camaldulensis%29-%28Myrtaceae%29.aspx). These profiles distinguish native plants from introduced garden trees. Organ counts, tissue relief and seasonal snapshots remain procedural approximations.

Leaf study displays an entire compound leaf for all compound-leaf species; Surface study displays one leaflet at natural scale. The size control explicitly refers to leaflet length for these species. Attached marula fruit is green; the detached ripe fruit study is yellow. Release is enabled only for structures modeled as opening or disintegrating. Seasons refer to representative local growth phases, not northern-hemisphere calendar months. Baobab and sausage-tree fruits remain closed in every modeled stage; their seed-release option is disabled. The root presets distinguish broad shallow networks from deeper, sinker-rich profiles, with freely adjustable soil envelopes. Each species has distinct crown, material and connected-root settings, with the same wind and inspection controls.

Dense sweet-thorn, fever-tree and jacaranda canopies use procedural alpha-cut compound-leaf cards at physical scale, including the corresponding cutout in both GPU shadow paths. Sweet-thorn cards resolve 108–180 leaflet silhouettes; finer fever-tree cards resolve 208–364. Jacaranda adds finer terminal-pinna silhouettes. Three separate atlas rows preserve their different leaflet spacing in OBJ exports. Jacaranda uses the same tapered pinna envelope in GPU colour and shadow masks, OBJ opacity textures and the software preview; detailed studies use curved pinna axes and position-dependent pinnule size. Shoot and organ studies retain separate leaflet, rachis and pinna geometry. Other South African whole-tree blades use a reduced two-triangle outline; organ studies retain fine surface geometry. Canvas2D uses simplified pinna silhouettes. The reported bipinnate leaflet count includes the procedural silhouettes. OBJ export includes UVs and PNG colour/opacity maps for these cards; keep the supplied textures with the OBJ/MTL and enable alpha clipping in an importing renderer. Other shader microdetail remains procedural and is not baked.

Sources: SANBI PlantZAfrica for [baobab](https://pza.sanbi.org/adansonia-digitata), [fever tree](https://pza.sanbi.org/vachellia-xanthophloea), [sausage tree](https://pza.sanbi.org/kigelia-africana), [karee](https://pza.sanbi.org/searsia-lancea), [sweet thorn](https://pza.sanbi.org/vachellia-karroo), [marula](https://pza.sanbi.org/sclerocarya-birrea), [wild olive](https://pza.sanbi.org/olea-europaea-subsp-africana) and [real yellowwood](https://pza.sanbi.org/podocarpus-latifolius); dimensional references are linked in the species field notes. Root settings, architecture, organ counts and tissue micro-relief are illustrative rather than measured digital specimens.

## Surface detail
WebGPU and WebGL2 use vein relief, tertiary venation, a fine procedural cellular-grain field and small cuticle wrinkles to perturb surface normals in physical world units. A dielectric GGX model produces light-dependent wax highlights and a rougher underside; willow lower surfaces have a glaucous response. Simple-leaf surface studies offer 96 longitudinal subdivisions, upper/lower surfaces, a closed blade rim and raised/depressed vein geometry. Surface study zooms into a blade patch; its light and position controls help inspect the relief. Detail remains attached to leaf UVs during wind animation.

Surface amplitudes, blade thickness, cellular pattern and roughness are illustrative estimates, not measurements or scans. Cellular structure, stomatal anatomy, physiology, root hairs, disease and complete growth histories are not modeled. The tool is not a scientifically validated digital twin. The species field notes link botanical sources and explain these limits.

## Workflow and exports
- Whole-tree, shoot, leaf, leaf surface, wood, bark, exposed-root and fruit inspection views. Wood/bark can inspect representative trunk, branch-junction or branch sections.
- Seeded regeneration, season, crown, physical organ length and wind controls.
- Pointer/touch orbit, zoom, auto orbit and foliage toggle.
- JSON recipe import/export. Old recipes migrate to natural leaf lengths and receive defaults for missing study controls. Version 4 records canopy and root-system parameters. Version 5 uses the revised species architecture; version 6 adds developmental leaf sizing, continuous pine bark and winding roots; version 7 adds detailed reproductive structures and fruit-stage/cone-opening parameters; version 8 adds four South African species, compound-leaf studies and foliage-cutout export textures; version 9 adds baobab, fever tree, sausage tree and karee, radial compound leaves, ternate leaf whorls and distinct cutout-atlas rows; version 10 adds jacaranda, native monkey’s tail and river red gum, seasonal flower geometry, terminal pinnae, rosettes and small-plant controls; older recipes retain their parameters and regenerate with the current shape model. New recipes use the `starhermit-trees` identifier; existing `silva-tree` recipes remain importable.
- ZIP with a still OBJ, MTL and recipe. OBJ includes RGB vertex colors. Procedural surface shaders and wind are not baked into OBJ; exact material appearance requires porting the shaders.
- PNG snapshot.

## Checks

- `node tests/garden-species.mjs`: terminal pinna geometry, opposite jacaranda leaves, native monkey’s-tail rosettes and six-part flowers, fibrous roots, evergreen adult eucalyptus foliage, umbel counts and four-valved gum nuts.

- `node tests/more-south-africa.mjs`: radial leaf attachments, ternate whorls, closed woody fruits, capsule hairs, fine bipinnate spacing and baobab proportions.
- `node tests/south-africa.mjs`: pinnate/bipinnate anatomy, decussate attachment, evergreen foliage, southern reproductive stages and dense cutout coverage.
- `node tests/export.cjs`: UV/material export, binary cutout textures and recipe round-trips.
- `node tests/fruit.mjs`: separate spiral scales, physical scale opening, finite scale thickness, natural organ sizes, attachment, seed pairs, capsules, bracts and staged anatomy.

- `node tests/growth-bark-roots.mjs`: shoot/season-dependent leaf development, pine junction colour continuity and winding, irregular root networks.
- `node tests/architecture.mjs`: deterministic species silhouettes, connected forks, tangent-continuous apices, crown scaling and root-contact depth precision.

- `node tests/canopy-roots.mjs`: complete terminal foliage and connected, stationary root systems.
- `node tests/mesh-buffers.mjs`: adapter buffer limits, triangle alignment and shadow ranges.
- `node tests/wood.mjs`: physical relief fields, representative junctions, taper, circumference closure and species materials.
- `node tests/botany.mjs`: deterministic geometry, natural organ ranges, pine fascicles/evergreen behavior, deciduous winter behavior, buds and double-surface anatomy.
- `node tests/recovery.cjs`: fresh-canvas renderer fallback and retained camera controls.
- `python tests/gpu-validation.py` (requires `wgpu`): native WGSL and main/shadow pipeline validation.
- `python tests/gl-validation.py` (requires `moderngl` and `numpy`): compile the equivalent GLSL programs using a standalone EGL context and compare actual colour/shadow cutouts with the exported masks.

Native WebGPU rendering was also exercised offscreen on a Mesa software adapter for the close-up leaf material. Interactive browser QA uses the software preview because this browser exposes neither WebGPU nor WebGL2. Hardware GPU performance still needs verification on the target device. Canvas2D has simplified color, veins and shadows; it does not reproduce the GPU microfacet material.

## Wood detail
`dist/wood.mjs` builds rotation-minimizing cross-sections along smooth centerlines, with nonlinear taper, basal flare and shaped branch collars. Large whole-tree stems and branches share this generator; wood/bark studies increase tessellation. Cut faces in representative sections have end-grain shading. Geometry carries physical arc-length UVs, local maturity and radius. Bark shaders use species-specific multi-scale relief, color, crack occlusion, roughness and dielectric highlights: longitudinal oak/willow furrows, pine plates with a gradual warm-brown upper-bark blend, pale birch lenticels/striations and smoother fine twigs. Branch maturity decreases toward narrower tips.

Bark study focuses a roughly 130 mm field on the selected surface; its position and light controls inspect relief along the stem. GPU geometric relief remains in OBJ, along with RGB vertex colors; the procedural micro-material is not baked. Circumference position seams close exactly. Branch collars overlap the parent mesh and are not watertight Boolean unions. Representative wood sections, estimated roughness, relief depths, pore scales and end-grain rings are not scans or calibrated biological measurements. Botanical and branch-collar references appear in the field notes.

## Canopy and roots
Terminal foliage is generated for every living shoot. The last node lies within 1.5 mm of the shoot tip (or at 99.7% on short shoots), close to its terminal bud; willow retains its lack of a true terminal bud. Deciduous winter anatomy remains bare, while Scots pine retains paired needles. Whole-tree leaves use outline fans, small petioles and bud proxies; detailed leaf/shoot studies retain full geometry and surface materials.

`dist/roots.mjs` builds a connected hierarchy of structural roots, lateral roots, sinkers and fine feeder branches from an independent seed. Curves begin near the root collar, with persistent changes of direction, unequal emergence angles, unequal lengths and irregular fork spacing. Lateral roots inherit their parent’s local direction. Sinkers, tap roots and feeder roots curve as well. Depth and spread are adjustable soil envelopes, with illustrative species-biased starting profiles rather than biological constants. Root study exposes the complete system below its original ground grade; whole-tree view retains a ground plane at y=0 and frames only above-ground geometry. Root vertices have a negative material identifier so wind never moves them. Root geometry is included in OBJ exports. Microscopic root hairs, mycorrhizae, physiological responses and soil mechanics are not modeled. The network uses intersecting tubes rather than watertight Boolean unions.

Dense WebGPU meshes are split into triangle-aligned buffers of at most 64 MiB and respect the adapter limit. Ground vertices are excluded from the shadow pass even when they cross a buffer boundary.

## Species architecture

`dist/architecture.mjs` builds independent, seeded species skeletons with smooth, correlated bending, unequal scaffold lengths, crown-sector vigor and arc-length branch attachments. Every internal axis receives a tangent-continuous apical continuation. Height and horizontal crown spread scale the final skeleton.

- **Weeping willow:** low leaning trunk, unequal ascending/spreading boughs, broad three-dimensional arcs and long pendulous sprays. Hanging axes shorten toward the ground instead of being flattened against it. The model retains a weeping habit rather than the spiral stems of a corkscrew cultivar.
- **English oak:** short stout trunk, unequal scaffold forks, sinuous heavy limbs and upward recovery into a broad irregular crown.
- **Scots pine:** dominant gently wandering leader, uneven whorls, lateral branches with upturned shoots, and a maturity-dependent transition toward a more open lower crown and broader upper crown.
- **Silver birch:** slender leader, staggered ascending limbs, arching outer branches and progressively drooping fine twigs.

Habit references: [willow](https://plants.ces.ncsu.edu/plants/salix-babylonica/), [oak](https://plants.ces.ncsu.edu/plants/quercus-robur/), [pine](https://plants.ces.ncsu.edu/plants/pinus-sylvestris/), and [birch](https://plants.ces.ncsu.edu/plants/betula-pendula/) from NC State Extension. Crown-sector vigor and bending amplitudes are artistic approximations, not measured architectural parameters or simulated growth.

`dist/camera-range.mjs` adapts perspective near/far planes to the current scene scale. This prevents the loss of depth precision around soil-contact roots when orbiting a whole tree. The basal 4.5% of trunk height stays anchored in the GPU and software wind paths, keeping the trunk flare aligned with stationary roots.

## Leaf development and bark continuity

`dist/foliage-growth.mjs` gives each shoot a shared potential-size bias and each node a correlated mature size. Developing tip organs have reduced expansion and broadleaf blades are more folded, with shorter petioles. Spring shows developing apical foliage; representative summer extension is more common in willow/birch and less common in oak. Set autumn shoots have fully expanded foliage rather than an obligatory miniature tip. Pine keeps paired needles, with shorter developing spring needles alongside retained full-sized basal needles. These probabilities and gradients are illustrative stages, not fitted species phenology, actual shoot-age reconstruction, a short-shoot/long-shoot growth simulation, or a sun/shade physiology model. Detached organ studies continue to show a mature reference at the selected size.

Development references: [Betula pendula shoot development](https://pmc.ncbi.nlm.nih.gov/articles/PMC4242242/), [Scots pine needle elongation](https://pubmed.ncbi.nlm.nih.gov/28008084/), and [Quercus robur rhythmic shoot growth](https://academic.oup.com/treephys/article-abstract/26/2/229/1676814). Mature-length ranges are constraints on expanded potential sizes, not lower limits for young expanding leaves.

Pine colour now follows a common continuous height field on the trunk and branches. Plate scale, relief and roughness blend continuously toward the upper crown and fine twigs. The former whole-branch orange preset and basal whole-trunk preset are removed. This palette and its transition heights are artistic material estimates. Vertex colours carry the gradual blend into OBJ exports.

## Fruit and cone detail

`dist/fruit.mjs` builds Scots pine cones, English oak acorns, female willow fruiting catkins and silver birch fruiting catkins. Fruit study displays these reference structures independently of the whole-tree season or the flowers/fruit toggle. Frame fruit restores the camera; Surface detail (Scale surface for pine) focuses a small patch for close inspection. Developing, mature and seed-release stages are representative snapshots. Cone opening is an independent drying parameter, not an automatic season change.

Pine cone studies have 88 individually modeled, overlapping scales in a golden-angle spiral. Each includes an inner blade, a rhombic exposed face, a transverse keel, a small blunt dorsal boss, an underside and a finite rim. Smaller basal/apical scales follow an ovoid envelope. Open cones expose internal scale blades and sample pairs of winged seeds. Geometric grooves, per-scale colour/weathering and physical-UV procedural fibres, pores, fine splits and dielectric roughness support the close-up. Whole trees use reduced tessellation and attach mature cones to older branching axes behind the terminal extension; spring terminal shoots retain the schematic pollen and seed-cone stages. No sharp protective spine is added to the Scots pine scale.

Acorns have an ovoid shell, apical scar, long stalk and individual cup scales covering approximately 30% of the nut. Willow fruiting catkins have paired capsule valves, small seeds and silky hairs in the release study. Birch catkins have overlapping three-lobed bracts and two-winged nutlets; the release study partially disintegrates the bracts.

References: [Scots pine cone morphology](https://www.treesandshrubsonline.org/articles/pinus/pinus-sylvestris/), [Scots pine reproductive structures](https://plants.ces.ncsu.edu/plants/pinus-sylvestris/), [English oak](https://plants.ces.ncsu.edu/plants/quercus-robur/), [weeping willow](https://plants.ces.ncsu.edu/plants/salix-babylonica/), and [silver birch](https://plants.ces.ncsu.edu/plants/betula-pendula/). Scale counts, microgeometry amplitudes, stages, tissue thickness and material coefficients are illustrative rather than calibrated botanical measurements. Separate parts intersect; this is not a watertight Boolean model, reproductive physiology simulation, or scanned anatomical specimen. OBJ includes the geometric details and vertex colours with a separate fruit material; shader microdetail is not baked into textures.
