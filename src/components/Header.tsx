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
    <header className={`sticky top-0 z-40 flex items-center justify-between py-3 bg-brand-blue/85 backdrop-blur-xl px-3 sm:px-5 lg:px-7 border-b border-brand-cyan/40 animate-subtle-glow transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-colors flex-shrink-0"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-brand-lightest-slate truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-brand-slate truncate">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-brand-light-navy/50 border border-white/10 rounded-lg py-2 px-4 pl-10 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all w-48 focus:w-64 text-sm"
          />
          <svg className="w-5 h-5 text-brand-slate absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <NotificationBell theme="dark" onViewDetails={handleViewDetails} />
        <div className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-full bg-brand-light-navy/50 border border-white/10">
            <img src="https://picsum.photos/40/40" alt="User Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
            <div className='hidden sm:block pr-2'>
                <p className="font-semibold text-brand-lightest-slate text-xs">Admin</p>
                <p className="text-xs text-brand-slate">Nova Corrente</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;