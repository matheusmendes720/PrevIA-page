'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { kpis, regionDemand, projections } from '../data';

interface CoverageTabProps {
  isChartReady: boolean;
}

export default function CoverageTab({ isChartReady }: CoverageTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Memoize chart config to avoid recalculation
  const coverageChartConfig = useMemo(
    () => ({
      type: 'line' as const,
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
          {
            label: 'Municípios cobertos',
            data: [600, 630, 670, 700, 740, 760, 790, 810, 830, 870, 880, 900],
            borderColor: '#20A084',
            backgroundColor: 'rgba(32, 160, 132, 0.14)',
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.35,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'População coberta (M)',
            data: [45, 48, 51, 53, 55, 56, 57, 59, 60, 63, 65, 67],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderWidth: 2.2,
            pointRadius: 4,
            tension: 0.35,
            fill: true,
            yAxisID: 'y1',
          },
          {
            label: 'Investimento (milhões R$)',
            data: [110, 105, 140, 135, 130, 150, 160, 165, 170, 182, 181, 187],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.10)',
            borderWidth: 2.2,
            pointRadius: 4,
            tension: 0.35,
            fill: false,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' as const },
        plugins: {
          legend: {
            labels: {
              color: '#a0aab8',
              font: { size: 12 },
              usePointStyle: true,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 36, 56, 0.98)',
            titleColor: '#f0f4f8',
            bodyColor: '#cbd5e1',
            borderColor: '#20A084',
            borderWidth: 2,
            padding: 16,
            titleFont: { size: 16, weight: 'bold' as const },
            bodyFont: { size: 14 },
            callbacks: {
              title: (items: any) => {
                return `📅 ${items[0].label} - Análise de Cobertura 5G`;
              },
              label: (context: any) => {
                const value = context.parsed.y;
                let insight = '';
                if (context.datasetIndex === 0) {
                  const growth = context.parsed.y - (context.parsed.y > 700 ? 700 : 600);
                  insight = ` | 📈 Crescimento: +${growth} municípios | 💰 Impacto: +${Math.round(growth * 3.2)}% demanda materiais`;
                } else if (context.datasetIndex === 1) {
                  insight = ` | 👥 ${value}M pessoas cobertas | 🎯 Meta: 70M até Dez/2025`;
                } else {
                  insight = ` | 💵 Investimento acumulado | 📊 ROI estimado: 12-15%`;
                }
                return `${context.dataset.label}: ${value}${context.datasetIndex === 1 ? 'M' : context.datasetIndex === 2 ? 'M R$' : ''}${insight}`;
              },
              afterBody: (items: any) => {
                const month = items[0].label;
                return `\n💡 Insight: Expansão ${month} indica tendência de crescimento sustentável.\n🎯 Recomendação: Antecipar compras de RF kits para Q1 2026.\n📊 Impacto esperado: +${Math.round((items[0].parsed.y - 600) * 0.032)}% demanda materiais.`;
              }
            }
          },
        },
        scales: {
          x: {
            ticks: { color: '#a0aab8', maxTicksLimit: 6 },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            ticks: { color: '#a0aab8', maxTicksLimit: 5 },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Municípios', color: '#a0aab8' },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            ticks: { color: '#a0aab8', maxTicksLimit: 5 },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'População (M)', color: '#a0aab8' },
          },
          y2: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            ticks: { color: '#a0aab8', maxTicksLimit: 5 },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Investimento (R$)', color: '#a0aab8' },
          },
        },
      },
    }),
    []
  );

  // Initialize chart only once when Chart.js is ready
  const initializeCoverageChart = useCallback(() => {
    console.log('🚀 Attempting to initialize coverage chart...');
    const canvas = document.getElementById('coverageChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas element not found: coverageChart');
      return;
    }
    console.log('✅ Canvas found:', canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Could not get 2d context from canvas');
      return;
    }

    // Destroy existing chart if it exists
    const existingChart = (canvas as any).chart;
    if (existingChart) {
      existingChart.destroy();
    }

    const Chart = (window as any).Chart;
    if (!Chart) {
      console.error('❌ Chart.js not available on window object');
      return; // Wait for Chart.js
    }
    console.log('✅ Chart.js is available:', Chart);

    try {
      const chart = new Chart(ctx, coverageChartConfig);
      (canvas as any).chart = chart;
      setIsInitialized(true);
      console.log('✅ Coverage chart initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize coverage chart:', error);
    }
  }, [coverageChartConfig]);

  // Initialize regional demand chart
  const initializeRegionalDemandChart = useCallback(() => {
    const canvas = document.getElementById('regionalDemandChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const existingChart = (canvas as any).chart;
    if (existingChart) {
      existingChart.destroy();
    }

    const Chart = (window as any).Chart;
    if (!Chart) return;

    try {
      const chart = new Chart(ctx, {
        type: 'bar' as const,
        data: {
          labels: regionDemand.map(r => r.region),
          datasets: [{
            label: 'Nível de Demanda',
            data: regionDemand.map(r => r.value),
            backgroundColor: regionDemand.map(r => 
              r.level === 'high' ? 'rgba(249, 115, 22, 0.7)' :
              r.level === 'med' ? 'rgba(251, 191, 36, 0.7)' :
              'rgba(16, 185, 129, 0.7)'
            ),
            borderColor: regionDemand.map(r => 
              r.level === 'high' ? '#f97316' :
              r.level === 'med' ? '#fbbf24' :
              '#10b981'
            ),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#a0aab8', font: { size: 12 } }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 36, 56, 0.98)',
              titleColor: '#f0f4f8',
              bodyColor: '#cbd5e1',
              borderColor: '#20A084',
              borderWidth: 2,
              padding: 16
            }
          },
          scales: {
            x: {
              ticks: { color: '#a0aab8' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
              ticks: { color: '#a0aab8' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          }
        }
      });
      (canvas as any).chart = chart;
    } catch (error) {
      console.error('Failed to initialize regional demand chart:', error);
    }
  }, []);

  // Effect to initialize when Chart.js is loaded
  useEffect(() => {
    console.log('🎨 CoverageTab useEffect - isChartReady:', isChartReady, 'containerRef:', !!containerRef.current, 'initRef:', initRef.current, 'Chart available:', typeof (window as any).Chart);
    
    if (!isChartReady || !containerRef.current || initRef.current) return;

    // Use requestAnimationFrame + setTimeout to ensure DOM is fully ready (matching business page pattern)
    requestAnimationFrame(() => {
      setTimeout(() => {
        console.log('⏰ CoverageTab timer fired - attempting to initialize charts');
        if (initRef.current) return;
        initRef.current = true;
        initializeCoverageChart();
        initializeRegionalDemandChart();
      }, 100);
    });
  }, [isChartReady, initializeCoverageChart, initializeRegionalDemandChart]);

  return (
    <div ref={containerRef} className="coverage-tab-container">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#f0f4f8' }}>📊 Análise de Cobertura 5G</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <KPICard title="Municípios" value="900" change="+50%" />
        <KPICard title="População Coberta" value="67M" change="+22%" />
        <KPICard title="Investimento" value="R$ 1.87B" change="+70%" />
      </div>

      {isChartReady ? (
        <>
          <div className="chart-container" style={{ height: '400px', marginBottom: '2rem', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', padding: '1rem' }}>
            <canvas id="coverageChart" />
          </div>

          <h3 className="text-xl font-bold mt-8 mb-4" style={{ color: '#f0f4f8' }}>🗺️ Demanda Regional</h3>
          <div className="chart-container" style={{ height: '350px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', padding: '1rem' }}>
            <canvas id="regionalDemandChart" />
          </div>
        </>
      ) : (
        <div className="chart-placeholder" style={{ height: '400px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-pulse" style={{ color: '#a0aab8' }}>Carregando visualização...</div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div style={{ background: 'rgba(15, 36, 56, 0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ color: '#a0aab8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0f4f8', marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ color: '#10b981', fontSize: '0.875rem' }}>{change}</div>
    </div>
  );
}



















