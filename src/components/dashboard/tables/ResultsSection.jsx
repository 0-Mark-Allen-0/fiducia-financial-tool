import { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit, cleanForCSV } from '../../../utils/format';
import { Table } from '../../shared/Table';
import { Tabs } from '../../shared/Tabs';
import { clsx } from 'clsx';

export function ResultsSection() {
  const { dashboardData, isProMode } = useFinancialData();
  const [activeTab, setActiveTab] = useState('salary');

  // --- TAB CONFIGURATION ---
  const TABS = isProMode 
    ? [
        { id: 'salary', label: 'Salary & Cash Flow' },
        { id: 'networth', label: 'Net Worth' },
        { id: 'sip', label: 'SIP Portfolio' },
        { id: 'sav', label: 'Savings/FD' },
        { id: 'epf', label: 'EPF Ledger' },
        { id: 'vpf', label: 'VPF Ledger' },
      ]
    : [
        { id: 'salary', label: 'Salary Preview' },
        { id: 'networth', label: 'Net Worth' },
        { id: 'sip', label: 'SIP Portfolio' },
        { id: 'sav', label: 'Savings' },
      ];

  // --- GENERIC EXPORT FUNCTION ---
  const exportCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cleanForCSV(cell)}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  // --- RENDERERS ---

  // 1. SALARY TABLE
  if (activeTab === 'salary') {
    const headers = ["Year", "Gross Salary (Monthly)", "Post-Tax (Yearly)", "Total Investments", "Disposable Income (Yearly)", "Disposable (I-A)"];
    
    return (
      <div className="w-full">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <Table 
          title="Salary & Disposable Income Analysis" 
          subTitle="Red highlights indicate negative cash flow (investing more than you earn)."
          headers={headers}
          onExport={() => exportCSV('Salary_Projection', headers, dashboardData.netWorthSeries.map((d, i) => {
             const sal = dashboardData.salarySeries[i];
             return [d.year, sal.monthlyGross, sal.netYearly, (sal.netYearly - d.disposableNominal), d.disposableNominal, d.disposableReal];
          }))}
        >
          {dashboardData.netWorthSeries.map((d, i) => {
            const sal = dashboardData.salarySeries[i];
            const investmentAmount = sal.netYearly - d.disposableNominal;

            return (
              <tr key={d.year} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-500">{d.year}</td>
                <td className="px-6 py-4 font-medium">{formatCurrency(sal.monthlyGross)}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatCurrency(sal.netYearly)}</td>
                <td className="px-6 py-4 text-brand-orange">{formatCurrency(investmentAmount)}</td>
                <td className={clsx(
                  "px-6 py-4 font-bold",
                  d.isNegative ? "text-brand-danger bg-brand-danger/10" : "text-brand-green"
                )}>
                  {formatCurrency(d.disposableNominal)}
                </td>
                <td className={clsx(
                    "px-6 py-4",
                    d.isNegative ? "text-brand-danger" : "text-brand-green/70"
                )}>
                    {formatCurrency(d.disposableReal)}
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    );
  }

  // 2. NET WORTH TABLE
  if (activeTab === 'networth') {
    const headers = ["Year", "Net Worth (Nominal)", "Net Worth (Real)", "Growth Rate"];
    
    return (
      <div className="w-full">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <Table 
          title="Total Net Worth Projection"
          subTitle="Aggregated value of all assets (SIP + Savings + EPF + VPF)"
          headers={headers}
          onExport={() => exportCSV('Net_Worth_Total', headers, dashboardData.netWorthSeries.map(d => [d.year, d.netWorthNominal, d.netWorthReal]))}
        >
          {dashboardData.netWorthSeries.map((d) => (
            <tr key={d.year} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-500">{d.year}</td>
              <td className="px-6 py-4 font-bold text-2xl text-slate-800 dark:text-white">
                {formatCurrency(d.netWorthNominal)}
                <span className="text-xs font-normal text-slate-400 ml-2">{formatUnit(d.netWorthNominal)}</span>
              </td>
              <td className="px-6 py-4 font-bold text-lg text-brand-green">
                {formatCurrency(d.netWorthReal)}
                <span className="text-xs font-normal text-brand-green/60 ml-2">{formatUnit(d.netWorthReal)}</span>
              </td>
              <td className="px-6 py-4 text-slate-400">-</td>
            </tr>
          ))}
        </Table>
      </div>
    );
  }

  // 3. SIP / SAVINGS / EPF / VPF (Generic Logic)
  // We map the active tab to the correct data source
  let currentSeries = [];
  let title = "";
  let colorClass = ""; // For styling specific columns

  if (activeTab === 'sip') {
    currentSeries = dashboardData.sipSeries;
    title = "SIP Portfolio Ledger";
    colorClass = "text-brand-blue";
  } else if (activeTab === 'sav') {
    currentSeries = dashboardData.savSeries;
    title = "Savings / FD Ledger";
    colorClass = "text-brand-purple";
  } else if (activeTab === 'epf') {
    currentSeries = dashboardData.epfSeries;
    title = "EPF Shadow Ledger";
    colorClass = "text-brand-green";
  } else if (activeTab === 'vpf') {
    currentSeries = dashboardData.vpfSeries;
    title = "VPF Shadow Ledger";
    colorClass = "text-brand-green";
  }

  const headers = ["Year", "Monthly Contribution", "Yearly Contribution", "Total Corpus (Nominal)", "Total Corpus (Real)"];

  return (
    <div className="w-full">
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <Table 
        title={title}
        subTitle="Breakdown of contributions and compounding growth."
        headers={headers}
        onExport={() => exportCSV(`${activeTab}_Ledger`, headers, currentSeries.map(d => [
            d.year, d.monthlyNominal, d.yearlyNominal, d.corpusNominal, d.corpusReal
        ]))}
      >
        {currentSeries.map((d) => (
          <tr key={d.year} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-500">{d.year}</td>
            <td className="px-6 py-4">
                <div className="font-medium">{formatCurrency(d.monthlyNominal)}</div>
                <div className="text-xs text-slate-400">Real: {formatCurrency(d.monthlyReal)}</div>
            </td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {formatCurrency(d.yearlyNominal)}
            </td>
            <td className={clsx("px-6 py-4 font-bold", colorClass)}>
                {formatCurrency(d.corpusNominal)}
                <span className="text-xs font-normal text-slate-400 ml-1">{formatUnit(d.corpusNominal)}</span>
            </td>
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                {formatCurrency(d.corpusReal)}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}