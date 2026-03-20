import React, { useState, useEffect } from 'react';
import { FinancialProvider, useFinancialData } from './context/FinancialContext';
import { Header } from './components/layout/Header';
import { PageNav } from './components/layout/PageNav'; 
import { Footer } from './components/layout/Footer';

// Accumulation Components
import { MasterHorizonCard } from './components/dashboard/inputs/MasterHorizonCard';
import { SpouseCard } from './components/dashboard/inputs/SpouseCard';
import { EPFCard } from './components/dashboard/inputs/EPFCard';
import { SIPCard } from './components/dashboard/inputs/SIPCard';
import { SavingsCard } from './components/dashboard/inputs/SavingsCard';
import { VPFCard } from './components/dashboard/inputs/VPFCard';
import { StrategyCard } from './components/dashboard/inputs/StrategyCard';
import { LifeEventsCard } from './components/dashboard/inputs/LifeEventsCard';

// Visualizations & Tables
import { NetWorthBanner } from './components/dashboard/summary/NetWorthBanner';
import { ChartSection } from './components/dashboard/charts/ChartSection'; 
import { ResultsSection } from './components/dashboard/tables/ResultsSection';
import { BankruptcyBanner } from './components/shared/BankruptcyBanner';
import { FiduciaInfoModal } from './components/shared/FiduciaInfoModal'; 
import { MontiqBridgeModal } from './components/shared/MontiqBridgeModal'; 
import { Info, Activity } from 'lucide-react'; 

// Retirement Components
import { InflationCard } from './components/dashboard/retirement/InflationCard';
import { SWPCard } from './components/dashboard/retirement/SWPCard';
import { SWPTable } from './components/dashboard/retirement/SWPTable';

import { MontiqApp } from './montiq/MontiqApp'; 

// The Upgraded 3-Layer UI Surface Group with `headerAction` support
const SurfaceGroup = ({ id, title, children, delayClass = "", onInfoClick, headerAction }) => (
  <section id={id} className={`p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${delayClass} w-full`}>
    
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {title}
      </h2>
      
      {/* Header Controls Container */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onInfoClick && (
          <button 
            onClick={onInfoClick} 
            className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-full transition-all"
            title={`Learn about ${title}`}
          >
            <Info size={20} />
          </button>
        )}
        {/* Render custom header actions to the right of the Info button */}
        {headerAction}
      </div>
    </div>

    {children}
  </section>
);

const Dashboard = () => {
  const { isProMode } = useFinancialData();
  const [activeModal, setActiveModal] = useState(null); 
  const [isMontiqModalOpen, setIsMontiqModalOpen] = useState(false); 

  return (
    <main id="home" className="flex-grow w-full max-w-[1440px] mx-auto px-4 py-8 flex flex-col gap-10 scroll-mt-24 relative">
      <BankruptcyBanner />
      <NetWorthBanner />

      {/* 1. LIFE SETTINGS GROUP */}
      <div id="settings" className="scroll-mt-24">
        {isProMode && (
          <SurfaceGroup title="Life Settings" onInfoClick={() => setActiveModal('settings')}>
            <div className={`grid grid-cols-1 ${isProMode ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
                <MasterHorizonCard />
                <SpouseCard />
            </div>
          </SurfaceGroup>
        )}
        {!isProMode && <MasterHorizonCard />}
      </div>

      {/* 2. VARIABLES GROUP */}
      <SurfaceGroup id="variables" title="Variables" delayClass="delay-100 scroll-mt-24" onInfoClick={() => setActiveModal('variables')}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             {isProMode && <EPFCard />}
             <SIPCard />
             <SavingsCard />
             {isProMode && <VPFCard />}
         </div>
      </SurfaceGroup>

      {/* 3. STRATEGIES & SHOCKS GROUP */}
      {isProMode && (
         <SurfaceGroup id="strategies" title="Strategies & Shocks" delayClass="delay-200 scroll-mt-24" onInfoClick={() => setActiveModal('strategies')}>
            <div className="flex flex-col gap-6 w-full">
                <StrategyCard />
                <LifeEventsCard />
            </div>
         </SurfaceGroup>
      )}

      {/* 4. VISUALIZATION GROUP */}
      <SurfaceGroup id="charts" title="Visualizations" delayClass="delay-300 scroll-mt-24" onInfoClick={() => setActiveModal('charts')}>
         <ChartSection />
      </SurfaceGroup>

      {/* 5. DATA TABLES GROUP */}
      <div id="ledger" className="scroll-mt-24">
         <SurfaceGroup title="Ledger" delayClass="delay-300" onInfoClick={() => setActiveModal('ledger')}>
             <ResultsSection />
         </SurfaceGroup>
      </div>

      {/* 6. RETIREMENT PHASE */}
      <SurfaceGroup 
        id="retirement" 
        title="Retirement Planning" 
        delayClass="delay-500 scroll-mt-24" 
        onInfoClick={() => setActiveModal('retirement')}
        // NEW: Injected the minimal pill button directly into the header
        headerAction={isProMode && (
          <button
            onClick={() => setIsMontiqModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-sm"
          >
            <Activity size={14} className="text-brand-green" />
            Advanced
          </button>
        )}
      >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
              <InflationCard />
              <SWPCard />
          </div>
          <SWPTable />
      </SurfaceGroup>

      {/* Modals */}
      <FiduciaInfoModal activeModal={activeModal} onClose={() => setActiveModal(null)} />
      <MontiqBridgeModal isOpen={isMontiqModalOpen} onClose={() => setIsMontiqModalOpen(false)} />
      
    </main>
  );
};

// --- ROUTER IMPLEMENTATION ---
function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentRoute === '#/montiq') {
    return <MontiqApp />;
  }

  return (
    <FinancialProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <PageNav />
        <Dashboard />
        <Footer />
      </div>
    </FinancialProvider>
  );
}

export default App;