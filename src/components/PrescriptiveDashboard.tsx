import React from 'react';
import Card from './Card';
import RiskMatrix from './RiskMatrix';
import ActionBoard from './ActionBoard';
import ScenarioComparison from './ScenarioComparison';
import ExternalFactorsDashboard from './ExternalFactorsDashboard';

/**
 * Prescriptive Dashboard - Aggregates all prescriptive intelligence components
 * This component can be used as a standalone page or integrated into the main dashboard
 */
const PrescriptiveDashboard: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-lightest-slate mb-1">
            Inteligência Prescritiva
          </h2>
          <p className="text-sm text-brand-slate">
            Análise prescritiva e recomendações acionáveis para tomada de decisão
          </p>
        </div>
      </div>

      {/* External Factors - Top Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <ExternalFactorsDashboard />
      </div>

      {/* Risk Matrix and Action Board - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <RiskMatrix />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <ActionBoard />
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <ScenarioComparison />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-brand-slate mb-2">Famílias de Alto Risco</h3>
          <p className="text-3xl font-bold text-red-400">3</p>
          <p className="text-xs text-brand-slate mt-1">Requerem ação imediata</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-brand-slate mb-2">Ações Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-400">7</p>
          <p className="text-xs text-brand-slate mt-1">Aguardando implementação</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-brand-slate mb-2">ROI Estimado</h3>
          <p className="text-3xl font-bold text-brand-cyan">195%</p>
          <p className="text-xs text-brand-slate mt-1">Retorno em 12 meses</p>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptiveDashboard;

