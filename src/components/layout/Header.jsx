import { useEffect, useState } from 'react';
import { useFinancialData } from '../../context/FinancialContext';
import { Toggle } from '../shared/Toggle';
import { Info, HelpCircle } from 'lucide-react'; // Added HelpCircle
import { InfoModal } from '../shared/InfoModal';
import { HowToUseModal } from './HowToUseModal'; // Import the new Modal
import { Gem } from 'lucide-react';
import { CirclePoundSterling } from 'lucide-react';

export function Header() {
  const { isProMode, setIsProMode } = useFinancialData();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false); // NEW: Help Modal State

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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`p-2 rounded-xl transition-colors ${isProMode ? 'bg-brand-purple/20 text-brand-orange' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {isProMode ? <Gem size={30} /> : <CirclePoundSterling size={30} />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Fiducia
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isProMode ? 'text-brand-orange' : 'text-brand-blue'}`}>
                v1.4
              </span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
              
              {/* NEW: Glowing Help Trigger */}
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-brand-blue bg-brand-blue/10 rounded-full subtle-glow hover:scale-105 transition-all"
                title="How to Use Guide"
              >
                <HelpCircle size={20} />
              </button>

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

      {/* The Modals */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <HowToUseModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}