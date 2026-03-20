import React from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { ShieldAlert, TrendingUp, Droplets } from 'lucide-react';
import { clsx } from 'clsx';

export function StrategyDeck() {
  const { strategies, setStrategies } = useMontiqData();

  const update = (field, val) => setStrategies(prev => ({ ...prev, [field]: val }));

  // Mutual Exclusion Handlers
  const toggleBucket = () => {
    setStrategies(prev => ({ 
        ...prev, 
        useBucket: !prev.useBucket, 
        useGlidepath: !prev.useBucket ? false : prev.useGlidepath // Turn off glidepath if bucket turns on
    }));
  };

  const toggleGlidepath = () => {
    setStrategies(prev => ({ 
        ...prev, 
        useGlidepath: !prev.useGlidepath, 
        useBucket: !prev.useGlidepath ? false : prev.useBucket // Turn off bucket if glidepath turns on
    }));
  };

  const toggleGuardrails = () => {
    setStrategies(prev => ({ ...prev, useGuardrails: !prev.useGuardrails }));
  };

  return (
    <div className="space-y-6 font-sans w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. BUCKET STRATEGY */}
        <div 
            onClick={toggleBucket}
            className={clsx("p-6 rounded-2xl border transition-all duration-300 cursor-pointer", strategies.useBucket ? "bg-brand-blue/5 border-brand-blue/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]" : "glass-card opacity-80 hover:opacity-100")}
        >
           <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-2 rounded-xl transition-colors", strategies.useBucket ? "bg-brand-blue/20 text-brand-blue" : "bg-slate-100 dark:bg-white/5 text-slate-500")}>
                 <Droplets size={20} />
              </div>
              <div className={clsx("w-4 h-4 rounded-full border-2 transition-colors", strategies.useBucket ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-slate-600")}></div>
           </div>
           <h3 className="font-bold text-slate-800 dark:text-white mb-1">Cash Bucketing</h3>
           <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">Spend from cash during market crashes to give equity time to recover.</p>
           
           {strategies.useBucket && (
             <div className="animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block mb-1">Buffer Size (Years)</label>
                <input type="number" min="1" max="10" value={strategies.bucketYears} onChange={(e) => update('bucketYears', Number(e.target.value))} className="input-field !border-brand-blue/30" />
             </div>
           )}
        </div>

        {/* 2. DYNAMIC GUARDRAILS */}
        <div 
            onClick={toggleGuardrails}
            className={clsx("p-6 rounded-2xl border transition-all duration-300 cursor-pointer", strategies.useGuardrails ? "bg-brand-purple/5 border-brand-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]" : "glass-card opacity-80 hover:opacity-100")}
        >
           <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-2 rounded-xl transition-colors", strategies.useGuardrails ? "bg-brand-purple/20 text-brand-purple" : "bg-slate-100 dark:bg-white/5 text-slate-500")}>
                 <ShieldAlert size={20} />
              </div>
              <div className={clsx("w-4 h-4 rounded-full border-2 transition-colors", strategies.useGuardrails ? "border-brand-purple bg-brand-purple" : "border-slate-300 dark:border-slate-600")}></div>
           </div>
           <h3 className="font-bold text-slate-800 dark:text-white mb-1">Dynamic Guardrails</h3>
           <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">Automatically cut discretionary spending if the portfolio drops severely.</p>
           
           {strategies.useGuardrails && (
             <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                <div>
                    <label className="text-[10px] font-bold text-brand-purple uppercase tracking-wider block mb-1">Trigger Drop %</label>
                    <input type="number" value={strategies.guardrailTrigger} onChange={(e) => update('guardrailTrigger', Number(e.target.value))} className="input-field !border-brand-purple/30" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-brand-purple uppercase tracking-wider block mb-1">Cut Spend %</label>
                    <input type="number" value={strategies.guardrailCut} onChange={(e) => update('guardrailCut', Number(e.target.value))} className="input-field !border-brand-purple/30" />
                </div>
             </div>
           )}
        </div>

        {/* 3. EQUITY GLIDEPATH */}
        <div 
            onClick={toggleGlidepath}
            className={clsx("p-6 rounded-2xl border transition-all duration-300 cursor-pointer", strategies.useGlidepath ? "bg-brand-orange/5 border-brand-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]" : "glass-card opacity-80 hover:opacity-100")}
        >
           <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-2 rounded-xl transition-colors", strategies.useGlidepath ? "bg-brand-orange/20 text-brand-orange" : "bg-slate-100 dark:bg-white/5 text-slate-500")}>
                 <TrendingUp size={20} />
              </div>
              <div className={clsx("w-4 h-4 rounded-full border-2 transition-colors", strategies.useGlidepath ? "border-brand-orange bg-brand-orange" : "border-slate-300 dark:border-slate-600")}></div>
           </div>
           <h3 className="font-bold text-slate-800 dark:text-white mb-1">Equity Glidepath</h3>
           <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">Start retirement conservative, then slowly increase equity exposure.</p>
           
           {strategies.useGlidepath && (
             <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                <div>
                    <label className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">Target Eq. %</label>
                    <input type="number" max="100" value={strategies.glideTargetEquity} onChange={(e) => update('glideTargetEquity', Number(e.target.value))} className="input-field !border-brand-orange/30" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">Years to Target</label>
                    <input type="number" max="30" value={strategies.glideYears} onChange={(e) => update('glideYears', Number(e.target.value))} className="input-field !border-brand-orange/30" />
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}