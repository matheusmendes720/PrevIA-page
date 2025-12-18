/**
 * Temporal Analytics Type Definitions
 * Comprehensive types for time series analysis, lead time integration, and statistical calculations
 */

// ==================== Core Time Series Types ====================

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  leadTime?: number;
  supplierId?: string;
  materialType?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeries {
  data: TimeSeriesPoint[];
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

// ==================== Decomposition Types ====================

export interface DecompositionResult {
  original: number[];
  trend: number[];
  seasonal: number[];
  residual: number[];
  timestamps: string[];
  method: 'stl' | 'classical_additive' | 'classical_multiplicative' | 'x13';
  seasonalPeriod: number;
  trendStrength: number; // 0-1
  seasonalStrength: number; // 0-1
  residualVariance: number;
}

export interface SeasonalIndices {
  period: number; // e.g., 7 for weekly, 12 for monthly
  indices: number[]; // multiplier for each period unit
  averageEffect: number;
}

// ==================== Correlation Analysis Types ====================

export interface ACFResult {
  lag: number;
  acf: number;
  pacf: number;
  confidence: [number, number]; // confidence interval
  significant: boolean;
  interpretation: string;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][];
  pValues?: number[][];
}

export interface LjungBoxTest {
  statistic: number;
  pValue: number;
  df: number;
  significant: boolean;
  interpretation: string;
}

// ==================== Fourier Analysis Types ====================

export interface FourierComponent {
  frequency: number; // Hz or cycles per unit time
  amplitude: number;
  phase: number;
  period: number; // in time units (e.g., days)
  periodLabel: string; // e.g., "7 days", "30 days"
  strength: number; // 0-100% of total variance
  interpretation: string;
}

export interface SpectralDensity {
  frequencies: number[];
  powerSpectrum: number[];
  dominantFrequencies: FourierComponent[];
  noiseFloor: number;
  varianceExplained: number; // by top N frequencies
}

export interface Periodogram {
  frequencies: number[];
  power: number[];
  peaks: {
    frequency: number;
    power: number;
    period: number;
  }[];
}

// ==================== Lag Features Types ====================

export interface LagFeature {
  name: string;
  lag: number;
  value: number[];
  correlation: number;
  predictivePower: 'high' | 'medium' | 'low';
  businessMeaning: string;
}

export interface RollingStatistics {
  window: number;
  mean: number[];
  std: number[];
  min: number[];
  max: number[];
  median: number[];
  quantiles?: {
    q25: number[];
    q75: number[];
  };
}

export interface LagCorrelationResult {
  targetVariable: string;
  lags: number[];
  correlations: number[];
  significantLags: number[];
  optimalLag: number;
}

// ==================== Anomaly Detection Types ====================

export interface AnomalyPoint {
  timestamp: string;
  index: number;
  value: number;
  expectedValue: number;
  deviation: number;
  score: number; // z-score or anomaly score
  severity: 'critical' | 'moderate' | 'mild';
  method: 'zscore' | 'modified_zscore' | 'iqr' | 'rolling_zscore' | 'isolation_forest';
  confidence: number;
  context: string;
  rootCause?: string;
  impact?: string;
  recommendation?: string;
}

export interface AnomalyDetectionResult {
  anomalies: AnomalyPoint[];
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    moderateCount: number;
    mildCount: number;
    anomalyRate: number; // percentage
  };
  methodComparison?: {
    method: string;
    detected: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  }[];
}

export interface AnomalyCluster {
  anomalies: AnomalyPoint[];
  startDate: string;
  endDate: string;
  commonCause?: string;
  totalImpact: string;
}

// ==================== Change Point Detection Types ====================

export interface ChangePoint {
  timestamp: string;
  index: number;
  confidence: number; // 0-1
  beforeMean: number;
  afterMean: number;
  beforeStd: number;
  afterStd: number;
  changeType: 'mean_shift' | 'variance_shift' | 'trend_change' | 'regime_change';
  changeMagnitude: number; // percentage change
  changeDirection: 'increase' | 'decrease';
  duration: string; // how long the regime lasted
  cause?: string;
  impact: string;
  statisticalTests?: {
    tTest?: { statistic: number; pValue: number };
    fTest?: { statistic: number; pValue: number };
    mannKendall?: { statistic: number; pValue: number; trend: 'increasing' | 'decreasing' | 'no_trend' };
  };
}

export interface ChangePointDetectionResult {
  changePoints: ChangePoint[];
  regimes: {
    startIndex: number;
    endIndex: number;
    startDate: string;
    endDate: string;
    mean: number;
    std: number;
    trend: number;
    characteristics: string;
  }[];
  method: 'cusum' | 'pelt' | 'bayesian' | 'binary_segmentation';
}

// ==================== Calendar Effects Types ====================

export interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'season' | 'custom' | 'maintenance';
  impactScore: number; // -1 to +1
  leadTimeImpact: number; // change in days
  demandImpact: number; // percentage change
  duration: {
    start: string;
    end: string;
    durationDays: number;
  };
  narrative: string;
  recommendedActions: string[];
  historicalData?: {
    occurrences: number;
    avgImpact: number;
    consistency: number; // 0-1, how consistent the impact is
  };
}

