'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { ToastProvider } from '../../contexts/ToastContext';
import ToastContainer from '../../components/ToastContainer';
import { LazyComponents, LoadingSkeleton } from '../../lib/lazy-imports';

// Use centralized lazy loading with retry logic
const Dashboard = LazyComponents.Dashboard;
const Reports = LazyComponents.Reports;
const Analytics = LazyComponents.Analytics;
const Settings = LazyComponents.Settings;

const pageDetails = {
  'Dashboard': { title: 'Dashboard de Análise Preditiva', subtitle: 'Bem-vindo, aqui está um resumo da sua operação.' },
  'Relatórios': { title: 'Relatórios', subtitle: 'Gere e visualize relatórios sobre sua operação.' },
  'Análises': { title: 'Análises Aprofundadas', subtitle: 'Explore as métricas e descubra novos insights.' },
  'Configurações': { title: 'Configurações', subtitle: 'Gerencie seu perfil, usuários e preferências do sistema.' },
};

export default function MainPage() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsTargetState, setAnalyticsTargetState] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Check for target page from sessionStorage when component mounts
  useEffect(() => {
    // Only access sessionStorage in browser environment
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const targetPage = sessionStorage.getItem('targetPage');
      if (targetPage && pageDetails[targetPage as keyof typeof pageDetails]) {
        setActivePage(targetPage);
        sessionStorage.removeItem('targetPage'); // Clear after use
      }
    }
  }, []);

  const handlePageChange = useCallback((page: string) => {
    setAnalyticsTargetState(null);
    setActivePage(page);
  }, []);

  const handleSelectAlert = useCallback((stateId: string) => {
    setAnalyticsTargetState(stateId);
    setActivePage('Análises');
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Swipe from left edge to open sidebar on mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger from left edge (first 20px)
      if (e.touches[0].clientX < 20 && window.innerWidth < 1024) {
        setTouchStartX(e.touches[0].clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX !== null && e.touches[0].clientX > touchStartX + 50 && !isMobileMenuOpen) {
        setIsMobileMenuOpen(true);
        setTouchStartX(null);
      }
    };

    const handleTouchEnd = () => {
      setTouchStartX(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, isMobileMenuOpen]);

  const renderContent = useMemo(() => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard searchTerm={searchTerm} onSelectAlert={handleSelectAlert} />;
      case 'Relatórios':
        return <Reports searchTerm={searchTerm} />;
      case 'Análises':
        return <Analytics initialSelectedState={analyticsTargetState} />;
      case 'Configurações':
        return <Settings searchTerm={searchTerm} />;
      default:
        return <Dashboard searchTerm={searchTerm} onSelectAlert={handleSelectAlert} />;
    }
  }, [activePage, searchTerm, analyticsTargetState, handleSelectAlert]);

  const currentPageDetails = pageDetails[activePage as keyof typeof pageDetails] || pageDetails['Dashboard'];

  return (
    <ToastProvider>
      <div className="min-h-screen text-brand-lightest-slate font-sans relative">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="flex relative z-10">
          <Sidebar
            activePage={activePage}
            setActivePage={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileMenuOpen}
            onMobileToggle={handleMobileMenuToggle}
          />
          <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-5 lg:p-6">
            <Header
              title={currentPageDetails.title}
              subtitle={currentPageDetails.subtitle}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onMobileMenuToggle={handleMobileMenuToggle}
              isMobileMenuOpen={isMobileMenuOpen}
            />
            <Suspense fallback={<div className="animate-pulse space-y-4 p-6"><div className="h-64 bg-brand-navy/50 rounded-lg"></div></div>}>
              <div className="mt-4 sm:mt-5 animate-fade-in-up" key={activePage}>
                {renderContent}
              </div>
            </Suspense>
          </main>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

