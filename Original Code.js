// =====================================================================
// 1. SETUP MENU & INSTALLABLE TRIGGERS (AUTOMATED ONE-CLICK SETUP)
// =====================================================================

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

function sendPushNotificationToOneSignal(title, message) {
  var appId = "73a96bf6-8439-4452-b6ae-53d97d28c89f"; 
  var apiKey = "73a96bf6-8439-4452-b6ae-53d97d28c89f"; 
  
  var payload = {
    "app_id": appId,
    "included_segments": ["All"],
    "headings": {"en": title},
    "contents": {"en": message}
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Basic " + apiKey
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch("https://onesignal.com/api/v1/notifications", options);
    Logger.log(response.getContentText());
  } catch (err) {
    Logger.log("Push failed: " + err.toString());
  }
}

// =====================================================================
// 2. MAIN WEB APP ROUTING GATEWAY (doGet & doPost)
// =====================================================================

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

    if (action === "verifyDealer") {
      return ContentService.createTextOutput(JSON.stringify(verifyDealer(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getProducts") {
      return ContentService.createTextOutput(JSON.stringify(getProducts())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "placeOrder") {
      return ContentService.createTextOutput(JSON.stringify(saveOrder(payload.order))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getLedger") {
      return ContentService.createTextOutput(JSON.stringify(getLedger(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getAnnouncements") {
      return ContentService.createTextOutput(JSON.stringify(getAnnouncements())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getDiscounts") {
      return ContentService.createTextOutput(JSON.stringify(getDiscounts())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getDealerOrders") {
      return ContentService.createTextOutput(JSON.stringify(getDealerOrders(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getSchemes") {
      return ContentService.createTextOutput(JSON.stringify(getSchemes())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getWarrantyRules") {
      return ContentService.createTextOutput(JSON.stringify(getWarrantyRules())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "raiseReplacement") {
      return ContentService.createTextOutput(JSON.stringify(raiseReplacement(payload))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getReplacements") {
      return ContentService.createTextOutput(JSON.stringify(getReplacements(payload.phone))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "logEvent") {
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
// 3. REPLACEMENT SYSTEM FUNCTIONS
// =====================================================================

function getWarrantyRules() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("WarrantyRules");
    
    if (!sheet) {
      return { success: true, data: [
        "Physically damaged, burnt or water-damaged products will NOT be accepted.",
        "Original box with visible barcode/serial number is mandatory for replacement.",
        "Piece-to-piece replacement depends on brand policy and technical verification."
      ]};
    }
    
    var data = sheet.getDataRange().getValues();
    var rules = [];
    for(var i=1; i<data.length; i++) {
      if(data[i][0] && data[i][0].toString().trim() !== "") {
        rules.push(data[i][0].toString().trim());
      }
    }
    return { success: true, data: rules.length > 0 ? rules : ["No specific warranty rules defined currently."] };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
function raiseReplacement(payload) {
  try {
    var dateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMyy");
    var randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    var ticketId = "REP-YM-" + dateFormatted + "-" + randomDigits;
    
    var fileUrl = "";
    var audioUrl = "";
    var mediaBlob = null; // 🟢 NAYA VARIABLE: Telegram alert ke liye photo hold karega

    // Save Photo/Video Proof (Handles uncompressed base64 natively)
    if (payload.media) {
      try {
        var decoded = Utilities.base64Decode(payload.media.base64);
        mediaBlob = Utilities.newBlob(decoded, payload.media.mimeType, payload.media.filename); // 🟢 Blob create kiya
        
        var folderIter = DriveApp.getFoldersByName("ReplacementMedia");
        var folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder("ReplacementMedia");
        var file = folder.createFile(mediaBlob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch(e) {}
    }

    // Save Audio Voice Note (Will be skipped if disabled in frontend)
    if (payload.audio) {
      try {
        var decodedAudio = Utilities.base64Decode(payload.audio.base64);
        var audioBlob = Utilities.newBlob(decodedAudio, payload.audio.mimeType, "VoiceNote_" + ticketId + ".webm");
        var folderIterA = DriveApp.getFoldersByName("ReplacementMedia");
        var folderA = folderIterA.hasNext() ? folderIterA.next() : DriveApp.createFolder("ReplacementMedia");
        var audioFile = folderA.createFile(audioBlob);
        audioFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        audioUrl = audioFile.getUrl();
      } catch(e) {}
    }

    // Connecting directly to the NEW External CRM Spreadsheet ID
    var sheet = SpreadsheetApp.openById("1tRhLgLfVjDRBiVilVCAG4KbiahZMr6LxomVKXrIQMOg").getSheetByName("Sheet1");
    if (!sheet) {
      return { success: false, message: "External Replacement Sheet not found!" };
    }

    // Append exactly matching the columns of the external CRM sheet
    sheet.appendRow([
      ticketId, new Date(), payload.phone, payload.shopName, payload.brand, 
      payload.productName, 1, payload.defectType, fileUrl, 
      "Raised", "", "", payload.remarks || "", audioUrl
    ]);

    var msg = "♻️ *NEW REPLACEMENT TICKET* ♻️\n\n" +
      "*Ticket ID:* " + ticketId + "\n" +
      "*Shop Name:* " + payload.shopName + "\n" +
      "*Item:* " + payload.productName + " (" + payload.brand + ")\n" +
      "*Issue:* " + payload.defectType + "\n" +
      "*Remarks:* " + (payload.remarks || "N/A");

    if (fileUrl !== "") msg += "\n🔗 *Drive Backup Link:* [View Link](" + fileUrl + ")";
    if (audioUrl !== "") msg += "\n🎙️ *Voice Note:* [Listen](" + audioUrl + ")";

    // 🟢 UPDATE: Yahan par alert bhejte waqt 'mediaBlob' bhi sath me pass kar diya
    try { sendTelegramAlert(msg, mediaBlob); } catch(e) {}

    return { success: true, ticketId: ticketId };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}


function getReplacements(phone) {
  try {
    // Connect directly to the NEW External CRM Spreadsheet ID
    var sheet = SpreadsheetApp.openById("1tRhLgLfVjDRBiVilVCAG4KbiahZMr6LxomVKXrIQMOg").getSheetByName("Sheet1");
    if (!sheet) return { success: true, data: [] };

    var data = sheet.getDataRange().getValues();
    var list = [];
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";

    for (var i = data.length - 1; i >= 1; i--) {
      var rowPhoneRaw = data[i][2]; // Phone is at index 2 (Column C)
      if (rowPhoneRaw) {
        var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanRowPhone === targetPhone) {
          var dateVal = data[i][1]; // Date is at index 1 (Column B)
          var dateStr = (dateVal instanceof Date) ? Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd-MM-yyyy") : dateVal.toString();
          
          list.push({
            ticketId: data[i][0] || "N/A", // Column A
            date: dateStr,
            brand: data[i][4] || "", // Column E
            productName: data[i][5] || "", // Column F
            defectType: data[i][7] || "", // Column H
            status: data[i][9] || "Raised", // Column J
            resolutionType: data[i][10] || "", // Column K
            resolutionDetails: data[i][11] || "" // Column L
          });
        }
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// =====================================================================
// 4. CORE DEALER PORTAL FUNCTIONS
// =====================================================================

function verifyDealer(phone) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dealers");
  var data = sheet.getDataRange().getValues();
  
  if (phone && phone.toString().indexOf("SSO_") === 0) {
    var staffId = phone.toString().replace("SSO_", "");
    return { success: true, shopName: "Staff Portal (" + staffId + ")" };
  }

  var targetPhoneClean = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
  if (targetPhoneClean === "") {
    return { success: false, message: "Invalid phone number format." };
  }
  
  for (var i = 1; i < data.length; i++) {
    var sheetPhoneRaw = data[i][0];
    if (sheetPhoneRaw) {
      var sheetPhoneClean = sheetPhoneRaw.toString().replace(/\D/g, '').slice(-10);
      if (sheetPhoneClean === targetPhoneClean) {
        return { success: true, shopName: data[i][1] };
      }
    }
  }
  return { success: false, message: "Number not registered." };
}

function getProducts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var products = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== "") { 
      var product = {};
      var moreImagesArray = [];
      
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] !== "") {
          var headerName = headers[j].toString().trim();
          var cleanHeader = headerName.toLowerCase().replace(/[^a-z0-9]/g, "");
          var cellValue = data[i][j];
          
          if (cleanHeader === "moreimages") {
            if (cellValue && cellValue.toString().trim() !== "") {
              moreImagesArray.push(cellValue.toString().trim());
            }
          } else {
            product[headerName] = cellValue;
          }
        }
      }
      
      product["MoreImages"] = moreImagesArray.join(" | ");
      
      var brandCheck = (product["Brand"] || product["brand"] || "").toString().toUpperCase();
      if (brandCheck.indexOf("HIKVISION") > -1 || brandCheck.indexOf("VELOCITY") > -1) {
        product["BackendAlwaysLive"] = true; 
      } else {
        product["BackendAlwaysLive"] = false;
      }
      
      products.push(product);
    }
  }
  return { success: true, data: products };
}
function getLedger(phone) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dealersSheet = ss.getSheetByName("Dealers");
    var ledgerSheet = ss.getSheetByName("Ledger");
    
    if (!ledgerSheet || !dealersSheet) {
      return { success: false, message: "'Ledger' ya 'Dealers' sheet nahi mila." };
    }
    
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
    if (targetPhone === "") {
      return { success: false, message: "Invalid login phone number." };
    }
    
    // 1. EXACT NAME MATCH
    var dealersData = dealersSheet.getDataRange().getValues();
    var targetShopName = "";
    for (var i = 1; i < dealersData.length; i++) {
      var dealerPhoneRaw = dealersData[i][0];
      if (dealerPhoneRaw) {
        var cleanDealerPhone = dealerPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanDealerPhone === targetPhone) {
          targetShopName = dealersData[i][1] ? dealersData[i][1].toString().trim() : "";
          break;
        }
      }
    }
    
    if (!targetShopName || targetShopName === "") {
      return { success: false, message: "Dealer registered nahi hai." };
    }
    
    var isTargetSection = false;
    function cleanStr(str) { return str ? str.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : ""; }
    var normTarget = cleanStr(targetShopName);
    
    var ledgerData = ledgerSheet.getDataRange().getValues();
    var dealerTransactions = [];
    var lastSeenDate = ""; 
    
    var drIdx = 6, crIdx = 7, vchTypeIdx = 4, vchNoIdx = 5, partIdx = 2;
    
    for (var j = 0; j < ledgerData.length; j++) {
      var row = ledgerData[j];
      if (!row || row.length < 2) continue; 
      
      var colA = row[0] ? row[0].toString().trim() : "";
      var colB = row[1] ? row[1].toString().trim() : "";
      
      // 2. DETECT DEALER SECTION
      if (colA !== "" && colA.toLowerCase().indexOf("ledger:") > -1) {
        isTargetSection = false; 
        var normSection = cleanStr(colB);
        if (normSection.indexOf(normTarget) === 0) {
          isTargetSection = true;
          lastSeenDate = ""; 
          drIdx = 6; crIdx = 7; vchTypeIdx = 4; vchNoIdx = 5; partIdx = 2;
        }
        continue; 
      }
      
      if (isTargetSection) {
        // 3. DYNAMIC HEADER SCANNER
        if (colA.toLowerCase() === "date" || colA.toLowerCase().indexOf("date") === 0) {
          for (var c = 0; c < row.length; c++) {
            var headerVal = row[c] ? row[c].toString().toLowerCase().replace(/\./g, '').trim() : "";
            if (headerVal === "particulars") partIdx = c;
            else if (headerVal === "vch type") vchTypeIdx = c;
            else if (headerVal === "vch no") vchNoIdx = c;
            else if (headerVal === "debit") drIdx = c;
            else if (headerVal === "credit") crIdx = c;
          }
          continue; 
        }
        
        // Block Tally's Grand Total Leak
        var isDateColANumberOnly = colA !== "" && !isNaN(colA.replace(/,/g, '')) && colA.indexOf('-') === -1;
        if (isDateColANumberOnly) continue; 
        
        // 4. EXTRACT DATA 
        var debitVal = parseFloat(row[drIdx] ? row[drIdx].toString().replace(/,/g, '') : "0") || 0;
        var creditVal = parseFloat(row[crIdx] ? row[crIdx].toString().replace(/,/g, '') : "0") || 0;
        var vchType = row[vchTypeIdx] ? row[vchTypeIdx].toString().replace(/\n/g, ' ').trim() : "";       
        var vchNo = row[vchNoIdx] ? row[vchNoIdx].toString().trim() : "";       
        
        var particulars = row[partIdx] ? row[partIdx].toString().replace(/\n/g, ' ').trim() : "";
        if (particulars.toLowerCase() === "cr" || particulars.toLowerCase() === "dr") {
           particulars = row[partIdx + 1] ? row[partIdx + 1].toString().replace(/\n/g, ' ').trim() : "";
        }
        if (particulars === "") particulars = "Transaction"; 
        
        var lowerP = particulars.toLowerCase();
        var isOpeningBalance = (lowerP.indexOf("opening balance") > -1);
        var isClosingBalance = (lowerP.indexOf("closing balance") > -1);
        var hasAmount = (debitVal > 0 || creditVal > 0);
        
        // CORE FIX: Drop the Closing Balance completely to protect frontend math
        if (isClosingBalance) {
          continue; 
        }
        
        if (!isOpeningBalance && !hasAmount) {
          continue; 
        }
        
        // 5. INHERIT BLANK DATES
        var dateStr = "";
        if (row[0] instanceof Date) {
          dateStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "dd-MM-yyyy");
          lastSeenDate = dateStr;
        } else if (colA !== "") {
          dateStr = colA;
          lastSeenDate = dateStr;
        } else {
           if (isOpeningBalance) dateStr = "Opening";
           else dateStr = lastSeenDate; 
        }
        
        dealerTransactions.push({
          date: dateStr,
          particulars: particulars, 
          vchType: vchType, 
          vchNo: vchNo, 
          debit: debitVal,
          credit: creditVal
        });
      }
    }
    
    if (dealerTransactions.length === 0) {
      return { success: false, message: "Ledger found but no transactions are recorded yet." };
    }
    return { success: true, data: dealerTransactions };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getAnnouncements() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Announcements") || ss.getSheetByName("announcements");
    if (!sheet) return { success: true, data: [] }; 
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { success: true, data: [] };
    
    var title = data[1][0] ? data[1][0].toString().trim() : ""; 
    var message = data[1][1] ? data[1][1].toString().trim() : ""; 
    var activeRaw = data[1][2]; 
    var activeVal = activeRaw ? activeRaw.toString().trim().toUpperCase() : "";
    var isActive = (activeVal === "YES" || activeVal === "TRUE" || activeVal === "ACTIVE" || activeRaw === true || activeRaw === "true");
    
    var list = [];
    if ((title !== "" || message !== "") && isActive) {
      list.push({ title: title, message: message });
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function getDiscounts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Discounts") || ss.getSheetByName("discounts");
    if (!sheet) {
      return { success: true, data: [{ minAmount: 10000, percent: 0.5 }, { minAmount: 20000, percent: 1 }] };
    }
    
    var rawData = sheet.getDataRange().getValues();
    var displayData = sheet.getDataRange().getDisplayValues(); 
    var list = [];
    
    for (var i = 1; i < rawData.length; i++) {
      if (rawData[i][0] !== "") {
        var displayPercentStr = displayData[i][1] ? displayData[i][1].toString().replace("%", "").trim() : "0";
        var percentNum = Number(displayPercentStr);
        if (isNaN(percentNum)) {
          percentNum = Number(rawData[i][1]);
          if (percentNum > 0 && percentNum <= 1) {
            percentNum = percentNum * 100;
          }
        }
        list.push({ minAmount: Number(rawData[i][0]), percent: percentNum });
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function getSchemes() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Schemes");
    if (!sheet) return { success: true, data: [] };
    
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === "ACTIVE") { 
        list.push({
          type: data[i][1], 
          target: data[i][2], 
          minQty: Number(data[i][3]),
          reward: data[i][6], 
          message: data[i][7] 
        });
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function getDealerOrders(phone) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders");
    if (!sheet) return { success: true, data: [] };
    
    var data = sheet.getDataRange().getValues();
    var list = [];
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
    if (targetPhone === "") return { success: false, message: "Invalid phone check." };

    var targetColumns = [
      { index: 9, label: "Call 1", type: "audio" }, 
      { index: 10, label: "Stock Photo", type: "image" }, 
      { index: 11, label: "Invoice Photo", type: "image" }, 
      { index: 12, label: "Box Photo", type: "image" }, 
      { index: 13, label: "Call 2", type: "audio" }, 
      { index: 14, label: "Delivery Proof", type: "image" }, 
      { index: 15, label: "Final Call", type: "audio" }, 
      { index: 16, label: "Order Rating", type: "rating" },
      { index: 17, label: "Payment Screenshot", type: "image" }
    ];

    for (var i = data.length - 1; i >= 1; i--) {
      var rowPhoneRaw = data[i][3]; 
      if (rowPhoneRaw) {
        var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanRowPhone === targetPhone) {
          var dateVal = data[i][0]; 
          var dateStr = "";
          if (dateVal instanceof Date) {
            dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm");
          } else {
            dateStr = dateVal.toString();
          }

          var attachments = [];
          for (var c = 0; c < targetColumns.length; c++) {
            var colConfig = targetColumns[c];
            if (data[i][colConfig.index]) {
              var cellVal = data[i][colConfig.index].toString().trim();
              if (cellVal !== "") {
                attachments.push({ label: colConfig.label, type: colConfig.type, url: cellVal });
              }
            }
          }

          list.push({
            date: dateStr,
            orderId: data[i][1] ? data[i][1].toString() : "N/A", 
            shopName: data[i][2] ? data[i][2].toString() : "N/A", 
            items: data[i][4] ? data[i][4].toString() : "N/A", 
            finalAmount: data[i][5] ? data[i][5].toString() : "0", 
            paymentMode: data[i][6] ? data[i][6].toString() : "N/A", 
            status: data[i][7] ? data[i][7].toString() : "Pending",
            attachments: attachments
          });
        }
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
function saveOrder(order) {
  if (!order) {
    order = {
      shopName: "Yash Sir Test Shop", phone: "9999999999", items: "Smart Watch x2 | Airpods x1",
      totalAmount: "3500", finalAmount: "3500", paymentMode: "COD",
      bulkDiscount: 0, upiDiscount: 0, rewards: "", remarks: ""
    };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dealerArea = "N/A";
  var fetchedShopName = "";

  try {
    var dealersSheet = ss.getSheetByName("Dealers");
    if (dealersSheet) {
      var dealersData = dealersSheet.getDataRange().getValues();
      var searchPhone = order.phone ? order.phone.toString().replace(/\D/g, '').slice(-10) : "";
      for (var d = 1; d < dealersData.length; d++) {
        var rowPhoneRaw = dealersData[d][0];
        if (rowPhoneRaw) {
          var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
          if (cleanRowPhone === searchPhone) {
            fetchedShopName = dealersData[d][1] ? dealersData[d][1].toString().trim() : "";
            dealerArea = dealersData[d][2] ? dealersData[d][2].toString().trim() : "N/A";
            break;
          }
        }
      }
    }
  } catch(e) {}

  if ((!order.shopName || order.shopName.toString().trim() === "") && fetchedShopName !== "") {
    order.shopName = fetchedShopName;
  }

  var shopName = order.shopName || "YM";
  var cleanShopName = shopName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
  // 🟢 NEW LOGIC: First 6 Letters of Dealer Name
  var dealerCode = cleanShopName.slice(0, 6);
  while (dealerCode.length < 6) { dealerCode += "X"; } 

  var dateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "ddMMyy");
  
  var localOrderSheet = ss.getSheetByName("Orders"); 
  var nextSerial = 1;
  
  // 🟢 NEW LOGIC: 6-Digit Sequential Auto-Increment Logic
  if (localOrderSheet) {
    var lastRow = localOrderSheet.getLastRow();
    if (lastRow > 1) { 
      var lastOrderId = localOrderSheet.getRange(lastRow, 2).getValue().toString();
      var parts = lastOrderId.split("-");
      if (parts.length >= 4) {
        var lastSerialNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSerialNum)) {
          nextSerial = lastSerialNum + 1;
        }
      }
    }
  }
  
  var serialString = nextSerial.toString();
  while (serialString.length < 6) {
    serialString = "0" + serialString;
  }

  var orderId = "YM-" + dealerCode + "-" + dateFormatted + "-" + serialString;

  var screenshotUrl = "";
  var screenshotBlob = null; 
  if (order.screenshot) {
    try {
      var decoded = Utilities.base64Decode(order.screenshot.base64);
      screenshotBlob = Utilities.newBlob(decoded, order.screenshot.mimeType, order.screenshot.filename); 
      var folderIter = DriveApp.getFoldersByName("PaymentScreenshots");
      var folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder("PaymentScreenshots");
      var file = folder.createFile(screenshotBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      screenshotUrl = file.getUrl();
    } catch(e) { 
      screenshotUrl = "UPLOAD ERROR: " + e.message; 
    }
  }

  var detailedItems = order.items || "N/A";
  var bulkPctText = order.bulkPercent ? " (" + order.bulkPercent + "%)" : "";

  if (order.comboDiscount && order.comboDiscount > 0) detailedItems += " | 🔥 Combo Discount: -₹" + order.comboDiscount;
  if (order.bulkDiscount && order.bulkDiscount > 0) detailedItems += " | Bulk Discount" + bulkPctText + ": -₹" + order.bulkDiscount;
  if (order.upiDiscount && order.upiDiscount > 0) detailedItems += " | UPI Discount (2%): -₹" + order.upiDiscount;
  if (order.rewards && order.rewards.trim() !== "") detailedItems += " | 🎁 Rewards Unlocked: " + order.rewards;
  
  if (order.remarks && order.remarks.trim() !== "") {
    detailedItems += " | 💬 DEALER NOTE: " + order.remarks.trim();
  }

  var formattedItems = "";
  if (detailedItems) {
    var itemParts = detailedItems.split(" | ");
    formattedItems = "\n" + itemParts.map(function(item) { return "• " + item.trim(); }).join("\n");
  } else {
    formattedItems = "N/A";
  }

  var sheetSavedSuccessfully = false;
  if (localOrderSheet) {
    var maxRetries = 3; 
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      try {
        var rowData = [
          new Date(), orderId, order.shopName, order.phone, 
          detailedItems, order.finalAmount, order.paymentMode, 
          "Pending", "", "", "", "", "", "", "", "", "", screenshotUrl
        ];
        localOrderSheet.appendRow(rowData);
        sheetSavedSuccessfully = true;
        break; 
      } catch(err) {
        Utilities.sleep(2000); 
      }
    }
  }

  var fmsSpreadsheetId = "1VTbtmkLL5R8PVdqv6PcTNn7I5aVjkjsT99QvNJMMHAA";
  var fmsSavedSuccessfully = false;
  try {
    var fmsSpreadsheet = SpreadsheetApp.openById(fmsSpreadsheetId);
    var fmsSheet = fmsSpreadsheet.getSheetByName("FMS");
    if (fmsSheet) {
      var totalQty = 0;
      if (order.items) {
        var itemPartsFms = order.items.split(" | ");
        for (var i = 0; i < itemPartsFms.length; i++) {
          var qtyMatch = itemPartsFms[i].match(/x(\d+)$/);
          if (qtyMatch) totalQty += parseInt(qtyMatch[1], 10);
        }
      }
      var fmsRow = [
        new Date(), orderId, order.shopName, "", 
        order.finalAmount, totalQty, detailedItems, order.paymentMode 
      ];
      for (var fmsAttempt = 0; fmsAttempt < 3; fmsAttempt++) {
        try {
          fmsSheet.appendRow(fmsRow);
          fmsSavedSuccessfully = true;
          break;
        } catch (fmsAppendErr) {
          Utilities.sleep(2000);
        }
      }
    }
  } catch(fmsErr) {}

  var msg = "";
  if (!sheetSavedSuccessfully) {
    msg = "⚠️ *CRITICAL ALERT: ORDER SHEET MEIN SAVE NAHI HUA* ⚠️\n(Manual entry required!)\n\n";
  } else {
    msg = "🚀 *NEW ORDER RECEIVED* 🚀\n\n";
  }

  msg += "*Order ID:* " + orderId + "\n" +
  "*Shop Name:* " + order.shopName + "\n" +
  "*Area:* " + dealerArea + "\n" +
  "*Items & Pricing Blueprint:*" + formattedItems + "\n" +
  "*Original Net Amount:* ₹" + order.totalAmount + "\n" +
  "*Final Collected Amount:* ₹" + order.finalAmount + "\n" +
  "*Payment Mode:* " + order.paymentMode + "\n";

  if (order.remarks && order.remarks.trim() !== "") {
    msg += "\n💬 *DEALER COMMENT:*\n_" + order.remarks.trim() + "_\n";
  }

  if (screenshotUrl !== "") {
    msg += "\n🔗 *Drive Link:* [View Backup](" + screenshotUrl + ")\n";
  }
  if (sheetSavedSuccessfully) {
    msg += "\n🏁 Main Orders Sheet mein entry auto-post ho chuki hai!";
  }
  if (fmsSavedSuccessfully) {
    msg += "\n✅ Connected Master FMS Sheet mein bhi entry post ho chuki hai!";
  } else {
    msg += "\n⚠️ WARNING: FMS Sheet update fail ho gaya hai!";
  }

  try { 
    sendTelegramAlert(msg, screenshotBlob); 
  } catch(e) {}

  return { success: true, orderId: orderId };
}




function sendLast4OrdersToTelegram() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var orderSheet = ss.getSheetByName("Orders");
    if (!orderSheet) return;
    
    var data = orderSheet.getDataRange().getValues();
    if (data.length <= 1) return;
    
    var numRowsToGet = Math.min(4, data.length - 1);
    var startIndex = data.length - numRowsToGet;
    var msg = "📋 *LAST " + numRowsToGet + " ORDERS STATEMENT* 📋\n\n";
    
    for (var i = startIndex; i < data.length; i++) {
      var row = data[i];
      var dateVal = row[0];
      var dateStr = "";
      if (dateVal instanceof Date) {
        dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm");
      } else {
        dateStr = dateVal.toString();
      }
      
      var orderId = row[1] ? row[1].toString() : "N/A";
      var shopName = row[2] ? row[2].toString() : "N/A";
      var amount = row[5] ? row[5].toString() : "0";
      var paymentMode = row[6] ? row[6].toString() : "N/A";
      
      var formattedStatementItems = "";
      if (row[4]) {
        var parts = row[4].toString().split(" | ");
        formattedStatementItems = "\n" + parts.map(function(item) { return " • " + item.trim(); }).join("\n");
      }
      
      msg += "🆔 *Order ID:* " + orderId + "\n" +
        "🏢 *Shop:* " + shopName + "\n" +
        "📦 *Items:*" + formattedStatementItems + "\n" +
        "₹ *Amount:* ₹" + amount + " (" + paymentMode + ")\n" +
        "📅 *Date:* " + dateStr + "\n" +
        "----------------------------------\n\n";
    }
    sendTelegramAlert(msg);
  } catch (err) {}
}

// =====================================================================
// 5. AMAZON & SHOPIFY SCRAPER ENGINES (100% Intact from original)
// =====================================================================

function autoFetchProductData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Products");
    if (!sheet) {
      Logger.log("Products sheet nahi mili.");
      return;
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var colImageURLIdx = headers.indexOf("ImageURL");
    var colMoreImagesIdx = headers.indexOf("MoreImages");
    var colFeaturesIdx = headers.indexOf("Features");
    var colMRPIdx = headers.indexOf("MRP");
    var colBrandIdx = headers.indexOf("Brand");
    
    if (colImageURLIdx === -1 || colMoreImagesIdx === -1 || colFeaturesIdx === -1) {
      Logger.log("❌ Error: ImageURL, MoreImages, ya Features ke headers nahi mile. Spelling check karein.");
      return;
    }
    
    for (var i = 1; i < data.length; i++) {
      var imageURLValue = data[i][colImageURLIdx] ? data[i][colImageURLIdx].toString().trim() : ""; 
      var cleanLink = imageURLValue.split("?")[0].split("#")[0].trim().replace(/\/$/, "");
      var isImageFile = cleanLink.match(/\.(png|jpg|jpeg|webp|gif)$/i);
      var isGDrive = imageURLValue.indexOf("drive.google.com") > -1 || imageURLValue.indexOf("docs.google.com") > -1;
      var isWebpage = imageURLValue.indexOf("http") === 0 && !isImageFile && !isGDrive;
      
      if (isWebpage) {
        var isAmazon = cleanLink.indexOf("amazon.in") > -1 || cleanLink.indexOf("amazon.com") > -1;
        
        if (isAmazon) {
          Logger.log("🔍 Scraping started for Amazon: " + imageURLValue);
          try {
            var options = {
              "muteHttpExceptions": true,
              "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
              }
            };
            var response = UrlFetchApp.fetch(cleanLink, options);
            if (response.getResponseCode() === 200) {
              var html = response.getContentText();
              var mainImageStr = "";
              var imgMatch = html.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/i) || 
                html.match(/id="landingImage"[^>]*src="([^"]+)"/i) ||
                html.match(/"large":"([^"]+\.(jpg|png|jpeg))"/i);
              
              if (imgMatch) {
                mainImageStr = imgMatch[1];
              }
              
              var mrpFromSite = "";
              var mrpMatch = html.match(/class="a-price a-text-price"[^>]*>[\s\S]*?class="a-offscreen">[^0-9]*([0-9,.]+)/i) ||
                html.match(/class="basisPrice"[^>]*>[\s\S]*?class="a-offscreen">[^0-9]*([0-9,.]+)/i);
              
              if (mrpMatch) {
                mrpFromSite = mrpMatch[1].replace(/,/g, '').split(".")[0].trim();
              } else {
                var priceMatch = html.match(/class="a-price-whole">([0-9,]+)/i);
                if (priceMatch) mrpFromSite = priceMatch[1].replace(/,/g, '').trim();
              }
              
              var featuresList = [];
              var bulletMatches = html.match(/<span class="a-list-item">([\s\S]*?)<\/span>/g);
              if (bulletMatches && bulletMatches.length > 0) {
                for (var k = 0; k < bulletMatches.length; k++) {
                  var cleanBullet = bulletMatches[k].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                  if (cleanBullet.length > 12) {
                    if (cleanBullet.length > 90) {
                      cleanBullet = cleanBullet.split(/[,\.]/)[0].trim(); 
                    }
                    if (cleanBullet.length > 8 && cleanBullet.length < 90) {
                      featuresList.push(cleanBullet);
                    }
                  }
                }
              }
              
              var featuresStr = featuresList.slice(0, 5).join(" | ");
              if (mainImageStr !== "" && colImageURLIdx !== -1) {
                sheet.getRange(i + 1, colImageURLIdx + 1).setValue(mainImageStr); 
              }
              if (mrpFromSite !== "" && colMRPIdx !== -1) {
                sheet.getRange(i + 1, colMRPIdx + 1).setValue(mrpFromSite); 
              }
              sheet.getRange(i + 1, colFeaturesIdx + 1).setValue(featuresStr);
              Utilities.sleep(4000);
            }
          } catch (amazonErr) {
            Logger.log("⚠️ Row " + (i + 1) + " was unsafe. Skipped successfully.");
          }
        } else {
          Logger.log("🔍 Scraping started for Shopify: " + imageURLValue);
          var jsonUrl = cleanLink + ".js";
          try {
            var options = {
              "muteHttpExceptions": true,
              "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, fill_parent, Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept": "application/json"
              }
            };
            var response = UrlFetchApp.fetch(jsonUrl, options);
            var responseCode = response.getResponseCode();
            
            if (responseCode === 200) {
              var productJson = JSON.parse(response.getContentText());
              var images = productJson.images || [];
              var mainImageStr = "";
              
              if (images.length > 0) {
                mainImageStr = images[0];
                if (mainImageStr.indexOf("//") === 0) {
                  mainImageStr = "https:" + mainImageStr;
                }
              }
              
              var moreImagesList = [];
              for (var m = 1; m < images.length; m++) {
                var imgUrl = images[m];
                if (imgUrl.indexOf("//") === 0) {
                  imgUrl = "https:" + imgUrl;
                }
                moreImagesList.push(imgUrl);
              }
              var moreImagesStr = moreImagesList.slice(0, 5).join(" | "); 
              
              var description = productJson.description || "";
              var featuresList = [];
              var liMatches = description.match(/<li>(.*?)<\/li>/g);
              if (liMatches && liMatches.length > 0) {
                for (var k = 0; k < liMatches.length; k++) {
                  var cleanLi = liMatches[k].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                  if (cleanLi.length > 12) {
                    if (cleanLi.length > 90) {
                      cleanLi = cleanLi.split(/[,\.]/)[0].trim();
                    }
                    if (cleanLi.length > 8 && cleanLi.length < 90) {
                      featuresList.push(cleanLi);
                    }
                  }
                }
              }
              
              if (featuresList.length === 0) {
                var tempDesc = description
                  .replace(/<\/p>/gi, "\n")
                  .replace(/<\/div>/gi, "\n")
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<\/li>/gi, "\n")
                  .replace(/<\/td>/gi, " | ");
                var cleanDesc = tempDesc.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                var rawLines = cleanDesc.split(/[\n•\r\*\-\!\.]+/);
                
                for (var l = 0; l < rawLines.length; l++) {
                  var cleanLine = rawLines[l].replace(/\s+/g, ' ').trim();
                  if (cleanLine.length > 12) {
                    if (cleanLine.length > 90) {
                      cleanLine = cleanLine.split(/[,\.]/)[0].trim();
                    }
                    if (cleanLine.length > 8 && cleanLine.length < 90) {
                      var lowerL = cleanLine.toLowerCase();
                      if (lowerL.indexOf("warranty") === -1 && 
                          lowerL.indexOf("add to cart") === -1 && 
                          lowerL.indexOf("click here") === -1 &&
                          lowerL.indexOf("specification") === -1) {
                        featuresList.push(cleanLine);
                      }
                    }
                  }
                }
              }
              
              if (featuresList.length === 0) {
                var brandName = productJson.vendor || data[i][2] || "Premium";
                var prodType = productJson.product_type || data[i][4] || "Accessory";
                featuresList.push("Official " + brandName + " authentic performance");
                featuresList.push("High-fidelity " + prodType + " with brand warranty");
                featuresList.push("Ergonomic lightweight design for comfortable use");
                featuresList.push("Premium quality build engineered for durability");
              }
              
              var featuresStr = featuresList.slice(0, 5).join(" | "); 
              var variants = productJson.variants || [];
              var mrpFromSite = "";
              
              if (colMRPIdx !== -1 && variants.length > 0) {
                var priceCents = Number(variants[0].compare_at_price || variants[0].price);
                if (!isNaN(priceCents) && priceCents > 0) {
                  mrpFromSite = Math.round(priceCents / 100).toString();
                }
              }
              
              if (mainImageStr !== "" && colImageURLIdx !== -1) {
                sheet.getRange(i + 1, colImageURLIdx + 1).setValue(mainImageStr); 
              }
              if (mrpFromSite !== "" && colMRPIdx !== -1) {
                sheet.getRange(i + 1, colMRPIdx + 1).setValue(mrpFromSite); 
              }
              sheet.getRange(i + 1, colMoreImagesIdx + 1).setValue(moreImagesStr); 
              sheet.getRange(i + 1, colFeaturesIdx + 1).setValue(featuresStr); 
              
              var randomDelay = 3000 + Math.floor(Math.random() * 2000);
              Utilities.sleep(randomDelay);
            } else if (responseCode === 429) {
              Utilities.sleep(10000);
              i--; 
              continue;
            }
          } catch (fetchErr) {}
        }
      } else {
        var colFeaturesIdx = headers.indexOf("Features");
        if (colFeaturesIdx !== -1) {
          var currentFeatures = data[i][colFeaturesIdx] ? data[i][colFeaturesIdx].toString().trim() : "";
          var isEmpty = currentFeatures === "" || currentFeatures.indexOf("High-performance authentic build quality") > -1;
          
          if (isEmpty) {
            var brandName = data[i][colBrandIdx] ? data[i][colBrandIdx].toString().trim() : "Premium";
            var prodType = data[i][headers.indexOf("Type")] ? data[i][headers.indexOf("Type")].toString().trim() : "Accessory";
            var featuresList = [];
            
            featuresList.push("Official " + brandName + " authentic performance and build");
            featuresList.push("High-fidelity " + prodType + " with brand warranty check");
            featuresList.push("Ergonomic lightweight design for comfortable daily use");
            featuresList.push("Premium quality materials engineered for long-lasting durability");
            
            var featuresStr = featuresList.join(" | ");
            sheet.getRange(i + 1, colFeaturesIdx + 1).setValue(featuresStr);
          }
        }
      }
    }
    SpreadsheetApp.flush();
  } catch (err) {}
}

// =====================================================================
// 6. SEARCH-BASED LINKS GENERATORS (100% Intact from original)
// =====================================================================

function generateWebsiteLinks() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Products");
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var colBrandIdx = headers.indexOf("Brand");
    var colNameIdx = headers.indexOf("ProductName");
    var colImageURLIdx = headers.indexOf("ImageURL");
    
    if (colBrandIdx === -1 || colNameIdx === -1 || colImageURLIdx === -1) return;
    
    for (var i = 1; i < data.length; i++) {
      var brand = data[i][colBrandIdx] ? data[i][colBrandIdx].toString().trim().toLowerCase() : "";
      var prodName = data[i][colNameIdx] ? data[i][colNameIdx].toString().trim() : "";
      var currentVal = data[i][colImageURLIdx] ? data[i][colImageURLIdx].toString().trim() : "";
      var cleanVal = currentVal.split("?")[0].split("#")[0].trim().replace(/\/$/, "");
      var isImageFile = cleanVal.match(/\.(png|jpg|jpeg|webp|gif)$/i);
      var isShopifyCDN = currentVal.indexOf("cdn.shopify.com") > -1;
      var isCustomCDN = currentVal.indexOf("/cdn/") > -1;
      var isImageLink = currentVal === "" || isImageFile || isShopifyCDN || isCustomCDN;
      
      if (isImageLink) {
        prodName = prodName.replace(/airpodes/gi, "airdopes");
        var cleanQueryName = prodName.toLowerCase()
          .replace(/\b(white|black|blue|green|red|grey|siberia|jade|anc|elite|corporate|common|gst|sale|earphones|earbuds|active|pebble|carbon|sand|gold|silver|rose|pink|yellow|orange|purple)\b/g, '') 
          .replace(/\s+/g, ' ')
          .trim();
        var domain = "";
        var isShopifyBrand = (brand.indexOf("boat") > -1 || brand.indexOf("portronics") > -1);
        
        if (isShopifyBrand) {
          if (brand.indexOf("boat") > -1) {
            domain = "boat-lifestyle.com";
          } else if (brand.indexOf("portronics") > -1) {
            domain = "portronics.com";
          }
          
          if (domain !== "" && cleanQueryName !== "") {
            var query = "site:" + domain + " " + cleanQueryName;
            var finalUrl = "";
            var searchEngines = [
              { name: "DuckDuckGo", url: "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query) },
              { name: "Yahoo Search", url: "https://search.yahoo.com/search?p=" + encodeURIComponent(query) },
              { name: "Bing Search", url: "https://www.bing.com/search?q=" + encodeURIComponent(query) }
            ];
            
            var pattern = "https:\\/\\/(www\\.)?" + domain + "\\/products\\/[a-zA-Z0-9_-]+";
            var regex = new RegExp(pattern, "i");
            
            for (var se = 0; se < searchEngines.length; se++) {
              var engine = searchEngines[se];
              try {
                var options = {
                  "muteHttpExceptions": true,
                  "headers": { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..." }
                };
                var response = UrlFetchApp.fetch(engine.url, options);
                if (response.getResponseCode() === 200) {
                  var html = response.getContentText();
                  var match = html.match(regex);
                  if (match) {
                    finalUrl = match[0].trim();
                    break; 
                  }
                }
              } catch (e) {}
            }
            
            if (finalUrl === "") {
              var localHandle = cleanQueryName.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
              finalUrl = "https://www." + domain + "/products/" + localHandle;
            }
            
            sheet.getRange(i + 1, colImageURLIdx + 1).setValue(finalUrl); 
            var delay = 4000 + Math.floor(Math.random() * 2000);
            Utilities.sleep(delay);
          }
        }
      }
    }
    SpreadsheetApp.flush();
  } catch (err) {}
}

// =====================================================================
// 7. TELEGRAM SYSTEM ALERTS ENGINE
// =====================================================================
function sendTelegramAlert(msg, imageBlob) {
  var botToken = "8847444782:AAH9jA8ijqthLBec62eY22gYyuD-ggjMtx0"; 
  var chatId = "8975979526"; 

  if (imageBlob) {
    // ATTEMPT 1: Send as Standard Photo (Best visual experience)
    var photoUrl = "https://api.telegram.org/bot" + botToken + "/sendPhoto";
    var payloadPhoto = {
      "chat_id": chatId,
      "photo": imageBlob,
      "caption": msg,
      "parse_mode": "Markdown"
    };
    
    try {
      var response1 = UrlFetchApp.fetch(photoUrl, {
        "method": "post",
        "payload": payloadPhoto,
        "muteHttpExceptions": true
      });
      var result1 = JSON.parse(response1.getContentText());
      
      if (result1.ok) return; // Upload successful, exit function
      
    } catch (e) {} // Suppress network errors and move to Attempt 2

    // ATTEMPT 2: Force as Document (Bypasses Telegram's strict dimension/ratio limits)
    var docUrl = "https://api.telegram.org/bot" + botToken + "/sendDocument";
    var payloadDoc = {
      "chat_id": chatId,
      "document": imageBlob,
      "caption": "⚠️ _Photo dimensions exceeded Telegram limits. Sent as raw document._\n\n" + msg,
      "parse_mode": "Markdown"
    };
    
    try {
      var response2 = UrlFetchApp.fetch(docUrl, {
        "method": "post",
        "payload": payloadDoc,
        "muteHttpExceptions": true
      });
      var result2 = JSON.parse(response2.getContentText());
      
      if (result2.ok) return; // Upload successful, exit function
      
    } catch (e) {}
  }

  // ATTEMPT 3: Absolute Failsafe Text Message (If Google/Telegram servers timeout on heavy uploads)
  var textUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  try {
    UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({
        "chat_id": chatId,
        "text": msg + "\n\n⚠️ *SYSTEM NOTE:* Live photo upload failed. Please use the Drive Backup Link above to view the screenshot.",
        "parse_mode": "Markdown"
      }),
      "muteHttpExceptions": true
    });
  } catch (e) {
    // Drop Markdown formatting if special characters in dealer remarks broke the payload
    UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({ "chat_id": chatId, "text": msg })
    });
  }
}