export interface DayOfWeekEffect {
  dayOfWeek: string;
  dayIndex: number; // 0-6
  avgDemand: number;
  avgLeadTime: number;
  relativeEffect: number; // vs weekly average
  significant: boolean;
  pValue: number;
}

export interface MonthOfYearEffect {
  month: string;
  monthIndex: number; // 0-11
  avgDemand: number;
  avgLeadTime: number;
  seasonalIndex: number; // vs annual average
  significant: boolean;
  pValue: number;
}

export interface CalendarEffectsResult {
  events: CalendarEvent[];
  dayOfWeekEffects: DayOfWeekEffect[];
  monthOfYearEffects: MonthOfYearEffect[];
  upcomingEvents: CalendarEvent[];
  eventCorrelations: {
    eventType: string;
    leadTimeCorrelation: number;
    demandCorrelation: number;
    costCorrelation: number;
  }[];
}

// ==================== Cyclical Patterns Types ====================

export interface CyclicalComponent {
  scale: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: number; // in base units
  amplitude: number;
  phase: number;
  strength: number; // 0-100% of variance
  sinComponent: number[];
  cosComponent: number[];
  interpretation: string;
}

export interface MultiScaleCyclicalResult {
  components: CyclicalComponent[];
  interactions: {
    scale1: string;
    scale2: string;
    interactionStrength: number;
    effect: 'amplifying' | 'canceling' | 'independent';
  }[];
  dominantScale: string;
  combinedForecast: number[];
}

// ==================== Lead Time Integration Types ====================

export interface Supplier {
  id: string;
  name: string;
  avgLeadTime: number;
  leadTimeStd: number;
  trend: number; // change over time
  reliability: number; // 0-1
  variance: number; // percentage
  backlog: number;
  materials: string[];
  riskScore: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  category?: string; // optional category
  performanceScore?: number; // optional score
  slaCompliance?: number; // optional SLA %
}

export interface ReorderPoint {
  material: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  dailyDemand: number;
  leadTime: number;
  serviceLevel: number; // 0.90, 0.95, 0.99
  zScore: number;
  eoq: number; // Economic Order Quantity
  daysUntilViolation: number;
  riskLevel: 'critical' | 'warning' | 'ok';
  stockoutProbability: number;
}

export interface FinancialMetrics {
  workingCapital: number;
  slaRisk: number;
  procurementCost: number;
  marginImpact: number; // percentage
  bufferCost: number;
  penaltyCost: number;
  savingsOpportunity: number;
}

export interface TemporalLeadTimeCorrelation {
  supplier: string;
  seasonalEffect: {
    month: string;
    avgLeadTime: number;
    deviation: number;
  }[];
  eventImpact: {
    eventName: string;
    leadTimeIncrease: number;
    probability: number;
  }[];
  cyclicalPattern: {
    cycle: string;
    amplitude: number;
    phase: number;
  }[];
}

// ==================== Forecasting Types ====================

export interface ForecastPoint {
  timestamp: string;
  predicted: number;
  actual?: number;
  upperBound: number; // 95% CI
  lowerBound: number;
  confidence: number;
  eventId?: string;
}

export interface ForecastAccuracy {
  mape: number; // Mean Absolute Percentage Error
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  r2: number; // R-squared
  period: string;
}

// ==================== State Management Types ====================

export interface TemporalAnalysisState {
  dateRange: {
    start: string;
    end: string;
  };
  selectedSupplier: string | null;
  selectedMaterial: string | null;
  activeTab: string;
  calculationCache: Record<string, any>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string | null>;
}

// ==================== Data Generator Types ====================

export interface DataGeneratorConfig {
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly';
  baseDemand: number;
  trendRate: number; // per period
  seasonalAmplitude: number;
  cyclicalAmplitude: number;
  noiseLevel: number;
  anomalyProbability: number;
  changePointProbability: number;
  suppliers: Supplier[];
  events: CalendarEvent[];
}

export interface GeneratedDataset {
  timeSeries: TimeSeries;
  suppliers: Supplier[];
  events: CalendarEvent[];
  anomalies: AnomalyPoint[];
  changePoints: ChangePoint[];
  leadTimeData: {
    timestamp: string;
    supplierId: string;
    leadTime: number;
    material: string;
  }[];
  demandData: {
    timestamp: string;
    material: string;
    demand: number;
  }[];
}

// ==================== Utility Types ====================

export interface StatisticalTest {
  name: string;
  statistic: number;
  pValue: number;
  df?: number;
  significant: boolean;
  confidenceLevel: number;
  interpretation: string;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number; // e.g., 0.95 for 95%
}

export interface TimeSeriesMetadata {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  q25: number;
  q75: number;
  skewness: number;
  kurtosis: number;
  isStationary: boolean;
  hasSeasonality: boolean;
  hasTrend: boolean;
}

