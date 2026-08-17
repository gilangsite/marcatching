# Marcatching Skill Creation Guidelines

Read this before building or editing any Skill package sold through the Creator Workspace (`skill/marcatching-skill-main/`, `skill/marcatching-content-engine/`, and any new one). It exists so every skill plugs into the same automated system without custom code per skill.

## 1. Package structure

Every sellable Skill package must have, at its root (sibling files, same folder as `SKILL.md`):

```text
SKILL.md              — required. Frontmatter: name, description only.
REQUIREMENTS.md        — optional. Defines this skill's own customize questions (Section 2 below).
resources/              — optional supporting files, loaded progressively.
```

Two files get injected automatically by the website at download/personalize time — never author these by hand as "the user's data," only as internal reference/workflow docs if needed:

- `brand-memory.md` — always injected at the skill root when a user creates a personalized Skill. Contains their universal brand data (Offer, Creator Voice, Redlines, Audience Facts, Proof Kit, Primary CTA, Output Quality Gate, Experiment Learnings) — see `createBrandMemoryMarkdown` in `app/course/workspaceData.ts` for the exact current schema.
- If `REQUIREMENTS.md` exists and the user answered it, its answers get appended to the SAME `brand-memory.md` as a new section: `## Skill Requirements: {product name}`.

Both are guaranteed present (barring the empty-answer edge case) by the time SKILL.md runs — treat them as mandatory context, not optional context, per the Mandatory Brand Memory Gate pattern already used in both existing skills.

## 2. `REQUIREMENTS.md` — the customize-questions format

This file drives the dashboard's "Customize" step automatically (`app/course/SkillRequirementsModal.tsx`, parsed by `lib/skillRequirements.ts`). No code changes are needed when you add this file to a new skill — the dashboard reads it directly out of the skill's ZIP the next time a user opens Customize for that product.

Exact format:

```markdown
# Requirement List

- Label of the question:
*One or more explanation lines, each starting with "*", shown to the user as helper text under the question.

- Another label:
*Its explanation.
```

Parsing rules (keep to these or the parser won't pick the field up):
- A field starts on a line that is exactly `- Label:` (dash, space, label text, colon, nothing else after it).
- Every immediately-following line starting with `*` becomes part of that field's explanation (joined with newlines if there are several).
- Parsing stops for that field at the next `- Label:` line or a heading line (`#`).
- The field's storage key is a slug of the label (lowercase, hyphenated) — if you rename a label later, previously-saved answers under the old slug become orphaned. Don't rename labels casually once a skill is live.

### How to choose good requirement fields

Only ask what THIS skill specifically needs beyond the universal Brand Memory fields — don't repeat what's already covered:

**Already covered by `brand-memory.md` — do not re-ask:**
Offer, Creator Voice / tone, Redlines, Audience Facts, general Proof / testimonials / numbers / process evidence / limitations, Primary CTA.

**Fair game for a skill's own `REQUIREMENTS.md`** — whatever THIS skill's output genuinely needs that brand-memory.md doesn't capture. Examples from the two existing skills:
- A visual/design-output skill (like `marcatching-content-engine`) needs hex codes, font preference, reference examples, CTA style, visual do's/don'ts.
- A broad marketing/content skill (like `marcatching-skill-main`) needs primary content formats, primary platforms, factual-sensitivity flags.

A future skill in a different category should ask for whatever ITS output format needs (e.g. a video-script skill might ask for pacing/duration preference; an email-sequence skill might ask for sequence length and sending cadence). If you can't name something this skill needs that isn't already in brand-memory.md, skip `REQUIREMENTS.md` entirely — it's optional, and the system degrades gracefully when it's absent (no Customize questions shown, "Create Personal Skill" just works as before).

## 3. How the system uses this end-to-end

1. User clicks "Create Personal Skill" for a product in the Skill tab (`app/course/SkillLibrary.tsx`).
2. Dashboard calls `GET /api/workspace/skills/requirements?skillId=...` — this fetches the skill's ZIP template, extracts `REQUIREMENTS.md` if present, parses it, and checks whether the user already answered every field.
3. If there are unanswered fields, the Customize modal opens automatically (first time only — after saving, the check passes and future downloads skip straight to the ZIP).
4. Answers save into the user's Creator Workspace (`creator_workspaces.data.skillRequirements[product_id]`), separate from the universal Brand Memory fields — the guided Brand Memory step in the workspace is never touched by this.
5. On download, the server (`app/api/workspace/skills/route.ts` → `lib/skillZip.ts`) appends the answers as a new `## Skill Requirements: {product name}` section onto the same `brand-memory.md` that gets baked into the ZIP.

## 4. Reminder: write for the buyer's brand, not Marcatching's own

Every Skill sold through this system is a **template**, personalized per buyer via `brand-memory.md`. When writing or editing `SKILL.md` / `resources/*`:

- Content topic, niche, and voice must come from the buyer's own `brand-memory.md` (Offer + Audience Facts + Creator Voice) — never hardcode Marcatching's own business/AI/marketing niche or tone as a requirement for every buyer.
- Never output the literal word "Marcatching" as the buyer's brand identity (captions, CTAs, wordmark labels) unless their own `Brand/Creator:` line in brand-memory.md literally says so.
- A skill's underlying visual/design system (e.g. `marcatching-content-engine`'s dark editorial theme, DM Sans + Palatino) MAY stay fixed as "Marcatching's own design engine" if that's a deliberate product decision — but that must be a conscious choice you state explicitly in the skill's Core Identity section, not an accident of copy-pasting Marcatching's own internal voice into buyer-facing instructions.
- When a scoring/quality-gate rubric needs a tone-word ("calm", "sharp", "strategic", etc.), phrase it as Marcatching's own *default* that Creator Voice overrides — never as an unconditional requirement.
