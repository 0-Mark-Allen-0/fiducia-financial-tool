import React, { useEffect, useState } from 'react';
import { X, Info, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useFinancialData } from '../../context/FinancialContext';

export function FiduciaInfoModal({ activeModal, onClose }) {
  const { isProMode } = useFinancialData();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (activeModal) setShouldRender(true);
  }, [activeModal]);

  const onAnimationEnd = () => {
    if (!activeModal) setShouldRender(false);
  };

  if (!shouldRender) return null;

  let title = "";
  let content = null;

  // --- CONTENT ROUTER ---
  if (activeModal === 'settings') {
    title = "Life Settings";
    content = (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">This section establishes the absolute timeline and income structure of your financial journey.</p>
        <ul className="space-y-4 mt-3 text-sm text-slate-600 dark:text-slate-300">
          <li><strong className="text-slate-900 dark:text-white">Master Timeline:</strong> How many years you plan to accumulate wealth before retiring. Everything in the app scales to this number.</li>
          <li><strong className="text-slate-900 dark:text-white">Current Age:</strong> Used to map your financial timeline to your actual life stages.</li>
          <li className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/20">
             <strong className="text-brand-blue block mb-2">Spousal Multiplier (Dual Income):</strong>
             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Simulates a household with two earners. Crucially, the engine divides your total household income into two separate tax brackets. This ensures you aren't artificially penalized by a joint-income tax bracket push.</p>
          </li>
        </ul>
      </div>
    );
  } else if (activeModal === 'variables') {
    title = "Investment Variables";
    content = isProMode ? (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Define where your cash flows every month. Pro Mode unlocks the complexities of locked corporate formatting.</p>
        <div className="space-y-3 mt-4">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-green flex items-center gap-2 mb-1">EPF (Employee Provident Fund)</strong> 
            <p className="text-xs leading-relaxed">The engine automatically deducts your 12% share from your post-tax disposable income. You can toggle the <strong>Statutory Minimum (₹1800)</strong> or cap contributions at <strong>₹2.5L</strong> to avoid taxation on EPF interest.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-blue flex items-center gap-2 mb-1">SIP Portfolio</strong> 
            <p className="text-xs leading-relaxed">Your primary growth engine (Equity). Enter your expected annual return.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-purple flex items-center gap-2 mb-1">Savings / FDs</strong> 
            <p className="text-xs leading-relaxed">Your liquid safety net. Lower returns, but zero volatility.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-orange flex items-center gap-2 mb-1">VPF (Voluntary Provident Fund)</strong> 
            <p className="text-xs leading-relaxed">Allows you to divert extra cash into your EPF account for safe, tax-free returns (up to the ₹2.5L limit). The engine tracks this diversion from your Disposable Income.</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">How much money are you saving, and where is it going? Keep it simple: split your money into high-growth and high-safety buckets.</p>
        <div className="space-y-3 mt-4">
          <div className="bg-brand-blue/5 border border-brand-blue/20 p-4 rounded-xl">
            <strong className="text-brand-blue block mb-1">SIP Portfolio (High Growth)</strong> 
            <p className="text-xs leading-relaxed">Usually invested in Mutual Funds or Stocks. It grows faster over long periods, but can be volatile. Expected return is usually between 10% to 14%.</p>
          </div>
          <div className="bg-brand-purple/5 border border-brand-purple/20 p-4 rounded-xl">
            <strong className="text-brand-purple block mb-1">Savings & FDs (High Safety)</strong> 
            <p className="text-xs leading-relaxed">Money kept in your bank account or Fixed Deposits. It is 100% safe, but grows slowly. Expected return is usually between 4% to 7%.</p>
          </div>
        </div>
      </div>
    );
  } else if (activeModal === 'strategies') {
    title = "Strategies & Shocks";
    content = (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Real life doesn't go in a straight line. Use these tools to model the chaos of promotions and massive expenses.</p>
        <ul className="space-y-4 mt-3">
          <li><strong className="text-brand-blue">Tax Strategies:</strong> Adjust how you want to tackle the inevitable tax maze. For high earners, optimizing your tax liability can significantly boost your net worth!</li>
          <li className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
             <strong className="text-brand-orange block mb-2">Life Events (Cash Flow Shocks)</strong>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">Model weddings, buying a house, or taking on a multi-year EMI.</p>
             <ul className="list-disc pl-4 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                 <li><strong>Cost Today:</strong> Enter what it costs right now. The engine will auto-inflate the cost to the year it actually happens.</li>
                 <li><strong>Downpayment vs EMI:</strong> Drains your disposable income directly, creating a highly accurate cash flow model.</li>
             </ul>
          </li>
        </ul>
      </div>
    );
  } else if (activeModal === 'charts') {
    title = "Visualizations";
    content = isProMode ? (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Visualizing your exact asset mix and your true cash flow anatomy.</p>
        <ul className="space-y-4 mt-3">
          <li><strong className="text-slate-900 dark:text-white">Asset Composition:</strong> A stacked area chart showing how EPF, VPF, Savings, and SIPs stack on top of each other to build your final Net Worth.</li>
          <li><strong className="text-slate-900 dark:text-white">Cash Flow Anatomy:</strong> A 100% breakdown of your Gross Salary. Watch how Taxes, EPF deductions, EMIs, and Investments eat into your Total Income, leaving you with your final Disposable Income at the top.</li>
        </ul>
      </div>
    ) : (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Visualizing the magic of Compound Interest.</p>
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 mt-3">
            <strong className="text-brand-blue block mb-1">Liquid Wealth Chart</strong> 
            <p className="text-xs leading-relaxed">This graph tracks the growth of your SIPs and Savings over time. Notice how the curve starts slow, but bends upwards dramatically in the later years. That is the power of compounding at work!</p>
        </div>
      </div>
    );
  } else if (activeModal === 'ledger') {
    title = "The Master Ledger";
    content = isProMode ? (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">The raw data tables driving the engine. You can export any of these to CSV.</p>
        <ul className="space-y-2 mt-3 text-xs">
          <li><strong className="text-slate-900 dark:text-white">Salary Preview:</strong> Tracks Nominal vs. Real purchasing power, deducting New Regime taxes.</li>
          <li><strong className="text-slate-900 dark:text-white">SIPs & Savings:</strong> Track the contribution and compounding of your investments and savings.</li>
          <li><strong className="text-slate-900 dark:text-white">EPF & VPF:</strong> Shadow ledgers tracking statutory minimums and the ₹2.5L tax-free cap.</li>
          <li><strong className="text-slate-900 dark:text-white">Net Worth:</strong> The final aggregated YoY growth of all your assets combined.</li>
        </ul>
      </div>
    ) : (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">The exact numbers behind your wealth projection.</p>
        <ul className="space-y-2 mt-3 text-xs">
          <li><strong className="text-brand-blue">SIP & Savings Portfolios:</strong> Shows your yearly contributions and how much interest you've accumulated.</li>
          <li><strong className="text-brand-green">Net Worth:</strong> Your total liquid wealth at the end of every year, along with your Year-over-Year (YoY) growth rate.</li>
        </ul>
      </div>
    );
  } else if (activeModal === 'retirement') {
    title = "Retirement Planning";
    content = isProMode ? (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Transitioning from Accumulation to Withdrawal.</p>
        <ul className="space-y-4 mt-3">
          <li><strong className="text-brand-danger">Inflation Reality:</strong> A calculator to see how much purchasing power your final corpus actually has in today's money.</li>
          <li><strong className="text-slate-900 dark:text-white">Systematic Withdrawal Plan (SWP):</strong> 
             <p className="text-xs mt-1">Calculates how long your money lasts when withdrawing a monthly income. <strong>Pro Mode</strong> allows you to estimate the 12.5% Long Term Capital Gains (LTCG) tax by defining what percentage of your corpus is pure profit.</p>
          </li>
        </ul>
      </div>
    ) : (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">Planning for the day you stop working.</p>
        <ul className="space-y-4 mt-3">
          <li className="bg-brand-danger/5 border border-brand-danger/20 p-4 rounded-xl">
            <strong className="text-brand-danger block mb-1">Inflation Reality</strong> 
            <p className="text-xs leading-relaxed">₹1 Crore today will not buy you the same lifestyle in 20 years. This calculator shows you the "Purchasing Power" of your future wealth in today's money.</p>
          </li>
          <li className="bg-brand-orange/5 border border-brand-orange/20 p-4 rounded-xl">
            <strong className="text-brand-orange block mb-1">Withdrawal Plan (SWP)</strong> 
            <p className="text-xs leading-relaxed">If you have ₹5 Crores and want to withdraw ₹1 Lakh every month to live on... how long will the money last before it runs out? This calculator plots that exact timeline.</p>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 font-sans",
        activeModal ? "opacity-100" : "opacity-0"
      )}
      onTransitionEnd={onAnimationEnd}
    >
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className={clsx(
          "relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 transform",
          activeModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-transparent rounded-t-3xl">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-xl">
                  <Info size={24}/>
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                      {title} Guide
                  </h2>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-inset py-6 pl-6 pr-4 mr-2">
            {content}
        </div>

        <div className="shrink-0 p-6 pt-4 border-t border-slate-100 dark:border-white/5 bg-transparent rounded-b-3xl">
            <button onClick={onClose} className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Got it
            </button>
        </div>
      </div>
    </div>
  );
}