import React, { useState, useEffect } from 'react';
import { API_URL, getProp } from '../utils/helpers';
import { ScannerModal } from './SharedUI';

export default function ReplacementsView(props) {
  var user = props.user;
  var callAPI = props.callAPI;
  var products = props.products || [];

  const [activeTab, setActiveTab] = useState("new");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [brand, setBrand] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productName, setProductName] = useState(""); 
  const [defectType, setDefectType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mediaData, setMediaData] = useState(null);

  const [isScanning, setIsScanning] = useState(false);

  const uniqueBrands = [...new Set(products.map(p => String(getProp(p, "Brand") || "").trim()).filter(b => b !== ""))].sort();
  const filteredProducts = products.filter(p => 
    String(getProp(p, "Brand") || "").trim() === brand &&
    (productSearch === "" || 
     String(getProp(p, "ProductName") || "").toLowerCase().includes(productSearch.toLowerCase()) || 
     String(getProp(p, "ItemCode") || "").toLowerCase().includes(productSearch.toLowerCase()))
  );

  useEffect(() => {
    if (activeTab === "track") {
      setLoading(true);
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "getReplacements", phone: user.phone }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      }).then(r => r.json()).then(res => {
        if (res && res.success) setTickets(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [activeTab]);

  const handleScanSuccess = (decodedText) => {
    setIsScanning(false);
    setProductSearch(decodedText);
    const exactMatch = filteredProducts.find(p => 
      String(getProp(p, "ItemCode")).toLowerCase() === decodedText.toLowerCase() || 
      String(getProp(p, "ProductName")).toLowerCase() === decodedText.toLowerCase()
    );
    if(exactMatch) {
      setProductName(String(getProp(exactMatch, "ProductName")));
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return alert("Please upload a valid photo. Videos and voice notes are disabled to ensure fast uploads.");
    }

    const reader = new FileReader();
    reader.onload = (ev) => { 
      setMediaData({ 
        base64: ev.target.result.split(',')[1], 
        mimeType: file.type, 
        filename: file.name 
      }); 
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!brand || !productName || !defectType) {
      return alert("Please select Brand, Product Name, and Defect Type.");
    }
    if (!remarks.trim()) {
      return alert("Please explain the problem in Remarks.");
    }
    if (!mediaData) {
      return alert("Please upload 1 clear photo of the product/box.");
    }
    
    setFormLoading(true);
    callAPI({
      action: "raiseReplacement", 
      phone: user.phone, 
      shopName: user.shopName,
      brand: brand, 
      productName: productName, 
      defectType: defectType,
      remarks: remarks, 
      media: mediaData
    }).then(res => {
      setFormLoading(false);
      if (res && res.success) {
        alert("✅ Request Submitted Successfully!");
        setBrand(""); 
        setProductSearch(""); 
        setProductName(""); 
        setDefectType(""); 
        setRemarks(""); 
        setMediaData(null); 
        setActiveTab("track");
      }
    });
  };

  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("raised") || s.includes("pending")) return "bg-blue-500";
    if (s.includes("scheduled") || s.includes("pickup")) return "bg-indigo-500";
    if (s.includes("inwarded")) return "bg-yellow-500";
    if (s.includes("brand") || s.includes("testing")) return "bg-orange-500";
    if (s.includes("resolved") || s.includes("approved") || s.includes("credit") || s.includes("dispatched")) return "bg-green-500";
    if (s.includes("rejected")) return "bg-red-600";
    return "bg-gray-400";
  };

  const getProgressPercent = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("raised") || s.includes("pending")) return 20;
    if (s.includes("scheduled") || s.includes("pickup")) return 40;
    if (s.includes("inwarded")) return 60;
    if (s.includes("brand") || s.includes("testing")) return 80;
    if (s.includes("resolved") || s.includes("approved") || s.includes("dispatched") || s.includes("credit") || s.includes("rejected")) return 100;
    return 20;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[120px] font-sans">
      {isScanning && <ScannerModal onScan={handleScanSuccess} onClose={() => setIsScanning(false)} />}
      
      <div className="flex justify-between bg-white rounded-xl shadow-sm border p-1 mb-4">
        <button 
          onClick={() => setActiveTab("new")} 
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${activeTab === 'new' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
        >
          + New Request
        </button>
        <button 
          onClick={() => setActiveTab("track")} 
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${activeTab === 'track' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
        >
          Track Progress
        </button>
      </div>

      {activeTab === "new" ? (
        <div className="bg-white rounded-2xl shadow-sm border p-5 animate-fade-in">
          <h2 className="font-black text-gray-800 text-lg mb-1">Replacement Request</h2>
          <p className="text-xs text-gray-400 mb-4 font-bold">Simple text and photo collection.</p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">1. Select Brand</label>
              <select 
                value={brand} 
                onChange={(e) => { 
                  setBrand(e.target.value); 
                  setProductSearch(""); 
                  setProductName(""); 
                }} 
                className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
              >
                <option value="">-- Choose Brand --</option>
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {brand && (
              <div className="animate-fade-in">
                <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">2. Select Product</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Search or scan box..." 
                    value={productSearch} 
                    onChange={(e) => setProductSearch(e.target.value)} 
                    className="flex-1 bg-gray-50 p-3 rounded-xl border outline-none font-bold text-xs text-gray-800 focus:border-blue-500" 
                  />
                  <button 
                    onClick={() => setIsScanning(true)} 
                    className="bg-blue-900 text-white px-4 rounded-xl font-black text-sm active:scale-95 shadow-sm"
                  >
                    📷 SCAN
                  </button>
                </div>
                <select 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                  className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                >
                  <option value="">-- Select from list --</option>
                  {filteredProducts.map(p => {
                    const name = String(getProp(p, "ProductName") || "Unknown Item");
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">3. Defect Type</label>
              <select 
                value={defectType} 
                onChange={(e) => setDefectType(e.target.value)} 
                className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
              >
                <option value="">-- Issue Type --</option>
                <option value="Dead on Arrival (DOA)">Dead on Arrival (DOA)</option>
                <option value="Battery Drain / Charging Issue">Battery Drain / Charging Issue</option>
                <option value="Connectivity / Bluetooth Issue">Connectivity / Bluetooth Issue</option>
                <option value="Audio / Sound Issue">Audio / Sound Issue</option>
                <option value="Physical Damage (Transit)">Physical Damage (Transit)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">4. Remarks & Explanation <span className="text-red-500">*</span></label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                rows="3" 
                placeholder="What exactly is the issue?" 
                className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">5. Single Photo Proof <span className="text-red-500">*</span></label>
              <div className="w-full bg-blue-50 border-2 border-dashed border-blue-200 p-4 rounded-xl text-center relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleMediaUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="text-blue-900 font-black text-sm">
                  {mediaData ? "✅ Photo Ready" : "📸 Tap to Upload 1 Photo"}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={formLoading} 
              className="w-full bg-blue-900 text-white font-black text-lg py-4 rounded-xl shadow-lg mt-2 active:scale-95 flex flex-col justify-center items-center"
            >
              {formLoading ? (
                <div className="border-4 border-white border-t-transparent w-6 h-6 rounded-full spinner"></div>
              ) : (
                "SUBMIT REQUEST"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center p-10">
               <div className="border-4 border-blue-900 border-t-transparent w-8 h-8 rounded-full spinner"></div>
             </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-2xl border text-gray-400 font-bold uppercase">
              No Tracking Data Found.
            </div>
          ) : (
            tickets.map((ticket, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex justify-between items-start border-b border-gray-50 pb-2 mb-3">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold">{ticket.date}</div>
                    <div className="font-black text-blue-900 text-xs mt-1">{ticket.ticketId}</div>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-md text-white uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="text-[10px] bg-gray-100 text-gray-600 font-black px-2 py-0.5 rounded inline-block mb-1">
                    {ticket.brand}
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 leading-snug">{ticket.productName}</h3>
                  <p className="text-[11px] text-red-600 font-bold mt-1">Issue: {ticket.defectType}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-4">
                  <div className="flex justify-between text-[7px] font-black text-gray-400 uppercase tracking-wider mb-2 text-center">
                    <span className="w-1/5">Raised</span>
                    <span className="w-1/5">Pickup</span>
                    <span className="w-1/5">Inward</span>
                    <span className="w-1/5">Brand</span>
                    <span className="w-1/5">Resolved</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`${getStatusColor(ticket.status)} h-full transition-all duration-500`} 
                      style={{ width: `${getProgressPercent(ticket.status)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mt-3 text-center">
                     Current Stage: <span className="text-gray-800 font-black">{ticket.status}</span>
                  </div>
                </div>

                {(ticket.resolutionType || ticket.resolutionDetails) && (
                   <div className="mt-3 bg-green-50 p-3 rounded-xl border border-green-100">
                     <div className="text-[9px] text-green-700 font-black uppercase mb-1">
                       Resolution ({ticket.resolutionType})
                     </div>
                     <div className="text-xs font-bold text-green-900">
                       {ticket.resolutionDetails}
                     </div>
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}