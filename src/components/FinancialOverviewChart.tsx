
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { FinancialDataPoint } from '../types';

interface FinancialOverviewChartProps {
  data: FinancialDataPoint[];
  title: string;
}

const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ data, title }) => {
    const formatCurrency = (value: number) => {
        if (value >= 1e6) {
            return `R$ ${(value / 1e6).toFixed(1)}M`;
        }
        if (value >= 1e3) {
            return `R$ ${(value / 1e3).toFixed(0)}k`;
        }
        return `R$ ${value}`;
    }

  return (
    <Card className="h-full">
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">{title}</h3>
      <div className="h-96">
        {data && data.length > 0 && data[0].Orçamento > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#8892b0' }} stroke="#334155" />
              <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 47, 0.8)',
                  borderColor: '#64ffda',
                  color: '#ccd6f6',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#ccd6f6' }}
                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              />
              <Legend wrapperStyle={{ color: '#a8b2d1' }} />
              <Bar dataKey="Orçamento" fill="#8884d8" />
              <Bar dataKey="Gasto Real" fill="#64ffda" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados financeiros para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FinancialOverviewChart;
