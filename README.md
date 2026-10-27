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
`dist/botany.mjs` contains sourced profiles for Quercus robur, Salix babylonica, Pinus sylvestris and Betula pendula. Geometry uses metres. Typical leaf/needle length ranges constrain the controls. Species differ in lamina outline, petiole proportions, buds, branching habit, bark, reproductive structures and seasonal foliage. Pine needles occur in pairs and remain in winter. Broadleaf shoots have alternate attachment sites.

Whole-tree crowns keep seasonal foliage on every terminal shoot and use reduced organ geometry for interactive rendering. All internal branches have an apical continuation. Leaf density and leafy side-shoot controls add foliage; ancillary shoot complexity adapts at extreme depth/density combinations to preserve all terminal clusters within the GPU budget. Shoot, leaf and surface studies resolve individual organs, including upper and lower lamina surfaces and a finite blade edge. Crown maturity is a shape/art direction control, not an age or growth calculation.

## Surface detail
WebGPU and WebGL2 use vein relief, tertiary venation, a fine procedural cellular-grain field and small cuticle wrinkles to perturb surface normals in physical world units. A dielectric GGX model produces light-dependent wax highlights and a rougher underside; willow lower surfaces have a glaucous response. The leaf study offers 96 longitudinal subdivisions, upper/lower surfaces, a closed blade rim and raised/depressed vein geometry. Surface study zooms into a blade patch; its light and position controls help inspect the relief. Detail remains attached to leaf UVs during wind animation.

Surface amplitudes, blade thickness, cellular pattern and roughness are illustrative estimates, not measurements or scans. Cellular structure, stomatal anatomy, physiology, root hairs, disease and complete growth histories are not modeled. The tool is not a scientifically validated digital twin. The species field notes link botanical sources and explain these limits.

## Workflow and exports
- Whole-tree, shoot, leaf, leaf surface, wood, bark and exposed-root inspection views. Wood/bark can inspect representative trunk, branch-junction or branch sections.
- Seeded regeneration, season, crown, physical organ length and wind controls.
- Pointer/touch orbit, zoom, auto orbit and foliage toggle.
- JSON recipe import/export. Old recipes migrate to natural leaf lengths and receive defaults for missing study controls. Version 4 records canopy and root-system parameters. Version 5 uses the revised species architecture; older recipes retain their parameters and regenerate with the current shape model. New recipes use the `starhermit-trees` identifier; existing `silva-tree` recipes remain importable.
- ZIP with a still OBJ, MTL and recipe. OBJ includes RGB vertex colors. Procedural surface shaders and wind are not baked into OBJ; exact material appearance requires porting the shaders.
- PNG snapshot.

## Checks

- `node tests/architecture.mjs`: deterministic species silhouettes, connected forks, tangent-continuous apices, crown scaling and root-contact depth precision.

- `node tests/canopy-roots.mjs`: complete terminal foliage and connected, stationary root systems.
- `node tests/mesh-buffers.mjs`: adapter buffer limits, triangle alignment and shadow ranges.
- `node tests/wood.mjs`: physical relief fields, representative junctions, taper, circumference closure and species materials.
- `node tests/botany.mjs`: deterministic geometry, natural organ ranges, pine fascicles/evergreen behavior, deciduous winter behavior, buds and double-surface anatomy.
- `node tests/recovery.cjs`: fresh-canvas renderer fallback and retained camera controls.
- `python tests/gpu-validation.py` (requires `wgpu`): native WGSL and main/shadow pipeline validation.
- `python tests/gl-validation.py` (requires `moderngl`): compile the equivalent GLSL programs using a standalone EGL context.

Native WebGPU rendering was also exercised offscreen on a Mesa software adapter for the close-up leaf material. Interactive browser QA uses the software preview because this browser exposes neither WebGPU nor WebGL2. Hardware GPU performance still needs verification on the target device. Canvas2D has simplified color, veins and shadows; it does not reproduce the GPU microfacet material.

