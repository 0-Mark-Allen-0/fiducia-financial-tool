import { useMemo } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit } from '../../../utils/format';

export function NetWorthBanner() {
  const { dashboardData } = useFinancialData();
  const { summary, sipSeries, savSeries, epfSeries, vpfSeries } = dashboardData;

  // Calculate "Pure Investment" (Principal) vs "Gains" (Interest)
  // We do this by summing the 'yearlyNominal' flow from all series
  const stats = useMemo(() => {
    const sumSeries = (series) => {
      if (!series) return 0;
      return series.reduce((acc, row) => acc + (row.yearlyNominal || 0), 0);
    };

    const totalInvested = sumSeries(sipSeries) + 
                          sumSeries(savSeries) + 
                          sumSeries(epfSeries) + 
                          sumSeries(vpfSeries);
    
    const totalValue = summary.total || 0;
    const totalGains = totalValue - totalInvested;

    return { totalValue, totalInvested, totalGains };
  }, [summary, sipSeries, savSeries, epfSeries, vpfSeries]);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white p-8 md:p-10 rounded-[32px] text-center shadow-2xl mb-8 relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-brand-blue/20 blur-[100px] rounded-full group-hover:bg-brand-blue/30 transition-all duration-700"></div>

      <div className="relative z-10">
        <h2 className="text-lg md:text-xl font-medium text-slate-400 mb-2">Estimated Total Net Worth</h2>
        
        <div className="flex items-baseline justify-center gap-2 mb-8">
            <span className="text-4xl md:text-6xl font-bold tracking-tighter">
                {formatCurrency(stats.totalValue)}
            </span>
            <span className="text-lg md:text-2xl text-slate-500 font-medium">
                ({formatUnit(stats.totalValue)})
            </span>
        </div>

        {/* Breakdown Pills */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 text-sm md:text-base">
            <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Pure Investment</span>
                <span className="font-semibold text-white">
                    {formatCurrency(stats.totalInvested)} <span className="text-slate-600 text-xs">({formatUnit(stats.totalInvested)})</span>
                </span>
            </div>
            
            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
            
            <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Wealth Gained</span>
                <span className="font-semibold text-brand-green">
                    +{formatCurrency(stats.totalGains)} <span className="text-slate-600 text-xs">({formatUnit(stats.totalGains)})</span>
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}