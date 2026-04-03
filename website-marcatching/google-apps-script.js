// ==========================================================
// GOOGLE APPS SCRIPT - MARCATCHING (ALL-IN-ONE)
// Handles: Image Upload, Checkout Data to Sheets, Confirmation Email
// ==========================================================
// DEPLOYMENT:
// 1. Pilih tombol biru "Deploy" > "New deployment"
// 2. Select type: "Web app"
// 3. Execute as: "Me (akun-kamu@gmail.com)"
// 4. Who has access: "Anyone"
// 5. Klik "Deploy"
// ==========================================================

// Google Drive Folder ID for image uploads
const FOLDER_ID = "1rccC9WHU1dCmIeYFCrQUq2REG5MbITHu";

// Google Sheets ID for checkout data
const SPREADSHEET_ID = "14QTnyV8hCvuNIGVdgcUrN42NfPKmxqmCJhw61Tut870";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Route based on action type
    if (data.action === 'checkout') {
      return handleCheckout(data);
    } else if (data.action === 'upload') {
      return handleImageUpload(data);
    } else {
      // Default: treat as image upload (backward compatibility)
      return handleImageUpload(data);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── IMAGE UPLOAD ───────────────────────────────────────────
function handleImageUpload(data) {
  const base64Data = data.base64.split(",")[1] || data.base64;
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.filename);
  
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    url: directUrl,
    id: fileId
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── CHECKOUT: Save to Sheet + Send Email ───────────────────
function handleCheckout(data) {
  // 1. Save to Google Sheets
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
  // Check if header exists, if not create it
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Order ID', 'Product Name', 'Full Name', 'Email',
      'WhatsApp', 'Background', 'Referral Source', 'Voucher Code',
      'Original Price', 'Discounted Price', 'Voucher Discount',
      'Total Paid', 'Status'
    ]);
  }
  
  // Format currency for sheets
  function formatRp(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }
  
  sheet.appendRow([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    data.orderId || '-',
    data.productName || '-',
    data.fullName || '-',
    data.email || '-',
    data.whatsapp || '-',
    data.background || '-',
    data.referralSource || '-',
    data.voucherCode || '-',
    formatRp(data.priceOriginal || 0),
    formatRp(data.priceDiscounted || 0),
    formatRp(data.voucherDiscount || 0),
    formatRp(data.totalPaid || 0),
    data.status || 'pending'
  ]);
  
  // 2. Send Confirmation Email
  if (data.email) {
    try {
      sendConfirmationEmail(data);
    } catch (emailErr) {
      // Don't fail the whole request if email fails
      Logger.log('Email error: ' + emailErr.toString());
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Checkout data saved and email sent'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── CONFIRMATION EMAIL ─────────────────────────────────────
function sendConfirmationEmail(data) {
  var subject = '🎉 Pembayaran Sedang Dikonfirmasi — ' + (data.productName || 'Marcatching');
  
  var htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#0d3369;padding:32px 24px;text-align:center;">
        <img src="https://marcatching.vercel.app/logo-type-white.png" alt="Marcatching" style="height:32px;margin-bottom:12px;" />
        <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;">Pembayaran Sedang Dikonfirmasi</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="font-size:16px;color:#1a1a1a;margin:0 0 8px;">Halo <strong>${data.fullName || 'Pelanggan'}</strong>,</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.6;margin:0 0 24px;">
          Terima kasih telah melakukan checkout untuk produk <strong>${data.productName || '-'}</strong>. 
          Pembayaran kamu sedang dalam proses konfirmasi oleh tim Marcatching.
        </p>

        <!-- Order Details -->
        <div style="background:#f7fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="font-size:14px;color:#0d3369;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Detail Pembelian</h3>
          <table style="width:100%;font-size:14px;color:#2d3748;">
            <tr>
              <td style="padding:6px 0;color:#718096;">Produk</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;">${data.productName || '-'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#718096;">Nama</td>
              <td style="padding:6px 0;text-align:right;">${data.fullName || '-'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#718096;">Email</td>
              <td style="padding:6px 0;text-align:right;">${data.email || '-'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#718096;">WhatsApp</td>
              <td style="padding:6px 0;text-align:right;">${data.whatsapp || '-'}</td>
            </tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:12px 0 6px;color:#718096;">Total Pembayaran</td>
              <td style="padding:12px 0 6px;text-align:right;font-weight:700;font-size:18px;color:#0d3369;">Rp ${Number(data.totalPaid || 0).toLocaleString('id-ID')}</td>
            </tr>
          </table>
        </div>

        <p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 8px;">
          Kami akan segera menghubungi kamu via WhatsApp untuk konfirmasi pembayaran.
          Jika ada pertanyaan, silakan hubungi kami melalui email atau WhatsApp.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f7fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#a0aec0;margin:0;">© ${new Date().getFullYear()} Marcatching. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// Handle CORS Pre-flight requests
function doOptions(e) {
  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test endpoint
function doGet(e) {
  return ContentService.createTextOutput('✅ Web App Marcatching (All-in-One) berjalan normal!')
    .setMimeType(ContentService.MimeType.TEXT);
}
