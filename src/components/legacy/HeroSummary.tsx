/**
 * Hero Summary - Legacy Beautiful Design
 * 4 metric badges: Próximo Evento, Impacto, Confiança, Risco
 */

'use client';

import React from 'react';
import type { CalendarEvent } from '@/app/features/temporal/types/temporal.types';

interface HeroSummaryProps {
  nextEvent: CalendarEvent | null;
  impactScore: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function HeroSummary({ nextEvent, impactScore, confidence, riskLevel }: HeroSummaryProps) {
  const riskColors = {
    low: 'var(--color-success)',
    medium: 'var(--color-warning)',
    high: 'var(--color-error)'
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="hero-summary">
      <div className="hero-header">
        <span className="hero-icon">⚡</span>
        <div>
          <h3>Resumo Executivo</h3>
          <p>Próximos 30 dias - Principais drivers temporais</p>
        </div>
      </div>
      
      <div className="hero-grid">
        <div className="metric-badge">
          <div className="metric-label">Próximo Evento</div>
          <div className="metric-value">{nextEvent?.name || 'N/A'}</div>
          <div className="metric-detail">{nextEvent ? formatDate(nextEvent.date) : 'Sem eventos'}</div>
        </div>
        
        <div className="metric-badge">
          <div className="metric-label">Impacto Previsto</div>
          <div className="metric-value">{impactScore}</div>
          <div className="metric-detail">Variação de demanda</div>
        </div>
        
        <div className="metric-badge">
          <div className="metric-label">Confiança</div>
          <div className="metric-value">{(confidence * 100).toFixed(0)}%</div>
          <div className="metric-detail">Acurácia do modelo</div>
        </div>
        
        <div className="metric-badge">
          <div className="metric-label">Nível de Risco</div>
          <div className="metric-value" style={{ color: riskColors[riskLevel] }}>
            {riskLevel.toUpperCase()}
          </div>
          <div className="metric-detail">SLA em risco</div>
        </div>
      </div>

      <style jsx>{`
        .hero-summary {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--color-border);
          margin-bottom: 24px;
        }
        .hero-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .hero-icon {
          font-size: 24px;
        }
        .hero-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
        }
        .hero-header p {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        .hero-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }
        .metric-badge {
          background: linear-gradient(135deg, rgba(32, 160, 132, 0.1), rgba(32, 160, 132, 0.05));
          border: 1px solid var(--color-primary);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .metric-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
        }
        .metric-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        .metric-detail {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}

