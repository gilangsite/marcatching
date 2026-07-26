# Immersive Homepage Baseline Audit

Audit date: 2026-07-17 (Asia/Jakarta)

## Repository safety

- Workspace: `/Users/mac/Documents/website-marcatching-backup`
- The supplied backup has no `.git` directory. `git status` and branch creation both fail with `fatal: not a git repository`.
- Therefore `feature/immersive-homepage` could not be created and no commit or push is possible from this copy. Implementation continued in place as instructed for non-credential blockers.
- Existing application and public assets were preserved. No asset was deleted or overwritten.

## Runtime and package baseline

| Area | Baseline |
| --- | --- |
| Framework | Next.js 16.2.1, App Router, Turbopack |
| UI runtime | React 19.2.4 / React DOM 19.2.4 |
| Language | TypeScript 5.9.3 |
| Package manager | npm with `package-lock.json` |
| Styling | Global CSS plus CSS Modules; no Tailwind |
| Motion | `framer-motion` 12.38.0 |
| Icons | `lucide-react` 1.7.0 |
| Data | Supabase JS 2.100.1 |
| Image pipeline | `next/image`, with Google Drive allowed by `remotePatterns` |
| Font | DM Sans loaded globally from Google Fonts |

`npm ls --depth=0` resolves the declared dependency tree. It also reports one pre-existing extraneous transitive package, `@emnapi/runtime@1.9.1`; no homepage dependency was added.

## Application architecture

- `app/page.tsx` is a dynamic Server Component. It loads navigation, homepage configuration, and referenced ecosystem items from Supabase, then passes serializable data to the interactive homepage client.
- The legacy homepage client was `app/about/AboutClient.tsx`, a single large Client Component with a hero 2D canvas, Motion reveals, CMS-driven ecosystem cards, impact counters, founder content, audience filters, CTA, and WhatsApp contact flow.
- `app/about/page.tsx` remains a separate static route. The public `/` route uses the same homepage client directly.
- Global analytics and PWA registration are mounted in `app/layout.tsx` through `AnalyticsTracker` and `PWARegister`.
- SEO uses the Next Metadata API, file-based Open Graph/Twitter images, favicon assets, manifest metadata, and an index/follow robots directive.
- Security and service-worker headers live in `next.config.ts`.

## CMS and business integrations preserved

- Supabase tables used by the homepage: `nav_links`, `about_config`, `articles`, `article_categories`, `article_authors`, `products`, and `surveys`.
- Admin editing for homepage configuration remains in `app/admin/AboutPageConfigTab.tsx` and `/api/about-config`.
- Existing article, store, product checkout, survey, campaign, course, prompt library, admin, analytics, authentication, finance, voucher, and download routes remain unchanged.
- Existing CTA URL, contact email, founder data, comparison lists, ecosystem sections, social links, survey link, store link, and impact values remain controlled by `about_config`.
- Existing WhatsApp destination `+62 895-4127-47584` is preserved.

## Baseline route verification

The baseline production build succeeded and generated all 32 application routes, including:

- `/`, `/about`, `/article`, `/article/[slug]`
- `/store`, `/product/[slug]`, `/product/[slug]/checkout`
- `/survey/[slug]`, `/course`, `/course/[slug]`, `/prompt-library`
- `/admin`, `/admin/login`, `/[slug]`
- all existing API route handlers and legal pages

## Baseline quality gates

| Gate | Result |
| --- | --- |
| Dependency resolution | Pass; declared packages resolve |
| Production build | Pass |
| Type checking through `next build` | Pass |
| Repository lint | Pre-existing failure: 179 errors and 91 warnings across legacy admin, survey, campaign, rich-text, prompt data, and utility files |
| Automated tests | No test script or test runner is configured in `package.json` |
| Browser screenshots | Unavailable: the in-app browser runtime exposed no browser target |

The baseline lint failure is not caused by the immersive homepage. Representative existing issues include explicit `any`, unescaped JSX entities, `img` optimization warnings, components declared during render, CommonJS utility scripts, and unused variables.

## Baseline performance observations

- The homepage was already a large Client Component and imported Motion eagerly.
- The legacy hero used a dedicated full-hero 2D canvas with 110 individually drawn particles and shadow blur.
- No device capability tier or centralized reduced-motion state existed.
- The canvas resized at CSS-pixel resolution, rendered continuously, and was scoped to the hero rather than a global narrative.
- Homepage data loading contained independent initial Supabase queries that ran sequentially.
- Existing article/product/survey imagery already used `next/image`; imagery is CMS dependent.

## Constraints identified

1. Git history and branch operations are impossible in this backup because `.git` is absent.
2. Cross-browser visual QA cannot be automated in the current session because no in-app browser target is available.
3. No testing framework or scripted test suite exists.
4. Founder, UMKM, article, survey, and product photography quality is controlled by CMS content rather than repository assets.
