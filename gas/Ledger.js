// =====================================================================
// 🎯 DEALER TARGETS MANAGEMENT SYSTEM (6-MONTH AVG + 20% GROWTH)
// =====================================================================

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
        var mTarget = Number(data[i][5]) || 0;
        var qTarget = Number(data[i][6]) || 0;
        var stats = getDealerTargetStats(targetPhoneClean);
        return { 
          success: true, 
          shopName: data[i][1],
          phone: targetPhoneClean,
          monthlyTarget: mTarget,
          quarterlyTarget: qTarget,
          targetStats: stats
        };
      }
    }
  }
  return { success: false, message: "Number not registered." };
}

function calculateAndSetupDealerTargets() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dealersSheet = ss.getSheetByName("Dealers");
    if (!dealersSheet) return { success: false, message: "Dealers sheet not found" };

    var dealersData = dealersSheet.getDataRange().getValues();
    if (dealersData.length < 2) return { success: false, message: "No dealers found in sheet" };

    // 1. Rename Column F (6) and Column G (7)
    dealersSheet.getRange(1, 6).setValue("Monthly Targets");
    dealersSheet.getRange(1, 7).setValue("Quarterly Targets");

    dealersSheet.getRange(1, 6, 1, 2)
      .setFontWeight("bold")
      .setBackground("#1e3a8a")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");

    // 2. Cutoff: 180 days ago (last 6 months)
    var now = new Date();
    var sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

    var salesByPhone = {};
    var salesByShop = {};

    function cleanPhone(p) {
      return p ? p.toString().replace(/\D/g, '').slice(-10) : "";
    }
    function cleanStr(s) {
      return s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : "";
    }

    // A. Ledger debits (bills)
    try {
      var ledgerSheet = ss.getSheetByName("Ledger");
      if (ledgerSheet) {
        var lData = ledgerSheet.getDataRange().getValues();
        var currentSectionShop = "";
        var drIdx = 6;

        for (var j = 0; j < lData.length; j++) {
          var row = lData[j];
          var colA = row[0] ? row[0].toString().trim() : "";
          var colB = row[1] ? row[1].toString().trim() : "";

          if (colA !== "" && colA.toLowerCase().indexOf("ledger:") > -1) {
            currentSectionShop = cleanStr(colB);
            drIdx = 6;
            continue;
          }

          if (currentSectionShop !== "") {
            if (colA.toLowerCase() === "date" || colA.toLowerCase().indexOf("date") === 0) {
              for (var c = 0; c < row.length; c++) {
                var h = row[c] ? row[c].toString().toLowerCase().replace(/\./g, '').trim() : "";
                if (h === "debit") drIdx = c;
              }
              continue;
            }

            var debitVal = parseFloat(row[drIdx] ? row[drIdx].toString().replace(/,/g, '') : "0") || 0;
            if (debitVal > 0) {
              var txDate = null;
              if (row[0] instanceof Date) {
                txDate = row[0];
              } else if (colA.includes('-')) {
                var p = colA.split('-');
                if (p.length === 3) {
                  if (p[0].length === 4) txDate = new Date(colA);
                  else txDate = new Date(p[2] + '-' + p[1] + '-' + p[0]);
                }
              }

              if (!txDate || txDate >= sixMonthsAgo) {
                salesByShop[currentSectionShop] = (salesByShop[currentSectionShop] || 0) + debitVal;
              }
            }
          }
        }
      }
    } catch(lErr) {
      Logger.log("Ledger calculation err: " + lErr.toString());
    }

    // B. Orders sheet
    try {
      var ordersSheet = ss.getSheetByName("Orders") || ss.getSheetByName("orders");
      if (ordersSheet) {
        var oData = ordersSheet.getDataRange().getValues();
        if (oData.length > 1) {
          var oHeaders = oData[0].map(function(h) { return h ? h.toString().toLowerCase().replace(/[\s_-]/g, '') : ""; });
          var phIdx = oHeaders.indexOf("phone");
          if (phIdx === -1) phIdx = oHeaders.indexOf("mobile");
          var shopIdx = oHeaders.indexOf("shopname");
          var amtIdx = oHeaders.indexOf("totalvalue");
          if (amtIdx === -1) amtIdx = oHeaders.indexOf("finalamount");
          if (amtIdx === -1) amtIdx = oHeaders.indexOf("amount");
          var dateIdx = oHeaders.indexOf("date");
          var statusIdx = oHeaders.indexOf("status");

          for (var k = 1; k < oData.length; k++) {
            var oRow = oData[k];
            var oStatus = statusIdx > -1 && oRow[statusIdx] ? oRow[statusIdx].toString().toLowerCase() : "";
            if (oStatus === "cancelled" || oStatus === "rejected") continue;

            var oAmt = parseFloat(amtIdx > -1 && oRow[amtIdx] ? oRow[amtIdx].toString().replace(/,/g, '') : "0") || 0;
            if (oAmt > 0) {
              var oPhone = phIdx > -1 ? cleanPhone(oRow[phIdx]) : "";
              var oShop = shopIdx > -1 ? cleanStr(oRow[shopIdx]) : "";

              var ordDate = null;
              if (dateIdx > -1 && oRow[dateIdx] instanceof Date) {
                ordDate = oRow[dateIdx];
              } else if (dateIdx > -1 && oRow[dateIdx]) {
                var ds = oRow[dateIdx].toString();
                if (ds.includes('-')) {
                  var dp = ds.split('-');
                  if (dp[0].length === 4) ordDate = new Date(ds);
                  else ordDate = new Date(dp[2] + '-' + dp[1] + '-' + dp[0]);
                }
              }

              if (!ordDate || ordDate >= sixMonthsAgo) {
                if (oPhone) salesByPhone[oPhone] = (salesByPhone[oPhone] || 0) + oAmt;
                if (oShop) salesByShop[oShop] = (salesByShop[oShop] || 0) + oAmt;
              }
            }
          }
        }
      }
    } catch(oErr) {
      Logger.log("Orders calculation err: " + oErr.toString());
    }

    // 3. Calculate 6-month avg + 20% growth and write
    var updatedDealers = [];
    var targetsRange = dealersSheet.getRange(2, 6, dealersData.length - 1, 2);
    var targetsValues = [];

    for (var i = 1; i < dealersData.length; i++) {
      var dPhone = cleanPhone(dealersData[i][0]);
      var dShop = dealersData[i][1] ? dealersData[i][1].toString().trim() : "";
      var normDShop = cleanStr(dShop);

      var existingM = Number(dealersData[i][5]) || 0;
      var existingQ = Number(dealersData[i][6]) || 0;

      var totalSales6M = Math.max(
        salesByPhone[dPhone] || 0,
        salesByShop[normDShop] || 0
      );

      var monthlyTarget = 0;
      var quarterlyTarget = 0;

      if (totalSales6M > 0) {
        var monthlyAvg = totalSales6M / 6;
        // 20% Growth Target
        monthlyTarget = Math.round((monthlyAvg * 1.20) / 100) * 100;
        if (monthlyTarget < 10000) monthlyTarget = 10000;
      } else if (existingM > 0) {
        monthlyTarget = existingM;
      } else {
        monthlyTarget = 15000; // Base target for zero-sales dealers
      }

      quarterlyTarget = (existingQ > 0 && totalSales6M === 0) ? existingQ : (monthlyTarget * 3);

      targetsValues.push([monthlyTarget, quarterlyTarget]);

      updatedDealers.push({
        phone: dPhone,
        shopName: dShop,
        sales6Months: Math.round(totalSales6M),
        monthlyTarget: monthlyTarget,
        quarterlyTarget: quarterlyTarget
      });
    }

    targetsRange.setValues(targetsValues);
    targetsRange.setNumberFormat("₹#,##0");

    return {
      success: true,
      message: "Successfully populated Column F (Monthly Targets) and Column G (Quarterly Targets)",
      count: updatedDealers.length,
      sample: updatedDealers.slice(0, 10)
    };
  } catch(err) {
    return { success: false, message: err.toString() };
  }
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
        if (normSection.indexOf(normTarget) === 0) {
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


function getDealerTargetStats(phone) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dealersSheet = ss.getSheetByName("Dealers");
    if (!dealersSheet) return { success: false, message: "Dealers sheet not found" };

    var targetPhoneClean = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
    if (!targetPhoneClean) return { success: false, message: "Invalid phone number." };

    var dData = dealersSheet.getDataRange().getValues();
    var targetShopName = "";
    var mTarget = 0;
    var qTarget = 0;

    for (var i = 1; i < dData.length; i++) {
      var rawP = dData[i][0];
      if (rawP && rawP.toString().replace(/\D/g, '').slice(-10) === targetPhoneClean) {
        targetShopName = dData[i][1] ? dData[i][1].toString().trim() : "";
        mTarget = Number(dData[i][5]) || 0;
        qTarget = Number(dData[i][6]) || 0;
        break;
      }
    }

    if (!targetShopName) {
      return { success: false, message: "Dealer not found" };
    }

    // Current Date bounds
    var now = new Date();
    var curYear = now.getFullYear();
    var curMonth = now.getMonth(); // 0-11
    var startOfMonth = new Date(curYear, curMonth, 1, 0, 0, 0);

    // Current Quarter (Financial Year Quarter: Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
    var qStartMonth;
    if (curMonth >= 3 && curMonth <= 5) qStartMonth = 3; // Apr
    else if (curMonth >= 6 && curMonth <= 8) qStartMonth = 6; // Jul
    else if (curMonth >= 9 && curMonth <= 11) qStartMonth = 9; // Oct
    else qStartMonth = 0; // Jan

    var qStartYear = curYear;
    var startOfQuarter = new Date(qStartYear, qStartMonth, 1, 0, 0, 0);

    var curMonthSales = 0;
    var curQuarterSales = 0;

    // 1. Calculate from Ledger debits
    var ledgerSheet = ss.getSheetByName("Ledger");
    if (ledgerSheet) {
      var lData = ledgerSheet.getDataRange().getValues();
      var cleanTargetShop = targetShopName.toLowerCase().replace(/[^a-z0-9]/g, '');
      var inTargetSection = false;
      var drIdx = 6;

      for (var j = 0; j < lData.length; j++) {
        var row = lData[j];
        var colA = row[0] ? row[0].toString().trim() : "";
        var colB = row[1] ? row[1].toString().trim() : "";

        if (colA !== "" && colA.toLowerCase().indexOf("ledger:") > -1) {
          var sName = colB.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (sName === cleanTargetShop || sName.indexOf(cleanTargetShop) > -1 || cleanTargetShop.indexOf(sName) > -1) {
            inTargetSection = true;
          } else {
            inTargetSection = false;
          }
          drIdx = 6;
          continue;
        }

        if (inTargetSection) {
          if (colA.toLowerCase() === "date" || colA.toLowerCase().indexOf("date") === 0) {
            for (var c = 0; c < row.length; c++) {
              var h = row[c] ? row[c].toString().toLowerCase().replace(/\./g, '').trim() : "";
              if (h === "debit") drIdx = c;
            }
            continue;
          }

          var debitVal = parseFloat(row[drIdx] ? row[drIdx].toString().replace(/,/g, '') : "0") || 0;
          if (debitVal > 0) {
            var txDate = null;
            if (row[0] instanceof Date) {
              txDate = row[0];
            } else if (colA.includes('-')) {
              var p = colA.split('-');
              if (p.length === 3) {
                if (p[0].length === 4) txDate = new Date(colA);
                else txDate = new Date(p[2] + '-' + p[1] + '-' + p[0]);
              }
            }

            if (txDate) {
              if (txDate >= startOfMonth) {
                curMonthSales += debitVal;
              }
              if (txDate >= startOfQuarter) {
                curQuarterSales += debitVal;
              }
            }
          }
        }
      }
    }

    // 2. Also check Orders sheet for any recent orders from this dealer placed this month/quarter
    var ordersSheet = ss.getSheetByName("Orders") || ss.getSheetByName("orders");
    if (ordersSheet) {
      var oData = ordersSheet.getDataRange().getValues();
      if (oData.length > 1) {
        var oHeaders = oData[0].map(function(h) { return h ? h.toString().toLowerCase().replace(/[\s_-]/g, '') : ""; });
        var phIdx = oHeaders.indexOf("phone");
        if (phIdx === -1) phIdx = oHeaders.indexOf("mobile");
        var amtIdx = oHeaders.indexOf("totalvalue");
        if (amtIdx === -1) amtIdx = oHeaders.indexOf("finalamount");
        if (amtIdx === -1) amtIdx = oHeaders.indexOf("amount");
        var dateIdx = oHeaders.indexOf("date");
        var statusIdx = oHeaders.indexOf("status");

        var appOrdersMonth = 0;
        var appOrdersQuarter = 0;

        for (var k = 1; k < oData.length; k++) {
          var oRow = oData[k];
          var oStatus = statusIdx > -1 && oRow[statusIdx] ? oRow[statusIdx].toString().toLowerCase() : "";
          if (oStatus === "cancelled" || oStatus === "rejected") continue;

          var oPhone = phIdx > -1 && oRow[phIdx] ? oRow[phIdx].toString().replace(/\D/g, '').slice(-10) : "";
          if (oPhone === targetPhoneClean) {
            var oAmt = parseFloat(amtIdx > -1 && oRow[amtIdx] ? oRow[amtIdx].toString().replace(/,/g, '') : "0") || 0;
            if (oAmt > 0) {
              var ordDate = null;
              if (dateIdx > -1 && oRow[dateIdx] instanceof Date) {
                ordDate = oRow[dateIdx];
              } else if (dateIdx > -1 && oRow[dateIdx]) {
                var ds = oRow[dateIdx].toString();
                if (ds.includes('-')) {
                  var sp = ds.split('-');
                  if (sp.length === 3) {
                    if (sp[0].length === 4) ordDate = new Date(ds);
                    else ordDate = new Date(sp[2] + '-' + sp[1] + '-' + sp[0]);
                  }
                }
              }

              if (ordDate) {
                if (ordDate >= startOfMonth) appOrdersMonth += oAmt;
                if (ordDate >= startOfQuarter) appOrdersQuarter += oAmt;
              }
            }
          }
        }

        // Take max of Ledger vs App orders
        if (appOrdersMonth > curMonthSales) curMonthSales = appOrdersMonth;
        if (appOrdersQuarter > curQuarterSales) curQuarterSales = appOrdersQuarter;
      }
    }

    var monthlyAchieved = Math.round(curMonthSales);
    var quarterlyAchieved = Math.round(curQuarterSales);

    var monthlyPercent = mTarget > 0 ? Math.min(200, Math.round((monthlyAchieved / mTarget) * 100)) : 0;
    var quarterlyPercent = qTarget > 0 ? Math.min(200, Math.round((quarterlyAchieved / qTarget) * 100)) : 0;

    var monthlyUnlocked = mTarget > 0 && monthlyAchieved >= mTarget;
    var quarterlyUnlocked = qTarget > 0 && quarterlyAchieved >= qTarget;
    var targetDiscountPercent = (monthlyUnlocked ? 2 : 0) + (quarterlyUnlocked ? 2 : 0);

    return {
      success: true,
      phone: targetPhoneClean,
      shopName: targetShopName,
      monthlyTarget: mTarget,
      quarterlyTarget: qTarget,
      monthlyAchieved: monthlyAchieved,
      quarterlyAchieved: quarterlyAchieved,
      monthlyPercent: monthlyPercent,
      quarterlyPercent: quarterlyPercent,
      monthlyUnlocked: monthlyUnlocked,
      quarterlyUnlocked: quarterlyUnlocked,
      targetDiscountPercent: targetDiscountPercent,
      remainingForMonthly: Math.max(0, mTarget - monthlyAchieved),
      remainingForQuarterly: Math.max(0, qTarget - quarterlyAchieved)
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
