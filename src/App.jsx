import { FinancialProvider, useFinancialData } from './context/FinancialContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Clock } from 'lucide-react';

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

// --- NEW: MASTER HORIZON CONTROLLER ---
const MasterHorizonControl = () => {
  const { masterHorizon, updateMasterHorizon } = useFinancialData();

  return (
    <div className="glass-card p-5 mb-8 border-brand-blue/30 shadow-[0_4px_20px_rgba(0,122,255,0.08)] ring-1 ring-brand-blue/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      {/* Title & Description */}
      <div className="flex-1">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={20} className="text-brand-blue" />
          Master Projection Timeline
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
          Set the global boundary for your financial simulation. Individual instrument horizons (like SIP or EPF) will automatically cap at this limit to maintain timeline accuracy.
        </p>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[300px]">
        <input 
          type="range" 
          min="1" 
          max="75" 
          value={masterHorizon} 
          onChange={(e) => updateMasterHorizon(e.target.value)}
          className="custom-range flex-grow"
        />
        
        {/* Number Input Bubble */}
        <div className="relative shrink-0">
          <input 
            type="number"
            min="1"
            max="75"
            value={masterHorizon}
            onChange={(e) => updateMasterHorizon(e.target.value)}
            // Standardizing auto-correct on blur
            onBlur={(e) => updateMasterHorizon(e.target.value)} 
            className="input-field w-22 text-center font-bold text-brand-blue dark:text-brand-blue !py-2 !pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">
            YRS
          </span>
        </div>
      </div>

    </div>
  );
};

const Dashboard = () => {
  const { isProMode } = useFinancialData();

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 py-8 flex flex-col gap-8">
            
      {/* === ACCUMULATION PHASE === */}
      <NetWorthBanner />

      {/* --- NEW: GLOBAL CONTROLS --- */}
      <MasterHorizonControl />

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