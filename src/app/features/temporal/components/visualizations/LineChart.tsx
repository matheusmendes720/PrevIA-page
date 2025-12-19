/**
 * Reusable Line Chart Component
 * For time series, trends, and forecasts
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    borderWidth?: number;
    borderDash?: number[];
    fill?: boolean;
    tension?: number;
  }[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
}

export function LineChart({ labels, datasets, title, yAxisLabel, height = 300 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;
    
    const Chart = (window as any).Chart;
    if (!Chart) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          ...ds,
          tension: ds.tension ?? 0.4,
          pointRadius: labels.length > 100 ? 0 : 2,
          pointHoverRadius: 4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            color: '#e0e8f0',
            font: { size: 14, weight: '600' }
          },
          legend: {
            labels: {
              color: '#a0aab8',
              font: { size: 12 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 36, 56, 0.95)',
            titleColor: '#20A084',
            bodyColor: '#e0e8f0',
            borderColor: '#20A084',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel,
              color: '#a0aab8'
            },
            ticks: { color: '#a0aab8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: {
              color: '#a0aab8',
              maxTicksLimit: 12
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, datasets, title, yAxisLabel]);
  
  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}


