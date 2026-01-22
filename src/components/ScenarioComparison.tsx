'use client';

import React, { useState, useEffect } from 'react';

interface ScenarioData {
  name: string;
  demandMultiplier: number;
  safetyStockMultiplier: number;
  totalCost: number;
  serviceLevel: number;
  stockoutRisk: number;
}

export default function ScenarioComparison() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    {
      name: 'Conservador',
      demandMultiplier: 0.8,
      safetyStockMultiplier: 1.5,
      totalCost: 1450000,
      serviceLevel: 99.5,
      stockoutRisk: 0.5,
    },
    {
      name: 'Baseline',
      demandMultiplier: 1.0,
      safetyStockMultiplier: 1.0,
      totalCost: 1200000,
      serviceLevel: 98.2,
      stockoutRisk: 1.8,
    },
    {
      name: 'Agressivo',
      demandMultiplier: 1.2,
      safetyStockMultiplier: 0.7,
      totalCost: 980000,
      serviceLevel: 94.5,
      stockoutRisk: 5.5,
    },
  ]);
  const [selectedScenario, setSelectedScenario] = useState<string>('baseline');

  const getScenarioColor = (name: string): string => {
    const colors = {
      'Conservador': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Baseline': 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30',
      'Agressivo': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[name as keyof typeof colors] || 'bg-gray-500/20';
  };

  return (
    <div className="glass-card rounded-xl p-5 animate-subtle-glow h-full flex flex-col">
      <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Comparação de Cenários</h3>

      {/* Scenario Cards */}
      <div className="flex-1 space-y-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.name}
            onClick={() => setSelectedScenario(scenario.name)}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedScenario === scenario.name
                ? 'bg-brand-cyan/10 border-brand-cyan/40'
                : 'bg-brand-light-navy/40 border-brand-light-navy/50 hover:bg-brand-light-navy/60'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedScenario === scenario.name
                      ? 'bg-brand-cyan animate-pulse'
                      : 'bg-gray-500'
                  }`}
                ></span>
                <h4 className="font-semibold text-brand-lightest-slate">{scenario.name}</h4>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getScenarioColor(scenario.name)}`}>
                {scenario.demandMultiplier * 100}% demanda
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-brand-navy/30 rounded p-2">
                <div className="text-brand-slate mb-0.5">Custo Total</div>
                <div className="font-semibold text-brand-lightest-slate">
                  R$ {(scenario.totalCost / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-brand-navy/30 rounded p-2">
                <div className="text-brand-slate mb-0.5">Nível de Serviço</div>
                <div className="font-semibold text-brand-lightest-slate">
                  {scenario.serviceLevel}%
                </div>
              </div>
              <div className="bg-brand-navy/30 rounded p-2">
                <div className="text-brand-slate mb-0.5">Estoque Segurança</div>
                <div className="font-semibold text-brand-lightest-slate">
                  {scenario.safetyStockMultiplier}x
                </div>
              </div>
              <div className="bg-brand-navy/30 rounded p-2">
                <div className="text-brand-slate mb-0.5">Risco Ruptura</div>
                <div className={`font-semibold ${
                  scenario.stockoutRisk < 2 ? 'text-green-400' :
                  scenario.stockoutRisk < 5 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {scenario.stockoutRisk}%
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-slate w-20">Custo</span>
                <div className="flex-1 bg-brand-navy/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(scenario.totalCost / 1500000) * 100}%`,
                      backgroundColor: scenario.totalCost < 1100000 ? '#4ade80' :
                                   scenario.totalCost < 1300000 ? '#facc15' : '#f87171'
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-slate w-20">Serviço</span>
                <div className="flex-1 bg-brand-navy/50 rounded-full h-1.5">
                  <div
                    className="bg-brand-cyan h-1.5 rounded-full"
                    style={{ width: `${scenario.serviceLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-3 p-3 bg-brand-light-navy/40 rounded-lg border border-brand-light-navy/50">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <div className="text-sm font-semibold text-brand-lightest-slate mb-1">Recomendação</div>
            <p className="text-xs text-brand-slate">
              O cenário <span className="text-brand-cyan font-semibold">Baseline</span> oferece o melhor equilíbrio entre custo e risco,
              mantendo um nível de serviço de 98.2% com custo de R$ 1.2M.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
