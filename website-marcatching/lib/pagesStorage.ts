import 'server-only'

import { randomUUID } from 'node:crypto'
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

/**
 * Public Cloudflare R2 bucket for member landing page photos (served from PAGES_R2_PUBLIC_URL).
 * Separate from the private Content Creation bucket in lib/content-creation/storage.ts.
 */
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
export type PageImageType = keyof typeof extensions

export function pagesStorageConfigured() {
  return Boolean(process.env.PAGES_R2_ACCOUNT_ID && process.env.PAGES_R2_ACCESS_KEY_ID && process.env.PAGES_R2_SECRET_ACCESS_KEY && process.env.PAGES_R2_BUCKET_NAME && process.env.PAGES_R2_PUBLIC_URL)
}

export function pagesPublicUrl() {
  return (process.env.PAGES_R2_PUBLIC_URL || '').trim().replace(/\/+$/, '')
}

let cached: S3Client | null = null
function client() {
  if (!pagesStorageConfigured()) throw new Error('Penyimpanan foto belum dikonfigurasi di server.')
  cached ||= new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.PAGES_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.PAGES_R2_ACCESS_KEY_ID!, secretAccessKey: process.env.PAGES_R2_SECRET_ACCESS_KEY! },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return cached
}

export async function putPageImage(userId: string, bytes: Buffer, contentType: PageImageType) {
  // Random name per upload: the URL never changes content, so it can be cached forever.
  const key = `pages/${userId}/${randomUUID()}.${extensions[contentType]}`
  await client().send(new PutObjectCommand({
    Bucket: process.env.PAGES_R2_BUCKET_NAME,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return { key, url: `${pagesPublicUrl()}/${key}` }
}

export async function deletePageObjects(keys: string[]) {
  for (let index = 0; index < keys.length; index += 1000) {
    await client().send(new DeleteObjectsCommand({
      Bucket: process.env.PAGES_R2_BUCKET_NAME,
      Delete: { Objects: keys.slice(index, index + 1000).map(Key => ({ Key })), Quiet: true },
    }))
  }
}
