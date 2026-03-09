import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { Building2, Wallet, Info } from 'lucide-react';

export function EPFCard() {
  const { epfInput, setEpfInput, dashboardData, isProMode } = useFinancialData();

  const update = (field, val) => setEpfInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.epfSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

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
              {/* UPDATED LABEL FOR CLARITY */}
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Monthly Gross Salary
                </label>
                <div className="group relative">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl hidden group-hover:block z-50">
                        Enter your Earnings <strong>before</strong> tax/PF deductions. Do not enter CTC.
                    </div>
                </div>
              </div>
              <input
                type="number"
                value={epfInput.salary}
                onChange={(e) => update('salary', parseFloat(e.target.value) || 0)}
                className="input-field"
              />
              <span className="text-[10px] font-medium text-brand-blue dark:text-brand-green h-3 block mt-1">
                  {epfInput.salary > 0 ? `(${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(epfInput.salary)})` : ''}
              </span>
          </div>
          
          <InputGroup label="Annual Hike (%)" value={epfInput.hike} onChange={(v) => update('hike', v)} />
          <InputGroup label="Horizon (Yrs)" value={epfInput.horizon} onChange={(v) => update('horizon', v)} />
        </div>

        <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
           <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Cash Flow Logic</p>
           <ul className="text-[10px] text-slate-500 space-y-1">
             <li className="flex gap-2">
                <span className="text-red-500 font-bold">- 12%</span> 
                <span>Employee Share (Deducted from hand)</span>
             </li>
             <li className="flex gap-2">
                <span className="text-green-500 font-bold">+ 12%</span> 
                <span>Employer Share (Added to Corpus only)</span>
             </li>
           </ul>
        </div>
      </div>
    );
  }

  // --- PRO MODE RENDER (Unchanged logic, just keeping the file complete) ---
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
            <InputGroup label="Monthly Salary (Gross ₹)" value={epfInput.salary} onChange={(v) => update('salary', v)} isCurrency />
        </div>
        <InputGroup label="Basic Pay (%)" value={epfInput.basicPercent} onChange={(v) => update('basicPercent', v)} />
        <InputGroup label="Hike (%)" value={epfInput.hike} onChange={(v) => update('hike', v)} />
        <InputGroup label="EPF Rate (%)" value={epfInput.rate} onChange={(v) => update('rate', v)} step="0.05" />
        <InputGroup label="Horizon (Yrs)" value={epfInput.horizon} onChange={(v) => update('horizon', v)} />
      </div>

      <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
        <ResultRow label="Projected Corpus" value={totalValue} />
      </div>
    </div>
  );
}