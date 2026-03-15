import React from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { Users, Info } from 'lucide-react';
import { InputGroup } from '../../shared/InputGroup';

export function SpouseCard() {
  const { 
    isSpouseEnabled, setIsSpouseEnabled, 
    spousalMultiplier, setSpousalMultiplier, 
    spousalStartYear, setSpousalStartYear,
    masterHorizon
  } = useFinancialData();

  const getSpouseIncomeText = () => {
      const percentage = Math.round((spousalMultiplier - 1) * 100);
      if (percentage === 100) return "Spouse earns the exact same as you.";
      return `Spouse earns ${percentage}% of your income.`;
  };

  return (
    <div className="glass-card p-6 flex flex-col w-full border-slate-200 dark:border-white/10 shadow-xl mb-6 transition-all duration-300">
      
      {/* HEADER & TOGGLE */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isSpouseEnabled ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Users size={20} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Spousal Multiplier</h3>
                <p className="text-xs text-slate-500">Simulate a dual-income household.</p>
            </div>
        </div>
        
        {/* Modern Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isSpouseEnabled}
                onChange={(e) => setIsSpouseEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-purple"></div>
        </label>
      </div>

      {/* EXPANDABLE CONTROLS */}
      {isSpouseEnabled && (
        <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
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
                        The year your spouse begins contributing to the portfolio.
                    </p>
                </div>
            </div>

            {/* Information Alert */}
            <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex gap-2 items-start">
                <Info size={16} className="text-brand-purple mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Smart Scaling:</strong> This multiplier scales your Salary, SIPs, Savings, and EPF. Our engine perfectly isolates your taxes, ensuring you aren't unfairly penalized!
                </p>
            </div>
        </div>
      )}
    </div>
  );
}