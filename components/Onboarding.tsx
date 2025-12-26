
import React, { useState } from 'react';
import { BRANDS, COUNTRIES } from '../constants';

interface OnboardingProps {
  onComplete: (shopName: string, brandId: string, country: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState('');
  const [country, setCountry] = useState('');
  const [brandId, setBrandId] = useState('');

  const nextStep = () => {
    if (step === 1 && shopName.trim()) setStep(2);
    else if (step === 2 && country.trim()) setStep(3);
    else if (step === 3 && brandId) onComplete(shopName, brandId, country);
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl my-auto animate-scale-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 text-center">
            {step === 1 ? 'Hello Store Owner' : step === 2 ? 'Select Country' : 'Select Your Partner'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-1">Store Name</label>
              <input
                type="text"
                placeholder="Ex: Main Street Starbucks"
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-semibold text-lg"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-1">Choose Location</label>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCountry(c.name)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    country === c.name 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700' 
                      : 'border-gray-50 hover:border-blue-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-xs font-black bg-white px-3 py-1 rounded-lg border shadow-sm">
                    {c.currency}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-1">Shop Brand</label>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {BRANDS.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setBrandId(brand.id)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    brandId === brand.id 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-50 hover:border-blue-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 border overflow-hidden bg-white shadow-sm ${brandId === brand.id ? 'border-blue-200' : 'border-gray-100'}`}>
                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                  </div>
                  <span className={`font-bold flex-1 ${brandId === brand.id ? 'text-blue-700' : 'text-slate-700'}`}>
                    {brand.name}
                  </span>
                  {brandId === brand.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={nextStep}
          disabled={
            step === 1 ? !shopName.trim() : 
            step === 2 ? !country.trim() : 
            !brandId
          }
          className={`w-full mt-10 py-5 rounded-2xl font-black text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-2xl ${
            (step === 1 ? shopName.trim() : step === 2 ? country.trim() : brandId) 
              ? 'bg-blue-600 shadow-blue-500/40' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{step === 1 ? 'Next: Country' : step === 2 ? 'Next: Choose Brand' : 'Finalize & Start'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Onboarding;
