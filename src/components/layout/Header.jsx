import { useEffect, useState } from 'react';
import { useFinancialData } from '../../context/FinancialContext';
import { Toggle } from '../shared/Toggle';
import { TrendingUp, ShieldCheck, Info } from 'lucide-react'; // Added Info Icon
import { InfoModal } from '../shared/InfoModal'; // Import the Modal

export function Header() {
  const { isProMode, setIsProMode } = useFinancialData();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Auto-Open Logic on First Visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('fiducia_welcome_seen_v1');
    if (!hasSeenWelcome) {
        setIsInfoOpen(true);
        localStorage.setItem('fiducia_welcome_seen_v1', 'true');
    }
  }, []);

  // Sync Dark Mode Class
  useEffect(() => {
    const html = document.documentElement;
    if (isProMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isProMode]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`p-2 rounded-xl transition-colors ${isProMode ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {isProMode ? <ShieldCheck size={24} /> : <TrendingUp size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Fiducia
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isProMode ? 'text-brand-green' : 'text-brand-blue'}`}>
                v1.0
              </span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
              
              {/* Info Trigger */}
              <button 
                onClick={() => setIsInfoOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="About & Assumptions"
              >
                <Info size={20} />
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

              <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {isProMode ? 'Pro' : 'Simple'}
                  </p>
              </div>
              
              <Toggle 
                  checked={isProMode} 
                  onChange={setIsProMode} 
                  className="scale-100 md:scale-110" 
              />
          </div>

        </div>
      </header>

      {/* The Info Modal Component */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
}