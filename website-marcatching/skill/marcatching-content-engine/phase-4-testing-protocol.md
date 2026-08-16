# Phase 4 Testing Protocol

## Purpose

This testing protocol checks whether Phase 4 of the Marcatching Content Engine works correctly.

Phase 4 includes:
- 05 — Graphic Designer
- 06 — Design Quality Control
- SKILL.md integration for the design stage

The goal is to verify that the engine:
- converts strong content into a design-ready brief
- preserves Marcatching visual identity
- chooses correct slide roles and layout families
- creates useful image generation prompts
- evaluates visual outputs with a strict quality gate
- forces revision when design quality is below 80%

---

## What to Test

A good Phase 4 test should validate five things.

### 1. Design Brief Quality
Check whether the engine produces:
- slide roles
- slide objectives
- layout family decisions
- clear visual direction
- typography emphasis notes
- image prompt drafts

### 2. Brand Consistency
Check whether the output consistently reflects:
- black background
- DM Sans + Palatino logic
- premium editorial minimalism
- ultra-realistic imagery
- Marcatching strategic tone

### 3. Prompt Quality
Check whether the image prompts are:
- specific
- not generic
- visually grounded
- aligned with the content objective
- safe to use for 1–2 slide generation batches

### 4. Design QC Rigor
Check whether the Design Quality Controller:
- gives a structured score
- identifies real weaknesses
- classifies failure type correctly
- provides usable fix instructions
- blocks weak outputs below 80%

### 5. Regeneration Logic
Check whether the engine knows:
- when to revise only one slide
- when to regenerate multiple slides
- when to preserve useful parts of the visual system
- when the whole set is too wrong to use

---

## Recommended Testing Sequence

### Test A — Design Brief Only
Use when you want to verify the Graphic Designer role without generating final images yet.

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 4 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: viral research + 9-slide copy + content doctor score + design brief only
```

Pass criteria:
- every slide has a clear role
- layout decisions make sense
- visual directions are not repetitive
- image prompts are specific and premium

---

### Test B — Design Brief + QC on Simulated Output
Use when you want to check whether the Design Quality Controller can evaluate a proposed visual direction before full production.

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 4 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: viral research + 9-slide copy + content doctor score + design brief + design QC checklist
```

Pass criteria:
- design QC categories are present
- the review logic is not too lenient
- fix instructions are specific

---

### Test C — Full Production Test
Use when you want to test the full engine from research to generated visuals.

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 4 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: viral research + 9-slide copy + content doctor score + rewrite if needed + design brief + generate 2 sample slides + design QC review
```

Pass criteria:
- sample slides feel Marcatching
- design QC can detect strengths and weaknesses clearly
- if a slide is weak, the engine proposes a sensible regeneration plan

---

## Stress Tests

### Stress Test 1 — Weak Visual Potential
Give a topic that is strategically interesting but visually abstract.

Example:
- Kenapa brand premium jarang diskon?

Expected behavior:
- the Graphic Designer uses more typographic and conceptual layouts
- the output does not force random decorative visuals

### Stress Test 2 — Dense Business Explanation
Give a topic that can easily become too text-heavy.

Example:
- Apa bedanya revenue, gross margin, dan net profit?

Expected behavior:
- the Graphic Designer reduces density
- the output spreads complexity across slides
- Design QC flags overcrowding if it happens

### Stress Test 3 — Founder / Human Realism
Give a topic involving a known founder.

Example:
- Kenapa Jeff Bezos membangun Amazon seperti itu?

Expected behavior:
- the Graphic Designer requests realistic editorial founder imagery
- Design QC checks face realism carefully

### Stress Test 4 — CTA Weakness
Manually give a weak CTA direction.

Expected behavior:
- Design QC should score CTA low
- the engine should suggest a stronger close

---

## Failure Signals

Phase 4 is not working correctly if:
- the design brief is generic
- the visual directions could fit any brand, not Marcatching
- the image prompts are vague
- the layouts feel repetitive on all slides
- Design QC is too forgiving
- the engine approves visually weak slides below 80%
- the regeneration instructions are unclear

---

## Success Criteria

Phase 4 is successful if:
- the engine creates a design system, not just random slide ideas
- the black editorial Marcatching identity is clear
- the image prompts are practical for generation
- the QC process is strict and useful
- the engine can move into production with confidence

---

## Recommended Next Step After Passing Phase 4

Once Phase 4 feels stable, proceed to:
- output formatting rules
- final delivery templates
- optional automation layer
- repeated tests across multiple Marcatching segments
