
import React, { useState, useMemo } from 'react';
import { Sale, Theme, DaySummary, UserRole, StaffStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface PublicTabProps {
  shopName: string;
  brandName: string;
  sales: Sale[];
  history: DaySummary[];
  theme: Theme;
  currency: string;
  formatPrice: (amount: number) => string;
  onEndDay: () => void;
  userRole: UserRole;
  staffPresence?: Record<string, StaffStatus>;
}

type ReportRange = 'day' | 'week' | 'month';

const PublicTab: React.FC<PublicTabProps> = ({ 
  shopName, brandName, sales, history, theme, currency, formatPrice, onEndDay, userRole, staffPresence 
}) => {
  const [reportRange, setReportRange] = useState<ReportRange>('day');
  const [showHistory, setShowHistory] = useState(false);

  const isDark = theme === Theme.DARK;
  // Forced deep black for clear readability in light mode
  const textColor = isDark ? 'text-white' : 'text-slate-950'; 
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-600';

  const chartData = useMemo(() => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    const filtered = sales.filter(s => {
      if (reportRange === 'day') return now - s.timestamp < dayInMs;
      if (reportRange === 'week') return now - s.timestamp < dayInMs * 7;
      if (reportRange === 'month') return now - s.timestamp < dayInMs * 30;
      return true;
    });

    if (reportRange === 'day') {
      const items: Record<string, number> = {};
      filtered.forEach(s => {
        items[s.itemName] = (items[s.itemName] || 0) + s.amount;
      });
      return Object.entries(items).map(([name, value]) => ({ name, value })).slice(0, 8);
    } else {
      const days: Record<string, number> = {};
      filtered.forEach(s => {
        const dateStr = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        days[dateStr] = (days[dateStr] || 0) + s.amount;
      });
      return Object.entries(days).map(([name, value]) => ({ name, value }));
    }
  }, [sales, reportRange]);

  const totalRangeRevenue = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Revenue Card */}
      <div className="p-8 rounded-[2.5rem] text-white shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-90">{brandName}</p>
          <h1 className="text-3xl font-black leading-tight mb-8 truncate">{shopName}</h1>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Live Revenue ({reportRange})</p>
              <span className="text-4xl font-black tabular-nums tracking-tighter">{formatPrice(totalRangeRevenue)}</span>
            </div>
            {userRole === 'owner' && (
              <button 
                onClick={onEndDay}
                className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                End Day
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Graphical Report Section */}
      <div className={`p-6 rounded-[2.5rem] border-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl shadow-blue-500/5'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className={`font-black text-sm uppercase tracking-widest ${textColor}`}>Sales Performance</h3>
            <p className={`text-[10px] font-bold ${labelColor}`}>Tracking store performance data</p>
          </div>
          <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-2xl w-full sm:w-auto">
            {(['day', 'week', 'month'] as ReportRange[]).map(r => (
              <button 
                key={r} 
                onClick={() => setReportRange(r)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${reportRange === r ? 'bg-blue-600 text-white shadow-lg' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDark ? '#a1a1aa' : '#475569', fontSize: 10, fontWeight: 800 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: isDark ? '#27272a' : '#f1f5f9', radius: 8 }} 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#18181b' : '#0f172a',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 900 }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={reportRange === 'day' ? 35 : 25}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">No sales data recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Insight Section - "Chat" interpretation */}
      <div className={`p-6 rounded-[2.5rem] border-2 border-dashed ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50/50'}`}>
         <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
               <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${textColor}`}>Daily Insight</h4>
               <p className={`text-xs leading-relaxed ${labelColor}`}>
                  {totalRangeRevenue > 0 
                    ? `Great job! Your store has generated ${formatPrice(totalRangeRevenue)} in revenue during this ${reportRange}. Keep monitoring your top performers.`
                    : "Welcome to your dashboard. Start adding sales in the Management tab to see your growth here."}
               </p>
            </div>
         </div>
      </div>

      {/* History Button */}
      <button 
        onClick={() => setShowHistory(true)}
        className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <div className="text-left">
            <p className={`font-black text-sm ${textColor}`}>Business Archives</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{history.length} days archived</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </div>
      </button>

      {/* Archives Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-end justify-center p-4">
          <div className={`w-full max-w-md rounded-t-[3.5rem] p-10 animate-slide-up max-h-[85vh] overflow-hidden flex flex-col ${isDark ? 'bg-zinc-950 border-t border-zinc-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-10">
              <h2 className={`text-3xl font-black tracking-tighter ${textColor}`}>Archives</h2>
              <button onClick={() => setShowHistory(false)} className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.map(record => (
                <div key={record.id} className={`p-6 rounded-3xl border-2 flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1`}>{new Date(record.date).toDateString()}</p>
                    <p className={`text-sm font-bold ${labelColor}`}>{record.totalSales} total orders</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-500 tracking-tighter">{formatPrice(record.totalRevenue)}</span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-20">No archived history</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowHistory(false)} className="mt-8 w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl">Close Archives</button>
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

export default PublicTab;
