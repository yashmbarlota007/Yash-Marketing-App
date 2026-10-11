function verifyDealer(phone) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dealers");
  var data = sheet.getDataRange().getValues();

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
      
      if (colA !== "" && colA.toLowerCase().indexOf("ledger:") > -1) {
        isTargetSection = false; 
        var normSection = cleanStr(colB);
        if (normSection === normTarget) {
          isTargetSection = true;
          lastSeenDate = ""; 
          drIdx = 6; crIdx = 7; vchTypeIdx = 4; vchNoIdx = 5; partIdx = 2;
        }
        continue; 
      }
      
      if (isTargetSection) {
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
        
        var isDateColANumberOnly = colA !== "" && !isNaN(colA.replace(/,/g, '')) && colA.indexOf('-') === -1;
        if (isDateColANumberOnly) continue; 
        
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
        
        if (isClosingBalance) {
          continue; 
        }
        
        if (!isOpeningBalance && !hasAmount) {
          continue; 
        }
        
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