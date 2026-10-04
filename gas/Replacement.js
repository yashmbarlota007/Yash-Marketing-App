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
    var mediaBlob = null; 

    if (payload.media) {
      try {
        var decoded = Utilities.base64Decode(payload.media.base64);
        mediaBlob = Utilities.newBlob(decoded, payload.media.mimeType, payload.media.filename); 
        var folderIter = DriveApp.getFoldersByName("ReplacementMedia");
        var folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder("ReplacementMedia");
        var file = folder.createFile(mediaBlob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch(e) {}
    }

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

    var sheet = SpreadsheetApp.openById("1tRhLgLfVjDRBiVilVCAG4KbiahZMr6LxomVKXrIQMOg").getSheetByName("Sheet1");
    if (!sheet) {
      return { success: false, message: "External Replacement Sheet not found!" };
    }

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

    try { sendTelegramAlert(msg, mediaBlob); } catch(e) {}

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
          list.push({
            ticketId: data[i][0] || "N/A", 
            date: dateStr,
            brand: data[i][4] || "", 
            productName: data[i][5] || "", 
            defectType: data[i][7] || "", 
            status: data[i][9] || "Raised", 
            resolutionType: data[i][10] || "", 
            resolutionDetails: data[i][11] || "" 
          });
        }
      }
    }
    return { success: true, data: list };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
