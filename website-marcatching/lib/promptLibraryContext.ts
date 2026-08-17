export type PromptContext = Record<string, string>

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Reads only the specific fields the public Prompt Library needs to auto-fill,
 * directly off the raw `creator_workspaces.data` JSON. Deliberately does not
 * depend on the full WorkspaceData merge/default machinery in WorkspaceClient.tsx —
 * this is a read-only projection, not a hydration path.
 */
export function buildPromptContext(raw: unknown): PromptContext {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const data = raw as Record<string, unknown>
  const revenue = (data.revenue && typeof data.revenue === 'object' ? data.revenue : {}) as Record<string, unknown>
  const memory = (data.memory && typeof data.memory === 'object' ? data.memory : {}) as Record<string, unknown>
  const conversion = (data.conversion && typeof data.conversion === 'object' ? data.conversion : {}) as Record<string, unknown>
  const audience = Array.isArray(data.audience) ? data.audience as Array<Record<string, unknown>> : []
  const insight = (id: string) => str(audience.find(item => item.id === id)?.insight)

  const proofParts = [
    str(revenue.proof),
    str(revenue.testimonials),
    str(revenue.numbersData),
    str(revenue.processEvidence),
    str(revenue.limitations),
  ].filter(Boolean)

  const context: PromptContext = {
    'Brand/Product': str(data.creatorName),
    'Offer': str(revenue.offer),
    'Target Audience': str(memory.audienceFacts),
    'Audience Pain': insight('pain'),
    'Audience Desire': insight('desire'),
    'Audience Fear': insight('fear'),
    'Audience Status Goal': insight('status'),
    'Audience Friction': insight('friction'),
    'Proof/Credibility': proofParts.join(' | '),
    'Tone': str(memory.voice),
    'Constraints': str(memory.redLines),
    'Desired Action': str(conversion.primaryCta),
  }

  // Funnel Stage and Channel are intentionally left unmapped — they vary per
  // piece of content rather than being a stable brand fact, so they stay
  // blank for the user to fill per prompt.

  return Object.fromEntries(Object.entries(context).filter(([, value]) => value.length > 0))
}

/**
 * Fills blank "Label:" lines inside a prompt template with values from
 * `context`, leaving any label with no known value (or any other line)
 * untouched. Prompts vary in which fields they include, so this matches by
 * exact label text rather than assuming a fixed block shape.
 */
export function fillPromptContext(fullPrompt: string, context: PromptContext): string {
  if (!Object.keys(context).length) return fullPrompt
  return fullPrompt
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      if (!trimmed.endsWith(':')) return line
      const label = trimmed.slice(0, -1)
      const value = context[label]
      return value ? `${label}: ${value}` : line
    })
    .join('\n')
}

export function hasPromptContext(context: PromptContext): boolean {
  return Object.keys(context).length > 0
}
