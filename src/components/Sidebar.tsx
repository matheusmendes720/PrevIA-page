
import React, { useMemo, memo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardIcon, ReportIcon, AnalyticsIcon, SettingsIcon, ChevronLeftIcon, MenuIcon } from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon, label, active, onClick, isCollapsed }) => {
  const baseClasses = "flex items-center p-3 my-2 space-x-4 rounded-lg transition-all duration-200 cursor-pointer w-full text-left transform";
  const activeClasses = "bg-brand-cyan/10 text-brand-cyan shadow-inner shadow-cyan-500/10";
  const inactiveClasses = "text-brand-slate hover:bg-brand-light-navy/50 hover:text-brand-lightest-slate hover:translate-x-1";
  
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);
  
  return (
    <button onClick={handleClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`} title={isCollapsed ? label : undefined}>
      {icon}
      {!isCollapsed && <span className="font-semibold">{label}</span>}
    </button>
  );
});

NavItem.displayName = 'NavItem';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ activePage, setActivePage, isCollapsed = false, onToggleCollapse }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isOnMainPage = pathname?.startsWith('/main') || pathname === '/';
  const isOnFeaturesPage = pathname?.startsWith('/features');

  const navItems = useMemo(() => [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Análises', icon: <AnalyticsIcon /> },
    { label: 'Chatbot', icon: <span className="text-lg">🤖</span> },
    { label: 'Relatórios', icon: <ReportIcon /> },
    { label: 'Configurações', icon: <SettingsIcon /> },
  ], []);

  const handleMainNavClick = useCallback((page: string) => {
    if (page === 'Chatbot') {
      // Navigate to chatbot page
      router.push('/chatbot');
    } else if (isOnFeaturesPage) {
      // If we're on a features page, navigate to /main first
      router.push('/main');
      // Store the target page in sessionStorage to restore after navigation
      sessionStorage.setItem('targetPage', page);
    } else {
      // If we're already on /main, just update the active page
      setActivePage(page);
    }
  }, [isOnFeaturesPage, router, setActivePage]);

  const handleToggleCollapse = useCallback(() => {
    onToggleCollapse?.();
  }, [onToggleCollapse]);

  // Prefetch main navigation routes
  useEffect(() => {
    router.prefetch('/main');
    router.prefetch('/chatbot');
  }, [router]);

  const featureLinks = useMemo(() => [
    { href: '/features/temporal', label: 'Temporal', icon: '📅' },
    { href: '/features/climate', label: 'Climate', icon: '🌦️' },
    { href: '/features/economic', label: 'Economic', icon: '💰' },
    { href: '/features/5g', label: '5G', icon: '📡' },
    { href: '/features/lead-time', label: 'Lead Time', icon: '⏱️' },
    { href: '/features/sla', label: 'SLA', icon: '🎯' },
    { href: '/features/hierarchical', label: 'Hierarchical', icon: '🏗️' },
    { href: '/features/categorical', label: 'Categorical', icon: '🏷️' },
    { href: '/features/business', label: 'Business', icon: '🏢' },
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

  return (
    <div className={`hidden lg:block bg-brand-navy/75 backdrop-blur-xl border-r border-brand-cyan/40 h-screen sticky top-0 p-4 animate-subtle-glow transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} overflow-y-auto flex flex-col`}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center border border-brand-cyan/20 flex-shrink-0">
            <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold text-brand-lightest-slate whitespace-nowrap">Nova Corrente</h1>}
        </div>
        {onToggleCollapse && (
          <button
            onClick={handleToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-brand-light-navy/50 text-brand-slate hover:text-brand-cyan transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <MenuIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </button>
        )}
      </div>
      <nav className="flex-shrink-0">
        {navItems.map(item => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activePage === item.label && isOnMainPage}
            onClick={() => handleMainNavClick(item.label)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      <div className="mt-8 border-t border-brand-light-navy/50 pt-4 flex-shrink-0">
        {!isCollapsed && (
          <p className="text-xs text-brand-slate mb-3 px-3 uppercase tracking-wider">ML Features</p>
        )}
        <nav className="space-y-1">
          {featureLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => handleLinkHover(item.href)}
                className={`flex items-center ${isCollapsed ? 'justify-center p-3 my-2' : 'p-2'} rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-cyan/10 text-brand-cyan shadow-inner shadow-cyan-500/10 font-semibold'
                    : 'text-brand-slate hover:bg-brand-light-navy/50 hover:text-brand-lightest-slate'
                }`}
                title={isCollapsed ? `${item.icon} ${item.label}` : undefined}
              >
                <span className={isCollapsed ? 'text-xl' : ''}>{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      {!isCollapsed && (
        <div className="mt-auto pt-4">
          <div className="p-4 rounded-lg glass-card text-center animate-subtle-glow">
            <h3 className="font-bold text-brand-lightest-slate">Upgrade to Pro</h3>
            <p className="text-xs text-brand-slate mt-1 mb-3">Get access to all features and advanced analytics.</p>
            <button className="w-full bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40">
                Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;