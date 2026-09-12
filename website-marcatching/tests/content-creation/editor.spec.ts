import { test, expect, type Page } from '@playwright/test'
import { loadEnvConfig } from '@next/env'
import { unzipSync } from 'fflate'
import { readFile } from 'node:fs/promises'

loadEnvConfig(process.cwd())
const baseURL = 'http://inside.localhost:3100'
const apiBaseURL = 'http://127.0.0.1:3100'
const localHostHeader = 'inside.localhost:3100'
const token = crypto.randomUUID()
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const projectIds = new Set<string>()
async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}
test.describe.configure({ mode: 'serial' })
test.beforeAll(async () => {
  const response = await fetch(`${supabaseURL}/rest/v1/admin_sessions`, { method: 'POST', headers: serviceHeaders, body: JSON.stringify({ session_token: token, device_name: 'Content Creation automated test', browser: 'Playwright', ip_address: '127.0.0.1' }) })
  if (!response.ok) throw new Error(`Could not create test admin session (${response.status})`)
})
test.afterAll(async ({ request }) => {
  for (const id of projectIds) {
    const response = await request.delete(`${apiBaseURL}/api/admin/content-creation?id=${id}`, { headers: { Host: localHostHeader, Cookie: `marcatching_admin_session=${token}` } })
    expect(response.ok(), `Cleanup project ${id}`).toBeTruthy()
  }
  await fetch(`${supabaseURL}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(token)}`, { method: 'DELETE', headers: serviceHeaders })
})
test('API denies anonymous users and rejects invalid documents', async ({ request }) => {
  for (const method of ['GET', 'PUT', 'DELETE', 'POST']) {
    const endpoint = method === 'POST' ? '/assets' : ''
    const response = await request.fetch(`${apiBaseURL}/api/admin/content-creation${endpoint}`, { method, headers: { Host: localHostHeader } })
    expect(response.status()).toBe(401)
  }
  const invalid = await request.put(`${apiBaseURL}/api/admin/content-creation`, { headers: { Host: localHostHeader, Cookie: `marcatching_admin_session=${token}` }, data: { ratio: '9:16', slides: [] } })
  expect(invalid.status()).toBe(400)
})
test('carousel edit, drag, resize, layers, ZIP, persistence and mobile layout', async ({ page }) => {
  test.setTimeout(180000)
  await page.context().addCookies([{ name: 'marcatching_admin_session', value: token, url: baseURL }])
  expect((await page.context().cookies(baseURL)).some(cookie => cookie.name === 'marcatching_admin_session' && cookie.value === token)).toBeTruthy()
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(baseURL)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30000 })
  await page.getByRole('button', { name: 'Content Creation', exact: true }).first().click()
  // The editor is intentionally code-split; development compilation can take a few seconds.
  const libraryHeading = page.getByRole('heading', { name: 'Content Creation', exact: true })
  await expect(libraryHeading).toBeVisible({ timeout: 30000 })
  expect(await libraryHeading.evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)')
  await page.screenshot({ path: 'tmp/content-creation-library.png', fullPage: true })
  await page.getByRole('button', { name: 'Buat project' }).click()
  await page.getByLabel('Nama project').fill('E2E disposable carousel')
  await page.getByRole('button', { name: 'Teks', exact: true }).click()
  await page.getByLabel('Isi teks', { exact: true }).fill('Cerita Marcatching\nMulai dari satu ide.')
  await choose(page, 'Font', 'DM Sans')
  await choose(page, 'Style teks', 'Bold Italic')
  await page.getByLabel('Ukuran font', { exact: true }).fill('72')
  await page.getByLabel('Ukuran font', { exact: true }).press('Tab')
  await expect(page.getByLabel('Slider ukuran font')).toHaveValue('72')
  const textArea = page.getByLabel('Isi teks', { exact: true })
  await textArea.evaluate((element: HTMLTextAreaElement) => { element.focus(); element.setSelectionRange(0, 6) })
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.getByRole('toolbar', { name: 'Format teks terpilih' })).toBeVisible()
  await page.screenshot({ path: 'tmp/content-creation-richtext.png', fullPage: true })
  const selectedBold = page.getByRole('button', { name: 'Bold teks terpilih' })
  await selectedBold.click()
  await expect(selectedBold).toHaveAttribute('aria-pressed', 'false')
  await page.getByLabel('Ukuran teks terpilih').fill('58')
  await page.getByLabel('Warna teks terpilih').fill('#c026d3')
  await page.screenshot({ path: 'tmp/content-creation-richtext-applied.png', fullPage: true })
  const draft = async () => page.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('marcatching:content-draft:v1:'))!
    return JSON.parse(localStorage.getItem(key)!)
  })
  await expect.poll(async () => JSON.stringify((await draft()).slides[0].elements[0].marks)).toContain('"bold":false')
  await choose(page, 'Alignment teks', 'Justify')
  await expect.poll(async () => JSON.stringify((await draft()).slides[0].elements[0].marks)).toContain('"bold":false')
  await expect.poll(async () => JSON.stringify((await draft()).slides[0].elements[0].marks)).toContain('"fontSize":58')
  await expect.poll(async () => JSON.stringify((await draft()).slides[0].elements[0].marks)).toContain('"color":"#c026d3"')
  // Deleting characters inside text input must never delete the selected element.
  await page.waitForTimeout(50)
  await textArea.evaluate((element: HTMLTextAreaElement) => { element.focus(); element.setSelectionRange(element.value.length, element.value.length) })
  await page.keyboard.press('Backspace')
  await expect(page.getByLabel('Font', { exact: true })).toBeVisible()
  await expect.poll(async () => JSON.stringify((await draft()).slides[0].elements[0].marks)).toContain('"bold":false')
  const document = await draft()
  projectIds.add(document.id)
  expect(document.slides[0].elements[0].align).toBe('justify')
  await page.getByRole('button', { name: 'Posisi tengah horizontal' }).click()
  await expect.poll(async () => (await draft()).slides[0].elements[0].x).toBeCloseTo((1080 - document.slides[0].elements[0].width) / 2, 1)
  const countBeforeDuplicate = (await draft()).slides[0].elements.length
  const canvas = page.getByLabel('Canvas slide.', { exact: false })
  const deviceScale = await page.evaluate(() => window.devicePixelRatio)
  const previewWidth = (await canvas.boundingBox())!.width
  await canvas.hover(); await page.keyboard.down('Control'); await page.mouse.wheel(0, -120); await page.keyboard.up('Control')
  await expect.poll(async () => Number(await page.getByLabel('Zoom canvas').inputValue())).toBeGreaterThan(100)
  await expect.poll(async () => (await canvas.boundingBox())!.width).toBeGreaterThan(previewWidth)
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(deviceScale)
  await page.getByLabel('Nilai zoom').fill('100')
  await expect(page.getByLabel('Zoom canvas')).toHaveValue('100')
  await canvas.focus(); await page.keyboard.press('Control+d')
  await expect.poll(async () => (await draft()).slides[0].elements.length).toBe(countBeforeDuplicate + 1)
  await page.keyboard.press('Control+z')
  await expect.poll(async () => (await draft()).slides[0].elements.length).toBe(countBeforeDuplicate)
  await page.getByRole('button', { name: /Cerita Marcatching/ }).last().click()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('No canvas bounds')
  const before = (await draft()).slides[0].elements[0]
  await page.mouse.move(box.x + (before.x + 60) / 1080 * box.width, box.y + (before.y + 40) / 1080 * box.height)
  await page.mouse.down(); await page.mouse.move(box.x + (before.x + 160) / 1080 * box.width, box.y + (before.y + 120) / 1080 * box.height, { steps: 4 }); await page.mouse.up()
  await expect.poll(async () => (await draft()).slides[0].elements[0].x).toBeGreaterThan(before.x + 50)
  const moved = (await draft()).slides[0].elements[0]
  await page.mouse.move(box.x + (moved.x + moved.width) / 1080 * box.width, box.y + (moved.y + moved.fontSize * 1.25 * 2) / 1080 * box.height)
  await page.mouse.down(); await page.mouse.move(box.x + (moved.x + moved.width - 120) / 1080 * box.width, box.y + (moved.y + moved.fontSize * 1.25 * 2 - 30) / 1080 * box.height, { steps: 4 }); await page.mouse.up()
  await expect.poll(async () => (await draft()).slides[0].elements[0].fontSize).toBeLessThan(72)
  const scaled = (await draft()).slides[0].elements[0]
  await page.mouse.move(box.x + (scaled.x + scaled.width) / 1080 * box.width, box.y + (scaled.y + scaled.fontSize * 1.25) / 1080 * box.height)
  await page.mouse.down(); await page.mouse.move(box.x + (scaled.x + scaled.width - 100) / 1080 * box.width, box.y + (scaled.y + scaled.fontSize * 1.25) / 1080 * box.height, { steps: 4 }); await page.mouse.up()
  await expect.poll(async () => (await draft()).slides[0].elements[0].width).toBeLessThan(scaled.width - 50)
  await expect.poll(async () => (await draft()).slides[0].elements[0].fontSize).toBeCloseTo(scaled.fontSize, 1)
  // Font selection, raster images, layering and background upload.
  for (const font of ['Poppins', 'Palatino', 'Classic']) await choose(page, 'Font', font)
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 80; c.height = 80
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#38a878'; ctx.fillRect(0, 0, 80, 80)
    return c.toDataURL().split(',')[1]
  })
  await page.getByRole('button', { name: 'Upload template' }).click({ noWaitAfter: true })
  await page.locator('input[type=file]').setInputFiles({ name: 'background.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await expect(page.getByRole('button', { name: 'Ganti background' })).toBeEnabled({ timeout: 30000 })
  await page.getByRole('button', { name: 'Gambar', exact: true }).click({ noWaitAfter: true })
  await page.locator('input[type=file]').setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await expect(page.getByLabel('Tinggi', { exact: true })).toBeEnabled({ timeout: 30000 })
  await page.getByRole('button', { name: 'Mundur', exact: true }).click()
  await expect.poll(async () => (await draft()).slides[0].elements[0].type).toBe('image')
  // Delete selected image from the canvas and restore it using undo.
  await canvas.focus(); await page.keyboard.press('Delete')
  await expect.poll(async () => (await draft()).slides[0].elements.length).toBe(1)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect.poll(async () => (await draft()).slides[0].elements.length).toBe(2)
  await page.getByRole('button', { name: 'Duplikat slide', exact: true }).click()
  await page.getByRole('button', { name: 'Tambah slide', exact: true }).click()
  await page.getByRole('button', { name: 'Teks', exact: true }).click()
  await page.getByLabel('Isi teks', { exact: true }).fill('Slide ketiga')
  await page.getByRole('button', { name: 'Geser slide sebelumnya', exact: true }).click()
  for (const ratio of ['9:16', '1:1', '16:9', '3:5', '3:4']) {
    await choose(page, 'Ratio project', ratio)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download semua', exact: true }).click()
    const download = await downloadPromise
    const contents = unzipSync(await readFile((await download.path())!))
    expect(Object.keys(contents)).toEqual(['slide-01.png', 'slide-02.png', 'slide-03.png'])
    const dims = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080], '3:5': [1080, 1800], '3:4': [1080, 1440] }[ratio]!
    for (const bytes of Object.values(contents)) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
      expect([view.getUint32(16), view.getUint32(20)]).toEqual(dims)
    }
  }
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Tersimpan di cloud' })).toBeVisible({ timeout: 30000 })
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const privateRead = await fetch(`${supabaseURL}/storage/v1/object/content-creation/projects/${document.id}.json`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } })
  expect(privateRead.ok, 'Project must not be readable using the public Supabase key').toBeFalsy()
  await page.getByRole('button', { name: 'Kembali ke project', exact: true }).click()
  await page.getByRole('button', { name: /E2E disposable carousel/ }).first().click()
  await expect(page.getByLabel('Nama project')).toHaveValue('E2E disposable carousel')
  await expect(page.getByRole('button', { name: 'Pilih slide 3', exact: true })).toBeVisible()
  await page.screenshot({ path: 'tmp/content-creation-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'tmp/content-creation-mobile.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  expect(errors).toEqual([])
})
