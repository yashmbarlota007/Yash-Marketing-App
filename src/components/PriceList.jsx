import React, { useState, useMemo } from 'react';
import { getProp, getNum, getSmartImage } from '../utils/helpers';
import { t } from '../utils/translations';

export default function PriceList({ products = [], cart = {}, setCart, setView, user = {}, globalProps = {}, lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL"); // ALL, IN_STOCK, OUT_OF_STOCK
  const [sortBy, setSortBy] = useState("OLD_TO_NEW"); // OLD_TO_NEW, NEW_TO_OLD, PRICE_ASC, PRICE_DESC, NAME_ASC
  const [bifurcationMode, setBifurcationMode] = useState("BRAND"); // BRAND, CATEGORY, FLAT
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const customerMode = globalProps ? globalProps.customerMode : false;

  // Extract numeric index for Old to New sorting (e.g. YM0001 -> 1, YM1238 -> 1238)
  const getItemIndex = (item, originalIndex) => {
    const code = String(getProp(item, 'ItemCode') || '');
    const m = code.match(/\d+/);
    return m ? parseInt(m[0], 10) : originalIndex;
  };

  // Distinct Brands and Categories
  const { allBrands, allCategories } = useMemo(() => {
    const brandsSet = new Set();
    const catsSet = new Set();
    products.forEach(p => {
      const b = String(getProp(p, 'Brand') || '').trim();
      const c = String(getProp(p, 'Type') || getProp(p, 'Category') || '').trim();
      if (b) brandsSet.add(b);
      if (c) catsSet.add(c);
    });
    return {
      allBrands: Array.from(brandsSet).sort((a, b) => a.localeCompare(b)),
      allCategories: Array.from(catsSet).sort((a, b) => a.localeCompare(b))
    };
  }, [products]);

  // Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    let list = products.filter((p, idx) => {
      const name = String(getProp(p, "ProductName") || getProp(p, "Product Name") || "").toLowerCase();
      const code = String(getProp(p, "ItemCode") || "").toLowerCase();
      const brand = String(getProp(p, "Brand") || "").toLowerCase();
      const cat = String(getProp(p, "Type") || getProp(p, "Category") || "").toLowerCase();
      const stockVal = getNum(getProp(p, "Stock"));
      const brandStr = brand.toUpperCase();
      const isAlwaysLive = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
      const inStock = stockVal > 0 || isAlwaysLive;

      // Brand Filter
      if (selectedBrand !== "ALL" && brand !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== "ALL" && cat !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Stock Filter
      if (stockFilter === "IN_STOCK" && !inStock) return false;
      if (stockFilter === "OUT_OF_STOCK" && inStock) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = name.includes(q) || code.includes(q) || brand.includes(q) || cat.includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      const idxA = getItemIndex(a, 0);
      const idxB = getItemIndex(b, 0);
      const priceA = getNum(getProp(a, "DealerPrice") || a.DealerPrice || a.rate || a.price);
      const priceB = getNum(getProp(b, "DealerPrice") || b.DealerPrice || b.rate || b.price);
      const nameA = String(getProp(a, "ProductName") || getProp(a, "Product Name") || "");
      const nameB = String(getProp(b, "ProductName") || getProp(b, "Product Name") || "");

      switch (sortBy) {
        case "OLD_TO_NEW":
          return idxA - idxB;
        case "NEW_TO_OLD":
          return idxB - idxA;
        case "PRICE_ASC":
          return priceA - priceB;
        case "PRICE_DESC":
          return priceB - priceA;
        case "NAME_ASC":
          return nameA.localeCompare(nameB);
        default:
          return idxA - idxB;
      }
    });

    return list;
  }, [products, searchQuery, selectedBrand, selectedCategory, stockFilter, sortBy]);

  // Grouped Bifurcation
  const groupedData = useMemo(() => {
    if (bifurcationMode === "FLAT") {
      return [{ groupTitle: "All Products", items: filteredProducts }];
    }

    const groups = {};
    filteredProducts.forEach(p => {
      const key = bifurcationMode === "BRAND" 
        ? (String(getProp(p, 'Brand') || 'Other').trim() || 'Other')
        : (String(getProp(p, 'Type') || getProp(p, 'Category') || 'Other').trim() || 'Other');
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    return Object.keys(groups).sort().map(key => ({
      groupTitle: key,
      items: groups[key]
    }));
  }, [filteredProducts, bifurcationMode]);

  // Toggle Collapse
  const toggleGroup = (title) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Add to Cart
  const updateQty = (product, change) => {
    if (customerMode) return;
    const itemCode = String(getProp(product, "ItemCode") || "");
    if (!itemCode) return;

    const stockVal = getNum(getProp(product, "Stock"));
    const brandStr = String(getProp(product, "Brand") || "").toUpperCase();
    const isAlwaysLiveBrand = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
    if (stockVal <= 0 && !isAlwaysLiveBrand) {
      alert("This item is currently out of stock!");
      return;
    }

    const prodName = String(getProp(product, "ProductName") || "").toLowerCase();
    const prodType = String(getProp(product, "Type") || "").toLowerCase();
    const isCable = prodName.includes("cable") || prodType.includes("cable");
    const actualChange = isCable ? (change > 0 ? 5 : -5) : change;

    const updated = Object.assign({}, cart);
    const newQty = (updated[itemCode] ? updated[itemCode].qty : 0) + actualChange;
    const maxLimit = isAlwaysLiveBrand ? 99999 : stockVal;

    if (newQty > maxLimit && maxLimit > 0 && !isAlwaysLiveBrand) {
      alert("Maximum stock limit reached!");
      return;
    }

    if (newQty <= 0) {
      delete updated[itemCode];
    } else {
      updated[itemCode] = Object.assign({}, product, { qty: newQty });
    }
    setCart(updated);
  };

  const cartTotalQty = Object.values(cart).reduce((a, c) => a + getNum(c.qty), 0);
  const cartSubtotal = Object.values(cart).reduce((a, c) => {
    const p = getNum(getProp(c, "DealerPrice") || c.DealerPrice || c.rate || c.price);
    return a + (p * getNum(c.qty));
  }, 0);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto p-3 pb-32 min-h-screen bg-gray-50 text-gray-800">
      
      {/* 🔝 TOP NAVIGATION & TITLE BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-3 sticky top-14 z-30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('catalog')}
              className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 font-black flex items-center justify-center border border-blue-200 active:scale-95 transition-all"
            >
              ←
            </button>
            <div>
              <h1 className="font-black text-base text-blue-950 flex items-center gap-1.5">
                <span>📋</span> {t('price_list', lang) || 'Price List'}
                <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                  {filteredProducts.length} {t('products', lang) || 'Items'}
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold">
                {lang === 'mr' ? 'सर्व स्टॉक किंमत यादी (उपलब्ध आणि संपलेले)' : lang === 'hi' ? 'सभी स्टॉक प्राइस लिस्ट (उपलब्ध और आउट ऑफ स्टॉक)' : 'All products catalog pricing (Old to New)'}
              </p>
            </div>
          </div>

          <button 
            onClick={handlePrint}
            className="text-[10px] font-black bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-xl border border-gray-300 flex items-center gap-1 shadow-xs active:scale-95"
            title="Print or Save PDF"
          >
            <span>🖨️</span> Print
          </button>
        </div>

        {/* 🔍 SEARCH BOX */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by model, item code (e.g. YM0162), brand..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 pl-9 pr-8 py-2 rounded-xl text-xs font-bold outline-none border border-gray-200 focus:border-blue-500 focus:bg-white transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 font-black text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* 🔀 BIFURCATION TABS (BRAND WISE / CATEGORY WISE / FLAT) */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setBifurcationMode("BRAND")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition-all ${
              bifurcationMode === "BRAND" ? 'bg-blue-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏷️ Brand-wise
          </button>
          <button 
            onClick={() => setBifurcationMode("CATEGORY")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition-all ${
              bifurcationMode === "CATEGORY" ? 'bg-blue-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📂 Category-wise
          </button>
          <button 
            onClick={() => setBifurcationMode("FLAT")}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition-all ${
              bifurcationMode === "FLAT" ? 'bg-blue-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 All List
          </button>
        </div>

        {/* 🎛️ FILTERS & SORT ROW */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Brand Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Brand</label>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-800 outline-none"
            >
              <option value="ALL">All Brands ({products.length})</option>
              {allBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-800 outline-none"
            >
              <option value="ALL">All Categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Stock Status</label>
            <select 
              value={stockFilter} 
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-800 outline-none"
            >
              <option value="ALL">All (In & Out of Stock)</option>
              <option value="IN_STOCK">🟢 In Stock Only</option>
              <option value="OUT_OF_STOCK">⚪ Out of Stock Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Sort Order</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-800 outline-none"
            >
              <option value="OLD_TO_NEW">⏳ Old to New (Item Code ↑)</option>
              <option value="NEW_TO_OLD">✨ New to Old (Item Code ↓)</option>
              <option value="PRICE_ASC">💰 Price: Low to High</option>
              <option value="PRICE_DESC">💎 Price: High to Low</option>
              <option value="NAME_ASC">🔤 Name (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📦 BIFURCATED LIST SECTIONS */}
      {groupedData.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 text-gray-500 font-bold text-xs">
          No products found matching your filter criteria.
        </div>
      ) : (
        groupedData.map(group => {
          const isCollapsed = !!collapsedGroups[group.groupTitle];
          const groupInStockCount = group.items.filter(p => {
            const stockVal = getNum(getProp(p, "Stock"));
            const brandStr = String(getProp(p, "Brand") || "").toUpperCase();
            return stockVal > 0 || brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
          }).length;

          return (
            <div key={group.groupTitle} className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Group Header */}
              {bifurcationMode !== "FLAT" && (
                <div 
                  onClick={() => toggleGroup(group.groupTitle)}
                  className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wide">
                      {bifurcationMode === "BRAND" ? '🏷️' : '📂'} {group.groupTitle}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {group.items.length} items
                    </span>
                    {groupInStockCount > 0 && (
                      <span className="bg-emerald-500/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {groupInStockCount} in stock
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-blue-200">
                    {isCollapsed ? '▼ Expand' : '▲ Collapse'}
                  </span>
                </div>
              )}

              {/* Items List */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-100">
                  {group.items.map((item, idx) => {
                    const itemCode = String(getProp(item, "ItemCode") || "");
                    const name = String(getProp(item, "ProductName") || getProp(item, "Product Name") || "Product");
                    const brand = String(getProp(item, "Brand") || "");
                    const category = String(getProp(item, "Type") || getProp(item, "Category") || "");
                    const stockVal = getNum(getProp(item, "Stock"));
                    const brandStr = brand.toUpperCase();
                    const isAlwaysLive = brandStr.includes("HIKVISION") || brandStr.includes("VELOCITY");
                    const isInStock = stockVal > 0 || isAlwaysLive;
                    const dealerPrice = getNum(getProp(item, "DealerPrice") || item.DealerPrice || item.rate || item.price);
                    const mrp = getNum(getProp(item, "MRP") || item.MRP || item.mrp);
                    const image = getSmartImage(item);
                    const currentCartQty = cart[itemCode] ? cart[itemCode].qty : 0;

                    return (
                      <div key={itemCode || idx} className={`p-3 flex items-center justify-between gap-2.5 transition-colors ${isInStock ? 'hover:bg-blue-50/40' : 'bg-gray-50/60 opacity-80'}`}>
                        {/* Left: Thumbnail & Details */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {image ? (
                            <img 
                              src={image} 
                              alt={name} 
                              className={`w-12 h-12 object-contain rounded-lg border bg-white p-1 shrink-0 ${!isInStock ? 'grayscale opacity-60' : ''}`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                              📦
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {itemCode && (
                                <span className="text-[9px] font-black bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-mono">
                                  {itemCode}
                                </span>
                              )}
                              <span className="text-[9px] font-bold text-gray-500 uppercase truncate">
                                {brand} {category ? `• ${category}` : ''}
                              </span>
                            </div>

                            <h4 className={`font-extrabold text-xs leading-snug line-clamp-2 ${isInStock ? 'text-gray-900' : 'text-gray-500'}`}>
                              {name}
                            </h4>

                            <div className="flex items-center gap-2 mt-1">
                              {isInStock ? (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 flex items-center gap-0.5">
                                  <span>🟢</span> {Number.isInteger(stockVal) && stockVal > 0 && stockVal <= 10 ? `Only ${stockVal} left` : 'In Stock'}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <span>⚪</span> Out of Stock
                                </span>
                              )}

                              {mrp > dealerPrice && (
                                <span className="text-[9px] text-gray-400 line-through">
                                  MRP: ₹{mrp.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & Cart Action */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <div>
                            {customerMode ? (
                              <div className="font-black text-sm text-gray-900">
                                ₹{mrp ? mrp.toLocaleString('en-IN') : 'Contact Store'}
                              </div>
                            ) : (
                              <div>
                                <div className="font-black text-sm text-blue-950">
                                  ₹{dealerPrice ? dealerPrice.toLocaleString('en-IN') : 'Contact Store'}
                                </div>
                                <span className="text-[8px] font-bold text-gray-400 block -mt-0.5">
                                  Dealer Rate
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Add to Cart (Only for in-stock and dealer mode) */}
                          {!customerMode && isInStock && (
                            <div>
                              {currentCartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-blue-900 text-white rounded-lg px-1.5 py-1 text-xs font-black shadow-xs">
                                  <button onClick={() => updateQty(item, -1)} className="px-1 text-blue-200 hover:text-white">-</button>
                                  <span className="px-1 text-[11px]">{currentCartQty}</span>
                                  <button onClick={() => updateQty(item, 1)} className="px-1 text-blue-200 hover:text-white">+</button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => updateQty(item, 1)}
                                  className="text-[10px] font-black bg-blue-50 hover:bg-blue-900 text-blue-900 hover:text-white border border-blue-200 hover:border-blue-900 px-2.5 py-1 rounded-lg transition-all shadow-xs active:scale-95"
                                >
                                  + ADD
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 🛒 FLOATING CART BAR (IF ITEMS IN CART) */}
      {!customerMode && cartTotalQty > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-3 z-40">
          <div 
            onClick={() => setView('cart')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all border border-emerald-500"
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">
                🛒
              </span>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  {cartTotalQty} {cartTotalQty === 1 ? 'Item' : 'Items'} in Cart
                </div>
                <div className="text-sm font-black text-white">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 font-black text-xs bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-xs">
              VIEW CART <span>›</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
