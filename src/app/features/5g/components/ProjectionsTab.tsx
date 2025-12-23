'use client';

import React, { useState, useEffect } from 'react';
import { projections } from '../data';
import PrescriptiveTooltip from '@/components/PrescriptiveTooltip';
import ScenarioComparison from '@/components/ScenarioComparison';
import { prescriptiveDataService } from '@/services/prescriptiveDataService';
import type { ComprehensivePrescriptive } from '@/types/prescriptive';

interface ProjectionsTabProps {
  isChartReady: boolean;
  scenario?: 'base' | 'optimistic' | 'adverse';
}

export default function ProjectionsTab({ isChartReady, scenario = 'base' }: ProjectionsTabProps) {
  const projectionData = projections[scenario];
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensivePrescriptive | null>(null);
  
  useEffect(() => {
    prescriptiveDataService.loadComprehensivePrescriptive().then(setComprehensiveData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Scenario Comparison */}
      {comprehensiveData && (
        <div className="mb-6">
          <ScenarioComparison />
        </div>
      )}
      
      {/* Prescriptive Insights */}
      {comprehensiveData && (
        <div className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Projeções Prescritivas 5G</h3>
            <PrescriptiveTooltip
              title="Modelo de Previsão"
              content={
                <div>
                  <p><strong>Modelo:</strong> {comprehensiveData.best_model}</p>
                  <p><strong>R²:</strong> {(comprehensiveData.model_performance.r2 * 100).toFixed(1)}%</p>
                  <p><strong>MAPE:</strong> {comprehensiveData.model_performance.mape.toFixed(1)}%</p>
                  <p><strong>Recomendação:</strong> {comprehensiveData.recommendations.frequency?.recommended_action || 'Monitorar de perto'}</p>
                </div>
              }
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectionData.map((proj, idx) => (
          <div
            key={idx}
            className="bg-brand-navy/70 backdrop-blur-xl rounded-xl border border-brand-cyan/40 p-6 animate-subtle-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-lightest-slate">{proj.period}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan">
                {proj.demandUplift}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-brand-slate mb-1">Volume</div>
                <div className="text-2xl font-bold text-brand-cyan">{proj.volume}</div>
              </div>
              <div>
                <div className="text-xs text-brand-slate mb-1">Cobertura</div>
                <div className="text-xl font-semibold text-brand-lightest-slate">{proj.coverage} municípios</div>
              </div>
            </div>
            <div className="pt-4 border-t border-brand-cyan/20">
              <p className="text-sm text-brand-light-slate">{proj.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


