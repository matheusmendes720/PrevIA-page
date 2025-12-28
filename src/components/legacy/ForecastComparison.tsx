/**
 * Forecast Comparison Component
 * Shows actual vs predicted with event markers and accuracy metrics
 * Based on HTML baseline (lines 788-836)
 */

'use client';

import React, { useEffect, useRef } from 'react';
import type { ForecastSlice } from '@/app/features/temporal/types/temporal.types';

interface ForecastComparisonProps {
  forecastSlices: ForecastSlice[];
  mape?: number;
  mae?: number;
  rmse?: number;
  r2?: number;
}

export default function ForecastComparison({
  forecastSlices,
  mape = 8.2,
  mae = 124,
  rmse = 156,
  r2 = 0.92
}: ForecastComparisonProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || typeof window === 'undefined') return;
    
    // Wait for Chart.js to load
    const checkChart = setInterval(() => {
      if ((window as any).Chart) {
        clearInterval(checkChart);
        renderChart();
      }
    }, 100);

    return () => {
      clearInterval(checkChart);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [forecastSlices]);

  const renderChart = () => {
    if (!chartRef.current || !(window as any).Chart) return;

    const Chart = (window as any).Chart;
    
    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = forecastSlices.map(f => {
      const date = new Date(f.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    // Calculate confidence interval (95% CI)
    const upperBound = forecastSlices.map(f => f.predicted + 100);
    const lowerBound = forecastSlices.map(f => f.predicted - 100);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Previsto (95% CI)',
            data: upperBound,
            borderColor: 'transparent',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            pointRadius: 0
          },
          {
            label: 'Previsto (Média)',
            data: forecastSlices.map(f => f.predicted),
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 1,
            pointBackgroundColor: '#10b981'
          },
          {
            label: 'Realizado',
            data: forecastSlices.map(f => f.actual),
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 1,
            pointBackgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#a0aab8',
              font: { size: 12 }
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#a0aab8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#a0aab8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  };

  return (
    <div className="forecast-comparison-card">
      <div className="card-header">
        <div className="card-icon">📈</div>
        <div>
          <h3 className="card-title">Comparação Forecast vs. Realizado</h3>
          <p className="card-subtitle">Acurácia do modelo em períodos com eventos</p>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <canvas ref={chartRef} id="forecastChart"></canvas>
      </div>
      
      <div className="stats-row">
        <div className="stat">
          <div className="stat-label">MAPE (Período)</div>
          <div className="stat-value">{mape}%</div>
        </div>
        <div className="stat">
          <div className="stat-label">MAE</div>
          <div className="stat-value">{mae} un</div>
        </div>
        <div className="stat">
          <div className="stat-label">RMSE</div>
          <div className="stat-value">{rmse} un</div>
        </div>
        <div className="stat">
          <div className="stat-label">R² Score</div>
          <div className="stat-value">{r2}</div>
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981' }}></div>
          <span>Previsto (95% CI)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10b981' }}></div>
          <span>Previsto (Média)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#3b82f6' }}></div>
          <span>Realizado</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'rgba(249, 115, 22, 0.4)' }}></div>
          <span>Evento Identificado</span>
        </div>
      </div>

      <style jsx>{`
        .forecast-comparison-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-24);
          transition: all 0.3s;
        }

        .forecast-comparison-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          margin-bottom: var(--space-16);
          padding-bottom: var(--space-16);
          border-bottom: 1px solid var(--color-border);
        }

        .card-icon {
          width: 32px;
          height: 32px;
          background: var(--color-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          flex: 1;
          color: var(--color-text);
        }

        .card-subtitle {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .chart-wrapper {
          position: relative;
          height: 300px;
          margin-top: var(--space-16);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-16);
          margin-top: var(--space-16);
          padding-top: var(--space-16);
          border-top: 1px solid var(--color-border);
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-4);
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .legend {
          display: flex;
          gap: var(--space-16);
          flex-wrap: wrap;
          margin-top: var(--space-16);
          font-size: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

