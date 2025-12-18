
import React, { memo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { ForecastDataPoint } from '../types';

interface DemandForecastChartProps {
  data: ForecastDataPoint[];
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = memo(({ data }) => {
  return (
    <Card className="h-full">
      <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Previsão de Demanda (Últimos 30 Dias)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
