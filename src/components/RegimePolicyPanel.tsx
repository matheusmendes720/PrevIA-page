'use client';

import React from 'react';
import ActionBadge, { ActionBadgeStatus } from './ActionBadge';

interface PolicyAdjustment {
  parameter: string;
  current: number;
  recommended: number;
  unit: string;
  impact: string;
  urgency?: ActionBadgeStatus;
}

interface RegimePolicyPanelProps {
  currentRegime: string;
  regimeStats?: {
    mean: number;
    std: number;
    duration: string;
  };
  adjustments: PolicyAdjustment[];
  totalSavings: number;
  onApplyAdjustment?: (parameter: string) => void;
}

const RegimePolicyPanel: React.FC<RegimePolicyPanelProps> = ({
  currentRegime,
  regimeStats,
  adjustments,
  totalSavings,
  onApplyAdjustment
}) => {
  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden animate-fade-in-up">
      {/* Glow Effect Layer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <h4 className="text-lg font-bold text-brand-lightest-slate flex items-center gap-2">
            <span className="text-2xl animate-pulse">📍</span>
            Regime Atual: <span className="text-brand-cyan">{currentRegime}</span>
          </h4>
          {regimeStats && (
            <p className="mt-1 text-sm text-brand-slate">
              Demanda: <span className="text-brand-lightest-slate font-medium">{regimeStats.mean.toFixed(0)} ± {regimeStats.std.toFixed(0)}</span> un/d
              {regimeStats.duration && <span className="mx-2">•</span>}
              {regimeStats.duration && <span>Duração: {regimeStats.duration}</span>}
            </p>
          )}
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2 text-center transition-glow">
          <div className="text-[10px] uppercase tracking-wider text-brand-slate font-bold mb-1">Economia Anual Total</div>
          <div className="text-2xl font-bold text-green-400">
            R$ {totalSavings.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Adjustments Section */}
      <div className="space-y-4">
        <h5 className="text-sm font-semibold text-brand-cyan flex items-center gap-2 uppercase tracking-widest">
          <span>🎯</span>
          Ajustes Recomendados
        </h5>

        <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-navy/30">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-brand-light-navy/50 text-brand-slate uppercase text-[10px] tracking-tighter">
                <th className="px-4 py-3 font-bold">Parâmetro</th>
                <th className="px-4 py-3 text-center font-bold">Atual</th>
                <th className="px-4 py-3 text-center font-bold">Recomendado</th>
                <th className="px-4 py-3 font-bold">Impacto</th>
                {onApplyAdjustment && <th className="px-4 py-3 text-center font-bold">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adjustments.map((adj, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-4 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand-lightest-slate group-hover:text-brand-cyan transition-colors">{adj.parameter}</span>
                      {adj.urgency && <ActionBadge status={adj.urgency} size="sm" />}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-brand-slate">
                    {adj.current} <span className="text-[10px]">{adj.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-navy/50 rounded-full border border-green-500/20">
                      <span className="font-bold text-green-400 text-lg">{adj.recommended}</span>
                      <span className="text-[10px] text-brand-slate">{adj.unit}</span>
                      <span className={`text-xs ml-1 ${adj.recommended < adj.current ? 'text-green-400' :
                          adj.recommended > adj.current ? 'text-orange-400' : 'text-brand-slate'
                        }`}>
                        {adj.recommended < adj.current ? '↓' : adj.recommended > adj.current ? '↑' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-brand-light-slate leading-relaxed">{adj.impact}</p>
                  </td>
                  {onApplyAdjustment && (
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onApplyAdjustment(adj.parameter)}
                        className="px-4 py-2 bg-brand-cyan text-brand-navy rounded-lg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20"
                      >
                        Aplicar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Insight */}
      <div className="mt-6 p-4 bg-brand-cyan/5 rounded-xl border-l-4 border-brand-cyan flex gap-3 animate-soft-glow">
        <span className="text-xl">💡</span>
        <p className="text-xs text-brand-light-slate leading-relaxed">
          <strong className="text-brand-lightest-slate">Recomendação Proativa:</strong> Aplique estes ajustes agora para otimizar
          {currentRegime === 'Peak' ? ' picos de demanda' : ' a eficiência operacional'} baseada na performance histórica
          e em modelos de otimização ML.
        </p>
      </div>
    </div>
  );
};

export default RegimePolicyPanel;

