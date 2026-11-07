# AURELLE — Skin Studio

A dark olive and charcoal skincare concept in React, TypeScript and Vite. The current design has a real self-hosted portrait film, an interactive 3D serum/dropper scene, the original Maison Vell depth-runway controller, a golden-serum macro image and three touch-responsive closing cards.

## Development

Node 22+ (validated on 24.22.1), npm 10+:

```sh
cd /workspace/AURELLE
npm ci --cache /workspace/.npm
npm run dev
```

Cloud tasks are already isolated. Use the existing checkout; do not create a worktree unless explicitly requested. The workspace cache avoids the unavailable default home-directory npm cache. Fonts, imagery and the portrait video are self-hosted; no credentials or backend services are required.

```sh
npm run build
npm test
npm run format:check
npm run test:browser
```

Browser checks require a running Vite dev or preview server and Chromium. Defaults: `/usr/bin/chromium`, development port 5173. Set `CHROMIUM_PATH` or `TEST_BASE_URL` if needed. Checks exercise the actual delivered portrait video, rather than substituting a test pattern. Screenshots are written under ignored `artifacts/`.

## Interaction and imagery

- **Portrait:** `Hero.tsx` plays a local muted MP4, pauses on mouse scrubbing, supports forward/reverse time seeking through a single in-flight queue, and offers play/pause and an accessible range input. Reduced motion uses the poster. The replacement footage is not the original inline GIF or a commissioned AURELLE film; provenance and its 480×908 native resolution are documented in `public/media/credits/`.
- **Product 3D:** `productScene.ts` builds original lathed packaging, glass/foil materials, engraved collars and studio reflections. `ProductWorld.tsx` adds an animated pipette and three falling serum droplets, orbit controls, arrow rotation and reset. Droplets are animated geometry, not a fluid simulation.
- **Runway:** original KX/KF/KH/KB/KO depth tables, `.0072` spring, 50 ms time cap, `/max(150,W*.2)` drag, 150 ms wheel snap, infinite wrapping and synchronized 12-card rail remain. Wheel capture now requires focus, and Escape releases it; ordinary page scrolling works over the unfocused showcase. Rolling-number height is cached instead of reading layout every frame.
- **Cards:** pointer-follow tilt, reveal, hover lift and touch press. Activating a card opens an accessible detail dialog with a working local bag action.
- **Color and layout:** `revision.css` unifies the charcoal/olive palette. The previous long pinned story, old journal, philosophy and final campaign sections were removed from the active page.

The previous standalone scroll-video/WebCodecs integration modules remain in source for future footage integration but are **not mounted on the revised page**. Current browser tests cover the revised behavior, not that retired section.

`npm run render:products` rebuilds the original transparent cutouts from 1000×1800 studio canvases. Requires the development server, Chromium and Pillow. Rendering fails rather than replacing a valid image with a blank output.

Bag and favorites persist locally. Bag review, newsletter interest and enquiry-draft download are explicit demos with no payment or message delivery.

See [QA_REPORT.md](QA_REPORT.md), [ASSET_REQUIREMENTS.md](ASSET_REQUIREMENTS.md), and [ART_DIRECTION.md](ART_DIRECTION.md) for validation, provenance, limitations and concrete production upgrades.
