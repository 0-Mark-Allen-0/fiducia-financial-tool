import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { TrendingDown, ArrowDownRight, ChevronDown } from 'lucide-react';
import { formatUnit } from '../../../utils/format';

export function InflationCard() {
  const { dashboardData, setSwpInput } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);
  
  const [corpus, setCorpus] = useState(10000000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(15);

  const realValue = useMemo(() => {
    return corpus / Math.pow(1 + (rate / 100), years);
  }, [corpus, rate, years]);

  const handleUseNetWorth = () => {
    setCorpus(Math.round(dashboardData.summary.total));
  };

  const pushToSWP = () => {
    setSwpInput(prev => ({ ...prev, corpus: Math.round(realValue) }));
  };

  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out border-brand-danger/20 shadow-brand-danger/5">
      
      {/* HEADER */}
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-danger/10 rounded-lg text-brand-danger shrink-0">
                <TrendingDown size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Inflation Reality</h3>
                {!isOpen && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                    {formatUnit(corpus)} • {years} yrs
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
            
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleUseNetWorth}
                    className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Pull Current Net Worth
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
                <InputGroup label="Projected Corpus (₹)" value={corpus} onChange={setCorpus} isCurrency />
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Inflation Rate (%)" value={rate} onChange={setRate} step="0.1" />
                    <InputGroup label="Horizon (Yrs)" value={years} onChange={setYears} />
                </div>
            </div>

            <div className="mt-auto bg-brand-danger/5 p-4 rounded-xl border border-brand-danger/10">
                <ResultRow label="Future Value" value={corpus} />
                <div className="my-2 border-t border-brand-danger/10"></div>
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-xs text-brand-danger uppercase font-bold tracking-wider">Purchasing Power</span>
                        <div className="text-2xl font-bold text-brand-danger">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(realValue)}
                        </div>
                    </div>
                    <button 
                        onClick={pushToSWP}
                        className="flex items-center gap-1 text-xs text-brand-danger font-semibold hover:bg-brand-danger/10 px-2 py-1 rounded transition-colors"
                        title="Send this value to the SWP Calculator"
                    >
                        Use This <ArrowDownRight size={14} />
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}