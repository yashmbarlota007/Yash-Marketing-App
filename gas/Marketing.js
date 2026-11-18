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
    return { success: true, data: [] };
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