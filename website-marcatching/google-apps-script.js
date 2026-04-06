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
const FOLDER_ID = "1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA";

// Google Drive Folder ID for PDF course materials (create a 'Course PDFs' subfolder)
const PDF_FOLDER_ID = "1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA"; // Change this to a separate folder if desired

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
    } else if (data.action === 'uploadPdf') {
      return handlePdfUpload(data);
    } else if (data.action === 'sendCourseEmail') {
      return handleSendCourseEmail(data);
    } else if (data.action === 'notifyAdmin') {
      return handleNotifyAdmin(data);
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

// ─── PDF UPLOAD (Course Materials) ─────────────────────────
function handlePdfUpload(data) {
  const base64Data = data.base64.split(",")[1] || data.base64;
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType || 'application/pdf', data.filename);
  
  const folder = DriveApp.getFolderById(PDF_FOLDER_ID);
  const file = folder.createFile(blob);
  // Set to anyone with link can VIEW (not download via direct URL)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  // Return the /file/d/ URL so frontend can build Google Drive preview embed
  const previewUrl = "https://drive.google.com/file/d/" + fileId + "/view";
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    url: previewUrl,
    id: fileId
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── SEND COURSE ACCESS EMAIL ───────────────────────────────
function handleSendCourseEmail(data) {
  if (!data.email) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: 'Email is required'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    sendCourseAccessEmail(data);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', message: 'Course access email sent'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── COURSE ACCESS EMAIL TEMPLATE ──────────────────────────
function sendCourseAccessEmail(data) {
  // Support multiple products (main + addons)
  var allProducts = data.allProducts || [{ name: data.productName || '-', priceOriginal: 0, priceDiscounted: 0 }];
  var productListForSubject = allProducts.map(function(p) { return p.name; }).join(', ');
  var subject = 'Akses E-Course Kamu Sudah Aktif — ' + productListForSubject;

  // Build product rows HTML
  var productRowsHtml = allProducts.map(function(p, i) {
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;">' +
        '<strong style="color:#111827;">' + (p.name || '-') + '</strong>' +
      '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;">' +
        (p.priceOriginal > 0 && p.priceOriginal !== p.priceDiscounted
          ? '<span style="text-decoration:line-through;color:#dc2626;margin-right:6px;">Rp ' + Number(p.priceOriginal).toLocaleString('id-ID') + '</span>'
          : '') +
        '<strong style="color:#0d3369;">Rp ' + Number(p.priceDiscounted).toLocaleString('id-ID') + '</strong>' +
      '</td>' +
    '</tr>';
  }).join('');

  var htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f5f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#111111;padding:36px 28px;text-align:center;">
        <img src="https://marcatching.vercel.app/logo-type-white.png" alt="Marcatching" style="height:30px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
        <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:800;">Akses E-Course Sudah Aktif!</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:8px 0 0;">Pembayaranmu telah dikonfirmasi</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 28px;">
        <p style="font-size:16px;color:#111827;margin:0 0 8px;">Halo <strong>${data.fullName || 'Member Marcatching'}</strong>!</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.7;margin:0 0 28px;">
          Selamat! Pembayaranmu sudah dikonfirmasi. Kamu sekarang bisa mengakses semua materi yang tersedia di Marcatching E-Course.
        </p>

        <!-- Course List Card -->
        <div style="background:#f8fafc;border-radius:14px;padding:20px 24px;margin-bottom:28px;border:1px solid #e2e8f0;">
          <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Course yang Kamu Dapatkan</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            ${productRowsHtml}
          </table>
        </div>

        <!-- How to access -->
        <div style="margin-bottom:28px;">
          <p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px;">Cara Mengakses E-Course:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="30" valign="top" style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                <div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">1</div>
              </td>
              <td valign="top" style="padding:12px 0 12px 10px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#4a5568; line-height:1.5;">
                Klik tombol di bawah untuk masuk ke halaman Marcatching E-Course
              </td>
            </tr>
            <tr>
              <td width="30" valign="top" style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                <div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">2</div>
              </td>
              <td valign="top" style="padding:12px 0 12px 10px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#4a5568; line-height:1.5;">
                Daftar akun menggunakan email <strong>${data.email || '-'}</strong> (email ini wajib digunakan)
              </td>
            </tr>
            <tr>
              <td width="30" valign="top" style="padding:12px 0;">
                <div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">3</div>
              </td>
              <td valign="top" style="padding:12px 0 12px 10px; font-size:13px; color:#4a5568; line-height:1.5;">
                Buat password kamu dan mulai belajar!
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin-bottom:28px;">
          <a href="https://marcatching.vercel.app/course/login" style="display:inline-block;background:#111111;color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
            Akses E-Course Sekarang
          </a>
        </div>

        <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;border-top:1px solid #f1f5f9;padding-top:20px;">
          Simpan email ini sebagai referensi. Jika ada kendala, hubungi kami melalui Instagram atau WhatsApp Marcatching.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Marcatching. All rights reserved.</p>
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

// ─── ADMIN NOTIFICATION EMAIL ──────────────────────────────
function handleNotifyAdmin(data) {
  try {
    sendAdminNotificationEmail(data);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', message: 'Admin notification sent'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendAdminNotificationEmail(data) {
  function formatRp(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  var allProducts = data.allProducts || [{ name: data.productName || '-', priceOriginal: 0, priceDiscounted: 0 }];
  var subject = 'Pembelian Baru: ' + allProducts.map(function(p) { return p.name; }).join(' + ') + ' — Marcatching';

  // Build product rows HTML for admin
  var productRowsHtml = allProducts.map(function(p) {
    return '<tr>' +
      '<td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;">Produk</td>' +
      '<td style="padding:7px 0;font-weight:600;color:#0d3369;border-bottom:1px solid #f1f5f9;">' + (p.name || '-') + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding:4px 0;color:#9ca3af;border-bottom:1px solid #f8fafc;font-size:12px;">Harga Asli</td>' +
      '<td style="padding:4px 0;font-size:12px;text-decoration:line-through;color:#dc2626;border-bottom:1px solid #f8fafc;">' + formatRp(p.priceOriginal || 0) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding:4px 0 10px;color:#9ca3af;border-bottom:1px solid #e2e8f0;font-size:12px;">Harga Diskon</td>' +
      '<td style="padding:4px 0 10px;font-size:12px;color:#111827;border-bottom:1px solid #e2e8f0;">' + formatRp(p.priceDiscounted || 0) + '</td>' +
    '</tr>';
  }).join('');

  var htmlBody = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f5f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09);">

      <!-- Header -->
      <div style="background:#0d3369;padding:28px 24px;text-align:center;">
        <img src="https://marcatching.vercel.app/logo-type-white.png" alt="Marcatching" style="height:28px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
        <h1 style="color:#ffffff;font-size:18px;margin:0;font-weight:700;">Ada Pembelian Baru!</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:6px 0 0;">Order masuk dari <strong style="color:#ffffff;">${data.fullName || '-'}</strong></p>
      </div>

      <!-- Body -->
      <div style="padding:28px 24px;">
        <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;">
          Halo Gilang, ada order baru yang masuk. Berikut detail pembeliannya:
        </p>

        <!-- Buyer Details -->
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <h3 style="font-size:12px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Data Pembeli</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:7px 0;color:#6b7280;width:40%;border-bottom:1px solid #f1f5f9;">Nama</td>
              <td style="padding:7px 0;font-weight:600;color:#111827;border-bottom:1px solid #f1f5f9;">${data.fullName || '-'}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;">Email</td>
              <td style="padding:7px 0;color:#111827;border-bottom:1px solid #f1f5f9;">${data.email || '-'}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;">WhatsApp</td>
              <td style="padding:7px 0;color:#111827;">${data.whatsapp || '-'}</td>
            </tr>
          </table>
        </div>

        <!-- Product Details -->
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <h3 style="font-size:12px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Produk yang Dibeli</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${productRowsHtml}
            ${data.voucherCode ? `
            <tr>
              <td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;">Voucher</td>
              <td style="padding:7px 0;color:#16a34a;border-bottom:1px solid #f1f5f9;">${data.voucherCode} (-${formatRp(data.voucherDiscount || 0)})</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding:12px 0 4px;color:#0d3369;font-weight:700;font-size:15px;">Total Bayar</td>
              <td style="padding:12px 0 4px;font-weight:800;font-size:18px;color:#0d3369;">${formatRp(data.totalPaid || 0)}</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="https://marcatching.vercel.app/admin?tab=orders" style="display:inline-block;background:#0d3369;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
            Buka Dashboard Admin - Orders
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Marcatching — Notifikasi Admin Otomatis</p>
      </div>
    </div>
  </body>
  </html>
  `;

  MailApp.sendEmail({
    to: 'marcatching.id@gmail.com',
    subject: subject,
    htmlBody: htmlBody
  });
}

// ─── CHECKOUT: Save to Sheet + Send Confirmation Email ─────
function handleCheckout(data) {
  // 1. Save to Google Sheets
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
  // Check if header exists, if not create it
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Order ID', 'Produk Utama', 'Add-On Products', 'Full Name', 'Email',
      'WhatsApp', 'Background', 'Referral Source', 'Voucher Code',
      'Harga Utama', 'Add-On Total', 'Subtotal', 'Voucher Discount',
      'Total Bayar', 'Status'
    ]);
  }
  
  function formatRp(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }
  
  var addons = data.addonItems || [];
  var addonNames = addons.map(function(a) { return a.name; }).join(', ') || '-';
  var subtotal = (data.priceDiscounted || 0) + (data.addonTotal || 0);

  sheet.appendRow([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    data.orderId || '-',
    data.productName || '-',
    addonNames,
    data.fullName || '-',
    data.email || '-',
    data.whatsapp || '-',
    data.background || '-',
    data.referralSource || '-',
    data.voucherCode || '-',
    formatRp(data.priceDiscounted || 0),
    formatRp(data.addonTotal || 0),
    formatRp(subtotal),
    formatRp(data.voucherDiscount || 0),
    formatRp(data.totalPaid || 0),
    data.status || 'pending'
  ]);
  
  // 2. Send Confirmation Email to buyer
  if (data.email) {
    try {
      sendConfirmationEmail(data);
    } catch (emailErr) {
      Logger.log('Buyer Email error: ' + emailErr.toString());
    }
  }

  // 3. Send Notification Email to Admin
  try {
    sendAdminNotificationEmail(data);
  } catch (adminErr) {
    Logger.log('Admin Email error: ' + adminErr.toString());
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Checkout data saved and email sent'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── CONFIRMATION EMAIL (to buyer) ─────────────────────────
function sendConfirmationEmail(data) {
  function formatRp(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  var allProducts = data.allProducts || [{ name: data.productName || '-', priceOriginal: 0, priceDiscounted: 0 }];
  var subject = 'Pembayaran Sedang Dikonfirmasi — ' + allProducts.map(function(p) { return p.name; }).join(' + ');

  // Build product rows for confirmation email
  var productRowsHtml = allProducts.map(function(p) {
    return '<tr>' +
      '<td style="padding:6px 0;color:#718096;">' + (p.name || '-') + '</td>' +
      '<td style="padding:6px 0;text-align:right;">' +
        (p.priceOriginal > 0 && p.priceOriginal !== p.priceDiscounted
          ? '<span style="text-decoration:line-through;color:#dc2626;font-size:12px;margin-right:6px;">' + formatRp(p.priceOriginal) + '</span>'
          : '') +
        '<strong>' + formatRp(p.priceDiscounted) + '</strong>' +
      '</td>' +
    '</tr>';
  }).join('');

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
          Terima kasih telah melakukan checkout! Pembayaran kamu sedang dalam proses konfirmasi oleh tim Marcatching.
        </p>

        <!-- Order Details -->
        <div style="background:#f7fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="font-size:14px;color:#0d3369;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Detail Pembelian</h3>
          <table style="width:100%;font-size:14px;color:#2d3748;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#718096;" colspan="2"><strong style="color:#374151;">Produk yang Dibeli</strong></td>
            </tr>
            ${productRowsHtml}
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="padding:6px 0;color:#718096;"></td>
              <td style="padding:6px 0;text-align:right;"></td>
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
            ${data.voucherCode ? `
            <tr>
              <td style="padding:6px 0;color:#718096;">Voucher</td>
              <td style="padding:6px 0;text-align:right;color:#16a34a;">${data.voucherCode} (-${formatRp(data.voucherDiscount || 0)})</td>
            </tr>
            ` : ''}
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
  return ContentService.createTextOutput('Web App Marcatching (All-in-One) berjalan normal!')
    .setMimeType(ContentService.MimeType.TEXT);
}
