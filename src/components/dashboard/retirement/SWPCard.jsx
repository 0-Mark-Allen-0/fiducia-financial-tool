import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { formatCurrency, formatUnit } from '../../../utils/format';
import { Coins, ChevronDown } from 'lucide-react';

export function SWPCard() {
  const { swpInput, setSwpInput, isProMode } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  const update = (field, val) => setSwpInput(prev => ({ ...prev, [field]: val }));

  const getMonthlyPreview = () => {
    if (swpInput.method === 'fixed') return swpInput.val;
    return (swpInput.corpus * (swpInput.val / 100)) / 12;
  };

  const getSummaryText = () => {
      const mode = swpInput.method === 'swr' ? `${swpInput.val}% SWR` : `${formatUnit(swpInput.val)}/mo`;
      return `${formatUnit(swpInput.corpus)} • ${mode}`;
  };

  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out border-brand-orange/20 shadow-brand-orange/5">
      
      {/* HEADER */}
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0">
                <Coins size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Systematic Withdrawal</h3>
                {!isOpen && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                    {getSummaryText()}
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
            
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <InputGroup 
                        label="Retirement Corpus (₹)" 
                        value={swpInput.corpus} 
                        onChange={(v) => update('corpus', v)} 
                        isCurrency 
                    />
                </div>

                <InputGroup label="Return (%)" value={swpInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
                <InputGroup label="Inflation (%)" value={swpInput.inflation} onChange={(v) => update('inflation', v)} step="0.1" />
                
                <div className="col-span-2">
                    <InputGroup 
                        label="Withdrawal Duration (Yrs)" 
                        value={swpInput.horizon} 
                        onChange={(v) => update('horizon', v)} 
                    />
                </div>
                
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Withdrawal Strategy
                    </label>
                    <select 
                        value={swpInput.method}
                        onChange={(e) => update('method', e.target.value)}
                        className="input-field mt-1"
                    >
                        <option value="swr">Safe Withdrawal Rate (%)</option>
                        <option value="fixed">Fixed Monthly Amount (₹)</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <InputGroup 
                        label={swpInput.method === 'swr' ? "Withdrawal Rate (%)" : "Monthly Amount (₹)"}
                        value={swpInput.val}
                        onChange={(v) => update('val', v)}
                        step={swpInput.method === 'swr' ? "0.1" : "1000"}
                        isCurrency={swpInput.method === 'fixed'}
                    />
                    {swpInput.method === 'swr' && (
                        <p className="text-right text-xs font-semibold text-brand-green mt-1">
                            ≈ {formatCurrency(getMonthlyPreview())} / month
                        </p>
                    )}
                </div>

                {/* PRO MODE ONLY: Tax Estimation Inputs */}
                {isProMode && (
                    <>
                        <InputGroup 
                            label="Profit Ratio (%)" 
                            value={swpInput.gainProp} 
                            onChange={(v) => update('gainProp', v)} 
                            tooltip="% of your corpus that is pure profit (interest/gains)"
                        />
                        <InputGroup 
                            label="LTCG Tax (%)" 
                            value={swpInput.ltcg} 
                            onChange={(v) => update('ltcg', v)} 
                            step="0.1"
                        />
                    </>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}