import { useEffect, useState } from 'react';
import { X, ShieldCheck, Zap, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export function InfoModal({ isOpen, onClose }) {
  const [shouldRender, setShouldRender] = useState(false);

  // Handle animation mounting
  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onTransitionEnd={onAnimationEnd}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={clsx(
          "relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 transition-all duration-300 transform",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-transparent rounded-t-3xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Fiducia <span className="text-brand-blue text-xs uppercase tracking-widest border border-brand-blue/20 px-2 py-0.5 rounded-full">v1.4</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Sovereign Wealth Planning Engine</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-inset py-6 pl-6 pr-2 mr-2">
            <div className="space-y-8 pr-2"> 
                
                {/* 1. Philosophy */}
                <section>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong>Fiducia</strong> is a financial lifecycle simulator designed to project your finances until retirement. 
                    </p>
                </section>

                {/* --- NEW: RELEASE NOTES --- */}
                <section className="bg-brand-blue/5 border border-brand-blue/20 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={64} className="text-brand-blue" />
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-blue mb-4">
                        <Sparkles size={16} /> What's New in v1.4
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 relative z-10">
                        <li>
                            <strong className="text-slate-900 dark:text-white">💍 Spousal Multiplier:</strong> Simulate a dual-income household. The engine perfectly isolates tax brackets so you aren't hit with a joint-income penalty.
                        </li>
                        <li>
                            <strong className="text-slate-900 dark:text-white">📊 Cash Flow Anatomy:</strong> A new 100% stacked bar chart that shows exactly how your Gross Salary is divided between Taxes, Investments, EMIs, and Disposable Income.
                        </li>
                        <li>
                            <strong className="text-slate-900 dark:text-white">🌪️ Life Event Shocks [   BETA]:</strong> Add houses, weddings, and EMIs in today's money. The engine auto-inflates the costs and drains your corpus dynamically.
                        </li>
                    </ul>
                </section>

                {/* 2. Mode Comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-brand-blue">
                            <Zap size={18} />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Simple Mode</h3>
                        </div>
                        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• <strong>Focus:</strong> Speed & Cash Flow.</li>
                            <li>• <strong>Assumption:</strong> Standard Tax deductions.</li>
                            <li>• <strong>Visuals:</strong> Includes Compounding Graph.</li>
                            <li>• <strong>Best for:</strong> Quick estimations and beginners.</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-brand-green">
                            <ShieldCheck size={18} />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Pro Mode</h3>
                        </div>
                        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• <strong>Focus:</strong> Precision & Tax Optimization.</li>
                            <li>• <strong>Features:</strong> EPF, VPF Shadow Strategy.</li>
                            <li>• <strong>Logic:</strong> Tracks overflows at ₹2.5L limit.</li>
                            <li>• <strong>Best for:</strong> High Net Worth individuals.</li>
                        </ul>
                    </div>
                </div>

                {/* 3. The Math & Assumptions */}
                <section className="bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-100 dark:border-white/5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white mb-3">
                        <BookOpen size={16} /> Key Assumptions
                    </h3>
                    <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                        <p>
                            <strong>1. Disposable Income Logic:</strong> <br /> We deduct <span className="text-brand-danger font-bold">12%</span> (Employee Share) from your Gross Salary to calculate cash flow. The Employer's share is added directly to your Net Worth corpus but does not affect monthly cash in hand. Out of the employer's <span className="text-brand-danger font-bold">12%</span>, only <span className="text-brand-danger font-bold">3.67%</span> is added to the EPF corpus, while the remaining <span className="text-brand-danger font-bold">8.33%</span> is pushed into the <span className="text-brand-danger font-bold">Employee Pension Fund (EPS)</span> (EPF's sibling that we don't track) and is not part of your investable corpus.
                        </p>
                        <p>
                            <strong>2. Inflation Reality:</strong> <br /> The "Retirement Phase" calculates purchasing power using a standard 6% inflation rate. 1 Crore today is not 1 Crore in 20 years.
                        </p>
                        <p>
                            <strong>3. Tax Regime:</strong> <br />Pro Mode estimates tax liability based on current New Regime slabs. It is an approximation, not a CA-certified filing.
                        </p>
                        <p>
                            <strong>4. Salary Growth:</strong> <br /> In real life, career growth is not linear, neither is it predictable. Fiducia allows you to enter a fixed percentage that can be representative of your career growth, even if it is not exactly accurate. This was a necessary step to avoid further convolution in simulating finances.
                        </p>
                    </div>
                </section>

                {/* 4. Disclaimer */}
                <div className="flex gap-3 p-4 bg-brand-danger/5 border border-brand-danger/10 rounded-xl">
                    <AlertTriangle size={20} className="text-brand-danger shrink-0" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        <strong>Disclaimer:</strong> This tool is for educational and simulation purposes only. It does not constitute financial advice. The taxation system is non-changable and fixed to the "New Tax Regime" of FY 2025-26. Market returns are volatile, and tax laws (e.g., Section 80C, 80CCD) change frequently. Please consult a SEBI-registered advisor before making investment decisions.
                    </p>
                </div>
            </div>
        </div>

        {/* Footer Action */}
        <div className="shrink-0 p-6 pt-4 border-t border-slate-100 dark:border-white/5 bg-transparent rounded-b-3xl">
            <button 
                onClick={onClose}
                className="btn-primary w-full py-3 text-sm font-bold"
            >
                Acknowledge & Enter Fiducia
            </button>
        </div>

      </div>
    </div>
  );
}