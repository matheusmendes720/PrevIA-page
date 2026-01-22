
import React, { memo, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { ForecastDataPoint } from '../types';

type Scenario = 'conservador' | 'baseline' | 'agressivo';

interface DemandForecastChartProps {
  data: ForecastDataPoint[];
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = memo(({ data }) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('baseline');

  const adjustedData = useMemo(() => {
    const scenarioConfigs = {
      conservador: {
        name: 'Conservador',
        description: '80% demanda, 1.5x estoque de segurança',
        demandMultiplier: 0.8,
        safetyMultiplier: 1.5,
      },
      baseline: {
        name: 'Baseline',
        description: '100% demanda, 1.0x estoque de segurança',
        demandMultiplier: 1.0,
        safetyMultiplier: 1.0,
      },
      agressivo: {
        name: 'Agressivo',
        description: '120% demanda, 0.7x estoque de segurança',
        demandMultiplier: 1.2,
        safetyMultiplier: 0.7,
      },
    };

    const config = scenarioConfigs[selectedScenario];
    return data.map(point => ({
      ...point,
      'Demanda Prevista': Math.round(point['Demanda Prevista'] * config.demandMultiplier),
    }));
  }, [data, selectedScenario]);

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Previsão de Demanda (Últimos 30 Dias)</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={() => setSelectedScenario('conservador')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedScenario === 'conservador'
                ? 'bg-brand-light-navy text-brand-slate hover:bg-brand-navy'
                : 'bg-brand-cyan text-brand-navy'
            }`}
            aria-pressed={selectedScenario === 'conservador'}
          >
            <div className="font-bold">Conservador</div>
            <div className="text-xs opacity-75">80% demanda, 1.5x estoque de segurança</div>
          </button>
          <button
            onClick={() => setSelectedScenario('baseline')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedScenario === 'baseline'
                ? 'bg-brand-light-navy text-brand-slate hover:bg-brand-navy'
                : 'bg-brand-cyan text-brand-navy'
            }`}
            aria-pressed={selectedScenario === 'baseline'}
          >
            <div className="font-bold">Baseline</div>
            <div className="text-xs opacity-75">100% demanda, 1.0x estoque de segurança</div>
          </button>
          <button
            onClick={() => setSelectedScenario('agressivo')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedScenario === 'agressivo'
                ? 'bg-brand-light-navy text-brand-slate hover:bg-brand-navy'
                : 'bg-brand-cyan text-brand-navy'
            }`}
            aria-pressed={selectedScenario === 'agressivo'}
          >
            <div className="font-bold">Agressivo</div>
            <div className="text-xs opacity-75">120% demanda, 0.7x estoque de segurança</div>
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={adjustedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64ffda" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#64ffda" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrevista" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
            <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 25, 47, 0.8)',
                borderColor: '#64ffda',
                color: '#ccd6f6',
                borderRadius: '0.5rem'
              }}
              itemStyle={{ color: '#ccd6f6' }}
            />
            <Legend wrapperStyle={{ color: '#a8b2d1' }} />
            <Area type="monotone" dataKey="Demanda Real" stroke="#64ffda" fillOpacity={1} fill="url(#colorReal)" />
            <Area type="monotone" dataKey="Demanda Prevista" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrevista)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

DemandForecastChart.displayName = 'DemandForecastChart';

export default DemandForecastChart;
