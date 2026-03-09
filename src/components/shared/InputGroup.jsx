import { formatUnit } from '../../utils/format';

export function InputGroup({ 
  label, 
  value, 
  onChange, 
  type = "number", 
  isCurrency = false,
  step = "1",
  tooltip = null 
}) {
  return (
    <div className="flex flex-col gap-1.5"> {/* Increased gap slightly */}
      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        title={tooltip}
        className="input-field font-medium" // Added font-medium for better readability
      />

      {isCurrency && (
        <span className="text-[10px] font-bold text-brand-blue dark:text-brand-green h-3">
          {value > 0 ? `(${formatUnit(value)})` : ''}
        </span>
      )}
    </div>
  );
}