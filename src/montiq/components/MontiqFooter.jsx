import React from 'react';
import { Activity } from 'lucide-react';

export function MontiqFooter() {
  return (
    <footer className="w-full mt-auto border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-default">
            <Activity size={20} className="text-brand-green" />
            <span className="font-bold text-slate-800 dark:text-white tracking-wide">Montiq</span>
            <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Beta</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Advanced Stochastic Engine
          </p>
        </div>

        {/* Right: Companion Reference & Copyright */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center md:text-right flex flex-col items-center md:items-end gap-1">
          <p>A <span className="text-brand-blue font-bold tracking-wide">Fiducia</span> Product</p>
          <p className="opacity-70">&copy; {new Date().getFullYear()} Montiq [Fiducia].</p>
        </div>

      </div>
    </footer>
  );
}