import React, { useState, useEffect } from 'react';
import { 
  API_URL, 
  getNum, 
  getProp, 
  getSmartImage, 
  groupProductsByVariant, 
  calculateSchemeProgress 
} from '../utils/helpers';
import { ProgressBar } from './SharedUI';

export function Catalog(props) {
  // ==========================================
  // 1. PROPS & STATE INITIALIZATION
  // ==========================================
  var user = props.user;
  var callAPI = props.callAPI;
  var cart = props.cart;
  var setCart = props.setCart;
  var products = props.products;
  var setProducts = props.setProducts;
  var setView = props.setView;
  var globalProps = props.globalProps;
  
  const [loading, setLoading] = useState(products.length === 0);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [discounts, setDiscounts] = useState([
    { minAmount: 10000, percent: 1 }, 
    { minAmount: 20000, percent: 1.5 }
  ]);
  
  const [schemes, setSchemes] = useState([]); 
  const [celebratedTiers, setCelebratedTiers] = useState({ 
    tier1: false, 
    tier2: false 
  });
  const [activeVariants, setActiveVariants] = useState({});
  
  // Filter States
  const [brandFilter, setBrandFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");

  // ==========================================
  // 2. DATA FETCHING (API CALLS)
  // ==========================================
  useEffect(() => {
    // Fetch Products
    if (products.length === 0) {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "getProducts" }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      })
      .then((r) => {
        return r.json();
      })
      .then((res) => { 
        if (res && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
        setLoading(false); 
      })
      .catch(() => {
        setLoading(false);
      });
    }
    
    // Fetch Discounts
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
    .catch(() => {});

    // Fetch Schemes
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
    .catch(() => {});
  }, []);

  // ==========================================
  // 3. CART & PROGRESS CALCULATIONS
  // ==========================================
  const cartItems = Object.values(cart);
  
  const totalItems = cartItems.reduce((a, b) => {
    return a + b.qty;
  }, 0);
  
  const totalAmount = cartItems.reduce((a, b) => {
    return a + (getNum(getProp(b, "DealerPrice")) * b.qty);
  }, 0) - (function(){
    let nQty = 0;
    let pQty = 0;
    let nPrice = 0;
    let pPrice = 0;
    
    cartItems.forEach((i) => {
      let n = String(getProp(i, "ProductName")).toLowerCase().trim();
      if (n === "velocity neckband wave") { 
        nQty += i.qty; 
        nPrice = getNum(getProp(i, "DealerPrice")); 
      }
      if (n === "velocity airpods tws pods") { 
        pQty += i.qty; 
        pPrice = getNum(getProp(i, "DealerPrice")); 
      }
    });
    
    if (Math.min(nQty, pQty) > 0 && (nPrice + pPrice) > 400) {
      return ((nPrice + pPrice) - 400) * Math.min(nQty, pQty);
    } else {
      return 0;
    }
  })();

  // Discount Tier Celebration Logic
  useEffect(() => {
    var sortedDiscounts = [...discounts]
      .map((d) => {
        return { minAmount: getNum(d.minAmount), percent: getNum(d.percent) };
      })
      .filter((d) => {
        return !isNaN(d.minAmount) && !isNaN(d.percent);
      })
      .sort((a, b) => {
        return a.minAmount - b.minAmount;
      });
      
    var tier1Min = (sortedDiscounts[0] && sortedDiscounts[0].minAmount) ? sortedDiscounts[0].minAmount : 10000;
    var tier2Min = (sortedDiscounts[1] && sortedDiscounts[1].minAmount) ? sortedDiscounts[1].minAmount : 20000;

    if (totalAmount >= tier2Min) {
      if (!celebratedTiers.tier2) { 
        if (window.confetti) {
          window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); 
        }
        setCelebratedTiers((prev) => {
          return {...prev, tier2: true };
        }); 
      }
    } else if (totalAmount >= tier1Min) {
      if (!celebratedTiers.tier1) { 
        if (window.confetti) {
          window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setCelebratedTiers((prev) => {
          return {...prev, tier1: true };
        }); 
      }
      if (celebratedTiers.tier2) {
        setCelebratedTiers((prev) => {
          return {...prev, tier2: false };
        });
      }
    } else { 
      if (celebratedTiers.tier1 || celebratedTiers.tier2) {
        setCelebratedTiers({ tier1: false, tier2: false }); 
      }
    }
  }, [totalAmount, discounts, celebratedTiers]);

  // ==========================================
  // 4. EVENT HANDLERS
  // ==========================================
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const openCategory = (type) => { 
    window.history.pushState({ modal: 'category' }, ''); 
    setSelectedType(type); 
    setBrandFilter("");
    setSortFilter("");
  };
  
  const openProductModal = (p) => { 
    window.history.pushState({ modal: 'product' }, ''); 
    setSelectedProduct(p); 
  };

  useEffect(() => {
    const handlePop = (e) => { 
      if (selectedProduct) {
        setSelectedProduct(null); 
      } else if (selectedType) { 
        setSelectedType(null); 
        setBrandFilter(""); 
        setSortFilter(""); 
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [selectedProduct, selectedType]);

  const updateQty = (product, change) => {
    if (globalProps.customerMode) {
      return;
    }
    
    const updated = Object.assign({}, cart);
    const itemCode = String(getProp(product, "ItemCode") || "");
    
    if (!itemCode) {
      return;
    }
    
    const stockVal = getNum(getProp(product, "Stock"));
    const brandStr = String(getProp(product, "Brand") || "").toUpperCase();
    const isAlwaysLiveBrand = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
    
    const prodName = String(getProp(product, "ProductName") || "").toLowerCase();
    const prodType = String(getProp(product, "Type") || "").toLowerCase();
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

  // ==========================================
  // 5. LOADER STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-blue-900">
        <div className="border-4 border-current border-t-transparent w-12 h-12 rounded-full spinner mb-4"></div>
        <p className="font-bold">Syncing Inventory...</p>
      </div>
    );
  }

  // ==========================================
  // 6. STRICT IN-STOCK FILTER ENGINE
  // ==========================================
  const inStockFlat = products.filter((p) => {
    const stockVal = getNum(getProp(p, "Stock"));
    const brandStr = String(getProp(p, "Brand") || "").toUpperCase();
    return stockVal > 0 || brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
  });
  
  const inStockProducts = groupProductsByVariant(inStockFlat);

  // ==========================================
  // 7. RENDER PRODUCTS ENGINE
  // ==========================================
  const renderProducts = (productList) => {
    return (
      <div className="p-4 pb-[140px] grid grid-cols-2 gap-4">
        {productList.map((p, idx) => {
          var name = String(getProp(p, "ProductName") || "Premium Item");
          var activeItemCode = activeVariants[String(getProp(p, "ItemCode") || "")] || 
                               (p.variants && p.variants[0] ? String(getProp(p.variants[0], "ItemCode") || "") : String(getProp(p, "ItemCode") || ""));
          var activeVariant = p.variants ? p.variants.find(v => String(getProp(v, "ItemCode") || "") === activeItemCode) || p : p;
          
          const currentQty = cart[String(getProp(activeVariant, "ItemCode") || "")] ? cart[String(getProp(activeVariant, "ItemCode") || "")].qty : 0;
          const smartImg = getSmartImage(activeVariant);
          const mrpVal = getNum(getProp(activeVariant, "MRP"));
          const dealerVal = getNum(getProp(activeVariant, "DealerPrice"));
          const hasDiscount = mrpVal > dealerVal && dealerVal > 0;
          const stockVal = getNum(getProp(activeVariant, "Stock"));
          
          const isNewItem = String(getProp(activeVariant, "IsNew")).toUpperCase() === "TRUE" || String(getProp(activeVariant, "Tags")).toUpperCase().includes("NEW");
          const brandStr = String(getProp(activeVariant, "Brand") || "").toUpperCase();
          const isAlwaysLiveBrand = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
          
          const showOnOrder = isAlwaysLiveBrand && stockVal <= 0;
          const isOutOfStock = stockVal <= 0 && !isAlwaysLiveBrand;

          return (
            <div 
              key={`${activeItemCode}-${idx}`} 
              className="bg-white rounded-2xl p-3 shadow-sm flex flex-col justify-between border border-gray-50 relative overflow-hidden"
            >
              {isNewItem && (
                <span className="absolute top-2 right-2 bg-pink-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-md uppercase tracking-wider z-10 animate-bounce">
                  ✨ NEW
                </span>
              )}
              
              {showOnOrder && !isNewItem && (
                <span className="absolute top-2 left-2 bg-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase tracking-wider z-10 animate-pulse border border-orange-400">
                  ⏳ ON ORDER
                </span>
              )}
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded uppercase shadow-lg transform -rotate-12 border border-red-800">
                    Out of Stock
                  </span>
                </div>
              )}
              
              <div 
                className="mt-1 cursor-pointer" 
                onClick={() => {
                  openProductModal(p);
                }}
              >
                {smartImg ? (
                  <img 
                    src={smartImg} 
                    className={`h-32 w-full object-contain mb-2 p-1 ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
                    onError={(e) => { 
                      e.target.outerHTML = '<div class="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">No Image</div>'; 
                    }} 
                    alt={name} 
                  /> 
                ) : (
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">
                    No Image
                  </div>
                )}
                <h3 className={`font-bold text-xs leading-snug line-clamp-2 h-8 ${isOutOfStock ? 'text-gray-400' : ''}`}>
                  {name}
                </h3>
              </div>
              
              {p.isGrouped && (
                <div className="flex flex-wrap gap-1 mt-1 mb-2 relative z-20">
                  {p.variants.map((v) => {
                    return (
                      <button 
                        key={String(getProp(v, "ItemCode"))} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveVariants((prev) => {
                            return {
                              ...prev, 
                              [String(getProp(p, "ItemCode"))]: String(getProp(v, "ItemCode")) 
                            };
                          }); 
                        }} 
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${String(getProp(v, "ItemCode")) === activeItemCode ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                      >
                        {v.capacity}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-1 relative z-20">
                {!globalProps.customerMode ? (
                  <div>
                    {hasDiscount && dealerVal > 0 ? (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-gray-400 font-bold line-through tracking-tight">MRP: ₹{mrpVal}</span>
                        <span className="text-[9px] bg-green-100 text-green-700 font-black px-1.5 py-0.5 rounded shadow-sm">
                          {Math.round(((mrpVal - dealerVal) / mrpVal) * 100)}% OFF
                        </span>
                      </div>
                    ) : ( 
                      mrpVal > 0 && (
                        <div className="text-[10px] text-gray-400 font-bold line-through tracking-tight mb-1">
                          MRP: ₹{mrpVal}
                        </div>
                      )
                    )}
                    
                    <div className={`font-black text-lg mb-2 tracking-tight ${isOutOfStock ? 'text-gray-400' : 'text-blue-950'}`}>
                      {dealerVal > 0 ? `₹${dealerVal}` : "Contact Us"}
                    </div>
                    
                    {dealerVal > 0 && (
                      isOutOfStock ? (
                        <button disabled className="w-full bg-gray-100 text-gray-400 text-[11px] font-bold py-3 rounded-xl shadow-sm cursor-not-allowed">
                          OUT OF STOCK
                        </button>
                      ) : currentQty > 0 ? (
                        <div className="flex justify-between items-center bg-blue-50 rounded-xl p-1 border border-blue-100">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              updateQty(activeVariant, -1); 
                            }} 
                            className="bg-white text-blue-900 font-black w-8 h-8 rounded-lg shadow-sm"
                          >
                            -
                          </button>
                          <span className="font-black text-blue-900">{currentQty}</span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              updateQty(activeVariant, 1); 
                            }} 
                            className="bg-blue-900 text-white font-black w-8 h-8 rounded-lg shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateQty(activeVariant, 1); 
                          }} 
                          className="w-full bg-gray-950 text-white text-[11px] font-bold py-3 rounded-xl shadow-sm"
                        >
                          {showOnOrder ? "+ ADD (Next Day)" : "+ ADD"}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareText = `🔥 Check out this item at our store!\n\n📦 *Product:* ${name} (${activeVariant.capacity})\n⚡ *Brand:* ${String(getProp(activeVariant, "Brand"))}\n\n🏢 *Dealer:* ${user ? user.shopName : ''}\n📞 *Contact:* ${user ? user.phone : ''}`;
                      if (navigator.share) {
                        navigator.share({ title: name, text: shareText, url: smartImg }).catch(() => {});
                      } else {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\nImage: " + smartImg)}`, '_blank');
                      }
                    }} 
                    className="w-full bg-green-600 text-white text-[11px] font-black py-3 rounded-xl flex items-center justify-center gap-1 shadow-sm"
                  >
                    📲 SHARE PHOTO
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================
  // 8. MAIN CONTENT ROUTER
  // ==========================================
  let mainContent;
  
  if (!loading && products.length === 0) {
    mainContent = (
      <div className="flex flex-col items-center justify-center p-8 mt-10 text-center animate-fade-in">
        <span className="text-5xl mb-4">📭</span>
        <h3 className="font-black text-gray-800 text-lg mb-2">Inventory Sync Failed</h3>
        <p className="text-xs text-gray-500 font-bold mb-6">Database se items fetch nahi ho paaye. Please refresh manually.</p>
        <button 
          onClick={() => {
            window.location.reload();
          }} 
          className="bg-blue-900 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md active:scale-95"
        >
          🔄 FORCE REFRESH
        </button>
      </div>
    );
  } else if (searchQuery.trim() !== "") {
    mainContent = renderProducts(inStockProducts.filter((p) => {
      return String(getProp(p, "ProductName") || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             String(getProp(p, "Brand") || "").toLowerCase().includes(searchQuery.toLowerCase());
    }));
  } else if (!selectedType) {
    const types = [...new Set(inStockFlat.map((p) => {
      return String(getProp(p, "Type") || getProp(p, "Category") || "").trim();
    }).filter(Boolean))].sort();
    
    mainContent = (
      <div className="p-4 pb-[140px]">
        <h2 className="font-black text-gray-800 text-xl mb-4">Select Category</h2>
        {types.length === 0 && !loading && (
           <div className="text-center p-8 bg-gray-50 rounded-2xl border text-gray-500 font-bold text-xs">
             Categories found empty.
           </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {types.map((type) => {
            const cover = getSmartImage(inStockFlat.find((p) => {
              return String(getProp(p, "Type") || getProp(p, "Category") || "").trim() === type;
            }));
            
            const categoryCount = inStockProducts.filter((p) => {
              return String(getProp(p, "Type") || getProp(p, "Category") || "").trim() === type;
            }).length;
            
            return (
              <div 
                key={type} 
                onClick={() => {
                  openCategory(type);
                }} 
                className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center cursor-pointer active:scale-95 h-40 border border-gray-100"
              >
                {cover ? (
                  <img src={cover} className="h-16 object-contain mb-3" alt={type} /> 
                ) : (
                  <div className="text-3xl mb-3">📦</div>
                )}
                <h3 className="font-extrabold text-sm text-center truncate w-full text-gray-800 flex items-center justify-center gap-1.5">
                  {type} 
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-blue-100">
                    {categoryCount}
                  </span>
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    // ACTIVE CATEGORY VIEW
    let displayProducts = inStockProducts.filter((p) => {
      return String(getProp(p, "Type") || getProp(p, "Category") || "").trim() === selectedType;
    });
    
    const categoryBrands = [...new Set(displayProducts.map((p) => {
      return String(getProp(p, "Brand") || "").trim();
    }).filter(Boolean))].sort();

    // Filtering by Brand
    if (brandFilter) {
      displayProducts = displayProducts.filter((p) => {
        return String(getProp(p, "Brand") || "").trim() === brandFilter;
      });
    }
    
    // Sorting by Price (Default High to Low)
    if (sortFilter === "low") {
      displayProducts.sort((a,b) => {
        return getNum(getProp(a, "DealerPrice")) - getNum(getProp(b, "DealerPrice"));
      });
    } else {
      displayProducts.sort((a,b) => {
        return getNum(getProp(b, "DealerPrice")) - getNum(getProp(a, "DealerPrice"));
      });
    }

    mainContent = (
      <div>
        <div className="p-4 bg-white bg-opacity-95 z-20 border-b flex justify-between items-center shadow-sm">
          <button 
            onClick={() => { 
              window.history.back(); 
              setBrandFilter(""); 
              setSortFilter(""); 
            }} 
            className="font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"
          >
            ← Categories
          </button>
          
          <span className="font-black text-gray-800">
            {selectedType}
          </span>
          
          <button 
            onClick={() => {
              let shareText = `🔥 *Yash Marketing - ${selectedType} Catalog* 🔥\n\n`;
              displayProducts.slice(0, 15).forEach((p, idx) => {
                shareText += `${idx + 1}. *${String(getProp(p, "ProductName") || "")}*\n💰 Price: ₹${getNum(getProp(p, globalProps.customerMode ? "MRP" : "DealerPrice"))}\n🔗 Photo: ${getSmartImage(p)}\n\n`;
              });
              
              if (navigator.share) {
                navigator.share({ title: `${selectedType} Catalog`, text: shareText }).catch(() => {});
              } else {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
              }
            }} 
            className="font-black text-xs text-white bg-green-600 px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95"
          >
            📲 SHARE
          </button>
        </div>

        <div className="bg-white px-4 py-3 border-b flex gap-3 overflow-x-auto no-scrollbar shadow-sm">
           <select 
             value={brandFilter} 
             onChange={(e) => {
               setBrandFilter(e.target.value);
             }} 
             className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none shrink-0"
           >
             <option value="">All Brands</option>
             {categoryBrands.map((b) => {
               return (
                 <option key={b} value={b}>{b}</option>
               );
             })}
           </select>
           
           <select 
             value={sortFilter} 
             onChange={(e) => {
               setSortFilter(e.target.value);
             }} 
             className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none shrink-0"
           >
             <option value="">Price: High to Low</option>
             <option value="low">Price: Low to High</option>
           </select>
        </div>

        {displayProducts.length > 0 ? (
          renderProducts(displayProducts)
        ) : (
          <div className="text-center p-8 text-gray-400 font-bold text-sm mt-10">
            No products found for this filter.
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 9. FINAL COMPONENT RETURN
  // ==========================================
  return (
    <div className="max-w-md mx-auto relative flex flex-col">
      <div className="sticky z-30 bg-white shadow-md border-b" style={{ top: '58px' }}>
        {cartItems.length > 0 && !globalProps.customerMode && (
          <React.Fragment>
            <ProgressBar totalAmount={totalAmount} discounts={discounts} />
            {/* 🟢 THE ENTIRE SCHEMES TRACKER GRID HAS BEEN REMOVED FROM HERE AS PER YOUR INSTRUCTION */}
          </React.Fragment>
        )}
        
        <div className="p-3 bg-white flex items-center border-b">
          <input 
            type="text" 
            placeholder="Search products, brands..." 
            value={searchQuery} 
            onChange={handleSearchChange} 
            className="w-full bg-gray-100 p-3 rounded-xl outline-none font-bold text-sm border focus:border-blue-300 transition-colors" 
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery("");
              }} 
              className="ml-2 bg-gray-200 text-gray-600 font-bold px-3 py-3 rounded-xl"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {mainContent}
      
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => {
            window.history.back();
          }} 
          cart={cart} 
          updateQty={updateQty} 
          user={user} 
          globalProps={globalProps} 
          activeVariants={activeVariants} 
          setActiveVariants={setActiveVariants} 
        />
      )}
    </div>
  );
}

// ==========================================
// 10. PRODUCT DETAIL MODAL COMPONENT
// ==========================================
export function ProductDetailModal(props) {
  var product = props.product;
  var onClose = props.onClose;
  var cart = props.cart;
  var updateQty = props.updateQty;
  var user = props.user;
  var globalProps = props.globalProps;
  var activeVariants = props.activeVariants;
  var setActiveVariants = props.setActiveVariants;
  
  var activeItemCode = activeVariants[String(getProp(product, "ItemCode") || "")] || 
                       (product.variants && product.variants[0] ? String(getProp(product.variants[0], "ItemCode") || "") : String(getProp(product, "ItemCode") || ""));
  
  var activeVariant = product.variants ? product.variants.find((v) => {
    return String(getProp(v, "ItemCode") || "") === activeItemCode;
  }) || product : product;

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imagesList, setImagesList] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.25);

  const activeVariantCode = String(getProp(activeVariant, "ItemCode") || "");
  const currentQty = cart[activeVariantCode] ? cart[activeVariantCode].qty : 0;

  useEffect(() => {
    const list = [];
    
    // Drive Link Processor
    const formatImg = (url) => {
      let cleanUrl = String(url).trim();
      if (cleanUrl.indexOf("//") === 0) {
        cleanUrl = "https:" + cleanUrl;
      }
      if (cleanUrl.includes("drive.google.com")) {
        let fileId = "";
        const dMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        
        if (dMatch) {
          fileId = dMatch[1];
        } else if (idMatch) {
          fileId = idMatch[1];
        }
        
        if (fileId) {
          return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
        }
      }
      return cleanUrl;
    };

    const mainImg = getSmartImage(activeVariant);
    if (mainImg) {
      list.push(mainImg);
    }
    
    var allVariants = product.variants || [product];
    
    allVariants.forEach(function(v) {
      Object.keys(v).forEach((key) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes("image") || keyLower.includes("photo") || keyLower.includes("pic")) {
           const val = String(v[key] || "").trim();
           if (val) {
              val.split("|").forEach((imgRaw) => {
                 const img = imgRaw.trim();
                 if (img.startsWith("http") || img.includes("drive.google.com") || img.includes("meesho")) {
                    const formatted = formatImg(img);
                    if (list.indexOf(formatted) === -1) {
                       list.push(formatted);
                    }
                 }
              });
           }
        }
      });
    });
    
    if (list.length === 0) {
      list.push("https://ui-avatars.com/api/?name=Yash+Marketing&background=f3f4f6&color=1e3a8a&size=200&bold=true");
    }
    setImagesList(list);
  }, [activeVariant, product]);

  const featuresList = [];
  var activeFeatures = String(getProp(activeVariant, "Features") || "");
  
  if (activeFeatures && activeFeatures.trim() !== "") {
    const parsed = activeFeatures.split(" | ").map((f) => {
      return f.trim();
    });
    
    parsed.forEach((f) => { 
      if (f !== "") {
        featuresList.push(f); 
      }
    });
  }

  const mrpVal = getNum(getProp(activeVariant, "MRP"));
  const dealerVal = getNum(getProp(activeVariant, "DealerPrice"));
  const hasDiscount = mrpVal > dealerVal && dealerVal > 0;
  const discountPercent = hasDiscount ? Math.round(((mrpVal - dealerVal) / mrpVal) * 100) : 0;
  
  const handleNextImage = () => {
    setCurrentImgIndex((prev) => {
      return (prev + 1) % imagesList.length;
    });
  };
  
  const handlePrevImage = () => {
    setCurrentImgIndex((prev) => {
      return (prev - 1 + imagesList.length) % imagesList.length;
    });
  };

  if (imagesList.length === 0) {
    return null;
  }

  var activeName = String(getProp(product, "ProductName") || "Premium Item");
  var activeBrand = String(getProp(activeVariant, "Brand") || "Premium");
  var activeType = String(getProp(activeVariant, "Type") || getProp(activeVariant, "Category") || "Accessories");
  var stockVal = getNum(getProp(activeVariant, "Stock"));
  
  const isAlwaysLiveBrand = activeBrand.toUpperCase().includes("HIKVISION") || activeBrand.toUpperCase().includes("VELOCITY");
  const showOnOrder = isAlwaysLiveBrand && stockVal <= 0;
  const isOutOfStock = stockVal <= 0 && !isAlwaysLiveBrand;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end justify-center animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden max-h-[88vh] flex flex-col animate-slide-up shadow-2xl relative z-10 font-sans">
        
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 cursor-pointer" onClick={onClose}></div>
        
        <button 
          onClick={onClose} 
          className="absolute right-5 top-3 bg-gray-100 text-gray-700 font-extrabold w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-200 z-20"
        >
          ✕
        </button>

        <div className="overflow-y-auto no-scrollbar pb-32">
          <div 
            className="relative bg-white p-4 flex items-center justify-center border-b border-gray-100 h-80 select-none cursor-zoom-in" 
            onClick={() => {
              setIsZoomed(true);
            }}
          >
            <img 
              src={imagesList[currentImgIndex]} 
              className={`h-72 max-w-full object-contain ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
              onError={(e) => { 
                e.target.outerHTML = '<div class="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">No Image</div>'; 
              }} 
              alt={activeName} 
            />
            
            {isOutOfStock && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 backdrop-blur-[1px]">
                 <span className="bg-red-600 text-white text-lg font-black px-6 py-2 rounded uppercase shadow-2xl transform -rotate-12 border-2 border-red-800 tracking-widest">
                   OUT OF STOCK
                 </span>
               </div>
            )}
            
            {imagesList.length > 1 && (
              <React.Fragment>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handlePrevImage(); 
                  }} 
                  className="absolute left-3 bg-white bg-opacity-95 text-gray-800 font-black p-2.5 rounded-full shadow-md hover:bg-gray-50"
                >
                  ←
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleNextImage(); 
                  }} 
                  className="absolute right-3 bg-white bg-opacity-95 text-gray-800 font-black p-2.5 rounded-full shadow-md hover:bg-gray-50"
                >
                  →
                </button>
                <div className="absolute bottom-3 flex gap-1.5 justify-center w-full">
                  {imagesList.map((_, idx) => {
                    return ( 
                      <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all ${idx === currentImgIndex ? 'w-5 bg-blue-900' : 'w-2 bg-gray-300'}`}
                      ></div> 
                    );
                  })}
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="p-5">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${isOutOfStock ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-900'}`}>
              {activeBrand}
            </span>
            
            <h2 className="text-lg font-black text-gray-900 mt-2 leading-tight">
              {activeName}
            </h2>
            
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
              Category: {activeType}
            </p>

            {product.isGrouped && (
              <div className="mt-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  Select Variant Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const vItemCode = String(getProp(v, "ItemCode") || "");
                    return (
                      <button 
                        key={vItemCode || Math.random()} 
                        onClick={() => { 
                          var nextActives = Object.assign({}, activeVariants); 
                          nextActives[String(getProp(product, "ItemCode") || "")] = vItemCode; 
                          setActiveVariants(nextActives); 
                        }} 
                        className={`text-xs font-black px-3.5 py-2 rounded-xl border transition-all ${vItemCode === activeItemCode ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
                      >
                        {v.capacity}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!globalProps.customerMode ? (
              <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Dealer Price ({activeVariant.capacity})
                </div>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className={`text-3xl font-black ${isOutOfStock ? 'text-gray-400 line-through' : 'text-blue-950'}`}>
                    ₹{dealerVal}
                  </span>
                  
                  {hasDiscount && !isOutOfStock && (
                    <React.Fragment>
                      <span className="text-xs text-gray-400 line-through font-bold">
                        MRP: ₹{mrpVal}
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    </React.Fragment>
                  )}
                </div>
                
                <div className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  <span>{isOutOfStock ? '🚫' : showOnOrder ? '⏳' : '📦'}</span> 
                  {isOutOfStock ? "ITEM CURRENTLY OUT OF STOCK" : showOnOrder ? "ON ORDER (Available Next Day)" : `In Stock Status: ${stockVal} units`}
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="text-xs text-green-800 font-black uppercase tracking-wider">
                  Offer MRP ({activeVariant.capacity})
                </div>
                <div className="text-3xl font-black text-green-950 mt-1">
                  ₹{mrpVal || 'Contact store'}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-extrabold text-sm text-gray-900 mb-3 tracking-wide uppercase">
                Product Key Highlights
              </h3>
              
              {featuresList.length === 0 ? (
                <p className="text-xs text-gray-500 font-bold italic leading-relaxed">
                  High-performance authentic build quality with official brand warranty check. Contact us for direct bulk details.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {featuresList.map((f, i) => {
                    return ( 
                      <li key={i} className="text-xs text-gray-700 font-bold flex items-start gap-2 leading-snug">
                        <span className="text-green-600 text-sm leading-none mt-0.5">⚡</span>
                        <span>{f}</span>
                      </li> 
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-30 shadow-inner">
          {!globalProps.customerMode ? (
            <React.Fragment>
              <div>
                <div className="text-[9px] uppercase font-black text-gray-400">
                  Total Selection ({activeVariant.capacity})
                </div>
                <div className="font-black text-lg text-gray-900 leading-none mt-0.5">
                  ₹{(dealerVal * (currentQty || 1)).toLocaleString('en-IN')}
                </div>
              </div>
              
              <div className="w-1/2">
                {isOutOfStock ? (
                   <button disabled className="w-full bg-gray-200 text-gray-500 text-xs font-black py-4 rounded-xl cursor-not-allowed">
                     OUT OF STOCK
                   </button>
                ) : currentQty > 0 ? (
                  <div className="flex justify-between items-center bg-blue-50 rounded-xl p-1 border border-blue-100">
                    <button 
                      onClick={() => {
                        updateQty(activeVariant, -1);
                      }} 
                      className="bg-white text-blue-900 font-black w-10 h-10 rounded-lg shadow-sm"
                    >
                      -
                    </button>
                    <span className="font-black text-blue-900 text-lg">{currentQty}</span>
                    <button 
                      onClick={() => {
                        updateQty(activeVariant, 1);
                      }} 
                      className="bg-blue-900 text-white font-black w-10 h-10 rounded-lg shadow-sm"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      updateQty(activeVariant, 1);
                    }} 
                    className="w-full bg-blue-900 text-white text-xs font-black py-4 rounded-xl shadow-lg active:scale-95"
                  >
                    {showOnOrder ? "Add To Order (Next Day)" : "Add To Order"}
                  </button>
                )}
              </div>
            </React.Fragment>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const shareText = `🔥 Check out this item at our store!\n\n📦 *Product:* ${activeName} (${activeVariant.capacity})\n⚡ *Brand:* ${activeBrand}\n\n🏢 *Dealer:* ${user ? user.shopName : ''}\n📞 *Contact:* ${user ? user.phone : ''}`;
                if (navigator.share) {
                  navigator.share({ title: activeName, text: shareText, url: imagesList[0] }).catch(() => {});
                } else {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\nImage: " + imagesList[0])}`, '_blank');
                }
              }} 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              📲 SHARE PHOTO WITH DEALER
            </button>
          )}
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[90] flex flex-col justify-center items-center p-4 animate-fade-in cursor-zoom-out" 
          onClick={() => {
            setIsZoomed(false);
          }}
        >
          <button className="absolute top-4 right-5 text-white font-black text-xl bg-gray-800 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
            ✕
          </button>
          
          {imagesList.length > 1 && (
            <div className="absolute left-4 right-4 flex justify-between z-[100] pointer-events-none">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePrevImage(); 
                }} 
                className="pointer-events-auto bg-white bg-opacity-20 text-white font-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-40"
              >
                ←
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleNextImage(); 
                }} 
                className="pointer-events-auto bg-white bg-opacity-20 text-white font-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-40"
              >
                →
              </button>
            </div>
          )}
          
          <img 
            src={imagesList[currentImgIndex]} 
            className="max-h-[80vh] max-w-full object-contain transition-transform duration-300 ease-out" 
            style={{ transform: 'scale(' + zoomScale + ')' }} 
            onClick={(e) => { 
              e.stopPropagation(); 
              setZoomScale(zoomScale === 1.25 ? 2.2 : 1.25); 
            }} 
            alt="Zoomed Product" 
          />
          <p className="text-gray-400 text-[10px] mt-6 font-bold uppercase tracking-wider text-center bg-gray-900 bg-opacity-40 px-4 py-1.5 rounded-full select-none pointer-events-none">
            Tap image to Zoom In / Out. Use arrows to change photos.
          </p>
        </div>
      )}
    </div>
  );
}