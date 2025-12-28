/**
 * Temporal Features Page - Simple Seasonal Patterns Focus
 * Built from zero based on HTML baseline
 * Only 6 core widgets: Hero Summary, Event Timeline, Seasonality Heatmap,
 * Cyclical Encoding, Forecast Comparison, Action Playbook
 */

'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { mockPayload } from './data/mockData';
import HeroSummary from '@/components/legacy/HeroSummary';
import EventTimeline from '@/components/legacy/EventTimeline';
import SeasonalityHeatmap from '@/components/legacy/SeasonalityHeatmap';
import CyclicalExplainer from '@/components/legacy/CyclicalExplainer';
import ForecastComparison from '@/components/legacy/ForecastComparison';
import ActionPlaybook from '@/components/legacy/ActionPlaybook';
export default function TemporalPage() {
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState('2025-10-19');
  const [dateTo, setDateTo] = useState('2025-11-18');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'seasonal'>('all');

  // Check for Chart.js
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).Chart !== 'undefined') {
      setIsChartLoaded(true);
    }
  }, []);

  // Get next event for Hero Summary - adapt TemporalEvent to CalendarEvent format
  const nextEvent = mockPayload.summary.nextEvent ? {
    ...mockPayload.summary.nextEvent,
    name: mockPayload.summary.nextEvent.label,
    type: 'holiday' as const,
    leadTimeImpact: 0,
    demandImpact: mockPayload.summary.nextEvent.demandDelta,
    duration: {
      start: mockPayload.summary.nextEvent.date,
      end: mockPayload.summary.nextEvent.date,
      durationDays: 1
    },
    historicalData: {
      occurrences: 1,
      avgImpact: mockPayload.summary.nextEvent.demandDelta,
      consistency: 0.85
    }
  } : null;
  
  const impactScore = `${mockPayload.summary.nextEvent.demandDelta > 0 ? '+' : ''}${mockPayload.summary.nextEvent.demandDelta}%`;
  const confidence = mockPayload.summary.confidence;
  const riskLevel = mockPayload.summary.riskLevel;

  // Filter events based on active filter and adapt to CalendarEvent format
  const filteredEvents = mockPayload.events
    .filter(event => {
      if (activeFilter === 'high') {
        return Math.abs(event.demandDelta) > 30;
      }
      if (activeFilter === 'seasonal') {
        return event.label.includes('Chuvosa') || event.label.includes('Carnaval');
      }
      return true;
    })
    .map(event => ({
      ...event,
      name: event.label,
      type: event.label.includes('Chuvosa')
        ? ('season' as const)
        : event.label.includes('Manutenção')
          ? ('maintenance' as const)
          : ('holiday' as const),
      leadTimeImpact: 0,
      demandImpact: event.demandDelta,
      duration: event.duration ?? {
        start: event.date,
        end: event.date,
        durationDays: 1
      },
      historicalData: {
        occurrences: 1,
        avgImpact: event.demandDelta,
        consistency: 0.85
      }
    }));

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsChartLoaded(true)}
        onError={() => console.error('Failed to load Chart.js')}
      />
      
      <div className="temporal-page-container">
        {/* Header */}
        <div className="header">
          <h1>📊 Features Temporais</h1>
          <p>Visualização de features de machine learning para previsão de demanda</p>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="date-range">
            <label>De:</label>
            <input
              type="date"
              id="dateFrom"
              className="date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <label>Até:</label>
            <input
              type="date"
              id="dateTo"
              className="date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="filter-toggle">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${activeFilter === 'high' ? 'active' : ''}`}
              onClick={() => setActiveFilter('high')}
            >
              Alto Impacto
            </button>
            <button
              className={`filter-btn ${activeFilter === 'seasonal' ? 'active' : ''}`}
              onClick={() => setActiveFilter('seasonal')}
            >
              Sazonalidade
            </button>
          </div>
        </div>

        {/* Hero Summary */}
        <HeroSummary
          nextEvent={nextEvent}
          impactScore={impactScore}
          confidence={confidence}
          riskLevel={riskLevel}
        />

        {/* Event Timeline */}
        <EventTimeline events={filteredEvents} />

        {/* Seasonality & Cyclical Encoding (2-column grid) */}
        <div className="grid-2">
          <SeasonalityHeatmap
            data={mockPayload.seasonalityMatrix}
            onCellClick={(month, day) => {
              console.log(`Clicked: ${month}, ${day}`);
            }}
          />
          <CyclicalExplainer />
        </div>

        {/* Forecast Comparison */}
        <ForecastComparison forecastSlices={mockPayload.forecastSlices} />

        {/* Action Playbook */}
        <ActionPlaybook events={filteredEvents} />
      </div>

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
          --space-8: 8px;
          --space-12: 12px;
          --space-16: 16px;
          --space-24: 24px;
          --space-32: 32px;
          --radius-base: 8px;
          --radius-lg: 12px;
        }

        .temporal-page-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: var(--space-32) var(--space-32) var(--space-24);
        }

        .header {
          margin-bottom: var(--space-32);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-24);
        }

        .header h1 {
          margin: 0 0 var(--space-8) 0;
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text);
        }

        .header p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .controls-bar {
          display: flex;
          gap: var(--space-16);
          margin-bottom: var(--space-24);
          align-items: center;
          flex-wrap: wrap;
        }

        .date-range {
          display: flex;
          gap: var(--space-12);
          align-items: center;
        }

        .date-range label {
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .date-input {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-base);
          font-size: 13px;
        }

        .filter-toggle {
          display: flex;
          gap: var(--space-8);
          margin-left: auto;
        }

        .filter-btn {
          padding: var(--space-8) var(--space-16);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: var(--radius-base);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: var(--color-surface-alt);
          border-color: var(--color-primary);
        }

        .filter-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-24);
          margin-bottom: var(--space-24);
        }

        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .controls-bar {
            flex-direction: column;
          }
          .filter-toggle {
            margin-left: 0;
            width: 100%;
          }
          .filter-btn {
            flex: 1;
          }
        }
      `}</style>
    </>
  );
}
