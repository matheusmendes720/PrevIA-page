
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import Card from './Card';

interface ChartData {
    name: string;
    value: number;
}

interface ProjectStatusChartProps {
  data: ChartData[];
  title: string;
}

const COLORS: { [key: string]: string } = {
    'Planejamento': '#3b82f6', // blue-500
    'Em Progresso': '#facc15', // yellow-400
    'Concluído': '#4ade80', // green-400
};

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ data, title }) => {
  return (
    <Card className="h-full">
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">{title}</h3>
      <div className="h-96">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" tick={{ fill: '#8892b0' }} stroke="#334155" />
              <YAxis dataKey="name" type="category" tick={{ fill: '#8892b0' }} stroke="#334155" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 47, 0.8)',
                  borderColor: '#64ffda',
                  color: '#ccd6f6',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#ccd6f6' }}
                cursor={{ fill: 'rgba(100, 255, 218, 0.1)' }}
              />
              <Bar dataKey="value" name="Nº de Projetos" barSize={35}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-slate">Não há dados de projetos para esta seleção.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectStatusChart;
