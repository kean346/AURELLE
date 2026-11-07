# AURELLE implementation and validation

## Delivered

An original React/TypeScript/Vite website in the previously empty repository. The visual system includes a warm photographic portrait opening, pinned reversible product/glass scene, interactive live-3D serum, depth runway, texture chapter, three editorial ritual stops, journal, philosophy, still-life conversion section and footer. Original product geometry, generated campaign stills, self-hosted fonts and transparent product renders are included.

### Reference systems

| System             | Implementation                                                                                                                                                                                                                                                                                                                                                                                                                                       | Verification and limits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maison Vell        | `src/components/Runway.tsx`: original seven-stop depth arrays; p/target; wrapping; linear interpolation; inverse-scale blur; .0072 exponential smoothing; 50 ms dt cap; original drag sensitivity; 150 ms wheel rounding; pointer focus; .32 cursor following; rolling number; 12-card rail at p×2. Original skincare renders replace reference fashion imagery. Scoped keyboard controls and an explicit exit preserve page navigation.             | Built and visually inspected before adding the rest of the site. Actual browser tests cover drag, wheel, click, arrow keys, six-step loop, first rail item synchronization, favorites and bag updates. Real mobile touch drag and exit-link tests pass. Runway remains **2D sprite depth projection**, not a live-3D claim.                                                                                                                                                                                         |
| Mainframe          | `Hero.tsx` / `media.ts`: relative mouse delta, .8 sensitivity, clamped latest-target queue, one in-flight seek, no autoplay; 38 ms typewriter after 600 ms; action entrance after 400 ms; portrait framing; mobile menu and keyboard-accessible film slider.                                                                                                                                                                                         | Forward/reverse and keyboard scrubbing verified with a 4-second H.264 test pattern, served with correct byte ranges. Regression tests cover queue coalescing, metadata, clamping, cleanup and preventing repeated retries when a decoder lands on a different frame. **Final moving head/hand footage is absent.** The current portrait is an honest static generated poster.                                                                                                                                       |
| Novu               | `Story.tsx`, `FrameFilm.tsx`, `frame-worker.ts`: continuous sticky story viewport, one GSAP ScrollTrigger progress, bidirectional live-3D camera orbit; optional native seek or MP4Box/WebCodecs software-decode path, JPEG snapshots, bounded bitmap LRU, first-frame gate, subframe blend, nearest-frame rendering, cover-to-height interpolation and edge-color feathering. Unsupported worker/decode uses a muted half-speed frame-capture pass. | Browser fixture verifies all 96 frames of a 4-second, single-keyframe H.264 file decode, display and change forward/backward on scroll. Missing-Worker capture fallback also passes. Worker implementation uses a single combined decode/encode worker, with downsampling and strict budgets, rather than the reference's encoder pool. **Matching hand-wipe, macro and campaign films are absent.** Final cinematic continuity requires those assets; the default is an explicitly labeled original live-3D study. |
| Genuine product 3D | `productScene.ts` / `ProductWorld.tsx`: procedural meshes, custom label textures, physical materials, environment lighting, OrbitControls, arrow rotation and reset; lazy construction, software-renderer budget, render-on-change, teardown and context-loss poster.                                                                                                                                                                                | Camera rotation and reset verified in Chromium; reversible story orbit verified. Context-loss fallback is visible and labeled. No downloaded product GLB or rigged human model is represented as included.                                                                                                                                                                                                                                                                                                          |

## Checks

- Clean frozen-lockfile reinstall: `npm ci --no-audit --no-fund --cache /workspace/.npm`. The initial default-cache attempt failed because `/home/agent/.npm` was unavailable; the workspace-cache reinstall succeeded with integrity verification retained. Saved setup instructions use that working cache path.
- TypeScript and production Vite build: pass. Three.js is lazy-loaded; its engine chunk still produces Vite's standard >500 kB chunk-size advisory. No build error or verification bypass.
- Seek-controller unit suite: **4 passed**, no skips.
- Chromium browser interactions: runway drag/wheel/click/keys/wrap/rail, favorite toggling, persistent bag, demo bag review, 3D rotation/reset, reversible story and ritual chapters, local newsletter and contact-draft download.
- Responsive screenshots inspected at **1440×900, 1920×1080 and 390×844**; no horizontal overflow. Phone rail becomes a 160px-card horizontal track. Mobile menu opens and closes with focus handling.
- Real touch input tested through Chromium's mobile input protocol: horizontal runway drag and intentional exit link.
- Reduced-motion runway jumps directly to the target; human motion is disabled, poster remains, and 3D story is held at its initial pose.
- Native film fixture: no hero autoplay, pointer advances/reverses time, keyboard range control seeks, scroll advances/reverses story time.
- Single-keyframe fixture: MP4Box/software WebCodecs pipeline decodes 96 frames; canvas images change forward/reverse; cache and bitmap concurrency are bounded.
- Missing Worker: sequential native frame-capture fallback reaches a ready canvas.
- WebGL context loss: explicit product-render fallback appears.
- No browser page errors in the main suite. Screenshots and test-pattern fixtures are retained under ignored `artifacts/`.
- Formatting check: pass.

Tests exercise actual browser behavior and deterministic synthetic media. They do **not** verify absent human choreography, finished campaign films, Safari-specific decoder behavior, commercial product formulas or a production commerce backend.

## Important files

- Application shell, header, bag/favorites persistence and footer: `src/App.tsx`, `src/main.tsx`, `src/style.css`.
- Reference interactions and chapters: `src/components/{Runway,Hero,Story,FrameFilm,ProductWorld,Editorial,Dialogs}.tsx`.
- Product data, geometry, film queue and decode worker: `src/lib/{products,productScene,media,frame-worker}.ts`.
- Development-only product render tool: `src/Studio.tsx`, `scripts/render-products.mjs`, `scripts/trim-products.py`.
- Test suites: `tests/seek.test.mjs`, `tests/browser.mjs`, `tests/resilience.mjs`.
- Assets: `public/media/manifest.json`, six product PNGs, portrait and still-life WebPs; fonts' symbol subset and license notices under `public/fonts/`.
- Tooling: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.nvmrc`, `index.html`, `.gitignore`.
- Setup and media integration: `README.md`, `ASSET_REQUIREMENTS.md`.

## Remaining production inputs

1. Approved HD close-up woman/head/hand footage matching the supplied choreography; the original 9-frame GIF binary was not among the accessible files. The hero currently does not animate the woman's face or hand.
2. Matching transition/liquid/campaign films for the photographic narrative. Integration slots and controllers exist; these files have not been invented.
3. A licensed rigged human model only if a real-time human is desired. None exists here. Procedural live-3D product geometry already works without a GLB.
4. Final packaging, formulas, ingredient specifications and commercial media clearance.
5. Production checkout/email services, if desired. Current bag/favorites are local, newsletter interest is local, and contact downloads a draft. No order or message is falsely described as sent.

The environment configuration draft contains complete `install_script` and `start_skill` instructions. Saving that draft does not publish the environment. Publication and fresh-task snapshot restoration have not been claimed or performed.
