/**
 * API Client for Nova Corrente Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ForecastResponse {
  item_id: string;
  forecast: number[];
  dates: string[];
  metrics?: {
    mape?: number;
    rmse?: number;
    mae?: number;
  };
}

export interface InventoryResponse {
  item_id: string;
  current_stock: number;
  reorder_point: number;
  safety_stock: number;
  days_to_rupture: number;
  alert_level: 'normal' | 'medium' | 'high' | 'critical';
}

export interface MetricsResponse {
  total_items: number;
  data_points: number;
  trained_models: number;
  system_health: 'healthy' | 'degraded' | 'down';
}

export interface KpiDataResponse {
  stockout_rate: string;
  mape_accuracy: string;
  annual_savings: string;
  stockout_change: string;
  mape_change: string;
  savings_change: string;
  timestamp: string;
}

export interface AlertData {
  item: string;
  item_code: string;
  current_stock: number;
  reorder_point: number;
  days_until_stockout: number;
  level: 'CRITICAL' | 'WARNING' | 'NORMAL';
  recommendation: string;
}

export interface ForecastData {
  date: string;
  demanda_real: number;
  demanda_prevista: number;
}

export interface InventoryAnalytics {
  name: string;
  value: number;
}

export interface SupplierAnalytics {
  name: string;
  'Lead Time (dias)': number;
}

export interface GeographicData {
  region: string;
  avg_temperature: number;
  avg_humidity: number;
  avg_precipitation: number;
  corrosion_risk_pct: number;
}

export interface SlaData {
  availability_target: number;
  avg_availability: number;
  total_penalties_brl: number;
  high_value_towers: number;
  penalty_range_min: number;
  penalty_range_max: number;
  downtime_hours_avg: number;
  penalty_per_hour_avg: number;
}

class ApiClient {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 seconds cache for KPIs

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${params ? JSON.stringify(params) : ''}`;
  }
  
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }
  
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clearCache(): void {
    this.cache.clear();
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    useCache: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isGetRequest = !options?.method || options.method === 'GET';
    
    // Try cache for GET requests
    if (isGetRequest && useCache) {
      const cacheKey = this.getCacheKey(endpoint);
      const cached = this.getCached<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    } catch (error: any) {
      // Handle connection errors (backend not running, network issues)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('BACKEND_UNAVAILABLE: Backend API server is not running. Please start the backend server on http://localhost:5000');
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Cache GET responses
    if (isGetRequest && useCache) {
      const cacheKey = this.getCacheKey(endpoint);
      this.setCache(cacheKey, data);
    }

    return data;
  }

  async health(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.fetch('/health');
  }

  async getForecast(itemId: string, forecastDays: number = 30): Promise<ForecastResponse> {
    return this.fetch(`/api/v1/forecasts/${itemId}?days=${forecastDays}`);
  }

  async getInventory(itemId: string): Promise<InventoryResponse> {
    return this.fetch(`/api/v1/inventory/${itemId}`);
  }

  async getMetrics(): Promise<MetricsResponse> {
    return this.fetch('/api/v1/metrics');
  }

  async getItems(): Promise<string[]> {
    return this.fetch('/api/v1/items');
  }

  // New endpoints for Nova Corrente dashboard
  async getKpis(): Promise<{ status: string; kpis: KpiDataResponse }> {
    return this.fetch('/api/kpis');
  }

  async getAlerts(): Promise<{ status: string; alerts: AlertData[] }> {
    return this.fetch('/api/alerts');
  }

  async get30DayForecast(): Promise<{ status: string; forecast_data: ForecastData[] }> {
    return this.fetch('/api/forecast/30days');
  }

  async getInventoryAnalytics(): Promise<{ status: string; inventory: InventoryAnalytics[]; suppliers: SupplierAnalytics[] }> {
    return this.fetch('/api/inventory/analytics');
  }

  async getGeographicData(): Promise<{ status: string; geographic_data: GeographicData[]; total_towers: number; '5g_coverage': number }> {
    return this.fetch('/api/geographic/data');
  }

  async getSlaPenalties(): Promise<{ status: string; sla: SlaData }> {
    return this.fetch('/api/sla/penalties');
  }

  async getSupplierLeadtimes(): Promise<{ status: string; suppliers: SupplierAnalytics[]; avg_leadtime: number; max_leadtime: number; min_leadtime: number }> {
    return this.fetch('/api/suppliers/leadtimes');
  }

  async getModelPerformance(): Promise<{ 
    status: string; 
    loss_curves: Array<{epoch: number; train: number; validation: number}>; 
    feature_importance: Array<{feature: string; importance: number}>;
    model_comparison: Array<{metric: string; ARIMA: number; Prophet: number; LSTM: number; Ensemble: number}>;
    residuals: Array<{actual: number; predicted: number}>;
    training_status: string;
    last_trained: string;
    ensemble_weights: {ARIMA: number; Prophet: number; LSTM: number};
  }> {
    return this.fetch('/api/models/performance');
  }

  async getLLMRecommendations(alerts?: AlertData[], context?: any): Promise<{ status: string; recommendations: any[]; timestamp: string; llm_enabled: boolean }> {
    if (alerts && context) {
      return this.fetch('/api/llm/recommendations', {
        method: 'POST',
        body: JSON.stringify({ alerts, context })
      });
    }
    return this.fetch('/api/llm/recommendations');
  }

  // New clustering endpoints
  async getEquipmentFailureClustering(): Promise<{
    status: string;
    cluster_stats: Array<{
      cluster: number;
      count: number;
      failure_rate: number;
      avg_temperature: number;
      avg_speed: number;
      risk_level: string;
    }>;
    sample_points: any[];
    total_records: number;
  }> {
    return this.fetch('/api/clustering/equipment-failure');
  }

  async getTowerPerformanceClustering(): Promise<{
    status: string;
    cluster_stats: Array<{
      cluster: number;
      count: number;
      avg_users: number;
      avg_download: number;
      avg_latency: number;
      performance: string;
    }>;
    sample_points: any[];
    total_towers: number;
  }> {
    return this.fetch('/api/clustering/tower-performance');
  }

  async getPrescriptiveRecommendations(): Promise<{
    status: string;
    recommendations: Array<{
      id: string;
      title: string;
      description: string;
      priority: string;
      impact: string;
      estimated_savings: string;
      action_type: string;
      urgency: string;
      affected_regions: string[];
    }>;
    total_count: number;
    high_priority_count: number;
    timestamp: string;
  }> {
    return this.fetch('/api/prescriptive/recommendations');
  }

  // ==================== ML Feature Category Endpoints ====================

  // Temporal Features
  async getTemporalFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/temporal?${params.toString()}`);
  }

  async getBrazilianCalendar(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/temporal/calendar?${params.toString()}`);
  }

  async getCyclicalFeatures(materialId?: number, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/temporal/cyclical?${params.toString()}`);
  }

  async getTemporalSummary(itemId?: number, siteId?: number, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (itemId) params.append('item_id', itemId.toString());
    if (siteId) params.append('site_id', siteId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/temporal/summary?${params.toString()}`);
  }

  // Climate Features
  async getClimateFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/climate?${params.toString()}`);
  }

  async getSalvadorClimate(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/climate/salvador?${params.toString()}`);
  }

  async getClimateRisks(minRisk: number = 0.5): Promise<any> {
    return this.fetch(`/api/v1/features/climate/risks?min_risk=${minRisk}`);
  }

  async getClimateTrends(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/climate/trends?${params.toString()}`);
  }

  // Economic Features
  async getEconomicFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/economic?${params.toString()}`);
  }

  async getBACENIndicators(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/economic/bacen?${params.toString()}`);
  }

  async getEconomicTrends(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/economic/trends?${params.toString()}`);
  }

  async getEconomicImpacts(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/economic/impacts?${params.toString()}`);
  }

  // 5G Features
  async get5GFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/5g?${params.toString()}`);
  }

  async get5GExpansion(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/5g/expansion?${params.toString()}`);
  }

  async get5GMilestones(): Promise<any> {
    return this.fetch('/api/v1/features/5g/milestones');
  }

  async get5GDemandImpact(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/5g/demand-impact?${params.toString()}`);
  }

  // Lead Time Features
  async getLeadTimeFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/lead-time?${params.toString()}`);
  }

  async getSupplierLeadTimes(): Promise<any> {
    return this.fetch('/api/v1/features/lead-time/suppliers');
  }

  async getMaterialLeadTimes(materialId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    return this.fetch(`/api/v1/features/lead-time/materials?${params.toString()}`);
  }

  async getLeadTimeRisks(): Promise<any> {
    return this.fetch('/api/v1/features/lead-time/risks');
  }

  // SLA Features
  async getSLAFeatures(materialId?: number, tierNivel?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (tierNivel) params.append('tier_nivel', tierNivel);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/sla?${params.toString()}`);
  }

  async getSLAPenalties(tierNivel?: string): Promise<any> {
    const params = new URLSearchParams();
    if (tierNivel) params.append('tier_nivel', tierNivel);
    return this.fetch(`/api/v1/features/sla/penalties?${params.toString()}`);
  }

  async getSLAAvailability(materialId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    return this.fetch(`/api/v1/features/sla/availability?${params.toString()}`);
  }

  async getSLAViolations(tierNivel?: string): Promise<any> {
    const params = new URLSearchParams();
    if (tierNivel) params.append('tier_nivel', tierNivel);
    return this.fetch(`/api/v1/features/sla/violations?${params.toString()}`);
  }

  // Hierarchical Features
  async getHierarchicalFeatures(level: 'family' | 'site' | 'supplier' = 'family', materialId?: number, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    params.append('level', level);
    if (materialId) params.append('material_id', materialId.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/hierarchical?${params.toString()}`);
  }

  async getFamilyAggregations(familyId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (familyId) params.append('family_id', familyId.toString());
    return this.fetch(`/api/v1/features/hierarchical/family?${params.toString()}`);
  }

  async getSiteAggregations(siteId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (siteId) params.append('site_id', siteId);
    return this.fetch(`/api/v1/features/hierarchical/site?${params.toString()}`);
  }

  async getSupplierAggregations(supplierId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplier_id', supplierId.toString());
    return this.fetch(`/api/v1/features/hierarchical/supplier?${params.toString()}`);
  }

  // Categorical Features
  async getCategoricalFeatures(materialId?: number, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/categorical?${params.toString()}`);
  }

  async getFamilyEncodings(): Promise<any> {
    return this.fetch('/api/v1/features/categorical/families');
  }

  async getSiteEncodings(): Promise<any> {
    return this.fetch('/api/v1/features/categorical/sites');
  }

  async getSupplierEncodings(): Promise<any> {
    return this.fetch('/api/v1/features/categorical/suppliers');
  }

  // Business Features
  async getBusinessFeatures(materialId?: number, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/business?${params.toString()}`);
  }

  async getTop5Families(): Promise<any> {
    return this.fetch('/api/v1/features/business/top5-families');
  }

  async getTierAnalytics(): Promise<any> {
    return this.fetch('/api/v1/features/business/tiers');
  }

  async getMaterialBusinessContext(materialId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    return this.fetch(`/api/v1/features/business/materials?${params.toString()}`);
  }

  // ==================== Expanded Feature Category Endpoints ====================

  // Transport Features
  async getTransportFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/transport?${params.toString()}`);
  }

  // Trade Features
  async getTradeFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/trade?${params.toString()}`);
  }

  // Energy Features
  async getEnergyFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/energy?${params.toString()}`);
  }

  // Employment Features
  async getEmploymentFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/employment?${params.toString()}`);
  }

  // Construction Features
  async getConstructionFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/construction?${params.toString()}`);
  }

  // Industrial Features
  async getIndustrialFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/industrial?${params.toString()}`);
  }

  // Expanded Economic Features
  async getExpandedEconomicFeatures(materialId?: number, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.fetch(`/api/v1/features/economic-extended?${params.toString()}`);
  }

  // Logistics Features
  async getLogisticsFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/logistics?${params.toString()}`);
  }

  // Regional Features
  async getRegionalFeatures(materialId?: number, startDate?: string, endDate?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const params = new URLSearchParams();
    if (materialId) params.append('material_id', materialId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.fetch(`/api/v1/features/regional?${params.toString()}`);
  }

  // ==================== Market Intelligence Endpoints ====================

  // Market Clusters
  async getMarketClusters(): Promise<{ status: string; data: any[] }> {
    return this.fetch('/api/v1/market-intelligence/clusters');
  }

  async getClusterDetails(clusterName: string): Promise<{ status: string; data: any }> {
    return this.fetch(`/api/v1/market-intelligence/cluster/${clusterName}`);
  }

  async getTopPerformers(limit: number = 10): Promise<{ status: string; data: any[] }> {
    return this.fetch(`/api/v1/market-intelligence/top-performers?limit=${limit}`);
  }

  // Strategic Recommendations
  async getStrategicRecommendations(): Promise<{ status: string; data: any }> {
    return this.fetch('/api/v1/market-intelligence/strategic-recommendations');
  }

  // Business Metrics
  async getBusinessMetrics(): Promise<{ status: string; data: any }> {
    return this.fetch('/api/v1/market-intelligence/business-metrics');
  }

  // Temporal Trends
  async getTemporalTrends(): Promise<{ status: string; data: any[] }> {
    return this.fetch('/api/v1/market-intelligence/temporal-trends');
  }

  // Predictive Analysis
  async getPredictiveAnalysis(): Promise<{ status: string; data: any }> {
    return this.fetch('/api/v1/market-intelligence/predictive-analysis');
  }

  // Alerts
  async getMarketIntelligenceAlerts(severity?: string): Promise<{ status: string; data: any }> {
    const params = severity ? `?severity=${severity}` : '';
    return this.fetch(`/api/v1/market-intelligence/alerts${params}`);
  }

  // Data Stories
  async getDataStory(clusterName: string): Promise<{ status: string; data: any }> {
    return this.fetch(`/api/v1/market-intelligence/data-stories/${clusterName}`);
  }
}

export const apiClient = new ApiClient();

