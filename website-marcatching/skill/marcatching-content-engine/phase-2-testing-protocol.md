# Marcatching Content Engine — Phase 2 Testing Protocol

## Purpose

This file is used to test whether Phase 2 roles are working correctly before moving into Phase 3 Content Doctor.

Phase 2 includes:

1. Viral Researcher
2. Strategic Copywriter

At this stage, the engine should not generate final carousel images yet. It should produce research direction, viral angle, hook options, slide copy, caption, and copy quality notes.

---

## Test Prompt 1 — Business Model Breakdown

```text
/marcatching-content-engine
Mode: Phase 2 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: viral research + hook options + 9-slide copy + caption
```

Expected output:

- Identifies business model segment.
- Researches current facts if needed.
- Finds visible product vs hidden revenue engine.
- Produces at least 6 hook options.
- Selects the strongest hook.
- Creates 9-slide copy.
- Writes Marcatching-style caption.
- Does not generate design yet.

---

## Test Prompt 2 — Brand Strategy Breakdown

```text
/marcatching-content-engine
Mode: Phase 2 Test
Segment: Brand Strategy Breakdown
Topic: Kenapa Apple terasa premium?
Output: viral research + hook options + 9-slide copy + caption
```

Expected output:

- Identifies brand strategy segment.
- Finds perception, trust, ecosystem, and brand code angle.
- Avoids generic “Apple is premium because expensive” framing.
- Produces premium, minimalist copy.
- Keeps tone strategic and calm.

---

## Test Prompt 3 — Marketing Psychology

```text
/marcatching-content-engine
Mode: Phase 2 Test
Segment: Marketing Psychology
Topic: Kenapa orang lebih percaya brand yang terlihat simple?
Output: viral research + hook options + 9-slide copy + caption
```

Expected output:

- Identifies psychological trigger.
- Explains simplicity as trust and reduced cognitive friction.
- Avoids academic over-explanation.
- Creates copy that feels easy to save and share.

---

## Phase 2 Pass Criteria

Phase 2 is considered ready when the output meets these standards:

```text
Research angle is specific:
Audience belief shift is clear:
Hook options are varied:
Selected hook is strong:
Slide copy is minimal:
Slide sequence has rhythm:
Caption follows Marcatching format:
Tone feels premium and strategic:
No design generation is attempted yet:
```

If 2 or more criteria fail, revise Phase 2 files before moving to Phase 3.

---

## Recommended Next Step

After Phase 2 passes testing, continue to:

```text
Phase 3: Content Doctor Scoring System
```

Phase 3 will create the 1–100% scoring engine and rewrite loop that decides whether content is worth moving into design.
