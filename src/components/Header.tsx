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
    <header className={`sticky top-0 z-40 flex flex-col glass-panel border-b border-brand-cyan/30 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between py-3 px-3 sm:px-5 lg:px-7">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-colors flex-shrink-0"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-brand-lightest-slate truncate flex items-center gap-2">
              {title}
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-sm shadow-brand-cyan" />
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate truncate uppercase tracking-tighter opacity-80">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden md:block group">
            <input
              type="text"
              placeholder="Buscar no sistema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-navy/60 border border-white/10 rounded-xl py-2 px-4 pl-10 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all w-48 focus:w-72 text-sm glass-panel"
            />
            <svg className="w-5 h-5 text-brand-slate absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none group-focus-within:text-brand-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <NotificationBell theme="dark" onViewDetails={handleViewDetails} />

          <div className="flex items-center space-x-2 sm:space-x-3 p-1 pr-3 rounded-full bg-brand-light-navy/30 border border-white/5 hover:border-brand-cyan/30 transition-colors cursor-pointer group">
            <div className="relative">
              <img src="https://picsum.photos/40/40" alt="User Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-cyan/20 group-hover:border-brand-cyan/50 transition-colors" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-brand-navy rounded-full" />
            </div>
            <div className='hidden sm:block'>
              <p className="font-bold text-brand-lightest-slate text-xs group-hover:text-brand-cyan transition-colors uppercase tracking-tight">System Admin</p>
              <p className="text-[10px] text-brand-slate font-medium">Nova Corrente HQ</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Proactive Insights Bar */}
      <div className="bg-brand-cyan/5 border-t border-brand-cyan/10 py-1 px-4 overflow-hidden relative">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-cyan uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            Insights Real-time:
          </span>
          <div className="flex items-center gap-8 text-[11px] text-brand-light-slate font-medium">
            <span className="flex items-center gap-1">🚀 <span className="text-brand-lightest-slate">Otimização de Rota:</span> Economia projetada de 12% em SP hoje.</span>
            <span className="flex items-center gap-1">⚠️ <span className="text-brand-lightest-slate">Alerta Climático:</span> Ventos fortes em SC podem afetar torres nível 3.</span>
            <span className="flex items-center gap-1">💡 <span className="text-brand-lightest-slate">Stock Insight:</span> Recomendado reabastecer Transceptores em RJ (Lead time +5 dias).</span>
            <span className="flex items-center gap-1">📈 <span className="text-brand-lightest-slate">Forecast:</span> Demanda em MG superou a média móvel em 8.4%.</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;