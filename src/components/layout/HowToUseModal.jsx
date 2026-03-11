import { X, BookOpen, ArrowRightCircle, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialContext';

export function HowToUseModal({ isOpen, onClose }) {
  const { isProMode } = useFinancialData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isProMode ? "Advanced Pro Mode Guide" : "Getting Started Guide"}
              </h2>
              <p className="text-xs text-slate-500">How to use the financial simulation engine.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* --- SIMPLE MODE CONTENT --- */}
          {!isProMode && (
            <>
              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <TrendingUp size={16} /> 1. Bottom-Up Cash Flow
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  This tool uses "Bottom-Up Budgeting." Instead of arbitrarily dividing your salary, you enter exactly what you plan to invest every month (SIPs, Savings). The engine calculates your taxes, subtracts your investments, and reveals exactly how much <strong>Disposable Income</strong> you have left to live your life.
                </p>
                <div className="my-4 border border-slate-200 dark:border-white/10 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                   
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <TrendingUp size={16} /> 2. Master Horizon vs. Active Horizons
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  At the top of the dashboard is your <strong>Master Projection Timeline</strong>. This is how long you want to simulate your wealth. However, inside each card (like the SIP card), you can set a shorter horizon. 
                  <br/><br/>
                  If your Master Timeline is 25 years, but your SIP Horizon is 10 years, the engine will automatically stop withdrawing money from your salary after Year 10, and let that corpus passively compound for the remaining 15 years!
                </p>
              </section>
            </>
          )}

          {/* --- PRO MODE CONTENT --- */}
          {isProMode && (
            <>
              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <ShieldCheck size={16} /> 1. The ₹2.5 Lakh Limit & Shadow Ledger
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Indian tax law dictates that if your combined Employee EPF + VPF contributions exceed ₹2.5 Lakhs in a single year, the interest earned on that excess amount is taxable at your slab rate. 
                  Our engine uses a silent <strong>Shadow Ledger</strong> to automatically split your money into "Tax-Free" and "Taxable" buckets, calculating the exact tax drag on your compounding returns year over year.
                </p>
                <div className="my-4 border border-slate-200 dark:border-white/10 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <Zap size={16} /> 2. The "Smart Cap" Strategy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  In the Tax Strategy Control Center, you can switch your EPF from "12% Standard" to the <strong>2.5L Smart Cap</strong>. This brilliantly limits your EPF contribution to the statutory minimum (₹1,800/mo) the moment your salary pushes you over the ₹2.5L limit. 
                  <br/><br/>
                  This prevents tax penalties and opens up massive tax-free space for VPF.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <ArrowRightCircle size={16} /> 3. Diversion Routing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  If your contributions breach the limit, or you trigger a Smart Cap, you don't lose that money. The engine intercepts those "savings" or "overflows" and allows you to automatically route them into your Equity SIP or Savings FD. You can watch this happen live in the Projection Tables!
                </p>
              </section>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="btn-primary w-auto px-8 py-2.5 text-sm"
          >
            Got it, let's go!
          </button>
        </div>

      </div>
    </div>
  );
}