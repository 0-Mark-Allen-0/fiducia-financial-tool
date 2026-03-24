import React, { useState } from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { InputGroup } from '../../components/shared/InputGroup';
import { formatUnit, formatCurrency } from '../../utils/format';
import { PieChart, WalletCards, ChevronDown } from 'lucide-react';

export function AssetBuilder() {
  const { startingCorpus, setStartingCorpus, allocation, setAllocation, expenses, setExpenses, retirementHorizon, setRetirementHorizon } = useMontiqData();
  const [isOpen, setIsOpen] = useState(true);

  const updateAlloc = (field, val) => setAllocation(prev => ({ ...prev, [field]: Number(val) }));
  const updateExp = (field, val) => setExpenses(prev => ({ ...prev, [field]: Number(val) }));

  const totalAlloc = allocation.equity + allocation.debt + allocation.cash;
  const isAllocValid = totalAlloc === 100;

  return (
    <div className="glass-card flex flex-col h-fit w-full transition-all duration-300 ease-out shadow-xl font-sans">
      <div className="flex items-center justify-between cursor-pointer p-5 sm:p-6" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue shrink-0">
              <PieChart size={20} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none">Portfolio & Needs</h2>
              {!isOpen && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isAllocValid ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300' : 'bg-brand-danger/10 text-brand-danger animate-pulse'}`}>
                  {formatUnit(startingCorpus)} • E: {allocation.equity}% | D: {allocation.debt}% | C: {allocation.cash}%
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              <div className="space-y-8">
                <div>
                   <InputGroup label="Starting Corpus (₹)" value={startingCorpus} onChange={setStartingCorpus} isCurrency />
                </div>
                <div className="h-px w-full bg-slate-200/60 dark:bg-white/5"></div>
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase flex items-center gap-2">
                    <WalletCards size={16} className="text-brand-orange" /> Monthly Lifestyle
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <InputGroup label="Essential Needs (₹)" value={expenses.essential} onChange={(v) => updateExp('essential', v)} isCurrency />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <InputGroup label="Discretionary (₹)" value={expenses.discretionary} onChange={(v) => updateExp('discretionary', v)} isCurrency />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <InputGroup label="Guaranteed Income (₹)" value={expenses.guaranteedIncome} onChange={(v) => updateExp('guaranteedIncome', v)} isCurrency />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <InputGroup label="Retirement Years" value={retirementHorizon} onChange={setRetirementHorizon} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:border-l lg:border-black/5 lg:dark:border-white/5 lg:pl-10">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Asset Mix</h3>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${isAllocValid ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-danger/10 text-brand-danger animate-pulse'}`}>
                      Total: {totalAlloc}%
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Equity Allocation */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 transition-colors hover:border-brand-purple/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-brand-purple"></div>
                         Equity (Volatile)
                      </span>
                      <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 hidden sm:block">
                             {formatCurrency(startingCorpus * (allocation.equity / 100))}
                          </span>
                          <div className="flex items-center bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                              <input type="number" min="0" max="100" value={allocation.equity} onChange={(e) => updateAlloc('equity', e.target.value)} className="w-10 bg-transparent outline-none text-right font-black text-brand-purple placeholder-slate-400" />
                              <span className="text-xs font-bold text-slate-400 ml-0.5">%</span>
                          </div>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={allocation.equity} onChange={(e) => updateAlloc('equity', e.target.value)} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-brand-purple cursor-pointer" />
                  </div>

                  {/* Debt Allocation */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 transition-colors hover:border-brand-blue/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
                         Debt (Stable)
                      </span>
                      <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 hidden sm:block">
                             {formatCurrency(startingCorpus * (allocation.debt / 100))}
                          </span>
                          <div className="flex items-center bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                              <input type="number" min="0" max="100" value={allocation.debt} onChange={(e) => updateAlloc('debt', e.target.value)} className="w-10 bg-transparent outline-none text-right font-black text-brand-blue placeholder-slate-400" />
                              <span className="text-xs font-bold text-slate-400 ml-0.5">%</span>
                          </div>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={allocation.debt} onChange={(e) => updateAlloc('debt', e.target.value)} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-brand-blue cursor-pointer" />
                  </div>

                  {/* Cash Allocation */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 transition-colors hover:border-brand-green/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div>
                         Cash (Liquid)
                      </span>
                      <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 hidden sm:block">
                             {formatCurrency(startingCorpus * (allocation.cash / 100))}
                          </span>
                          <div className="flex items-center bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                              <input type="number" min="0" max="100" value={allocation.cash} onChange={(e) => updateAlloc('cash', e.target.value)} className="w-10 bg-transparent outline-none text-right font-black text-brand-green placeholder-slate-400" />
                              <span className="text-xs font-bold text-slate-400 ml-0.5">%</span>
                          </div>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={allocation.cash} onChange={(e) => updateAlloc('cash', e.target.value)} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-brand-green cursor-pointer" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}