
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

  const getActionBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'REVIEW':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'OK':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      default:
        return 'bg-brand-light-navy/50 text-brand-slate border-brand-cyan/20';
    }
  };

  const getRiskBorderColor = () => {
    if (!prescriptiveData.riskScore) return '';
    const color = mapRiskScoreToColor(prescriptiveData.riskScore);
    switch (color) {
      case 'red':
        return 'border-l-4 border-red-500';
      case 'orange':
        return 'border-l-4 border-orange-500';
      case 'yellow':
        return 'border-l-4 border-yellow-500';
      case 'green':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const cardContent = (
    <Card className={`flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2 ${getRiskBorderColor()}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-brand-slate">{title}</h3>
            {prescriptiveData.actionBadge && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getActionBadgeColor(prescriptiveData.actionBadge)}`}>
                {prescriptiveData.actionBadge}
              </span>
            )}
          </div>
          {prescriptiveData.riskLevel && (
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                prescriptiveData.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                prescriptiveData.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                Risco: {prescriptiveData.riskLevel}
              </span>
              {prescriptiveData.riskScore && (
                <span className="text-xs text-brand-slate">
                  {(prescriptiveData.riskScore * 100).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
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
        {prescriptiveData.confidence && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-brand-slate">Confiança:</span>
            <span className={`text-xs font-semibold ${
              prescriptiveData.confidence > 90 ? 'text-blue-400' :
              prescriptiveData.confidence > 80 ? 'text-blue-300' :
              'text-blue-200'
            }`}>
              {prescriptiveData.confidence}%
            </span>
          </div>
        )}
        {prescriptiveData.roi && (
          <div className="mt-1">
            <span className="text-xs text-brand-slate">ROI estimado: </span>
            <span className="text-xs font-semibold text-brand-cyan">{prescriptiveData.roi}</span>
          </div>
        )}
        {prescriptiveData.impact && (
          <div className="mt-1">
            <span className="text-xs text-brand-slate">Impacto: </span>
            <span className="text-xs font-semibold text-green-400">{prescriptiveData.impact}</span>
          </div>
        )}
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