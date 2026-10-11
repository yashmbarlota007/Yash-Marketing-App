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
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanKey === cleanTarget) {
        return obj[key];
      }
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
  if (brand.indexOf("VELOCITY") > -1) return "https://via.placeholder.com/512x512.png?text=Velocity"; 
  if (brand.indexOf("KNOPPIE") > -1) return "https://via.placeholder.com/512x512.png?text=Knoppie";

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

// 🟢 SMART SCHEME CALCULATOR (Handles comma separated models and strict name matching)
export function calculateSchemeProgress(cartItems, scheme) {
  let currentQty = 0;
  const targetStr = String(scheme.target || "").toLowerCase();
  // Split targets by comma so multiple models work automatically
  const targets = targetStr.split(",").map(t => t.trim()).filter(Boolean);

  cartItems.forEach(item => {
    const itemName = String(getProp(item, "ProductName") || "").toLowerCase();
    const brand = String(getProp(item, "Brand") || "").toLowerCase();
    const type = String(getProp(item, "Type") || getProp(item, "Category") || "").toLowerCase();

    // Check if the item matches ANY of the target models/brands
    const isMatch = targets.some(t => {
      if (!t) return false;
      return itemName.includes(t) || brand.includes(t) || type.includes(t);
    });

    if (isMatch) {
      currentQty += getNum(item.qty);
    }
  });

  return {
    current: currentQty,
    required: getNum(scheme.minQty),
    isUnlocked: currentQty >= getNum(scheme.minQty)
  };
}

/**
 * High-Fidelity Client-side Image Compression
 * Maintains razor-sharp text, invoice details and barcodes
 * while reducing typical 5-15MB camera files to ~300-600KB for instant upload
 */
export function compressImageFile(file, options = {}) {
  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1920;
  const quality = options.quality !== undefined ? options.quality : 0.85;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error("Please select a valid image file."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Image reading failed."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        try {
          const rawBase64 = String(e.target.result).split(',')[1];
          resolve({
            base64: rawBase64,
            mimeType: file.type || 'image/jpeg',
            filename: file.name
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const rawBase64 = String(e.target.result).split(',')[1];
            return resolve({
              base64: rawBase64,
              mimeType: file.type || 'image/jpeg',
              filename: file.name
            });
          }

          // Use high quality image smoothing so text, barcodes & numbers don't blur
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // White background fallback for transparent PNGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const base64 = dataUrl.split(',')[1];
          const cleanName = (file.name || 'photo').replace(/\.[^/.]+$/, "") + ".jpg";

          resolve({
            base64: base64,
            mimeType: 'image/jpeg',
            filename: cleanName
          });
        } catch (canvasErr) {
          const rawBase64 = String(e.target.result).split(',')[1];
          resolve({
            base64: rawBase64,
            mimeType: file.type || 'image/jpeg',
            filename: file.name
          });
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

