/**
 * TypeScript types for ML feature categories
 */

// Base types
export interface FeatureMetadata {
  total_count: number;
  date_range?: {
    start: string;
    end: string;
  } | null;
  last_updated: string;
}

export interface FeatureCategoryResponse<T = any> {
  status: string;
  data: T[];
  metadata: FeatureMetadata;
}

export interface FeatureFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  materialIds?: number[];
  familyIds?: number[];
  siteIds?: string[];
  supplierIds?: number[];
  tiers?: ('TIER_1' | 'TIER_2' | 'TIER_3')[];
}

// Temporal Features
export interface TemporalFeatures {
  material_id?: number | null;
  year: number;
  month: number;
  day: number;
  weekday: number;
  quarter: number;
  day_of_year: number;
  month_sin: number;
  month_cos: number;
  day_of_year_sin: number;
  day_of_year_cos: number;
  is_weekend: boolean;
  is_holiday: boolean;
  is_carnival: boolean;
  is_verao: boolean;
  is_chuva_sazonal: boolean;
  data_referencia: string;
}

export interface CalendarFeatures {
  data_referencia: string;
  is_feriado: boolean;
  is_carnaval: boolean;
  is_natal: boolean;
  is_verao: boolean;
  is_chuva_sazonal: boolean;
  impact_demanda: number;
  descricao?: string | null;
}

export interface TemporalFeaturesResponse extends FeatureCategoryResponse<TemporalFeatures> {}
export interface CalendarFeaturesResponse extends FeatureCategoryResponse<CalendarFeatures> {}

// Climate Features
export interface ClimateFeatures {
  material_id?: number | null;
  data_referencia: string;
  temperature_avg_c: number;
  precipitation_mm: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  extreme_heat: boolean;
  cold_weather: boolean;
  heavy_rain: boolean;
  no_rain: boolean;
  is_intense_rain: boolean;
  is_high_humidity: boolean;
  corrosion_risk: number; // 0-1
  field_work_disruption: number; // 0-1
}

export interface SalvadorClimate {
  data_referencia: string;
  temperatura_media: number;
  precipitacao_mm: number;
  umidade_percentual: number;
  velocidade_vento_kmh: number;
  is_extreme_heat: boolean;
  is_heavy_rain: boolean;
  corrosion_risk: number;
  field_work_disruption: number;
}

