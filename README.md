# AURELLE

A luxury skincare concept built in React 19, TypeScript and Vite. Warm editorial photography, a reversible pinned 3D story, an original interactive Three.js serum, and the supplied Maison Vell depth choreography adapted to skincare.

## Run

Node 22+ (validated on 24.22.1) and npm 11:

```sh
cd /workspace/AURELLE
npm ci --cache /workspace/.npm
npm run dev
```

Use the existing checkout. Cloud tasks are already isolated; do not create a worktree unless explicitly requested. No environment secrets or backend services are needed. Install uses the npm registry and the checked-in lockfile. Fonts and imagery are self-hosted. In this cloud machine use `--cache /workspace/.npm`: the default home-directory npm cache is unavailable.

```sh
npm run build
npm test
npm run test:browser
```

The browser checks expect a running Vite server and Chromium at `/usr/bin/chromium` (override `CHROMIUM_PATH` or `TEST_BASE_URL`). Prepare the deterministic video fixtures with `npm run test:fixtures` first. They remain under ignored `artifacts/`; they never ship with the site. Screenshots are saved in that directory.

## Reference implementations

- **Maison Vell:** `src/components/Runway.tsx`. Original KX/KF/KH/KB/KO arrays, p/target state, linear depth interpolation, inverse-scale blur, transform-only sprite sizing, dt≤50 ms exponential easing `.0072`, direct drag `/max(150,W*.2)`, 150 ms wheel snap, click focus, cursor `.32`, number wrap, and 12-card rail at `p*2`. Keyboard listeners are scoped to the stage so page navigation remains usable. Tab or the explicit continuation link exits. Original generated cutouts replace reference fashion sprites.
- **Mainframe:** `src/components/Hero.tsx` and `src/lib/media.ts`. Relative pointer delta `.8*duration/viewportWidth`, clamped latest-target seek queue, no autoplay, responsive nav, intro/typewriter timings, accessible range scrubber. Disabled for reduced motion and ignored over UI controls/outside the hero. **The required portrait film is not supplied.** The generated poster remains static and labeled.
- **Novu:** `src/components/Story.tsx`, `FrameFilm.tsx`, `src/lib/frame-worker.ts`. Sticky shared story viewport, one GSAP ScrollTrigger progress source, 85% film completion, reverse seeking or worker MP4Box/WebCodecs decode, bounded JPEG/bitmap cache, adjacent-frame blend, first-frame gate, cover-to-height framing, edge-color feathering and nearest-frame fallback. A half-speed native capture pass supports browsers without WebCodecs/Worker. Original live 3D product/glass camera orbit is the default until an approved hand-wipe film exists. Native scroll is used consistently; no second smooth-scroll engine.
- **Three.js:** `src/lib/productScene.ts`, `src/components/ProductWorld.tsx`. Original mesh geometry, PBR materials, lighting/environment, original label textures, OrbitControls and keyboard-accessible rotation/reset. Lazy initialization near viewport, renders only when progress/camera/size changes, disposal on unmount. The runway is a projection of rendered sprites, not live 3D.

`npm run render:products` rebuilds the transparent cutouts using the development-only `?studio` route. Requires Pillow for alpha trimming; the current files are already included. Product bounding ratios intentionally adapt packaging silhouettes while preserving the depth table and controller.

## Local demo features

Bag quantity and favorites persist in localStorage, with safe parsing and unavailable-storage fallbacks. Bag review is a demo, with no payment or order API. Newsletter interest saves locally only. Contact form downloads an enquiry draft and sends nothing. Dialogs trap focus, restore focus, close with Escape, and lock the background scroll.

## Assets and limitations

See [ASSET_REQUIREMENTS.md](ASSET_REQUIREMENTS.md). Original cutouts, generated stills and live procedural product geometry are included. The attached text describes an animation but does not supply a playable GIF, final portrait/hand footage, macro films, or a rigged human asset. No still has been passed off as animated human footage. Production-ready commerce, email delivery, formula/ingredient specifications, licensed cinematic footage, and final asset matching remain separate integrations.

See [QA_REPORT.md](QA_REPORT.md) for verified checks and the precise limits of the supplied media.
