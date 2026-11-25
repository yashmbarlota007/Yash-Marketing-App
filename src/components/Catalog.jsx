import React, { useState, useEffect, useRef } from 'react';
import { 
  API_URL, 
  getNum, 
  getProp, 
  getSmartImage, 
  groupProductsByVariant,
  calculateSchemeProgress,
  getProductSchemes,
  triggerCelebration,
  roundToNine,
  calculateGenuineSales,
  DEFAULT_DISCOUNTS
} from '../utils/helpers';
import { ProgressBar } from './SharedUI';
import { t, translateOfferText, translateReward, translateCategory, translateProductName, translateBrand } from '../utils/translations';


// 🎯 TARGET VS ACHIEVEMENT COMPONENT (MONTHLY & QUARTERLY 20% GROWTH DASHBOARD)
export function TargetCard({ targetStats, lang, customerMode, setView, globalProps, user, callAPI }) {
  const [activeModal, setActiveModal] = useState(null); // 'monthly' | 'quarterly' | null
  const [localBills, setLocalBills] = useState(null);
  const [loadingBills, setLoadingBills] = useState(false);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(null);

  useEffect(() => {
    setSelectedMonthFilter(null);
  }, [activeModal]);

  // If targetStats does not yet contain monthlyBills, load on demand when modal opens
  useEffect(() => {
    if (activeModal && user && user.phone && typeof callAPI === 'function' && (!targetStats?.monthlyBills || targetStats.monthlyBills.length === 0)) {
      setLoadingBills(true);
      callAPI({ action: "getLedger", phone: user.phone })
        .then(res => {
          if (res && res.success && Array.isArray(res.data)) {
            const genuine = calculateGenuineSales(res.data);
            setLocalBills({
              monthlyBills: genuine.monthlyBills,
              quarterlyBills: genuine.quarterlyBills,
              quarterMonths: genuine.quarterMonths
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoadingBills(false));
    }
  }, [activeModal, user?.phone]);

  if (customerMode) return null;
  if (!targetStats) return null;
  const rawM = Number(targetStats.monthlyTarget) || 0;
  // Minimum monthly target for any dealer is ₹15,000
  const mTarget = rawM > 0 ? Math.max(15000, rawM) : 15000;
  const rawQ = Number(targetStats.quarterlyTarget) || 0;
  // Minimum quarterly target is ₹45,000 (3x monthly target)
  const qTarget = rawQ > 0 ? Math.max(45000, rawQ) : (mTarget * 3);

  const mAchieved = Number(targetStats.monthlyAchieved) || 0;
  const qAchieved = Number(targetStats.quarterlyAchieved) || 0;

  const mPercent = mTarget > 0 ? Math.min(200, Math.round((mAchieved / mTarget) * 100)) : 0;
  const qPercent = qTarget > 0 ? Math.min(200, Math.round((qAchieved / qTarget) * 100)) : 0;

  const mUnlocked = mTarget > 0 && mAchieved >= mTarget;
  const qUnlocked = qTarget > 0 && qAchieved >= qTarget;
  const totalBonusPercent = (mUnlocked ? 2 : 0) + (qUnlocked ? 2 : 0);

  const monthlyBills = (targetStats && Array.isArray(targetStats.monthlyBills) && targetStats.monthlyBills.length > 0)
    ? targetStats.monthlyBills
    : (localBills && localBills.monthlyBills) || [];
  const quarterlyBills = (targetStats && Array.isArray(targetStats.quarterlyBills) && targetStats.quarterlyBills.length > 0)
    ? targetStats.quarterlyBills
    : (localBills && localBills.quarterlyBills) || [];
  const quarterMonths = (targetStats && Array.isArray(targetStats.quarterMonths) && targetStats.quarterMonths.length > 0)
    ? targetStats.quarterMonths
    : (localBills && localBills.quarterMonths) || [];

  const currentBills = activeModal === 'monthly' ? monthlyBills : quarterlyBills;
  const activeSelectedMonth = (activeModal === 'quarterly' && selectedMonthFilter !== null)
    ? quarterMonths.find(m => m.monthIndex === selectedMonthFilter)
    : null;
  const displayedBills = activeSelectedMonth ? (activeSelectedMonth.bills || []) : currentBills;

  return (
    <div className="mb-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-4 shadow-xl border border-blue-700/50 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h3 className="font-black text-sm tracking-wide">
            {t('target_vs_achievement', lang)}
          </h3>
        </div>

        {totalBonusPercent > 0 ? (
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse flex items-center gap-1">
            <span>🎉</span> {t('target_discount_active_badge', lang, { percent: totalBonusPercent })}
          </span>
        ) : (
          <span className="bg-blue-800/80 text-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-600/50">
            {t('target_in_progress', lang)}
          </span>
        )}
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Monthly Target Box (Clickable for full breakdown) */}
        {mTarget > 0 && (
          <div 
            onClick={() => {
              setActiveModal('monthly');
              if (globalProps && typeof globalProps.logSpyData === 'function') {
                globalProps.logSpyData("Viewed Target Breakdown", `Monthly Target Clicked (${mPercent}%)`);
              }
            }}
            className="bg-white/10 hover:bg-white/15 active:scale-[0.98] cursor-pointer transition-all backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-sm group select-none"
          >
            <div className="flex justify-between items-center text-xs mb-1 font-bold">
              <span className="flex items-center gap-1.5 text-blue-100">
                <span>📅</span> {t('monthly_target', lang)}: ₹{mTarget.toLocaleString('en-IN')}
                <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded-full text-blue-200 group-hover:bg-white/25 transition-colors">
                  🔍 {lang === 'mr' ? 'तपशील' : lang === 'hi' ? 'विवरण' : 'Details'}
                </span>
              </span>
              <span className={`text-[11px] font-black ${mUnlocked ? 'text-green-300' : 'text-amber-300'}`}>
                {mUnlocked ? `✅ 100%+ ${t('target_unlocked_badge', lang)}` : `${mPercent}%`}
              </span>
            </div>

            {/* Monthly Progress Bar */}
            <div className="w-full bg-blue-950/70 h-2.5 rounded-full overflow-hidden border border-blue-800/50 shadow-inner">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${mUnlocked ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                style={{ width: `${Math.min(100, mPercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] mt-1.5 text-blue-200/90 font-medium">
              <span>{t('achieved', lang)}: <b className="text-white font-black">₹{mAchieved.toLocaleString('en-IN')}</b></span>
              {mUnlocked ? (
                <span className="text-green-300 font-black flex items-center gap-0.5">
                  <span>✨</span> {t('target_bonus_2', lang)}
                </span>
              ) : (
                <span className="text-amber-200 font-bold">
                  {t('remaining', lang)}: ₹{Math.max(0, mTarget - mAchieved).toLocaleString('en-IN')} {t('target_extra_discount_badge', lang)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quarterly Target Box (Clickable for full breakdown) */}
        {qTarget > 0 && (
          <div 
            onClick={() => {
              setActiveModal('quarterly');
              if (globalProps && typeof globalProps.logSpyData === 'function') {
                globalProps.logSpyData("Viewed Target Breakdown", `Quarterly Target Clicked (${qPercent}%)`);
              }
            }}
            className="bg-white/10 hover:bg-white/15 active:scale-[0.98] cursor-pointer transition-all backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-sm group select-none"
          >
            <div className="flex justify-between items-center text-xs mb-1 font-bold">
              <span className="flex items-center gap-1.5 text-blue-100">
                <span>🏆</span> {t('quarterly_target', lang)}: ₹{qTarget.toLocaleString('en-IN')}
                <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded-full text-cyan-200 group-hover:bg-white/25 transition-colors">
                  🔍 {lang === 'mr' ? 'तपशील' : lang === 'hi' ? 'विवरण' : 'Details'}
                </span>
              </span>
              <span className={`text-[11px] font-black ${qUnlocked ? 'text-green-300' : 'text-amber-300'}`}>
                {qUnlocked ? `✅ 100%+ ${t('target_unlocked_badge', lang)}` : `${qPercent}%`}
              </span>
            </div>

            {/* Quarterly Progress Bar */}
            <div className="w-full bg-blue-950/70 h-2.5 rounded-full overflow-hidden border border-blue-800/50 shadow-inner">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${qUnlocked ? 'bg-gradient-to-r from-emerald-400 to-teal-300' : 'bg-gradient-to-r from-blue-400 to-cyan-300'}`}
                style={{ width: `${Math.min(100, qPercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] mt-1.5 text-blue-200/90 font-medium">
              <span>{t('achieved', lang)}: <b className="text-white font-black">₹{qAchieved.toLocaleString('en-IN')}</b></span>
              {qUnlocked ? (
                <span className="text-green-300 font-black flex items-center gap-0.5">
                  <span>✨</span> {t('target_bonus_2', lang)}
                </span>
              ) : (
                <span className="text-cyan-200 font-bold">
                  {t('remaining', lang)}: ₹{Math.max(0, qTarget - qAchieved).toLocaleString('en-IN')} {t('target_extra_discount_badge', lang)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Celebration Banner */}
      {totalBonusPercent > 0 && (
        <div className="mt-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-xl p-2.5 text-center text-[11px] font-bold text-green-200 flex items-center justify-center gap-1.5">
          <span>🎁</span>
          <span>{totalBonusPercent === 4 ? t('target_bonus_4', lang) : t('target_bonus_2', lang)}</span>
        </div>
      )}

      {/* 📊 INTERACTIVE TARGET DETAILS & BREAKDOWN MODAL */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 max-w-sm w-full max-h-[90vh] shadow-2xl border-2 border-blue-500/50 relative overflow-hidden text-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Close Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2.5 mb-3 pr-8">
              <span className="text-3xl">
                {activeModal === 'monthly' ? '📅' : '🏆'}
              </span>
              <div>
                <h3 className="font-black text-base leading-tight">
                  {activeModal === 'monthly'
                    ? (lang === 'mr' ? 'मासिक उद्दिष्ट तपशील' : lang === 'hi' ? 'मासिक टारगेट विवरण' : 'Monthly Target Breakdown')
                    : (lang === 'mr' ? 'तिमाही उद्दिष्ट तपशील' : lang === 'hi' ? 'तिमाही टारगेट विवरण' : 'Quarterly Target Breakdown')
                  }
                </h3>
                <p className="text-[10px] text-blue-300 font-medium">
                  {activeModal === 'monthly'
                    ? (lang === 'mr' ? 'चालू महिना खरेदी व उद्दिष्ट' : lang === 'hi' ? 'चालू माह खरीद और टारगेट' : 'Current Month Sales & Target')
                    : (lang === 'mr' ? 'चालू तिमाही खरेदी व उद्दिष्ट' : lang === 'hi' ? 'चालू तिमाही खरीद और टारगेट' : 'Current Quarter Sales & Target')
                  }
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="mb-4">
              {(activeModal === 'monthly' ? mUnlocked : qUnlocked) ? (
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-2xl flex items-center gap-2.5 shadow-md">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="text-xs font-black">
                      {lang === 'mr' ? 'उद्दिष्ट १००%+ पूर्ण झाले!' : lang === 'hi' ? 'टारगेट १००%+ पूरा हो गया!' : '100%+ Target Achieved!'}
                    </div>
                    <div className="text-[10px] text-emerald-100 font-semibold">
                      {lang === 'mr' ? '+२% अतिरिक्त होलसेल सूट सक्रिय झाली आहे.' : lang === 'hi' ? '+२% अतिरिक्त होलसेल छूट सक्रिय हो गई है।' : '+2% Extra Wholesale Discount is ACTIVE.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-900/60 border border-blue-500/30 p-3 rounded-2xl flex items-center gap-2.5">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <div className="text-xs font-black text-yellow-300">
                      {lang === 'mr' ? 'उद्दिष्ट प्रगतीपथावर आहे' : lang === 'hi' ? 'टारगेट प्रगति पर है' : 'Target in Progress'} ({activeModal === 'monthly' ? mPercent : qPercent}%)
                    </div>
                    <div className="text-[10px] text-blue-200">
                      {lang === 'mr'
                        ? `आणखी ₹${(activeModal === 'monthly' ? Math.max(0, mTarget - mAchieved) : Math.max(0, qTarget - qAchieved)).toLocaleString('en-IN')} ची खरेदी करून +२% अतिरिक्त सूट मिळवा.`
                        : lang === 'hi'
                        ? `₹${(activeModal === 'monthly' ? Math.max(0, mTarget - mAchieved) : Math.max(0, qTarget - qAchieved)).toLocaleString('en-IN')} की और खरीद करके +२% अतिरिक्त छूट पाएं।`
                        : `Purchase ₹${(activeModal === 'monthly' ? Math.max(0, mTarget - mAchieved) : Math.max(0, qTarget - qAchieved)).toLocaleString('en-IN')} more to unlock +2% Extra Discount.`
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">
                  {lang === 'mr' ? 'एकूण उद्दिष्ट' : lang === 'hi' ? 'कुल टारगेट' : 'Target Value'}
                </div>
                <div className="text-base font-black text-white mt-1">
                  ₹{(activeModal === 'monthly' ? mTarget : qTarget).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-bold text-green-300 uppercase tracking-wider">
                  {lang === 'mr' ? 'साध्य खरेदी' : lang === 'hi' ? 'प्राप्त खरीद' : 'Sales Achieved'}
                </div>
                <div className="text-base font-black text-green-400 mt-1">
                  ₹{(activeModal === 'monthly' ? mAchieved : qAchieved).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center col-span-2">
                <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                  <span className="text-blue-300 uppercase tracking-wider">
                    {lang === 'mr' ? 'उर्वरित रक्कम' : lang === 'hi' ? 'बकाया राशि' : 'Remaining to Target'}
                  </span>
                  <span className="font-black text-amber-300">
                    ₹{(activeModal === 'monthly' ? Math.max(0, mTarget - mAchieved) : Math.max(0, qTarget - qAchieved)).toLocaleString('en-IN')}
                  </span>
                </div>
                {/* Detailed Progress Bar */}
                <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden border border-blue-800/60 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${(activeModal === 'monthly' ? mUnlocked : qUnlocked) ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                    style={{ width: `${Math.min(100, (activeModal === 'monthly' ? mPercent : qPercent))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 🗓️ MONTH-WISE SALES BREAKDOWN (FOR QUARTERLY TARGET) */}
            {activeModal === 'quarterly' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10 text-xs font-bold">
                  <span className="text-blue-200 flex items-center gap-1.5">
                    <span>🗓️</span>
                    <span>
                      {lang === 'mr' ? 'महिन्यानुसार खरेदी तपशील' : lang === 'hi' ? 'माह-वार खरीद विवरण' : 'Month-wise Sales Breakdown'}
                    </span>
                  </span>
                  <span className="text-[10px] text-cyan-300 font-black">
                    3 {lang === 'mr' ? 'महिने' : lang === 'hi' ? 'महीने' : 'Months'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {quarterMonths.map((qm, qIdx) => {
                    const monthName = lang === 'mr' ? qm.nameMr : lang === 'hi' ? qm.nameHi : qm.nameEn;
                    const isSelected = selectedMonthFilter === qm.monthIndex;
                    return (
                      <div 
                        key={qIdx}
                        onClick={() => setSelectedMonthFilter(prev => prev === qm.monthIndex ? null : qm.monthIndex)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                          isSelected 
                            ? 'bg-blue-600/40 border-blue-400 ring-2 ring-blue-400/50 shadow-md scale-[1.02]' 
                            : qm.isCurrent 
                            ? 'bg-blue-900/40 border-blue-500/60 hover:bg-blue-900/60' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {qm.isCurrent && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow">
                            {lang === 'mr' ? 'चालू' : lang === 'hi' ? 'चालू' : 'Current'}
                          </span>
                        )}
                        <div className="text-[11px] font-black text-blue-100 truncate mt-0.5">
                          {monthName}
                        </div>
                        <div className={`text-xs font-black mt-1 ${qm.total > 0 ? 'text-green-300' : 'text-gray-400'}`}>
                          ₹{qm.total.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[9px] text-blue-200/70 font-semibold mt-0.5">
                          {qm.billCount} {qm.billCount === 1 ? 'bill' : 'bills'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedMonthFilter !== null && (
                  <div className="mt-2 text-center">
                    <button 
                      onClick={() => setSelectedMonthFilter(null)}
                      className="text-[10px] text-blue-300 hover:text-white underline font-bold"
                    >
                      {lang === 'mr' ? 'सर्व ३ महिन्यांची बिले पहा' : lang === 'hi' ? 'सभी ३ महीनों के बिल देखें' : 'Show All 3 Months Invoices'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 📑 CONTRIBUTING INVOICES / BILLS BREAKDOWN */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10 text-xs">
                <span className="font-bold text-blue-200 flex items-center gap-1.5">
                  <span>📑</span>
                  <span>
                    {activeModal === 'monthly'
                      ? (lang === 'mr' ? 'या महिन्यातील बिले' : lang === 'hi' ? 'इस महीने के बिल' : 'Invoices This Month')
                      : activeSelectedMonth
                      ? `${lang === 'mr' ? activeSelectedMonth.nameMr : lang === 'hi' ? activeSelectedMonth.nameHi : activeSelectedMonth.nameEn} ${lang === 'mr' ? 'महिन्यातील बिले' : lang === 'hi' ? 'माह के बिल' : 'Invoices'}`
                      : (lang === 'mr' ? 'या तिमाहीतील बिले' : lang === 'hi' ? 'इस तिमाही के बिल' : 'Invoices This Quarter')
                    }
                  </span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {displayedBills.length} {displayedBills.length === 1 
                    ? (lang === 'mr' ? 'बिल' : lang === 'hi' ? 'बिल' : 'Bill') 
                    : (lang === 'mr' ? 'बिले' : lang === 'hi' ? 'बिल' : 'Bills')}
                </span>
              </div>

              {loadingBills ? (
                <div className="text-center py-4 text-xs text-blue-200 animate-pulse flex items-center justify-center gap-2">
                  <span>⏳</span>
                  <span>{lang === 'mr' ? 'बिलांची माहिती लोड होत आहे...' : lang === 'hi' ? 'बिल विवरण लोड हो रहा है...' : 'Loading invoice details...'}</span>
                </div>
              ) : displayedBills.length === 0 ? (
                <div className="text-center py-4 text-xs text-blue-300/70 font-medium">
                  {lang === 'mr'
                    ? 'या कालावधीत अद्याप कोणतेही बिल नोंदवलेले नाही.'
                    : lang === 'hi'
                    ? 'इस अवधि में अभी तक कोई बिल दर्ज नहीं हुआ है।'
                    : 'No invoices recorded for this period yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {displayedBills.map((bill, bIdx) => (
                    <div key={bIdx} className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs transition-colors">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-300 text-[11px] truncate">
                            {bill.vchNo && bill.vchNo !== 'N/A' ? `#${bill.vchNo}` : 'Invoice'}
                          </span>
                          <span className="text-[10px] text-blue-200/80 whitespace-nowrap">
                            📅 {bill.date}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-300 truncate mt-0.5">
                          {bill.vchType || bill.particulars || 'Sale'}
                        </span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className={`font-black text-xs ${bill.isReturn ? 'text-rose-400' : 'text-emerald-300'}`}>
                          {bill.isReturn ? '-' : '+'}₹{Math.abs(bill.amount).toLocaleString('en-IN')}
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${bill.isReturn ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'}`}>
                          {bill.isReturn ? 'Credit Note' : 'Sale Bill'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reward Info Box */}
            <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-3 mb-4 text-center">
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1">
                <span>✨</span>
                <span>{lang === 'mr' ? '+२% अतिरिक्त होलसेल सूट' : lang === 'hi' ? '+२% अतिरिक्त होलसेल छूट' : '+2% Extra Wholesale Discount'}</span>
              </div>
              <p className="text-[10px] text-blue-200 mt-1 leading-relaxed">
                {lang === 'mr' 
                  ? 'उद्दिष्ट पूर्ण झाल्यावर प्रत्येक ऑर्डरवर आपोआप २% अतिरिक्त सूट लागू होते.'
                  : lang === 'hi'
                  ? 'टारगेट पूरा होते ही हर ऑर्डर पर अपने आप २% अतिरिक्त छूट लागू हो जाती है।'
                  : 'Once the target is achieved, an extra 2% discount is automatically applied to all orders.'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {typeof setView === 'function' && (
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setView('ledger');
                  }}
                  className="w-full bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>📖</span>
                  <span>{lang === 'mr' ? 'खातेवहीत बिले पहा (Ledger)' : lang === 'hi' ? 'खाताबही में बिल देखें (Ledger)' : 'View Invoices in Ledger'}</span>
                </button>
              )}
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {lang === 'mr' ? 'बंद करा / कॅटलॉग पहा' : lang === 'hi' ? 'बंद करें / कैटलॉग देखें' : 'Close / Browse Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Catalog(props) {
  // ==========================================
  // 1. PROPS & STATE INITIALIZATION
  // ==========================================
  var user = props.user;
  var cart = props.cart;
  var setCart = props.setCart;
  var products = props.products;
  var setProducts = props.setProducts;
  var setView = props.setView;
  var callAPI = props.callAPI;
  var globalProps = props.globalProps;
  var passedSchemes = props.schemes || [];
  var lang = props.lang || 'en';
  var setLang = props.setLang;
  var targetStats = props.targetStats || (user && user.targetStats) || null;
  
  const [loading, setLoading] = useState(products.length === 0);
  const [schemes, setSchemes] = useState(passedSchemes);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discounts, setDiscounts] = useState(DEFAULT_DISCOUNTS);
  const [celebratedTierPercent, setCelebratedTierPercent] = useState(0);
  const [activeVariants, setActiveVariants] = useState({});
  const searchDebounceRef = useRef(null);
  const cartDebounceRefs = useRef({});
  
  // Filter States
  const [brandFilter, setBrandFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");

  useEffect(() => {
    if (props.schemes && props.schemes.length > 0) {
      setSchemes(props.schemes);
    }
  }, [props.schemes]);

  // ==========================================
  // 2. DATA FETCHING (API CALLS)
  // ==========================================
  useEffect(() => {
    // Fetch Products
    // ?? Always fetch live fresh products directly from Google Sheet (cache-busted)
    if (products.length === 0) setLoading(true);
    fetch(API_URL + (API_URL.includes('?') ? '&' : '?') + 't=' + Date.now(), {
      method: 'POST',
      body: JSON.stringify({ action: "getProducts" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then((r) => r.json())
    .then((res) => { 
      if (res && res.success && Array.isArray(res.data)) {
        const liveProducts = res.data.map(p => {
          const copy = Object.assign({}, p);
          // Strictly take live price directly from Google Sheet column DealerPrice
          const rawPrice = getProp(copy, "DealerPrice") || copy.DealerPrice || copy.rate || copy.price;
          copy.DealerPrice = getNum(rawPrice);
          return copy;
        });
        setProducts(liveProducts);
      }
      setLoading(false); 
    })
    .catch(() => {
      setLoading(false);
    });

    // Sync & Fetch Schemes
    if (!passedSchemes || passedSchemes.length === 0) {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "getSchemes" }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setSchemes(res.data);
        }
      })
      .catch(() => {});
    }

    // Fetch Discounts
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "getDiscounts" }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then((r) => r.json())
    .then((res) => { 
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDiscounts(res.data); 
      }
    })
    .catch(() => {});
  }, []);

  // ==========================================
  // 3. CART & PROGRESS CALCULATIONS
  // ==========================================
  const cartItems = Object.values(cart);
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
      .map((d) => ({ minAmount: getNum(d.minAmount), percent: getNum(d.percent) }))
      .filter((d) => !isNaN(d.minAmount) && !isNaN(d.percent))
      .sort((a, b) => a.minAmount - b.minAmount);
      
    var activeTier = null;
    for (var i = 0; i < sortedDiscounts.length; i++) {
      if (totalAmount >= sortedDiscounts[i].minAmount) {
        activeTier = sortedDiscounts[i];
      } else {
        break;
      }
    }

    var currentUnlockedPercent = activeTier ? activeTier.percent : 0;
    if (currentUnlockedPercent > celebratedTierPercent) {
      if (window.confetti) {
        window.confetti({ particleCount: 75 + Math.round(currentUnlockedPercent * 30), spread: 75, origin: { y: 0.6 } });
      }
      setCelebratedTierPercent(currentUnlockedPercent);
    } else if (currentUnlockedPercent < celebratedTierPercent) {
      setCelebratedTierPercent(currentUnlockedPercent);
    }
  }, [totalAmount, discounts, celebratedTierPercent]);

  // ==========================================
  // 4. EVENT HANDLERS
  // ==========================================
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.trim().length >= 2 && globalProps && typeof globalProps.logSpyData === "function") {
      searchDebounceRef.current = setTimeout(() => {
        globalProps.logSpyData("Searched Product", `Query: "${val.trim()}"`);
      }, 1500);
    }
  };
  
  const openCategory = (type) => { 
    window.history.pushState({ modal: 'category' }, ''); 
    setSelectedType(type); 
    setBrandFilter("");
    setSortFilter("");
    if (globalProps && typeof globalProps.logSpyData === "function" && type) {
      globalProps.logSpyData("Category Viewed", `Category: ${type}`);
    }
  };
  
  const openProductModal = (p) => { 
    window.history.pushState({ modal: 'product' }, ''); 
    setSelectedProduct(p); 
    if (globalProps && typeof globalProps.logSpyData === "function" && p) {
      const pName = String(getProp(p, "ProductName") || getProp(p, "Product Name") || "");
      const pCode = String(getProp(p, "ItemCode") || "");
      const pPrice = getNum(getProp(p, "DealerPrice") || p.DealerPrice || p.rate || p.price);
      globalProps.logSpyData("Viewed Product", `${pName} (${pCode}) | ?${pPrice}`);
    }
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
    
    if (newQty > maxLimit && maxLimit > 0 && !isAlwaysLiveBrand) {
      return alert("Maximum stock limit reached!");
    }
    
    const itemTitle = String(getProp(product, "ProductName") || getProp(product, "Product Name") || itemCode);
    const itemPrice = getNum(getProp(product, "DealerPrice") || product.DealerPrice || product.rate || product.price);

    if (newQty <= 0) {
      delete updated[itemCode];
      if (globalProps && typeof globalProps.logSpyData === "function") {
        globalProps.logSpyData("Removed from Cart", `${itemTitle} (${itemCode})`);
      }
    } else {
      updated[itemCode] = Object.assign({}, product, { qty: newQty });
      if (globalProps && typeof globalProps.logSpyData === "function") {
        if (cartDebounceRefs.current[itemCode]) clearTimeout(cartDebounceRefs.current[itemCode]);
        cartDebounceRefs.current[itemCode] = setTimeout(() => {
          globalProps.logSpyData(
            "Added to Cart",
            `${itemTitle} | Qty: ${newQty} | Rate: ?${itemPrice} | Subtotal: ?${newQty * itemPrice}`
          );
          delete cartDebounceRefs.current[itemCode];
        }, 1000);
      }
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
        <p className="font-bold">{t('syncing_inventory', lang)}</p>
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
          const itemSchemes = getProductSchemes(activeVariant || p, schemes);
          const hasOffer = itemSchemes && itemSchemes.length > 0;

          return (
            <div 
              key={`${activeItemCode}-${idx}`} 
              className="bg-white rounded-2xl p-3 shadow-sm flex flex-col justify-between border border-gray-50 relative overflow-hidden"
            >
              {/* 🎁 VIBRANT EMERALD & GOLD BUY X GET Y FREE / OFFER BADGE */}
              {hasOffer && (() => {
                let badgeText = t('offer_badge', lang);
                if (itemSchemes && itemSchemes.length > 0) {
                  const sch = itemSchemes[0];
                  const msg = String(sch.message || '').trim();
                  const buyMatch = msg.match(/buy\s*(\d+)\s*(?:pcs)?\s*get\s*([a-zA-Z0-9\s]*?)(\d+)\s*(?:pcs)?\s*free/i);
                  if (buyMatch) {
                    badgeText = `BUY ${buyMatch[1]} GET ${buyMatch[3]} FREE`;
                  } else if (sch.minQty && sch.reward && String(sch.reward).toLowerCase().includes("pcs")) {
                    const rNum = String(sch.reward).match(/\d+/);
                    if (rNum) {
                      badgeText = `BUY ${sch.minQty} GET ${rNum[0]} FREE`;
                    }
                  }
                }
                return (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full shadow-lg uppercase tracking-wider z-20 flex items-center gap-1 border border-yellow-300">
                    <span>🎁</span> {badgeText}
                  </span>
                );
              })()}
              {isNewItem && (
                <span className="absolute top-2 right-2 bg-pink-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider z-10">
                  ✨ {t('new_badge', lang)}
                </span>
              )}
              {/* 📦 DISTINCT CALM NAVY / INDIGO ON ORDER BADGE */}
              {showOnOrder && !isNewItem && (
                <span className={`absolute ${hasOffer ? 'top-8' : 'top-2'} left-2 bg-slate-900 text-indigo-200 text-[8px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider z-10 border border-indigo-400 flex items-center gap-1`}>
                  <span>📦</span> {t('on_order_badge', lang)}
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded uppercase shadow-lg transform -rotate-12 border border-red-800">
                    {t('out_of_stock', lang)}
                  </span>
                </div>
              )}
              <div 
                className="mt-1 cursor-pointer" 
                onClick={() => { openProductModal(p); }}
              >
                {smartImg ? (
                  <img 
                    src={smartImg} 
                    className={`h-32 w-full object-contain mb-2 p-1 ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'https://ui-avatars.com/api/?name=No+Image&background=f3f4f6&color=9ca3af'; 
                    }} 
                    alt={name} 
                  /> 
                ) : (
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs mb-2">
                    No Image
                  </div>
                )}
                <h3 className={`font-bold text-xs leading-snug line-clamp-2 h-8 ${isOutOfStock ? 'text-gray-400' : ''}`}>
                  {translateProductName(name, lang)}
                </h3>
              </div>
              
              {p.isGrouped && (
                <div className="flex flex-wrap gap-1 mt-1 mb-2 relative z-20">
                  {p.variants.map((v, vIdx) => {
                    return (
                      <button 
                        key={String(getProp(v, "ItemCode")) || vIdx} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveVariants((prev) => ({
                            ...prev, 
                            [String(getProp(p, "ItemCode"))]: String(getProp(v, "ItemCode")) 
                          })); 
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
                            onClick={(e) => { e.stopPropagation(); updateQty(activeVariant, -1); }} 
                            className="bg-white text-blue-900 font-black w-8 h-8 rounded-lg shadow-sm"
                          >
                            -
                          </button>
                          <span className="font-black text-blue-900">{currentQty}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQty(activeVariant, 1); }} 
                            className="bg-blue-900 text-white font-black w-8 h-8 rounded-lg shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQty(activeVariant, 1); }} 
                          className="w-full bg-gray-950 text-white text-[11px] font-bold py-3 rounded-xl shadow-sm"
                        >
                          {showOnOrder ? t('add_next_day_btn', lang) : t('add_btn', lang)}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareText = `🔥 Check out this item at our store!\n\n📦 *Product:* ${name} (${activeVariant.capacity})\n⚡ *Brand:* ${String(getProp(activeVariant, "Brand"))}\n\n🏢 *Dealer:* ${user ? user.shopName : ''}\n📞 *Contact:* ${user ? user.phone : ''}`;
                      const validImg = smartImg || 'https://ui-avatars.com/api/?name=Yash+Marketing';
                      if (navigator.share) {
                        navigator.share({ title: name, text: shareText, url: validImg }).catch(() => {});
                      } else {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\nImage: " + validImg)}`, '_blank');
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
          onClick={() => window.location.reload()} 
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
    }).filter(Boolean))].sort((a, b) => {
      const isPhoneA = /smartphone|mobile/i.test(a);
      const isPhoneB = /smartphone|mobile/i.test(b);
      if (isPhoneA && !isPhoneB) return -1;
      if (!isPhoneA && isPhoneB) return 1;
      return a.localeCompare(b);
    });
    
    mainContent = (
      <div className="p-4 pb-[140px]">
        {/* 🎯 DEALER TARGET VS ACHIEVEMENT DASHBOARD */}
        <TargetCard targetStats={targetStats} lang={lang} customerMode={globalProps ? globalProps.customerMode : false} setView={setView} globalProps={globalProps} user={user} callAPI={callAPI} />
        <h2 className="font-black text-gray-800 text-xl mb-4">{t('select_category', lang)}</h2>
        {types.length === 0 && !loading && (
          <div className="text-center p-8 bg-gray-50 rounded-2xl border text-gray-500 font-bold text-xs">
            {t('no_categories', lang)}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {types.map((type) => {
            const isSmartphone = /smartphone|mobile/i.test(type);
            const cover = getSmartImage(inStockFlat.find((p) => {
              return String(getProp(p, "Type") || getProp(p, "Category") || "").trim() === type;
            }));
            const categoryCount = inStockProducts.filter((p) => {
              return String(getProp(p, "Type") || getProp(p, "Category") || "").trim() === type;
            }).length;
            
            return (
              <div 
                key={type} 
                onClick={() => openCategory(type)} 
                className={`rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer active:scale-95 h-40 relative transition-all ${
                  isSmartphone 
                    ? 'bg-gradient-to-b from-indigo-50/90 via-white to-white border-2 border-indigo-500 shadow-md ring-2 ring-indigo-200/60' 
                    : 'bg-white rounded-2xl p-4 shadow-sm border border-gray-100'
                }`}
              >
                {isSmartphone && (
                  <div className="absolute -top-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider whitespace-nowrap flex items-center gap-1 animate-pulse">
                    <span>🔥</span>
                    <span>NEW ARRIVAL</span>
                  </div>
                )}
                {cover ? (
                  <img src={cover} className="h-16 object-contain mb-3" alt={type} /> 
                ) : (
                  <div className="text-3xl mb-3">{isSmartphone ? '📱' : '📦'}</div>
                )}
                <h3 className="font-extrabold text-sm text-center truncate w-full text-gray-800 flex items-center justify-center gap-1.5">
                  {translateCategory(type, lang)} 
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                    isSmartphone 
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {categoryCount}
                  </span>
                </h3>
                {isSmartphone && (
                  <span className="text-[9px] font-black text-indigo-700 tracking-tight mt-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    GST Bill Available
                  </span>
                )}
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

    if (brandFilter) {
      displayProducts = displayProducts.filter((p) => {
        return String(getProp(p, "Brand") || "").trim() === brandFilter;
      });
    }

    if (sortFilter === "low") {
      displayProducts.sort((a,b) => getNum(getProp(a, "DealerPrice")) - getNum(getProp(b, "DealerPrice")));
    } else {
      displayProducts.sort((a,b) => getNum(getProp(b, "DealerPrice")) - getNum(getProp(a, "DealerPrice")));
    }

    mainContent = (
      <div>
        {/smartphone|mobile/i.test(selectedType) && (
          <div className="m-3 mb-1 p-3.5 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl border-2 border-indigo-400 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                <span>📱</span> MOTO SMARTPHONES • 100% GST BILL
              </span>
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                OFFICIAL STOCK
              </span>
            </div>
            <p className="text-[11px] text-indigo-100 font-bold leading-snug">
              {lang === 'mr' 
                ? 'सर्व Moto मॉडेल्स 100% ओरिजिनल GST बिल आणि ब्रँड वॉरंटीसह उपलब्ध आहेत. लगेच ऑर्डर करा!'
                : lang === 'hi'
                ? 'सभी Moto मॉडल्स 100% ओरिजिनल GST बिल और ब्रांड वारंटी के साथ उपलब्ध हैं। तुरंत ऑर्डर करें!'
                : 'All Moto smartphone models available with 100% Genuine GST Bill & Official Brand Warranty. Ready for dispatch!'}
            </p>
          </div>
        )}
        <div className="p-4 bg-white bg-opacity-95 z-20 border-b flex justify-between items-center shadow-sm">
          <button 
            onClick={() => { window.history.back(); setBrandFilter(""); setSortFilter(""); }} 
            className="font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"
          >
            ← {t('select_category', lang)}
          </button>
          <span className="font-black text-gray-800">{translateCategory(selectedType, lang)}</span>
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
              const b = e.target.value;
              setBrandFilter(b);
              if (b && globalProps && typeof globalProps.logSpyData === "function") {
                globalProps.logSpyData("Brand Filtered", `Brand: ${b}`);
              }
            }} 
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none shrink-0"
          >
            <option value="">{t('all_brands', lang)}</option>
            {categoryBrands.map((b) => <option key={b} value={b}>{translateBrand(b, lang) || b}</option>)}
          </select>
          <select 
            value={sortFilter} 
            onChange={(e) => setSortFilter(e.target.value)} 
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none shrink-0"
          >
            <option value="">{t('sort_high_low', lang)}</option>
            <option value="low">{t('sort_low_high', lang)}</option>
          </select>
        </div>

        {displayProducts.length > 0 ? (
          renderProducts(displayProducts)
        ) : (
          <div className="text-center p-8 text-gray-400 font-bold text-sm mt-10">
            {t('no_products_filter', lang)}
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
            {discounts && discounts.length > 0 && (
          <ProgressBar totalAmount={totalAmount} discounts={discounts} lang={lang} />
        )}
            {/* 🟢 THE ENTIRE SCHEMES TRACKER GRID HAS BEEN REMOVED FROM HERE AS PER YOUR INSTRUCTION */}
          </React.Fragment>
        )}
        <div className="p-3 bg-white flex items-center border-b">
          <input 
            type="text" 
            placeholder={t('search_placeholder', lang)} 
            value={searchQuery} 
            onChange={handleSearchChange} 
            className="w-full bg-gray-100 p-3 rounded-xl outline-none font-bold text-sm border focus:border-blue-300 transition-colors" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="ml-2 bg-gray-200 text-gray-600 font-bold px-3 py-3 rounded-xl"
            >
              ✕
            </button>
          )}
        </div>
        {/* 📢 RUNNING MARQUEE BANNER: MOTO SMARTPHONES WITH GST BILL */}
        <div 
          onClick={() => { setSearchQuery(""); openCategory('Smartphone'); }}
          className="bg-gradient-to-r from-red-700 via-indigo-900 to-blue-900 px-3 py-2 flex items-center gap-2 cursor-pointer border-t border-indigo-400/30 overflow-hidden active:opacity-90 shadow-inner"
        >
          <span className="shrink-0 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            NEW
          </span>
          <div className="overflow-hidden whitespace-nowrap relative w-full">
            <div className="inline-block animate-marquee whitespace-nowrap text-[11px] font-black text-white tracking-wide">
              <span>{lang === 'mr' ? '🔥 नवीन आगमन: MOTO SMARTPHONES आता 100% ओरिजिनल GST बिल आणि वॉरंटीसह उपलब्ध! • पाहण्यासाठी येथे टॅप करा 📱' : lang === 'hi' ? '🔥 नया आगमन: MOTO SMARTPHONES अब 100% ओरिजिनल GST बिल और वारंटी के साथ उपलब्ध हैं! • देखने के लिए यहाँ टैप करें 📱' : '🔥 NEW ARRIVAL: MOTO SMARTPHONES NOW AVAILABLE WITH 100% GENUINE GST BILL & BRAND WARRANTY! • TAP TO VIEW 📱'}</span>
              <span className="mx-4 text-amber-300">•</span>
              <span>{lang === 'mr' ? '🔥 नवीन आगमन: MOTO SMARTPHONES आता 100% ओरिजिनल GST बिल आणि वॉरंटीसह उपलब्ध! • पाहण्यासाठी येथे टॅप करा 📱' : lang === 'hi' ? '🔥 नया आगमन: MOTO SMARTPHONES अब 100% ओरिजिनल GST बिल और वारंटी के साथ उपलब्ध हैं! • देखने के लिए यहाँ टैप करें 📱' : '🔥 NEW ARRIVAL: MOTO SMARTPHONES NOW AVAILABLE WITH 100% GENUINE GST BILL & BRAND WARRANTY! • TAP TO VIEW 📱'}</span>
            </div>
          </div>
          <span className="shrink-0 text-amber-300 text-[10px] font-black flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
            MOTO <span>›</span>
          </span>
        </div>
      </div>

      {mainContent}

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => window.history.back()} 
          cart={cart} 
          updateQty={updateQty} 
          user={user} 
          globalProps={globalProps} 
          activeVariants={activeVariants} 
          setActiveVariants={setActiveVariants} 
          schemes={schemes}
          lang={lang}
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
  var schemes = props.schemes || [];
  var lang = props.lang || 'en';
  
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
      if (cleanUrl.indexOf("//") === 0) cleanUrl = "https:" + cleanUrl;
      if (cleanUrl.includes("drive.google.com")) {
        let fileId = "";
        const dMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (dMatch) fileId = dMatch[1];
        else if (idMatch) fileId = idMatch[1];
        if (fileId) return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
      }
      return cleanUrl;
    };

    const mainImg = getSmartImage(activeVariant);
    if (mainImg) list.push(mainImg);
    
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
    const parsed = activeFeatures.split(" | ").map(f => f.trim());
    parsed.forEach((f) => { 
      if (f !== "") featuresList.push(f); 
    });
  }

  const mrpVal = getNum(getProp(activeVariant, "MRP"));
  const dealerVal = getNum(getProp(activeVariant, "DealerPrice"));
  const hasDiscount = mrpVal > dealerVal && dealerVal > 0;
  const discountPercent = hasDiscount ? Math.round(((mrpVal - dealerVal) / mrpVal) * 100) : 0;
  
  const handleNextImage = () => setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
  const handlePrevImage = () => setCurrentImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);

  if (imagesList.length === 0) return null;

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
            onClick={() => setIsZoomed(true)}
          >
            <img 
              src={imagesList[currentImgIndex]} 
              className={`h-72 max-w-full object-contain ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://ui-avatars.com/api/?name=No+Image&background=f3f4f6&color=9ca3af'; 
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
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
                  className="absolute left-3 bg-white bg-opacity-95 text-gray-800 font-black p-2.5 rounded-full shadow-md hover:bg-gray-50"
                >
                  ←
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
                  className="absolute right-3 bg-white bg-opacity-95 text-gray-800 font-black p-2.5 rounded-full shadow-md hover:bg-gray-50"
                >
                  →
                </button>
                <div className="absolute bottom-3 flex gap-1.5 justify-center w-full">
                  {imagesList.map((_, idx) => (
                    <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentImgIndex ? 'w-5 bg-blue-900' : 'w-2 bg-gray-300'}`}></div> 
                  ))}
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="p-5">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${isOutOfStock ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-900'}`}>
              {activeBrand}
            </span>
            <h2 className="text-lg font-black text-gray-900 mt-2 leading-tight">
              {translateProductName(activeName, lang)}
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
              {lang === "mr" ? "वर्ग / कॅटेगरी:" : lang === "hi" ? "श्रेणी / कैटेगरी:" : "Category:"} {translateCategory(activeType, lang)}
            </p>

            {product.isGrouped && (
              <div className="mt-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  {t('select_variant', lang)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, vIdx) => {
                    const vItemCode = String(getProp(v, "ItemCode") || "");
                    return (
                      <button 
                        key={vItemCode || vIdx} 
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
                  {t('dealer_price', lang)} ({activeVariant.capacity})
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
                  {isOutOfStock ? t('item_out_of_stock', lang) : showOnOrder ? `${t('on_order_badge', lang)} (${t('on_order_badge_desc', lang)})` : t('in_stock_status', lang, { count: stockVal })}
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="text-xs text-green-800 font-black uppercase tracking-wider">
                  {t('offer_mrp', lang)} ({activeVariant.capacity})
                </div>
                <div className="text-3xl font-black text-green-950 mt-1">
                  ₹{mrpVal || 'Contact store'}
                </div>
              </div>
            )}

            {/* 🎁 DETAILED ACTIVE SCHEME & OFFER BOX */}
            {(() => {
              const itemSchemes = getProductSchemes(activeVariant || product, schemes);
              if (!itemSchemes || itemSchemes.length === 0) return null;

              return (
                <div className="mt-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50/70 p-4 rounded-2xl border-2 border-amber-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-amber-300">
                      <span>🎁</span> {t('active_scheme_offer', lang)}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                      {itemSchemes.length > 1 ? t('schemes_available_plural', lang, { count: itemSchemes.length }) : t('schemes_available', lang, { count: itemSchemes.length })}
                    </span>
                  </div>

                  {itemSchemes.map((sch, sIdx) => {
                    const progress = calculateSchemeProgress(Object.values(cart), sch);
                    const remainingNeeded = Math.max(0, progress.required - progress.current);

                    return (
                      <div key={sIdx} className="bg-white p-3.5 rounded-xl border border-amber-200 mt-2.5 shadow-sm">
                        <div className="text-xs font-black text-gray-900 leading-snug">
                          {translateOfferText(sch.message, lang)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold">
                          <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                            <span>🎁</span> <span>{t('reward', lang)}: <b className="font-black">{sch.reward}</b></span>
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 flex items-center gap-1">
                            <span>📦</span> <b>{t('min_target', lang, { count: sch.minQty })}</b>
                          </span>
                        </div>

                        {/* Live Cart Threshold Progress Box */}
                        <div className="mt-3 bg-amber-50/90 p-3 rounded-xl border border-amber-200">
                          <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                            <span className="text-gray-700">
                              {t('cart_added', lang, { count: progress.current, required: progress.required })}
                            </span>
                            {progress.isUnlocked ? (
                              <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-300 uppercase tracking-wide">
                                🎉 {t('offer_unlocked', lang)}
                              </span>
                            ) : (
                              <span className="font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300 uppercase tracking-wide">
                                {t('add_more_for_offer', lang, { count: remainingNeeded })}
                              </span>
                            )}
                          </div>

                          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden border border-gray-300 shadow-inner">
                            <div 
                              className={progress.isUnlocked ? "h-full transition-all duration-500 bg-green-500" : "h-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-orange-500"} 
                              style={{ width: Math.min((progress.current / progress.required) * 100, 100) + '%' }}
                            ></div>
                          </div>

                          <div className="text-[10px] font-extrabold mt-2 text-center leading-tight">
                            {progress.isUnlocked ? (
                              <span className="text-green-700 bg-green-50 px-2 py-1 rounded block border border-green-200">
                                ✅ {t('offer_congrats', lang, { reward: translateReward(sch.reward, lang) })}
                              </span>
                            ) : (
                              <span className="text-amber-950 bg-amber-100/70 px-2 py-1 rounded block border border-amber-200">
                                ⚡ {t('add_more_for_offer_msg', lang, { count: remainingNeeded, reward: translateReward(sch.reward, lang) })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 🟢 DIRECT QUICK-ACTION BUTTONS INSIDE SCHEME CARD */}
                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-amber-200">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); updateQty(activeVariant, 1); }}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[11px] font-black py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1 transition-all"
                          >
                            <span>🛒</span> {t('quick_add_1', lang)} {currentQty > 0 ? `(${currentQty})` : ''}
                          </button>
                          {remainingNeeded > 0 && (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateQty(activeVariant, remainingNeeded); triggerCelebration(sch.reward); }}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 text-white text-[11px] font-black py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1 transition-all"
                            >
                              <span>⚡</span> +{remainingNeeded} {t('to_unlock', lang)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="mt-6">
              <h3 className="font-extrabold text-sm text-gray-900 mb-3 tracking-wide uppercase">
                {t('key_highlights', lang)}
              </h3>
              {featuresList.length === 0 ? (
                <p className="text-xs text-gray-500 font-bold italic leading-relaxed">
                  {t('default_highlights', lang)}
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {featuresList.map((f, i) => (
                    <li key={i} className="text-xs text-gray-700 font-bold flex items-start gap-2 leading-snug">
                      <span className="text-green-600 text-sm leading-none mt-0.5">⚡</span>
                      <span>{f}</span>
                    </li> 
                  ))}
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
                  {t('total_selection', lang)} ({activeVariant.capacity})
                </div>
                <div className="font-black text-lg text-gray-900 leading-none mt-0.5">
                  ₹{(dealerVal * (currentQty || 1)).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-1/2">
                {isOutOfStock ? (
                  <button disabled className="w-full bg-gray-200 text-gray-500 text-xs font-black py-4 rounded-xl cursor-not-allowed">
                    {t('out_of_stock', lang)}
                  </button>
                ) : currentQty > 0 ? (
                  <div className="flex justify-between items-center bg-blue-50 rounded-xl p-1 border border-blue-100">
                    <button 
                      onClick={() => updateQty(activeVariant, -1)} 
                      className="bg-white text-blue-900 font-black w-10 h-10 rounded-lg shadow-sm"
                    >
                      -
                    </button>
                    <span className="font-black text-blue-900 text-lg">{currentQty}</span>
                    <button 
                      onClick={() => updateQty(activeVariant, 1)} 
                      className="bg-blue-900 text-white font-black w-10 h-10 rounded-lg shadow-sm"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => updateQty(activeVariant, 1)} 
                    className="w-full bg-blue-900 text-white text-xs font-black py-4 rounded-xl shadow-lg active:scale-95"
                  >
                    {showOnOrder ? t('add_to_order_next_day', lang) : t('add_to_cart', lang)}
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
              {'📲 ' + t('share_with_dealer', lang)}
            </button>
          )}
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[90] flex flex-col justify-center items-center p-4 animate-fade-in cursor-zoom-out" 
          onClick={() => setIsZoomed(false)}
        >
          <button className="absolute top-4 right-5 text-white font-black text-xl bg-gray-800 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
            ✕
          </button>
          {imagesList.length > 1 && (
            <div className="absolute left-4 right-4 flex justify-between z-[100] pointer-events-none">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
                className="pointer-events-auto bg-white bg-opacity-20 text-white font-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-40"
              >
                ←
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
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
            onClick={(e) => { e.stopPropagation(); setZoomScale(zoomScale === 1.25 ? 2.2 : 1.25); }} 
            alt="Zoomed Product" 
          />
          <p className="text-gray-400 text-[10px] mt-6 font-bold uppercase tracking-wider text-center bg-gray-900 bg-opacity-40 px-4 py-1.5 rounded-full select-none pointer-events-none">
            {t('tap_to_zoom', lang)}
          </p>
        </div>
      )}
    </div>
  );
}



