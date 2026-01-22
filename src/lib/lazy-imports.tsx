import React, { lazy, ComponentType } from 'react';

// Utility for lazy loading with better error handling
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string = 'Component'
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    // Check if window is defined (SSR-safe)
    const isBrowser = typeof window !== 'undefined';

    const pageHasAlreadyBeenForceRefreshed = isBrowser
      ? JSON.parse(window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false')
      : false;

    try {
      const component = await componentImport();
      if (isBrowser) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      }
      return component;
    } catch (error) {
      if (isBrowser && !pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload() as any;
      }
      throw error;
    }
  });
}

// Preload function for eager loading
export function preloadComponent(
  componentImport: () => Promise<any>
): void {
  componentImport().catch((error) => {
    console.warn('Failed to preload component:', error);
  });
}

// Chart library lazy imports
export const LazyRechartsComponents = {
  LineChart: lazyWithRetry(() => import('recharts').then(mod => ({ default: mod.LineChart })), 'LineChart'),
  BarChart: lazyWithRetry(() => import('recharts').then(mod => ({ default: mod.BarChart })), 'BarChart'),
  PieChart: lazyWithRetry(() => import('recharts').then(mod => ({ default: mod.PieChart })), 'PieChart'),
  AreaChart: lazyWithRetry(() => import('recharts').then(mod => ({ default: mod.AreaChart })), 'AreaChart'),
  ScatterChart: lazyWithRetry(() => import('recharts').then(mod => ({ default: mod.ScatterChart })), 'ScatterChart'),
};

// Component lazy imports
export const LazyComponents = {
  // Charts
  DemandForecastChart: lazyWithRetry(() => import('../components/DemandForecastChart'), 'DemandForecastChart'),
  FinancialOverviewChart: lazyWithRetry(() => import('../components/FinancialOverviewChart'), 'FinancialOverviewChart'),
  HistoricalDataChart: lazyWithRetry(() => import('../components/HistoricalDataChart'), 'HistoricalDataChart'),
  InventoryPieChart: lazyWithRetry(() => import('../components/InventoryPieChart'), 'InventoryPieChart'),
  MaintenanceTypeChart: lazyWithRetry(() => import('../components/MaintenanceTypeChart'), 'MaintenanceTypeChart'),
  ProjectStatusChart: lazyWithRetry(() => import('../components/ProjectStatusChart'), 'ProjectStatusChart'),
  SupplierBarChart: lazyWithRetry(() => import('../components/SupplierBarChart'), 'SupplierBarChart'),
  
  // Feature Charts
  BusinessMetricsChart: lazyWithRetry(() => import('../components/charts/BusinessMetricsChart'), 'BusinessMetricsChart'),
  CategoricalEncodingChart: lazyWithRetry(() => import('../components/charts/CategoricalEncodingChart'), 'CategoricalEncodingChart'),
  ClimateTimeSeriesChart: lazyWithRetry(() => import('../components/charts/ClimateTimeSeriesChart'), 'ClimateTimeSeriesChart'),
  EconomicFeaturesChart: lazyWithRetry(() => import('../components/charts/EconomicFeaturesChart'), 'EconomicFeaturesChart'),
  FamilyDemandChart: lazyWithRetry(() => import('../components/charts/FamilyDemandChart'), 'FamilyDemandChart'),
  FiveGExpansionChart: lazyWithRetry(() => import('../components/charts/FiveGExpansionChart'), 'FiveGExpansionChart'),
  LeadTimeAnalyticsChart: lazyWithRetry(() => import('../components/charts/LeadTimeAnalyticsChart'), 'LeadTimeAnalyticsChart'),
  SiteAggregationChart: lazyWithRetry(() => import('../components/charts/SiteAggregationChart'), 'SiteAggregationChart'),
  SLAMetricsChart: lazyWithRetry(() => import('../components/charts/SLAMetricsChart'), 'SLAMetricsChart'),
  SupplierAggregationChart: lazyWithRetry(() => import('../components/charts/SupplierAggregationChart'), 'SupplierAggregationChart'),
  TemporalFeaturesChart: lazyWithRetry(() => import('../components/charts/TemporalFeaturesChart'), 'TemporalFeaturesChart'),
  
  // Main Components
  Dashboard: lazyWithRetry(() => import('../components/Dashboard'), 'Dashboard'),
  Reports: lazyWithRetry(() => import('../components/Reports'), 'Reports'),
  Analytics: lazyWithRetry(() => import('../components/Analytics'), 'Analytics'),
  Settings: lazyWithRetry(() => import('../components/Settings'), 'Settings'),
  
  // Other Components
  BrazilMap: lazyWithRetry(() => import('../components/BrazilMap'), 'BrazilMap'),
  InteractiveMap: lazyWithRetry(() => import('../components/InteractiveMap'), 'InteractiveMap'),
  ModelPerformanceDashboard: lazyWithRetry(() => import('../components/ModelPerformanceDashboard'), 'ModelPerformanceDashboard'),
  ClusteringDashboard: lazyWithRetry(() => import('../components/ClusteringDashboard'), 'ClusteringDashboard'),
};

// Loading skeleton component
export function LoadingSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`animate-pulse space-y-4 p-6`}>
      <div className={`${height} bg-brand-navy/50 rounded-lg`}></div>
    </div>
  );
}

// Chart loading skeleton
export function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-brand-navy/50 rounded w-1/3"></div>
      <div className="h-64 bg-brand-navy/50 rounded-lg"></div>
      <div className="flex space-x-4">
        <div className="h-4 bg-brand-navy/50 rounded w-1/4"></div>
        <div className="h-4 bg-brand-navy/50 rounded w-1/4"></div>
        <div className="h-4 bg-brand-navy/50 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-brand-navy/50 rounded"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-brand-navy/50 rounded"></div>
      ))}
    </div>
  );
}
