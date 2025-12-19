/**
 * Lead Time Analytics Type Definitions
 * Specific types for supplier performance, reorder points, and financial optimization
 */

// ==================== Supplier Performance Types ====================

export interface SupplierMetrics {
  id: string;
  name: string;
  avgLeadTime: number; // days
  leadTimeStd: number; // standard deviation
  trend: number; // change over 12 months (days)
  reliability: number; // 0-1 (% on-time delivery)
  variance: number; // percentage variance from baseline
  backlog: number; // number of pending orders
  materials: string[];
  riskScore: number; // 0-10
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  cost: {
    unitCost: number;
    logisticsCost: number;
    totalCost: number;
  };
  history: {
    timestamp: string;
    leadTime: number;
    orderVolume: number;
  }[];
}

export interface SupplierComparison {
  suppliers: SupplierMetrics[];
  benchmark: {
    avgLeadTime: number;
    avgReliability: number;
    bestPerformer: string;
    worstPerformer: string;
  };
  recommendations: {
    supplier: string;
    action: 'increase_allocation' | 'decrease_allocation' | 'consolidate' | 'replace' | 'renegotiate';
    reason: string;
    impactEstimate: string;
    roi: number;
  }[];
}

// ==================== Reorder Point Calculation Types ====================

export interface ReorderPointCalculation {
  material: string;
  materialType: string;
  supplier: string;
  
  // Current state
  currentStock: number; // units
  stockValue: number; // R$
  
  // Demand parameters
  dailyDemand: number; // units per day
  demandStd: number; // standard deviation of demand
  demandTrend: number; // growth rate
  
  // Lead time parameters
  leadTime: number; // days
  leadTimeStd: number; // standard deviation
  leadTimeVariance: number; // percentage
  
  // Reorder calculation
  serviceLevel: number; // 0.90, 0.95, 0.99
  zScore: number; // statistical z-score for service level
  safetyStock: number; // SS = Z × σ × √L
  reorderPoint: number; // PP = D×L + SS
  eoq: number; // Economic Order Quantity
  
  // Status
  daysUntilReorder: number; // negative = already below
  daysUntilStockout: number; // assuming no reorder
  stockoutProbability: number; // 0-1
  riskLevel: 'critical' | 'warning' | 'ok';
  urgency: 'immediate' | 'within_week' | 'within_month' | 'not_urgent';
  
  // Recommendations
  recommendedOrderQuantity: number;
  estimatedDeliveryDate: string;
  triggerPONow: boolean;
}

export interface SafetyStockOptimization {
  material: string;
  currentSafetyStock: number;
  optimizedSafetyStock: number;
  currentServiceLevel: number;
  optimizedServiceLevel: number;
  costDelta: number; // change in holding cost
  riskDelta: number; // change in stockout risk
  recommendation: 'increase' | 'decrease' | 'maintain';
  seasonalAdjustment?: {
    month: string;
    adjustment: number; // percentage
    reason: string;
  }[];
}

// ==================== Financial Optimization Types ====================

export interface WorkingCapitalMetrics {
  totalInventoryValue: number; // R$
  avgInventoryDays: number; // days of inventory on hand
  targetInventoryDays: number;
  excessInventory: number; // R$ tied up
  optimalInventoryValue: number; // R$
  cashFlowImpact: number; // R$ released/required
}

export interface SLAMetrics {
  slaTarget: number; // percentage (e.g., 95%)
  slaActual: number; // current performance
  breachCount: number; // number of violations
  potentialPenalty: number; // R$ at risk
  breachCost: number; // R$ already incurred
  materialsAtRisk: string[];
  mitigationCost: number; // R$ to fix
}

export interface CostBreakdown {
  materialCost: number; // R$
  logisticsCost: number; // R$
  bufferStockCost: number; // R$ holding cost
  leadTimeDelayCost: number; // R$ opportunity cost
  penaltyCost: number; // R$ SLA penalties
  totalCost: number; // R$
  costPerUnit: number; // R$ per unit
  costAsPercentOfRevenue: number; // percentage
}

export interface MarginAnalysis {
  revenue: number; // R$
  cost: number; // R$
  grossMargin: number; // R$
  grossMarginPercent: number; // percentage
  baselineMargin: number; // historical average
  marginCompression: number; // percentage change
  impactFactors: {
    factor: 'lead_time' | 'buffer_cost' | 'penalties' | 'volume_discount' | 'repricing';
    impact: number; // R$
    impactPercent: number;
  }[];
  targetMargin: number; // desired margin
  gapToTarget: number; // R$ improvement needed
}

export interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  category: 'supplier' | 'inventory' | 'pricing' | 'process';
  
  // Investment
  capex: number; // R$ one-time
  opex: number; // R$ annual
  implementationTime: string; // "immediate", "1 month", etc.
  
  // Returns
  annualSavings: number; // R$/year
  marginImprovement: number; // percentage
  riskReduction: number; // percentage
  
  // Metrics
  roi: number; // percentage
  paybackPeriod: number; // days
  npv: number; // R$ net present value
  irr: number; // percentage internal rate of return
  
  // Details
  actionSteps: string[];
  risks: string[];
  dependencies: string[];
  viabilityScore: number; // 0-100
}

export interface FinancialOptimizationResult {
  currentState: {
    workingCapital: WorkingCapitalMetrics;
    sla: SLAMetrics;
    costs: CostBreakdown;
    margin: MarginAnalysis;
  };
  scenarios: OptimizationScenario[];
  topRecommendations: OptimizationScenario[];
  projectedSavings: {
    quarter: string;
    cumulative: number; // R$
    breakdown: {
      category: string;
      amount: number;
    }[];
  }[];
  implementationRoadmap: {
    phase: string;
    timeline: string;
    scenarios: string[];
    expectedImpact: number; // R$
    dependencies: string[];
  }[];
}

// ==================== Alert Types ====================

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'lead_time' | 'stockout' | 'cost' | 'supplier' | 'sla';
  title: string;
  message: string;
  context: {
    supplier?: string;
    material?: string;
    metric?: string;
    value?: number;
    threshold?: number;
  };
  impact: string;
  recommendation: string;
  actionRequired: boolean;
  deadline?: string;
  estimatedCost?: number; // R$ if not addressed
  timestamp: string;
}

// ==================== Performance Tracking Types ====================

export interface PerformanceTrend {
  metric: string;
  timeseries: {
    timestamp: string;
    value: number;
    target?: number;
  }[];
  trend: 'improving' | 'stable' | 'degrading';
  changeRate: number; // percentage per month
  forecastNext30Days: number;
  confidenceInterval: [number, number];
}

export interface KPISummary {
  leadTime: {
    current: number;
    baseline: number;
    target: number;
    trend: string;
  };
  reliability: {
    current: number;
    baseline: number;
    target: number;
    trend: string;
  };
  cost: {
    current: number;
    baseline: number;
    target: number;
    trend: string;
  };
  margin: {
    current: number;
    baseline: number;
    target: number;
    trend: string;
  };
  sla: {
    current: number;
    baseline: number;
    target: number;
    trend: string;
  };
}

// ==================== Integration with Temporal Analysis ====================

export interface TemporalSupplierPattern {
  supplierId: string;
  supplierName: string;
  
  // Seasonal patterns
  seasonalImpact: {
    month: string;
    avgLeadTime: number;
    deviation: number;
    reliability: number;
  }[];
  
  // Calendar effects
  holidayImpact: {
    holiday: string;
    leadTimeIncrease: number; // days
    reliabilityDecrease: number; // percentage
    probability: number;
  }[];
  
  // Cyclical patterns
  weeklyPattern: {
    dayOfWeek: string;
    avgLeadTime: number;
    reliability: number;
  }[];
  
  // Anomalies
  historicalAnomalies: {
    date: string;
    leadTime: number;
    normalLeadTime: number;
    cause: string;
    impact: string;
  }[];
  
  // Change points
  performanceChanges: {
    date: string;
    beforeAvg: number;
    afterAvg: number;
    cause: string;
    lasting: boolean;
  }[];
}

export interface SeasonalDemandForecast {
  material: string;
  forecast: {
    date: string;
    demand: number;
    confidence: [number, number];
    events: string[];
  }[];
  seasonalFactors: {
    period: string;
    factor: number; // multiplier
  }[];
  trendComponent: number; // growth rate
  recommendedBufferAdjustment: {
    period: string;
    adjustment: number; // percentage
    reason: string;
  }[];
}


