// Centralized mock data for temporal features
export interface TemporalPattern {
  hour: number;
  dayOfWeek: number;
  weekOfMonth: number;
  month: number;
  demand: number;
  slaCompliance: number;
}

export interface SeasonalTrend {
  period: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  value: number;
  forecast: number;
  confidence: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
}

export const generateHourlyPatterns = (): TemporalPattern[] => {
  return Array(24).fill(0).map((_, hour) => {
    const peakHours = [9, 10, 11, 14, 15, 16];
    const isPeak = peakHours.includes(hour);
    const baseDemand = isPeak ? 80 : 40;
    
    return {
      hour,
      dayOfWeek: 2, // Tuesday
      weekOfMonth: 2,
      month: 11,
      demand: baseDemand + Math.random() * 20,
      slaCompliance: 85 + Math.random() * 10
    };
  });
};

export const generateWeeklyPatterns = (): TemporalPattern[] => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return dayNames.map((_, dayOfWeek) => {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseDemand = isWeekend ? 30 : 70;
    
    return {
      hour: 12, // noon
      dayOfWeek,
      weekOfMonth: 2,
      month: 11,
      demand: baseDemand + Math.random() * 25,
      slaCompliance: isWeekend ? 92 : 87 + Math.random() * 5
    };
  });
};

export const generateMonthlyPatterns = (): TemporalPattern[] => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  return monthNames.map((_, month) => {
    const seasonalFactor = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI);
    const baseDemand = 60;
    
    return {
      hour: 12,
      dayOfWeek: 2,
      weekOfMonth: 2,
      month,
      demand: Math.round(baseDemand * seasonalFactor + Math.random() * 15),
      slaCompliance: 85 + Math.random() * 8
    };
  });
};

export const generateTimeSeries = (points: number = 90): TimeSeriesPoint[] => {
  const startDate = new Date(2025, 8, 1); // Sep 1, 2025
  const baseValue = 100;
  
  return Array(points).fill(0).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const trend = i * 0.5;
    const seasonal = 20 * Math.sin((i / 7) * 2 * Math.PI);
    const noise = (Math.random() - 0.5) * 10;
    const value = baseValue + trend + seasonal + noise;
    
    // Forecast for last 30 days
    const isForecast = i >= points - 30;
    const forecast = isForecast ? value + (Math.random() - 0.5) * 5 : undefined;
    const upperBound = isForecast ? (forecast || value) + 15 : undefined;
    const lowerBound = isForecast ? (forecast || value) - 15 : undefined;
    
    return {
      timestamp: date.toISOString().split('T')[0],
      value: Math.round(value),
      forecast: forecast ? Math.round(forecast) : undefined,
      upperBound: upperBound ? Math.round(upperBound) : undefined,
      lowerBound: lowerBound ? Math.round(lowerBound) : undefined
    };
  });
};

export const seasonalTrends: SeasonalTrend[] = [
  {
    period: 'Segunda-feira 8-10h',
    type: 'daily',
    value: 125,
    forecast: 132,
    confidence: 0.92
  },
  {
    period: 'Terça-feira 14-16h',
    type: 'daily',
    value: 118,
    forecast: 120,
    confidence: 0.89
  },
  {
    period: 'Semana 1 do mês',
    type: 'weekly',
    value: 890,
    forecast: 925,
    confidence: 0.87
  },
  {
    period: 'Semana 3 do mês',
    type: 'weekly',
    value: 1120,
    forecast: 1150,
    confidence: 0.91
  },
  {
    period: 'Janeiro',
    type: 'monthly',
    value: 3200,
    forecast: 3450,
    confidence: 0.85
  },
  {
    period: 'Julho',
    type: 'monthly',
    value: 2800,
    forecast: 2900,
    confidence: 0.88
  }
];

export interface LeadTimeMetric {
  category: string;
  avgLeadTime: number;
  minLeadTime: number;
  maxLeadTime: number;
  variation: number;
  onTimeDelivery: number;
}

export const leadTimeMetrics: LeadTimeMetric[] = [
  {
    category: 'Material Elétrico',
    avgLeadTime: 3.2,
    minLeadTime: 1.5,
    maxLeadTime: 7.0,
    variation: 1.8,
    onTimeDelivery: 92
  },
  {
    category: 'Material Civil',
    avgLeadTime: 4.5,
    minLeadTime: 2.0,
    maxLeadTime: 9.0,
    variation: 2.3,
    onTimeDelivery: 87
  },
  {
    category: 'Ferro e Aço',
    avgLeadTime: 5.8,
    minLeadTime: 3.0,
    maxLeadTime: 12.0,
    variation: 3.2,
    onTimeDelivery: 82
  },
  {
    category: 'Ferramentas',
    avgLeadTime: 2.8,
    minLeadTime: 1.0,
    maxLeadTime: 6.0,
    variation: 1.5,
    onTimeDelivery: 95
  },
  {
    category: 'EPI',
    avgLeadTime: 2.1,
    minLeadTime: 1.0,
    maxLeadTime: 4.5,
    variation: 1.0,
    onTimeDelivery: 97
  }
];

