'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Script from 'next/script';
import { apiClient } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import type { 
  MarketCluster, 
  StrategicRecommendation, 
  BusinessMetrics as MIBusinessMetrics,
  MarketIntelligenceAlert,
  AlertsSummary,
  PhaseMetrics,
  PredictiveAnalysis
} from '../../../types/features';

// TypeScript interfaces
interface BusinessFamilyMetric {
  familia_id: number;
  familia_nome: string;
  total_movimentacoes: number;
  percentual: number;
  items_unicos: number;
  sites: number;
  demanda_media: number;
  revenue?: number;
  growthPct?: number;
  slaCompliance?: number;
  penaltyRisk?: number;
}

interface BusinessTierMetric {
  tier_nivel: string;
  total_materiais: number;
  avg_sla_penalty_brl: number;
  avg_availability_target: number;
  total_penalty_risk_brl: number;
  critical_materials: number;
  revenue?: number;
  contracts?: number;
  slaCompliance?: number;
  penaltyExposure?: number;
}

interface BusinessInsight {
  category: 'Revenue' | 'Risk' | 'Opportunity';
  title: string;
  description: string;
  recommendedAction: string;
}

// New interfaces for enhanced features
interface MacroEconomicData {
  year: number;
  quarter?: string;
  ipca: number;
  materialInflation: number;
  usdBrl: number;
  selic: number;
  pibGrowth: number;
  telecomCapex: number;
}

interface SectorAnalysis {
  year: number;
  brazil5G: number;
  latam5G: number;
  global5G: number;
}

interface OperatorShare {
  operator: string;
  share: number;
  revenue: number;
}

interface CompetitorData {
  company: string;
  revenue: number;
  ebitdaPercent: number;
  leadTimeDays: number;
  slaPercent: number;
  position: string;
}

interface DemandForecast {
  date: string;
  forecast: number;
  lower: number;
  upper: number;
  actual?: number;
}

interface RevenueScenario {
  name: string;
  revenue: number;
  growth: number;
  ebitdaMargin: number;
  description: string;
}

interface ScenarioConfig {
  demandGrowth: number;
  usdRate: number;
  leadTimeIncrease: number;
}

interface RiskScenario {
  id: string;
  title: string;
  probability: number;
  impact: number;
  description: string;
}

interface MitigationStrategy {
  id: string;
  title: string;
  investment: number;
  savings: number;
  roi: number;
  timeline: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
}

// Mock data for fallback
const MOCK_FAMILIES: BusinessFamilyMetric[] = [
  {
    familia_id: 1,
    familia_nome: 'MATERIAL ELETRICO',
    total_movimentacoes: 1250,
    percentual: 28.5,
    items_unicos: 145,
    sites: 8,
    demanda_media: 125.5,
    revenue: 45000000,
    growthPct: 12.5,
    slaCompliance: 98.5,
    penaltyRisk: 85000,
  },
  {
    familia_id: 2,
    familia_nome: 'FERRO E AÇO',
    total_movimentacoes: 980,
    percentual: 22.3,
    items_unicos: 98,
    sites: 6,
    demanda_media: 98.2,
    revenue: 38000000,
    growthPct: 8.3,
    slaCompliance: 97.8,
    penaltyRisk: 120000,
  },
  {
    familia_id: 3,
    familia_nome: 'EPI',
    total_movimentacoes: 850,
    percentual: 19.4,
    items_unicos: 76,
    sites: 10,
    demanda_media: 85.0,
    revenue: 32000000,
    growthPct: 15.2,
    slaCompliance: 99.2,
    penaltyRisk: 45000,
  },
  {
    familia_id: 4,
    familia_nome: 'MATERIAL CIVIL',
    total_movimentacoes: 720,
    percentual: 16.4,
    items_unicos: 65,
    sites: 5,
    demanda_media: 72.5,
    revenue: 28000000,
    growthPct: 5.8,
    slaCompliance: 98.1,
    penaltyRisk: 65000,
  },
  {
    familia_id: 5,
    familia_nome: 'FERRAMENTAS E EQUIPAMENTOS',
    total_movimentacoes: 580,
    percentual: 13.2,
    items_unicos: 52,
    sites: 4,
    demanda_media: 58.3,
    revenue: 22000000,
    growthPct: 3.2,
    slaCompliance: 97.5,
    penaltyRisk: 55000,
  },
];

const MOCK_TIERS: BusinessTierMetric[] = [
  {
    tier_nivel: 'TIER_1',
    total_materiais: 245,
    avg_sla_penalty_brl: 1500,
    avg_availability_target: 99.5,
    total_penalty_risk_brl: 367500,
    critical_materials: 45,
    revenue: 40000000,
    contracts: 12,
    slaCompliance: 99.5,
    penaltyExposure: 367500,
  },
  {
    tier_nivel: 'TIER_2',
    total_materiais: 380,
    avg_sla_penalty_brl: 850,
    avg_availability_target: 98.7,
    total_penalty_risk_brl: 323000,
    critical_materials: 68,
    revenue: 25000000,
    contracts: 28,
    slaCompliance: 98.7,
    penaltyExposure: 323000,
  },
  {
    tier_nivel: 'TIER_3',
    total_materiais: 520,
    avg_sla_penalty_brl: 450,
    avg_availability_target: 97.8,
    total_penalty_risk_brl: 234000,
    critical_materials: 95,
    revenue: 10000000,
    contracts: 45,
    slaCompliance: 97.8,
    penaltyExposure: 234000,
  },
];

const MOCK_INSIGHTS: BusinessInsight[] = [
  {
    category: 'Revenue',
    title: '💰 Oportunidade de Upsell - Tier 2',
    description: 'Cliente Tier 2 apresenta crescimento de 15% e alta satisfação. Oportunidade de upgrade para Tier 1 com contrato premium.',
    recommendedAction: 'Agendar reunião comercial para apresentar pacote Tier 1. Potencial de receita adicional: R$ 2.5M/ano.',
  },
  {
    category: 'Risk',
    title: '⚠️ Risco de Penalidade - Tier 3',
    description: 'Tier 3 apresenta SLA de 97.8%, abaixo da meta de 98%. Risco de penalidades de R$ 234k se não houver ação preventiva.',
    recommendedAction: 'Aumentar visitas preventivas em 30% para Tier 3. Investimento: R$ 45k. ROI: 420% (evita penalidades).',
  },
  {
    category: 'Opportunity',
    title: '🚀 Crescimento Material Elétrico',
    description: 'Família Material Elétrico cresceu 12.5% QoQ, impulsionada pela expansão 5G. Maior participação na receita total.',
    recommendedAction: 'Aumentar estoque de segurança em 25% para atender demanda crescente. Revisar fornecedores críticos.',
  },
  {
    category: 'Risk',
    title: '🔴 Risco Crítico - Ferro e Aço',
    description: 'Família Ferro e Aço apresenta risco de penalidade de R$ 120k e SLA de 97.8%. Requer atenção imediata.',
    recommendedAction: 'Diversificar fornecedores e aumentar buffer stock. Revisar contratos de SLA para mitigar riscos.',
  },
  {
    category: 'Revenue',
    title: '📈 EPI - Alta Performance',
    description: 'Família EPI apresenta SLA de 99.2% e crescimento de 15.2%. Modelo de excelência para outras famílias.',
    recommendedAction: 'Documentar práticas de sucesso da família EPI e replicar para outras famílias de alto risco.',
  },
  {
    category: 'Opportunity',
    title: '🎯 Expansão Material Civil',
    description: 'Família Material Civil apresenta crescimento estável de 5.8% e baixo risco. Oportunidade de expansão de portfólio.',
    recommendedAction: 'Explorar novos fornecedores locais para reduzir lead times. Potencial de aumento de margem em 8-12%.',
  },
];

// Mock data for Market Intelligence (fallback) - moved outside component
const MOCK_MARKET_CLUSTERS: MarketCluster[] = [
  { name: 'High Performance', datasets: 45, avgMAPE: 8.5, avgR2: 0.92, topPerformers: [], status: 'excellent' },
  { name: 'Medium Performance', datasets: 32, avgMAPE: 15.2, avgR2: 0.78, topPerformers: [], status: 'good' },
  { name: 'Low Performance', datasets: 18, avgMAPE: 28.7, avgR2: 0.65, topPerformers: [], status: 'needs_improvement' },
  { name: 'Emerging', datasets: 12, avgMAPE: 22.3, avgR2: 0.71, topPerformers: [], status: 'good' },
];

const MOCK_BUSINESS_METRICS: MIBusinessMetrics = {
  datasets_analyzed: 107,
  roi_percent: 245.5,
  total_annual_savings: -1250000,
  payback_period_months: 6,
  inventory_savings: -450000,
  stockout_reduction: -380000,
  operational_efficiency: -420000,
  average_mape: 12.8,
  baseline_mape: 25.0,
  mape_improvement: 48.8,
};

const MOCK_TEMPORAL_TRENDS: PhaseMetrics[] = [
  { phase: 'phase_1', avgMAPE: 18.5, mapeStd: 3.2, avgR2: 0.72, datasets: 35 },
  { phase: 'phase_2', avgMAPE: 15.2, mapeStd: 2.8, avgR2: 0.78, datasets: 42 },
  { phase: 'phase_3', avgMAPE: 12.8, mapeStd: 2.1, avgR2: 0.85, datasets: 50 },
];

const MOCK_PREDICTIVE_ANALYSIS: PredictiveAnalysis = {
  predictedMAPE: 10.5,
  predictedR2: 0.88,
  trend: 'improving',
  historical: MOCK_TEMPORAL_TRENDS,
};

const MOCK_STRATEGIC_RECOMMENDATIONS: StrategicRecommendation[] = [
  {
    id: 'rec-1',
    category: 'Inventory Optimization',
    priority: 'critical',
    recommendation: 'Reduzir estoque de segurança em 15% para famílias de baixa demanda',
    actionItems: [
      'Revisar políticas de reorder point para 20 datasets identificados',
      'Implementar modelo de previsão mais preciso para estas famílias',
      'Monitorar stockout rate semanalmente por 4 semanas',
    ],
    impact: 'Economia estimada de R$ 450k/ano em capital imobilizado',
    deadline: '2024-12-31',
    status: 'pending',
  },
  {
    id: 'rec-2',
    category: 'Supplier Diversification',
    priority: 'high',
    recommendation: 'Diversificar fornecedores para materiais críticos Tier 1',
    actionItems: [
      'Identificar 3 fornecedores alternativos para top 10 materiais críticos',
      'Negociar contratos de backup com lead time < 7 dias',
      'Implementar sistema de alerta para dependência única de fornecedor',
    ],
    impact: 'Redução de risco de stockout em 60% para materiais críticos',
    deadline: '2025-01-15',
    status: 'pending',
  },
  {
    id: 'rec-3',
    category: 'ML Model Improvement',
    priority: 'high',
    recommendation: 'Retreinar modelos para clusters de baixa performance',
    actionItems: [
      'Coletar dados adicionais para 18 datasets do cluster "Low Performance"',
      'Aplicar feature engineering específico para padrões sazonais',
      'Validar novos modelos com cross-validation temporal',
    ],
    impact: 'Melhoria esperada de MAPE de 28.7% para 18% no cluster',
    deadline: '2025-01-30',
    status: 'in_progress',
  },
  {
    id: 'rec-4',
    category: 'SLA Compliance',
    priority: 'medium',
    recommendation: 'Aumentar visitas preventivas em Tier 3 em 30%',
    actionItems: [
      'Contratar 2 técnicos adicionais para suporte Tier 3',
      'Implementar roteamento otimizado para reduzir tempo de deslocamento',
      'Criar dashboard de monitoramento de SLA em tempo real',
    ],
    impact: 'Redução de exposição a penalidades de R$ 234k para R$ 120k',
    deadline: '2025-02-15',
    status: 'pending',
  },
  {
    id: 'rec-5',
    category: 'Data Quality',
    priority: 'medium',
    recommendation: 'Implementar validação automática de dados de entrada',
    actionItems: [
      'Criar pipeline de validação para detectar outliers e valores faltantes',
      'Implementar alertas automáticos para dados inconsistentes',
      'Documentar processos de limpeza de dados',
    ],
    impact: 'Melhoria de 5-8% na precisão dos modelos ML',
    deadline: '2025-01-20',
    status: 'pending',
  },
];

const MOCK_ALERTS: MarketIntelligenceAlert[] = [
  {
    id: 'alert-1',
    severity: 'CRITICAL',
    category: 'Model Performance',
    dataset: 'MATERIAL_ELETRICO_TIER1',
    model: 'LSTM_v2',
    metric: 'MAPE',
    value: 32.5,
    threshold: 20.0,
    message: 'MAPE acima do threshold crítico. Modelo requer retreinamento imediato.',
    recommendation: 'Retreinar modelo com dados mais recentes e aplicar feature engineering adicional.',
    status: 'pending',
  },
  {
    id: 'alert-2',
    severity: 'CRITICAL',
    category: 'Data Quality',
    dataset: 'FERRO_ACO_TIER2',
    model: 'Prophet_v1',
    metric: 'Missing Data',
    value: 15.2,
    threshold: 5.0,
    message: '15.2% de dados faltantes detectados no último mês. Impacta precisão do modelo.',
    recommendation: 'Investigar causa raiz dos dados faltantes e implementar imputação robusta.',
    status: 'acknowledged',
  },
  {
    id: 'alert-3',
    severity: 'HIGH',
    category: 'Forecast Accuracy',
    dataset: 'EPI_TIER1',
    model: 'XGBoost_v3',
    metric: 'R²',
    value: 0.58,
    threshold: 0.70,
    message: 'R² abaixo do threshold. Modelo não está capturando padrões adequadamente.',
    recommendation: 'Revisar features e considerar adicionar variáveis externas (sazonalidade, eventos).',
    status: 'in_progress',
  },
  {
    id: 'alert-4',
    severity: 'HIGH',
    category: 'Model Drift',
    dataset: 'MATERIAL_CIVIL_TIER2',
    model: 'ARIMA_v2',
    metric: 'Drift Score',
    value: 0.42,
    threshold: 0.30,
    message: 'Detectado drift significativo no modelo. Distribuição de dados mudou.',
    recommendation: 'Retreinar modelo com dados recentes e validar performance em dados de teste.',
    status: 'pending',
  },
  {
    id: 'alert-5',
    severity: 'MEDIUM',
    category: 'Forecast Accuracy',
    dataset: 'FERRAMENTAS_TIER3',
    model: 'Linear_Regression_v1',
    metric: 'MAPE',
    value: 18.5,
    threshold: 15.0,
    message: 'MAPE ligeiramente acima do threshold. Monitorar tendência.',
    recommendation: 'Ajustar hiperparâmetros ou considerar modelo mais complexo se degradação continuar.',
    status: 'pending',
  },
  {
    id: 'alert-6',
    severity: 'MEDIUM',
    category: 'Data Quality',
    dataset: 'MATERIAL_ELETRICO_TIER3',
    model: 'Prophet_v1',
    metric: 'Outliers',
    value: 8.3,
    threshold: 5.0,
    message: '8.3% de outliers detectados. Pode indicar mudança no padrão de demanda.',
    recommendation: 'Investigar outliers para determinar se são erros de dados ou mudanças reais.',
    status: 'pending',
  },
];

