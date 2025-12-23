// Prescriptive Intelligence Type Definitions

export interface RiskAssessment {
  risk_score: number;
  stockout_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_safety_stock_days: number;
  recommended_reorder_point_multiplier: number;
  root_causes?: string[];
  recommended_actions?: Array<{
    action: string;
    timeline: string;
    cost_impact: string;
    benefit: string;
    roi_months?: number;
    owner?: string;
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  data_sources?: string[];
}

export interface PrescriptiveInsights {
  timestamp: string;
  recommendations: string[];
  risk_assessments: Record<string, RiskAssessment>;
  action_items: string[];
  business_impact: {
    potential_stockout_reduction: string;
    inventory_cost_savings: string;
    sla_improvement: string;
    roi_estimate: string;
  };
}

export interface PredictionData {
  actual_demand: number;
  predicted_demand: number;
  demand_volatility: number;
  forecast_error: number;
  risk_score: number;
}

export interface RecommendationData {
  safety_stock: number;
  reorder_point: number;
  inventory_savings: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_action: string;
}

export interface BusinessScenario {
  demand_multiplier: number;
  safety_stock_multiplier: number;
  expected_cost: number;
}

export interface ComprehensivePrescriptive {
  timestamp?: string;
  best_model: string;
  model_performance: {
    mae?: number;
    rmse: number;
    r2: number;
    mape: number;
    last_trained?: string;
    next_training?: string;
  };
  predictions: {
    frequency?: {
      demand_volatility?: number;
      risk_score?: number;
      confidence_interval_95_upper?: number;
      confidence_interval_95_lower?: number;
      confidence_interval_68_upper?: number;
      confidence_interval_68_lower?: number;
      actual_demand?: number;
      predicted_demand?: number;
      forecast_error?: number;
    };
    temporal?: any[];
    [key: string]: any;
  };
  business_scenarios: {
    frequency?: {
      conservative: BusinessScenario & { risk_level?: string; recommendations?: string[] };
      baseline: BusinessScenario & { risk_level?: string; recommendations?: string[] };
      aggressive: BusinessScenario & { risk_level?: string; recommendations?: string[] };
    };
    temporal?: any[];
    [key: string]: any;
  };
  recommendations: {
    frequency?: {
      recommended_action: string;
      safety_stock: number;
      reorder_point: number;
      cost_savings_potential?: string;
      roi_months?: number;
      priority?: string;
      inventory_savings?: number;
    };
    temporal?: any[];
    [key: string]: any;
  };
  summary: {
    implementation_cost?: number;
    total_inventory_savings: number;
    expected_roi: number;
    overall_risk_assessment?: string;
    key_action_items?: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
    }>;
    total_families_analyzed?: number;
    high_risk_families?: number;
    high_risk_family_names?: string[];
  };
  external_factors_impact?: {
    economic?: Array<{ name: string; impact: string; severity: string }>;
    infrastructure?: Array<{ name: string; impact: string; severity: string }>;
    climate?: Array<{ name: string; impact: string; severity: string }>;
  };
}

export interface PrescriptiveKpiData {
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore?: number;
  actionBadge?: 'URGENT' | 'REVIEW' | 'OK';
  confidence?: number;
  roi?: string;
  impact?: string;
  sources?: string[];
}

export interface PrescriptiveTooltipData {
  whatItMeans: string;
  whyItMatters: string;
  whatToDoNow: string;
  rootCauses?: string[];
  recommendedActions?: Array<{
    action: string;
    timeline: string;
    costImpact: string;
    benefit: string;
    roiMonths?: number;
    owner?: string;
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  dataSources?: Array<{
    name: string;
    type: 'internal' | 'government' | 'industry' | 'supplier';
    confidence: number;
    description: string;
  }>;
  externalFactors?: Array<{
    factor: string;
    value: string;
    change: string;
    impact: string;
  }>;
}

