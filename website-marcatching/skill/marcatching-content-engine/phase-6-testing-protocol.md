# Phase 6 Testing Protocol

## Purpose

Phase 6 finalizes the Marcatching brand guideline and reusable prompt templates.

This testing protocol verifies whether the engine can consistently apply the brand system and respond correctly to reusable commands.

Phase 6 includes:
- 08 — Marcatching Brand Guidelines
- 09 — Prompt Templates
- Manual Assets Checklist
- SKILL.md integration for brand and prompt rules

---

## What to Test

A good Phase 6 test should verify:

1. brand consistency
2. tone consistency
3. visual DNA consistency
4. prompt template usability
5. manual asset awareness
6. correct behavior across segments

---

## Test A — Brand Fit Test

Prompt:

```text
/marcatching-content-engine
Segment: Brand Strategy Breakdown
Topic: Kenapa Apple terasa premium?
Output: full production package
Slide Count: 9
Need Web Research: Auto
Generate Images: No
Caption: Yes
```

Pass criteria:
- copy feels premium, simple, and strategic
- hook does not feel cheap
- design brief uses black editorial Marcatching identity
- caption follows Marcatching format

---

## Test B — Prompt Template Test

Use one template from `09-prompt-templates.md` exactly as written.

Recommended:

```text
/marcatching-content-engine
Segment: Business Model Breakdown
Topic: Darimana Amazon dapat uang?
Output: full production package
Slide Count: 9
Need Web Research: Auto
Generate Images: No
Caption: Yes
```

Pass criteria:
- engine understands the short command
- output structure is clean
- no workflow step is skipped

---

## Test C — Visual DNA Test

Prompt:

```text
/marcatching-content-engine
Segment: AI Business & Technology
Topic: Kenapa AI company butuh banyak uang?
Output: design brief only
```

Pass criteria:
- visual direction uses black background
- typography behavior follows DM Sans + Palatino logic
- imagery is ultra-realistic and business/editorial
- layouts are not generic or overcrowded

---

## Test D — Caption Style Test

Prompt:

```text
/marcatching-content-engine
Segment: Marketing Psychology
Topic: Kenapa orang beli produk mahal?
Output: caption only
Carousel Summary: carousel ini menjelaskan bahwa orang membeli produk mahal bukan hanya karena fungsi, tetapi karena rasa aman, status, identity, dan perception of quality.
```

Pass criteria:
- caption has hook line, short paragraph, CTA, hashtags
- tone feels Marcatching
- no overhype

---

## Test E — Manual Asset Awareness Test

Prompt:

```text
/marcatching-content-engine
Mode: Setup Check
Output: tell me what manual assets I should add to improve Marcatching consistency
```

Pass criteria:
- engine recommends benchmark examples, logo, colors, fonts, CTA, caption examples
- engine does not block usage if assets are missing

---

## Failure Signals

Phase 6 is not working correctly if:
- outputs feel like generic business content
- captions lose Marcatching tone
- design prompts ignore black editorial style
- prompt templates produce inconsistent formats
- the engine forgets the 80% scoring threshold
- the engine forces user to provide assets before it can work

---

## Success Criteria

Phase 6 is successful if:
- the brand guideline is clear enough to guide future outputs
- reusable prompt templates work without long instructions
- design and copy stay consistent with Marcatching
- missing manual assets are handled as improvement opportunities, not blockers

---

## Recommended Next Step After Passing Phase 6

Proceed to Phase 7:
- Full Testing & Refinement
- multi-segment stress testing
- real Marcatching content production tests
- revise weak engine files if problems appear
