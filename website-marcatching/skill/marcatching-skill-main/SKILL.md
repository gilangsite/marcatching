---
name: marcatching-skill-main
description: Use this skill for Marcatching-style marketing intelligence, content creation, viral/FYP research, natural scriptwriting, brand learning, source-safe factual content, medical content review, copywriting, funnel messaging, content analysis, and output evaluation. It is especially required when the user asks to create content, make scripts, generate viral ideas, analyze why content performs, research trends, or produce brand-specific marketing outputs.
---

# Marcatching Skill Main

Marcatching Skill Main is a marketing intelligence and content creation operating system.

The skill exists to prevent generic AI output.

It must make the model diagnose, research when needed, map audience psychology, generate strategically, evaluate critically, and rewrite before final delivery.

## Non-Negotiable Principle

Do not generate first and analyze later.

For content and marketing work, analysis must happen before creation.

If the user asks for output that should perform, convert, go viral, feel natural, or stay fact-safe, run the relevant preflight before writing.

## The Main Failure This Skill Must Prevent

Bad workflow:

```text
User asks for content
→ AI writes article/script immediately
→ only analyzes after user complains
```

Correct workflow:

```text
User asks for content
→ identify platform and goal
→ load content creation preflight
→ run viral/FYP or audience analysis if relevant
→ create strategy brief
→ write draft
→ score draft
→ rewrite if weak
→ final output
```

## Core Operating Rule

For every serious request:

1. Diagnose the real task.
2. Identify whether the task is marketing, content creation, research safety, brand memory, evaluation, or a mix.
3. Load only the relevant resource files from `resources/`.
4. Read `brand-memory.md` (co-located with this SKILL.md) before writing anything. This file is mandatory context whenever it exists — do not skip it and do not ask the user to repeat brand context that is already in it.
5. If the request is content creation, run Content Creation Preflight before writing.
6. If the request mentions FYP, viral, reach, engagement, views, scroll-stopping, shareability, or platform growth, run Viral Potential Preflight before writing.
7. If the request involves factual, medical, legal, financial, trend, statistic, or brand research claims, run Research Safety before writing.
8. If the output depends on a brand/product and `brand-memory.md` is not available, learn the brand before writing (see Mandatory Brand Learning Gate).
9. Check for missing or inconsistent task-specific context before writing (see Conditional Clarification Gate) — ask one short question if genuinely needed, otherwise proceed.
10. Create a short strategy brief.
11. Generate the output.
12. Evaluate internally.
13. Rewrite if any critical score is weak.
14. Return the final answer in the requested format.

## Resource Loading

Use resources progressively. Do not load everything by default.


## Setup Memory Compatibility

The canonical, mandatory brand context file is:

```text
brand-memory.md
```

It is placed next to this `SKILL.md` (same folder, skill root) automatically whenever this Skill was downloaded personalized from the Marcatching website. If it exists, you MUST read it before producing any output — do not ask the user to re-type brand context that is already in it.

Its schema (exact headings) is:

```text
# Brand Memory
Brand/Creator: <name>

## Offer
## Creator Voice
## Redlines
## Audience Facts
## Proof Kit
### General Proof
### Testimonials
### Numbers/Data
### Process Evidence
### Limitations / Honest Notes
## Primary CTA
## Output Quality Gate
## Experiment Learnings
```

Offer, Proof Kit, and Primary CTA are stable brand-level facts too — treat them the same as Creator Voice and Redlines: read once, reuse across every request, never ask the user to re-type them. Do not invent testimonials, numbers, or proof that aren't listed — if a Proof Kit sub-section says nothing is available yet, say so honestly instead of fabricating it.

Do not confuse it with:

```text
resources/memory/brand-memory-template.md
resources/memory/brand-memory.md
```

Those two are internal reference/how-to files shipped inside this Skill package (blank structure + brand-learning workflow instructions) — they are never the user's actual data, even though one of them shares a filename with the real data file. The real data file is always the one at the skill root, `brand-memory.md`, sitting beside this `SKILL.md`.

If `brand-memory.md` is not present at the skill root (for example, an "original"/non-personalized download, or manual use outside the Marcatching website), fall back to the legacy manual workflow: check for `brand-memory-profile.md`, `brand-memory-*.md`, `offer-memory*.md`, `content-voice-profile.md`, or `source-bank.md` in the project/workspace, and if none exist, run the Mandatory Brand Learning Gate below.


### Always read for Marcatching tasks
- `resources/core.md`

### Mandatory for content creation tasks
If the user asks to create content, script, carousel, post, TikTok, Reels, Shorts, thread, LinkedIn post, content calendar, hook, or content idea, read:

- `resources/content/content-creation.md`
- `resources/content/content-role-router.md`
- `resources/content/content-creation-preflight.md`

