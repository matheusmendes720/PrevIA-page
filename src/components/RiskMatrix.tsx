'use client';

import React, { useState, useEffect } from 'react';

interface RiskDataPoint {
  id: string;
  name: string;
  impact: number; // 1-5
  probability: number; // 1-5
  category: 'supply' | 'demand' | 'external' | 'operational';
}

export default function RiskMatrix() {
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([
    { id: '1', name: 'Ruptura de Estoque', impact: 5, probability: 4, category: 'supply' },
    { id: '2', name: 'Atraso de Fornecedor', impact: 4, probability: 3, category: 'supply' },
    { id: '3', name: 'Pico de Demanda', impact: 3, probability: 4, category: 'demand' },
    { id: '4', name: 'Mudança Climática', impact: 2, probability: 2, category: 'external' },
    { id: '5', name: 'Falha de Equipamento', impact: 3, probability: 2, category: 'operational' },
  ]);

  const getRiskColor = (impact: number, probability: number): string => {
    const riskScore = impact * probability;
    if (riskScore >= 15) return 'bg-red-500/80';
    if (riskScore >= 10) return 'bg-yellow-500/80';
    if (riskScore >= 5) return 'bg-orange-500/80';
    return 'bg-green-500/80';
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      supply: 'bg-blue-500/20 text-blue-400',
      demand: 'bg-purple-500/20 text-purple-400',
      external: 'bg-yellow-500/20 text-yellow-400',
      operational: 'bg-green-500/20 text-green-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="glass-card rounded-xl p-5 animate-subtle-glow h-full risk-matrix-container">
      <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Matriz de Risco</h3>

      {/* Risk Matrix Grid */}
      <div className="relative w-full aspect-square max-h-[350px] mb-4">
        {/* Grid Background */}
        <svg className="w-full h-full" viewBox="0 0 300 300">
          {/* Background Zones */}
          <rect x="150" y="0" width="150" height="150" className="fill-red-500/20" />
          <rect x="0" y="0" width="150" height="150" className="fill-yellow-500/20" />
          <rect x="150" y="150" width="150" height="150" className="fill-orange-500/20" />
          <rect x="0" y="150" width="150" height="150" className="fill-green-500/20" />

          {/* Grid Lines */}
          <line x1="0" y1="150" x2="300" y2="150" className="stroke-brand-cyan/30 stroke-1" />
          <line x1="150" y1="0" x2="150" y2="300" className="stroke-brand-cyan/30 stroke-1" />

          {/* Axis Labels */}
          <text x="150" y="290" textAnchor="middle" className="fill-brand-slate text-xs">Impacto →</text>
          <text x="10" y="150" textAnchor="middle" transform="rotate(-90, 10, 150)" className="fill-brand-slate text-xs">Probabilidade →</text>

          {/* Risk Points */}
          {riskData.map((point) => {
            const x = (point.impact / 5) * 300;
            const y = 300 - (point.probability / 5) * 300;
            return (
              <g key={point.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  className={getRiskColor(point.impact, point.probability)}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold"
                >
                  {point.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Risk Legend */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/80"></div>
          <span className="text-xs text-brand-slate">Alto (15-25)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/80"></div>
          <span className="text-xs text-brand-slate">Médio-Alto (10-14)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/80"></div>
          <span className="text-xs text-brand-slate">Médio-Baixo (5-9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/80"></div>
          <span className="text-xs text-brand-slate">Baixo (1-4)</span>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-2 max-h-[150px] overflow-y-auto">
        {riskData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded bg-brand-light-navy/40 hover:bg-brand-light-navy/60 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <span className="text-sm text-brand-lightest-slate truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-brand-slate">I: {item.impact}</div>
                <div className="text-xs text-brand-slate">P: {item.probability}</div>
              </div>
              <div className={`w-3 h-3 rounded ${getRiskColor(item.impact, item.probability)}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
