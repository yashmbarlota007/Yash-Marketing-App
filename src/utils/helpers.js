export const cacheBypass = "?v=" + new Date().getTime();
export const API_URL = "https://script.google.com/macros/s/AKfycbw_HtJl9dqW4J4OnjMZkDTM98nKmuvcwfnh7vnoBKWJGdlB2afWqKRi2nn19AgVkm1t8A/exec";
export const LOGO_URL = "https://drive.google.com/thumbnail?id=1paGW1Y6o4k9MH-z_VUpH4G6yRPwhc03t&sz=w500";
export const PHONEPE_QR_URL = "https://drive.google.com/thumbnail?id=1LIuWXaMd_oNT-zT_ESFtYv5uQ37zUxsi&sz=w1000";
export const OFFICE_NUMBER = "918378811922"; 

export const getNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  const clean = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  return Number(clean) || 0;
};

export function getProp(obj, propName) {
  if (!obj) return "";
  if (obj[propName] !== undefined) return obj[propName];
  var cleanTarget = propName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (var key in obj) {
    var cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanKey === cleanTarget) {
      return obj[key];
    }
  }
  return "";
}

export function getSmartImage(product) {
  if (!product) return null;
  var imageUrl = getProp(product, "ImageURL");
  
  if (imageUrl && String(imageUrl).trim() !== "") {
    let url = String(imageUrl).trim();
    if (url.indexOf("//") === 0) {
      url = "https:" + url;
    }
    
    // 🟢 NAYA FIX: Google Drive Thumbnail API to bypass Google's block
    if (url.includes("drive.google.com")) {
      let fileId = "";
      const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      
      if (dMatch) fileId = dMatch[1];
      else if (idMatch) fileId = idMatch[1];
      
      if (fileId) {
        return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
      }
    }
    
    return url;
  }

  var brand = String(getProp(product, "Brand") || "").toUpperCase();
  if (brand.indexOf("BOAT") > -1) return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Boat_Logo.webp/512px-Boat_Logo.webp.png";
  if (brand.indexOf("PORTRONICS") > -1) return "https://portronics.com/cdn/shop/files/Portronics_Logo_01_1.png";
  if (brand.indexOf("JBL") > -1) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/JBL_logo.svg/512px-JBL_logo.svg.png";
  if (brand.indexOf("HIKVISION") > -1) return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Hikvision_logo.svg/512px-Hikvision_logo.svg.png";
  
  return null;
}

export function groupProductsByVariant(flatList) {
  var grouped = {};
  var capacityRegex = /\b(\d+\s*?GB|\d+\s*?TB|\d+\s*?W|\d+\s*?MAH)\b/i;

  flatList.forEach(function(p) {
    var name = String(getProp(p, "ProductName") || "");
    var brand = String(getProp(p, "Brand") || "");
    var type = String(getProp(p, "Type") || getProp(p, "Category") || "");
    var itemCode = String(getProp(p, "ItemCode") || "");

    if (!name) {
      name = "Product " + (itemCode || Math.random().toString(36).substr(2, 5));
    }

    var match = name.match(capacityRegex);
    var capacity = match ? match[1].toUpperCase().replace(/\s/g, "") : "";

    var baseName = name;
    if (match) {
      baseName = name.replace(match[0], "").replace(/\s+/g, " ").trim();
      baseName = baseName.replace(/^[-/\s]+|[-/\s]+$/g, "").replace(/\s+/g, " ").trim();
    }

    var groupKey = capacity
    ? (brand.toLowerCase() + "_" + type.toLowerCase() + "_" + baseName.toLowerCase())
    : (brand.toLowerCase() + "_" + type.toLowerCase() + "_" + name.toLowerCase() + "_" + itemCode);

    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        key: groupKey,
        baseName: baseName,
        Brand: brand,
        Type: type,
        Features: String(getProp(p, "Features") || ""),
        ImageURL: getProp(p, "ImageURL"),
        MoreImages: getProp(p, "MoreImages"),
        variants: []
      };
    }

    grouped[groupKey].variants.push(
      Object.assign({}, p, {
        ProductName: name,
        capacity: capacity || "Standard"
      })
    );
  });

  return Object.keys(grouped).map(function(k) {
    var group = grouped[k];
    group.variants.sort(function(a, b) {
      var numA = parseInt(a.capacity) || 0;
      var numB = parseInt(b.capacity) || 0;
      return numA - numB;
    });

    var primary = group.variants[0];
    var primaryName = String(getProp(primary, "ProductName") || "");
    return Object.assign({}, primary, {
      ProductName: group.variants.length > 1 ? group.baseName : primaryName,
      isGrouped: group.variants.length > 1,
      variants: group.variants
    });
  });
}

export function calculateSchemeProgress(cartItems, scheme) {
  let currentQty = 0;
  cartItems.forEach(item => {
    const itemName = String(getProp(item, "ProductName") || "").toLowerCase();
    const brand = String(getProp(item, "Brand") || "").toLowerCase();
    const type = String(getProp(item, "Type") || getProp(item, "Category") || "").toLowerCase();
    const target = String(scheme.target || "").toLowerCase();
    
    if (scheme.type === "Product" && itemName.includes(target)) {
      currentQty += item.qty;
    } else if (scheme.type === "Brand" && brand.includes(target)) {
      currentQty += item.qty;
    } else if (scheme.type === "MixCategory") {
      const targets = target.split(",").map(t => t.trim());
      if (targets.some(t => type.includes(t) || itemName.includes(t))) {
        currentQty += item.qty;
      }
    }
  });
  return {
    current: currentQty,
    required: getNum(scheme.minQty),
    isUnlocked: currentQty >= getNum(scheme.minQty)
  };
}