'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { stockManagement } from '../data';

interface InventoryTabProps {
  isChartReady: boolean;
}

export default function InventoryTab({ isChartReady }: InventoryTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Initialize charts when Chart.js is ready
  const initializeCharts = useCallback(() => {
    if (!isChartReady || initRef.current) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    // Initialize stock level chart
    const stockCanvas = document.getElementById('stockLevelChart') as HTMLCanvasElement;
    if (stockCanvas) {
      const ctx = stockCanvas.getContext('2d');
      if (ctx) {
        const existingChart = (stockCanvas as any).chart;
        if (existingChart) existingChart.destroy();

        try {
          const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: stockManagement.criticalItems.map(item => item.item),
              datasets: [{
                data: stockManagement.criticalItems.map(item => item.percentage),
                backgroundColor: stockManagement.criticalItems.map(item =>
                  item.status === 'critical' ? 'rgba(239, 68, 68, 0.7)' :
                  item.status === 'warning' ? 'rgba(249, 115, 22, 0.7)' :
                  'rgba(16, 185, 129, 0.7)'
                ),
                borderColor: stockManagement.criticalItems.map(item =>
                  item.status === 'critical' ? '#ef4444' :
                  item.status === 'warning' ? '#f97316' :
                  '#10b981'
                ),
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: '#a0aab8' }, position: 'right' },
                tooltip: {
                  backgroundColor: 'rgba(15, 36, 56, 0.98)',
                  titleColor: '#f0f4f8',
                  bodyColor: '#cbd5e1',
                  borderColor: '#20A084',
                  borderWidth: 2
                }
              }
            }
          });
          (stockCanvas as any).chart = chart;
        } catch (error) {
          console.error('Failed to initialize stock chart:', error);
        }
      }
    }

    setIsInitialized(true);
    initRef.current = true;
  }, [isChartReady]);

  useEffect(() => {
    if (!isChartReady) {
      console.log('⏳ InventoryTab waiting for Chart.js...');
      return;
    }
    console.log('🎨 InventoryTab initializing charts');
    // Use requestAnimationFrame + setTimeout to ensure DOM is fully ready
    requestAnimationFrame(() => {
      setTimeout(initializeCharts, 100);
    });
  }, [isChartReady, initializeCharts]);

  return (
    <div ref={containerRef} className="inventory-tab-container">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#f0f4f8' }}>📦 Gestão de Estoque</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stockManagement.criticalItems.map((item, idx) => (
          <div key={idx} style={{
            background: item.status === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                       item.status === 'warning' ? 'rgba(249, 115, 22, 0.1)' :
                       'rgba(15, 36, 56, 0.5)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: `2px solid ${item.status === 'critical' ? 'rgba(239, 68, 68, 0.4)' : item.status === 'warning' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255,255,255,0.1)'}`
          }}>
            <div style={{ color: '#a0aab8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item.item}</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: item.status === 'critical' ? '#ef4444' : item.status === 'warning' ? '#f97316' : '#10b981',
              marginBottom: '0.5rem'
            }}>{item.percentage}%</div>
            <div style={{ color: '#a0aab8', fontSize: '0.75rem' }}>
              Estoque: {typeof item.current === 'number' && item.current < 10 ? `${item.current} km` : `${item.current}/${item.ideal} unidades`}
            </div>
          </div>
        ))}
      </div>

      {isChartReady ? (
        <div className="chart-container" style={{ height: '400px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', padding: '1rem' }}>
          <canvas id="stockLevelChart" />
        </div>
      ) : (
        <div className="chart-placeholder" style={{ height: '400px', background: 'rgba(15, 36, 56, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-pulse" style={{ color: '#a0aab8' }}>Carregando visualização...</div>
        </div>
      )}
    </div>
  );
}


















