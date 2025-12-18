/**
 * ML Features Service
 * Fetch ML features (climate, temporal, 5G, hierarchical, predictive analytics)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ML_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export interface TemporalFeatures {
  year: number;
  month: number;
  day: number;
  weekday: number;
  quarter: number;
  day_of_year: number;
  is_weekend: boolean;
  is_holiday: boolean;
  is_carnaval?: boolean;
  is_rainy_season?: boolean;
}

export interface ClimateFeatures {
  temperature_avg_c: number;
  precipitation_mm: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  extreme_heat: boolean;
  heavy_rain: boolean;
  corrosion_risk: number;
  field_work_disruption: number;
}

export interface PredictiveAnalytics {
  maintenance_risk_score: number;
  predicted_next_maintenance: string;
  coverage_impact_score: number;
  weather_risk: 'low' | 'medium' | 'high';
  economic_value_score: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(endpoint: string, params?: Record<string, any>): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${endpoint}:${paramsStr}`;
}

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > ML_CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`ML Features API Error [${url}]:`, error);
    throw error;
  }
}

export const mlFeaturesService = {
  /**
   * Get temporal features for a date
   */
  async getTemporalFeatures(date: string): Promise<TemporalFeatures> {
    const cacheKey = getCacheKey('/features/temporal', { date });
    const cached = getCached<TemporalFeatures>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/features/temporal/calendar?date=${date}`;
    const data = await fetchWithErrorHandling<any>(url);
    
    const features: TemporalFeatures = {
      year: data.year || new Date(date).getFullYear(),
      month: data.month || new Date(date).getMonth() + 1,
      day: data.day || new Date(date).getDate(),
      weekday: data.weekday || new Date(date).getDay(),
      quarter: data.quarter || Math.floor((new Date(date).getMonth() + 3) / 3),
      day_of_year: data.day_of_year || Math.floor((new Date(date).getTime() - new Date(new Date(date).getFullYear(), 0, 0).getTime()) / 86400000),
      is_weekend: data.is_weekend || false,
      is_holiday: data.is_feriado || false,
      is_carnaval: data.is_carnaval || false,
      is_rainy_season: data.is_chuva_sazonal || false,
    };
    
    setCache(cacheKey, features);
    return features;
  },

  /**
   * Get climate features
   */
  async getClimateFeatures(date?: string): Promise<ClimateFeatures> {
    const params = date ? `?date=${date}` : '';
    const cacheKey = getCacheKey('/features/climate', { date });
    const cached = getCached<ClimateFeatures>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/features/climate/salvador${params}`;
    const data = await fetchWithErrorHandling<any>(url);
    
    const features: ClimateFeatures = {
      temperature_avg_c: data.temperature_avg_c || 25,
      precipitation_mm: data.precipitation_mm || 0,
      humidity_percent: data.humidity_percent || 60,
      wind_speed_kmh: data.wind_speed_kmh || 10,
      extreme_heat: data.extreme_heat || false,
      heavy_rain: data.heavy_rain || false,
      corrosion_risk: data.corrosion_risk || 0,
      field_work_disruption: data.field_work_disruption || 0,
    };
    
    setCache(cacheKey, features);
    return features;
  },

  /**
   * Get predictive analytics for a tower
   */
  async getPredictiveAnalytics(towerId: string): Promise<PredictiveAnalytics> {
    const cacheKey = getCacheKey('/predictive/analytics', { towerId });
    const cached = getCached<PredictiveAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      // This would connect to ML predictions API when available
      // For now, return mock data structure
      const analytics: PredictiveAnalytics = {
        maintenance_risk_score: Math.floor(Math.random() * 100),
        predicted_next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        coverage_impact_score: Math.floor(Math.random() * 100),
        weather_risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        economic_value_score: Math.floor(Math.random() * 100),
      };
      
      setCache(cacheKey, analytics);
      return analytics;
    } catch (error) {
      // Return default if unavailable
      return {
        maintenance_risk_score: 50,
        predicted_next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        coverage_impact_score: 50,
        weather_risk: 'low',
        economic_value_score: 50,
      };
    }
  },

  /**
   * Get hierarchical aggregations (region, state, zone level)
   */
  async getHierarchicalFeatures(level: 'region' | 'state' | 'zone', value: string): Promise<any> {
    const cacheKey = getCacheKey('/features/hierarchical', { level, value });
    const cached = getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_BASE_URL}/api/v1/features/hierarchical?level=${level}&value=${encodeURIComponent(value)}`;
      const data = await fetchWithErrorHandling<any>(url);
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      return {};
    }
  },

  /**
   * Clear cache
   */
  clearCache(): void {
    cache.clear();
  },
};

