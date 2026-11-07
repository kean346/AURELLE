# Improving the AURELLE imagery further

The revised site uses actual playable portrait footage, high-resolution product renders, physical Three.js product materials, simulated serum droplets, and a generated macro still. The exact supplied woman/hand reference is still only available to the tools as an inline image, not a downloadable animation binary. The replacement clip is a different woman and shot; it is not represented as a recreation of that footage.

## Highest-impact production upgrades

1. **Exact hero movement:** use a real MP4/GIF file, or a direct downloadable source. The current self-hosted replacement is 480×908, not HD. A 1440p/4K close-up with the desired hand movement will look substantially better than enlarging this source. A model still cannot supply new hand motion or hidden frames. Replace `hero.src` and `hero.poster` in `public/media/manifest.json`.
2. **Exact product shapes:** export manufacturing CAD to a clean GLB/glTF with real dimensions. Supply vector label artwork and a reference photo. This replaces the original procedural packaging rather than trying to approximate a real SKU with cylinders.
3. **Studio-level material accuracy:** use measured glass tint/transmission, 2K–4K label art and roughness/normal maps, plus an approved high-resolution studio HDRI. The current setup is original procedural geometry with a lightweight studio-light environment; live reflections are not a path-traced product photograph.
4. **Photoreal serum dripping:** supply a Blender/Houdini liquid simulation rendered to video, or a baked animated mesh for interactive use. The current live droplets are geometric animation, not a fluid solver. High-end viscous stretching, wet contact and splashes require simulation.
5. **Production portrait clearance:** source a commissioned/model-released campaign clip. Attribution and source details for the temporary upstream example are included under `public/media/credits/`.

## Current art controls

- Geometry, bottle tones, physical materials and light panels: `src/lib/productScene.ts`.
- Interactive pipette, three animated drops, camera and plinth: `src/components/ProductWorld.tsx`.
- Original depth choreography: `src/components/Runway.tsx`. Depth constants and spring remain unchanged. Wheel navigation activates when the runway is focused; Escape returns normal page scrolling. Rolling-number height is cached rather than measured every animation frame.
- Unified charcoal/olive palette, hero framing, cards and responsive layout: `src/revision.css`.
- Re-render the six 1800px studio canvases using `npm run render:products` with the development server running. Resulting transparent PNGs are cropped without enlarging them.

No missing-asset notices, setup prompts or licensing questions are placed in the public website interface.
