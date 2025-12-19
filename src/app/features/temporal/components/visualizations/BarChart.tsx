/**
 * Reusable Bar Chart Component
 * For comparisons and distributions
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
  title?: string;
  yAxisLabel?: string;
  horizontal?: boolean;
  height?: number;
}

export function BarChart({ 
  labels, 
  datasets, 
  title, 
  yAxisLabel, 
  horizontal = false,
  height = 300 
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;
    
    const Chart = (window as any).Chart;
    if (!Chart) return;
    
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          ...ds,
          borderWidth: ds.borderWidth ?? 1
        }))
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
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
            beginAtZero: true,
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
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, datasets, title, yAxisLabel, horizontal]);
  
  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}


