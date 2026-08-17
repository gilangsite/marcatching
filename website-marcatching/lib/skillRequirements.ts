export type SkillRequirementField = {
  key: string
  label: string
  explanation: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

/**
 * Parses a skill's REQUIREMENTS.md into a list of question fields.
 *
 * Expected format:
 * - Label:
 * *Explanation for this field.
 * *Optional second line of explanation.
 *
 * A line is a new field only when it starts with "- " and ends with ":".
 * Any immediately-following "*"-prefixed lines become that field's explanation.
 * Everything else (headings, blank lines, prose) is ignored.
 */
export function parseSkillRequirements(markdown: string): SkillRequirementField[] {
  const lines = markdown.split('\n')
  const fields: SkillRequirementField[] = []
  let current: SkillRequirementField | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const fieldMatch = line.match(/^-\s+(.+):\s*$/)
    if (fieldMatch) {
      const label = fieldMatch[1].trim()
      const key = slugify(label) || `field-${fields.length + 1}`
      current = { key, label, explanation: '' }
      fields.push(current)
      continue
    }
    if (current && line.startsWith('*')) {
      const detail = line.replace(/^\*+\s?/, '').trim()
      current.explanation = current.explanation ? `${current.explanation}\n${detail}` : detail
      continue
    }
    if (line.startsWith('#')) {
      current = null
    }
  }

  return fields
}
