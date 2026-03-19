import React, { useState, useRef } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { Building2, Wallet, Info, ChevronDown } from 'lucide-react';
import { formatUnit } from '../../../utils/format';

export function EPFCard() {
  const { epfInput, setEpfInput, dashboardData, isProMode, masterHorizon } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);
  
  // Robust Tooltip State Management
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeout = useRef(null);

  const handleMouseEnter = () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setShowTooltip(true);
  };

  const handleMouseLeave = () => {
      hideTimeout.current = setTimeout(() => setShowTooltip(false), 300); // 300ms grace period
  };

  const update = (field, val) => setEpfInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.epfSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  // Rendered at the root of the card to escape clipping
  const GrossSalaryTooltip = (
    <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="absolute right-4 top-24 sm:top-20 w-72 p-4 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-[100] leading-relaxed border border-slate-600 animate-in fade-in zoom-in-95 duration-200"
    >
        <strong className="text-brand-blue text-xs block mb-2">Calculating Taxable Gross Salary:</strong>
        <div className="space-y-1.5 mb-3 bg-slate-900/50 p-2 rounded-lg">
            <p className="opacity-80">Start: Total Fixed CTC (Ignore Variable)</p>
            <p className="text-red-300">- Minus: Notional Benefits (Insurance, Gratuity)</p>
            <p className="text-red-300">- Minus: Employer's EPF (Usually 12% of Basic)</p>
            <div className="border-t border-white/20 my-1"></div>
            <p className="font-bold text-green-300 text-xs">= GROSS SALARY (Enter This)</p>
        </div>
        <p className="italic opacity-70 mt-2 text-[9px]">
            * Note: We ask for the salary after the Employer's EPF is removed because it is technically not part of your taxable monthly paycheck. We will add the Employer's share back into your Net Worth automatically. Exclusion of variables might result in incorrect tax calculations.
        </p>
    </div>
  );

  // --- PRO MODE RENDER ---
  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out relative z-10 hover:z-50">
      {showTooltip && isOpen && GrossSalaryTooltip}

      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#eab308]/10 rounded-lg text-[#eab308] shrink-0">
              <Building2 size={20} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Provident Fund</h3>
              {!isOpen && (
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-wide">
                  {formatUnit(epfInput.salary)} • {epfInput.rate}%
                </span>
              )}
          </div>
        </div>
        <div className="p-1 shrink-0">
          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            <div className="space-y-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                      <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                  Monthly Gross Salary
                              </label>
                              <Info 
                                  size={14} 
                                  className="text-slate-400 cursor-help" 
                                  onMouseEnter={handleMouseEnter}
                                  onMouseLeave={handleMouseLeave}
                                  onClick={() => setShowTooltip(!showTooltip)}
                              />
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
                  <InputGroup label="Horizon (Yrs)" value={epfInput.horizon} onChange={(v) => update('horizon', v)} min={1} max={masterHorizon} />
                </div>
            </div>

            <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
              <ResultRow label="Projected Corpus" value={totalValue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}