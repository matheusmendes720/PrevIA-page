'use client';

import React, { useState, useEffect } from 'react';

interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  category: 'procurement' | 'logistics' | 'maintenance' | 'strategy';
}

export default function ActionBoard() {
  const [actions, setActions] = useState<Action[]>([
    {
      id: '1',
      title: 'Comprar Transceptores 5G',
      description: 'Aumentar estoque em 30% para expansão Q1 2025',
      priority: 'high',
      status: 'pending',
      assignee: 'João Silva',
      dueDate: '2025-01-25',
      category: 'procurement',
    },
    {
      id: '2',
      title: 'Transferir Conector Óptico SP→RJ',
      description: 'Transferir 50 unidades para balancear estoque',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Maria Santos',
      dueDate: '2025-01-20',
      category: 'logistics',
    },
    {
      id: '3',
      title: 'Inspecionar Torres Costeiras',
      description: 'Verificar corrosão em torres do Nordeste',
      priority: 'medium',
      status: 'pending',
      assignee: 'Carlos Oliveira',
      dueDate: '2025-01-30',
      category: 'maintenance',
    },
    {
      id: '4',
      title: 'Renegociar Contrato Fornecedor X',
      description: 'Revisar prazos e condições de pagamento',
      priority: 'medium',
      status: 'pending',
      assignee: 'Ana Costa',
      dueDate: '2025-02-01',
      category: 'strategy',
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const getPriorityColor = (priority: string): string => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'pending': 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
      'completed': 'bg-green-500/20 text-green-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      procurement: '🛒',
      logistics: '🚚',
      maintenance: '🔧',
      strategy: '📋',
    };
    return icons[category as keyof typeof icons] || '📌';
  };

  const filteredActions = filter === 'all' ? actions : actions.filter(a => a.status === filter);

  return (
    <div className="glass-card rounded-xl p-5 animate-subtle-glow h-full flex flex-col action-board-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate">Quadro de Ações</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-brand-cyan text-brand-navy'
                : 'bg-brand-light-navy/50 text-brand-slate hover:bg-brand-light-navy'
            }`}
          >
            Todas ({actions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-brand-cyan text-brand-navy'
                : 'bg-brand-light-navy/50 text-brand-slate hover:bg-brand-light-navy'
            }`}
          >
            Pendentes ({actions.filter(a => a.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Action List */}
      <div className="flex-1 overflow-y-auto space-y-3 -mx-2 px-2">
        {filteredActions.map((action) => (
          <div
            key={action.id}
            className="p-3 bg-brand-light-navy/40 rounded-lg border border-brand-light-navy/50 hover:bg-brand-light-navy/60 transition-all"
          >
            {/* Action Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{getCategoryIcon(action.category)}</span>
                <h4 className="font-semibold text-brand-lightest-slate text-sm truncate">{action.title}</h4>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getPriorityColor(action.priority)}`}>
                {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-brand-slate mb-2">{action.description}</p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded ${getStatusColor(action.status)}`}>
                  {action.status === 'pending' ? 'Pendente' : action.status === 'in-progress' ? 'Em Progresso' : 'Concluída'}
                </span>
                <span className="text-brand-slate">
                  📅 {new Date(action.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <span className="text-brand-slate">
                👤 {action.assignee}
              </span>
            </div>

            {/* Progress Bar for in-progress items */}
            {action.status === 'in-progress' && (
              <div className="mt-2">
                <div className="w-full bg-brand-navy/50 rounded-full h-1.5">
                  <div className="bg-brand-cyan h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-brand-slate">
            <p>Nenhuma ação encontrada</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-brand-light-navy/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-brand-lightest-slate">
              {actions.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-xs text-brand-slate">Pendentes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-brand-cyan">
              {actions.filter(a => a.status === 'in-progress').length}
            </div>
            <div className="text-xs text-brand-slate">Em Progresso</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {actions.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-xs text-brand-slate">Concluídas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
