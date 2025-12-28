/**
 * Seasonality Heatmap - Legacy Beautiful Design
 * 12×7 grid (Month × Day-of-Week) showing demand intensity
 */

'use client';

import React, { useState } from 'react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface SeasonalityHeatmapProps {
  data: number[][]; // 12 months × 7 days, normalized 0-1
  onCellClick?: (month: number, day: number) => void;
}

const NARRATIVES: Record<string, { interpretation: string; recommendation: string }> = {
  'high-weekday': {
    interpretation: 'Alta demanda em dias úteis indica operações ativas',
    recommendation: 'Manter estoque reforçado Mon-Fri'
  },
  'low-weekend': {
    interpretation: 'Demanda reduzida no fim de semana',
    recommendation: 'Planejar manutenção preventiva para Sáb/Dom'
  },
  'december-peak': {
    interpretation: 'Dezembro tem pico de demanda pré-feriado',
    recommendation: 'Aumentar estoque 30% a partir de Nov'
  },
  'february-drop': {
    interpretation: 'Carnaval reduz atividades em -30%',
    recommendation: 'Preparar para recuperação pós-Carnaval'
  },
  'november-rainy': {
    interpretation: 'Estação chuvosa aumenta demanda por manutenção',
    recommendation: 'Aumentar itens de corrosão 40%'
  }
};

export default function SeasonalityHeatmap({ data, onCellClick }: SeasonalityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ month: number; day: number } | null>(null);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const hexToRgb = (hex: string) => {
    const v = hex.replace('#', '');
    return {
      r: parseInt(v.substring(0, 2), 16),
      g: parseInt(v.substring(2, 4), 16),
      b: parseInt(v.substring(4, 6), 16)
    };
  };
  const mixColors = (c1: string, c2: string, t: number) => {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const r = Math.round(lerp(a.r, b.r, t));
    const g = Math.round(lerp(a.g, b.g, t));
    const bch = Math.round(lerp(a.b, b.b, t));
    return `rgb(${r}, ${g}, ${bch})`;
  };
  const getColor = (value: number) => {
    // Warm palette: low=amber, mid=orange, high=red
    const stops = ['#fbc02d', '#f57c00', '#d32f2f'];
    const v = Math.max(0, Math.min(1, value));
    if (v <= 0.5) {
      const t = v / 0.5;
      return mixColors(stops[0], stops[1], t);
    }
    const t = (v - 0.5) / 0.5;
    return mixColors(stops[1], stops[2], t);
  };

  const getNarrative = (month: number, day: number, value: number) => {
    if (value > 0.8 && day < 5) return NARRATIVES['high-weekday'];
    if (value < 0.4 && day >= 5) return NARRATIVES['low-weekend'];
    if (month === 11) return NARRATIVES['december-peak'];
    if (month === 1) return NARRATIVES['february-drop'];
    if (month === 10) return NARRATIVES['november-rainy'];
    return { 
      interpretation: 'Demanda dentro da média', 
      recommendation: 'Manter níveis atuais' 
    };
  };

  return (
    <div className="seasonality-heatmap">
      <div className="heatmap-header">
        <div className="corner-cell"></div>
        {DAYS.map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}
      </div>
      
      <div className="heatmap-grid">
        {data.map((row, monthIdx) => (
          <div key={monthIdx} className="heatmap-row">
            <div className="month-label">{MONTHS[monthIdx]}</div>
            {row.map((value, dayIdx) => {
              const narrative = getNarrative(monthIdx, dayIdx, value);
              const isHovered = hoveredCell?.month === monthIdx && hoveredCell?.day === dayIdx;
              
              return (
                <div
                  key={dayIdx}
                  className="heatmap-cell"
                  style={{ backgroundColor: getColor(value) }}
                  onMouseEnter={() => setHoveredCell({ month: monthIdx, day: dayIdx })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => onCellClick?.(monthIdx, dayIdx)}
                >
                  <span className="cell-value">{Math.round(value * 100)}</span>
                  {isHovered && (
                    <div className="tooltip">
                      <div className="tooltip-header">
                        <div className="tooltip-title">
                          {MONTHS[monthIdx]} · {DAYS[dayIdx]}
                        </div>
                        <div className="tooltip-value">
                          {(value * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="tooltip-body">
                        <div className="tooltip-col">
                          <div className="tooltip-interpretation">
                            {narrative.interpretation}
                          </div>
                        </div>
                        <div className="tooltip-col actions">
                          <div className="tooltip-recommendation">
                            ⚡ {narrative.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style jsx>{`
        .seasonality-heatmap {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--color-border);
        }
        .heatmap-header {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .corner-cell {
          /* Empty corner */
        }
        .day-label {
          text-align: center;
          font-size: 13px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        .heatmap-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .heatmap-row {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          gap: 8px;
        }
        .month-label {
          font-size: 13px;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0b1a24;
          font-weight: 700;
        }
        .heatmap-cell:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(255, 160, 0, 0.45), 0 0 12px rgba(255, 255, 255, 0.1);
          z-index: 10;
        }
        .cell-value {
          font-size: 12px;
        }
        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 36, 56, 0.85);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 12px;
          min-width: 220px;
          z-index: 100;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35), 0 0 18px rgba(255, 160, 0, 0.35);
          margin-bottom: 8px;
          backdrop-filter: blur(12px);
        }
        .tooltip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .tooltip-title {
          font-weight: 700;
          color: var(--color-primary);
          font-size: 13px;
        }
        .tooltip-value {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-primary);
        }
        .tooltip-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tooltip-col {
          font-size: 11px;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .tooltip-col.actions {
          color: var(--color-warning);
          font-weight: 600;
        }
        .tooltip-recommendation {
          font-size: 11px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

