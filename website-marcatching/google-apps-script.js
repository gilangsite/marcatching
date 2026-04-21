// ==========================================================
// GOOGLE APPS SCRIPT - MARCATCHING (ALL-IN-ONE)
// Handles: Image Upload, Checkout Data to Sheets, Emails
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

// Google Drive Folder ID for PDF course materials
const PDF_FOLDER_ID = "1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA";

// Google Sheets ID for checkout data
const SPREADSHEET_ID = "14QTnyV8hCvuNIGVdgcUrN42NfPKmxqmCJhw61Tut870";

// ─── GLOBAL RUPIAH FORMATTER ────────────────────────────────
// Apps Script V8 does NOT support toLocaleString('id-ID') reliably.
// Use this manual formatter everywhere instead.
function formatRupiah(num) {
  var n = Math.round(Number(num) || 0);
  var str = n.toString();
  var result = '';
  var count = 0;
  for (var i = str.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) result = '.' + result;
    result = str[i] + result;
    count++;
  }
  return 'Rp ' + result;
}

// Google Sheets ID for Finance tracking (income + cost sheets)
var FINANCE_SPREADSHEET_ID = '1TvV_dii3oNwrxUTv_B0Mx7H-mLYk0LeHpAWglyyBGl8';

// Column layout for Finance sheets:
// A: Date | B: Nominal | C: Category | D: Item | E: Details | F: Billing | G: Status | H: ID

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(rawData);
    
    // Route based on action type
    if (data.action === 'checkout') {
      return handleCheckout(data);
    } else if (data.action === 'upload') {
      return handleImageUpload(data);
    } else if (data.action === 'uploadPdf') {
      return handlePdfUpload(data);
    } else if (data.action === 'deleteFile') {
      return handleDeleteFile(data);
    } else if (data.action === 'sendCourseEmail') {
      return handleSendCourseEmail(data);
    } else if (data.action === 'notifyAdmin') {
      return handleNotifyAdmin(data);
    } else if (data.action === 'financeRead') {
      return handleFinanceRead(data);
    } else if (data.action === 'financeAdd') {
      return handleFinanceAdd(data);
    } else if (data.action === 'financeUpdate') {
      return handleFinanceUpdate(data);
    } else if (data.action === 'financeDelete') {
      return handleFinanceDelete(data);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Action "' + data.action + '" not recognized.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('Apps Script Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── IMAGE UPLOAD ───────────────────────────────────────────
function handleImageUpload(data) {
  var base64Data = data.base64.split(",")[1] || data.base64;
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.filename);
  
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  var directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    url: directUrl,
    id: fileId
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── PDF UPLOAD (Course Materials) ─────────────────────────
function handlePdfUpload(data) {
  var base64Data = data.base64.split(",")[1] || data.base64;
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType || 'application/pdf', data.filename);
  
  var folder = DriveApp.getFolderById(PDF_FOLDER_ID);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  var previewUrl = "https://drive.google.com/file/d/" + fileId + "/view";
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    url: previewUrl,
    id: fileId
  })).setMimeType(ContentService.MimeType.JSON);
}

