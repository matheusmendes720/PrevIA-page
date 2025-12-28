
import React, { useEffect, useState } from 'react';
import Card from './Card';
import { KpiData } from '../types';
import { UpArrowIcon, DownArrowIcon } from './icons';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { PrescriptiveKpiData, PrescriptiveTooltipData } from '../types/prescriptive';
import PrescriptiveTooltip from './PrescriptiveTooltip';
import { mapRiskScoreToColor } from '../lib/prescriptiveDataMapper';

interface KpiCardProps {
  data: KpiData;
}

import ActionBadge, { ActionBadgeStatus } from './ActionBadge';

const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const { title, value, change, changeType, icon } = data;
  const isIncrease = changeType === 'increase';
  const [prescriptiveData, setPrescriptiveData] = useState<PrescriptiveKpiData>({});
  const [tooltipData, setTooltipData] = useState<PrescriptiveTooltipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrescriptiveData = async () => {
      try {
        setIsLoading(true);
        await prescriptiveDataService.loadPrescriptiveInsights();
        await prescriptiveDataService.loadComprehensivePrescriptive();

        const kpiData = prescriptiveDataService.getKpiPrescriptiveData(title);
        const tooltip = prescriptiveDataService.getTooltipDataForKpi(title);

        setPrescriptiveData(kpiData);
        setTooltipData(tooltip);
      } catch (error) {
        console.error('Error loading prescriptive data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptiveData();
  }, [title]);

  const getRiskBorderColor = () => {
    if (!prescriptiveData.riskScore) return '';
    const color = mapRiskScoreToColor(prescriptiveData.riskScore);
    switch (color) {
      case 'red': return 'border-l-4 border-red-500';
      case 'orange': return 'border-l-4 border-orange-500';
      case 'yellow': return 'border-l-4 border-yellow-500';
      case 'green': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  const cardContent = (
    <Card className={`flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-cyan/5 ${getRiskBorderColor()}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <h3 className="text-sm sm:text-base font-bold text-brand-lightest-slate truncate">{title}</h3>
            {prescriptiveData.actionBadge && (
              <div className="scale-75 sm:scale-100 origin-left">
                <ActionBadge
                  status={prescriptiveData.actionBadge as ActionBadgeStatus}
                  size="sm"
                />
              </div>
            )}
          </div>
          {prescriptiveData.riskLevel && (
            <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2">
              <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-bold uppercase tracking-wider ${prescriptiveData.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                prescriptiveData.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                {prescriptiveData.riskLevel}
              </span>
              {prescriptiveData.riskScore && (
                <span className="text-[9px] sm:text-[10px] text-brand-slate font-medium">
                  {(prescriptiveData.riskScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-1.5 sm:p-2 bg-brand-light-navy/30 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
          <div className="scale-75 sm:scale-100">
            {icon}
          </div>
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-brand-lightest-slate mt-2 sm:mt-4 tracking-tighter">{value}</p>
        <div className="flex items-center space-x-1 mt-0.5">
          <span className={`flex items-center text-xs sm:text-sm font-bold ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
            {isIncrease ? <UpArrowIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <DownArrowIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
            {change}
          </span>
          <span className="text-[10px] sm:text-[11px] text-brand-slate opacity-60">vs. mês anterior</span>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5 space-y-1 sm:space-y-1.5">
          {prescriptiveData.confidence && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-brand-slate uppercase tracking-wider font-bold">Confiança AI</span>
              <span className={`text-[9px] sm:text-[10px] font-bold ${prescriptiveData.confidence > 90 ? 'text-brand-cyan' :
                prescriptiveData.confidence > 80 ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                {prescriptiveData.confidence}%
              </span>
            </div>
          )}
          {prescriptiveData.roi && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-brand-slate uppercase tracking-wider font-bold">ROI</span>
              <span className="text-[10px] sm:text-xs font-bold text-neon-cyan">{prescriptiveData.roi.split(' ')[0]}</span>
            </div>
          )}
          {prescriptiveData.impact && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-brand-slate uppercase tracking-wider font-bold">Impacto</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-green-400">+{prescriptiveData.impact.split('-')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (isLoading || !tooltipData) {
    return cardContent;
  }

  return (
    <PrescriptiveTooltip data={tooltipData} showOnHover={true} showOnClick={true}>
      {cardContent}
    </PrescriptiveTooltip>
  );
};

export default KpiCard;