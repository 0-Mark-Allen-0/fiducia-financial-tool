import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { Users, Info, ChevronDown } from 'lucide-react';
import { InputGroup } from '../../shared/InputGroup';

export function SpouseCard() {
  const { 
    isSpouseEnabled, setIsSpouseEnabled, 
    spousalMultiplier, setSpousalMultiplier, 
    spousalStartYear, setSpousalStartYear,
    masterHorizon
  } = useFinancialData();
  
  const [isOpen, setIsOpen] = useState(false);

  const getSpouseIncomeText = () => {
      const percentage = Math.round((spousalMultiplier - 1) * 100);
      if (percentage === 100) return "Spouse earns the exact same as you.";
      return `Spouse earns ${percentage}% of your income.`;
  };

  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out border-brand-purple/20 shadow-xl shadow-brand-purple/5">
      
      {/* HEADER (Always Visible) */}
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors shrink-0 ${isSpouseEnabled ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Users size={20} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Spousal Multiplier</h3>
                {!isOpen && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${isSpouseEnabled ? 'bg-brand-purple/10 text-brand-purple' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                    {isSpouseEnabled ? `${spousalMultiplier}x • Starts Yr ${spousalStartYear}` : 'Disabled'}
                  </span>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
            {/* Toggle Switch (Prevent triggering accordion click) */}
            <div onClick={(e) => e.stopPropagation()}>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isSpouseEnabled}
                        onChange={(e) => setIsSpouseEnabled(e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-brand-purple"></div>
                </label>
            </div>
            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* FLUID ACCORDION ANIMATION */}
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col pt-2 border-t border-black/5 dark:border-white/5 mt-2">
            
            {isSpouseEnabled ? (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex justify-between mb-1.5">
                                Multiplier <span className="text-brand-purple">{spousalMultiplier}x</span>
                            </label>
                            <input 
                                type="range" 
                                min="1.1" max="3.0" step="0.1"
                                value={spousalMultiplier}
                                onChange={(e) => setSpousalMultiplier(parseFloat(e.target.value))}
                                className="w-full accent-brand-purple"
                            />
                            <p className="text-[10px] text-slate-500 mt-2 font-medium">
                                {getSpouseIncomeText()}
                            </p>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <InputGroup 
                                label="Start Year" 
                                value={spousalStartYear} 
                                onChange={setSpousalStartYear} 
                                min={1} max={masterHorizon} 
                            />
                            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                                Year your spouse begins contributing.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex gap-2 items-start mt-2">
                        <Info size={16} className="text-brand-purple mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Smart Scaling:</strong> This multiplier scales your Salary, SIPs, Savings, and EPF. Our engine perfectly isolates your taxes, ensuring you aren't unfairly penalized!
                        </p>
                    </div>
                </>
            ) : (
                <p className="text-sm text-slate-500 text-center py-4 italic">
                    Enable the toggle above to simulate a dual-income household.
                </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}