// ─── FILE DELETION ──────────────────────────────────────────
function handleDeleteFile(data) {
  try {
    var url = data.url;
    var fileId = "";
    var matchId = url.match(/id=([^&]+)/);
    var matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    
    if (matchId && matchId[1]) {
      fileId = matchId[1];
    } else if (matchD && matchD[1]) {
      fileId = matchD[1];
    }
    
    if (fileId) {
      DriveApp.getFileById(fileId).setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "File deleted"
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid URL provided for deletion"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── SEND COURSE ACCESS EMAIL (called by /api/course-email) ─
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

// ─── COURSE ACCESS EMAIL (Akses Aktif - saat admin confirmed) ─
function sendCourseAccessEmail(data) {
  // Robustly build allProducts from whatever data arrives
  var allProducts;
  if (data.allProducts && data.allProducts.length > 0) {
    allProducts = data.allProducts;
  } else {
    allProducts = [{ name: data.productName || '-', priceOriginal: 0, priceDiscounted: 0 }];
    var addons = data.addonItems || [];
    for (var i = 0; i < addons.length; i++) {
      allProducts.push({ name: addons[i].name || '-', priceOriginal: addons[i].priceOriginal || 0, priceDiscounted: addons[i].priceDiscounted || 0 });
    }
  }

  var productNames = allProducts.map(function(p) { return p.name || '-'; });
  var subject = 'Akses E-Course Kamu Sudah Aktif — ' + productNames.join(', ');

  // Build product rows HTML
  var productRowsHtml = allProducts.map(function(p) {
    var origPrice = Number(p.priceOriginal || 0);
    var discPrice = Number(p.priceDiscounted || 0);
    var strikeHtml = (origPrice > 0 && origPrice !== discPrice)
      ? '<span style="text-decoration:line-through;color:#dc2626;margin-right:6px;">' + formatRupiah(origPrice) + '</span>'
      : '';
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;">' +
        '<strong style="color:#111827;">' + (p.name || '-') + '</strong>' +
      '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;">' +
        strikeHtml +
        '<strong style="color:#0d3369;">' + formatRupiah(discPrice) + '</strong>' +
      '</td>' +
    '</tr>';
  }).join('');

  var fullName = data.fullName || 'Member Marcatching';
  var email = data.email || '-';

  var htmlBody = '<!DOCTYPE html>' +
  '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
  '<body style="margin:0;padding:0;background:#f5f6fa;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
    '<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);">' +
      
      '<div style="background:#111111;padding:36px 28px;text-align:center;">' +
        '<img src="https://www.marcatching.com/logo-type-white.png" alt="Marcatching" style="height:30px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />' +
        '<h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:800;">Akses E-Course Sudah Aktif!</h1>' +
        '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:8px 0 0;">Pembayaranmu telah dikonfirmasi</p>' +
      '</div>' +

      '<div style="padding:36px 28px;">' +
        '<p style="font-size:16px;color:#111827;margin:0 0 8px;">Halo <strong>' + fullName + '</strong>!</p>' +
        '<p style="font-size:14px;color:#4a5568;line-height:1.7;margin:0 0 28px;">' +
          'Selamat! Pembayaranmu sudah dikonfirmasi. Kamu sekarang bisa mengakses semua materi yang tersedia di Marcatching E-Course.' +
        '</p>' +

        '<div style="background:#f8fafc;border-radius:14px;padding:20px 24px;margin-bottom:28px;border:1px solid #e2e8f0;">' +
          '<div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Course yang Kamu Dapatkan</div>' +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
            productRowsHtml +
          '</table>' +
        '</div>' +

        '<div style="margin-bottom:28px;">' +
          '<p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px;">Cara Mengakses E-Course:</p>' +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
            '<tr>' +
              '<td width="30" valign="top" style="padding:12px 0;border-bottom:1px solid #f1f5f9;">' +
                '<div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">1</div>' +
              '</td>' +
              '<td valign="top" style="padding:12px 0 12px 10px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#4a5568;line-height:1.5;">' +
                'Klik tombol di bawah untuk masuk ke halaman Marcatching E-Course' +
              '</td>' +
            '</tr>' +
            '<tr>' +
              '<td width="30" valign="top" style="padding:12px 0;border-bottom:1px solid #f1f5f9;">' +
                '<div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">2</div>' +
              '</td>' +
              '<td valign="top" style="padding:12px 0 12px 10px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#4a5568;line-height:1.5;">' +
                'Daftar akun menggunakan email <strong>' + email + '</strong> (email ini wajib digunakan)' +
              '</td>' +
            '</tr>' +
            '<tr>' +
              '<td width="30" valign="top" style="padding:12px 0;">' +
                '<div style="background:#111111;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;">3</div>' +
              '</td>' +
              '<td valign="top" style="padding:12px 0 12px 10px;font-size:13px;color:#4a5568;line-height:1.5;">' +
                'Buat password kamu dan mulai belajar!' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</div>' +

        '<div style="text-align:center;margin-bottom:28px;">' +
          '<a href="https://course.marcatching.com/login" style="display:inline-block;background:#111111;color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">' +
            'Akses E-Course Sekarang' +
          '</a>' +
        '</div>' +

        '<p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;border-top:1px solid #f1f5f9;padding-top:20px;">' +
          'Simpan email ini sebagai referensi. Jika ada kendala, hubungi kami melalui Instagram atau WhatsApp Marcatching.' +
        '</p>' +
      '</div>' +

      '<div style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">' +
        '<p style="font-size:12px;color:#94a3b8;margin:0;">&copy; ' + new Date().getFullYear() + ' Marcatching. All rights reserved.</p>' +
      '</div>' +
    '</div>' +
  '</body></html>';
  
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ─── ADMIN NOTIFICATION EMAIL ───────────────────────────────
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
  // Robustly build allProducts
  var allProducts;
  if (data.allProducts && data.allProducts.length > 0) {
    allProducts = data.allProducts;
  } else {
    allProducts = [{ name: data.productName || '-', priceOriginal: data.priceOriginal || 0, priceDiscounted: data.priceDiscounted || 0 }];
    var addonsForAdmin = data.addonItems || [];
    for (var j = 0; j < addonsForAdmin.length; j++) {
      allProducts.push({ name: addonsForAdmin[j].name || '-', priceOriginal: addonsForAdmin[j].priceOriginal || 0, priceDiscounted: addonsForAdmin[j].priceDiscounted || 0 });
    }
  }

  var subject = 'Pembelian Baru: ' + allProducts.map(function(p) { return p.name; }).join(' + ') + ' — Marcatching';

  // Build product rows HTML for admin
  var productRowsHtml = allProducts.map(function(p, i) {
    return '<tr>' +
      '<td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;" colspan="2">' + (i + 1) + '. <strong style="color:#0d3369;">' + (p.name || '-') + '</strong></td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding:4px 0;color:#9ca3af;font-size:12px;">Harga Asli</td>' +
      '<td style="padding:4px 0;font-size:12px;text-align:right;text-decoration:line-through;color:#dc2626;">' + formatRupiah(p.priceOriginal || 0) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td style="padding:4px 0 10px;color:#9ca3af;border-bottom:1px solid #e2e8f0;font-size:12px;">Harga Diskon</td>' +
      '<td style="padding:4px 0 10px;font-size:12px;text-align:right;color:#111827;border-bottom:1px solid #e2e8f0;">' + formatRupiah(p.priceDiscounted || 0) + '</td>' +
    '</tr>';
  }).join('');

  var voucherRow = data.voucherCode
    ? '<tr><td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;">Voucher</td><td style="padding:7px 0;color:#16a34a;border-bottom:1px solid #f1f5f9;">' + data.voucherCode + ' (-' + formatRupiah(data.voucherDiscount || 0) + ')</td></tr>'
    : '';

  var htmlBody = '<!DOCTYPE html>' +
  '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
  '<body style="margin:0;padding:0;background:#f5f6fa;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
    '<div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09);">' +

      '<div style="background:#0d3369;padding:28px 24px;text-align:center;">' +
        '<img src="https://www.marcatching.com/logo-type-white.png" alt="Marcatching" style="height:28px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
        '<h1 style="color:#ffffff;font-size:18px;margin:0;font-weight:700;">Ada Pembelian Baru!</h1>' +
        '<p style="color:rgba(255,255,255,0.75);font-size:13px;margin:6px 0 0;">Order masuk dari <strong style="color:#ffffff;">' + (data.fullName || '-') + '</strong></p>' +
      '</div>' +

      '<div style="padding:28px 24px;">' +
        '<p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;">Halo Gilang, ada order baru yang masuk. Berikut detail pembeliannya:</p>' +

        '<div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">' +
          '<h3 style="font-size:12px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Data Pembeli</h3>' +
          '<table style="width:100%;font-size:14px;border-collapse:collapse;">' +
            '<tr><td style="padding:7px 0;color:#6b7280;width:40%;border-bottom:1px solid #f1f5f9;">Nama</td><td style="padding:7px 0;font-weight:600;color:#111827;border-bottom:1px solid #f1f5f9;">' + (data.fullName || '-') + '</td></tr>' +
            '<tr><td style="padding:7px 0;color:#6b7280;border-bottom:1px solid #f1f5f9;">Email</td><td style="padding:7px 0;color:#111827;border-bottom:1px solid #f1f5f9;">' + (data.email || '-') + '</td></tr>' +
            '<tr><td style="padding:7px 0;color:#6b7280;">WhatsApp</td><td style="padding:7px 0;color:#111827;">' + (data.whatsapp || '-') + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">' +
          '<h3 style="font-size:12px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Produk yang Dibeli</h3>' +
          '<table style="width:100%;font-size:14px;border-collapse:collapse;">' +
            productRowsHtml +
            voucherRow +
            '<tr><td style="padding:12px 0 4px;color:#0d3369;font-weight:700;font-size:15px;">Total Bayar</td><td style="padding:12px 0 4px;font-weight:800;font-size:18px;color:#0d3369;text-align:right;">' + formatRupiah(data.totalPaid || 0) + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<div style="text-align:center;margin-bottom:8px;">' +
          '<a href="https://www.marcatching.com/admin?tab=orders" style="display:inline-block;background:#0d3369;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">Buka Dashboard Admin - Orders</a>' +
        '</div>' +
      '</div>' +

      '<div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">' +
        '<p style="font-size:12px;color:#94a3b8;margin:0;">&copy; ' + new Date().getFullYear() + ' Marcatching — Notifikasi Admin Otomatis</p>' +
      '</div>' +
    '</div>' +
  '</body></html>';

  try {
    MailApp.sendEmail({
      to: 'marcatching.id@gmail.com',
      replyTo: data.email || '',
      name: 'Sistem Pembelian Marcatching',
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log('Admin Email error: ' + e.toString());
  }
}

// ─── CHECKOUT: Save to Sheet + Send Both Emails ─────────────
function handleCheckout(data) {
  // 1. Save to Google Sheets
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Order ID', 'Produk Utama', 'Add-On Products', 'Full Name', 'Email',
      'WhatsApp', 'Background', 'Referral Source', 'Voucher Code',
      'Harga Utama', 'Add-On Total', 'Subtotal', 'Voucher Discount',
      'Total Bayar', 'Status'
    ]);
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
    formatRupiah(data.priceDiscounted || 0),
    formatRupiah(data.addonTotal || 0),
    formatRupiah(subtotal),
    formatRupiah(data.voucherDiscount || 0),
    formatRupiah(data.totalPaid || 0),
    data.status || 'pending'
  ]);
  
  // 2. Send Confirmation Email to buyer (pembayaran sedang dikonfirmasi)
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

// ─── CONFIRMATION EMAIL (to buyer, saat checkout) ────────────
function sendConfirmationEmail(data) {
  // Robustly build allProducts from whatever arrives
  var allProducts;
  if (data.allProducts && data.allProducts.length > 0) {
    allProducts = data.allProducts;
  } else {
    allProducts = [{ name: data.productName || '-', priceOriginal: data.priceOriginal || 0, priceDiscounted: data.priceDiscounted || 0 }];
    var addonsConf = data.addonItems || [];
    for (var k = 0; k < addonsConf.length; k++) {
      allProducts.push({ name: addonsConf[k].name || '-', priceOriginal: addonsConf[k].priceOriginal || 0, priceDiscounted: addonsConf[k].priceDiscounted || 0 });
    }
  }

  var subject = 'Pembayaran Sedang Dikonfirmasi — ' + allProducts.map(function(p) { return p.name; }).join(' + ');

  var productListHtml = allProducts.map(function(p) { return p.name || '-'; }).join('<br>');

  var voucherRowConf = data.voucherCode
    ? '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;">Voucher</td><td style="padding:6px 0;color:#16a34a;">' + data.voucherCode + ' (-' + formatRupiah(data.voucherDiscount || 0) + ')</td></tr>'
    : '';

  var fullName = data.fullName || 'Pelanggan';

  var htmlBody = '<!DOCTYPE html>' +
  '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
  '<body style="margin:0;padding:0;background:#f8f9fa;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
    '<div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
      
      '<div style="background:#0d3369;padding:32px 24px;text-align:center;">' +
        '<img src="https://www.marcatching.com/logo-type-white.png" alt="Marcatching" style="height:32px;margin-bottom:12px;" />' +
        '<h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;">Pembayaran Sedang Dikonfirmasi</h1>' +
      '</div>' +

      '<div style="padding:32px 24px;">' +
        '<p style="font-size:16px;color:#1a1a1a;margin:0 0 8px;">Halo <strong>' + fullName + '</strong>,</p>' +
        '<p style="font-size:14px;color:#4a5568;line-height:1.6;margin:0 0 24px;">' +
          'Terima kasih telah melakukan checkout untuk produk <strong>' + (data.productName || '-') + '</strong>. Pembayaran kamu sedang dalam proses konfirmasi oleh tim Marcatching.' +
        '</p>' +

        '<div style="background:#f7fafc;border-radius:12px;padding:20px;margin-bottom:24px;">' +
          '<h3 style="font-size:14px;color:#0d3369;margin:0 0 16px;">Detail Pembelian:</h3>' +
          '<table style="width:100%;font-size:14px;color:#2d3748;border-collapse:collapse;">' +
            '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;width:35%;">Produk</td><td style="padding:6px 0;font-weight:600;color:#111827;line-height:1.6;">' + productListHtml + '</td></tr>' +
            '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;">Nama</td><td style="padding:6px 0;color:#111827;">' + (data.fullName || '-') + '</td></tr>' +
            '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;">Email</td><td style="padding:6px 0;color:#111827;">' + (data.email || '-') + '</td></tr>' +
            '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;">WhatsApp</td><td style="padding:6px 0;color:#111827;">' + (data.whatsapp || '-') + '</td></tr>' +
            voucherRowConf +
            '<tr><td style="padding:6px 0;padding-right:20px;color:#718096;vertical-align:top;">Total Pembayaran</td><td style="padding:6px 0;font-weight:700;color:#111827;">' + formatRupiah(data.totalPaid || 0) + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 8px;">' +
          'Kami akan segera menghubungi kamu via WhatsApp untuk konfirmasi pembayaran. Jika ada pertanyaan, silakan hubungi kami melalui email atau WhatsApp.' +
        '</p>' +
      '</div>' +

      '<div style="background:#f7fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">' +
        '<p style="font-size:12px;color:#a0aec0;margin:0;">&copy; ' + new Date().getFullYear() + ' Marcatching. All rights reserved.</p>' +
      '</div>' +
    '</div>' +
  '</body></html>';
  
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

// ─── FINANCE HELPERS ─────────────────────────────────────────

/**
 * Ensure headers exist and return the sheet.
 * sheetType: 'income' | 'cost'
 */
function getFinanceSheet(sheetType) {
  var ss = SpreadsheetApp.openById(FINANCE_SPREADSHEET_ID);
  // Match sheet name case-insensitively just in case
  var sheets = ss.getSheets();
  var target = sheetType.toLowerCase().trim();
  var sheet = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().trim() === target) {
      sheet = sheets[i];
      break;
    }
  }
  
  if (!sheet) {
    throw new Error('Sheet "' + sheetType + '" tidak ditemukan. Pastikan ada tab bernama "income" atau "cost".');
  }
  // Add header row if the sheet is completely empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Nominal', 'Category', 'Item', 'Details', 'Billing', 'Status', 'ID']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0d3369').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ─── READ all rows ───────────────────────────────────────────
function handleFinanceRead(data) {
  try {
    var sheet = getFinanceSheet(data.sheetType);
    var lastRow = sheet.getLastRow();
    var rows = [];

    if (lastRow > 1) {
      var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (!row[7]) continue; // skip rows without ID (blank rows)
        // Date might be a Date object from Sheets — convert to ISO string
        var rawDate = row[0];
        var dateStr = '';
        if (rawDate instanceof Date) {
          var yr = rawDate.getFullYear();
          var mo = String(rawDate.getMonth() + 1).padStart(2, '0');
          var dy = String(rawDate.getDate()).padStart(2, '0');
          dateStr = yr + '-' + mo + '-' + dy;
        } else {
          dateStr = String(rawDate);
        }
        rows.push({
          date:     dateStr,
          nominal:  Number(row[1]) || 0,
          category: String(row[2] || ''),
          item:     String(row[3] || ''),
          details:  String(row[4] || ''),
          billing:  String(row[5] || ''),
          status:   String(row[6] || ''),
          id:       String(row[7])
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', rows: rows
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', rows: [], message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── ADD a new row ───────────────────────────────────────────
function handleFinanceAdd(data) {
  try {
    var sheet = getFinanceSheet(data.sheetType);
    var id = Utilities.getUuid();
    sheet.appendRow([
      data.date     || '',
      Number(data.nominal) || 0,
      data.category || '',
      data.item     || '',
      data.details  || '',
      data.billing  || '',
      data.status   || '',
      id
    ]);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', id: id
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── UPDATE an existing row (find by ID, update in-place) ────
function handleFinanceUpdate(data) {
  try {
    var sheet = getFinanceSheet(data.sheetType);
    var lastRow = sheet.getLastRow();
    var found = false;

    if (lastRow > 1) {
      var ids = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(data.id)) {
          var rowNum = i + 2;
          sheet.getRange(rowNum, 1, 1, 7).setValues([[
            data.date     || '',
            Number(data.nominal) || 0,
            data.category || '',
            data.item     || '',
            data.details  || '',
            data.billing  || '',
            data.status   || ''
          ]]);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error', message: 'Row dengan ID ' + data.id + ' tidak ditemukan.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── DELETE a row by ID ─────────────────────────────────────
function handleFinanceDelete(data) {
  try {
    var sheet = getFinanceSheet(data.sheetType);
    var lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      var ids = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]) === String(data.id)) {
          sheet.deleteRow(i + 2);
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: 'Row dengan ID ' + data.id + ' tidak ditemukan.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
