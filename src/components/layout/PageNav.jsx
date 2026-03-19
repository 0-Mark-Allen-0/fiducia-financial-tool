import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialContext';

export function PageNav() {
  const { isProMode } = useFinancialData();
  const [activeSection, setActiveSection] = useState('home');

  const handleScroll = (e, id) => {
    e.preventDefault();
    setActiveSection(id); // Instantly trigger the glow effect on click
    const element = document.getElementById(id);
    if (element) {
      // Offset by 120px to prevent the header from covering the section title
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Define nav items cleanly to map over them
  const navItems = [
    { id: 'home', label: 'Home', show: true },
    { id: 'variables', label: 'Variables', show: true },
    { id: 'strategies', label: 'Strategies', show: isProMode },
    { id: 'projections', label: 'Projections', show: true },
    { id: 'ledger', label: 'Ledger', show: true },
    { id: 'retirement', label: 'Retirement', show: true },
  ];

  return (
    <div className="sticky top-16 z-30 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-[1440px] mx-auto px-4 overflow-x-auto custom-scrollbar-hide">
        
        {/* Centered on Desktop, Left-aligned scrollable on Mobile */}
        <nav className="flex items-center justify-start md:justify-center gap-2 h-14 text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap py-2">
          
          {navItems.filter(item => item.show).map(item => {
            const isActive = activeSection === item.id;
            
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScroll(e, item.id)}
                className={`
                  px-5 py-1.5 rounded-full transition-all duration-300 ease-out border border-transparent
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800 text-brand-blue dark:text-white shadow-[0_0_15px_rgba(0,122,255,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.08)] border-slate-200/50 dark:border-white/10 scale-105' 
                    : 'hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 hover:shadow-sm'
                  }
                `}
              >
                {item.label}
              </a>
            );
          })}
          
        </nav>
      </div>
    </div>
  );
}