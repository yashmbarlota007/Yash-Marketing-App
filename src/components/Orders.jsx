import React, { useState, useEffect } from 'react';
import { API_URL, getProp, getNum } from '../utils/helpers';

export default function Orders(props) {
  var user = props.user;
  var setView = props.setView;
  var globalProps = props.globalProps;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.phone) {
      setLoading(false);
      return;
    }
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getOrders", phone: user.phone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(r => r.json())
    .then((res) => {
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data.reverse());
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Orders fetch failed:", err);
      setLoading(false);
    });
  }, [user]);

  const getStatusColor = (statusStr) => {
    const s = String(statusStr || "").toUpperCase();
    if (s.includes("DELIVERED") || s.includes("COMPLETED")) return "bg-green-100 text-green-800 border-green-200";
    if (s.includes("DISPATCHED") || s.includes("SHIPPED")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("CANCELLED") || s.includes("REJECTED")) return "bg-red-100 text-red-800 border-red-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  const renderDocButton = (url, label, icon, bgClass) => {
    if (!url || String(url).trim() === "") return null;
    return (
      <a 
        href={String(url).trim()} 
        target="_blank" 
        rel="noreferrer" 
        className={`flex-1 min-w-[80px] flex flex-col items-center justify-center p-2.5 rounded-xl border shadow-sm transition-all active:scale-95 shrink-0 ${bgClass}`}
      >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-[8px] font-black uppercase text-center leading-tight">{label}</span>
      </a>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[120px] font-sans animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-xl tracking-tight uppercase">My Past Orders</h2>
        <button 
          onClick={() => setView("catalog")} 
          className="bg-blue-100 text-blue-900 text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-200 active:scale-95"
        >
          + NEW ORDER
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] text-blue-900">
          <div className="border-4 border-current border-t-transparent w-10 h-10 rounded-full spinner mb-4"></div>
          <p className="font-bold text-sm">Fetching your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 mt-10">
          <div className="text-5xl mb-4">🧾</div>
          <h3 className="font-black text-gray-800 text-lg mb-2">No Orders Found</h3>
          <p className="text-xs text-gray-500 font-bold mb-6">
            Aapne abhi tak koi order place nahi kiya hai. Apni pehli order place karne ke liye catalog check karein!
          </p>
          <button 
            onClick={() => setView("catalog")} 
            className="w-full bg-blue-900 text-white font-black py-3.5 rounded-xl shadow-md active:scale-95"
          >
            EXPLORE CATALOG
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const orderId = String(getProp(order, "OrderId") || getProp(order, "Order ID") || `YM-ORD-${idx}`);
            const dateStr = String(getProp(order, "Timestamp") || getProp(order, "Date") || "");
            const status = String(getProp(order, "Status") || "PENDING");
            const itemsStr = String(getProp(order, "Items") || getProp(order, "Order Details") || "");
            const paymentMode = String(getProp(order, "PaymentMode") || getProp(order, "Payment Mode") || "N/A");
            const totalAmount = getNum(getProp(order, "FinalAmount") || getProp(order, "Total Amount") || getProp(order, "Final Amount"));
            
            // Explicitly fetching data matched to columns L, M, N, O, P, R, S
            const call1 = String(getProp(order, "Call1") || "");
            const stockPhoto = String(getProp(order, "StockPhoto") || "");
            const invoicePhoto = String(getProp(order, "InvoicePhoto") || "");
            const boxPhoto = String(getProp(order, "BoxPhoto") || "");
            const logistics = String(getProp(order, "Logistics") || "");
            const lrPhoto = String(getProp(order, "LrPhoto") || "");
            const finalCall = String(getProp(order, "FinalCall") || "");
            
            const hasDocuments = call1 || stockPhoto || invoicePhoto || boxPhoto || lrPhoto || finalCall || logistics;

            return (
              <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] font-bold text-gray-400">{dateStr}</div>
                  <div className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase tracking-wider ${getStatusColor(status)}`}>
                    {status}
                  </div>
                </div>

                <h3 className="font-black text-gray-900 text-sm mb-4 tracking-tight">{orderId}</h3>

                <div className="mb-4">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Items & Billing Blueprint
                  </div>
                  <ul className="space-y-2">
                    {itemsStr.split("|").map((itemStr, iIdx) => {
                      const cleanItem = itemStr.trim();
                      if (!cleanItem) return null;
                      const isFreebie = cleanItem.toUpperCase().includes("FREE ITEM");
                      const isApplied = cleanItem.toUpperCase().includes("APPLIED:");
                      const isDiscount = cleanItem.toUpperCase().includes("DISCOUNT:");
                      return (
                        <li key={iIdx} className="text-xs font-bold text-gray-800 flex items-start gap-1.5">
                          <span className={`mt-0.5 ${isFreebie ? 'text-green-500' : isApplied ? 'text-pink-500' : isDiscount ? 'text-orange-500' : 'text-gray-400'}`}>
                            {isFreebie ? '🎁' : isApplied ? '✨' : isDiscount ? '🔥' : '•'}
                          </span>
                          <span className={`leading-snug ${isFreebie ? 'text-green-700' : isApplied ? 'text-pink-700' : isDiscount ? 'text-orange-700' : ''}`}>
                            {cleanItem}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-200 mt-2 mb-2">
                  <div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Payment</div>
                    <div className="text-xs font-black text-gray-800 uppercase">{paymentMode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</div>
                    <div className="text-lg font-black text-blue-900 leading-none">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {hasDocuments && (
                  <div className="pt-4 border-t border-gray-100 mt-2 bg-gray-50 -mx-5 px-5 pb-1 mb:-5 rounded-b-3xl">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Order Tracking & Documents
                    </div>
                    {logistics && (
                      <div className="mb-3 bg-white p-2 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 flex items-start gap-2">
                        <span className="text-orange-500">🚚</span> 
                        <span>{logistics}</span>
                      </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
                      {renderDocButton(call1, "Call 1", "🎧", "bg-white border-gray-200 text-gray-700")}
                      {renderDocButton(stockPhoto, "Stock Photo", "📦", "bg-white border-blue-100 text-blue-900")}
                      {renderDocButton(invoicePhoto, "Tax Invoice", "📄", "bg-white border-purple-100 text-purple-900")}
                      {renderDocButton(boxPhoto, "Box Photo", "🗃️", "bg-white border-indigo-100 text-indigo-900")}
                      {renderDocButton(lrPhoto, "LR / Courier", "🚚", "bg-white border-orange-100 text-orange-900")}
                      {renderDocButton(finalCall, "Final Call", "📞", "bg-white border-gray-200 text-gray-700")}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}