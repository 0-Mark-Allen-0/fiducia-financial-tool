import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { LibraryBig, ChevronDown } from 'lucide-react';
import { formatUnit } from '../../../utils/format';

export function VPFCard() {
  const { vpfInput, setVpfInput, isProMode, dashboardData, masterHorizon } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  if (!isProMode) return null;

  const update = (field, val) => setVpfInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.vpfSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out border-brand-green/30 shadow-brand-green/10">
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green shrink-0">
                <LibraryBig size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Voluntary PF</h3>
                {!isOpen && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                    {formatUnit(vpfInput.amount)}
                  </span>
                )}
            </div>
        </div>
        <div className="p-1 shrink-0">
          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* FLUID ACCORDION ANIMATION */}
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            <div className="space-y-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                      <InputGroup label="Monthly VPF (₹)" value={vpfInput.amount} onChange={(v) => update('amount', v)} isCurrency />
                  </div>
                  <InputGroup label="Step-up (%)" value={vpfInput.stepUp} onChange={(v) => update('stepUp', v)} />
                  <InputGroup label="Horizon (Yrs)" value={vpfInput.horizon} onChange={(v) => update('horizon', v)} min={1} max={masterHorizon} />
              </div>
            </div>

            <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
                <ResultRow label="VPF Corpus" value={totalValue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}