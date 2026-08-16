---
name: marcatching-evaluator
description: Evaluation and refinement skill for Marcatching outputs. Use to score, audit, and rewrite marketing copy, content scripts, prompt outputs, landing pages, ads, captions, medical/factual content, or any output that needs to be sharper, safer, less generic, and more effective.
---

# Marcatching Evaluator

This skill evaluates output before final delivery.

Use it whenever:

- output feels generic
- user is not satisfied
- content must be safe
- copy must be stronger
- script must sound natural
- factual claims need review
- final output should be product-ready

## Core Rule

A draft is not final.

Evaluate, diagnose, rewrite.

## Choose Scorecard

```text
Marketing output → Marketing Scorecard
Content/script → Content Scorecard
Factual/medical → Safety Scorecard
Brand-specific work → Brand Fit Scorecard
```

Load `resources/scorecards.md`.

## Rewrite Rule

If any score is below 8/10, rewrite before final.

If rewrite still fails, identify missing context.

## Output

If user wants final only, run evaluation internally and show only final.

If user asks for audit, show:

```text
Score:
Diagnosis:
What works:
What fails:
Rewrite:
Why rewrite is better:
```
