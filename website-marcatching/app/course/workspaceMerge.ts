import {
  defaultAudience,
  defaultWorkspaceData,
  journeyOrder,
  sanitizeBrandInterview,
  sanitizeBrandProfile,
  sanitizeRefinedMemory,
  type CalendarItem,
  type Deliverable,
  type JourneySection,
  type MetricSnapshot,
  type RecommendedPrompt,
  type WorkspaceData,
} from './workspaceData'
import { sanitizeVisualIdentity } from './visualIdentity'

// Loading and normalizing a saved workspace. Lives outside WorkspaceClient so other pages (e.g. Landing Page)
// can read the same data without bundling the whole workspace UI.

export const deliverableStatuses: Deliverable['status'][] = ['Not started', 'In progress', 'Review', 'Approved']
export const calendarStatuses: CalendarItem['status'][] = ['Idea', 'Draft', 'Ready', 'Published']

export function cloneDefaultData(): WorkspaceData {
  return JSON.parse(JSON.stringify(defaultWorkspaceData)) as WorkspaceData
}

function looksLikeUntouchedLegacyBlueprint(saved: Record<string, unknown>) {
  const audience = Array.isArray(saved.audience) ? saved.audience as Array<Record<string, unknown>> : []
  return saved.creatorName === 'Creator Workspace'
    && saved.businessType === 'Knowledge creator'
    && String(audience[0]?.insight || '').startsWith('Konten sudah konsisten, tetapi tidak menghasilkan')
}

