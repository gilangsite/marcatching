# Phase 5 Testing Protocol

## Purpose

This testing protocol verifies whether the Output Formatter / Final Delivery System works correctly.

Phase 5 includes:
- 07 — Output Formatter / Final Delivery System
- SKILL.md integration for output packaging and delivery logic

The goal is to ensure that the Marcatching Content Engine can package its work cleanly across different modes without losing logic, clarity, or usefulness.

---

## What to Test

A good Phase 5 test should verify:

1. output mode selection
2. section ordering
3. formatting consistency
4. delivery clarity
5. revision packaging logic
6. production handoff clarity

---

## Test A — Research Only Mode

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: AI Business & Technology
Topic: Kenapa AI company butuh banyak uang?
Output: research only
```

Pass criteria:
- output uses a research-only structure
- no unnecessary design sections
- content is easy to scan

---

## Test B — Hook + Copy Mode

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: hook options + 9-slide copy + caption
```

Pass criteria:
- research, hooks, copy, and caption are structured clearly
- no irrelevant design packaging unless requested

---

## Test C — Full Strategy Package

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Brand Strategy Breakdown
Topic: Kenapa Apple terasa premium?
Output: viral research + 9-slide copy + content doctor score + design handoff
```

Pass criteria:
- sections appear in the correct order
- content doctor score is shown clearly
- design handoff is concise but complete

---

## Test D — Design Brief Package

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Founder & Company Strategy
Topic: Kenapa Jeff Bezos fokus ke customer obsession?
Output: design brief only
```

Pass criteria:
- the formatter presents a structured slide-by-slide design brief
- no unnecessary long research block if not needed
- image generation plan is clear

---

## Test E — Full Production Package

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Business Model Breakdown
Topic: Darimana Microsoft dapat uang?
Output: full package
```

Pass criteria:
- output includes research, strategy, copy, score, design brief, QC criteria, caption, and production notes
- the output feels like a real handoff package

---

## Test F — Failed Content Packaging

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Marketing Psychology
Topic: Kenapa scarcity bisa bekerja?
Output: hook options + 9-slide copy + content doctor score + rewrite if below 80
```

Pass criteria:
- if score < 80, the output is clearly labeled as not approved yet
- rewrite direction appears clearly
- failed content is not packaged as final

---

## Test G — Failed Design Packaging

Prompt example:

```text
/marcatching-content-engine
Mode: Phase 5 Test
Segment: Economy & Market Insight
Topic: Kenapa attention sekarang jadi currency?
Output: design brief + design QC review
```

Pass criteria:
- if design QC score < 80, the output is labeled revise or regenerate
- fix instructions are specific

---

## Failure Signals

Phase 5 is not working correctly if:
- the formatter dumps everything regardless of the requested output
- sections appear in the wrong order
- failed content looks like approved content
- design handoff is unclear
- output formatting changes randomly from one use to another
- the result is bloated and hard to use

---

## Success Criteria

Phase 5 is successful if:
- the engine can package outputs for different needs cleanly
- the final result is easy to read and operationally useful
- strategy, copy, scoring, design, and caption sections are clearly separated
- revision and approval states are obvious
- the engine feels more like a real content production system than a generic assistant

---

## Recommended Next Step After Passing Phase 5

After Phase 5 is stable, continue to:
- Phase 6 — Brand Guideline & Prompt Template Finalization
- then full multi-segment testing and refinement
