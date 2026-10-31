import React, { useState, useEffect } from 'react';
import { API_URL, LOGO_URL, cacheBypass, getNum, getProp } from './utils/helpers';
import { LANGUAGES, t } from './utils/translations';
import { Catalog } from './components/Catalog';
import { Cart } from './components/Cart';
import OffersView from './components/Offers';
import { LedgerView, OrdersHistoryView } from './components/Ledger';
import ReplacementsView from './components/Replacements';
import { BottomNav, ContactFABs, LanguageBar } from './components/SharedUI';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      const lang = this.props.lang || 'en';
      return (
        <div className="p-6 bg-white rounded-3xl m-4 border-2 border-red-200 text-center shadow-xl font-sans">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-base font-black text-gray-900 mt-2">
            {t('something_went_wrong', lang)}
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
            {t('technical_issue_desc', lang)}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="bg-blue-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md active:scale-95"
          >
            {t('reload_app', lang)}
          </button>
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

export default function App() {
  const [user, setUser] = useState(null);
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
    return <LoginScreen onLogin={(data) => { setUser(data); }} callAPI={callAPI} loading={loading} setLoading={setLoading} lang={lang} setLang={handleSetLang} />;
  }

  if (!isNotificationGranted) {
    const isDenied = window.Notification && Notification.permission === "denied";

    return (
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
    <ErrorBoundary lang={lang} onReset={() => handleSetView("catalog")}>
      <div className="max-w-md mx-auto bg-gray-100 min-h-screen relative pb-[80px] shadow-xl">
        {/* 🌐 PROMINENT TOP LANGUAGE BAR (VISIBLE ACROSS ALL SCREENS) */}
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
          {/* Language Switcher Pill */}
          <select 
            value={lang} 
            onChange={(e) => handleSetLang(e.target.value)} 
            className="bg-blue-950/80 text-white text-[10px] font-black px-2 py-2 rounded-lg border border-blue-600 outline-none cursor-pointer shadow-sm hover:bg-blue-950 transition-colors"
          >
            <option value="en">🇬🇧 EN</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="mr">🚩 मराठी</option>
          </select>

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

      <ErrorBoundary lang={lang} onReset={() => handleSetView("catalog")}>
        {view === "catalog" ? (
          <Catalog user={user} callAPI={callAPI} cart={cart} setCart={setCart} products={products} setProducts={setProducts} setView={handleSetView} globalProps={globalProps} schemes={schemes} lang={lang} setLang={handleSetLang} />
        ) : view === "cart" ? (
          <Cart user={user} cart={cart} setCart={setCart} setView={handleSetView} callAPI={callAPI} globalProps={globalProps} schemes={schemes} lang={lang} />
        ) : view === "offers" ? (
          <OffersView user={user} products={products} cart={cart} setCart={setCart} setView={handleSetView} schemes={schemes} lang={lang} />
        ) : view === "ledger" ? (
          <LedgerView user={user} callAPI={callAPI} lang={lang} />
        ) : view === "replacements" ? (
          <ReplacementsView user={user} callAPI={callAPI} globalProps={globalProps} products={products} lang={lang} />
        ) : (
          <OrdersHistoryView user={user} callAPI={callAPI} lang={lang} />
        )}
      </ErrorBoundary>

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
    </ErrorBoundary>
  );
}
