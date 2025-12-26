
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MenuItem, Theme, Brand, Sale, CartItem, UserRole } from '../types';

interface InfoTabProps {
  brand?: Brand;
  menuItems: MenuItem[];
  sales: Sale[];
  cart: CartItem[];
  onUpdatePrice: (id: string, price: number) => void;
  onAddItem: (name: string, category: string, image?: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  theme: Theme;
  formatPrice: (amount: number) => string;
  userRole: UserRole;
}

const CATEGORIES = ["Beverages", "Food", "Desserts", "Sides", "Snacks", "Others"];

const SafeImage = ({ src, alt, className, objectFit = 'cover' }: { src?: string, alt: string, className: string, objectFit?: 'cover' | 'contain' }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setError(false); setLoaded(false); }, [src]);
  if (!src || error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-200 dark:bg-zinc-700 opacity-40`}>
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    );
  }
  return (
    <div className={`${className} relative overflow-hidden bg-gray-100 dark:bg-zinc-800`}>
      <img src={src} alt={alt} className={`${className} ${objectFit === 'cover' ? 'object-cover' : 'object-contain'} transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoaded(true)} onError={() => setError(true)} loading="lazy" />
    </div>
  );
};

const InfoTab: React.FC<InfoTabProps> = ({ 
  brand, menuItems, sales, cart, 
  onUpdatePrice, onAddItem, onAddToCart, onRemoveFromCart, onClearCart, onCheckout, theme, formatPrice, userRole 
}) => {
  const isDark = theme === Theme.DARK;
  const textColor = isDark ? 'text-white' : 'text-slate-950'; 
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-600';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0]);
  const [newItemImage, setNewItemImage] = useState<string | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOwner = userRole === 'owner';

  const cartTotal = cart.reduce((acc, item) => acc + (item.price! * item.quantity), 0);
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  const handleSavePrice = (id: string) => {
    const p = parseFloat(tempPrice);
    if (!isNaN(p)) onUpdatePrice(id, p);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() && newItemCategory) {
      onAddItem(newItemName, newItemCategory, newItemImage);
      setShowAddItem(false);
      setNewItemName('');
      setNewItemCategory(CATEGORIES[0]);
      setNewItemImage(undefined);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className={`p-5 rounded-[2.5rem] flex items-center gap-5 border-2 ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="w-16 h-16 bg-white rounded-3xl p-2.5 flex items-center justify-center overflow-hidden border-2 border-slate-50 shrink-0 shadow-sm">
           <SafeImage src={brand?.logoUrl} alt={brand?.name || 'Brand'} className="w-full h-full" objectFit="contain" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className={`text-xl font-black truncate ${textColor}`}>{brand?.name || 'Store Management'}</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{isOwner ? 'Manager Mode' : 'Staff Mode'}</p>
        </div>
        {isOwner && (
          <button 
            onClick={() => setShowAddItem(true)}
            className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        )}
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Search items..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className={`w-full px-7 py-5 rounded-[2rem] border-2 transition-all font-black text-sm ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600' : 'bg-white border-slate-100 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-0'}`} 
        />
        <svg className="w-5 h-5 absolute right-7 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {['All', ...CATEGORIES].map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)} 
            className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-white border-slate-50 text-slate-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className={`overflow-hidden rounded-[2rem] border-2 transition-all ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-50 shadow-sm hover:border-blue-100 hover:shadow-md'}`}>
            <div className="flex items-center h-32 p-4 gap-5">
               <div className="w-24 h-full shrink-0 rounded-2xl overflow-hidden bg-slate-50">
                 <SafeImage src={item.image} alt={item.name} className="w-full h-full" />
               </div>
               <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
                  <div className="flex justify-between items-start gap-2">
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] mb-0.5">{item.category}</p>
                      <h3 className={`font-black text-base truncate ${textColor}`}>{item.name}</h3>
                    </div>
                    <p className="text-blue-600 font-black text-sm whitespace-nowrap">{item.price ? formatPrice(item.price) : 'NOT SET'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingId === item.id ? (
                      <div className="flex w-full gap-2 animate-pulse">
                        <input 
                          type="number" 
                          value={tempPrice} 
                          onChange={(e) => setTempPrice(e.target.value)} 
                          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black outline-none ${isDark ? 'bg-zinc-700 text-white' : 'bg-slate-100 text-slate-900'}`} 
                          placeholder="Price"
                          autoFocus 
                        />
                        <button onClick={() => handleSavePrice(item.id)} className="bg-blue-600 text-white px-5 rounded-xl font-black text-[10px] uppercase shadow-lg">SAVE</button>
                      </div>
                    ) : (
                      <>
                        {isOwner ? (
                          <button 
                            onClick={() => { setEditingId(item.id); setTempPrice(item.price?.toString() || ''); }} 
                            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-600/10 text-blue-600 hover:bg-blue-50 transition-colors`}
                          >
                            Set Price
                          </button>
                        ) : <div className="flex-1" />}
                        {item.price && (
                          <button 
                            onClick={() => onAddToCart(item)} 
                            className="bg-blue-600 text-white w-12 h-12 rounded-2xl font-black text-2xl shadow-xl active:scale-125 transition-transform flex items-center justify-center"
                          >
                            +
                          </button>
                        )}
                      </>
                    )}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-md rounded-[3.5rem] p-8 animate-slide-up ${isDark ? 'bg-zinc-950 border-t border-zinc-800' : 'bg-white shadow-2xl'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${textColor}`}>New Product</h3>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Inventory Addition</p>
              </div>
              <button onClick={() => setShowAddItem(false)} className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800">
                <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5 mb-8">
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all ${newItemImage ? 'border-blue-600' : 'border-slate-200 hover:border-blue-400'}`}
                >
                  {newItemImage ? (
                    <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest">Add Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Item Name</label>
                <input 
                  type="text" 
                  placeholder="Ex: Triple Espresso"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 transition-all font-black text-sm ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-50 text-slate-900'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setNewItemCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newItemCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-slate-100 text-slate-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${newItemName.trim() ? 'bg-blue-600 text-white shadow-blue-500/40 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              Add to Catalog
            </button>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)} 
          className="fixed bottom-24 right-6 bg-blue-600 text-white pl-5 pr-7 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 animate-bounce ring-8 ring-white dark:ring-zinc-950"
        >
          <div className="bg-white text-blue-600 w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black shadow-inner">{cart.length}</div>
          <span className="font-black text-xs uppercase tracking-[0.2em]">View Cart</span>
        </button>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-lg p-4">
          <div className={`w-full max-w-md rounded-[3.5rem] p-10 animate-slide-up ${isDark ? 'bg-zinc-950 border-t border-zinc-800' : 'bg-white shadow-2xl'}`}>
             <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>Checkout</h3>
                 <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Review your selection</p>
               </div>
               <button onClick={() => setShowCart(false)} className="p-3.5 rounded-full bg-slate-100 dark:bg-zinc-800">
                 <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-3 custom-scrollbar">
               {cart.map((item, i) => (
                 <div key={i} className={`flex justify-between items-center p-5 rounded-3xl border-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-50'}`}>
                    <div className="overflow-hidden flex-1 mr-4">
                      <p className={`font-black text-base truncate ${textColor}`}>{item.name}</p>
                      <p className={`text-[10px] font-bold ${labelColor}`}>{item.quantity} units @ {formatPrice(item.price || 0)}</p>
                    </div>
                    <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500 bg-red-50 dark:bg-red-900/10 p-2.5 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
               ))}
             </div>
             <div className="flex justify-between mb-10 px-4 items-end">
                <span className={`font-black uppercase text-[11px] tracking-[0.2em] ${labelColor} mb-1`}>Total Amount</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter tabular-nums">{formatPrice(cartTotal)}</span>
             </div>
             <button 
               onClick={() => { onCheckout(); setShowCart(false); }} 
               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
             >
               Finalize Order
             </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default InfoTab;
