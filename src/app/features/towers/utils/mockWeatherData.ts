/**
 * Mock Weather Data Generator
 * Uses patterns from weather_mock folder
 * Generates realistic weather data for tower locations
 */

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
  // Existing alerts
  corrosion_risk: 'low' | 'medium' | 'high';
  field_work_disruption: 'low' | 'medium' | 'high';
  extreme_heat: boolean;
  heavy_rain: boolean;
  // New alert types
  thunderstorm_risk: 'low' | 'medium' | 'high';
  wind_gust_risk: 'low' | 'medium' | 'high';
  hail_risk: 'low' | 'medium' | 'high';
  lightning_strikes: number;
  wind_gust_speed: number;
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

// Weather conditions
const WEATHER_CONDITIONS = [
  { main: 'Clear', description: 'céu limpo', icon: '01d' },
  { main: 'Clouds', description: 'nublado', icon: '02d' },
  { main: 'Rain', description: 'chuva', icon: '10d' },
  { main: 'Drizzle', description: 'garoa', icon: '09d' },
  { main: 'Thunderstorm', description: 'trovoada', icon: '11d' },
  { main: 'Mist', description: 'névoa', icon: '50d' },
];

// Generate realistic temperature based on latitude and time
function generateTemperature(lat: number, hour: number = new Date().getHours()): number {
  // Base temperature varies by latitude (colder in south, warmer in north)
  const baseTemp = 30 - (Math.abs(lat) * 0.3);
  
  // Daily variation (cooler at night, warmer during day)
  const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
  
  // Random variation
  const randomVariation = (Math.random() - 0.5) * 5;
  
  return Math.round((baseTemp + dailyVariation + randomVariation) * 10) / 10;
}

// Generate realistic humidity
function generateHumidity(lat: number, precipitation: number): number {
  // Higher humidity in north (Amazon region)
  const baseHumidity = lat > -10 ? 75 : 60;
  const precipitationFactor = Math.min(precipitation * 2, 20);
  return Math.round(Math.min(100, baseHumidity + precipitationFactor + (Math.random() - 0.5) * 10));
}

// Generate realistic precipitation
function generatePrecipitation(lat: number, month: number = new Date().getMonth()): number {
  // Rainy season in Brazil: Dec-Mar (summer) in most regions
  const isRainySeason = month >= 11 || month <= 2;
  const baseRain = isRainySeason ? 5 : 1;
  
  // Higher precipitation in Amazon region
  const amazonFactor = lat > -10 ? 3 : 1;
  
  // Random chance of rain
  const rainChance = Math.random();
  if (rainChance > 0.7) {
    return Math.round((baseRain * amazonFactor * Math.random()) * 10) / 10;
  }
  return 0;
}

// Generate wind speed
function generateWindSpeed(): number {
  // Typical wind speeds in Brazil: 5-25 km/h
  return Math.round((5 + Math.random() * 20) * 10) / 10;
}

// Get weather condition based on precipitation and clouds
function getWeatherCondition(precipitation: number, clouds: number) {
  if (precipitation > 5) return WEATHER_CONDITIONS[2]; // Rain
  if (precipitation > 0.5) return WEATHER_CONDITIONS[3]; // Drizzle
  if (clouds > 70) return WEATHER_CONDITIONS[1]; // Clouds
  if (clouds > 30) return WEATHER_CONDITIONS[1]; // Clouds
  return WEATHER_CONDITIONS[0]; // Clear
}

/**
 * Get real-time weather for a location
 */
export function getMockRealtimeWeather(lat: number, lng: number): WeatherData {
  const now = new Date();
  const hour = now.getHours();
  const temperature = generateTemperature(lat, hour);
  const precipitation = generatePrecipitation(lat, now.getMonth());
  const humidity = generateHumidity(lat, precipitation);
  const windSpeed = generateWindSpeed();
  const windDirection = Math.floor(Math.random() * 360);
  const clouds = Math.floor(Math.random() * 100);
  const condition = getWeatherCondition(precipitation, clouds);
  const pressure = Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10;
  const visibility = Math.round((10 - precipitation * 0.5) * 10) / 10;
  const uvIndex = Math.max(0, Math.min(11, Math.floor((12 - hour) * 0.5 + Math.random() * 3)));

  return {
    temperature,
    feelsLike: temperature - (windSpeed * 0.1),
    precipitation,
    humidity,
    windSpeed,
    windDirection,
    pressure,
    visibility: Math.max(0, visibility),
    uvIndex,
    condition: condition.main,
    icon: condition.icon,
    timestamp: now.toISOString(),
    station: `STATION-${Math.floor(lat * 100)}-${Math.floor(lng * 100)}`,
  };
}