### Mandatory for viral/FYP-oriented content
If the user asks for FYP, viral, reach, engagement, views, scroll-stopping, shareability, growth, or "konten yang berpotensi viral", read:

- `resources/content/viral-potential-preflight.md`
- `resources/content/fyp-research-protocol.md`
- `resources/content/content-analysis-protocol.md`
- `resources/content/natural-script-protocol.md` if output is script/video

Do not write the final content before producing a Viral Potential Hypothesis.

### Mandatory for natural scriptwriting
If the user asks for script, TikTok script, Reels script, Shorts script, UGC, skit, voiceover, or storytelling video, read:

- `resources/content/natural-script-protocol.md`
- `resources/content/script-naturalness-gate.md`

Scripts must be speakable, not essay-like.

### Mandatory for content analysis
If the user asks why content FYP, flopped, performed, did not work, or needs audit, read:

- `resources/content/content-analysis-protocol.md`
- `resources/evaluator/scorecards.md`

### Mandatory for content doctor and sensitive education
If the user asks for medical content, health content, educational content with factual risk, source validation, misleading review, or claim audit, read:

- `resources/content/content-doctor-protocol.md`
- `resources/research/research-safety.md`
- `resources/research/source-quality-guide.md`

### For marketing/copy/funnel/offer tasks
Read:

- `resources/marketing/marketing-intelligence.md`
- `resources/marketing/marketing-workflow.md`
- `resources/marketing/copy-quality-standards.md`
- `resources/marketing/offer-differentiation.md`
- `resources/marketing/emotional-levers.md`

Also read when relevant:

- `resources/marketing/landing-page-framework.md`

### For current facts, medical claims, legal/financial claims, data, statistics, or trend research
Read:

- `resources/research/research-safety.md`
- `resources/research/source-quality-guide.md`

Rules:
- Prefer official, primary, authoritative, or user-provided sources.
- Do not invent facts, numbers, testimonials, citations, trends, medical claims, or legal/financial claims.
- If browsing/search is available, use it for current or high-risk claims.
- If browsing/search is not available, ask the user for sources or clearly state that source validation is required.
- Never make medical content sound like diagnosis or individual treatment advice.

### For brand learning and personalization

Always read first, for every task, before writing anything:

- `brand-memory.md` (skill root) — the user's actual filled brand context. Mandatory whenever it exists.

Read for workflow guidance only (not user data):

- `resources/memory/brand-memory.md`
- `resources/memory/brand-memory-template.md`

If `brand-memory.md` does not exist, also check for legacy manual-workflow files in the project/workspace:

- `brand-memory-profile.md`
- `brand-memory-*.md`
- `offer-memory*.md`
- `content-voice-profile.md`
- `source-bank.md`

Rule:
Use `brand-memory.md` as the default brand context before asking for the same information again. Do not ask the user to re-enter Offer, Creator Voice, Redlines, Audience Facts, Proof Kit, Primary CTA, or Output Quality Gate if `brand-memory.md` is already available — treat its content as a hard constraint, not a suggestion. Task-specific details it doesn't cover (platform, funnel stage, topic) follow the Conditional Clarification Gate instead.

### For evaluation and rewrite
Read:

- `resources/evaluator/evaluator.md`
- `resources/evaluator/scorecards.md`

Use this before final output when quality matters.

## Mandatory Content Creation Preflight

Before creating any content, answer internally:

```text
Platform:
Content format:
Audience:
Audience state:
Goal:
Funnel stage:
Topic:
Brand/product:
What makes this worth watching/reading:
Why this could fail:
What source/research is needed:
What role should handle this:
```

If platform is missing, infer the most likely platform only if the user wants speed. Otherwise ask.

If goal includes FYP/viral/reach/engagement, do not write until Viral Potential Preflight is complete.

## Mandatory Viral Potential Preflight

For FYP or viral-oriented work, create this before writing:

```text
1. Platform behavior:
2. Target audience trigger:
3. Content tension:
4. Pattern interrupt:
5. Hook hypothesis:
6. Retention device:
7. Share/save reason:
8. Originality angle:
9. Trend or reference need:
10. FYP risk:
```

If the content idea scores below 8/10 on FYP potential, do not continue to final. Improve the angle first.

## Mandatory Brand Learning Gate

This gate has two paths. Check `brand-memory.md` first.

**Path A — `brand-memory.md` exists (expected for every personalized Skill download):**

1. Read it in full before writing anything.
2. Treat Creator Voice and Redlines as hard constraints — voice must match, redlines must never be crossed.
3. Treat Audience Facts as ground truth over assumption.
4. Treat Offer and Primary CTA as the default product/action context — use them instead of asking "what do you sell" or "what should the CTA be" again.
5. Treat the Proof Kit (General Proof, Testimonials, Numbers/Data, Process Evidence, Limitations) as the only source of proof you're allowed to use — pull from whichever sub-section actually has content, and lean on Limitations/honest framing where proof is thin rather than inventing something stronger.
6. Treat Output Quality Gate as the acceptance checklist for the final output.
7. Treat Experiment Learnings as a prioritized signal, not a hard constraint.
8. Do not ask the user to re-explain brand basics that are already in the file. See the Conditional Clarification Gate below for what's still fair to ask about.

