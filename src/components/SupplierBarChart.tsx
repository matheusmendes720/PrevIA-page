

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { BarChartData } from '../types';

interface SupplierBarChartProps {
  data: BarChartData[];
  title: string;
  onBarClick?: (data: any) => void;
}

const SupplierBarChart: React.FC<SupplierBarChartProps> = ({ data, title, onBarClick }) => {
  return (
    <Card className="h-full">
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">{title}</h3>
      <div className="h-96">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#8892b0' }} stroke="#334155" />
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
              <Bar dataKey="Lead Time (dias)" fill="#64ffda" onClick={onBarClick} className={onBarClick ? 'cursor-pointer' : ''} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados de fornecedores para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SupplierBarChart;