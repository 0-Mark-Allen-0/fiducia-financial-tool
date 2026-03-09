import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { Landmark, CornerDownRight } from 'lucide-react';

export function SavingsCard() {
  const { savInput, setSavInput, dashboardData, isProMode, vpfInput } = useFinancialData();

  const update = (field, val) => setSavInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.savSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  // Check if receiving funds
  const isReceiving = isProMode && vpfInput.strategy === 'save';

  return (
    <div className={`glass-card p-6 flex flex-col h-full transition-all duration-300 ${isReceiving ? 'ring-2 ring-brand-purple/30 shadow-brand-purple/10' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                <Landmark size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Savings / FD</h3>
        </div>

        {/* Connected Badge */}
        {isReceiving && (
            <span className="text-[10px] font-bold text-brand-purple flex items-center gap-1 bg-brand-purple/5 px-2 py-1 rounded-full animate-pulse">
                <CornerDownRight size={12} /> EPF Overflow
            </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
            <InputGroup label="Monthly Save (₹)" value={savInput.amount} onChange={(v) => update('amount', v)} isCurrency />
        </div>
        <InputGroup label="Step-up (%)" value={savInput.stepUp} onChange={(v) => update('stepUp', v)} />
        <InputGroup label="Return (%)" value={savInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
        <InputGroup label="Horizon (Yrs)" value={savInput.horizon} onChange={(v) => update('horizon', v)} />
      </div>

      <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
        <ResultRow label="Final Value" value={totalValue} />
        {isReceiving && (
             <p className="text-[10px] text-brand-purple mt-2 text-center opacity-80">
                * Includes diverted funds from VPF/EPF overflow
             </p>
        )}
      </div>
    </div>
  );
}