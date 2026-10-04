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
  SpreadsheetApp.getUi().alert("✅ Success: Yash Marketing setup poora ho gaya hai! Announcements sheet mein 'Send Push Notification' checkbox tick karke push bhej sakte hain.");
}

function installedOnEdit(e) {
  if (!e || !e.range) return;
  var range = e.range;
  var sheet = range.getSheet();
  var sheetName = sheet.getName().toLowerCase();
  if (sheetName === "announcements") {
    sendAnnouncementPush_(sheet, range);
    return;
  }

  if (sheetName === "schemes" && range.getColumn() === 5 && isPushChecked_(range.getValue())) {
    var row = range.getRow();
    var title = sheet.getRange(row, 2).getDisplayValue().trim();
    var message = sheet.getRange(row, 3).getDisplayValue().trim();
    if (title && message && sendPushNotificationToOneSignal(title, message)) {
      range.setValue(false);
    }
  }
}

function sendAnnouncementPush_(sheet, range) {
  if (range.getRow() < 2 || !isPushChecked_(range.getValue())) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var pushColumn = findSheetHeaderColumn_(headers, ["send push notification"]);
  if (!pushColumn || range.getColumn() !== pushColumn) return;

  var titleColumn = findSheetHeaderColumn_(headers, ["title", "announcement title"]) || 1;
  var messageColumn = findSheetHeaderColumn_(headers, ["message", "announcement message"]) || 2;
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
    if (!isPushChecked_(sheet.getRange(range.getRow(), pushColumn).getValue())) return;

    var title = sheet.getRange(range.getRow(), titleColumn).getDisplayValue().trim();
    var message = sheet.getRange(range.getRow(), messageColumn).getDisplayValue().trim();
    if (!title || !message) {
      sheet.getRange(range.getRow(), pushColumn).setValue(false);
      sheet.getParent().toast("Push bhejne se pehle title aur message bharein.", "Announcement", 6);
      return;
    }

    if (sendPushNotificationToOneSignal(title, message)) {
      sheet.getRange(range.getRow(), pushColumn).setValue(false);
      sheet.getParent().toast("Push notification send ho gaya.", "Announcement", 5);
    } else {
      sheet.getParent().toast("Push send nahi hua. OneSignal API key check karke checkbox ko uncheck aur recheck karein.", "Announcement", 8);
    }
  } catch (error) {
    Logger.log("Announcement push failed: " + error.toString());
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function findSheetHeaderColumn_(headers, expectedHeaders) {
  var expected = expectedHeaders.map(function(header) {
    return header.toLowerCase().replace(/[^a-z0-9]/g, "");
  });
  for (var i = 0; i < headers.length; i++) {
    var normalized = String(headers[i] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (expected.indexOf(normalized) !== -1) return i + 1;
  }
  return 0;
}

function isPushChecked_(value) {
  return value === true || ["TRUE", "YES"].indexOf(String(value).toUpperCase()) !== -1;
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
