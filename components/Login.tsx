
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';

interface LoginProps {
  onLogin: (user: User) => void;
}

interface SavedAccount extends User {
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [error, setError] = useState('');

  const getAccounts = (): SavedAccount[] => {
    try {
      const saved = localStorage.getItem('sm_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse accounts", e);
      return [];
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (!isLoginMode && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    
    setIsLoading(true);

    setTimeout(() => {
      const accounts = getAccounts();
      const normalizedEmail = email.toLowerCase().trim();

      if (isLoginMode) {
        const account = accounts.find(a => a.email === normalizedEmail && a.password === password);
        if (account) {
          const { password: _, ...userWithoutPassword } = account;
          onLogin(userWithoutPassword as User);
        } else {
          setError("Incorrect email or password. Please try again.");
          setIsLoading(false);
        }
      } else {
        if (accounts.some(a => a.email === normalizedEmail)) {
          setError("An account with this email already exists.");
          setIsLoading(false);
          return;
        }

        const newUser: SavedAccount = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          email: normalizedEmail,
          password: password,
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          role: selectedRole,
        };

        const updatedAccounts = [...accounts, newUser];
        localStorage.setItem('sm_accounts', JSON.stringify(updatedAccounts));
        
        const { password: _, ...userWithoutPassword } = newUser;
        onLogin(userWithoutPassword as User);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-600 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">
            {isLoginMode ? 'Store Login' : 'Register Store'}
          </h1>
          <p className="text-blue-600 font-bold text-[10px] mt-2 uppercase tracking-[0.3em] text-center">
            {isLoginMode ? 'Manage your business profile' : 'Start your storefront'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
          <button 
            type="button"
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-xs font-black text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLoginMode && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Account Role</label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                  {(['owner', 'staff', 'family'] as UserRole[]).map((r) => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        selectedRole === r ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-black text-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Email ID</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-black text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Secure Password</label>
              <input 
                type="password" 
                placeholder="Enter password"
                className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none font-black text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl disabled:opacity-70 mt-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-[13px] font-black uppercase tracking-[0.2em]">
                {isLoginMode ? 'Sign In Now' : 'Create Account'}
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-relaxed">
            Secured by ShopMaster Vault<br/>v2.0 Enterprise Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