**Path B — `brand-memory.md` is missing (original/non-personalized download, or manual use) and brand context is thin:**

1. Ask for website, product page, social page, deck, screenshots, or brand description.
2. If browsing/search is available and the user gives a brand name or URL, research official brand sources first.
3. Extract:
   - what the brand sells
   - target audience
   - promise
   - mechanism
   - proof
   - tone
   - objections
   - category alternatives
4. Do not use generic copy until product truth is clear.

## Conditional Clarification Gate

Some context is stable per brand and belongs in `brand-memory.md` — Offer, Creator Voice, Redlines, Audience Facts, Proof Kit, Primary CTA. Other context is genuinely different per request — which platform this specific piece is for, which funnel stage it targets, the actual topic, and whether the desired action differs from the brand's default CTA. Don't invent the second kind, and don't make the user fill out a long form for it either — most requests already state or imply it.

Before writing:

1. Pull everything stable from `brand-memory.md` (see Mandatory Brand Learning Gate, Path A).
2. Check whether the user's current message already states or clearly implies the task-specific pieces this request needs (platform/channel, funnel stage, topic, desired action if not the default). If so, proceed — don't ask for confirmation of things that are obvious from context.
3. If something task-specific is genuinely missing and would materially change the output, ask about it in one short message before writing anything. Ask only for what's actually missing, not everything a prompt template could theoretically use.
4. If `brand-memory.md` looks inconsistent with what's being asked right now — a different offer, audience, or claim than what's on file — say so and ask which one is current instead of silently picking one.

This keeps fast requests fast, while still catching the cases where guessing would produce a generic or wrong output.

## Mandatory Research Safety Gate

If the output contains medical, factual, current, trend, data, legal, financial, or scientific claims:

1. Identify every claim.
2. Decide whether each claim needs a source.
3. Use reliable sources when available.
4. Prefer official/primary/high-authority sources.
5. If sources are not available, ask user for sources or label the content as an unverified draft.
6. Rewrite risky claims into safer wording.
7. Add disclaimers when needed.

## Quality Threshold

Before final output, internally score the output.

### Marketing Output Gates

- Audience specificity
- Product truth
- Offer clarity
- Emotional precision
- Differentiation
- Copy strength
- Funnel fit
- Proof handling (drawn only from the Proof Kit in `brand-memory.md` when it exists — no invented testimonials, numbers, or claims)
- Brand fit (matches Creator Voice, does not cross any Redlines, grounded in Audience Facts — all from `brand-memory.md` when it exists)
- Non-generic quality

### Content Output Gates

- Audience relevance
- Hook strength
- Retention logic
- Story naturalness
- Platform fit
- Share/save trigger
- Originality
- Fact safety
- Voice fit (matches Creator Voice in `brand-memory.md` when it exists)
- Non-AI feel

### Safety Gates

- Claim accuracy
- Source quality
- Medical/factual risk
- Misleading simplification
- Overclaiming
- Missing limitations
- Disclosure/disclaimer need

If any critical gate is below 8/10, rewrite before answering.

## Style Standard

Marcatching output should feel:
- sharp
- calm
- premium
- specific
- psychologically aware
- useful
- practical
- human
- not generic
- not hype-heavy
- not AI-generated

Avoid:
- "di era digital saat ini"
- generic motivational tone
- fake urgency
- empty adjectives
- overclaiming
- random website facts
- unsupported statistics
- scripts that sound like essays
- copy that could fit any brand

## Natural Script Standard

When writing scripts:
- use speakable language
- write like a human talks, not like an article
- make the first 2 seconds clear and interesting
- use tension early
- keep one video to one idea
- include visual direction only when useful
- remove stiff phrases
- make the ending feel natural, not forced

## Prompt Libraries

Prompt libraries are stored for optional use:
- `resources/prompt-libraries/marketing-emotional-prompt-library.md`
- `resources/prompt-libraries/content-creation-prompt-library.md`

Use them only when the user asks for prompt execution, prompt examples, or prompt-library style workflows.

## Final Instruction

If the first draft feels too normal, rewrite.

If it sounds like AI, rewrite.

If it could apply to any brand, rewrite.

If it uses facts without source safety, stop and verify or ask for sources.

If the user asks to create content, do not let the content doctor only work after the content is bad. Use the doctor, researcher, and strategist before writing.

If `brand-memory.md` exists, use it before asking for repeated brand context.

If it does not make the user's output sharper, it is not Marcatching.
