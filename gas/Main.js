var DRIVE_FOLDER_ID = "1uj9sY9b74_Tzm-x_Uu6I4NqGCP2harxJ"; // Aapka Drive Folder ID

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ Yash Marketing Setup')
    .addItem('1. Automatic Trigger Setup Karein (Click Once)', 'createEditTrigger')
    .addToUi();
}

function createEditTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "installedOnEdit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("installedOnEdit")
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  SpreadsheetApp.getUi().alert("✅ Success: Yash Marketing setup poora ho gaya hai! Ab Column E ka box check karke notification bhej sakte hain.");
}

function installedOnEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  var sheetName = sheet.getName().toLowerCase();
  if ((sheetName === "announcements" || sheetName === "schemes") && range.getColumn() === 5) {
    var value = range.getValue();
    if (value === true || value === "TRUE" || value === "YES") {
      var row = range.getRow();
      var title = sheet.getRange(row, 2).getValue(); 
      var message = sheet.getRange(row, 3).getValue(); 
      if (title && message) {
        sendPushNotificationToOneSignal(title, message);
        range.setValue(false); 
      } else {
        range.setValue(false);
        SpreadsheetApp.getUi().alert("❌ Error: Column B (Title) aur Column C (Message) dono bhare hone chahiye!");
      }
    }
  }
}

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Yash Marketing App')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === "verifyDealer") return ContentService.createTextOutput(JSON.stringify(verifyDealer(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getProducts") return ContentService.createTextOutput(JSON.stringify(getProducts())).setMimeType(ContentService.MimeType.JSON);
    else if (action === "placeOrder") return ContentService.createTextOutput(JSON.stringify(saveOrder(payload.order))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getLedger") return ContentService.createTextOutput(JSON.stringify(getLedger(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getAnnouncements") return ContentService.createTextOutput(JSON.stringify(getAnnouncements())).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getDiscounts") return ContentService.createTextOutput(JSON.stringify(getDiscounts())).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getDealerOrders") return ContentService.createTextOutput(JSON.stringify(getDealerOrders(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getSchemes") return ContentService.createTextOutput(JSON.stringify(getSchemes())).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getWarrantyRules") return ContentService.createTextOutput(JSON.stringify(getWarrantyRules())).setMimeType(ContentService.MimeType.JSON);
    else if (action === "raiseReplacement") return ContentService.createTextOutput(JSON.stringify(raiseReplacement(payload))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "getReplacements") return ContentService.createTextOutput(JSON.stringify(getReplacements(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    else if (action === "logEvent") {
      try {
        var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Activity Logs");
        if(logSheet) {
          logSheet.appendRow([new Date(), payload.phone, payload.shopName, payload.event, payload.details]);
        }
      } catch(logErr) {} 
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Action not configured"})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================================
// FRONTEND MODULARIZATION HELPER
// =====================================================================
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
