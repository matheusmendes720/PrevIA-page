'use client';

import React, { useState, lazy, Suspense } from 'react';
import Script from 'next/script';
import { kpis, events, regionDemand, projections, states, stockManagement, leadTimeAnalysis, cashflowProjection, supplyChainStorytelling, recommendations, alerts, checklist } from './data';
import TabNavigation from './components/ui/TabNavigation';

// Lazy load components for better performance
const OverviewTab = lazy(() => import('./components/dashboard/OverviewTab'));
const CoverageTab = lazy(() => import('./components/CoverageTab'));
const InventoryTab = lazy(() => import('./components/InventoryTab'));
const SupplyChainTab = lazy(() => import('./components/SupplyChainTab'));
const ProjectionsTab = lazy(() => import('./components/ProjectionsTab'));

// Skeleton loaders
const SkeletonCard = () => (
  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-pulse">
    <div className="h-6 bg-brand-light-navy/50 rounded w-1/3 mb-4"></div>
    <div className="h-32 bg-brand-light-navy/50 rounded"></div>
  </div>
);

const SkeletonKPI = () => (
  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-pulse">
    <div className="h-8 bg-brand-light-navy/50 rounded w-1/2 mb-2"></div>
    <div className="h-12 bg-brand-light-navy/50 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-brand-light-navy/50 rounded w-1/3"></div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Algo deu errado</h2>
          <p className="text-brand-slate mb-4">
            Ocorreu um erro ao carregar este componente.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-brand-cyan text-brand-navy rounded-lg hover:bg-brand-cyan/80 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type Scenario = 'base' | 'optimistic' | 'adverse';
type MainTab = 'dashboard' | 'insights';
type SubTab = 'overview' | 'coverage' | 'regional' | 'timeline' | 'projections' | 'estoque' | 'supplychain' | 'actions' | 'sales';

export default function FiveGFeaturesPage() {
  const [mainTab, setMainTab] = useState<MainTab>('dashboard');
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [scenario, setScenario] = useState<Scenario>('base');
  const [isChartReady, setIsChartReady] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Debug: Monitor isChartReady state
  React.useEffect(() => {
    console.log('🔍 5G Page - isChartReady:', isChartReady);
  }, [isChartReady]);

  // Transform data for components
  const projectionData = projections[scenario];
  const coverageData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    municipalities: [600, 630, 670, 700, 740, 760, 790, 810, 830, 870, 880, 900],
    population: [45, 48, 51, 53, 55, 56, 57, 59, 60, 63, 65, 67],
    investment: [110, 105, 140, 135, 130, 150, 160, 165, 170, 182, 181, 187]
  };

  const transformedEvents = events.map((event, idx) => ({
    id: `event-${idx}`,
    date: event.date,
    title: event.title,
    region: event.region,
    impact: event.impact,
    severity: event.severity as 'high' | 'medium' | 'low',
    materials: event.materials,
    revenue: event.revenue,
    type: event.title.toLowerCase().includes('licença') || event.title.toLowerCase().includes('leilão')
      ? 'license' as const
      : event.title.toLowerCase().includes('upgrade') || event.title.toLowerCase().includes('fase')
      ? 'upgrade' as const
      : 'coverage' as const
  }));


  return (
    <ErrorBoundary>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        onLoad={() => {
          console.log('📊 Chart.js loaded successfully!', typeof (window as any).Chart);
          setIsChartReady(true);
        }}
        onError={(e) => {
          console.error('❌ Failed to load Chart.js:', e);
        }}
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-brand-blue text-brand-lightest-slate p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-brand-lightest-slate mb-2">
            Features 5G
          </h1>
          <p className="text-lg text-brand-slate">
            Monitoramento da expansão 5G e impacto na demanda de materiais
          </p>
        </header>

        {/* Hero Section - Always visible */}
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
          </div>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className="text-xs text-brand-slate">{kpi.label}</span>
                </div>
                <div className="text-3xl font-bold text-brand-lightest-slate mb-1">
                  {kpi.value}
                </div>
                <div className="text-sm text-brand-slate mb-2">{kpi.unit}</div>
                <div className="text-xs text-green-400 font-semibold">{kpi.trend}</div>
              </div>
            ))}
          </div>
        </Suspense>

        {/* Tab Navigation */}
        <Suspense fallback={<div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>}>
          <TabNavigation
            mainTab={mainTab}
            subTab={subTab}
            onMainTabChange={(tab) => setMainTab(tab as MainTab)}
            onSubTabChange={(tab) => setSubTab(tab as SubTab)}
            className="mb-6"
          />
        </Suspense>

        {/* Main Content */}
        <main>
          {mainTab === 'dashboard' && (
            <>
              {subTab === 'overview' && (
                <Suspense fallback={<SkeletonCard />}>
                  <OverviewTab onNavigateToTab={(tab) => setSubTab(tab as SubTab)} />
                </Suspense>
              )}

              {subTab === 'coverage' && (
                <Suspense fallback={<SkeletonCard />}>
                  <CoverageTab isChartReady={isChartReady} />
                </Suspense>
              )}

              {subTab === 'regional' && (
                <Suspense fallback={<SkeletonCard />}>
                  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
                    <h2 className="text-xl font-bold text-brand-lightest-slate mb-4">
                      Impacto Regional
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regionDemand.map((region, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30"
                        >
                          <div className="text-lg font-semibold text-brand-lightest-slate mb-2">
                            {region.region}
                          </div>
                          <div className="text-sm text-brand-slate mb-2">
                            Demanda: {region.demand}
                          </div>
                          <div className="w-full bg-brand-light-navy/50 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                region.level === 'high' ? 'bg-red-400' :
                                region.level === 'med' ? 'bg-yellow-400' :
                                'bg-green-400'
                              }`}
                              style={{ width: `${(region.value / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Suspense>
              )}

              {subTab === 'timeline' && (
                <Suspense fallback={<SkeletonCard />}>
                  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
                    <h2 className="text-xl font-bold text-brand-lightest-slate mb-4">
                      Timeline de Eventos
                    </h2>
                    <div className="space-y-4">
                      {transformedEvents.map((event, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${
                            event.severity === 'high'
                              ? 'border-red-500/40 bg-red-900/20'
                              : event.severity === 'medium'
                              ? 'border-yellow-500/40 bg-yellow-900/20'
                              : 'border-green-500/40 bg-green-900/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-lg font-semibold text-brand-lightest-slate">
                                {event.title}
                              </div>
                              <div className="text-sm text-brand-slate">
                                {event.date} · {event.region}
                              </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan">
                              {event.severity}
                            </span>
                          </div>
                          <div className="text-sm text-brand-light-slate mb-2">
                            {event.materials}
                          </div>
                          <div className="text-xs text-brand-cyan">
                            Impacto: +{event.impact}% · R$ {event.revenue}K oportunidade
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Suspense>
              )}
            </>
          )}

          {mainTab === 'insights' && (
            <>
              {subTab === 'projections' && (
                <Suspense fallback={<SkeletonCard />}>
                  <div className="space-y-6">
                    <div className="flex gap-4 mb-6">
                      {(['base', 'optimistic', 'adverse'] as Scenario[]).map((scen) => (
                        <button
                          key={scen}
                          onClick={() => setScenario(scen)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors min-w-[44px] min-h-[44px] ${
                            scenario === scen
                              ? 'bg-brand-cyan text-brand-navy shadow-lg shadow-brand-cyan/20'
                              : 'bg-brand-light-navy/50 text-brand-slate hover:bg-brand-light-navy border border-brand-cyan/20'
                          } focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-navy`}
                          aria-pressed={scenario === scen}
                        >
                          {scen === 'base' ? 'Base' : scen === 'optimistic' ? 'Otimista' : 'Adversa'}
                        </button>
                      ))}
                    </div>
                    <ProjectionsTab isChartReady={isChartReady} scenario={scenario} />
                  </div>
                </Suspense>
              )}

              {subTab === 'estoque' && (
                <Suspense fallback={<SkeletonCard />}>
                  <InventoryTab isChartReady={isChartReady} />
                </Suspense>
              )}

              {subTab === 'supplychain' && (
                <Suspense fallback={<SkeletonCard />}>
                  <SupplyChainTab isChartReady={isChartReady} />
                </Suspense>
              )}

              {subTab === 'actions' && (
                <Suspense fallback={<SkeletonCard />}>
                  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
                    <h2 className="text-xl font-bold text-brand-lightest-slate mb-4">
                      Checklist de Ações
                    </h2>
                    <div className="space-y-4">
                      {checklist?.map((group, groupIdx) => (
                        <div key={groupIdx} className="border border-brand-cyan/20 rounded-lg p-4 bg-brand-light-navy/30">
                          <h3 className="font-semibold text-brand-lightest-slate mb-3">{group.owner}</h3>
                          <div className="space-y-2">
                            {group.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="flex items-center gap-3 p-2 rounded bg-brand-navy/50">
                                <span className="text-lg">{task.status}</span>
                                <div className="flex-1">
                                  <div className="text-sm text-brand-lightest-slate">{task.title}</div>
                                  <div className="text-xs text-brand-slate">{task.due} · {task.info}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Suspense>
              )}

              {subTab === 'sales' && (
                <Suspense fallback={<SkeletonCard />}>
                  <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
                    <h2 className="text-xl font-bold text-brand-lightest-slate mb-4">
                      Oportunidades de Vendas
                    </h2>
                    <div className="space-y-4">
                      {transformedEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30"
                        >
                          <div className="text-lg font-semibold text-brand-lightest-slate mb-2">
                            {event.title}
                          </div>
                          <div className="text-sm text-brand-slate mb-2">
                            {event.region} · {event.date}
                          </div>
                          <div className="text-brand-cyan font-semibold">
                            Oportunidade: R$ {event.revenue}K
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Suspense>
              )}
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

