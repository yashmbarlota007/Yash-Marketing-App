import React, { useState, useEffect, useRef } from 'react';
import { 
  API_URL, 
  getNum, 
  getProp, 
  getSmartImage, 
  calculateSchemeProgress, 
  PHONEPE_QR_URL, 
  OFFICE_NUMBER 
} from '../utils/helpers';

export function Cart(props) {
  // ==========================================
  // 1. PROPS & STATE INITIALIZATION
  // ==========================================
  var user = props.user;
  var cart = props.cart;
  var setCart = props.setCart;
  var setView = props.setView;
  var callAPI = props.callAPI;
  var globalProps = props.globalProps;
  
  const [loading, setLoading] = useState(false);
  
  // 🟢 SYNCHRONOUS LOCK FOR DOUBLE CLICKS
  const submitLock = useRef(false);

  const [schemes, setSchemes] = useState([]); 
  const [paymentMode, setPaymentMode] = useState("");
  const [screenshotData, setScreenshotData] = useState(null);
  const [discounts, setDiscounts] = useState([
    { minAmount: 10000, percent: 1 }, 
    { minAmount: 20000, percent: 1.5 }
  ]);
  const [orderRemarks, setOrderRemarks] = useState("");

  // ==========================================
  // 2. DATA FETCHING (API CALLS)
  // ==========================================
  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDiscounts" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then((r) => {
      return r.json();
    })
    .then((res) => { 
      if (res && res.success && res.data.length > 0) {
        setDiscounts(res.data); 
      }
    })
    .catch(() => {
      console.log("Discount API Failed");
    });
    
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getSchemes" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then((r) => {
      return r.json();
    })
    .then((res) => { 
      if (res && res.success) {
        setSchemes(res.data); 
      }
    })
    .catch(() => {
      console.log("Schemes API Failed");
    });
  }, []);

  // ==========================================
  // 3. CART CALCULATIONS & SCHEME SPLITTING
  // ==========================================
  const cartItems = Object.values(cart);

  const isComboScheme = (s) => {
    return String(s.type).toUpperCase().includes('COMBO') || 
           String(s.message).toUpperCase().includes('COMBO') || 
           String(s.target).toUpperCase().includes('COMBO') ||
           String(s.reward).toUpperCase().includes('COMBO');
  };

  const nonComboSchemes = schemes.filter((s) => {
    return !isComboScheme(s);
  });
  
  const lockedSchemes = nonComboSchemes.filter((s) => {
    const progress = calculateSchemeProgress(cartItems, s);
    return !progress.isUnlocked;
  });

  const unlockedSchemes = nonComboSchemes.filter((s) => {
    const progress = calculateSchemeProgress(cartItems, s);
    return progress.isUnlocked;
  });

  let comboDiscountAmount = 0;
  let combosApplied = 0;
  let singleComboEffectivePrice = 400; 
  
  const comboScheme = schemes.find((s) => {
    return isComboScheme(s);
  });
  
  if (comboScheme && comboScheme.target) {
      let targets = comboScheme.target.split(",").map((t) => {
        return t.trim().toLowerCase();
      });
      
      if (targets.length >= 2) {
          let broadTargets = targets.map((t) => {
            return t.split(" ").slice(0, 2).join(" ");
          });
          
          let t1Qty = 0;
          let t2Qty = 0;
          let t1Price = 0;
          let t2Price = 0;
          
          cartItems.forEach((item) => {
              let n = String(getProp(item, "ProductName")).toLowerCase();
              if (n.includes(broadTargets[0])) { 
                t1Qty += item.qty; 
                t1Price = getNum(getProp(item, "DealerPrice")); 
              }
              else if (n.includes(broadTargets[1])) { 
                t2Qty += item.qty; 
                t2Price = getNum(getProp(item, "DealerPrice")); 
              }
          });
          
          combosApplied = Math.min(t1Qty, t2Qty);
          
          if (combosApplied > 0) {
              const match = String(comboScheme.message).match(/₹(\d+)/) || String(comboScheme.reward).match(/₹(\d+)/) || String(comboScheme.reward).match(/(\d+)/);
              singleComboEffectivePrice = match ? parseInt(match[1] || match[0]) : 400; 
              
              const originalComboPrice = t1Price + t2Price;
              if (originalComboPrice > singleComboEffectivePrice) {
                comboDiscountAmount = (originalComboPrice - singleComboEffectivePrice) * combosApplied;
              }
          }
      }
  }

  const baseTotalAmount = cartItems.reduce((acc, item) => {
    return acc + (getNum(getProp(item, "DealerPrice")) * item.qty);
  }, 0);
  
  const totalAmount = baseTotalAmount - comboDiscountAmount;
  const totalComboValue = combosApplied * singleComboEffectivePrice;
  const nonComboAmount = Math.max(0, totalAmount - totalComboValue);

  var sortedDiscountsDesc = [...discounts].map((d) => {
      return { 
        minAmount: getNum(d.minAmount), 
        percent: getNum(d.percent) 
      };
    })
    .filter((d) => {
      return !isNaN(d.minAmount) && !isNaN(d.percent);
    })
    .sort((a, b) => {
      return b.minAmount - a.minAmount;
    });
    
  let potentialBulkPercent = 0;
  for (var i = 0; i < sortedDiscountsDesc.length; i++) { 
    if (totalAmount >= sortedDiscountsDesc[i].minAmount) { 
      potentialBulkPercent = sortedDiscountsDesc[i].percent; 
      break; 
    } 
  }
  
  const potentialBulkDiscount = nonComboAmount > 0 ? Math.round(nonComboAmount * (potentialBulkPercent / 100)) : 0;
  const nonComboAfterPotentialBulk = nonComboAmount - potentialBulkDiscount;
  const potentialCashDiscount = nonComboAfterPotentialBulk > 0 ? Math.round(nonComboAfterPotentialBulk * 0.02) : 0;

  const isEligibleForDiscount = paymentMode === 'COD' || paymentMode === 'UPI';
  const bulkDiscountAmount = isEligibleForDiscount ? potentialBulkDiscount : 0;
  const cashDiscountAmount = isEligibleForDiscount ? potentialCashDiscount : 0;

  const totalMissedSavings = potentialBulkDiscount + potentialCashDiscount;

  // 🟢 ₹1 PER FREEBIE ITEM CALCULATION FOR BACKEND & FINAL TOTAL
  let totalFreebieCost = 0;
  unlockedSchemes.forEach((sch) => {
    const match = sch.reward.match(/^(\d+)/);
    const freeQty = match ? parseInt(match[1]) : 1;
    totalFreebieCost += (freeQty * 1); 
  });

  const finalAmount = totalComboValue + (nonComboAmount - bulkDiscountAmount - cashDiscountAmount) + totalFreebieCost;

  // ==========================================
  // 4. EVENT HANDLERS
  // ==========================================
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotData({
          base64: ev.target.result.split(',')[1],
          mimeType: file.type,
          filename: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file for the screenshot.");
    }
  };

  const updateQty = (product, change) => {
    const updated = Object.assign({}, cart);
    const itemCode = String(getProp(product, "ItemCode") || "");
    
    if (!itemCode) {
      return;
    }
    
    const isAlwaysLiveBrand = String(getProp(product, "Brand") || "").toUpperCase().includes("HIKVISION") || String(getProp(product, "Brand") || "").toUpperCase().includes("VELOCITY");
    const stockVal = getNum(getProp(product, "Stock"));
    
    const prodName = String(getProp(product, "ProductName") || "").toLowerCase();
    const prodType = String(getProp(product, "Type") || getProp(product, "Category") || "").toLowerCase();
    const isCable = prodName.includes("cable") || prodType.includes("cable");
    
    const actualChange = isCable ? (change > 0 ? 5 : -5) : change;
    
    const newQty = (updated[itemCode] ? updated[itemCode].qty : 0) + actualChange;
    const maxLimit = isAlwaysLiveBrand ? 99999 : stockVal;
    
    if (newQty > maxLimit && maxLimit > 0) {
      return alert("Maximum stock limit reached!");
    }
    
    if (newQty <= 0) {
      delete updated[itemCode]; 
    } else {
      updated[itemCode] = Object.assign({}, product, { qty: newQty });
    }
    
    setCart(updated);
  };

  const handleCheckout = function() {
    // 🟢 LOCK SYSTEM FOR DOUBLE CLICK BUG
    if (submitLock.current === true) {
      return;
    }

    if (!paymentMode) {
      return alert("Please select Payment Mode!");
    }
    
    if (paymentMode === 'UPI' && !screenshotData) {
      return alert("Upload Payment Screenshot first!");
    }
    
    submitLock.current = true;
    setLoading(true);
    
    var itemsList = cartItems.map(function(i) { 
      return String(getProp(i, "ProductName") || "Premium Item") + " x" + i.qty; 
    });
    
    unlockedSchemes.forEach((sch) => {
      const match = sch.reward.match(/^(\d+)/);
      const freeQty = match ? parseInt(match[1]) : 1;
      itemsList.push(`🎁 FREE ITEM: ${sch.reward} (Qty: ${freeQty} @ ₹1 each) - Offer: ${sch.message}`);
    });
    
    if (combosApplied > 0) {
      itemsList.push(`🎁 APPLIED: Combo Offer (${combosApplied}x) - Saved ₹${comboDiscountAmount}`);
    }

    var finalItemsStr = itemsList.join(" | ");
    
    callAPI({
      action: "placeOrder",
      order: { 
        phone: user.phone, 
        shopName: user.shopName, 
        items: finalItemsStr, 
        totalAmount: baseTotalAmount, 
        finalAmount: finalAmount, 
        paymentMode: paymentMode, 
        comboDiscount: comboDiscountAmount,
        bulkDiscount: bulkDiscountAmount, 
        bulkPercent: potentialBulkPercent, 
        upiDiscount: cashDiscountAmount,
        rewards: unlockedSchemes.map(s => s.reward).join(", "), 
        remarks: orderRemarks,
        screenshot: screenshotData
      }
    }).then(function(res) {
      submitLock.current = false;
      setLoading(false);
      
      if (res && res.success) {
        alert("✅ ORDER CONFIRMED!\n\nDear " + user.shopName + ",\nThank you for choosing Yash Marketing.\n\nFinal Amount: ₹" + finalAmount + "\n\nWe will dispatch it shortly.");
        globalProps.logSpyData("Order Placed", "Val: ₹" + finalAmount);
        setCart({}); 
        setView("catalog");
      } else {
        alert("Order completed. We will process it shortly.");
        setCart({}); 
        setView("catalog");
      }
    }).catch(function() {
      submitLock.current = false;
      setLoading(false);
      alert("Network Error: Could not place order. Please try again.");
    });
  };

  // ==========================================
  // 5. RENDER CART UI
  // ==========================================
  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[180px] font-sans relative">

      <div className="grid grid-cols-2 gap-3 mb-6">
        {lockedSchemes.map((scheme, idx) => {
          const progress = calculateSchemeProgress(cartItems, scheme);
          return (
            <div 
              key={`locked-${idx}`} 
              className="p-3 rounded-2xl border-2 bg-amber-50 border-amber-300 flex flex-col justify-between"
            >
              <h4 className="font-black text-[10px] uppercase text-amber-900 leading-snug">
                {scheme.message}
              </h4>
              <div className="mt-2">
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border border-gray-300 shadow-inner">
                   <div 
                     className="bg-amber-500 h-full transition-all duration-500" 
                     style={{ width: Math.min((progress.current / progress.required) * 100, 100) + '%' }}
                   ></div>
                </div>
                <p className="text-[9px] font-bold mt-1 text-gray-600 leading-snug">
                  {progress.current} / {progress.required} added. Add {progress.required - progress.current} more to unlock!
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">🛒</span>
            <p className="font-black text-gray-400 mt-2 text-sm uppercase">
              Cart Khali Hai
            </p>
            <button 
              onClick={() => {
                setView("catalog");
              }} 
              className="mt-4 bg-blue-900 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-sm"
            >
              Catalog par jayein
            </button>
          </div>
        ) : (
          <React.Fragment>
            <div className="grid grid-cols-2 gap-3 mb-6">
              
              {cartItems.map((item) => {
                var smartImg = getSmartImage(item);
                var itemName = String(getProp(item, "ProductName") || "Premium Item");
                var dealerPrice = getNum(getProp(item, "DealerPrice"));
                var itemCode = String(getProp(item, "ItemCode") || "");
                var brandStr = String(getProp(item, "Brand") || "").toUpperCase();
                
                var showOnOrder = (brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY")) && getNum(getProp(item, "Stock")) <= 0;

                return (
                  <div 
                    key={itemCode} 
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
                  >
                    {showOnOrder && (
                      <span className="absolute top-2 left-2 bg-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase tracking-wider z-10 animate-pulse border border-orange-400">
                        ⏳ ON ORDER
                      </span>
                    )}
                    
                    {smartImg ? (
                      <img 
                        src={smartImg} 
                        className="w-16 h-16 object-contain mb-2 p-1" 
                        alt={itemName}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 text-[10px] mb-2">
                        No Img
                      </div>
                    )}
                    
                    <h4 className="text-xs font-black leading-tight line-clamp-2 h-8 text-gray-800 w-full px-1">
                      {itemName}
                    </h4>
                    
                    <div className="font-black text-blue-900 text-sm mt-1 mb-2">
                      ₹{(dealerPrice * item.qty).toLocaleString('en-IN')}
                    </div>
                    
                    <div className="flex items-center justify-between w-full bg-gray-100 rounded-xl p-1 border border-gray-200 mt-auto">
                      <button 
                        onClick={() => {
                          updateQty(item, -1);
                        }} 
                        className="bg-white text-gray-800 font-black w-8 h-8 rounded-lg shadow-sm flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-black text-blue-900 text-sm w-full text-center">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => {
                          updateQty(item, 1);
                        }} 
                        className="bg-blue-900 text-white font-black w-8 h-8 rounded-lg shadow-sm flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}

              {unlockedSchemes.map((sch, idx) => {
                const match = sch.reward.match(/^(\d+)/);
                const freeQty = match ? parseInt(match[1]) : 1;
                const cost = freeQty * 1; // 1 RS billing logic calculation

                return (
                  <div 
                    key={`freebie-${idx}`} 
                    className="bg-green-50 rounded-2xl p-3 shadow-sm border border-green-200 flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-[7px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest shadow-md z-20">
                      ₹1 / PC BILLING
                    </div>
                    
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-inner mb-2 border border-green-100">
                      🎁
                    </div>
                    
                    <h4 className="text-[10px] font-black text-green-900 leading-tight line-clamp-2 h-8 w-full">
                      {sch.reward}
                    </h4>
                    
                    <div className="font-black text-green-700 text-sm mt-auto pt-2">
                      ₹{cost}
                    </div>
                    
                    <div className="text-[9px] font-black text-green-800 bg-green-200 px-2 py-0.5 rounded mt-1 flex flex-col items-center justify-center">
                      <span>Qty: {freeQty}</span>
                    </div>
                  </div>
                );
              })}
              
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-dashed border-gray-200">
              <span className="font-bold text-gray-500 uppercase text-[10px]">
                Net Value
              </span>
              <span className="font-black text-lg text-gray-900">
                ₹{baseTotalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {totalFreebieCost > 0 && (
              <div className="flex justify-between items-center mt-3 text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-black uppercase text-[10px] flex items-center gap-1">
                  🎁 Freebies Billing (₹1/pc)
                </span>
                <span className="font-black text-sm">
                  +₹{totalFreebieCost.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            
            {combosApplied > 0 && comboDiscountAmount > 0 && (
              <div className="flex justify-between items-center mt-3 text-pink-700 bg-pink-50 p-2.5 rounded-xl border border-pink-200 shadow-sm">
                <span className="font-black uppercase text-[10px] flex items-center gap-1">
                  🔥 Combo Offer Applied ({combosApplied}x)
                </span>
                <span className="font-black text-sm">
                  -₹{comboDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            
            {bulkDiscountAmount > 0 && (
              <div className="flex justify-between items-center mt-2 text-green-700">
                <span className="font-black uppercase text-[10px]">
                  Bulk Discount ({potentialBulkPercent}%)
                </span>
                <span className="font-black text-sm">
                  -₹{bulkDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            
            {cashDiscountAmount > 0 && (
              <div className="flex justify-between items-center mt-2 text-green-700">
                <span className="font-black uppercase text-[10px]">
                  Cash Discount (2%)
                </span>
                <span className="font-black text-sm">
                  -₹{cashDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </React.Fragment>
        )}
      </div>

      {cartItems.length > 0 && (
        <React.Fragment>
          
          {(!isEligibleForDiscount) && totalMissedSavings > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-500 shadow-md animate-pulse">
               <h4 className="font-black text-red-900 text-sm flex items-center gap-2">
                 ⚠️ MISSED SAVINGS: ₹{totalMissedSavings.toLocaleString('en-IN')}
               </h4>
               <p className="text-[10px] font-bold text-red-700 mt-1.5 leading-snug">
                 तुम्ही <strong>₹{potentialBulkDiscount} चे Bulk Discount</strong> आणि <strong>₹{potentialCashDiscount} चे Cash Discount</strong> गमावत आहात! तुमचे पैसे वाचवण्यासाठी कृपया खाली <strong>COD</strong> किंवा <strong>UPI</strong> पेमेंट पर्याय निवडा.
               </p>
            </div>
          )}

          <h2 className="font-black text-gray-800 text-xl mb-4">Payment Options</h2>
          <div className="space-y-3 mb-8">
            
            <div 
              onClick={() => {
                setPaymentMode('COD');
              }} 
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMode === 'COD' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-black text-blue-900 flex items-center gap-1.5 tracking-tight text-sm">
                  Cash On Delivery
                  <span className="text-[9px] font-bold text-gray-500">(2% CASH DISCOUNT)</span>
                </div>
                <div className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded font-black">
                  EXTRA SAVINGS
                </div>
              </div>
            </div>

            <div 
              onClick={() => {
                setPaymentMode('UPI');
              }} 
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMode === 'UPI' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-black text-purple-900 flex items-center gap-1.5 tracking-tight text-sm">
                  <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    PhonePe
                  </span> 
                  UPI <span className="text-[9px] font-bold text-gray-500">(2% CASH DISCOUNT)</span>
                </div>
                <div className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded font-black">
                  EXTRA SAVINGS
                </div>
              </div>
              
              {paymentMode === 'UPI' && (
                <div 
                  className="mt-4 bg-white p-4 rounded-xl border border-purple-200 text-center animate-fade-in" 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <p className="text-xs font-bold mb-3">
                    Scan & Pay Exactly: <span className="text-purple-700 text-xl font-black">₹{finalAmount}</span>
                  </p>
                  <div className="relative inline-block border-4 border-purple-700 p-2 rounded-2xl bg-white shadow-md mb-2">
                    <img 
                      src={PHONEPE_QR_URL} 
                      className="w-48 h-48 object-contain mx-auto" 
                      alt="PhonePe UPI Barcode" 
                    />
                    <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-purple-700 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      PhonePe QR
                    </div>
                  </div>
                  <div className="text-center font-black text-purple-900 mt-3 mb-3 bg-purple-100 py-2 rounded-xl border border-purple-200 select-all">
                    UPI NO: {OFFICE_NUMBER}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold mb-3">
                    Upload Screenshot after payment to confirm order
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleScreenshotUpload} 
                    className="text-[10px] block mx-auto text-purple-900 font-black" 
                  />
                </div>
              )}
            </div>
            
            <div 
              onClick={() => {
                setPaymentMode('DAILY');
              }} 
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMode === 'DAILY' ? 'border-gray-800 bg-gray-50 shadow-md' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-black text-gray-800 text-sm">
                  Daily Collection (Auto-Pay)
                </div>
                <div className="bg-red-100 text-red-700 border border-red-200 text-[8px] px-2 py-0.5 rounded font-black uppercase">
                  0% Discount
                </div>
              </div>
              
              {paymentMode === 'DAILY' && (
                <div className="mt-4 rounded-xl overflow-hidden shadow-inner border border-gray-300">
                  <iframe 
                    width="100%" 
                    height="180" 
                    src="https://www.youtube.com/embed/tgbNymZ7vqY" 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 mb-8">
            <h3 className="font-black text-gray-800 text-sm mb-2 uppercase">💬 Add Order Remarks (Optional)</h3>
            <textarea
              value={orderRemarks}
              onChange={(e) => {
                setOrderRemarks(e.target.value);
              }}
              placeholder="Koi specific instruction ya request hai toh yahan likhein..."
              className="w-full bg-white p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 outline-none font-bold text-xs text-gray-700 shadow-sm transition-all"
              rows="2"
            ></textarea>
          </div>
          
          <div className="fixed bottom-[55px] left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-4 rounded-t-3xl shadow-[0_-10px_25px_rgba(0,0,0,0.1)] z-40">
            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-gray-400 uppercase">
              <span>Subtotal</span>
              <span className="line-through font-mono">
                ₹{baseTotalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-black text-gray-800 text-lg">Final Amount</span>
              <span className="text-blue-900 text-2xl font-black">
                ₹{finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={loading || submitLock.current} 
              className={`w-full text-white font-black text-base py-3.5 rounded-2xl shadow-lg active:scale-95 flex justify-center items-center ${(!paymentMode || submitLock.current) ? 'bg-gray-300' : 'bg-blue-900'}`}
            >
              {loading ? (
                <div className="border-4 border-white border-t-transparent w-6 h-6 rounded-full spinner"></div>
              ) : (
                "CONFIRM ORDER"
              )}
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}