## Wood detail
`dist/wood.mjs` builds rotation-minimizing cross-sections along smooth centerlines, with nonlinear taper, basal flare and shaped branch collars. Large whole-tree stems and branches share this generator; wood/bark studies increase tessellation. Cut faces in representative sections have end-grain shading. Geometry carries physical arc-length UVs, local maturity and radius. Bark shaders use species-specific multi-scale relief, color, crack occlusion, roughness and dielectric highlights: longitudinal oak/willow furrows, pine plates with orange upper bark, pale birch lenticels/striations and smoother fine twigs. Branch maturity decreases toward narrower tips.

Bark study focuses a roughly 130 mm field on the selected surface; its position and light controls inspect relief along the stem. GPU geometric relief remains in OBJ, along with RGB vertex colors; the procedural micro-material is not baked. Circumference position seams close exactly. Branch collars overlap the parent mesh and are not watertight Boolean unions. Representative wood sections, estimated roughness, relief depths, pore scales and end-grain rings are not scans or calibrated biological measurements. Botanical and branch-collar references appear in the field notes.

## Canopy and roots
Terminal foliage is generated for every living shoot. The last node lies within 1.5 mm of the shoot tip (or at 99.7% on short shoots), close to its terminal bud; willow retains its lack of a true terminal bud. Deciduous winter anatomy remains bare, while Scots pine retains paired needles. Whole-tree leaves use outline fans, small petioles and bud proxies; detailed leaf/shoot studies retain full geometry and surface materials.

`dist/roots.mjs` builds a connected hierarchy of structural roots, lateral roots, sinkers and fine feeder branches from an independent seed. Depth and spread are adjustable soil envelopes, with illustrative species-biased starting profiles rather than biological constants. Root study exposes the complete system below its original ground grade; whole-tree view retains a ground plane at y=0 and frames only above-ground geometry. Root vertices have a negative material identifier so wind never moves them. Root geometry is included in OBJ exports. Microscopic root hairs, mycorrhizae, physiological responses and soil mechanics are not modeled. The network uses intersecting tubes rather than watertight Boolean unions.

Dense WebGPU meshes are split into triangle-aligned buffers of at most 64 MiB and respect the adapter limit. Ground vertices are excluded from the shadow pass even when they cross a buffer boundary.

## Species architecture

`dist/architecture.mjs` builds independent, seeded species skeletons with smooth, correlated bending, unequal scaffold lengths, crown-sector vigor and arc-length branch attachments. Every internal axis receives a tangent-continuous apical continuation. Height and horizontal crown spread scale the final skeleton.

- **Weeping willow:** low leaning trunk, unequal ascending/spreading boughs, broad three-dimensional arcs and long pendulous sprays. Hanging axes shorten toward the ground instead of being flattened against it. The model retains a weeping habit rather than the spiral stems of a corkscrew cultivar.
- **English oak:** short stout trunk, unequal scaffold forks, sinuous heavy limbs and upward recovery into a broad irregular crown.
- **Scots pine:** dominant gently wandering leader, uneven whorls, lateral branches with upturned shoots, and a maturity-dependent transition toward a more open lower crown and broader upper crown.
- **Silver birch:** slender leader, staggered ascending limbs, arching outer branches and progressively drooping fine twigs.

Habit references: [willow](https://plants.ces.ncsu.edu/plants/salix-babylonica/), [oak](https://plants.ces.ncsu.edu/plants/quercus-robur/), [pine](https://plants.ces.ncsu.edu/plants/pinus-sylvestris/), and [birch](https://plants.ces.ncsu.edu/plants/betula-pendula/) from NC State Extension. Crown-sector vigor and bending amplitudes are artistic approximations, not measured architectural parameters or simulated growth.

`dist/camera-range.mjs` adapts perspective near/far planes to the current scene scale. This prevents the loss of depth precision around soil-contact roots when orbiting a whole tree. The basal 4.5% of trunk height stays anchored in the GPU and software wind paths, keeping the trunk flare aligned with stationary roots.
