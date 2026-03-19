import React from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit } from '../../../utils/format';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export function CashFlowChart() {
  const { dashboardData, isProMode, isSpouseEnabled, spousalMultiplier, spousalStartYear, epfInput } = useFinancialData();

  const chartData = dashboardData.netWorthSeries.map((nw, index) => {
    const sal = dashboardData.salarySeries[index] || {};
    const sip = dashboardData.sipSeries[index] || {};
    const sav = dashboardData.savSeries[index] || {};
    const epf = dashboardData.epfSeries[index] || {};
    const vpf = dashboardData.vpfSeries[index] || {};

    const gross = sal.grossYearly || 0;
    const disposable = nw.disposableNominal || 0;
    const liabilities = nw.lifeEventsNominal || 0; 
    
    let epfEmp = epf.yearlyEmployeeNominal || 0;
    if (!isProMode && nw.year <= epfInput.horizon) {
        const activeMultiplier = (isSpouseEnabled && nw.year >= spousalStartYear) ? spousalMultiplier : 1;
        const primaryGrossYearly = gross / activeMultiplier;
        const basicYearly = primaryGrossYearly * (epfInput.basicPercent / 100);
        epfEmp = (basicYearly * (epfInput.empContrib / 100)) * activeMultiplier;
    }

    const investments = (sip.yearlyNominal || 0) + (sav.yearlyNominal || 0) + (vpf.yearlyNominal || 0);
    const taxesAndDeductions = gross - epfEmp - investments - liabilities - disposable;

    return {
      yearLabel: `Year ${nw.year}`,
      Gross: gross,
      Taxes: Math.max(0, taxesAndDeductions),
      EPF: epfEmp,
      Investments: investments,
      Liabilities: liabilities,
      Disposable: disposable
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const grossSalary = payload[0].payload.Gross;

      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 w-64">
          <div className="mb-3 border-b border-black/5 dark:border-white/5 pb-2">
              <p className="font-bold text-slate-800 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Gross Income: <span className="text-slate-800 dark:text-white font-bold">{formatCurrency(grossSalary)}</span>
              </p>
          </div>
          
          {[...payload].reverse().map((entry, index) => {
            const percentage = grossSalary > 0 ? ((entry.value / grossSalary) * 100).toFixed(1) : 0;
            return (
                <div key={index} className="flex items-center justify-between gap-4 py-1.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                    {entry.name}
                  </span>
                  <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(entry.value)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {percentage}%
                      </div>
                  </div>
                </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
          <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={15} />
          <YAxis tickFormatter={(value) => formatUnit(value)} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />

          <Bar dataKey="Taxes" name="Taxes" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
          <Bar dataKey="EPF" name="EPF" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Investments" name="Investments" stackId="a" fill="#3b82f6" />
          <Bar dataKey="Liabilities" name="EMIs & Shocks" stackId="a" fill="#f97316" />
          <Bar dataKey="Disposable" name="Disposable Income" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}