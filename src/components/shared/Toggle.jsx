import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable iOS-style Toggle Switch
 * @param {boolean} checked - Current state
 * @param {function} onChange - Callback when toggled
 * @param {string} label - Optional text label
 */
export function Toggle({ checked, onChange, label, className }) {
  return (
    <div className={twMerge("flex items-center gap-3", className)}>
      {label && (
        <span className={clsx(
          "text-sm font-medium transition-colors duration-200",
          checked ? "text-brand-blue dark:text-brand-green" : "text-slate-500 dark:text-slate-400"
        )}>
          {label}
        </span>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
          checked ? "bg-brand-blue dark:bg-brand-green" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}