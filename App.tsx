
import React, { useState, useEffect } from 'react';
import { Theme, Tab, ShopConfig, MenuItem, Sale, CartItem, DaySummary, User, UserRole } from './types.ts';
import { BRANDS, getCountryData, convertPrice } from './constants.tsx';
import Login from './components/Login.tsx';
import Onboarding from './components/Onboarding.tsx';
import PublicTab from './components/PublicTab.tsx';
import InfoTab from './components/InfoTab.tsx';
import AccountTab from './components/AccountTab.tsx';
import BottomNav from './components/BottomNav.tsx';

interface ShopData {
  id: string;
  config: ShopConfig;
  menuItems: MenuItem[];
  sales: Sale[];
  history: DaySummary[];
  lastDayEndTimestamp: number;
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INFO);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sm_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user", e);
      return null;
    }
  });

  const [stores, setStores] = useState<ShopData[]>(() => {
    try {
      const saved = localStorage.getItem('sm_all_stores');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse stores", e);
    }
    return [];
  });

  const [activeStoreId, setActiveStoreId] = useState<string | null>(() => {
    return localStorage.getItem('sm_active_store_id');
  });

  const [showStoreSelector, setShowStoreSelector] = useState(false);

  const currentStore = stores.find(s => s.id === activeStoreId) || null;
  const config = currentStore?.config || { shopName: '', brandId: '', country: 'United States', isOnboarded: false, staffEmails: [], familyEmails: [], staffPresence: {} };
  const menuItems = currentStore?.menuItems || [];
  const sales = currentStore?.sales || [];
  const history = currentStore?.history || [];

  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    localStorage.setItem('sm_all_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    if (activeStoreId) localStorage.setItem('sm_active_store_id', activeStoreId);
    else localStorage.removeItem('sm_active_store_id');
  }, [activeStoreId]);

  useEffect(() => {
    localStorage.setItem('sm_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Presence Heartbeat
  useEffect(() => {
    if (!currentUser || !activeStoreId) return;

    const updateHeartbeat = () => {
      setStores(prev => prev.map(s => {
        if (s.id === activeStoreId) {
          const presence = { ...(s.config.staffPresence || {}) };
          presence[currentUser.email] = {
            name: currentUser.name,
            email: currentUser.email,
            lastActive: Date.now(),
            role: currentUser.role
          };
          return { ...s, config: { ...s.config, staffPresence: presence } };
        }
        return s;
      }));
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.email, activeStoreId]);

  const updateActiveStore = (updates: Partial<ShopData>) => {
    if (!activeStoreId) return;
    setStores(prev => prev.map(s => s.id === activeStoreId ? { ...s, ...updates } : s));
  };

  const updateActiveConfig = (updates: Partial<ShopConfig>) => {
    if (!currentStore) return;
    updateActiveStore({ config: { ...currentStore.config, ...updates } });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  const handleLogin = (user: User) => {
    const email = user.email.toLowerCase().trim();
    const accessibleStores = stores.filter(s => 
      s.config.ownerEmail === email || 
      s.config.staffEmails?.includes(email) || 
      s.config.familyEmails?.includes(email)
    );

    setCurrentUser(user);

    if (accessibleStores.length > 1) {
      setShowStoreSelector(true);
    } else if (accessibleStores.length === 1) {
      const store = accessibleStores[0];
      let role: UserRole = user.role;
      if (store.config.ownerEmail === email) role = 'owner';
      else if (store.config.familyEmails?.includes(email)) role = 'family';
      else if (store.config.staffEmails?.includes(email)) role = 'staff';
      
      setCurrentUser({ ...user, role });
      setActiveStoreId(store.id);
    } else {
      setActiveStoreId(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveStoreId(null);
    setShowStoreSelector(false);
  };

  const handleSwitchStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store && currentUser) {
      const email = currentUser.email.toLowerCase();
      let role: UserRole = currentUser.role;
      if (store.config.ownerEmail === email) role = 'owner';
      else if (store.config.familyEmails?.includes(email)) role = 'family';
      else if (store.config.staffEmails?.includes(email)) role = 'staff';
      
      setCurrentUser({ ...currentUser, role });
      setActiveStoreId(storeId);
      setShowStoreSelector(false);
      setActiveTab(Tab.INFO);
    }
  };

  const handleOnboard = (shopName: string, brandId: string, country: string) => {
    if (!currentUser) return;
    const newStoreId = Math.random().toString(36).substr(2, 9);
    const brand = BRANDS.find(b => b.id === brandId);
    const newStore: ShopData = {
      id: newStoreId,
      config: {
        shopName, brandId, country, isOnboarded: true,
        ownerEmail: currentUser.email.toLowerCase(),
        staffEmails: [], familyEmails: [], staffPresence: {}
      },
      menuItems: brand ? brand.defaultMenu : [],
      sales: [], history: [], lastDayEndTimestamp: 0
    };
    setStores(prev => [...prev, newStore]);
    setActiveStoreId(newStoreId);
    setCurrentUser(prev => prev ? { ...prev, role: 'owner' } : null);
  };

  const formatPrice = (amount: number) => {
    const countryData = getCountryData(config.country);
    if (!currentUser?.displayCurrency || currentUser.displayCurrency === countryData.currency) {
      return `${countryData.symbol}${amount.toFixed(2)}`;
    }
    const converted = convertPrice(amount, config.country, currentUser.displayCurrency);
    return `${converted.symbol}${converted.value.toFixed(2)}`;
  };

  const handleCheckout = () => {
    if (!currentStore || cart.length === 0) return;

    const newSales: Sale[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      itemName: item.name,
      amount: (item.price || 0) * item.quantity,
      timestamp: Date.now()
    }));

    const updatedMenuItems = menuItems.map(menuItem => {
      const cartItem = cart.find(c => c.id === menuItem.id);
      if (cartItem) {
        return { ...menuItem, salesCount: menuItem.salesCount + cartItem.quantity };
      }
      return menuItem;
    });

    updateActiveStore({
      sales: [...sales, ...newSales],
      menuItems: updatedMenuItems
    });
    setCart([]);
  };

  const handleEndDay = () => {
    if (!currentStore || sales.length === 0) return;

    const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);
    const newHistoryEntry: DaySummary = {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      totalRevenue,
      totalSales: sales.length
    };

    updateActiveStore({
      history: [newHistoryEntry, ...history],
      sales: [],
      lastDayEndTimestamp: Date.now()
    });
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (showStoreSelector || (!activeStoreId && currentUser.role !== 'owner')) {
    const userEmail = currentUser.email.toLowerCase();
    const myStores = stores.filter(s => 
      s.config.ownerEmail === userEmail || 
      s.config.staffEmails?.includes(userEmail) || 
      s.config.familyEmails?.includes(userEmail)
    );

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === Theme.DARK ? 'bg-zinc-950 text-white' : 'bg-blue-600 text-slate-900'}`}>
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[3rem] p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-1 dark:text-white">Store Gateway</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Logged in as {currentUser.name}</p>
          </div>

          {myStores.length > 0 ? (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {myStores.map(s => (
                <button key={s.id} onClick={() => handleSwitchStore(s.id)} className="w-full p-5 rounded-3xl border-2 border-gray-50 dark:border-zinc-800 hover:border-blue-500 transition-all flex items-center justify-between group">
                  <div className="text-left overflow-hidden">
                    <p className="font-black text-sm text-slate-900 dark:text-white truncate">{s.config.shopName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {s.config.ownerEmail === userEmail ? 'Owner' : s.config.familyEmails?.includes(userEmail) ? 'Family' : 'Staff'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="font-black text-slate-900 dark:text-white">Waiting for Access</p>
              <p className="text-xs text-slate-400 mt-2 px-6">Ask your owner to add your email ({currentUser.email}) to staff.</p>
            </div>
          )}
          
          <div className="mt-8 pt-8 border-t dark:border-zinc-800 flex flex-col gap-3">
             <button onClick={() => setShowStoreSelector(false)} className="w-full py-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">Back</button>
             <button onClick={handleLogout} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl">Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeStoreId && currentUser.role === 'owner') return <Onboarding onComplete={handleOnboard} />;

  const currentBrand = BRANDS.find(b => b.id === config.brandId);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === Theme.DARK ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <main className="pb-24 pt-4 px-4 max-w-lg mx-auto">
        {activeTab === Tab.PUBLIC && (
          <PublicTab 
            shopName={config.shopName} 
            brandName={currentBrand?.name || ''} 
            sales={sales}
            history={history}
            theme={theme}
            currency={formatPrice(1).replace(/[0-9.,]/g, '')}
            formatPrice={formatPrice}
            onEndDay={handleEndDay}
            userRole={currentUser.role}
            staffPresence={config.staffPresence}
          />
        )}
        {activeTab === Tab.INFO && (
          <InfoTab 
            brand={currentBrand}
            menuItems={menuItems} 
            sales={sales}
            cart={cart}
            onUpdatePrice={(id, price) => updateActiveStore({ menuItems: menuItems.map(item => item.id === id ? { ...item, price } : item) })} 
            onAddItem={(name, cat, img) => updateActiveStore({ menuItems: [{ id: Math.random().toString(36).substr(2, 9), name, category: cat, image: img, salesCount: 0 }, ...menuItems] })}
            onAddToCart={(item) => item.price && setCart(prev => [...prev, { ...item, quantity: 1 }])}
            onRemoveFromCart={(id) => setCart(prev => prev.filter(i => i.id !== id))}
            onClearCart={() => setCart([])}
            onCheckout={handleCheckout}
            theme={theme}
            formatPrice={formatPrice}
            userRole={currentUser.role}
          />
        )}
        {activeTab === Tab.ACCOUNT && (
          <AccountTab 
            shopConfig={config} 
            user={currentUser}
            theme={theme} 
            toggleTheme={toggleTheme} 
            onLogout={handleLogout}
            onUpdateAccess={(type, emails) => updateActiveConfig({ [type === 'staff' ? 'staffEmails' : 'familyEmails']: emails })}
            onUpdateUser={setCurrentUser as any}
            onSwitchShop={() => setShowStoreSelector(true)}
            hasMultipleShops={stores.length > 1}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
    </div>
  );
};

export default App;
