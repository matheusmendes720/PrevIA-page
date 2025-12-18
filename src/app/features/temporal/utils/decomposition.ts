/**
 * Time Series Decomposition Utilities
 * STL, Classical, and Exponential Smoothing methods
 */

import {
  mean,
  simpleMovingAverage,
  extractTrend,
  removeTrend,
  extractSeasonality,
  removeNaN,
  fillNaN,
  standardDeviation
} from './temporalCalculations';
import { DecompositionResult, SeasonalIndices } from '../types/temporal.types';

// ==================== STL Decomposition ====================

export function stlDecomposition(
  values: number[],
  period: number,
  timestamps: string[]
): DecompositionResult {
  // Simplified STL (Seasonal-Trend decomposition using LOESS)
  // In production, use a proper STL library or backend implementation
  
  // 1. Extract trend using centered moving average
  const trendWindow = Math.floor(period / 2) * 2 + 1; // ensure odd
  const trend = loessSmooth(values, trendWindow);
  
  // 2. Detrend the series
  const detrended = removeTrend(values, trend);
  
  // 3. Extract seasonal component
  const seasonal = extractSeasonality(detrended, period);
  
  // 4. Calculate residuals
  const residual = values.map((val, i) => {
    if (isNaN(trend[i]) || isNaN(seasonal[i])) return NaN;
    return val - trend[i] - seasonal[i];
  });
  
  // 5. Calculate strength metrics
  const trendStrength = calculateTrendStrength(values, trend);
  const seasonalStrength = calculateSeasonalStrength(values, seasonal);
  const residualVariance = standardDeviation(removeNaN(residual));
  
  return {
    original: values,
    trend: fillNaN(trend, 'mean'),
    seasonal,
    residual: fillNaN(residual, 'mean'),
    timestamps,
    method: 'stl',
    seasonalPeriod: period,
    trendStrength,
    seasonalStrength,
    residualVariance
  };
}

function loessSmooth(values: number[], window: number): number[] {
  // Simplified LOESS smoothing using weighted moving average
  const result: number[] = [];
  const halfWindow = Math.floor(window / 2);
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(values.length, i + halfWindow + 1);
    const windowValues = values.slice(start, end);
    const weights = windowValues.map((_, idx) => {
      const distance = Math.abs(idx - (i - start));
      return Math.max(0, 1 - (distance / halfWindow));
    });
    
    let weightedSum = 0;
    let weightSum = 0;
    windowValues.forEach((val, idx) => {
      if (!isNaN(val)) {
        weightedSum += val * weights[idx];
        weightSum += weights[idx];
      }
    });
    
    result.push(weightSum > 0 ? weightedSum / weightSum : NaN);
  }
  
  return result;
}

// ==================== Classical Decomposition ====================

export function classicalDecomposition(
  values: number[],
  period: number,
  timestamps: string[],
  model: 'additive' | 'multiplicative' = 'additive'
): DecompositionResult {
  // 1. Extract trend
  const trend = simpleMovingAverage(values, period);
  
  // 2. Detrend
  let detrended: number[];
  if (model === 'additive') {
    detrended = removeTrend(values, trend);
  } else {
    detrended = values.map((val, i) => 
      isNaN(trend[i]) || trend[i] === 0 ? NaN : val / trend[i]
    );
  }
  
  // 3. Extract seasonal component
  const seasonal = extractSeasonality(detrended, period);
  
  // 4. Calculate residuals
  let residual: number[];
  if (model === 'additive') {
    residual = values.map((val, i) => {
      if (isNaN(trend[i]) || isNaN(seasonal[i])) return NaN;
      return val - trend[i] - seasonal[i];
    });
  } else {
    residual = values.map((val, i) => {
      if (isNaN(trend[i]) || isNaN(seasonal[i]) || trend[i] === 0 || seasonal[i] === 0) return NaN;
      return val / (trend[i] * seasonal[i]);
    });
  }
  
  const trendStrength = calculateTrendStrength(values, trend);
  const seasonalStrength = calculateSeasonalStrength(values, seasonal);
  const residualVariance = standardDeviation(removeNaN(residual));
  
  return {
    original: values,
    trend: fillNaN(trend, 'mean'),
    seasonal,
    residual: fillNaN(residual, 'mean'),
    timestamps,
    method: model === 'additive' ? 'classical_additive' : 'classical_multiplicative',
    seasonalPeriod: period,
    trendStrength,
    seasonalStrength,
    residualVariance
  };
}

// ==================== Exponential Smoothing ====================

export function holtWintersSmoothing(
  values: number[],
  period: number,
  alpha: number = 0.2,
  beta: number = 0.1,
  gamma: number = 0.1
): {
  level: number[];
  trend: number[];
  seasonal: number[];
  forecast: number[];
} {
  const n = values.length;
  const level: number[] = [];
  const trend: number[] = [];
  const seasonal: number[] = new Array(period).fill(0);
  const forecast: number[] = [];
  
  // Initialize level and trend
  level[0] = values[0];
  trend[0] = (values[1] - values[0]) / period;
  
  // Initialize seasonal components
  for (let i = 0; i < period; i++) {
    seasonal[i] = values[i] - level[0];
  }
  
  // Apply Holt-Winters equations
  for (let t = 0; t < n; t++) {
    if (t === 0) {
      forecast[t] = level[0] + trend[0] + seasonal[0];
      continue;
    }
    
    const seasonalIdx = t % period;
    const prevSeasonalIdx = (t - 1) % period;
    
    // Level equation
    level[t] = alpha * (values[t] - seasonal[prevSeasonalIdx]) + 
                (1 - alpha) * (level[t - 1] + trend[t - 1]);
    
    // Trend equation
    trend[t] = beta * (level[t] - level[t - 1]) + (1 - beta) * trend[t - 1];
    
    // Seasonal equation
    seasonal[seasonalIdx] = gamma * (values[t] - level[t]) + 
                             (1 - gamma) * seasonal[prevSeasonalIdx];
    
    // Forecast
    forecast[t] = level[t] + trend[t] + seasonal[seasonalIdx];
  }
  
  return { level, trend, seasonal, forecast };
}

