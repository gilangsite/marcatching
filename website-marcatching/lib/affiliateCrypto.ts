import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

function encryptionKey() {
  const raw = process.env.AFFILIATE_DATA_ENCRYPTION_KEY || ''
  const key = /^[a-f\d]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error('Affiliate data encryption key must be 32 bytes')
  return key
}

export function encryptAffiliateSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`
}

export function decryptAffiliateSecret(value: string) {
  const [version, ivValue, tagValue, encryptedValue] = value.split('.')
  if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
    throw new Error('Unsupported affiliate ciphertext')
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivValue, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export function lastFour(value: string) {
  const compact = value.replace(/\s+/g, '')
  return compact.slice(-4)
}
