import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/format';
import { AlertOctagon, XCircle } from 'lucide-react';

export function BankruptcyBanner() {
  const { dashboardData } = useFinancialData();
  const alert = dashboardData.bankruptcyAlert;
  
  const [isDismissed, setIsDismissed] = useState(false);

  // 👇 BULLETPROOF DEPENDENCY ARRAY 👇
  // Only resets the dismiss state if the actual Year or Shortfall amount changes
  useEffect(() => {
    if (alert) {
      setIsDismissed(false);
    }
  }, [alert?.year, alert?.shortfall]); 

  if (!alert || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="bg-red-600 border border-red-500 shadow-2xl shadow-red-900/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 flex flex-col items-center text-center text-white animate-in zoom-in-95 duration-300">
        
        <div className="p-4 bg-red-800/50 rounded-full mb-4 ring-8 ring-red-700/50">
          <AlertOctagon size={48} className="text-red-100" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black tracking-wide mb-2">
          CRITICAL SHORTFALL
        </h2>
        
        <p className="text-base sm:text-lg text-red-50 mb-6 leading-relaxed">
          Your simulation failed in <strong className="text-white">Year {alert.year}</strong>. You are short by <strong className="text-white bg-red-900/50 px-2 py-1 rounded-md">{formatCurrency(alert.shortfall)}</strong> in your <strong>{alert.type}</strong>. 
        </p>
        
        <div className="w-full bg-red-900/30 p-4 rounded-xl mb-6 border border-red-500/30">
          <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed">
            <strong>Action Required:</strong> You must delay your planned life events, reduce your EMIs, or increase your base SIP/Savings to bridge this gap.
          </p>
        </div>

        <button 
            onClick={() => setIsDismissed(true)}
            className="w-full py-3 sm:py-4 bg-white hover:bg-red-50 text-red-700 font-bold rounded-xl text-sm sm:text-base flex justify-center items-center gap-2 transition-colors shadow-lg"
        >
            <XCircle size={20} />
            I Understand (Let me fix my inputs)
        </button>

      </div>
    </div>
  );
}