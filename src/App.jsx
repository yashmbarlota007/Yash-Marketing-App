import React, { useState, useEffect, useRef } from 'react';
import { API_URL, LOGO_URL, cacheBypass, getNum, getProp, calculateSchemeProgress, triggerCelebration, logAppError } from './utils/helpers';
import { LANGUAGES, t, translateReward } from './utils/translations';
import { Catalog } from './components/Catalog';
import { Cart } from './components/Cart';
import OffersView from './components/Offers';
import { LedgerView, OrdersHistoryView } from './components/Ledger';
import ReplacementsView from './components/Replacements';
import { BottomNav, ContactFABs, LanguageBar } from './components/SharedUI';

// 🛡️ ISOLATED COMPONENT ERROR BOUNDARY WITH REAL-TIME DEBUG DRAWER
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const compName = this.props.componentName || "AppShell";
    console.error(`🚨 ErrorBoundary caught in <${compName}>:`, error, errorInfo);
    if (typeof logAppError === 'function') {
      logAppError(error, compName + (errorInfo && errorInfo.componentStack ? "\nComponentStack: " + errorInfo.componentStack : ''));
    }
  }

  render() {
    if (this.state.hasError) {
      const lang = this.props.lang || 'en';
      const compName = this.props.componentName || "Section";
      return (
        <div className="p-5 m-3 bg-red-50/95 border-2 border-red-300 rounded-3xl text-center shadow-lg font-sans">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-sm font-black text-red-950 mt-1">
            {lang === 'mr' ? `${compName} विभागात तांत्रिक त्रुटी आली` : lang === 'hi' ? `${compName} विभाग में तकनीकी समस्या आई` : `Error in ${compName}`}
          </h3>
          <p className="text-[11px] font-semibold text-red-700 mt-1 mb-3">
            {lang === 'mr' ? 'बाकी ॲप सुरळीत चालू आहे. कृपया पुन्हा प्रयत्न करा किंवा कॅटलॉगवर जा.' : lang === 'hi' ? 'बाकी ऐप सामान्य रूप से कार्य कर रहा है। कृपया पुनः प्रयास करें या कैटलॉग पर जाएं।' : 'Rest of the app is working normally. Please retry or return to the catalog.'}
          </p>
          <div className="flex gap-2 justify-center mb-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="bg-blue-900 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md active:scale-95"
            >
              🔄 {lang === 'mr' ? 'पुन्हा प्रयत्न करा / कॅटलॉग' : lang === 'hi' ? 'पुनः प्रयास करें / कैटलॉग' : 'Retry / Go to Catalog'}
            </button>
            <button
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              className="bg-white text-gray-700 border border-gray-300 font-bold text-[10px] px-3 py-2 rounded-xl shadow-xs active:scale-95"
            >
              🛠️ {this.state.showDetails ? 'Hide Details' : 'View Error Log'}
            </button>
          </div>
          {this.state.showDetails && (
            <div className="mt-3 p-3 bg-gray-900 text-red-300 text-[9px] font-mono rounded-xl text-left overflow-x-auto select-all max-h-48 border border-red-800">
              <div className="font-bold text-white mb-1">Component: {compName}</div>
              <div className="font-bold text-yellow-300 mb-1">Message: {this.state.error?.message}</div>
              <pre className="whitespace-pre-wrap text-[8px] leading-tight">{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

function LoginScreen(props) {
  var onLogin = props.onLogin;
  var callAPI = props.callAPI;
  var loading = props.loading;
  var setLoading = props.setLoading;
  var lang = props.lang || 'en';
  var setLang = props.setLang;
  const [phone, setPhone] = useState("");

  const handleLogin = function() {
    if (phone.length < 10) return alert(t('enter_10_digit', lang));
    setLoading(true);
    
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "verifyDealer", phone: phone }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json()).then(function(res) {
      setLoading(false);
      if (res && res.success) {
        var dealerData = { phone: phone, shopName: res.shopName };
        localStorage.setItem("yashDealerSession", JSON.stringify(dealerData));
        onLogin(dealerData);
      } else {
        alert((res && res.message) ? res.message : t('invalid_number', lang));
      }
    }).catch(() => {
      setLoading(false);
      alert("Network Error during Login.");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-8 border-blue-900">
        
        {/* Language Selection Switcher on Login */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-[11px] font-black px-3 py-1.5 rounded-xl transition-all ${
                  lang === l.code
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {l.flag} {l.native}
              </button>
            ))}
          </div>
        </div>

        <img 
          src={LOGO_URL} 
          className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-gray-50 shadow-lg" 
          alt="Logo"
        />
        <h2 className="text-3xl font-black mb-1 text-gray-900">{t('app_title', lang)}</h2>
        <p className="text-blue-700 font-bold text-xs mb-8 tracking-widest uppercase bg-blue-50 py-1 px-3 rounded-full inline-block">
          {t('authorized_portal', lang)}
        </p>
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="w-full bg-gray-50 p-4 rounded-xl mb-6 text-center font-black text-xl outline-none border border-gray-200 focus:border-blue-700" 
          placeholder={t('mobile_no_placeholder', lang)} 
        />
        <button 
          onClick={handleLogin} 
          disabled={loading} 
          className="w-full bg-blue-900 text-white font-black text-lg p-4 rounded-2xl active:scale-95 shadow-lg flex justify-center"
        >
          {loading ? (
            <div className="border-4 border-white border-t-transparent w-7 h-7 rounded-full spinner"></div>
          ) : (
            t('secure_login', lang)
          )}
        </button>
      </div>
    </div>
  );
}

function MainApp() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("yashDealerSession");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [view, setView] = useState("catalog");
  const [products, setProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("yashAppLang") || "en";
    } catch (e) {
      return "en";
    }
  });

  const handleSetLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem("yashAppLang", newLang);
    } catch (e) {}
  };

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("yashDealerCart");
      const parsed = savedCart ? JSON.parse(savedCart) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  });

  // cartItems, totalItems, and totalAmount are initialized safely above early returns

  const [loading, setLoading] = useState(false);
  const [customerMode, setCustomerMode] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showNotice, setShowNotice] = useState(false);
  const [isNotificationGranted, setIsNotificationGranted] = useState(true);

  useEffect(() => {
    window.history.replaceState({ page: 'catalog' }, '');
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setView(e.state.page);
      } else {
        setView('catalog');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetView = (newView) => {
    if (newView !== view) {
      window.history.pushState({ page: newView }, '');
      setView(newView);
    }
  };

  // 🛡️ GLOBAL AUTOMATED ERROR TELEMETRY
  useEffect(() => {
    const handleGlobalError = (event) => {
      logAppError(event.error || event.message, 'window.onerror');
    };
    const handleRejection = (event) => {
      logAppError(event.reason, 'window.onunhandledrejection');
    };
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // 🎉 AUTOMATIC OFFER UNLOCK CELEBRATION DETECTOR
  const previousUnlockedCountRef = useRef(0);
  const [celebrationReward, setCelebrationReward] = useState(null);

  useEffect(() => {
    if (!user || !schemes || schemes.length === 0 || !cartItems || cartItems.length === 0) return;

    const unlocked = schemes.filter(s => {
      const prog = calculateSchemeProgress(cartItems, s);
      return prog && prog.isUnlocked;
    });

    if (unlocked.length > previousUnlockedCountRef.current && previousUnlockedCountRef.current > 0) {
      const newlyUnlocked = unlocked[unlocked.length - 1];
      const rewardText = newlyUnlocked?.reward || "Special Promotion";
      setCelebrationReward(rewardText);
      triggerCelebration(rewardText);
      setTimeout(() => setCelebrationReward(null), 4000);
    }
    previousUnlockedCountRef.current = unlocked.length;
  }, [cart, schemes]);


  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("yashDealerSession");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Session restore failed:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("yashDealerCart", JSON.stringify(cart));
  }, [cart]);

  // Fetch real-time schemes globally so all views (Catalog, Cart, Offers) are synchronized
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const checkNotification = () => {
      if (window.Notification) {
        if (Notification.permission === "granted") {
          setIsNotificationGranted(true);
        } else {
          setIsNotificationGranted(false);
        }
      }
    };

    checkNotification();
    window.addEventListener('focus', checkNotification);
    document.addEventListener('visibilitychange', checkNotification);
    return () => {
      window.removeEventListener('focus', checkNotification);
      document.removeEventListener('visibilitychange', checkNotification);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetch(API_URL + cacheBypass, {
        method: 'POST',
        body: JSON.stringify({ action: "getAnnouncements" }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      })
      .then(r => r.json())
      .then(res => {
        let parsedData = [];
        if (res && res.success && Array.isArray(res.data)) {
          parsedData = res.data;
        } else if (res && Array.isArray(res.data)) {
          parsedData = res.data;
        } else if (Array.isArray(res)) {
          parsedData = res;
        }

        if (parsedData.length > 0) {
          setAnnouncements(parsedData);
          setShowNotice(true);
        } else {
          setShowNotice(false);
        }
      }).catch((e) => {
        var defaultMsg = [{
          title: "Welcome to Yash Marketing",
          message: "Naye schemes aur bulk order discount live hain. Kisi bhi inquiry ke liye direct WhatsApp par contact karein."
        }];
        setAnnouncements(defaultMsg);
        setShowNotice(true);
      });
    }
  }, [user]);

  const logSpyData = (eventName, detailsStr) => {
    var details = detailsStr || "";
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "logEvent", phone: user ? user.phone : "Unknown", shopName: user ? user.shopName : "Unknown", event: eventName, details: details }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).catch(e => console.log("Silent Log Failed"));
  };

  const globalProps = { logSpyData, customerMode };

  const callAPI = async function(payload) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return await response.json();
    } catch (e) {
      alert("🚨 NETWORK ERROR: Please check your internet connection.");
      return { success: false, message: e.message || "Network Error" };
    }
  };

  const handleRequestPermission = async () => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.Notifications.requestPermission();
          if (window.Notification && Notification.permission === 'granted') {
            setIsNotificationGranted(true);
            return;
          }
        } catch (error) {
          console.error("OneSignal permission error:", error);
        }
      });
    }

    if (window.Notification) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setIsNotificationGranted(true);
          return;
        }
      } catch (err) {
        console.error("Notification request error:", err);
      }

      if (Notification.permission === 'denied') {
        alert("⚠️ Notifications browser me Blocked hain!\n\nKripya browser ke address bar me Lock (🔒) icon par click karein aur Notifications ko 'Allow' karke 'CHECK AGAIN' dabayein.");
      } else {
        alert("App use karne ke liye Permission allow karna compulsory hai!");
      }
    } else {
      setIsNotificationGranted(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("yashDealerSession");
    localStorage.removeItem("yashDealerCart");
    setUser(null);
    setCart({});
    handleSetView("catalog");
  };

  if (!user) {
    return (
      <ErrorBoundary componentName="LoginScreen" lang={lang}>
        <LoginScreen onLogin={(data) => { setUser(data); }} callAPI={callAPI} loading={loading} setLoading={setLoading} lang={lang} setLang={handleSetLang} />
      </ErrorBoundary>
    );
  }

  if (!isNotificationGranted) {
    const isDenied = window.Notification && Notification.permission === "denied";

    return (
      <ErrorBoundary componentName="NotificationPermission" lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center select-none font-sans">
        <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-8 border-red-600 animate-slide-up">
          <span className="text-5xl animate-bounce inline-block">🔔</span>
          <h2 className="text-xl font-black text-gray-900 mt-4 uppercase tracking-tight">Permission Required!</h2>
          <p className="text-xs font-semibold text-gray-500 mt-4 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            Yash Marketing Portal ka use karne ke liye Push Notification allow karna compulsory hai. Isse aapko naye schemes, payments aur order updates instantly mobile screen par milenge.
          </p>

          {isDenied && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-left">
              <p className="text-[11px] font-bold text-amber-900">
                ⚠️ <strong>Browser me permission Blocked hai:</strong>
              </p>
              <ol className="text-[10px] text-amber-800 list-decimal ml-4 mt-1 space-y-0.5 font-medium">
                <li>Browser ke address bar me Lock (🔒) icon dabayein.</li>
                <li>Notifications ko <strong>Allow</strong> karein.</li>
                <li>Neeche <strong>Check Again</strong> button dabayein.</li>
              </ol>
            </div>
          )}

          <div className="space-y-2 mt-6">
            <button 
              onClick={handleRequestPermission} 
              className="w-full bg-red-600 text-white font-black text-sm py-4 rounded-xl shadow-lg active:scale-95"
            >
              {isDenied ? "🔄 CHECK AGAIN" : "ENABLE NOTIFICATIONS NOW"}
            </button>
            <button 
              onClick={handleLogout} 
              className="w-full bg-gray-100 text-gray-600 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    );
  }

  const cartItems = cart && typeof cart === 'object' && !Array.isArray(cart) ? Object.values(cart) : [];
  const totalItems = cartItems.reduce((a, b) => a + (getNum(b.qty) || 0), 0);
  
  const totalAmount = cartItems.reduce((a, b) => {
    const itemPrice = getNum(getProp(b, "DealerPrice"));
    return a + (itemPrice * (getNum(b.qty) || 0));
  }, 0) - (function(){
    let nQty = 0, pQty = 0, nPrice = 0, pPrice = 0;
    cartItems.forEach(i => {
      let n = String(getProp(i, "ProductName")).toLowerCase().trim();
      let qty = getNum(i.qty) || 0;
      if (n === "velocity neckband wave") { nQty += qty; nPrice = getNum(getProp(i, "DealerPrice")); }
      if (n === "velocity airpods tws pods") { pQty += qty; pPrice = getNum(getProp(i, "DealerPrice")); }
    });
    let combos = Math.min(nQty, pQty);
    let stPrice = nPrice + pPrice;
    return (combos > 0 && stPrice > 400) ? (stPrice - 400) * combos : 0;
  })();

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen relative pb-[80px] shadow-xl">
      {/* 🌐 PROMINENT TOP LANGUAGE BAR (ONLY 1 SINGLE CLEAN BAR ON SCREEN) */}
      <LanguageBar currentLang={lang} onSelectLang={handleSetLang} />

      {/* Sticky Main Header */}
      <div className="bg-blue-900 text-white p-3.5 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-extrabold text-sm flex items-center gap-1.5 select-none">
            <img src={LOGO_URL} className="w-6 h-6 rounded-full border border-blue-400" alt="Logo" />
            {t('app_title', lang)} <span className="text-[8px] bg-blue-800 text-blue-200 px-1 rounded font-normal select-none">v4.0</span>
          </h1>
          <p className="text-[9px] text-blue-200 font-bold uppercase mt-0.5 truncate max-w-[120px]">{user.shopName}</p>
        </div>
        
        <div className="flex gap-1.5 items-center">
          <button onClick={() => {
            const m = !customerMode;
            setCustomerMode(m);
            if (m && (view === "ledger" || view === "orders" || view === "replacements")) handleSetView("catalog");
            logSpyData(m ? "Enabled Customer Mode" : "Disabled Customer Mode");
          }} className={`text-[10px] font-black px-2.5 py-2 rounded-lg transition-colors shadow-sm ${customerMode ? 'bg-green-600 text-white' : 'bg-blue-800 text-blue-100'}`}>
            {customerMode ? `👥 ${t('customer_mode', lang)}` : `💼 ${t('dealer_mode', lang)}`}
          </button>
          
          <button onClick={handleLogout} className="text-white text-[10px] font-bold bg-red-600 px-2 py-2 rounded-lg shadow-sm">
            {t('logout', lang)}
          </button>
        </div>
      </div>

      {/* 🛡️ ISOLATED VIEW ROUTING: IF ONE SECTION FAILS, THE REST OF THE APP STAYS 100% OPERATIONAL */}
      <div className="relative">
        {view === "catalog" ? (
          <ErrorBoundary componentName="Catalog" lang={lang} onReset={() => handleSetView("catalog")}>
            <Catalog user={user} callAPI={callAPI} cart={cart} setCart={setCart} products={products} setProducts={setProducts} setView={handleSetView} globalProps={globalProps} schemes={schemes} lang={lang} setLang={handleSetLang} />
          </ErrorBoundary>
        ) : view === "cart" ? (
          <ErrorBoundary componentName="Cart" lang={lang} onReset={() => handleSetView("catalog")}>
            <Cart user={user} cart={cart} setCart={setCart} setView={handleSetView} callAPI={callAPI} globalProps={globalProps} schemes={schemes} lang={lang} />
          </ErrorBoundary>
        ) : view === "offers" ? (
          <ErrorBoundary componentName="Offers" lang={lang} onReset={() => handleSetView("catalog")}>
            <OffersView user={user} products={products} cart={cart} setCart={setCart} setView={handleSetView} schemes={schemes} lang={lang} />
          </ErrorBoundary>
        ) : view === "ledger" ? (
          <ErrorBoundary componentName="Ledger" lang={lang} onReset={() => handleSetView("catalog")}>
            <LedgerView user={user} callAPI={callAPI} lang={lang} />
          </ErrorBoundary>
        ) : view === "replacements" ? (
          <ErrorBoundary componentName="Replacements" lang={lang} onReset={() => handleSetView("catalog")}>
            <ReplacementsView user={user} callAPI={callAPI} globalProps={globalProps} products={products} lang={lang} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary componentName="OrdersHistory" lang={lang} onReset={() => handleSetView("catalog")}>
            <OrdersHistoryView user={user} callAPI={callAPI} lang={lang} />
          </ErrorBoundary>
        )}
      </div>

      {/* 🎉 OFFER UNLOCKED CELEBRATION TOAST */}
      {celebrationReward && (
        <div className="fixed top-20 left-4 right-4 max-w-sm mx-auto z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-yellow-200">
                {lang === 'mr' ? 'अभिनंदन! ऑफर अनलॉक झाली!' : lang === 'hi' ? 'बधाई हो! ऑफर अनलॉक हुई!' : 'OFFER UNLOCKED!'}
              </div>
              <div className="text-xs font-black truncate text-white">
                🎁 {translateReward(celebrationReward, lang)}
              </div>
            </div>
          </div>
        </div>
      )}

      <ContactFABs view={view} />
      <BottomNav view={view} setView={handleSetView} totalItems={totalItems} customerMode={customerMode} lang={lang} />

      {view === "catalog" && totalItems > 0 && !customerMode && (
        <div className="fixed bottom-[80px] left-4 right-4 max-w-md mx-auto bg-green-600 text-white rounded-2xl shadow-2xl p-4 flex justify-between items-center z-30 opacity-95">
          <div>
            <div className="text-[10px] uppercase font-black opacity-80">{totalItems} {t('total_qty', lang)}</div>
            <div className="font-black text-lg leading-none">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <button onClick={() => handleSetView("cart")} className="bg-white text-green-700 font-black px-6 py-2 rounded-xl shadow-md active:scale-95">
            {t('view_cart', lang)}
          </button>
        </div>
      )}

      {user && showNotice && announcements.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-t-8 border-amber-600 shadow-2xl relative text-center animate-slide-up">
            <span className="text-4xl">🔔</span>
            <h2 className="text-xl font-black text-gray-900 mt-3">{announcements[0].title}</h2>
            <p className="text-sm font-semibold text-gray-600 mt-4 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{announcements[0].message}</p>
            <button onClick={() => setShowNotice(false)} className="w-full bg-amber-600 text-white font-black text-md py-3.5 rounded-xl mt-6 shadow-lg active:scale-95">GOT IT, THANKYOU!</button>
          </div>
        </div>
      )}
          </div>
  );
}


export default function App() {
  return (
    <ErrorBoundary componentName="RootAppShell">
      <MainApp />
    </ErrorBoundary>
  );
}
