import React, { useEffect } from 'react';
import { getNum, OFFICE_NUMBER } from '../utils/helpers';
import { LANGUAGES, t } from '../utils/translations';

export function LanguageBar({ currentLang = 'en', onSelectLang }) {
  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-2.5 px-3 text-white shadow-md border-b-2 border-amber-400">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg animate-pulse">🌐</span>
          <div className="truncate">
            <span className="text-[11px] font-black text-amber-300 block truncate">
              {t('change_language_instruction', currentLang)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-black/40 p-1 rounded-xl border border-white/20 shadow-inner">
          {LANGUAGES.map((l) => {
            const isActive = currentLang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => onSelectLang(l.code)}
                className={`flex items-center gap-1 text-[11px] font-black py-1.5 px-2.5 rounded-lg transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-amber-400 text-gray-950 font-black shadow-md ring-1 ring-white scale-105'
                    : 'text-white hover:bg-white/10 hover:text-amber-200'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.native}</span>
                {isActive && <span className="text-[9px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ totalAmount = 0, discounts = [], lang = 'en' }) {
  const safeDiscounts = Array.isArray(discounts) ? discounts : [];
  var sortedDiscounts = [...safeDiscounts]
    .map(d => ({ minAmount: getNum(d.minAmount), percent: getNum(d.percent) }))
    .filter(d => !isNaN(d.minAmount) && !isNaN(d.percent))
    .sort((a, b) => a.minAmount - b.minAmount);

  if (sortedDiscounts.length === 0) return null;

  var activeTier = null;
  var nextTier = null;

  for (var i = 0; i < sortedDiscounts.length; i++) {
    if (totalAmount >= sortedDiscounts[i].minAmount) {
      activeTier = sortedDiscounts[i];
    } else {
      nextTier = sortedDiscounts[i];
      break;
    }
  }

  var progress = 0;
  var message = "";

  if (!activeTier) {
    var first = sortedDiscounts[0];
    progress = (totalAmount / first.minAmount) * 100;
    const needMore = (first.minAmount - totalAmount).toLocaleString('en-IN');
    if (lang === 'mr') {
      message = first.percent + "% डिस्काउंट अनलॉक करण्यासाठी अजून ₹" + needMore + " जोडा";
    } else if (lang === 'hi') {
      message = first.percent + "% डिस्काउंट पाने के लिए ₹" + needMore + " का सामान और जोड़ें";
    } else {
      message = "Add ₹" + needMore + " more to unlock " + first.percent + "% discount";
    }
  } else if (nextTier) {
    var range = (nextTier.minAmount - activeTier.minAmount) || 1;
    var currentInRange = totalAmount - activeTier.minAmount;
    progress = (currentInRange / range) * 100;
    const needMore = (nextTier.minAmount - totalAmount).toLocaleString('en-IN');
    if (lang === 'mr') {
      message = "🎉 " + activeTier.percent + "% अनलॉक! " + nextTier.percent + "% साठी अजून ₹" + needMore + " जोडा";
    } else if (lang === 'hi') {
      message = "🎉 " + activeTier.percent + "% अनलॉक! " + nextTier.percent + "% छूट के लिए ₹" + needMore + " और जोड़ें";
    } else {
      message = "🎉 " + activeTier.percent + "% Unlocked! Add ₹" + needMore + " more to get " + nextTier.percent + "% discount";
    }
  } else {
    progress = 100;
    if (lang === 'mr') {
      message = "🎉 कमाल " + activeTier.percent + "% मोठ्या खरेदीवर डिस्काउंट अनलॉक!";
    } else if (lang === 'hi') {
      message = "🎉 अधिकतम " + activeTier.percent + "% बल्क डिस्काउंट अनलॉक हो गया!";
    } else {
      message = "🎉 Maximum " + activeTier.percent + "% Bulk Discount Unlocked!";
    }
  }

  return (
    <div className="bg-amber-50 p-4 border-b-2 border-amber-200 shadow-sm">
      <div className="flex justify-between text-xs font-black text-amber-900 mb-1.5 uppercase tracking-wider">
        <span>{t('bulk_tracker', lang)}</span>
        <span className="bg-amber-200 px-2 py-0.5 rounded-full text-[11px]">
          {activeTier ? activeTier.percent + "% " + t('active_discount', lang) : t('no_discount', lang)} (₹{totalAmount.toLocaleString('en-IN')})
        </span>
      </div>
      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden border border-gray-300 shadow-inner">
        <div className="bg-green-600 h-full transition-all duration-300" style={{ width: Math.min(progress, 100) + '%' }}></div>
      </div>
      <p className="text-[10px] text-green-800 font-black mt-2 uppercase tracking-wide flex items-center gap-1">
        <span>💡</span> {message}
      </p>
    </div>
  );
}

export function ContactFABs({ view }) {
  if (view === 'cart') return null;
  return (
    <div className="fixed bottom-[95px] right-4 flex flex-col gap-3 z-30">
      <a href={`https://wa.me/${OFFICE_NUMBER}?text=Hello%20Yash%20Marketing,%20Mujhe%20order%20ke%20baare%20me%20inquiry%20karni%20hai.`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform border-2 border-white">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      <a href={`tel:+${OFFICE_NUMBER}`} className="w-12 h-12 bg-blue-600 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform border-2 border-white">
        <span className="text-xl text-white">📞</span>
      </a>
    </div>
  );
}

export function BottomNav({ view, setView, totalItems, customerMode, lang = 'en' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around items-center pt-2 pb-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button onClick={() => setView('catalog')} className={`flex flex-col items-center flex-1 ${view==='catalog'?'text-blue-900':'text-gray-400'}`}>
        <span className="text-xl mb-0.5">🏠</span>
        <span className="text-[10px] font-black">{t('nav_home', lang)}</span>
      </button>

      <button onClick={() => setView('offers')} className={`flex flex-col items-center flex-1 ${view==='offers'?'text-blue-900':'text-gray-400'}`}>
        <span className="text-xl mb-0.5">🎁</span>
        <span className="text-[10px] font-black">{t('nav_offers', lang)}</span>
      </button>

      {!customerMode && (
        <button onClick={() => setView('orders')} className={`flex flex-col items-center flex-1 ${view==='orders'?'text-blue-900':'text-gray-400'}`}>
          <span className="text-xl mb-0.5">📦</span>
          <span className="text-[10px] font-black">{t('nav_orders', lang)}</span>
        </button>
      )}

      {!customerMode && (
        <button onClick={() => setView('ledger')} className={`flex flex-col items-center flex-1 ${view==='ledger'?'text-blue-900':'text-gray-400'}`}>
          <span className="text-xl mb-0.5">📖</span>
          <span className="text-[10px] font-black">{t('nav_ledger', lang)}</span>
        </button>
      )}

      {!customerMode && (
        <button onClick={() => setView('replacements')} className={`flex flex-col items-center flex-1 ${view==='replacements'?'text-blue-900':'text-gray-400'}`}>
          <span className="text-xl mb-0.5">🎫</span>
          <span className="text-[10px] font-black">{t('nav_help', lang)}</span>
        </button>
      )}

      <button onClick={() => setView('cart')} className={`flex flex-col items-center flex-1 relative ${view==='cart'?'text-blue-900':'text-gray-400'}`}>
        <span className="text-xl mb-0.5">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 right-3 bg-red-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
            {totalItems}
          </span>
        )}
        <span className="text-[10px] font-black">{t('nav_cart', lang)}</span>
      </button>
    </div>
  );
}

export function ScannerModal({ onScan, onClose, lang = 'en' }) {
  useEffect(() => {
    let html5QrCode;
    try {
      html5QrCode = new window.Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (decodedText) => {
          html5QrCode.stop().then(() => { 
            onScan(decodedText); 
          }).catch(() => { 
            onScan(decodedText); 
          });
        },
        (err) => {}
      ).catch(err => {
        alert("Camera start failed: Please ensure permissions are granted.");
        onClose();
      });
    } catch(e) {
      alert("Scanner not loaded properly.");
      onClose();
    }
    
    return () => {
      if(html5QrCode) {
        try {
          html5QrCode.stop().catch(() => {});
        } catch(e) {}
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fade-in">
      <div className="p-4 flex justify-between items-center text-white bg-gray-900">
        <span className="font-black uppercase text-sm">
          {lang === 'mr' ? 'उत्पादनाचा बारकोड स्कॅन करा' : lang === 'hi' ? 'सामान का बारकोड स्कैन करें' : 'Scan Product Barcode'}
        </span>
        <button onClick={onClose} className="font-black text-xl text-gray-300">✕</button>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-black border-2 border-dashed border-gray-600"></div>
        <p className="text-white text-center mt-6 text-xs font-bold bg-gray-800 p-4 rounded-xl border border-gray-700 w-full max-w-sm leading-relaxed">
          {lang === 'mr' 
            ? 'बॉक्सवर जेथे रंग लिहिला आहे तेथील बारकोड स्कॅन करा.' 
            : lang === 'hi' 
            ? 'बॉक्स पर जहां रंग लिखा होता है ठीक वही का बारकोड स्कैन करें।' 
            : 'Box pe jaha colour likha hota hai thik wahi pe jo barcode hai wo scan karo.'}
        </p>
      </div>
    </div>
  );
}
