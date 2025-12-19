'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SupplyChainTabProps {
  isChartReady: boolean;
}

export default function SupplyChainTab({ isChartReady }: SupplyChainTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Initialize charts when Chart.js is ready
  const initializeCharts = useCallback(() => {
    if (!isChartReady || initRef.current) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    // Initialize supply chain chart
    const supplyChainCanvas = document.getElementById('supplyChainChart') as HTMLCanvasElement;
    if (supplyChainCanvas) {
      const ctx = supplyChainCanvas.getContext('2d');
      if (ctx) {
        const existingChart = (supplyChainCanvas as any).chart;
        if (existingChart) existingChart.destroy();

        try {
          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
              datasets: [{
                label: 'Margem (%)',
                data: [22, 23, 24, 24.5, 24.3, 24.5],
                backgroundColor: 'rgba(32, 160, 132, 0.7)',
                borderColor: '#20A084',
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: '#a0aab8' } },
                tooltip: {
                  backgroundColor: 'rgba(15, 36, 56, 0.98)',
                  titleColor: '#f0f4f8',
                  bodyColor: '#cbd5e1',
                  borderColor: '#20A084',
                  borderWidth: 2
                }
              },
              scales: {
                x: { ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
              }
            }
          });
          (supplyChainCanvas as any).chart = chart;
        } catch (error) {
          console.error('Failed to initialize supply chain chart:', error);
        }
      }
    }

    setIsInitialized(true);
    initRef.current = true;
  }, [isChartReady]);

  useEffect(() => {
    if (!isChartReady) {
      console.log('⏳ SupplyChainTab waiting for Chart.js...');
      return;
    }
    console.log('🎨 SupplyChainTab initializing charts');
    // Use requestAnimationFrame + setTimeout to ensure DOM is fully ready
    requestAnimationFrame(() => {
      setTimeout(initializeCharts, 100);
    });
  }, [isChartReady, initializeCharts]);

  return (
    <div ref={containerRef} className="supply-chain-tab-container">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#f0f4f8' }}>🔗 Supply Chain & Margem</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(15, 36, 56, 0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#a0aab8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Margem Média</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>24.5%</div>
          <div style={{ color: '#a0aab8', fontSize: '0.75rem' }}>vs. Meta: 22%</div>
        </div>
        <div style={{ background: 'rgba(15, 36, 56, 0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#a0aab8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Custo Médio</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#20A084' }}>R$ 1.2M</div>
          <div style={{ color: '#a0aab8', fontSize: '0.75rem' }}>por projeto</div>
        </div>
        <div style={{ background: 'rgba(15, 36, 56, 0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#a0aab8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Lead Time</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>18 dias</div>
          <div style={{ color: '#a0aab8', fontSize: '0.75rem' }}>Tempo médio de entrega</div>
        </div>
      </div>

      {isChartReady ? (
        <div className="chart-container" style={{ height: '400px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', padding: '1rem' }}>
          <canvas id="supplyChainChart" />
        </div>
      ) : (
        <div className="chart-placeholder" style={{ height: '400px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-pulse" style={{ color: '#a0aab8' }}>Carregando visualização...</div>
        </div>
      )}
    </div>
  );
}



















