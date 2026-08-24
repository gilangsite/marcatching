import 'server-only'

type ReceiptLine = {
  name: string
  amount: number
}

export type ReceiptData = {
  orderId: string
  midtransOrderId: string | null
  fullName: string
  email: string
  paidAt: string
  paymentType: string | null
  products: ReceiptLine[]
  voucherCode: string | null
  voucherDiscount: number
  totalPaid: number
}

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842

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

function formatRupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`
}

function formatPaidAt(value: string) {
  const date = new Date(value)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value || ''
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')} WIB`
}

function wrapText(value: string, maxLength: number) {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxLength) {
      current = next
    } else {
      if (current) lines.push(current)
      current = word.slice(0, maxLength)
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['-']
}

function textCommand(input: {
  x: number
  y: number
  text: string
  size: number
  bold?: boolean
  color?: [number, number, number]
}) {
  const [r, g, b] = input.color || [0.06, 0.09, 0.16]
  return `BT /${input.bold ? 'F2' : 'F1'} ${input.size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${input.x} ${input.y} Tm (${pdfSafe(input.text)}) Tj ET`
}

function buildPdf(content: string) {
  const contentLength = Buffer.byteLength(content, 'ascii')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    '<< /Title (Marcatching Payment Receipt) /Producer (Marcatching) >>',
  ]

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
  for (let index = 1; index <= objects.length; index += 1) {
    xrefRows.push(`${String(offsets[index]).padStart(10, '0')} 00000 n `)
  }
  chunks.push(Buffer.from(
    `xref\n0 ${objects.length + 1}\n${xrefRows.join('\n')}\n` +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`,
    'ascii',
  ))

  return Buffer.concat(chunks)
}

export function createReceiptPdf(data: ReceiptData) {
  const commands: string[] = []
  const navy: [number, number, number] = [0.05, 0.2, 0.41]
  const muted: [number, number, number] = [0.39, 0.45, 0.54]
  const green: [number, number, number] = [0.09, 0.5, 0.24]

  commands.push('1 1 1 rg 0 0 595 842 re f')
  commands.push(`${navy.join(' ')} rg 0 700 595 142 re f`)
  commands.push(textCommand({ x: 48, y: 792, text: 'MARCATCHING', size: 18, bold: true, color: [1, 1, 1] }))
  commands.push(textCommand({ x: 48, y: 754, text: 'BUKTI PEMBAYARAN', size: 25, bold: true, color: [1, 1, 1] }))
  commands.push(textCommand({ x: 48, y: 730, text: 'Pembayaran berhasil dan telah terverifikasi', size: 11, color: [0.82, 0.88, 0.95] }))

  commands.push('0.973 0.98 0.988 rg 44 608 507 66 re f')
  commands.push(textCommand({ x: 58, y: 650, text: 'ORDER ID', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 58, y: 630, text: data.midtransOrderId || data.orderId, size: 11, bold: true, color: navy }))
  commands.push(textCommand({ x: 330, y: 650, text: 'TANGGAL PEMBAYARAN', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 330, y: 630, text: formatPaidAt(data.paidAt), size: 11, bold: true }))

  commands.push(textCommand({ x: 48, y: 576, text: 'DITERBITKAN UNTUK', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 48, y: 555, text: data.fullName, size: 13, bold: true }))
  commands.push(textCommand({ x: 48, y: 537, text: data.email, size: 10, color: muted }))
  commands.push(textCommand({ x: 330, y: 576, text: 'METODE PEMBAYARAN', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 330, y: 555, text: data.paymentType || 'Midtrans', size: 12, bold: true }))

  commands.push(`${navy.join(' ')} RG 1 w 44 506 m 551 506 l S`)
  commands.push(textCommand({ x: 48, y: 482, text: 'DETAIL PEMBELIAN', size: 10, bold: true, color: navy }))

  let y = 452
  for (const product of data.products) {
    const lines = wrapText(product.name, 50)
    lines.forEach((line, index) => {
      commands.push(textCommand({ x: 58, y: y - (index * 14), text: line, size: 10.5, bold: index === 0 }))
    })
    commands.push(textCommand({ x: 438, y, text: formatRupiah(product.amount), size: 10.5, bold: true, color: navy }))
    y -= Math.max(32, lines.length * 14 + 14)
    commands.push('0.89 0.92 0.95 RG 0.6 w 58 ' + (y + 8) + ' m 537 ' + (y + 8) + ' l S')
  }

  if (data.voucherDiscount > 0) {
    commands.push(textCommand({ x: 58, y, text: `Voucher ${data.voucherCode || ''}`.trim(), size: 10, bold: true, color: green }))
    commands.push(textCommand({ x: 438, y, text: `-${formatRupiah(data.voucherDiscount)}`, size: 10, bold: true, color: green }))
    y -= 32
  }

  const totalBoxY = Math.max(138, y - 58)
  commands.push('0.94 0.97 1 rg 44 ' + totalBoxY + ' 507 52 re f')
  commands.push(textCommand({ x: 58, y: totalBoxY + 20, text: 'TOTAL PEMBAYARAN', size: 11, bold: true, color: navy }))
  commands.push(textCommand({ x: 417, y: totalBoxY + 17, text: formatRupiah(data.totalPaid), size: 16, bold: true, color: navy }))

  commands.push(textCommand({ x: 48, y: 88, text: 'Receipt ini diterbitkan otomatis oleh sistem Marcatching.', size: 9.5, color: muted }))
  commands.push(textCommand({ x: 48, y: 70, text: 'Simpan dokumen ini sebagai bukti pembayaran.', size: 9.5, color: muted }))
  commands.push(textCommand({ x: 48, y: 36, text: 'www.marcatching.com', size: 9, bold: true, color: navy }))
  commands.push(textCommand({ x: 444, y: 36, text: 'PAID', size: 11, bold: true, color: green }))

  return buildPdf(commands.join('\n'))
}

export type AffiliateReceiptData = {
  payoutId: string
  statementId: string
  affiliateName: string
  email: string
  periodStart: string
  periodEnd: string
  attributedRevenue: number
  grossCommission: number
  reversal: number
  adjustment: number
  taxWithheld: number
  transferFee: number
  netPayout: number
  commissionCount: number
  bankName: string
  accountName: string
  accountNumberLast4: string
  transferReference: string
  paidAt: string
}

export function createAffiliateReceiptPdf(data: AffiliateReceiptData) {
  const commands: string[] = []
  const navy: [number, number, number] = [0.05, 0.2, 0.41]
  const muted: [number, number, number] = [0.39, 0.45, 0.54]
  const green: [number, number, number] = [0.09, 0.5, 0.24]
  const rows: Array<[string, string, boolean?]> = [
    ['Penjualan teratribusi', formatRupiah(data.attributedRevenue)],
    ['Komisi bruto', formatRupiah(data.grossCommission)],
    ['Reversal / refund', `-${formatRupiah(data.reversal)}`],
    ['Penyesuaian', formatRupiah(data.adjustment)],
    ['Pajak dipotong', `-${formatRupiah(data.taxWithheld)}`],
    ['Biaya transfer', `-${formatRupiah(data.transferFee)}`],
    ['TOTAL DITERIMA', formatRupiah(data.netPayout), true],
  ]

  commands.push('1 1 1 rg 0 0 595 842 re f')
  commands.push(`${navy.join(' ')} rg 0 700 595 142 re f`)
  commands.push(textCommand({ x: 48, y: 792, text: 'MARCATCHING', size: 18, bold: true, color: [1, 1, 1] }))
  commands.push(textCommand({ x: 48, y: 754, text: 'SLIP KOMISI AFFILIATE', size: 24, bold: true, color: [1, 1, 1] }))
  commands.push(textCommand({ x: 48, y: 730, text: 'Payout telah ditransfer dan tercatat di ledger', size: 11, color: [0.82, 0.88, 0.95] }))

  commands.push('0.973 0.98 0.988 rg 44 608 507 66 re f')
  commands.push(textCommand({ x: 58, y: 650, text: 'PAYOUT ID', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 58, y: 630, text: data.payoutId, size: 10, bold: true, color: navy }))
  commands.push(textCommand({ x: 330, y: 650, text: 'TANGGAL TRANSFER', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 330, y: 630, text: formatPaidAt(data.paidAt), size: 10.5, bold: true }))

  commands.push(textCommand({ x: 48, y: 574, text: 'AFFILIATE', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 48, y: 553, text: data.affiliateName, size: 13, bold: true }))
  commands.push(textCommand({ x: 48, y: 535, text: data.email, size: 10, color: muted }))
  commands.push(textCommand({ x: 330, y: 574, text: 'PERIODE', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 330, y: 553, text: `${data.periodStart} s/d ${data.periodEnd}`, size: 10.5, bold: true }))
  commands.push(textCommand({ x: 330, y: 535, text: `${data.commissionCount} komisi`, size: 10, color: muted }))

  commands.push(`${navy.join(' ')} RG 1 w 44 504 m 551 504 l S`)
  let y = 474
  for (const [label, amount, total] of rows) {
    if (total) commands.push('0.94 0.97 1 rg 44 ' + (y - 13) + ' 507 38 re f')
    commands.push(textCommand({ x: 58, y, text: label, size: total ? 11 : 10, bold: total, color: total ? navy : muted }))
    commands.push(textCommand({ x: 420, y, text: amount, size: total ? 14 : 10.5, bold: true, color: total ? navy : [0.06, 0.09, 0.16] }))
    y -= total ? 48 : 31
  }

  commands.push(textCommand({ x: 48, y: 210, text: 'DETAIL TRANSFER', size: 9, bold: true, color: muted }))
  commands.push(textCommand({ x: 48, y: 188, text: `${data.bankName} - ${data.accountName} - **** ${data.accountNumberLast4}`, size: 11, bold: true }))
  commands.push(textCommand({ x: 48, y: 169, text: `Referensi: ${data.transferReference}`, size: 10, color: muted }))
  commands.push(textCommand({ x: 48, y: 105, text: 'Slip ini dibuat otomatis dari ledger Marcatching dan tidak menghapus riwayat saldo.', size: 9.5, color: muted }))
  commands.push(textCommand({ x: 48, y: 86, text: 'Banding ketidaksesuaian diajukan melalui course.marcatching.com/affiliate.', size: 9.5, color: muted }))
  commands.push(textCommand({ x: 48, y: 36, text: 'www.marcatching.com', size: 9, bold: true, color: navy }))
  commands.push(textCommand({ x: 430, y: 36, text: 'PAID', size: 11, bold: true, color: green }))
  return buildPdf(commands.join('\n'))
}
