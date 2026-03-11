import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit, cleanForCSV } from '../../../utils/format';
import { Download, Zap, ArrowDownCircle } from 'lucide-react';
import { clsx } from 'clsx'; 

export function NetWorthTable() {
  const { dashboardData } = useFinancialData();
  const { netWorthSeries, sipSeries, savSeries, epfSeries } = dashboardData;

  const downloadCSV = () => {
    const headers = [
      "Year", 
      "SIP (Nominal)", "SIP (Real)", 
      "Savings (Nominal)", "Savings (Real)", 
      "EPF (Nominal)", "EPF (Real)", 
      "Net Worth (Nominal)", "Net Worth (Real)"
    ];
    
    const rows = netWorthSeries.map((d, i) => {
      const sip = sipSeries[i] || {};
      const sav = savSeries[i] || {};
      const epf = epfSeries[i] || {};

      return [
        d.year,
        cleanForCSV(sip.corpusNominal || 0), 
        cleanForCSV(sip.corpusReal || 0),
        cleanForCSV(sav.corpusNominal || 0),
        cleanForCSV(sav.corpusReal || 0),
        cleanForCSV(epf.corpusNominal || 0),
        cleanForCSV(epf.corpusReal || 0),
        cleanForCSV(d.netWorthNominal || 0),
        cleanForCSV(d.netWorthReal || 0)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Net_Worth_Projection.csv";
    link.click();
  };

  return (
    <div className="glass-card w-full overflow-hidden">
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/40 dark:bg-black/20">
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Projection Table</h3>
            <p className="text-xs text-slate-500">* I-A = Inflation Adjusted</p>
        </div>
        <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm font-semibold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-4 py-2 rounded-lg transition-colors"
        >
            <Download size={16} /> CSV
        </button>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
            <tr>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">SIP Value (Nominal)</th>
              <th className="px-6 py-4 text-brand-purple">SIP Value (I-A)</th>
              <th className="px-6 py-4 hidden md:table-cell">Savings (Nominal)</th>
              <th className="px-6 py-4">EPF Value (Nominal)</th>
              <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Net Worth (Nominal)</th>
              <th className="px-6 py-4 font-bold text-brand-green">Net Worth (I-A)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {netWorthSeries.map((row, i) => {
              const sipItem = sipSeries[i] || {};
              const savItem = savSeries[i] || {};
              const epfItem = epfSeries[i] || {};

              return (
                <tr key={row.year} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-500">{row.year}</td>
                  
                  {/* SIP NOMINAL CELL */}
                  <td className={clsx("px-6 py-3 transition-all", sipItem.isActive ? "" : "opacity-60 bg-slate-50/50 dark:bg-white/[0.02]")}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                              {formatCurrency(sipItem.corpusNominal || 0)}
                              {/* Diversion Received Indicator */}
                              {sipItem.isReceivingDiversion && <ArrowDownCircle size={12} className="text-brand-green" title="Received Diverted Funds" />}
                          </div>
                          <div className="text-xs text-slate-400">{formatUnit(sipItem.corpusNominal || 0)}</div>
                        </div>
                        {!sipItem.isActive && (
                          <span className="text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            Passive
                          </span>
                        )}
                      </div>
                  </td>
                  
                  {/* SIP REAL CELL */}
                  <td className={clsx("px-6 py-3 text-brand-purple/80 transition-all", sipItem.isActive ? "" : "opacity-60 bg-slate-50/50 dark:bg-white/[0.02]")}>
                      <div>{formatCurrency(sipItem.corpusReal || 0)}</div>
                  </td>

                  {/* SAVINGS NOMINAL CELL */}
                  <td className={clsx("px-6 py-3 hidden md:table-cell transition-all text-slate-500", savItem.isActive ? "" : "opacity-60 bg-slate-50/50 dark:bg-white/[0.02]")}>
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {formatCurrency(savItem.corpusNominal || 0)}
                            {savItem.isReceivingDiversion && <ArrowDownCircle size={12} className="text-brand-green" title="Received Diverted Funds" />}
                          </div>
                        {!savItem.isActive && (
                          <span className="text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 ml-2">
                            Passive
                          </span>
                        )}
                      </div>
                  </td>

                  {/* EPF NOMINAL CELL */}
                  <td className={clsx("px-6 py-3 transition-all", epfItem.isActive ? "" : "opacity-60 bg-slate-50/50 dark:bg-white/[0.02]")}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                              {formatCurrency(epfItem.corpusNominal || 0)}
                              {/* Capped Indicator */}
                              {epfItem.isEpfCapped && <Zap size={12} className="text-brand-blue" title="Smart Cap Active" />}
                          </div>
                          <div className="text-xs text-slate-400">{formatUnit(epfItem.corpusNominal || 0)}</div>
                        </div>
                        {!epfItem.isActive && (
                          <span className="text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            Passive
                          </span>
                        )}
                      </div>
                  </td>

                  {/* NET WORTH NOMINAL */}
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white bg-slate-50/30 dark:bg-white/5">
                      <div>{formatCurrency(row.netWorthNominal)}</div>
                      <div className="text-xs text-slate-500 font-normal">{formatUnit(row.netWorthNominal)}</div>
                  </td>

                  {/* NET WORTH REAL */}
                  <td className="px-6 py-3 font-bold text-brand-green bg-brand-green/5">
                      <div>{formatCurrency(row.netWorthReal)}</div>
                      <div className="text-xs opacity-70 font-normal">{formatUnit(row.netWorthReal)}</div>
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