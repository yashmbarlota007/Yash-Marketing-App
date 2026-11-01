function getDealerOrders(phone) {
  try {
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
    if (targetPhone === "") return { success: false, message: "Invalid phone check." };

    var sheetsToSearch = [];

    // 1. Prioritize Main Yash Marketing Catalogue Backend Sheet (where staff actively enters status & photos)
    var mainBackendSpreadsheetId = "1nFxdcul3UiAgOoEaF2y-ejqSaMhFwDDGTnbp8BMvmvI";
    try {
      var mainBackendSs = SpreadsheetApp.openById(mainBackendSpreadsheetId);
      if (mainBackendSs) {
        var mainOrdersSheet = mainBackendSs.getSheetByName("Orders") || mainBackendSs.getSheetByName("orders");
        if (mainOrdersSheet) sheetsToSearch.push({ sheet: mainOrdersSheet, name: "MainBackendOrders" });
      }
    } catch(mainErr) {
      Logger.log("Main Backend Sheet Access Error: " + mainErr.toString());
    }

    // 2. Also check Connected Master FMS Sheet (where dispatch, tracking, and fulfillment happens)
    var fmsSpreadsheetId = "1VTbtmkLL5R8PVdqv6PcTNn7I5aVjkjsT99QvNJMMHAA";
    try {
      var fmsSpreadsheet = SpreadsheetApp.openById(fmsSpreadsheetId);
      if (fmsSpreadsheet) {
        var fmsSheet = fmsSpreadsheet.getSheetByName("FMS") || fmsSpreadsheet.getSheetByName("Orders");
        if (fmsSheet) sheetsToSearch.push({ sheet: fmsSheet, name: "FMS" });
      }
    } catch(fmsErr) {
      Logger.log("FMS Sheet Access Error: " + fmsErr.toString());
    }

    // 3. Fallback / local sheet
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var localSheet = ss ? (ss.getSheetByName("Orders") || ss.getSheetByName("orders")) : null;
      if (localSheet) {
        var isAlreadyIn = false;
        for (var si = 0; si < sheetsToSearch.length; si++) {
          if (sheetsToSearch[si].sheet.getSheetId() === localSheet.getSheetId()) {
            isAlreadyIn = true;
            break;
          }
        }
        if (!isAlreadyIn) sheetsToSearch.push({ sheet: localSheet, name: "LocalOrders" });
      }
    } catch(locErr) {}

    if (sheetsToSearch.length === 0) return { success: true, data: [] };

    var ordersMap = {};

    for (var s = 0; s < sheetsToSearch.length; s++) {
      var sheetObj = sheetsToSearch[s];
      var curSheet = sheetObj.sheet;
      var data = curSheet.getDataRange().getValues();
      if (!data || data.length <= 1) continue;

      var headers = data[0];
      var phoneCol = 3;
      var dateCol = 0;
      var orderIdCol = 1;
      var shopCol = 2;
      var itemsCol = 4;
      var amountCol = 5;
      var paymentCol = 6;
      var statusCol = -1;
      var stockPhotoCol = -1;
      var invoicePhotoCol = -1;
      var boxPhotoCol = -1;
      var podCol = -1;
      var callRecordingCol = -1;
      var ratingCol = -1;
      var screenshotCol = -1;

      // Detect column indices dynamically
      for (var h = 0; h < headers.length; h++) {
        var headerStr = String(headers[h] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (headerStr.indexOf("phone") !== -1 || headerStr.indexOf("mobile") !== -1 || headerStr.indexOf("contact") !== -1) phoneCol = h;
        else if (headerStr === "orderid" || headerStr === "orderno" || headerStr === "ordernumber") orderIdCol = h;
        else if (headerStr.indexOf("shop") !== -1 || headerStr.indexOf("dealer") !== -1) shopCol = h;
        else if (headerStr === "status" || headerStr.indexOf("orderstatus") !== -1 || headerStr.indexOf("dispatchstatus") !== -1 || headerStr.indexOf("fmsstatus") !== -1 || headerStr === "stage") {
          if (statusCol === -1 || headerStr.indexOf("dispatch") !== -1 || headerStr.indexOf("status") !== -1) statusCol = h;
        }
        else if (headerStr.indexOf("item") !== -1 || headerStr.indexOf("product") !== -1) itemsCol = h;
        else if (headerStr.indexOf("amount") !== -1 || headerStr.indexOf("total") !== -1 || headerStr.indexOf("price") !== -1) amountCol = h;
        else if (headerStr.indexOf("payment") !== -1 || headerStr.indexOf("mode") !== -1) paymentCol = h;
        else if (headerStr.indexOf("stockphoto") !== -1 || (headerStr.indexOf("stock") !== -1 && headerStr.indexOf("photo") !== -1)) stockPhotoCol = h;
        else if (headerStr.indexOf("invoicephoto") !== -1 || headerStr.indexOf("billphoto") !== -1 || (headerStr.indexOf("invoice") !== -1 && headerStr.indexOf("photo") !== -1)) invoicePhotoCol = h;
        else if (headerStr.indexOf("boxphoto") !== -1 || (headerStr.indexOf("box") !== -1 && headerStr.indexOf("photo") !== -1)) boxPhotoCol = h;
        else if (headerStr === "pod" || headerStr.indexOf("deliveryproof") !== -1 || headerStr.indexOf("dispatchproof") !== -1) podCol = h;
        else if (headerStr.indexOf("call") !== -1 || headerStr.indexOf("recording") !== -1) callRecordingCol = h;
        else if (headerStr.indexOf("rating") !== -1) ratingCol = h;
        else if (headerStr.indexOf("screenshot") !== -1 || headerStr.indexOf("slip") !== -1) screenshotCol = h;
      }

      if (statusCol === -1) statusCol = 7;
      if (stockPhotoCol === -1) stockPhotoCol = headers.length > 12 ? 12 : 10;
      if (invoicePhotoCol === -1) invoicePhotoCol = headers.length > 13 ? 13 : 11;
      if (boxPhotoCol === -1) boxPhotoCol = headers.length > 14 ? 14 : 12;
      if (podCol === -1) podCol = headers.length > 17 ? 17 : 14;
      if (callRecordingCol === -1) callRecordingCol = headers.length > 18 ? 18 : 9;
      if (ratingCol === -1) ratingCol = headers.length > 19 ? 19 : 16;
      if (screenshotCol === -1) screenshotCol = headers.length > 17 ? 17 : -1;

      for (var i = data.length - 1; i >= 1; i--) {
        var row = data[i];
        var rowPhoneRaw = row[phoneCol];
        if (!rowPhoneRaw) continue;

        var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanRowPhone === targetPhone) {
          var orderId = row[orderIdCol] ? row[orderIdCol].toString().trim() : "N/A";
          if (!orderId || orderId === "N/A") continue;

          var dateVal = row[dateCol];
          var dateStr = "";
          if (dateVal instanceof Date) {
            dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm");
          } else {
            dateStr = dateVal ? dateVal.toString() : "";
          }

          var rowStatus = (statusCol >= 0 && row[statusCol]) ? row[statusCol].toString().trim() : "Pending";
          
          // Also check other cells in row for higher status (e.g. Completed, Dispatched, Delivered)
          for (var c = 0; c < row.length; c++) {
            var cellTxt = String(row[c] || "").trim().toLowerCase();
            if (cellTxt === "completed" || cellTxt === "complete" || cellTxt === "delivered" || cellTxt === "done") {
              rowStatus = "Completed";
              break;
            } else if (cellTxt === "dispatched" || cellTxt === "in transit" || cellTxt === "out for delivery") {
              if (rowStatus.toLowerCase() !== "completed" && rowStatus.toLowerCase() !== "delivered") {
                rowStatus = "Dispatched";
              }
            } else if (cellTxt === "processed" || cellTxt === "packing" || cellTxt === "packed" || cellTxt === "billed") {
              if (rowStatus.toLowerCase() === "pending" || !rowStatus) {
                rowStatus = "Processed";
              }
            }
          }

          var stockPhotoUrl = (stockPhotoCol >= 0 && row[stockPhotoCol]) ? row[stockPhotoCol].toString().trim() : "";
          var invoicePhotoUrl = (invoicePhotoCol >= 0 && row[invoicePhotoCol]) ? row[invoicePhotoCol].toString().trim() : "";
          var boxPhotoUrl = (boxPhotoCol >= 0 && row[boxPhotoCol]) ? row[boxPhotoCol].toString().trim() : "";
          var podUrl = (podCol >= 0 && row[podCol]) ? row[podCol].toString().trim() : "";
          var callRecordingUrl = (callRecordingCol >= 0 && row[callRecordingCol]) ? row[callRecordingCol].toString().trim() : "";
          var ratingVal = (ratingCol >= 0 && row[ratingCol]) ? row[ratingCol].toString().trim() : "";
          var screenshotUrl = (screenshotCol >= 0 && row[screenshotCol]) ? row[screenshotCol].toString().trim() : "";

          var attachments = [];
          if (stockPhotoUrl) attachments.push({ label: "Stock Photo", type: "image", url: stockPhotoUrl });
          if (invoicePhotoUrl) attachments.push({ label: "Invoice Photo", type: "image", url: invoicePhotoUrl });
          if (boxPhotoUrl) attachments.push({ label: "Box Photo", type: "image", url: boxPhotoUrl });
          if (podUrl) attachments.push({ label: "Delivery Proof", type: "image", url: podUrl });
          if (callRecordingUrl) attachments.push({ label: "Call Recording", type: "audio", url: callRecordingUrl });
          if (screenshotUrl) attachments.push({ label: "Payment Slip", type: "image", url: screenshotUrl });
          if (ratingVal) attachments.push({ label: "Order Rating", type: "rating", url: ratingVal });

          // Scan all row columns for any Google Drive or image URLs
          for (var colIdx = 0; colIdx < row.length; colIdx++) {
            var cellVal = String(row[colIdx] || "").trim();
            if (cellVal && (cellVal.indexOf("drive.google.com") !== -1 || cellVal.indexOf("http") !== -1)) {
              var alreadyAdded = attachments.some(function(a) { return a.url === cellVal; });
              if (!alreadyAdded) {
                var colHeader = headers[colIdx] ? String(headers[colIdx]).trim() : "Doc";
                var isAudio = cellVal.indexOf(".mp3") !== -1 || cellVal.indexOf(".wav") !== -1 || cellVal.indexOf(".m4a") !== -1 || colHeader.toLowerCase().indexOf("call") !== -1;
                attachments.push({
                  label: colHeader,
                  type: isAudio ? "audio" : "image",
                  url: cellVal
                });
              }
            }
          }

          if (!ordersMap[orderId]) {
            ordersMap[orderId] = {
              date: dateStr,
              orderId: orderId,
              shopName: row[shopCol] ? row[shopCol].toString() : "N/A",
              items: row[itemsCol] ? row[itemsCol].toString() : "N/A",
              finalAmount: row[amountCol] ? row[amountCol].toString() : "0",
              paymentMode: row[paymentCol] ? row[paymentCol].toString() : "N/A",
              status: rowStatus,
              StockPhoto: stockPhotoUrl,
              InvoicePhoto: invoicePhotoUrl,
              BoxPhoto: boxPhotoUrl,
              POD: podUrl,
              CallRecording: callRecordingUrl,
              PaymentScreenshot: screenshotUrl,
              OrderRating: ratingVal,
              attachments: attachments
            };
          } else {
            // Merge row details: prioritize non-pending status and any new attachments
            var existing = ordersMap[orderId];
            if ((existing.status === "Pending" || !existing.status) && rowStatus !== "Pending") {
              existing.status = rowStatus;
            }
            if (attachments.length > 0) {
              attachments.forEach(function(att) {
                var exists = existing.attachments.some(function(ea) { return ea.url === att.url; });
                if (!exists) existing.attachments.push(att);
              });
            }
            if (!existing.StockPhoto && stockPhotoUrl) existing.StockPhoto = stockPhotoUrl;
            if (!existing.InvoicePhoto && invoicePhotoUrl) existing.InvoicePhoto = invoicePhotoUrl;
            if (!existing.BoxPhoto && boxPhotoUrl) existing.BoxPhoto = boxPhotoUrl;
            if (!existing.POD && podUrl) existing.POD = podUrl;
            if (!existing.CallRecording && callRecordingUrl) existing.CallRecording = callRecordingUrl;
          }
        }
      }
    }

    var orderList = [];
    for (var k in ordersMap) {
      orderList.push(ordersMap[k]);
    }

    return { success: true, data: orderList };
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

    // CRITICAL DUAL-POST: Also post directly to Main Yash Marketing Catalogue Backend Sheet
    var mainBackendSpreadsheetId = "1nFxdcul3UiAgOoEaF2y-ejqSaMhFwDDGTnbp8BMvmvI";
    try {
      if (ss.getId() !== mainBackendSpreadsheetId) {
        var mainBackendSs = SpreadsheetApp.openById(mainBackendSpreadsheetId);
        var mainOrdersSheet = mainBackendSs ? mainBackendSs.getSheetByName("Orders") : null;
        if (mainOrdersSheet) {
          mainOrdersSheet.appendRow(rowData);
          SpreadsheetApp.flush();
          sheetSavedSuccessfully = true;
        }
      }
    } catch(backendErr) {
      Logger.log("Main Backend Sheet Append Error: " + backendErr.toString());
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