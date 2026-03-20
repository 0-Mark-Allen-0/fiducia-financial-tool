import React from 'react';
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency, formatUnit } from '../../../utils/format';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export function WealthChart() {
  const { dashboardData, isProMode } = useFinancialData();

  const chartData = dashboardData.netWorthSeries.map((nw, index) => {
    const sip = dashboardData.sipSeries[index]?.corpusNominal || 0;
    const sav = dashboardData.savSeries[index]?.corpusNominal || 0;
    const epf = dashboardData.epfSeries[index]?.corpusNominal || 0;
    const vpf = dashboardData.vpfSeries[index]?.corpusNominal || 0;

    // SIMPLE MODE: Only plot SIP + Savings. PRO MODE: Plot full Net Worth.
    const displayNetWorth = isProMode ? nw.netWorthNominal : (sip + sav);

    return {
      yearLabel: `Year ${nw.year}`,
      netWorth: displayNetWorth,
      SIP: sip,
      Savings: sav,
      EPF: epf,
      VPF: vpf
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 dark:border-white/10">
          <p className="font-bold text-slate-800 dark:text-white mb-2 border-b border-black/5 dark:border-white/5 pb-2">
            {label}
          </p>
          {[...payload].reverse().map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 py-1">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                {entry.name}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {isProMode && (
            <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Total Net Worth</span>
              <span className="font-bold text-brand-blue">
                {formatCurrency(payload.reduce((sum, entry) => sum + entry.value, 0))}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px] md:h-[450px] animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
          <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={30} />
          <YAxis tickFormatter={(value) => formatUnit(value)} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />

          {!isProMode && (
            <Area type="monotone" dataKey="netWorth" name="Wealth" stroke="#0ea5e9" strokeWidth={3} fill="#0ea5e9" fillOpacity={0.15} activeDot={{ r: 6, strokeWidth: 0 }} />
          )}

          {isProMode && (
            <>
              <Area type="monotone" dataKey="EPF" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.8} strokeWidth={2} />
              <Area type="monotone" dataKey="VPF" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} strokeWidth={2} />
              <Area type="monotone" dataKey="Savings" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.8} strokeWidth={2} />
              <Area type="monotone" dataKey="SIP" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} strokeWidth={2} />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}