# 11 — ChatGPT Production Optimization Rules

## Purpose

This document locks the ChatGPT-specific behavior so the carousel output stays minimal, dark, premium, readable, current, and consistent.

## Primary goal

The engine should produce:
- final image slides as separate image files
- one caption

It should avoid visible research or planning unless the user requests it.

## Main corrections from recent tests

This file prevents these failures:
- 4 slides merged into 1 sheet
- outdated year usage when newer data exists
- too much text on slide 1
- logo inconsistency
- too much color or glow
- inconsistent type scale across slides

## Hard rules

1. Dark theme by default.
2. No light theme unless explicitly requested.
3. Minimalist editorial style, not colorful SaaS dashboard style.
4. Maximum one accent color per slide.
5. Accent color must be restrained, usually muted Marcatching blue.
6. No neon glow, rainbow gradients, or excessive blue/purple lighting.
7. No overcrowded cards, charts, or icons.
8. Body copy must be readable and slightly larger than tiny default AI text.
9. Headline and body copy must feel proportional.
10. Typography must feel like a two-font Marcatching system: clean sans plus elegant serif emphasis.
11. Use company logos and app icons only when they clarify the idea.
12. No emoji.
13. Slide 1 should usually contain only one strong headline hook.
14. Always return separate slide images, never one grid, unless explicitly requested.
15. Use the latest available reporting period for financial and business facts.
16. The creator's own wordmark/brand name (from `brand-memory.md`) must be top-left and their own icon/monogram top-right on every slide — never hardcode "Marcatching" here.

## Minimal module rule

Per slide, use at most:
- 2 main visual modules
- 3 small icons
- 1 chart or data visual
- 1 highlight or stabilo effect

If the slide needs more, simplify the content.

## Color restraint rule

Default palette:
- black
- charcoal
- off-white
- gray
- muted blue accent

Do not use many colorful icon glows.
Do not make every card glow.
Do not make gradients the main style.

## Typography proportion rule

Target feel:
- headline strong but controlled
- body copy clearly readable on mobile
- labels readable but subtle
- serif used for emphasis only
- scale stays consistent across slides

Avoid:
- huge headline on one slide and small headline on another
- tiny body copy people will skip
- all-sans generic SaaS poster look

## Cover rule

Slide 1 should be the cleanest slide.

Use:
- one hook headline
- one hero image or hero object
- at most one supporting metric or tiny label only if truly necessary

Avoid:
- paragraph explanation
- multiple cards
- dense charts
- crowded breakdowns

## Failure signals

Regenerate if:
- the slide feels crowded
- the slide feels too colorful
- the slide uses light theme without being asked
- body copy is too small
- typography feels inconsistent with Marcatching
- hierarchy changes too much across slides
- output is stitched into one single sheet
- the financial year is stale despite newer data being available
