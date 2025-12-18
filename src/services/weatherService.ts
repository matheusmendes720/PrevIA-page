/**
 * Weather Service
 * Real-time weather API integration (INMET) and historical climate data
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const OPENWEATHER_API_KEY = '941ae7a1a0e249c20b4926388c6758d8';
const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  timestamp: string;
  station?: string;
  condition?: string;
  icon?: string;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  feelsLike?: number;
}

export interface WeatherForecast {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  clouds: number;
  visibility?: number;
  uvi?: number;
}

export interface ClimateRisk {
  corrosion_risk: 'low' | 'medium' | 'high';
  field_work_disruption: 'low' | 'medium' | 'high';
  extreme_heat: boolean;
  heavy_rain: boolean;
}

export interface HistoricalClimateData {
  date: string;
  temperature_avg: number;
  precipitation_mm: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  corrosion_risk?: number;
  field_work_disruption?: number;
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
  if (age > WEATHER_CACHE_TTL) {
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
    console.error(`Weather API Error [${url}]:`, error);
    throw error;
  }
}

export const weatherService = {
  /**
   * Get real-time weather for a specific location using OpenWeatherMap API
   */
  async getRealtimeWeather(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = getCacheKey('/weather/realtime', { lat, lng });
    const cached = getCached<WeatherData>(cacheKey);
    if (cached) return cached;

    try {
      // Use OpenWeatherMap Current Weather API
      const url = `${OPENWEATHER_API_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      
      const weather: WeatherData = {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        precipitation: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        visibility: data.visibility ? data.visibility / 1000 : undefined, // Convert to km
        condition: data.weather[0]?.main,
        icon: data.weather[0]?.icon,
        timestamp: new Date(data.dt * 1000).toISOString(),
      };
      
      setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('OpenWeatherMap API error, trying fallback:', error);
      
      // Fallback to climate features API
      try {
        const url = `${API_BASE_URL}/api/v1/features/climate/salvador`;
        const data = await fetchWithErrorHandling<any>(url);
        
        const weather: WeatherData = {
          temperature: data.temperature_avg_c || 25,
          precipitation: data.precipitation_mm || 0,
          humidity: data.humidity_percent || 60,
          windSpeed: data.wind_speed_kmh || 10,
          timestamp: data.data_coleta || new Date().toISOString(),
        };
        
        setCache(cacheKey, weather);
        return weather;
      } catch (fallbackError) {
        console.error('All weather APIs failed:', fallbackError);
        throw error;
      }
    }
  },

  /**
   * Get hourly forecast for next 48 hours using OpenWeatherMap
   */
  async getHourlyForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
    const cacheKey = getCacheKey('/weather/hourly-forecast', { lat, lng });
    const cached = getCached<WeatherForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      // Use OpenWeatherMap One Call API 3.0 (or 2.5 if 3.0 not available)
      const url = `${OPENWEATHER_API_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br&cnt=48`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      const forecasts: WeatherForecast[] = data.list || [];
      
      setCache(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      return [];
    }
  },

  /**
   * Get daily forecast for next 8 days using OpenWeatherMap
   */
  async getDailyForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
    const cacheKey = getCacheKey('/weather/daily-forecast', { lat, lng });
    const cached = getCached<WeatherForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      // Use OpenWeatherMap One Call API 3.0
      // Note: This requires One Call API subscription. For free tier, use forecast endpoint
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br&exclude=current,minutely,hourly,alerts`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return data.daily || [];
      } else {
        // Fallback to 5-day forecast
        const forecastUrl = `${OPENWEATHER_API_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
        const forecastResponse = await fetch(forecastUrl);
        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json();
          // Group by day
          const dailyData: { [key: string]: WeatherForecast } = {};
          forecastData.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyData[date]) {
              dailyData[date] = item;
            }
          });
          return Object.values(dailyData);
        }
      }
    } catch (error) {
      console.error('Error fetching daily forecast:', error);
    }
    
    return [];
  },

  /**
   * Get historical climate data
   */
  async getHistoricalClimate(
    startDate: string,
    endDate: string
  ): Promise<HistoricalClimateData[]> {
    const cacheKey = getCacheKey('/climate/historical', { startDate, endDate });
    const cached = getCached<HistoricalClimateData[]>(cacheKey);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/v1/features/climate?start_date=${startDate}&end_date=${endDate}`;
    const data = await fetchWithErrorHandling<any[]>(url);
    
    const climateData: HistoricalClimateData[] = data.map((item: any) => ({
      date: item.data_coleta || item.date,
      temperature_avg: item.temperature_avg_c || item.temperature_avg || 25,
      precipitation_mm: item.precipitation_mm || 0,
      humidity_percent: item.humidity_percent || 60,
      wind_speed_kmh: item.wind_speed_kmh || 10,
      corrosion_risk: item.corrosion_risk,
      field_work_disruption: item.field_work_disruption,
    }));
    
    setCache(cacheKey, climateData);
    return climateData;
  },

  /**
   * Get climate risks for a location
   */
  async getClimateRisks(lat: number, lng: number): Promise<ClimateRisk> {
    const cacheKey = getCacheKey('/climate/risks', { lat, lng });
    const cached = getCached<ClimateRisk>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_BASE_URL}/api/v1/features/climate/risks?lat=${lat}&lng=${lng}`;
      const data = await fetchWithErrorHandling<any>(url);
      
      const risks: ClimateRisk = {
        corrosion_risk: data.corrosion_risk || 'low',
        field_work_disruption: data.field_work_disruption || 'low',
        extreme_heat: data.extreme_heat || false,
        heavy_rain: data.heavy_rain || false,
      };
      
      setCache(cacheKey, risks);
      return risks;
    } catch (error) {
      // Return default if API unavailable
      return {
        corrosion_risk: 'low',
        field_work_disruption: 'low',
        extreme_heat: false,
        heavy_rain: false,
      };
    }
  },

  /**
   * Clear cache
   */
  clearCache(): void {
    cache.clear();
  },
};