export function mergeWorkspaceData(parsed: unknown): WorkspaceData {
  const fallback = cloneDefaultData()
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback

  const saved = parsed as Record<string, unknown>
  if (looksLikeUntouchedLegacyBlueprint(saved)) return fallback
  const savedAudience = Array.isArray(saved.audience) ? saved.audience as Array<Record<string, unknown>> : []
  const revenue = saved.revenue && typeof saved.revenue === 'object' ? saved.revenue as Record<string, unknown> : {}
  const memory = saved.memory && typeof saved.memory === 'object' ? saved.memory as Record<string, unknown> : {}
  const conversion = saved.conversion && typeof saved.conversion === 'object' ? saved.conversion as Record<string, unknown> : {}
  const onboarding = saved.onboarding && typeof saved.onboarding === 'object' ? saved.onboarding as Record<string, unknown> : {}
  const savedMetrics = Array.isArray(saved.metrics) ? saved.metrics as Array<Record<string, unknown>> : []
  const hasMonthlyMetrics = savedMetrics.length > 0 && typeof savedMetrics[0]?.month === 'string'

  return {
    ...fallback,
    version: 2,
    creatorName: typeof saved.creatorName === 'string' ? saved.creatorName : '',
    businessType: typeof saved.businessType === 'string' ? saved.businessType : '',
    primaryGoal: typeof saved.primaryGoal === 'string' ? saved.primaryGoal : '',
    socialProfiles: Array.isArray(saved.socialProfiles)
      ? fallback.socialProfiles.map(profile => {
          const match = (saved.socialProfiles as Array<Record<string, unknown>>).find(item => item.platform === profile.platform)
          return match ? { ...profile, url: String(match.url || ''), audienceCount: Number(match.audienceCount || 0) } : profile
        })
      : fallback.socialProfiles,
    onboarding: {
      socialSetupDone: onboarding.socialSetupDone === true,
      completedSections: Array.isArray(onboarding.completedSections)
        ? onboarding.completedSections.filter((section): section is JourneySection => journeyOrder.includes(section as JourneySection))
        : [],
      skippedSections: Array.isArray(onboarding.skippedSections)
        ? onboarding.skippedSections.filter((section): section is JourneySection => journeyOrder.includes(section as JourneySection))
        : [],
      unlockedAt: typeof onboarding.unlockedAt === 'string' ? onboarding.unlockedAt : '',
    },
    audience: defaultAudience.map(item => {
      const match = savedAudience.find(candidate => candidate.id === item.id)
      return { ...item, insight: typeof match?.insight === 'string' ? match.insight : '' }
    }),
    revenue: {
      buyer: String(revenue.buyer || ''),
      problem: String(revenue.problem || ''),
      whyNow: String(revenue.whyNow || ''),
      offer: String(revenue.offer || ''),
      proof: String(revenue.proof || ''),
      testimonials: String(revenue.testimonials || ''),
      numbersData: String(revenue.numbersData || ''),
      processEvidence: String(revenue.processEvidence || ''),
      limitations: String(revenue.limitations || ''),
      revenuePath: String(revenue.revenuePath || revenue.path || ''),
    },
    contentRole: saved.contentRole === 'content-creator' || saved.contentRole === 'digital-marketer' ? saved.contentRole : '',
    recommendedPrompts: Array.isArray(saved.recommendedPrompts) ? saved.recommendedPrompts as RecommendedPrompt[] : [],
    contentExperimentSuggestion: typeof saved.contentExperimentSuggestion === 'string' ? saved.contentExperimentSuggestion : '',
    memory: {
      voice: String(memory.voice || ''),
      redLines: String(memory.redLines || ''),
      audienceFacts: String(memory.audienceFacts || ''),
      qualityGate: String(memory.qualityGate || ''),
      experimentLearnings: String(memory.experimentLearnings || ''),
    },
    conversion: {
      attention: String(conversion.attention || conversion.awareness || ''),
      profile: String(conversion.profile || ''),
      lead: String(conversion.lead || ''),
      nurture: String(conversion.nurture || ''),
      close: String(conversion.close || ''),
      primaryCta: String(conversion.primaryCta || ''),
      successPoint: String(conversion.successPoint || ''),
    },
    experiments: Array.isArray(saved.experiments)
      ? (saved.experiments as Array<Record<string, unknown>>).map((item, index) => {
          const result = item.result && typeof item.result === 'object' ? item.result as Record<string, unknown> : {}
          return {
            id: String(item.id || `legacy-${index}`),
            name: String(item.name || 'Experiment'),
            hypothesis: String(item.hypothesis || ''),
            contentUrl: String(item.contentUrl || ''),
            status: item.status === 'Uploaded' || item.status === 'On going' ? item.status : 'Draft',
            result: {
              views: Number(result.views || 0),
              likes: Number(result.likes || 0),
              comments: Number(result.comments || 0),
              shares: Number(result.shares || 0),
              saves: Number(result.saves || 0),
              clicks: Number(result.clicks || 0),
              leads: Number(result.leads || 0),
            },
            learning: String(item.learning || (typeof item.result === 'string' ? item.result : '')),
            createdAt: String(item.createdAt || new Date().toISOString()),
          }
        })
      : [],
    metrics: hasMonthlyMetrics ? savedMetrics as MetricSnapshot[] : [],
    deliverables: Array.isArray(saved.deliverables)
      ? fallback.deliverables.map(item => {
          const match = (saved.deliverables as Array<Record<string, unknown>>).find(candidate => candidate.id === item.id || candidate.code === item.code)
          return match ? { ...item, status: deliverableStatuses.includes(match.status as Deliverable['status']) ? match.status as Deliverable['status'] : item.status } : item
        })
      : fallback.deliverables,
    calendar: Array.isArray(saved.calendar)
      ? (saved.calendar as Array<Record<string, unknown>>).map((item, index) => ({
          id: String(item.id || `calendar-${index}`),
          week: Math.max(1, Math.min(4, Number(item.week || 1))),
          title: String(item.title || ''),
          channel: String(item.channel || item.format || ''),
          contentIp: String(item.contentIp || ''),
          status: calendarStatuses.includes(item.status as CalendarItem['status']) ? item.status as CalendarItem['status'] : 'Idea',
        }))
      : [],
    skillRequirements: saved.skillRequirements && typeof saved.skillRequirements === 'object' && !Array.isArray(saved.skillRequirements)
      ? Object.fromEntries(
          Object.entries(saved.skillRequirements as Record<string, unknown>).flatMap(([productId, answers]) => {
            if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return []
            const cleaned = Object.fromEntries(
              Object.entries(answers as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
            )
            return [[productId, cleaned]]
          })
        )
      : {},
    brandInterview: sanitizeBrandInterview(saved.brandInterview),
    refinedMemory: sanitizeRefinedMemory(saved.refinedMemory),
    visualIdentity: sanitizeVisualIdentity(saved.visualIdentity),
    brandProfile: sanitizeBrandProfile(saved.brandProfile),
  }
}

/**
 * Applies only the brand profile to a saved workspace blob, leaving every other field exactly as stored. Pages
 * that edit just the profile use this at save time so they never overwrite work done elsewhere with stale data.
 */
export function applyBrandProfile(raw: unknown, profile: { creatorName: string; brandProfile: WorkspaceData['brandProfile'] }): Record<string, unknown> {
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : cloneDefaultData() as unknown as Record<string, unknown>
  return {
    ...base,
    creatorName: typeof profile.creatorName === 'string' ? profile.creatorName.trim().slice(0, 80) : '',
    brandProfile: sanitizeBrandProfile(profile.brandProfile),
  }
}