/**
 * Get hourly forecast for next 48 hours
 */
export function getMockHourlyForecast(lat: number, lng: number): WeatherForecast[] {
  const forecasts: WeatherForecast[] = [];
  const now = new Date();
  const month = now.getMonth();

  for (let i = 0; i < 48; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = forecastTime.getHours();
    const temperature = generateTemperature(lat, hour);
    const precipitation = generatePrecipitation(lat, month);
    const humidity = generateHumidity(lat, precipitation);
    const windSpeed = generateWindSpeed();
    const windDirection = Math.floor(Math.random() * 360);
    const clouds = Math.floor(Math.random() * 100);
    const condition = getWeatherCondition(precipitation, clouds);
    const pressure = Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10;

    forecasts.push({
      dt: Math.floor(forecastTime.getTime() / 1000),
      temp: temperature,
      feels_like: temperature - (windSpeed * 0.1),
      humidity,
      pressure,
      wind_speed: windSpeed / 3.6, // Convert km/h to m/s
      wind_deg: windDirection,
      weather: [{
        main: condition.main,
        description: condition.description,
        icon: condition.icon,
      }],
      rain: precipitation > 0 ? { '1h': precipitation } : undefined,
      clouds,
      visibility: Math.max(0, 10 - precipitation * 0.5) * 1000, // Convert to meters
      uvi: Math.max(0, Math.min(11, Math.floor((12 - hour) * 0.5 + Math.random() * 3))),
    });
  }

  return forecasts;
}

/**
 * Get daily forecast for next 8 days
 */
export function getMockDailyForecast(lat: number, lng: number): WeatherForecast[] {
  const forecasts: WeatherForecast[] = [];
  const now = new Date();
  const month = now.getMonth();

  for (let i = 0; i < 8; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(now.getDate() + i);
    forecastDate.setHours(12, 0, 0, 0); // Noon

    const temperature = generateTemperature(lat, 12);
    const precipitation = generatePrecipitation(lat, month);
    const humidity = generateHumidity(lat, precipitation);
    const windSpeed = generateWindSpeed();
    const windDirection = Math.floor(Math.random() * 360);
    const clouds = Math.floor(Math.random() * 100);
    const condition = getWeatherCondition(precipitation, clouds);
    const pressure = Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10;

    forecasts.push({
      dt: Math.floor(forecastDate.getTime() / 1000),
      temp: temperature,
      feels_like: temperature - (windSpeed * 0.1),
      humidity,
      pressure,
      wind_speed: windSpeed / 3.6,
      wind_deg: windDirection,
      weather: [{
        main: condition.main,
        description: condition.description,
        icon: condition.icon,
      }],
      rain: precipitation > 0 ? { '3h': precipitation * 3 } : undefined,
      clouds,
      visibility: Math.max(0, 10 - precipitation * 0.5) * 1000,
      uvi: Math.max(0, Math.min(11, Math.floor(6 + Math.random() * 3))),
    });
  }

  return forecasts;
}

/**
 * Get climate risks for a location
 */
