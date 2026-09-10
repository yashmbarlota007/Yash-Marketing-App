import React, { useState, useEffect } from 'react';
import { API_URL, getNum, getProp, getSmartImage, groupProductsByVariant, calculateSchemeProgress } from '../utils/helpers';

export default function OffersView(props) {
  var products = props.products || [];
  var cart = props.cart;
  var setCart = props.setCart;
  var setView = props.setView;

  const [schemes, setSchemes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [activeSchemeProducts, setActiveSchemeProducts] = useState([]);
  const [activeSchemeTitle, setActiveSchemeTitle] = useState("");
  const [activeVariants, setActiveVariants] = useState({});

  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getSchemes" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).then(res => { 
      if (res && res.success) setSchemes(res.data); 
    }).catch(() => {});

    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDiscounts" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).then(res => { 
      if (res && res.success) setDiscounts(res.data); 
    }).catch(() => {});
  }, []);

  const cartItems = Object.values(cart);

  const updateQty = (product, change) => {
    const updated = Object.assign({}, cart);
    const itemCode = String(getProp(product, "ItemCode") || "");
    if (!itemCode) return;
    
    const stockVal = getNum(getProp(product, "Stock"));
    const brandStr = String(getProp(product, "Brand") || "").toUpperCase();
    const nameStr = String(getProp(product, "ProductName") || "").toUpperCase();
    const isAlwaysLiveBrand = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY") || nameStr.includes("HIKVISION") || nameStr.includes("VELOCITY");
    
    const prodName = String(getProp(product, "ProductName") || "").toLowerCase();
    const prodType = String(getProp(product, "Type") || getProp(product, "Category") || "").toLowerCase();
    const isCable = prodName.includes("cable") || prodType.includes("cable");
    
    const actualChange = isCable ? (change > 0 ? 5 : -5) : change;
    const newQty = (updated[itemCode] ? updated[itemCode].qty : 0) + actualChange;
    const maxLimit = isAlwaysLiveBrand ? 99999 : stockVal;
    
    if (newQty > maxLimit && maxLimit > 0) return alert("Maximum stock limit reached!");
    if (newQty <= 0) delete updated[itemCode]; 
    else updated[itemCode] = Object.assign({}, product, { qty: newQty });
    
    setCart(updated);
  };

  const handleViewItems = (scheme) => {
    const targetStr = String(scheme.target || "").toLowerCase();
    const targets = targetStr.split(",").map(t => t.trim()).filter(Boolean);

    let eligibleProducts = products.filter(p => {
      const brand = String(getProp(p, "Brand") || "").toLowerCase();
      const name = String(getProp(p, "ProductName") || "").toLowerCase();
      const type = String(getProp(p, "Type") || getProp(p, "Category") || "").toLowerCase();
      
      return targets.some(t => brand === t || name.includes(t) || type === t);
    });

    eligibleProducts = eligibleProducts.filter(p => {
      const stockVal = getNum(getProp(p, "Stock"));
      const brandStr = String(getProp(p, "Brand") || "").toUpperCase();
      const nameStr = String(getProp(p, "ProductName") || "").toUpperCase();
      const isAlwaysLive = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY") || nameStr.includes("HIKVISION") || nameStr.includes("VELOCITY");
      
      return stockVal > 0 || isAlwaysLive;
    });

    if (eligibleProducts.length === 0) {
      alert("Is scheme ke eligible products abhi stock mein nahi hain.");
      return;
    }

    setActiveSchemeProducts(eligibleProducts);
    setActiveSchemeTitle(scheme.message);
    setShowProductsModal(true);
  };

  const comboScheme = schemes.find(s => String(s.type).toUpperCase() === 'COMBO' || String(s.target).toUpperCase().includes('COMBO'));
  let comboP1 = null, comboP2 = null;
  let p1Price = 0, p2Price = 0, originalTotal = 0, savingsAmt = 0, savingsPct = 0, comboPrice = 400;

  if (comboScheme && comboScheme.target) {
      let targets = comboScheme.target.split(",").map(t => t.trim().toLowerCase());
      if (targets.length >= 2) {
          comboP1 = products.find(p => String(getProp(p, "ProductName")).toLowerCase().trim() === targets[0]);
          comboP2 = products.find(p => String(getProp(p, "ProductName")).toLowerCase().trim() === targets[1]);
          
          if (comboP1 && comboP2) {
              p1Price = getNum(getProp(comboP1, "DealerPrice"));
              p2Price = getNum(getProp(comboP2, "DealerPrice"));
              originalTotal = p1Price + p2Price;
              
              const match = String(comboScheme.message).match(/₹(\d+)/) || String(comboScheme.reward).match(/₹(\d+)/) || String(comboScheme.reward).match(/(\d+)/);
              comboPrice = match ? parseInt(match[1] || match[0]) : 400;
              savingsAmt = originalTotal > comboPrice ? originalTotal - comboPrice : 0;
              savingsPct = originalTotal > 0 ? Math.round((savingsAmt / originalTotal) * 100) : 0;
          }
      }
  }

  // 🟢 NAYA LOGIC: COMBO MULTIPLES OF 10
  const handleAddCombo = () => {
    if (comboP1 && comboP2) {
      let updated = Object.assign({}, cart);
      const itemCode1 = String(getProp(comboP1, "ItemCode"));
      const itemCode2 = String(getProp(comboP2, "ItemCode"));
      
      updated[itemCode1] = Object.assign({}, comboP1, { qty: (updated[itemCode1] ? updated[itemCode1].qty : 0) + 10 });
      updated[itemCode2] = Object.assign({}, comboP2, { qty: (updated[itemCode2] ? updated[itemCode2].qty : 0) + 10 });
      
      setCart(updated);
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      }
      alert("✅ 10 Pairs Combo added to cart successfully!");
    }
  };

  const groupedModalProducts = groupProductsByVariant(activeSchemeProducts);

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[120px] font-sans animate-fade-in relative">
      <div className="mb-4">
        <h2 className="font-black text-gray-900 text-xl tracking-tight">🎁 Exclusive Deals & Offers</h2>
        <p className="text-xs text-gray-500 font-bold mt-0.5">Maximize your margins with active wholesale schemes.</p>
      </div>

      {comboP1 && comboP2 && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950 rounded-3xl p-1 shadow-xl relative overflow-hidden border border-indigo-800">
            <div className="bg-indigo-950 rounded-[22px] p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse shadow-md z-20">
                ⚡ Limited Time Deal
              </div>
              
              <span className="bg-yellow-400 text-indigo-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide inline-block mb-3">
                🔥 EXCLUSIVE COMBO OFFER
              </span>
              
              <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                  <div className="flex-1 bg-white bg-opacity-10 p-2 rounded-2xl border border-white border-opacity-20 flex flex-col items-center text-center">
                    <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center p-1 mb-2 shadow-inner">
                      {getSmartImage(comboP1) ? <img src={getSmartImage(comboP1)} className="w-full h-full object-contain" /> : "📦"}
                    </div>
                    <div className="text-white text-[9px] font-bold leading-tight h-6 line-clamp-2 mb-1">{getProp(comboP1, "ProductName")}</div>
                    <div className="text-red-300 text-[10px] font-bold line-through">₹{p1Price}</div>
                  </div>

                  <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center font-black text-indigo-900 text-sm shadow-xl z-20 shrink-0 border-2 border-indigo-950">+</div>
                  
                  <div className="flex-1 bg-white bg-opacity-10 p-2 rounded-2xl border border-white border-opacity-20 flex flex-col items-center text-center">
                    <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center p-1 mb-2 shadow-inner">
                      {getSmartImage(comboP2) ? <img src={getSmartImage(comboP2)} className="w-full h-full object-contain" /> : "📦"}
                    </div>
                    <div className="text-white text-[9px] font-bold leading-tight h-6 line-clamp-2 mb-1">{getProp(comboP2, "ProductName")}</div>
                    <div className="text-red-300 text-[10px] font-bold line-through">₹{p2Price}</div>
                  </div>
              </div>
              
              <div className="bg-white rounded-2xl p-3 shadow-inner flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Original:</span>
                      <span className="text-[11px] text-gray-400 font-black line-through">₹{originalTotal}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-green-600 font-black text-3xl tracking-tighter">₹{comboPrice}</span>
                    </div>
                    <div className="text-[9px] text-green-700 font-black tracking-wider uppercase mt-1 bg-green-100 inline-block px-1.5 py-0.5 rounded">
                      ✨ YOU SAVE ₹{savingsAmt} ({savingsPct}%)
                    </div>
                  </div>

                  {/* 🟢 BUTTON TEXT UPDATED FOR 10 PAIRS */}
                  <button 
                    onClick={handleAddCombo} 
                    className="z-10 bg-gradient-to-r from-green-500 to-green-600 text-white font-black px-4 py-3 rounded-xl shadow-[0_5px_15px_rgba(34,197,94,0.4)] active:scale-95 transition-all flex flex-col items-center text-xs border border-green-400"
                  >
                    <span>🛒 ADD 10 PAIRS</span>
                    <span className="text-[7px] opacity-90 font-bold uppercase tracking-widest mt-0.5">Instant Discount</span>
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-black text-gray-800 text-sm mb-3 uppercase tracking-wider">🎯 Active Target Rewards</h3>
        
        {/* 🟢 TARGET REWARDS CONVERTED TO 2X2 GRID */}
        <div className="grid grid-cols-2 gap-3">
          {schemes.filter(s => String(s.type).toUpperCase() !== 'COMBO').map((sch, i) => {
            const progress = calculateSchemeProgress(cartItems, sch);
            return (
              <div key={i} className={`bg-white p-3 rounded-2xl shadow-sm border flex flex-col justify-between ${progress.isUnlocked ? 'border-green-400 bg-green-50' : 'border-gray-100'}`}>
                <div>
                  <span className="bg-blue-100 text-blue-800 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
                    {sch.type} Scheme
                  </span>
                  <h4 className="font-black text-gray-800 text-[10px] leading-snug line-clamp-3">{sch.message}</h4>
                  <p className="text-[9px] text-red-600 font-black mt-1 uppercase line-clamp-2">🎁 {sch.reward}</p>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between items-end mb-1">
                     <span className="text-[8px] font-black text-gray-500 uppercase tracking-wide">Progress</span>
                     <span className={`text-[9px] font-black ${progress.isUnlocked ? 'text-green-600' : 'text-blue-700'}`}>
                        {progress.current} / {progress.required}
                     </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2">
                     <div 
                        className={`${progress.isUnlocked ? 'bg-green-500' : 'bg-blue-600'} h-full transition-all duration-500`} 
                        style={{ width: Math.min((progress.current / progress.required) * 100, 100) + '%' }}
                     ></div>
                  </div>

                  <button 
                    onClick={() => handleViewItems(sch)}
                    className={`w-full font-black text-[9px] px-2 py-2 rounded-lg shadow-sm active:scale-95 transition-colors ${progress.isUnlocked ? 'bg-green-600 text-white' : 'bg-blue-900 text-white'}`}
                  >
                    {progress.isUnlocked ? '✅ UNLOCKED' : '🛒 ADD ITEMS'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-black text-gray-800 text-sm mb-3 uppercase tracking-wider">📊 Volume Discount Slabs</h3>
        <div className="grid grid-cols-2 gap-3">
          {discounts.map((d, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-[9px] text-gray-400 font-black uppercase">Min Order Value</div>
              <div className="font-black text-blue-950 text-base mt-0.5">₹{Number(d.minAmount).toLocaleString('en-IN')}</div>
              <div className="mt-2 bg-green-50 text-green-700 text-xs font-black py-1 px-2 rounded-lg border border-green-100 inline-block">
                🎉 {d.percent}% EXTRA OFF
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProductsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col justify-end animate-fade-in">
           <div className="absolute inset-0" onClick={() => setShowProductsModal(false)}></div>
           <div className="bg-gray-50 w-full max-w-md rounded-t-3xl h-[85vh] flex flex-col relative z-10 animate-slide-up shadow-2xl overflow-hidden">
              
              <div className="p-4 border-b flex justify-between items-center bg-blue-900 text-white shadow-md z-20 shrink-0">
                 <div>
                    <h3 className="font-black text-sm uppercase leading-tight pr-4">{activeSchemeTitle}</h3>
                    <p className="text-[10px] font-bold text-blue-200 mt-1 uppercase tracking-wider">Eligible Scheme Items</p>
                 </div>
                 <button 
                   onClick={() => setShowProductsModal(false)} 
                   className="w-8 h-8 bg-blue-800 rounded-full font-black text-lg flex items-center justify-center shrink-0 border border-blue-700"
                 >✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-32">
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    {groupedModalProducts.map((p, idx) => {
                       var name = String(getProp(p, "ProductName") || "Premium Item");
                       var activeItemCode = activeVariants[String(getProp(p, "ItemCode") || "")] || 
                                            (p.variants && p.variants[0] ? String(getProp(p.variants[0], "ItemCode") || "") : String(getProp(p, "ItemCode") || ""));
                       var activeVariant = p.variants ? p.variants.find(v => String(getProp(v, "ItemCode") || "") === activeItemCode) || p : p;
                       
                       const currentQty = cart[String(getProp(activeVariant, "ItemCode") || "")] ? cart[String(getProp(activeVariant, "ItemCode") || "")].qty : 0;
                       const smartImg = getSmartImage(activeVariant);
                       const dealerVal = getNum(getProp(activeVariant, "DealerPrice"));
                       const stockVal = getNum(getProp(activeVariant, "Stock"));
                       
                       const brandStr = String(getProp(activeVariant, "Brand") || "").toUpperCase();
                       const nameStr = String(getProp(activeVariant, "ProductName") || "").toUpperCase();
                       const isAlwaysLiveBrand = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY") || nameStr.includes("HIKVISION") || nameStr.includes("VELOCITY");
                       const showOnOrder = isAlwaysLiveBrand && stockVal <= 0;

                       return (
                         <div key={`${activeItemCode}-${idx}`} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col justify-between border border-gray-100 relative overflow-hidden">
                           
                           {showOnOrder && (
                             <span className="absolute top-2 left-2 bg-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase tracking-wider z-10 animate-pulse border border-orange-400">
                               ⏳ ON ORDER
                             </span>
                           )}
                           
                           <div className="mt-1">
                             {smartImg ? (
                               <img 
                                 src={smartImg} 
                                 className="h-28 w-full object-contain mb-2 p-1" 
                                 onError={(e) => { e.target.outerHTML = '<div class="h-28 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">No Image</div>'; }} 
                               /> 
                             ) : (
                               <div className="h-28 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">No Image</div>
                             )}
                             <h3 className="font-bold text-xs leading-snug line-clamp-2 h-8 text-gray-800">{name}</h3>
                           </div>
                           
                           {p.isGrouped && (
                             <div className="flex flex-wrap gap-1 mt-1 mb-2 relative z-20">
                               {p.variants.map(v => (
                                 <button 
                                   key={String(getProp(v, "ItemCode"))} 
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     setActiveVariants(prev => ({ ...prev, [String(getProp(p, "ItemCode"))]: String(getProp(v, "ItemCode")) })); 
                                   }} 
                                   className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${String(getProp(v, "ItemCode")) === activeItemCode ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                 >
                                   {v.capacity}
                                 </button>
                               ))}
                             </div>
                           )}

                           <div className="mt-1 relative z-20">
                             <div className="font-black text-lg mb-2 tracking-tight text-blue-950">₹{dealerVal}</div>
                             
                             {currentQty > 0 ? (
                               <div className="flex justify-between items-center bg-blue-50 rounded-xl p-1 border border-blue-100">
                                 <button onClick={() => updateQty(activeVariant, -1)} className="bg-white text-blue-900 font-black w-8 h-8 rounded-lg shadow-sm">-</button>
                                 <span className="font-black text-blue-900">{currentQty}</span>
                                 <button onClick={() => updateQty(activeVariant, 1)} className="bg-blue-900 text-white font-black w-8 h-8 rounded-lg shadow-sm">+</button>
                               </div>
                             ) : (
                               <button onClick={() => updateQty(activeVariant, 1)} className="w-full bg-gray-950 text-white text-[11px] font-bold py-3 rounded-xl shadow-sm">
                                 {showOnOrder ? "+ ADD (Next Day)" : "+ ADD"}
                               </button>
                             )}
                           </div>
                         </div>
                       );
                    })}
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20">
                 <button 
                   onClick={() => { setShowProductsModal(false); setView('cart'); }} 
                   className="w-full bg-green-600 text-white font-black text-sm py-4 rounded-xl shadow-lg active:scale-95 flex justify-center items-center gap-2"
                 >
                   🛒 PROCEED TO CART
                 </button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}