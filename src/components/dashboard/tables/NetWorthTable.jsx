import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit, cleanForCSV } from '../../../utils/format';
import { Download } from 'lucide-react';

export function NetWorthTable() {
  const { dashboardData } = useFinancialData();
  const { series } = dashboardData;

  const downloadCSV = () => {
    const headers = ["Year", "SIP (Nominal)", "SIP (Real)", "Savings (Nominal)", "Savings (Real)", "EPF (Nominal)", "EPF (Real)", "Net Worth (Nominal)", "Net Worth (Real)"];
    
    const rows = series.map(d => [
      d.year,
      cleanForCSV(d.sip.investedNominal), // Just an example of what to export, usually we export Values not Flow
      cleanForCSV(d.sip.valueReal),
      cleanForCSV(d.sav.valueNominal),
      cleanForCSV(d.sav.valueReal),
      cleanForCSV(d.epf.valueNominal),
      cleanForCSV(d.epf.valueReal),
      cleanForCSV(d.total.nominal),
      cleanForCSV(d.total.real)
    ]);

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
            {series.map((row) => (
              <tr key={row.year} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-500">{row.year}</td>
                
                <td className="px-6 py-3">
                    <div>{formatCurrency(row.sip.valueNominal)}</div>
                    <div className="text-xs text-slate-400">{formatUnit(row.sip.valueNominal)}</div>
                </td>
                
                <td className="px-6 py-3 text-brand-purple/80">
                    <div>{formatCurrency(row.sip.valueReal)}</div>
                </td>

                <td className="px-6 py-3 hidden md:table-cell text-slate-500">
                    {formatCurrency(row.sav.valueNominal)}
                </td>

                <td className="px-6 py-3">
                    <div>{formatCurrency(row.epf.valueNominal)}</div>
                    <div className="text-xs text-slate-400">{formatUnit(row.epf.valueNominal)}</div>
                </td>

                <td className="px-6 py-3 font-bold text-slate-900 dark:text-white bg-slate-50/30 dark:bg-white/5">
                    <div>{formatCurrency(row.total.nominal)}</div>
                    <div className="text-xs text-slate-500 font-normal">{formatUnit(row.total.nominal)}</div>
                </td>

                <td className="px-6 py-3 font-bold text-brand-green bg-brand-green/5">
                    <div>{formatCurrency(row.total.real)}</div>
                    <div className="text-xs opacity-70 font-normal">{formatUnit(row.total.real)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}