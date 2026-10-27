/**
 * Shrinks a photo in the browser before upload: longest edge 1600px by default (1920 for portrait backgrounds), re-encoded as WebP (JPEG where the browser cannot
 * encode WebP, e.g. older Safari). Keeps uploads small enough for the request body limit and keeps the 100 MB quota
 * going a long way. EXIF rotation is applied by createImageBitmap, and animated GIFs become a still frame.
 */
const MAX_OUTPUT_BYTES = 3.8 * 1024 * 1024

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
}

export async function compressImage(file: File, maxEdge = 1600): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Foto ini tidak bisa dibaca. Gunakan file JPG, PNG, atau WebP.')
  }

  try {
    const steps = [[maxEdge, 0.85], [maxEdge, 0.7], [Math.round(maxEdge * 0.75), 0.7], [Math.round(maxEdge * 0.55), 0.6]] as const
    for (const [edge, quality] of steps) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Browser kamu belum mendukung kompres foto.')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      let blob = await toBlob(canvas, 'image/webp', quality)
      if (!blob || blob.type !== 'image/webp') {
        // No WebP encoder: JPEG has no transparency, so paint a white background first.
        context.globalCompositeOperation = 'destination-over'
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        blob = await toBlob(canvas, 'image/jpeg', quality)
      }
      if (blob && blob.size <= MAX_OUTPUT_BYTES) return blob
    }
  } finally {
    bitmap.close()
  }
  throw new Error('Foto terlalu besar bahkan setelah dikompres. Pilih foto lain.')
}
