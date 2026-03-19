import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { WealthChart } from './WealthChart';
import { CashFlowChart } from './CashFlowChart';
import { BarChart3, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

export function ChartSection() {
  const { isProMode } = useFinancialData();
  const [activeChart, setActiveChart] = useState('wealth'); // 'wealth' | 'cashflow'

  return (
    <section id="projections" className="p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeChart === 'wealth' ? (isProMode ? "Asset Composition" : "Wealth Accumulation") : "Cash Flow Anatomy"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeChart === 'wealth' 
              ? (isProMode ? "Visual breakdown of your portfolio's growth over time." : "Projected growth of your total net worth.")
              : "A breakdown of where every rupee of your Gross Salary goes each year."}
          </p>
        </div>

        {/* TOGGLE BUTTONS (Pro Mode Only) */}
        {isProMode && (
          <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-xl w-fit shrink-0">
            <button 
                onClick={() => setActiveChart('wealth')}
                className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeChart === 'wealth' ? "bg-white dark:bg-slate-700 shadow text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
            >
                <TrendingUp size={14} /> Wealth
            </button>
            <button 
                onClick={() => setActiveChart('cashflow')}
                className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeChart === 'cashflow' ? "bg-white dark:bg-slate-700 shadow text-brand-green" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
            >
                <BarChart3 size={14} /> Cash Flow
            </button>
          </div>
        )}
      </div>

      {/* RENDER ACTIVE CHART */}
      <div className="w-full">
         {activeChart === 'wealth' ? <WealthChart /> : <CashFlowChart />}
      </div>
      
    </section>
  );
}