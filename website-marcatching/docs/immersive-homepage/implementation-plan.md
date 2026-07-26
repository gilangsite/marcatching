# Immersive Homepage Implementation Architecture

## Narrative model

The homepage is one continuous transformation:

`market noise → intelligence → system → execution → measurable growth`

Eleven semantic chapters carry that story: Intelligence Core, Problem, AI Adoption Gap, Data Urgency, What We Build, Ecosystem, Impact, Pillars, Founder, Choose Your Path, and Final Formation.

## Rendering architecture

### Server layer

`app/page.tsx` remains the source of truth for Supabase data. Navigation and homepage configuration load in parallel. Existing referenced articles, products, and surveys are resolved on the server and passed as typed serializable props. SEO-visible content remains ordinary server-prerendered HTML; no essential claim lives only in WebGL.

### Client experience layer

- `ExperienceRuntime` maintains active section, normalized section progress, page progress, reduced-motion preference, performance tier, and normalized pointer position.
- `ExperienceCanvas` is the single fixed visual canvas for the homepage. It uses native WebGL shaders and procedural geometry, avoiding a heavy 3D runtime or binary model assets.
- `ExperienceNavigation` responds to page progress, highlights the active narrative chapter, and provides a keyboard-accessible fullscreen mobile menu.
- `Interactions` contains the reusable interaction primitives.
- `experience-data.ts` separates narrative statistics, flows, capabilities, and pillar content from animation logic.

No smooth-scroll library is introduced. Native scrolling is retained for accessibility, browser history, low overhead, and compatibility with the existing application. Motion is used only for progressive enhancement of DOM content.

## Adaptive performance tiers

| Tier | Selection | Rendering |
| --- | --- | --- |
| A | Desktop, >1100px, >4 logical cores, >4GB reported memory, no reduced motion | 920 procedural particles, antialiasing, DPR capped at 1.5, custom cursor |
| B | Mid-size desktop/tablet or constrained capable hardware | 480 particles, low-power context, DPR capped at 1.15, no custom cursor |
| C | Mobile <720px, reduced motion, or unavailable WebGL | CSS static visual, zero WebGL particles, no custom cursor or parallax requirement |

The render loop pauses while the document is hidden. The canvas has `pointer-events: none`, is `aria-hidden`, and never participates in layout.

## Scene mapping

The shader morphs one procedural point field by active section:

- Hero: rotating intelligence core
- Problem: chaos resolving into a grid
- AI gap: connected bridge
- Data: rising spatial bars
- What We Build: modular system grid
- Ecosystem: orbiting network
- Impact: dashboard grid
- Pillars: signal/human-machine transformations
- Founder: restrained orbital halo
- Paths: chaos versus directional bridge
- Finale: orbit resolving into the Marcatching mark

## Interaction primitives

The reusable set includes:

1. `MagneticButton`
2. `AnimatedUnderlineLink`
3. `TextReveal`
4. `SplitLineReveal`
5. `ImageMaskReveal`
6. `ParallaxImage`
7. `TiltCard`
8. `SpotlightCard`
9. `ExpandableCard`
10. `ScrollProgress`
11. `CustomCursor`
12. `SectionIndicator`
13. `AnimatedCounter`
14. `Tooltip`
15. `InteractiveDataNode`

Every essential action remains a native link or button. Touch devices receive the same information without hover. Drawers and dialogs support explicit close controls, Escape, and outside-click backdrops. Focus returns to the drawer trigger when it closes.

## Visual system

Homepage-scoped tokens in `about.module.css` define color, typography, spacing, radii, lines, shadows, motion easing, and maximum content width. The palette is charcoal/black with restrained steel and electric-blue intelligence accents. DM Sans remains the only typeface.

## Content and imagery

- Existing founder, article, product, survey, and content imagery continues to come from the CMS.
- Google Drive URLs use the existing thumbnail normalization strategy.
- `next/image` supplies responsive sizing and layout stability.
- When a CMS item has no image, a labeled Marcatching procedural panel is shown; no generic stock imagery or false documentary photography is inserted.
- Impact totals are explicitly labeled as current published CMS values, not live data.

## Dependency decision

No package was added. Native WebGL is sufficient for the procedural narrative and avoids the initial cost of Three.js, React Three Fiber, post-processing, GSAP, Lenis, or Zustand. The existing Motion package supplies DOM animation and in-view observation. The central experience store is a small `useSyncExternalStore` implementation.

## Verification plan

1. Homepage-scoped ESLint with zero warnings.
2. Repository TypeScript check with `tsc --noEmit`.
3. Full `next build` and route manifest review.
4. Production localhost HTTP response and critical-copy smoke test.
5. Repository lint comparison against baseline.
6. Manual checks for keyboard flow, Escape behavior, reduced motion, mobile stacking, horizontal rails, canvas non-interference, and responsive imagery when a browser target is available.
