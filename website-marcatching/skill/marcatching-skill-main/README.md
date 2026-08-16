# Marcatching Skill Main — Claude-Compliant Package

This package is an installable Claude skill ZIP.

It contains exactly one file named `SKILL.md`.

All other skill logic is stored as resources so Claude can load only what is needed.

## Important

Do not add another file named `SKILL.md` inside this ZIP.

Claude requires exactly one `SKILL.md` file per installable skill package.

## Structure

```text
SKILL.md
resources/
  core.md
  marketing/
  content/
  research/
  memory/
  evaluator/
  prompt-libraries/
  evals/
  scripts/
```


## v1.1 Usage Note

For content creation, the skill now uses mandatory preflight gates.

If the user asks for FYP, viral, reach, engagement, or shareable content, Claude should not directly generate the script or post. It must first run the Viral Potential Preflight and improve the angle before writing.

This prevents article-like outputs from being mistaken as platform-native content.


## v1.2 Setup Alignment

If this ZIP was downloaded personalized from the Marcatching website, `brand-memory.md` is already filled in and already sits inside this ZIP, next to `SKILL.md`. No manual setup is needed — the skill reads it automatically. Skip the rest of this section.

If this ZIP was obtained any other way (original/non-personalized download, manual install), use the manual flow instead:

Use:

```text
brand-memory-template.md
```

as the blank form.

After the user fills it, save it as:

```text
brand-memory-profile.md
```

or:

```text
brand-memory-[brand-name].md
```

The filled profile should be stored in Claude Project Knowledge, workspace files, or the active conversation so the user does not need to re-enter brand context every time.

The skill should use `brand-memory-profile.md` before asking for repeated brand context.