const MOCK_ALERTS_SUMMARY: AlertsSummary = {
  total: MOCK_ALERTS.length,
  critical: MOCK_ALERTS.filter(a => a.severity === 'CRITICAL').length,
  high: MOCK_ALERTS.filter(a => a.severity === 'HIGH').length,
  medium: MOCK_ALERTS.filter(a => a.severity === 'MEDIUM').length,
  low: MOCK_ALERTS.filter(a => a.severity === 'LOW').length,
};

// New mock data for enhanced features
const MOCK_MACRO_DATA: MacroEconomicData[] = [
  { year: 2024, quarter: 'Q1', ipca: 4.5, materialInflation: 6.2, usdBrl: 4.85, selic: 11.75, pibGrowth: 2.8, telecomCapex: 45 },
  { year: 2024, quarter: 'Q2', ipca: 4.2, materialInflation: 5.9, usdBrl: 5.05, selic: 11.25, pibGrowth: 2.6, telecomCapex: 46 },
  { year: 2024, quarter: 'Q3', ipca: 4.0, materialInflation: 5.6, usdBrl: 5.20, selic: 10.75, pibGrowth: 2.5, telecomCapex: 47 },
  { year: 2024, quarter: 'Q4', ipca: 3.9, materialInflation: 5.4, usdBrl: 5.30, selic: 10.50, pibGrowth: 2.7, telecomCapex: 47.5 },
  { year: 2025, quarter: 'Q1', ipca: 3.8, materialInflation: 5.1, usdBrl: 5.35, selic: 10.25, pibGrowth: 2.5, telecomCapex: 48 },
  { year: 2025, quarter: 'Q2', ipca: 3.7, materialInflation: 4.9, usdBrl: 5.40, selic: 10.00, pibGrowth: 2.4, telecomCapex: 49 },
  { year: 2025, quarter: 'Q3', ipca: 3.6, materialInflation: 4.8, usdBrl: 5.45, selic: 9.75, pibGrowth: 2.6, telecomCapex: 50 },
  { year: 2025, quarter: 'Q4', ipca: 3.5, materialInflation: 4.7, usdBrl: 5.48, selic: 9.50, pibGrowth: 2.7, telecomCapex: 51 },
  { year: 2026, quarter: 'Q1F', ipca: 3.5, materialInflation: 4.8, usdBrl: 5.50, selic: 9.25, pibGrowth: 2.7, telecomCapex: 52 },
];

const MOCK_SECTOR_DATA: SectorAnalysis[] = [
  { year: 2024, brazil5G: 15, latam5G: 12, global5G: 25 },
  { year: 2025, brazil5G: 35, latam5G: 28, global5G: 45 },
  { year: 2026, brazil5G: 55, latam5G: 45, global5G: 60 },
];

const MOCK_OPERATOR_SHARES: OperatorShare[] = [
  { operator: 'Claro', share: 35, revenue: 311.5 },
  { operator: 'Vivo', share: 32, revenue: 284.8 },
  { operator: 'TIM', share: 28, revenue: 249.2 },
  { operator: 'Outros', share: 5, revenue: 44.5 },
];

const MOCK_COMPETITORS: CompetitorData[] = [
  { company: 'Nova Corrente', revenue: 890, ebitdaPercent: 28, leadTimeDays: 21, slaPercent: 98.5, position: 'Market Leader' },
  { company: 'TG Telecom', revenue: 720, ebitdaPercent: 25, leadTimeDays: 28, slaPercent: 97.2, position: 'Challenger' },
  { company: 'Infraset', revenue: 580, ebitdaPercent: 22, leadTimeDays: 35, slaPercent: 96.8, position: 'Regional' },
];

const MOCK_DEMAND_FORECAST: DemandForecast[] = Array.from({ length: 90 }, (_, i) => {
  const baseValue = 1000 + i * 5;
  const seasonal = Math.sin((i * Math.PI) / 30) * 100;
  const trend = i * 2;
  const forecast = baseValue + seasonal + trend;
  return {
    date: new Date(2026, 0, 1 + i).toISOString().split('T')[0],
    forecast: Math.round(forecast),
    lower: Math.round(forecast * 0.85),
    upper: Math.round(forecast * 1.15),
  };
});

const MOCK_REVENUE_SCENARIOS: RevenueScenario[] = [
  { name: 'Base', revenue: 890, growth: 12, ebitdaMargin: 28, description: 'Cenário base com crescimento moderado' },
  { name: 'Otimista', revenue: 1040, growth: 25, ebitdaMargin: 30, description: 'Cenário otimista com forte expansão 5G' },
  { name: 'Pessimista', revenue: 780, growth: -8, ebitdaMargin: 25, description: 'Cenário pessimista com retração de mercado' },
];

const MOCK_RISK_SCENARIOS: RiskScenario[] = [
  { id: 'risk-1', title: 'USD Spike R$ 6.50', probability: 15, impact: -85, description: 'Alta abrupta do dólar aumenta custos de importação' },
  { id: 'risk-2', title: 'Demand Collapse -20%', probability: 8, impact: -180, description: 'Retração severa do mercado telecom' },
  { id: 'risk-3', title: 'Supply Chain Crisis +30d', probability: 12, impact: -65, description: 'Crise logística aumenta lead time drasticamente' },
  { id: 'risk-4', title: 'SELIC 13.5%', probability: 18, impact: -42, description: 'Aumento da taxa de juros eleva custo financeiro' },
];

const MOCK_MITIGATION_STRATEGIES: MitigationStrategy[] = [
  {
    id: 'mit-1',
    title: 'USD Hedging Strategy',
    investment: 5,
    savings: 35,
    roi: 7.0,
    timeline: 'Q1 2026',
    status: 'pending',
    description: 'Implementar hedge cambial para 60% das compras USD-indexed',
  },
  {
    id: 'mit-2',
    title: 'Buffer Stock Optimization',
    investment: 18,
    savings: 45,
    roi: 2.5,
    timeline: 'Q2 2026',
    status: 'pending',
    description: 'Aumentar estoque de segurança de 21d para 35d em materiais críticos',
  },
  {
    id: 'mit-3',
    title: 'Supplier Diversification',
    investment: 12,
    savings: 28,
    roi: 2.3,
    timeline: 'Q1-Q2 2026',
    status: 'in_progress',
    description: 'Diversificar fornecedores para reduzir dependência única',
  },
  {
    id: 'mit-4',
    title: 'Dynamic Repricing Strategy',
    investment: 2,
    savings: 65,
    roi: 32.5,
    timeline: 'Q1 2026',
    status: 'pending',
    description: 'Implementar reajuste de preços indexado a IPCA + USD',
  },
];

// VARIANCE ANALYSIS DATA
const MOCK_VARIANCE_DATA = [
  { site: 'Site SP-01', familia: 'Antenas', variance: 18.5, stdDev: 4.2, coefficient: 0.23, trend: 'increasing' },
  { site: 'Site SP-01', familia: 'Cabos', variance: 12.3, stdDev: 3.1, coefficient: 0.25, trend: 'stable' },
  { site: 'Site SP-01', familia: 'RRUs', variance: 25.8, stdDev: 5.8, coefficient: 0.22, trend: 'increasing' },
  { site: 'Site RJ-02', familia: 'Antenas', variance: 22.1, stdDev: 4.9, coefficient: 0.22, trend: 'increasing' },
  { site: 'Site RJ-02', familia: 'Cabos', variance: 8.7, stdDev: 2.3, coefficient: 0.26, trend: 'decreasing' },
  { site: 'Site RJ-02', familia: 'RRUs', variance: 31.4, stdDev: 6.5, coefficient: 0.21, trend: 'increasing' },
  { site: 'Site MG-03', familia: 'Antenas', variance: 15.2, stdDev: 3.8, coefficient: 0.25, trend: 'stable' },
  { site: 'Site MG-03', familia: 'Cabos', variance: 10.1, stdDev: 2.7, coefficient: 0.27, trend: 'stable' },
  { site: 'Site MG-03', familia: 'RRUs', variance: 19.6, stdDev: 4.6, coefficient: 0.23, trend: 'decreasing' },
  { site: 'Site BA-04', familia: 'Antenas', variance: 28.9, stdDev: 6.2, coefficient: 0.21, trend: 'increasing' },
  { site: 'Site BA-04', familia: 'Cabos', variance: 14.5, stdDev: 3.5, coefficient: 0.24, trend: 'stable' },
  { site: 'Site BA-04', familia: 'RRUs', variance: 35.2, stdDev: 7.1, coefficient: 0.20, trend: 'increasing' },
];

// CORRELATION ANALYSIS DATA
const MOCK_CORRELATION_DATA = [
  { leadTime: 18, demanda: 420, familia: 'Antenas', elasticity: -0.65 },
  { leadTime: 22, demanda: 385, familia: 'Antenas', elasticity: -0.65 },
  { leadTime: 28, demanda: 310, familia: 'Antenas', elasticity: -0.65 },
  { leadTime: 15, demanda: 680, familia: 'Cabos', elasticity: -0.72 },
  { leadTime: 21, demanda: 590, familia: 'Cabos', elasticity: -0.72 },
  { leadTime: 25, demanda: 510, familia: 'Cabos', elasticity: -0.72 },
  { leadTime: 30, demanda: 450, familia: 'Cabos', elasticity: -0.72 },
  { leadTime: 20, demanda: 280, familia: 'RRUs', elasticity: -0.58 },
  { leadTime: 26, demanda: 230, familia: 'RRUs', elasticity: -0.58 },
  { leadTime: 32, demanda: 190, familia: 'RRUs', elasticity: -0.58 },
  { leadTime: 38, demanda: 165, familia: 'RRUs', elasticity: -0.58 },
  { leadTime: 19, demanda: 520, familia: 'Conectores', elasticity: -0.68 },
  { leadTime: 24, demanda: 460, familia: 'Conectores', elasticity: -0.68 },
  { leadTime: 29, demanda: 390, familia: 'Conectores', elasticity: -0.68 },
];

// SENSITIVITY FACTORS
const MOCK_SENSITIVITY_FACTORS = [
  { factor: 'Crescimento de Demanda', baseImpact: 0, lowImpact: -180, highImpact: 280, unit: 'R$ M' },
  { factor: 'Taxa de Câmbio (USD)', baseImpact: 0, lowImpact: -120, highImpact: 95, unit: 'R$ M' },
  { factor: 'Lead Time Médio', baseImpact: 0, lowImpact: -85, highImpact: 45, unit: 'R$ M' },
  { factor: 'Taxa SELIC', baseImpact: 0, lowImpact: -65, highImpact: 38, unit: 'R$ M' },
  { factor: 'Inflação de Materiais', baseImpact: 0, lowImpact: -55, highImpact: 25, unit: 'R$ M' },
  { factor: 'SLA Compliance', baseImpact: 0, lowImpact: -42, highImpact: 78, unit: 'R$ M' },
];

