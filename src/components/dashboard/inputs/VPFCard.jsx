import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { LibraryBig } from 'lucide-react';

export function VPFCard() {
  const { vpfInput, setVpfInput, isProMode, dashboardData, masterHorizon } = useFinancialData();

  if (!isProMode) return null;

  const update = (field, val) => setVpfInput(prev => ({ ...prev, [field]: val }));

  // --- 1. GET DISPLAY DATA ---
  const series = dashboardData.vpfSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  return (
    <div className="glass-card p-6 flex flex-col h-full border-brand-green/30 shadow-brand-green/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
            <LibraryBig size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Voluntary PF</h3>
      </div>

      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <InputGroup label="Monthly VPF (₹)" value={vpfInput.amount} onChange={(v) => update('amount', v)} isCurrency />
            </div>
            <InputGroup label="Step-up (%)" value={vpfInput.stepUp} onChange={(v) => update('stepUp', v)} />
            <InputGroup 
                label="Horizon (Yrs)" 
                value={vpfInput.horizon} 
                onChange={(v) => update('horizon', v)} 
                min={1} 
                max={masterHorizon} 
            />
        </div>
      </div>

      <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
          <ResultRow label="VPF Corpus" value={totalValue} />
      </div>
    </div>
  );
}