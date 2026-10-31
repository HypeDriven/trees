# Tree rendering changes and future species

- Give each leafy shoot a stable biological key and inherited relative age from
  its insertion on the parent branch. Use crown position only as an exposure
  bias. Couple shoot length/thickness, blade and petiole development to that
  state; retain within-shoot node rank for younger folded tip leaves. Set shoots
  must finish expansion, including their distal leaves.
- Vary poses around species phyllotaxis with bounded, seeded angular noise.
  Preserve opposite pairs/whorls and two-ranked foliage. Keep regional template
  growth rules and compound-leaf age coherent. Never key biology to mesh detail,
  triangle count or the order asynchronous refinements finish.
- Keep seeded root paths, radii and organ attachments independent of the camera
  and detail level. Preserve root faces crossing soil grade; only fully buried
  faces may be omitted in Whole tree. Root study must retain underground roots.
- Carry measured `surfaceDistance` with each inspection region. Camera clipping
  must use that value, adjusted for camera movement, including retained worker
  detail. An unset statistic must not force every close-up to the minimum near
  plane: doing so destroys root/soil depth precision at a distant orbit pivot.
- Refresh cached shadows whenever their light projection changes, including
  paused panning, viewport aspect, measured surface distance, inspection entry/exit
  and inspection radius changes. Geometry
  changes must invalidate them too.
- Shadow comparisons must reject positions outside the light volume and treat
  out-of-map filter taps as lit. Account for the receiver plane across PCF taps;
  a universal constant bias can produce streaks or detached shadows. Include
  the half-texel slope footprint in the bias for linear comparison filtering;
  checking only aligned texel centers can miss self-shadowing between texels.
- Keep GLSL and WGSL behavior aligned. Evaluate screen derivatives before
  material-dependent branches or discards; validate actual GPU pipelines, not
  just JavaScript syntax or fallback rendering.
- Check `node tests/foliage-distribution.mjs`, `node tests/shadow-contact.mjs`, `node tests/tree-inspection.mjs`,
  `node tests/retained-controls.mjs` and `node tests/architecture.mjs`. With their
  dependencies installed, run `python3 tests/gpu-validation.py` and
  `python3 tests/gl-validation.py`. Browser-check paused panning and continuous
  zoom toward root collars from several angles in WebGPU and WebGL2, as well as
  exposed Root study. Check for GPU errors and unexpected fallback.
- `node tests/shadow-pcf.cjs` uses Playwright/Chrome and a running local server
  to test the actual WebGPU shadow helper on a sloped receiver, an occluded
  receiver and positions outside the map. `PLAYWRIGHT_MODULE`, `CHROME_PATH`
  and `TREES_URL` can override local dependency and server paths.

- Start foliage reviews with the saved reference plate and regenerated all-species
  shoot/whole-tree contact sheets (`tests/render-natural-review.cjs`). Generated
  targets guide appearance, not anatomical measurements.
- Include species identity in all foliage streams. Mix parent-shoot posture and
  torsion with local blade residuals; vary continuous camber, sweep, width and
  asymmetry as well as yaw/pitch/roll. Check shapes in their local frames.
- A compound leaf's shared rachis plane is only a reference frame. Each leaflet
  needs its own roll and curvature, including opposite members and expanded LOD
  cards. Keep card centrelines pinned to their real supports.
- Avoid hard size clamping that collapses a whole cohort to identical lengths at
  slider limits. Preserve bounded residual variation within the adult range.
  Scale regional Shoot studies to their species' blade/leaflet dimensions.
- Test actual emitted blade frames for duplicates and coplanarity, not just the
  diversity of random inputs. Cover every preset and repeat detail/retention
  checks after changing the shared foliage builders.

- Fill long lower branches with independently seeded short leafy shoots, using
  branch length and crown position. Preserve existing upper-crown streams and
  roots; budget added nodes (currently at most 22%) rather than globally raising
  density. Connect new shoots through the emitted bark surface.
- Cached opacity masks must follow the encoded card family for every species,
  including regional bipinnate foliage. Empty cached alpha makes foliage vanish
  when Auto detail switches to distant rendering. Test actual GPU sampling over
  multiple mip levels, not only unchanged CPU organ counts.
- Run `node tests/lower-canopy.mjs` and, with Playwright/Chrome installed,
  `node tests/distant-foliage.cjs`, alongside detail/retained inspection checks.

- Use canonical skeleton exposure for added shoots (`crownHeight`), rather than
  a bark intersection that changes under inspection refinement. Density-fill
  shoots are vegetative; adding foliage must not reseed or multiply flowers.
