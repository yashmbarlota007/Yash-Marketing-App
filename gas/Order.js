function getDealerOrders(phone) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders");
    if (!sheet) return { success: true, data: [] };
    
    var data = sheet.getDataRange().getValues();
    var list = [];
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
    if (targetPhone === "") return { success: false, message: "Invalid phone check." };

    // STRICTLY MAPPED AS PER YOUR LATEST REQUIREMENT
    var targetColumns = [
      { index: 12, label: "Stock Photo", type: "image" },    // Column M
      { index: 13, label: "Invoice Photo", type: "image" },  // Column N
      { index: 14, label: "Box Photo", type: "image" },      // Column O
      { index: 17, label: "POD", type: "image" },            // Column R
      { index: 18, label: "Call Recording", type: "audio" }  // Column S
    ];

    for (var i = data.length - 1; i >= 1; i--) {
      var rowPhoneRaw = data[i][3]; // Column D
      if (rowPhoneRaw) {
        var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanRowPhone === targetPhone) {
          var dateVal = data[i][0]; // Column A
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

          // Fetching exact variables
          var stockPhotoUrl = data[i][12] ? data[i][12].toString().trim() : ""; // Column M
          var invoicePhotoUrl = data[i][13] ? data[i][13].toString().trim() : ""; // Column N
          var boxPhotoUrl = data[i][14] ? data[i][14].toString().trim() : ""; // Column O
          var deliveryDetailsText = data[i][15] ? data[i][15].toString().trim() : ""; // Column P
          var podUrl = data[i][17] ? data[i][17].toString().trim() : ""; // Column R
          var callRecordingUrl = data[i][18] ? data[i][18].toString().trim() : ""; // Column S
          var orderRatingText = data[i][19] ? data[i][19].toString().trim() : ""; // Column T

          list.push({
            date: dateStr,
            orderId: data[i][1] ? data[i][1].toString() : "N/A", 
            shopName: data[i][2] ? data[i][2].toString() : "N/A", 
            items: data[i][4] ? data[i][4].toString() : "N/A", 
            finalAmount: data[i][5] ? data[i][5].toString() : "0", 
            paymentMode: data[i][6] ? data[i][6].toString() : "N/A", 
            status: data[i][8] ? data[i][8].toString() : "Pending", // Column I
            
            StockPhoto: stockPhotoUrl,
            InvoicePhoto: invoicePhotoUrl,
            BoxPhoto: boxPhotoUrl,
            DeliveryDetails: deliveryDetailsText,
            POD: podUrl,
            CallRecording: callRecordingUrl,
            OrderRating: orderRatingText,
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

// DO NOT FORGET TO KEEP YOUR EXISTING saveOrder AND sendLast4OrdersToTelegram FUNCTIONS BELOW THIS

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
  
  var dealerCode = cleanShopName.slice(0, 6);
  while (dealerCode.length < 6) { dealerCode += "X"; } 

  var dateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "ddMMyy");
  
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

  // 🟢 P1 CONCURRENCY LOCK: Atomic Order ID Generation & Insertion
  var orderLock = LockService.getScriptLock();
  var lockAcquired = false;
  var orderId = "";
  var sheetSavedSuccessfully = false;

  try {
    lockAcquired = orderLock.tryLock(25000);
    var localOrderSheet = ss.getSheetByName("Orders"); 
    var nextSerial = 1;
    
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

    // Fallback if lock acquisition timed out under extreme load
    if (!lockAcquired) {
      nextSerial = Math.floor(100000 + Math.random() * 900000);
    }
    
    var serialString = nextSerial.toString();
    while (serialString.length < 6) {
      serialString = "0" + serialString;
    }

    orderId = "YM-" + dealerCode + "-" + dateFormatted + "-" + serialString;

    if (localOrderSheet) {
      var rowData = [
        new Date(), orderId, order.shopName, order.phone, 
        detailedItems, order.finalAmount, order.paymentMode, 
        "Pending", "", "", "", "", "", "", "", "", "", screenshotUrl
      ];
      localOrderSheet.appendRow(rowData);
      SpreadsheetApp.flush();
      sheetSavedSuccessfully = true;
    }
  } catch (err) {
    Logger.log("Order Lock / Save Error: " + err.toString());
  } finally {
    if (lockAcquired && orderLock.hasLock()) {
      orderLock.releaseLock();
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