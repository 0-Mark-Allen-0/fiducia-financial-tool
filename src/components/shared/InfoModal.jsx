import { useEffect, useState } from 'react';
import { X, ShieldCheck, Zap, AlertTriangle, BookOpen } from 'lucide-react';
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
          "relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 transition-all duration-300 transform",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Fiducia <span className="text-brand-blue text-xs uppercase tracking-widest border border-brand-blue/20 px-2 py-0.5 rounded-full">v1.0</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sovereign Wealth Planning Engine</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-8">
            
            {/* 1. Philosophy */}
            <section>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Fiducia</strong> is a lifecycle simulator designed to project your financial truth from today until retirement. Unlike standard calculators, it uses a <strong>"Shadow Ledger"</strong> system to track tax-free vs. taxable buckets separately.
                </p>
            </section>

            {/* 2. Mode Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10">
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

                <div className="p-4 rounded-2xl bg-brand-green/5 border border-brand-green/10">
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
                        <strong>1. Disposable Income Logic:</strong> We deduct <span className="text-brand-danger font-bold">12%</span> (Employee Share) from your Gross Salary to calculate cash flow. The Employer's 12% is added directly to your Net Worth corpus but does not affect monthly cash in hand.
                    </p>
                    <p>
                        <strong>2. Inflation Reality:</strong> The "Retirement Phase" calculates purchasing power using a standard 6% inflation rate. 1 Crore today is not 1 Crore in 20 years.
                    </p>
                    <p>
                        <strong>3. Tax Regime:</strong> Pro Mode estimates tax liability based on current New Regime slabs. It is an approximation, not a CA-certified filing.
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

        {/* Footer Action */}
        <div className="p-6 pt-0">
            <button 
                onClick={onClose}
                className="btn-primary w-full py-3 text-sm"
            >
                Acknowledge & Enter Fiducia
            </button>
        </div>

      </div>
    </div>
  );
}