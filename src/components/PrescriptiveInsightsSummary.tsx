import React, { useState, useEffect } from 'react';
import Card from './Card';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { PrescriptiveInsights } from '../types/prescriptive';
import { getHighRiskFamilies } from '../lib/prescriptiveDataMapper';
import { ExclamationTriangleIcon, CheckCircleIcon, CurrencyDollarIcon } from './icons';

const PrescriptiveInsightsSummary: React.FC = () => {
  const [insights, setInsights] = useState<PrescriptiveInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await prescriptiveDataService.loadPrescriptiveInsights();
        setInsights(data);
      } catch (error) {
        console.error('Error loading prescriptive insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading || !insights) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-brand-slate">Carregando insights...</div>
        </div>
      </Card>
    );
  }

  const highRiskFamilies = getHighRiskFamilies(insights);
  const totalFamilies = Object.keys(insights.risk_assessments).length;
  const urgentRecommendations = insights.recommendations.filter(r => r.includes('URGENT')).length;

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-2">Resumo de Insights Prescritivos</h3>
        <p className="text-sm text-brand-slate">
          Visão geral das recomendações e análises prescritivas
        </p>
      </div>

      <div className="space-y-4">
        {/* High Risk Alert */}
        {highRiskFamilies.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-400 mb-1">
                  {highRiskFamilies.length} Família{highRiskFamilies.length > 1 ? 's' : ''} de Alto Risco
                </h4>
                <p className="text-xs text-brand-slate mb-2">
                  Requerem ação imediata para evitar ruptura de estoque
                </p>
                <div className="flex flex-wrap gap-2">
                  {highRiskFamilies.map((family) => (
                    <span
                      key={family}
                      className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/40"
                    >
                      {family}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-light-navy/50 p-3 rounded-lg border border-brand-cyan/20">
            <div className="flex items-center gap-2 mb-1">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-brand-slate">Recomendações Urgentes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{urgentRecommendations}</p>
          </div>

          <div className="bg-brand-light-navy/50 p-3 rounded-lg border border-brand-cyan/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircleIcon className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs text-brand-slate">Famílias Analisadas</span>
            </div>
            <p className="text-2xl font-bold text-brand-cyan">{totalFamilies}</p>
          </div>
        </div>

        {/* Business Impact */}
        <div className="bg-brand-light-navy/50 p-4 rounded-lg border border-brand-cyan/20">
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-3 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-brand-cyan" />
            Impacto no Negócio
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-brand-slate text-xs">Redução de Ruptura:</span>
              <p className="text-brand-lightest-slate font-semibold">
                {insights.business_impact.potential_stockout_reduction}
              </p>
            </div>
            <div>
              <span className="text-brand-slate text-xs">Economia de Inventário:</span>
              <p className="text-green-400 font-semibold">
                {insights.business_impact.inventory_cost_savings}
              </p>
            </div>
            <div>
              <span className="text-brand-slate text-xs">Melhoria de SLA:</span>
              <p className="text-brand-lightest-slate font-semibold">
                {insights.business_impact.sla_improvement}
              </p>
            </div>
            <div>
              <span className="text-brand-slate text-xs">ROI Estimado:</span>
              <p className="text-brand-cyan font-semibold">
                {insights.business_impact.roi_estimate}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Ações Prioritárias</h4>
          <ul className="space-y-2">
            {insights.recommendations.slice(0, 3).map((rec, index) => (
              <li
                key={index}
                className="text-xs text-brand-slate bg-brand-light-navy/30 p-2 rounded border border-brand-cyan/10"
              >
                <span className="text-brand-cyan font-semibold">
                  {rec.includes('URGENT') ? '🔴 URGENTE: ' : '• '}
                </span>
                {rec.replace('URGENT: ', '')}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default PrescriptiveInsightsSummary;

