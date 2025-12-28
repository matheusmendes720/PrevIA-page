/**
 * Simplified Temporal Types
 * Focus on seasonal patterns only - no complex analytics
 */

export interface TemporalEvent {
  id: string;
  date: string;
  label: string;
  impactScore: number; // -1 to +1
  demandDelta: number; // percentage
  narrative: string;
  recommendedActions: string[];
  duration?: {
    start: string;
    end: string;
    durationDays: number;
  };
}

export type SeasonalityMatrix = number[][]; // 12 months × 7 weekdays normalized 0-1

export interface CyclicalSample {
  label: string;
  value: number;
  sin: number;
  cos: number;
}

export interface ForecastSlice {
  date: string;
  actual: number;
  predicted: number;
  eventId?: string;
}

export interface TemporalFeaturePayload {
  events: TemporalEvent[];
  seasonalityMatrix: SeasonalityMatrix;
  cyclicalSamples: CyclicalSample[];
  forecastSlices: ForecastSlice[];
  summary: {
    nextEvent: TemporalEvent;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

// Legacy-friendly type for shared components (timeline/playbook/hero)
export interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'season' | 'custom' | 'maintenance';
  impactScore: number;
  demandImpact: number;
  leadTimeImpact: number;
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
    consistency: number;
  };
}
