---
name: marcatching-brand-memory
description: Brand learning and memory skill for Marcatching. Use when the AI needs to understand a user's brand, product, audience, offer, voice, proof, competitors, or past content before creating marketing or content outputs.
---

# Marcatching Brand Memory

This is a workflow/how-to file — instructions for the AI on learning and using brand context. It is NOT the user's actual brand data, even though it shares a filename with the real data file. The user's actual filled data, when it exists, is `brand-memory.md` at the skill root (sibling of the top-level `SKILL.md`), not this file.

This skill helps AI learn a user's brand quickly and reuse context across outputs.

Use it when:

- `brand-memory.md` already exists at the skill root — read it directly, skip the rest of this workflow
- brand context is missing and there is no `brand-memory.md` to read
- output feels generic
- user gives a brand URL
- user uploads brand docs
- user wants consistent tone
- user wants AI to learn from website/resources
- marketing/content output needs brand specificity

## Brand Learning Workflow

0. First, check whether `brand-memory.md` exists at the skill root. If it does, read it and use it directly — do not run the steps below.

If it does not exist and sources are available:

1. Read official website/product page first.
2. Read user-provided brand docs.
3. Read social content examples.
4. Extract offer, voice, redlines, audience facts, proof (testimonials, numbers, process evidence, honest limitations), primary CTA, and an output quality bar.
5. Build a Brand Memory using the schema below.
6. Use this memory before writing.

If sources are not available:

Ask for:

```text
Website:
Product/offer:
Target audience:
Tone examples:
Words to avoid:
Proof/testimonials:
Bad copy examples:
```

## Brand Memory Schema

This is the same schema as the real `brand-memory.md` at the skill root — use it when building a profile from scratch in Path B:

```markdown
# Brand Memory
Brand/Creator:

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

## Rule

Do not invent brand proof.

If proof is missing, use process, mechanism, or transparent limitation.
