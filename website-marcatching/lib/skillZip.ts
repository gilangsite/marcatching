import 'server-only'

import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { createBrandMemoryMarkdown, type WorkspaceData } from '../app/course/workspaceData'
import type { SkillRequirementField } from './skillRequirements'

const LOCAL_FILE_SIGNATURE = 0x04034b50
const CENTRAL_FILE_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50
const MAX_TEMPLATE_BYTES = 25 * 1024 * 1024

type ZipEntry = {
  name: string
  data: Buffer
  isDirectory?: boolean
}

function safeSlug(value: string, fallback = 'creator') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 38) || fallback
}

function validateZipPath(value: string) {
  const normalized = value.replace(/\\/g, '/')
  const segments = normalized.split('/').filter(Boolean)
  if (!segments.length || normalized.startsWith('/') || /^[a-z]:\//i.test(normalized) || segments.some(segment => segment === '..') || value.includes('\0')) {
    throw new Error('Template Skill memiliki path file yang tidak aman')
  }
  return value
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

    const name = validateZipPath(rawName)
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
    entries.push({ name, data, isDirectory: rawName.endsWith('/') })
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
    const unixMode = entry.isDirectory ? 0o040755 : 0o100644
    central.writeUInt32LE((unixMode << 16) >>> 0, 38)
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

function findSkillRoot(entries: ZipEntry[]) {
  const skillEntry = entries
    .filter(entry => /(^|\/)SKILL\.md$/.test(entry.name.replace(/\\/g, '/')))
    .sort((a, b) => a.name.length - b.name.length)[0]
  if (!skillEntry) throw new Error('Template ZIP tidak memiliki SKILL.md')
  const normalizedSkillPath = skillEntry.name.replace(/\\/g, '/')
  return normalizedSkillPath.includes('/') ? normalizedSkillPath.slice(0, normalizedSkillPath.lastIndexOf('/') + 1) : ''
}

/** Reads REQUIREMENTS.md sitting next to SKILL.md in a skill template, if the template ships one. */
export function extractRequirementsDoc(template: Buffer): string | null {
  const parsed = readZipEntries(template)
  const skillRoot = findSkillRoot(parsed)
  const requirementsPath = `${skillRoot}REQUIREMENTS.md`
  const entry = parsed.find(item => item.name.replace(/\\/g, '/') === requirementsPath)
  return entry ? entry.data.toString('utf8') : null
}

function renderSkillRequirementsSection(skillLabel: string, fields: SkillRequirementField[], answers: Record<string, string>) {
  if (!fields.length) return ''
  const lines = ['', `## Skill Requirements: ${skillLabel}`, '']
  for (const field of fields) {
    lines.push(`### ${field.label}`, (answers[field.key] || '').trim() || 'Belum diisi.', '')
  }
  return lines.join('\n')
}

export function customizeSkillZip(input: {
  template: Buffer
  templateSlug: string
  workspace: WorkspaceData
  identity: { name: string; email: string }
  skillRequirements?: { skillLabel: string; fields: SkillRequirementField[]; answers: Record<string, string> }
}) {
  const parsed = readZipEntries(input.template)
  const skillRoot = findSkillRoot(parsed)
  const memoryPath = `${skillRoot}brand-memory.md`
  const creatorSlug = safeSlug(input.workspace.creatorName || input.identity.name || input.identity.email.split('@')[0])
  const templateSlug = safeSlug(input.templateSlug, 'marcatching-skill')
  const skillName = `${creatorSlug}-${templateSlug}`.slice(0, 63).replace(/-$/, '')
  const requirementsSection = input.skillRequirements
    ? renderSkillRequirementsSection(input.skillRequirements.skillLabel, input.skillRequirements.fields, input.skillRequirements.answers)
    : ''
  const brandMemory = Buffer.from(createBrandMemoryMarkdown(input.workspace) + requirementsSection, 'utf8')
  let memoryMerged = false
  const entries = parsed.map(entry => {
    if (entry.name.replace(/\\/g, '/') !== memoryPath) return entry
    memoryMerged = true
    return { ...entry, data: brandMemory }
  })
  if (!memoryMerged) entries.push({ name: memoryPath, data: brandMemory })

  return { buffer: writeZip(entries), filename: `${skillName}.zip`, skillName }
}
