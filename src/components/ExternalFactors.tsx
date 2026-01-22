'use client';

import React, { useState, useEffect } from 'react';

interface ExternalFactor {
  id: string;
  name: string;
  category: 'economic' | 'climatic' | 'market' | 'operational';
  impact: 'positive' | 'neutral' | 'negative';
  magnitude: number; // 1-10
  description: string;
  trend: 'up' | 'stable' | 'down';
}

export default function ExternalFactors() {
  const [factors, setFactors] = useState<ExternalFactor[]>([
    {
      id: '1',
      name: 'Expansão 5G Nacional',
      category: 'market',
      impact: 'positive',
      magnitude: 8,
      description: 'Aumento de demanda por equipamentos 5G em 40%',
      trend: 'up',
    },
    {
      id: '2',
      name: 'Inflação de Insumos',
      category: 'economic',
      impact: 'negative',
      magnitude: 6,
      description: 'Aumento de 15% no custo de componentes eletrônicos',
      trend: 'up',
    },
    {
      id: '3',
      name: 'El Niño 2024-25',
      category: 'climatic',
      impact: 'negative',
      magnitude: 5,
      description: 'Risco de interrupções em regiões costeiras',
      trend: 'stable',
    },
    {
      id: '4',
      name: 'Dólar USD/BRL',
      category: 'economic',
      impact: 'neutral',
      magnitude: 4,
      description: 'Volatilidade cambial impactando importações',
      trend: 'stable',
    },
  ]);

  const getImpactColor = (impact: string): string => {
    const colors = {
      positive: 'bg-green-500/20 text-green-400 border-green-500/30',
      neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      negative: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[impact as keyof typeof colors];
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      economic: '💰',
      climatic: '🌦️',
      market: '📈',
      operational: '⚙️',
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const getTrendIcon = (trend: string): string => {
    const icons = {
      up: '📈',
      stable: '➡️',
      down: '📉',
    };
    return icons[trend as keyof typeof icons];
  };

  return (
    <div className="glass-card rounded-xl p-5 animate-subtle-glow h-full">
      <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Fatores Externos</h3>

      {/* Factors List */}
      <div className="space-y-2">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className="p-3 bg-brand-light-navy/40 rounded-lg border border-brand-light-navy/50 hover:bg-brand-light-navy/60 transition-all"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{getCategoryIcon(factor.category)}</span>
                <h4 className="font-semibold text-brand-lightest-slate text-sm truncate">
                  {factor.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{getTrendIcon(factor.trend)}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded border ${getImpactColor(factor.impact)}`}
                >
                  {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '-' : ''}
                  {factor.magnitude}
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-slate mb-2">{factor.description}</p>

            {/* Magnitude Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-slate w-12">Impacto</span>
              <div className="flex-1 bg-brand-navy/50 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${
                    factor.impact === 'positive' ? 'bg-green-400' :
                    factor.impact === 'negative' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${(factor.magnitude / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-green-400 font-bold">{factors.filter(f => f.impact === 'positive').length}</div>
          <div className="text-brand-slate">Positivos</div>
        </div>
        <div className="p-2 bg-gray-500/10 rounded border border-gray-500/20">
          <div className="text-gray-400 font-bold">{factors.filter(f => f.impact === 'neutral').length}</div>
          <div className="text-brand-slate">Neutros</div>
        </div>
        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
          <div className="text-red-400 font-bold">{factors.filter(f => f.impact === 'negative').length}</div>
          <div className="text-brand-slate">Negativos</div>
        </div>
      </div>
    </div>
  );
}
