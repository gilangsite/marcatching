// Google Apps Script to upload image to Google Drive
// 1. Go to script.google.com
// 2. Create a new project, paste this code.
// 3. Deploy > New Deployment > Web App
// 4. Execute as: Me, Who has access: Anyone
// 5. Copy the Web App URL and place it in .env.local as NEXT_PUBLIC_APPS_SCRIPT_URL
// Folder ID: 1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // We expect base64 data, filename, and mimeType
    const base64Data = data.base64.split(",")[1] || data.base64;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.filename);
    
    // Change this to your exact folder ID
    const folderId = "1vuTdOt6_Xz4F6WQjf0KUD_B7ugT7eaFA";
    const folder = DriveApp.getFolderById(folderId);
    
    // Create the file in the folder
    const file = folder.createFile(blob);
    
    // Set file sharing to Anyone with the link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return the direct download/view URL
    // You can also use file.getDownloadUrl() or file.getUrl() depending on the need
    const fileId = file.getId();
    const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      url: directUrl,
      id: fileId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight CORS requests
function doOptions(e) {
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}
