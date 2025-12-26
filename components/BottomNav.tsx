
import React from 'react';
import { Tab, Theme } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  theme: Theme;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, theme }) => {
  const isDark = theme === Theme.DARK;
  const tabs = [
    { 
      id: Tab.PUBLIC, 
      label: 'Public', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: Tab.INFO, 
      label: 'Management', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    { 
      id: Tab.ACCOUNT, 
      label: 'Account', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-24 border-t-2 flex items-center justify-around px-8 transition-all duration-300 z-50 ${
      isDark 
        ? 'bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl shadow-none' 
        : 'bg-white/95 border-slate-100 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'
    }`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1.5 transition-all group ${
            activeTab === tab.id 
              ? 'text-blue-600 scale-110' 
              // Improved contrast: slate-500 instead of gray-400
              : isDark ? 'text-zinc-600' : 'text-slate-500' 
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            {tab.icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