export function getMockClimateRisks(lat: number, lng: number): ClimateRisk {
  const temperature = generateTemperature(lat);
  const precipitation = generatePrecipitation(lat);
  const humidity = generateHumidity(lat, precipitation);
  const windSpeed = generateWindSpeed();

  // Corrosion risk: higher with humidity and precipitation
  let corrosionRisk: 'low' | 'medium' | 'high' = 'low';
  if (humidity > 80 || precipitation > 5) {
    corrosionRisk = 'high';
  } else if (humidity > 70 || precipitation > 2) {
    corrosionRisk = 'medium';
  }

  // Field work disruption: higher with heavy rain
  let fieldWorkDisruption: 'low' | 'medium' | 'high' = 'low';
  if (precipitation > 10) {
    fieldWorkDisruption = 'high';
  } else if (precipitation > 5) {
    fieldWorkDisruption = 'medium';
  }

  // Thunderstorm risk: based on humidity, temperature, and precipitation
  let thunderstormRisk: 'low' | 'medium' | 'high' = 'low';
  const stormFactor = (humidity / 100) * (temperature / 40) * (precipitation > 0 ? 1.5 : 1);
  if (stormFactor > 0.6 && precipitation > 5 && humidity > 75) {
    thunderstormRisk = 'high';
  } else if (stormFactor > 0.4 && precipitation > 2 && humidity > 70) {
    thunderstormRisk = 'medium';
  }

  // Wind gust risk: based on wind speed and variations
  let windGustRisk: 'low' | 'medium' | 'high' = 'low';
  const gustVariation = Math.random() * 15; // Random gust variation
  const windGustSpeed = windSpeed + gustVariation;
  if (windGustSpeed > 60) {
    windGustRisk = 'high';
  } else if (windGustSpeed > 40) {
    windGustRisk = 'medium';
  }

  // Hail risk: based on temperature, precipitation intensity, and storm conditions
  let hailRisk: 'low' | 'medium' | 'high' = 'low';
  // Hail typically occurs with thunderstorms when temperature is moderate (not too hot, not too cold)
  const hailConditions = thunderstormRisk !== 'low' && temperature > 10 && temperature < 30 && precipitation > 8;
  if (hailConditions && Math.random() > 0.85) {
    hailRisk = 'high';
  } else if (hailConditions && Math.random() > 0.7) {
    hailRisk = 'medium';
  }

  // Lightning strikes: simulate based on thunderstorm risk
  let lightningStrikes = 0;
  if (thunderstormRisk === 'high') {
    lightningStrikes = Math.floor(Math.random() * 15) + 5; // 5-20 strikes
  } else if (thunderstormRisk === 'medium') {
    lightningStrikes = Math.floor(Math.random() * 8) + 1; // 1-8 strikes
  } else if (thunderstormRisk === 'low' && Math.random() > 0.9) {
    lightningStrikes = Math.floor(Math.random() * 3); // 0-2 strikes (rare)
  }

  return {
    corrosion_risk: corrosionRisk,
    field_work_disruption: fieldWorkDisruption,
    extreme_heat: temperature > 35,
    heavy_rain: precipitation > 10,
    thunderstorm_risk: thunderstormRisk,
    wind_gust_risk: windGustRisk,
    hail_risk: hailRisk,
    lightning_strikes: lightningStrikes,
    wind_gust_speed: Math.round(windGustSpeed * 10) / 10,
  };
}

/**
 * Get historical climate data
 */
