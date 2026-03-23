import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { Landmark, CornerDownRight, ChevronDown } from 'lucide-react';
import { formatUnit, formatCurrency } from '../../../utils/format';

export function SavingsCard() {
  const { savInput, setSavInput, dashboardData, isProMode, vpfInput, masterHorizon, savingsTaxSplit, setSavingsTaxSplit } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  const update = (field, val) => setSavInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.savSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;
  const taxDrag = finalData.taxDragNominal || 0; // NEW: Plucked from the engine

  const isReceiving = isProMode && vpfInput.strategy === 'save';

  return (
    <div className={`glass-card flex flex-col h-fit transition-all duration-300 ease-out ${isReceiving ? 'ring-2 ring-brand-purple/30 shadow-brand-purple/10' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple shrink-0">
                <Landmark size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Savings</h3>
                {isReceiving && !isOpen && (
                  <span className="text-[9px] font-bold text-brand-purple flex items-center gap-1 bg-brand-purple/5 px-2 py-0.5 rounded-full animate-pulse">
                      + Overflow
                  </span>
                )}
                {!isOpen && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                    {formatUnit(savInput.amount)} • {savInput.returnRate}%
                  </span>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
           {isReceiving && isOpen && (
             <span className="text-[10px] font-bold text-brand-purple hidden sm:flex items-center gap-1 bg-brand-purple/5 px-2 py-1 rounded-full animate-pulse">
                 <CornerDownRight size={12} /> EPF Overflow
             </span>
           )}
           <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            
            {/* ROW 1 & ROW 2: Redesigned grid layout */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InputGroup label="Monthly Save (₹)" value={savInput.amount} onChange={(v) => update('amount', v)} isCurrency />
              <InputGroup label="Step-up (%)" value={savInput.stepUp} onChange={(v) => update('stepUp', v)} />
              
              <InputGroup label="Return (%)" value={savInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
              <InputGroup label="Horizon (Yrs)" value={savInput.horizon} onChange={(v) => update('horizon', v)} min={1} max={masterHorizon} />
            </div>

            {/* ROW 3: Arbitrage / Tax Split Slider */}
            {isProMode && (
                <div className="mb-6 animate-in fade-in duration-500">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-3">
                        Tax Optimization Split
                    </label>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Arbitrage ({savingsTaxSplit}%)</span>
                            <span className="text-slate-300">FDs ({100 - savingsTaxSplit}%)</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={savingsTaxSplit} 
                            onChange={(e) => setSavingsTaxSplit(Number(e.target.value))} 
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-brand-purple" 
                        />
                    </div>
                </div>
            )}

            {/* RESULT ROW */}
            <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
              <ResultRow label="Final Value" value={totalValue} />
              
              {/* Render the massive Tax Drag penalty if in Pro Mode */}
              {isProMode && taxDrag > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-white/10 flex justify-between text-sm">
                    <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
                      Lost to Taxation:
                    </span>
                    <span className="text-brand-danger font-bold text-xs opacity-90">
                      {formatCurrency(taxDrag)}
                    </span>
                </div>
              )}

              {isReceiving && (
                  <p className="text-[10px] text-brand-purple mt-2 text-center opacity-80">
                      * Includes diverted funds from VPF/EPF overflow
                  </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}