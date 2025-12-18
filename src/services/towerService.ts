/**
 * Tower Data Service
 * Centralized API client for tower data with caching and error handling
 */

export interface Tower {
  tower_id: string;
  latitude: number;
  longitude: number;
  maintenance_zone: string;
  zone_type: string;
  region: string;
  state_code: string;
  state_name: string;
  tower_type: string;
  status: 'active' | 'maintenance' | 'inactive';
  priority: 'High' | 'Medium' | 'Low';
  height_meters: number;
  last_maintenance: string;
  next_maintenance: string;
  operator_count: number;
  signal_strength: number;
  uptime_percent: number;
  site_code?: string;
  regional_tower_count?: number;
  regional_investment_brl_billions?: number;
  regional_coverage_pct?: number;
  regional_rural_coverage_pct?: number;
  data_source?: string;
  extraction_date?: string;
  total_towers?: number;
}

export interface TowerStats {
  total_towers: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_region: Record<string, number>;
  by_state: Record<string, number>;
  by_zone: Record<string, number>;
  average_height?: number;
  average_signal_strength?: number;
  average_uptime?: number;
}

export interface TowerFilters {
  region?: string;
  state?: string;
  zone?: string;
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

export interface TowerResponse {
  towers: Tower[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  if (age > CACHE_TTL) {
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
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
}

export const towerService = {
  /**
   * Get all towers with optional filtering
   */
  async getTowers(filters?: TowerFilters): Promise<TowerResponse> {
    const params = new URLSearchParams();
    
    if (filters?.region) params.append('region', filters.region);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/api/v1/towers?${params.toString()}`;
    const cacheKey = getCacheKey('/api/v1/towers', filters);
    
    const cached = getCached<TowerResponse>(cacheKey);
    if (cached) return cached;

    const data = await fetchWithErrorHandling<TowerResponse>(url);
    setCache(cacheKey, data);
    
    return data;
  },

  /**
   * Get a specific tower by ID
   */
  async getTower(towerId: string): Promise<Tower> {
    const cacheKey = getCacheKey(`/api/v1/towers/${towerId}`);
    
    const cached = getCached<Tower>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/towers/${towerId}`;
    const data = await fetchWithErrorHandling<Tower>(url);
    setCache(cacheKey, data);
    
    return data;
  },

  /**
   * Get aggregated statistics
   */
  async getStats(): Promise<TowerStats> {
    const cacheKey = getCacheKey('/api/v1/towers/stats/summary');
    
    const cached = getCached<TowerStats>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/towers/stats/summary`;
    const data = await fetchWithErrorHandling<TowerStats>(url);
    setCache(cacheKey, data);
    
    return data;
  },

  /**
   * Get statistics grouped by region
   */
  async getStatsByRegion(): Promise<Array<{
    region: string;
    tower_count: number;
    average_height?: number;
    average_signal_strength?: number;
    average_uptime?: number;
  }>> {
    const cacheKey = getCacheKey('/api/v1/towers/stats/by-region');
    
    const cached = getCached<Array<any>>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/towers/stats/by-region`;
    const data = await fetchWithErrorHandling<Array<any>>(url);
    setCache(cacheKey, data);
    
    return data;
  },

  /**
   * Get statistics grouped by state
   */
  async getStatsByState(): Promise<Array<{
    state_code: string;
    state_name?: string;
    tower_count: number;
    average_height?: number;
    average_signal_strength?: number;
    average_uptime?: number;
  }>> {
    const cacheKey = getCacheKey('/api/v1/towers/stats/by-state');
    
    const cached = getCached<Array<any>>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/towers/stats/by-state`;
    const data = await fetchWithErrorHandling<Array<any>>(url);
    setCache(cacheKey, data);
    
    return data;
  },

  /**
   * Clear cache (useful for manual refresh)
   */
  clearCache(): void {
    cache.clear();
  },
};

