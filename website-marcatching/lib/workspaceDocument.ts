import 'server-only'

import type { AdminCreatorWorkspace } from '@/lib/adminCreatorWorkspaces'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function arrayValue(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>> : []
}

function text(value: unknown, fallback = 'Belum diisi') {
  const normalized = typeof value === 'string' ? value.trim() : String(value ?? '').trim()
  return normalized || fallback
}

function pdfSafe(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function markdownForWorkspace(item: AdminCreatorWorkspace) {
  const data = objectValue(item.data)
  const audience = arrayValue(data.audience)
  const revenue = objectValue(data.revenue)
  const memory = objectValue(data.memory)
  const conversion = objectValue(data.conversion)
  const prompts = arrayValue(data.recommendedPrompts)
  const experiments = arrayValue(data.experiments)
  const metrics = arrayValue(data.metrics)
  const deliverables = arrayValue(data.deliverables)
  const calendar = arrayValue(data.calendar)
  const socialProfiles = arrayValue(data.socialProfiles)

  const lines = [
    '# Marcatching Creator Workspace',
    '',
    `- Nama: ${item.name}`,
    `- Email: ${item.email || 'Belum tersedia'}`,
    `- Nomor telepon: ${item.whatsapp || 'Belum tersedia'}`,
    `- Progress: ${item.completedSections}/8 section`,
    `- Terakhir diperbarui: ${item.updatedAt ? new Date(item.updatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Belum tersedia'}`,
    '',
    '## Social Profiles',
    ...socialProfiles.map(profile => `- ${text(profile.platform, 'Platform')}: ${text(profile.url)} - ${Number(profile.audienceCount || 0).toLocaleString('id-ID')} audience`),
    ...(socialProfiles.length ? [] : ['Belum ada social profile.']),
    '',
    '## Audience OS',
    ...audience.flatMap(dimension => [`### ${text(dimension.label)} - ${text(dimension.plainLabel, '')}`, text(dimension.insight), '']),
    ...(audience.length ? [] : ['Belum diisi.', '']),
    '## Revenue Thesis',
    `### Buyer - Siapa yang membeli\n${text(revenue.buyer)}`,
    `### Core Problem - Masalah yang dibayar\n${text(revenue.problem)}`,
    `### Why Now - Alasan membeli sekarang\n${text(revenue.whyNow)}`,
    `### Offer - Solusi yang dijual\n${text(revenue.offer)}`,
    `### Proof - Alasan untuk percaya\n${text(revenue.proof)}`,
    `### Revenue Path - Jalur transaksi\n${text(revenue.revenuePath || revenue.path)}`,
    '',
    '## Content IP',
    `- Role: ${text(data.contentRole)}`,
    ...prompts.flatMap((prompt, index) => [`### Prompt ${index + 1}: ${text(prompt.title)}`, text(prompt.why), '']),
    `### Suggestion from Experiments\n${text(data.contentExperimentSuggestion)}`,
    '',
    '## AI Memory',
    `### Creator Voice\n${text(memory.voice)}`,
    `### Redlines\n${text(memory.redLines)}`,
    `### Audience Facts\n${text(memory.audienceFacts)}`,
    `### Output Quality Gate\n${text(memory.qualityGate)}`,
    `### Experiment Learnings\n${text(memory.experimentLearnings)}`,
    '',
    '## Conversion Map',
    `- Attention: ${text(conversion.attention || conversion.awareness)}`,
    `- Profile: ${text(conversion.profile)}`,
    `- Lead: ${text(conversion.lead)}`,
    `- Nurture: ${text(conversion.nurture)}`,
    `- Close: ${text(conversion.close)}`,
    `- Primary CTA: ${text(conversion.primaryCta)}`,
    `- Success Point: ${text(conversion.successPoint)}`,
    '',
    '## Experiments',
    ...experiments.flatMap((experiment, index) => {
      const result = objectValue(experiment.result)
      return [
        `### Experiment ${index + 1}: ${text(experiment.name)}`,
        `- Hypothesis: ${text(experiment.hypothesis)}`,
        `- Content URL: ${text(experiment.contentUrl)}`,
        `- Status: ${text(experiment.status)}`,
        `- Result: ${Number(result.views || 0)} views, ${Number(result.likes || 0)} likes, ${Number(result.comments || 0)} comments, ${Number(result.shares || 0)} shares, ${Number(result.saves || 0)} saves, ${Number(result.clicks || 0)} clicks, ${Number(result.leads || 0)} leads`,
        `- Learning: ${text(experiment.learning)}`,
        '',
      ]
    }),
    ...(experiments.length ? [] : ['Belum ada experiment.', '']),
    '## Metric Scorecard',
    ...metrics.map(metric => `- ${text(metric.month)}: ${Number(metric.followers || 0)} followers, ${Number(metric.averageViews || 0)} average views, ${Number(metric.engagement || 0)} engagement, ${Number(metric.leads || 0)} leads, ${Number(metric.sales || 0)} sales`),
    ...(metrics.length ? [] : ['Belum ada monthly snapshot.']),
    '',
    '## Deliverables',
    ...deliverables.map(deliverable => `- ${text(deliverable.code, '')} ${text(deliverable.name)}: ${text(deliverable.status)} - ${text(deliverable.description, '')}`),
    ...(deliverables.length ? [] : ['Belum ada deliverable.']),
    '',
    '## 30-Day Map',
    ...calendar.map(entry => `- Week ${Number(entry.week || 1)} - ${text(entry.title)} - ${text(entry.channel)} - ${text(entry.status)}`),
    ...(calendar.length ? [] : ['Belum ada rencana konten.']),
    '',
    '*Confidential - dokumen ini hanya untuk analisis Creator Workspace member dan tim Marcatching.*',
  ]

  return lines.join('\n')
}

export function createWorkspaceMarkdown(items: AdminCreatorWorkspace[]) {
  return items.map(markdownForWorkspace).join('\n\n---\n\n')
}

function wrapText(value: string, maxLength: number) {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const sourceWord of words) {
    const chunks = sourceWord.match(new RegExp(`.{1,${maxLength}}`, 'g')) || ['']
    for (const word of chunks) {
      const next = current ? `${current} ${word}` : word
      if (next.length <= maxLength) current = next
      else {
        if (current) lines.push(current)
        current = word
      }
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['-']
}

function textCommand(input: { x: number; y: number; text: string; size: number; bold?: boolean; color?: [number, number, number] }) {
  const [r, g, b] = input.color || [0.08, 0.12, 0.17]
  return `BT /${input.bold ? 'F2' : 'F1'} ${input.size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${input.x} ${input.y} Tm (${pdfSafe(input.text)}) Tj ET`
}

function buildPdf(pages: string[]) {
  const pageObjectStart = 3
  const fontRegularId = pageObjectStart + pages.length
  const fontBoldId = fontRegularId + 1
  const contentStart = fontBoldId + 1
  const infoId = contentStart + pages.length
  const pageIds = pages.map((_, index) => pageObjectStart + index)
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  ]

  pages.forEach((_, index) => {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentStart + index} 0 R >>`)
  })
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  pages.forEach(content => objects.push(`<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`))
  objects.push('<< /Title (Marcatching Creator Workspace) /Producer (Marcatching) >>')

  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n%MARCATCHING\n', 'ascii')]
  const offsets = [0]
  let byteOffset = chunks[0].length
  objects.forEach((object, index) => {
    offsets.push(byteOffset)
    const chunk = Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, 'ascii')
    chunks.push(chunk)
    byteOffset += chunk.length
  })
  const xrefOffset = byteOffset
  const xrefRows = ['0000000000 65535 f ']
  for (let index = 1; index <= objects.length; index += 1) xrefRows.push(`${String(offsets[index]).padStart(10, '0')} 00000 n `)
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n${xrefRows.join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'ascii'))
  return Buffer.concat(chunks)
}

export function createWorkspacePdf(items: AdminCreatorWorkspace[]) {
  const pages: string[][] = []
  let commands: string[] = []
  let y = 744
  let currentMember = ''
  const navy: [number, number, number] = [0.05, 0.2, 0.41]
  const blue: [number, number, number] = [0.23, 0.52, 0.75]
  const muted: [number, number, number] = [0.39, 0.45, 0.54]

  const startPage = (member: string) => {
    if (commands.length) pages.push(commands)
    currentMember = member
    commands = ['1 1 1 rg 0 0 595 842 re f', `${navy.join(' ')} rg 0 770 595 72 re f`]
    commands.push(textCommand({ x: 44, y: 807, text: 'MARCATCHING', size: 16, bold: true, color: [1, 1, 1] }))
    commands.push(textCommand({ x: 44, y: 785, text: 'CREATOR WORKSPACE REPORT', size: 9, bold: true, color: [0.75, 0.86, 0.95] }))
    commands.push(textCommand({ x: 360, y: 793, text: member, size: 9, bold: true, color: [1, 1, 1] }))
    y = 744
  }

  const ensureRoom = (height: number) => {
    if (y - height < 54) startPage(currentMember)
  }

  const addLine = (value: string, size = 9.5, bold = false, color: [number, number, number] = [0.08, 0.12, 0.17], indent = 0, gapAfter = 4) => {
    const maxLength = Math.max(34, Math.floor((88 - indent / 5) * (9.5 / size)))
    const wrapped = wrapText(value, maxLength)
    const lineHeight = size + 4
    ensureRoom(wrapped.length * lineHeight + gapAfter)
    wrapped.forEach(line => {
      commands.push(textCommand({ x: 44 + indent, y, text: line, size, bold, color }))
      y -= lineHeight
    })
    y -= gapAfter
  }

  items.forEach((item, itemIndex) => {
    if (itemIndex > 0 && commands.length) startPage(item.name)
    else if (!commands.length) startPage(item.name)
    const markdown = markdownForWorkspace(item)
    for (const rawLine of markdown.split('\n')) {
      const line = rawLine.trim()
      if (!line) {
        y -= 5
        continue
      }
      if (line.startsWith('# ')) {
        addLine(line.slice(2), 17, true, navy, 0, 10)
      } else if (line.startsWith('## ')) {
        ensureRoom(34)
        y -= 3
        commands.push(`${blue.join(' ')} rg 44 ${y - 4} 507 1 re f`)
        y -= 17
        addLine(line.slice(3), 12, true, navy, 0, 7)
      } else if (line.startsWith('### ')) {
        addLine(line.slice(4), 10, true, [0.12, 0.27, 0.42], 0, 4)
      } else if (line === '---') {
        y -= 10
      } else if (line.startsWith('*Confidential')) {
        addLine(line.replace(/^\*|\*$/g, ''), 8.5, false, muted, 0, 0)
      } else if (line.startsWith('- ')) {
        addLine(`- ${line.slice(2)}`, 9.2, false, [0.16, 0.2, 0.25], 10, 3)
      } else {
        addLine(line, 9.4, false, [0.16, 0.2, 0.25], 0, 5)
      }
    }
  })
  if (commands.length) pages.push(commands)

  const finalized = pages.map((page, index) => [
    ...page,
    '0.86 0.89 0.92 RG 0.5 w 44 39 m 551 39 l S',
    textCommand({ x: 44, y: 24, text: 'Confidential - Marcatching Creator Workspace', size: 7.5, color: muted }),
    textCommand({ x: 512, y: 24, text: `${index + 1}/${pages.length}`, size: 7.5, bold: true, color: navy }),
  ].join('\n'))
  return buildPdf(finalized)
}
