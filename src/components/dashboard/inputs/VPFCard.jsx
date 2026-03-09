import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { LibraryBig, AlertTriangle, ArrowRightCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import { clsx } from 'clsx';

export function VPFCard() {
  const { vpfInput, setVpfInput, epfInput, isProMode, dashboardData } = useFinancialData();

  if (!isProMode) return null;

  const update = (field, val) => setVpfInput(prev => ({ ...prev, [field]: val }));

  // --- 1. SMART LOGIC: CHECK LIMITS ---
  const grossYearly = epfInput.salary * 12;
  const basicYearly = grossYearly * (epfInput.basicPercent / 100);
  const mandatoryEmpYearly = basicYearly * (epfInput.empContrib / 100);
  const vpfYearly = vpfInput.amount * 12;
  const totalContribYearly = mandatoryEmpYearly + vpfYearly;
  
  const LIMIT = 250000;
  const isBreach = totalContribYearly > LIMIT;
  const mandatoryBreach = mandatoryEmpYearly > LIMIT;

  // --- 2. GET DISPLAY DATA ---
  const series = dashboardData.vpfSeries || [];
  const finalData = series[series.length - 1] || {};
  const totalValue = finalData.corpusNominal || 0;

  return (
    <div className="glass-card p-6 flex flex-col h-full border-brand-green/30 shadow-brand-green/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                <LibraryBig size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Voluntary PF</h3>
        </div>
        
        {/* Status Badge */}
        {vpfInput.strategy === 'maximize' ? (
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">
                Accumulating
             </span>
        ) : (
             <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2 py-1 rounded flex items-center gap-1">
                <ArrowRightCircle size={10} /> Diverting
             </span>
        )}
      </div>

      <div className="space-y-6 mb-6">
        {/* STRATEGY SELECTOR */}
        <div className="bg-slate-100 dark:bg-black/40 p-1 rounded-xl flex text-xs font-semibold">
            <button 
                onClick={() => update('strategy', 'maximize')}
                className={clsx(
                    "flex-1 py-2 rounded-lg transition-all",
                    vpfInput.strategy === 'maximize' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Max Corpus
            </button>
            <button 
                onClick={() => update('strategy', 'sip')}
                className={clsx(
                    "flex-1 py-2 rounded-lg transition-all",
                    vpfInput.strategy === 'sip' ? "bg-white dark:bg-slate-700 shadow text-brand-blue" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                → SIP
            </button>
            <button 
                onClick={() => update('strategy', 'save')}
                className={clsx(
                    "flex-1 py-2 rounded-lg transition-all",
                    vpfInput.strategy === 'save' ? "bg-white dark:bg-slate-700 shadow text-brand-purple" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                → FD
            </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <InputGroup label="Monthly VPF (₹)" value={vpfInput.amount} onChange={(v) => update('amount', v)} isCurrency />
            </div>
            <InputGroup label="Step-up (%)" value={vpfInput.stepUp} onChange={(v) => update('stepUp', v)} />
            <InputGroup label="Horizon (Yrs)" value={vpfInput.horizon} onChange={(v) => update('horizon', v)} />
        </div>
      </div>

      {/* --- SMART WARNINGS SECTION --- */}
      <div className="mt-auto space-y-3">
        
        {/* Case 1: Strategy is 'Divert' but limit NOT breached (Unnecessary Strategy) */}
        {!isBreach && vpfInput.strategy !== 'maximize' && vpfInput.amount > 0 && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex gap-2 items-start">
                <ShieldCheck size={16} className="text-brand-green mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Within Tax-Free Limit</p>
                    <p className="text-[10px] text-slate-500">
                        Your total contribution ({formatCurrency(totalContribYearly)}) is under ₹2.5L. No diversion needed.
                    </p>
                </div>
            </div>
        )}

        {/* Case 2: Limit Breached & Diverting */}
        {isBreach && vpfInput.strategy !== 'maximize' && (
            <div className="p-3 rounded-lg bg-brand-blue/5 border border-brand-blue/10 flex gap-2 items-start">
                <ArrowRightCircle size={16} className="text-brand-blue mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Overflow Diverted
                        {mandatoryBreach && <span className="text-brand-danger ml-1">(Mandatory Excess)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">
                        {mandatoryBreach 
                            ? `Mandatory EPF (${formatCurrency(mandatoryEmpYearly)}) alone exceeds limit. All VPF + Excess is diverted.` 
                            : `Contributions > ₹2.5L are moved to ${vpfInput.strategy === 'sip' ? 'SIP' : 'FD'}.`
                        }
                    </p>
                </div>
            </div>
        )}

        {/* Case 3: Limit Breached & Maximizing (Tax Warning) */}
        {isBreach && vpfInput.strategy === 'maximize' && (
            <div className="p-3 rounded-lg bg-brand-danger/5 border border-brand-danger/10 flex gap-2 items-start">
                <AlertTriangle size={16} className="text-brand-danger mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-brand-danger">Taxable Interest Alert</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        You exceeded the ₹2.5L tax-free limit. Interest on the excess {formatCurrency(totalContribYearly - LIMIT)} will be taxed annually.
                    </p>
                </div>
            </div>
        )}

        <div className="bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
            <ResultRow label="VPF Corpus" value={totalValue} />
        </div>
      </div>
    </div>
  );
}