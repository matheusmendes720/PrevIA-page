/**
 * Mock ML Features Generator
 * Generates predictive analytics, temporal features, and climate features
 */

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

// Brazilian holidays (simplified)
const BRAZILIAN_HOLIDAYS: Record<string, string> = {
  '01-01': 'Ano Novo',
  '02-15': 'Carnaval',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalhador',
  '09-07': 'Independência',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '12-25': 'Natal',
};

// Check if date is a holiday
function isHoliday(date: Date): boolean {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return monthDay in BRAZILIAN_HOLIDAYS;
}

// Check if date is during Carnival (approximate: Feb 15-20)
function isCarnaval(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return month === 2 && day >= 15 && day <= 20;
}

// Check if date is during rainy season (Dec-Mar in most of Brazil)
function isRainySeason(date: Date): boolean {
  const month = date.getMonth() + 1;
  return month >= 12 || month <= 3;
}

/**
 * Get temporal features for a date
 */
export function getMockTemporalFeatures(date: string): TemporalFeatures {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = d.getDay();
  const quarter = Math.floor((month - 1) / 3) + 1;
  
  // Day of year
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    year,
    month,
    day,
    weekday,
    quarter,
    day_of_year: dayOfYear,
    is_weekend: weekday === 0 || weekday === 6,
    is_holiday: isHoliday(d),
    is_carnaval: isCarnaval(d),
    is_rainy_season: isRainySeason(d),
  };
}

/**
 * Get climate features
 */
export function getMockClimateFeatures(date?: string): ClimateFeatures {
  const d = date ? new Date(date) : new Date();
  const month = d.getMonth();
  
  // Use Salvador coordinates for consistency
  const lat = -12.9111;
  
  // Generate realistic values
  const baseTemp = 30 - (Math.abs(lat) * 0.3);
  const temperature = baseTemp + Math.sin((month - 1) * Math.PI / 6) * 3 + (Math.random() - 0.5) * 5;
  const precipitation = isRainySeason(d) ? 5 + Math.random() * 10 : Math.random() * 3;
  const humidity = lat > -10 ? 75 + Math.random() * 15 : 60 + Math.random() * 20;
  const windSpeed = 5 + Math.random() * 20;
  
  const extremeHeat = temperature > 35;
  const heavyRain = precipitation > 10;
  const corrosionRisk = humidity > 80 || precipitation > 5 ? 80 : humidity > 70 ? 50 : 20;
  const fieldWorkDisruption = precipitation > 10 ? 90 : precipitation > 5 ? 60 : 20;

  return {
    temperature_avg_c: Math.round(temperature * 10) / 10,
    precipitation_mm: Math.round(precipitation * 10) / 10,
    humidity_percent: Math.round(humidity),
    wind_speed_kmh: Math.round(windSpeed * 10) / 10,
    extreme_heat: extremeHeat,
    heavy_rain: heavyRain,
    corrosion_risk: corrosionRisk,
    field_work_disruption: fieldWorkDisruption,
  };
}

/**
 * Get predictive analytics for a tower
 */
export function getMockPredictiveAnalytics(towerId: string): PredictiveAnalytics {
  // Generate consistent but varied scores based on tower ID
  const seed = towerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed % 1000) / 1000;

  // Maintenance risk: 0-100
  const maintenanceRiskScore = Math.floor(20 + random * 60);
  
  // Predicted next maintenance: 30-90 days from now
  const daysUntilMaintenance = 30 + Math.floor(random * 60);
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + daysUntilMaintenance);

  // Coverage impact: 0-100
  const coverageImpactScore = Math.floor(30 + random * 50);

  // Weather risk
  const weatherRiskValue = random;
  let weatherRisk: 'low' | 'medium' | 'high' = 'low';
  if (weatherRiskValue > 0.7) {
    weatherRisk = 'high';
  } else if (weatherRiskValue > 0.4) {
    weatherRisk = 'medium';
  }

  // Economic value: 0-100
  const economicValueScore = Math.floor(40 + random * 50);

  return {
    maintenance_risk_score: maintenanceRiskScore,
    predicted_next_maintenance: predictedDate.toISOString().split('T')[0],
    coverage_impact_score: coverageImpactScore,
    weather_risk: weatherRisk,
    economic_value_score: economicValueScore,
  };
}

/**
 * Get hierarchical features
 */
export function getMockHierarchicalFeatures(
  level: 'region' | 'state' | 'zone',
  value: string
): any {
  // Generate mock aggregations
  const baseCount = 100 + Math.floor(Math.random() * 500);
  const avgHeight = 40 + Math.random() * 30;
  const avgSignal = 70 + Math.random() * 20;
  const avgUptime = 90 + Math.random() * 8;

  return {
    level,
    value,
    tower_count: baseCount,
    average_height: Math.round(avgHeight * 10) / 10,
    average_signal_strength: Math.round(avgSignal * 10) / 10,
    average_uptime: Math.round(avgUptime * 10) / 10,
    total_investment: baseCount * 500000,
    coverage_percentage: 85 + Math.random() * 10,
  };
}

