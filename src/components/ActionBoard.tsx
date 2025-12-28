import React, { useState, useEffect, useMemo, memo } from 'react';
import Card from './Card';
import ActionCard, { ActionItem } from './ActionCard';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { PrescriptiveInsights } from '../types/prescriptive';

const ActionBoard: React.FC = memo(() => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActions = async () => {
      try {
        setIsLoading(true);
        const insights = await prescriptiveDataService.loadPrescriptiveInsights();
        
        // Transform recommendations and action_items into ActionItems
        const actionItems: ActionItem[] = [];

        // Add recommendations as actions
        insights.recommendations.forEach((rec, index) => {
          const isUrgent = rec.includes('URGENT');
          actionItems.push({
            id: `rec-${index}`,
            title: rec.split(':')[0] || rec.substring(0, 50),
            description: rec,
            priority: isUrgent ? 'URGENT' : 'HIGH',
            status: 'backlog',
            impact: insights.business_impact.inventory_cost_savings,
            roi: insights.business_impact.roi_estimate,
          });
        });

        // Add action items
        insights.action_items.forEach((item, index) => {
          actionItems.push({
            id: `action-${index}`,
            title: item.split(' - ')[0] || item.substring(0, 50),
            description: item,
            priority: item.toLowerCase().includes('urgent') || item.toLowerCase().includes('critical') ? 'URGENT' : 'MEDIUM',
            status: 'backlog',
            owner: item.includes('suppliers') ? 'Diretor de Supply Chain' :
                   item.includes('meetings') ? 'Gerente de Operações' :
                   item.includes('alerts') ? 'Gerente de TI' :
                   item.includes('policies') ? 'Gerente de Compras' :
                   'Gerente de Operações',
            deadline: item.includes('weekly') ? 'Esta semana' :
                     item.includes('monthly') ? 'Este mês' :
                     '60 dias',
            nextSteps: [
              'Revisar dados históricos',
              'Aprovar orçamento',
              'Comunicar equipe',
            ],
          });
        });

        setActions(actionItems);
      } catch (error) {
        console.error('Error loading actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActions();
  }, []);

  const handleStatusChange = (id: string, newStatus: ActionItem['status']) => {
    setActions(prev => prev.map(action =>
      action.id === id ? { ...action, status: newStatus } : action
    ));
  };

  const backlogActions = actions.filter(a => a.status === 'backlog');
  const inProgressActions = actions.filter(a => a.status === 'in_progress');
  const doneActions = actions.filter(a => a.status === 'done');

  if (isLoading) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Quadro de Ações</h3>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-brand-slate">Carregando ações...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-2">Quadro de Ações Prescritivas</h3>
        <p className="text-sm text-brand-slate">
          Acompanhe e gerencie ações recomendadas baseadas em análise prescritiva
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {/* Backlog Column */}
        <div className="flex flex-col">
          <div className="bg-brand-light-navy/50 p-2 rounded-t-lg border-b border-brand-cyan/20">
            <h4 className="text-sm font-semibold text-brand-lightest-slate">
              Backlog ({backlogActions.length})
            </h4>
          </div>
          <div className="bg-brand-light-navy/20 p-2 rounded-b-lg space-y-3 min-h-[200px]">
            {backlogActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={handleStatusChange}
              />
            ))}
            {backlogActions.length === 0 && (
              <div className="text-xs text-brand-slate text-center py-8">
                Nenhuma ação no backlog
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col">
          <div className="bg-blue-500/20 p-2 rounded-t-lg border-b border-blue-500/40">
            <h4 className="text-sm font-semibold text-brand-lightest-slate">
              Em Progresso ({inProgressActions.length})
            </h4>
          </div>
          <div className="bg-brand-light-navy/20 p-2 rounded-b-lg space-y-3 min-h-[200px]">
            {inProgressActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={handleStatusChange}
              />
            ))}
            {inProgressActions.length === 0 && (
              <div className="text-xs text-brand-slate text-center py-8">
                Nenhuma ação em progresso
              </div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col">
          <div className="bg-green-500/20 p-2 rounded-t-lg border-b border-green-500/40">
            <h4 className="text-sm font-semibold text-brand-lightest-slate">
              Concluído ({doneActions.length})
            </h4>
          </div>
          <div className="bg-brand-light-navy/20 p-2 rounded-b-lg space-y-3 min-h-[200px]">
            {doneActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onStatusChange={handleStatusChange}
              />
            ))}
            {doneActions.length === 0 && (
              <div className="text-xs text-brand-slate text-center py-8">
                Nenhuma ação concluída
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-brand-cyan/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-brand-lightest-slate">{actions.length}</p>
            <p className="text-xs text-brand-slate">Total de Ações</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">{inProgressActions.length}</p>
            <p className="text-xs text-brand-slate">Em Progresso</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-400">
              {actions.length > 0 ? Math.round((doneActions.length / actions.length) * 100) : 0}%
            </p>
            <p className="text-xs text-brand-slate">Taxa de Conclusão</p>
          </div>
        </div>
      </div>
    </Card>
  );
});

ActionBoard.displayName = 'ActionBoard';

export default ActionBoard;

