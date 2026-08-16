# Marcatching Content Engine — Final Minimal Dark v5

This is the refined version focused on ChatGPT-first carousel generation with better production locking.

## Default Output

- final image slides
- each slide as a separate image file
- one on-brand caption (creator's own brand, from `brand-memory.md`)

No visible research, hooks, scoring, or design brief unless requested.

## What was fixed in this version

- prevents 4 slides from being merged into 1 image sheet
- locks slide 1 to a cleaner headline-only hook style
- forces latest available research instead of stale years
- reinforces wordmark/icon placement left and right (creator's own brand, see SKILL.md → Mandatory Brand Memory Gate)
- keeps dark minimal editorial direction

## Final Visual Direction

- dark theme by default
- minimalist editorial style
- restrained color
- no neon glow
- no excessive gradients
- no cluttered dashboard look
- body copy readable and slightly larger
- headline and body copy proportional
- two-font Marcatching feel: clean sans plus elegant serif
- creator's own wordmark/brand name top-left (from `brand-memory.md`, never hardcode "Marcatching")
- creator's own icon/monogram top-right

## Best Test Prompt

Assumes `brand-memory.md` is already present at the skill root (personalized download) — replace `[Brand]` mentally with whatever `Brand/Creator:` it contains.

```text
/marcatching-content-engine
Bikin carousel 4 slide 4:5 tentang darimana Apple dapat uang, pakai brand-memory.md yang tersedia. Output final image slides only dan 1 caption atas nama [Brand]. Wajib kirim 4 image terpisah, bukan digabung dalam 1 grid. Gunakan data paling terbaru yang tersedia saat ini. Gunakan style benchmark Marcatching: dark theme, minimalis, premium editorial, dua font ala DM Sans dan Palatino, wordmark [Brand] kiri atas, icon kanan atas, body copy readable, tidak terlalu banyak text, visual realistis dan supporting UI elements seperlunya. Slide 1 cukup 1 headline hook saja tanpa body copy kecil. Jangan tampilkan research, hook options, score, atau design brief.
```
