# Immersive Homepage Performance Report

Report date: 2026-07-17 (Asia/Jakarta)

## Architecture budget

- One active WebGL canvas for the entire homepage
- Zero GLB, texture, Draco, Meshopt, or post-processing payload
- Zero new npm dependencies
- Canvas DPR cap: 1.5 in Tier A, 1.15 in Tier B, no canvas in Tier C
- Particle budget: 920 / 480 / 0 for Tier A / B / C
- No real-time shadows, bloom, framebuffer effects, or offscreen canvases
- Typed-array geometry and shaders are created once per capability-tier lifecycle
- Render loop pauses on `document.hidden`
- Pointer coordinates are stored outside the React render loop
- Section state updates are coalesced through `requestAnimationFrame`
- Mobile and reduced-motion users receive an immediate CSS fallback

## Built asset measurements

Measurements are from the final local Next.js production build and are file-transfer approximations, not field telemetry.

| Homepage-specific asset | Raw | gzip |
| --- | ---: | ---: |
| Generated homepage JS chunk | 56,265 bytes | 15,385 bytes |
| Generated homepage CSS chunk | 47,531 bytes | 9,229 bytes |
| 3D binary assets | 0 bytes | 0 bytes |

Shared framework, React, Motion, and route-runtime chunks are reused by the application and are not represented as homepage-only cost above.

## Loading and image strategy

- Server-rendered headings, body copy, metrics, and links are visible before client interactivity
- The preloader follows actual `window.load` readiness and adds no artificial delay
- Critical logo assets use local static files and explicit dimensions
- CMS article, product, survey, and founder imagery stays on `next/image` with responsive `sizes`
- Missing CMS imagery uses CSS/procedural panels with no network request
- Initial Supabase navigation and configuration requests now run in parallel
- Homepage remains dynamic to preserve current CMS behavior

## Runtime degradation strategy

Tier C is selected for reduced motion or mobile widths below 720px. Tier B is selected for mid-size screens, four-or-fewer logical cores, or four-or-fewer reported GB of device memory. WebGL context failure falls back to the same CSS visual without hiding content.

## Targets and measurement limits

The implementation is designed around the requested 60 FPS capable-desktop and usable 30 FPS mobile budgets, but FPS, LCP, INP, CLS, and GPU timing require a real browser and device. The in-app browser was unavailable in this session, so no synthetic Lighthouse score or unverified FPS claim is included. Field measurement should be added through the existing analytics pipeline before using these as production claims.