export function getMockHistoricalClimate(
  startDate: string,
  endDate: string
): HistoricalClimateData[] {
  const data: HistoricalClimateData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  // Use a fixed lat for consistency (Salvador region)
  const lat = -12.9111;

  while (current <= end) {
    const month = current.getMonth();
    const temperature = generateTemperature(lat, 12);
    const precipitation = generatePrecipitation(lat, month);
    const humidity = generateHumidity(lat, precipitation);
    const windSpeed = generateWindSpeed();

    // Calculate risks
    const corrosionRisk = humidity > 80 || precipitation > 5 ? 80 : humidity > 70 ? 50 : 20;
    const fieldWorkDisruption = precipitation > 10 ? 90 : precipitation > 5 ? 60 : 20;

    data.push({
      date: current.toISOString().split('T')[0],
      temperature_avg: Math.round(temperature * 10) / 10,
      precipitation_mm: Math.round(precipitation * 10) / 10,
      humidity_percent: Math.round(humidity),
      wind_speed_kmh: Math.round(windSpeed * 10) / 10,
      corrosion_risk: corrosionRisk,
      field_work_disruption: fieldWorkDisruption,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

/**
 * Generate independent climate monitoring points
 * Creates points distributed across Brazil for climate monitoring
 */
export interface ClimateMonitoringPoint {
  lat: number;
  lng: number;
  id: string;
}

/**
 * Generate spatially distributed climate monitoring points
 * Uses grid-based distribution with minimum distance constraints
 */
export function generateClimateMonitoringPoints(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  count: number = 250,
  minDistance: number = 0.3 // Minimum distance in degrees (~33km) - reduced for more natural clustering
): ClimateMonitoringPoint[] {
  const points: ClimateMonitoringPoint[] = [];
  
  // Organic distribution: Use Poisson disk-like sampling with natural clustering
  // Create weather system clusters (like real meteorological patterns)
  const numWeatherSystems = 4 + Math.floor(Math.random() * 4); // 4-7 weather systems
  const weatherSystems: Array<{ 
    centerLat: number; 
    centerLng: number; 
    intensity: number; 
    radius: number;
    pointCount: number;
  }> = [];
  
  // Generate weather system centers with varying intensities
  for (let i = 0; i < numWeatherSystems; i++) {
    weatherSystems.push({
      centerLat: bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat),
      centerLng: bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng),
      intensity: 0.4 + Math.random() * 0.6, // 0.4-1.0 intensity
      radius: 2 + Math.random() * 3, // 2-5 degree radius
      pointCount: Math.floor((count / numWeatherSystems) * (0.7 + Math.random() * 0.6)), // Varying point counts
    });
  }
  
  // Distribute remaining points randomly for sparse coverage
  const remainingPoints = count - weatherSystems.reduce((sum, sys) => sum + sys.pointCount, 0);
  
  // Generate points within weather systems (clustered)
  for (const system of weatherSystems) {
    const systemPoints = system.pointCount;
    let attempts = 0;
    const maxAttempts = systemPoints * 10;
    
    while (points.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Use polar coordinates for circular, organic distribution
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * system.radius;
      
      // Apply intensity-based probability (higher intensity = denser points)
      if (Math.random() > system.intensity) continue;
      
      const lat = system.centerLat + radius * Math.cos(angle) * 0.5; // Scale down for lat
      const lng = system.centerLng + radius * Math.sin(angle);
      
      // Check bounds
      if (lat < bounds.minLat || lat > bounds.maxLat || 
          lng < bounds.minLng || lng > bounds.maxLng) {
        continue;
      }
      
      // Check minimum distance (relaxed for natural clustering)
      let tooClose = false;
      for (const existingPoint of points) {
        const distance = Math.sqrt(
          Math.pow(lat - existingPoint.lat, 2) + Math.pow(lng - existingPoint.lng, 2)
        );
        if (distance < minDistance) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        points.push({
          lat,
          lng,
          id: `CLIMATE-${Math.floor(lat * 100)}-${Math.floor(lng * 100)}-${points.length}`,
        });
      }
    }
  }
  
  // Add sparse random points for background coverage (like scattered weather)
  let sparseAttempts = 0;
  const maxSparseAttempts = remainingPoints * 15;
  
  while (points.length < count && sparseAttempts < maxSparseAttempts) {
    sparseAttempts++;
    
    // Completely random position
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    
    // Check minimum distance (more relaxed for sparse points)
    let tooClose = false;
    for (const existingPoint of points) {
      const distance = Math.sqrt(
        Math.pow(lat - existingPoint.lat, 2) + Math.pow(lng - existingPoint.lng, 2)
      );
      if (distance < minDistance * 0.7) { // More relaxed for sparse coverage
        tooClose = true;
        break;
      }
    }
    
    if (!tooClose) {
      points.push({
        lat,
        lng,
        id: `CLIMATE-${Math.floor(lat * 100)}-${Math.floor(lng * 100)}-${points.length}`,
      });
    }
  }

  return points.slice(0, count);
}

/**
 * Generate biome-specific weather data
 */
export function generateBiomeWeatherData(
  biomeId: string,
  lat: number,
  lng: number
): WeatherData {
  // Biome-specific base values
  const biomeParams: Record<string, { temp: number; rain: number; humidity: number; wind: number }> = {
    amazon: { temp: 27, rain: 2300 / 365, humidity: 85, wind: 5 },
    cerrado: { temp: 24, rain: 1500 / 365, humidity: 70, wind: 8 },
    atlanticForest: { temp: 21, rain: 2000 / 365, humidity: 80, wind: 10 },
    caatinga: { temp: 28, rain: 800 / 365, humidity: 60, wind: 12 },
    pampas: { temp: 17, rain: 1400 / 365, humidity: 75, wind: 15 },
    pantanal: { temp: 25, rain: 1250 / 365, humidity: 78, wind: 7 }
  };
  
  const params = biomeParams[biomeId] || biomeParams.cerrado;
  
  return {
    temperature: params.temp + (Math.random() - 0.5) * 6,
    precipitation: params.rain * (0.5 + Math.random()),
    humidity: params.humidity + (Math.random() - 0.5) * 10,
    windSpeed: params.wind + (Math.random() - 0.5) * 5,
    windDirection: Math.random() * 360,
    timestamp: new Date().toISOString(),
    station: `BIOME-${biomeId}`,
    condition: params.rain > 5 ? 'Rain' : 'Clear',
    icon: params.rain > 5 ? '10d' : '01d',
    pressure: 1013 + (Math.random() - 0.5) * 20,
    visibility: 10 - params.rain * 0.5,
    uvIndex: Math.floor(Math.random() * 11),
    feelsLike: params.temp - 1
  };
}

/**
 * Generate grid cell weather data with interpolation
 */
export function generateGridCellWeather(
  centerLat: number,
  centerLng: number,
  surroundingStations: WeatherData[]
): WeatherData {
  if (surroundingStations.length === 0) {
    return getMockRealtimeWeather(centerLat, centerLng);
  }
  
  // Use IDW interpolation
  let totalWeight = 0;
  let weightedTemp = 0;
  let weightedPrecip = 0;
  let weightedHumidity = 0;
  let weightedWind = 0;
  
  for (const station of surroundingStations.slice(0, 10)) { // Max 10 nearest
    const distance = Math.sqrt(
      Math.pow(centerLat - (station as any).lat, 2) + 
      Math.pow(centerLng - (station as any).lng, 2)
    ) || 0.01;
    
    const weight = 1 / Math.pow(distance, 2);
    totalWeight += weight;
    weightedTemp += station.temperature * weight;
    weightedPrecip += station.precipitation * weight;
    weightedHumidity += station.humidity * weight;
    weightedWind += station.windSpeed * weight;
  }
  
  return {
    temperature: weightedTemp / totalWeight,
    precipitation: weightedPrecip / totalWeight,
    humidity: weightedHumidity / totalWeight,
    windSpeed: weightedWind / totalWeight,
    windDirection: surroundingStations[0]?.windDirection || 180,
    timestamp: new Date().toISOString(),
    station: `GRID-${Math.floor(centerLat * 100)}-${Math.floor(centerLng * 100)}`,
    condition: weightedPrecip / totalWeight > 5 ? 'Rain' : 'Clear',
    icon: weightedPrecip / totalWeight > 5 ? '10d' : '01d',
    pressure: 1013,
    visibility: 10,
    uvIndex: 5
  };
}

/**
 * Generate city weather with urban heat island effect
 */
export function generateCityWeather(
  lat: number,
  lng: number,
  population: number
): WeatherData {
  const baseWeather = getMockRealtimeWeather(lat, lng);
  
  // Urban heat island effect (larger cities = more heat)
  const heatIslandEffect = Math.min(5, (population / 1000000) * 2);
  
  return {
    ...baseWeather,
    temperature: baseWeather.temperature + heatIslandEffect,
    feelsLike: (baseWeather.feelsLike || baseWeather.temperature) + heatIslandEffect + 1,
    humidity: Math.max(50, baseWeather.humidity - 5), // Cities tend to be drier
    station: `CITY-${Math.floor(lat * 100)}-${Math.floor(lng * 100)}`
  };
}

