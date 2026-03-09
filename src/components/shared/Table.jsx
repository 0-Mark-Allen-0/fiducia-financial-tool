import { Download } from 'lucide-react';

export function Table({ title, subTitle, headers, children, onExport }) {
  return (
    <div className="glass-card w-full overflow-hidden mt-8 transition-all duration-300">
      {/* Header Bar */}
      <div className="p-5 border-b border-black/5 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/40 dark:bg-black/20">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          {subTitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subTitle}</p>}
        </div>
        
        {onExport && (
          <button 
            onClick={onExport}
            className="flex items-center gap-2 text-sm font-semibold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 dark:bg-brand-blue/20 dark:hover:bg-brand-blue/30 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        )}
      </div>

      {/* Scrollable Table Area */}
      <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/90 dark:bg-slate-900/90 sticky top-0 backdrop-blur-md z-10 shadow-sm">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}