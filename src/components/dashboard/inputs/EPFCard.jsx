import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { Building2, Wallet, Info } from 'lucide-react';
import { formatUnit } from '../../../utils/format';

export function EPFCard() {
  // NEW: Extracted masterHorizon from context
  const { epfInput, setEpfInput, dashboardData, isProMode, masterHorizon } = useFinancialData();

  const update = (field, val) => setEpfInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.epfSeries || [];
  // Final data is taken at the end of the Master Horizon
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  // --- REUSABLE TOOLTIP COMPONENT ---
  const GrossSalaryTooltip = (
    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl hidden group-hover:block z-50 leading-relaxed border border-slate-600">
        <strong className="text-brand-blue block mb-1">Convert CTC to Gross:</strong>
        <div className="space-y-1 mb-2">
            <p className="opacity-80">Start: Monthly Fixed Pay (CTC / 12)</p>
            <p className="text-red-300">- Employer PF (12% of Basic)</p>
            <p className="text-red-300">- Gratuity (If not notional)</p>
            <div className="border-t border-white/20 my-1"></div>
            <p className="font-bold text-green-300">= GROSS SALARY (Enter This)</p>
        </div>
        <p className="italic opacity-70 mt-2">
            * We remove Gratuity/Employer PF here because they are not part of your monthly paycheck.
        </p>
    </div>
  );

  // --- SIMPLE MODE RENDER ---
  if (!isProMode) {
    return (
      <div className="glass-card p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-900 dark:text-white">
              <Wallet size={20} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Income Details</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
              <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Monthly Gross Salary
                    </label>
                    <div className="group relative">
                        <Info size={14} className="text-slate-400 cursor-help" />
                        {GrossSalaryTooltip}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={epfInput.salary}
                    onChange={(e) => update('salary', parseFloat(e.target.value) || 0)}
                    className="input-field font-medium"
                  />
                  <span className="text-[10px] font-medium text-brand-blue dark:text-brand-green h-3 block">
                      {epfInput.salary > 0 ? `(${formatUnit(epfInput.salary)})` : ''}
                  </span>
              </div>
          </div>
          
          <InputGroup label="Annual Hike (%)" value={epfInput.hike} onChange={(v) => update('hike', v)} />
          {/* NEW: Passed min and max guardrails */}
          <InputGroup 
            label="Horizon (Yrs)" 
            value={epfInput.horizon} 
            onChange={(v) => update('horizon', v)} 
            min={1} 
            max={masterHorizon} 
          />
        </div>

        <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
           <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Cash Flow Logic</p>
           <ul className="text-[10px] text-slate-500 space-y-1">
             <li className="flex gap-2">
                <span className="text-red-500 font-bold">- 12%</span> 
                <span>Employee Share (We deduct this)</span>
             </li>
             <li className="flex gap-2">
                <span className="text-green-500 font-bold">+ 12%</span> 
                <span>Employer Share (Added to Corpus)</span>
             </li>
           </ul>
        </div>
      </div>
    );
  }

  // --- PRO MODE RENDER ---
  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
            <Building2 size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Provident Fund</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
            {/* Manual Input Block with Tooltip for Pro Mode */}
            <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Monthly Gross Salary
                    </label>
                    <div className="group relative">
                        <Info size={14} className="text-slate-400 cursor-help" />
                        {GrossSalaryTooltip}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={epfInput.salary}
                    onChange={(e) => update('salary', parseFloat(e.target.value) || 0)}
                    className="input-field font-medium"
                  />
                  <span className="text-[10px] font-medium text-brand-blue dark:text-brand-green h-3 block">
                      {epfInput.salary > 0 ? `(${formatUnit(epfInput.salary)})` : ''}
                  </span>
            </div>
        </div>
        <InputGroup label="Basic Pay (%)" value={epfInput.basicPercent} onChange={(v) => update('basicPercent', v)} />
        <InputGroup label="Hike (%)" value={epfInput.hike} onChange={(v) => update('hike', v)} />
        <InputGroup label="EPF Rate (%)" value={epfInput.rate} onChange={(v) => update('rate', v)} step="0.05" />
        {/* NEW: Passed min and max guardrails */}
        <InputGroup 
            label="Horizon (Yrs)" 
            value={epfInput.horizon} 
            onChange={(v) => update('horizon', v)} 
            min={1} 
            max={masterHorizon} 
        />
      </div>

      <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
        <ResultRow label="Projected Corpus" value={totalValue} />
      </div>
    </div>
  );
}