'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { apiClient } from '../../../lib/api';
import { SLAFeatures, SLAPenalty, SLAViolation } from '../../../types/features';

export default function SLAFeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [apiData, setApiData] = useState<{
    features: SLAFeatures[];
    penalties: SLAPenalty[];
    violations: SLAViolation[];
    availability: any[];
    loading: boolean;
    error: string | null;
  }>({
    features: [],
    penalties: [],
    violations: [],
    availability: [],
    loading: true,
    error: null,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setApiData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Fetch SLA features
        const featuresResponse = await apiClient.getSLAFeatures(undefined, selectedTier || undefined);
        const features = Array.isArray(featuresResponse)
          ? featuresResponse
          : (featuresResponse as any).data || [];
        
        if (features.length > 0) {
          console.log('✅ Fetched SLA features from API:', features.length);
        }

        // Fetch penalties
        let penalties: SLAPenalty[] = [];
        try {
          const penaltiesResponse = await apiClient.getSLAPenalties(selectedTier || undefined);
          penalties = Array.isArray(penaltiesResponse)
            ? penaltiesResponse
            : (penaltiesResponse as any).data || [];
        } catch (e) {
          console.warn('Could not fetch penalties:', e);
        }

        // Fetch violations
        let violations: SLAViolation[] = [];
        try {
          const violationsResponse = await apiClient.getSLAViolations(selectedTier || undefined);
          violations = Array.isArray(violationsResponse)
            ? violationsResponse
            : (violationsResponse as any).data || [];
        } catch (e) {
          console.warn('Could not fetch violations:', e);
        }

        // Fetch availability
        let availability: any[] = [];
        try {
          const availabilityResponse = await apiClient.getSLAAvailability();
          availability = Array.isArray(availabilityResponse)
            ? availabilityResponse
            : (availabilityResponse as any).data || [];
        } catch (e) {
          console.warn('Could not fetch availability:', e);
        }

        setApiData({
          features,
          penalties,
          violations,
          availability,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching SLA data:', error);
        setApiData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao carregar dados',
        }));
      }
    };

    fetchData();
  }, [selectedTier]);

  // Effect to initialize when Chart.js is loaded
  useEffect(() => {
    if (!isChartLoaded || !containerRef.current) return;

    const initPage = () => {
      if (typeof (window as any).Chart === 'undefined') {
        console.warn('Chart.js not loaded yet');
        return;
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {

      // Allow re-initialization when data changes - charts will be destroyed and recreated

      // Configure Chart.js defaults
      if (typeof (window as any).Chart !== 'undefined') {
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

      // Calculate summary metrics from API data or use mock
      const calculateSummary = () => {
        if (apiData.features.length > 0) {
          const globalAvailability = apiData.availability.length > 0
            ? apiData.availability.reduce((sum, a) => sum + (a.availability_actual || 0), 0) / apiData.availability.length
            : 99.2;
          
          const totalDowntime = apiData.features.reduce((sum, f) => sum + (f.downtime_hours_monthly || 0), 0) / apiData.features.length;
          
          const totalPenaltyRisk = apiData.penalties.reduce((sum, p) => sum + (p.penalty_risk || 0), 0);
          
          const violationCount = apiData.violations.filter(v => v.sla_violation_risk >= 0.4).length;

          return {
            globalAvailability: Math.round(globalAvailability * 10) / 10,
            target: 99.0,
            downtimeHours: Math.round(totalDowntime * 10) / 10,
            penaltyRisk: totalPenaltyRisk,
            violationCount,
          };
        }

        // Mock data fallback
        return {
          globalAvailability: 99.2,
          target: 99.0,
          downtimeHours: 5.6,
          penaltyRisk: 125000,
          violationCount: 3,
        };
      };

      const summary = calculateSummary();

      // Tier metrics from API or mock
      const tierMetrics = apiData.features.length > 0
        ? [
            {
              tier: 'Tier 1',
              availability: 99.2,
              target: 99,
              downtime: 2.1,
              penaltyRisk: 0,
            },
            {
              tier: 'Tier 2',
              availability: 98.5,
              target: 99,
              downtime: 11.0,
              penaltyRisk: 45000,
            },
            {
              tier: 'Tier 3',
              availability: 97.8,
              target: 99,
              downtime: 16.1,
              penaltyRisk: 80000,
            },
          ]
        : [
            {
              tier: 'Tier 1',
              availability: 99.2,
              target: 99,
              downtime: 2.1,
              penaltyRisk: 0,
            },
            {
              tier: 'Tier 2',
              availability: 98.5,
              target: 99,
              downtime: 11.0,
              penaltyRisk: 45000,
            },
            {
              tier: 'Tier 3',
              availability: 97.8,
              target: 99,
              downtime: 16.1,
              penaltyRisk: 80000,
            },
          ];

      // Violations from API or mock
      const violations = apiData.violations.length > 0
        ? apiData.violations.slice(0, 3).map(v => ({
            material: v.material_name,
            risk: Math.round(v.sla_violation_risk * 100),
            level: v.violation_level.toLowerCase(),
            penalty: v.estimated_penalty_brl,
            driver: 'Forecast + Lead Time',
            eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }))
        : [
            {
              material: 'Conectores RF - Tipo A',
              risk: 62,
              level: 'high',
              penalty: 50000,
              driver: 'Tempestade Nordeste + Lead Time +12d',
              eta: '2025-11-20',
            },
            {
              material: 'Kit Refrigeração',
              risk: 48,
              level: 'medium',
              penalty: 35000,
              driver: 'Fornecedor D - Variância 35% + Backlog 6 POs',
              eta: '2025-11-25',
            },
            {
              material: 'Cabos de Fibra',
              risk: 28,
              level: 'low',
              penalty: 15000,
              driver: 'Consumo +15% por upgrade 5G Salvador',
              eta: '2025-11-30',
            },
          ];

      // Initialize SLA Gauge
      try {
        const gaugeCanvas = document.getElementById('slaGauge') as HTMLCanvasElement;
        if (gaugeCanvas) {
          // Destroy existing chart if it exists
          const existingGaugeChart = (gaugeCanvas as any).chart;
          if (existingGaugeChart) {
            existingGaugeChart.destroy();
          }

          const gaugeCtx = gaugeCanvas.getContext('2d');
          if (gaugeCtx) {
            // Enhanced gauge with subtle visual variations
            const gap = 100 - summary.globalAvailability;
            const tier1Avail = tierMetrics.find(t => t.tier === 'Tier 1')?.availability || summary.globalAvailability;
            const tier2Avail = tierMetrics.find(t => t.tier === 'Tier 2')?.availability || summary.globalAvailability;
            const tier3Avail = tierMetrics.find(t => t.tier === 'Tier 3')?.availability || summary.globalAvailability;
            
            // Main gauge shows global availability with subtle color gradient based on tier performance
            const avgTierPerformance = (tier1Avail + tier2Avail + tier3Avail) / 3;
            const performanceVariance = Math.abs(summary.globalAvailability - avgTierPerformance);
            
            // Determine base color based on global availability with subtle variations
            let baseColor, baseColorBorder;
            if (summary.globalAvailability >= 99) {
              baseColor = 'rgba(34, 197, 94, 0.85)';
              baseColorBorder = 'rgba(34, 197, 94, 1)';
            } else if (summary.globalAvailability >= 98) {
              baseColor = 'rgba(230, 129, 97, 0.8)';
              baseColorBorder = 'rgba(230, 129, 97, 1)';
            } else {
              baseColor = 'rgba(255, 84, 89, 0.8)';
              baseColorBorder = 'rgba(255, 84, 89, 1)';
            }
            
            const gaugeChart = new (window as any).Chart(gaugeCtx, {
            type: 'doughnut',
            data: {
              labels: ['Disponibilidade Global', 'Gap para Target'],
              datasets: [{
                data: [summary.globalAvailability, gap],
                backgroundColor: [
                  baseColor,
                  'rgba(119, 124, 124, 0.25)',
                ],
                borderColor: [
                  baseColorBorder,
                  'rgba(119, 124, 124, 0.4)',
                ],
                borderWidth: 2.5,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: { 
                  display: true, 
                  labels: { color: 'rgba(167, 169, 169, 1)', font: { size: 14 } },
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      if (ctx.parsed !== null && ctx.parsed !== undefined) {
                        if (ctx.label === 'Gap para Target') {
                          return ctx.label + ': ' + ctx.parsed.toFixed(1) + '%';
                        }
                        // Show global availability with tier breakdown
                        return [
                          ctx.label + ': ' + ctx.parsed.toFixed(1) + '%',
                          'Tier 1: ' + tier1Avail.toFixed(1) + '%',
                          'Tier 2: ' + tier2Avail.toFixed(1) + '%',
                          'Tier 3: ' + tier3Avail.toFixed(1) + '%',
                        ];
                      }
                      return ctx.label;
                    },
                  },
                },
              },
            },
            });
            (gaugeCanvas as any).chart = gaugeChart;
          }
        }
      } catch (e) {
        console.error('Error initializing SLA gauge chart:', e);
      }

      // Initialize Violation Forecast Chart
      try {
        const violationCanvas = document.getElementById('violationChart') as HTMLCanvasElement;
        if (violationCanvas && violationCanvas.parentElement) {
          // Destroy existing chart if it exists
          const existingViolationChart = (violationCanvas as any).chart;
          if (existingViolationChart) {
            existingViolationChart.destroy();
          }

          const violationCtx = violationCanvas.getContext('2d');
          if (violationCtx) {
          const dates = Array.from({ length: 8 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i * 5);
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          });

          const datasets = violations.map((v, idx) => {
            const colors = [
              { border: 'rgba(255, 84, 89, 1)', bg: 'rgba(255, 84, 89, 0.1)' },
              { border: 'rgba(230, 129, 97, 1)', bg: 'rgba(230, 129, 97, 0.1)' },
              { border: 'rgba(50, 184, 198, 1)', bg: 'rgba(50, 184, 198, 0.1)' },
            ];
            const color = colors[idx] || colors[0];
            
            // Generate trend data
            const baseRisk = v.risk;
            const data = dates.map((_, i) => {
              const progress = i / (dates.length - 1);
              const peak = Math.min(0.8, baseRisk / 100);
              return Math.round((baseRisk * (1 - progress * 0.7) + Math.random() * 10 - 5) * 10) / 10;
            });

            return {
              label: v.material,
              data,
              borderColor: color.border,
              backgroundColor: color.bg,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
            };
          });

          const violationChart = new (window as any).Chart(violationCtx, {
            type: 'line',
            data: {
              labels: dates,
              datasets,
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { color: 'rgba(167, 169, 169, 1)' } },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return ctx.dataset.label + ': ' + ctx.parsed.y + '% risco';
                    },
                  },
                },
              },
              scales: {
                y: {
                  title: { display: true, text: 'Probabilidade de Violação (%)', color: 'rgba(167, 169, 169, 1)' },
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  min: 0,
                  max: 100,
                },
                x: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
              },
            },
          });
          (violationCanvas as any).chart = violationChart;
          }
        }
      } catch (e) {
        console.error('Error initializing violation forecast chart:', e);
      }

      // Initialize Downtime Distribution Chart
      try {
        const downtimeCanvas = document.getElementById('downtimeChart') as HTMLCanvasElement;
        if (downtimeCanvas && downtimeCanvas.parentElement) {
          // Destroy existing chart if it exists
          const existingDowntimeChart = (downtimeCanvas as any).chart;
          if (existingDowntimeChart) {
            existingDowntimeChart.destroy();
          }

          const downtimeCtx = downtimeCanvas.getContext('2d');
          if (downtimeCtx) {
          const downtimeChart = new (window as any).Chart(downtimeCtx, {
            type: 'bar',
            data: {
              labels: ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
              datasets: [
                {
                  label: 'Stockout',
                  data: [2, 1.5, 3, 2.2, 1.8, 4.2],
                  backgroundColor: 'rgba(255, 84, 89, 0.7)',
                  borderColor: 'rgba(192, 21, 47, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Lead Time',
                  data: [1.5, 2, 1.2, 2.8, 3.5, 6.1],
                  backgroundColor: 'rgba(230, 129, 97, 0.7)',
                  borderColor: 'rgba(168, 75, 47, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Clima',
                  data: [0.5, 0.8, 2.1, 1, 0.3, 2.5],
                  backgroundColor: 'rgba(50, 184, 198, 0.7)',
                  borderColor: 'rgba(33, 128, 141, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Manutenção',
                  data: [0.8, 0.5, 0.7, 0.6, 0.4, 0.5],
                  backgroundColor: 'rgba(34, 197, 94, 0.7)',
                  borderColor: 'rgba(21, 128, 61, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              indexAxis: undefined,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { color: 'rgba(167, 169, 169, 1)' } },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return ctx.dataset.label + ': ' + ctx.parsed.y + ' horas';
                    },
                  },
                },
              },
              scales: {
                x: { 
                  stacked: true, 
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' }, 
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
                y: { 
                  stacked: true, 
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' }, 
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  title: { display: true, text: 'Horas de Downtime', color: 'rgba(167, 169, 169, 1)' },
                },
              },
            },
          });
          (downtimeCanvas as any).chart = downtimeChart;
          }
        }
      } catch (e) {
        console.error('Error initializing downtime distribution chart:', e);
      }

      // Initialize Availability Trend Chart
      try {
        const trendCanvas = document.getElementById('trendChart') as HTMLCanvasElement;
        if (trendCanvas && trendCanvas.parentElement) {
          // Destroy existing chart if it exists
          const existingTrendChart = (trendCanvas as any).chart;
          if (existingTrendChart) {
            existingTrendChart.destroy();
          }

        const trendCtx = trendCanvas.getContext('2d');
        if (trendCtx) {
          const months = ['Dez24', 'Jan25', 'Fev25', 'Mar25', 'Abr25', 'Mai25', 'Jun25', 'Jul25', 'Ago25', 'Set25', 'Out25', 'Nov25'];
          const trendChart = new (window as any).Chart(trendCtx, {
            type: 'line',
            data: {
              labels: months,
              datasets: [
                {
                  label: 'Disponibilidade Real',
                  data: [98.8, 99.1, 99.0, 99.3, 99.2, 99.4, 99.1, 99.5, 99.3, 99.2, 99.1, summary.globalAvailability],
                  borderColor: 'rgba(50, 184, 198, 1)',
                  backgroundColor: 'rgba(50, 184, 198, 0.1)',
                  borderWidth: 2.5,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                },
                {
                  label: 'Target (99%)',
                  data: Array(12).fill(99),
                  borderColor: 'rgba(34, 197, 94, 1)',
                  borderDash: [5, 5],
                  borderWidth: 2,
                  fill: false,
                  pointRadius: 0,
                },
                {
                  label: 'Zona de Risco (<97.8%)',
                  data: Array(12).fill(97.8),
                  borderColor: 'rgba(255, 84, 89, 1)',
                  borderDash: [5, 5],
                  borderWidth: 2,
                  fill: false,
                  pointRadius: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { color: 'rgba(167, 169, 169, 1)' } },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return ctx.dataset.label + ': ' + ctx.parsed.y + '%';
                    },
                  },
                },
              },
              scales: {
                y: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  min: 97.5,
                  max: 100,
                  title: { display: true, text: 'Disponibilidade (%)', color: 'rgba(167, 169, 169, 1)' },
                },
                x: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
              },
            },
          });
          (trendCanvas as any).chart = trendChart;
          }
        }
      } catch (e) {
        console.error('Error initializing availability trend chart:', e);
      }

      // Initialize Penalty Risk Heatmap
      try {
        const heatmapCanvas = document.getElementById('heatmapChart') as HTMLCanvasElement;
        if (heatmapCanvas && heatmapCanvas.parentElement) {
          // Destroy existing chart if it exists
          const existingHeatmapChart = (heatmapCanvas as any).chart;
          if (existingHeatmapChart) {
            existingHeatmapChart.destroy();
          }

          const heatmapCtx = heatmapCanvas.getContext('2d');
          if (heatmapCtx) {
            // Combine violations and penalties for heatmap
            const violationMaterials = violations.map(v => ({
              name: v.material,
              value: v.penalty || 0,
            }));
            
            const penaltyMaterials = apiData.penalties.slice(0, 7).map(p => ({
              name: p.material_name,
              value: p.penalty_risk || 0,
            }));
            
            const topMaterials = violationMaterials
              .concat(penaltyMaterials)
              .slice(0, 10)
              .sort((a, b) => b.value - a.value);

          const colors = topMaterials.map((m, i) => {
            const max = topMaterials[0]?.value || 1;
            const ratio = m.value / max;
            if (ratio > 0.7) return 'rgba(255, 84, 89, 0.8)';
            if (ratio > 0.5) return 'rgba(255, 84, 89, 0.7)';
            if (ratio > 0.3) return 'rgba(230, 129, 97, 0.7)';
            if (ratio > 0.2) return 'rgba(230, 129, 97, 0.6)';
            if (ratio > 0.1) return 'rgba(230, 129, 97, 0.5)';
            return 'rgba(50, 184, 198, 0.5)';
          });

          const heatmapChart = new (window as any).Chart(heatmapCtx, {
            type: 'bar',
            data: {
              labels: topMaterials.map(m => m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name),
              datasets: [{
                label: 'Risco de Penalidade (R$K)',
                data: topMaterials.map(m => Math.round(m.value / 1000 * 10) / 10),
                backgroundColor: colors,
                borderColor: 'rgba(119, 124, 124, 0.3)',
                borderWidth: 1,
              }],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => {
                      return 'Risco: R$ ' + (ctx.parsed.x * 1000).toLocaleString('pt-BR') + 'K';
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.2)' },
                  title: { display: true, text: 'Risco de Penalidade (R$K)', color: 'rgba(167, 169, 169, 1)' },
                },
                y: {
                  ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                  grid: { color: 'rgba(119, 124, 124, 0.1)' },
                },
              },
            },
          });
          (heatmapCanvas as any).chart = heatmapChart;
          }
        }
      } catch (e) {
        console.error('Error initializing penalty risk heatmap chart:', e);
      }

      // Initialize Top 5 Materials by Financial Impact Chart (C-Level Focus)
      try {
        const topMaterialsCanvas = document.getElementById('topMaterialsImpactChart') as HTMLCanvasElement;
        if (topMaterialsCanvas && topMaterialsCanvas.parentElement) {
          const existingTopMaterialsChart = (topMaterialsCanvas as any).chart;
          if (existingTopMaterialsChart) {
            existingTopMaterialsChart.destroy();
          }

          const topMaterialsCtx = topMaterialsCanvas.getContext('2d');
          if (topMaterialsCtx) {
            // Calculate financial impact: probability × penalty
            const materialsImpact = violations.map(v => ({
              name: v.material.length > 25 ? v.material.substring(0, 25) + '...' : v.material,
              fullName: v.material,
              impact: (v.risk / 100) * v.penalty, // Expected value: probability × penalty
              probability: v.risk,
              penalty: v.penalty,
            }));

            // Add penalty materials if not in violations
            apiData.penalties.slice(0, 3).forEach(p => {
              if (!materialsImpact.find(m => m.fullName === p.material_name)) {
                const estimatedProb = p.penalty_risk > 50000 ? 50 : p.penalty_risk > 20000 ? 35 : 20;
                materialsImpact.push({
                  name: p.material_name.length > 25 ? p.material_name.substring(0, 25) + '...' : p.material_name,
                  fullName: p.material_name,
                  impact: (estimatedProb / 100) * p.penalty_risk,
                  probability: estimatedProb,
                  penalty: p.penalty_risk,
                });
              }
            });

            // Sort by impact and take top 5
            const top5 = materialsImpact
              .sort((a, b) => b.impact - a.impact)
              .slice(0, 5);

            const colors = top5.map((m, i) => {
              const max = top5[0]?.impact || 1;
              const ratio = m.impact / max;
              if (ratio > 0.8) return 'rgba(255, 84, 89, 0.9)';
              if (ratio > 0.6) return 'rgba(255, 84, 89, 0.8)';
              if (ratio > 0.4) return 'rgba(230, 129, 97, 0.8)';
              if (ratio > 0.2) return 'rgba(230, 129, 97, 0.7)';
              return 'rgba(50, 184, 198, 0.7)';
            });

            const topMaterialsChart = new (window as any).Chart(topMaterialsCtx, {
              type: 'bar',
              data: {
                labels: top5.map(m => m.name),
                datasets: [{
                  label: 'Impacto Financeiro Esperado (R$K)',
                  data: top5.map(m => Math.round(m.impact / 1000 * 10) / 10),
                  backgroundColor: colors,
                  borderColor: top5.map((m, i) => {
                    const max = top5[0]?.impact || 1;
                    const ratio = m.impact / max;
                    if (ratio > 0.6) return 'rgba(255, 84, 89, 1)';
                    if (ratio > 0.3) return 'rgba(230, 129, 97, 1)';
                    return 'rgba(50, 184, 198, 1)';
                  }),
                  borderWidth: 2,
                }],
              },
              options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: (items: any) => {
                        const idx = items[0].dataIndex;
                        return top5[idx].fullName;
                      },
                      label: (ctx: any) => {
                        const idx = ctx.dataIndex;
                        const m = top5[idx];
                        return [
                          'Impacto Esperado: R$ ' + Math.round(m.impact).toLocaleString('pt-BR'),
                          'Probabilidade: ' + m.probability + '%',
                          'Penalidade: R$ ' + Math.round(m.penalty).toLocaleString('pt-BR'),
                        ];
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { 
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function(value: any) {
                        return 'R$ ' + value + 'K';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    title: { display: true, text: 'Impacto Financeiro Esperado (R$K)', color: 'rgba(167, 169, 169, 1)' },
                    beginAtZero: true,
                  },
                  y: {
                    ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                  },
                },
              },
            });
            (topMaterialsCanvas as any).chart = topMaterialsChart;
          }
        }
      } catch (e) {
        console.error('Error initializing top materials impact chart:', e);
      }

      // Initialize Penalty Trend Chart
      try {
        const penaltyTrendCanvas = document.getElementById('penaltyTrendChart') as HTMLCanvasElement;
        if (penaltyTrendCanvas && penaltyTrendCanvas.parentElement) {
          const existingPenaltyTrendChart = (penaltyTrendCanvas as any).chart;
          if (existingPenaltyTrendChart) {
            existingPenaltyTrendChart.destroy();
          }

          const penaltyTrendCtx = penaltyTrendCanvas.getContext('2d');
          if (penaltyTrendCtx) {
            // Generate historical and forecast penalty data - CONNECTED at Out/Nov
            const months = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'];
            const historicalPenalties = [45000, 38000, 42000, 55000, 48000, 52000]; // Last 6 months (Mai-Out)
            const forecastPenalties = [summary.penaltyRisk, 110000, 95000, 88000, 82000, 75000]; // Next 6 months (Nov-Abr)
            
            // Create connected dataset - historical connects to forecast at Out->Nov
            const allPenalties = [...historicalPenalties, ...forecastPenalties]; // 12 values total
            
            const penaltyTrendChart = new (window as any).Chart(penaltyTrendCtx, {
              type: 'line',
              data: {
                labels: months,
                datasets: [
                  {
                    label: 'Penalidades Reais (Passado)',
                    data: [...historicalPenalties, null, null, null, null, null, null], // Mai-Out, then nulls
                    borderColor: 'rgba(230, 129, 97, 1)',
                    backgroundColor: 'rgba(230, 129, 97, 0.2)',
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    spanGaps: false,
                  },
                  {
                    label: 'Penalidades Previstas (Futuro)',
                    data: [null, null, null, null, null, null, ...forecastPenalties], // Nulls for Mai-Out, then Nov-Abr
                    borderColor: 'rgba(50, 184, 198, 1)',
                    backgroundColor: 'rgba(50, 184, 198, 0.2)',
                    borderWidth: 2.5,
                    borderDash: [5, 5], // Dashed for forecast
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    spanGaps: false,
                  },
                  // Connection line - smooth transition from Out to Nov
                  {
                    label: 'Transição',
                    data: [null, null, null, null, null, historicalPenalties[5], summary.penaltyRisk, null, null, null, null, null],
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgba(255, 255, 255, 0.6)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    tension: 0.3,
                    fill: false,
                    showLine: true,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    display: true, 
                    labels: { color: 'rgba(167, 169, 169, 1)', font: { size: 14 } },
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        if (ctx.parsed.y === null) return null;
                        return ctx.dataset.label + ': R$ ' + Math.round(ctx.parsed.y).toLocaleString('pt-BR');
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: { 
                      color: 'rgba(167, 169, 169, 0.7)',
                      callback: function(value: any) {
                        return 'R$ ' + Math.round(value / 1000) + 'K';
                      },
                    },
                    grid: { color: 'rgba(119, 124, 124, 0.2)' },
                    title: { display: true, text: 'Penalidades (R$)', color: 'rgba(167, 169, 169, 1)' },
                    beginAtZero: true,
                  },
                  x: {
                    ticks: { color: 'rgba(167, 169, 169, 0.7)' },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                  },
                },
              },
            });
            (penaltyTrendCanvas as any).chart = penaltyTrendChart;
          }
        }
      } catch (e) {
        console.error('Error initializing penalty trend chart:', e);
      }

      setIsInitialized(true);
      }, 100);
    };

    initPage();

    // Cleanup function to destroy charts on unmount
    return () => {
      const chartIds = ['slaGauge', 'violationChart', 'downtimeChart', 'trendChart', 'heatmapChart', 'topMaterialsImpactChart', 'penaltyTrendChart'];
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
  }, [isChartLoaded, apiData.features, apiData.penalties, apiData.violations, apiData.availability]);

  const summary = apiData.features.length > 0
    ? (() => {
        const globalAvailability = apiData.availability.length > 0
          ? apiData.availability.reduce((sum, a) => sum + (a.availability_actual || 0), 0) / apiData.availability.length
          : 99.2;
        
        const totalDowntime = apiData.features.reduce((sum, f) => sum + (f.downtime_hours_monthly || 0), 0) / apiData.features.length;
        
        const totalPenaltyRisk = apiData.penalties.reduce((sum, p) => sum + (p.penalty_risk || 0), 0);
        
        const violationCount = apiData.violations.filter(v => v.sla_violation_risk >= 0.4).length;

        return {
          globalAvailability: Math.round(globalAvailability * 10) / 10,
          target: 99.0,
          downtimeHours: Math.round(totalDowntime * 10) / 10,
          penaltyRisk: totalPenaltyRisk,
          violationCount,
        };
      })()
    : {
        globalAvailability: 99.2,
        target: 99.0,
        downtimeHours: 5.6,
        penaltyRisk: 125000,
        violationCount: 3,
      };

  const tierMetrics = [
    {
      tier: 'Tier 1',
      availability: 99.2,
      target: 99,
      downtime: 2.1,
      penaltyRisk: 0,
    },
    {
      tier: 'Tier 2',
      availability: 98.5,
      target: 99,
      downtime: 11.0,
      penaltyRisk: 45000,
    },
    {
      tier: 'Tier 3',
      availability: 97.8,
      target: 99,
      downtime: 16.1,
      penaltyRisk: 80000,
    },
  ];

  const violations = apiData.violations.length > 0
    ? apiData.violations.slice(0, 3).map(v => ({
        material: v.material_name,
        risk: Math.round(v.sla_violation_risk * 100),
        level: v.violation_level.toLowerCase(),
        penalty: v.estimated_penalty_brl,
        driver: 'Forecast + Lead Time',
        eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }))
    : [
        {
          material: 'Conectores RF - Tipo A',
          risk: 62,
          level: 'high',
          penalty: 50000,
          driver: 'Tempestade Nordeste + Lead Time +12d',
          eta: '2025-11-20',
        },
        {
          material: 'Kit Refrigeração',
          risk: 48,
          level: 'medium',
          penalty: 35000,
          driver: 'Fornecedor D - Variância 35% + Backlog 6 POs',
          eta: '2025-11-25',
        },
        {
          material: 'Cabos de Fibra',
          risk: 28,
          level: 'low',
          penalty: 15000,
          driver: 'Consumo +15% por upgrade 5G Salvador',
          eta: '2025-11-30',
        },
      ];

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        onLoad={() => setIsChartLoaded(true)}
        strategy="lazyOnload"
      />
      {!isInitialized && (
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dashboard de SLA...</p>
        </div>
      )}
      <div ref={containerRef} className="sla-features-container" style={{ display: isInitialized ? 'block' : 'none' }}>
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

          .sla-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .sla-header {
            margin-bottom: var(--space-32);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-24);
          }

          .sla-header h1 {
            margin: 0 0 var(--space-8) 0;
            font-size: 28px;
            font-weight: 600;
            color: var(--color-text);
          }

          .sla-header p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 18px;
            line-height: 1.6;
          }

          .filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-32);
            background: rgba(32, 160, 132, 0.05);
            padding: var(--space-16);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
          }

          .filter-group label {
            display: block;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: var(--space-8);
            color: var(--color-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .filter-group input,
          .filter-group select {
            width: 100%;
            padding: var(--space-12) var(--space-16);
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            color: var(--color-text);
            font-size: 18px;
          }

          .summary-banner {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
            box-shadow: 0 0 12px rgba(32, 160, 132, 0.2);
            transform: translateY(-2px);
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
            margin-bottom: var(--space-8);
          }

          .metric-card .unit {
            font-size: 18px;
            color: var(--color-text-secondary);
          }

          .metric-card .tooltip-icon {
            position: absolute;
            top: var(--space-12);
            right: var(--space-12);
            width: 24px;
            height: 24px;
            background: rgba(32, 160, 132, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: var(--color-primary);
            font-weight: bold;
            cursor: help;
          }

          .metric-card:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          .tooltip-text {
            visibility: hidden;
            opacity: 0;
            background: var(--color-surface-alt);
            color: var(--color-text);
            text-align: left;
            border-radius: var(--radius-base);
            padding: var(--space-16);
            position: absolute;
            z-index: 1000;
            bottom: -120px;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            width: 280px;
            font-size: 16px;
            border: 1px solid var(--color-primary);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            line-height: 1.6;
          }

          .tooltip-text strong {
            color: var(--color-primary);
            display: block;
            margin-bottom: var(--space-8);
          }

          /* Enhanced tooltip styles for all elements */
          .tooltip-wrapper {
            position: relative;
            cursor: help;
          }

          .tooltip-wrapper:hover .tooltip-content {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          .tooltip-content {
            visibility: hidden;
            opacity: 0;
            background: var(--color-surface-alt);
            color: var(--color-text);
            text-align: left;
            border-radius: var(--radius-base);
            padding: var(--space-16);
            position: absolute;
            z-index: 1000;
            bottom: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            width: 320px;
            max-width: 90vw;
            font-size: 16px;
            border: 1px solid var(--color-primary);
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            line-height: 1.6;
            pointer-events: none;
          }

          .tooltip-content::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -8px;
            border-width: 8px;
            border-style: solid;
            border-color: var(--color-primary) transparent transparent transparent;
          }

          .tooltip-content strong {
            color: var(--color-primary);
            display: block;
            margin-bottom: var(--space-8);
            font-size: 17px;
          }

          .tooltip-content ul {
            margin: var(--space-8) 0;
            padding-left: var(--space-20);
          }

          .tooltip-content li {
            margin-bottom: var(--space-4);
          }

          /* Section title tooltips */
          .section-title.tooltip-wrapper {
            display: block;
          }

          /* Table cell tooltips */
          .table td.tooltip-wrapper {
            display: table-cell;
          }

          .table th.tooltip-wrapper {
            display: table-cell;
          }

          /* Chart container tooltips - positioned closer */
          .chart-container.tooltip-wrapper {
            position: relative;
          }

          .chart-container .tooltip-content {
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
          }

          .chart-title.tooltip-wrapper {
            display: inline-block;
          }

          /* Gauge container tooltips */
          .gauge-container.tooltip-wrapper {
            position: relative;
          }

          .gauge-container .tooltip-content {
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
          }

          .gauge-title.tooltip-wrapper {
            display: inline-block;
          }

          /* Filter tooltips */
          .filter-group label.tooltip-wrapper {
            display: block;
          }

          /* Status badge tooltips */
          .status-badge.tooltip-wrapper {
            display: inline-block;
          }

          /* Penalty card tooltips - positioned above */
          .penalty-card.tooltip-wrapper {
            position: relative;
          }

          .penalty-card .tooltip-content {
            width: 350px;
            max-width: 90vw;
            bottom: calc(100% + 12px);
            top: auto;
          }

          .penalty-card .tooltip-content::after {
            top: 100%;
            border-color: var(--color-primary) transparent transparent transparent;
          }

          /* Violation card tooltips - positioned above */
          .violation-card.tooltip-wrapper {
            position: relative;
          }

          .violation-card .tooltip-content {
            width: 340px;
            max-width: 90vw;
            bottom: calc(100% + 12px);
            top: auto;
          }

          .violation-card .tooltip-content::after {
            top: 100%;
            border-color: var(--color-primary) transparent transparent transparent;
          }

          /* Action card tooltips - positioned above */
          .action-card.tooltip-wrapper {
            position: relative;
          }

          .action-card .tooltip-content {
            width: 360px;
            max-width: 90vw;
            bottom: calc(100% + 12px);
            top: auto;
          }

          .action-card .tooltip-content::after {
            top: 100%;
            border-color: var(--color-primary) transparent transparent transparent;
          }

          .status-badge {
            display: inline-block;
            padding: var(--space-6) var(--space-12);
            border-radius: var(--radius-base);
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: var(--space-8);
          }

          .status-good {
            background: rgba(34, 197, 94, 0.2);
            color: var(--color-green-500);
            border: 1px solid rgba(34, 197, 94, 0.4);
          }

          .status-warning {
            background: rgba(230, 129, 97, 0.2);
            color: var(--color-orange-400);
            border: 1px solid rgba(230, 129, 97, 0.4);
          }

          .status-critical {
            background: rgba(255, 84, 89, 0.2);
            color: var(--color-red-400);
            border: 1px solid rgba(255, 84, 89, 0.4);
          }

          .risk-high { color: var(--color-red-400); }
          .risk-medium { color: var(--color-orange-400); }
          .risk-low { color: var(--color-green-500); }

          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin: var(--space-32) 0 var(--space-16) 0;
            color: var(--color-text);
            border-bottom: 2px solid var(--color-primary);
            padding-bottom: var(--space-12);
          }

          .predictive-charts-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .gauge-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            text-align: center;
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: 420px;
            justify-content: center;
          }

          .gauge-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-12);
            color: var(--color-text);
            line-height: 1.4;
          }

          .gauge-canvas {
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            height: 360px;
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .gauge-canvas canvas {
            max-width: 360px;
            max-height: 360px;
            width: 100% !important;
            height: 100% !important;
          }

          .table-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin-bottom: var(--space-32);
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }

          .table thead {
            background: rgba(32, 160, 132, 0.1);
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
          }

          .table td {
            padding: var(--space-16) var(--space-20);
            border-bottom: 1px solid var(--color-border);
            font-size: 18px;
          }

          .table tbody tr:hover {
            background: rgba(32, 160, 132, 0.05);
          }

          .tier-name {
            font-weight: 500;
            color: var(--color-primary);
          }

          .penalty-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-20);
            margin-bottom: var(--space-32);
          }

          .penalty-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            transition: all 0.3s ease;
            border-left: 4px solid var(--color-red-400);
            cursor: help;
            position: relative;
          }

          .penalty-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.15);
            transform: translateY(-2px);
          }

          .penalty-client {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
            font-size: 18px;
          }

          .penalty-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--space-8);
            font-size: 18px;
          }

          .penalty-label {
            color: var(--color-text-secondary);
          }

          .penalty-value {
            color: var(--color-red-400);
            font-weight: 600;
          }

          .penalty-reason {
            font-size: 16px;
            color: var(--color-text-secondary);
            margin-top: var(--space-12);
            padding-top: var(--space-12);
            border-top: 1px solid var(--color-border);
            line-height: 1.6;
          }

          .violation-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            margin-bottom: var(--space-16);
            border-left: 4px solid;
            transition: all 0.3s ease;
            cursor: help;
            position: relative;
          }

          .violation-card:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .violation-card.high {
            border-left-color: var(--color-red-400);
            background: rgba(255, 84, 89, 0.05);
          }

          .violation-card.medium {
            border-left-color: var(--color-orange-400);
            background: rgba(230, 129, 97, 0.05);
          }

          .violation-card.low {
            border-left-color: var(--color-teal-300);
            background: rgba(50, 184, 198, 0.05);
          }

          .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-12);
          }

          .violation-material {
            font-weight: 600;
            color: var(--color-primary);
            font-size: 18px;
          }

          .violation-probability {
            font-size: 18px;
            font-weight: 600;
          }

          .violation-high { color: var(--color-red-400); }
          .violation-medium { color: var(--color-orange-400); }
          .violation-low { color: var(--color-teal-300); }

          .violation-row {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            margin-bottom: var(--space-8);
            color: var(--color-text-secondary);
          }

          .violation-driver {
            color: var(--color-text);
            font-weight: 500;
          }

          .action-board {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .action-column {
            background: rgba(32, 160, 132, 0.05);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
          }

          .action-column-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .action-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            padding: var(--space-12);
            margin-bottom: var(--space-12);
            transition: all 0.3s ease;
          }

          .action-card:hover {
            box-shadow: 0 2px 8px rgba(32, 160, 132, 0.15);
            transform: translateY(-2px);
          }

          .action-title {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
            font-size: 18px;
          }

          .action-owner {
            display: inline-block;
            font-size: 14px;
            padding: var(--space-4) var(--space-8);
            background: rgba(32, 160, 132, 0.2);
            color: var(--color-primary);
            border-radius: var(--radius-base);
            margin-bottom: var(--space-8);
            font-weight: 600;
          }

          .action-impact {
            font-size: 16px;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-8);
            line-height: 1.6;
          }

          .action-deadline {
            font-size: 16px;
            color: var(--color-text-secondary);
            border-top: 1px solid var(--color-border);
            padding-top: var(--space-8);
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
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
          }

          .chart-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-text);
            flex-shrink: 0;
          }

          .chart-canvas {
            flex: 1;
            min-height: 360px;
            position: relative;
            width: 100%;
          }

          .chart-canvas canvas {
            width: 100% !important;
            height: 100% !important;
          }

          .narrative-box {
            background: rgba(32, 160, 132, 0.08);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin-bottom: var(--space-32);
            line-height: 1.8;
          }

          .narrative-box h3 {
            margin: 0 0 var(--space-12) 0;
            color: var(--color-primary);
            font-size: 20px;
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

          .key-point-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin-bottom: var(--space-16);
            border-left: 4px solid var(--color-primary);
            transition: all 0.3s ease;
            cursor: help;
            position: relative;
          }

          .key-point-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(32, 160, 132, 0.2);
            transform: translateY(-2px);
          }

          .key-point-card h4 {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
          }

          .key-point-card p {
            font-size: 18px;
            color: var(--color-text);
            line-height: 1.6;
            margin-bottom: var(--space-8);
          }

          .key-point-card .formula {
            background: var(--color-surface-alt);
            border-left: 4px solid var(--color-primary);
            padding: var(--space-16);
            border-radius: var(--radius-base);
            margin: var(--space-16) 0;
            font-size: 18px;
            font-family: 'Courier New', monospace;
            color: var(--color-primary);
          }

          /* Ensure charts are visible and properly sized */
          .chart-container canvas {
            display: block !important;
            max-width: 100%;
          }

          @media (max-width: 1200px) {
            .charts-grid {
              grid-template-columns: 1fr;
            }
            .predictive-charts-grid {
              grid-template-columns: 1fr;
            }
            .chart-container {
              min-height: 400px;
            }
            .chart-canvas {
              min-height: 340px;
            }
            .gauge-container {
              min-height: 400px;
            }
            .gauge-canvas {
              height: 320px;
            }
            .gauge-canvas canvas {
              max-width: 320px;
              max-height: 320px;
            }
          }
          
          @media (max-width: 768px) {
            .charts-grid {
              grid-template-columns: 1fr;
            }
            .summary-banner {
              grid-template-columns: 1fr;
            }
            .penalty-grid {
              grid-template-columns: 1fr;
            }
            .action-board {
              grid-template-columns: 1fr;
            }
            .chart-container {
              min-height: 350px;
            }
            .chart-canvas {
              min-height: 300px;
            }
            .tooltip-content {
              width: 280px;
              max-width: 85vw;
            }
          }
        `}</style>

        <div className="sla-header">
          <h1>🎯 Service Level Agreement (SLA) Dashboard</h1>
          <p>Monitoramento de disponibilidade, penalidades e previsão de violações de SLA para otimização de estoque e gestão de supply chain</p>
      </div>

        {/* FILTERS */}
        <div className="filters">
          <div className="filter-group">
            <label className="tooltip-wrapper">
              Data Inicial
              <div className="tooltip-content">
                <strong>📅 Filtro de Data Inicial</strong>
                Selecione a data inicial do período de análise. Use para focar em períodos específicos ou comparar performance entre meses.
                <br/><br/>
                <strong>Dica:</strong> Períodos de 30-90 dias oferecem melhor visibilidade de tendências sem ruído de curto prazo.
              </div>
            </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          <div className="filter-group">
            <label className="tooltip-wrapper">
              Data Final
              <div className="tooltip-content">
                <strong>📅 Filtro de Data Final</strong>
                Selecione a data final do período de análise. Combine com data inicial para criar janelas de análise customizadas.
                <br/><br/>
                <strong>Uso:</strong> Analise períodos de alta demanda (verão, Black Friday) ou eventos climáticos específicos.
              </div>
            </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          <div className="filter-group">
            <label className="tooltip-wrapper">
              Camada (Tier)
              <div className="tooltip-content">
                <strong>🏢 Filtro por Camada de Cliente</strong>
                Filtre por tier de cliente para análise segmentada:
                <ul>
                  <li><strong>Tier 1:</strong> Clientes premium (99%+ target). Penalidades mais altas.</li>
                  <li><strong>Tier 2:</strong> Clientes padrão (99% target). Penalidades moderadas.</li>
                  <li><strong>Tier 3:</strong> Clientes menores (99% target). Impacto reputacional.</li>
                </ul>
                <strong>Estratégia:</strong> Foque em Tier 1 para proteger receita, Tier 3 para reduzir custos operacionais.
            </div>
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="">Todas as camadas</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="tooltip-wrapper">
              Nível de Risco
              <div className="tooltip-content">
                <strong>⚠️ Filtro por Nível de Risco</strong>
                Filtre violações e penalidades por nível de criticidade:
                <ul>
                  <li><strong>Alto:</strong> Risco &gt;50%. Ação urgente necessária. Penalidades &gt;R$ 40K.</li>
                  <li><strong>Médio:</strong> Risco 30-50%. Monitorar de perto. Penalidades R$ 20-40K.</li>
                  <li><strong>Baixo:</strong> Risco &lt;30%. Manter vigilância. Penalidades &lt;R$ 20K.</li>
                </ul>
                <strong>Priorização:</strong> Sempre priorize ações de alto risco para maximizar ROI de mitigação.
        </div>
            </label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="all">Todos os riscos</option>
              <option value="low">Baixo</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
            </select>
          </div>
        </div>

        {/* NARRATIVE: SITUATION OVERVIEW */}
        <div className="narrative-box">
          <h3>📊 Situação Geral - SLA em Foco</h3>
          <p>
            <strong>Global SLA estável em {summary.globalAvailability}%</strong>, {summary.globalAvailability >= summary.target ? 'acima' : 'abaixo'} da meta de {summary.target}%, 
            mas <span style={{ color: 'var(--color-red-400)' }}>Tier 3 apresenta risco crítico</span> 
            com disponibilidade em 97.8% e exposição de penalidade de <strong>R$ {tierMetrics[2].penaltyRisk.toLocaleString('pt-BR')}</strong>. 
            Previsão de violação para conectores RF próxima semana (probabilidade 62%) devido a tempestades na região Nordeste e atrasos logísticos.
          </p>
          <p>
            <strong>Ação Urgente:</strong> Aumentar estoque de buffer em 30% reduz risco de violação em 75%. 
            Ativar fornecedor backup para materiais críticos. Implementar ações nos próximos 7 dias evita penalidades estimadas de R$ 250K.
              </p>
            </div>

        {/* SLA OVERVIEW BANNER */}
        <div className="summary-banner">
          <div className="metric-card">
            <div className="tooltip-icon">?</div>
            <div className="label">Disponibilidade Global</div>
            <div className="value">{summary.globalAvailability}%</div>
            <div className="unit">
              vs {summary.target}% meta{' '}
              {summary.globalAvailability >= summary.target ? (
                <span className="status-badge status-good">✓ No Alvo</span>
              ) : (
                <span className="status-badge status-warning">⚠ Abaixo</span>
              )}
            </div>
            <div className="tooltip-text">
              <strong>O que significa?</strong>
              Percentual de tempo que as torres permanecem operacionais. Target: 99%+ para evitar multas contratuais. 
              Cada 0.1% abaixo do target = ~7.2 horas/mês de downtime = R$ 3.6K-7.2K em penalidades.
            </div>
          </div>

          <div className="metric-card">
            <div className="tooltip-icon">?</div>
            <div className="label">Downtime Mensal</div>
            <div className="value">{summary.downtimeHours}</div>
            <div className="unit">horas | Tier 3: {tierMetrics[2].downtime}h</div>
            <div className="tooltip-text">
              <strong>Impacto:</strong>
              Horas que torres ficaram offline. Cada hora = R$ 500-1K em penalidades. 
              Downtime alto indica necessidade de aumentar estoque de segurança ou melhorar lead time de fornecedores.
            </div>
          </div>

          <div className="metric-card">
            <div className="tooltip-icon">?</div>
            <div className="label">Penalidade em Risco</div>
            <div className="value risk-high">R$ {Math.round(summary.penaltyRisk / 1000)}K</div>
            <div className="unit">Total | Tier 3: R$ {Math.round(tierMetrics[2].penaltyRisk / 1000)}K</div>
            <div className="tooltip-text">
              <strong>Financeiro:</strong>
              Multa estimada se violações ocorrerem. Cálculo: (99% - Atual%) × Taxa Penalidade × Horas. 
              Reduzir estoque de segurança pode economizar capital, mas aumenta este risco exponencialmente.
            </div>
          </div>

          <div className="metric-card">
            <div className="tooltip-icon">?</div>
            <div className="label">Violações Previstas</div>
            <div className="value risk-high">{summary.violationCount}</div>
            <div className="unit">Próximos 30 dias | Conectores 62%</div>
            <div className="tooltip-text">
              <strong>Previsão:</strong>
              Probabilidade de violação SLA nos próximos 30 dias. Baseado em forecast de demanda + lead time + variabilidade. 
              Ações preventivas (aumentar estoque, diversificar fornecedores) reduzem este número em 60-80%.
            </div>
          </div>
        </div>

        {/* PREDICTIVE ANALYTICS OVERVIEW - 3 CHARTS GRID */}
        <div className="section-title tooltip-wrapper">
          📊 Resumo de Analytics Preditivos - SLA
          <div className="tooltip-content">
            <strong>📊 Seção de Analytics Preditivos</strong>
            Visualizações interativas mostrando métricas preditivas de SLA: disponibilidade global, distribuição de risco por tier, e tendência de penalidades.
            <br/><br/>
            <strong>Gráficos:</strong>
            <ul>
              <li><strong>Gauge:</strong> Disponibilidade atual vs. target</li>
              <li><strong>Barras Empilhadas:</strong> Distribuição de risco por tier</li>
              <li><strong>Área:</strong> Tendência de penalidades previstas</li>
            </ul>
            <strong>Uso:</strong> Identifique padrões, priorize ações e monitore tendências de risco.
          </div>
        </div>
        
        <div className="predictive-charts-grid">
          {/* TOP 5 MATERIAIS POR IMPACTO FINANCEIRO - C-LEVEL FOCUS */}
          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">💎 Top 5 Materiais - Impacto Financeiro Total</div>
            <div className="tooltip-content">
              <strong>💎 Gráfico: Top 5 Materiais por Impacto Financeiro</strong>
              Ranking dos materiais com maior impacto financeiro potencial, calculado como: (Probabilidade de Violação × Penalidade Estimada).
              <br/><br/>
              <strong>Por que é importante para C-Level:</strong>
              <ul>
                <li>Foca no <strong>valor financeiro direto</strong>, não apenas em quantidade</li>
                <li>Prioriza ações onde o <strong>ROI é maior</strong></li>
                <li>Mostra <strong>exposição total de risco</strong> por material</li>
              </ul>
              <strong>Insight:</strong> Conectores RF representam R$ 31K de risco esperado. Ação preventiva de R$ 125K evita R$ 400K = ROI 3.2x.
            </div>
            <div className="chart-canvas">
              <canvas id="topMaterialsImpactChart"></canvas>
            </div>
          </div>

          {/* GAUGE CHART - CENTER POSITION */}
          <div className="gauge-container tooltip-wrapper">
            <div className="gauge-title">
              📊 Status SLA: {summary.globalAvailability}% (Gap: {Math.abs(summary.globalAvailability - summary.target).toFixed(1)}%)
            </div>
            <div className="tooltip-content">
              <strong>📊 Gauge de Disponibilidade Global</strong>
              Visualização circular mostrando disponibilidade atual vs. meta de 99% com variação sutil por tier.
              <br/><br/>
              <strong>Por que no centro:</strong> É a métrica principal de SLA. Tudo gira em torno de manter 99%+ disponibilidade.
              <br/><br/>
              <strong>Interpretação:</strong>
              <ul>
                <li>Verde (≥99%): No alvo. Sem penalidades esperadas.</li>
                <li>Laranja (98-99%): Atenção. Risco de penalidade baixo-moderado.</li>
                <li>Vermelho (&lt;98%): Crítico. Penalidades ativas ou iminentes.</li>
              </ul>
              <strong>Gap atual:</strong> {summary.globalAvailability}% vs. {summary.target}% = {Math.abs(summary.globalAvailability - summary.target).toFixed(1)}% de diferença.
              <br/><br/>
              <strong>Cálculo de Gap:</strong> Gap = Target% - Disponibilidade% = {summary.target}% - {summary.globalAvailability}% = {Math.abs(summary.globalAvailability - summary.target).toFixed(1)}%
            </div>
            <div className="gauge-canvas">
              <canvas id="slaGauge"></canvas>
            </div>
          </div>

          {/* PENALTY TREND CHART - CORRECTED */}
          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">💰 Tendência de Penalidades - Passado vs. Futuro</div>
            <div className="tooltip-content">
              <strong>💰 Gráfico: Tendência de Penalidades Previstas</strong>
              Evolução temporal conectando penalidades reais (últimos 6 meses) com previsões (próximos 6 meses).
              <br/><br/>
              <strong>Por que conectado:</strong> A linha contínua mostra a transição suave entre dados históricos e previsões, facilitando a visualização da tendência.
              <br/><br/>
              <strong>Interpretação:</strong>
              <ul>
                <li><strong>Área laranja:</strong> Penalidades reais (Mai-Out)</li>
                <li><strong>Área azul:</strong> Penalidades previstas (Nov-Abr)</li>
                <li><strong>Ponto de transição (Out/Nov):</strong> Conecta histórico com previsão</li>
              </ul>
              <strong>Insight C-Level:</strong> Tendência de aumento (R$ 52K → R$ 125K) indica necessidade urgente de ações preventivas para proteger margem.
            </div>
            <div className="chart-canvas">
              <canvas id="penaltyTrendChart"></canvas>
            </div>
          </div>
        </div>

        {/* KEY POINT CARDS */}
        <div className="section-title tooltip-wrapper">
          💡 Insights Prescritivos - Por Que SLA Importa?
          <div className="tooltip-content">
            <strong>💡 Seção de Insights Prescritivos</strong>
            Esta seção explica conceitos fundamentais de SLA e seu impacto financeiro direto no negócio.
            <br/><br/>
            <strong>Conteúdo:</strong>
            <ul>
              <li>Definição de SLA e penalidades contratuais</li>
              <li>Fórmulas de cálculo de disponibilidade e penalidades</li>
              <li>Trade-offs entre estoque e risco de violação</li>
              <li>Impacto financeiro e estratégico</li>
            </ul>
            <strong>Uso:</strong> Use esta seção para educar stakeholders e justificar investimentos em prevenção.
          </div>
        </div>
        
        <div className="key-point-card">
          <h4>🎯 SLA e Impacto Financeiro Direto</h4>
          <p>
            <strong>Service Level Agreement (SLA)</strong> é um compromisso contratual entre Nova Corrente e seus clientes 
            (Claro, Vivo, TIM, American Tower, SBA) para manter disponibilidade mínima de 99%+. 
            Cada hora de downtime resulta em penalidades de R$ 500-1K, totalizando até 10% do contrato anual.
          </p>
          <div className="formula">
            <strong>Fórmula de Penalidade:</strong><br/>
            Penalidade = (Target% - Atual%) × Taxa por Hora × Horas Downtime<br/>
            Exemplo: (99% - 97.8%) × R$ 750/h × 16.1h = R$ 14.5K
            </div>
          <p>
            <strong>Impacto no Negócio:</strong> Evitar violações de SLA via previsão e mitigation preserva 
            receita de R$ 450K-600K/ano e reputação com operadores. Cada 1% de melhoria em disponibilidade 
            reduz penalidades em ~R$ 80K/ano.
              </p>
            </div>

        <div className="key-point-card">
          <h4>📊 Cálculo de Disponibilidade</h4>
          <p>
            <strong>Fórmula de Disponibilidade:</strong> (Uptime Total / Tempo Total) × 100. 
            Por exemplo: 99.2% significa apenas 5.6 horas de downtime permitidas por mês (de 720 horas totais).
          </p>
          <div className="formula">
            <strong>Disponibilidade = (Tempo Operacional / Tempo Total) × 100</strong><br/>
            Exemplo: (714.4h / 720h) × 100 = 99.2%
          </div>
          <p>
            <strong>Trade-off Crítico:</strong> Manter 99%+ requer estoque de segurança adequado. 
            Reduzir estoque libera capital, mas aumenta risco de stockout → downtime → violação SLA → penalidade. 
            O sweet spot é balancear custo de estoque vs. risco de penalidade.
          </p>
        </div>

        {/* TIER METRICS TABLE */}
        <div className="section-title tooltip-wrapper">
          📋 Métricas por Camada (Tier) - Análise Detalhada
          <div className="tooltip-content">
            <strong>📋 Tabela de Métricas por Tier</strong>
            Visão comparativa de disponibilidade, downtime e penalidades por camada de cliente.
            <br/><br/>
            <strong>Métricas:</strong>
            <ul>
              <li><strong>Disponibilidade:</strong> % de uptime vs. meta contratual</li>
              <li><strong>Downtime:</strong> Horas offline no período</li>
              <li><strong>Penalidade em Risco:</strong> Valor estimado de multas se violações ocorrerem</li>
            </ul>
            <strong>Estratégia:</strong> Foque ações de mitigação em tiers com maior exposição financeira.
    </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="tooltip-wrapper">
                  Camada
                  <div className="tooltip-content">
                    <strong>🏢 Camada (Tier)</strong>
                    Nível de cliente baseado em valor de contrato e criticidade. Tier 1 = premium, Tier 3 = padrão.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Disponibilidade
                  <div className="tooltip-content">
                    <strong>📊 Disponibilidade Atual</strong>
                    Percentual de tempo que torres permanecem operacionais. Calculado como (Uptime / Tempo Total) × 100.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Meta
                  <div className="tooltip-content">
                    <strong>🎯 Meta Contratual</strong>
                    Meta de disponibilidade definida no contrato SLA. Geralmente 99% para todos os tiers.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Downtime (h)
                  <div className="tooltip-content">
                    <strong>⏱️ Horas de Downtime</strong>
                    Total de horas que torres ficaram offline no período. Cada hora = R$ 500-1K em penalidades.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Penalidade em Risco
                  <div className="tooltip-content">
                    <strong>💰 Penalidade Estimada</strong>
                    Valor financeiro de multas se violações ocorrerem. Cálculo: (Target% - Atual%) × Taxa × Horas.
                  </div>
                </th>
                <th className="tooltip-wrapper">
                  Status
                  <div className="tooltip-content">
                    <strong>✅ Status de Risco</strong>
                    Indicador visual: ✅ Seguro (≥99%), ⚠️ Alerta (98-99%), 🔴 Crítico (&lt;98%).
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {tierMetrics.map((tier) => {
                const status = tier.availability >= tier.target ? 'good' : tier.availability >= 98 ? 'warning' : 'critical';
                const gap = tier.target - tier.availability;
                const estimatedPenalty = gap > 0 ? (gap / 100) * 750 * tier.downtime : 0;
                return (
                  <tr key={tier.tier}>
                    <td className="tier-name tooltip-wrapper">
                      {tier.tier}
                      <div className="tooltip-content">
                        <strong>{tier.tier} - Detalhes</strong>
                        {tier.tier === 'Tier 1' && 'Clientes premium com contratos de alto valor. Penalidades podem chegar a 10% do contrato anual.'}
                        {tier.tier === 'Tier 2' && 'Clientes padrão com contratos de valor médio. Penalidades típicas de 5-7% do contrato.'}
                        {tier.tier === 'Tier 3' && 'Clientes menores, mas violações ainda impactam reputação e renovação contratual.'}
                      </div>
                    </td>
                    <td className="tooltip-wrapper">
                      {tier.availability}%
                      <div className="tooltip-content">
                        <strong>Disponibilidade: {tier.availability}%</strong>
                        Gap para meta: {gap.toFixed(1)}%. 
                        {gap > 0 && ` Isso representa ${(gap / 100 * 720).toFixed(1)} horas de downtime permitidas vs. ${tier.downtime}h reais.`}
                        {gap <= 0 && ' Acima da meta! Sem risco de penalidade por disponibilidade.'}
                      </div>
                    </td>
                    <td className="tooltip-wrapper">
                      {tier.target}%
                      <div className="tooltip-content">
                        <strong>Meta: {tier.target}%</strong>
                        Meta contratual de disponibilidade. Manter acima desta meta evita penalidades financeiras.
                      </div>
                    </td>
                    <td className="tooltip-wrapper">
                      {tier.downtime}h
                      <div className="tooltip-content">
                        <strong>Downtime: {tier.downtime} horas</strong>
                        {tier.downtime > 5.6 && ` Acima do limite ideal (5.6h para 99%). `}
                        Impacto financeiro estimado: R$ {Math.round(tier.downtime * 750).toLocaleString('pt-BR')}.
                      </div>
                    </td>
                    <td className="tooltip-wrapper" style={{ 
                      color: tier.penaltyRisk > 50000 ? 'var(--color-red-400)' : 
                             tier.penaltyRisk > 20000 ? 'var(--color-orange-400)' : 
                             'var(--color-green-500)', 
                      fontWeight: 600 
                    }}>
                      R$ {tier.penaltyRisk.toLocaleString('pt-BR')}
                      <div className="tooltip-content">
                        <strong>Penalidade em Risco: R$ {tier.penaltyRisk.toLocaleString('pt-BR')}</strong>
                        {tier.penaltyRisk > 0 
                          ? `Valor estimado de multas se violações ocorrerem. Baseado em gap de disponibilidade e horas de downtime. Ações preventivas podem reduzir este valor em 60-80%.`
                          : 'Sem risco de penalidade. Disponibilidade acima da meta.'}
                      </div>
                    </td>
                    <td>
                      {status === 'good' && (
                        <span className="status-badge status-good tooltip-wrapper">
                          ✅ Seguro
                          <div className="tooltip-content">
                            <strong>✅ Status: Seguro</strong>
                            Disponibilidade acima ou igual à meta. Sem risco imediato de penalidades. Continue monitorando.
                          </div>
                        </span>
                      )}
                      {status === 'warning' && (
                        <span className="status-badge status-warning tooltip-wrapper">
                          ⚠️ Alerta
                          <div className="tooltip-content">
                            <strong>⚠️ Status: Alerta</strong>
                            Disponibilidade próxima da meta. Risco moderado de violação. Revise estoque e lead times.
                          </div>
                        </span>
                      )}
                      {status === 'critical' && (
                        <span className="status-badge status-critical tooltip-wrapper">
                          🔴 Crítico
                          <div className="tooltip-content">
                            <strong>🔴 Status: Crítico</strong>
                            Disponibilidade abaixo da meta. Ação urgente necessária! Aumente estoque de segurança e ative fornecedores backup.
                          </div>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PENALTY EXPOSURE */}
        <div className="section-title tooltip-wrapper">
          💰 Exposição de Penalidades - Top Clientes/Materiais
          <div className="tooltip-content">
            <strong>💰 Cards de Exposição de Penalidades</strong>
            Materiais e clientes com maior risco financeiro de violação de SLA.
            <br/><br/>
            <strong>Informações:</strong>
            <ul>
              <li>Penalidade potencial estimada</li>
              <li>Número de violações previstas</li>
              <li>Motivo raiz do risco</li>
              <li>Ações recomendadas com ROI</li>
            </ul>
            <strong>Priorização:</strong> Execute ações preventivas nos top 3 para maximizar impacto financeiro.
          </div>
        </div>
        <div className="penalty-grid">
          <div className="penalty-card tooltip-wrapper">
            <div className="penalty-client">American Tower (Claro)</div>
            <div className="penalty-row">
              <span className="penalty-label">Penalidade Potencial:</span>
              <span className="penalty-value">R$ 50K</span>
            </div>
            <div className="penalty-row">
              <span className="penalty-label">Violações Previstas:</span>
              <span className="penalty-value">2 (próx. 30d)</span>
            </div>
            <div className="penalty-reason">
              <strong>Motivo:</strong> Falta de conectores RF. Tempestade Nordeste +12d lead time. 
              <strong> Ação:</strong> Aumentar buffer stock 30% reduz risco para 18%.
            </div>
            <div className="tooltip-content">
              <strong>💰 American Tower (Claro) - Detalhes</strong>
              <br/><br/>
              <strong>Penalidade Potencial: R$ 50K</strong>
              Valor estimado de multas se violações ocorrerem. Baseado em gap de disponibilidade projetado e taxa contratual.
              <br/><br/>
              <strong>Violações Previstas: 2 nos próximos 30 dias</strong>
              Probabilidade alta (62%) de violação devido a:
              <ul>
                <li>Falta de conectores RF (estoque crítico)</li>
                <li>Tempestades na região Nordeste (+12 dias lead time)</li>
                <li>Lead time estendido de fornecedor principal</li>
              </ul>
              <strong>ROI da Ação:</strong> Investir R$ 125K em buffer stock reduz risco de 62% → 18% (redução de 71%). Evita R$ 400K em penalidades = ROI 3.2x.
            </div>
          </div>

          <div className="penalty-card tooltip-wrapper">
            <div className="penalty-client">SBA Communications (Vivo)</div>
            <div className="penalty-row">
              <span className="penalty-label">Penalidade Potencial:</span>
              <span className="penalty-value">R$ 35K</span>
            </div>
            <div className="penalty-row">
              <span className="penalty-label">Violações Previstas:</span>
              <span className="penalty-value">1 (próx. 30d)</span>
            </div>
            <div className="penalty-reason">
              <strong>Motivo:</strong> Atraso kit refrigeração. Fornecedor D com variância 35%. 
              <strong> Ação:</strong> Diversificar fornecedores ou negociar SLA mais rígido.
            </div>
            <div className="tooltip-content">
              <strong>💰 SBA Communications (Vivo) - Detalhes</strong>
              <br/><br/>
              <strong>Penalidade Potencial: R$ 35K</strong>
              Risco moderado-alto. Impacto em receita recorrente se violação ocorrer.
              <br/><br/>
              <strong>Violações Previstas: 1 nos próximos 30 dias</strong>
              Probabilidade média (48%) devido a:
              <ul>
                <li>Atraso em kit de refrigeração</li>
                <li>Fornecedor D com alta variabilidade (35% desvio padrão)</li>
                <li>Backlog de 6 POs pendentes</li>
              </ul>
              <strong>Ações Recomendadas:</strong>
              <ul>
                <li>Diversificar fornecedores (reduz dependência única)</li>
                <li>Renegociar SLA com Fornecedor D (penalidades por variância)</li>
                <li>Auditar processo de Fornecedor D (identificar raiz causa)</li>
              </ul>
            </div>
          </div>

          <div className="penalty-card tooltip-wrapper">
            <div className="penalty-client">TIM Infrastructure</div>
            <div className="penalty-row">
              <span className="penalty-label">Penalidade Potencial:</span>
              <span className="penalty-value">R$ 40K</span>
            </div>
            <div className="penalty-row">
              <span className="penalty-label">Violações Previstas:</span>
              <span className="penalty-value">1 (próx. 30d)</span>
            </div>
            <div className="penalty-reason">
              <strong>Motivo:</strong> PPE (cabos de fibra). Upgrade 5G antecipa consumo em 40%. 
              <strong> Ação:</strong> Ajustar forecast para incluir expansão 5G.
            </div>
            <div className="tooltip-content">
              <strong>💰 TIM Infrastructure - Detalhes</strong>
              <br/><br/>
              <strong>Penalidade Potencial: R$ 40K</strong>
              Risco moderado. Impacto em relacionamento comercial se violação ocorrer.
              <br/><br/>
              <strong>Violações Previstas: 1 nos próximos 30 dias</strong>
              Probabilidade média-baixa (28%) devido a:
              <ul>
                <li>PPE (cabos de fibra óptica) em estoque crítico</li>
                <li>Upgrade 5G em Salvador antecipa consumo em 40%</li>
                <li>Forecast não capturou expansão 5G planejada</li>
              </ul>
              <strong>Ações Recomendadas:</strong>
              <ul>
                <li>Ajustar forecast para incluir expansão 5G (modelo de demanda)</li>
                <li>Aumentar estoque de segurança para materiais 5G</li>
                <li>Monitorar rollout 5G em outras cidades (preparar estoque)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* VIOLATION FORECAST */}
        <div className="section-title tooltip-wrapper">
          ⚡ Previsão de Violações - Próximos 30 Dias
          <div className="tooltip-content">
            <strong>⚡ Previsão de Violações</strong>
            Materiais com maior probabilidade de violação de SLA nos próximos 30 dias, baseado em modelos preditivos.
            <br/><br/>
            <strong>Componentes da Previsão:</strong>
            <ul>
              <li>Forecast de demanda (tendência + sazonalidade)</li>
              <li>Lead time de fornecedores (média + variabilidade)</li>
              <li>Estoque atual vs. ponto de reordem</li>
              <li>Fatores externos (clima, eventos, etc.)</li>
            </ul>
            <strong>Ação:</strong> Revise estoque de segurança e ative fornecedores backup para itens de alto risco.
          </div>
        </div>
        
        {violations.map((violation, idx) => (
          <div key={idx} className={`violation-card ${violation.level} tooltip-wrapper`}>
            <div className="violation-header">
              <span className="violation-material">
                {violation.level === 'high' && '🔌 '}
                {violation.level === 'medium' && '🧊 '}
                {violation.level === 'low' && '📡 '}
                {violation.material}
              </span>
              <span className={`violation-probability violation-${violation.level}`}>
                {violation.risk}% Risco
              </span>
            </div>
            <div className="violation-row">
              <span>Driver:</span>
              <span className="violation-driver">{violation.driver}</span>
            </div>
            <div className="violation-row">
              <span>ETA Violação:</span>
              <span>{new Date(violation.eta).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="violation-row">
              <span>Impacto Estimado:</span>
              <span className="violation-driver">
                R$ {Math.round(violation.penalty / 1000)}K penalidade | 
                {violation.level === 'high' && ' 2-3 torres offline'}
                {violation.level === 'medium' && ' 1-2 torres offline'}
                {violation.level === 'low' && ' Monitorar estoque'}
              </span>
            </div>
            <div className="tooltip-content">
              <strong>⚡ {violation.material} - Análise Detalhada</strong>
              <br/><br/>
              <strong>Probabilidade de Violação: {violation.risk}%</strong>
              {violation.level === 'high' && ' Risco CRÍTICO. Ação urgente necessária!'}
              {violation.level === 'medium' && ' Risco MODERADO. Monitorar de perto.'}
              {violation.level === 'low' && ' Risco BAIXO. Manter vigilância.'}
              <br/><br/>
              <strong>Driver Principal:</strong> {violation.driver}
              <br/><br/>
              <strong>ETA Violação:</strong> {new Date(violation.eta).toLocaleDateString('pt-BR')}
              <br/><br/>
              <strong>Impacto Estimado:</strong>
              <ul>
                <li>Penalidade: R$ {Math.round(violation.penalty / 1000)}K</li>
                <li>Torres afetadas: {violation.level === 'high' ? '2-3' : violation.level === 'medium' ? '1-2' : '0-1'}</li>
                <li>Dias até violação: {Math.ceil((new Date(violation.eta).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</li>
              </ul>
              <strong>Ações Urgentes:</strong>
              {violation.level === 'high' && (
                <ul>
                  <li>PO emergencial imediato (hoje)</li>
                  <li>Aumentar buffer stock em 30-50%</li>
                  <li>Ativar fornecedor backup</li>
                  <li>Notificar cliente proativamente</li>
                </ul>
              )}
              {violation.level === 'medium' && (
                <ul>
                  <li>Revisar estoque de segurança</li>
                  <li>Diversificar fornecedores</li>
                  <li>Monitorar lead times</li>
                </ul>
              )}
              {violation.level === 'low' && (
                <ul>
                  <li>Monitorar estoque semanalmente</li>
                  <li>Manter forecast atualizado</li>
                </ul>
              )}
            </div>
          </div>
        ))}

        {/* ACTION BOARD */}
        <div className="section-title tooltip-wrapper">
          ✅ Quadro de Ações - Mitigation Plan
          <div className="tooltip-content">
            <strong>✅ Quadro de Ações (Kanban)</strong>
            Sistema de gestão de ações preventivas organizado por status: A Fazer, Em Andamento, Concluído.
            <br/><br/>
            <strong>Estrutura:</strong>
            <ul>
              <li><strong>A Fazer:</strong> Ações prioritárias não iniciadas</li>
              <li><strong>Em Andamento:</strong> Ações em execução com progresso</li>
              <li><strong>Concluído:</strong> Ações finalizadas e resultados</li>
            </ul>
            <strong>Métricas:</strong> Cada ação inclui responsável, prazo, impacto esperado e ROI estimado.
          </div>
        </div>
        <div className="action-board">
          {/* TO DO */}
          <div className="action-column">
            <div className="action-column-title">📥 A Fazer (7)</div>

            <div className="action-card tooltip-wrapper">
              <div className="action-title">Aumentar Buffer Stock 30%</div>
              <span className="action-owner">Procurement</span>
              <div className="action-impact">Reduz risco de violação de 62% → 18%. Investimento: R$ 125K. ROI: 3.2x (evita R$ 400K em penalidades).</div>
              <div className="action-deadline">⏰ Até 12/11/2025</div>
              <div className="tooltip-content">
                <strong>✅ Ação: Aumentar Buffer Stock 30%</strong>
                <br/><br/>
                <strong>Impacto:</strong> Reduz risco de violação de 62% → 18% (redução de 71%).
                <br/><br/>
                <strong>Investimento:</strong> R$ 125K em estoque adicional.
                <br/><br/>
                <strong>ROI:</strong> 3.2x (evita R$ 400K em penalidades estimadas).
                <br/><br/>
                <strong>Materiais Afetados:</strong> Conectores RF, Kit Refrigeração, Cabos de Fibra.
                <br/><br/>
                <strong>Prazo:</strong> Até 12/11/2025 (7 dias).
                <br/><br/>
                <strong>Dependências:</strong> Aprovação financeira, disponibilidade de fornecedores.
                <br/><br/>
                <strong>Métricas de Sucesso:</strong> Risco de violação &lt;20%, estoque acima de ponto de reordem.
              </div>
            </div>

            <div className="action-card">
              <div className="action-title">Ativar Fornecedor Backup</div>
              <span className="action-owner">Procurement</span>
              <div className="action-impact">Diversifica risco | +2 fontes para RF. Reduz dependência de fornecedor único em 50%.</div>
              <div className="action-deadline">⏰ Até 13/11/2025</div>
            </div>

            <div className="action-card">
              <div className="action-title">Auditar Fornecedor D</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Identifica raiz de variância 35%. Pode resultar em renegociação de SLA ou substituição.</div>
              <div className="action-deadline">⏰ Até 15/11/2025</div>
            </div>

            <div className="action-card tooltip-wrapper">
              <div className="action-title">PO Emergencial - Conectores</div>
              <span className="action-owner">Procurement</span>
              <div className="action-impact">500 un. antecipação | R$ 125K. Evita violação de 62% → 8% (redução de 87%).</div>
              <div className="action-deadline">⏰ Hoje (05/12)</div>
              <div className="tooltip-content">
                <strong>🚨 Ação Urgente: PO Emergencial - Conectores</strong>
                <br/><br/>
                <strong>Prioridade:</strong> CRÍTICA - Executar HOJE.
                <br/><br/>
                <strong>Quantidade:</strong> 500 unidades de conectores RF.
                <br/><br/>
                <strong>Investimento:</strong> R$ 125K.
                <br/><br/>
                <strong>Impacto:</strong> Evita violação de 62% → 8% (redução de 87%).
                <br/><br/>
                <strong>Justificativa:</strong> Tempestade Nordeste +12 dias lead time. Estoque crítico.
                <br/><br/>
                <strong>Riscos de Não Executar:</strong> Violação SLA garantida, penalidade de R$ 50K, 2-3 torres offline.
                <br/><br/>
                <strong>Fornecedor:</strong> Ativar fornecedor backup se principal não atender prazo.
              </div>
            </div>

            <div className="action-card">
              <div className="action-title">Monitorar Tempestade Nordeste</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Contingência logística | +4 dias lead time. Ativar plano B se necessário.</div>
              <div className="action-deadline">⏰ Contínuo até 22/11</div>
            </div>

            <div className="action-card">
              <div className="action-title">Notificar Clientes Top 3</div>
              <span className="action-owner">Finance</span>
              <div className="action-impact">Transparência | Mitiga reclamações. Comunicação proativa reduz impacto reputacional.</div>
              <div className="action-deadline">⏰ Até 06/12/2025</div>
            </div>

            <div className="action-card">
              <div className="action-title">Ativar Maintenance Flex</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Adiar manutenção preventiva 5 dias. Libera estoque crítico para emergências.</div>
              <div className="action-deadline">⏰ Até 18/11/2025</div>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="action-column">
            <div className="action-column-title">🔄 Em Andamento (3)</div>

            <div className="action-card tooltip-wrapper">
              <div className="action-title">Renegociar SLA com Fornecedor D</div>
              <span className="action-owner">Procurement</span>
              <div className="action-impact">Penalidades por variância | Incentivos. Reduz variabilidade de lead time em 20%.</div>
              <div className="action-deadline">⏰ 50% concluído</div>
              <div className="tooltip-content">
                <strong>🔄 Ação em Andamento: Renegociar SLA com Fornecedor D</strong>
                <br/><br/>
                <strong>Progresso:</strong> 50% concluído.
                <br/><br/>
                <strong>Objetivo:</strong> Estabelecer penalidades por variância alta e incentivos por performance.
                <br/><br/>
                <strong>Impacto Esperado:</strong> Reduz variabilidade de lead time em 20% (de 35% para 28%).
                <br/><br/>
                <strong>Benefícios:</strong>
                <ul>
                  <li>Reduz necessidade de estoque de segurança</li>
                  <li>Melhora previsibilidade de supply chain</li>
                  <li>Reduz risco de violação de SLA</li>
                </ul>
                <strong>Próximos Passos:</strong> Finalizar termos contratuais, aprovação jurídica, assinatura.
              </div>
            </div>

            <div className="action-card">
              <div className="action-title">Análise What-If SLA</div>
              <span className="action-owner">Finance</span>
              <div className="action-impact">Cenários: +10d lead | -20% reliability. Modela impacto financeiro de diferentes estratégias.</div>
              <div className="action-deadline">⏰ 75% concluído</div>
            </div>

            <div className="action-card">
              <div className="action-title">Previsão Demand 90 Dias</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Input para PP formula | Safety stock. Melhora precisão de reorder point em 25%.</div>
              <div className="action-deadline">⏰ 40% concluído</div>
            </div>
          </div>

          {/* DONE */}
          <div className="action-column">
            <div className="action-column-title">✅ Concluído (4)</div>

            <div className="action-card">
              <div className="action-title">Revisar Contratos Tier 1</div>
              <span className="action-owner">Finance</span>
              <div className="action-impact">Confirmado: 99.2% acima da meta. Renovação contratual garantida.</div>
              <div className="action-deadline">✓ Completado 01/12</div>
            </div>

            <div className="action-card tooltip-wrapper">
              <div className="action-title">Dashboard SLA MVP</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Real-time visibility | Alertas 24/7. Reduz tempo de resposta a violações em 60%.</div>
              <div className="action-deadline">✓ Completado 03/12</div>
              <div className="tooltip-content">
                <strong>✅ Ação Concluída: Dashboard SLA MVP</strong>
                <br/><br/>
                <strong>Status:</strong> Completado em 03/12/2025.
                <br/><br/>
                <strong>Resultados:</strong>
                <ul>
                  <li>Visibilidade em tempo real de métricas de SLA</li>
                  <li>Sistema de alertas 24/7</li>
                  <li>Redução de tempo de resposta a violações de 4h → 1.6h (60%)</li>
                </ul>
                <strong>Benefícios Alcançados:</strong>
                <ul>
                  <li>Detecção proativa de riscos</li>
                  <li>Melhor coordenação entre equipes</li>
                  <li>Decisões mais rápidas e informadas</li>
                </ul>
                <strong>Próximos Passos:</strong> Expandir funcionalidades, adicionar mais métricas preditivas.
              </div>
            </div>

            <div className="action-card">
              <div className="action-title">Treinar Equipes Risk Management</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">100% da equipe certificada. Melhora capacidade de resposta a emergências.</div>
              <div className="action-deadline">✓ Completado 02/12</div>
            </div>

            <div className="action-card">
              <div className="action-title">Integrar Alertas com Slack</div>
              <span className="action-owner">Operations</span>
              <div className="action-impact">Notificações em tempo real. Reduz tempo de detecção de violações de 4h → 15min.</div>
              <div className="action-deadline">✓ Completado 04/12</div>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="section-title tooltip-wrapper">
          📊 Gráficos de Análise
          <div className="tooltip-content">
            <strong>📊 Visualizações de Análise</strong>
            Gráficos interativos para análise temporal e distribuição de métricas de SLA.
            <br/><br/>
            <strong>Gráficos Disponíveis:</strong>
            <ul>
              <li><strong>Previsão de Violação:</strong> Tendência de probabilidade ao longo do tempo</li>
              <li><strong>Distribuição de Downtime:</strong> Causas raiz por categoria</li>
              <li><strong>Tendência de Disponibilidade:</strong> Evolução histórica vs. target</li>
              <li><strong>Heatmap de Penalidades:</strong> Top materiais por risco financeiro</li>
            </ul>
            <strong>Uso:</strong> Passe o mouse sobre pontos/barras para detalhes. Use para identificar padrões e tendências.
          </div>
        </div>
        <div className="charts-grid">
          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">Previsão de Violação - 30 Dias</div>
            <div className="tooltip-content">
              <strong>📈 Gráfico: Previsão de Violação</strong>
              Linha temporal mostrando probabilidade de violação de SLA ao longo dos próximos 30 dias para os top 3 materiais de risco.
              <br/><br/>
              <strong>Interpretação:</strong>
              <ul>
                <li>Linhas vermelhas: Risco alto (≥50%)</li>
                <li>Linhas laranjas: Risco médio (30-50%)</li>
                <li>Linhas azuis: Risco baixo (&lt;30%)</li>
              </ul>
              <strong>Uso:</strong> Identifique picos de risco e planeje ações preventivas antes que probabilidade aumente.
            </div>
            <div className="chart-canvas">
              <canvas id="violationChart"></canvas>
            </div>
          </div>

          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">Distribuição de Downtime - Últimos 6 Meses</div>
            <div className="tooltip-content">
              <strong>📊 Gráfico: Distribuição de Downtime</strong>
              Gráfico de barras empilhadas mostrando causas raiz de downtime por mês nos últimos 6 meses.
              <br/><br/>
              <strong>Categorias:</strong>
              <ul>
                <li><strong>Stockout:</strong> Falta de estoque (vermelho)</li>
                <li><strong>Lead Time:</strong> Atrasos de fornecedores (laranja)</li>
                <li><strong>Clima:</strong> Eventos climáticos (azul)</li>
                <li><strong>Manutenção:</strong> Manutenção programada (verde)</li>
              </ul>
              <strong>Insight:</strong> Identifique padrões sazonais e foque ações na causa raiz dominante.
            </div>
            <div className="chart-canvas">
              <canvas id="downtimeChart"></canvas>
            </div>
          </div>
        </div>

        {/* AVAILABILITY TREND */}
        <div className="charts-grid">
          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">Tendência de Disponibilidade - 12 Meses</div>
            <div className="tooltip-content">
              <strong>📈 Gráfico: Tendência de Disponibilidade</strong>
              Evolução histórica de disponibilidade ao longo de 12 meses com linhas de referência para target (99%) e zona de risco (97.8%).
              <br/><br/>
              <strong>Linhas de Referência:</strong>
              <ul>
                <li><strong>Verde tracejada:</strong> Target de 99% (meta contratual)</li>
                <li><strong>Vermelha tracejada:</strong> Zona de risco crítico (97.8%)</li>
                <li><strong>Azul sólida:</strong> Disponibilidade real mensal</li>
              </ul>
              <strong>Análise:</strong> Identifique tendências de melhoria ou degradação. Valores consistentemente acima de 99% indicam operação saudável.
            </div>
            <div className="chart-canvas">
              <canvas id="trendChart"></canvas>
            </div>
          </div>

          <div className="chart-container tooltip-wrapper">
            <div className="chart-title">Risco de Penalidade Heatmap - Top 10 Materiais</div>
            <div className="tooltip-content">
              <strong>🔥 Gráfico: Heatmap de Risco de Penalidade</strong>
              Gráfico de barras horizontais mostrando os top 10 materiais por risco financeiro de penalidade (em R$K).
              <br/><br/>
              <strong>Cores:</strong>
              <ul>
                <li><strong>Vermelho escuro:</strong> Risco muito alto (&gt;70% do máximo)</li>
                <li><strong>Vermelho claro:</strong> Risco alto (50-70%)</li>
                <li><strong>Laranja:</strong> Risco médio (20-50%)</li>
                <li><strong>Azul:</strong> Risco baixo (&lt;20%)</li>
              </ul>
              <strong>Priorização:</strong> Foque ações de mitigação nos materiais com maior risco financeiro (top 3-5).
            </div>
            <div className="chart-canvas">
              <canvas id="heatmapChart"></canvas>
            </div>
          </div>
        </div>

        {/* EXPLAINER CARD */}
        <div className="narrative-box" style={{ marginTop: 'var(--space-32)' }}>
          <h3>📚 O Que É SLA e Por Que Importa Estrategicamente?</h3>
          <p>
            <strong>Service Level Agreement (SLA)</strong> no contexto da Nova Corrente refere-se ao <strong>compromisso contratual de disponibilidade</strong> 
            que a empresa mantém com seus clientes (operadoras e tower companies). Este acordo define metas de performance mínima, 
            geralmente 99%+ de disponibilidade, e estabelece penalidades financeiras caso essas metas não sejam atingidas.
          </p>
          
          <div className="formula">
            <strong>Fórmula de Disponibilidade:</strong><br/>
            Disponibilidade (%) = (Tempo Operacional / Tempo Total) × 100<br/>
            <br/>
            <strong>Fórmula de Penalidade:</strong><br/>
            Penalidade = max(0, (Target% - Atual%) / 100) × Taxa por Hora × Horas Downtime<br/>
            <br/>
            <strong>Exemplo Prático:</strong><br/>
            Target: 99% | Atual: 97.8% | Downtime: 16.1h | Taxa: R$ 750/h<br/>
            Penalidade = (99% - 97.8%) / 100 × R$ 750/h × 16.1h = R$ 14.5K
          </div>
          
          <h4 style={{ fontSize: '18px', color: 'var(--color-primary)', marginTop: 'var(--space-24)', marginBottom: 'var(--space-16)' }}>
            🎯 Tipos de SLA e Impacto no Negócio
          </h4>
          <p>
            <strong>Tier 1 (99%+):</strong> Clientes premium com contratos de alto valor. Violação = multa de até 10% do contrato anual.
            <br/>
            <strong>Tier 2 (99%):</strong> Clientes padrão. Violação = multa de 5-7% do contrato.
            <br/>
            <strong>Tier 3 (99%):</strong> Clientes menores, mas violação ainda impacta reputação e renovação contratual.
          </p>
          
          <h4 style={{ fontSize: '18px', color: 'var(--color-primary)', marginTop: 'var(--space-24)', marginBottom: 'var(--space-16)' }}>
            💼 Impacto Financeiro e Estratégico
          </h4>
          <p>
            <strong>Penalidades Diretas:</strong> R$ 500-1K por hora de downtime. Em um mês com 16h de downtime, isso representa R$ 8K-16K.
            <br/>
            <strong>Impacto Reputacional:</strong> Violações frequentes podem resultar em não renovação de contratos, perda de receita recorrente.
            <br/>
            <strong>Custo de Oportunidade:</strong> Capital travado em estoque de segurança vs. risco de penalidade. 
            O sweet spot é manter estoque suficiente para 99%+ disponibilidade sem excesso que trava capital.
            <br/>
            <strong>ROI de Prevenção:</strong> Investir R$ 125K em buffer stock preventivo evita R$ 400K em penalidades = ROI de 3.2x.
          </p>
          
          <h4 style={{ fontSize: '18px', color: 'var(--color-primary)', marginTop: 'var(--space-24)', marginBottom: 'var(--space-16)' }}>
            🔄 Relação com Lead Time e Forecast
          </h4>
          <p>
            <strong>Lead Time Alto:</strong> Se fornecedor demora 30 dias, é preciso reordenar antes para evitar stockout → downtime → violação SLA.
            <br/>
            <strong>Forecast Impreciso:</strong> MAPE alto (25%+) resulta em estoque insuficiente ou excessivo. 
            Estoque insuficiente = stockout = downtime = violação SLA.
            <br/>
            <strong>Variabilidade:</strong> Lead time variável (σ alto) exige mais estoque de segurança para manter mesmo nível de disponibilidade.
            <br/>
            <strong>Solução:</strong> Forecast preciso (MAPE &lt; 10%) + Lead time confiável (σ baixo) = Estoque otimizado + SLA 99%+ = Penalidades mínimas.
          </p>
          
          <p style={{ marginTop: 'var(--space-24)', padding: 'var(--space-16)', background: 'rgba(32, 160, 132, 0.1)', borderRadius: 'var(--radius-base)', border: '1px solid var(--color-primary)' }}>
            <strong>⚠️ Importante:</strong> SLA não é apenas uma métrica operacional - é um <strong>indicador financeiro crítico</strong> que impacta 
            diretamente a margem de lucro, reputação da empresa, e capacidade de renovação de contratos. 
            Manter SLA acima de 99% requer integração entre forecast de demanda, gestão de lead time, e otimização de estoque.
          </p>
        </div>
      </div>
    </>
  );
}
