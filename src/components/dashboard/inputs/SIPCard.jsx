import { useFinancialData } from '../../../context/FinancialContext';
import { InputGroup } from '../../shared/InputGroup';
import { ResultRow } from '../../shared/ResultRow';
import { TrendingUp, CornerDownRight } from 'lucide-react';

export function SIPCard() {
  // NEW: Extracted masterHorizon from context
  const { sipInput, setSipInput, dashboardData, isProMode, vpfInput, masterHorizon } = useFinancialData();

  const update = (field, val) => setSipInput(prev => ({ ...prev, [field]: val }));

  const series = dashboardData.sipSeries || [];
  
  // Final data is taken at the end of the Master Horizon (to show total projected wealth)
  const finalData = series[series.length - 1] || {};

  const totalValue = finalData.corpusNominal || 0;
  
  // FIX: Calculate total invested correctly by summing yearlyNominal 
  // (This handles passive compounding years where yearlyNominal drops to 0)
  const totalInvested = series.reduce((acc, curr) => acc + (curr.yearlyNominal || 0), 0);
  const totalGains = totalValue - totalInvested;

  // Check if receiving funds
  const isReceiving = isProMode && vpfInput.strategy === 'sip';

  return (
    <div className={`glass-card p-6 flex flex-col h-full transition-all duration-300 ${isReceiving ? 'ring-2 ring-brand-blue/30 shadow-brand-blue/10' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-lg text-black dark:text-white">SIP Portfolio</h3>
        </div>
        
        {/* Connected Badge */}
        {isReceiving && (
            <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1 bg-brand-blue/5 px-2 py-1 rounded-full animate-pulse">
                <CornerDownRight size={12} /> EPF Overflow
            </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
            <InputGroup label="Monthly SIP (₹)" value={sipInput.amount} onChange={(v) => update('amount', v)} isCurrency />
        </div>
        <InputGroup label="Step-up (%)" value={sipInput.stepUp} onChange={(v) => update('stepUp', v)} />
        <InputGroup label="Return (%)" value={sipInput.returnRate} onChange={(v) => update('returnRate', v)} step="0.1" />
        
        {/* NEW: Passed min and max guardrails */}
        <InputGroup 
            label="Horizon (Yrs)" 
            value={sipInput.horizon} 
            onChange={(v) => update('horizon', v)} 
            min={1}
            max={masterHorizon} 
        />
      </div>

      <div className="mt-auto bg-slate-50/50 dark:bg-black/20 p-4 rounded-xl">
        <ResultRow label="Total Value" value={totalValue} />
        <ResultRow label="Wealth Gained" value={totalGains} isGain />
        
        {isReceiving && (
             <p className="text-[10px] text-brand-blue mt-2 text-center opacity-80">
                * Includes diverted funds from VPF/EPF overflow
             </p>
        )}
      </div>
    </div>
  );
}