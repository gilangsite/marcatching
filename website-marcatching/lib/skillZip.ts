import 'server-only'

import { deflateRawSync, inflateRawSync } from 'node:zlib'
import type { WorkspaceData } from '@/app/course/workspaceData'

const LOCAL_FILE_SIGNATURE = 0x04034b50
const CENTRAL_FILE_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50
const MAX_TEMPLATE_BYTES = 25 * 1024 * 1024

type ZipEntry = {
  name: string
  data: Buffer
}

function text(value: unknown, fallback = 'Belum diisi') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeSlug(value: string, fallback = 'creator') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 38) || fallback
}

function cleanZipPath(value: string) {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '')
  const segments = normalized.split('/').filter(Boolean)
  if (!segments.length || segments.some(segment => segment === '..')) return ''
  return segments.join('/')
}

function findEndRecord(buffer: Buffer) {
  const minimum = Math.max(0, buffer.length - 65_557)
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === END_SIGNATURE) return offset
  }
  throw new Error('Template Skill bukan ZIP yang valid')
}

function readZipEntries(buffer: Buffer): ZipEntry[] {
  if (buffer.length > MAX_TEMPLATE_BYTES) throw new Error('Template Skill terlalu besar')
  const endOffset = findEndRecord(buffer)
  const totalEntries = buffer.readUInt16LE(endOffset + 10)
  let cursor = buffer.readUInt32LE(endOffset + 16)
  const entries: ZipEntry[] = []

  for (let index = 0; index < totalEntries; index += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== CENTRAL_FILE_SIGNATURE) {
      throw new Error('Struktur template Skill rusak')
    }

    const flags = buffer.readUInt16LE(cursor + 8)
    const method = buffer.readUInt16LE(cursor + 10)
    const compressedSize = buffer.readUInt32LE(cursor + 20)
    const filenameLength = buffer.readUInt16LE(cursor + 28)
    const extraLength = buffer.readUInt16LE(cursor + 30)
    const commentLength = buffer.readUInt16LE(cursor + 32)
    const localOffset = buffer.readUInt32LE(cursor + 42)
    const rawName = buffer.subarray(cursor + 46, cursor + 46 + filenameLength).toString('utf8')
    cursor += 46 + filenameLength + extraLength + commentLength

    const name = cleanZipPath(rawName)
    if (!name || rawName.endsWith('/') || name.startsWith('__MACOSX/') || name.split('/').includes('.DS_Store')) continue
    if ((flags & 0x1) !== 0) throw new Error('Template Skill terenkripsi dan tidak bisa dipersonalisasi')
    if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== LOCAL_FILE_SIGNATURE) {
      throw new Error('File template Skill tidak lengkap')
    }

    const localNameLength = buffer.readUInt16LE(localOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize)
    const data = method === 0 ? Buffer.from(compressed) : method === 8 ? inflateRawSync(compressed) : null
    if (!data) throw new Error(`Metode kompresi ZIP ${method} belum didukung`)
    entries.push({ name, data })
  }

  if (!entries.length) throw new Error('Template Skill tidak memiliki file')
  return entries
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})

function crc32(buffer: Buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear())
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

function writeZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  const timestamp = dosDateTime(new Date())

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const deflated = deflateRawSync(entry.data, { level: 6 })
    const useDeflate = deflated.length < entry.data.length
    const payload = useDeflate ? deflated : entry.data
    const method = useDeflate ? 8 : 0
    const checksum = crc32(entry.data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(LOCAL_FILE_SIGNATURE, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x800, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(timestamp.time, 10)
    local.writeUInt16LE(timestamp.date, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(payload.length, 18)
    local.writeUInt32LE(entry.data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    localParts.push(local, name, payload)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(CENTRAL_FILE_SIGNATURE, 0)
    central.writeUInt16LE(0x031e, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x800, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(timestamp.time, 12)
    central.writeUInt16LE(timestamp.date, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(payload.length, 20)
    central.writeUInt32LE(entry.data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)
    offset += local.length + name.length + payload.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(END_SIGNATURE, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  return Buffer.concat([...localParts, centralDirectory, end])
}

export function isBrandMemoryReady(data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const memory = (data as Partial<WorkspaceData>).memory
  return Boolean(memory && [memory.voice, memory.redLines, memory.audienceFacts, memory.qualityGate].every(value => typeof value === 'string' && value.trim().length >= 100))
}

export function createBrandMemoryProfile(data: WorkspaceData, identity: { name: string; email: string }) {
  const audience = Array.isArray(data.audience) ? data.audience : []
  const audienceValue = (id: string) => text(audience.find(item => item.id === id)?.insight)
  return [
    '# Brand Memory Profile',
    '',
    `Generated from Marcatching Creator Workspace: ${new Date().toISOString()}`,
    '',
    '## Brand Snapshot',
    `Creator / Brand: ${text(data.creatorName, identity.name)}`,
    `Email: ${identity.email}`,
    `Business Type: ${text(data.businessType)}`,
    `Primary Goal: ${text(data.primaryGoal)}`,
    '',
    '## Audience',
    `Primary Buyer: ${text(data.revenue?.buyer)}`,
    `Pain: ${audienceValue('pain')}`,
    `Desire: ${audienceValue('desire')}`,
    `Fear: ${audienceValue('fear')}`,
    `Status Goal: ${audienceValue('status')}`,
    `Friction: ${audienceValue('friction')}`,
    `Trigger: ${audienceValue('trigger')}`,
    `Audience Facts: ${text(data.memory?.audienceFacts)}`,
    '',
    '## Offer & Revenue Thesis',
    `Core Problem: ${text(data.revenue?.problem)}`,
    `Why Now: ${text(data.revenue?.whyNow)}`,
    `Offer: ${text(data.revenue?.offer)}`,
    `Proof: ${text(data.revenue?.proof)}`,
    `Revenue Path: ${text(data.revenue?.revenuePath)}`,
    '',
    '## Voice',
    text(data.memory?.voice),
    '',
    '## Redlines',
    text(data.memory?.redLines),
    '',
    '## Output Quality Gate',
    text(data.memory?.qualityGate),
    '',
    '## Conversion',
    `Primary CTA: ${text(data.conversion?.primaryCta)}`,
    `Success Point: ${text(data.conversion?.successPoint)}`,
    '',
    '## Experiment Learnings',
    text(data.memory?.experimentLearnings),
    '',
    '## Integrity Rule',
    'Treat this profile as the authoritative personalization layer. Never invent missing proof, facts, offers, or audience claims. Ask for clarification when a required fact is marked Belum diisi.',
    '',
  ].join('\n')
}

function personalizeSkillMarkdown(markdown: string, skillName: string) {
  const withName = markdown.replace(/(^---\s*\n[\s\S]*?^name:\s*)[^\n]+/m, `$1${skillName}`)
  return `${withName.trim()}\n\n## Creator Workspace Personalization — Mandatory\n\nBefore executing any task, read \`brand-memory-profile.md\` at the skill root. Treat it as the authoritative source for audience, offer, voice, redlines, CTA, and output quality. The original Marcatching frameworks and quality gates remain active, but generic brand defaults must not override the creator's Brand Memory. Never invent missing proof or facts.\n`
}

export function customizeSkillZip(input: {
  template: Buffer
  templateSlug: string
  workspace: WorkspaceData
  identity: { name: string; email: string }
}) {
  const parsed = readZipEntries(input.template)
  const firstSegments = parsed.map(entry => entry.name.split('/')[0])
  const commonRoot = firstSegments.every(segment => segment === firstSegments[0]) && parsed.some(entry => entry.name.includes('/')) ? firstSegments[0] : ''
  const creatorSlug = safeSlug(input.workspace.creatorName || input.identity.name || input.identity.email.split('@')[0])
  const templateSlug = safeSlug(input.templateSlug, 'marcatching-skill')
  const skillName = `${creatorSlug}-${templateSlug}`.slice(0, 63).replace(/-$/, '')
  const root = `${skillName}/`
  const profile = Buffer.from(createBrandMemoryProfile(input.workspace, input.identity), 'utf8')
  let hasSkillFile = false

  const entries = parsed.map(entry => {
    const relative = commonRoot && entry.name.startsWith(`${commonRoot}/`) ? entry.name.slice(commonRoot.length + 1) : entry.name
    if (relative === 'SKILL.md') {
      hasSkillFile = true
      return { name: `${root}SKILL.md`, data: Buffer.from(personalizeSkillMarkdown(entry.data.toString('utf8'), skillName), 'utf8') }
    }
    if (relative === '08-brand-guidelines.md') {
      const override = `# Creator Workspace Brand Override\n\nAlways read \`brand-memory-profile.md\` first. Its voice, audience, redlines, CTA, and quality gate override generic brand assumptions below. Keep the original Marcatching visual defaults only when the profile does not specify an alternative.\n\n`
      return { name: `${root}${relative}`, data: Buffer.from(override + entry.data.toString('utf8'), 'utf8') }
    }
    return { name: `${root}${relative}`, data: entry.data }
  })

  if (!hasSkillFile) throw new Error('Template ZIP tidak memiliki SKILL.md')
  entries.push({ name: `${root}brand-memory-profile.md`, data: profile })
  return { buffer: writeZip(entries), filename: `${skillName}.zip`, skillName }
}
