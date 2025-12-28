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
    <header className={`sticky top-0 z-40 flex flex-col glass-panel border-b border-brand-cyan/20 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-1.5 rounded-lg hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-colors"
              aria-label="Menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-brand-lightest-slate truncate flex items-center gap-1.5">
              {title}
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse hidden xs:block" />
            </h1>
            <p className="text-[9px] sm:text-xs text-brand-slate truncate uppercase tracking-widest opacity-60 hidden xs:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-navy/60 border border-white/10 rounded-xl py-2 px-4 pl-10 text-brand-lightest-slate focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all w-48 focus:w-64 text-sm glass-panel"
            />
            <svg className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="scale-90 sm:scale-100">
            <NotificationBell theme="dark" onViewDetails={handleViewDetails} />
          </div>

          <div className="flex items-center p-0.5 pr-2 sm:pr-3 rounded-full bg-brand-light-navy/30 border border-white/5 hover:border-brand-cyan/20 transition-colors cursor-pointer group">
            <div className="relative">
              <img src="https://picsum.photos/40/40" alt="User" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-brand-cyan/10" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-brand-navy rounded-full" />
            </div>
            <div className="hidden sm:block ml-2">
              <p className="font-bold text-brand-lightest-slate text-[10px] uppercase tracking-tight">Admin</p>
              <p className="text-[9px] text-brand-slate whitespace-nowrap">HQ Network</p>
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