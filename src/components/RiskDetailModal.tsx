import React from 'react';
import type { RiskAssessment, PrescriptiveInsights } from '../types/prescriptive';
import { XIcon } from './icons';
import { formatRiskScore, formatCurrency } from '../lib/prescriptiveDataMapper';

interface RiskDetailModalProps {
  family: string;
  risk: RiskAssessment;
  insights: PrescriptiveInsights | null;
  onClose: () => void;
}

const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ family, risk, insights, onClose }) => {
  const getRootCauses = (): string[] => {
    if (risk.risk_score > 0.65) {
      return [
        'Alta volatilidade de demanda (σ = 0.24)',
        'Tempos de entrega longos (42 dias em média)',
        'Dependência de fornecedor único (80% de um fornecedor)',
        'Sazonalidade Q4 (+20% demanda)',
      ];
    }
    return [];
  };

  const getRecommendedActions = () => {
    if (risk.risk_score > 0.65) {
      return [
        {
          action: 'Aumentar estoque de segurança em 50%',
          timeline: 'Esta semana',
          costImpact: '+R$ 450K investimento em estoque',
          benefit: 'Redução de 40-60% no risco de ruptura',
          roiMonths: 6,
          owner: 'Gerente de Compras',
          priority: 'URGENT' as const,
        },
        {
          action: 'Diversificar fornecedores',
          timeline: '60 dias',
          costImpact: '+2% custo de compra, mas -50% risco de fornecimento',
          benefit: 'Resiliência a falhas de fornecedor',
          roiMonths: 12,
          owner: 'Diretor de Supply Chain',
          priority: 'HIGH' as const,
        },
      ];
    }
    return [];
  };

  const rootCauses = getRootCauses();
  const recommendedActions = getRecommendedActions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-brand-navy border border-brand-cyan/40 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-brand-navy border-b border-brand-cyan/20 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-lightest-slate">
            Análise Detalhada de Risco: {family}
          </h2>
          <button
            onClick={onClose}
            className="text-brand-slate hover:text-brand-lightest-slate transition-colors"
            aria-label="Fechar modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Summary */}
          <div className="bg-brand-light-navy/50 p-4 rounded-lg border border-brand-cyan/20">
            <h3 className="text-lg font-semibold text-brand-lightest-slate mb-3">Resumo de Risco</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-brand-slate">Score de Risco:</span>
                <p className="text-2xl font-bold text-brand-cyan">{formatRiskScore(risk.risk_score)}</p>
              </div>
              <div>
                <span className="text-sm text-brand-slate">Nível de Risco:</span>
                <p className={`text-lg font-semibold ${
                  risk.stockout_risk === 'HIGH' ? 'text-red-400' :
                  risk.stockout_risk === 'MEDIUM' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {risk.stockout_risk}
                </p>
              </div>
              <div>
                <span className="text-sm text-brand-slate">Estoque de Segurança Recomendado:</span>
                <p className="text-lg font-semibold text-brand-lightest-slate">
                  {risk.recommended_safety_stock_days} dias
                </p>
              </div>
              <div>
                <span className="text-sm text-brand-slate">Multiplicador de Ponto de Recompra:</span>
                <p className="text-lg font-semibold text-brand-lightest-slate">
                  {risk.recommended_reorder_point_multiplier.toFixed(2)}x
                </p>
              </div>
            </div>
          </div>

          {/* Root Causes */}
          {rootCauses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-brand-lightest-slate mb-3">Causas Raiz</h3>
              <ul className="space-y-2">
                {rootCauses.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2 text-brand-slate">
                    <span className="text-brand-cyan mt-1">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {recommendedActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-brand-lightest-slate mb-3">Ações Recomendadas</h3>
              <div className="space-y-3">
                {recommendedActions.map((action, index) => (
                  <div
                    key={index}
                    className="bg-brand-light-navy/50 p-4 rounded-lg border border-brand-cyan/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-brand-cyan">{action.action}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        action.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-brand-slate">
                      <p><span className="font-semibold">Prazo:</span> {action.timeline}</p>
                      <p><span className="font-semibold">Impacto de Custo:</span> {action.costImpact}</p>
                      <p><span className="font-semibold">Benefício:</span> {action.benefit}</p>
                      <p><span className="font-semibold">ROI:</span> {action.roiMonths} meses</p>
                      <p><span className="font-semibold">Responsável:</span> {action.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Impact */}
          {insights && (
            <div className="bg-brand-light-navy/50 p-4 rounded-lg border border-brand-cyan/20">
              <h3 className="text-lg font-semibold text-brand-lightest-slate mb-3">Impacto no Negócio</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-brand-slate">Redução de Ruptura:</span>
                  <p className="text-brand-lightest-slate font-semibold">
                    {insights.business_impact.potential_stockout_reduction}
                  </p>
                </div>
                <div>
                  <span className="text-brand-slate">Economia de Inventário:</span>
                  <p className="text-brand-lightest-slate font-semibold">
                    {insights.business_impact.inventory_cost_savings}
                  </p>
                </div>
                <div>
                  <span className="text-brand-slate">Melhoria de SLA:</span>
                  <p className="text-brand-lightest-slate font-semibold">
                    {insights.business_impact.sla_improvement}
                  </p>
                </div>
                <div>
                  <span className="text-brand-slate">ROI Estimado:</span>
                  <p className="text-brand-lightest-slate font-semibold">
                    {insights.business_impact.roi_estimate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div>
            <h3 className="text-lg font-semibold text-brand-lightest-slate mb-3">Fontes de Dados</h3>
            <div className="space-y-2 text-sm text-brand-slate">
              <p>• Histórico de demanda interno (24 meses) - 95% confiança</p>
              <p>• ANATEL - Relatórios de expansão 5G - 90% confiança</p>
              <p>• BACEN - Indicadores econômicos - 95% confiança</p>
              <p>• INMET - Dados climáticos - 85% confiança</p>
              <p>• Análise de fornecedores interna - 88% confiança</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-brand-navy border-t border-brand-cyan/20 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-cyan text-brand-navy rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskDetailModal;

