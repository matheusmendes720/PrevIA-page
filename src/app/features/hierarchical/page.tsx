'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Script from 'next/script';
import { apiClient } from '../../../lib/api';
import { FamilyAggregation, SiteAggregation, SupplierAggregation } from '../../../types/features';
import { useRouter } from 'next/navigation';

// Prescriptive insights from ML outputs
const PRESCRIPTIVE_INSIGHTS = {
  EPI: {
    risk_score: 0.70,
    stockout_risk: 'HIGH',
    recommended_safety_stock_days: 25,
    recommended_reorder_point_multiplier: 2.20,
  },
  FERRAMENTAS_E_EQUIPAMENTOS: {
    risk_score: 0.30,
    stockout_risk: 'LOW',
    recommended_safety_stock_days: 19,
    recommended_reorder_point_multiplier: 1.80,
  },
  FERRO_E_AÇO: {
    risk_score: 0.77,
    stockout_risk: 'HIGH',
    recommended_safety_stock_days: 26,
    recommended_reorder_point_multiplier: 2.27,
  },
  MATERIAL_CIVIL: {
    risk_score: 0.43,
    stockout_risk: 'MEDIUM',
    recommended_safety_stock_days: 21,
    recommended_reorder_point_multiplier: 1.93,
  },
  MATERIAL_ELETRICO: {
    risk_score: 0.73,
    stockout_risk: 'HIGH',
    recommended_safety_stock_days: 25,
    recommended_reorder_point_multiplier: 2.23,
  },
};

// Real supplier names from client database (from lead-time page)
const REAL_SUPPLIER_NAMES = [
  'L.M.C LEMOS MATERIAIS PARA CONSTRUCAO',
  'HIPERFERRO',
  'BELGO CERCAS',
  'BRASPRESS',
  'M M MATERIAL DE CONSTRUCAO',
  'FERIMPORT COMERCIO REPRESENTACAO E IMPORTACAO LTDA',
  'RENNER HERRMANN SA',
  'TIBIDAR MARCENARIA E CONSTRUCAO',
  'NOVA COMERCIO DE MATERIAIS ELETRICOS LTDA',
  'NORDESTE EPI',
];

// Mock data for when API returns empty
const MOCK_FAMILIES = [
  { id: 'f1', name: 'EPI', demand: 4800, forecast: 3850, variancePct: 24.6, slaImpact: 3.2 },
  { id: 'f2', name: 'FERRO_E_AÇO', demand: 3500, forecast: 3200, variancePct: 9.4, slaImpact: 1.5 },
  { id: 'f3', name: 'MATERIAL_ELETRICO', demand: 4150, forecast: 4100, variancePct: 1.2, slaImpact: 0.8 },
  { id: 'f4', name: 'MATERIAL_CIVIL', demand: 2800, forecast: 2600, variancePct: 7.7, slaImpact: 1.2 },
  { id: 'f5', name: 'FERRAMENTAS_E_EQUIPAMENTOS', demand: 1200, forecast: 1150, variancePct: 4.3, slaImpact: 0.5 },
];

const MOCK_SITES = [
  { id: 's1', name: 'Salvador Centro', parentId: 'f1', demand: 1800, forecast: 1440, variancePct: 25.0, slaImpact: 2.8 },
  { id: 's2', name: 'Salvador Norte', parentId: 'f1', demand: 1200, forecast: 1080, variancePct: 11.1, slaImpact: 1.2 },
  { id: 's3', name: 'Recife Norte', parentId: 'f2', demand: 1100, forecast: 1000, variancePct: 10.0, slaImpact: 0.9 },
  { id: 's4', name: 'Belo Horizonte Oeste', parentId: 'f2', demand: 700, forecast: 330, variancePct: 112.1, slaImpact: 3.5 },
  { id: 's5', name: 'São Paulo Sul', parentId: 'f3', demand: 1500, forecast: 1450, variancePct: 3.4, slaImpact: 0.6 },
];

const MOCK_SUPPLIERS = [
  { id: 'sup1', name: 'L.M.C LEMOS MATERIAIS PARA CONSTRUCAO', parentId: 'f1', demand: 4800, forecast: 4500, variancePct: 6.7, slaImpact: 2.1 },
  { id: 'sup2', name: 'HIPERFERRO', parentId: 'f2', demand: 1800, forecast: 1600, variancePct: 12.5, slaImpact: 1.8 },
  { id: 'sup3', name: 'BELGO CERCAS', parentId: 'f2', demand: 3500, forecast: 3200, variancePct: 9.4, slaImpact: 1.5 },
  { id: 'sup4', name: 'BRASPRESS', parentId: 'f3', demand: 2500, forecast: 2450, variancePct: 2.0, slaImpact: 0.8 },
  { id: 'sup5', name: 'FERIMPORT COMERCIO REPRESENTACAO E IMPORTACAO LTDA', parentId: 'f3', demand: 1650, forecast: 1650, variancePct: 0.0, slaImpact: 0.8 },
  { id: 'sup6', name: 'RENNER HERRMANN SA', parentId: 'f4', demand: 2200, forecast: 2000, variancePct: 10.0, slaImpact: 1.3 },
];

