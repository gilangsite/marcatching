// ==========================================================
// GOOGLE APPS SCRIPT - IMAGE UPLOAD TO DRIVE
// ==========================================================
// PENTING UNTUK DEPLOYMENT:
// 1. Pilih tombol biru "Deploy" di kanan atas > "New deployment"
// 2. Select type: "Web app"
// 3. Execute as: "Me (akun-kamu@gmail.com)" <--- INI SANGAT PENTING! JANGAN PILIH YANG LAIN!
// 4. Who has access: "Anyone" <--- INI JUGA PENTING AGAR APLIKASI BISA KIRIM GAMBAR!
// 5. Klik "Deploy"
// ==========================================================

// Folder ID Drive (Pastikan akun yang mendeploy punya akses Edit ke folder ini)
const FOLDER_ID = "1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA";

function doPost(e) {
  try {
    // Parser data dari Next.js (Website)
    const data = JSON.parse(e.postData.contents);
    
    // Konversi base64 kembali menjadi gambar (blob)
    const base64Data = data.base64.split(",")[1] || data.base64;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.filename);
    
    // Buka folder Google Drive kamu
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    // Buat/simpan file gambar ke dalam folder tersebut
    const file = folder.createFile(blob);
    
    // Ubah izin file agar "Siapa saja yang memiliki link bisa melihat" (Public)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Dapatkan ID dari file yang baru saja dibuat
    const fileId = file.getId();
    
    // Return sebagai URL gambar langsung (bisa di-load di tag <img> website)
    const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      url: directUrl,
      id: fileId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString() + " | Pastikan Deploy -> Execute As: Me"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS Pre-flight requests dari browser (Wajib ada)
function doOptions(e) {
  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Endpoint GET sederhana untuk ngetest URL Web App nyala atau nggak saat dibuka di browser
function doGet(e) {
  return ContentService.createTextOutput('✅ Web App Marcatching by Google Apps Script berjalan normal!')
    .setMimeType(ContentService.MimeType.TEXT);
}
