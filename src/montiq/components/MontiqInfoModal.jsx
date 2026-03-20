import React, { useEffect, useState } from 'react';
import { X, Info, Droplets, ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export function MontiqInfoModal({ activeModal, onClose }) {
  const [shouldRender, setShouldRender] = useState(false);

  // Handle animation mounting
  useEffect(() => {
    if (activeModal) setShouldRender(true);
  }, [activeModal]);

  const onAnimationEnd = () => {
    if (!activeModal) setShouldRender(false);
  };

  if (!shouldRender) return null;

  // --- CONTENT ROUTER ---
  let title = "";
  let content = null;

  if (activeModal === 'config') {
    title = "Configuration";
    content = (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">This section establishes the absolute baseline of your retirement plan.</p>
        <ul className="space-y-4 mt-3 text-sm text-slate-600 dark:text-slate-300">
          <li><strong className="text-slate-900 dark:text-white">Starting Corpus:</strong> The total liquid nest egg you are bringing into retirement.</li>
          <li className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
             <strong className="text-slate-900 dark:text-white block mb-2">Asset Mix:</strong>
             <ul className="space-y-3">
               <li className="flex items-start gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-purple mt-1.5 shrink-0"></div>
                   <div><span className="text-brand-purple font-bold">Equity:</span> High growth, but high volatility. Assumes a 12.5% LTCG tax drag.</div>
               </li>
               <li className="flex items-start gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
                   <div><span className="text-brand-blue font-bold">Debt:</span> Stable yield, lower growth. Assumes a standard 30% slab tax drag.</div>
               </li>
               <li className="flex items-start gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 shrink-0"></div>
                   <div><span className="text-brand-green font-bold">Cash:</span> Zero volatility, but loses to inflation. Crucial for safety nets.</div>
               </li>
             </ul>
          </li>
          <li><strong className="text-slate-900 dark:text-white">Monthly Lifestyle:</strong> Splitting your expenses into <em>Essential</em> (must-haves) and <em>Discretionary</em> (nice-to-haves) allows the engine to dynamically cut your spending during market crashes if you activate Guardrails.</li>
        </ul>
      </div>
    );
  } else if (activeModal === 'tactics') {
    title = "Mitigation Tactics";
    content = (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed"><strong>Sequence of Returns Risk (SRR)</strong> is the danger of a massive market crash happening early in your retirement. These tactics help you survive it.</p>
        
        <div className="space-y-3 mt-4">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-blue flex items-center gap-2 mb-1"><Droplets size={16}/> Cash Bucketing</strong> 
            <p className="text-xs leading-relaxed">If the market crashes, the engine stops selling your Equity at a loss. It drains your Cash buffer instead, giving your investments time to recover.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-purple flex items-center gap-2 mb-1"><ShieldAlert size={16}/> Dynamic Guardrails</strong> 
            <p className="text-xs leading-relaxed">If your portfolio drops by your trigger percentage, the engine automatically cuts your <em>Discretionary</em> spending to preserve your remaining capital.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <strong className="text-brand-orange flex items-center gap-2 mb-1"><TrendingUp size={16}/> Equity Glidepath (Bond Tent)</strong> 
            <p className="text-xs leading-relaxed">Start retirement heavily in safe Debt. Over time, slowly sell Debt to buy Equity, ensuring you have the growth needed to survive late-stage inflation.</p>
          </div>
        </div>

        <div className="p-4 bg-brand-danger/5 border border-brand-danger/20 rounded-xl mt-4 flex gap-3 items-start">
           <Info className="text-brand-danger shrink-0 mt-0.5" size={18} />
           <div>
             <strong className="text-brand-danger text-xs uppercase tracking-wider block mb-1">Important Logic Rule</strong>
             <p className="text-xs text-brand-danger/80 leading-relaxed">Cash Bucketing and Equity Glidepaths are mutually exclusive. You cannot spend down your safe cash while simultaneously trying to buy more equity!</p>
           </div>
        </div>
      </div>
    );
  } else if (activeModal === 'projections') {
    title = "Stochastic Projections";
    content = (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="leading-relaxed">We run your portfolio through <strong>1,000 alternate lifetimes</strong> using actual historical Nifty 50 and Bond yields to find your true probability of success. The annual growth and inflation values are pulled from Nifty 50 and CPI, respectively.</p>
        
        <div className="space-y-3 mt-4">
           <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5">
              <strong className="text-brand-green flex items-center gap-2"><div className="w-4 h-0 border-t-2 border-dashed border-brand-green"></div> Top 10% (The Dream)</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">The 90th percentile. You retired right before a massive bull market. You will leave behind generational wealth.</p>
           </div>
           
           <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5">
              <strong className="text-brand-blue flex items-center gap-2"><div className="w-4 h-4 bg-brand-blue/20 border-t-2 border-brand-blue"></div> Median (The Reality)</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">The 50th percentile. The most likely, statistically average outcome of your retirement based on historical data.</p>
           </div>
           
           <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5">
              <strong className="text-brand-danger flex items-center gap-2"><div className="w-4 h-0 border-t-2 border-brand-danger"></div> Bottom 10% (The Nightmare)</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">The 10th percentile. You retired right into a massive market crash. If this line hits ₹0, your current strategy is not safe and you will run out of money.</p>
           </div>
        </div>
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={clsx(
          "relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 transform",
          activeModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Sticky Header */}
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
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-inset py-6 pl-6 pr-4 mr-2">
            {content}
        </div>

        {/* Footer Action */}
        <div className="shrink-0 p-6 pt-4 border-t border-slate-100 dark:border-white/5 bg-transparent rounded-b-3xl">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
                <CheckCircle2 size={18} /> Understood!
            </button>
        </div>
      </div>
    </div>
  );
}