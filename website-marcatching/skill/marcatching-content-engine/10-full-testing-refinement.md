# 10 — Full Testing & Refinement System

## Purpose

This role validates the Marcatching Content Engine as a complete operating system, not as isolated files.

Phase 7 checks whether the engine can consistently produce strong Marcatching carousel outputs across different segments, topics, levels of difficulty, and output modes.

The goal is not only to test whether the engine works once.
The goal is to test whether it works repeatedly.

---

## Core Mission

The Full Testing & Refinement System must:

- test the engine across all major Marcatching segments
- evaluate research quality, copy quality, scoring strictness, visual brief quality, and final output formatting
- detect weak modules
- identify inconsistent behavior
- recommend revisions to the engine files
- create a clean testing record before final packaging

This phase protects the project from looking good in theory but failing in real production.

---

## Testing Philosophy

A good engine must be judged by output quality, not by the beauty of its instructions.

The testing process must answer five questions:

1. Does the engine understand the content segment?
2. Does it find a strong enough angle?
3. Does the copy feel Marcatching, not generic?
4. Does the Content Doctor score honestly?
5. Does the design brief produce a consistent Marcatching visual direction?

If any answer is weak, the engine needs refinement.

---

## Mandatory Test Segments

The engine must be tested across at least six core segments.

### 1. Business Model Breakdown
Example topics:
- Darimana OpenAI dapat uang?
- Darimana Microsoft dapat uang?
- Darimana Tesla dapat uang?

Purpose:
Check whether the engine can explain revenue systems clearly and strategically.

### 2. AI Business & Technology
Example topics:
- Kenapa AI company butuh banyak uang?
- Kenapa model AI mahal untuk dijalankan?
- Kenapa AI bukan cuma aplikasi, tapi infrastruktur?

Purpose:
Check source sensitivity, technical clarity, and simplification quality.

### 3. Brand Strategy Breakdown
Example topics:
- Kenapa Apple terasa premium?
- Kenapa Nike kuat secara emosional?
- Kenapa Starbucks bukan cuma jual kopi?

Purpose:
Check emotional-brand logic and premium copy tone.

### 4. Marketing Psychology
Example topics:
- Kenapa orang beli produk mahal?
- Kenapa scarcity bisa bekerja?
- Kenapa social proof bikin orang lebih percaya?

Purpose:
Check psychological explanation and shareability.

### 5. Economy & Market Insight
Example topics:
- Kenapa attention sekarang jadi currency?
- Kenapa iklan digital makin mahal?
- Kenapa startup bisa ramai tapi belum tentu profitable?

Purpose:
Check macro-to-simple explanation quality.

### 6. Founder & Company Strategy
Example topics:
- Kenapa Jeff Bezos fokus ke customer obsession?
- Kenapa Jensen Huang membangun Nvidia seperti ini?
- Kenapa Elon Musk sering bermain di kategori sulit?

Purpose:
Check founder-driven narrative, business insight, and visual realism needs.

---

## Test Levels

Run tests in three levels.

### Level 1 — Quick Functional Test
Goal:
Check whether the engine follows the workflow.

Minimum output:
- viral research
- hook options
- carousel copy
- content doctor score

Use when:
- checking whether the engine works after file changes
- testing a new segment quickly

### Level 2 — Strategy + Design Brief Test
Goal:
Check whether the engine can move from content to design handoff.

Minimum output:
- viral research
- strategic direction
- copy
- score
- design brief
- image generation plan

Use when:
- testing production readiness without generating images

### Level 3 — Full Production Test
Goal:
Check the full system including sample visuals or image-generation-ready prompts.

Minimum output:
- full package
- image generation plan
- sample slide generation or slide prompts
- design QC score
- revision instruction if needed

Use when:
- validating the final engine before using it for real Marcatching production

---

## Master Test Prompt Template

Use this prompt in a fresh chat with the latest zip or extracted files uploaded.

```text
/marcatching-content-engine
Mode: Phase 7 Full Test
Segment: [choose segment]
Topic: [insert topic]
Output: full package
Quality Rule: If Content Doctor score is below 80, rewrite before design. If Design QC score is below 80, provide regeneration instructions.
```

---

## Required Evaluation Scorecard

Each test must be evaluated using this scorecard.

| Category | Weight |
|---|---:|
| Segment Understanding | 10% |
| Research Relevance | 10% |
| Viral Angle Strength | 15% |
| Hook Strength | 15% |
| Carousel Flow | 10% |
| Copy Clarity | 10% |
| Marcatching Tone Fit | 10% |
| Content Doctor Strictness | 5% |
| Design Brief Quality | 10% |
| Output Formatting | 5% |

