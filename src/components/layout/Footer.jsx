import React from 'react';
import { Gem, CirclePoundSterling } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialContext';

export function Footer() {
  const { isProMode } = useFinancialData();

  return (
    <footer className="w-full mt-auto border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-default mb-1">
            
            {/* Dynamic Logo matching the Header */}
            <div className={`p-1.5 rounded-xl transition-colors ${isProMode ? 'bg-brand-purple/20 text-brand-orange' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {isProMode ? <Gem size={18} /> : <CirclePoundSterling size={18} />}
            </div>
            
            <span className="font-bold text-slate-800 dark:text-white tracking-wide">Fiducia</span>
            
            {/* Dynamic Version Tag */}
            <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full transition-colors ${isProMode ? 'text-brand-orange border-brand-orange/30' : 'text-brand-blue border-brand-blue/30'}`}>
              v2.0
            </span>
            
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sovereign Wealth Planning Engine
          </p>
        </div>

        {/* Right: Info & Copyright */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center md:text-right flex flex-col items-center md:items-end gap-1">
          <p>Built for precision, compounding, and long-term financial clarity.</p>
          <p className="opacity-70">&copy; {new Date().getFullYear()} Fiducia. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}