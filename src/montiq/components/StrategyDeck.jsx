import React from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { ShieldAlert, TrendingUp, ArrowDownUp } from 'lucide-react';
import { clsx } from 'clsx';

export function StrategyDeck() {
  const { strategies, setStrategies } = useMontiqData();

  const update = (field, val) => setStrategies(prev => ({ ...prev, [field]: val }));

  const handleSequenceChange = (newSequence) => {
      setStrategies(prev => ({
          ...prev,
          withdrawalSequence: newSequence,
          // Glidepath only makes sense if withdrawal is naturally proportional
          useGlidepath: newSequence === 'proportional' ? prev.useGlidepath : false 
      }));
  };

  const toggleGuardrails = () => {
    setStrategies(prev => ({ ...prev, useGuardrails: !prev.useGuardrails }));
  };

  const toggleGlidepath = () => {
    if (strategies.withdrawalSequence !== 'proportional') return;
    setStrategies(prev => ({ ...prev, useGlidepath: !prev.useGlidepath }));
  };

  return (
    <div className="space-y-6 font-sans w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. WITHDRAWAL SEQUENCE */}
        <div className="glass-card opacity-90 p-6 rounded-2xl border transition-all duration-300">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">
                 <ArrowDownUp size={20} />
              </div>
           </div>
           <h3 className="font-bold text-slate-800 dark:text-white mb-1">Withdrawal Logic</h3>
           <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">Determine which assets are liquidated first to fund your lifestyle and events.</p>
           
           <div className="space-y-3">
              <select 
                  value={strategies.withdrawalSequence}
                  onChange={(e) => handleSequenceChange(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-slate-800 dark:text-white font-bold outline-none focus:border-brand-blue transition-colors cursor-pointer appearance-none"
              >
                  <option value="proportional">Proportional (Default)</option>
                  <option value="equity-first">Equity First (Aggressive)</option>
                  <option value="debt-first">Debt First (Bond Tent)</option>
                  <option value="dynamic-bucket">Dynamic Bucketing</option>
              </select>

              {strategies.withdrawalSequence === 'dynamic-bucket' && (
                <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
                    <label className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block mb-1">Cash Buffer (Years)</label>
                    <input type="number" min="1" max="10" value={strategies.bucketYears} onChange={(e) => update('bucketYears', Number(e.target.value))} className="input-field !border-brand-blue/30 !bg-white/50 dark:!bg-black/20" />
                </div>
              )}
           </div>
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
                    <input type="number" value={strategies.guardrailTrigger} onChange={(e) => update('guardrailTrigger', Number(e.target.value))} className="input-field !border-brand-purple/30 !bg-white/50 dark:!bg-black/20" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-brand-purple uppercase tracking-wider block mb-1">Cut Spend %</label>
                    <input type="number" value={strategies.guardrailCut} onChange={(e) => update('guardrailCut', Number(e.target.value))} className="input-field !border-brand-purple/30 !bg-white/50 dark:!bg-black/20" />
                </div>
             </div>
           )}
        </div>

        {/* 3. EQUITY GLIDEPATH */}
        <div 
            onClick={toggleGlidepath}
            className={clsx("p-6 rounded-2xl border transition-all duration-300", strategies.useGlidepath ? "bg-brand-orange/5 border-brand-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] cursor-pointer" : strategies.withdrawalSequence === 'proportional' ? "glass-card opacity-80 hover:opacity-100 cursor-pointer" : "glass-card opacity-40 grayscale cursor-not-allowed")}
            title={strategies.withdrawalSequence !== 'proportional' ? "Requires Proportional Withdrawal Sequence" : ""}
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
                    <input type="number" max="100" value={strategies.glideTargetEquity} onChange={(e) => update('glideTargetEquity', Number(e.target.value))} className="input-field !border-brand-orange/30 !bg-white/50 dark:!bg-black/20" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">Years to Target</label>
                    <input type="number" max="30" value={strategies.glideYears} onChange={(e) => update('glideYears', Number(e.target.value))} className="input-field !border-brand-orange/30 !bg-white/50 dark:!bg-black/20" />
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}