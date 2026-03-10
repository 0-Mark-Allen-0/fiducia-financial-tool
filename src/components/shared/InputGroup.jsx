import { formatUnit } from '../../utils/format';
import { Info } from 'lucide-react';

export function InputGroup({ 
  label, 
  value, 
  onChange, 
  type = "number", 
  isCurrency = false,
  step = "1",
  min,       // NEW: Minimum value guardrail
  max,       // NEW: Maximum value guardrail
  tooltip = null 
}) {
  // Use abbreviation (15k) instead of full number (15,000)
  const formattedValue = value > 0 ? formatUnit(value) : '';

  // NEW: Internal blur handler to auto-correct out-of-bound values
  const handleBlur = (e) => {
    let val = parseFloat(e.target.value) || 0;
    
    // Enforce boundaries if they are explicitly passed
    if (min !== undefined && val < min) val = min;
    if (max !== undefined && val > max) val = max;
    
    // Update state if the value had to be corrected
    if (val !== value) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </label>
        
        {/* Optional Info Icon */}
        {tooltip && (
          <div className="group relative cursor-help">
             <Info size={12} className="text-slate-400" />
             <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl hidden group-hover:block z-50">
               {tooltip}
             </div>
          </div>
        )}
      </div>
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onBlur={handleBlur} // NEW: Trigger auto-correction on losing focus
        step={step}
        min={min} // NEW: HTML native validation attribute
        max={max} // NEW: HTML native validation attribute
        className="input-field font-medium"
      />

      {isCurrency && (
        <span className="text-[10px] font-medium text-brand-blue dark:text-brand-green h-3 block">
          {formattedValue ? `(${formattedValue})` : ''}
        </span>
      )}
    </div>
  );
}