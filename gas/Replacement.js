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
    var category = payload.category || "Replacement";
    var isRep = category.toLowerCase().indexOf("replacement") !== -1;
    var ticketId = (isRep ? "REP-YM-" : "HLP-YM-") + dateFormatted + "-" + randomDigits;
    var fileUrls = [];
    var audioUrl = "";
    var primaryMediaBlob = null; 

    // Handle multiple photos from items
    var items = payload.items || [];
    if (Array.isArray(items) && items.length > 0) {
      for (var itIdx = 0; itIdx < items.length; itIdx++) {
        var itm = items[itIdx];
        if (itm.photos && Array.isArray(itm.photos)) {
          for (var pIdx = 0; pIdx < itm.photos.length; pIdx++) {
            var ph = itm.photos[pIdx];
            if (ph && ph.base64) {
              try {
                var decoded = Utilities.base64Decode(ph.base64);
                var b = Utilities.newBlob(decoded, ph.mimeType || "image/jpeg", ph.filename || ("Proof_" + (itIdx+1) + "_" + (pIdx+1) + ".jpg"));
                if (!primaryMediaBlob) primaryMediaBlob = b;
                var folderIter = DriveApp.getFoldersByName("ReplacementMedia");
                var folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder("ReplacementMedia");
                var file = folder.createFile(b);
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                fileUrls.push(file.getUrl());
              } catch(pErr) {}
            }
          }
        }
      }
    }

    // Also handle single or general photos
    if (fileUrls.length === 0 && payload.media && payload.media.base64) {
      try {
        var decodedM = Utilities.base64Decode(payload.media.base64);
        primaryMediaBlob = Utilities.newBlob(decodedM, payload.media.mimeType || "image/jpeg", payload.media.filename || "Proof.jpg"); 
        var folderIterM = DriveApp.getFoldersByName("ReplacementMedia");
        var folderM = folderIterM.hasNext() ? folderIterM.next() : DriveApp.createFolder("ReplacementMedia");
        var fileM = folderM.createFile(primaryMediaBlob);
        fileM.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrls.push(fileM.getUrl());
      } catch(e) {}
    }

    if (payload.photos && Array.isArray(payload.photos)) {
      for (var gIdx = 0; gIdx < payload.photos.length; gIdx++) {
        var gPh = payload.photos[gIdx];
        if (gPh && gPh.base64) {
          try {
            var decodedG = Utilities.base64Decode(gPh.base64);
            var bG = Utilities.newBlob(decodedG, gPh.mimeType || "image/jpeg", gPh.filename || ("General_" + (gIdx+1) + ".jpg"));
            if (!primaryMediaBlob) primaryMediaBlob = bG;
            var folderIterG = DriveApp.getFoldersByName("ReplacementMedia");
            var folderG = folderIterG.hasNext() ? folderIterG.next() : DriveApp.createFolder("ReplacementMedia");
            var fileG = folderG.createFile(bG);
            fileG.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            if (fileUrls.indexOf(fileG.getUrl()) === -1) {
              fileUrls.push(fileG.getUrl());
            }
          } catch(gErr) {}
        }
      }
    }

    var combinedFileUrl = fileUrls.join(" | ");

    var sheet = SpreadsheetApp.openById("1tRhLgLfVjDRBiVilVCAG4KbiahZMr6LxomVKXrIQMOg").getSheetByName("Sheet1");
    if (!sheet) {
      return { success: false, message: "External Replacement Sheet not found!" };
    }

    sheet.appendRow([
      ticketId, new Date(), payload.phone, payload.shopName, payload.brand, 
      payload.productName, (items && items.length > 0 ? items.reduce(function(a,b){ return a + (b.qty || 1); }, 0) : 1), 
      payload.defectType, combinedFileUrl, 
      "Raised", "", "", payload.remarks || "", audioUrl
    ]);

    var headerEmoji = isRep ? "♻️ *NEW REPLACEMENT TICKET* ♻️" : "🎫 *NEW HELP TICKET (" + category.toUpperCase() + ")* 🎫";
    var msg = headerEmoji + "\n\n" +
              "*Ticket ID:* " + ticketId + "\n" +
              "*Shop Name:* " + payload.shopName + "\n" +
              "*Item:* " + payload.productName + " (" + payload.brand + ")\n" +
              "*Issue:* " + payload.defectType + "\n" +
              "*Remarks:* " + (payload.remarks || "N/A");

    if (fileUrls.length > 0) {
      msg += "\n🔗 *Drive Proof Links (" + fileUrls.length + "):*\n" + fileUrls.map(function(u, idx){ return " • [Photo " + (idx+1) + "](" + u + ")"; }).join("\n");
    }

    try {
      sendReplacementTelegramAlert(msg, primaryMediaBlob);
    } catch (e) {
      Logger.log("Replacement Telegram alert failed for " + ticketId + ": " + e.toString());
    }

    return { success: true, ticketId: ticketId };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function getReplacements(phone) {
  try {
    var sheet = SpreadsheetApp.openById("1tRhLgLfVjDRBiVilVCAG4KbiahZMr6LxomVKXrIQMOg").getSheetByName("Sheet1");
    if (!sheet) return { success: true, data: [] };

    var data = sheet.getDataRange().getValues();
    var list = [];
    var targetPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";

    for (var i = data.length - 1; i >= 1; i--) {
      var rowPhoneRaw = data[i][2]; 
      if (rowPhoneRaw) {
        var cleanRowPhone = rowPhoneRaw.toString().replace(/\D/g, '').slice(-10);
        if (cleanRowPhone === targetPhone) {
          var dateVal = data[i][1]; 
          var dateStr = (dateVal instanceof Date) ? Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd-MM-yyyy") : dateVal.toString();
          var fileUrlRaw = data[i][8] ? data[i][8].toString().trim() : "";
          var photosList = fileUrlRaw ? fileUrlRaw.split(" | ") : [];
          list.push({
            ticketId: data[i][0] || "N/A", 
            date: dateStr,
            brand: data[i][4] || "", 
            productName: data[i][5] || "", 
            defectType: data[i][7] || "", 
            fileUrl: fileUrlRaw,
            photos: photosList,
            status: data[i][9] || "Raised", 
            resolutionType: data[i][10] || "", 
            resolutionDetails: data[i][11] || "",
            remarks: data[i][12] || "",
            audioUrl: data[i][13] || ""
          });
        }
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
