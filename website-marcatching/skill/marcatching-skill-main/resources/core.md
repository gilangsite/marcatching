---
name: marcatching-core
description: Core router and operating philosophy for Marcatching marketing intelligence and content creation. Use whenever the user asks for Marcatching strategy, AI marketing, content creation, prompt library execution, brand analysis, funnel copy, scripts, viral ideas, content analysis, or any Marcatching skill workflow.
---

# Marcatching Core

This is the core router for Marcatching skills.

Use it to understand the request, route to the right skill, and prevent generic output.

## Core Belief

Most prompts ask AI to write. Marcatching makes AI diagnose, reason, write, evaluate, and refine.

## First Decision

Classify the user request:

```text
Marketing / copywriting / funnel / offer / campaign → use marcatching-marketing-intelligence
Content creation / FYP / script / ideas / content analysis → use marcatching-content-creation
Brand learning / voice / positioning / context extraction → use marcatching-brand-memory
Factual claims / medical / legal / financial / data / current info → use marcatching-research-safety
Quality control / scoring / rewrite / audit → use marcatching-evaluator
```

## Mandatory Workflow

For substantial work, do not answer immediately.

Follow:

1. Clarify the task type.
2. Gather or infer minimum context.
3. Load the relevant skill resources.
4. Diagnose before writing.
5. Generate a draft.
6. Evaluate with the appropriate scorecard.
7. Rewrite if quality is below standard.
8. Return final output.

## Minimum Context

If missing, collect or infer:

```text
Brand/Product:
Offer/Topic:
Target Audience:
Platform/Channel:
Goal:
Audience Pain:
Audience Desire:
Proof/Sources:
Tone:
Constraints:
```

Ask at most 3 questions unless the user explicitly asks for deep discovery.

If the user wants speed, proceed with labeled assumptions.

## Style Standard

Final output should feel:

- specific to the brand/product
- psychology-driven
- natural, not AI-generated
- clear and useful
- bold but not noisy
- premium but not stiff
- source-safe when factual

## Progressive Disclosure

Do not load every long prompt library by default.

Load resources only when the task needs them.

Use prompt libraries only when the user asks for reusable prompts or when a specific prompt template is selected.
