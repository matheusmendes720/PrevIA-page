import React, { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import { NotificationItem } from '../types';
import { MenuIcon } from './icons';

interface HeaderProps {
  title: string;
  subtitle: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  onMobileMenuToggle,
  isMobileMenuOpen = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // At top, always show
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down, hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up, show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleViewDetails = React.useCallback((notification: NotificationItem) => {
    // Placeholder: integrate with routing or modal when available
    console.info('Abrir detalhes da notificação', notification);
  }, []);

  return (
    <header className={`sticky top-0 z-50 flex flex-col glass-panel border-b border-brand-cyan/20 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-6 min-h-[56px]">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 active:scale-90 transition-all hover:bg-brand-cyan/20"
            aria-label="Abrir Menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-brand-lightest-slate truncate flex items-center gap-2">
              <span className="truncate">{title}</span>
              <span className="bg-brand-cyan text-brand-navy text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-sm shadow-brand-cyan/20">v2.0.3-LTE</span>
            </h1>
            <p className="hidden xs:block text-[9px] sm:text-xs text-brand-slate truncate uppercase tracking-widest opacity-60 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-2 flex-shrink-0">
          <div className="hidden md:flex relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate group-focus-within:text-brand-cyan transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-brand-light-navy/50 border border-white/5 rounded-full text-xs text-brand-lightest-slate focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 w-32 lg:w-64 transition-all"
            />
          </div>

          <div className="scale-90 sm:scale-100 flex items-center gap-1.5 sm:gap-3">
            <NotificationBell onViewDetails={(n) => console.log('Notification clicked', n)} />
            <div className="w-8 h-8 rounded-full bg-brand-light-navy border border-brand-cyan/20 flex items-center justify-center overflow-hidden transition-glow cursor-pointer">
              <div className="w-full h-full bg-gradient-to-br from-brand-cyan/20 to-brand-cyan/5 flex items-center justify-center text-[10px] font-bold text-brand-cyan">
                AD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Proactive Insights Bar - Optimized for Mobile */}
      <div className="bg-brand-cyan/5 border-t border-brand-cyan/10 py-1 px-4 overflow-hidden">
        <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-brand-cyan uppercase tracking-widest flex-shrink-0">
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
            </span>
            Insights:
          </span>
          <div className="flex items-center gap-6 text-[10px] text-brand-light-slate font-medium">
            <span>🚀 <span className="text-brand-lightest-slate">Rota:</span> -12% SP.</span>
            <span>⚠️ <span className="text-brand-lightest-slate">Clima:</span> Ventos SC.</span>
            <span>💡 <span className="text-brand-lightest-slate">Estoque:</span> RJ Low.</span>
            <span>📈 <span className="text-brand-lightest-slate">Forecast:</span> MG +8.4%.</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;