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
