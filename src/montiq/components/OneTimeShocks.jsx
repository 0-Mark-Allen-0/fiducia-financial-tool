import React, { useState } from 'react';
import { useMontiqData } from '../context/MontiqContext';
import { formatCurrency } from '../../utils/format';
import { Plus, Trash2, Zap, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export function OneTimeShocks() {
  const { startingCorpus, allocation, retirementHorizon, retirementEvents, setRetirementEvents } = useMontiqData();
  const [isOpen, setIsOpen] = useState(true);

  const addEvent = () => setRetirementEvents([...retirementEvents, { id: Date.now(), name: 'New Expense', amount: 1000000, year: 1, target: 'proportional' }]);
  const removeEvent = (id) => setRetirementEvents(retirementEvents.filter(e => e.id !== id));
  const updateEvent = (id, field, val) => setRetirementEvents(retirementEvents.map(e => e.id === id ? { ...e, [field]: val } : e));

  // --- PRE-SIMULATION SNAPSHOT MATH ---
  // Calculates exactly what the portfolio will look like after Year 1 shocks hit.
  let eq = startingCorpus * (allocation.equity / 100);
  let db = startingCorpus * (allocation.debt / 100);
  let cs = startingCorpus * (allocation.cash / 100);
  
  const y1Shocks = retirementEvents.filter(e => Number(e.year) === 1);
  const taxRate = 0.63 * 0.125; // 7.875% effective tax on gross equity withdrawals

  const simulateDrain = (amount, preference) => {
      let remaining = amount;
      const takeFrom = (bucket) => {
          if (remaining <= 0) return;
          if (bucket === 'equity') {
              let requiredGross = remaining / (1 - taxRate);
              if (eq >= requiredGross) { eq -= requiredGross; remaining = 0; }
              else { let net = eq * (1 - taxRate); eq = 0; remaining -= net; }
          } else if (bucket === 'debt') {
              let take = Math.min(db, remaining); db -= take; remaining -= take;
          } else if (bucket === 'cash') {
              let take = Math.min(cs, remaining); cs -= take; remaining -= take;
          }
      };

      if (preference === 'equity') { takeFrom('equity'); takeFrom('debt'); takeFrom('cash'); }
      else if (preference === 'debt') { takeFrom('debt'); takeFrom('cash'); takeFrom('equity'); }
      else if (preference === 'cash') { takeFrom('cash'); takeFrom('debt'); takeFrom('equity'); }
      else {
          let tot = eq + db + cs;
          if (tot > 0) {
              let eqTargetNet = remaining * (eq / tot);
              let dbTake = Math.min(db, remaining * (db / tot));
              let csTake = Math.min(cs, remaining * (cs / tot));
              
              let actualEqGross = Math.min(eq, eqTargetNet / (1 - taxRate));
              let actualEqNet = actualEqGross * (1 - taxRate);
              eq -= actualEqGross; db -= dbTake; cs -= csTake;
              remaining -= (actualEqNet + dbTake + csTake);
              
              if (remaining > 0.1) { takeFrom('cash'); takeFrom('debt'); takeFrom('equity'); }
          }
      }
  };

  y1Shocks.forEach(e => simulateDrain(e.amount, e.target));
  const postShockTotal = Math.max(0, eq + db + cs);

  return (
    <div className="glass-card flex flex-col h-fit w-full transition-all duration-300 ease-out shadow-xl mt-6 font-sans">
      <div className="flex items-center justify-between cursor-pointer p-5 sm:p-6" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0">
              <Zap size={20} />
          </div>
          <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none mb-1">One-Time Shocks</h2>
              <p className="text-xs text-slate-500">Model large expenses like weddings, medical, or property.</p>
          </div>
        </div>
        <div className="p-1 shrink-0">
          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div className={clsx("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-black/5 dark:border-white/5 mt-2 space-y-4">
            
            {/* PRE-SIMULATION SNAPSHOT BANNER */}
            {y1Shocks.length > 0 && (
                <div className="p-4 bg-brand-danger/5 border border-brand-danger/20 rounded-xl mb-4 flex flex-col sm:flex-row justify-between gap-4 animate-in fade-in">
                    <div>
                        <h4 className="text-[10px] font-bold text-brand-danger uppercase tracking-wider mb-1">Post-Shock Starting Corpus (Year 1)</h4>
                        <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{formatCurrency(postShockTotal)}</p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <div><span className="text-brand-purple font-bold">Eq:</span> {formatCurrency(eq)}</div>
                        <div><span className="text-brand-blue font-bold">Db:</span> {formatCurrency(db)}</div>
                        <div><span className="text-brand-green font-bold">Cs:</span> {formatCurrency(cs)}</div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {retirementEvents.length === 0 && (
                    <div className="text-sm text-slate-400 italic p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl text-center">
                        No life events added. Click below to add a cash flow shock.
                    </div>
                )}
                {retirementEvents.map((event) => (
                    <div key={event.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl p-3 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-left-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <input type="text" value={event.name} onChange={(e) => updateEvent(event.id, 'name', e.target.value)} className="input-field !py-2 text-sm w-full" placeholder="Event Name" />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" value={event.amount} onChange={(e) => updateEvent(event.id, 'amount', Number(e.target.value))} className="input-field !py-2 !pl-7 text-sm w-full font-bold" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Yr</span>
                                <input type="number" min="1" max={retirementHorizon} value={event.year} onChange={(e) => updateEvent(event.id, 'year', Number(e.target.value))} className="input-field !py-2 !pl-8 text-sm w-full" />
                            </div>
                            <select value={event.target} onChange={(e) => updateEvent(event.id, 'target', e.target.value)} className="input-field !py-2 text-sm w-full cursor-pointer appearance-none">
                                <option value="proportional">Drain Proportional</option>
                                <option value="equity">Drain Equity First</option>
                                <option value="debt">Drain Debt First</option>
                                <option value="cash">Drain Cash First</option>
                            </select>
                        </div>
                        <button onClick={() => removeEvent(event.id)} className="text-slate-400 hover:text-brand-danger transition-colors self-start sm:self-center p-2 bg-white dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={addEvent} className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-brand-orange/50 hover:bg-brand-orange/5 rounded-xl text-sm font-bold text-slate-500 hover:text-brand-orange transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Add Cash Flow Shock
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}