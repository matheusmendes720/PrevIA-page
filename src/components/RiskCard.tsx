import React from 'react';
import type { RiskAssessment } from '../types/prescriptive';
import { mapRiskScoreToColor, formatRiskScore } from '../lib/prescriptiveDataMapper';

interface RiskCardProps {
  family: string;
  risk: RiskAssessment;
  onCardClick?: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ family, risk, onCardClick }) => {
  const color = mapRiskScoreToColor(risk.risk_score);
  
  const getRiskColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20';
      case 'orange':
        return 'bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20';
      case 'yellow':
        return 'bg-yellow-500/10 border-yellow-500/40 hover:bg-yellow-500/20';
      case 'green':
        return 'bg-green-500/10 border-green-500/40 hover:bg-green-500/20';
      default:
        return 'bg-brand-light-navy/50 border-brand-cyan/20';
    }
  };

  const getRiskBadgeColor = () => {
    switch (risk.stockout_risk) {
      case 'CRITICAL':
        return 'bg-red-600/30 text-red-300 border border-red-500/50';
      case 'HIGH':
        return 'bg-red-500/20 text-red-400';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'LOW':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-brand-light-navy/20 text-brand-slate';
    }
  };

  const getActionBadge = () => {
    if (risk.risk_score > 0.65) return { text: 'URGENTE', color: 'bg-red-500/30 text-red-300' };
    if (risk.risk_score > 0.30) return { text: 'REVISAR', color: 'bg-yellow-500/30 text-yellow-300' };
    return { text: 'OK', color: 'bg-green-500/30 text-green-300' };
  };

  const actionBadge = getActionBadge();

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${getRiskColorClasses()}`}
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick?.();
        }
      }}
      aria-label={`Detalhes de risco para ${family}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-brand-lightest-slate mb-1">{family}</h4>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getRiskBadgeColor()}`}>
              Risco: {risk.stockout_risk}
            </span>
            <span className="text-xs text-brand-slate">
              Score: {formatRiskScore(risk.risk_score)}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded ${actionBadge.color}`}>
          {actionBadge.text}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-slate">Estoque de Segurança:</span>
          <span className="text-brand-lightest-slate font-semibold">
            {risk.recommended_safety_stock_days} dias
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-slate">Ponto de Recompra:</span>
          <span className="text-brand-lightest-slate font-semibold">
            {risk.recommended_reorder_point_multiplier.toFixed(2)}x demanda diária
          </span>
        </div>
      </div>

      {risk.risk_score > 0.65 && (
        <div className="mt-3 pt-3 border-t border-brand-cyan/20">
          <p className="text-xs text-brand-cyan font-semibold">
            Ação recomendada: Aumentar estoque de segurança em 50%
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskCard;

