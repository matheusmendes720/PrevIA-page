'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  events, 
  regionDemand, 
  alerts,
  stockManagement,
  recommendations 
} from '../../data';
import StatusBadge from '../ui/StatusBadge';
import Tooltip from '../ui/Tooltip';
import PrescriptiveTooltip from '@/components/PrescriptiveTooltip';
import { InfoIcon } from '@/components/icons';
import ExternalFactorsDashboard from '@/components/ExternalFactorsDashboard';
import ActionBoard from '@/components/ActionBoard';
import { prescriptiveDataService } from '@/services/prescriptiveDataService';
import type { PrescriptiveInsights } from '@/types/prescriptive';

interface OverviewTabProps {
  onNavigateToTab?: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateToTab }) => {
  const [prescriptiveData, setPrescriptiveData] = useState<PrescriptiveInsights | null>(null);
  
  useEffect(() => {
    prescriptiveDataService.loadPrescriptiveInsights().then(setPrescriptiveData);
  }, []);
  
  // Get top 3 events by impact
  const topEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3)
      .map((event, idx) => ({
        ...event,
        id: `event-${idx}`,
        type: event.title.toLowerCase().includes('licença') || event.title.toLowerCase().includes('leilão') 
          ? 'license' as const
          : event.title.toLowerCase().includes('upgrade') || event.title.toLowerCase().includes('fase')
          ? 'upgrade' as const
          : 'coverage' as const,
        materialsAffected: event.materials.split(', ').map(material => {
          const parts = material.split(' ');
          const quantity = parseInt(parts[0]) || 0;
          const unit = parts[parts.length - 1];
          const name = parts.slice(1, -1).join(' ');
          return { name, quantity, unit };
        }),
        revenueOpportunity: event.revenue,
        demandImpactPercentage: event.impact,
      }));
  }, []);

  // Get top regions by demand
  const topRegions = useMemo(() => {
    return [...regionDemand]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, []);

  // Get critical alerts
  const criticalAlerts = useMemo(() => {
    return alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').slice(0, 3);
  }, []);

  // Get top recommendations
  const topRecommendations = useMemo(() => {
    return recommendations
      .filter(r => r.priority === 'high')
      .slice(0, 2);
  }, []);

  // Get critical stock items
  const criticalStock = useMemo(() => {
    return stockManagement.criticalItems
      .filter(item => item.status === 'critical' || item.status === 'warning')
      .slice(0, 3);
  }, []);

  const getSeverityLevel = (severity: string): 'high' | 'medium' | 'low' => {
    if (severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      {/* External Factors */}
      <ExternalFactorsDashboard />
      
      {/* Prescriptive Insights Header */}
      {prescriptiveData && (
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Insights Prescritivos 5G</h3>
            <PrescriptiveTooltip
              data={{
                whatItMeans: `ROI Estimado: ${prescriptiveData.business_impact.roi_estimate}`,
                whyItMatters: `Economia de Inventário: ${prescriptiveData.business_impact.inventory_cost_savings}`,
                whatToDoNow: `Recomendações Urgentes: ${prescriptiveData.recommendations.filter(r => r.includes('URGENT')).length}`
              }}
            >
              <InfoIcon className="w-5 h-5 text-brand-cyan cursor-help" />
            </PrescriptiveTooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-brand-light-navy/30 p-4 rounded-lg">
              <p className="text-xs text-brand-slate mb-1">Famílias de Alto Risco</p>
              <p className="text-2xl font-bold text-red-400">
                {Object.values(prescriptiveData.risk_assessments).filter(r => r.stockout_risk === 'HIGH' || r.stockout_risk === 'CRITICAL').length}
              </p>
            </div>
            <div className="bg-brand-light-navy/30 p-4 rounded-lg">
              <p className="text-xs text-brand-slate mb-1">Ações Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">{prescriptiveData.action_items.length}</p>
            </div>
            <div className="bg-brand-light-navy/30 p-4 rounded-lg">
              <p className="text-xs text-brand-slate mb-1">ROI Estimado</p>
              <p className="text-2xl font-bold text-brand-cyan">{prescriptiveData.business_impact.roi_estimate}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent High-Impact Events */}
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Eventos Recentes</h3>
            <button
              onClick={() => onNavigateToTab?.('timeline')}
              className="text-sm text-brand-cyan hover:underline"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-3">
            {topEvents.map((event, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30 hover:bg-brand-light-navy/50 transition-colors cursor-pointer"
                onClick={() => onNavigateToTab?.('timeline')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-brand-lightest-slate mb-1">
                      {event.title}
                    </div>
                    <div className="text-xs text-brand-slate">
                      {event.date} · {event.region}
                    </div>
                  </div>
                  <StatusBadge
                    status={getSeverityLevel(event.severity)}
                    percentage={event.impact}
                  />
                </div>
                <div className="text-xs text-brand-cyan mt-2">
                  Impacto: +{event.impact}% · R$ {event.revenue}K oportunidade
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Highlights */}
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Regiões em Destaque</h3>
            <button
              onClick={() => onNavigateToTab?.('regional')}
              className="text-sm text-brand-cyan hover:underline"
            >
              Ver mapa →
            </button>
          </div>
          <div className="space-y-3">
            {topRegions.map((region, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30 hover:bg-brand-light-navy/50 transition-colors cursor-pointer"
                onClick={() => onNavigateToTab?.('regional')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-brand-lightest-slate">
                      {region.region}
                    </div>
                    <div className="text-xs text-brand-slate mt-1">
                      Demanda: {region.demand}
                    </div>
                  </div>
                  <StatusBadge
                    status={region.level === 'high' ? 'high' : region.level === 'med' ? 'medium' : 'low'}
                    percentage={region.value * 10}
                  />
                </div>
                <div className="mt-2 w-full bg-brand-light-navy/50 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      region.level === 'high' ? 'bg-red-400' :
                      region.level === 'med' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${(region.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Alertas Críticos</h3>
            <button
              onClick={() => onNavigateToTab?.('estoque')}
              className="text-sm text-brand-cyan hover:underline"
            >
              Ver estoque →
            </button>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-2 ${
                  alert.severity === 'critical'
                    ? 'border-red-500/40 bg-red-900/20'
                    : 'border-yellow-500/40 bg-yellow-900/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-brand-lightest-slate mb-1">
                      {alert.title}
                    </div>
                    <div className="text-xs text-brand-light-slate">
                      {alert.message}
                    </div>
                  </div>
                  <StatusBadge status={alert.severity === 'critical' ? 'critical' : 'warning'} />
                </div>
                <div className="text-xs text-brand-cyan mt-2">
                  Ação: {alert.action}
                </div>
                <div className="text-xs text-brand-slate mt-1">
                  Vencimento: {alert.due}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recommendations */}
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Recomendações Prioritárias</h3>
            <button
              onClick={() => onNavigateToTab?.('supplychain')}
              className="text-sm text-brand-cyan hover:underline"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-4">
            {topRecommendations.map((rec, idx) => (
              <Tooltip
                key={idx}
                title={rec.title}
                description={rec.description}
                keyPoints={[
                  `Impacto: ${rec.impact}`,
                  `ROI: ${rec.roi}`,
                  `Esforço: ${rec.effort}`,
                  `Timeline: ${rec.timeline}`
                ]}
                status="info"
              >
                <div className="p-4 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30 hover:border-brand-cyan/40 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-brand-lightest-slate flex-1">
                      {rec.title}
                    </h4>
                    <StatusBadge status={rec.priority === 'high' ? 'high' : 'medium'} />
                  </div>
                  <p className="text-xs text-brand-slate mb-3 line-clamp-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-semibold">{rec.roi}</span>
                    <span className="text-brand-slate">{rec.timeline}</span>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Stock Status Quick View */}
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Status de Estoque</h3>
            <button
              onClick={() => onNavigateToTab?.('estoque')}
              className="text-sm text-brand-cyan hover:underline"
            >
              Ver detalhes →
            </button>
          </div>
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-brand-light-navy/30 rounded-lg p-3 border border-brand-cyan/20 text-center">
                <div className="text-xs text-brand-slate mb-1">Valor Total</div>
                <div className="text-lg font-bold text-brand-cyan">R$ {stockManagement.totalInventoryValue}M</div>
              </div>
              <div className="bg-brand-light-navy/30 rounded-lg p-3 border border-brand-cyan/20 text-center">
                <div className="text-xs text-brand-slate mb-1">Giro</div>
                <div className="text-lg font-bold text-brand-cyan">{stockManagement.turnoverRate}x</div>
              </div>
              <div className="bg-brand-light-navy/30 rounded-lg p-3 border border-brand-cyan/20 text-center">
                <div className="text-xs text-brand-slate mb-1">Risco</div>
                <div className={`text-lg font-bold ${stockManagement.stockoutRisk > 10 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {stockManagement.stockoutRisk}%
                </div>
              </div>
            </div>

            {/* Critical Items */}
            <div className="space-y-2">
              {criticalStock.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-brand-cyan/20 bg-brand-light-navy/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-brand-lightest-slate">
                      {item.item}
                    </span>
                    <StatusBadge
                      status={item.status === 'critical' ? 'critical' : 'warning'}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-slate mb-2">
                    <span>{item.current}/{item.ideal} ({item.percentage}%)</span>
                    <span>Lead time: {item.leadTime} dias</span>
                  </div>
                  <div className="w-full bg-brand-light-navy/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'critical' ? 'bg-red-400' :
                        item.status === 'warning' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateToTab?.('coverage')}
          className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 hover:border-brand-cyan/60 transition-all animate-subtle-glow text-left group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</div>
          <h4 className="text-base font-bold text-brand-lightest-slate mb-2">
            Análise de Cobertura
          </h4>
          <p className="text-sm text-brand-slate">
            Visualize tendências detalhadas de cobertura e investimento
          </p>
          <div className="mt-4 text-sm text-brand-cyan group-hover:underline">
            Explorar →
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab?.('regional')}
          className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 hover:border-brand-cyan/60 transition-all animate-subtle-glow text-left group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🗺️</div>
          <h4 className="text-base font-bold text-brand-lightest-slate mb-2">
            Impacto Regional
          </h4>
          <p className="text-sm text-brand-slate">
            Veja o impacto por estado e região
          </p>
          <div className="mt-4 text-sm text-brand-cyan group-hover:underline">
            Ver mapa →
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab?.('timeline')}
          className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 hover:border-brand-cyan/60 transition-all animate-subtle-glow text-left group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">⏰</div>
          <h4 className="text-base font-bold text-brand-lightest-slate mb-2">
            Timeline de Eventos
          </h4>
          <p className="text-sm text-brand-slate">
            Explore todos os eventos e marcos importantes
          </p>
          <div className="mt-4 text-sm text-brand-cyan group-hover:underline">
            Ver timeline →
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab?.('actions')}
          className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 hover:border-brand-cyan/60 transition-all animate-subtle-glow text-left group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">✅</div>
          <h4 className="text-base font-bold text-brand-lightest-slate mb-2">
            Ações Pendentes
          </h4>
          <p className="text-sm text-brand-slate">
            Gerencie tarefas e ações por departamento
          </p>
          <div className="mt-4 text-sm text-brand-cyan group-hover:underline">
            Ver checklist →
          </div>
        </button>
      </div>

      {/* Performance Summary Card */}
      <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">
          Resumo de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-brand-light-navy/30 rounded-lg p-4 border border-brand-cyan/20">
            <div className="text-xs text-brand-slate mb-2">Crescimento Mensal</div>
            <div className="text-2xl font-bold text-green-400">+25</div>
            <div className="text-xs text-brand-slate mt-1">municípios/mês</div>
          </div>
          <div className="bg-brand-light-navy/30 rounded-lg p-4 border border-brand-cyan/20">
            <div className="text-xs text-brand-slate mb-2">ROI Estimado</div>
            <div className="text-2xl font-bold text-brand-cyan">12-15%</div>
            <div className="text-xs text-brand-slate mt-1">ao ano</div>
          </div>
          <div className="bg-brand-light-navy/30 rounded-lg p-4 border border-brand-cyan/20">
            <div className="text-xs text-brand-slate mb-2">Oportunidade Total</div>
            <div className="text-2xl font-bold text-green-400">R$ 1.7M</div>
            <div className="text-xs text-brand-slate mt-1">em vendas potenciais</div>
          </div>
          <div className="bg-brand-light-navy/30 rounded-lg p-4 border border-brand-cyan/20">
            <div className="text-xs text-brand-slate mb-2">Eficiência</div>
            <div className="text-2xl font-bold text-brand-cyan">87%</div>
            <div className="text-xs text-brand-slate mt-1">meta atingida</div>
          </div>
        </div>
      </div>
      
      {/* Action Board for 5G Actions */}
      <div className="mt-6">
        <ActionBoard />
      </div>
    </div>
  );
};

export default React.memo(OverviewTab);


