export interface ClimateRisk {
  material_id: number;
  material_name: string;
  corrosion_risk: number;
  field_work_disruption: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ClimateFeaturesResponse extends FeatureCategoryResponse<ClimateFeatures> {}
export interface SalvadorClimateResponse extends FeatureCategoryResponse<SalvadorClimate> {}
export interface ClimateRisksResponse extends FeatureCategoryResponse<ClimateRisk> {}

// Economic Features
export interface EconomicFeatures {
  material_id?: number | null;
  data_referencia: string;
  inflation_rate: number;
  exchange_rate_brl_usd: number;
  gdp_growth_rate: number;
  selic_rate: number;
  high_inflation: boolean;
  currency_devaluation: boolean;
}

export interface BACENIndicators {
  data_referencia: string;
  taxa_inflacao: number;
  taxa_cambio_brl_usd: number;
  pib_crescimento: number;
  taxa_selic: number;
  is_high_inflation: boolean;
  is_currency_devaluation: boolean;
}

export interface EconomicFeaturesResponse extends FeatureCategoryResponse<EconomicFeatures> {}
export interface BACENIndicatorsResponse extends FeatureCategoryResponse<BACENIndicators> {}

// 5G Features
export interface FiveGFeatures {
  material_id?: number | null;
  data_referencia: string;
  coverage_5g_percentual: number;
  investment_5g_brl_billions: number;
  is_5g_milestone: boolean;
  is_5g_active: boolean;
  expansion_5g_rate: number;
}

export interface FiveGExpansion {
  data_referencia: string;
  cobertura_5g_percentual: number;
  investimento_5g_brl_billions: number;
  torres_5g_ativas: number;
  municipios_5g: number;
  is_5g_milestone: boolean;
  taxa_expansao_5g: number;
}

export interface FiveGFeaturesResponse extends FeatureCategoryResponse<FiveGFeatures> {}
export interface FiveGExpansionResponse extends FeatureCategoryResponse<FiveGExpansion> {}

// Lead Time Features
export type LeadTimeCategory = 'FAST' | 'NORMAL' | 'SLOW' | 'VERY_SLOW';

export interface LeadTimeFeatures {
  material_id: number;
  lead_time_days: number;
  base_lead_time_days: number;
  total_lead_time_days: number;
  customs_delay_days: number;
  strike_risk: number;
  is_critical_lead_time: boolean;
  lead_time_category: LeadTimeCategory;
  supplier_lead_time_mean: number;
  supplier_lead_time_std: number;
}

export interface SupplierLeadTime {
  fornecedor_id: number;
  fornecedor_nome: string;
  lead_time_medio: number;
  lead_time_std: number;
  lead_time_min: number;
  lead_time_max: number;
  total_pedidos: number;
  reliability_score: number;
  // Computed fields for frontend
  supplier_id?: number;
  supplier_name?: string;
  avg_lead_time_days?: number;
  std_lead_time_days?: number;
  material_count?: number;
  reliability?: number;
}

export interface MaterialLeadTime {
  material_id: number;
  material_name: string;
  avg_lead_time: number;
  min_lead_time: number;
  max_lead_time: number;
  supplier_count: number;
}

export interface LeadTimeRisk {
  material_id: number;
  material_name: string;
  avg_lead_time: number;
  lead_time_std: number;
  risk_level: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_high_variability: boolean;
}

export interface LeadTimeFeaturesResponse extends FeatureCategoryResponse<LeadTimeFeatures> {}
export interface SupplierLeadTimesResponse extends FeatureCategoryResponse<SupplierLeadTime> {}

// SLA Features
export interface SLAFeatures {
  material_id: number;
  material_name: string;
  tier_nivel: string;
  sla_penalty_brl: number;
  availability_target: number;
  downtime_hours_monthly: number;
  sla_violation_risk: number;
  availability_actual?: number | null;
}

export interface SLAPenalty {
  material_id: number;
  material_name: string;
  tier_nivel: string;
  sla_penalty_brl: number;
  availability_target: number;
  current_availability: number;
  penalty_risk: number;
}

export interface SLAViolation {
  material_id: number;
  material_name: string;
  tier_nivel: string;
  sla_violation_risk: number;
  violation_level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_penalty_brl: number;
}

export interface SLAFeaturesResponse extends FeatureCategoryResponse<SLAFeatures> {}
export interface SLAPenaltiesResponse extends FeatureCategoryResponse<SLAPenalty> {}
export interface SLAViolationsResponse extends FeatureCategoryResponse<SLAViolation> {}

// Hierarchical Features
export type HierarchicalLevel = 'family' | 'site' | 'supplier';

export interface HierarchicalFeatures {
  material_id: number;
  family_demand_ma_7: number;
  family_demand_ma_30: number;
  family_demand_std_7: number;
  family_demand_std_30: number;
  family_frequency: number;
  site_demand_ma_7: number;
  site_demand_ma_30: number;
  site_frequency: number;
  supplier_frequency: number;
  supplier_lead_time_mean: number;
  supplier_lead_time_std: number;
}

export interface FamilyAggregation {
  family_id: number;
  family_name: string;
  total_demand: number;
  avg_demand_7d: number;
  avg_demand_30d: number;
  std_demand_7d: number;
  std_demand_30d: number;
  material_count: number;
  site_count: number;
}

export interface SiteAggregation {
  site_id: string;
  site_name?: string;
  total_demand: number;
  avg_demand_7d: number;
  avg_demand_30d: number;
  material_count: number;
  family_count: number;
}

export interface SupplierAggregation {
  supplier_id: number;
  supplier_name: string;
  total_demand: number;
  material_count: number;
  avg_lead_time: number;
  std_lead_time: number;
  reliability: number;
}

export interface HierarchicalFeaturesResponse extends FeatureCategoryResponse<HierarchicalFeatures> {}
export interface FamilyAggregationsResponse extends FeatureCategoryResponse<FamilyAggregation> {}
export interface SiteAggregationsResponse extends FeatureCategoryResponse<SiteAggregation> {}
export interface SupplierAggregationsResponse extends FeatureCategoryResponse<SupplierAggregation> {}

// Categorical Features
export interface CategoricalFeatures {
  material_id: number;
  familia: string;
  familia_encoded: number;
  deposito: string;
  site_id: string;
  fornecedor: string;
}

export interface FamilyEncoding {
  family_id: number;
  family_name: string;
  encoded_value: number;
  material_count: number;
}

export interface SiteEncoding {
  site_id: string;
  site_name?: string;
  encoded_value: number;
  material_count: number;
}

export interface SupplierEncoding {
  supplier_id: number;
  supplier_name: string;
  encoded_value: number;
  material_count: number;
}

export interface CategoricalFeaturesResponse extends FeatureCategoryResponse<CategoricalFeatures> {}
export interface FamilyEncodingsResponse extends FeatureCategoryResponse<FamilyEncoding> {}
export interface SiteEncodingsResponse extends FeatureCategoryResponse<SiteEncoding> {}
export interface SupplierEncodingsResponse extends FeatureCategoryResponse<SupplierEncoding> {}

// Business Features
export interface BusinessFeatures {
  material_id: number;
  material: string;
  produto_servico: string;
  quantidade: number;
  unidade_medida: string;
  solicitacao: string;
  data_requisitada: string;
  data_solicitado: string;
  data_compra: string;
}

export interface Top5Family {
  family_id: number;
  family_name: string;
  total_movements: number;
  percentage: number;
  unique_materials: number;
  unique_sites: number;
}

export interface TierAnalytics {
  tier_nivel: string;
  material_count: number;
  total_sla_penalty_brl: number;
  avg_availability_target: number;
  avg_downtime_hours: number;
  high_risk_count: number;
}

export interface BusinessFeaturesResponse extends FeatureCategoryResponse<BusinessFeatures> {}
export interface Top5FamiliesResponse extends FeatureCategoryResponse<Top5Family> {}
export interface TierAnalyticsResponse extends FeatureCategoryResponse<TierAnalytics> {}

// ==================== Market Intelligence Types ====================

export interface MarketCluster {
  name: string;
  datasets: number;
  avgMAPE: number;
  avgR2: number;
  topPerformers: Array<{
    name: string;
    mape: number;
    r2: number;
    status: string;
  }>;
  status: 'excellent' | 'good' | 'needs_improvement';
}

export interface DatasetPerformance {
  name: string;
  cluster: string;
  mape: number;
  r2: number;
  reorder_point?: number;
  status: 'excellent' | 'good' | 'needs_improvement';
}

export interface StrategicRecommendation {
  id: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  actionItems: string[];
  impact?: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MarketOpportunity {
  category: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
}

export interface MarketRisk {
  category: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  mitigation: string;
}

export interface BusinessMetrics {
  datasets_analyzed: number;
  total_annual_savings: number;
  roi_percent: number;
  payback_period_months: number | null;
  inventory_savings: number;
  stockout_reduction: number;
  operational_efficiency: number;
  average_mape: number;
  baseline_mape: number;
  mape_improvement: number;
}

export interface PhaseMetrics {
  phase: string;
  avgMAPE: number;
  mapeStd: number;
  avgR2: number;
  datasets: number;
}

export interface PredictiveAnalysis {
  predictedMAPE: number;
  predictedR2: number;
  trend: 'improving' | 'stable' | 'declining';
  historical: PhaseMetrics[];
}

export interface MarketIntelligenceAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  dataset: string;
  model: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
  recommendation: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
}

export interface AlertsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface DataStory {
  cluster: string;
  narrative: string;
  format: 'markdown' | 'text';
}









