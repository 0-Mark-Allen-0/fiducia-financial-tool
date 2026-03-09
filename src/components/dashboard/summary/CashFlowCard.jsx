import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../utils/format';

export function CashFlowCard() {
  const { dashboardData } = useFinancialData();
  const { cashFlow } = dashboardData;

  return (
    <div className="w-full glass-card p-6 mb-8 border-l-4 border-brand-orange">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <span>💸</span> Monthly Cash Flow (Year 1)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
        <div className="pb-4 md:pb-0">
            <p className="text-xs text-slate-400 mb-1">Gross Income</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(cashFlow.income)}</p>
        </div>
        
        <div className="py-4 md:py-0">
            <p className="text-xs text-slate-400 mb-1">Total Investments</p>
            <p className="text-xl font-bold text-brand-danger">{formatCurrency(cashFlow.outflow)}</p>
            <p className="text-[10px] text-slate-500">{cashFlow.percent}% of income</p>
        </div>

        <div className="pt-4 md:pt-0">
            <p className="text-xs text-slate-400 mb-1">In-Hand (Expenses + Tax)</p>
            <p className="text-xl font-bold text-brand-green">{formatCurrency(cashFlow.net)}</p>
        </div>
      </div>
    </div>
  );
}