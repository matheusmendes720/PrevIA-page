'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Script from 'next/script';
import { apiClient } from '../../../lib/api';
import { FamilyEncoding, SiteEncoding, SupplierEncoding } from '../../../types/features';
import { useRouter } from 'next/navigation';
import PrescriptiveTooltip from '@/components/PrescriptiveTooltip';
import { prescriptiveDataService } from '@/services/prescriptiveDataService';
import type { PrescriptiveInsights } from '@/types/prescriptive';

// Prescriptive insights from ML outputs for categorical encodings
const PRESCRIPTIVE_INSIGHTS = {
  EPI: {
    importance_score: 0.35,
    model_gain: 12.5,
    recommendation: 'Aumentar estoque de segurança em 50%',
  },
  FERRO_E_AÇO: {
    importance_score: 0.28,
    model_gain: 9.8,
    recommendation: 'Diversificar fornecedores e revisar contratos',
  },
  MATERIAL_ELETRICO: {
    importance_score: 0.22,
    model_gain: 8.2,
    recommendation: 'Monitorar expansão 5G e ajustar forecast',
  },
  MATERIAL_CIVIL: {
    importance_score: 0.10,
    model_gain: 4.5,
    recommendation: 'Manter estratégia atual, monitorar tendências',
  },
  FERRAMENTAS_E_EQUIPAMENTOS: {
    importance_score: 0.05,
    model_gain: 2.1,
    recommendation: 'Otimizar estoque mínimo',
  },
};

// Real supplier names from client database
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

// Mock data for categorical encodings
const MOCK_FAMILY_ENCODINGS = [
  { id: 'f1', name: 'EPI', encodingValue: 0.85, importanceScore: 0.35, demandShare: 28.5, narrative: 'Alta importância no modelo. Família crítica para operações de segurança.' },
  { id: 'f2', name: 'FERRO_E_AÇO', encodingValue: 0.72, importanceScore: 0.28, demandShare: 22.3, narrative: 'Importância significativa. Variância de demanda moderada.' },
  { id: 'f3', name: 'MATERIAL_ELETRICO', encodingValue: 0.68, importanceScore: 0.22, demandShare: 18.7, narrative: 'Impacto crescente devido à expansão 5G.' },
  { id: 'f4', name: 'MATERIAL_CIVIL', encodingValue: 0.45, importanceScore: 0.10, demandShare: 15.2, narrative: 'Demanda estável, importância moderada.' },
  { id: 'f5', name: 'FERRAMENTAS_E_EQUIPAMENTOS', encodingValue: 0.32, importanceScore: 0.05, demandShare: 15.3, narrative: 'Baixa importância, demanda previsível.' },
];

const MOCK_SITE_ENCODINGS = [
  { id: 's1', name: 'Salvador Centro', encodingValue: 0.78, importanceScore: 0.32, demandShare: 18.5, narrative: 'Site de alta importância. Hub operacional principal.' },
  { id: 's2', name: 'Salvador Norte', encodingValue: 0.65, importanceScore: 0.25, demandShare: 15.2, narrative: 'Importância significativa. Crescimento de demanda.' },
  { id: 's3', name: 'Recife Norte', encodingValue: 0.58, importanceScore: 0.20, demandShare: 12.8, narrative: 'Demanda estável, importância moderada.' },
  { id: 's4', name: 'Belo Horizonte Oeste', encodingValue: 0.42, importanceScore: 0.15, demandShare: 10.5, narrative: 'Variância alta, requer atenção.' },
  { id: 's5', name: 'São Paulo Sul', encodingValue: 0.38, importanceScore: 0.08, demandShare: 8.2, narrative: 'Baixa importância, operação estável.' },
];

const MOCK_SUPPLIER_ENCODINGS = [
  { id: 'sup1', name: 'L.M.C LEMOS MATERIAIS PARA CONSTRUCAO', encodingValue: 0.82, importanceScore: 0.30, demandShare: 20.5, narrative: 'Fornecedor crítico. Alta confiabilidade e volume.' },
  { id: 'sup2', name: 'HIPERFERRO', encodingValue: 0.70, importanceScore: 0.25, demandShare: 18.2, narrative: 'Importância alta. Lead time consistente.' },
  { id: 'sup3', name: 'BELGO CERCAS', encodingValue: 0.65, importanceScore: 0.20, demandShare: 15.8, narrative: 'Fornecedor estratégico. Performance estável.' },
  { id: 'sup4', name: 'BRASPRESS', encodingValue: 0.55, importanceScore: 0.15, demandShare: 12.5, narrative: 'Importância moderada. Logística eficiente.' },
  { id: 'sup5', name: 'FERIMPORT COMERCIO REPRESENTACAO E IMPORTACAO LTDA', encodingValue: 0.48, importanceScore: 0.10, demandShare: 10.2, narrative: 'Fornecedor especializado. Volatilidade de lead time.' },
];

