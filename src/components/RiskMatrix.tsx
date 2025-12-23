import React, { useState, useEffect } from 'react';
import Card from './Card';
import RiskCard from './RiskCard';
import RiskDetailModal from './RiskDetailModal';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { PrescriptiveInsights, RiskAssessment } from '../types/prescriptive';
import { getFamilyRiskSummary } from '../lib/prescriptiveDataMapper';

const RiskMatrix: React.FC = () => {
  const [insights, setInsights] = useState<PrescriptiveInsights | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<{ family: string; risk: RiskAssessment } | null>(null);
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

  if (isLoading) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Matriz de Risco</h3>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-brand-slate">Carregando análise de risco...</div>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Matriz de Risco</h3>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-brand-slate">Nenhum dado de risco disponível</div>
        </div>
      </Card>
    );
  }

  const riskSummary = getFamilyRiskSummary(insights);
  const highRiskFamilies = riskSummary.filter(r => r.risk.stockout_risk === 'HIGH');
  const mediumRiskFamilies = riskSummary.filter(r => r.risk.stockout_risk === 'MEDIUM');
  const lowRiskFamilies = riskSummary.filter(r => r.risk.stockout_risk === 'LOW');

  return (
    <>
      <Card className="h-full">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-brand-lightest-slate mb-2">Matriz de Risco por Família</h3>
          <p className="text-sm text-brand-slate">
            Análise de risco de ruptura de estoque por família de componentes
          </p>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {/* High Risk Families */}
          {highRiskFamilies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Famílias de Alto Risco (Ação Imediata Necessária)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highRiskFamilies.map(({ family, risk }) => (
                  <RiskCard
                    key={family}
                    family={family}
                    risk={risk}
                    onCardClick={() => setSelectedFamily({ family, risk })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Risk Families */}
          {mediumRiskFamilies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Famílias de Risco Médio (Monitorar de Perto)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediumRiskFamilies.map(({ family, risk }) => (
                  <RiskCard
                    key={family}
                    family={family}
                    risk={risk}
                    onCardClick={() => setSelectedFamily({ family, risk })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Risk Families */}
          {lowRiskFamilies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Famílias de Baixo Risco (Manter Política Atual)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowRiskFamilies.map(({ family, risk }) => (
                  <RiskCard
                    key={family}
                    family={family}
                    risk={risk}
                    onCardClick={() => setSelectedFamily({ family, risk })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-brand-cyan/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-400">{highRiskFamilies.length}</p>
                <p className="text-xs text-brand-slate">Alto Risco</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{mediumRiskFamilies.length}</p>
                <p className="text-xs text-brand-slate">Médio Risco</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{lowRiskFamilies.length}</p>
                <p className="text-xs text-brand-slate">Baixo Risco</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {selectedFamily && (
        <RiskDetailModal
          family={selectedFamily.family}
          risk={selectedFamily.risk}
          insights={insights}
          onClose={() => setSelectedFamily(null)}
        />
      )}
    </>
  );
};

RiskMatrix.displayName = 'RiskMatrix';

export default RiskMatrix;

