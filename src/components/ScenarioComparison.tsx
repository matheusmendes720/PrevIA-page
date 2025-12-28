import React, { useState, useEffect } from 'react';
import Card from './Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { ComprehensivePrescriptive } from '../types/prescriptive';
import { formatCurrency } from '../lib/prescriptiveDataMapper';

const ScenarioComparison: React.FC = () => {
  const [data, setData] = useState<ComprehensivePrescriptive | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const comprehensive = await prescriptiveDataService.loadComprehensivePrescriptive();
        setData(comprehensive);
      } catch (error) {
        console.error('Error loading scenario data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Comparação de Cenários</h3>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-brand-slate">Carregando cenários...</div>
        </div>
      </Card>
    );
  }

  // Extract scenario data for visualization
  const scenarioData = Object.entries(data.business_scenarios).map(([key, scenarios]) => ({
    name: key,
    conservative: scenarios.conservative.expected_cost,
    baseline: scenarios.baseline.expected_cost,
    aggressive: scenarios.aggressive.expected_cost,
  }));

  const chartData = [
    {
      name: 'Conservador',
      value: scenarioData.reduce((sum, s) => sum + s.conservative, 0),
      multiplier: '0.8x demanda, 1.5x estoque',
      color: '#3b82f6',
    },
    {
      name: 'Baseline',
      value: scenarioData.reduce((sum, s) => sum + s.baseline, 0),
      multiplier: '1.0x demanda, 1.0x estoque',
      color: '#64ffda',
    },
    {
      name: 'Agressivo',
      value: scenarioData.reduce((sum, s) => sum + s.aggressive, 0),
      multiplier: '1.2x demanda, 0.7x estoque',
      color: '#f59e0b',
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-brand-navy border border-brand-cyan/40 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-brand-lightest-slate mb-2">{data.name}</p>
          <p className="text-xs text-brand-slate mb-1">{data.multiplier}</p>
          <p className="text-sm font-bold text-brand-cyan">
            Custo Esperado: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-2">Comparação de Cenários</h3>
        <p className="text-sm text-brand-slate">
          Análise de custo/benefício para diferentes estratégias de estoque
        </p>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" tick={{ fill: '#8892b0' }} stroke="#334155" />
            <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#a8b2d1' }} />
            <Bar dataKey="value" name="Custo Esperado (R$)">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {chartData.map((scenario, index) => (
          <div
            key={index}
            className="bg-brand-light-navy/50 p-3 rounded-lg border border-brand-cyan/20"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: scenario.color }}
                ></div>
                <span className="text-sm font-semibold text-brand-lightest-slate">
                  {scenario.name}
                </span>
              </div>
              <span className="text-sm font-bold text-brand-cyan">
                {formatCurrency(scenario.value)}
              </span>
            </div>
            <p className="text-xs text-brand-slate">{scenario.multiplier}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-brand-cyan/20">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-brand-slate">Diferença Conservador vs Baseline:</span>
            <p className="text-brand-lightest-slate font-semibold">
              {formatCurrency(chartData[0].value - chartData[1].value)}
            </p>
          </div>
          <div>
            <span className="text-brand-slate">Diferença Agressivo vs Baseline:</span>
            <p className="text-green-400 font-semibold">
              {formatCurrency(chartData[1].value - chartData[2].value)} economia
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScenarioComparison;

