import { formatCurrency, formatUnit } from '../../utils/format';

export function ResultRow({ label, value, isGain = false }) {
  const formattedVal = formatCurrency(value);
  const unit = formatUnit(value);

  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-black/5 dark:border-white/5 last:border-0 last:pt-2 last:font-bold">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <div className="text-right">
        <span className={isGain ? "text-brand-green" : "text-slate-900 dark:text-white"}>
            {formattedVal}
        </span>
        <span className="text-[10px] text-slate-600 ml-1 block leading-none">
            {unit}
        </span>
      </div>
    </div>
  );
}