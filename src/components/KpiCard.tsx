
import React from 'react';
import Card from './Card';
import { KpiData } from '../types';
import { UpArrowIcon, DownArrowIcon } from './icons';

interface KpiCardProps {
  data: KpiData;
}

const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const { title, value, change, changeType, icon } = data;
  const isIncrease = changeType === 'increase';

  return (
    <Card className="flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-base font-semibold text-brand-slate">{title}</h3>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-brand-lightest-slate mt-4">{value}</p>
        <div className="flex items-center space-x-1 mt-1">
          <span className={`flex items-center text-sm font-semibold ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
            {isIncrease ? <UpArrowIcon className="w-4 h-4" /> : <DownArrowIcon className="w-4 h-4" />}
            {change}
          </span>
          <span className="text-sm text-brand-slate">vs. mês passado</span>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;