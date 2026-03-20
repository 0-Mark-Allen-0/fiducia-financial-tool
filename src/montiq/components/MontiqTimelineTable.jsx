import React, { useState } from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { formatCurrency } from '../../utils/format';
import { TableProperties, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export function MontiqTimelineTable() {
  const { simulationResults } = useMontiqData();
  const [isOpen, setIsOpen] = useState(false);

  if (!simulationResults || !simulationResults.medianRunDetails) return null;

  return (
    <div className="glass-card mt-8 font-sans overflow-hidden transition-all duration-500">
      
      {/* Collapsible Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/40 dark:bg-black/20 cursor-pointer hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                <TableProperties size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none mb-1">Median Lifetime Ledger</h3>
                <p className="text-xs text-slate-500">A granular look at the 50th percentile simulation.</p>
            </div>
        </div>
        <div className="p-2">
            <ChevronDown size={20} className={clsx("text-slate-400 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
        </div>
      </div>

      {/* Table Body */}
      <div className={clsx("grid transition-all duration-500 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Monthly Draw</th> 
                  <th className="px-6 py-4 text-center">Nifty 50</th>
                  <th className="px-6 py-4 text-brand-purple">Equity Bucket</th>
                  <th className="px-6 py-4 text-brand-green">Cash Bucket</th>
                  <th className="px-6 py-4 text-brand-blue">Debt Bucket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {simulationResults.medianRunDetails.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    
                    <td className="px-6 py-4 font-medium text-slate-500">{row.yearLabel}</td>
                    
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-white">{formatCurrency(row.drawNominal)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">PPP: {formatCurrency(row.drawReal)}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-center font-bold">
                        <span className={clsx("px-2.5 py-1 rounded-full text-xs", row.nifty >= 0 ? "bg-brand-green/10 text-brand-green" : "bg-brand-danger/10 text-brand-danger")}>
                            {row.nifty >= 0 ? '+' : ''}{row.nifty.toFixed(2)}%
                        </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(row.equity)}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(row.cash)}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(row.debt)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}