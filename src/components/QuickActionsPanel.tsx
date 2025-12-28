import React from 'react';
import Card from './Card';
import { LightBulbIcon, ExclamationTriangleIcon, CheckCircleIcon } from './icons';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  impact: string;
  estimatedTime: string;
}

const QuickActionsPanel: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Aumentar Estoque EPI',
      description: 'Aumentar estoque de segurança em 50% para família EPI',
      priority: 'URGENT',
      impact: 'Reduz risco de ruptura em 40-60%',
      estimatedTime: '2 horas',
    },
    {
      id: '2',
      title: 'Diversificar Fornecedores',
      description: 'Avaliar e contratar fornecedores alternativos para FERRO_E_AÇO',
      priority: 'HIGH',
      impact: 'Reduz dependência de fornecedor único',
      estimatedTime: '1 semana',
    },
    {
      id: '3',
      title: 'Revisar Políticas de Compras',
      description: 'Atualizar políticas baseadas na acurácia do modelo',
      priority: 'MEDIUM',
      impact: 'Otimiza processos de compra',
      estimatedTime: '3 dias',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-brand-light-navy/50 text-brand-slate border-brand-cyan/20';
    }
  };

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center gap-2">
        <LightBulbIcon className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-brand-lightest-slate">Ações Rápidas</h3>
      </div>

      <div className="space-y-3">
        {quickActions.map((action) => (
          <div
            key={action.id}
            className="bg-brand-light-navy/50 p-4 rounded-lg border border-brand-cyan/20 hover:border-brand-cyan/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-brand-lightest-slate flex-1">
                {action.title}
              </h4>
              <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(action.priority)}`}>
                {action.priority}
              </span>
            </div>
            <p className="text-xs text-brand-slate mb-2">{action.description}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-3 h-3 text-green-400" />
                <span className="text-brand-slate">Impacto: </span>
                <span className="text-green-400 font-semibold">{action.impact}</span>
              </div>
              <span className="text-brand-slate">⏱ {action.estimatedTime}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-brand-cyan/20">
        <button className="w-full px-4 py-2 bg-brand-cyan text-brand-navy rounded-lg font-semibold hover:bg-opacity-80 transition-colors text-sm">
          Ver Todas as Ações
        </button>
      </div>
    </Card>
  );
};

export default QuickActionsPanel;

