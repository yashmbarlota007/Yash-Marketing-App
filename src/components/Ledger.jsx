import React, { useState, useEffect } from 'react';
import { API_URL } from '../utils/helpers';
import { t, translateStatus, translateProductName, translatePaymentMode } from '../utils/translations';


// 🚚 ORDER STATUS STEP CALCULATION
export const getOrderStatusStep = (statusStr) => {
  if (!statusStr) return { step: 1, percent: 25, color: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
  const s = String(statusStr).toLowerCase().trim();
  
  // Stage 4: Completed / Delivered / Done / Closed (100%)
  if (s.includes('deliver') || s.includes('complete') || s.includes('done') || s.includes('closed') || s.includes('पोहोचवले') || s.includes('पूर्ण') || s.includes('झाले') || s.includes('यशस्वी')) {
    return { step: 4, percent: 100, color: 'bg-emerald-600', badgeClass: 'bg-green-100 text-green-700 border-green-200' };
  }
  // Stage 3: Dispatched / In Transit / Out for Delivery (75%)
  if (s.includes('dispatch') || s.includes('transit') || s.includes('shipped') || s.includes('out') || s.includes('sent') || s.includes('पाठवले') || s.includes('मार्गावर') || s.includes('डिस्पॅच')) {
    return { step: 3, percent: 75, color: 'bg-blue-600', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
  // Stage 2: Packing / Processed / Billed / In Review (50%)
  if (s.includes('pack') || s.includes('process') || s.includes('bill') || s.includes('review') || s.includes('ready') || s.includes('inward') || s.includes('पॅकिंग') || s.includes('बिल') || s.includes('प्रक्रिया')) {
    return { step: 2, percent: 50, color: 'bg-indigo-600', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  // Stage 1: Placed / Pending / Raised (25%)
  return { step: 1, percent: 25, color: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
};

export function LedgerView(props) {
  var user = props.user;
  var lang = props.lang || 'en';
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phone = user && (user.phone || user.mobile) ? String(user.phone || user.mobile).replace(/\D/g, '').slice(-10) : '';
    const shopName = user && (user.shopName || user.name) ? String(user.shopName || user.name).toLowerCase().trim() : '';

    if (!phone && !shopName) {
      setLoading(false);
      return;
    }

    const BACKEND_FULFILLMENT_API = "https://script.google.com/macros/s/AKfycbyXHJaFTSkjwu6C8ze4czs2Q42NQsgzjW814j8OLA7ztMXTW-nqmh2gkpjebmdSW4YJjA/exec";

    const extractUrl = (str) => {
      if (!str || typeof str !== 'string') return null;
      const match = str.match(/(https?:\/\/[^\s|]+)/i);
      return match ? match[1] : null;
    };

    const stageLabels = [
      t('balance_check', lang) || 'Balance Check',
      t('wa_confirmation', lang) || 'WhatsApp Confirmation',
      t('stock_photo', lang) || 'Stock Photo',
      t('invoice_photo', lang) || 'Invoice Photo',
      t('box_photo', lang) || 'Box Photo',
      t('runner_dispatched', lang) || 'Runner / Dispatch',
      t('delivery_notification', lang) || 'Delivery Notification',
      t('delivery_proof', lang) || 'Delivery Proof (POD)',
      t('final_rating', lang) || 'Final Call Rating'
    ];

    const mapBackendOrder = (bo) => {
      const stageUrls = Array.isArray(bo.stageUrls) ? bo.stageUrls : [];
      const attachments = [];

      stageUrls.forEach((entry, idx) => {
        const u = extractUrl(entry);
        if (u) {
          const lbl = stageLabels[idx] || ('Stage ' + (idx + 1));
          attachments.push({
            label: lbl,
            url: u,
            type: u.includes('audio') ? 'audio' : 'image',
            source: 'backend_stage_' + (idx + 1)
          });
        }
      });

      let status = 'Pending';
      if (bo.isFullyCompleted || bo.completedStages >= 8) {
        status = 'Delivered';
      } else if (bo.completedStages >= 5) {
        status = 'Dispatched';
      } else if (bo.completedStages >= 3) {
        status = 'Packing';
      } else if (bo.completedStages >= 1) {
        status = 'Processing';
      }

      const itemsBlueprint = Array.isArray(bo.items) 
        ? bo.items.map(it => it.name + ' x' + (it.qty || 1)).join(' | ')
        : (bo.items ? String(bo.items) : 'N/A');

      const stockPhoto = extractUrl(stageUrls[2]);
      const invoicePhoto = extractUrl(stageUrls[3]);
      const boxPhoto = extractUrl(stageUrls[4]);
      const pod = extractUrl(stageUrls[7]);

      return {
        orderId: bo.orderId,
        date: bo.date ? new Date(bo.date).toLocaleDateString('en-GB') : '',
        status: status,
        payment: bo.paymentMode || 'DAILY',
        amount: bo.totalValue || 0,
        items: itemsBlueprint,
        itemsDetails: bo.items || [],
        StockPhoto: stockPhoto,
        InvoicePhoto: invoicePhoto,
        BoxPhoto: boxPhoto,
        POD: pod,
        attachments: attachments,
        completedStages: bo.completedStages || 0,
        isFullyCompleted: !!bo.isFullyCompleted
      };
    };

    // Parallel fetch from both Live Fulfillment Mainframe & Standard GAS Endpoint
    const pBackend = fetch(BACKEND_FULFILLMENT_API, {
      method: 'POST',
      body: JSON.stringify({ action: "getOrders", staffName: "DealerApp" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    const pLocal = fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDealerOrders", phone: phone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    Promise.all([pBackend, pLocal]).then(([resBackend, resLocal]) => {
      const mergedMap = {};

      // 1. Process local orders first
      const localList = (resLocal && resLocal.success && Array.isArray(resLocal.data)) ? resLocal.data : (Array.isArray(resLocal) ? resLocal : []);
      localList.forEach(ord => {
        if (ord && ord.orderId) {
          mergedMap[ord.orderId] = ord;
        }
      });

      // 2. Overwrite / enrich with Live Fulfillment Backend Orders (Priority: Real status + Step Photos)
      const backendList = (resBackend && Array.isArray(resBackend.data)) ? resBackend.data : [];
      const matchingBackend = backendList.filter(bo => {
        const boPhone = String(bo.phone || '').replace(/\D/g, '').slice(-10);
        const boShop = String(bo.shopName || '').toLowerCase().trim();
        return (phone && boPhone === phone) || (shopName && boShop.includes(shopName)) || (shopName && shopName.includes(boShop));
      });

      matchingBackend.forEach(bo => {
        const mapped = mapBackendOrder(bo);
        if (mergedMap[mapped.orderId]) {
          const prev = mergedMap[mapped.orderId];
          mergedMap[mapped.orderId] = {
            ...prev,
            ...mapped,
            status: mapped.status !== 'Pending' ? mapped.status : prev.status,
            attachments: mapped.attachments.length > 0 ? mapped.attachments : prev.attachments,
            StockPhoto: mapped.StockPhoto || prev.StockPhoto,
            InvoicePhoto: mapped.InvoicePhoto || prev.InvoicePhoto,
            BoxPhoto: mapped.BoxPhoto || prev.BoxPhoto,
            POD: mapped.POD || prev.POD
          };
        } else {
          mergedMap[mapped.orderId] = mapped;
        }
      });

      const finalOrders = Object.values(mergedMap);
      setOrders(finalOrders);
      setLoading(false);
    }).catch(err => {
      console.error("Order sync error:", err);
      setLoading(false);
    });
  }, [user, lang]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-blue-900">
        <div className="border-4 border-current border-t-transparent w-12 h-12 rounded-full spinner mb-4"></div>
        <p className="font-bold">{t('generating_ledger', lang)}</p>
      </div>
    );
  }

  let totalDebit = 0, totalCredit = 0;
  ledgerData.forEach(item => { 
    totalDebit += Number(item.debit) || 0; 
    totalCredit += Number(item.credit) || 0; 
  });
  const netBalance = totalDebit - totalCredit;

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[100px] font-sans">
      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
        <h2 className="font-black text-gray-800 text-lg mb-1">{t('account_summary', lang)}</h2>
        <p className="text-xs text-gray-400 mb-4 uppercase font-bold">{t('outstanding_bal', lang)}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <div className="text-[9px] text-red-600 font-bold uppercase">{t('total_bills', lang)}</div>
            <div className="font-black text-red-900 text-sm mt-1">₹{Math.round(totalDebit).toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
            <div className="text-[9px] text-green-600 font-bold uppercase">{t('total_paid', lang)}</div>
            <div className="font-black text-green-900 text-sm mt-1">₹{Math.round(totalCredit).toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <div className="text-[9px] text-blue-600 font-bold uppercase">{t('outstanding', lang)}</div>
            <div className="font-black text-blue-900 text-sm mt-1">₹{Math.round(netBalance).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <h3 className="font-black text-gray-800 text-md mb-3 px-1">{t('ledger_entries', lang)}</h3>
      <div className="space-y-3 font-mono">
        {ledgerData.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border text-gray-400 font-bold">{t('no_ledger_record', lang)}</div>
        ) : (
          ledgerData.map((item, index) => {
            const isDebit = Number(item.debit) > 0;
            return (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-start">
                <div className="w-2/3">
                  <div className="text-[10px] text-gray-400 font-bold">{item.date}</div>
                  <h4 className="text-xs font-black text-gray-800 mt-1 leading-snug">{item.particulars}</h4>
                  {item.vchType && (
                    <div className="flex gap-1.5 mt-1.5 font-sans">
                      <span className="bg-gray-100 text-gray-600 font-bold text-[8px] px-1.5 py-0.5 rounded uppercase">{item.vchType}</span>
                      {item.vchNo && (
                        <span className="bg-blue-50 text-blue-600 font-bold text-[8px] px-1.5 py-0.5 rounded">{t('vch_no', lang)} {item.vchNo}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {isDebit ? (
                    <div>
                      <div className="text-xs text-red-500 font-bold">{t('debit_label', lang)}</div>
                      <div className="font-black text-red-600 text-base mt-0.5">₹{Math.round(item.debit).toLocaleString('en-IN')}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-green-500 font-bold">{t('credit_label', lang)}</div>
                      <div className="font-black text-green-600 text-base mt-0.5">₹{Math.round(item.credit).toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <button 
        onClick={() => window.print()} 
        className="w-full bg-blue-900 text-white font-black py-4 rounded-xl shadow-lg mt-6 active:scale-95 text-xs uppercase tracking-wider"
      >
        {t('download_ledger_pdf', lang)}
      </button>
    </div>
  );
}

export function OrdersHistoryView(props) {
  var user = props.user;
  var lang = props.lang || 'en';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomedMedia, setZoomedMedia] = useState(null); 

  useEffect(() => {
    const phone = user && (user.phone || user.mobile) ? String(user.phone || user.mobile) : '';
    if (!phone) {
      setLoading(false);
      return;
    }

    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDealerOrders", phone: phone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).then(res => {
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data); 
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        console.warn("Orders history sync message:", res && res.message ? res.message : "No orders found");
      }
      setLoading(false);
    }).catch(err => {
      console.error("Order history fetch error:", err);
      setLoading(false);
    });
  }, [user]);

  const getFileId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (dMatch) return dMatch[1]; 
    if (idMatch) return idMatch[1]; 
    return null;
  };

  // Collect all photos, invoice, box photo, and call recordings from any mapped column
  const collectAttachments = (ord) => {
    const atts = Array.isArray(ord.attachments) ? [...ord.attachments] : [];

    const addIfMissing = (label, url, type = 'image') => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      if (!cleanUrl || cleanUrl.toLowerCase() === 'undefined' || cleanUrl.toLowerCase() === 'null') return;
      if (!atts.some(a => a.url === cleanUrl || a.label.toLowerCase() === label.toLowerCase())) {
        atts.push({ label, url: cleanUrl, type });
      }
    };

    addIfMissing(t('stock_photo', lang), ord.StockPhoto || ord.stockPhoto, 'image');
    addIfMissing(t('invoice_photo', lang), ord.InvoicePhoto || ord.invoicePhoto, 'image');
    addIfMissing(t('box_photo', lang), ord.BoxPhoto || ord.boxPhoto, 'image');
    addIfMissing(t('delivery_proof', lang), ord.POD || ord.pod || ord.DeliveryProof, 'image');
    addIfMissing(t('payment_proof', lang), ord.PaymentScreenshot || ord.screenshotUrl, 'image');
    addIfMissing(t('call_recording', lang), ord.CallRecording || ord.callRecording || ord.Call1 || ord.Call2, 'audio');

    // Deep key search for any drive/http photo or recording urls
    Object.keys(ord || {}).forEach(k => {
      const lk = k.toLowerCase().replace(/[\s_-]/g, '');
      const v = ord[k];
      if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))) {
        if (lk.includes('stock')) addIfMissing(t('stock_photo', lang), v, 'image');
        else if (lk.includes('invoice') || lk.includes('bill')) addIfMissing(t('invoice_photo', lang), v, 'image');
        else if (lk.includes('box') || lk.includes('packing')) addIfMissing(t('box_photo', lang), v, 'image');
        else if (lk.includes('pod') || lk.includes('delivery')) addIfMissing(t('delivery_proof', lang), v, 'image');
        else if (lk.includes('pay') || lk.includes('screen') || lk.includes('utr')) addIfMissing(t('payment_proof', lang), v, 'image');
        else if (lk.includes('call') || lk.includes('audio') || lk.includes('record')) addIfMissing(t('call_recording', lang), v, 'audio');
        else if (lk.includes('photo') || lk.includes('image') || lk.includes('drive') || lk.includes('file')) addIfMissing('Photo', v, 'image');
      }
    });

    return atts;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-blue-900">
        <div className="border-4 border-current border-t-transparent w-12 h-12 rounded-full spinner mb-4"></div>
        <p className="font-bold">{t('generating_order_history', lang)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[100px] font-sans relative">
      <h2 className="font-black text-gray-800 text-lg mb-4 px-1 uppercase tracking-wide">{t('my_past_orders', lang)}</h2>
      {orders.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border text-gray-400 font-bold uppercase">
          {t('no_orders_record', lang)}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord, idx) => {
            const itemsList = ord.items ? ord.items.toString().split(" | ") : ["N/A"];
            const allAttachments = collectAttachments(ord);

            return (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between animate-fade-in">
                {(() => {
                  const stepInfo = getOrderStatusStep(ord.status);
                  return (
                    <React.Fragment>
                      <div className="flex justify-between items-start border-b border-gray-50 pb-2 mb-2">
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold">{ord.date}</div>
                          <div className="font-black text-blue-900 text-xs mt-0.5">{ord.orderId}</div>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs border ${stepInfo.badgeClass}`}>
                          {translateStatus(ord.status, lang) || ord.status || "Pending"}
                        </span>
                      </div>

                      {/* 🚚 LIVE ORDER STATUS STEPPER & TRACKING */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 my-2 shadow-2xs">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-wider mb-1.5 text-center">
                          <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 1 ? 'text-blue-900 font-black' : 'text-gray-400'}`}>
                            <span className="text-[12px]">📝</span>
                            <span>{lang === 'mr' ? 'नोंदवली' : lang === 'hi' ? 'दर्ज' : 'Placed'}</span>
                          </span>
                          <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 2 ? 'text-indigo-900 font-black' : 'text-gray-400'}`}>
                            <span className="text-[12px]">📦</span>
                            <span>{lang === 'mr' ? 'पॅकिंग / प्रोसेस' : lang === 'hi' ? 'पैकिंग / प्रोसेस' : 'Processing'}</span>
                          </span>
                          <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 3 ? 'text-blue-900 font-black' : 'text-gray-400'}`}>
                            <span className="text-[12px]">🚚</span>
                            <span>{lang === 'mr' ? 'पाठवले' : lang === 'hi' ? 'डिस्पैच' : 'Dispatched'}</span>
                          </span>
                          <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 4 ? 'text-emerald-700 font-black' : 'text-gray-400'}`}>
                            <span className="text-[12px]">✅</span>
                            <span>{lang === 'mr' ? 'पूर्ण / पोहोचवले' : lang === 'hi' ? 'पूर्ण / डिलीवर' : 'Completed'}</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${stepInfo.color}`}
                            style={{ width: `${stepInfo.percent}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-gray-600 font-bold mt-2 text-center flex items-center justify-center gap-1">
                          <span className="text-gray-400">{lang === 'mr' ? 'सध्याचे अपडेट:' : lang === 'hi' ? 'वर्तमान अपडेट:' : 'Current Update:'}</span>
                          <span className="text-gray-900 font-black">{translateStatus(ord.status, lang) || ord.status || 'Pending'}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })()}

                {/* 📸 DOCUMENT GALLERY: REAL STOCK PHOTO, INVOICE, BOX PHOTO & CALL RECORDING */}
                {allAttachments && allAttachments.length > 0 ? (
                  <div className="py-2.5 border-b border-dashed border-gray-100">
                    <div className="text-[9px] text-gray-400 font-black uppercase mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1"><span>📁</span> {t('order_docs', lang)}</span>
                      <span className="text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[9px]">{allAttachments.length} Documents</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {allAttachments.map((att, i) => {
                        const fileId = getFileId(att.url);
                        const isAudio = att.type === 'audio' || (att.label && att.label.toLowerCase().includes('call'));
                        const isImage = !isAudio && att.type !== 'rating';
                        const thumbUrl = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` : att.url;

                        return (
                          <div 
                            key={i} 
                            onClick={() => setZoomedMedia({ ...att, fileId, isAudio })} 
                            className="min-w-[72px] w-[72px] flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center shadow-xs relative group">
                              {isAudio ? (
                                <div className="flex flex-col items-center justify-center bg-blue-50 w-full h-full text-blue-900">
                                  <span className="text-2xl animate-pulse">🎧</span>
                                  <span className="text-[7px] font-black text-blue-700 uppercase">PLAY</span>
                                </div>
                              ) : isImage && fileId ? (
                                <img 
                                  src={thumbUrl} 
                                  alt={att.label} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = '<span class="text-2xl">📸</span>';
                                  }}
                                />
                              ) : (
                                <span className="text-2xl">📸</span>
                              )}
                            </div>
                            <span className="text-[8px] font-black text-gray-700 text-center leading-tight line-clamp-2 w-full">
                              {att.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 px-3 bg-amber-50/70 border border-amber-200/60 rounded-xl my-2 flex items-start gap-2">
                    <span className="text-base shrink-0 mt-0.5">📦</span>
                    <div className="text-[11px] leading-tight flex-1">
                      <div className="font-black text-amber-950 uppercase tracking-wider text-[9px] mb-0.5">
                        {lang === 'mr' ? 'पडताळणी व डिस्पॅच अपडेट' : lang === 'hi' ? 'सत्यापन व डिस्पैच अपडेट' : 'Verification & Dispatch Update'}
                      </div>
                      <div className="text-amber-900 font-medium">
                        {stepInfo.step === 4
                          ? (lang === 'mr' ? 'ऑर्डर यशस्वीरीत्या पूर्ण व वितरित झाली आहे.' : lang === 'hi' ? 'ऑर्डर सफलतापूर्वक पूर्ण और डिलीवर हो चुकी है।' : 'Order successfully completed and delivered.')
                          : stepInfo.step === 3
                          ? (lang === 'mr' ? 'ऑर्डर गोदामातून डिस्पॅच झाली आहे. लवकरच पोहोचेल.' : lang === 'hi' ? 'ऑर्डर वेयरहाउस से डिस्पैच हो चुकी है। जल्द ही पहुंचेगी।' : 'Order dispatched from warehouse. Arriving soon.')
                          : stepInfo.step === 2
                          ? (lang === 'mr' ? 'ऑर्डर गोदामात पॅकिंग व प्रोसेस होत आहे. लवकरच पाठवले जाईल.' : lang === 'hi' ? 'ऑर्डर वेयरहाउस में पैकिंग और प्रोसेस हो रही है। जल्द डिस्पैच होगी।' : 'Order is being packed and prepared for dispatch.')
                          : (lang === 'mr' ? 'ऑर्डर गोदामात पॅकिंगसाठी प्रलंबित आहे. पॅक होताच प्रत्यक्ष स्टॉक, बॉक्स व इनव्हॉइस फोटो येथे उपलब्ध होतील.' : lang === 'hi' ? 'ऑर्डर वेयरहाउस में पैकिंग के लिए लंबित है। पैक होते ही स्टॉक, बॉक्स और बिल के फ़ोटो यहाँ उपलब्ध होंगे।' : 'Order is pending warehouse packing. Live photos of stock, box, and invoice will be updated once packed.')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="py-3 border-b border-dashed border-gray-100">
                  <div className="text-[9px] text-gray-400 font-black uppercase mb-1.5 flex items-center justify-between">
                    <span>{t('order_billing_blueprint', lang)}</span>
                    <span className="text-gray-500 font-bold text-[9px]">{itemsList.length} Items</span>
                  </div>
                  <div className="space-y-1.5">
                    {itemsList.map((it, i) => {
                      const isDiscount = it.toLowerCase().includes("discount") || it.toLowerCase().includes("reward");
                      return (
                        <div 
                          key={i} 
                          className={`text-xs p-2 rounded-lg flex items-center justify-between ${
                            isDiscount ? 'bg-emerald-50 text-emerald-800 font-black border border-emerald-200' : 'bg-gray-50 text-gray-800 font-bold border border-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 min-w-0 flex-1 pr-2 truncate">
                            <span>{isDiscount ? '🎁' : '•'}</span>
                            <span className="truncate">{translateProductName(it.trim(), lang)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <div className="text-[9px] text-gray-400 font-black uppercase">{t('payment_label', lang)}</div>
                    <div className="text-xs font-black text-gray-600">{translatePaymentMode(ord.paymentMode, lang)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-400 font-black uppercase">{t('final_amount', lang)}</div>
                    <div className="text-base font-black text-blue-900">
                      ₹{Number(ord.finalAmount || ord.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 FULL-RESOLUTION MEDIA & CALL RECORDING VIEWER */}
      {zoomedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex flex-col justify-center items-center p-4 animate-fade-in" onClick={() => setZoomedMedia(null)}>
          <button className="absolute top-4 right-5 text-white font-black text-xl bg-gray-800 bg-opacity-70 w-10 h-10 rounded-full flex items-center justify-center shadow-md z-50 hover:bg-gray-700">
            ✕
          </button>
          
          <div className="text-white font-black mb-3 uppercase tracking-wider text-center flex flex-col gap-0.5">
            <span className="text-base">{zoomedMedia.label}</span>
            <span className="text-[9px] text-gray-400">{t('secure_viewer', lang)}</span>
          </div>

          {zoomedMedia.isAudio ? (
            <div className="bg-gray-900 border-2 border-blue-500 p-6 rounded-3xl max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <span className="text-5xl animate-bounce">🎧</span>
              <h3 className="text-white font-black text-base">{t('call_recording', lang)}</h3>
              <p className="text-gray-400 text-xs font-semibold">{zoomedMedia.label}</p>
              
              <audio controls autoPlay src={zoomedMedia.url} className="w-full mt-2 rounded-lg" />
              
              <a 
                href={zoomedMedia.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-md active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                {t('open_drive_link', lang)}
              </a>
            </div>
          ) : zoomedMedia.fileId ? (
            <div className="w-full max-w-md flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-h-[70vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-gray-800">
                <img 
                  src={`https://drive.google.com/thumbnail?id=${zoomedMedia.fileId}&sz=w1200`} 
                  alt={zoomedMedia.label} 
                  className="max-h-[68vh] max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.outerHTML = `<iframe src="https://drive.google.com/file/d/${zoomedMedia.fileId}/preview" class="w-full h-[65vh] border-0"></iframe>`;
                  }}
                />
              </div>
              <a 
                href={zoomedMedia.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-md active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                {t('open_drive_link', lang)}
              </a>
            </div>
          ) : (
            <div className="bg-gray-800 p-8 rounded-3xl flex flex-col items-center gap-4 border border-gray-700 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <span className="text-5xl">🔗</span>
              <h3 className="text-white font-black text-lg text-center">{zoomedMedia.label}</h3>
              <a 
                href={zoomedMedia.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-blue-600 text-white font-black px-6 py-4 rounded-xl shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                {t('open_drive_link', lang)}
              </a>
            </div>
          )}

          <p className="text-gray-400 text-[10px] mt-4 font-bold uppercase tracking-wider text-center select-none pointer-events-none">
            {t('close_preview', lang)}
          </p>
        </div>
      )}
    </div>
  );
}
