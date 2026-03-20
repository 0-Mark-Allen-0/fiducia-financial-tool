import React, { useEffect, useState } from 'react';
import { X, Activity, ExternalLink, ShieldAlert, BanknoteArrowDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useFinancialData } from '../../context/FinancialContext';

export function MontiqBridgeModal({ isOpen, onClose }) {
  const { dashboardData } = useFinancialData();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const handleLaunch = () => {
    // 1. Extract the final corpus values from Fiducia's ledgers
    const sipSeries = dashboardData.sipSeries || [];
    const savSeries = dashboardData.savSeries || [];
    const epfSeries = dashboardData.epfSeries || [];
    const vpfSeries = dashboardData.vpfSeries || [];

    const sipTotal = sipSeries.length > 0 ? sipSeries[sipSeries.length - 1].corpusNominal : 0;
    const savTotal = savSeries.length > 0 ? savSeries[savSeries.length - 1].corpusNominal : 0;
    const epfTotal = epfSeries.length > 0 ? epfSeries[epfSeries.length - 1].corpusNominal : 0;
    const vpfTotal = vpfSeries.length > 0 ? vpfSeries[vpfSeries.length - 1].corpusNominal : 0;

    // 2. Package and save to LocalStorage for Montiq to find
    const exportData = { 
        sipTotal, 
        savingsTotal: savTotal, 
        epfTotal, 
        vpfTotal 
    };
    localStorage.setItem('fiducia_export_v1', JSON.stringify(exportData));

    // 3. Launch Montiq in a new tab
    const url = window.location.origin + window.location.pathname + '#/montiq';
    window.open(url, '_blank');

    // 4. Close this modal in Fiducia
    onClose();
  };

  return (
    <div 
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 font-sans",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onTransitionEnd={onAnimationEnd}
    >
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className={clsx(
          "relative bg-white dark:bg-slate-900 w-full max-w-lg flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 transform",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-transparent rounded-t-3xl">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <BanknoteArrowDown size={24}/>
               </div>
               <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-none tracking-tight flex items-center gap-2">
                      Entering Montiq 
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand-orange text-white rounded leading-none">
                          Beta
                      </span>
                  </h2>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                You are about to leave Fiducia and enter Montiq. Montiq is our advanced, stochastic retirement engine. Please note that Montiq is still in the testing phase.
            </p>

            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                    <strong className="text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                        <Activity size={16} className="text-brand-blue" /> Seamless Integration
                    </strong> 
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        We will securely transfer your exact final corpus (SIPs, Savings, EPF, and VPF) directly into Montiq so you don't have to enter it manually.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                    <strong className="text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                        <ShieldAlert size={16} className="text-brand-purple" /> Stress Test Your Wealth
                    </strong> 
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Instead of flat, predictable returns, Montiq runs 1,000 alternate lifetimes using historical Nifty 50 and Bond yields to test your portfolio against Sequence of Returns Risk (SRR).
                    </p>
                </div>
            </div>
        </div>

        <div className="shrink-0 p-6 pt-4 border-t border-slate-100 dark:border-white/5 bg-transparent rounded-b-3xl">
            <button 
                onClick={handleLaunch} 
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
            >
                Acknowledge & Launch Montiq <ExternalLink size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}