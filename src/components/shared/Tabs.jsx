import { clsx } from 'clsx';

/**
 * Reusable Tab Navigation Component
 * @param {Array} tabs - Array of objects { id: string, label: string }
 * @param {string} activeTab - The ID of the currently selected tab
 * @param {function} onChange - Callback function(id)
 */
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="w-full">
      {/* Scrollable Container for Mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex p-1.5 gap-1 bg-slate-200/50 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 min-w-max">
          
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out whitespace-nowrap",
                  isActive 
                    ? "bg-white dark:bg-slate-800 text-brand-blue dark:text-brand-green shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
}