// ==================== Strength Metrics ====================

function calculateTrendStrength(original: number[], trend: number[]): number {
  const validIndices = trend
    .map((val, i) => !isNaN(val) ? i : -1)
    .filter(i => i !== -1);
  
  if (validIndices.length === 0) return 0;
  
  const detrended = validIndices.map(i => original[i] - trend[i]);
  const varDetrended = standardDeviation(detrended) ** 2;
  const varOriginal = standardDeviation(validIndices.map(i => original[i])) ** 2;
  
  if (varOriginal === 0) return 0;
  return Math.max(0, Math.min(1, 1 - (varDetrended / varOriginal)));
}

function calculateSeasonalStrength(original: number[], seasonal: number[]): number {
  const deseasoned = original.map((val, i) => val - seasonal[i]);
  const varDeseasoned = standardDeviation(removeNaN(deseasoned)) ** 2;
  const varOriginal = standardDeviation(removeNaN(original)) ** 2;
  
  if (varOriginal === 0) return 0;
  return Math.max(0, Math.min(1, 1 - (varDeseasoned / varOriginal)));
}

// ==================== Seasonal Indices ====================

export function calculateSeasonalIndices(
  seasonal: number[],
  period: number
): SeasonalIndices {
  const indices: number[] = [];
  const cycleMeans: number[] = new Array(period).fill(0);
  const cycleCounts: number[] = new Array(period).fill(0);
  
  seasonal.forEach((val, i) => {
    if (!isNaN(val)) {
      const pos = i % period;
      cycleMeans[pos] += val;
      cycleCounts[pos]++;
    }
  });
  
  // Calculate average for each position in cycle
  for (let i = 0; i < period; i++) {
    indices.push(cycleCounts[i] > 0 ? cycleMeans[i] / cycleCounts[i] : 0);
  }
  
  const averageEffect = mean(indices.filter(v => !isNaN(v)));
  
  return {
    period,
    indices,
    averageEffect
  };
}

// ==================== Auto-detect Seasonality Period ====================

export function detectSeasonalPeriod(values: number[], maxPeriod: number = 365): number {
  // Use autocorrelation to detect dominant period
  let bestPeriod = 7; // default to weekly
  let maxCorr = 0;
  
  for (let period = 2; period <= Math.min(maxPeriod, Math.floor(values.length / 3)); period++) {
    const acf = calculateACFAtLag(values, period);
    if (Math.abs(acf) > Math.abs(maxCorr)) {
      maxCorr = acf;
      bestPeriod = period;
    }
  }
  
  return bestPeriod;
}

function calculateACFAtLag(values: number[], lag: number): number {
  const avg = mean(values);
  let sum = 0;
  let sumSq = 0;
  const n = values.length;
  
  for (let i = 0; i < n - lag; i++) {
    sum += (values[i] - avg) * (values[i + lag] - avg);
  }
  
  for (let i = 0; i < n; i++) {
    sumSq += Math.pow(values[i] - avg, 2);
  }
  
  return sumSq === 0 ? 0 : sum / sumSq;
}

// ==================== Residual Diagnostics ====================

export function analyzeResiduals(residuals: number[]): {
  mean: number;
  std: number;
  min: number;
  max: number;
  whiteness: boolean; // Are residuals white noise?
  normality: boolean; // Are residuals normally distributed?
  interpretation: string;
} {
  const clean = removeNaN(residuals);
  const residualMean = mean(clean);
  const residualStd = standardDeviation(clean);
  const residualMin = Math.min(...clean);
  const residualMax = Math.max(...clean);
  
  // Check for whiteness (no autocorrelation)
  const acf1 = calculateACFAtLag(clean, 1);
  const whiteness = Math.abs(acf1) < 0.2; // threshold
  
  // Simple normality check (skewness and kurtosis)
  const skew = Math.abs(skewness(clean));
  const kurt = Math.abs(kurtosis(clean));
  const normality = skew < 1 && kurt < 3;
  
  let interpretation = 'Residual analysis: ';
  interpretation += Math.abs(residualMean) < 0.1 ? 'Mean near zero (good). ' : 'Mean non-zero (potential bias). ';
  interpretation += whiteness ? 'No autocorrelation (good). ' : 'Autocorrelation present (model may need improvement). ';
  interpretation += normality ? 'Approximately normal distribution (good).' : 'Non-normal distribution (potential outliers or model misspecification).';
  
  return {
    mean: residualMean,
    std: residualStd,
    min: residualMin,
    max: residualMax,
    whiteness,
    normality,
    interpretation
  };
}

function skewness(values: number[]): number {
  const avg = mean(values);
  const std = standardDeviation(values);
  if (std === 0) return 0;
  
  const n = values.length;
  const cubed = values.map(val => Math.pow((val - avg) / std, 3));
  return (n / ((n - 1) * (n - 2))) * cubed.reduce((sum, val) => sum + val, 0);
}

function kurtosis(values: number[]): number {
  const avg = mean(values);
  const std = standardDeviation(values);
  if (std === 0) return 0;
  
  const n = values.length;
  const fourth = values.map(val => Math.pow((val - avg) / std, 4));
  return (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) *
    fourth.reduce((sum, val) => sum + val, 0) -
    (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

