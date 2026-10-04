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
      Logger.log("❌ Error: Headers nahi mile.");
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
              
              if (imgMatch) { mainImageStr = imgMatch[1]; }
              
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
                    if (cleanBullet.length > 90) { cleanBullet = cleanBullet.split(/[,\.]/)[0].trim(); }
                    if (cleanBullet.length > 8 && cleanBullet.length < 90) { featuresList.push(cleanBullet); }
                  }
                }
              }
              
              var featuresStr = featuresList.slice(0, 5).join(" | ");
              if (mainImageStr !== "" && colImageURLIdx !== -1) { sheet.getRange(i + 1, colImageURLIdx + 1).setValue(mainImageStr); }
              if (mrpFromSite !== "" && colMRPIdx !== -1) { sheet.getRange(i + 1, colMRPIdx + 1).setValue(mrpFromSite); }
              sheet.getRange(i + 1, colFeaturesIdx + 1).setValue(featuresStr);
              Utilities.sleep(4000);
            }
          } catch (amazonErr) {}
        } else {
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
                if (mainImageStr.indexOf("//") === 0) { mainImageStr = "https:" + mainImageStr; }
              }
              
              var moreImagesList = [];
              for (var m = 1; m < images.length; m++) {
                var imgUrl = images[m];
                if (imgUrl.indexOf("//") === 0) { imgUrl = "https:" + imgUrl; }
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
                    if (cleanLi.length > 90) { cleanLi = cleanLi.split(/[,\.]/)[0].trim(); }
                    if (cleanLi.length > 8 && cleanLi.length < 90) { featuresList.push(cleanLi); }
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
                    if (cleanLine.length > 90) { cleanLine = cleanLine.split(/[,\.]/)[0].trim(); }
                    if (cleanLine.length > 8 && cleanLine.length < 90) {
                      var lowerL = cleanLine.toLowerCase();
                      if (lowerL.indexOf("warranty") === -1 && lowerL.indexOf("add to cart") === -1 && lowerL.indexOf("click here") === -1 && lowerL.indexOf("specification") === -1) {
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
                if (!isNaN(priceCents) && priceCents > 0) { mrpFromSite = Math.round(priceCents / 100).toString(); }
              }
              
              if (mainImageStr !== "" && colImageURLIdx !== -1) { sheet.getRange(i + 1, colImageURLIdx + 1).setValue(mainImageStr); }
              if (mrpFromSite !== "" && colMRPIdx !== -1) { sheet.getRange(i + 1, colMRPIdx + 1).setValue(mrpFromSite); }
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