'use client';

import React, { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import { ToastProvider } from '../../contexts/ToastContext';
import ToastContainer from '../../components/ToastContainer';

// Lazy load heavy components
const DynamicBackendStatus = dynamic(() => import('../../components/BackendStatus'), {
  ssr: false,
  loading: () => null,
});

// Loading component for page transitions
const PageLoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-brand-light-navy/50 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-brand-light-navy/50 rounded-xl"></div>
      ))}
    </div>
    <div className="h-96 bg-brand-light-navy/50 rounded-xl"></div>
  </div>
);

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState('Features');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const handleSetActivePage = useCallback((page: string) => {
    setActivePage(page);
  }, []);
  
  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);


  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen text-brand-lightest-slate font-sans">
          <div className="flex">
            <Sidebar 
              activePage={activePage} 
              setActivePage={handleSetActivePage}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <Header
                title="ML Features Dashboard"
                subtitle="Visualização de features de machine learning para previsão de demanda"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <div className="mt-6 animate-fade-in-up">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    {children}
                  </Suspense>
                </ErrorBoundary>
              </div>
            </main>
          </div>
          <DynamicBackendStatus />
          <ToastContainer />
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}

