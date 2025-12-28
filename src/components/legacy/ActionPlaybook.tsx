/**
 * Action Playbook - Legacy Beautiful Design
 * Shows upcoming events (sorted by date) with procurement/operations/finance actions
 */

'use client';

import React from 'react';
import type { CalendarEvent } from '@/app/features/temporal/types/temporal.types';

interface ActionPlaybookProps {
  events: CalendarEvent[];
  onActionClick?: (event: CalendarEvent, action: string) => void;
}

export default function ActionPlaybook({ events, onActionClick }: ActionPlaybookProps) {
  // Sort by date and take the first 6 upcoming events (no horizon filter)
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  const daysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d atrás`;
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    return `em ${diff}d`;
  };

  const getRisk = (impact: number) => {
    const abs = Math.abs(impact);
    if (abs >= 60) return { label: 'Risco SLA: ALTO', color: 'var(--color-error)' };
    if (abs >= 30) return { label: 'Risco SLA: MÉDIO', color: 'var(--color-warning)' };
    return { label: 'Risco SLA: BAIXO', color: 'var(--color-success)' };
  };

  const seasonalPlaybook = [
    {
      title: 'Pico Q4 (Nov-Dez)',
      impact: '+40% demanda',
      actions: [
        'Reforçar estoque crítico em 35-50%',
        'Garantir contratos express com fornecedores',
        'Ajustar turnos de operação para picos noturnos'
      ]
    },
    {
      title: 'Carnaval (Fev) – Queda',
      impact: '-30% atividades',
      actions: [
        'Planejar manutenção preventiva durante o feriado',
        'Reduzir expedições e fretes premium',
        'Preparar retomada: pedidos antecipados para pós-feriado'
      ]
    },
    {
      title: 'Estação Chuvosa (Nov-Abr)',
      impact: '+35% manutenção',
      actions: [
        'Aumentar itens anticorrosão em 30-40%',
        'Priorizar SLAs em regiões críticas (N/NE)',
        'Provisionar equipes de campo e logística 24/7'
      ]
    },
    {
      title: 'Janela de Manutenção (Mar)',
      impact: '-12% operação',
      actions: [
        'Concentrar upgrades e inspeções',
        'Agendar paradas com comunicação prévia',
        'Garantir peças críticas em estoque local'
      ]
    },
    {
      title: 'Choque Cambial (Mai)',
      impact: '-18% demanda',
      actions: [
        'Priorizar fornecedores nacionais',
        'Hedge cambial tático (3-6 meses)',
        'Rever precificação e contratos indexados'
      ]
    },
    {
      title: 'Leilão 5G (Jun)',
      impact: '+90% equipamentos',
      actions: [
        'Reservar capacidade com top fornecedores',
        'Aumentar estoque de MATERIAL_ELETRICO',
        'Negociar frete expresso e slots de produção'
      ]
    },
    {
      title: 'Greve Logística (Set)',
      impact: '-28% entregas',
      actions: [
        'Ativar rotas alternativas e hubs regionais',
        'Priorização de itens críticos por região',
        'Contratos de contingência com transportadoras'
      ]
    }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getImpactColor = (impact: number) => {
    if (impact > 30) return 'var(--color-error)';
    if (impact > 15) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div className="action-playbook">
      <div className="playbook-header">
        <span className="playbook-icon">✅</span>
        <div>
          <h3>Playbook de Ações</h3>
          <p>Recomendações operacionais para próximos eventos</p>
        </div>
      </div>
      
      {upcomingEvents.length === 0 ? (
        <div className="no-events">
          <p>Nenhum evento disponível</p>
        </div>
      ) : (
        <div className="action-cards">
          {upcomingEvents.map(event => (
            <div key={event.id} className="action-card">
              <div className="action-card-date">{formatDate(event.date)} · {daysUntil(event.date)}</div>
              <div className="action-card-event">{event.name}</div>

              <div className="chip-row">
                <div 
                  className="chip impact"
                  style={{ 
                    color: getImpactColor(Math.abs(event.demandImpact)),
                    borderColor: getImpactColor(Math.abs(event.demandImpact))
                  }}
                >
                  Impacto {event.demandImpact > 0 ? '+' : ''}{event.demandImpact}%
                </div>
                <div 
                  className="chip risk"
                  style={{ 
                    color: getRisk(event.demandImpact).color,
                    borderColor: getRisk(event.demandImpact).color
                  }}
                >
                  {getRisk(event.demandImpact).label}
                </div>
              </div>

              <p className="narrative">{event.narrative}</p>

              <ul className="action-list">
                {event.recommendedActions.map((action, i) => (
                  <li 
                    key={i}
                    onClick={() => onActionClick?.(event, action)}
                  >
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="seasonal-section">
        <div className="seasonal-header">
          <span className="seasonal-icon">🌦️</span>
          <div>
            <h4>Playbook Sazonal</h4>
            <p>Três padrões críticos para planejamento</p>
          </div>
        </div>
        <div className="seasonal-cards">
          {seasonalPlaybook.map(card => (
            <div key={card.title} className="seasonal-card">
              <div className="seasonal-title">{card.title}</div>
              <div className="seasonal-impact">{card.impact}</div>
              <ul className="seasonal-actions">
                {card.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .action-playbook {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--color-border);
        }
        .playbook-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .playbook-icon {
          font-size: 24px;
        }
        .playbook-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
        }
        .playbook-header p {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        .no-events {
          text-align: center;
          padding: 40px;
          color: var(--color-text-secondary);
        }
        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        .action-card {
          background: linear-gradient(135deg, var(--color-surface-alt), var(--color-surface));
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          border-color: var(--color-primary);
        }
        .action-card-date {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .action-card-event {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border: 1px solid;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.04);
        }
        .chip.impact::before {
          content: '⚡';
        }
        .chip.risk::before {
          content: '🛡️';
        }
        .narrative {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        .action-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .action-list li {
          padding-left: 16px;
          position: relative;
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }
        .action-list li:hover {
          color: var(--color-primary);
        }
        .action-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--color-success);
        }
        .seasonal-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
        }
        .seasonal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .seasonal-icon {
          font-size: 18px;
        }
        .seasonal-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text);
        }
        .seasonal-header p {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        .seasonal-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }
        .seasonal-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04));
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 12px;
        }
        .seasonal-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--color-text);
          margin-bottom: 6px;
        }
        .seasonal-impact {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-warning);
          margin-bottom: 8px;
        }
        .seasonal-actions {
          margin: 0;
          padding-left: 16px;
          color: var(--color-text-secondary);
          font-size: 12px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

