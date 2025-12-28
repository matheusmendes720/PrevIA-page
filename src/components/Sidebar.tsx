
import React, { useMemo, memo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeftIcon, MenuIcon, XIcon } from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
  onMobileClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon, label, active, onClick, isCollapsed, onMobileClick }) => {
  const baseClasses = `flex items-center rounded-lg transition-all duration-200 cursor-pointer w-full text-left transform relative ${isCollapsed ? 'justify-center p-3 my-2' : 'p-3 my-2 space-x-3'
    }`;
  const activeClasses = "bg-brand-cyan/10 text-brand-cyan shadow-inner shadow-cyan-500/10";
  const inactiveClasses = "text-brand-slate hover:bg-brand-light-navy/50 hover:text-brand-lightest-slate hover:translate-x-1";

  const handleClick = useCallback(() => {
    onClick();
    // Close mobile sidebar when item is clicked
    if (onMobileClick) {
      onMobileClick();
    }
  }, [onClick, onMobileClick]);

  // Check if icon is a string (emoji) or React element
  const iconElement = typeof icon === 'string' ? (
    <span className="text-lg leading-none">{icon}</span>
  ) : icon;

  return (
    <button onClick={handleClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`} title={isCollapsed ? label : undefined}>
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
        {iconElement}
      </div>
      {!isCollapsed && <span className="font-semibold flex-1">{label}</span>}
    </button>
  );
});

NavItem.displayName = 'NavItem';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({
  activePage,
  setActivePage,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileToggle
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isOnMainPage = pathname?.startsWith('/main') || pathname === '/';
  const isOnFeaturesPage = pathname?.startsWith('/features');
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe gesture handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close sidebar on left swipe (swipe left)
    if (isLeftSwipe && isMobile && isMobileOpen && onMobileToggle) {
      onMobileToggle();
    }
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

  const navItems = useMemo(() => [
    { label: 'Dashboard', icon: '📊', route: null },
    { label: 'Análises', icon: '📈', route: null },
    { label: 'Chatbot', icon: '🤖', route: '/chatbot' },
    { label: 'Relatórios', icon: '📄', route: null },
    { label: 'Configurações', icon: '⚙️', route: null },
  ], []);

  const handleMainNavClick = useCallback((page: string, route?: string | null) => {
    // If item has a route, navigate to it directly
    if (route) {
      router.push(route);
      if (isMobile && onMobileToggle) {
        onMobileToggle();
      }
      return;
    }

    // Otherwise, handle as main page navigation
    if (isOnFeaturesPage) {
      router.push('/main');
      sessionStorage.setItem('targetPage', page);
    } else {
      setActivePage(page);
    }
    // Close mobile sidebar after navigation
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  }, [isOnFeaturesPage, router, setActivePage, isMobile, onMobileToggle]);

  const handleToggleCollapse = useCallback(() => {
    onToggleCollapse?.();
  }, [onToggleCollapse]);

  const handleFeatureLinkClick = useCallback(() => {
    // Close mobile sidebar when feature link is clicked
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  }, [isMobile, onMobileToggle]);

  // Prefetch main navigation routes
  useEffect(() => {
    router.prefetch('/main');
  }, [router]);

  const featureLinks = useMemo(() => [
    { href: '/features/business', label: 'Business', icon: '🏢' },
    { href: '/features/lead-time', label: 'Lead Time', icon: '⏱️' },
    { href: '/features/sla', label: 'SLA', icon: '🎯' },
    { href: '/features/economic', label: 'Economic', icon: '💰' },
    { href: '/features/5g', label: '5G', icon: '📡' },
    { href: '/features/hierarchical', label: 'Hierarchical', icon: '🏗️' },
    { href: '/features/categorical', label: 'Categorical', icon: '🏷️' },
    { href: '/features/temporal', label: 'Temporal', icon: '📅' },
    { href: '/features/climate', label: 'Climate', icon: '🌦️' },
    { href: '/features/towers', label: 'Towers', icon: '🗼' },
  ], []);

  // Prefetch all feature routes on mount
  useEffect(() => {
    featureLinks.forEach(link => {
      router.prefetch(link.href);
    });
  }, [router, featureLinks]);

  // Handle prefetch on hover for better UX
  const handleLinkHover = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-brand-light-navy/50">
          <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
            <div className="relative flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity z-10">
              <Image
                src="/images/logos/sidebar-logo.png"
                alt="PrevIA"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-brand-lightest-slate whitespace-nowrap truncate flex-shrink-0">Nova Corrente</h1>
          </div>
          {onMobileToggle && (
            <button
              onClick={onMobileToggle}
              className="p-2 rounded-lg hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-colors flex-shrink-0 lg:hidden relative z-10"
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'} mb-10`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${!isCollapsed ? 'flex-1 min-w-0 pr-2' : ''}`}>
            <div className="relative flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity">
              <Image
                src="/images/logos/sidebar-logo.png"
                alt="PrevIA"
                width={isCollapsed ? 36 : 40}
                height={isCollapsed ? 36 : 40}
                className="object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-brand-lightest-slate truncate min-w-0">
                Nova Corrente
              </h1>
            )}
          </div>
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg bg-brand-light-navy/30 hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-all duration-200 flex-shrink-0 ml-2"
              title="Collapse sidebar"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          )}
          {onToggleCollapse && isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 hover:border-brand-cyan/50 text-brand-cyan hover:text-brand-cyan transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md hover:shadow-cyan-500/20 ring-1 ring-brand-cyan/20 hover:ring-brand-cyan/40"
              title="Expand sidebar"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <nav className="flex-shrink-0">
        {navItems.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activePage === item.label && isOnMainPage}
            onClick={() => handleMainNavClick(item.label, item.route)}
            isCollapsed={isCollapsed && !isMobile}
            onMobileClick={isMobile ? onMobileToggle : undefined}
          />
        ))}
      </nav>
      <div className="mt-8 border-t border-brand-light-navy/50 pt-4 flex-shrink-0">
        {(!isCollapsed || isMobile) && (
          <p className="text-xs text-brand-slate mb-3 px-3 uppercase tracking-wider">Análise Prescritiva</p>
        )}
        <nav className="space-y-1">
          {featureLinks.map((item) => {
            const isActive = pathname === item.href;
            const isCollapsedMode = (isCollapsed && !isMobile);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => handleLinkHover(item.href)}
                onClick={handleFeatureLinkClick}
                className={`flex items-center rounded-lg transition-all duration-200 ${isCollapsedMode
                  ? 'justify-center p-3 my-2'
                  : 'p-3 my-2 space-x-3'
                  } ${isActive
                    ? 'bg-brand-cyan/10 text-brand-cyan shadow-inner shadow-cyan-500/10 font-semibold'
                    : 'text-brand-slate hover:bg-brand-light-navy/50 hover:text-brand-lightest-slate'
                  }`}
                title={isCollapsedMode ? `${item.icon} ${item.label}` : undefined}
              >
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                  <span className={`${isCollapsedMode ? 'text-2xl' : 'text-lg'} leading-none`}>{item.icon}</span>
                </div>
                {!isCollapsedMode && <span className="font-semibold flex-1">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      {(!isCollapsed || isMobile) && (
        <div className="mt-auto pt-4">
          <div className="p-4 rounded-lg glass-panel text-center transition-glow">
            <h3 className="font-bold text-brand-lightest-slate uppercase tracking-wider text-[10px]">Upgrade to Elite</h3>
            <p className="text-[10px] text-brand-slate mt-1 mb-3">Acesso completo à engine de otimização prescritiva.</p>
            <button className="w-full bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-brand-cyan/20">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] lg:hidden transition-opacity duration-300"
          onClick={onMobileToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-brand-navy/95 backdrop-blur-xl border-r border-brand-cyan/40 h-screen
          transition-all duration-300 ease-in-out
          flex flex-col
          
          /* Mobile: Fixed overlay */
          fixed inset-y-0 left-0 z-[1000] w-72 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl overflow-y-auto
          
          /* Desktop: Sticky relative */
          lg:sticky lg:top-0 lg:relative lg:translate-x-0 lg:flex 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${!isMobileOpen ? 'hidden lg:flex' : ''}
          
          p-4
          hide-scrollbar
          animate-subtle-glow
        `}
        role="navigation"
        aria-label="Main navigation"
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      >
        {/* Tiny vertical accent bar on right edge - visible on both mobile and desktop */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-brand-cyan/70 z-20 pointer-events-none" />

        {sidebarContent}
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;