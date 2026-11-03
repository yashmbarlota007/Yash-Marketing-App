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
    const phone = user && (user.phone || user.mobile) ? String(user.phone || user.mobile) : '';
    if (!phone) {
      setLoading(false);
      return;
    }
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getLedger", phone: phone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).then(res => {
      if (res && res.success && Array.isArray(res.data)) {
        setLedgerData(res.data);
      } else if (Array.isArray(res)) {
        setLedgerData(res);
      } else {
        console.warn(res && res.message ? res.message : "Ledger statement sync issue.");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

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
  const [refreshing, setRefreshing] = useState(false);
  const [zoomedMedia, setZoomedMedia] = useState(null);
  const [expandedTimelines, setExpandedTimelines] = useState({});

  const BACKEND_FULFILLMENT_API = "https://script.google.com/macros/s/AKfycbyXHJaFTSkjwu6C8ze4czs2Q42NQsgzjW814j8OLA7ztMXTW-nqmh2gkpjebmdSW4YJjA/exec";

  // 🚚 GOOGLE DRIVE FILE & PHOTO HELPERS
  const getFileId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return dMatch ? dMatch[1] : (idMatch ? idMatch[1] : null);
  };

  const getDriveThumbUrl = (urlOrId) => {
    if (!urlOrId || typeof urlOrId !== 'string') return '';
    const fileId = getFileId(urlOrId) || urlOrId;
    if (!fileId || typeof fileId !== 'string' || fileId.includes('/')) return urlOrId;
    return `https://lh3.googleusercontent.com/d/${fileId}=w400`;
  };

  const getDriveHighResUrl = (urlOrId) => {
    if (!urlOrId || typeof urlOrId !== 'string') return '';
    const fileId = getFileId(urlOrId) || urlOrId;
    if (!fileId || typeof fileId !== 'string' || fileId.includes('/')) return urlOrId;
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  };

  // 📋 FULFILLMENT STAGES CONFIGURATION (9 STAGES)
  const FULFILLMENT_STAGES_CONFIG = [
    { id: 0, key: 'balance_check', en: 'Balance / Advance Check', hi: 'एडवांस / बैलेंस चेक', mr: 'अॅडव्हान्स / शिल्लक पडताळणी', icon: '💳' },
    { id: 1, key: 'wa_confirm', en: 'Order Confirmation', hi: 'ऑर्डर कन्फर्मेशन', mr: 'ऑर्डर निश्चिती', icon: '📝' },
    { id: 2, key: 'stock_photo', en: 'Stock Photo', hi: 'स्टॉक फोटो', mr: 'स्टॉक फोटो', icon: '📦' },
    { id: 3, key: 'invoice_photo', en: 'Invoice / Bill Photo', hi: 'बिल / इनवॉइस फोटो', mr: 'बिल / इनव्हॉइस फोटो', icon: '🧾' },
    { id: 4, key: 'box_photo', en: 'Box Packing Photo', hi: 'बॉक्स पॅकिंग फोटो', mr: 'खोका / बॉक्स पॅकिंग फोटो', icon: '🎁' },
    { id: 5, key: 'dispatch', en: 'Dispatched / Runner Assigned', hi: 'डिस्पैच / रनर रवाना', mr: 'डिस्पॅच / डिलिव्हरीसाठी रवाना', icon: '🚚' },
    { id: 6, key: 'out_for_delivery', en: 'Out for Delivery Update', hi: 'डिलिव्हरी सूचना', mr: 'डिलिव्हरी सूचना पाठवली', icon: '📲' },
    { id: 7, key: 'delivery_proof', en: 'Delivery Proof (POD)', hi: 'डिलिव्हरी पावती (POD)', mr: 'डिलिव्हरी पावती (POD)', icon: '✅' },
    { id: 8, key: 'feedback', en: 'Order Completed & Rated', hi: 'ऑर्डर पूर्ण व फीडबॅक', mr: 'ऑर्डर पूर्ण व अभिप्राय', icon: '⭐' }
  ];

  // 🛠️ PARSER FOR STAGE URLS WITH TIMESTAMPS, STAFF & MULTIPLE PHOTOS
  const parseOrderStages = (ord) => {
    const stageUrls = Array.isArray(ord.stageUrls) ? ord.stageUrls : [];
    const timeline = [];
    const allPhotos = [];
    let runnerDetails = ord.DeliveryDetails || "";
    let latestCompletedTime = "";

    stageUrls.forEach((rawEntry, idx) => {
      if (!rawEntry || typeof rawEntry !== 'string' || !rawEntry.trim()) return;
      const parts = rawEntry.split('||').map(p => p.trim());
      const mainContent = parts[0] || '';
      
      let timeFormatted = "";
      let staffName = "";

      parts.slice(1).forEach(p => {
        if (p.startsWith('TIME:')) {
          const tVal = p.replace('TIME:', '').trim();
          const num = Number(tVal);
          if (!isNaN(num) && num > 0) {
            const d = new Date(num);
            timeFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            latestCompletedTime = timeFormatted;
          }
        } else if (p.startsWith('STAFF:')) {
          staffName = p.replace('STAFF:', '').trim();
        }
      });

      const cfg = FULFILLMENT_STAGES_CONFIG[idx] || { id: idx, key: 'stage_' + idx, en: 'Stage ' + (idx + 1), hi: 'स्टेज ' + (idx + 1), mr: 'टप्पा ' + (idx + 1), icon: '📌' };
      const stageName = cfg[lang] || cfg.en;
      const isSkipped = mainContent.toLowerCase().includes('skipped') || mainContent.toLowerCase().includes('didn\'t respond');

      // Extract all URLs (supports multiple comma-separated URLs)
      const stagePhotos = [];
      const tokens = mainContent.split(',').map(s => s.trim());
      tokens.forEach((tok, tokIdx) => {
        const match = tok.match(/(https?:\/\/[^\s]+)/i);
        if (match) {
          const url = match[1];
          const fileId = getFileId(url);
          const photoLabel = tokens.length > 1 ? `${stageName} (${tokIdx + 1})` : stageName;
          const photoObj = {
            label: photoLabel,
            stageIndex: idx,
            stageName: stageName,
            url: url,
            fileId: fileId,
            thumbUrl: getDriveThumbUrl(fileId || url),
            highResUrl: getDriveHighResUrl(fileId || url),
            time: timeFormatted,
            staff: staffName
          };
          stagePhotos.push(photoObj);
          allPhotos.push(photoObj);
        }
      });

      if (mainContent.includes('[Runner:') || mainContent.includes('Runner:')) {
        runnerDetails = mainContent.replace(/^\[|\]$/g, '').trim();
      }

      timeline.push({
        stageIndex: idx,
        name: stageName,
        icon: cfg.icon,
        isCompleted: !isSkipped && (stagePhotos.length > 0 || mainContent.startsWith('[') || mainContent.length > 3),
        isSkipped: isSkipped,
        time: timeFormatted,
        staff: staffName,
        details: mainContent.startsWith('[') ? mainContent.replace(/^\[|\]$/g, '') : (stagePhotos.length > 0 ? `${stagePhotos.length} Photo(s) Attached` : mainContent),
        photos: stagePhotos
      });
    });

    // Also include any photos explicitly mapped from legacy order columns
    const legacyPhotos = [
      { label: t('stock_photo', lang) || 'Stock Photo', url: ord.StockPhoto || ord.stockPhoto, icon: '📦' },
      { label: t('invoice_photo', lang) || 'Invoice Photo', url: ord.InvoicePhoto || ord.invoicePhoto, icon: '🧾' },
      { label: t('box_photo', lang) || 'Box Photo', url: ord.BoxPhoto || ord.boxPhoto, icon: '🎁' },
      { label: t('delivery_proof', lang) || 'Delivery Proof (POD)', url: ord.POD || ord.pod || ord.DeliveryProof, icon: '✅' }
    ];

    legacyPhotos.forEach(leg => {
      if (leg.url && typeof leg.url === 'string' && leg.url.startsWith('http')) {
        const fileId = getFileId(leg.url);
        if (!allPhotos.some(p => p.url === leg.url || (fileId && p.fileId === fileId))) {
          allPhotos.push({
            label: leg.label,
            stageIndex: -1,
            stageName: leg.label,
            url: leg.url,
            fileId: fileId,
            thumbUrl: getDriveThumbUrl(fileId || leg.url),
            highResUrl: getDriveHighResUrl(fileId || leg.url),
            time: ord.date || '',
            staff: ''
          });
        }
      }
    });

    return { timeline, allPhotos, runnerDetails, latestCompletedTime };
  };

  const fetchOrders = (isManualRefresh = false) => {
    const rawPhone = user && (user.phone || user.mobile) ? String(user.phone || user.mobile) : '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const shopName = user && (user.shopName || user.name) ? String(user.shopName || user.name).toLowerCase().trim() : '';

    if (!cleanPhone && !shopName) {
      setLoading(false);
      return;
    }

    if (isManualRefresh) setRefreshing(true);

    const pBackend = fetch(BACKEND_FULFILLMENT_API, {
      method: 'POST',
      body: JSON.stringify({ action: "getOrders", staffName: "DealerApp" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    const pLocal = fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDealerOrders", phone: cleanPhone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    Promise.all([pBackend, pLocal]).then(([resBackend, resLocal]) => {
      const mergedMap = {};

      // 1. Local sheet orders
      const localList = (resLocal && resLocal.success && Array.isArray(resLocal.data)) ? resLocal.data : (Array.isArray(resLocal) ? resLocal : []);
      localList.forEach(ord => {
        if (ord && ord.orderId) {
          mergedMap[ord.orderId] = ord;
        }
      });

      // 2. Overwrite / enrich with Live Fulfillment Backend Orders (Priority: Real status + Step Photos + Timestamps)
      const backendList = (resBackend && Array.isArray(resBackend.data)) ? resBackend.data : [];
      const matchingBackend = backendList.filter(bo => {
        const boPhone = String(bo.phone || '').replace(/\D/g, '').slice(-10);
        const boShop = String(bo.shopName || '').toLowerCase().trim();
        return (cleanPhone && boPhone === cleanPhone) || (shopName && boShop.includes(shopName)) || (shopName && shopName.includes(boShop));
      });

      matchingBackend.forEach(bo => {
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

        const mapped = {
          orderId: bo.orderId,
          date: bo.date ? new Date(bo.date).toLocaleDateString('en-GB') : '',
          status: status,
          payment: bo.paymentMode || 'DAILY',
          amount: bo.totalValue || 0,
          items: itemsBlueprint,
          itemsDetails: bo.items || [],
          stageUrls: bo.stageUrls || [],
          completedStages: bo.completedStages || 0,
          isFullyCompleted: !!bo.isFullyCompleted,
          lastUpdatedBy: bo.lastUpdatedBy || ''
        };

        if (mergedMap[mapped.orderId]) {
          const prev = mergedMap[mapped.orderId];
          mergedMap[mapped.orderId] = {
            ...prev,
            ...mapped,
            status: mapped.status !== 'Pending' ? mapped.status : prev.status,
            stageUrls: mapped.stageUrls.length > 0 ? mapped.stageUrls : prev.stageUrls
          };
        } else {
          mergedMap[mapped.orderId] = mapped;
        }
      });

      const finalOrders = Object.values(mergedMap);
      // Sort orders descending by date
      finalOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      // Auto-expand timeline of latest order by default
      if (finalOrders.length > 0 && Object.keys(expandedTimelines).length === 0) {
        setExpandedTimelines({ [finalOrders[0].orderId]: true });
      }

      setOrders(finalOrders);
      setLoading(false);
      setRefreshing(false);
    }).catch(err => {
      console.error("Order sync error:", err);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchOrders(false);
    const handleFocus = () => fetchOrders(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, lang]);

  const toggleTimeline = (orderId) => {
    setExpandedTimelines(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-blue-900 font-sans">
        <div className="border-4 border-current border-t-transparent w-12 h-12 rounded-full spinner mb-4"></div>
        <p className="font-bold">{t('generating_order_history', lang)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-[100px] font-sans relative">
      {/* Top Header & Refresh Control */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h2 className="font-black text-gray-800 text-lg uppercase tracking-wide">
            {t('my_past_orders', lang)} ({orders.length})
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Warehouse Updates Active</span>
          </div>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="bg-blue-900 hover:bg-blue-800 text-white font-black text-xs px-3 py-2 rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className={refreshing ? "animate-spin inline-block" : ""}>🔄</span>
          <span>{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border text-gray-400 font-bold uppercase">
          {t('no_orders_record', lang)}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord, idx) => {
            const stepInfo = getOrderStatusStep(ord.status);
            const itemsList = ord.items ? ord.items.toString().split(" | ") : ["N/A"];
            const { timeline, allPhotos, runnerDetails, latestCompletedTime } = parseOrderStages(ord);
            const isTimelineOpen = !!expandedTimelines[ord.orderId];

            return (
              <div key={idx} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between animate-fade-in relative overflow-hidden">
                
                {/* 🚚 Order Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <div className="font-black text-blue-900 text-sm">{ord.orderId}</div>
                    <div className="text-[10px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1">
                      <span>📅</span>
                      <span>{ord.date}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs border ${stepInfo.badgeClass}`}>
                    {translateStatus(ord.status, lang) || ord.status || "Pending"}
                  </span>
                </div>

                {/* 🏃 Runner & Transport Alert Badge */}
                {runnerDetails && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-2.5 mb-3 flex items-center gap-2.5">
                    <span className="text-xl">🚚</span>
                    <div className="text-xs">
                      <div className="font-black text-blue-950 uppercase tracking-tight text-[11px]">
                        {lang === 'mr' ? 'डिलिव्हरी रनर माहिती:' : lang === 'hi' ? 'डिस्पैच व रनर जानकारी:' : 'Dispatch & Runner Info:'}
                      </div>
                      <div className="font-bold text-blue-800 text-[11px] mt-0.5">
                        {runnerDetails}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🚚 4-Stage Summary Progress Stepper */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-3 shadow-2xs">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-wider mb-2 text-center">
                    <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 1 ? 'text-blue-900 font-black' : 'text-gray-400'}`}>
                      <span className="text-[14px]">📝</span>
                      <span>{lang === 'mr' ? 'नोंदवली' : lang === 'hi' ? 'दर्ज' : 'Placed'}</span>
                    </span>
                    <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 2 ? 'text-indigo-900 font-black' : 'text-gray-400'}`}>
                      <span className="text-[14px]">📦</span>
                      <span>{lang === 'mr' ? 'पॅकिंग' : lang === 'hi' ? 'पैकिंग' : 'Packing'}</span>
                    </span>
                    <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 3 ? 'text-blue-900 font-black' : 'text-gray-400'}`}>
                      <span className="text-[14px]">🚚</span>
                      <span>{lang === 'mr' ? 'पाठवले' : lang === 'hi' ? 'डिस्पैच' : 'Dispatched'}</span>
                    </span>
                    <span className={`w-1/4 flex flex-col items-center ${stepInfo.step >= 4 ? 'text-emerald-700 font-black' : 'text-gray-400'}`}>
                      <span className="text-[14px]">✅</span>
                      <span>{lang === 'mr' ? 'पोहोचवले' : lang === 'hi' ? 'डिलीवर' : 'Completed'}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${stepInfo.color}`}
                      style={{ width: `${stepInfo.percent}%` }}
                    ></div>
                  </div>
                  {latestCompletedTime && (
                    <div className="text-[9px] text-gray-500 font-bold mt-2 text-center flex items-center justify-center gap-1">
                      <span>⏱️</span>
                      <span>Last Update: <strong>{latestCompletedTime}</strong></span>
                    </div>
                  )}
                </div>

                {/* 📸 DIRECT PHOTO GALLERY STRIP: STOCK PHOTO, BILL PHOTO, BOX PHOTO, POD */}
                {allPhotos.length > 0 ? (
                  <div className="py-2.5 mb-3 border-b border-dashed border-gray-200">
                    <div className="text-[10px] text-gray-700 font-black uppercase mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-950">
                        <span>📸</span>
                        <span>{t('order_docs', lang)} ({allPhotos.length} Photos)</span>
                      </span>
                      <span className="text-[9px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                        Tap to View & Zoom
                      </span>
                    </div>
                    
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {allPhotos.map((photo, pIdx) => (
                        <div 
                          key={pIdx} 
                          onClick={() => setZoomedMedia(photo)} 
                          className="min-w-[84px] w-[84px] flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                        >
                          <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-blue-200/80 overflow-hidden flex items-center justify-center shadow-xs relative group">
                            <img 
                              src={photo.thumbUrl} 
                              alt={photo.label} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                if (photo.fileId && !e.target.src.includes('thumbnail?id')) {
                                  e.target.src = `https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w400`;
                                } else {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = '<span class="text-2xl">📸</span>';
                                }
                              }}
                            />
                            {photo.time && (
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-[7px] text-white font-bold px-1 py-0.5 text-center truncate">
                                {photo.time.split(',')[1] || photo.time}
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] font-black text-gray-800 text-center leading-tight line-clamp-2 w-full mt-0.5">
                            {photo.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl mb-3 flex items-start gap-2 text-xs">
                    <span className="text-base">📦</span>
                    <div className="text-[11px] text-amber-950 font-medium leading-relaxed">
                      <strong>{lang === 'mr' ? 'पॅकिंग व पडताळणी सुरू आहे:' : lang === 'hi' ? 'पैकिंग और सत्यापन जारी है:' : 'Warehouse Verification in Progress:'}</strong>{' '}
                      {lang === 'mr' 
                        ? 'ऑर्डर पॅक होताच स्टॉक फोटो, इनव्हॉइस आणि खोक्याचे प्रत्यक्ष फोटो येथे उपलब्ध होतील.' 
                        : lang === 'hi' 
                        ? 'ऑर्डर पैक होते ही स्टॉक फोटो, बिल और बॉक्स का फोटो यहाँ स्वतः आ जाएगा।' 
                        : 'Live stock photo, bill photo, and box packing photos will appear here as soon as completed in warehouse.'}
                    </div>
                  </div>
                )}

                {/* ⏱️ STEP-BY-STEP AUDIT TRAIL / TIMELINE (HAR STEP KA TIME) */}
                {timeline.length > 0 && (
                  <div className="mb-3 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <button
                      onClick={() => toggleTimeline(ord.orderId)}
                      className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">⏱️</span>
                        <div>
                          <div className="text-xs font-black text-gray-900">
                            {lang === 'mr' ? 'प्रत्येक टप्प्याची वेळ (Step Timestamps)' : lang === 'hi' ? 'हर स्टेप का समय (Step Timelines)' : 'Step-by-Step Completion Times'}
                          </div>
                          <div className="text-[9px] text-gray-500 font-semibold">
                            {timeline.filter(t => t.isCompleted).length} of {timeline.length} Steps Completed
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 font-black text-xs">
                        {isTimelineOpen ? '▲ Hide' : '▼ View Times'}
                      </span>
                    </button>

                    {isTimelineOpen && (
                      <div className="p-3.5 space-y-3 bg-white border-t border-gray-100">
                        {timeline.map((st, sIdx) => {
                          const isLast = sIdx === timeline.length - 1;
                          return (
                            <div key={sIdx} className="flex items-start gap-3 relative">
                              {!isLast && (
                                <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${st.isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                              )}
                              
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs z-10 ${
                                st.isCompleted ? 'bg-emerald-600 text-white font-bold' : (st.isSkipped ? 'bg-gray-200 text-gray-500' : 'bg-amber-100 text-amber-800')
                              }`}>
                                {st.isCompleted ? '✓' : st.icon}
                              </div>

                              <div className="flex-1 pb-1">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="font-black text-xs text-gray-900 flex items-center gap-1.5">
                                    <span>{st.icon}</span>
                                    <span>{st.name}</span>
                                  </span>
                                  {st.time ? (
                                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ⏰ {st.time}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-gray-400">
                                      {st.isSkipped ? 'Skipped' : 'Pending'}
                                    </span>
                                  )}
                                </div>

                                {st.staff && (
                                  <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                    👤 Verified by: <strong className="text-gray-700">{st.staff}</strong>
                                  </div>
                                )}

                                {st.details && !st.details.includes('Photo(s) Attached') && (
                                  <div className="text-[10px] text-blue-900 bg-blue-50/80 px-2 py-1 rounded-lg mt-1 font-semibold border border-blue-100">
                                    {st.details}
                                  </div>
                                )}

                                {/* Inline Photo preview for this specific step */}
                                {st.photos && st.photos.length > 0 && (
                                  <div className="flex gap-2 mt-1.5">
                                    {st.photos.map((p, pi) => (
                                      <div
                                        key={pi}
                                        onClick={() => setZoomedMedia(p)}
                                        className="w-12 h-12 rounded-xl overflow-hidden border border-blue-300 shadow-2xs cursor-pointer active:scale-95"
                                      >
                                        <img src={p.thumbUrl} alt={p.label} className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 📋 Ordered Items Blueprint */}
                <div className="py-2.5 border-b border-dashed border-gray-200 mb-2">
                  <div className="text-[9px] text-gray-400 font-black uppercase mb-1.5 flex items-center justify-between">
                    <span>{t('order_billing_blueprint', lang)}</span>
                    <span className="text-gray-500 font-bold text-[9px]">{itemsList.length} Items</span>
                  </div>
                  <div className="space-y-1">
                    {itemsList.map((it, i) => {
                      const isDiscount = it.toLowerCase().includes("discount") || it.toLowerCase().includes("reward");
                      return (
                        <div 
                          key={i} 
                          className={`text-[11px] p-2 rounded-xl flex items-center justify-between ${
                            isDiscount ? 'bg-emerald-50 text-emerald-800 font-black border border-emerald-200' : 'bg-gray-50 text-gray-800 font-bold border border-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 min-w-0 flex-1 pr-2 truncate">
                            <span className="text-[10px]">{isDiscount ? '🎁' : '•'}</span>
                            <span className="truncate">{translateProductName(it, lang)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 💰 Payment Mode & Total Amount */}
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <div className="text-[9px] text-gray-400 font-black uppercase">{t('payment_label', lang)}</div>
                    <div className="text-xs font-black text-gray-700">{translatePaymentMode(ord.payment || ord.paymentMode, lang)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-400 font-black uppercase">{t('final_amount', lang)}</div>
                    <div className="text-base font-black text-blue-900">
                      ₹{Number(ord.amount || ord.finalAmount || ord.totalAmount || 0).toLocaleString('en-IN')}
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
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col justify-center items-center p-4 animate-fade-in" onClick={() => setZoomedMedia(null)}>
          <button className="absolute top-4 right-5 text-white font-black text-xl bg-gray-800/80 w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-gray-700">
            ✕
          </button>
          
          <div className="text-white font-black mb-3 uppercase tracking-wider text-center flex flex-col gap-0.5">
            <span className="text-base">{zoomedMedia.label}</span>
            {zoomedMedia.time && <span className="text-[10px] text-emerald-400 font-bold">⏰ {zoomedMedia.time}</span>}
            {zoomedMedia.staff && <span className="text-[9px] text-gray-400">Verified by: {zoomedMedia.staff}</span>}
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
          ) : zoomedMedia.highResUrl || zoomedMedia.fileId ? (
            <div className="w-full max-w-md flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-h-[70vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-gray-800">
                <img 
                  src={zoomedMedia.highResUrl || `https://lh3.googleusercontent.com/d/${zoomedMedia.fileId}`} 
                  alt={zoomedMedia.label} 
                  className="max-h-[68vh] max-w-full object-contain"
                  onError={(e) => {
                    if (zoomedMedia.fileId && !e.target.src.includes('thumbnail?id')) {
                      e.target.src = `https://drive.google.com/thumbnail?id=${zoomedMedia.fileId}&sz=w1200`;
                    } else if (zoomedMedia.fileId) {
                      e.target.onerror = null;
                      e.target.outerHTML = `<iframe src="https://drive.google.com/file/d/${zoomedMedia.fileId}/preview" class="w-full h-[65vh] border-0"></iframe>`;
                    }
                  }}
                />
              </div>
              <a 
                href={zoomedMedia.url || (zoomedMedia.fileId ? `https://drive.google.com/file/d/${zoomedMedia.fileId}/view` : '#')} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                <span>📥</span>
                <span>{t('open_drive_link', lang)}</span>
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
