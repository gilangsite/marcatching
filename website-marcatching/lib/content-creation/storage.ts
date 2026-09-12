import 'server-only'
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { MAX_IMAGE_BYTES, MAX_PROJECT_BYTES, type Project, type ProjectSummary, parseProject, summary } from './model'

const BUCKET = 'content-creation'
let bucketReady: Promise<void> | undefined
export function imageProvider(): 'r2' | 'supabase' {
  const values = [process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, process.env.R2_BUCKET_NAME]
  if (values.some(Boolean) && !values.every(Boolean)) throw new Error('Konfigurasi R2 belum lengkap. Isi keempat variabel R2.')
  return values.every(Boolean) ? 'r2' : 'supabase'
}
function r2() {
  if (imageProvider() !== 'r2') throw new Error('R2 belum dikonfigurasi.')
  return new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' })
}
async function bucket() {
  if (!bucketReady) bucketReady = (async () => {
    const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET)
    if (data) { if (data.public) throw new Error('Bucket content-creation harus private.'); return }
    if (error && !['404', '400'].includes(String(error.statusCode))) throw new Error('Penyimpanan project tidak tersedia.')
    const created = await supabaseAdmin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: Math.max(MAX_IMAGE_BYTES, MAX_PROJECT_BYTES), allowedMimeTypes: ['application/json', 'image/png', 'image/jpeg', 'image/webp'] })
    if (created.error) {
      const retry = await supabaseAdmin.storage.getBucket(BUCKET)
      if (!retry.data || retry.data.public) throw new Error('Gagal menyiapkan penyimpanan project private.')
    }
  })().catch(e => { bucketReady = undefined; throw e })
  await bucketReady
  return supabaseAdmin.storage.from(BUCKET)
}
export async function listProjects(offset = 0): Promise<ProjectSummary[]> {
  const store = await bucket()
  const { data, error } = await store.list('projects', { limit: 25, offset, sortBy: { column: 'updated_at', order: 'desc' } })
  if (error) throw new Error('Gagal memuat daftar project.')
  return Promise.all((data || []).filter(f => f.name.endsWith('.json')).map(async f => summary(await readProject(f.name.replace('.json', '')))))
}
export async function readProject(id: string): Promise<Project> {
  const store = await bucket()
  const { data, error } = await store.download(`projects/${id}.json`)
  if (error || !data) throw new Error('Project tidak ditemukan atau tidak dapat dibaca.')
  return parseProject(await data.text().then(JSON.parse))
}
export async function saveProject(project: Project) {
  const store = await bucket()
  const saved = { ...project, updatedAt: new Date().toISOString() }
  const { error } = await store.upload(`projects/${project.id}.json`, JSON.stringify(saved), { contentType: 'application/json', upsert: true, cacheControl: '0' })
  if (error) throw new Error('Gagal menyimpan project. Coba lagi.')
  return saved
}
export async function putImage(projectId: string, body: Uint8Array, extension: string, contentType: string) {
  const provider = imageProvider()
  const key = `${projectId}/${crypto.randomUUID()}.${extension}`
  if (provider === 'r2') await r2().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: `content-creation/${key}`, Body: body, ContentType: contentType }))
  else {
    const store = await bucket()
    const { error } = await store.upload(`assets/${key}`, body, { contentType, upsert: false })
    if (error) throw new Error('Gagal mengunggah gambar.')
  }
  return `${provider}/${key}`
}
export async function readImage(asset: string) {
  const [provider, ...parts] = asset.split('/')
  const key = parts.join('/')
  if (provider === 'r2') {
    const response = await r2().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: `content-creation/${key}` }))
    if (!response.Body) throw new Error('Gambar tidak ditemukan.')
    return new Uint8Array(await response.Body.transformToByteArray())
  }
  const store = await bucket()
  const { data, error } = await store.download(`assets/${key}`)
  if (error || !data) throw new Error('Gambar tidak ditemukan.')
  return new Uint8Array(await data.arrayBuffer())
}
// Keep removed images until project deletion: undo and older local drafts may still reference them.
export async function deleteProject(id: string) {
  const store = await bucket()
  let offset = 0
  const paths: string[] = []
  while (true) {
    const { data, error } = await store.list(`assets/${id}`, { limit: 1000, offset })
    if (error) throw new Error('Gagal memuat aset project.')
    paths.push(...(data || []).map(f => `assets/${id}/${f.name}`))
    if (!data || data.length < 1000) break
    offset += data.length
  }
  // Also clean R2 objects even when no longer referenced by the latest document.
  if (imageProvider() === 'r2') {
    const client = r2()
    let token: string | undefined
    do {
      const result = await client.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, Prefix: `content-creation/${id}/`, ContinuationToken: token }))
      if (result.Contents?.length) {
        const deleted = await client.send(new DeleteObjectsCommand({ Bucket: process.env.R2_BUCKET_NAME, Delete: { Objects: result.Contents.map(o => ({ Key: o.Key! })) } }))
        if (deleted.Errors?.length) throw new Error('Sebagian gambar belum terhapus. Coba lagi.')
      }
      token = result.NextContinuationToken
    } while (token)
  }
  for (let i = 0; i < paths.length; i += 1000) {
    const { error } = await store.remove(paths.slice(i, i + 1000))
    if (error) throw new Error('Gagal menghapus gambar project.')
  }
  const { error } = await store.remove([`projects/${id}.json`])
  if (error) throw new Error('Gagal menghapus project.')
}
