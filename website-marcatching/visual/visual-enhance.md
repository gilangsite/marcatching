# visual-enhance.md — Marcatching App Premium UI Enhancement

## Purpose

This document is a complete execution brief for upgrading the Marcatching mobile/admin app UI inside Google Antigravity or any AI coding agent.

The goal is to transform the current Marcatching app from a clean but generic dashboard into a premium, minimal, smooth, and editorial-style **Marketing Intelligence Command Center**.

Marcatching should not feel like a noisy super-app. It should feel like a refined intelligence platform where **marketing, AI, psychology, analytics, content, courses, orders, and revenue signals** meet in one elegant system.

---

## Product Context

Marcatching is an Indonesian marketing intelligence and education platform focused on:

- Marketing strategy
- AI adaptation
- Consumer psychology
- Brand systems
- Digital marketing education
- Premium learning experience
- Content and course ecosystem

The app currently includes dashboard-style modules such as:

- Analytics
- Finance
- Orders
- Products
- E-Course
- Store
- Visitor analytics
- Page views
- Daily visitors trend
- Full analytics CTA

The new UI should make this feel less like a static admin page and more like a living, premium command center.

---

## Current Tech Stack

Use the existing project structure and dependencies.

Known stack:

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "framer-motion": "^12.38.0",
  "lucide-react": "^1.7.0",
  "@supabase/supabase-js": "^2.100.1",
  "typescript": "^5"
}
```

Important:

- Do not break existing Supabase logic.
- Do not remove analytics tracking.
- Do not change database schema unless absolutely necessary.
- Do not rewrite the entire app from scratch.
- Improve visual structure, CSS, components, motion, and UX.
- Prefer CSS Modules or existing CSS approach unless Tailwind is already present.
- The current app already has Framer Motion and Lucide React. Use them.
- If chart library is not available, either improve the existing chart implementation or install `recharts` only if needed.

---

## Brand Direction

Marcatching should feel:

- Classy
- Elegant
- Premium
- Intelligent
- Minimal
- Editorial
- Calm
- Sharp
- Slightly mysterious
- Quietly confident

Avoid:

- Noisy startup UI
- Too many colors
- Generic dashboard template feeling
- Overly playful icons
- Loud gradients
- Excessive animation
- Gojek-style promo heaviness
- Random neon effects
- Basic blue SaaS dashboard look

Inspired by:

- Apple News
- Linear
- Stripe Dashboard
- Arc browser
- The Economist editorial layout
- Premium learning apps
- Modern analytics command centers

Use Gojek only as a UX reference for fast access, shortcut clarity, and simple action grouping. Do not copy its visual style.

---

## Visual System

### Color Palette

Use a premium white/navy editorial palette.

```css
:root {
  --mc-navy: #071A2E;
  --mc-blue: #0C3552;
  --mc-blue-soft: #123C5C;
  --mc-offwhite: #F5F3EE;
  --mc-paper: #FFFFFF;
  --mc-ink: #101827;
  --mc-muted: #65758A;
  --mc-silver: #C8D2DD;
  --mc-border: rgba(7, 26, 46, 0.10);
  --mc-border-strong: rgba(7, 26, 46, 0.16);
  --mc-accent: #5FB7B0;
  --mc-gold: #B9A57A;
  --mc-shadow-soft: 0 18px 50px rgba(7, 26, 46, 0.08);
  --mc-shadow-card: 0 10px 32px rgba(7, 26, 46, 0.10);
  --mc-shadow-hover: 0 20px 60px rgba(7, 26, 46, 0.14);
}
```

### Usage Ratio

- 80% off-white / paper
- 15% navy / blue tones
- 5% accent color

Do not overuse accent colors.

### Typography

Use current available fonts first. The current project uses DM Sans. Keep DM Sans for interface clarity.

Recommended direction:

- Logo or hero moment can stay serif/editorial through existing logo asset.
- UI text: DM Sans.
- Headline weight: 600 to 700.
- Labels: uppercase, small, letter-spaced.
- Body: calm, readable, not too dense.

### Radius

Use bigger, softer radius:

```css
--radius-sm: 10px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-pill: 999px;
```

### Shadows

Avoid heavy black shadows. Use navy-tinted soft shadows.

Bad:

```css
box-shadow: 0 4px 12px rgba(0,0,0,0.4);
```

Good:

```css
box-shadow: 0 18px 50px rgba(7, 26, 46, 0.08);
```

---

## UX Direction

The app should feel alive through subtle interaction.

Use:

- Smooth page transitions
- Card entrance animation
- Tap scale interaction
- Chart line reveal
- Number counter animation
- Bottom nav active indicator
- Skeleton loading
- Subtle microcopy
- Soft empty states

Avoid:

- Bouncy animation
- Overly slow animation
- Large dramatic transitions
- Confetti or flashy effects

Recommended Framer Motion timing:

```ts
const ease = [0.22, 1, 0.36, 1]

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease }
}

