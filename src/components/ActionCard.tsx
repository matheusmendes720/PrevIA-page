import React from 'react';
import type { PrescriptiveRecommendation } from '../types';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  owner?: string;
  deadline?: string;
  roi?: string;
  impact?: string;
  status: 'backlog' | 'in_progress' | 'done';
  nextSteps?: string[];
  estimatedSavings?: string;
}

interface ActionCardProps {
  action: ActionItem;
  onStatusChange?: (id: string, newStatus: ActionItem['status']) => void;
  onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onStatusChange, onClick }) => {
  const getPriorityColor = () => {
    switch (action.priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getStatusColor = () => {
    switch (action.status) {
      case 'done':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'backlog':
        return 'bg-brand-light-navy/50 text-brand-slate';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 border-brand-cyan/20 bg-brand-light-navy/30 hover:bg-brand-light-navy/50 transition-all cursor-pointer ${
        action.status === 'done' ? 'opacity-75' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Ação: ${action.title}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-brand-lightest-slate flex-1">{action.title}</h4>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor()}`}>
            {action.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor()}`}>
            {action.status === 'done' ? 'Concluído' :
             action.status === 'in_progress' ? 'Em Progresso' :
             'Backlog'}
          </span>
        </div>
      </div>

      <p className="text-xs text-brand-slate mb-3">{action.description}</p>

      <div className="space-y-2 text-xs">
        {action.owner && (
          <div className="flex items-center gap-2">
            <span className="text-brand-slate">Responsável:</span>
            <span className="text-brand-lightest-slate font-semibold">{action.owner}</span>
          </div>
        )}
        {action.deadline && (
          <div className="flex items-center gap-2">
            <span className="text-brand-slate">Prazo:</span>
            <span className="text-brand-lightest-slate font-semibold">{action.deadline}</span>
          </div>
        )}
        {action.roi && (
          <div className="flex items-center gap-2">
            <span className="text-brand-slate">ROI:</span>
            <span className="text-brand-cyan font-semibold">{action.roi}</span>
          </div>
        )}
        {action.estimatedSavings && (
          <div className="flex items-center gap-2">
            <span className="text-brand-slate">Economia Estimada:</span>
            <span className="text-green-400 font-semibold">{action.estimatedSavings}</span>
          </div>
        )}
        {action.impact && (
          <div className="flex items-center gap-2">
            <span className="text-brand-slate">Impacto:</span>
            <span className="text-brand-lightest-slate">{action.impact}</span>
          </div>
        )}
      </div>

      {action.nextSteps && action.nextSteps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-brand-cyan/20">
          <p className="text-xs font-semibold text-brand-slate mb-1">Próximos Passos:</p>
          <ul className="space-y-1">
            {action.nextSteps.slice(0, 2).map((step, index) => (
              <li key={index} className="text-xs text-brand-slate flex items-start gap-2">
                <span className="text-brand-cyan mt-0.5">•</span>
                <span>{step}</span>
              </li>
            ))}
            {action.nextSteps.length > 2 && (
              <li className="text-xs text-brand-cyan">
                +{action.nextSteps.length - 2} mais
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionCard;

