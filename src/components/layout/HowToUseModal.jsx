import { X, BookOpen, ArrowRightCircle, Zap, ShieldCheck, TrendingUp, Wallet, Users, CalendarClock, PieChart } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialContext';

export function HowToUseModal({ isOpen, onClose }) {
  const { isProMode } = useFinancialData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                  <TrendingUp size={16} /> 1. The Master Timeline & Individual Horizons
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Start by setting your <strong>Master Projection Timeline</strong> at the top. This dictates how many years the simulation will run. 
                  <br/><br/>
                  Inside your SIP and Savings cards, you can set shorter horizons. For example, if your Master Timeline is 25 years, but your SIP Horizon is 10 years, the engine will stop withdrawing money from your salary after Year 10, letting that corpus passively compound for the remaining 15 years.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <Wallet size={16} /> 2. Bottom-Up Cash Flow
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Fiducia uses "Bottom-Up Budgeting." You enter your Gross Salary, and then dictate exactly what you plan to invest every month (SIPs, FDs). The engine calculates your taxes (New Regime), subtracts your investments and mandatory EPF, and reveals your <strong>Disposable Income</strong>, i.e. the cash you actually have left to live on.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <PieChart size={16} /> 3. Inferring the Results
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Look at the <strong>Wealth Accumulation Chart</strong> to visualize the compounding curve of your total net worth. Use the <strong>Salary Preview Table</strong> to check if your Disposable Income remains positive. If it drops into the red, your step-ups (hikes in investment) are too aggressive compared to your salary growth!
                </p>
              </section>
            </>
          )}

          {/* --- PRO MODE CONTENT --- */}
          {isProMode && (
            <>
              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <Users size={16} /> 1. The Spousal Multiplier
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Toggle the Spousal Multiplier to simulate a Dual-Income household. Choose the multiplier (e.g., 1.5x means your spouse earns 50% of your income) and the year they start earning. <strong>The Magic:</strong> The engine automatically splits the incomes to calculate your taxes legally as two individuals, preventing you from being unfairly penalized by a joint-income tax bracket.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <ShieldCheck size={16} /> 2. The EPF Shadow Ledger & ₹2.5L Limit
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  If your Employee EPF + VPF contribution exceeds ₹2.5 Lakhs in a year, the interest on the excess is taxable. Fiducia uses a silent <strong>Shadow Ledger</strong> to track this limit year-by-year, automatically applying your marginal tax rate to the taxable interest portion.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                  <Zap size={16} /> 3. Smart Caps & Diversion Routing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  In the Strategy Card, switch your EPF to the <strong>2.5L Smart Cap</strong> or <strong>Statutory Min</strong>. The engine will instantly cap your EPF to avoid tax traps, capture the cash you saved, and automatically route that "overflow" into your SIPs or Savings. Watch your Asset Composition Chart shift as money flows from debt to equity!
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-brand-orange flex items-center gap-2">
                  <CalendarClock size={16} /> 4. Life Event Shocks (Beta)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Life isn't a straight line. Add one-time shocks (like a House Downpayment) or recurring liabilities (like EMIs) using <strong>today's money</strong>. The engine will automatically inflate the cost to the future year and drain it from your corpus or cash flow. The onus is on you to not over-spend, since this feature is still in beta.
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