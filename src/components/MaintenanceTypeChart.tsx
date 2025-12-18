
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import Card from './Card';

interface ChartData {
    name: string;
    value: number;
}

interface MaintenanceTypeChartProps {
  data: ChartData[];
  title: string;
}

const COLORS: { [key:string]: string } = {
    'Preventiva': '#8884d8',
    'Corretiva': '#ff8042',
};

const MaintenanceTypeChart: React.FC<MaintenanceTypeChartProps> = ({ data, title }) => {
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
              <Bar dataKey="value" name="Nº de Tarefas">
                {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#64ffda'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados de manutenção para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MaintenanceTypeChart;
