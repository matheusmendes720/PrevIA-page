/**
 * Temporal Analytics Main Page
 * Comprehensive time series and lead time analytics with 12 integrated tabs
 */

'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import Script from 'next/script';
import { TemporalDataProvider, useTemporalData } from './context/TemporalDataContext';
import { TabNavigation, type Tab } from './components/shared/TabNavigation';
import './styles/globals.css';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./components/LeadTimeIntegration/OverviewTab'));
const SupplierPerformanceTab = lazy(() => import('./components/LeadTimeIntegration/SupplierPerformanceTab'));
const ForecastReorderTab = lazy(() => import('./components/LeadTimeIntegration/ForecastReorderTab'));
const FinancialOptimizationTab = lazy(() => import('./components/LeadTimeIntegration/FinancialOptimizationTab'));
const DecompositionTab = lazy(() => import('./components/TemporalAnalysis/DecompositionTab'));
const AutocorrelationTab = lazy(() => import('./components/TemporalAnalysis/AutocorrelationTab'));
const FourierAnalysisTab = lazy(() => import('./components/TemporalAnalysis/FourierAnalysisTab'));
const LagFeaturesTab = lazy(() => import('./components/TemporalAnalysis/LagFeaturesTab'));
const CalendarEffectsTab = lazy(() => import('./components/TemporalAnalysis/CalendarEffectsTab'));
const CyclicPatternsTab = lazy(() => import('./components/TemporalAnalysis/CyclicPatternsTab'));
const AnomalyDetectionTab = lazy(() => import('./components/TemporalAnalysis/AnomalyDetectionTab'));
const ChangePointTab = lazy(() => import('./components/TemporalAnalysis/ChangePointTab'));

// Tab definitions
const TABS: Tab[] = [
  // Lead Time & Supply Chain
  { id: 'overview', label: 'Overview', icon: '📊', category: 'leadtime' },
  { id: 'suppliers', label: 'Supplier Performance', icon: '🤝', category: 'leadtime' },
  { id: 'forecast', label: 'Forecast & Reorder', icon: '📈', category: 'leadtime' },
  { id: 'financial', label: 'Financial Optimization', icon: '💰', category: 'leadtime' },
  
  // Temporal Analytics
  { id: 'decomposition', label: 'Decomposition', icon: '🔬', category: 'temporal' },
  { id: 'autocorrelation', label: 'ACF/PACF', icon: '📉', category: 'temporal' },
  { id: 'fourier', label: 'Fourier Analysis', icon: '〰️', category: 'temporal' },
  { id: 'lag-features', label: 'Lag Features', icon: '⏱️', category: 'temporal' },
  { id: 'calendar', label: 'Calendar Effects', icon: '📅', category: 'temporal' },
  { id: 'cyclical', label: 'Cyclical Patterns', icon: '🔄', category: 'temporal' },
  { id: 'anomalies', label: 'Anomaly Detection', icon: '🚨', category: 'temporal' },
  { id: 'changepoints', label: 'Change Points', icon: '📍', category: 'temporal' }
];

function TemporalAnalyticsContent() {
  const { state, setActiveTab, dataset } = useTemporalData();
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  
  // Check for Chart.js
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).Chart !== 'undefined') {
      setIsChartLoaded(true);
    }
  }, []);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Update tab badges with dynamic data
  const tabsWithBadges: Tab[] = TABS.map(tab => {
    if (tab.id === 'anomalies') {
      return { ...tab, badge: dataset.anomalies.length };
    }
    if (tab.id === 'changepoints') {
      return { ...tab, badge: dataset.changePoints.length };
    }
    if (tab.id === 'suppliers') {
      const poorPerformers = dataset.suppliers.filter(s => s.performance === 'poor').length;
      return { ...tab, badge: poorPerformers > 0 ? poorPerformers : undefined };
    }
    return tab;
  });
  
  const renderTabContent = () => {
    const LoadingFallback = () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
    
    switch (state.activeTab) {
      // Lead Time & Supply Chain
      case 'overview':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OverviewTab />
          </Suspense>
        );
      case 'suppliers':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SupplierPerformanceTab />
          </Suspense>
        );
      case 'forecast':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ForecastReorderTab />
          </Suspense>
        );
      case 'financial':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FinancialOptimizationTab />
          </Suspense>
        );
      
      // Temporal Analytics
      case 'decomposition':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DecompositionTab />
          </Suspense>
        );
      case 'autocorrelation':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AutocorrelationTab />
          </Suspense>
        );
      case 'fourier':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FourierAnalysisTab />
          </Suspense>
        );
      case 'lag-features':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LagFeaturesTab />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CalendarEffectsTab />
          </Suspense>
        );
      case 'cyclical':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CyclicPatternsTab />
          </Suspense>
        );
      case 'anomalies':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnomalyDetectionTab />
          </Suspense>
        );
      case 'changepoints':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ChangePointTab />
          </Suspense>
        );
      
      default:
        return <div className="error-state">Tab not found</div>;
    }
  };
  
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsChartLoaded(true)}
        onError={() => console.error('Failed to load Chart.js')}
      />
      
      <div className="temporal-analytics-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">⏱️</span>
              Temporal & Lead Time Analytics
            </h1>
            <p className="page-subtitle">
              Comprehensive time series analysis, supplier performance tracking, and predictive analytics for C-level procurement decisions
            </p>
          </div>
          
          <div className="header-stats">
            <div className="stat-chip">
              <span className="stat-label">Time Range:</span>
              <span className="stat-value">{dataset.timeSeries.data.length} days</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Suppliers:</span>
              <span className="stat-value">{dataset.suppliers.length}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Events:</span>
              <span className="stat-value">{dataset.events.length}</span>
            </div>
            <div className="stat-chip critical">
              <span className="stat-label">Anomalies:</span>
              <span className="stat-value">{dataset.anomalies.length}</span>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabsWithBadges}
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
        />
        
        {/* Tab Content */}
        <div className="tab-content-container">
          {!isChartLoaded && (
            <div className="chart-loading-notice">
              <p>📊 Loading Chart.js library...</p>
            </div>
          )}
          {renderTabContent()}
        </div>
      </div>
      
      <style jsx global>{`
        :root {
          --color-primary: #20A084;
          --color-primary-hover: #1a8a70;
          --color-secondary: rgba(32, 160, 132, 0.1);
          --color-surface: #0f2438;
          --color-surface-alt: #1a3a52;
          --color-text: #e0e8f0;
          --color-text-secondary: #a0aab8;
          --color-success: #10b981;
          --color-warning: #f97316;
          --color-error: #ef4444;
          --color-bg: #0a1628;
          --color-border: rgba(255, 255, 255, 0.1);
          --space-8: 8px;
          --space-12: 12px;
          --space-16: 16px;
          --space-20: 20px;
          --space-24: 24px;
          --space-32: 32px;
          --radius-base: 8px;
          --radius-lg: 12px;
          --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-family-mono: 'Monaco', 'Menlo', monospace;
        }
        
        .temporal-analytics-page {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          background: transparent;
          color: var(--color-text);
          min-height: 100vh;
        }
        
        .page-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--color-border);
        }
        
        .header-content {
          margin-bottom: 20px;
        }
        
        .page-title {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 600;
          color: var(--color-text);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .title-icon {
          font-size: 36px;
        }
        
        .page-subtitle {
          margin: 0;
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        
        .header-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .stat-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          font-size: 13px;
        }
        
        .stat-chip.critical {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--color-error);
        }
        
        .stat-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        
        .stat-value {
          color: var(--color-primary);
          font-weight: 700;
        }
        
        .stat-chip.critical .stat-value {
          color: var(--color-error);
        }
        
        .tab-content-container {
          min-height: 600px;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-container p {
          color: var(--color-text-secondary);
          font-size: 14px;
        }
        
        .chart-loading-notice {
          padding: 16px;
          background: rgba(32, 160, 132, 0.1);
          border: 1px solid var(--color-primary);
          border-radius: var(--radius-base);
          margin-bottom: 16px;
          text-align: center;
          color: var(--color-primary);
          font-size: 14px;
        }
        
        .error-state {
          padding: 40px;
          text-align: center;
          color: var(--color-error);
          font-size: 16px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 24px;
          }
          
          .title-icon {
            font-size: 28px;
          }
          
          .page-subtitle {
            font-size: 13px;
          }
          
          .header-stats {
            flex-direction: column;
          }
          
          .stat-chip {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}

export default function TemporalAnalyticsPage() {
  return (
    <TemporalDataProvider>
      <TemporalAnalyticsContent />
    </TemporalDataProvider>
  );
}
