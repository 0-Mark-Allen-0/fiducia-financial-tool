import { useFinancialData } from '../../../context/FinancialContext';
import { Settings2, AlertTriangle, ArrowRightCircle, ShieldCheck, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export function StrategyCard() {
  const { epfInput, setEpfInput, vpfInput, setVpfInput, isProMode, dashboardData } = useFinancialData();

  if (!isProMode) return null;

  const updateEpf = (field, val) => setEpfInput(prev => ({ ...prev, [field]: val }));
  const updateVpf = (field, val) => setVpfInput(prev => ({ ...prev, [field]: val }));

  // --- 1. PREDICTIVE ARRAY SCANNING ---
  const epfSeries = dashboardData.epfSeries || [];
  const vpfSeries = dashboardData.vpfSeries || [];

  // Find when triggers happen
  const firstEpfCapYear = epfSeries.find(d => d.isEpfCapped)?.year;
  const firstEpfBreachYear = epfSeries.find(d => d.yearlyEmployeeNominal > 250000)?.year;
  const firstVpfDivertYear = vpfSeries.find(d => d.isVpfDiverted)?.year;

  // Find Combined Breach (EPF + VPF)
  let firstCombinedBreachYear = null;
  for (let i = 0; i < epfSeries.length; i++) {
      const epf = epfSeries[i];
      const vpf = vpfSeries[i];
      if (epf && vpf && (epf.yearlyEmployeeNominal + vpf.yearlyNominal > 250000)) {
          firstCombinedBreachYear = epf.year;
          break;
      }
  }

  const formatYear = (y) => y === 1 ? "immediately (Year 1)" : `in Year ${y}`;
  const isEpfMinActive = epfInput.strategy === 'minimum';

  return (
    <div className="glass-card p-6 flex flex-col w-full border-slate-200 dark:border-white/10 shadow-xl mb-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
        <div className="p-2 bg-slate-800 text-white rounded-lg">
            <Settings2 size={20} />
        </div>
        <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">Tax & Diversion Strategy</h3>
            <p className="text-xs text-slate-500">Control how your funds navigate the ₹2.5L tax-free limit.</p>
        </div>
      </div>

      {/* STRATEGY CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          
          {/* LEFT: EPF STRATEGY */}
          <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex justify-between">
                 1. EPF Contribution Rule
                 {(firstEpfCapYear || isEpfMinActive) && <span className="text-brand-blue normal-case">Savings Diverting</span>}
              </label>
              
              {/* NEW: 3-Way Toggle for EPF Strategy */}
              <div className="bg-slate-100 dark:bg-black/40 p-1 rounded-xl flex text-[10px] sm:text-xs font-semibold h-[44px]">
                  <button 
                      onClick={() => updateEpf('strategy', 'standard')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          epfInput.strategy === 'standard' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      12% Standard
                  </button>
                  <button 
                      onClick={() => updateEpf('strategy', 'smart')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          epfInput.strategy === 'smart' ? "bg-white dark:bg-slate-700 shadow text-brand-blue" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      2.5L Smart Cap
                  </button>
                  <button 
                      onClick={() => updateEpf('strategy', 'minimum')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          epfInput.strategy === 'minimum' ? "bg-white dark:bg-slate-700 shadow text-brand-green" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      Minimum EPF
                  </button>
              </div>

              {/* EPF DIVERSION TARGET (Visible if Smart Cap OR Minimum is selected) */}
              {epfInput.strategy !== 'standard' && (
                  <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-bold text-brand-blue uppercase mb-2">Route EPF Savings To:</p>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => updateEpf('divertTo', 'sip')}
                              className={clsx(
                                  "flex-1 py-2 rounded text-[10px] font-bold border transition-all",
                                  epfInput.divertTo === 'sip' ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20" : "bg-white dark:bg-black/40 text-slate-500 border-slate-200 dark:border-white/10 hover:border-brand-blue/50"
                              )}
                          >
                              SIP
                          </button>
                          <button 
                              onClick={() => updateEpf('divertTo', 'save')}
                              className={clsx(
                                  "flex-1 py-2 rounded text-[10px] font-bold border transition-all",
                                  epfInput.divertTo === 'save' ? "bg-brand-purple text-white border-brand-purple shadow-md shadow-brand-purple/20" : "bg-white dark:bg-black/40 text-slate-500 border-slate-200 dark:border-white/10 hover:border-brand-purple/50"
                              )}
                          >
                              Savings (FD)
                          </button>
                          <button 
                              onClick={() => updateEpf('divertTo', 'cash')}
                              className={clsx(
                                  "flex-1 py-2 rounded text-[10px] font-bold border transition-all",
                                  epfInput.divertTo === 'cash' ? "bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20" : "bg-white dark:bg-black/40 text-slate-500 border-slate-200 dark:border-white/10 hover:border-brand-green/50"
                              )}
                          >
                              Keep as Cash
                          </button>
                      </div>
                  </div>
              )}
          </div>

          {/* RIGHT: VPF STRATEGY */}
          <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex justify-between">
                 2. VPF Overflow Rule
                 {firstVpfDivertYear && <span className="text-brand-purple normal-case">Active</span>}
              </label>
              
              <div className="bg-slate-100 dark:bg-black/40 p-1 rounded-xl flex text-xs font-semibold h-[44px]">
                  <button 
                      onClick={() => updateVpf('strategy', 'maximize')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          vpfInput.strategy === 'maximize' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      Max Corpus
                  </button>
                  <button 
                      onClick={() => updateVpf('strategy', 'sip')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          vpfInput.strategy === 'sip' ? "bg-white dark:bg-slate-700 shadow text-brand-blue" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      → SIP
                  </button>
                  <button 
                      onClick={() => updateVpf('strategy', 'save')}
                      className={clsx(
                          "flex-1 py-1 rounded-lg transition-all",
                          vpfInput.strategy === 'save' ? "bg-white dark:bg-slate-700 shadow text-brand-purple" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                  >
                      → FD
                  </button>
              </div>
              
              <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                  If your combined EPF + VPF exceeds ₹2.5L, do you want to keep the overflow in VPF (taxable interest) or divert it to market instruments?
              </p>
          </div>

      </div>

      {/* --- LIVE PREDICTIVE WARNINGS LOGIC BOARD --- */}
      <div className="mt-2 space-y-3 bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
        
        {/* NEW State: Statutory Minimum Active */}
        {isEpfMinActive && (
            <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/20 flex gap-2 items-start animate-in fade-in">
                <Zap size={16} className="text-brand-green mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-brand-green">Statutory Minimum Enforced</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Your EPF is capped at ₹1,800/mo from Year 1. This guarantees <strong>₹2.28L</strong> of tax-free space for VPF and constantly routes all leftover employer/employee contributions to <strong className="uppercase">{epfInput.divertTo}</strong>.
                    </p>
                </div>
            </div>
        )}

        {/* State 1: EPF Smart Cap Active (Synergy) - Hides if Minimum is active */}
        {!isEpfMinActive && firstEpfCapYear && (
            <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/20 flex gap-2 items-start animate-in fade-in">
                <Zap size={16} className="text-brand-green mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-brand-green">Smart Cap Synergy</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Your EPF will be capped at the statutory minimum {formatYear(firstEpfCapYear)}. This unlocks <strong>₹2.28L</strong> of tax-free space for VPF, and routes your EPF savings to <strong className="uppercase">{epfInput.divertTo}</strong>.
                    </p>
                </div>
            </div>
        )}

        {/* State 2: VPF Diverting */}
        {firstVpfDivertYear && vpfInput.strategy !== 'maximize' && (
            <div className="p-3 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex gap-2 items-start animate-in fade-in">
                <ArrowRightCircle size={16} className="text-brand-purple mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-brand-purple">Overflow Diverted</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Your contributions will exceed ₹2.5L {formatYear(firstVpfDivertYear)}. The excess will actively divert to <strong className="uppercase">{vpfInput.strategy === 'sip' ? 'SIP' : 'Savings'}</strong> to prevent tax drag.
                    </p>
                </div>
            </div>
        )}

        {/* State 3: Safe */}
        {!firstCombinedBreachYear && !firstEpfCapYear && !firstEpfBreachYear && !isEpfMinActive && (
            <div className="p-3 rounded-lg bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex gap-2 items-start animate-in fade-in">
                <ShieldCheck size={16} className="text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Within Tax-Free Limits</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                        Your projections show you will stay under the ₹2.5L limit for your entire horizon. No diversions or tax penalties apply!
                    </p>
                </div>
            </div>
        )}

        {/* State 4A: Tax Penalties (EPF Standard Breach) */}
        {epfInput.strategy === 'standard' && firstEpfBreachYear && (
             <div className="p-3 rounded-lg bg-brand-danger/10 border border-brand-danger/20 flex gap-2 items-start animate-in fade-in">
                 <AlertTriangle size={16} className="text-brand-danger mt-0.5 shrink-0" />
                 <div>
                     <p className="text-xs font-bold text-brand-danger">EPF Tax Penalty</p>
                     <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                         Your standard EPF will exceed the ₹2.5L limit {formatYear(firstEpfBreachYear)}. Interest on the excess will be taxed annually. Consider switching to the Smart Cap.
                     </p>
                 </div>
             </div>
        )}

        {/* State 4B: Tax Penalties (VPF Maximize Breach) */}
        {firstCombinedBreachYear && vpfInput.strategy === 'maximize' && vpfInput.amount > 0 && (
            <div className="p-3 rounded-lg bg-brand-danger/10 border border-brand-danger/20 flex gap-2 items-start animate-in fade-in">
                <AlertTriangle size={16} className="text-brand-danger mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-brand-danger">VPF Tax Penalty</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Your combined contribution will exceed the ₹2.5L limit {formatYear(firstCombinedBreachYear)}. Interest on the VPF excess will be taxed annually because you chose to Maximize Corpus.
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}