const cardTransition = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, ease }
}

const tapInteraction = {
  whileTap: { scale: 0.98 }
}
```

---

## Target Home Dashboard Structure

The new home dashboard should be structured like this:

### 1. App Shell

- Mobile-first layout
- Max width for desktop preview
- Safe area support for iOS PWA
- Off-white background
- Smooth scroll
- No horizontal overflow

### 2. Top Header

Content:

- Small Marcatching wordmark
- Greeting or context label:
  - "Marketing Intelligence"
  - "Today’s System Pulse"
  - "Good afternoon, Gilang"
- Right side:
  - profile/avatar
  - search or notification icon

Style:

- Transparent/off-white glass
- Not too tall
- Sticky only if needed
- Premium spacing

### 3. Hero Intelligence Card

Replace plain stat cards with a more premium hero panel.

Suggested title:

> Today’s Growth Signal

Inside:

- Unique Visitors
- Page Views
- Orders
- Revenue or Conversion Rate
- Small sparkline chart
- Micro insight:
  - "Traffic peaked around May 14."
  - "Audience activity is stabilizing."
  - "Course discovery is increasing."

Style:

- Navy gradient or deep navy card
- White text
- Soft glass overlays
- Rounded 28px
- Small labels
- Premium chart line

### 4. Metric Cards

Instead of large separated boxes, use compact metric cards:

- Unique Visitors
- Page Views
- Total Orders
- Revenue
- Conversion Rate

Each card:

- Small icon
- Big number
- Short label
- Optional trend pill

Example:

```txt
330
Unique Visitors
+12.4% this week
```

### 5. Daily Visitors Trend

Upgrade the chart card:

- Clean white/paper card
- Label: "Daily Visitors Trend"
- Subcopy: "Last 30 days"
- Add small insight chip:
  - "Peak: 108 visitors"
- Use soft grid lines
- Navy line
- No overly bright blue
- Round line caps

### 6. Quick Actions

Do not show generic grid only. Make it feel like modules.

Primary actions:

- Analytics
- Orders
- E-Course
- Store

Secondary actions:

- Finance
- Products
- Content
- Settings

Each module should have:

- Icon
- Label
- Tiny description
- Soft accent background
- Tap animation

Example:

```txt
Analytics
Audience movement

Orders
Revenue activity

E-Course
Learning system

Store
Product catalog
```

### 7. Intelligence Feed

Add a new premium section:

> Signals to Watch

Cards:

- "Traffic spike detected"
- "Most viewed article"
- "Top course activity"
- "Revenue pulse"
- "Product demand movement"

This makes the app feel smarter and aligned with Marcatching’s positioning.

### 8. Bottom Navigation

Create elegant bottom nav if not already present.

Items:

- Home
- Analytics
- Course
- Store
- Profile

Style:

- Floating pill or soft glass dock
- Active item navy
- Subtle active indicator
- Avoid noisy labels if icons are enough
- iOS safe area padding

---

## Component Enhancement Rules

### ButtonCard

Current ButtonCard already uses Framer Motion. Improve visual style.

Tasks:

- Replace heavy black shadow with navy-tinted soft shadow.
- Replace bright blue hover with deep navy border.
- Improve icon background.
- Add optional subtitle if data exists.
- Add `whileTap={{ scale: 0.985 }}`.
- Add accessible focus style.
- Keep click tracking logic.

Suggested CSS:

```css
.card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(7, 26, 46, 0.08);
  border-radius: 24px;
  box-shadow: 0 16px 44px rgba(7, 26, 46, 0.08);
  backdrop-filter: blur(18px);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 220ms ease,
              box-shadow 220ms ease,
              background 220ms ease;
}

