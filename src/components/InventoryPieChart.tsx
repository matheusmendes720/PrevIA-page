

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { PieChartData } from '../types';

interface InventoryPieChartProps {
  data: PieChartData[];
  title: string;
  onSliceClick?: (data: any) => void;
}

const COLORS = ['#64ffda', '#8884d8', '#ff8042', '#00C49F', '#FFBB28'];

const InventoryPieChart: React.FC<InventoryPieChartProps> = ({ data, title, onSliceClick }) => {
  return (
    <Card className="h-full">
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">{title}</h3>
      <div className="h-96">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                onClick={onSliceClick}
                className={onSliceClick ? 'cursor-pointer' : ''}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 47, 0.8)',
                  borderColor: '#64ffda',
                  color: '#ccd6f6',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#ccd6f6' }}
              />
              <Legend wrapperStyle={{ color: '#a8b2d1', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados de inventário para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryPieChart;