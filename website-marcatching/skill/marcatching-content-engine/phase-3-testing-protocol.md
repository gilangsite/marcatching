# Phase 3 Testing Protocol — Content Doctor

## 0. Purpose

This protocol tests whether the Marcatching Content Doctor can evaluate carousel briefs strictly and correctly before the engine proceeds to design.

The goal of Phase 3 testing is to verify that the engine:

1. Scores content using the full 100-point rubric.
2. Does not inflate weak drafts.
3. Blocks content below 80.
4. Gives specific revision instructions.
5. Rewrites and scores again when needed.
6. Produces a clean design handoff only after the score passes.

---

## 1. Test Command

Use this command to test Phase 3:

```text
/marcatching-content-engine
Mode: Phase 3 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: viral research + 9-slide copy + Content Doctor score + rewrite if below 80 + design handoff if passed
```

Expected behavior:

```text
Viral Researcher → Strategic Copywriter → Content Doctor → Rewrite Loop if needed → Design Handoff
```

The engine must not generate final images during Phase 3 testing.

---

## 2. Required Output Sections

The Phase 3 test output must include:

```text
1. Segment & Topic
2. Viral Research Summary
3. Selected Core Angle
4. Selected Hook
5. 9-Slide Carousel Copy
6. Content Doctor Score
7. Diagnosis
8. Rewrite Decision
9. Revised Version if Score < 80
10. Re-score after Revision
11. Design Handoff if Score >= 80
```

---

## 3. Pass Criteria

A Phase 3 test passes if:

```text
Total score is clearly calculated out of 100.
Every scoring parameter is shown.
Diagnosis explains why the score was given.
Weak areas receive specific revision instructions.
Content below 80 does not proceed to design.
Content above 80 receives a Design Handoff.
The score feels strict and believable.
```

---

## 4. Fail Criteria

A Phase 3 test fails if:

```text
The engine gives only a vague score.
The score is inflated without evidence.
The engine proceeds to design with a score below 80.
The rewrite instruction is generic.
The diagnosis does not mention hook, emotional pull, strategic insight, shareability, clarity, visual potential, brand fit, and CTA.
The final handoff is missing or unclear.
```

---

## 5. Stress Test A — Weak Hook

Input:

```text
/marcatching-content-engine
Mode: Phase 3 Stress Test
Segment: Business Model Breakdown
Topic: Darimana Apple dapat uang?
Forced Hook: Apple menghasilkan uang dari iPhone, Mac, iPad, dan Services.
Output: score only + diagnosis + rewrite instruction
```

Expected Content Doctor behavior:

- Score should likely be below 80.
- Diagnosis should mention that the hook is clear but too obvious.
- Rewrite should create a stronger strategic reframe.

Example improved hook direction:

```text
Apple tidak hanya menjual device.
Mereka menjual ecosystem yang membuat keluar terasa mahal.
```

---

## 6. Stress Test B — Generic Insight

Input:

```text
/marcatching-content-engine
Mode: Phase 3 Stress Test
Segment: Brand Strategy Breakdown
Topic: Kenapa Nike kuat secara branding?
Forced Insight: Nike kuat karena punya iklan yang bagus dan brand yang terkenal.
Output: score only + diagnosis + rewrite instruction
```

Expected Content Doctor behavior:

- Score should likely be below 80.
- Diagnosis should mention generic insight.
- Rewrite should shift into identity, aspiration, and performance culture.

Example improved insight direction:

```text
Nike tidak menjual sepatu sebagai benda.
Nike menjual identitas orang yang ingin merasa sedang bergerak menuju versi terbaik dirinya.
```

---

## 7. Stress Test C — Low Visual Potential

Input:

```text
/marcatching-content-engine
Mode: Phase 3 Stress Test
Segment: Marketing Psychology
Topic: Kenapa orang suka diskon?
Forced Visual Direction: pakai icon diskon dan background abstrak
Output: score only + diagnosis + rewrite instruction
```

Expected Content Doctor behavior:

- Visual Potential should be scored low.
- Diagnosis should reject generic icon-based design.
- Rewrite should recommend a more cinematic visual metaphor.

Example improved visual direction:

```text
A luxury product behind glass, with the price tag crossed out subtly. The visual shows that discount is not just lower price, but lowered risk.
```

---

## 8. Stress Test D — Off-Brand Tone

Input:

```text
/marcatching-content-engine
Mode: Phase 3 Stress Test
Segment: AI Business & Technology
Topic: Kenapa AI company butuh modal besar?
Forced Copy Tone: AI lagi gila-gilaan! Jangan sampai kamu ketinggalan kereta AI sekarang juga!
Output: score only + diagnosis + rewrite instruction
```

Expected Content Doctor behavior:

- Brand Fit should be scored low.
- Diagnosis should mention hype, urgency, and off-brand tone.
- Rewrite should make it calmer and more strategic.

Example improved tone:

```text
AI terlihat seperti software.
Tapi di belakangnya, ada bisnis infrastruktur yang sangat mahal untuk dijalankan.
```

---

## 9. Handoff Test

Input:

```text
/marcatching-content-engine
Mode: Phase 3 Handoff Test
Segment: AI Business & Technology
Topic: Kenapa OpenAI belum tentu untung walaupun produknya populer?
Output: 9-slide copy + score + design handoff only, no final design
```

Expected Design Handoff format:

```text
DESIGN HANDOFF

Approved Score:
Core Angle:
Hook:
Slide Count:
Visual Theme:
Key Visual Motifs:
Slides With Image Priority:
Slides With Text Priority:
Slides Needing UI/App/Icon/Character:
CTA Direction:
Risks for Designer to Avoid:
```

The handoff should be specific enough for Phase 4 Graphic Designer to start visual planning.

---

## 10. Recommended Testing Sequence

Run tests in this order:

```text
1. Normal Phase 3 Test
2. Stress Test A — Weak Hook
3. Stress Test B — Generic Insight
4. Stress Test C — Low Visual Potential
5. Stress Test D — Off-Brand Tone
6. Handoff Test
```

After testing, review whether the Content Doctor is too lenient or too harsh.

If scores feel inflated, reduce scores by 5–10 points and tighten diagnosis.

If scores feel too harsh, check whether the rubric is punishing style too heavily compared to actual audience value.

---

## 11. Phase 3 Approval Criteria

Approve Phase 3 only when:

```text
The engine can reject weak content confidently.
The engine can rewrite weak content into stronger content.
The scoring is transparent and specific.
The 80% threshold is enforced.
The design handoff is clear.
The output still feels Marcatching.
```

Once Phase 3 is approved, move to:

```text
Phase 4 — Graphic Designer + Marcatching Design QC
```
