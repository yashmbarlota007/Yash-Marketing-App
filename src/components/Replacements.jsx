import React, { useState, useEffect } from 'react';
import { API_URL, getProp, compressImageFile } from '../utils/helpers';
import { ScannerModal } from './SharedUI';

export default function ReplacementsView(props) {
  var user = props.user;
  var callAPI = props.callAPI;
  var products = props.products || [];

  const [activeTab, setActiveTab] = useState("new");
  const [ticketCategory, setTicketCategory] = useState("replacement");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Replacement specific states
  const [brand, setBrand] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productName, setProductName] = useState(""); 
  const [defectType, setDefectType] = useState("");
  
  // Help Ticket general states
  const [refNumber, setRefNumber] = useState("");
  const [helpSubIssue, setHelpSubIssue] = useState("");

  // Common states
  const [remarks, setRemarks] = useState("");
  const [mediaData, setMediaData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const categories = [
    { id: "replacement", label: "Replacement", icon: "♻️", desc: "Defective or damaged item exchange" },
    { id: "order_delivery", label: "Order & Delivery", icon: "📦", desc: "Dispatch delay, missing item, package issue" },
    { id: "billing_payment", label: "Billing & Ledger", icon: "💰", desc: "Payment not reflected, bill query" },
    { id: "general_support", label: "General Support", icon: "💬", desc: "Account, scheme, or other enquiry" }
  ];

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

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return alert("Please upload a valid photo.");
    }
    try {
      setFormLoading(true);
      const compressed = await compressImageFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      setMediaData(compressed);
    } catch (err) {
      alert("Photo processing failed: " + (err.message || "Please try again."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = () => {
    let payload = {
      action: "raiseReplacement",
      phone: user.phone,
      shopName: user.shopName,
      category: categories.find(c => c.id === ticketCategory)?.label || "Help Ticket",
      remarks: remarks,
      media: mediaData
    };

    if (ticketCategory === "replacement") {
      if (!brand || !productName || !defectType) {
        return alert("Please select Brand, Product Name, and Defect Type.");
      }
      if (!remarks.trim()) {
        return alert("Please explain the problem in Remarks.");
      }
      if (!mediaData) {
        return alert("Please upload 1 clear photo of the product/box.");
      }
      payload.brand = brand;
      payload.productName = productName;
      payload.defectType = defectType;
    } else {
      if (!helpSubIssue) {
        return alert("Please select an Issue Type.");
      }
      if (!remarks.trim()) {
        return alert("Please provide details in Remarks.");
      }
      const catLabel = categories.find(c => c.id === ticketCategory)?.label || "Help Ticket";
      payload.brand = catLabel;
      payload.productName = (refNumber.trim() ? `[Ref: ${refNumber.trim()}] ` : "") + helpSubIssue;
      payload.defectType = helpSubIssue;
    }
    
    setFormLoading(true);
    callAPI(payload).then(res => {
      setFormLoading(false);
      if (res && res.success) {
        alert("✅ Help Ticket Submitted Successfully!");
        setBrand(""); 
        setProductSearch(""); 
        setProductName(""); 
        setDefectType(""); 
        setRefNumber("");
        setHelpSubIssue("");
        setRemarks(""); 
        setMediaData(null); 
        setActiveTab("track");
      } else {
        alert("❌ Ticket was not saved. " + (res && res.message ? res.message : "Please try again."));
      }
    }).catch(error => {
      setFormLoading(false);
      alert("❌ Ticket could not be submitted. " + (error.message || "Please try again."));
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
      
      {/* HEADER TABS */}
      <div className="flex justify-between bg-white rounded-xl shadow-sm border p-1 mb-4">
        <button 
          onClick={() => setActiveTab("new")} 
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${activeTab === 'new' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
        >
          ➕ Raise Help Ticket
        </button>
        <button 
          onClick={() => setActiveTab("track")} 
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${activeTab === 'track' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
        >
          📜 Track Tickets
        </button>
      </div>

      {activeTab === "new" ? (
        <div className="bg-white rounded-2xl shadow-sm border p-5 animate-fade-in">
          <h2 className="font-black text-gray-800 text-lg mb-1">🎫 Help & Support Ticket</h2>
          <p className="text-xs text-gray-400 mb-4 font-bold">Select the issue category below to proceed.</p>
          
          {/* CATEGORY SELECTOR PILLS */}
          <div className="mb-5">
            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">1. Select Ticket Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const isSelected = ticketCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setTicketCategory(c.id);
                      setHelpSubIssue("");
                      setRemarks("");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-blue-900 text-white border-blue-900 shadow-md scale-[1.02]"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-lg mb-1">{c.icon}</div>
                    <div className="text-xs font-black">{c.label}</div>
                    <div className={`text-[9px] mt-0.5 leading-tight ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                      {c.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {/* SUB-SECTION 1: REPLACEMENT (PART OF HELP TICKET) */}
            {ticketCategory === "replacement" && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
                  <div className="text-xs font-black text-blue-900 flex items-center gap-1">
                    <span>♻️</span> Product Replacement Policy
                  </div>
                  <p className="text-[10px] text-blue-700 font-bold mt-1">
                    Select brand & model. Original box with barcode photo is mandatory.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Select Brand</label>
                  <select 
                    value={brand} 
                    onChange={(e) => { setBrand(e.target.value); setProductSearch(""); setProductName(""); }} 
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  >
                    <option value="">-- Choose Brand --</option>
                    {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {brand && (
                  <div className="animate-fade-in">
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Select Product</label>
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
                      {filteredProducts.map((p, i) => {
                        const name = String(getProp(p, "ProductName") || "Unknown Item");
                        return <option key={`${name}-${i}`} value={name}>{name}</option>;
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Defect / Damage Type</label>
                  <select 
                    value={defectType} 
                    onChange={(e) => setDefectType(e.target.value)} 
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  >
                    <option value="">-- Choose Defect Type --</option>
                    <option value="Dead on Arrival (DOA)">Dead on Arrival (DOA)</option>
                    <option value="Battery Drain / Charging Issue">Battery Drain / Charging Issue</option>
                    <option value="Connectivity / Bluetooth Issue">Connectivity / Bluetooth Issue</option>
                    <option value="Audio / Sound Issue">Audio / Sound Issue</option>
                    <option value="Physical Damage (Transit)">Physical Damage (Transit)</option>
                    <option value="Other">Other Technical Fault</option>
                  </select>
                </div>
              </>
            )}

            {/* SUB-SECTION 2: ORDER & DELIVERY ISSUE */}
            {ticketCategory === "order_delivery" && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Order Issue Type</label>
                  <select
                    value={helpSubIssue}
                    onChange={(e) => setHelpSubIssue(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  >
                    <option value="">-- Select Order Issue --</option>
                    <option value="Delayed Dispatch">Dispatch Delayed</option>
                    <option value="Missing Item in Parcel">Missing Item in Delivered Box</option>
                    <option value="Wrong Item Received">Wrong Product / Model Received</option>
                    <option value="Damaged Outer Carton">Carton Damaged by Transport</option>
                    <option value="Transport Docket Tracking Query">Transport / Tracking Query</option>
                    <option value="Other Order Issue">Other Order Issue</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-1024"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* SUB-SECTION 3: BILLING & LEDGER QUERY */}
            {ticketCategory === "billing_payment" && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Billing Issue Type</label>
                  <select
                    value={helpSubIssue}
                    onChange={(e) => setHelpSubIssue(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  >
                    <option value="">-- Select Billing Query --</option>
                    <option value="Payment Not Updated in Ledger">Payment Transfer Not Reflected</option>
                    <option value="Invoice Copy Request">Need GST Invoice Copy</option>
                    <option value="Credit Note / Scheme Difference">Scheme / Credit Note Difference</option>
                    <option value="Ledger Balance Mismatch">Ledger Balance Dispute</option>
                    <option value="Other Billing Query">Other Payment / Ledger Query</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Transaction / Invoice / UTR No. (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR / Inv # 5401"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* SUB-SECTION 4: GENERAL SUPPORT */}
            {ticketCategory === "general_support" && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Subject / Query Type</label>
                  <select
                    value={helpSubIssue}
                    onChange={(e) => setHelpSubIssue(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
                  >
                    <option value="">-- Select Query --</option>
                    <option value="Scheme & Discount Clarification">Scheme & Discount Information</option>
                    <option value="New Brand / Product Availability">New Product Inquiry</option>
                    <option value="Dealer Account Information Update">Update Contact / Address</option>
                    <option value="General Support">Other Assistance</option>
                  </select>
                </div>
              </>
            )}

            {/* COMMON: REMARKS */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">
                Problem Description & Remarks <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                rows="3" 
                placeholder="Please describe your issue or requirement in detail..." 
                className="w-full bg-gray-50 p-3 rounded-xl border outline-none font-bold text-sm text-gray-800 focus:border-blue-500"
              ></textarea>
            </div>

            {/* COMMON: PHOTO UPLOAD */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">
                {ticketCategory === "replacement" ? "Photo Proof (Box/Serial No) *" : "Screenshot / Photo Attachment (Optional)"}
              </label>
              <div className="w-full bg-blue-50 border-2 border-dashed border-blue-200 p-4 rounded-xl text-center relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleMediaUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="text-blue-900 font-black text-sm">
                  {mediaData ? "✅ Photo Ready" : "📸 Tap to Upload Photo / Screenshot"}
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              onClick={handleSubmit} 
              disabled={formLoading} 
              className="w-full bg-blue-900 text-white font-black text-lg py-4 rounded-xl shadow-lg mt-2 active:scale-95 flex flex-col justify-center items-center"
            >
              {formLoading ? (
                <div className="border-4 border-white border-t-transparent w-6 h-6 rounded-full spinner"></div>
              ) : "SUBMIT TICKET"}
            </button>
          </div>
        </div>
      ) : (
        /* TRACK TICKETS TAB */
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="border-4 border-blue-900 border-t-transparent w-8 h-8 rounded-full spinner"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-2xl border text-gray-400 font-bold uppercase">
              No Support Tickets Found.
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
                  <div className="text-[10px] bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded inline-block mb-1">
                    {ticket.brand || "Help Ticket"}
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 leading-snug">{ticket.productName}</h3>
                  {ticket.defectType && (
                    <p className="text-[11px] text-gray-600 font-bold mt-1">
                      <span className="text-gray-400">Issue:</span> {ticket.defectType}
                    </p>
                  )}
                  {ticket.remarks && (
                    <p className="text-[11px] text-gray-500 mt-1 italic">
                      "{ticket.remarks}"
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-4">
                  <div className="flex justify-between text-[7px] font-black text-gray-400 uppercase tracking-wider mb-2 text-center">
                    <span className="w-1/5">Raised</span>
                    <span className="w-1/5">In Review</span>
                    <span className="w-1/5">Processing</span>
                    <span className="w-1/5">Actioned</span>
                    <span className="w-1/5">Resolved</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`${getStatusColor(ticket.status)} h-full transition-all duration-500`} 
                      style={{ width: `${getProgressPercent(ticket.status)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mt-3 text-center">
                    Status: <span className="text-gray-800 font-black">{ticket.status}</span>
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
