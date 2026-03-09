import { FinancialProvider, useFinancialData } from './context/FinancialContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Accumulation Components
import { SIPCard } from './components/dashboard/inputs/SIPCard';
import { SavingsCard } from './components/dashboard/inputs/SavingsCard';
import { EPFCard } from './components/dashboard/inputs/EPFCard';
import { VPFCard } from './components/dashboard/inputs/VPFCard';
import { NetWorthBanner } from './components/dashboard/summary/NetWorthBanner';
import { WealthChart } from './components/dashboard/charts/WealthChart';
import { ResultsSection } from './components/dashboard/tables/ResultsSection';

// Retirement Components
import { InflationCard } from './components/dashboard/retirement/InflationCard';
import { SWPCard } from './components/dashboard/retirement/SWPCard';
import { SWPTable } from './components/dashboard/retirement/SWPTable';

const Dashboard = () => {
  const { isProMode } = useFinancialData();

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 py-8 grid gap-8">
            
      {/* === ACCUMULATION PHASE === */}
      <NetWorthBanner />

      {/* INPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 1. Income Details (Simple) / EPF (Pro) */}
          <EPFCard />
          
          {/* 2. SIP Investment */}
          <SIPCard />
          
          {/* 3. Savings */}
          <SavingsCard />
          
          {/* 4. VPF (Pro Only) */}
          {isProMode && <VPFCard />}
      </div>

      {/* VISUALIZATION */}
      {/* Simple Mode: Show Chart | Pro Mode: Hide Chart */}
      {!isProMode && <WealthChart />}

      {/* DATA TABLES */}
      <ResultsSection />

      {/* === RETIREMENT PHASE === */}
      <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              🏝️ Retirement Planning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <InflationCard />
              <SWPCard />
          </div>

          <SWPTable />
      </div>
      
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