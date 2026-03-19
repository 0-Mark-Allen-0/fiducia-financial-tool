import { FinancialProvider, useFinancialData } from './context/FinancialContext';
import { Header } from './components/layout/Header';
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
import { WealthChart } from './components/dashboard/charts/WealthChart';
import { CashFlowChart } from './components/dashboard/charts/CashFlowChart';
import { ResultsSection } from './components/dashboard/tables/ResultsSection';
import { BankruptcyBanner } from './components/shared/BankruptcyBanner';

// Retirement Components
import { InflationCard } from './components/dashboard/retirement/InflationCard';
import { SWPCard } from './components/dashboard/retirement/SWPCard';
import { SWPTable } from './components/dashboard/retirement/SWPTable';

// --- NEW 3-LAYER UI COMPONENT ---
// This creates the distinct "Group Layer" that houses the individual glass cards
const SurfaceGroup = ({ title, children, delayClass = "" }) => (
  <section className={`p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${delayClass}`}>
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        {title}
    </h2>
    {children}
  </section>
);

const Dashboard = () => {
  const { isProMode } = useFinancialData();

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 py-8 flex flex-col gap-8">
      <BankruptcyBanner />
      <NetWorthBanner />

      {/* 1. LIFE SETTINGS GROUP */}
      <SurfaceGroup title="Life Settings">
         <div className={`grid grid-cols-1 ${isProMode ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
            <MasterHorizonCard />
            {isProMode && <SpouseCard />}
         </div>
      </SurfaceGroup>

      {/* 2. VARIABLES GROUP */}
      <SurfaceGroup title="Variables" delayClass="delay-100">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <EPFCard />
             <SIPCard />
             <SavingsCard />
             {isProMode && <VPFCard />}
         </div>
      </SurfaceGroup>

      {/* 3. STRATEGIES & SHOCKS GROUP */}
      {isProMode && (
         <SurfaceGroup title="Strategies & Shocks" delayClass="delay-200">
            {/* Using flex-col forces these to take 100% of the row width */}
            <div className="flex flex-col gap-6 w-full">
                <StrategyCard />
                <LifeEventsCard />
            </div>
         </SurfaceGroup>
      )}

      {/* VISUALIZATION GROUP */}
      <SurfaceGroup title="Projections" delayClass="delay-300">
          <WealthChart />
          {isProMode && <div className="mt-6"><CashFlowChart/></div>}
      </SurfaceGroup>

      {/* DATA TABLES GROUP */}
      <SurfaceGroup title="Ledger" delayClass="delay-300">
          <ResultsSection />
      </SurfaceGroup>

      {/* === RETIREMENT PHASE === */}
      <SurfaceGroup title="Retirement Planning" delayClass="delay-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
              <InflationCard />
              <SWPCard />
          </div>
          <SWPTable />
      </SurfaceGroup>
      
    </main>
  );
};

function App() {
  return (
    <FinancialProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Dashboard />
        <Footer />
      </div>
    </FinancialProvider>
  )
}

export default App;