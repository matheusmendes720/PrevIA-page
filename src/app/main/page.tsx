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

  // Check for target page from sessionStorage when component mounts
  useEffect(() => {
    const targetPage = sessionStorage.getItem('targetPage');
    if (targetPage && pageDetails[targetPage as keyof typeof pageDetails]) {
      setActivePage(targetPage);
      sessionStorage.removeItem('targetPage'); // Clear after use
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
        return <Dashboard searchTerm={searchTerm} onSelectAlert={handleSelectAlert}/>;
    }
  }, [activePage, searchTerm, analyticsTargetState, handleSelectAlert]);

  const currentPageDetails = pageDetails[activePage as keyof typeof pageDetails] || pageDetails['Dashboard'];

  return (
    <ToastProvider>
      <div className="min-h-screen text-brand-lightest-slate font-sans">
        <div className="flex">
          <Sidebar 
            activePage={activePage} 
            setActivePage={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className="flex-1 p-4 sm:p-5 lg:p-6">
            <Header
              title={currentPageDetails.title}
              subtitle={currentPageDetails.subtitle}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <Suspense fallback={<div className="animate-pulse space-y-4 p-6"><div className="h-64 bg-brand-navy/50 rounded-lg"></div></div>}>
              <div className="mt-5 animate-fade-in-up" key={activePage}>
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