export default function BusinessFeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);
  const [isChartLoaded, setIsChartLoaded] = useState(() => {
    // Check if Chart.js is already loaded on mount (e.g., from previous navigation)
    if (typeof window !== 'undefined') {
      return typeof (window as any).Chart !== 'undefined';
    }
    return false;
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);
  const router = useRouter();
  // Two-tier tab navigation state
  const [mainTab, setMainTab] = useState<'visao-geral' | 'mercado' | 'previsoes' | 'cenarios'>('visao-geral');
  const [subTabs, setSubTabs] = useState<Record<string, string>>({
    'visao-geral': 'agregacao',
    'mercado': 'macro',
    'previsoes': 'demanda',
    'cenarios': 'configuracao'
  });
  
  const [currentInsightIdx, setCurrentInsightIdx] = useState(0);
  
  // Scenario configuration state
  const [scenarioConfig, setScenarioConfig] = useState<ScenarioConfig>({
    demandGrowth: 12,
    usdRate: 5.20,
    leadTimeIncrease: 0,
  });
  
  // Chart instances refs - store all chart instances to properly destroy them
  const chartRefs = useRef<{ [key: string]: any }>({});
  
  // Market Intelligence state
  const [marketClusters, setMarketClusters] = useState<MarketCluster[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [strategicRecommendations, setStrategicRecommendations] = useState<StrategicRecommendation[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<MIBusinessMetrics | null>(null);
  const [temporalTrends, setTemporalTrends] = useState<PhaseMetrics[]>([]);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [alerts, setAlerts] = useState<MarketIntelligenceAlert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState<AlertsSummary | null>(null);
  const [miLoading, setMiLoading] = useState(false);

  // Log tab changes
  useEffect(() => {
    console.log('📊 Main tab changed to:', mainTab, '| Sub-tab:', subTabs[mainTab]);
  }, [mainTab, subTabs]);

  // Fetch Market Intelligence data
  useEffect(() => {
    const fetchMarketIntelligence = async () => {
      const currentSubTab = subTabs[mainTab];
      if (!['market-intelligence', 'strategic-recommendations', 'business-metrics', 'temporal-trends', 'predictive-analytics', 'alerts'].includes(currentSubTab)) {
        return;
      }

      setMiLoading(true);
      try {
        // Fetch clusters
        if (currentSubTab === 'market-intelligence') {
          const clustersRes = await apiClient.getMarketClusters();
          if (clustersRes.status === 'success' && clustersRes.data && clustersRes.data.length > 0) {
            setMarketClusters(clustersRes.data);
          } else {
            setMarketClusters(MOCK_MARKET_CLUSTERS);
          }

          const performersRes = await apiClient.getTopPerformers(10);
          if (performersRes.status === 'success' && performersRes.data && performersRes.data.length > 0) {
            setTopPerformers(performersRes.data);
          } else {
            setTopPerformers([]);
          }
        }

        // Fetch strategic recommendations
        if (currentSubTab === 'strategic-recommendations') {
          const recRes = await apiClient.getStrategicRecommendations();
          if (recRes.status === 'success' && recRes.data && recRes.data.recommendations && recRes.data.recommendations.length > 0) {
            setStrategicRecommendations(recRes.data.recommendations);
          } else {
            setStrategicRecommendations(MOCK_STRATEGIC_RECOMMENDATIONS);
          }
        }

        // Fetch business metrics
        if (currentSubTab === 'business-metrics') {
          const metricsRes = await apiClient.getBusinessMetrics();
          if (metricsRes.status === 'success' && metricsRes.data) {
            setBusinessMetrics(metricsRes.data);
          } else {
            setBusinessMetrics(MOCK_BUSINESS_METRICS);
          }
        }

        // Fetch temporal trends
        if (currentSubTab === 'temporal-trends') {
          const trendsRes = await apiClient.getTemporalTrends();
          if (trendsRes.status === 'success' && trendsRes.data && trendsRes.data.length > 0) {
            setTemporalTrends(trendsRes.data);
          } else {
            setTemporalTrends(MOCK_TEMPORAL_TRENDS);
          }
        }

        // Fetch predictive analysis
        if (currentSubTab === 'predictive-analytics') {
          const predRes = await apiClient.getPredictiveAnalysis();
          if (predRes.status === 'success' && predRes.data) {
            setPredictiveAnalysis(predRes.data);
          } else {
            setPredictiveAnalysis(MOCK_PREDICTIVE_ANALYSIS);
          }
        }

        // Fetch alerts
        if (currentSubTab === 'alerts') {
          const alertsRes = await apiClient.getMarketIntelligenceAlerts();
          if (alertsRes.status === 'success' && alertsRes.data && alertsRes.data.alerts && alertsRes.data.alerts.length > 0) {
            setAlerts(alertsRes.data.alerts);
            setAlertsSummary(alertsRes.data.summary || null);
          } else {
            setAlerts(MOCK_ALERTS);
            setAlertsSummary(MOCK_ALERTS_SUMMARY);
          }
        }
      } catch (error: any) {
        console.error('Error fetching market intelligence data:', error);
        // Set mock data on error
        if (currentSubTab === 'market-intelligence') {
          setMarketClusters(MOCK_MARKET_CLUSTERS);
        } else if (currentSubTab === 'strategic-recommendations') {
          setStrategicRecommendations(MOCK_STRATEGIC_RECOMMENDATIONS);
        } else if (currentSubTab === 'business-metrics') {
          setBusinessMetrics(MOCK_BUSINESS_METRICS);
        } else if (currentSubTab === 'temporal-trends') {
          setTemporalTrends(MOCK_TEMPORAL_TRENDS);
        } else if (currentSubTab === 'predictive-analytics') {
          setPredictiveAnalysis(MOCK_PREDICTIVE_ANALYSIS);
        } else if (currentSubTab === 'alerts') {
          setAlerts(MOCK_ALERTS);
          setAlertsSummary(MOCK_ALERTS_SUMMARY);
        }
      } finally {
        setMiLoading(false);
      }
    };

    fetchMarketIntelligence();
  }, [mainTab, subTabs]);
  
  const [apiData, setApiData] = useState<{
    families: BusinessFamilyMetric[];
    tiers: BusinessTierMetric[];
    loading: boolean;
    error: string | null;
  }>({
    families: [],
    tiers: [],
    loading: true,
    error: null,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setApiData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Fetch top 5 families
        let families: BusinessFamilyMetric[] = [];
        try {
          const familiesResponse = await apiClient.getTop5Families();
          families = Array.isArray(familiesResponse) ? familiesResponse : [];
          if (families.length > 0) {
            console.log('✅ Fetched top 5 families from API:', families.length);
            // Enrich with calculated fields
            families = families.map(f => ({
              ...f,
              revenue: f.total_movimentacoes * 35000,
              growthPct: Math.random() * 15 + 3,
              slaCompliance: 95 + Math.random() * 5,
              penaltyRisk: f.total_movimentacoes * 50,
            }));
          }
        } catch (e) {
          console.warn('Could not fetch families:', e);
        }

        // Fetch tier analytics
        let tiers: BusinessTierMetric[] = [];
        try {
          const tiersResponse = await apiClient.getTierAnalytics();
          tiers = Array.isArray(tiersResponse) ? tiersResponse : [];
          if (tiers.length > 0) {
            console.log('✅ Fetched tier analytics from API:', tiers.length);
            // Enrich with calculated fields
            tiers = tiers.map(t => ({
              ...t,
              revenue: t.total_materiais * 150000,
              contracts: Math.floor(t.total_materiais / 20),
              slaCompliance: t.avg_availability_target,
              penaltyExposure: t.total_penalty_risk_brl,
            }));
          }
        } catch (e) {
          console.warn('Could not fetch tiers:', e);
        }

        // Use mock data if API data is empty
        if (families.length === 0) {
          console.log('📊 Using mock data for families (API returned empty)');
          families = MOCK_FAMILIES;
        }
        if (tiers.length === 0) {
          console.log('📊 Using mock data for tiers (API returned empty)');
          tiers = MOCK_TIERS;
        }

        console.log('📊 Business data loaded:', {
          familiesCount: families.length,
          tiersCount: tiers.length,
          totalRevenue: families.reduce((sum, f) => sum + (f.revenue || 0), 0),
        });

        setApiData({
          families,
          tiers,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching business data:', error);
        setApiData({
          families: MOCK_FAMILIES,
          tiers: MOCK_TIERS,
          loading: false,
          error: error.message || 'Erro ao carregar dados',
        });
      }
    };

    fetchData();
  }, []);

  // Calculate summary metrics - only when data is loaded
  const summary = useMemo(() => {
    // Return default values if data is still loading or empty
    if (apiData.loading || apiData.families.length === 0 || apiData.tiers.length === 0) {
      return {
        totalRevenue: 0,
        growthQoQ: 0,
        biggestRisk: 'TIER_1',
        biggestRiskExposure: 0,
        narrative: 'Carregando dados...',
      };
    }

    const totalRevenue = apiData.families.reduce((sum, f) => sum + (f.revenue || 0), 0);
    
    // Only calculate growth if we have revenue
    let growthQoQ = 0;
    if (totalRevenue > 0) {
      const previousRevenue = totalRevenue / 1.08;
      growthQoQ = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    }
    
    const biggestRisk = apiData.tiers.reduce((max, t) => 
      (t.penaltyExposure || 0) > (max.penaltyExposure || 0) ? t : max,
      apiData.tiers[0] || MOCK_TIERS[0]
    );

    const summaryData = {
      totalRevenue,
      growthQoQ,
      biggestRisk: biggestRisk.tier_nivel,
      biggestRiskExposure: biggestRisk.penaltyExposure || 0,
      narrative: `Receita total de R$ ${(totalRevenue / 1000000).toFixed(1)}M com crescimento de ${growthQoQ.toFixed(1)}% QoQ. Maior risco em ${biggestRisk.tier_nivel} com exposição de R$ ${((biggestRisk.penaltyExposure || 0) / 1000).toFixed(0)}k em penalidades.`,
    };

    console.log('📊 Summary metrics calculated:', {
      totalRevenue: `R$ ${(totalRevenue / 1000000).toFixed(1)}M`,
      growthQoQ: `${growthQoQ.toFixed(1)}%`,
      biggestRisk: biggestRisk.tier_nivel,
      biggestRiskExposure: `R$ ${((biggestRisk.penaltyExposure || 0) / 1000).toFixed(0)}k`,
    });

    return summaryData;
  }, [apiData.families, apiData.tiers, apiData.loading]);

  // Filter insights by category
  const filteredInsights = useMemo(() => {
    // Return all insights for new tab structure
    return MOCK_INSIGHTS;
  }, []);

  const currentInsight = filteredInsights[currentInsightIdx] || filteredInsights[0];

  // Initialize charts when Chart.js is loaded
  // Use a separate effect to watch for container readiness
  useEffect(() => {
  // Check if Chart.js is available even if isChartLoaded is false (e.g., already loaded from previous page)
  const chartJsAvailable = typeof (window as any).Chart !== 'undefined';
  if (chartJsAvailable && !isChartLoaded) {
    // Chart.js is loaded but state wasn't set - fix it immediately
    setIsChartLoaded(true);
    return; // Will re-run after state update
  }
}, [isChartLoaded]);

  // Separate effect to initialize when both Chart.js and container are ready
  useEffect(() => {
    if (!isChartLoaded || !containerReady || initRef.current) {
      return;
    }

    const initPage = () => {
      if (typeof (window as any).Chart === 'undefined') {
        console.warn('Chart.js not loaded yet');
        return;
      }

      // Use requestAnimationFrame for immediate execution on next frame (faster than setTimeout)
      requestAnimationFrame(() => {
        // Configure Chart.js defaults
        if (typeof (window as any).Chart !== 'undefined') {
          console.log('📊 Chart.js loaded, initializing business features page');
          (window as any).Chart.defaults.color = '#e0e8f0';
          (window as any).Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.2)';
          (window as any).Chart.defaults.backgroundColor = 'rgba(32, 160, 132, 0.15)';
          (window as any).Chart.defaults.font.size = 11;
          (window as any).Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
          (window as any).Chart.defaults.font.weight = '500';
          (window as any).Chart.defaults.plugins = (window as any).Chart.defaults.plugins || {};
          (window as any).Chart.defaults.plugins.legend = (window as any).Chart.defaults.plugins.legend || {};
          (window as any).Chart.defaults.plugins.legend.labels = (window as any).Chart.defaults.plugins.legend.labels || {};
          (window as any).Chart.defaults.plugins.legend.labels.font = (window as any).Chart.defaults.plugins.legend.labels.font || {};
          (window as any).Chart.defaults.plugins.legend.labels.font.size = 11;
          (window as any).Chart.defaults.plugins.legend.labels.font.weight = '500';
          (window as any).Chart.defaults.plugins.tooltip = (window as any).Chart.defaults.plugins.tooltip || {};
          (window as any).Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
          (window as any).Chart.defaults.plugins.tooltip.bodyFont = { size: 11, weight: '500' };
          (window as any).Chart.defaults.plugins.tooltip.padding = 10;
          (window as any).Chart.defaults.elements = (window as any).Chart.defaults.elements || {};
          (window as any).Chart.defaults.elements.bar = (window as any).Chart.defaults.elements.bar || {};
          (window as any).Chart.defaults.elements.bar.borderWidth = 2;
          (window as any).Chart.defaults.elements.line = (window as any).Chart.defaults.elements.line || {};
          (window as any).Chart.defaults.elements.line.borderWidth = 3;
          (window as any).Chart.defaults.elements.point = (window as any).Chart.defaults.elements.point || {};
          (window as any).Chart.defaults.elements.point.radius = 6;
          (window as any).Chart.defaults.elements.point.hoverRadius = 8;
        }

        initRef.current = true;
        setIsInitialized(true);
      });
    };

    initPage();
  }, [isChartLoaded, containerReady]); // Re-run when container becomes ready

  // Helper function to safely destroy and create chart
  const createOrUpdateChart = (canvasId: string, config: any) => {
    if (typeof (window as any).Chart === 'undefined') {
      console.warn('Chart.js not available');
      return null;
    }

    const Chart = (window as any).Chart;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    
    if (!canvas) {
      console.warn('Canvas not found:', canvasId);
      return null;
    }

    // Destroy existing chart if it exists (from refs)
    if (chartRefs.current[canvasId]) {
      try {
        chartRefs.current[canvasId].destroy();
        delete chartRefs.current[canvasId];
      } catch (e) {
        console.warn('Error destroying chart:', canvasId, e);
      }
    }

    // Also check if canvas has a chart attached directly
    const existing = (canvas as any).chart;
    if (existing) {
      try {
        existing.destroy();
        (canvas as any).chart = null;
      } catch (e) {
        console.warn('Error destroying canvas chart:', e);
      }
    }

    // Create new chart
    try {
      const chart = new Chart(canvas, {
        ...config,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...config.options,
        },
      });
      chartRefs.current[canvasId] = chart;
      (canvas as any).chart = chart;
      console.log('✅ Chart created:', canvasId);
      return chart;
    } catch (e) {
      console.error('Error creating chart:', canvasId, e);
      return null;
    }
  };

  // Function to initialize charts for current tab - memoized with useCallback
  const initializeChartsForTab = useCallback(() => {
    if (!isInitialized || !isChartLoaded) {
      console.log('⏳ Waiting for initialization...', { isInitialized, isChartLoaded });
      return;
    }

    // Check if data is ready
    if (apiData.loading) {
      console.log('⏳ Waiting for API data...');
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready (no additional setTimeout needed)
    requestAnimationFrame(() => {
      console.log('📊 Initializing charts for main tab:', mainTab, 'sub-tab:', subTabs[mainTab]);

        // Top 5 Families Revenue Chart
        if (mainTab === 'visao-geral' && subTabs['visao-geral'] === 'agregacao' && apiData.families.length > 0) {
          createOrUpdateChart('familiesRevenueChart', {
          type: 'bar',
          data: {
            labels: apiData.families.map(f => f.familia_nome.length > 20 ? f.familia_nome.substring(0, 20) + '...' : f.familia_nome),
            datasets: [
              {
                label: 'Receita (R$ milhões)',
                data: apiData.families.map(f => (f.revenue || 0) / 1000000),
                backgroundColor: 'rgba(50, 184, 198, 0.6)',
                borderColor: 'rgba(50, 184, 198, 1)',
                borderWidth: 2,
              },
              {
                label: 'Crescimento %',
                data: apiData.families.map(f => f.growthPct || 0),
                type: 'line',
                backgroundColor: 'rgba(230, 129, 97, 0.2)',
                borderColor: 'rgba(230, 129, 97, 1)',
                borderWidth: 3,
                yAxisID: 'y1',
                tension: 0.4,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    if (context.datasetIndex === 0) {
                      return `Receita: R$ ${context.parsed.y.toFixed(2)}M`;
                    } else {
                      return `Crescimento: ${context.parsed.y.toFixed(1)}%`;
                    }
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Receita (R$ milhões)',
                  font: { size: 11, weight: '500' },
                },
                ticks: {
                  font: { size: 11 },
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Crescimento %',
                  font: { size: 11, weight: '500' },
                },
                ticks: {
                  font: { size: 11 },
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                ticks: {
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }

        // Tier Analysis Chart  
        if (mainTab === 'visao-geral' && subTabs['visao-geral'] === 'agregacao' && apiData.tiers.length > 0) {
          createOrUpdateChart('tiersMatrixChart', {
          type: 'scatter',
          data: {
            datasets: apiData.tiers.map((tier, idx) => ({
              label: tier.tier_nivel,
              data: [{
                x: (tier.revenue || 0) / 1000000,
                y: (tier.penaltyExposure || 0) / 1000,
              }],
              backgroundColor: idx === 0 ? 'rgba(50, 184, 198, 0.7)' : idx === 1 ? 'rgba(230, 129, 97, 0.7)' : 'rgba(255, 84, 89, 0.7)',
              borderColor: idx === 0 ? 'rgba(50, 184, 198, 1)' : idx === 1 ? 'rgba(230, 129, 97, 1)' : 'rgba(255, 84, 89, 1)',
              borderWidth: 2,
              pointRadius: 12,
              pointHoverRadius: 16,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const tier = apiData.tiers[context.datasetIndex];
                    return [
                      `Tier: ${tier.tier_nivel}`,
                      `Receita: R$ ${context.parsed.x.toFixed(2)}M`,
                      `Exposição Penalidade: R$ ${context.parsed.y.toFixed(0)}k`,
                      `SLA: ${tier.slaCompliance?.toFixed(1)}%`,
                      `Materiais Críticos: ${tier.critical_materials}`,
                    ];
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Receita (R$ milhões)',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Exposição Penalidade (R$ mil)',
                },
              },
            },
          },
        });
      }

        // Growth Trend Chart (disabled for new structure)
        if (false) {
          createOrUpdateChart('growthTrendChart', {
            type: 'line',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4 (Atual)'],
              datasets: [
                {
                  label: 'Receita (R$ milhões)',
                  data: [
                    summary.totalRevenue * 0.22 / 1000000,
                    summary.totalRevenue * 0.24 / 1000000,
                    summary.totalRevenue * 0.26 / 1000000,
                    summary.totalRevenue * 0.28 / 1000000,
                  ],
                  backgroundColor: 'rgba(50, 184, 198, 0.2)',
                  borderColor: 'rgba(50, 184, 198, 1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      return `Receita: R$ ${context.parsed.y.toFixed(2)}M`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Receita (R$ milhões)',
                  },
                },
              },
            },
          });
      }

        // Market Intelligence Charts (disabled for new structure)
        if (false && marketClusters.length > 0) {
          createOrUpdateChart('clustersMatrixChart', {
          type: 'scatter',
          data: {
            datasets: marketClusters.map((cluster, idx) => ({
              label: cluster.name,
              data: [{ x: cluster.datasets, y: cluster.avgMAPE }],
              backgroundColor: idx === 0 ? 'rgba(50, 184, 198, 0.7)' : idx === 1 ? 'rgba(230, 129, 97, 0.7)' : idx === 2 ? 'rgba(255, 84, 89, 0.7)' : 'rgba(34, 197, 94, 0.7)',
              borderColor: idx === 0 ? 'rgba(50, 184, 198, 1)' : idx === 1 ? 'rgba(230, 129, 97, 1)' : idx === 2 ? 'rgba(255, 84, 89, 1)' : 'rgba(34, 197, 94, 1)',
              borderWidth: 2,
              pointRadius: 12,
              pointHoverRadius: 16,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const cluster = marketClusters[context.datasetIndex];
                    return [`Cluster: ${cluster.name}`, `Datasets: ${cluster.datasets}`, `MAPE: ${cluster.avgMAPE.toFixed(2)}%`, `R²: ${cluster.avgR2.toFixed(2)}`];
                  },
                },
              },
            },
            scales: {
              x: { title: { display: true, text: 'Número de Datasets' } },
              y: { title: { display: true, text: 'MAPE Médio (%)' } },
            },
          },
        });
      }

        // Business Metrics Charts (disabled for new structure)
        if (false && businessMetrics) {
          createOrUpdateChart('roiBreakdownChart', {
          type: 'bar',
          data: {
            labels: ['Economia de Inventário', 'Redução de Stockout', 'Eficiência Operacional'],
            datasets: [{
              label: 'Economia Anual (R$)',
              data: [Math.abs(businessMetrics.inventory_savings), Math.abs(businessMetrics.stockout_reduction), Math.abs(businessMetrics.operational_efficiency)],
              backgroundColor: ['rgba(50, 184, 198, 0.6)', 'rgba(230, 129, 97, 0.6)', 'rgba(34, 197, 94, 0.6)'],
              borderColor: ['rgba(50, 184, 198, 1)', 'rgba(230, 129, 97, 1)', 'rgba(34, 197, 94, 1)'],
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return `R$ ${Math.abs(context.parsed.y).toFixed(2)}`;
                  },
                },
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Economia (R$)' } },
            },
          },
        });
      }

        // Temporal Trends Charts (disabled for new structure)
        if (false && temporalTrends.length > 0) {
          createOrUpdateChart('temporalTrendsChart', {
          type: 'line',
          data: {
            labels: temporalTrends.map(t => t.phase.replace('phase_', 'Phase ').toUpperCase()),
            datasets: [
              {
                label: 'MAPE Médio (%)',
                data: temporalTrends.map(t => t.avgMAPE),
                backgroundColor: 'rgba(50, 184, 198, 0.2)',
                borderColor: 'rgba(50, 184, 198, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
              },
              {
                label: 'R² Médio',
                data: temporalTrends.map(t => t.avgR2),
                backgroundColor: 'rgba(230, 129, 97, 0.2)',
                borderColor: 'rgba(230, 129, 97, 1)',
                borderWidth: 3,
                yAxisID: 'y1',
                fill: false,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
            },
            scales: {
              y: { title: { display: true, text: 'MAPE (%)' } },
              y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'R²' }, grid: { drawOnChartArea: false } },
            },
          },
        });
      }

        // Predictive Analytics Charts (disabled for new structure)
        if (false && predictiveAnalysis) {
          const historical = predictiveAnalysis.historical || [];
          const labels = [...historical.map(h => h.phase.replace('phase_', 'Phase ').toUpperCase()), 'Phase 4 (Predicted)'];
          createOrUpdateChart('predictiveChart', {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'MAPE Histórico',
                data: historical.map(h => h.avgMAPE),
                backgroundColor: 'rgba(50, 184, 198, 0.2)',
                borderColor: 'rgba(50, 184, 198, 1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
              },
              {
                label: 'MAPE Previsto',
                data: [...historical.map(() => null), predictiveAnalysis.predictedMAPE],
                backgroundColor: 'rgba(230, 129, 97, 0.2)',
                borderColor: 'rgba(230, 129, 97, 1)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 8,
                pointHoverRadius: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
            },
            scales: {
              y: { title: { display: true, text: 'MAPE (%)' } },
            },
          },
        });
      }

        // NEW CHARTS FOR ENHANCED FEATURES
        // Macro Economics Charts
        if (mainTab === 'mercado' && subTabs['mercado'] === 'macro') {
          // IPCA vs Material Inflation
          createOrUpdateChart('macroIPCAChart', {
            type: 'line',
            data: {
              labels: MOCK_MACRO_DATA.map(d => d.quarter || d.year.toString()),
              datasets: [
                { label: 'IPCA (%)', data: MOCK_MACRO_DATA.map(d => d.ipca), borderColor: 'rgba(50, 184, 198, 1)', tension: 0.4 },
                { label: 'Inflação Materiais (%)', data: MOCK_MACRO_DATA.map(d => d.materialInflation), borderColor: 'rgba(230, 129, 97, 1)', tension: 0.4 },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });

          // USD/BRL Chart
          createOrUpdateChart('macroUSDChart', {
            type: 'line',
            data: {
              labels: MOCK_MACRO_DATA.map(d => d.quarter || d.year.toString()),
              datasets: [{ label: 'USD/BRL', data: MOCK_MACRO_DATA.map(d => d.usdBrl), borderColor: 'rgba(50, 184, 198, 1)', fill: true, tension: 0.4 }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });

          // SELIC Chart
          createOrUpdateChart('macroSELICChart', {
            type: 'line',
            data: {
              labels: MOCK_MACRO_DATA.map(d => d.quarter || d.year.toString()),
              datasets: [{ label: 'SELIC (%)', data: MOCK_MACRO_DATA.map(d => d.selic), borderColor: 'rgba(230, 129, 97, 1)', tension: 0.4 }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });

          // PIB x Telecom Investment
          createOrUpdateChart('macroPIBChart', {
            type: 'bar',
            data: {
              labels: MOCK_MACRO_DATA.map(d => d.quarter || d.year.toString()),
              datasets: [
                { label: 'PIB Growth (%)', data: MOCK_MACRO_DATA.map(d => d.pibGrowth), type: 'line', borderColor: 'rgba(50, 184, 198, 1)', yAxisID: 'y1' },
                { label: 'Telecom Capex (R$ B)', data: MOCK_MACRO_DATA.map(d => d.telecomCapex), backgroundColor: 'rgba(230, 129, 97, 0.6)' },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: {}, y1: { type: 'linear', position: 'right' } } },
          });
        }

        // Sector Analysis Charts
        if (mainTab === 'mercado' && subTabs['mercado'] === 'setor') {
          // 5G Growth Chart
          createOrUpdateChart('sector5GChart', {
            type: 'line',
            data: {
              labels: MOCK_SECTOR_DATA.map(d => d.year),
              datasets: [
                { label: 'Brasil', data: MOCK_SECTOR_DATA.map(d => d.brazil5G), borderColor: 'rgba(50, 184, 198, 1)', tension: 0.4 },
                { label: 'LATAM', data: MOCK_SECTOR_DATA.map(d => d.latam5G), borderColor: 'rgba(230, 129, 97, 1)', tension: 0.4 },
                { label: 'Global', data: MOCK_SECTOR_DATA.map(d => d.global5G), borderColor: 'rgba(255, 84, 89, 1)', tension: 0.4 },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });

          // Operator Market Share
          createOrUpdateChart('sectorOperatorsChart', {
            type: 'doughnut',
            data: {
              labels: MOCK_OPERATOR_SHARES.map(o => o.operator),
              datasets: [{
                data: MOCK_OPERATOR_SHARES.map(o => o.share),
                backgroundColor: ['rgba(50, 184, 198, 0.7)', 'rgba(230, 129, 97, 0.7)', 'rgba(255, 84, 89, 0.7)', 'rgba(119, 124, 124, 0.5)'],
              }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
        }

        // Demand Forecast Chart
        if (mainTab === 'previsoes' && subTabs['previsoes'] === 'demanda') {
          const forecastData = MOCK_DEMAND_FORECAST.slice(0, 30); // Show first 30 days for visibility
          createOrUpdateChart('demandForecastChart', {
            type: 'line',
            data: {
              labels: forecastData.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
              datasets: [
                { label: 'Previsão', data: forecastData.map(d => d.forecast), borderColor: 'rgba(50, 184, 198, 1)', tension: 0.4 },
                { label: 'Limite Superior', data: forecastData.map(d => d.upper), borderColor: 'rgba(50, 184, 198, 0.3)', fill: '+1', tension: 0.4 },
                { label: 'Limite Inferior', data: forecastData.map(d => d.lower), borderColor: 'rgba(50, 184, 198, 0.3)', fill: false, tension: 0.4 },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
        }

        // Revenue Scenarios Chart
        if (mainTab === 'previsoes' && subTabs['previsoes'] === 'receita') {
          createOrUpdateChart('revenueScenarioChart', {
            type: 'bar',
            data: {
              labels: MOCK_REVENUE_SCENARIOS.map(s => s.name),
              datasets: [{
                label: 'Receita (R$ M)',
                data: MOCK_REVENUE_SCENARIOS.map(s => s.revenue),
                backgroundColor: MOCK_REVENUE_SCENARIOS.map(s => 
                  s.name === 'Base' ? 'rgba(50, 184, 198, 0.6)' : 
                  s.name === 'Otimista' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 84, 89, 0.6)'
                ),
                borderColor: MOCK_REVENUE_SCENARIOS.map(s => 
                  s.name === 'Base' ? 'rgba(50, 184, 198, 1)' : 
                  s.name === 'Otimista' ? 'rgba(34, 197, 94, 1)' : 'rgba(255, 84, 89, 1)'
                ),
                borderWidth: 2,
              }],
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      const scenario = MOCK_REVENUE_SCENARIOS[context.dataIndex];
                      return [
                        `Receita: R$ ${scenario.revenue}M`,
                        `Crescimento: ${scenario.growth}%`,
                        `EBITDA: ${scenario.ebitdaMargin}%`
                      ];
                    },
                  },
                },
              },
            },
          });
        }

        // Cost Indexation Charts
        if (mainTab === 'previsoes' && subTabs['previsoes'] === 'custos') {
          // Material Cost Indexation
          createOrUpdateChart('costMaterialChart', {
            type: 'line',
            data: {
              labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025 (Est)', 'Q2 2025 (Est)'],
              datasets: [
                { label: 'Custo Base (R$ M)', data: [120, 122, 125, 130, 135, 140], borderColor: 'rgba(50, 184, 198, 1)', tension: 0.4 },
                { label: 'Com IPCA+USD', data: [120, 124, 129, 137, 145, 153], borderColor: 'rgba(230, 129, 97, 1)', tension: 0.4, borderDash: [5, 5] },
              ],
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' },
              },
            },
          });

          // Financial Cost (SELIC Impact)
          createOrUpdateChart('costFinancialChart', {
            type: 'line',
            data: {
              labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025 (Est)', 'Q2 2025 (Est)'],
              datasets: [{
                label: 'Custo Financeiro (R$ M)',
                data: [15, 14.5, 13.8, 13, 12.2, 11.5],
                borderColor: 'rgba(255, 84, 89, 1)',
                backgroundColor: 'rgba(255, 84, 89, 0.1)',
                fill: true,
                tension: 0.4,
              }],
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
            },
          });
        }

        // Correlation Analysis Chart
        if (mainTab === 'visao-geral' && subTabs['visao-geral'] === 'correlacao') {
          createOrUpdateChart('correlationScatterChart', {
            type: 'scatter',
            data: {
              datasets: [
                {
                  label: 'Antenas',
                  data: MOCK_CORRELATION_DATA.filter(d => d.familia === 'Antenas').map(d => ({ x: d.leadTime, y: d.demanda })),
                  backgroundColor: 'rgba(50, 184, 198, 0.6)',
                  borderColor: 'rgba(50, 184, 198, 1)',
                  pointRadius: 8,
                },
                {
                  label: 'Cabos',
                  data: MOCK_CORRELATION_DATA.filter(d => d.familia === 'Cabos').map(d => ({ x: d.leadTime, y: d.demanda })),
                  backgroundColor: 'rgba(230, 129, 97, 0.6)',
                  borderColor: 'rgba(230, 129, 97, 1)',
                  pointRadius: 8,
                },
                {
                  label: 'RRUs',
                  data: MOCK_CORRELATION_DATA.filter(d => d.familia === 'RRUs').map(d => ({ x: d.leadTime, y: d.demanda })),
                  backgroundColor: 'rgba(255, 84, 89, 0.6)',
                  borderColor: 'rgba(255, 84, 89, 1)',
                  pointRadius: 8,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' },
              },
              scales: {
                x: { title: { display: true, text: 'Lead Time (dias)' } },
                y: { title: { display: true, text: 'Demanda (unidades)' } },
              },
            },
          });
        }

        // Sensitivity Tornado Chart
        if (mainTab === 'cenarios' && subTabs['cenarios'] === 'sensibilidade') {
          createOrUpdateChart('sensitivityTornadoChart', {
            type: 'bar',
            data: {
              labels: MOCK_SENSITIVITY_FACTORS.map(f => f.factor),
              datasets: [
                {
                  label: 'Impacto Negativo',
                  data: MOCK_SENSITIVITY_FACTORS.map(f => f.lowImpact),
                  backgroundColor: 'rgba(255, 84, 89, 0.7)',
                  borderColor: 'rgba(255, 84, 89, 1)',
                  borderWidth: 2,
                },
                {
                  label: 'Impacto Positivo',
                  data: MOCK_SENSITIVITY_FACTORS.map(f => f.highImpact),
                  backgroundColor: 'rgba(34, 197, 94, 0.7)',
                  borderColor: 'rgba(34, 197, 94, 1)',
                  borderWidth: 2,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' },
              },
              scales: {
                x: { 
                  title: { display: true, text: 'Impacto na Receita (R$ M)' },
                  stacked: false,
                },
              },
            },
          });
        }
      }); // requestAnimationFrame already ensures DOM is ready, no additional delay needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isChartLoaded, mainTab, subTabs, apiData.loading, apiData.families, apiData.tiers, summary.totalRevenue]);

  // Effect to initialize charts when tab or data changes
  // Use direct dependencies instead of the callback to avoid infinite loops
  // Use subTabs[mainTab] instead of subTabs object to avoid reference comparison issues
  const currentSubTab = subTabs[mainTab];
  useEffect(() => {
    initializeChartsForTab();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isChartLoaded, mainTab, currentSubTab, apiData.loading, apiData.families.length, apiData.tiers.length]);

  // Reset initRef on unmount to allow re-initialization on next mount
  useEffect(() => {
    return () => {
      initRef.current = false;
      setIsInitialized(false);
    };
  }, []);

  // Cleanup: destroy all charts on unmount
  useEffect(() => {
    const charts = chartRefs.current;
    return () => {
      Object.keys(charts).forEach(canvasId => {
        try {
          if (charts[canvasId]) {
            charts[canvasId].destroy();
            delete charts[canvasId];
          }
        } catch (e) {
          console.warn('Error destroying chart on cleanup:', canvasId, e);
        }
      });
    };
  }, []);

  // Navigation helper
  const navigateTo = (page: string) => {
    router.push(`/features/${page}`);
  };

  // Tooltip management - ensure only one tooltip shows at a time
  useEffect(() => {
    const handleTooltipHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tooltipWrapper = target.closest('.tooltip-wrapper');
      if (tooltipWrapper) {
        // Hide all other tooltips
        document.querySelectorAll('.tooltip-content').forEach(tooltip => {
          if (tooltip !== tooltipWrapper.querySelector('.tooltip-content')) {
            (tooltip as HTMLElement).style.visibility = 'hidden';
            (tooltip as HTMLElement).style.opacity = '0';
          }
        });
      }
    };

    document.addEventListener('mouseover', handleTooltipHover);
    return () => {
      document.removeEventListener('mouseover', handleTooltipHover);
    };
  }, []);

  // Apply inline styles to all oversized elements after render
  useEffect(() => {
    if (!isInitialized) return;
    
    const applyStyles = () => {
      // Metric cards - force with !important
      document.querySelectorAll('.metric-card .label').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '11px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '500', 'important');
      });
      document.querySelectorAll('.metric-card .value').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '24px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      document.querySelectorAll('.metric-card .unit').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '12px', 'important');
      });
      
      // Chart titles
      document.querySelectorAll('.chart-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '14px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      
      // Section titles
      document.querySelectorAll('.section-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '15px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      
      // Tab buttons
      document.querySelectorAll('.tab-button').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      
      // Card titles
      document.querySelectorAll('.card-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      
      // Card values
      document.querySelectorAll('.card-value').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '18px', 'important');
      });
      
      // Card descriptions
      document.querySelectorAll('.card-description').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '12px', 'important');
      });
      
      // Narrative box h3
      document.querySelectorAll('.narrative-box h3').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '14px', 'important');
      });
      
      // Narrative box p
      document.querySelectorAll('.narrative-box p').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      
      // Table elements
      document.querySelectorAll('.table td').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      
      // Educational section elements
      document.querySelectorAll('.educational-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '15px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      document.querySelectorAll('.educational-card-title').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '14px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
      document.querySelectorAll('.educational-text').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      document.querySelectorAll('.educational-list').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '13px', 'important');
      });
      
      // Force header h1 styles
      const h1 = document.querySelector('.business-header h1');
      if (h1) {
        (h1 as HTMLElement).style.setProperty('font-size', '18px', 'important');
        (h1 as HTMLElement).style.setProperty('font-weight', '600', 'important');
      }
    };
    
    applyStyles();
    // Re-apply after a short delay to catch dynamically rendered elements
    const timer = setTimeout(applyStyles, 500);
    return () => clearTimeout(timer);
  }, [isInitialized, mainTab, currentSubTab]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        onLoad={() => {
          setIsChartLoaded(true);
        }}
        strategy="lazyOnload"
      />
      {!isInitialized && (
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando análise de negócio...</p>
        </div>
      )}
      <div 
        ref={(node) => {
          containerRef.current = node;
          if (node && !containerReady) {
            setContainerReady(true);
          }
        }}
        className="business-features-container" 
        style={{ display: isInitialized ? 'block' : 'none' }}
      >
        <style jsx global>{`
          :root {
            --color-primary: #20A084;
            --color-primary-hover: #1a8a70;
            --color-secondary: rgba(32, 160, 132, 0.1);
            --color-surface: #0f2438;
            --color-surface-alt: #1a3a52;
            --color-text: #e0e8f0;
            --color-text-secondary: #a0aab8;
            --color-success: #10b981;
            --color-warning: #f97316;
            --color-error: #ef4444;
            --color-bg: #0a1628;
            --color-border: rgba(255, 255, 255, 0.1);
            --color-red-400: rgba(255, 84, 89, 1);
            --color-orange-400: rgba(230, 129, 97, 1);
            --color-green-500: rgba(34, 197, 94, 1);
            --color-teal-300: rgba(50, 184, 198, 1);
            --space-8: 8px;
            --space-12: 12px;
            --space-16: 16px;
            --space-20: 20px;
            --space-24: 24px;
            --space-32: 32px;
            --radius-base: 8px;
            --radius-lg: 12px;
          }

          .business-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: var(--space-24);
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .business-header {
            margin-bottom: var(--space-32);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-24);
          }

          .business-header h1 {
            margin: 0 0 var(--space-8) 0 !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            color: var(--color-text) !important;
          }

          .business-header p {
            margin: 0 !important;
            color: var(--color-text-secondary) !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
          }

          .summary-banner {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .metric-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            position: relative;
            cursor: help;
            transition: all 0.3s ease;
          }

          .metric-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 0 12px rgba(50, 184, 198, 0.2);
          }

          .metric-card .label {
            font-size: 11px !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            color: var(--color-text-secondary) !important;
            margin-bottom: var(--space-8) !important;
            letter-spacing: 0.5px !important;
          }

          .metric-card .value {
            font-size: 24px !important;
            font-weight: 600 !important;
            color: var(--color-primary) !important;
            margin-bottom: var(--space-4) !important;
          }

          .metric-card .unit {
            font-size: 12px !important;
            color: var(--color-text-secondary) !important;
          }

          .narrative-box {
            background: rgba(50, 184, 198, 0.08);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-32);
            line-height: 1.8;
          }

          .narrative-box h3 {
            margin: 0 0 var(--space-12) 0 !important;
            color: var(--color-primary) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
          }

          .narrative-box p {
            margin: 0 !important;
            color: var(--color-text) !important;
            font-size: 13px !important;
          }

          .tabs-container {
            display: flex;
            gap: var(--space-12);
            margin-bottom: var(--space-24);
            border-bottom: 1px solid var(--color-border);
            flex-wrap: wrap;
          }

          .tab-button {
            padding: var(--space-12) var(--space-20) !important;
            background: transparent !important;
            border: none !important;
            border-bottom: 3px solid transparent !important;
            color: var(--color-text-secondary) !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            bottom: -1px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .tab-button:hover {
            color: var(--color-primary);
            background: rgba(50, 184, 198, 0.05);
          }

          .tab-button.active {
            color: var(--color-primary);
            border-bottom-color: var(--color-primary);
            font-weight: 600;
            background: rgba(50, 184, 198, 0.08);
          }

          .subtabs-container {
            display: flex;
            gap: var(--space-8);
            margin-bottom: var(--space-24);
            border-bottom: 1px solid var(--color-border);
            flex-wrap: wrap;
            padding-left: var(--space-12);
          }

          .subtab-button {
            padding: var(--space-8) var(--space-16);
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: var(--color-text-secondary);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
            bottom: -1px;
          }

          .subtab-button:hover {
            color: var(--color-primary);
          }

          .subtab-button.active {
            color: var(--color-primary);
            border-bottom-color: var(--color-primary);
            font-weight: 600;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .chart-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            position: relative;
            min-height: 420px;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
          }

          .chart-title {
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: var(--space-20) !important;
            color: var(--color-text) !important;
            width: 100% !important;
            flex-shrink: 0 !important;
          }

          .chart-canvas {
            flex: 1;
            position: relative;
            min-height: 320px;
          }

          .chart-canvas canvas {
            width: 100% !important;
            height: 100% !important;
          }

          .section-title {
            font-size: 15px !important;
            font-weight: 600 !important;
            margin: var(--space-32) 0 var(--space-20) 0 !important;
            color: var(--color-text) !important;
            border-bottom: 2px solid var(--color-primary) !important;
            padding-bottom: var(--space-16) !important;
            width: 100% !important;
            display: block !important;
          }

          .penalty-opportunity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-20);
            margin-bottom: var(--space-32);
          }

          .penalty-card,
          .opportunity-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            transition: all 0.3s ease;
            border-left: 4px solid;
            cursor: help;
            position: relative;
          }

          .penalty-card {
            border-left-color: var(--color-red-400);
          }

          .opportunity-card {
            border-left-color: var(--color-green-500);
          }

          .penalty-card:hover,
          .opportunity-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.15);
            transform: translateY(-2px);
          }

          .card-title {
            font-weight: 600 !important;
            color: var(--color-primary) !important;
            margin-bottom: var(--space-12) !important;
            font-size: 13px !important;
          }

          .card-value {
            font-size: 18px !important;
            font-weight: 600 !important;
            margin-bottom: var(--space-8) !important;
          }

          .penalty-card .card-value {
            color: var(--color-red-400);
          }

          .opportunity-card .card-value {
            color: var(--color-green-500);
          }

          .card-description {
            font-size: 12px !important;
            color: var(--color-text-secondary) !important;
            margin-top: var(--space-12) !important;
            padding-top: var(--space-12) !important;
            border-top: 1px solid var(--color-border) !important;
            line-height: 1.6 !important;
          }

          .insights-carousel {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-32);
          }

          .carousel-title {
            font-size: 17px;
            font-weight: 600;
            margin-bottom: var(--space-16);
            color: var(--color-primary);
          }

          .carousel-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-16);
          }

          .carousel-nav {
            display: flex;
            gap: var(--space-8);
            align-items: center;
          }

          .carousel-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(50, 184, 198, 0.2);
            border: 1px solid var(--color-primary);
            color: var(--color-primary);
            cursor: pointer;
            font-size: 17px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .carousel-btn:hover {
            background: var(--color-primary);
            color: var(--color-charcoal-700);
          }

          .insight-card {
            background: rgba(50, 184, 198, 0.08);
            border-left: 4px solid var(--color-primary);
            padding: var(--space-16);
            border-radius: var(--radius-base);
          }

          .insight-title {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
            font-size: 17px;
          }

          .insight-description {
            font-size: 17px;
            color: var(--color-text);
            margin-bottom: var(--space-8);
          }

          .insight-recommendation {
            font-size: 17px;
            color: var(--color-teal-300);
            font-weight: 500;
          }

          .insight-category-revenue {
            border-left-color: var(--color-green-500);
          }

          .insight-category-risk {
            border-left-color: var(--color-red-400);
          }

          .insight-category-opportunity {
            border-left-color: var(--color-orange-400);
          }

          .table-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin-bottom: var(--space-32);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }

          .table thead {
            background: rgba(50, 184, 198, 0.1);
            border-bottom: 2px solid var(--color-border);
          }

          .table th {
            padding: var(--space-16) var(--space-20);
            text-align: left;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--color-primary);
            letter-spacing: 0.5px;
          }

          .table td {
            padding: var(--space-16) var(--space-20);
            border-bottom: 1px solid var(--color-border);
            font-size: 13px !important;
          }

          .table tbody tr:hover {
            background: rgba(50, 184, 198, 0.05);
          }

          .navigation-cta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-32);
          }

          .cta-button {
            background: var(--color-surface);
            border: 2px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
          }

          .cta-button:hover {
            background: rgba(50, 184, 198, 0.1);
            transform: translateY(-2px);
          }

          .cta-icon {
            font-size: 26px;
            margin-bottom: var(--space-8);
          }

          .cta-text {
            color: var(--color-primary);
            font-weight: 600;
            font-size: 17px;
          }

          .cta-subtext {
            font-size: 17px;
            color: var(--color-text-secondary);
            margin-top: var(--space-8);
          }

          .tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          /* Override for table cells to preserve table layout */
          td.tooltip-wrapper,
          th.tooltip-wrapper {
            display: table-cell;
          }

          .tooltip-content {
            visibility: hidden;
            opacity: 0;
            background: rgba(31, 33, 33, 0.98);
            backdrop-filter: blur(8px);
            color: var(--color-text);
            text-align: left;
            border-radius: var(--radius-base);
            padding: var(--space-20);
            position: absolute;
            z-index: 10000;
            bottom: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            width: 360px;
            max-width: 90vw;
            font-size: 15px;
            line-height: 1.7;
            border: 2px solid var(--color-primary);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(50, 184, 198, 0.2);
            transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
            pointer-events: none;
          }

          .tooltip-content strong {
            color: var(--color-primary);
            font-weight: 600;
          }

          .tooltip-wrapper:hover > .tooltip-content {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          .tooltip-content::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid;
            border-color: var(--color-primary) transparent transparent transparent;
            pointer-events: none;
          }

          .educational-section {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-32);
            margin-bottom: var(--space-32);
          }

          .educational-title {
            font-size: 15px !important;
            font-weight: 600 !important;
            color: var(--color-primary);
            margin-bottom: var(--space-24);
            border-bottom: 2px solid var(--color-primary);
            padding-bottom: var(--space-12);
          }

          .educational-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-24);
          }

          .educational-card {
            background: rgba(50, 184, 198, 0.05);
            border: 1px solid var(--color-border);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-base);
            padding: var(--space-20);
            transition: all 0.3s ease;
          }

          .educational-card:hover {
            background: rgba(50, 184, 198, 0.1);
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.2);
          }

          .educational-card-title {
            font-size: 14px !important;
            font-weight: 600 !important;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
          }

          .educational-text {
            font-size: 13px !important;
            color: var(--color-text);
            line-height: 1.7;
            margin-bottom: var(--space-12);
          }

          .educational-text:last-child {
            margin-bottom: 0;
          }

          .educational-list {
            font-size: 13px !important;
            color: var(--color-text);
            line-height: 1.8;
            margin: var(--space-12) 0;
            padding-left: var(--space-24);
          }

          .educational-list li {
            margin-bottom: var(--space-8);
          }

          .educational-list li:last-child {
            margin-bottom: 0;
          }

          /* INFO CARDS & MICRO-INSIGHTS */
          .info-card-mini {
            background: linear-gradient(135deg, rgba(50, 184, 198, 0.05) 0%, rgba(50, 184, 198, 0.02) 100%);
            border-left: 4px solid var(--color-primary);
            border-radius: var(--radius-base);
            padding: var(--space-16);
            margin: var(--space-16) 0;
            font-size: 14px;
            line-height: 1.6;
            transition: all 0.3s ease;
            cursor: help;
          }

          .info-card-mini:hover {
            background: linear-gradient(135deg, rgba(50, 184, 198, 0.12) 0%, rgba(50, 184, 198, 0.05) 100%);
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.2);
          }

          .info-card-mini .info-title {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
            display: flex;
            align-items: center;
            gap: var(--space-8);
          }

          .info-card-mini .info-content {
            color: var(--color-text);
          }

          .info-card-mini .info-formula {
            font-family: 'Courier New', monospace;
            background: rgba(119, 124, 124, 0.1);
            padding: var(--space-8);
            border-radius: var(--radius-sm);
            margin-top: var(--space-8);
            font-size: 13px;
            color: var(--color-primary);
          }

          /* HOVER METRIC CARDS WITH TOOLTIPS */
          .metric-card-hover {
            position: relative;
            cursor: help;
            transition: all 0.3s ease;
          }

          .metric-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(50, 184, 198, 0.3);
            border-color: var(--color-primary);
          }

          .metric-hover-detail {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            top: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            background: rgba(31, 33, 33, 0.98);
            backdrop-filter: blur(12px);
            color: var(--color-text);
            padding: var(--space-20);
            border-radius: var(--radius-lg);
            border: 2px solid var(--color-primary);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
            width: 320px;
            max-width: 90vw;
            z-index: 10000;
            font-size: 14px;
            line-height: 1.7;
            transition: all 0.3s ease;
            pointer-events: none;
          }

          .metric-card-hover:hover .metric-hover-detail {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          .metric-hover-detail::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 8px solid;
            border-color: transparent transparent var(--color-primary) transparent;
          }

          .metric-hover-detail .detail-title {
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
            font-size: 15px;
          }

          .metric-hover-detail .detail-text {
            margin-bottom: var(--space-8);
          }

          .metric-hover-detail .detail-formula {
            background: rgba(50, 184, 198, 0.1);
            padding: var(--space-8);
            border-radius: var(--radius-sm);
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: var(--color-primary);
            margin-top: var(--space-8);
          }

          /* QUICK REFERENCE CARDS */
          .quick-ref-card {
            background: rgba(230, 129, 97, 0.05);
            border: 2px dashed rgba(230, 129, 97, 0.3);
            border-radius: var(--radius-lg);
            padding: var(--space-20);
            margin: var(--space-24) 0;
            transition: all 0.3s ease;
          }

          .quick-ref-card:hover {
            background: rgba(230, 129, 97, 0.1);
            border-color: rgba(230, 129, 97, 0.6);
            transform: scale(1.02);
          }

          .quick-ref-title {
            font-size: 18px;
            font-weight: 600;
            color: rgba(230, 129, 97, 1);
            margin-bottom: var(--space-16);
            display: flex;
            align-items: center;
            gap: var(--space-8);
          }

          .quick-ref-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
          }

          .quick-ref-item {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
          }

          .quick-ref-label {
            font-size: 12px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .quick-ref-value {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text);
          }

          /* MICRO INSIGHT BADGES */
          .micro-insight-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-8);
            background: rgba(50, 184, 198, 0.1);
            padding: var(--space-8) var(--space-16);
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-primary);
            margin: var(--space-8) var(--space-4);
            transition: all 0.2s ease;
            cursor: help;
            border: 1px solid rgba(50, 184, 198, 0.2);
          }

          .micro-insight-badge:hover {
            background: rgba(50, 184, 198, 0.2);
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(50, 184, 198, 0.3);
          }

          /* TECHNICAL FOOTNOTE */
          .technical-footnote {
            background: rgba(119, 124, 124, 0.05);
            border-radius: var(--radius-base);
            padding: var(--space-12) var(--space-16);
            margin-top: var(--space-16);
            font-size: 13px;
            color: var(--color-text-secondary);
            border-left: 3px solid rgba(119, 124, 124, 0.3);
          }

          .technical-footnote strong {
            color: var(--color-text);
          }

          @media (max-width: 768px) {
            .charts-grid {
              grid-template-columns: 1fr;
            }
            .summary-banner {
              grid-template-columns: 1fr;
            }
            .penalty-opportunity-grid {
              grid-template-columns: 1fr;
            }
            .educational-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="business-header mb-8 pb-6 border-b border-white/10">
          <h1 className="text-lg font-semibold text-brand-lightest-slate mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
            💼 Features de Negócio
          </h1>
          <p className="text-sm text-brand-slate" style={{ fontSize: '14px', lineHeight: 1.6 }}>
            Inteligência de negócio consolidada: famílias, tiers, penalidades e receita para decisões estratégicas
          </p>
        </div>

        {/* Summary Banner - Enhanced with Hover Details */}
        <div className="summary-banner">
          <div className="metric-card metric-card-hover">
            <div className="label" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Receita Total</div>
            <div className="value" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>R$ {(summary.totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="unit" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Consolidada</div>
            <div className="metric-hover-detail">
              <div className="detail-title">📊 Receita Total Consolidada</div>
              <div className="detail-text">
                Soma estimada de todas as receitas geradas por famílias de produtos (Antenas, Cabos, RRUs, Conectores).
              </div>
              <div className="detail-formula">
                Revenue = Σ (Demanda × Preço Médio × Sites)
                <br/>
                Baseado em movimentações reais e pricing histórico
              </div>
              <div className="detail-text" style={{ marginTop: '8px' }}>
                <strong>Benchmark:</strong> Média mercado BR: R$ 650-900M (operadoras médio porte)
              </div>
            </div>
          </div>
          <div className="metric-card metric-card-hover">
            <div className="label" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Crescimento QoQ</div>
            <div className="value" style={{ fontSize: '24px', fontWeight: 600, color: summary.growthQoQ > 0 ? 'var(--color-green-500)' : 'var(--color-red-400)', marginBottom: '4px' }}>
              {summary.growthQoQ > 0 ? '+' : ''}{summary.growthQoQ.toFixed(1)}%
            </div>
            <div className="unit" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Quarter-over-Quarter</div>
            <div className="metric-hover-detail">
              <div className="detail-title">📈 Crescimento Trimestral (QoQ)</div>
              <div className="detail-text">
                Variação percentual da receita: Q4 2025 vs Q3 2025
              </div>
              <div className="detail-formula">
                QoQ% = ((Rev_Q4 - Rev_Q3) / Rev_Q3) × 100
              </div>
              <div className="detail-text" style={{ marginTop: '8px' }}>
                <strong>Target Setorial:</strong> 8-12% QoQ (expansão 5G)
                <br/>
                <strong>CAGR 3Y:</strong> ~35-40% (2023-2026)
              </div>
            </div>
          </div>
          <div className="metric-card metric-card-hover">
            <div className="label" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Maior Risco</div>
            <div className="value" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>{summary.biggestRisk}</div>
            <div className="unit" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>R$ {((summary.biggestRiskExposure) / 1000).toFixed(0)}k exposição</div>
            <div className="metric-hover-detail">
              <div className="detail-title">⚠️ Tier de Maior Risco</div>
              <div className="detail-text">
                Tier com maior exposição a penalidades contratuais e criticidade operacional
              </div>
              <div className="detail-formula">
                Risk Score = (Penalty Value × 0.4) + 
                <br/>
                (Critical Materials × 0.35) + 
                <br/>
                (SLA Target × 0.25)
              </div>
              <div className="detail-text" style={{ marginTop: '8px' }}>
                <strong>TIER_1:</strong> SLA &gt; 99%, Penalty ~R$ 15-25k/material
                <br/>
                <strong>Mitigação:</strong> Buffer optimization (ROI 2.5x)
              </div>
            </div>
          </div>
        </div>

        {/* Micro Insights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', marginBottom: 'var(--space-24)' }}>
          <span className="micro-insight-badge" title="Receita por Funcionário: Indicador de produtividade">
            💡 Rev/FTE: R$ 2.1M
          </span>
          <span className="micro-insight-badge" title="Average Revenue Per User (operadoras)">
            📱 ARPU: R$ 68/mês
          </span>
          <span className="micro-insight-badge" title="Customer Acquisition Cost">
            💰 CAC: R$ 280
          </span>
          <span className="micro-insight-badge" title="Lifetime Value / Customer Acquisition Cost ratio">
            📊 LTV/CAC: 4.2x
          </span>
          <span className="micro-insight-badge" title="Margem EBITDA média do setor">
            📈 EBITDA: 28%
          </span>
          <span className="micro-insight-badge" title="Net Promoter Score médio">
            ⭐ NPS: +42
          </span>
        </div>

        {/* Quick Reference Card */}
        <div className="quick-ref-card">
          <div className="quick-ref-title">📚 Quick Reference - Metodologia de Cálculo</div>
          <div className="quick-ref-grid">
            <div className="quick-ref-item">
              <div className="quick-ref-label">Receita Total</div>
              <div className="quick-ref-value">Σ (Vol × Price × Sites)</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Agregação de movimentações × pricing médio
              </div>
            </div>
            <div className="quick-ref-item">
              <div className="quick-ref-label">QoQ Growth</div>
              <div className="quick-ref-value">(Q4 - Q3) / Q3 × 100</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Crescimento trimestre sobre trimestre
              </div>
            </div>
            <div className="quick-ref-item">
              <div className="quick-ref-label">Risk Score</div>
              <div className="quick-ref-value">Weighted Penalty Sum</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Penalty × Criticality × Probability
              </div>
            </div>
            <div className="quick-ref-item">
              <div className="quick-ref-label">Exposure</div>
              <div className="quick-ref-value">Σ (Penalty × Contracts)</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Máximo downside financeiro
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="narrative-box tooltip-wrapper">
          <h3 className="tooltip-wrapper">
            📊 Situação Geral - Visão Executiva
            <div className="tooltip-content">
              <strong>Visão Executiva da Análise de Negócio</strong>
              <br/><br/>
              Esta seção fornece um resumo executivo da situação atual, destacando métricas-chave, oportunidades e riscos identificados.
              <br/><br/>
              <strong>Uso:</strong> Use esta visão geral para entender rapidamente o estado do negócio e identificar áreas que requerem atenção imediata.
            </div>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0 }}>{summary.narrative}</p>
        </div>

        {/* Main Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${mainTab === 'visao-geral' ? 'active' : ''}`}
            onClick={() => setMainTab('visao-geral')}
          >
            📊 Visão Geral
          </button>
          <button
            className={`tab-button ${mainTab === 'mercado' ? 'active' : ''}`}
            onClick={() => setMainTab('mercado')}
          >
            🌐 Mercado & Econometria
          </button>
          <button
            className={`tab-button ${mainTab === 'previsoes' ? 'active' : ''}`}
            onClick={() => setMainTab('previsoes')}
          >
            📈 Previsões 2026
          </button>
          <button
            className={`tab-button ${mainTab === 'cenarios' ? 'active' : ''}`}
            onClick={() => setMainTab('cenarios')}
          >
            🎯 Análise de Cenários
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="subtabs-container">
          {mainTab === 'visao-geral' && (
            <>
              <button
                className={`subtab-button ${subTabs['visao-geral'] === 'agregacao' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'visao-geral': 'agregacao'})}
              >
                Agregação
              </button>
              <button
                className={`subtab-button ${subTabs['visao-geral'] === 'variancia' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'visao-geral': 'variancia'})}
              >
                Variância
              </button>
              <button
                className={`subtab-button ${subTabs['visao-geral'] === 'correlacao' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'visao-geral': 'correlacao'})}
              >
                Correlação
              </button>
            </>
          )}
          
          {mainTab === 'mercado' && (
            <>
              <button
                className={`subtab-button ${subTabs['mercado'] === 'macro' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'mercado': 'macro'})}
              >
                📊 Macro
              </button>
              <button
                className={`subtab-button ${subTabs['mercado'] === 'setor' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'mercado': 'setor'})}
              >
                📱 Setor
              </button>
              <button
                className={`subtab-button ${subTabs['mercado'] === 'competidores' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'mercado': 'competidores'})}
              >
                🏢 Competidores
              </button>
            </>
          )}
          
          {mainTab === 'previsoes' && (
            <>
              <button
                className={`subtab-button ${subTabs['previsoes'] === 'demanda' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'previsoes': 'demanda'})}
              >
                📦 Demanda
              </button>
              <button
                className={`subtab-button ${subTabs['previsoes'] === 'receita' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'previsoes': 'receita'})}
              >
                💰 Receita
              </button>
              <button
                className={`subtab-button ${subTabs['previsoes'] === 'custos' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'previsoes': 'custos'})}
              >
                💸 Custos
              </button>
            </>
          )}
          
          {mainTab === 'cenarios' && (
            <>
              <button
                className={`subtab-button ${subTabs['cenarios'] === 'configuracao' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'cenarios': 'configuracao'})}
              >
                ⚙️ Configuração
              </button>
              <button
                className={`subtab-button ${subTabs['cenarios'] === 'preconfigurados' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'cenarios': 'preconfigurados'})}
              >
                📋 Pré-Configurados
              </button>
              <button
                className={`subtab-button ${subTabs['cenarios'] === 'sensibilidade' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'cenarios': 'sensibilidade'})}
              >
                📊 Sensibilidade
              </button>
              <button
                className={`subtab-button ${subTabs['cenarios'] === 'riscos' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'cenarios': 'riscos'})}
              >
                ⚠️ Riscos
              </button>
              <button
                className={`subtab-button ${subTabs['cenarios'] === 'mitigacao' ? 'active' : ''}`}
                onClick={() => setSubTabs({...subTabs, 'cenarios': 'mitigacao'})}
              >
                🛡️ Mitigação
              </button>
            </>
          )}
        </div>

        {/* ========== VISÃO GERAL TAB ========== */}
        {mainTab === 'visao-geral' && subTabs['visao-geral'] === 'agregacao' && (
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: 'var(--color-text)', width: '100%', flexShrink: 0 }}>📊 Top 5 Famílias - Receita e Crescimento</div>
              <div className="chart-canvas">
                <canvas id="familiesRevenueChart"></canvas>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-title">🎯 Análise de Tiers - Receita vs. Risco</div>
              <div className="chart-canvas">
                <canvas id="tiersMatrixChart"></canvas>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'visao-geral' && subTabs['visao-geral'] === 'variancia' && (
          <div>
            <div className="section-title">📊 Análise de Variância por Site e Família</div>
            
            {/* Variance KPI Cards */}
            <div className="summary-banner">
              <div className="metric-card">
                <div className="label">Maior Variância</div>
                <div className="value" style={{ color: 'var(--color-red-400)' }}>35.2%</div>
                <div className="label">Site BA-04 - RRUs</div>
              </div>
              <div className="metric-card">
                <div className="label">Menor Variância</div>
                <div className="value" style={{ color: 'var(--color-green-500)' }}>8.7%</div>
                <div className="label">Site RJ-02 - Cabos</div>
              </div>
              <div className="metric-card">
                <div className="label">Média Geral</div>
                <div className="value">19.8%</div>
                <div className="label">Todas as famílias</div>
              </div>
              <div className="metric-card">
                <div className="label">Sites Críticos</div>
                <div className="value">2</div>
                <div className="label">Variance &gt; 25%</div>
              </div>
            </div>

            {/* Variance Heatmap Table */}
            <div className="table-container">
              <h3 style={{ marginBottom: 'var(--space-16)', color: 'var(--color-primary)' }}>
                🔥 Mapa de Calor - Variância por Site e Família
              </h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Família</th>
                    <th>Variância %</th>
                    <th>Std Dev</th>
                    <th>Coef. Variação</th>
                    <th>Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_VARIANCE_DATA.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.site}</td>
                      <td>{row.familia}</td>
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          backgroundColor: row.variance > 25 ? 'rgba(255, 84, 89, 0.2)' : row.variance > 15 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: row.variance > 25 ? 'var(--color-red-400)' : row.variance > 15 ? 'var(--color-orange-400)' : 'var(--color-green-500)',
                        }}>
                          {row.variance.toFixed(1)}%
                        </span>
                      </td>
                      <td>{row.stdDev.toFixed(1)}</td>
                      <td>{row.coefficient.toFixed(2)}</td>
                      <td>
                        {row.trend === 'increasing' && <span style={{ color: 'var(--color-red-400)' }}>↗ Crescente</span>}
                        {row.trend === 'stable' && <span style={{ color: 'var(--color-text-secondary)' }}>→ Estável</span>}
                        {row.trend === 'decreasing' && <span style={{ color: 'var(--color-green-500)' }}>↘ Decrescente</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Technical Context Card */}
            <div className="info-card-mini">
              <div className="info-title">🎓 Metodologia de Cálculo - Variância</div>
              <div className="info-content">
                <strong>Variância (σ²):</strong> Medida de dispersão da demanda em relação à média. Valores altos indicam 
                imprevisibilidade e requerem buffers maiores.
                <div className="info-formula">
                  Variance σ² = Σ(xi - μ)² / n
                  <br/>
                  Std Dev σ = √Variance
                  <br/>
                  Coefficient of Variation = σ / μ
                </div>
                <strong>Interpretação:</strong> CV &lt; 0.25 = boa previsibilidade | CV &gt; 0.30 = alta volatilidade
              </div>
            </div>

            {/* Insights Cards */}
            <div className="educational-section">
              <div className="educational-title">💡 Insights de Variância</div>
              <div className="educational-grid">
                <div className="educational-card">
                  <div className="educational-card-title">🔴 Atenção Crítica</div>
                  <div className="educational-text">
                    <strong>Site BA-04</strong> apresenta variância extremamente alta em RRUs (35.2%), indicando demanda volátil e imprevisível. Recomenda-se aumentar buffer de segurança para 45 dias.
                    <div className="technical-footnote">
                      <strong>Impacto Financeiro:</strong> Aumento de buffer = +R$ 8M em working capital, mas reduz penalty risk em R$ 22M
                    </div>
                  </div>
                </div>
                <div className="educational-card">
                  <div className="educational-card-title">🟢 Desempenho Exemplar</div>
                  <div className="educational-text">
                    <strong>Site RJ-02 - Cabos</strong> mantém variância controlada (8.7%) com tendência decrescente. Modelo de previsão pode ser replicado para outros sites.
                    <div className="technical-footnote">
                      <strong>Best Practice:</strong> Uso de ARIMA(2,1,2) + seasonal adjustment + demand sensing
                    </div>
                  </div>
                </div>
                <div className="educational-card">
                  <div className="educational-card-title">⚠️ Padrão Observado</div>
                  <div className="educational-text">
                    <strong>RRUs</strong> consistentemente apresentam maior variância (média 28.0%) comparado a Antenas (21.2%) e Cabos (11.4%). Ajustar modelo de forecast para RRUs.
                    <div className="technical-footnote">
                      <strong>Causa Raiz:</strong> Ciclo tecnológico rápido (18-24 meses) + alta dependência de roadmap operadoras
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reference - Statistical Thresholds */}
            <div className="quick-ref-card">
              <div className="quick-ref-title">📊 Thresholds Estatísticos - Guia de Interpretação</div>
              <div className="quick-ref-grid">
                <div className="quick-ref-item">
                  <div className="quick-ref-label">Variância Baixa</div>
                  <div className="quick-ref-value">&lt; 15%</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-green-500)', marginTop: '4px' }}>
                    ✓ Boa previsibilidade | Buffer padrão OK
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">Variância Média</div>
                  <div className="quick-ref-value">15-25%</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-orange-400)', marginTop: '4px' }}>
                    ⚠ Atenção | Buffer +10-15%
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">Variância Alta</div>
                  <div className="quick-ref-value">&gt; 25%</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-red-400)', marginTop: '4px' }}>
                    🔴 Crítico | Buffer +30-50% + forecasting avançado
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">CV Target</div>
                  <div className="quick-ref-value">&lt; 0.25</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Coeficiente de Variação ideal
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'visao-geral' && subTabs['visao-geral'] === 'correlacao' && (
          <div>
            <div className="section-title">📈 Correlação Lead Time vs Demanda</div>
            
            {/* Correlation KPI Cards */}
            <div className="summary-banner">
              <div className="metric-card">
                <div className="label">Correlação Geral</div>
                <div className="value" style={{ color: 'var(--color-primary)' }}>-0.68</div>
                <div className="label">Forte correlação negativa</div>
              </div>
              <div className="metric-card">
                <div className="label">Maior Impacto</div>
                <div className="value">Cabos</div>
                <div className="label">Elasticity: -0.72</div>
              </div>
              <div className="metric-card">
                <div className="label">Menor Impacto</div>
                <div className="value">RRUs</div>
                <div className="label">Elasticity: -0.58</div>
              </div>
              <div className="metric-card">
                <div className="label">Perda por +10d</div>
                <div className="value" style={{ color: 'var(--color-red-400)' }}>-23%</div>
                <div className="label">Redução média de demanda</div>
              </div>
            </div>

            {/* Correlation Scatter Chart */}
            <div className="chart-container">
              <div className="chart-title">📊 Lead Time × Demanda - Análise de Correlação</div>
              <div className="chart-canvas">
                <canvas id="correlationScatterChart"></canvas>
              </div>
            </div>

            {/* Elasticity Analysis Cards */}
            <div className="penalty-opportunity-grid">
              <div className="opportunity-card">
                <div className="card-title">💡 Cabos - Alta Sensibilidade</div>
                <div className="card-value" style={{ color: 'var(--color-primary)' }}>-0.72</div>
                <div className="card-description">
                  <strong>Elasticidade:</strong> -0.72
                  <br />
                  <strong>Impacto:</strong> Aumento de 10 dias no lead time resulta em queda de 26% na demanda
                  <br />
                  <strong>Recomendação:</strong> Priorizar redução de lead time para esta família
                </div>
              </div>
              <div className="opportunity-card">
                <div className="card-title">📱 Antenas - Sensibilidade Média</div>
                <div className="card-value" style={{ color: 'var(--color-text)' }}>-0.65</div>
                <div className="card-description">
                  <strong>Elasticidade:</strong> -0.65
                  <br />
                  <strong>Impacto:</strong> Aumento de 10 dias resulta em queda de 21% na demanda
                  <br />
                  <strong>Recomendação:</strong> Manter lead time atual para evitar perdas significativas
                </div>
              </div>
              <div className="opportunity-card">
                <div className="card-title">📡 RRUs - Menor Sensibilidade</div>
                <div className="card-value" style={{ color: 'var(--color-text-secondary)' }}>-0.58</div>
                <div className="card-description">
                  <strong>Elasticidade:</strong> -0.58
                  <br />
                  <strong>Impacto:</strong> Aumento de 10 dias resulta em queda de 18% na demanda
                  <br />
                  <strong>Recomendação:</strong> Família menos sensível a variações de lead time
                </div>
              </div>
              <div className="penalty-card">
                <div className="card-title">⚠️ Cenário de Risco</div>
                <div className="card-value" style={{ color: 'var(--color-red-400)' }}>-R$ 95M</div>
                <div className="card-description">
                  <strong>Cenário:</strong> Lead time aumenta de 21d para 35d (+14 dias)
                  <br />
                  <strong>Perda estimada:</strong> R$ 95M em receita anual
                  <br />
                  <strong>Mitigação:</strong> Implementar buffer stock optimization (ROI 2.5x)
                </div>
              </div>
            </div>

            {/* Statistical Insights */}
            <div className="educational-section">
              <div className="educational-title">📊 Interpretação Estatística</div>
              <div className="educational-text">
                <strong>Correlação Negativa Forte (-0.68):</strong> Existe uma relação inversa significativa entre lead time e demanda. Quanto maior o lead time, menor a demanda observada.
              </div>
              <div className="educational-text">
                <strong>Significância Prática:</strong> Para cada dia adicional de lead time, a demanda cai em média 2.3%. Esta relação é consistente em todas as famílias de produtos.
              </div>
              <div className="educational-text">
                <strong>Implicações Estratégicas:</strong> Investimentos em redução de lead time (ex: supplier diversification, buffer optimization) têm impacto direto e mensurável na receita.
              </div>
            </div>
          </div>
        )}

        {/* ========== MERCADO & ECONOMETRIA TAB ========== */}
        {mainTab === 'mercado' && subTabs['mercado'] === 'macro' && (
          <div>
            {/* Macro KPIs */}
            <div className="summary-banner">
              <div className="metric-card metric-card-hover">
                <div className="label">IPCA 2025</div>
                <div className="value" style={{ color: 'var(--color-orange-400)' }}>5.8%</div>
                <div className="unit">Inflação Oficial</div>
                <div className="metric-hover-detail">
                  <div className="detail-title">📊 Índice de Preços ao Consumidor Amplo</div>
                  <div className="detail-text">
                    Inflação oficial medida pelo IBGE, usado como indexador para reajustes contratuais
                  </div>
                  <div className="detail-formula">
                    IPCA = Variação % cesta de consumo (12 meses)
                    <br/>
                    Meta BCB: 3.0% (±1.5pp)
                  </div>
                  <div className="detail-text" style={{ marginTop: '8px' }}>
                    <strong>Impacto:</strong> Reajuste automático de ~R$ 52M em contratos
                  </div>
                </div>
              </div>
              <div className="metric-card metric-card-hover">
                <div className="label">USD/BRL</div>
                <div className="value">R$ 5.45</div>
                <div className="unit">Câmbio Atual</div>
                <div className="metric-hover-detail">
                  <div className="detail-title">💵 Taxa de Câmbio Dólar/Real</div>
                  <div className="detail-text">
                    Taxa spot USD/BRL. Impacta materiais importados (~40% dos custos)
                  </div>
                  <div className="detail-formula">
                    Exposure = Material Cost × % Imported × FX Rate
                    <br/>
                    Cada R$ 0.10 = ±R$ 8M impacto anual
                  </div>
                  <div className="detail-text" style={{ marginTop: '8px' }}>
                    <strong>Hedge Atual:</strong> 35% (Target: 60%)
                  </div>
                </div>
              </div>
              <div className="metric-card metric-card-hover">
                <div className="label">SELIC</div>
                <div className="value" style={{ color: 'var(--color-green-500)' }}>10.50%</div>
                <div className="unit">Taxa Básica</div>
                <div className="metric-hover-detail">
                  <div className="detail-title">📈 Sistema Especial de Liquidação e Custódia</div>
                  <div className="detail-text">
                    Taxa básica de juros do BCB. Impacta custo de capital de giro
                  </div>
                  <div className="detail-formula">
                    Financial Cost = Working Capital × (SELIC + Spread)
                    <br/>
                    Spread médio: 2.5-3.5pp
                  </div>
                  <div className="detail-text" style={{ marginTop: '8px' }}>
                    <strong>Working Capital:</strong> R$ 185M (21 dias)
                  </div>
                </div>
              </div>
              <div className="metric-card metric-card-hover">
                <div className="label">Telecom Capex</div>
                <div className="value">R$ 45B</div>
                <div className="unit">Brasil 2025</div>
                <div className="metric-hover-detail">
                  <div className="detail-title">🏗️ Investimento em Infraestrutura Telecom</div>
                  <div className="detail-text">
                    Capex total das operadoras brasileiras em infraestrutura de rede
                  </div>
                  <div className="detail-formula">
                    Market Share NC = Rev_NC / Total_Capex
                    <br/>
                    Current: 1.98% (890M / 45B)
                  </div>
                  <div className="detail-text" style={{ marginTop: '8px' }}>
                    <strong>Top Players:</strong> Claro R$ 16B, Vivo R$ 14B, TIM R$ 10B
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card - Economic Context */}
            <div className="info-card-mini">
              <div className="info-title">🎓 Contexto Macroeconômico 2025</div>
              <div className="info-content">
                <strong>Cenário Atual:</strong> Brasil em ciclo de distensão monetária (SELIC caindo de 13.75% → 10.50%), 
                porém com pressão inflacionária persistente (IPCA 5.8% vs meta 3.0%). USD/BRL fortalecido devido a fatores 
                externos (Fed rates, geopolítica). Setor telecom aquecido pela expansão 5G (R$ 45B em Capex).
                <div className="info-formula">
                  Impacto Líquido = +R$ 52M (IPCA reajustes) - R$ 35M (USD custo importação) - R$ 12M (SELIC custo financeiro) = +R$ 5M
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <div className="chart-title">📊 IPCA vs Inflação de Materiais</div>
                <div className="chart-canvas">
                  <canvas id="macroIPCAChart"></canvas>
                </div>
                <div className="technical-footnote">
                  <strong>Nota Técnica:</strong> Inflação de materiais telecom historicamente acompanha IPCA com lag de 1-2 trimestres. 
                  Componentes importados (RRUs, chips) têm correlação 0.68 com USD/BRL.
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-title">💵 Câmbio USD/BRL</div>
                <div className="chart-canvas">
                  <canvas id="macroUSDChart"></canvas>
                </div>
                <div className="technical-footnote">
                  <strong>Nota Técnica:</strong> Cada variação de R$ 0.10 no câmbio impacta ~R$ 8M na receita anual. 
                  Hedge atual de 35% protege apenas 1/3 da exposição.
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-title">📈 SELIC - Taxa de Juros</div>
                <div className="chart-canvas">
                  <canvas id="macroSELICChart"></canvas>
                </div>
                <div className="technical-footnote">
                  <strong>Nota Técnica:</strong> Ciclo de cortes do COPOM (jun/25 - dez/25) reduziu custo de capital de giro em ~R$ 4M/mês. 
                  Expectativa de SELIC terminal: 9.5% (Q2 2026).
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-title">🏗️ PIB × Investimento Telecom</div>
                <div className="chart-canvas">
                  <canvas id="macroPIBChart"></canvas>
                </div>
                <div className="technical-footnote">
                  <strong>Nota Técnica:</strong> Telecom Capex cresceu 18% acima do PIB (elasticidade 5.6x), impulsionado por leilões 5G e obrigações de cobertura.
                </div>
              </div>
            </div>

            {/* Quick Reference - Economic Indicators */}
            <div className="quick-ref-card">
              <div className="quick-ref-title">📊 Indicadores Econômicos - Benchmark & Targets</div>
              <div className="quick-ref-grid">
                <div className="quick-ref-item">
                  <div className="quick-ref-label">IPCA Meta</div>
                  <div className="quick-ref-value">3.0% ±1.5pp</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Banco Central Brasil (atual: 5.8%)
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">USD Range</div>
                  <div className="quick-ref-value">R$ 4.80 - 5.80</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Faixa esperada 2025-2026
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">SELIC Terminal</div>
                  <div className="quick-ref-value">9.5% (Q2/26)</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Focus BCB (mediana mercado)
                  </div>
                </div>
                <div className="quick-ref-item">
                  <div className="quick-ref-label">PIB 2025-26</div>
                  <div className="quick-ref-value">2.8% CAGR</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Crescimento esperado (FMI)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'mercado' && subTabs['mercado'] === 'setor' && (
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-title">📱 Crescimento 5G: BR vs LATAM vs Global</div>
              <div className="chart-canvas">
                <canvas id="sector5GChart"></canvas>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-title">📊 Market Share Operadoras</div>
              <div className="chart-canvas">
                <canvas id="sectorOperatorsChart"></canvas>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'mercado' && subTabs['mercado'] === 'competidores' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Receita (R$ M)</th>
                  <th>EBITDA %</th>
                  <th>Lead Time (dias)</th>
                  <th>SLA %</th>
                  <th>Posição</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_COMPETITORS.map(comp => (
                  <tr key={comp.company}>
                    <td style={{ fontWeight: comp.company === 'Nova Corrente' ? 600 : 400, color: comp.company === 'Nova Corrente' ? 'var(--color-primary)' : 'inherit' }}>
                      {comp.company}
                    </td>
                    <td>R$ {comp.revenue}M</td>
                    <td>{comp.ebitdaPercent}%</td>
                    <td>{comp.leadTimeDays}d</td>
                    <td>{comp.slaPercent}%</td>
                    <td>{comp.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== PREVISÕES 2026 TAB ========== */}
        {mainTab === 'previsoes' && subTabs['previsoes'] === 'demanda' && (
          <div>
            <div className="section-title">📦 Previsão de Demanda - 90 Dias</div>
            <div className="chart-container">
              <div className="chart-canvas">
                <canvas id="demandForecastChart"></canvas>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'previsoes' && subTabs['previsoes'] === 'receita' && (
          <div>
            <div className="section-title">💰 Cenários de Receita 2026</div>
            <div className="summary-banner">
              {MOCK_REVENUE_SCENARIOS.map(scenario => (
                <div key={scenario.name} className="metric-card">
                  <div className="label">{scenario.name}</div>
                  <div className="value" style={{ color: scenario.name === 'Otimista' ? 'var(--color-green-500)' : scenario.name === 'Pessimista' ? 'var(--color-red-400)' : 'var(--color-primary)' }}>
                    R$ {scenario.revenue}M
                  </div>
                  <div className="label">Crescimento: {scenario.growth > 0 ? '+' : ''}{scenario.growth}%</div>
                  <div className="label">EBITDA: {scenario.ebitdaMargin}%</div>
                </div>
              ))}
            </div>
            <div className="chart-container">
              <div className="chart-title">📊 Comparação de Cenários</div>
              <div className="chart-canvas">
                <canvas id="revenueScenarioChart"></canvas>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'previsoes' && subTabs['previsoes'] === 'custos' && (
          <div>
            <div className="section-title">💸 Indexação de Custos (IPCA + USD)</div>
            <div className="charts-grid">
              <div className="chart-container">
                <div className="chart-title">📦 Custo de Materiais (Indexação)</div>
                <div className="chart-canvas">
                  <canvas id="costMaterialChart"></canvas>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-title">💰 Custo Financeiro (Impacto SELIC)</div>
                <div className="chart-canvas">
                  <canvas id="costFinancialChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== ANÁLISE DE CENÁRIOS TAB ========== */}
        {mainTab === 'cenarios' && subTabs['cenarios'] === 'configuracao' && (
          <div>
            <div className="section-title">⚙️ Configuração de Cenário Customizado</div>
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-24)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-24)' }}>
              <div style={{ marginBottom: 'var(--space-20)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-8)', color: 'var(--color-text)' }}>
                  Crescimento de Demanda: {scenarioConfig.demandGrowth}%
                </label>
                <input
                  type="range"
                  min="-20"
                  max="60"
                  value={scenarioConfig.demandGrowth}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, demandGrowth: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: 'var(--space-20)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-8)', color: 'var(--color-text)' }}>
                  Taxa USD/BRL: R$ {scenarioConfig.usdRate.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="4.50"
                  max="6.50"
                  step="0.05"
                  value={scenarioConfig.usdRate}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, usdRate: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-8)', color: 'var(--color-text)' }}>
                  Aumento Lead Time: +{scenarioConfig.leadTimeIncrease} dias
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={scenarioConfig.leadTimeIncrease}
                  onChange={(e) => setScenarioConfig({...scenarioConfig, leadTimeIncrease: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="summary-banner">
              <div className="metric-card">
                <div className="label">Impacto na Receita</div>
                <div className="value" style={{ color: scenarioConfig.demandGrowth >= 0 ? 'var(--color-green-500)' : 'var(--color-red-400)' }}>
                  {scenarioConfig.demandGrowth >= 0 ? '+' : ''}R$ {(890 * scenarioConfig.demandGrowth / 100).toFixed(0)}M
                </div>
              </div>
              <div className="metric-card">
                <div className="label">Impacto Cambial</div>
                <div className="value" style={{ color: scenarioConfig.usdRate > 5.20 ? 'var(--color-red-400)' : 'var(--color-green-500)' }}>
                  R$ {((scenarioConfig.usdRate - 5.20) * 50).toFixed(0)}M
                </div>
              </div>
              <div className="metric-card">
                <div className="label">Custo de Working Capital</div>
                <div className="value" style={{ color: 'var(--color-orange-400)' }}>
                  R$ {(scenarioConfig.leadTimeIncrease * 1.5).toFixed(0)}M
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'cenarios' && subTabs['cenarios'] === 'preconfigurados' && (
          <div>
            <div className="section-title">📋 Cenários Pré-Configurados</div>
            <div className="summary-banner">
              <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setScenarioConfig({ demandGrowth: 12, usdRate: 5.20, leadTimeIncrease: 0 })}>
                <div className="label">Base</div>
                <div className="value">Demand +12%</div>
                <div className="label">USD R$ 5.20 | Lead Time +0d</div>
              </div>
              <div className="metric-card" style={{ cursor: 'pointer', borderColor: 'var(--color-green-500)' }} onClick={() => setScenarioConfig({ demandGrowth: 25, usdRate: 4.95, leadTimeIncrease: -5 })}>
                <div className="label" style={{ color: 'var(--color-green-500)' }}>Bull (Otimista)</div>
                <div className="value" style={{ color: 'var(--color-green-500)' }}>Demand +25%</div>
                <div className="label">USD R$ 4.95 | Lead Time -5d</div>
              </div>
              <div className="metric-card" style={{ cursor: 'pointer', borderColor: 'var(--color-red-400)' }} onClick={() => setScenarioConfig({ demandGrowth: -8, usdRate: 5.80, leadTimeIncrease: 15 })}>
                <div className="label" style={{ color: 'var(--color-red-400)' }}>Bear (Pessimista)</div>
                <div className="value" style={{ color: 'var(--color-red-400)' }}>Demand -8%</div>
                <div className="label">USD R$ 5.80 | Lead Time +15d</div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'cenarios' && subTabs['cenarios'] === 'sensibilidade' && (
          <div>
            <div className="section-title">📊 Análise de Sensibilidade (Tornado Chart)</div>
            
            {/* Sensitivity Summary Cards */}
            <div className="summary-banner">
              <div className="metric-card">
                <div className="label">Fator Mais Crítico</div>
                <div className="value">Demanda</div>
                <div className="label">Range: R$ 460M</div>
              </div>
              <div className="metric-card">
                <div className="label">Upside Potencial</div>
                <div className="value" style={{ color: 'var(--color-green-500)' }}>+R$ 280M</div>
                <div className="label">Melhor cenário</div>
              </div>
              <div className="metric-card">
                <div className="label">Downside Risco</div>
                <div className="value" style={{ color: 'var(--color-red-400)' }}>-R$ 180M</div>
                <div className="label">Pior cenário</div>
              </div>
              <div className="metric-card">
                <div className="label">Variáveis Críticas</div>
                <div className="value">3</div>
                <div className="label">Impacto &gt; R$ 100M</div>
              </div>
            </div>

            {/* Tornado Chart */}
            <div className="chart-container">
              <div className="chart-title">🌪️ Tornado Chart - Impacto na Receita por Variável</div>
              <div className="chart-canvas">
                <canvas id="sensitivityTornadoChart"></canvas>
              </div>
            </div>

            {/* Detailed Factor Analysis */}
            <div className="table-container">
              <h3 style={{ marginBottom: 'var(--space-16)', color: 'var(--color-primary)' }}>
                📋 Análise Detalhada de Sensibilidade
              </h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Fator</th>
                    <th>Cenário Baixo</th>
                    <th>Base</th>
                    <th>Cenário Alto</th>
                    <th>Range Total</th>
                    <th>Prioridade</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SENSITIVITY_FACTORS.map((factor, idx) => {
                    const range = Math.abs(factor.highImpact - factor.lowImpact);
                    const priority = range > 300 ? 'Crítica' : range > 150 ? 'Alta' : 'Média';
                    const priorityColor = range > 300 ? 'var(--color-red-400)' : range > 150 ? 'var(--color-orange-400)' : 'var(--color-text-secondary)';
                    
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{factor.factor}</td>
                        <td style={{ color: 'var(--color-red-400)' }}>{factor.lowImpact} {factor.unit}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>R$ 890M</td>
                        <td style={{ color: 'var(--color-green-500)' }}>+{factor.highImpact} {factor.unit}</td>
                        <td style={{ fontWeight: 600 }}>{range} {factor.unit}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            backgroundColor: range > 300 ? 'rgba(255, 84, 89, 0.2)' : range > 150 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(119, 124, 124, 0.2)',
                            color: priorityColor,
                          }}>
                            {priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* What-If Scenario Cards */}
            <div className="educational-section">
              <div className="educational-title">🎯 Cenários What-If</div>
              <div className="educational-grid">
                <div className="educational-card">
                  <div className="educational-card-title">📈 Cenário Otimista Extremo</div>
                  <div className="educational-text">
                    <strong>Demanda +30%:</strong> R$ +280M
                    <br />
                    <strong>USD R$ 4.80:</strong> R$ +35M
                    <br />
                    <strong>Lead Time -7d:</strong> R$ +45M
                    <br />
                    <strong>Total:</strong> <span style={{ color: 'var(--color-green-500)', fontWeight: 600 }}>R$ 1.25B</span> (+40% vs Base)
                  </div>
                </div>
                <div className="educational-card">
                  <div className="educational-card-title">📉 Cenário Pessimista Extremo</div>
                  <div className="educational-text">
                    <strong>Demanda -20%:</strong> R$ -180M
                    <br />
                    <strong>USD R$ 6.20:</strong> R$ -120M
                    <br />
                    <strong>Lead Time +20d:</strong> R$ -85M
                    <br />
                    <strong>Total:</strong> <span style={{ color: 'var(--color-red-400)', fontWeight: 600 }}>R$ 505M</span> (-43% vs Base)
                  </div>
                </div>
                <div className="educational-card">
                  <div className="educational-card-title">⚖️ Cenário Balanceado</div>
                  <div className="educational-text">
                    <strong>Demanda +15%:</strong> R$ +135M
                    <br />
                    <strong>USD R$ 5.35:</strong> R$ -15M
                    <br />
                    <strong>SELIC -1.5pp:</strong> R$ +22M
                    <br />
                    <strong>Total:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>R$ 1.03B</span> (+16% vs Base)
                  </div>
                </div>
                <div className="educational-card">
                  <div className="educational-card-title">🎲 Cenário de Volatilidade</div>
                  <div className="educational-text">
                    <strong>Premissa:</strong> Alta volatilidade cambial e demanda instável
                    <br />
                    <strong>USD Range:</strong> R$ 5.00 - R$ 6.00
                    <br />
                    <strong>Impacto:</strong> R$ 215M de exposição
                    <br />
                    <strong>Hedge Recomendado:</strong> 70% das compras USD
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="penalty-opportunity-grid">
              <div className="opportunity-card">
                <div className="card-title">🎯 Ação Imediata #1</div>
                <div className="card-value">Demand Forecasting</div>
                <div className="card-description">
                  <strong>Motivo:</strong> Demanda tem maior impacto (range R$ 460M)
                  <br />
                  <strong>Ação:</strong> Implementar modelo preditivo avançado com ML
                  <br />
                  <strong>Investimento:</strong> R$ 3M
                  <br />
                  <strong>Payback:</strong> 2 meses
                </div>
              </div>
              <div className="opportunity-card">
                <div className="card-title">💱 Ação Imediata #2</div>
                <div className="card-value">USD Hedging</div>
                <div className="card-description">
                  <strong>Motivo:</strong> 2º maior impacto (range R$ 215M)
                  <br />
                  <strong>Ação:</strong> Hedge cambial para 60% das compras
                  <br />
                  <strong>Investimento:</strong> R$ 12M
                  <br />
                  <strong>ROI:</strong> 1.8x
                </div>
              </div>
              <div className="opportunity-card">
                <div className="card-title">⏱️ Ação Imediata #3</div>
                <div className="card-value">Lead Time Reduction</div>
                <div className="card-description">
                  <strong>Motivo:</strong> 3º maior impacto (range R$ 130M)
                  <br />
                  <strong>Ação:</strong> Buffer optimization + supplier diversification
                  <br />
                  <strong>Investimento:</strong> R$ 23M
                  <br />
                  <strong>ROI:</strong> 2.4x
                </div>
              </div>
              <div className="penalty-card">
                <div className="card-title">⚠️ Risco de Inação</div>
                <div className="card-value" style={{ color: 'var(--color-red-400)' }}>-R$ 180M</div>
                <div className="card-description">
                  <strong>Cenário:</strong> Não implementar nenhuma mitigação
                  <br />
                  <strong>Probabilidade:</strong> 15% (cenário pessimista)
                  <br />
                  <strong>Impacto:</strong> Receita cai para R$ 710M (-20%)
                  <br />
                  <strong>Consequência:</strong> Perda de market share e competitividade
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'cenarios' && subTabs['cenarios'] === 'riscos' && (
          <div>
            <div className="section-title">⚠️ Cenários de Alto Risco</div>
            <div className="penalty-opportunity-grid">
              {MOCK_RISK_SCENARIOS.map(risk => (
                <div key={risk.id} className="penalty-card">
                  <div className="card-title">{risk.title}</div>
                  <div className="card-value" style={{ color: 'var(--color-red-400)' }}>
                    Impacto: R$ {Math.abs(risk.impact)}M
                  </div>
                  <div className="card-description">
                    <strong>Probabilidade:</strong> {risk.probability}%
                    <br />
                    {risk.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mainTab === 'cenarios' && subTabs['cenarios'] === 'mitigacao' && (
          <div>
            <div className="section-title">🛡️ Estratégias de Mitigação</div>
            <div className="penalty-opportunity-grid">
              {MOCK_MITIGATION_STRATEGIES.map(mit => (
                <div key={mit.id} className="opportunity-card">
                  <div className="card-title">{mit.title}</div>
                  <div className="card-value" style={{ color: 'var(--color-green-500)' }}>
                    ROI: {mit.roi.toFixed(1)}x
                  </div>
                  <div className="card-description">
                    <strong>Investimento:</strong> R$ {mit.investment}M
                    <br />
                    <strong>Retorno:</strong> R$ {mit.savings}M
                    <br />
                    <strong>Timeline:</strong> {mit.timeline}
                    <br />
                    <strong>Status:</strong> {mit.status === 'pending' ? '⏳ Pendente' : mit.status === 'in_progress' ? '🔄 Em Andamento' : '✅ Completo'}
                    <br /><br />
                    {mit.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}


