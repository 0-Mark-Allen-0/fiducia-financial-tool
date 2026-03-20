import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { TrendingUp, CornerDownRight, ChevronDown } from 'lucide-react';
import { formatUnit } from '../../../utils/format';

export function SIPCard() {
  const { sipInput, setSipInput, dashboardData, isProMode, vpfInput, masterHorizon } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  const update = (field, val) => setSipInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.sipSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;
  
  const totalInvested = series.reduce((acc, curr) => acc + (curr.yearlyNominal || 0), 0);
  const totalGains = totalValue - totalInvested;

  const isReceiving = isProMode && vpfInput.strategy === 'sip';

  return (
    <div className={`glass-card flex flex-col h-fit transition-all duration-300 ease-out ${isReceiving ? 'ring-2 ring-brand-blue/30 shadow-brand-blue/10' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue shrink-0">
                <TrendingUp size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-black dark:text-white leading-none">SIPs</h3>
                {isReceiving && !isOpen && (
                  <span className="text-[9px] font-bold text-brand-blue flex items-center gap-1 bg-brand-blue/5 px-2 py-0.5 rounded-full animate-pulse">
                      + Overflow
                  </span>
                )}
                {!isOpen && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                    {formatUnit(sipInput.amount)} • {sipInput.returnRate}%
                  </span>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
           {isReceiving && isOpen && (
             <span className="text-[10px] font-bold text-brand-blue hidden sm:flex items-center gap-1 bg-brand-blue/5 px-2 py-1 rounded-full animate-pulse">
                 <CornerDownRight size={12} /> EPF Overflow
             </span>
           )}
           <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* FLUID ACCORDION ANIMATION */}
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                  <InputGroup label="Monthly SIP (₹)" value={sipInput.amount} onChange={(v) => update('amount', v)} isCurrency />
              </div>
              <InputGroup label="Step-up (%)" value={sipInput.stepUp} onChange={(v) => update('stepUp', v)} />
              <InputGroup label="Return (%)" value={sipInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
              <InputGroup label="Horizon (Yrs)" value={sipInput.horizon} onChange={(v) => update('horizon', v)} min={1} max={masterHorizon} />
            </div>

            <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
              <ResultRow label="Total Value" value={totalValue} />
              <ResultRow label="Wealth Gained" value={totalGains} isGain />
              
              {isReceiving && (
                  <p className="text-[10px] text-brand-blue mt-2 text-center opacity-80">
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