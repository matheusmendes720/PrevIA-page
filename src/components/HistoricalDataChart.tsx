
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { TimeSeriesDataPoint } from '../types';

interface HistoricalDataChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
}

const HistoricalDataChart: React.FC<HistoricalDataChartProps> = ({ data, title }) => {
  return (
    <Card>
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">{title}</h3>
      <div className="h-80">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
              <Line type="monotone" dataKey="Manutenções" stroke="#64ffda" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados históricos para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HistoricalDataChart;
