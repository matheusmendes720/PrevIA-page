// Prescriptive Data Mapper - Transform prescriptive data for component consumption

import type {
  PrescriptiveInsights,
  ComprehensivePrescriptive,
  RiskAssessment,
} from '../types/prescriptive';

export function mapRiskScoreToColor(riskScore: number): string {
  if (riskScore > 0.65) return 'red';
  if (riskScore > 0.45) return 'orange';
  if (riskScore > 0.30) return 'yellow';
  return 'green';
}

export function mapRiskLevelToBadge(riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'): 'URGENT' | 'REVIEW' | 'OK' {
  if (riskLevel === 'HIGH') return 'URGENT';
  if (riskLevel === 'MEDIUM') return 'REVIEW';
  return 'OK';
}

export function formatRiskScore(riskScore: number): string {
  return `${(riskScore * 100).toFixed(1)}%`;
}

export function getRiskLevelFromScore(riskScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (riskScore > 0.65) return 'HIGH';
  if (riskScore > 0.30) return 'MEDIUM';
  return 'LOW';
}

export function calculateConfidenceFromR2(r2: number): number {
  return Math.round(r2 * 100);
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return `R$ ${value.toFixed(2)}`;
}

export function getFamilyRiskSummary(insights: PrescriptiveInsights): Array<{
  family: string;
  risk: RiskAssessment;
  color: string;
}> {
  return Object.entries(insights.risk_assessments)
    .map(([family, risk]) => ({
      family,
      risk,
      color: mapRiskScoreToColor(risk.risk_score),
    }))
    .sort((a, b) => b.risk.risk_score - a.risk.risk_score);
}

export function getHighRiskFamilies(insights: PrescriptiveInsights): string[] {
  return Object.entries(insights.risk_assessments)
    .filter(([_, risk]) => risk.stockout_risk === 'HIGH')
    .map(([family]) => family);
}

export function getTotalInventorySavings(comprehensive: ComprehensivePrescriptive): number {
  return comprehensive.summary.total_inventory_savings;
}

export function getExpectedROI(comprehensive: ComprehensivePrescriptive): number {
  return comprehensive.summary.expected_roi;
}

