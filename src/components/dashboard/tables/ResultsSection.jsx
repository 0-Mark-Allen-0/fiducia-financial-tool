import React, { useState } from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit, cleanForCSV } from '../../../utils/format';
import { Table } from '../../shared/Table';
import { Tabs } from '../../shared/Tabs';
import { clsx } from 'clsx';
import { PauseCircle, Zap, ArrowRightCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react'; 

export function ResultsSection() {
  const { dashboardData, isProMode } = useFinancialData();
  const [activeTab, setActiveTab] = useState('salary');

  // --- TAB CONFIGURATION ---
  const TABS = isProMode 
    ? [
        { id: 'salary', label: 'Salary Preview' },
        { id: 'sip', label: 'SIP Portfolio' },
        { id: 'sav', label: 'Savings' },
        { id: 'epf', label: 'EPF' },
        { id: 'vpf', label: 'VPF' },
        { id: 'networth', label: 'Net Worth' },
      ]
    : [
        { id: 'salary', label: 'Salary Preview' },
        { id: 'sip', label: 'SIP Portfolio' },
        { id: 'sav', label: 'Savings' },
        { id: 'networth', label: 'Net Worth' },
      ];

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
    const headers = [
      "Year", 
      "Gross (Monthly)", 
      "Post-Tax (Monthly)", 
      "Disposable (Monthly)", 
      "Gross (Yearly)",
      "Post-Tax (Yearly)",
      "Disposable (Yearly)"
    ];
    
return (
      <div className="w-full">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <Table 
          title="Salary & Disposable Income Analysis" 
          subTitle="Breakdown of earnings, taxes, and purchasing power (Nominal & Real)."
          headers={headers}
          onExport={() => exportCSV('Salary_Projection', headers, dashboardData.netWorthSeries.map((d, i) => {
             const sal = dashboardData.salarySeries[i];
             return [
               d.year, 
               sal.monthlyGross, 
               sal.netYearly / 12, 
               d.disposableNominal / 12, 
               sal.grossYearly,
               sal.netYearly,
               d.disposableNominal
             ];
          }))}
        >
          {dashboardData.netWorthSeries.map((d, i) => {
            const sal = dashboardData.salarySeries[i];
            const epf = dashboardData.epfSeries[i] || {};

            return (
              <tr key={d.year} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-500">{d.year}</td>
                
                {/* MONTHLY BLOCK */}
                <td className="px-6 py-4 font-medium">
                   <div>{formatCurrency(sal.monthlyGross)}</div>
                   <div className="text-xs text-slate-400">Real: {formatCurrency(sal.monthlyGrossReal)}</div>
                </td>
                
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div>{formatCurrency(sal.netYearly / 12)}</div>
                    <div className="text-xs text-slate-400">Real: {formatCurrency(sal.netYearlyReal / 12)}</div>
                </td>

                <td className={clsx("px-6 py-4 font-bold", d.isNegative ? "text-brand-danger bg-brand-danger/10" : "text-brand-green")}>
                  <div>{formatCurrency(d.disposableNominal / 12)}</div>
                  <div className={clsx("text-xs font-normal", d.isNegative ? "text-brand-danger/70" : "text-brand-green/70")}>
                      Real: {formatCurrency(d.disposableReal / 12)}
                  </div>
                </td>

                {/* YEARLY BLOCK */}
                <td className="px-6 py-4 font-medium bg-slate-50/30 dark:bg-white/5 border-l border-slate-200 dark:border-white/10">
                   <div>{formatCurrency(sal.grossYearly)}</div>
                   <div className="text-xs text-slate-400">Real: {formatCurrency(sal.monthlyGrossReal * 12)}</div>
                </td>

                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 bg-slate-50/30 dark:bg-white/5">
                    <div>{formatCurrency(sal.netYearly)}</div>
                    <div className="text-xs text-slate-400">Real: {formatCurrency(sal.netYearlyReal)}</div>
                </td>

                <td className={clsx("px-6 py-4 font-bold relative bg-slate-50/30 dark:bg-white/5", d.isNegative ? "text-brand-danger bg-brand-danger/10" : "text-brand-green")}>
                  <div className="flex items-center gap-2">
                      {formatCurrency(d.disposableNominal)}
                      {/* Capped / Min Indicators */}
                      {(epf.isEpfCapped || epf.isEpfMinimum) && (
                          <span className="text-[8px] uppercase tracking-wider bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded flex items-center gap-0.5" title={epf.isEpfMinimum ? "Statutory Minimum Active" : "Smart Cap Active"}>
                              <Zap size={8} /> {epf.isEpfMinimum ? 'Min' : 'Capped'}
                          </span>
                      )}
                  </div>
                  <div className={clsx("text-xs font-normal", d.isNegative ? "text-brand-danger/70" : "text-brand-green/70")}>
                      Real: {formatCurrency(d.disposableReal)}
                  </div>
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
    const headers = ["Year", "Net Worth (Nominal)", "Net Worth (Real)", "YoY Growth"];
    
    return (
      <div className="w-full">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <Table 
          title="Total Net Worth Projection"
          subTitle="Aggregated value of all assets (SIP + Savings + EPF + VPF)"
          headers={headers}
          onExport={() => exportCSV('Net_Worth_Total', headers, dashboardData.netWorthSeries.map((d, index) => {
            const prevNominal = index > 0 ? dashboardData.netWorthSeries[index - 1].netWorthNominal : 0;
            const yoyGrowth = prevNominal > 0 ? ((d.netWorthNominal - prevNominal) / prevNominal) * 100 : 0;
            const displayYoY = prevNominal > 0 ? `${yoyGrowth.toFixed(2)}%` : 'N/A';
            return [d.year, d.netWorthNominal, d.netWorthReal, displayYoY];
          }))}
        >
          {dashboardData.netWorthSeries.map((d, index) => {
            // NEW: YoY Math Logic
            const prevNominal = index > 0 ? dashboardData.netWorthSeries[index - 1].netWorthNominal : 0;
            const yoyGrowth = prevNominal > 0 ? ((d.netWorthNominal - prevNominal) / prevNominal) * 100 : 0;

            return (
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
                
                {/* NEW: YoY Growth Column */}
                <td className="px-6 py-4 font-medium">
                   {prevNominal > 0 ? (
                      <span className={clsx(
                          "flex items-center gap-1 text-sm font-bold", 
                          yoyGrowth >= 0 ? "text-brand-green" : "text-brand-danger"
                      )}>
                         {yoyGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} 
                         {Math.abs(yoyGrowth).toFixed(2)}%
                      </span>
                   ) : (
                      <span className="text-slate-400 opacity-50 font-medium">—</span>
                   )}
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    );
  }

  // 3. SIP / SAVINGS / EPF / VPF (Generic Logic)
  let currentSeries = [];
  let title = "";
  let colorClass = "";

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
        {currentSeries.map((d, index) => {
          const isTransitionRow = !d.isActive && index > 0 && currentSeries[index - 1].isActive;

          return (
            <React.Fragment key={d.year}>
              
              {isTransitionRow && (
                <tr>
                  <td colSpan={5} className="bg-brand-blue/5 dark:bg-brand-blue/10 px-6 py-3 border-y border-brand-blue/20">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                      <PauseCircle size={14} />
                      Contributions Stopped — Passive Compounding Phase
                    </div>
                  </td>
                </tr>
              )}

              <tr className={clsx(
                "transition-colors",
                d.isActive 
                  ? "hover:bg-black/5 dark:hover:bg-white/5" 
                  : "opacity-60 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              )}>
                <td className="px-6 py-4 font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    {d.year}
                    {!d.isActive && (
                      <span className="text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        Passive
                      </span>
                    )}
                    {/* STRATEGY BADGES ON THE YEAR */}
                    {activeTab === 'epf' && d.isEpfCapped && (
                       <span className="text-[9px] font-bold uppercase bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Zap size={10} /> Smart Capped
                       </span>
                    )}
                    {activeTab === 'vpf' && d.isVpfDiverted && (
                       <span className="text-[9px] font-bold uppercase bg-brand-purple/10 text-brand-purple px-1.5 py-0.5 rounded flex items-center gap-1">
                           <ArrowRightCircle size={10} /> Diverted
                       </span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                    <div className="font-medium">{formatCurrency(d.monthlyNominal)}</div>
                    <div className="text-xs text-slate-400">Real: {formatCurrency(d.monthlyReal)}</div>
                </td>

                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 relative">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(d.yearlyNominal)}</span>
                        {/* DIVERSION RECEIVED BADGE */}
                        {(activeTab === 'sip' || activeTab === 'sav') && d.isReceivingDiversion && (
                           <span className="text-[9px] font-bold uppercase bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded flex items-center gap-1">
                               <ArrowDownCircle size={10} /> Received Diversion
                           </span>
                        )}
                    </div>

                    {/* Explicitly show Employee Share for EPF to avoid 2.5L limit confusion */}
                    {activeTab === 'epf' ? (
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                            Emp Share: <span className={d.yearlyEmployeeNominal > 250000 ? "text-brand-danger" : "text-brand-blue"}>
                                {formatCurrency(d.yearlyEmployeeNominal)}
                            </span>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 mt-0.5">Real: {formatCurrency(d.yearlyReal)}</div>
                    )}
                </td>

                <td className={clsx("px-6 py-4 font-bold", colorClass)}>
                    {formatCurrency(d.corpusNominal)}
                    <span className="text-xs font-normal text-slate-400 ml-1">{formatUnit(d.corpusNominal)}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {formatCurrency(d.corpusReal)}
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </Table>
    </div>
  );
}