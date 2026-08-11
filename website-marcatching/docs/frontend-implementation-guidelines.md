# Frontend Implementation Guidelines — Deep Reference

Companion to `MARCATCHING_GUIDELINES.md` (root of repo — read that one first, it's the
short version that's mandatory before every task). This doc is the longer technical
reference: exact color tokens, code patterns, and postmortems of real bugs found and
fixed on 2026-08-11 so the same mistakes aren't repeated.

---

## 1. Theme map — which route uses which theme

| Route | Theme | Source of truth |
| --- | --- | --- |
| `inside.marcatching.com/*` (admin dashboard, all tabs) | **Dark** | `app/admin/admin.module.css` |
| `marcatching.com` homepage, `/article*`, `/course*`, `/{campaign-slug}`, `/survey/{slug}`, `/prompt-library`, legal pages | **Dark** | `app/globals.css` (`body { background:#000 }`) + per-page modules |
| `/store` | **Light** | `app/store/store.module.css` |
| `/product/{slug}` | **Light** | `app/product/[slug]/product.module.css` |
| `/product/{slug}/checkout` | **Light** | `app/product/[slug]/checkout/checkout.module.css` |

The store/product/checkout light theme is a **deliberate exception** to the site-wide
dark rebrand, made 2026-08-11 because the user preferred the original light storefront
look. Do not "fix" it back to dark without being asked — check this table first.

---

## 2. Color tokens

### Dark theme (admin + dark public pages)

```
Background:        #030508
Raised surface:     rgba(8, 13, 19, 0.88)
Divider/border:     rgba(184, 214, 242, 0.13)
Text — primary:     #f3f7fb
Text — muted:       #8e9baa
Text — quiet:       #637180
Accent:             #8cc6ff
Accent — dark ink:  #06101a   (pair with #8cc6ff backgrounds, NEVER white text)
Success text/bg:    #9de0c1 / rgba(157, 224, 193, 0.16)
Warning text/bg:    #ffd58f (or #e6c889) / rgba(230, 200, 137, 0.1)
Error text/bg:      #ffaaaa / rgba(255, 170, 170, 0.1)
```

Radius: 12–24px for cards, pill (999px) for primary actions/badges.

### Light theme (store / product / checkout)

```
Background:         #ffffff
Text — primary:     #0d3369 (navy)
Text — muted:       #64748b / #94a3b8
Border:             #e2e8f0 / #f1f5f9
Discount badge:     bg #dc2626, text #ffffff
Savings badge:      bg light-green tint, text #166534 (dark, readable green — not pale mint on near-white)
Primary button:     bg #0d3369, text #ffffff
```

---

## 3. Postmortem: the missing `.page` prefix bug (admin dashboard)

**What happened:** `admin.module.css` has a blanket rule near the bottom of the file:

```css
.page :where(div, section, article, ..., button, ...):not([contenteditable='true']) {
  color: #ffffff !important;
}
```

`:where()` always contributes zero specificity, so this rule's real specificity is just
`.page` + the `:not([contenteditable])` attribute selector = **(0,2,0)**.

Many other color-override rules in the same file (`.analyticsRefreshBtn`,
`.linkTypeBadge`, `.typeBtnActive`, `.kpiUp`, status badges, etc.) were written as bare
class selectors — e.g. `.analyticsRefreshBtn { color: var(--admin-action-ink) !important }`
— specificity **(0,1,0)**. Lower specificity loses to the catch-all above regardless of
source order, so these elements silently fell back to plain white text no matter what
color was "supposed" to apply. On a light-blue button background, white text is
invisible. This affected **159 selectors** across the file before it was fixed.

**The fix:** every selector in the dark-theme block that sets `color` (or any property
contested by another rule) must be prefixed with `.page ` to match or exceed the
catch-all's specificity:

```css
/* Wrong — loses to the catch-all */
.analyticsRefreshBtn { color: var(--admin-action-ink) !important; }

/* Right */
.page .analyticsRefreshBtn { color: var(--admin-action-ink) !important; }
```

**Rule going forward:** any time you add a new `!important` color rule to
`admin.module.css`, grep the file for the exact class name first to make sure there
isn't a competing rule, and always prefix with `.page` unless you've verified the
specificity math yourself. After adding a rule, do a quick pass: does the selector you
just wrote start with `.page`? If not, why not?

---

## 4. Postmortem: raw SVG doesn't inherit theme colors

Several chart components (`VisitorLineChart`, `CashflowBarChart`, `CashflowPieChart`,
the finance donut in `HomeFinancePulse`) draw with raw `<svg>` and set `fill=`/`stroke=`
as literal attributes, e.g. `<path stroke="#071A2E" .../>`. These attributes are **not**
CSS, so:

- CSS Modules class rules never touch them.
- The admin dark-theme's inline-`style` attribute matchers (`[style*='background: #...']`)
  never touch them either — those only match the HTML `style=` attribute, not SVG
  presentation attributes.

Result: these charts were authored once for a light background and never updated when
the surrounding page went dark — a dark-navy line on a near-black background is
essentially invisible. Also watch for a donut/pie "center hole" drawn as
`<circle fill="#ffffff" />` — combined with theme-forced light text on top of it, that's
white-on-white.

**Rule:** any raw SVG fill/stroke/gradient stop color must be set explicitly for
whatever theme the page is actually in. Don't assume it "just works" because the rest
of the page is themed — check it separately, every time.

---

## 5. No double-nested rounded boxes

If a card-like container (border + border-radius + padding, its own background) sits
directly inside another card-like container, flatten it. Use a plain `border-top` or
`border-bottom` divider between sub-sections of one card instead of stacking a second
full card inside the first. This was a recurring pattern to fix across the admin
dashboard: category/author manager rows, About Page section items, e-course material
rows, and a Cashflow stat panel were all originally double-boxed and got flattened to
single cards with divider lines.

---

## 6. Custom dropdown pattern (replaces native `<select>`)

Native `<select>` elements render with the OS's own chrome and look inconsistent with
the rest of the design system. Every custom picklist (background, referral source,
category, add-on picker, etc.) should use the same pattern, not a native select.

Reference implementation: `CustomSelect` in
`app/product/[slug]/checkout/page.tsx`, styled by `.customSelect*` classes in
`checkout.module.css`. Key points:

- Trigger is a button showing the selected label (or placeholder) + a `ChevronDown`
  that rotates 180° when open.
- **The options panel is rendered through a React portal into `document.body` with
  `position: fixed`**, positioned by reading `triggerRef.current.getBoundingClientRect()`
  on open (and on scroll/resize while open). It also flips to open **upward** if there
  isn't enough room below.
- Why the portal is mandatory, not optional: if the panel is `position: absolute`
  inside a scrollable ancestor (e.g. a `.contentSide { overflow-y: auto }` wrapper), the
  ancestor's scrollable height doesn't reliably expand to include the panel's overflow.
  Near the bottom of the scroll area, the panel gets visually clipped with no way to
  scroll further to reach the cut-off options. This exact bug shipped once — don't
  reintroduce it by going back to `position: absolute` for convenience.
- Closes on outside click (`mousedown` listener checking both the trigger wrapper ref
  and the portaled panel ref, since the panel is no longer a DOM child of the wrapper).

```tsx
// Minimal shape — see checkout/page.tsx for the full version
function CustomSelect({ value, onChange, options, placeholder, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ left: 0, width: 0, top: undefined, bottom: undefined })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect()
      const estimatedHeight = Math.min(260, options.length * 45 + 8)
      const openUp = window.innerHeight - rect.bottom < estimatedHeight + 12
      setPos({
        left: rect.left, width: rect.width,
        top: openUp ? undefined : rect.bottom + 6,
        bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => { /* remove listeners */ }
  }, [open, options.length])

  // ...trigger button + createPortal(<panel style={{ position: 'fixed', ...pos }} />, document.body)
}
```

---

## 7. Badge/pill contrast checklist

Whenever you author or copy a colored badge (status pill, discount tag, KPI trend
indicator), verify background and text **together**, not by copying just one half from
somewhere else:

1. What is the actual rendered background color at this exact spot? (Not what a
   variable is *named* — what it *resolves to* in this theme.)
   2. Does the text color have enough contrast against that specific background?
3. If the badge uses a semantic color (green=success, red=error, amber=pending), is the
   background tint and the text color pulled from the *same* semantic pair — not a
   light-theme green paired with a dark-theme-forced text color, or vice versa?

Concrete bugs found from skipping this check: KPI trend badges with pale backgrounds
and text forced white by the catch-all (invisible), a checkout "Total Hemat" row with
near-white text on a nearly-transparent green background (invisible), and article
status badges with light backgrounds that escaped the dark-theme's inline-style color
converter entirely.
