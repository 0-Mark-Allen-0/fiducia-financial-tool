import { useState, useMemo, useEffect } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { TrendingDown, ArrowDownRight } from 'lucide-react';

export function InflationCard() {
  const { dashboardData, setSwpInput } = useFinancialData();
  
  // Local state for this independent calculator
  const [corpus, setCorpus] = useState(10000000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(15);

  // Calculate Real Value
  const realValue = useMemo(() => {
    return corpus / Math.pow(1 + (rate / 100), years);
  }, [corpus, rate, years]);

  // Handler: Pull Global Net Worth
  const handleUseNetWorth = () => {
    setCorpus(Math.round(dashboardData.summary.total));
  };

  // Handler: Push Result to SWP Card (The "Use I-A Worth" logic)
  // We utilize the Context's setSwpInput to update the sibling component
  const pushToSWP = () => {
    setSwpInput(prev => ({ ...prev, corpus: Math.round(realValue) }));
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full border-brand-danger/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-danger/10 rounded-lg text-brand-danger">
                <TrendingDown size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Inflation Reality</h3>
        </div>
        <button 
            onClick={handleUseNetWorth}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
            Use Net Worth
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
                className="flex items-center gap-1 text-xs text-brand-danger font-semibold hover:underline"
                title="Send this value to the SWP Calculator"
            >
                Use This <ArrowDownRight size={14} />
            </button>
        </div>
      </div>
    </div>
  );
}