export default function HierarchicalFeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);
  const router = useRouter();
  
  const [activeLevel, setActiveLevel] = useState<'family' | 'site' | 'supplier'>('family');
  const [selectedNode, setSelectedNode] = useState<{ id: string; name: string; level: string } | null>(null);
  const [currentInsightIdx, setCurrentInsightIdx] = useState(0);
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortAscending, setSortAscending] = useState(true);
  
  const [apiData, setApiData] = useState<{
    families: FamilyAggregation[];
    sites: SiteAggregation[];
    suppliers: SupplierAggregation[];
    loading: boolean;
    error: string | null;
  }>({
    families: [],
    sites: [],
    suppliers: [],
    loading: true,
    error: null,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setApiData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const [familiesRes, sitesRes, suppliersRes] = await Promise.all([
          apiClient.getFamilyAggregations(),
          apiClient.getSiteAggregations(),
          apiClient.getSupplierAggregations(),
        ]);

        const families = Array.isArray(familiesRes) ? familiesRes : (familiesRes as any).data || [];
        const sites = Array.isArray(sitesRes) ? sitesRes : (sitesRes as any).data || [];
        const suppliers = Array.isArray(suppliersRes) ? suppliersRes : (suppliersRes as any).data || [];

        setApiData({
          families: families || [],
          sites: sites || [],
          suppliers: suppliers || [],
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching hierarchical data:', error);
        setApiData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao carregar dados',
        }));
      }
    };

    fetchData();
  }, []);

      // Effect to initialize when Chart.js is loaded
      useEffect(() => {
        if (!isChartLoaded || !containerRef.current || initRef.current) return;

    const initPage = () => {
      if (typeof (window as any).Chart === 'undefined') {
        console.warn('Chart.js not loaded yet');
        return;
      }

      setTimeout(() => {
        if (initRef.current) return;
        initRef.current = true;

        // Configure Chart.js defaults
        if ((window as any).Chart) {
          (window as any).Chart.defaults.color = '#e0e8f0';
          (window as any).Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.2)';
          (window as any).Chart.defaults.backgroundColor = 'rgba(32, 160, 132, 0.15)';
          (window as any).Chart.defaults.font.size = 16;
          (window as any).Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
          (window as any).Chart.defaults.font.weight = '500';
          (window as any).Chart.defaults.plugins = (window as any).Chart.defaults.plugins || {};
          (window as any).Chart.defaults.plugins.legend = (window as any).Chart.defaults.plugins.legend || {};
          (window as any).Chart.defaults.plugins.legend.labels = (window as any).Chart.defaults.plugins.legend.labels || {};
          (window as any).Chart.defaults.plugins.legend.labels.font = (window as any).Chart.defaults.plugins.legend.labels.font || {};
          (window as any).Chart.defaults.plugins.legend.labels.font.size = 16;
          (window as any).Chart.defaults.plugins.legend.labels.font.weight = '500';
          (window as any).Chart.defaults.plugins.tooltip = (window as any).Chart.defaults.plugins.tooltip || {};
          (window as any).Chart.defaults.plugins.tooltip.titleFont = { size: 18, weight: '600' };
          (window as any).Chart.defaults.plugins.tooltip.bodyFont = { size: 16, weight: '500' };
          (window as any).Chart.defaults.plugins.tooltip.padding = 16;
          (window as any).Chart.defaults.elements = (window as any).Chart.defaults.elements || {};
          (window as any).Chart.defaults.elements.bar = (window as any).Chart.defaults.elements.bar || {};
          (window as any).Chart.defaults.elements.bar.borderWidth = 2;
          (window as any).Chart.defaults.elements.line = (window as any).Chart.defaults.elements.line || {};
          (window as any).Chart.defaults.elements.line.borderWidth = 3;
          (window as any).Chart.defaults.elements.point = (window as any).Chart.defaults.elements.point || {};
          (window as any).Chart.defaults.elements.point.radius = 6;
          (window as any).Chart.defaults.elements.point.hoverRadius = 8;
        }

        setIsInitialized(true);
      }, 100);
    };

    initPage();

    // Cleanup function
    return () => {
      const chartIds = ['familyChart', 'varianceChart'];
      chartIds.forEach(id => {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        if (canvas && (canvas as any).chart) {
          try {
            (canvas as any).chart.destroy();
          } catch (e) {
            console.warn(`Error destroying chart ${id}:`, e);
          }
        }
      });
    };
  }, [isChartLoaded, apiData.families, apiData.sites, apiData.suppliers]);

  // Calculate hierarchical nodes from API data with fallback to mock
  const hierarchicalNodes = useMemo(() => {
    const nodes: Array<{
      level: 'family' | 'site' | 'supplier';
      id: string;
      name: string;
      parentId?: string;
      demand: number;
      forecast: number;
      variancePct: number;
      slaImpact: number;
    }> = [];

    // Use API data if available, otherwise use mock
    const hasApiData = (apiData.families.length > 0 && apiData.families.some(f => (f.total_demand || f.avg_demand_30d || 0) > 0)) ||                    
                       (apiData.sites.length > 0 && apiData.sites.some(s => (s.total_demand || s.avg_demand_30d || 0) > 0)) ||
                       (apiData.suppliers.length > 0 && apiData.suppliers.some(s => ((s as any).total_demand || (s as any).supplier_frequency || 0) > 0));
    const useMockData = !hasApiData;
    
    console.log('📊 Data source decision:', {
      hasApiData,
      useMockData,
      familiesCount: apiData.families.length,
      sitesCount: apiData.sites.length,
      suppliersCount: apiData.suppliers.length,
    });

    if (useMockData) {
      console.log('📊 Using mock data for hierarchical nodes');
      
      // Add mock families
      MOCK_FAMILIES.forEach(f => {
        nodes.push({
          level: 'family',
          id: f.id,
          name: f.name,
          demand: f.demand,
          forecast: f.forecast,
          variancePct: f.variancePct,
          slaImpact: f.slaImpact,
        });
      });

      // Add mock sites
      MOCK_SITES.forEach(s => {
        nodes.push({
          level: 'site',
          id: s.id,
          name: s.name,
          parentId: s.parentId,
          demand: s.demand,
          forecast: s.forecast,
          variancePct: s.variancePct,
          slaImpact: s.slaImpact,
        });
      });

      // Add mock suppliers
      MOCK_SUPPLIERS.forEach(s => {
        nodes.push({
          level: 'supplier',
          id: s.id,
          name: s.name,
          parentId: s.parentId,
          demand: s.demand,
          forecast: s.forecast,
          variancePct: s.variancePct,
          slaImpact: s.slaImpact,
        });
      });
    } else {
      // Use API data
      console.log('📊 Using API data for hierarchical nodes', {
        families: apiData.families.length,
        sites: apiData.sites.length,
        suppliers: apiData.suppliers.length,
      });

      // Family nodes
      apiData.families.forEach((f, idx) => {
        const familyName = f.family_name || `Família ${f.family_id}`;
        const demand = f.total_demand || f.avg_demand_30d * 30 || 1000;
        const forecast = demand * 0.85;
        const variancePct = forecast > 0 ? ((demand - forecast) / forecast) * 100 : 0;
        
        const familyKey = familyName.toUpperCase().replace(/\s+/g, '_');
        const riskData = PRESCRIPTIVE_INSIGHTS[familyKey as keyof typeof PRESCRIPTIVE_INSIGHTS];
        const slaImpact = riskData ? riskData.risk_score * 3.5 : variancePct * 0.1;

        nodes.push({
          level: 'family',
          id: `f${f.family_id}`,
          name: familyName,
          demand,
          forecast,
          variancePct,
          slaImpact,
        });
      });

      // Site nodes
      apiData.sites.forEach((s, idx) => {
        const siteId = s.site_id || `site${idx}`;
        const demand = s.total_demand || s.avg_demand_30d * 30 || 500;
        const forecast = demand * 0.88;
        const variancePct = forecast > 0 ? ((demand - forecast) / forecast) * 100 : 0;
        
        const parentFamily = nodes.find(n => n.level === 'family');
        const slaImpact = variancePct > 15 ? 2.5 : variancePct * 0.1;

        nodes.push({
          level: 'site',
          id: siteId,
          name: siteId,
          parentId: parentFamily?.id,
          demand,
          forecast,
          variancePct,
          slaImpact,
        });
      });

      // Supplier nodes
      apiData.suppliers.forEach((s, idx) => {
        const supplierId = s.supplier_id || idx;
        const realSupplierName = (s as any).fornecedor_nome || s.supplier_name || REAL_SUPPLIER_NAMES[idx % REAL_SUPPLIER_NAMES.length] || `Fornecedor ${supplierId}`;
        const demand = (s as any).total_demand || (s as any).supplier_frequency * 100 || 800;
        const forecast = demand * 0.90;
        const variancePct = forecast > 0 ? ((demand - forecast) / forecast) * 100 : 0;
        
        const parentFamily = nodes.find(n => n.level === 'family');
        const leadTimeMean = s.avg_lead_time || (s as any).supplier_lead_time_mean || 14;
        const slaImpact = leadTimeMean > 16 ? 2.8 : variancePct * 0.12;

        nodes.push({
          level: 'supplier',
          id: `sup${supplierId}`,
          name: realSupplierName,
          parentId: parentFamily?.id,
          demand,
          forecast,
          variancePct,
          slaImpact,
        });
      });
    }

    console.log('📊 Hierarchical nodes generated:', {
      total: nodes.length,
      families: nodes.filter(n => n.level === 'family').length,
      sites: nodes.filter(n => n.level === 'site').length,
      suppliers: nodes.filter(n => n.level === 'supplier').length,
    });

    return nodes;
  }, [apiData.families, apiData.sites, apiData.suppliers]);

  // Re-initialize charts when activeLevel or data changes
  useEffect(() => {
    if (!isInitialized || !isChartLoaded) {
      console.log('⏳ Waiting for initialization...', { isInitialized, isChartLoaded });
      return;
    }
    
    // Use hierarchicalNodes from current render
    const currentNodes = hierarchicalNodes;
    console.log('📊 Chart init effect - nodes available:', currentNodes.length, 'for level:', activeLevel);
    
    if (currentNodes.length === 0) {
      console.warn('⚠️ No hierarchical nodes available - this should not happen with mock data');
      return;
    }

    const timer = setTimeout(() => {
      // Initialize charts inline to ensure access to latest state
      // Use currentNodes from closure to ensure we have the right data
      const filteredNodes = currentNodes.filter(n => n.level === activeLevel);
      console.log('📊 Filtered nodes for charts:', filteredNodes.length, filteredNodes);
      
      console.log('📊 Re-initializing charts for level:', activeLevel, 'with', filteredNodes.length, 'nodes');

      if (filteredNodes.length === 0) {
        console.warn('⚠️ No nodes found for level:', activeLevel);
        return;
      }

      // Family/Site/Supplier Chart
      try {
        const familyCanvas = document.getElementById('familyChart') as HTMLCanvasElement;
        if (familyCanvas && familyCanvas.parentElement) {
          const existingChart = (familyCanvas as any).chart;
          if (existingChart) {
            existingChart.destroy();
          }

          const ctx = familyCanvas.getContext('2d');
          if (ctx && filteredNodes.length > 0) {
            const labels = filteredNodes.map(n => n.name.length > 20 ? n.name.substring(0, 20) + '...' : n.name);
            const demandData = filteredNodes.map(n => n.demand);
            const forecastData = filteredNodes.map(n => n.forecast);

            const chart = new (window as any).Chart(ctx, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [
                  {
                    label: 'Demanda Real',
                    data: demandData,
                    backgroundColor: 'rgba(50, 184, 198, 0.7)',
                    borderColor: 'rgba(50, 184, 198, 1)',
                    borderWidth: 2,
                  },
                  {
                    label: 'Previsão',
                    data: forecastData,
                    backgroundColor: 'rgba(230, 129, 97, 0.7)',
                    borderColor: 'rgba(230, 129, 97, 1)',
                    borderWidth: 2,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    beginAtZero: true,
                  },
                  x: {
                    ticks: { 
                      color: 'rgba(167, 169, 169, 0.7)',
                      maxRotation: 45,
                      minRotation: 45,
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                  },
                },
                plugins: {
                  legend: { 
                    display: true, 
                    labels: { color: 'rgba(167, 169, 169, 1)' },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        return ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('pt-BR') + ' un';
                      },
                    },
                  },
                },
              },
            });
            (familyCanvas as any).chart = chart;
          }
        }
      } catch (e) {
        console.error('❌ Error initializing family chart:', e);
      }

      // Variance Chart
      try {
        const varianceCanvas = document.getElementById('varianceChart') as HTMLCanvasElement;
        if (varianceCanvas && varianceCanvas.parentElement) {
          const existingChart = (varianceCanvas as any).chart;
          if (existingChart) {
            existingChart.destroy();
          }

          const ctx = varianceCanvas.getContext('2d');
          if (ctx && filteredNodes.length > 0) {
            const labels = filteredNodes.map(n => n.name.length > 20 ? n.name.substring(0, 20) + '...' : n.name);
            const varianceData = filteredNodes.map(n => n.variancePct);
            const backgroundColor = filteredNodes.map(n => 
              n.variancePct > 15 ? 'rgba(255, 84, 89, 0.7)' : 
              n.variancePct < -15 ? 'rgba(34, 197, 94, 0.7)' : 
              'rgba(230, 129, 97, 0.7)'
            );
            const borderColor = filteredNodes.map(n => 
              n.variancePct > 15 ? 'rgba(192, 21, 47, 1)' : 
              n.variancePct < -15 ? 'rgba(21, 128, 61, 1)' : 
              'rgba(168, 75, 47, 1)'
            );

            const chart = new (window as any).Chart(ctx, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Variância %',
                  data: varianceData,
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                  borderWidth: 2,
                }],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: { 
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function(value: any) {
                        return value + '%';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  },
                  x: {
                    ticks: { 
                      color: 'rgba(167, 169, 169, 0.7)',
                      maxRotation: 45,
                      minRotation: 45,
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                  },
                },
                plugins: {
                  legend: { 
                    display: true, 
                    labels: { color: 'rgba(167, 169, 169, 1)' },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        return 'Variância: ' + ctx.parsed.y.toFixed(1) + '%';
                      },
                    },
                  },
                },
              },
            });
            (varianceCanvas as any).chart = chart;
          }
        }
      } catch (e) {
        console.error('❌ Error initializing variance chart:', e);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [activeLevel, isInitialized, isChartLoaded, hierarchicalNodes]);

  // Generate insights from prescriptive data
  const insights = (() => {
    const insightsList: Array<{
      level: 'family' | 'site' | 'supplier';
      title: string;
      description: string;
      recommendation: string;
    }> = [];

    // Family insights from prescriptive analytics
    Object.entries(PRESCRIPTIVE_INSIGHTS).forEach(([family, data]) => {
      if (data.stockout_risk === 'HIGH') {
        insightsList.push({
          level: 'family',
          title: `🔴 ${family.replace(/_/g, ' ')} - Risco Alto de Stockout`,
          description: `Família ${family.replace(/_/g, ' ')} apresenta risco de stockout ALTO (score: ${(data.risk_score * 100).toFixed(1)}%). Variância de demanda elevada requer atenção imediata.`,
          recommendation: `Aumentar estoque de segurança em 50% (${data.recommended_safety_stock_days} dias). Revisar fornecedores - diversificação necessária. Multiplicador de ponto de reposição: ${data.recommended_reorder_point_multiplier.toFixed(2)}x.`,
        });
      }
    });

    // Site insights
    const highVarianceSites = hierarchicalNodes
      .filter(n => n.level === 'site' && Math.abs(n.variancePct) > 15)
      .slice(0, 2);
    
    highVarianceSites.forEach(site => {
      insightsList.push({
        level: 'site',
        title: `📍 ${site.name} - Hotspot de Variância`,
        description: `Site ${site.name} apresenta variância de ${site.variancePct > 0 ? '+' : ''}${site.variancePct.toFixed(1)}% vs. previsão. Demanda: ${site.demand.toLocaleString('pt-BR')} un.`,
        recommendation: `Aumentar buffer stock em 30% para próximos 30 dias. Monitorar padrões sazonais e eventos climáticos. Considerar redistribuição de estoque.`,
      });
    });

    // Supplier insights
    const highRiskSuppliers = hierarchicalNodes
      .filter(n => n.level === 'supplier' && (n.slaImpact > 2.0 || n.variancePct > 20))
      .slice(0, 2);
    
    highRiskSuppliers.forEach(supplier => {
      insightsList.push({
        level: 'supplier',
        title: `⚠️ ${supplier.name} - Lead Time Crítico`,
        description: `Fornecedor ${supplier.name} apresenta impacto SLA de ${supplier.slaImpact.toFixed(2)}% e variância de ${supplier.variancePct > 0 ? '+' : ''}${supplier.variancePct.toFixed(1)}%.`,
        recommendation: `Renegociar SLA e penalidades. Mover 30% de volume para fornecedor backup. Ativar fornecedor terciário em 48h se necessário.`,
      });
    });

    return insightsList;
  })();

  // Summary metrics
  const summary = (() => {
    const totalDemand = hierarchicalNodes
      .filter(n => n.level === activeLevel)
      .reduce((sum, n) => sum + n.demand, 0);
    
    const avgVariance = hierarchicalNodes
      .filter(n => n.level === activeLevel)
      .reduce((sum, n) => sum + n.variancePct, 0) / Math.max(1, hierarchicalNodes.filter(n => n.level === activeLevel).length);
    
    const criticalNodes = hierarchicalNodes
      .filter(n => n.level === activeLevel && Math.abs(n.variancePct) > 15)
      .length;
    
    const avgSlaImpact = hierarchicalNodes
      .filter(n => n.level === activeLevel)
      .reduce((sum, n) => sum + n.slaImpact, 0) / Math.max(1, hierarchicalNodes.filter(n => n.level === activeLevel).length);

    // Critical path: top variance family -> top variance site -> top variance supplier
    const topFamily = hierarchicalNodes
      .filter(n => n.level === 'family')
      .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))[0];
    const topSite = hierarchicalNodes
      .filter(n => n.level === 'site' && n.parentId === topFamily?.id)
      .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))[0];
    const topSupplier = hierarchicalNodes
      .filter(n => n.level === 'supplier' && n.parentId === topFamily?.id)
      .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))[0];

    const criticalPath = [
      topFamily?.name || 'N/A',
      topSite?.name || 'N/A',
      topSupplier?.name || 'N/A',
    ].filter(n => n !== 'N/A');

    return {
      totalDemand,
      varianceTopLevel: avgVariance,
      criticalPath,
      criticalNodes,
      avgSlaImpact,
    };
  })();

  // Initialize charts
  const initCharts = () => {
    const filteredNodes = hierarchicalNodes.filter(n => n.level === activeLevel);
    
    console.log('📊 Initializing charts for level:', activeLevel, 'with', filteredNodes.length, 'nodes');

    if (filteredNodes.length === 0) {
      console.warn('⚠️ No nodes found for level:', activeLevel);
      return;
    }

    // Family/Site/Supplier Chart
    try {
      const familyCanvas = document.getElementById('familyChart') as HTMLCanvasElement;
      if (familyCanvas && familyCanvas.parentElement) {
        const existingChart = (familyCanvas as any).chart;
        if (existingChart) {
          existingChart.destroy();
        }

        const ctx = familyCanvas.getContext('2d');
        if (ctx && filteredNodes.length > 0) {
          const labels = filteredNodes.map(n => n.name.length > 20 ? n.name.substring(0, 20) + '...' : n.name);
          const demandData = filteredNodes.map(n => n.demand);
          const forecastData = filteredNodes.map(n => n.forecast);

          console.log('📊 Creating family chart with data:', { labels, demandData, forecastData });

          const chart = new (window as any).Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Demanda Real',
                  data: demandData,
                  backgroundColor: 'rgba(50, 184, 198, 0.7)',
                  borderColor: 'rgba(50, 184, 198, 1)',
                  borderWidth: 2,
                },
                {
                  label: 'Previsão',
                  data: forecastData,
                  backgroundColor: 'rgba(230, 129, 97, 0.7)',
                  borderColor: 'rgba(230, 129, 97, 1)',
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  beginAtZero: true,
                },
                x: {
                  ticks: { 
                    color: 'rgba(167, 169, 169, 0.7)',
                    maxRotation: 45,
                    minRotation: 45,
                  },
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
              },
              plugins: {
                legend: { 
                  display: true, 
                  labels: { color: 'rgba(167, 169, 169, 1)' },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('pt-BR') + ' un';
                    },
                  },
                },
              },
            },
          });
          (familyCanvas as any).chart = chart;
          console.log('✅ Family chart initialized successfully');
        } else {
          console.warn('⚠️ Canvas context not available or no data');
        }
      } else {
        console.warn('⚠️ Canvas element not found');
      }
    } catch (e) {
      console.error('❌ Error initializing family chart:', e);
    }

    // Variance Chart
    try {
      const varianceCanvas = document.getElementById('varianceChart') as HTMLCanvasElement;
      if (varianceCanvas && varianceCanvas.parentElement) {
        const existingChart = (varianceCanvas as any).chart;
        if (existingChart) {
          existingChart.destroy();
        }

        const ctx = varianceCanvas.getContext('2d');
        if (ctx && filteredNodes.length > 0) {
          const labels = filteredNodes.map(n => n.name.length > 20 ? n.name.substring(0, 20) + '...' : n.name);
          const varianceData = filteredNodes.map(n => n.variancePct);
          const backgroundColor = filteredNodes.map(n => 
            n.variancePct > 15 ? 'rgba(255, 84, 89, 0.7)' : 
            n.variancePct < -15 ? 'rgba(34, 197, 94, 0.7)' : 
            'rgba(230, 129, 97, 0.7)'
          );
          const borderColor = filteredNodes.map(n => 
            n.variancePct > 15 ? 'rgba(192, 21, 47, 1)' : 
            n.variancePct < -15 ? 'rgba(21, 128, 61, 1)' : 
            'rgba(168, 75, 47, 1)'
          );

          console.log('📊 Creating variance chart with data:', { labels, varianceData });

          const chart = new (window as any).Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Variância %',
                data: varianceData,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 2,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  ticks: { 
                    color: 'rgba(167, 169, 169, 0.7)',
                    callback: function(value: any) {
                      return value + '%';
                    },
                  },
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                },
                x: {
                  ticks: { 
                    color: 'rgba(167, 169, 169, 0.7)',
                    maxRotation: 45,
                    minRotation: 45,
                  },
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
              },
              plugins: {
                legend: { 
                  display: true, 
                  labels: { color: 'rgba(167, 169, 169, 1)' },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return 'Variância: ' + ctx.parsed.y.toFixed(1) + '%';
                    },
                  },
                },
              },
            },
          });
          (varianceCanvas as any).chart = chart;
          console.log('✅ Variance chart initialized successfully');
        } else {
          console.warn('⚠️ Variance canvas context not available or no data');
        }
      } else {
        console.warn('⚠️ Variance canvas element not found');
      }
    } catch (e) {
      console.error('❌ Error initializing variance chart:', e);
    }
  };

  // Sort table
  const sortTable = (col: number) => {
    if (sortColumn === col) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(col);
      setSortAscending(true);
    }
  };

  // Get sorted nodes for table
  const sortedNodes = (() => {
    const filtered = hierarchicalNodes.filter(n => n.level === activeLevel);
    if (sortColumn < 0) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = Object.values(a)[sortColumn + 2]; // Skip level, id, name
      const bVal = Object.values(b)[sortColumn + 2];
      return sortAscending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  })();

  // Drill down
  const handleDrilldown = (nodeId: string, nodeName: string, level: string) => {
    setSelectedNode({ id: nodeId, name: nodeName, level });
  };

  const closeDrilldown = () => {
    setSelectedNode(null);
  };

  const childrenNodes = selectedNode
    ? hierarchicalNodes.filter(n => n.parentId === selectedNode.id)
    : [];

  // Navigation
  const navigateTo = (feature: string) => {
    router.push(`/features/${feature}`);
  };

  // Effect to check for Chart.js on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof (window as any).Chart !== 'undefined') {
      setIsChartLoaded(true);
      return;
    }

    let checkCount = 0;
    const maxChecks = 100;
    const checkChart = setInterval(() => {
      checkCount++;
      if (typeof (window as any).Chart !== 'undefined') {
        clearInterval(checkChart);
        setIsChartLoaded(true);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkChart);
        console.warn('Chart.js failed to load after timeout');
        setIsInitialized(true);
      }
    }, 100);

    return () => {
      clearInterval(checkChart);
    };
  }, []);

  // Effect to ensure only one tooltip shows at a time
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tooltipWrapper = target.closest('.tooltip-wrapper');
      
      if (tooltipWrapper) {
        // Hide all tooltips first
        document.querySelectorAll('.tooltip-content').forEach((tooltip) => {
          const tooltipEl = tooltip as HTMLElement;
          tooltipEl.style.visibility = 'hidden';
          tooltipEl.style.opacity = '0';
        });
        
        // Show only the tooltip for the hovered wrapper
        const tooltipContent = tooltipWrapper.querySelector('.tooltip-content') as HTMLElement;
        if (tooltipContent) {
          tooltipContent.style.visibility = 'visible';
          tooltipContent.style.opacity = '1';
        }
      } else {
        // Hide all tooltips if not hovering over a tooltip wrapper
        document.querySelectorAll('.tooltip-content').forEach((tooltip) => {
          const tooltipEl = tooltip as HTMLElement;
          tooltipEl.style.visibility = 'hidden';
          tooltipEl.style.opacity = '0';
        });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const currentInsight = insights[currentInsightIdx] || insights[0];
  const levelLabels = {
    family: 'Família',
    site: 'Site/Torre',
    supplier: 'Fornecedor',
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        onLoad={() => setIsChartLoaded(true)}
        strategy="lazyOnload"
      />
      {!isInitialized && (
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando análise hierárquica...</p>
        </div>
      )}
      <div ref={containerRef} className="hierarchical-features-container" style={{ display: isInitialized ? 'block' : 'none' }}>
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
            --color-red-400: rgba(255, 84, 89, 1);
            --color-orange-400: rgba(230, 129, 97, 1);
            --color-green-500: rgba(34, 197, 94, 1);
            --color-teal-300: rgba(50, 184, 198, 1);
            --space-8: 8px;
            --space-12: 12px;
            --space-16: 16px;
            --space-20: 20px;
            --space-24: 24px;
            --space-32: 32px;
            --radius-base: 8px;
            --radius-lg: 12px;
          }

          .hierarchical-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: var(--space-24);
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .hierarchical-header {
            margin-bottom: var(--space-32);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-24);
          }

          .hierarchical-header h1 {
            margin: 0 0 var(--space-8) 0;
            font-size: 28px;
            font-weight: 600;
            color: var(--color-text);
          }

          .hierarchical-header p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 18px;
            line-height: 1.6;
          }

          .narrative-box {
            background: rgba(50, 184, 198, 0.08);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin-bottom: var(--space-32);
            line-height: 1.8;
          }

          .narrative-box h3 {
            margin: 0 0 var(--space-12) 0;
            color: var(--color-primary);
            font-size: 18px;
            font-weight: 600;
          }

          .narrative-box p {
            margin: 0 0 var(--space-12) 0;
            color: var(--color-text);
            font-size: 18px;
          }

          .narrative-box p:last-child {
            margin-bottom: 0;
          }

          .highlight-red {
            color: var(--color-red-400);
            font-weight: 600;
          }

          .highlight-green {
            color: var(--color-green-500);
            font-weight: 600;
          }

          .tabs-container {
            display: flex;
            gap: var(--space-12);
            margin-bottom: var(--space-24);
            border-bottom: 1px solid var(--color-border);
            flex-wrap: wrap;
          }

          .tab-button {
            padding: var(--space-12) var(--space-20);
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: var(--color-text-secondary);
            cursor: pointer;
            font-size: 18px;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
            bottom: -1px;
          }

          .tab-button:hover {
            color: var(--color-primary);
          }

          .tab-button.active {
            color: var(--color-primary);
            border-bottom-color: var(--color-primary);
          }

          .summary-banner {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-32);
          }

          .metric-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            position: relative;
            cursor: help;
            transition: all 0.3s ease;
          }

          .metric-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 0 12px rgba(50, 184, 198, 0.2);
          }

          .metric-card .label {
            font-size: 18px;
            font-weight: 500;
            text-transform: uppercase;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-8);
            letter-spacing: 0.5px;
          }

          .metric-card .value {
            font-size: 28px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-4);
          }

          .metric-card .unit {
            font-size: 18px;
            color: var(--color-text-secondary);
          }

          .tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          /* Hide all tooltips by default, only show on direct hover */
          .tooltip-content {
            visibility: hidden;
            opacity: 0;
            background: rgba(31, 33, 33, 0.98);
            backdrop-filter: blur(8px);
            color: var(--color-text);
            text-align: left;
            border-radius: var(--radius-base);
            padding: var(--space-20);
            position: absolute;
            z-index: 10000;
            bottom: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            width: 360px;
            max-width: 90vw;
            font-size: 16px;
            line-height: 1.7;
            border: 2px solid var(--color-primary);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(50, 184, 198, 0.2);
            transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
            pointer-events: none;
          }

          .tooltip-content strong {
            color: var(--color-primary);
            font-weight: 600;
          }

          .tooltip-content ul {
            margin: var(--space-8) 0;
            padding-left: var(--space-20);
          }

          .tooltip-content li {
            margin: var(--space-4) 0;
          }

          .tooltip-content::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid;
            border-color: var(--color-primary) transparent transparent transparent;
            pointer-events: none;
          }

          /* Only show tooltip on direct hover, hide nested tooltips */
          .tooltip-wrapper:hover > .tooltip-content {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          /* Hide nested tooltips when parent is hovered */
          .tooltip-wrapper:hover .tooltip-wrapper .tooltip-content,
          .tooltip-wrapper .tooltip-wrapper:hover .tooltip-content {
            visibility: hidden !important;
            opacity: 0 !important;
          }

          /* Prevent tooltip from showing when hovering over tooltip content */
          .tooltip-content:hover {
            visibility: hidden !important;
            opacity: 0 !important;
          }

          /* Ensure only direct child tooltip shows */
          .tooltip-wrapper:hover > .tooltip-content:not(.tooltip-wrapper .tooltip-content) {
            visibility: visible;
            opacity: 1;
          }

          /* Tab tooltips */
          .tab-button.tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .tab-button .tooltip-content {
            bottom: calc(100% + 10px);
            width: 300px;
            z-index: 10001;
          }

          /* Table header tooltips */
          .table th.tooltip-wrapper {
            position: relative;
            display: table-cell;
          }

          .table th .tooltip-content {
            bottom: calc(100% + 10px);
            width: 320px;
            z-index: 10002;
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
          }

          .table th:hover .tooltip-content {
            transform: translateX(-50%) translateY(0);
          }

          /* Table row tooltips - hide row tooltips when hovering headers */
          .table tbody tr.tooltip-wrapper {
            position: relative;
          }

          .table tbody tr .tooltip-content {
            bottom: calc(100% + 10px);
            left: 50%;
            width: 340px;
            z-index: 10003;
            transform: translateX(-50%) translateY(-5px);
          }

          .table tbody tr:hover .tooltip-content {
            transform: translateX(-50%) translateY(0);
          }

          /* Hide row tooltips when hovering table headers */
          .table thead:hover ~ tbody tr .tooltip-content {
            visibility: hidden !important;
            opacity: 0 !important;
          }

          /* Insight card tooltips */
          .insight-card.tooltip-wrapper {
            position: relative;
          }

          .insight-card .tooltip-content {
            bottom: calc(100% + 10px);
            width: 350px;
            z-index: 10004;
          }

          /* Critical path tooltips */
          .path-node.tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .path-node .tooltip-content {
            bottom: calc(100% + 10px);
            width: 300px;
            z-index: 10005;
          }

          /* Child card tooltips */
          .child-card.tooltip-wrapper {
            position: relative;
          }

          .child-card .tooltip-content {
            bottom: calc(100% + 10px);
            width: 320px;
            z-index: 10006;
          }

          /* Section title tooltips */
          .section-title.tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .section-title .tooltip-content {
            bottom: calc(100% + 10px);
            width: 380px;
            z-index: 10007;
          }

          /* Narrative box tooltips */
          .narrative-box.tooltip-wrapper {
            position: relative;
          }

          .narrative-box .tooltip-content {
            bottom: calc(100% + 10px);
            width: 400px;
            z-index: 10008;
          }

          /* Chart title tooltips */
          .chart-title.tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .chart-title .tooltip-content {
            bottom: calc(100% + 10px);
            width: 360px;
            z-index: 10009;
          }

          /* Carousel title tooltips */
          .carousel-title.tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .carousel-title .tooltip-content {
            bottom: calc(100% + 10px);
            width: 360px;
            z-index: 10010;
          }

          /* CTA button tooltips */
          .cta-button.tooltip-wrapper {
            position: relative;
          }

          .cta-button .tooltip-content {
            bottom: calc(100% + 10px);
            width: 340px;
            z-index: 10011;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .chart-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            position: relative;
            min-height: 420px;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
          }

          .chart-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-text);
            width: 100%;
            flex-shrink: 0;
          }

          .chart-canvas {
            flex: 1;
            position: relative;
            min-height: 300px;
          }

          .chart-canvas canvas {
            width: 100% !important;
            height: 100% !important;
          }

          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin: var(--space-32) 0 var(--space-16) 0;
            color: var(--color-text);
            border-bottom: 2px solid var(--color-primary);
            padding-bottom: var(--space-12);
            width: 100%;
            display: block;
          }

          .table-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin-bottom: var(--space-32);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }

          .table thead {
            background: rgba(50, 184, 198, 0.1);
            border-bottom: 2px solid var(--color-border);
          }

          .table th {
            padding: var(--space-16) var(--space-20);
            text-align: left;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--color-primary);
            letter-spacing: 0.5px;
            cursor: pointer;
            user-select: none;
            position: relative;
            white-space: nowrap;
          }

          .table th::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0;
            background: var(--color-primary);
            opacity: 0.1;
            transition: width 0.2s ease;
          }

          .table th:hover::before {
            width: 3px;
          }

          .table th:nth-child(1) {
            text-align: left;
            min-width: 200px;
          }

          .table th:nth-child(2) {
            text-align: left;
            min-width: 120px;
          }

          .table th:nth-child(3),
          .table th:nth-child(4) {
            text-align: right;
            min-width: 120px;
          }

          .table th:nth-child(5),
          .table th:nth-child(6) {
            text-align: right;
            min-width: 140px;
          }

          .table th:nth-child(7) {
            text-align: center;
            min-width: 100px;
          }

          .table th:hover {
            background: rgba(50, 184, 198, 0.15);
          }

          .table td {
            padding: var(--space-16) var(--space-20);
            border-bottom: 1px solid var(--color-border);
            font-size: 18px;
            position: relative;
          }

          .table td::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0;
            background: var(--color-primary);
            opacity: 0;
            transition: all 0.2s ease;
          }

          .table tbody tr:hover td::before {
            width: 3px;
            opacity: 0.3;
          }

          .table td:nth-child(1) {
            text-align: left;
            min-width: 200px;
          }

          .table td:nth-child(2) {
            text-align: left;
            min-width: 120px;
          }

          .table td:nth-child(3),
          .table td:nth-child(4) {
            text-align: right;
            min-width: 120px;
          }

          .table td:nth-child(5),
          .table td:nth-child(6) {
            text-align: right;
            min-width: 140px;
          }

          .table td:nth-child(7) {
            text-align: center;
            min-width: 100px;
          }

          .table tbody tr {
            transition: all 0.2s ease;
          }

          .table tbody tr:hover {
            background: rgba(50, 184, 198, 0.08);
            cursor: pointer;
            transform: translateX(2px);
            box-shadow: -2px 0 0 var(--color-primary);
          }

          .table tbody tr.row-variance-high {
            background: rgba(255, 84, 89, 0.08);
            border-left: 3px solid rgba(255, 84, 89, 0.3);
          }

          .table tbody tr.row-variance-high:hover {
            background: rgba(255, 84, 89, 0.12);
            border-left-color: var(--color-red-400);
          }

          /* Node name styling similar to tier-name */
          .node-name {
            font-weight: 500;
            color: var(--color-primary);
            transition: color 0.2s ease;
          }

          .table tbody tr:hover .node-name {
            color: var(--color-primary);
            font-weight: 600;
          }

          /* Variance styling with enhanced visual feedback */
          .variance-positive {
            color: var(--color-orange-400);
            font-weight: 600;
            position: relative;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(230, 129, 97, 0.1);
            display: inline-block;
            min-width: 60px;
            text-align: center;
          }

          .variance-negative {
            color: var(--color-green-500);
            font-weight: 600;
            position: relative;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(34, 197, 94, 0.1);
            display: inline-block;
            min-width: 60px;
            text-align: center;
          }

          /* Highlight extreme variances - applied via inline styles in JSX */
          .variance-extreme {
            background: rgba(230, 129, 97, 0.2) !important;
            border: 1px solid rgba(230, 129, 97, 0.4) !important;
          }

          /* Risk badges with enhanced styling */
          .risk-high { 
            color: var(--color-red-400);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: var(--space-4);
            padding: 4px 10px;
            border-radius: 6px;
            background: rgba(255, 84, 89, 0.15);
            border: 1px solid rgba(255, 84, 89, 0.3);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .risk-medium { 
            color: var(--color-orange-400);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: var(--space-4);
            padding: 4px 10px;
            border-radius: 6px;
            background: rgba(230, 129, 97, 0.15);
            border: 1px solid rgba(230, 129, 97, 0.3);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .risk-low { 
            color: var(--color-green-500);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: var(--space-4);
            padding: 4px 10px;
            border-radius: 6px;
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid rgba(34, 197, 94, 0.3);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Number formatting styles */
          .table td:nth-child(3),
          .table td:nth-child(4) {
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.02em;
          }

          /* Enhanced header styling */
          .table th {
            transition: all 0.2s ease;
            position: relative;
          }

          .table th:hover::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--color-primary);
            opacity: 0.6;
          }

          /* Sort indicator */
          .table th[data-sorted="asc"]::after {
            content: ' ▲';
            font-size: 10px;
            opacity: 0.7;
            margin-left: 4px;
          }

          .table th[data-sorted="desc"]::after {
            content: ' ▼';
            font-size: 10px;
            opacity: 0.7;
            margin-left: 4px;
          }

          /* Smooth transitions for all table elements */
          .table td {
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
          }

          /* Enhanced number display */
          .table td:nth-child(3),
          .table td:nth-child(4),
          .table td:nth-child(6) {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-weight: 500;
          }

          /* Loading state styling */
          .table tbody tr.loading {
            opacity: 0.6;
            pointer-events: none;
          }

          /* Empty state styling */
          .table tbody:empty::after {
            content: 'Nenhum dado disponível';
            display: block;
            padding: var(--space-32);
            text-align: center;
            color: var(--color-text-secondary);
            font-size: 18px;
          }

          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .table th,
            .table td {
              padding: var(--space-12) var(--space-16);
              font-size: 16px;
            }

            .table th:nth-child(1),
            .table td:nth-child(1) {
              min-width: 150px;
            }
          }

          @media (max-width: 768px) {
            .table-container {
              overflow-x: auto;
            }

            .table {
              min-width: 800px;
            }

            .table th,
            .table td {
              padding: var(--space-10) var(--space-12);
              font-size: 14px;
            }

            .risk-high,
            .risk-medium,
            .risk-low {
              font-size: 12px;
              padding: 3px 8px;
            }
          }

          .insights-carousel {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .carousel-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-primary);
          }

          .carousel-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-16);
          }

          .carousel-nav {
            display: flex;
            gap: var(--space-8);
            align-items: center;
          }

          .carousel-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(50, 184, 198, 0.2);
            border: 1px solid var(--color-primary);
            color: var(--color-primary);
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .carousel-btn:hover {
            background: var(--color-primary);
            color: var(--color-charcoal-700);
          }

          .insight-card {
            background: rgba(50, 184, 198, 0.08);
            border-left: 4px solid var(--color-primary);
            padding: var(--space-16);
            border-radius: var(--radius-base);
          }

          .insight-title {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
            font-size: 18px;
          }

          .insight-description {
            font-size: 18px;
            color: var(--color-text);
            margin-bottom: var(--space-8);
          }

          .insight-recommendation {
            font-size: 18px;
            color: var(--color-teal-300);
            font-weight: 500;
          }

          .drilldown-panel {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin-bottom: var(--space-32);
          }

          .drilldown-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-16);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-16);
          }

          .drilldown-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-primary);
          }

          .drilldown-breadcrumb {
            font-size: 18px;
            color: var(--color-text-secondary);
          }

          .children-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: var(--space-16);
          }

          .child-card {
            background: rgba(50, 184, 198, 0.05);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            padding: var(--space-12);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .child-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 2px 8px rgba(50, 184, 198, 0.15);
          }

          .child-name {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
            font-size: 18px;
          }

          .child-metric {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            margin-bottom: var(--space-4);
            color: var(--color-text-secondary);
          }

          .child-value {
            color: var(--color-text);
            font-weight: 500;
          }

          .critical-path-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin-bottom: var(--space-32);
          }

          .critical-path-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-primary);
          }

          .path-flow {
            display: flex;
            align-items: center;
            gap: var(--space-12);
            flex-wrap: wrap;
          }

          .path-node {
            background: rgba(50, 184, 198, 0.15);
            border: 1px solid var(--color-primary);
            border-radius: var(--radius-base);
            padding: var(--space-12);
            font-size: 18px;
            font-weight: 500;
            color: var(--color-primary);
            text-align: center;
            min-width: 120px;
          }

          .path-arrow {
            color: var(--color-primary);
            font-size: 18px;
            font-weight: bold;
          }

          .navigation-cta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-32);
          }

          .cta-button {
            background: var(--color-surface);
            border: 2px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
          }

          .cta-button:hover {
            background: rgba(50, 184, 198, 0.1);
            transform: translateY(-2px);
          }

          .cta-icon {
            font-size: 28px;
            margin-bottom: var(--space-8);
          }

          .cta-text {
            color: var(--color-primary);
            font-weight: 600;
            font-size: 18px;
          }

          .cta-subtext {
            font-size: 18px;
            color: var(--color-text-secondary);
            margin-top: var(--space-8);
          }

          .cta-button.tooltip-wrapper {
            position: relative;
          }

          .cta-button .tooltip-content {
            bottom: calc(100% + 8px);
            width: 340px;
          }

          /* Educational Section */
          .educational-section {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-32);
            margin-bottom: var(--space-32);
          }

          .educational-content {
            width: 100%;
          }

          .educational-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-24);
            border-bottom: 2px solid var(--color-primary);
            padding-bottom: var(--space-12);
          }

          .educational-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-24);
          }

          .educational-card {
            background: rgba(50, 184, 198, 0.05);
            border: 1px solid var(--color-border);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-base);
            padding: var(--space-20);
            transition: all 0.3s ease;
          }

          .educational-card:hover {
            background: rgba(50, 184, 198, 0.1);
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.2);
          }

          .educational-card-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
          }

          .educational-text {
            font-size: 18px;
            color: var(--color-text);
            line-height: 1.7;
            margin-bottom: var(--space-12);
          }

          .educational-text:last-child {
            margin-bottom: 0;
          }

          .educational-list {
            font-size: 18px;
            color: var(--color-text);
            line-height: 1.8;
            margin: var(--space-12) 0;
            padding-left: var(--space-24);
          }

          .educational-list li {
            margin-bottom: var(--space-8);
          }

          .educational-list li:last-child {
            margin-bottom: 0;
          }

          @media (max-width: 768px) {
            .charts-grid {
              grid-template-columns: 1fr;
            }
            .summary-banner {
              grid-template-columns: 1fr;
            }
            .children-grid {
              grid-template-columns: 1fr;
            }
            .path-flow {
              flex-direction: column;
            }
          }
        `}</style>

        <div className="hierarchical-header">
          <h1>📊 Features Hierárquicas</h1>
          <p>Análise multi-nível de demanda: Família → Site/Torre → Fornecedor</p>
      </div>

        {/* Narrative Box */}
        <div className="narrative-box">
          <h3 className="tooltip-wrapper">
            📈 Situação Geral - Análise Hierárquica em Foco
            <div className="tooltip-content">
              <strong>Visão Executiva da Análise Hierárquica</strong>
              <br/><br/>
              Esta seção fornece um resumo executivo da situação atual, destacando métricas-chave, hotspots identificados e caminho crítico de risco.
              <br/><br/>
              <strong>Uso:</strong> Use esta visão geral para entender rapidamente o estado da operação e identificar áreas que requerem atenção imediata.
            </div>
          </h3>
          <p>
            <strong>Demanda total agregada: {summary.totalDemand.toLocaleString('pt-BR')} un</strong>, com variância de{' '}
            <span className={summary.varianceTopLevel > 15 ? 'highlight-red' : 'highlight-green'}>
              {summary.varianceTopLevel > 0 ? '+' : ''}{summary.varianceTopLevel.toFixed(1)}% vs. previsão
            </span>.
            {summary.criticalNodes > 0 && (
              <>
                {' '}
                <strong>{summary.criticalNodes} {levelLabels[activeLevel]}(s) crítico(s)</strong> identificados com variância &gt; ±15%.
              </>
            )}
          </p>
          <p>
            <strong>Insights Operacionais:</strong> Drill-down revela hotspots de variância. Impacto SLA médio:{' '}
            <span className={summary.avgSlaImpact > 2.0 ? 'highlight-red' : 'highlight-green'}>
              {summary.avgSlaImpact.toFixed(2)}%
            </span>.
            {summary.criticalPath.length > 0 && (
              <>
                {' '}
                Caminho crítico: <strong>{summary.criticalPath.join(' → ')}</strong>.
              </>
            )}
              </p>
            </div>

        {/* Tabs */}
        <div className="tabs-container">
            <button
            className={`tab-button ${activeLevel === 'family' ? 'active' : ''}`}
              onClick={() => setActiveLevel('family')}
            >
            📦 Por Família
            </button>
            <button
            className={`tab-button ${activeLevel === 'site' ? 'active' : ''}`}
              onClick={() => setActiveLevel('site')}
            >
            🏢 Por Site/Torre
            </button>
            <button
            className={`tab-button ${activeLevel === 'supplier' ? 'active' : ''}`}
              onClick={() => setActiveLevel('supplier')}
            >
            🤝 Por Fornecedor
            </button>
        </div>

        {/* Summary Metrics */}
        <div className="summary-banner">
          <div className="metric-card tooltip-wrapper">
            <div className="label">Demanda Total</div>
            <div className="value">{summary.totalDemand.toLocaleString('pt-BR')}</div>
            <div className="unit">unidades | Período: 30d</div>
            <div className="tooltip-content">
              <strong>Demanda agregada</strong> de todos os níveis da hierarquia para o período selecionado.
              <br/><br/>
              <strong>Interpretação:</strong> Soma total de movimentações/consumo no nível {levelLabels[activeLevel]}.
              <br/><br/>
              <strong>Uso:</strong> Baseline para planejamento de estoque e capacidade.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">Variância Top-Level</div>
            <div className="value" style={{ color: summary.varianceTopLevel > 15 ? 'var(--color-orange-400)' : 'var(--color-primary)' }}>
              {summary.varianceTopLevel > 0 ? '+' : ''}{summary.varianceTopLevel.toFixed(1)}%
            </div>
            <div className="unit">vs. Previsão | {summary.varianceTopLevel > 15 ? 'Alerta' : 'Normal'}</div>
            <div className="tooltip-content">
              <strong>Divergência</strong> entre previsão e realização no nível {levelLabels[activeLevel]}.
              <br/><br/>
              <strong>Interpretação:</strong>
              <ul>
                <li>&gt;15%: Anomalia significativa - requer ação</li>
                <li>5-15%: Variação esperada - monitorar</li>
                <li>&lt;5%: Alinhado com previsão</li>
              </ul>
              <strong>Impacto:</strong> Variâncias altas podem indicar problemas de forecast, eventos não previstos, ou mudanças de demanda.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">{levelLabels[activeLevel]}s Críticos</div>
            <div className="value">{summary.criticalNodes}</div>
            <div className="unit">de {hierarchicalNodes.filter(n => n.level === activeLevel).length} | {summary.criticalNodes > 0 ? Math.round((summary.criticalNodes / hierarchicalNodes.filter(n => n.level === activeLevel).length) * 100) : 0}% da variância</div>
            <div className="tooltip-content">
              <strong>Hotspots identificados</strong> que concentram volatilidade no nível {levelLabels[activeLevel]}.
              <br/><br/>
              <strong>Critério:</strong> Variância &gt; ±15% vs. previsão.
              <br/><br/>
              <strong>Ação:</strong> Focar esforços de mitigação nestes {levelLabels[activeLevel]}s para reduzir risco operacional.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">Impacto SLA</div>
            <div className="value" style={{ color: summary.avgSlaImpact > 2.0 ? 'var(--color-red-400)' : 'var(--color-primary)' }}>
              {summary.avgSlaImpact.toFixed(2)}%
            </div>
            <div className="unit">Risco de Violação | {summary.avgSlaImpact > 2.0 ? 'Crítico' : 'Controlado'}</div>
            <div className="tooltip-content">
              <strong>Risco de SLA</strong> propagado hierarquicamente: lead time + demanda.
              <br/><br/>
              <strong>Cálculo:</strong> Combina variância de demanda, lead time de fornecedores, e histórico de violações.
              <br/><br/>
              <strong>Interpretação:</strong>
              <ul>
                <li>&gt;2.5%: Risco ALTO - ação urgente</li>
                <li>1.5-2.5%: Risco MÉDIO - monitorar</li>
                <li>&lt;1.5%: Risco BAIXO - situação controlada</li>
              </ul>
            </div>
          </div>
        </div>

      {/* Charts */}
        <div className="section-title">📊 Gráficos de Demanda vs. Previsão</div>
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-title tooltip-wrapper">
              Demanda vs. Previsão por {levelLabels[activeLevel]}
              <div className="tooltip-content">
                <strong>Comparação Demanda Real vs. Previsão</strong>
                <br/><br/>
                <strong>Barras azuis:</strong> Demanda real observada no período.
                <br/>
                <strong>Barras laranjas:</strong> Previsão de demanda (baseline).
                <br/><br/>
                <strong>Interpretação:</strong> Diferença entre barras indica variância. Barras azuis maiores que laranjas = demanda acima do esperado.
                <br/><br/>
                <strong>Ação:</strong> Identificar {levelLabels[activeLevel]}s com maior gap para investigação.
              </div>
            </div>
            <div className="chart-canvas">
              <canvas id="familyChart"></canvas>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-title tooltip-wrapper">
              Variância por {levelLabels[activeLevel]} (%)
              <div className="tooltip-content">
                <strong>Variância Percentual</strong>
                <br/><br/>
                <strong>Cores:</strong>
                <ul>
                  <li>Vermelho: Variância &gt; +15% (demanda acima do esperado)</li>
                  <li>Laranja: Variância entre -15% e +15% (normal)</li>
                  <li>Verde: Variância &lt; -15% (demanda abaixo do esperado)</li>
                </ul>
                <br/>
                <strong>Fórmula:</strong> ((Demanda Real - Previsão) / Previsão) × 100%
                <br/><br/>
                <strong>Uso:</strong> Priorizar ações corretivas nos {levelLabels[activeLevel]}s com maior variância absoluta.
              </div>
            </div>
            <div className="chart-canvas">
              <canvas id="varianceChart"></canvas>
            </div>
          </div>
        </div>

        {/* Variance Table */}
        <div className="section-title tooltip-wrapper">
          📋 Tabela de Variância e Impacto SLA
          <div className="tooltip-content">
            <strong>Tabela Interativa de Análise Hierárquica</strong>
            <br/><br/>
            <strong>Funcionalidades:</strong>
            <ul>
              <li><strong>Clique nas colunas</strong> para ordenar (Nome, Nível, Demanda, Previsão, Variância, Impacto SLA)</li>
              <li><strong>Clique nas linhas</strong> para fazer drill-down e ver nós filhos</li>
              <li><strong>Linhas destacadas</strong> (vermelho claro) indicam variância &gt; ±15%</li>
            </ul>
            <br/>
            <strong>Interpretação:</strong> Use esta tabela para identificar rapidamente os {levelLabels[activeLevel]}s que requerem ação imediata baseado em variância e impacto SLA.
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="tooltip-wrapper" onClick={() => sortTable(0)}>
                  Nome
                  <div className="tooltip-content">
                    <strong>Nome do {levelLabels[activeLevel]}</strong>
                    <br/><br/>
                    Clique para ordenar alfabeticamente. Clique na linha para ver detalhes e fazer drill-down.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(1)}>
                  Nível
                  <div className="tooltip-content">
                    <strong>Nível Hierárquico</strong>
                    <br/><br/>
                    Indica se o item é uma Família, Site/Torre ou Fornecedor na hierarquia de análise.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(2)}>
                  Demanda
                  <div className="tooltip-content">
                    <strong>Demanda Real Observada</strong>
                    <br/><br/>
                    Quantidade total de movimentações/consumo real no período de 30 dias. Clique para ordenar por volume.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(3)}>
                  Previsão
                  <div className="tooltip-content">
                    <strong>Previsão de Demanda</strong>
                    <br/><br/>
                    Quantidade prevista pelo modelo de forecast. Comparar com Demanda Real para identificar gaps.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(4)}>
                  Variância %
                  <div className="tooltip-content">
                    <strong>Variância Percentual</strong>
                    <br/><br/>
                    <strong>Fórmula:</strong> ((Demanda Real - Previsão) / Previsão) × 100%
                    <br/><br/>
                    <strong>Interpretação:</strong>
                    <ul>
                      <li>Valores positivos: Demanda acima do previsto</li>
                      <li>Valores negativos: Demanda abaixo do previsto</li>
                      <li>&gt; ±15%: Requer investigação e ação</li>
                    </ul>
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(5)}>
                  Impacto SLA %
                  <div className="tooltip-content">
                    <strong>Impacto no Service Level Agreement</strong>
                    <br/><br/>
                    Percentual de risco de violação de SLA calculado combinando variância de demanda, lead time de fornecedores e histórico de violações.
                    <br/><br/>
                    <strong>Escala:</strong>
                    <ul>
                      <li>&gt;2.5%: Risco ALTO (ação urgente)</li>
                      <li>1.5-2.5%: Risco MÉDIO (monitorar)</li>
                      <li>&lt;1.5%: Risco BAIXO (controlado)</li>
                    </ul>
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Risco
                  <div className="tooltip-content">
                    <strong>Classificação de Risco</strong>
                    <br/><br/>
                    <strong>🔴 Alto:</strong> Impacto SLA &gt; 2.5% - Requer ação imediata
                    <br/>
                    <strong>🟡 Médio:</strong> Impacto SLA entre 1.5% e 2.5% - Monitorar de perto
                    <br/>
                    <strong>🟢 Baixo:</strong> Impacto SLA &lt; 1.5% - Situação controlada
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((node) => {
                const varianceClass = node.variancePct > 0 ? 'variance-positive' : 'variance-negative';
                const riskClass = node.slaImpact > 2.5 ? 'risk-high' : node.slaImpact > 1.5 ? 'risk-medium' : 'risk-low';
                const riskLabel = node.slaImpact > 2.5 ? '🔴 Alto' : node.slaImpact > 1.5 ? '🟡 Médio' : '🟢 Baixo';
                const isHighVariance = Math.abs(node.variancePct) > 15;

                return (
                  <tr
                    key={node.id}
                    className={isHighVariance ? 'row-variance-high' : ''}
                    onClick={() => handleDrilldown(node.id, node.name, node.level)}
                  >
                    <td className="node-name tooltip-wrapper" style={{ cursor: 'pointer' }}>
                      {node.name.length > 30 ? node.name.substring(0, 30) + '...' : node.name}
                      <div className="tooltip-content">
                        <strong>{node.name}</strong>
                        <br/><br/>
                        <strong>Demanda Real:</strong> {node.demand.toLocaleString('pt-BR')} unidades
                        <br/>
                        <strong>Previsão:</strong> {node.forecast.toLocaleString('pt-BR')} unidades
                        <br/>
                        <strong>Variância:</strong> {node.variancePct > 0 ? '+' : ''}{node.variancePct.toFixed(1)}%
                        <br/>
                        <strong>Impacto SLA:</strong> {node.slaImpact.toFixed(2)}%
                        <br/><br/>
                        <strong>Clique para:</strong> Ver detalhes e fazer drill-down para nós filhos (sites, fornecedores ou materiais relacionados).
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>{levelLabels[node.level]}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{node.demand.toLocaleString('pt-BR')}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{node.forecast.toLocaleString('pt-BR')}</td>
                    <td>
                      <span className={`${varianceClass} ${Math.abs(node.variancePct) > 20 ? 'variance-extreme' : ''}`}>
                        {node.variancePct > 0 ? '+' : ''}{node.variancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{node.slaImpact.toFixed(2)}%</td>
                    <td className={riskClass}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {riskLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Insights Carousel */}
        {insights.length > 0 && (
          <div className="insights-carousel">
            <div className="carousel-controls">
              <div className="carousel-title tooltip-wrapper">
                💡 Insights Prescritivos (ML)
                <div className="tooltip-content">
                  <strong>Insights Gerados por Machine Learning</strong>
                  <br/><br/>
                  <strong>O que são:</strong> Recomendações prescritivas baseadas em análise de padrões históricos, variância de demanda, lead times e risco de SLA.
                  <br/><br/>
                  <strong>Fonte:</strong> Modelos ML processam dados hierárquicos e identificam padrões críticos que requerem ação.
                  <br/><br/>
                  <strong>Uso:</strong> Use as setas para navegar entre insights. Cada insight inclui descrição do problema e recomendação acionável.
                </div>
              </div>
              <div className="carousel-nav">
                <button
                  className="carousel-btn"
                  onClick={() => setCurrentInsightIdx((currentInsightIdx - 1 + insights.length) % insights.length)}
                >
                  ←
                </button>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '18px', minWidth: '60px', textAlign: 'center' }}>
                  {currentInsightIdx + 1} / {insights.length}
                </span>
                <button
                  className="carousel-btn"
                  onClick={() => setCurrentInsightIdx((currentInsightIdx + 1) % insights.length)}
                >
                  →
                </button>
              </div>
            </div>
            {currentInsight && (
              <div className="insight-card tooltip-wrapper">
                <div className="insight-title">{currentInsight.title}</div>
                <div className="insight-description">{currentInsight.description}</div>
                <div className="insight-recommendation">
                  <strong>💡 Recomendação:</strong> {currentInsight.recommendation}
                </div>
                <div className="tooltip-content">
                  <strong>Insight Prescritivo - {currentInsight.level.toUpperCase()}</strong>
                  <br/><br/>
                  <strong>Nível de Análise:</strong> {levelLabels[currentInsight.level]}
                  <br/><br/>
                  <strong>Descrição:</strong> {currentInsight.description}
                  <br/><br/>
                  <strong>Recomendação Acionável:</strong> {currentInsight.recommendation}
                  <br/><br/>
                  <strong>Próximos Passos:</strong> Use este insight para priorizar ações de mitigação. Considere integrar com sistema de gestão de estoque para implementação automática.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Critical Path */}
        {summary.criticalPath.length > 0 && (
          <div className="critical-path-container">
            <div className="critical-path-title tooltip-wrapper">
              🔗 Caminho Crítico - Propagação de Risco
              <div className="tooltip-content">
                <strong>Caminho Crítico de Propagação de Risco</strong>
                <br/><br/>
                <strong>O que é:</strong> Sequência hierárquica (Família → Site → Fornecedor) que apresenta maior variância e impacto SLA.
                <br/><br/>
                <strong>Interpretação:</strong> Este caminho representa a cadeia crítica onde pequenas variações se amplificam e causam maior impacto operacional.
                <br/><br/>
                <strong>Ação:</strong> Focar esforços de mitigação neste caminho específico para maximizar impacto na redução de risco.
              </div>
            </div>
            <div className="path-flow">
              {summary.criticalPath.map((node, idx) => (
                <div key={idx} style={{ display: 'contents' }}>
                  <div className="path-node tooltip-wrapper">
                    {node}
                    <div className="tooltip-content">
                      <strong>Nó do Caminho Crítico</strong>
                      <br/><br/>
                      <strong>Nome:</strong> {node}
                      <br/>
                      <strong>Posição:</strong> {idx === 0 ? 'Família (Topo)' : idx === 1 ? 'Site/Torre (Meio)' : 'Fornecedor (Base)'}
                      <br/><br/>
                      Este nó faz parte do caminho crítico identificado pelo algoritmo de análise hierárquica como o de maior impacto.
                    </div>
                  </div>
                  {idx < summary.criticalPath.length - 1 && <div className="path-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drill Down Panel */}
        {selectedNode && (
          <div className="drilldown-panel">
            <div className="drilldown-header">
              <div>
                <div className="drilldown-title">📍 {selectedNode.name}</div>
                <div className="drilldown-breadcrumb">
                  {(() => {
                    const node = hierarchicalNodes.find(n => n.id === selectedNode.id);
                    return node
                      ? `Demanda: ${node.demand.toLocaleString('pt-BR')} un | Variância: ${node.variancePct > 0 ? '+' : ''}${node.variancePct.toFixed(1)}% | SLA Impact: ${node.slaImpact.toFixed(2)}%`
                      : '';
                  })()}
                </div>
              </div>
              <button
                onClick={closeDrilldown}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >
                ×
              </button>
            </div>
            {childrenNodes.length > 0 ? (
              <div className="children-grid">
                {childrenNodes.map((child) => (
                  <div
                    key={child.id}
                    className="child-card tooltip-wrapper"
                    onClick={() => handleDrilldown(child.id, child.name, child.level)}
                  >
                    <div className="child-name">{child.name}</div>
                    <div className="child-metric">
                      <span>Demanda:</span>
                      <span className="child-value">{child.demand.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="child-metric">
                      <span>Previsão:</span>
                      <span className="child-value">{child.forecast.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="child-metric">
                      <span>Variância:</span>
                      <span
                        className="child-value"
                        style={{
                          color: child.variancePct > 0 ? 'var(--color-orange-400)' : 'var(--color-green-500)',
                        }}
                      >
                        {child.variancePct > 0 ? '+' : ''}{child.variancePct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="tooltip-content">
                      <strong>Nó Filho: {child.name}</strong>
                      <br/><br/>
                      <strong>Nível:</strong> {levelLabels[child.level]}
                      <br/>
                      <strong>Demanda:</strong> {child.demand.toLocaleString('pt-BR')} un
                      <br/>
                      <strong>Previsão:</strong> {child.forecast.toLocaleString('pt-BR')} un
                      <br/>
                      <strong>Variância:</strong> {child.variancePct > 0 ? '+' : ''}{child.variancePct.toFixed(1)}%
                      <br/>
                      <strong>Impacto SLA:</strong> {child.slaImpact.toFixed(2)}%
                      <br/><br/>
                      <strong>Clique para:</strong> Fazer drill-down adicional e ver mais detalhes deste nó.
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
                Nenhum nó filho encontrado para este item.
              </p>
      )}
    </div>
        )}

        {/* Navigation CTA */}
        <div className="section-title tooltip-wrapper">
          🔗 Explorar Relacionados
          <div className="tooltip-content">
            <strong>Navegação para Páginas Relacionadas</strong>
            <br/><br/>
            Use estes botões para aprofundar a análise em aspectos específicos relacionados à análise hierárquica:
            <br/><br/>
            <strong>Lead Time:</strong> Análise detalhada de tempos de entrega por fornecedor
            <br/>
            <strong>SLA Dashboard:</strong> Monitoramento de risco de penalidades e violações contratuais
            <br/>
            <strong>Clustering:</strong> Segmentação de padrões de demanda para agrupamento estratégico
          </div>
        </div>
        <div className="navigation-cta">
          <div className="cta-button tooltip-wrapper" onClick={() => navigateTo('lead-time')}>
            <div className="cta-icon">⏱️</div>
            <div className="cta-text">Lead Time Analysis</div>
            <div className="cta-subtext">Investigar impacto de fornecedores no lead time</div>
            <div className="tooltip-content">
              <strong>Análise de Lead Time</strong>
              <br/><br/>
              Explore como os tempos de entrega dos fornecedores impactam a variância hierárquica e o risco de SLA.
              <br/><br/>
              <strong>Conteúdo:</strong> Distribuição de lead times, tendências, confiabilidade de fornecedores e recomendações de otimização.
            </div>
          </div>
          <div className="cta-button tooltip-wrapper" onClick={() => navigateTo('sla')}>
            <div className="cta-icon">🎯</div>
            <div className="cta-text">SLA Dashboard</div>
            <div className="cta-subtext">Monitorar risco de penalidades contratuais</div>
            <div className="tooltip-content">
              <strong>Dashboard de SLA</strong>
              <br/><br/>
              Visualize o risco de violação de Service Level Agreements e penalidades financeiras associadas.
              <br/><br/>
              <strong>Conteúdo:</strong> Status de disponibilidade, previsão de violações, impacto financeiro e ações de mitigação.
            </div>
          </div>
          <div className="cta-button tooltip-wrapper" onClick={() => router.push('/main/clustering')}>
            <div className="cta-icon">🗂️</div>
            <div className="cta-text">Clustering & Segmentação</div>
            <div className="cta-subtext">Agrupar padrões de demanda similares</div>
            <div className="tooltip-content">
              <strong>Clustering e Segmentação</strong>
              <br/><br/>
              Identifique grupos de materiais, sites ou fornecedores com padrões de demanda similares para estratégias de gestão unificadas.
              <br/><br/>
              <strong>Conteúdo:</strong> Agrupamentos por similaridade, perfis de demanda e recomendações de estratégia por cluster.
            </div>
          </div>
        </div>

        {/* Educational Explainer Section */}
        <div className="section-title tooltip-wrapper">
          📚 Guia Educacional - Análise Hierárquica
          <div className="tooltip-content">
            <strong>Seção Educacional</strong>
            <br/><br/>
            Esta seção fornece explicações detalhadas sobre os conceitos e metodologias de análise hierárquica, adaptadas ao nível de agregação selecionado.
            <br/><br/>
            <strong>Conteúdo:</strong> Conceitos fundamentais, interpretação de métricas, metodologias de análise e melhores práticas.
          </div>
        </div>
        <div className="educational-section">
      {activeLevel === 'family' && (
            <div className="educational-content">
              <h3 className="educational-title">📦 Análise Hierárquica por Família de Materiais</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que é Análise por Família?</h4>
                  <p className="educational-text">
                    A análise por família agrupa materiais similares (EPI, Ferro e Aço, Material Elétrico, etc.) para identificar padrões de demanda agregada. 
                    Isso permite planejamento estratégico de estoque e negociação de contratos por categoria.
                  </p>
                  <p className="educational-text">
                    <strong>Benefício:</strong> Reduz complexidade ao trabalhar com grupos ao invés de milhares de SKUs individuais, mantendo precisão suficiente para decisões estratégicas.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Como Interpretar Variância por Família?</h4>
                  <p className="educational-text">
                    <strong>Variância &gt; +15%:</strong> Família com demanda acima do esperado. Pode indicar crescimento de mercado, eventos sazonais ou problemas de forecast.
                  </p>
                  <p className="educational-text">
                    <strong>Variância entre -15% e +15%:</strong> Variação normal esperada. Monitorar tendências.
                  </p>
                  <p className="educational-text">
                    <strong>Variância &lt; -15%:</strong> Demanda abaixo do previsto. Pode indicar mudança de mercado, substituição de produtos ou oversupply.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Ações Recomendadas</h4>
                  <ul className="educational-list">
                    <li><strong>Alta Variância Positiva:</strong> Aumentar estoque de segurança, revisar contratos com fornecedores, considerar diversificação</li>
                    <li><strong>Alta Variância Negativa:</strong> Reduzir pedidos, negociar retorno de estoque, investigar mudanças de mercado</li>
                    <li><strong>Variância Normal:</strong> Manter estratégia atual, monitorar tendências de longo prazo</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Metodologia de Cálculo</h4>
                  <p className="educational-text">
                    <strong>Demanda Agregada:</strong> Soma de todas as movimentações de materiais pertencentes à família no período de 30 dias.
                  </p>
                  <p className="educational-text">
                    <strong>Previsão:</strong> Baseada em modelos de forecast (ARIMA, XGBoost) aplicados à série histórica da família.
                  </p>
                  <p className="educational-text">
                    <strong>Variância:</strong> ((Demanda Real - Previsão) / Previsão) × 100%
                  </p>
                  <p className="educational-text">
                    <strong>Impacto SLA:</strong> Combina variância, lead time médio dos fornecedores da família e histórico de violações.
                  </p>
                </div>
              </div>
            </div>
      )}

      {activeLevel === 'site' && (
            <div className="educational-content">
              <h3 className="educational-title">🏢 Análise Hierárquica por Site/Torre</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que é Análise por Site/Torre?</h4>
                  <p className="educational-text">
                    A análise por site/torre agrega demanda por localização física (torres de telecomunicações, depósitos, bases operacionais). 
                    Permite identificar hotspots geográficos e otimizar distribuição regional de estoque.
                  </p>
                  <p className="educational-text">
                    <strong>Benefício:</strong> Facilita planejamento logístico, redistribuição estratégica de estoque e identificação de padrões regionais de demanda.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Fatores que Influenciam Variância por Site</h4>
                  <ul className="educational-list">
                    <li><strong>Eventos Climáticos:</strong> Tempestades, enchentes aumentam demanda de reparos</li>
                    <li><strong>Expansão de Infraestrutura:</strong> Instalação de novas torres 5G aumenta demanda</li>
                    <li><strong>Padrões Sazonais:</strong> Alta temporada turística, eventos regionais</li>
                    <li><strong>Manutenção Programada:</strong> Campanhas de manutenção preventiva</li>
                    <li><strong>Fatores Geográficos:</strong> Acessibilidade, condições de transporte</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Estratégias de Mitigação por Site</h4>
                  <p className="educational-text">
                    <strong>Hotspots de Alta Variância:</strong>
                  </p>
                  <ul className="educational-list">
                    <li>Aumentar buffer stock regional em 30-50%</li>
                    <li>Estabelecer acordos de resposta rápida com fornecedores locais</li>
                    <li>Implementar monitoramento climático e alertas proativos</li>
                    <li>Considerar estoque compartilhado entre sites próximos</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Interpretação de Métricas</h4>
                  <p className="educational-text">
                    <strong>Demanda Total por Site:</strong> Soma de todas as movimentações de materiais no site no período.
                  </p>
                  <p className="educational-text">
                    <strong>Frequência:</strong> Número de dias com movimentação no período. Alta frequência indica site ativo.
                  </p>
                  <p className="educational-text">
                    <strong>Variância:</strong> Indica se o site está consumindo mais ou menos do que o previsto. Sites com variância &gt; ±15% requerem investigação.
                  </p>
                  <p className="educational-text">
                    <strong>Impacto SLA:</strong> Considera lead time de entrega ao site, criticidade das torres e histórico de violações.
                  </p>
                </div>
              </div>
            </div>
      )}

      {activeLevel === 'supplier' && (
            <div className="educational-content">
              <h3 className="educational-title">🤝 Análise Hierárquica por Fornecedor</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que é Análise por Fornecedor?</h4>
                  <p className="educational-text">
                    A análise por fornecedor agrega demanda, variância e impacto SLA por fornecedor individual. 
                    Permite avaliar performance, confiabilidade e impacto estratégico de cada parceiro comercial.
                  </p>
                  <p className="educational-text">
                    <strong>Benefício:</strong> Facilita renegociação de contratos, diversificação de fornecedores, otimização de relacionamento comercial e redução de risco de supply chain.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Métricas-Chave por Fornecedor</h4>
                  <ul className="educational-list">
                    <li><strong>Demanda Total:</strong> Volume total de materiais fornecidos no período</li>
                    <li><strong>Lead Time Médio:</strong> Tempo médio de entrega (dias). Valores altos aumentam risco</li>
                    <li><strong>Variância de Lead Time:</strong> Consistência das entregas. Alta variância = baixa confiabilidade</li>
                    <li><strong>Confiabilidade:</strong> Taxa de entregas no prazo. &lt;85% indica problemas</li>
                    <li><strong>Impacto SLA:</strong> Risco de violação de SLA devido a atrasos ou variância</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Estratégias de Gestão de Fornecedores</h4>
                  <p className="educational-text">
                    <strong>Fornecedores de Alto Risco (Impacto SLA &gt; 2.5%):</strong>
                  </p>
                  <ul className="educational-list">
                    <li>Renegociar SLAs com penalidades mais rígidas</li>
                    <li>Diversificar: mover 30-50% do volume para fornecedor backup</li>
                    <li>Ativar fornecedor terciário em 48h se necessário</li>
                    <li>Revisar contratos e condições comerciais</li>
                    <li>Implementar monitoramento proativo de pedidos</li>
                  </ul>
                  <p className="educational-text">
                    <strong>Fornecedores Confiáveis:</strong> Considerar aumentar volume, negociar melhores condições, estabelecer parcerias estratégicas.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Interpretação de Variância por Fornecedor</h4>
                  <p className="educational-text">
                    <strong>Variância Positiva Alta:</strong> Fornecedor está recebendo mais pedidos do que previsto. Pode indicar:
                  </p>
                  <ul className="educational-list">
                    <li>Mudança de estratégia de sourcing (concentração de compras)</li>
                    <li>Problemas com outros fornecedores (migração de volume)</li>
                    <li>Crescimento de demanda não previsto</li>
                  </ul>
                  <p className="educational-text">
                    <strong>Variância Negativa Alta:</strong> Fornecedor recebendo menos pedidos. Pode indicar:
                  </p>
                  <ul className="educational-list">
                    <li>Diversificação de fornecedores</li>
                    <li>Problemas de qualidade ou serviço</li>
                    <li>Mudança estratégica de sourcing</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Cálculo de Impacto SLA</h4>
                  <p className="educational-text">
                    O impacto SLA por fornecedor combina múltiplos fatores:
                  </p>
                  <ul className="educational-list">
                    <li><strong>Variância de Demanda:</strong> Quanto maior, maior o risco de stockout</li>
                    <li><strong>Lead Time Médio:</strong> Lead times longos aumentam risco</li>
                    <li><strong>Variância de Lead Time:</strong> Inconsistência aumenta incerteza</li>
                    <li><strong>Histórico de Violações:</strong> Fornecedores com histórico ruim têm maior risco</li>
                    <li><strong>Criticidade dos Materiais:</strong> Materiais críticos têm maior peso no cálculo</li>
                  </ul>
                  <p className="educational-text">
                    <strong>Fórmula Simplificada:</strong> Impacto SLA = (Variância × 0.4) + (Lead Time Risk × 0.3) + (Histórico × 0.3)
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Melhores Práticas</h4>
                  <ul className="educational-list">
                    <li><strong>Diversificação:</strong> Nunca depender de um único fornecedor para materiais críticos</li>
                    <li><strong>Monitoramento Contínuo:</strong> Revisar métricas mensalmente e ajustar estratégias</li>
                    <li><strong>Comunicação:</strong> Compartilhar insights com fornecedores para melhoria contínua</li>
                    <li><strong>Contratos Flexíveis:</strong> Incluir cláusulas de ajuste baseadas em performance</li>
                    <li><strong>Backup Plans:</strong> Sempre ter fornecedores alternativos identificados e qualificados</li>
                  </ul>
                </div>
              </div>
            </div>
      )}
    </div>
      </div>
    </>
  );
}
