import React from 'react';
import { Activity } from 'lucide-react';
import { BanknoteArrowDown } from 'lucide-react';

export function MontiqHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl font-sans">
      <div className="w-full max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
            <BanknoteArrowDown size={30} />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Montiq</h1>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand-orange text-white rounded leading-none">
                  Beta
              </span>
            </div>
            <span className="text-[10px] font-bold text-brand-green uppercase leading-none">v1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}