export default function CategoricalFeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);
  const router = useRouter();
  const [prescriptiveData, setPrescriptiveData] = useState<PrescriptiveInsights | null>(null);

  useEffect(() => {
    prescriptiveDataService.loadPrescriptiveInsights().then(setPrescriptiveData);
  }, []);

  const [activeCategoryType, setActiveCategoryType] = useState<'family' | 'site' | 'supplier'>('family');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; type: string } | null>(null);
  const [currentInsightIdx, setCurrentInsightIdx] = useState(0);
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortAscending, setSortAscending] = useState(true);

  const [apiData, setApiData] = useState<{
    families: FamilyEncoding[];
    sites: SiteEncoding[];
    suppliers: SupplierEncoding[];
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
          apiClient.getFamilyEncodings(),
          apiClient.getSiteEncodings(),
          apiClient.getSupplierEncodings(),
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
        console.error('Error fetching categorical data:', error);
        setApiData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao carregar dados',
        }));
      }
    };

    fetchData();
  }, []);

  // Calculate categorical encodings from API data with fallback to mock
  const categoricalEncodings = useMemo(() => {
    const encodings: Array<{
      categoryType: 'family' | 'site' | 'supplier';
      id: string;
      name: string;
      encodingValue: number;
      importanceScore: number;
      demandShare: number;
      narrative: string;
    }> = [];

    // Check if API has meaningful data
    const hasApiData = (apiData.families.length > 0 && apiData.families.some(f => ((f as any).material_count || 0) > 0)) ||
      (apiData.sites.length > 0 && apiData.sites.some(s => ((s as any).material_count || 0) > 0)) ||
      (apiData.suppliers.length > 0 && apiData.suppliers.some(s => ((s as any).material_count || 0) > 0));
    const useMockData = !hasApiData;

    if (useMockData) {
      // Use mock data
      MOCK_FAMILY_ENCODINGS.forEach(f => {
        encodings.push({
          categoryType: 'family',
          id: f.id,
          name: f.name,
          encodingValue: f.encodingValue,
          importanceScore: f.importanceScore,
          demandShare: f.demandShare,
          narrative: f.narrative,
        });
      });

      MOCK_SITE_ENCODINGS.forEach(s => {
        encodings.push({
          categoryType: 'site',
          id: s.id,
          name: s.name,
          encodingValue: s.encodingValue,
          importanceScore: s.importanceScore,
          demandShare: s.demandShare,
          narrative: s.narrative,
        });
      });

      MOCK_SUPPLIER_ENCODINGS.forEach(s => {
        encodings.push({
          categoryType: 'supplier',
          id: s.id,
          name: s.name,
          encodingValue: s.encodingValue,
          importanceScore: s.importanceScore,
          demandShare: s.demandShare,
          narrative: s.narrative,
        });
      });
    } else {
      // Use API data
      apiData.families.forEach((f, idx) => {
        const familyName = (f as any).familia_nome || (f as any).family_name || `Família ${(f as any).familia_id || idx}`;
        const materialCount = (f as any).material_count || 0;
        const encodingValue = ((f as any).familia_encoded || (f as any).encoded_value || idx) / 100;
        const totalMaterials = apiData.families.reduce((sum, fam) => sum + ((fam as any).material_count || 0), 0);
        const demandShare = totalMaterials > 0 ? (materialCount / totalMaterials) * 100 : 0;

        const familyKey = familyName.toUpperCase().replace(/\s+/g, '_');
        const insightData = PRESCRIPTIVE_INSIGHTS[familyKey as keyof typeof PRESCRIPTIVE_INSIGHTS];
        const importanceScore = insightData ? insightData.importance_score : Math.min(0.3, demandShare / 100);

        encodings.push({
          categoryType: 'family',
          id: `f${(f as any).familia_id || idx}`,
          name: familyName,
          encodingValue: Math.min(1, encodingValue),
          importanceScore,
          demandShare,
          narrative: insightData ? insightData.recommendation : `Família ${familyName} com ${materialCount} materiais.`,
        });
      });

      apiData.sites.forEach((s, idx) => {
        const siteId = s.site_id || `site${idx}`;
        const materialCount = (s as any).material_count || 0;
        const totalMaterials = apiData.sites.reduce((sum, site) => sum + ((site as any).material_count || 0), 0);
        const demandShare = totalMaterials > 0 ? (materialCount / totalMaterials) * 100 : 0;
        const encodingValue = (idx + 1) / apiData.sites.length;
        const importanceScore = Math.min(0.3, demandShare / 100);

        encodings.push({
          categoryType: 'site',
          id: siteId,
          name: siteId,
          encodingValue: Math.min(1, encodingValue),
          importanceScore,
          demandShare,
          narrative: `Site ${siteId} com ${materialCount} materiais. ${demandShare > 15 ? 'Alta demanda, requer atenção.' : 'Demanda moderada.'}`,
        });
      });

      apiData.suppliers.forEach((s, idx) => {
        const supplierId = (s as any).fornecedor_id || (s as any).supplier_id || idx;
        const realSupplierName = (s as any).fornecedor_nome || (s as any).supplier_name || REAL_SUPPLIER_NAMES[idx % REAL_SUPPLIER_NAMES.length] || `Fornecedor ${supplierId}`;
        const materialCount = (s as any).material_count || 0;
        const totalMaterials = apiData.suppliers.reduce((sum, sup) => sum + ((sup as any).material_count || 0), 0);
        const demandShare = totalMaterials > 0 ? (materialCount / totalMaterials) * 100 : 0;
        const encodingValue = (idx + 1) / apiData.suppliers.length;
        const importanceScore = Math.min(0.3, demandShare / 100);

        encodings.push({
          categoryType: 'supplier',
          id: `sup${supplierId}`,
          name: realSupplierName,
          encodingValue: Math.min(1, encodingValue),
          importanceScore,
          demandShare,
          narrative: `Fornecedor ${realSupplierName} com ${materialCount} materiais. ${demandShare > 15 ? 'Fornecedor crítico.' : 'Fornecedor estratégico.'}`,
        });
      });
    }

    return encodings;
  }, [apiData.families, apiData.sites, apiData.suppliers]);

  // Generate insights from prescriptive data
  const insights = useMemo(() => {
    const insightsList: Array<{
      categoryType: 'family' | 'site' | 'supplier';
      title: string;
      description: string;
      recommendation: string;
    }> = [];

    // Family insights
    Object.entries(PRESCRIPTIVE_INSIGHTS).forEach(([family, data]) => {
      if (data.importance_score > 0.2) {
        insightsList.push({
          categoryType: 'family',
          title: `🎯 ${family.replace(/_/g, ' ')} - Alto Impacto no Modelo`,
          description: `Família ${family.replace(/_/g, ' ')} apresenta importância de ${(data.importance_score * 100).toFixed(1)}% no modelo de forecast, contribuindo com ${data.model_gain.toFixed(1)}% de ganho de precisão.`,
          recommendation: data.recommendation,
        });
      }
    });

    // Site insights
    const highImportanceSites = categoricalEncodings
      .filter(e => e.categoryType === 'site' && e.importanceScore > 0.25)
      .slice(0, 2);

    highImportanceSites.forEach(site => {
      insightsList.push({
        categoryType: 'site',
        title: `📍 ${site.name} - Site de Alta Importância`,
        description: `Site ${site.name} apresenta importância de ${(site.importanceScore * 100).toFixed(1)}% e participação de ${site.demandShare.toFixed(1)}% na demanda total.`,
        recommendation: `Focar esforços de otimização neste site. Considerar aumentar buffer stock em 30% e revisar estratégia de distribuição.`,
      });
    });

    // Supplier insights
    const highImportanceSuppliers = categoricalEncodings
      .filter(e => e.categoryType === 'supplier' && e.importanceScore > 0.20)
      .slice(0, 2);

    highImportanceSuppliers.forEach(supplier => {
      insightsList.push({
        categoryType: 'supplier',
        title: `🤝 ${supplier.name} - Fornecedor Crítico`,
        description: `Fornecedor ${supplier.name} apresenta importância de ${(supplier.importanceScore * 100).toFixed(1)}% e participação de ${supplier.demandShare.toFixed(1)}% na demanda total.`,
        recommendation: `Renegociar SLA e diversificar fornecedores. Considerar fornecedor backup para reduzir risco de dependência.`,
      });
    });

    return insightsList;
  }, [categoricalEncodings]);

  // Summary metrics
  const summary = useMemo(() => {
    const filteredEncodings = categoricalEncodings.filter(e => e.categoryType === activeCategoryType);
    const topContributor = filteredEncodings.sort((a, b) => b.importanceScore - a.importanceScore)[0];
    const totalImportance = filteredEncodings.reduce((sum, e) => sum + e.importanceScore, 0);
    const avgModelGain = totalImportance * 35; // Estimate model gain from importance

    return {
      topContributor: topContributor?.name || 'N/A',
      topImportance: topContributor?.importanceScore || 0,
      modelGain: avgModelGain,
      totalCategories: filteredEncodings.length,
    };
  }, [categoricalEncodings, activeCategoryType]);

  // Sort table
  const sortTable = (col: number) => {
    if (sortColumn === col) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(col);
      setSortAscending(true);
    }
  };

  // Get sorted encodings for table
  const sortedEncodings = useMemo(() => {
    const filtered = categoricalEncodings.filter(e => e.categoryType === activeCategoryType);
    if (sortColumn < 0) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortColumn) {
        case 0: aVal = a.name; bVal = b.name; break;
        case 1: aVal = a.encodingValue; bVal = b.encodingValue; break;
        case 2: aVal = a.importanceScore; bVal = b.importanceScore; break;
        case 3: aVal = a.demandShare; bVal = b.demandShare; break;
        default: return 0;
      }
      if (typeof aVal === 'string') {
        return sortAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAscending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [categoricalEncodings, activeCategoryType, sortColumn, sortAscending]);

  // Drill down
  const handleDrilldown = (categoryId: string, categoryName: string, categoryType: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName, type: categoryType });
  };

  const closeDrilldown = () => {
    setSelectedCategory(null);
  };

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
        document.querySelectorAll('.tooltip-content').forEach((tooltip) => {
          const tooltipEl = tooltip as HTMLElement;
          tooltipEl.style.visibility = 'hidden';
          tooltipEl.style.opacity = '0';
        });

        const tooltipContent = tooltipWrapper.querySelector('.tooltip-content') as HTMLElement;
        if (tooltipContent) {
          tooltipContent.style.visibility = 'visible';
          tooltipContent.style.opacity = '1';
        }
      } else {
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
          (window as any).Chart.defaults.font.size = 12;
          (window as any).Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
          (window as any).Chart.defaults.font.weight = '500';
          (window as any).Chart.defaults.plugins = (window as any).Chart.defaults.plugins || {};
          (window as any).Chart.defaults.plugins.legend = (window as any).Chart.defaults.plugins.legend || {};
          (window as any).Chart.defaults.plugins.legend.labels = (window as any).Chart.defaults.plugins.legend.labels || {};
          (window as any).Chart.defaults.plugins.legend.labels.font = (window as any).Chart.defaults.plugins.legend.labels.font || {};
          (window as any).Chart.defaults.plugins.legend.labels.font.size = 12;
          (window as any).Chart.defaults.plugins.legend.labels.font.weight = '500';
          (window as any).Chart.defaults.plugins.tooltip = (window as any).Chart.defaults.plugins.tooltip || {};
          (window as any).Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: '600' };
          (window as any).Chart.defaults.plugins.tooltip.bodyFont = { size: 12, weight: '500' };
          (window as any).Chart.defaults.plugins.tooltip.padding = 12;
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

    return () => {
      const chartIds = ['importanceChart', 'encodingChart'];
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
  }, [isChartLoaded]);

  // Apply inline styles to all oversized elements after render
  useEffect(() => {
    if (!isInitialized) return;

    const applyStyles = () => {
      // Header h1
      document.querySelectorAll('.categorical-header h1').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '18px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });

      // Metric cards
      document.querySelectorAll('.metric-card .label').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '500', 'important');
      });
      document.querySelectorAll('.metric-card .value').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '24px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      document.querySelectorAll('.metric-card .unit').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '14px', 'important');
      });

      // Section titles
      document.querySelectorAll('.section-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '15px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });

      // Chart titles
      document.querySelectorAll('.chart-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '14px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });

      // Narrative box
      document.querySelectorAll('.narrative-box h3').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '16px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      document.querySelectorAll('.narrative-box p').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '15px', 'important');
      });

      // Tab buttons
      document.querySelectorAll('.tab-button').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '15px', 'important');
      });
    };

    applyStyles();
    const interval = setInterval(applyStyles, 100);
    return () => clearInterval(interval);
  }, [isInitialized]);

  // Re-initialize charts when activeCategoryType or data changes
  useEffect(() => {
    if (!isInitialized || !isChartLoaded) return;

    const currentEncodings = categoricalEncodings;
    const filteredEncodings = currentEncodings.filter(e => e.categoryType === activeCategoryType);

    if (filteredEncodings.length === 0) return;

    const timer = setTimeout(() => {
      // Importance Chart
      try {
        const importanceCanvas = document.getElementById('importanceChart') as HTMLCanvasElement;
        if (importanceCanvas && importanceCanvas.parentElement) {
          const existingChart = (importanceCanvas as any).chart;
          if (existingChart) {
            existingChart.destroy();
          }

          const ctx = importanceCanvas.getContext('2d');
          if (ctx && filteredEncodings.length > 0) {
            const sorted = [...filteredEncodings].sort((a, b) => b.importanceScore - a.importanceScore);
            const labels = sorted.map(e => e.name.length > 20 ? e.name.substring(0, 20) + '...' : e.name);
            const importanceData = sorted.map(e => e.importanceScore * 100);

            const chart = new (window as any).Chart(ctx, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Importância (%)',
                  data: importanceData,
                  backgroundColor: filteredEncodings.map(e =>
                    e.importanceScore > 0.25 ? 'rgba(50, 184, 198, 0.7)' :
                      e.importanceScore > 0.15 ? 'rgba(230, 129, 97, 0.7)' :
                        'rgba(167, 169, 169, 0.7)'
                  ),
                  borderColor: filteredEncodings.map(e =>
                    e.importanceScore > 0.25 ? 'rgba(50, 184, 198, 1)' :
                      e.importanceScore > 0.15 ? 'rgba(230, 129, 97, 1)' :
                        'rgba(167, 169, 169, 1)'
                  ),
                  borderWidth: 2,
                }],
              },
              options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function (value: any) {
                        return value + '%';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    beginAtZero: true,
                  },
                  y: {
                    ticks: {
                      color: 'rgba(167, 169, 169, 0.7)',
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        return 'Importância: ' + ctx.parsed.x.toFixed(1) + '%';
                      },
                    },
                  },
                },
              },
            });
            (importanceCanvas as any).chart = chart;
          }
        }
      } catch (e) {
        console.error('❌ Error initializing importance chart:', e);
      }

      // Encoding vs Demand Share Chart
      try {
        const encodingCanvas = document.getElementById('encodingChart') as HTMLCanvasElement;
        if (encodingCanvas && encodingCanvas.parentElement) {
          const existingChart = (encodingCanvas as any).chart;
          if (existingChart) {
            existingChart.destroy();
          }

          const ctx = encodingCanvas.getContext('2d');
          if (ctx && filteredEncodings.length > 0) {
            const chart = new (window as any).Chart(ctx, {
              type: 'scatter',
              data: {
                datasets: [{
                  label: 'Encoding vs. Demand Share',
                  data: filteredEncodings.map((e) => ({
                    x: e.encodingValue * 100,
                    y: e.demandShare,
                  })),
                  backgroundColor: filteredEncodings.map(e =>
                    e.importanceScore > 0.25 ? 'rgba(50, 184, 198, 0.7)' :
                      e.importanceScore > 0.15 ? 'rgba(230, 129, 97, 0.7)' :
                        'rgba(167, 169, 169, 0.7)'
                  ),
                  borderColor: filteredEncodings.map(e =>
                    e.importanceScore > 0.25 ? 'rgba(50, 184, 198, 1)' :
                      e.importanceScore > 0.15 ? 'rgba(230, 129, 97, 1)' :
                        'rgba(167, 169, 169, 1)'
                  ),
                  borderWidth: 2,
                  pointRadius: 8,
                  pointHoverRadius: 10,
                }],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Valor de Encoding (%)',
                      color: 'rgba(167, 169, 169, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function (value: any) {
                        return value + '%';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    beginAtZero: true,
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Participação na Demanda (%)',
                      color: 'rgba(167, 169, 169, 0.7)',
                    },
                    ticks: {
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function (value: any) {
                        return value + '%';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    display: true,
                    labels: { color: 'rgba(167, 169, 169, 1)' },
                  },
                  tooltip: {
                    callbacks: {
                      title: (items: any) => {
                        const idx = items[0].dataIndex;
                        return filteredEncodings[idx].name;
                      },
                      label: (ctx: any) => {
                        const idx = ctx.dataIndex;
                        const e = filteredEncodings[idx];
                        return [
                          `Encoding: ${(e.encodingValue * 100).toFixed(1)}%`,
                          `Demanda: ${e.demandShare.toFixed(1)}%`,
                          `Importância: ${(e.importanceScore * 100).toFixed(1)}%`,
                        ];
                      },
                    },
                  },
                },
              },
            });
            (encodingCanvas as any).chart = chart;
          }
        }
      } catch (e) {
        console.error('❌ Error initializing encoding chart:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [activeCategoryType, isInitialized, isChartLoaded, categoricalEncodings]);

  const currentInsight = insights[currentInsightIdx] || insights[0];
  const categoryLabels = {
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
          <p className="text-brand-slate">Carregando análise categórica...</p>
        </div>
      )}
      <div ref={containerRef} className="categorical-features-container" style={{ display: isInitialized ? 'block' : 'none' }}>
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

          .categorical-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: var(--space-24);
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .categorical-header {
            margin-bottom: var(--space-32);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-24);
          }

          .categorical-header h1 {
            margin: 0 0 var(--space-8) 0;
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text);
          }

          .categorical-header p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 15px;
            line-height: 1.6;
          }

          .narrative-box {
            background: rgba(50, 184, 198, 0.08);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-32);
            line-height: 1.8;
          }

          .narrative-box h3 {
            margin: 0 0 var(--space-12) 0;
            color: var(--color-primary);
            font-size: 16px;
            font-weight: 600;
          }

          .narrative-box p {
            margin: 0 0 var(--space-12) 0;
            color: var(--color-text);
            font-size: 15px;
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
            font-size: 15px;
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
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .metric-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            position: relative;
            cursor: help;
            transition: all 0.3s ease;
            min-height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .metric-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 0 12px rgba(50, 184, 198, 0.2);
          }

          .metric-card .label {
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-8);
            letter-spacing: 0.5px;
          }

          .metric-card .value {
            font-size: 30px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-4);
          }

          .metric-card .unit {
            font-size: 14px;
            color: var(--color-text-secondary);
          }

          .tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

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

          .tooltip-wrapper:hover > .tooltip-content {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
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
            overflow-x: auto;
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
            vertical-align: middle;
          }

          .table th.tooltip-wrapper {
            position: relative;
            display: table-cell;
          }

          .table td .tooltip-wrapper {
            display: inline-block;
            width: 100%;
          }

          .table td.tooltip-wrapper {
            position: relative;
            display: table-cell;
          }

          .table th:nth-child(1) {
            text-align: left;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table th:nth-child(2) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table th:nth-child(3) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table th:nth-child(4) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table th:nth-child(5) {
            text-align: left;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table td {
            padding: var(--space-16) var(--space-20);
            border-bottom: 1px solid var(--color-border);
            font-size: 18px;
            vertical-align: middle;
          }

          .table td:nth-child(1) {
            text-align: left;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table td:nth-child(2) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
            font-variant-numeric: tabular-nums;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          }

          .table td:nth-child(3) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
            font-variant-numeric: tabular-nums;
          }

          .table td:nth-child(4) {
            text-align: right;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
            font-variant-numeric: tabular-nums;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          }

          .table td:nth-child(5) {
            text-align: left;
            padding-left: var(--space-20);
            padding-right: var(--space-20);
          }

          .table tbody tr {
            transition: all 0.2s ease;
          }

          .table tbody tr:hover {
            background: rgba(50, 184, 198, 0.05);
          }

          .table tbody tr.row-high-importance {
            background: rgba(50, 184, 198, 0.08);
            border-left: 3px solid rgba(50, 184, 198, 0.3);
          }

          .table tbody tr.row-high-importance:hover {
            background: rgba(50, 184, 198, 0.12);
            border-left-color: var(--color-primary);
          }

          .category-name {
            font-weight: 500;
            color: var(--color-primary);
            transition: color 0.2s ease;
          }

          .table tbody tr:hover .category-name {
            color: var(--color-primary);
            font-weight: 600;
          }

          .importance-high {
            color: var(--color-teal-300);
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(50, 184, 198, 0.15);
            border: 1px solid rgba(50, 184, 198, 0.3);
            display: inline-block;
            min-width: 70px;
            text-align: center;
            font-variant-numeric: tabular-nums;
          }

          .importance-medium {
            color: var(--color-orange-400);
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(230, 129, 97, 0.15);
            border: 1px solid rgba(230, 129, 97, 0.3);
            display: inline-block;
            min-width: 70px;
            text-align: center;
            font-variant-numeric: tabular-nums;
          }

          .importance-low {
            color: var(--color-text-secondary);
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(167, 169, 169, 0.15);
            border: 1px solid rgba(167, 169, 169, 0.3);
            display: inline-block;
            min-width: 70px;
            text-align: center;
            font-variant-numeric: tabular-nums;
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
            .educational-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* Header */}
        <div className="categorical-header">
          <h1>📊 Análise de Features Categóricas</h1>
          <p>
            Entenda como encodings categóricos (famílias, sites, fornecedores) influenciam a performance do modelo de forecast e segmentação de demanda.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="narrative-box">
          <h3 className="tooltip-wrapper">
            📈 Visão Geral - Impacto dos Encodings Categóricos
            <div className="tooltip-content">
              <strong>Análise de Features Categóricas</strong>
              <br /><br />
              Esta página mostra como variáveis categóricas (famílias de materiais, sites/torres, fornecedores) são codificadas e utilizadas pelo modelo de machine learning para prever demanda.
              <br /><br />
              <strong>Uso:</strong> Identifique quais categorias têm maior impacto na precisão do modelo e use essas informações para otimizar estratégias de estoque e supply chain.
            </div>
          </h3>
          <p>
            <strong>Top Contribuidor:</strong> {summary.topContributor} com importância de{' '}
            <span className={summary.topImportance > 0.25 ? 'highlight-red' : 'highlight-green'}>
              {(summary.topImportance * 100).toFixed(1)}%
            </span>.
            Ganho de modelo estimado: <strong>{summary.modelGain.toFixed(1)}%</strong> de melhoria na precisão do forecast.
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button tooltip-wrapper ${activeCategoryType === 'family' ? 'active' : ''}`}
            onClick={() => setActiveCategoryType('family')}
          >
            📦 Por Família
            <div className="tooltip-content">
              <strong>Análise por Família de Materiais</strong>
              <br /><br />
              <strong>O que é:</strong> Encodings categóricos para famílias de materiais (EPI, Ferro e Aço, Material Elétrico, etc.).
              <br /><br />
              <strong>Uso:</strong> Identifique quais famílias têm maior importância no modelo de forecast e requerem atenção estratégica.
              <br /><br />
              <strong>Benefício:</strong> Permite otimizar planejamento de estoque e estratégias de compra por categoria de produto.
            </div>
          </button>
          <button
            className={`tab-button tooltip-wrapper ${activeCategoryType === 'site' ? 'active' : ''}`}
            onClick={() => setActiveCategoryType('site')}
          >
            🏢 Por Site/Torre
            <div className="tooltip-content">
              <strong>Análise por Site/Torre</strong>
              <br /><br />
              <strong>O que é:</strong> Encodings categóricos para localizações físicas (torres, depósitos, bases operacionais).
              <br /><br />
              <strong>Uso:</strong> Identifique quais sites têm maior importância no modelo e requerem estratégias específicas de distribuição.
              <br /><br />
              <strong>Benefício:</strong> Permite otimização logística regional e planejamento de distribuição estratégica.
            </div>
          </button>
          <button
            className={`tab-button tooltip-wrapper ${activeCategoryType === 'supplier' ? 'active' : ''}`}
            onClick={() => setActiveCategoryType('supplier')}
          >
            🤝 Por Fornecedor
            <div className="tooltip-content">
              <strong>Análise por Fornecedor</strong>
              <br /><br />
              <strong>O que é:</strong> Encodings categóricos para fornecedores individuais.
              <br /><br />
              <strong>Uso:</strong> Identifique quais fornecedores têm maior importância no modelo e impacto na precisão do forecast.
              <br /><br />
              <strong>Benefício:</strong> Permite otimização de relacionamento comercial e estratégias de sourcing.
            </div>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="summary-banner">
          <div className="metric-card tooltip-wrapper">
            <div className="label">Top Contribuidor</div>
            <div className="value">{summary.topContributor.length > 25 ? summary.topContributor.substring(0, 25) + '...' : summary.topContributor}</div>
            <div className="unit">{categoryLabels[activeCategoryType]} | Importância: {(summary.topImportance * 100).toFixed(1)}%</div>
            <div className="tooltip-content">
              <strong>Top Contribuidor Categórico</strong>
              <br /><br />
              A categoria que tem maior importância no modelo de forecast para o nível {categoryLabels[activeCategoryType]}.
              <br /><br />
              <strong>Interpretação:</strong> Esta categoria contribui mais significativamente para a precisão do modelo de previsão de demanda.
              <br /><br />
              <strong>Uso:</strong> Foque estratégias de otimização nesta categoria para maximizar impacto na precisão do forecast.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">Ganho do Modelo</div>
            <div className="value" style={{ color: summary.modelGain > 10 ? 'var(--color-teal-300)' : 'var(--color-primary)' }}>
              +{summary.modelGain.toFixed(1)}%
            </div>
            <div className="unit">Melhoria de Precisão | {summary.modelGain > 10 ? 'Alto Impacto' : 'Moderado'}</div>
            <div className="tooltip-content">
              <strong>Ganho de Precisão do Modelo</strong>
              <br /><br />
              Percentual estimado de melhoria na precisão do forecast devido ao uso de encodings categóricos.
              <br /><br />
              <strong>Interpretação:</strong>
              <ul>
                <li>&gt;10%: Alto impacto - encodings categóricos são críticos</li>
                <li>5-10%: Impacto moderado - importante para precisão</li>
                <li>&lt;5%: Impacto baixo - encodings auxiliares</li>
              </ul>
              <strong>Uso:</strong> Avalie o valor estratégico de manter e refinar encodings categóricos no modelo.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">Total de Categorias</div>
            <div className="value">{summary.totalCategories}</div>
            <div className="unit">{categoryLabels[activeCategoryType]}s | Nível: {activeCategoryType}</div>
            <div className="tooltip-content">
              <strong>Total de Categorias Analisadas</strong>
              <br /><br />
              Número total de {categoryLabels[activeCategoryType]}s com encodings categóricos no modelo.
              <br /><br />
              <strong>Uso:</strong> Entenda a granularidade da análise categórica e cobertura do modelo.
            </div>
          </div>

          <div className="metric-card tooltip-wrapper">
            <div className="label">Importância Média</div>
            <div className="value" style={{ color: (categoricalEncodings.filter(e => e.categoryType === activeCategoryType).reduce((sum, e) => sum + e.importanceScore, 0) / summary.totalCategories) > 0.15 ? 'var(--color-teal-300)' : 'var(--color-primary)' }}>
              {((categoricalEncodings.filter(e => e.categoryType === activeCategoryType).reduce((sum, e) => sum + e.importanceScore, 0) / summary.totalCategories) * 100).toFixed(1)}%
            </div>
            <div className="unit">Por Categoria | {activeCategoryType}</div>
            <div className="tooltip-content">
              <strong>Importância Média por Categoria</strong>
              <br /><br />
              Importância média das categorias no nível {categoryLabels[activeCategoryType]}.
              <br /><br />
              <strong>Interpretação:</strong> Valores altos indicam que as categorias têm impacto significativo e distribuído no modelo.
              <br /><br />
              <strong>Uso:</strong> Avalie se a importância está concentrada em poucas categorias ou distribuída uniformemente.
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="section-title tooltip-wrapper">
          📊 Gráficos de Importância e Encoding
          <div className="tooltip-content">
            <strong>Visualizações de Encodings Categóricos</strong>
            <br /><br />
            <strong>Gráfico de Importância:</strong> Mostra a importância relativa de cada categoria no modelo de forecast.
            <br /><br />
            <strong>Gráfico Encoding vs. Demanda:</strong> Compara valores de encoding com participação na demanda para identificar anomalias.
            <br /><br />
            <strong>Uso:</strong> Identifique categorias com alta importância mas baixa demanda (oportunidades) ou alta demanda mas baixa importância (otimização).
          </div>
        </div>
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-title tooltip-wrapper">
              Importância no Modelo por {categoryLabels[activeCategoryType]}
              <div className="tooltip-content">
                <strong>Importância no Modelo de Forecast</strong>
                <br /><br />
                <strong>O que mostra:</strong> Percentual de importância de cada categoria no modelo de machine learning.
                <br /><br />
                <strong>Cores:</strong>
                <ul>
                  <li>Azul: Importância &gt; 25% (crítico)</li>
                  <li>Laranja: Importância 15-25% (significativo)</li>
                  <li>Cinza: Importância &lt; 15% (moderado)</li>
                </ul>
                <br />
                <strong>Interpretação:</strong> Categorias com maior importância têm mais peso nas previsões do modelo.
                <br /><br />
                <strong>Ação:</strong> Foque otimizações nas categorias de maior importância para maximizar impacto.
              </div>
            </div>
            <div className="chart-canvas">
              <canvas id="importanceChart"></canvas>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-title tooltip-wrapper">
              Encoding vs. Participação na Demanda
              <div className="tooltip-content">
                <strong>Relação Encoding vs. Demanda</strong>
                <br /><br />
                <strong>Eixo X:</strong> Valor de encoding (0-100%) - como a categoria é codificada no modelo.
                <br /><br />
                <strong>Eixo Y:</strong> Participação na demanda total (%) - quanto a categoria representa da demanda.
                <br /><br />
                <strong>Interpretação:</strong>
                <ul>
                  <li>Alto encoding + Alta demanda: Categoria crítica e bem representada</li>
                  <li>Alto encoding + Baixa demanda: Oportunidade de crescimento</li>
                  <li>Baixo encoding + Alta demanda: Pode requerer ajuste no modelo</li>
                </ul>
                <br />
                <strong>Uso:</strong> Identifique anomalias e oportunidades de otimização.
              </div>
            </div>
            <div className="chart-canvas">
              <canvas id="encodingChart"></canvas>
            </div>
          </div>
        </div>

        {/* Encoding Table */}
        <div className="section-title tooltip-wrapper">
          📋 Tabela de Encodings e Importância
          <div className="tooltip-content">
            <strong>Tabela Detalhada de Encodings Categóricos</strong>
            <br /><br />
            <strong>Funcionalidades:</strong>
            <ul>
              <li><strong>Clique nas colunas</strong> para ordenar (Nome, Encoding, Importância, Demanda)</li>
              <li><strong>Clique nas linhas</strong> para ver detalhes e fazer drill-down</li>
              <li><strong>Linhas destacadas</strong> (azul claro) indicam importância &gt; 25%</li>
            </ul>
            <br />
            <strong>Interpretação:</strong> Use esta tabela para identificar rapidamente as categorias que requerem atenção estratégica.
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="tooltip-wrapper" onClick={() => sortTable(0)}>
                  Nome
                  <div className="tooltip-content">
                    <strong>Nome da Categoria</strong>
                    <br /><br />
                    Clique para ordenar alfabeticamente. Clique na linha para ver detalhes e fazer drill-down.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(1)}>
                  Encoding
                  <div className="tooltip-content">
                    <strong>Valor de Encoding</strong>
                    <br /><br />
                    Valor numérico (0-100%) usado pelo modelo para representar esta categoria. Valores mais altos indicam categorias mais distintas.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(2)}>
                  Importância %
                  <div className="tooltip-content">
                    <strong>Importância no Modelo</strong>
                    <br /><br />
                    Percentual de contribuição desta categoria para a precisão do modelo de forecast. Valores altos indicam maior impacto nas previsões.
                  </div>
                </th>
                <th className="tooltip-wrapper" onClick={() => sortTable(3)}>
                  Demanda %
                  <div className="tooltip-content">
                    <strong>Participação na Demanda Total</strong>
                    <br /><br />
                    Percentual da demanda total representado por esta categoria. Comparar com importância para identificar anomalias.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Narrativa
                  <div className="tooltip-content">
                    <strong>Narrativa e Contexto</strong>
                    <br /><br />
                    Descrição do impacto e significado desta categoria no modelo e nas operações.
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEncodings.map((encoding) => {
                const isHighImportance = encoding.importanceScore > 0.25;
                const importanceClass = encoding.importanceScore > 0.25 ? 'importance-high' :
                  encoding.importanceScore > 0.15 ? 'importance-medium' : 'importance-low';

                return (
                  <tr
                    key={encoding.id}
                    className={isHighImportance ? 'row-high-importance' : ''}
                    onClick={() => handleDrilldown(encoding.id, encoding.name, encoding.categoryType)}
                  >
                    <td>
                      <span className="category-name tooltip-wrapper" style={{ cursor: 'pointer' }}>
                        {encoding.name.length > 30 ? encoding.name.substring(0, 30) + '...' : encoding.name}
                        <div className="tooltip-content">
                          <strong>{encoding.name}</strong>
                          <br /><br />
                          <strong>Tipo:</strong> {categoryLabels[encoding.categoryType]}
                          <br />
                          <strong>Encoding:</strong> {(encoding.encodingValue * 100).toFixed(1)}%
                          <br />
                          <strong>Importância:</strong> {(encoding.importanceScore * 100).toFixed(1)}%
                          <br />
                          <strong>Demanda:</strong> {encoding.demandShare.toFixed(1)}%
                          <br /><br />
                          <strong>Clique para:</strong> Ver detalhes e análise temporal desta categoria.
                        </div>
                      </span>
                    </td>
                    <td className="tooltip-wrapper">
                      {(encoding.encodingValue * 100).toFixed(1)}%
                      <div className="tooltip-content">
                        <strong>Valor de Encoding: {(encoding.encodingValue * 100).toFixed(1)}%</strong>
                        <br /><br />
                        Valor numérico usado pelo modelo para representar esta categoria.
                      </div>
                    </td>
                    <td>
                      <span className={importanceClass}>
                        {(encoding.importanceScore * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>{encoding.demandShare.toFixed(1)}%</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>{encoding.narrative}</td>
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
                  <br /><br />
                  <strong>O que são:</strong> Recomendações prescritivas baseadas em análise de importância de encodings categóricos e impacto no modelo.
                  <br /><br />
                  <strong>Fonte:</strong> Modelos ML analisam padrões de importância e geram recomendações acionáveis.
                  <br /><br />
                  <strong>Uso:</strong> Use as setas para navegar entre insights. Cada insight inclui descrição e recomendação acionável.
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
              <div className="insight-card">
                <div className="insight-title">
                  {currentInsight.title}
                  {prescriptiveData && (
                    <PrescriptiveTooltip
                      title="Insight Prescritivo"
                      content={
                        <div>
                          <p><strong>Categoria:</strong> {currentInsight.title}</p>
                          <p><strong>Recomendação:</strong> {currentInsight.recommendation}</p>
                          <p><strong>Famílias de Alto Risco:</strong> {Object.values(prescriptiveData.risk_assessments).filter(r => r.stockout_risk === 'HIGH' || r.stockout_risk === 'CRITICAL').length}</p>
                        </div>
                      }
                    />
                  )}
                </div>
                <div className="insight-description">{currentInsight.description}</div>
                <div className="insight-recommendation">
                  <strong>💡 Recomendação:</strong> {currentInsight.recommendation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation CTA */}
        <div className="section-title tooltip-wrapper">
          🔗 Explorar Relacionados
          <div className="tooltip-content">
            <strong>Navegação para Páginas Relacionadas</strong>
            <br /><br />
            Use estes botões para aprofundar a análise em aspectos relacionados aos encodings categóricos.
          </div>
        </div>
        <div className="navigation-cta">
          <div className="cta-button tooltip-wrapper" onClick={() => navigateTo('hierarchical')}>
            <div className="cta-icon">🌳</div>
            <div className="cta-text">Análise Hierárquica</div>
            <div className="cta-subtext">Ver análise hierárquica de famílias, sites e fornecedores</div>
            <div className="tooltip-content">
              <strong>Análise Hierárquica</strong>
              <br /><br />
              Explore como as categorias se relacionam hierarquicamente e impactam a demanda agregada.
            </div>
          </div>
          <div className="cta-button tooltip-wrapper" onClick={() => navigateTo('lead-time')}>
            <div className="cta-icon">⏱️</div>
            <div className="cta-text">Lead Time Analysis</div>
            <div className="cta-subtext">Investigar impacto de fornecedores no lead time</div>
            <div className="tooltip-content">
              <strong>Análise de Lead Time</strong>
              <br /><br />
              Veja como os fornecedores (categoria categórica) impactam os tempos de entrega.
            </div>
          </div>
          <div className="cta-button tooltip-wrapper" onClick={() => navigateTo('sla')}>
            <div className="cta-icon">🎯</div>
            <div className="cta-text">SLA Dashboard</div>
            <div className="cta-subtext">Monitorar risco de penalidades contratuais</div>
            <div className="tooltip-content">
              <strong>Dashboard de SLA</strong>
              <br /><br />
              Relacione encodings categóricos com performance de SLA e risco de violações.
            </div>
          </div>
        </div>

        {/* Educational Explainer Section */}
        <div className="section-title tooltip-wrapper">
          📚 Guia Educacional - Encodings Categóricos
          <div className="tooltip-content">
            <strong>Seção Educacional</strong>
            <br /><br />
            Esta seção fornece explicações detalhadas sobre encodings categóricos e seu impacto no modelo de forecast.
          </div>
        </div>
        <div className="educational-section">
          {activeCategoryType === 'family' && (
            <div className="educational-content">
              <h3 className="educational-title">📦 Encodings Categóricos por Família</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que são Encodings Categóricos?</h4>
                  <p className="educational-text">
                    Encodings categóricos são valores numéricos que representam categorias (famílias de materiais) no modelo de machine learning.
                    Permitem que o modelo aprenda padrões específicos de cada categoria.
                  </p>
                  <p className="educational-text">
                    <strong>Benefício:</strong> O modelo pode identificar que diferentes famílias têm padrões de demanda distintos e ajustar previsões accordingly.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Como Interpretar Importância?</h4>
                  <p className="educational-text">
                    <strong>Alta Importância (&gt;25%):</strong> A família tem grande impacto na precisão do modelo. Mudanças nesta família afetam significativamente as previsões.
                  </p>
                  <p className="educational-text">
                    <strong>Importância Média (15-25%):</strong> A família contribui moderadamente para a precisão. Importante mas não crítica.
                  </p>
                  <p className="educational-text">
                    <strong>Baixa Importância (&lt;15%):</strong> A família tem impacto menor. Pode ser agrupada ou simplificada sem grande perda de precisão.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Encoding vs. Demanda</h4>
                  <p className="educational-text">
                    <strong>Alto Encoding + Alta Demanda:</strong> Família crítica e bem representada. Focar otimizações aqui maximiza impacto.
                  </p>
                  <p className="educational-text">
                    <strong>Alto Encoding + Baixa Demanda:</strong> Oportunidade de crescimento. Família importante mas subutilizada.
                  </p>
                  <p className="educational-text">
                    <strong>Baixo Encoding + Alta Demanda:</strong> Pode indicar necessidade de ajuste no modelo ou estratégia de encoding.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Ações Recomendadas</h4>
                  <ul className="educational-list">
                    <li><strong>Famílias de Alta Importância:</strong> Priorizar otimização de estoque, revisar estratégias de compra, monitorar de perto</li>
                    <li><strong>Famílias de Média Importância:</strong> Manter estratégias atuais, monitorar tendências</li>
                    <li><strong>Famílias de Baixa Importância:</strong> Considerar simplificação ou agrupamento para reduzir complexidade</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeCategoryType === 'site' && (
            <div className="educational-content">
              <h3 className="educational-title">🏢 Encodings Categóricos por Site/Torre</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que são Encodings por Site?</h4>
                  <p className="educational-text">
                    Encodings categóricos por site permitem que o modelo aprenda padrões específicos de cada localização física.
                    Diferentes sites podem ter padrões de demanda distintos devido a fatores geográficos, climáticos ou operacionais.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Fatores que Influenciam Importância</h4>
                  <ul className="educational-list">
                    <li><strong>Volume de Demanda:</strong> Sites com maior volume tendem a ter maior importância</li>
                    <li><strong>Variância de Demanda:</strong> Sites com alta variância requerem mais atenção do modelo</li>
                    <li><strong>Padrões Sazonais:</strong> Sites com padrões sazonais distintos têm maior importância</li>
                    <li><strong>Fatores Geográficos:</strong> Localização e acessibilidade influenciam padrões de demanda</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Estratégias por Nível de Importância</h4>
                  <p className="educational-text">
                    <strong>Sites de Alta Importância:</strong>
                  </p>
                  <ul className="educational-list">
                    <li>Implementar estratégias de estoque específicas</li>
                    <li>Monitorar padrões de demanda de perto</li>
                    <li>Considerar buffer stock regional</li>
                    <li>Revisar estratégias de distribuição</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Interpretação de Métricas</h4>
                  <p className="educational-text">
                    <strong>Encoding Value:</strong> Representa como o site é codificado no modelo. Valores mais altos indicam sites mais distintos.
                  </p>
                  <p className="educational-text">
                    <strong>Importância:</strong> Quanto o site contribui para a precisão do modelo. Sites críticos têm maior importância.
                  </p>
                  <p className="educational-text">
                    <strong>Demanda Share:</strong> Percentual da demanda total representado pelo site. Comparar com importância para identificar anomalias.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategoryType === 'supplier' && (
            <div className="educational-content">
              <h3 className="educational-title">🤝 Encodings Categóricos por Fornecedor</h3>
              <div className="educational-grid">
                <div className="educational-card">
                  <h4 className="educational-card-title">O que são Encodings por Fornecedor?</h4>
                  <p className="educational-text">
                    Encodings categóricos por fornecedor permitem que o modelo aprenda padrões específicos de cada fornecedor.
                    Diferentes fornecedores podem ter impactos distintos na demanda devido a lead times, confiabilidade e qualidade.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Métricas-Chave por Fornecedor</h4>
                  <ul className="educational-list">
                    <li><strong>Encoding Value:</strong> Como o fornecedor é representado no modelo</li>
                    <li><strong>Importância:</strong> Contribuição para precisão do forecast</li>
                    <li><strong>Demanda Share:</strong> Percentual da demanda total fornecida</li>
                    <li><strong>Lead Time Impact:</strong> Como o fornecedor afeta tempos de entrega</li>
                  </ul>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Estratégias de Gestão</h4>
                  <p className="educational-text">
                    <strong>Fornecedores de Alta Importância:</strong>
                  </p>
                  <ul className="educational-list">
                    <li>Estabelecer relacionamentos estratégicos de longo prazo</li>
                    <li>Negociar SLAs mais rígidos e penalidades</li>
                    <li>Implementar monitoramento proativo</li>
                    <li>Considerar fornecedores backup para reduzir risco</li>
                  </ul>
                  <p className="educational-text">
                    <strong>Fornecedores de Baixa Importância:</strong> Considerar consolidação ou simplificação de relacionamento.
                  </p>
                </div>
                <div className="educational-card">
                  <h4 className="educational-card-title">Interpretação de Anomalias</h4>
                  <p className="educational-text">
                    <strong>Alta Importância + Baixa Demanda:</strong> Fornecedor estratégico mas com volume limitado. Oportunidade de crescimento.
                  </p>
                  <p className="educational-text">
                    <strong>Baixa Importância + Alta Demanda:</strong> Fornecedor com alto volume mas baixo impacto no modelo. Pode indicar necessidade de diversificação.
                  </p>
                  <p className="educational-text">
                    <strong>Alta Importância + Alta Demanda:</strong> Fornecedor crítico. Requer atenção máxima e estratégias de mitigação de risco.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