.wrapper:not([aria-disabled='true']):hover .card {
  transform: translateY(-2px);
  border-color: rgba(7, 26, 46, 0.18);
  box-shadow: 0 22px 60px rgba(7, 26, 46, 0.12);
}

.iconWrap {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 16px;
  background: rgba(7, 26, 46, 0.06);
  color: var(--mc-navy);
}

.title {
  color: var(--mc-ink);
  font-size: 0.96rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.arrow {
  color: rgba(7, 26, 46, 0.45);
}
```

### Navbar

Current Navbar is better for public website. If dashboard app uses Navbar, create an AppTopBar variant.

Tasks:

- Do not rely on hamburger for main mobile app navigation.
- Keep hamburger only for secondary settings if needed.
- Use small wordmark and profile/search action.
- Use off-white glass background instead of black glass.
- Make it feel like app header, not landing page navbar.

### Footer

For dashboard, footer may not be needed. If visible, make it subtle.

### ImageCarousel

Tasks:

- Hide scrollbar.
- Increase radius.
- Add subtle border.
- Use edge gradient overlay if multiple slides.
- Keep Google Drive image handling.
- Avoid visible big nav buttons on mobile.

### VideoEmbed

Tasks:

- Use same premium card radius and border.
- Add loading style if possible.
- Keep platform parsing logic.

### RichTextEditor

Do not prioritize unless editor is used in dashboard. If touched:

- Move inline styles to CSS module later.
- Use navy toolbar.
- Use brand color presets.

---

## Accessibility Rules

- Keep contrast readable.
- Buttons need visible focus state.
- Icon-only buttons need `aria-label`.
- Avoid text below 11px except metadata.
- Use semantic HTML.
- Do not disable pinch zoom unless strictly needed. Current layout sets `userScalable: false`; consider changing to `true` for accessibility unless app-specific requirement says otherwise.

---

## Performance Rules

- Avoid large animation on every scroll.
- Use transform and opacity for animations.
- Do not animate layout-heavy properties.
- Keep images optimized.
- Preserve Next Image usage where possible.
- Avoid importing huge UI libraries only for small components.

---

## Implementation Plan

### Phase 1 — Audit and Locate Dashboard

Search the codebase for:

```txt
Daily Visitors Trend
Full Analytics
Unique Visitors
Page Views
Analytics
Finance
Orders
Products
E-Course
Store
```

Find the actual dashboard page and its components.

Likely files may include:

```txt
app/admin/page.tsx
app/dashboard/page.tsx
app/app/page.tsx
app/(dashboard)/**
components/*Dashboard*
components/*Analytics*
components/*Metric*
components/*Chart*
components/*BottomNav*
components/*Menu*
```

Do not proceed blindly. First locate the exact dashboard implementation.

### Phase 2 — Create Design Tokens

Update global CSS tokens.

Important:

- Do not break public website dark styling if it depends on current tokens.
- If current dark public site uses `--white` as black, do not simply change it globally without checking usage.
- Prefer adding new `--mc-*` variables first.
- Then update dashboard components to use `--mc-*`.

### Phase 3 — Upgrade Dashboard Shell

Create or refine:

```txt
DashboardShell
AppTopBar
MetricCard
InsightHeroCard
TrendChartCard
QuickActionGrid
SignalFeed
BottomNav
```

If components already exist, refactor them instead of duplicating too much.

### Phase 4 — Add Motion

Use Framer Motion:

- Page wrapper fade/slide
- Stagger metric cards
- Tap scale on cards
- Active nav indicator animation
- Chart reveal if easy

### Phase 5 — Polish Mobile PWA

- Add safe area padding
- Make bottom nav not overlap content
- Ensure iPhone viewport looks premium
- Test 390px width
- Test 430px width
- Test desktop preview

### Phase 6 — QA

Run:

```bash
npm run lint
npm run build
```

Fix all TypeScript and lint errors.

---

## Master Prompt for Google Antigravity

Use this prompt first.

```text
You are working inside an existing Next.js 16 + React 19 + TypeScript project called Marcatching.

Your task is to visually enhance the mobile/admin dashboard UI into a premium marketing intelligence app.

Marcatching is an Indonesian marketing intelligence platform combining AI, consumer psychology, branding, digital marketing education, courses, store, analytics, orders, and revenue tracking.

The desired style is:
premium, minimal, editorial, intelligent, calm, classy, sharp, white/off-white + deep navy, subtle motion, soft cards, refined typography, elegant mobile-first app experience.

Important:
- Do not rewrite the whole project.
- Do not break Supabase logic.
- Do not remove analytics tracking.
- Do not change database schema.
- Use the existing stack: Next.js, React, TypeScript, Framer Motion, Lucide React.
- Prefer existing CSS Modules/global CSS approach.
- Only install extra libraries if necessary.
- Keep code clean and production-ready.

First, inspect the project and locate the actual dashboard page/components by searching for:
"Daily Visitors Trend", "Full Analytics", "Unique Visitors", "Page Views", "Analytics", "Finance", "Orders", "Products", "E-Course", "Store".

Then create an implementation plan before editing.

After locating the dashboard, upgrade it into a "Premium Marketing Intelligence Command Center" with:
1. Premium app shell with off-white background and safe-area spacing.
2. Elegant top header with Marcatching wordmark, context label, and profile/search/notification action.
3. Hero card titled "Today’s Growth Signal" containing key metrics and a compact chart/sparkline.
4. Refined metric cards for Unique Visitors, Page Views, Orders, Revenue/Conversion.
5. Improved "Daily Visitors Trend" chart card with clean navy line, soft grid, peak insight chip, and premium spacing.
6. Quick Action modules for Analytics, Orders, E-Course, Store, Finance, Products, Content, Settings.
7. New "Signals to Watch" intelligence section with cards like Traffic Spike, Most Viewed Article, Top Course Activity, Revenue Pulse.
8. Elegant floating bottom navigation with Home, Analytics, Course, Store, Profile.
9. Smooth Framer Motion transitions: fade + slide page transition, staggered cards, tap scale, active nav indicator.
10. Refined design tokens using deep navy, off-white, paper white, muted gray, sea-glass accent, and soft navy-tinted shadows.

Use this design token direction:
--mc-navy: #071A2E;
--mc-blue: #0C3552;
--mc-offwhite: #F5F3EE;
--mc-paper: #FFFFFF;
--mc-ink: #101827;
--mc-muted: #65758A;
--mc-silver: #C8D2DD;
--mc-border: rgba(7, 26, 46, 0.10);
--mc-accent: #5FB7B0;
--mc-gold: #B9A57A;
--mc-shadow-soft: 0 18px 50px rgba(7, 26, 46, 0.08);
--mc-shadow-card: 0 10px 32px rgba(7, 26, 46, 0.10);

Avoid:
- noisy colors
- heavy black shadows
- generic SaaS dashboard look
- overly playful icons
- loud gradients
- excessive animation
- Gojek-like promo-heavy visual style

After edits, run npm run lint and npm run build. Fix all errors. Summarize changed files and the UI improvements.
```

---

## Prompt 2 — Design Token and Global CSS Cleanup

Use this after the dashboard is located.

```text
Inspect globals.css and the components that rely on global CSS variables.

The current variable naming may be confusing because variables like --white or --off-white may be used for dark colors. Do not break existing public pages.

Add a new Marcatching-specific design token layer using --mc-* variables for the premium dashboard UI.

Add:
--mc-navy, --mc-blue, --mc-offwhite, --mc-paper, --mc-ink, --mc-muted, --mc-silver, --mc-border, --mc-accent, --mc-gold, --mc-shadow-soft, --mc-shadow-card, --mc-shadow-hover, --mc-radius-lg, --mc-radius-xl.

Use these new variables only in the upgraded dashboard/app components.

Also add reusable utility classes if helpful:
.mc-app-bg
.mc-card
.mc-card-dark
.mc-label
.mc-subtle-text
.mc-safe-bottom

Do not rename old variables unless you verify all usage.
Do not cause public pages to change unexpectedly.
```

---

## Prompt 3 — Dashboard Home Redesign

```text
Redesign the dashboard home page UI.

Keep the existing data and business logic, but improve structure, layout, styling, and animation.

Create or refactor these components:
- DashboardShell
- AppTopBar
- GrowthSignalHero
- MetricCard
- DailyTrendCard
- QuickActionGrid
- SignalFeed
- AppBottomNav

Design requirements:
- Mobile-first.
- Max width around 430px for app preview, centered on desktop.
- Background: off-white / premium paper.
- Cards: white with subtle navy-tinted shadows.
- Primary hero: deep navy card.
- Icons: Lucide React, thin stroke, refined.
- Typography: DM Sans, tight hierarchy.
- Microcopy should feel intelligent and concise.

Home screen order:
1. AppTopBar
2. GrowthSignalHero
3. Metric cards
4. Daily Visitors Trend card
5. Quick Actions
6. Signals to Watch
7. Bottom navigation

Use Framer Motion for:
- page fade/slide
- staggered card entrance
- tap scale on cards
- bottom nav active indicator

Do not over-animate.
Do not add fake complex logic. Static fallback content is allowed only if existing data is unavailable.
```

---

## Prompt 4 — Bottom Navigation

```text
Create a premium mobile bottom navigation for the dashboard.

Items:
- Home
- Analytics
- Course
- Store
- Profile

Style:
- Floating pill dock
- White or translucent paper background
- Thin navy border
- Soft shadow
- Active item uses deep navy
- Inactive items use muted gray
- Active indicator should slide smoothly using Framer Motion layoutId
- Add safe-area bottom padding for iPhone
- Do not cover content; add bottom padding to page container.

Use lucide-react icons.
Use Next Link for internal navigation if routes exist. If routes do not exist, use href placeholders but do not break build.
```

---

## Prompt 5 — Chart Card Upgrade

```text
Upgrade the Daily Visitors Trend chart card.

Requirements:
- Preserve existing visitor data source.
- Use clean white card.
- Add title "Daily Visitors Trend".
- Add subtitle "Last 30 days".
- Add small insight pill showing peak visitor value if data exists.
- Use deep navy line color.
- Use very soft grid lines.
- Remove visual clutter.
- Add chart reveal animation if using SVG/path or Recharts animation if using Recharts.
- Ensure it looks good on 390px mobile width.
- Do not add inaccurate analytics claims. Only show insight labels if data exists.
```

---

## Prompt 6 — Quick Action Modules

```text
Redesign the dashboard shortcut grid.

Current actions include:
Analytics, Finance, Orders, Products, E-Course, Store.

Make them feel like premium modules, not generic icon boxes.

Each module should include:
- Icon
- Label
- Short description
- Optional tiny status text

Suggested descriptions:
Analytics: Audience movement
Finance: Revenue pulse
Orders: Purchase activity
Products: Catalog system
E-Course: Learning engine
Store: Market interface
Content: Editorial hub
Settings: System control

Style:
- 2-column grid on small mobile or 3-column if enough width.
- White paper cards.
- Soft icon tile.
- Navy and muted gray typography.
- Tap scale interaction.
- Subtle hover for desktop.
```

---

## Prompt 7 — AppTopBar

```text
Create or upgrade the app top bar.

Requirements:
- Use Marcatching wordmark or text if image is unavailable.
- Add small context label: "Marketing Intelligence".
- Add right-side icon button for search or notifications.
- Optional profile/avatar circle.
- Use safe-area top padding.
- Background should be transparent/off-white glass, not black.
- Keep it minimal and premium.
- Do not use hamburger as primary navigation for dashboard.
```

---

## Prompt 8 — ButtonCard Refinement

```text
Refine ButtonCard.tsx and ButtonCard.module.css.

Keep:
- Existing props
- Link behavior
- Coming soon state
- Global click tracking with window.__trackClick
- Framer Motion entrance animation

Improve:
- Premium card styling
- Softer shadow
- Navy-based hover
- Accessible focus state
- Tap scale
- Icon tile design
- Better disabled state

Do not break any existing link data from Supabase.
```

---

## Prompt 9 — Page Transition Wrapper

```text
Create a reusable PageTransition component using Framer Motion.

Requirements:
- Accept children.
- Apply fade + slight slide transition.
- Use duration around 0.35s to 0.45s.
- Use ease [0.22, 1, 0.36, 1].
- Export it from components/PageTransition.tsx.
- Use it on dashboard pages.
- Do not wrap server components incorrectly. If the page is a server component, create a small client component wrapper.
```

---

## Prompt 10 — Final QA and Build

```text
Run final quality checks.

1. npm run lint
2. npm run build

Fix all errors.

Then provide a summary:
- Changed files
- New components
- Design improvements
- Animation improvements
- Any dependencies installed
- Any routes that are placeholders
- Any remaining recommended next steps
```

---

## Acceptance Criteria

The enhancement is successful if:

- The mobile dashboard looks premium and aligned with Marcatching.
- It no longer feels like a generic admin template.
- Navigation feels smooth and intentional.
- Cards have consistent styling.
- Icons feel refined.
- Animation is subtle and smooth.
- Dashboard communicates intelligence, not just data.
- iPhone PWA view looks polished.
- Desktop preview is centered and clean.
- Existing Supabase data still works.
- Existing analytics tracking still works.
- `npm run lint` passes.
- `npm run build` passes.

---

## Do Not Do

Do not:

- Replace the whole app with a new template.
- Delete working Supabase queries.
- Remove tracking.
- Use too many dependencies.
- Use neon colors.
- Overuse gradients.
- Copy Gojek visual style.
- Create fake business metrics without fallback label.
- Break public website pages.
- Rename old global CSS variables without checking usage.
- Leave TypeScript errors.
- Leave unused imports.
- Leave broken routes.

---

## Suggested Microcopy

Use these phrases inside the UI where helpful:

```txt
Today’s Growth Signal
Marketing Intelligence
System Pulse
Revenue Pulse
Audience Movement
Learning Engine
Editorial Hub
Market Interface
Signals to Watch
Traffic spike detected
Audience activity is stabilizing
Course discovery is increasing
Most viewed article
Top course activity
```

Keep copy short, elegant, and meaningful.

---

## Suggested UI Labels

```txt
Unique Visitors
Page Views
Total Orders
Revenue
Conversion
Daily Visitors Trend
Last 30 days
Full Analytics
Quick Actions
Signals to Watch
View Details
```

---

## Suggested Component Names

```txt
DashboardShell.tsx
AppTopBar.tsx
GrowthSignalHero.tsx
MetricCard.tsx
DailyTrendCard.tsx
QuickActionGrid.tsx
SignalFeed.tsx
AppBottomNav.tsx
PageTransition.tsx
```

---

## Final Note for AI Coding Agent

The most important thing is not to make the UI "more decorated".

The goal is to make it feel more intelligent.

Every visual decision should support this feeling:

> Marcatching is where marketing meets intelligence.

Design with restraint. Use whitespace. Use calm hierarchy. Make the data feel curated. Make navigation feel smooth. Make the app feel expensive without making it loud.
