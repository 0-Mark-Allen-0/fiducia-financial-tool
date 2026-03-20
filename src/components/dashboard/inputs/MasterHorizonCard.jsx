import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { Clock, ChevronDown } from 'lucide-react';

export function MasterHorizonCard() {
  const { masterHorizon, updateMasterHorizon } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card flex flex-col h-fit transition-all duration-300 ease-out border-brand-blue/30 shadow-[0_4px_20px_rgba(0,122,255,0.08)] ring-1 ring-brand-blue/10">
      
      {/* HEADER (Always Visible) */}
      <div 
        className="flex items-center justify-between cursor-pointer p-5 sm:p-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue shrink-0">
              <Clock size={20} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Master Timeline</h3>
              {!isOpen && (
                <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold tracking-wide">
                  {masterHorizon} Years
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
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Set the global boundary for your simulation. Individual instrument horizons (like SIPs or Savings) will automatically cap at this limit.
            </p>
            
            <div className="flex items-center gap-4 w-full">
              <input 
                type="range" 
                min="1" 
                max="75" 
                value={masterHorizon} 
                onChange={(e) => updateMasterHorizon(e.target.value)}
                className="custom-range flex-grow"
              />
              
              {/* Number Input Bubble */}
              <div className="relative shrink-0">
                <input 
                  type="number"
                  min="1"
                  max="75"
                  value={masterHorizon}
                  onChange={(e) => updateMasterHorizon(e.target.value)}
                  onBlur={(e) => updateMasterHorizon(e.target.value)} 
                  className="input-field w-20 sm:w-22 text-center font-bold text-brand-blue dark:text-brand-blue !py-2 !pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">
                  YRS
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}