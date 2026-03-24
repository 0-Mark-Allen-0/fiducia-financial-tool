import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit, cleanForCSV } from '../../../utils/format';
import { Download } from 'lucide-react';

export function SWPTable() {
  const { dashboardData, isProMode } = useFinancialData();
  const { swpSeries } = dashboardData;

  const downloadCSV = () => {
    // Dynamically expand headers based on Mode
    const headers = isProMode 
        ? ["Year", "Monthly Draw (Nominal)", "Monthly Draw (Real)", "Est. Tax", "Equity Bucket", "Debt Bucket", "Cash Bucket", "Portfolio (Nominal)", "Portfolio (Real)"]
        : ["Year", "Monthly Draw (Nominal)", "Monthly Draw (Real)", "Portfolio (Nominal)", "Portfolio (Real)"];
    
    const rows = swpSeries.map(d => {
        const baseRow = [
            d.year,
            cleanForCSV(d.withdrawalMonthlyNominal), 
            cleanForCSV(d.withdrawalMonthlyReal)
        ];
        
        if (isProMode) {
            baseRow.push(
               cleanForCSV(d.taxNominal),
               cleanForCSV(d.eqNominal),
               cleanForCSV(d.dbNominal),
               cleanForCSV(d.csNominal)
            );
        }
        
        baseRow.push(cleanForCSV(d.portfolioNominal), cleanForCSV(d.portfolioReal));
        return baseRow;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Retirement_SWP_Plan.csv";
    link.click();
  };

  return (
    <div className="glass-card w-full overflow-hidden mt-8">
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/40 dark:bg-black/20">
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Withdrawal Projection</h3>
            <p className="text-xs text-slate-500">
                {isProMode ? "* Tax = Estimated LTCG | " : "* "}
                (I-A) = Inflation Adjusted
            </p>
        </div>
        <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm font-semibold text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 px-4 py-2 rounded-lg transition-colors"
        >
            <Download size={16} /> CSV
        </button>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
            <tr>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">Monthly Draw</th> 
              
              {isProMode && (
                  <>
                      <th className="px-6 py-4 text-brand-danger">Est. Tax</th>
                      <th className="px-6 py-4 text-brand-purple">Equity</th>
                      <th className="px-6 py-4 text-brand-blue">Debt</th>
                      <th className="px-6 py-4 text-brand-green">Cash</th>
                  </>
              )}
              
              <th className="px-6 py-4 text-slate-900 dark:text-white">Portfolio (Nominal)</th>
              <th className="px-6 py-4 text-brand-green">Portfolio (I-A)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {swpSeries.map((row) => {
                return (
                  <tr key={row.year} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-500">{row.year}</td>
                    
                    <td className="px-6 py-3 text-brand-orange font-medium">
                        <div>{formatCurrency(row.withdrawalMonthlyNominal)}</div>
                        <div className="text-xs opacity-70">Real: {formatCurrency(row.withdrawalMonthlyReal)}</div>
                    </td>
                    
                    {isProMode && (
                        <>
                            <td className="px-6 py-3 text-brand-danger/80">
                                <div>{formatCurrency(row.taxNominal)}</div>
                            </td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                {formatUnit(row.eqNominal)}
                            </td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                {formatUnit(row.dbNominal)}
                            </td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                {formatUnit(row.csNominal)}
                            </td>
                        </>
                    )}

                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">
                        <div>{formatCurrency(row.portfolioNominal)}</div>
                        <div className="text-xs text-slate-400 font-normal">{formatUnit(row.portfolioNominal)}</div>
                    </td>

                    <td className="px-6 py-3 font-bold text-brand-green bg-brand-green/5">
                        <div>{formatCurrency(row.portfolioReal)}</div>
                        <div className="text-xs opacity-70 font-normal">{formatUnit(row.portfolioReal)}</div>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}