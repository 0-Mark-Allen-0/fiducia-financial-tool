export function Footer() {
  return (
    <footer className="py-8 mt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Built for Financial Freedom.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
          Disclaimer: Taxes are estimated based on FY 2025-26's New Regime. 
          This is a simulation tool, not financial advice.
        </p>
      </div>
    </footer>
  );
}