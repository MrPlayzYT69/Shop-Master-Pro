
import React, { useState, useRef } from 'react';
import { ShopConfig, Theme, User } from '../types';
import { COUNTRIES } from '../constants';

interface AccountTabProps {
  shopConfig: ShopConfig;
  user: User;
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
  onUpdateAccess: (type: 'staff' | 'family', emails: string[]) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onSwitchShop: () => void;
  hasMultipleShops: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({ 
  shopConfig, user, theme, toggleTheme, onLogout, onUpdateAccess, onUpdateUser, onSwitchShop, hasMultipleShops 
}) => {
  const isDark = theme === Theme.DARK;
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-600';

  const [showAccessManager, setShowAccessManager] = useState<'staff' | 'family' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = user.role === 'owner';

  const handleAddAccess = (type: 'staff' | 'family') => {
    const email = newEmail.toLowerCase().trim();
    if (!email || !email.includes('@')) return;
    
    const list = type === 'staff' ? (shopConfig.staffEmails || []) : (shopConfig.familyEmails || []);
    if (!list.includes(email)) {
      onUpdateAccess(type, [...list, email]);
      setNewEmail('');
    }
  };

  const handleRemoveAccess = (type: 'staff' | 'family', email: string) => {
    const list = type === 'staff' ? (shopConfig.staffEmails || []) : (shopConfig.familyEmails || []);
    onUpdateAccess(type, list.filter(e => e !== email));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isOnline = (email: string) => {
    const presence = shopConfig.staffPresence?.[email];
    if (!presence) return false;
    const twoMinutesAgo = Date.now() - 120000;
    return presence.lastActive > twoMinutesAgo;
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter leading-none ${textColor}`}>
            Account
          </h2>
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">Profile & Settings</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${
          user.role === 'owner' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
          user.role === 'family' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {user.role} Terminal
        </div>
      </div>

      {/* Identity Card */}
      <div className={`p-8 rounded-[3rem] border-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-900/5'}`}>
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl shrink-0 bg-blue-50">
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-2xl active:scale-90 ring-4 ring-white dark:ring-zinc-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>
          <div className="overflow-hidden">
            <h3 className={`text-2xl font-black truncate tracking-tight ${textColor}`}>{user.name}</h3>
            <p className={`text-[11px] font-bold truncate opacity-60 uppercase tracking-widest ${textColor}`}>{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-5 rounded-3xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Store Active</p>
            <p className={`font-black text-sm truncate ${textColor}`}>{shopConfig.shopName || 'Setup Pending'}</p>
          </div>
          <div className={`p-5 rounded-3xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Currency</p>
            <p className={`font-black text-sm truncate ${textColor}`}>{user.displayCurrency || 'Native (Default)'}</p>
          </div>
        </div>
      </div>

      {/* Access Management Section (Owners Only) */}
      {isOwner && (
        <div className="space-y-4">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ml-2 ${labelColor}`}>Business Access</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowAccessManager('staff')}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm hover:border-blue-400'}`}
            >
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className={`font-black text-xs ${textColor}`}>Manage Staff</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{(shopConfig.staffEmails || []).length} Members</p>
            </button>
            <button 
              onClick={() => setShowAccessManager('family')}
              className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm hover:border-purple-400'}`}
            >
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <p className={`font-black text-xs ${textColor}`}>Family Access</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{(shopConfig.familyEmails || []).length} Shared</p>
            </button>
          </div>
        </div>
      )}

      {/* Main Settings List */}
      <div className="space-y-3">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ml-2 ${labelColor}`}>App Preferences</h3>
        
        <div className={`p-6 rounded-3xl border-2 flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-zinc-800 text-yellow-500' : 'bg-slate-50 text-slate-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707-.707M7.757 7.757l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            </div>
            <div>
              <p className={`font-black text-sm ${textColor}`}>Dark Mode</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{theme} vision</p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`w-16 h-9 rounded-full p-1.5 transition-all ${isDark ? 'bg-blue-600' : 'bg-slate-200 shadow-inner'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        <button 
          onClick={onSwitchShop}
          className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
            <div className="text-left">
              <p className={`font-black text-sm ${textColor}`}>Switch Business</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Store Gateway</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>

        <button 
          onClick={onLogout}
          className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-red-500 uppercase tracking-widest">Sign Out</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Terminating session</p>
            </div>
          </div>
        </button>
      </div>

      {/* Access Manager Modal */}
      {showAccessManager && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className={`w-full max-w-md rounded-t-[3.5rem] p-10 animate-slide-up max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-zinc-950 border-t border-zinc-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className={`text-3xl font-black tracking-tighter ${textColor}`}>
                  {showAccessManager === 'staff' ? 'Staff Roster' : 'Family Access'}
                </h2>
                <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-1">Manage Permissions</p>
              </div>
              <button onClick={() => setShowAccessManager(null)} className="p-3.5 rounded-full bg-slate-100 dark:bg-zinc-800">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4 mb-10">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Invite via email..." 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-7 py-5 rounded-2xl border-2 transition-all font-black text-sm ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                />
                <button 
                  onClick={() => handleAddAccess(showAccessManager)}
                  className="absolute right-3 top-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase shadow-lg shadow-blue-500/30"
                >
                  Invite
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {(showAccessManager === 'staff' ? shopConfig.staffEmails : shopConfig.familyEmails)?.map(email => (
                <div key={email} className={`p-5 rounded-3xl border-2 flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-zinc-800 flex items-center justify-center text-blue-600 font-black uppercase shadow-inner">
                        {email[0]}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm ${isOnline(email) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-sm font-black truncate ${textColor}`}>{email}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isOnline(email) ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {isOnline(email) ? 'Online Now' : 'Last seen: ' + (shopConfig.staffPresence?.[email] ? new Date(shopConfig.staffPresence[email].lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveAccess(showAccessManager, email)}
                    className="p-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {((showAccessManager === 'staff' ? shopConfig.staffEmails : shopConfig.familyEmails) || []).length === 0 && (
                <div className="py-16 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No members added</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowAccessManager(null)} 
              className="mt-8 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl"
            >
              Confirm Roster
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default AccountTab;
