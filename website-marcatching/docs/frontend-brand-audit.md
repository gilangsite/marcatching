# Marcatching Frontend Brand Audit

Audit ini memetakan seluruh surface yang dikelola dari admin ke sistem visual baru Marcatching. Perubahan dibatasi ke komponen, layout, typography, warna, motion, dan responsive styling. Request API, query Supabase, autentikasi, payload, route, dan struktur data tidak diubah.

## Brand foundation

- Background utama: `#030508`
- Raised surface: `#080d13`
- Primary text: `#f3f7fb`
- Secondary text: `#8e9baa`
- Quiet text: `#637180`
- Divider: `rgba(184, 214, 242, 0.13)`
- Accent: `#8cc6ff`
- Success: `#9de0c1`
- Primary action: light ice surface dengan dark ink
- Shape: 12–24px untuk card, pill untuk primary actions
- Motion: 180–400ms, restrained, dan menghormati `prefers-reduced-motion`

## Admin dashboard — 16 tabs

| Tab | Surface yang diaudit | Upgrade |
| --- | --- | --- |
| Home/Menu | KPI hero, finance pulse, navigation grid, signals | Dark intelligence console, subtle grid, refined metric hierarchy |
| Links & Buttons | Link list, type picker, editor, upload | Branded cards, dark inputs, consistent controls and drag rows |
| Contact Info | Contact form and status feedback | Dark form surface and centralized success feedback |
| Products | Product list, editor, media, features | Branded product editor, upload surface, action hierarchy |
| Vouchers | Voucher form, restrictions, states | Consistent fields, active/pending badges, dark panels |
| Orders | Order table, status, buyer actions | High-contrast data table, responsive horizontal scroll, branded menus |
| E-Course | Course, material, access editor | Same cards, inputs, status system, and action styling |
| Analytics | KPI, charts, date filters, tables | Dark data visualization surface and readable muted labels |
| Articles | Article list, block editor, author/category forms | Unified block cards, sticky action bar, dark editorial controls |
| Navigation | Navigation links and active states | Same list row, icon, status, and editor treatment |
| E-Commerce | Store blocks, product categories, sorting | Unified block management cards and responsive editor controls |
| About Page | Founder, ecosystem, dynamic sections, impact stats | Same branded upload, form, and section hierarchy |
| Champagne/Campaign | Campaign list, metadata, block editor | Branded campaign builder and consistent block controls |
| Finance | KPI, ledger, filters, transaction modal | Dark finance surface, legible tables, consistent modal styling |
| Security | Credential flow, sessions, hard exit | Dark security cards, clear danger hierarchy, readable session rows |
| Survey | Manage, questions, results, document preview | Dark survey builder and results UI; print document remains paper-white |

## Public surfaces controlled by admin

| Route/surface | Upgrade |
| --- | --- |
| `page.marcatching.com` | Rebalanced logo scale, dark link cards, branded contact/product surfaces, refined buttons and text |
| `/{campaign-slug}` | Dark Marcatching campaign surface, branded headline/body/action defaults, responsive 620px content rail |
| `/survey/{slug}` | Dark landing/questions/consent/thank-you flow, branded progress and selection states, mobile-safe actions |
| `/store` | Dark commerce system, mobile 2-column cards, branded sheets, cart, voucher, search, and filters |
| `/product/{slug}` | Dark split layout, branded feature/detail/CTA treatment, graceful poster fallback |
| `/product/{slug}/checkout` | Dark checkout form, add-on picker, voucher, transfer modal, and mobile fixed CTA |
| `/article` and `/article/{slug}` | Existing dark editorial system retained and aligned through the shared navbar/footer |
| `/course`, `/course/{slug}`, `/course/login` | Existing dark learning console retained; shared palette and responsive behavior verified |
| `/prompt-library` | Dark prompt cards, filters, drawer, steps, and CTA aligned to the new accent system |
| `/privacy`, `/terms-service`, `/data-deletion` | Existing dark legal cards retained through global typography, card, and button tokens |

## Responsive acceptance

- Mobile content rails stay inside the viewport; no horizontal document overflow on audited public routes.
- Fixed and sticky actions include safe-area padding.
- Dashboard multi-column forms/KPI sections collapse to one column below 768px.
- Survey editor sticky actions wrap instead of clipping.
- Store cards retain a readable two-column layout at 390px and collapse only where required.
- Modal height uses viewport-safe limits and internal scrolling.
- Typography uses fluid `clamp()` sizing for large headings.

## Feedback behavior

Admin save/update feedback is centered in the viewport, uses a restrained blurred backdrop, and renders an animated SVG ring plus check/error path. The message remains visible for 1.8 seconds and respects reduced-motion preferences.