Total = 100%

### Score interpretation

- 90–100 = excellent, ready for production
- 80–89 = strong, usable with minor refinement
- 70–79 = not stable enough, revise relevant module
- below 70 = major issue, engine instructions must be improved

---

## Testing Record Format

For every test, record the result like this:

```text
Test ID:
Date:
Segment:
Topic:
Output Mode:
Overall Score:
Status: Pass / Revise / Fail

Strongest Parts:
- ...

Weakest Parts:
- ...

Module Likely Responsible:
- Researcher / Copywriter / Content Doctor / Graphic Designer / Output Formatter / Brand Guidelines

Recommended Fix:
- ...

Decision:
- Keep / Revise / Retest
```

---

## Common Failure Patterns

### Failure 1 — Generic Viral Angle
Symptoms:
- the angle feels like a common article
- no tension
- no belief shift
- no reason to share

Likely module:
- Viral Researcher
- Strategic Copywriter

Fix:
- force sharper core tension
- add stronger contrarian or emotional trigger
- improve audience-specific reason to care

### Failure 2 — Hook Feels Weak
Symptoms:
- hook is too explanatory
- hook is too long
- hook lacks pattern interrupt
- hook does not create curiosity

Likely module:
- Strategic Copywriter

Fix:
- generate more hook variations
- use minimalist, emotional, contrarian, or money-trail patterns
- select one best hook instead of presenting all as equal

### Failure 3 — Copy Feels Too Generic
Symptoms:
- slide text sounds like normal business content
- too many vague claims
- lacks Marcatching calm sharpness

Likely module:
- Strategic Copywriter
- Brand Guidelines

Fix:
- rewrite with shorter lines
- improve specificity
- remove generic motivational phrases

### Failure 4 — Content Doctor Too Lenient
Symptoms:
- weak content gets score above 80
- scoring does not explain weaknesses
- no rewrite loop triggered when needed

Likely module:
- Content Doctor

Fix:
- lower score tolerance
- demand evidence of hook strength, emotional pull, and shareability
- force rewrite if key categories are weak

### Failure 5 — Design Brief Feels Like Any Brand
Symptoms:
- visual direction is too generic
- black editorial identity is missing
- no clear typography logic
- no premium restraint

Likely module:
- Graphic Designer
- Brand Guidelines

Fix:
- add stronger Marcatching visual DNA enforcement
- specify layout family, typography behavior, and negative space

### Failure 6 — Output Is Messy
Symptoms:
- sections are not ordered well
- too much information for the requested mode
- design appears before scoring
- failed output looks approved

Likely module:
- Output Formatter

Fix:
- enforce output modes
- label approved versus not approved
- reduce redundant sections

---

## Refinement Loop

If a test fails or scores below 80, follow this loop:

1. Identify the weak output category.
2. Map the weakness to the responsible module.
3. Rewrite only the relevant module, not the whole engine.
4. Retest the same topic.
5. Compare the before and after score.
6. Keep the change only if quality improves.

Do not rewrite the whole engine unless multiple segments fail for the same structural reason.

---

## Minimum Passing Standard Before Phase 8

Before final packaging, the engine should pass:

- at least 1 Business Model Breakdown test
- at least 1 AI Business & Technology test
- at least 1 Brand Strategy Breakdown test
- at least 1 Marketing Psychology test
- at least 1 Economy & Market Insight test
- at least 1 Founder & Company Strategy test

Minimum standard:
- no test below 80%
- at least 3 tests above 85%
- no repeated failure pattern across more than 2 segments

If the engine does not reach this standard, refine before Phase 8.

---

## Manual Testing Recommendation

The user should test the engine in a fresh chat after uploading the latest zip or extracted files.

The most important first test is:

```text
/marcatching-content-engine
Mode: Phase 7 Full Test
Segment: Business Model Breakdown
Topic: Darimana OpenAI dapat uang?
Output: full package
Quality Rule: If Content Doctor score is below 80, rewrite before design. If Design QC score is below 80, provide regeneration instructions.
```

After that, test one topic from each other segment.

---

## Final Rule

Phase 7 is not about adding more complexity.
It is about proving that the engine is stable.

A stable engine is better than an overcomplicated engine.

Only move to Phase 8 when the engine can repeatedly produce strong outputs without relying on the current conversation context.
