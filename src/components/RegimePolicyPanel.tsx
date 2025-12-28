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
    <div className="glass-panel rounded-xl p-4 sm:p-6 relative overflow-hidden animate-fade-in-up">
      {/* Glow Effect Layer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-white/5">
        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-bold text-brand-lightest-slate flex flex-wrap items-center gap-2">
            <span className="text-xl">📍</span>
            Regime Atual: <span className="text-brand-cyan">{currentRegime}</span>
          </h4>
          {regimeStats && (
            <p className="mt-1 text-xs sm:text-sm text-brand-slate font-medium">
              Demanda: <span className="text-brand-lightest-slate">{regimeStats.mean.toFixed(0)} ± {regimeStats.std.toFixed(0)}</span> un/d
              {regimeStats.duration && <span className="mx-2 hidden xs:inline">•</span>}
              {regimeStats.duration && <span className="block xs:inline">Duração: {regimeStats.duration}</span>}
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 sm:py-2 flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2 transition-glow">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-slate font-bold">Economia Anual</div>
          <div className="text-xl sm:text-2xl font-bold text-green-400">
            R$ {totalSavings.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Adjustments Section */}
      <div className="space-y-4">
        <h5 className="text-[10px] sm:text-xs font-bold text-brand-cyan flex items-center gap-2 uppercase tracking-[0.2em]">
          <span>🎯</span>
          Ajustes Recomendados
        </h5>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5 bg-brand-navy/30">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-brand-light-navy/50 text-brand-slate uppercase text-[10px] tracking-tight">
                <th className="px-4 py-3 font-bold">Parâmetro</th>
                <th className="px-4 py-3 text-center font-bold">Atual</th>
                <th className="px-4 py-3 text-center font-bold">Recomendado</th>
                <th className="px-4 py-3 font-bold">Impacto</th>
                {onApplyAdjustment && <th className="px-4 py-3 text-center font-bold">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {adjustments.map((adj, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-4">
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
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-brand-slate max-w-[250px] leading-relaxed italic">{adj.impact}</p>
                  </td>
                  {onApplyAdjustment && (
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onApplyAdjustment(adj.parameter)}
                        className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-lg hover:bg-brand-cyan hover:text-brand-navy transition-all border border-brand-cyan/30"
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

        {/* Mobile Filtered Card-based Adjustments View */}
        <div className="md:hidden space-y-3">
          {adjustments.map((adj, i) => (
            <div key={i} className="bg-brand-navy/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h6 className="text-sm font-bold text-brand-lightest-slate group-hover:text-brand-cyan transition-colors">{adj.parameter}</h6>
                  <div className="mt-1 flex items-center gap-2">
                    {adj.urgency && <ActionBadge status={adj.urgency} size="sm" />}
                    <p className="text-[10px] text-brand-slate font-medium uppercase tracking-wider">{adj.impact.split('.')[0]}</p>
                  </div>
                </div>
                {onApplyAdjustment && (
                  <button
                    onClick={() => onApplyAdjustment(adj.parameter)}
                    className="px-3 py-1.5 bg-brand-cyan/10 text-brand-cyan text-[10px] font-bold rounded-lg border border-brand-cyan/20 active:scale-95 transition-all"
                  >
                    APLICAR
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-center">
                  <div className="text-[9px] text-brand-slate font-bold uppercase mb-0.5">Atual</div>
                  <div className="text-sm text-brand-slate font-medium">{adj.current} {adj.unit}</div>
                </div>
                <div className="flex items-center text-brand-cyan">
                  <span className="text-xs">→</span>
                </div>
                <div className="text-center px-4 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-[9px] text-green-500/70 font-bold uppercase mb-0.5">Sugerido</div>
                  <div className="text-sm text-green-400 font-bold flex items-center gap-1 justify-center">
                    {adj.recommended} <span className="text-[8px] opacity-70">{adj.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-brand-slate/80 italic font-medium">
        <span className="flex items-center gap-1.5 bg-brand-light-navy/30 px-3 py-1.5 rounded-full border border-white/5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
          </span>
          Insight: A implementação imediata dos ajustes para SP e RJ é prioritária para manutenção do SLA contratual.
        </span>
      </div>
    </div>
  );
};

export default RegimePolicyPanel;
