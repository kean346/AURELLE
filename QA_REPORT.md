# AURELLE revision — implementation and QA

## Changes

- Replaced the static portrait opening with an actual self-hosted, silent H.264 portrait video. It plays, pauses, scrubs forward/backward with the mouse and supports keyboard range seeking. Reduced motion and failed playback use an extracted first-frame poster. This is a sourced replacement shot, not the user's exact GIF; native resolution and provenance are documented.
- Rebuilt procedural product packaging: rounded lathed glass bodies, dark olive/amber tints, engraved metallic collars, direct foil labeling and more deliberate studio lighting. Regenerated all six product images on 1000×1800 canvases.
- Reworked the interactive 3D scene around the product, pipette, plinth and three falling serum droplets. Removed the large distracting glass rings and decorative floating balls. Product rotation and reset remain functional.
- Added an original golden-serum macro image to replace the blank/unconvincing texture scene.
- Unified page backgrounds, text and controls around dark olive/charcoal, warm off-white and restrained brass. Removed the abrupt pale sections.
- Removed the long “Less noise / More feeling” story, the old journal, philosophy and campaign ending from the active page. Three reveal/tilt/press cards now lead to accessible product detail dialogs.
- Addressed showcase scrolling: wheel capture requires focus; Escape releases it. The original depth math, spring, wrap and rail synchronization remain. Cached rolling-number line height removes a forced layout read from each animation frame.
- Retained working local bag/favorites, menu and contact/newsletter demo behavior.

## Validation

- Production TypeScript/Vite build passes. The lazy Three.js engine chunk has the usual >500 kB advisory; it is not a build error.
- Seek queue regression suite: **4 passed**, no skips.
- Formatting check passes.
- Actual local portrait MP4 verified for playback, pause, mouse forward/reverse and keyboard seeking.
- Runway checked for arrows, drag, focused wheel, infinite wrap, favorites, local bag and Escape. Unfocused wheel now scrolls the page instead of capturing it.
- Live 3D product checked for rendered output, rotation and reset.
- Macro artwork is present and visible; cards tilt and open working product/bag dialogs.
- Layout/screenshots checked at **1440×900, 1920×1080 and 390×844**. No horizontal overflow; mobile menu and reduced motion pass.
- Separate resilience suite checks real touch input, card activation, context-loss fallback and missing-video fallback.
- No runtime or console errors in the main revised browser suite.

The retired pinned story's earlier synthetic WebCodecs tests are historical; current tests do not claim that removed section is still on the website. Current browser tests exercise the delivered local portrait file.

## Limits and upgrades

The source portrait is a temporary 480×908 example, not HD campaign footage. The original inline GIF is not available to tools as a downloadable animation file; an accessible MP4/GIF would permit exact replacement. Product models are original procedural geometry, not factory CAD. Droplets are animated geometry, not a fluid solver. Safari and production commerce/email services have not been verified or added.

See ART_DIRECTION.md for precise upgrades: model-released 1440p/4K portrait footage, manufacturer CAD/GLB, real label artwork and material maps, studio HDRI, and a baked fluid simulation for photoreal viscous motion.

## Main changed files

`src/components/{Hero,ProductWorld,Runway,Editorial,ClosingCards}.tsx`, `src/lib/productScene.ts`, `src/{App,Studio,main}.tsx`, `src/revision.css`, six product PNGs, local portrait MP4/poster/source credits, serum macro image, revised browser/resilience tests, and the README/media/art-direction documentation.
