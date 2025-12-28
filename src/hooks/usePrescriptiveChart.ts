// Hook for adding prescriptive intelligence to charts

import { useState, useEffect } from 'react';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { PrescriptiveInsights, ComprehensivePrescriptive } from '../types/prescriptive';
import { mapRiskScoreToColor } from '../lib/prescriptiveDataMapper';

export interface PrescriptiveChartData {
  riskOverlay?: {
    family: string;
    riskScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    color: string;
  };
  confidence?: number;
  actionThreshold?: number;
  prescriptiveAnnotation?: string;
}

export function usePrescriptiveChart(familyName?: string) {
  const [insights, setInsights] = useState<PrescriptiveInsights | null>(null);
  const [comprehensive, setComprehensive] = useState<ComprehensivePrescriptive | null>(null);
  const [chartData, setChartData] = useState<PrescriptiveChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [insightsData, comprehensiveData] = await Promise.all([
          prescriptiveDataService.loadPrescriptiveInsights(),
          prescriptiveDataService.loadComprehensivePrescriptive(),
        ]);

        setInsights(insightsData);
        setComprehensive(comprehensiveData);

        if (familyName && insightsData) {
          const riskAssessment = insightsData.risk_assessments[familyName];
          if (riskAssessment) {
            setChartData({
              riskOverlay: {
                family: familyName,
                riskScore: riskAssessment.risk_score,
                riskLevel: riskAssessment.stockout_risk,
                color: mapRiskScoreToColor(riskAssessment.risk_score),
              },
              confidence: comprehensiveData ? Math.round(comprehensiveData.model_performance.r2 * 100) : undefined,
              actionThreshold: riskAssessment.recommended_reorder_point_multiplier,
              prescriptiveAnnotation: riskAssessment.risk_score > 0.65
                ? 'Ação urgente recomendada'
                : riskAssessment.risk_score > 0.30
                ? 'Monitorar de perto'
                : 'Manter política atual',
            });
          }
        } else if (comprehensiveData) {
          setChartData({
            confidence: Math.round(comprehensiveData.model_performance.r2 * 100),
          });
        }
      } catch (error) {
        console.error('Error loading prescriptive chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [familyName]);

  return {
    chartData,
    insights,
    comprehensive,
    isLoading,
  };
}

