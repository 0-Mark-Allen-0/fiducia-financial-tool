import React, { useState } from 'react';
import { MontiqProvider } from './context/MontiqContext';
import { MontiqHeader } from './components/MontiqHeader';
import { AssetBuilder } from './components/AssetBuilder';
import { StrategyDeck } from './components/StrategyDeck';
import { ConfidenceChart } from './components/ConfidenceChart';
import { MontiqInfoModal } from './components/MontiqInfoModal';
import { Info } from 'lucide-react';
import { MontiqFooter } from './components/MontiqFooter';

// Simplified Surface Group with external Modal Trigger
const SurfaceGroup = ({ title, children, delayClass = "", onInfoClick }) => (
  <section className={`p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${delayClass} font-sans w-full`}>
    
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {title}
      </h2>
      {onInfoClick && (
        <button 
          onClick={onInfoClick} 
          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-full transition-all"
          title={`Learn about ${title}`}
        >
          <Info size={20} />
        </button>
      )}
    </div>
    
    {children}
  </section>
);

export function MontiqApp() {
  // Global modal state for Montiq
  const [activeModal, setActiveModal] = useState(null); // 'config' | 'tactics' | 'projections' | null

  return (
    <MontiqProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-300 flex flex-col font-sans relative">
        
        <MontiqHeader />
        
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 py-8 sm:py-12 flex flex-col gap-10 sm:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black z-0 text-white p-8 md:p-10 rounded-[32px] text-center shadow-2xl relative overflow-hidden group mb-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-brand-blue/20 blur-[100px] rounded-full group-hover:bg-brand-blue/30 transition-all duration-700"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Retirement Stress Test
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Configure your asset allocation, define your spending needs, and test your portfolio against 1,000 alternate lifetimes of historical market chaos.
              </p>
            </div>
          </div>

          <SurfaceGroup 
            title="Configuration" 
            delayClass="delay-100" 
            onInfoClick={() => setActiveModal('config')}
          >
            <AssetBuilder />
          </SurfaceGroup>

          <SurfaceGroup 
            title="Mitigation Tactics" 
            delayClass="delay-200" 
            onInfoClick={() => setActiveModal('tactics')}
          >
            <StrategyDeck />
          </SurfaceGroup>

          <SurfaceGroup 
            title="Stochastic Projections" 
            delayClass="delay-300" 
            onInfoClick={() => setActiveModal('projections')}
          >
            <ConfidenceChart />
          </SurfaceGroup>

        </main>

        {/* The Isolated Modal Component */}
        <MontiqInfoModal 
           activeModal={activeModal} 
           onClose={() => setActiveModal(null)} 
        />

        <MontiqFooter />
        
      </div>
    </MontiqProvider>
  );
}