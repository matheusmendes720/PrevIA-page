

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from './Card';
import { AlertLevel } from '../types';

interface ChartData {
    name: string;
    value: number;
    level: AlertLevel;
}
interface OperationalStatusProps {
    data: ChartData[];
    onSliceClick: (level: AlertLevel) => void;
    activeFilter: AlertLevel | null;
}

const COLORS = {
    'Crítico': '#f87171', // red-400
    'Atenção': '#fbbf24', // amber-400
    'Normal': '#4ade80', // green-400
};

const OperationalStatus: React.FC<OperationalStatusProps> = ({ data, onSliceClick, activeFilter }) => {
    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Status Operacional</h3>
            <div className="flex-grow min-h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            onClick={(d) => onSliceClick(d.level)}
                            className="cursor-pointer"
                        >
                            {data.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.name}`} 
                                    fill={COLORS[entry.name as keyof typeof COLORS]}
                                    opacity={activeFilter === null || activeFilter === entry.level ? 1 : 0.4}
                                    stroke={activeFilter === entry.level ? COLORS[entry.name as keyof typeof COLORS] : 'none'}
                                    strokeWidth={3}
                                />
                            ))}
                        </Pie>
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ color: '#a8b2d1', fontSize: '14px' }}
                            formatter={(value, entry: any) => (
                                <span className={`transition-opacity ${activeFilter === null || activeFilter === entry.payload.level ? 'opacity-100' : 'opacity-50'}`}>
                                    {value}: <span className="font-bold text-brand-lightest-slate">{entry.payload?.value}</span>
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default OperationalStatus;