import React from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { runMonteCarlo } from '../engine/montiqEngine';
import { formatCurrency, formatUnit } from '../../utils/format';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Play } from 'lucide-react';

export function ConfidenceChart() {
  const montiqContext = useMontiqData();
  const { allocation, simulationResults, setSimulationResults } = montiqContext;

  const totalAlloc = allocation.equity + allocation.debt + allocation.cash;
  const isReady = totalAlloc === 100;

  const handleRun = () => {
    const results = runMonteCarlo(montiqContext, 1000);
    setSimulationResults(results);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 font-sans">
          <p className="font-bold text-slate-800 dark:text-white mb-3 border-b border-black/5 dark:border-white/10 pb-2">{label}</p>
          <div className="space-y-2">
             <div className="flex justify-between gap-6 text-sm">
                <span className="text-brand-green font-bold">Top 10% Outcome</span>
                <span className="text-slate-800 dark:text-white font-bold">{formatCurrency(payload[2]?.value || 0)}</span>
             </div>
             <div className="flex justify-between gap-6 text-sm">
                <span className="text-brand-blue font-bold">Median Outcome</span>
                <span className="text-slate-800 dark:text-white font-bold">{formatCurrency(payload[1]?.value || 0)}</span>
             </div>
             <div className="flex justify-between gap-6 text-sm">
                <span className="text-brand-danger font-bold">Bottom 10% (Risk)</span>
                <span className="text-slate-800 dark:text-white font-bold">{formatCurrency(payload[0]?.value || 0)}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 sm:p-8 shadow-2xl font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
         <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Monte Carlo Projection</h2>
            <p className="text-xs text-slate-500">1,000 randomized historical lifetimes based on Nifty 50 and Bond yields.</p>
         </div>

         {simulationResults ? (
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Success Probability</p>
                    <p className={`text-4xl font-black ${simulationResults.successRate > 80 ? 'text-brand-green' : 'text-brand-danger'}`}>
                        {simulationResults.successRate}%
                    </p>
                </div>
                <button 
                    onClick={handleRun} 
                    className="w-14 h-14 shrink-0 flex items-center justify-center bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/20 rounded-full transition-all text-brand-blue hover:scale-105"
                    title="Rerun Simulation"
                >
                    {/* ml-1 optically centers the triangle inside the geometric circle */}
                    <Play size={24} fill="currentColor" className="ml-1" />
                </button>
            </div>
         ) : (
            <button 
                onClick={handleRun} 
                disabled={!isReady}
                className="flex items-center justify-center gap-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:grayscale"
            >
                <Play size={20} fill="currentColor" />
                <span>RUN 1,000 SIMULATIONS</span>
            </button>
         )}
      </div>

      {simulationResults && (
          <div className="w-full h-[400px] md:h-[500px] animate-in fade-in duration-700">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults.percentiles} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis tickFormatter={(val) => formatUnit(val)} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Area type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="p50" stroke="#0ea5e9" strokeWidth={3} fill="url(#fanGradient)" />
                    <Area type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
      )}
    </div>
  );
}