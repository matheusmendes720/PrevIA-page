/**
 * Temporal Calculations Utility
 * Core statistical functions for time series analysis
 */

// ==================== Basic Statistics ====================

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = mean(squaredDiffs);
  return Math.sqrt(variance);
}

export function variance(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  return mean(squaredDiffs);
}

export function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function skewness(values: number[]): number {
  const avg = mean(values);
  const std = standardDeviation(values);
  const n = values.length;
  const cubed = values.map(val => Math.pow((val - avg) / std, 3));
  return (n / ((n - 1) * (n - 2))) * cubed.reduce((sum, val) => sum + val, 0);
}

export function kurtosis(values: number[]): number {
  const avg = mean(values);
  const std = standardDeviation(values);
  const n = values.length;
  const fourth = values.map(val => Math.pow((val - avg) / std, 4));
  return (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) *
    fourth.reduce((sum, val) => sum + val, 0) -
    (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

// ==================== Moving Averages ====================

export function simpleMovingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN); // Not enough data yet
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(mean(windowValues));
    }
  }
  return result;
}

export function exponentialMovingAverage(values: number[], window: number): number[] {
  const alpha = 2 / (window + 1);
  const result: number[] = [];
  let ema = values[0];
  
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      result.push(ema);
    } else {
      ema = alpha * values[i] + (1 - alpha) * ema;
      result.push(ema);
    }
  }
  return result;
}

export function weightedMovingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  const weights = Array.from({ length: window }, (_, i) => i + 1);
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      const weightedSum = windowValues.reduce((sum, val, idx) => 
        sum + val * weights[idx], 0);
      result.push(weightedSum / weightSum);
    }
  }
  return result;
}

// ==================== Rolling Statistics ====================

export function rollingStd(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(standardDeviation(windowValues));
    }
  }
  return result;
}

export function rollingMin(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(Math.min(...windowValues));
    }
  }
  return result;
}

export function rollingMax(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(Math.max(...windowValues));
    }
  }
  return result;
}

export function rollingMedian(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(median(windowValues));
    }
  }
  return result;
}

// ==================== Autocorrelation ====================

export function autocovariance(values: number[], lag: number): number {
  const avg = mean(values);
  let sum = 0;
  const n = values.length;
  
  for (let i = 0; i < n - lag; i++) {
    sum += (values[i] - avg) * (values[i + lag] - avg);
  }
  
  return sum / n;
}

export function autocorrelation(values: number[], lag: number): number {
  const acv0 = autocovariance(values, 0);
  if (acv0 === 0) return 0;
  return autocovariance(values, lag) / acv0;
}

export function calculateACF(values: number[], maxLag: number): number[] {
  const acf: number[] = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    acf.push(autocorrelation(values, lag));
  }
  return acf;
}

export function calculatePACF(values: number[], maxLag: number): number[] {
  // Partial autocorrelation using Yule-Walker equations
  const pacf: number[] = [1]; // PACF at lag 0 is always 1
  
  if (maxLag === 0) return pacf;
  
  const acf = calculateACF(values, maxLag);
  
  // Direct PACF calculation for lag 1
  pacf.push(acf[1]);
  
  // For higher lags, use Durbin-Levinson algorithm
  const phi: number[][] = [[acf[1]]];
  
  for (let k = 2; k <= maxLag; k++) {
    // Calculate phi[k][k]
    let numerator = acf[k];
    let denominator = 1;
    
    for (let j = 1; j < k; j++) {
      numerator -= phi[k - 2][j - 1] * acf[k - j];
    }
    
    for (let j = 1; j < k; j++) {
      denominator -= phi[k - 2][j - 1] * acf[j];
    }
    
    const phiKK = denominator !== 0 ? numerator / denominator : 0;
    pacf.push(phiKK);
    
    // Calculate other phi values for this lag
    const phiK: number[] = [];
    for (let j = 1; j < k; j++) {
      phiK.push(phi[k - 2][j - 1] - phiKK * phi[k - 2][k - j - 1]);
    }
    phiK.push(phiKK);
    phi.push(phiK);
  }
  
  return pacf;
}

export function acfConfidenceInterval(n: number, alpha: number = 0.05): number {
  // Confidence interval for ACF: ±z * (1 / sqrt(n))
  const z = 1.96; // for 95% confidence
  return z / Math.sqrt(n);
}

// ==================== Differencing ====================

export function difference(values: number[], lag: number = 1): number[] {
  const result: number[] = [];
  for (let i = lag; i < values.length; i++) {
    result.push(values[i] - values[i - lag]);
  }
  return result;
}

export function cumulativeSum(values: number[]): number[] {
  const result: number[] = [];
  let sum = 0;
  for (const val of values) {
    sum += val;
    result.push(sum);
  }
  return result;
}

// ==================== Normalization ====================

export function zScore(values: number[]): number[] {
  const avg = mean(values);
  const std = standardDeviation(values);
  if (std === 0) return values.map(() => 0);
  return values.map(val => (val - avg) / std);
}

export function minMaxScale(values: number[], newMin: number = 0, newMax: number = 1): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => newMin);
  return values.map(val => newMin + ((val - min) / range) * (newMax - newMin));
}

// ==================== Stationarity Tests ====================

export function augmentedDickeyFuller(values: number[]): {
  statistic: number;
  pValue: number;
  isStationary: boolean;
  interpretation: string;
} {
  // Simplified ADF test implementation
  const n = values.length;
  const diff = difference(values);
  const laggedValues = values.slice(0, -1);
  
  // Calculate test statistic (simplified)
  const y = diff.map((d, i) => d / laggedValues[i]).filter(x => isFinite(x));
  const avg = mean(y);
  const std = standardDeviation(y);
  const statistic = avg / (std / Math.sqrt(n));
  
  // Critical values (simplified, 5% significance level)
  const criticalValue = -2.86;
  const isStationary = statistic < criticalValue;
  
  // Approximate p-value
  const pValue = isStationary ? 0.01 : 0.5;
  
  const interpretation = isStationary
    ? 'Series is stationary (reject null hypothesis of unit root)'
    : 'Series is non-stationary (fail to reject null hypothesis of unit root)';
  
  return { statistic, pValue, isStationary, interpretation };
}

// ==================== Ljung-Box Test ====================

export function ljungBoxTest(values: number[], lags: number): {
  statistic: number;
  pValue: number;
  df: number;
  significant: boolean;
  interpretation: string;
} {
  const n = values.length;
  const acf = calculateACF(values, lags);
  
  // Calculate Ljung-Box Q-statistic
  let Q = 0;
  for (let k = 1; k <= lags; k++) {
    Q += Math.pow(acf[k], 2) / (n - k);
  }
  Q *= n * (n + 2);
  
  // Chi-square approximation for p-value (simplified)
  const df = lags;
  const significant = Q > 12.59; // chi-square critical value at 5% for df=6
  
  // Approximate p-value
  const pValue = significant ? 0.01 : 0.5;
  
  const interpretation = significant
    ? 'Significant autocorrelation detected in residuals'
    : 'No significant autocorrelation detected';
  
  return { statistic: Q, pValue, df, significant, interpretation };
}

// ==================== Correlation ====================

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Arrays must have same length');
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

export function crossCorrelation(x: number[], y: number[], maxLag: number): number[] {
  const result: number[] = [];
  
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let xShifted = x;
    let yShifted = y;
    
    if (lag > 0) {
      xShifted = x.slice(lag);
      yShifted = y.slice(0, -lag);
    } else if (lag < 0) {
      xShifted = x.slice(0, lag);
      yShifted = y.slice(-lag);
    }
    
    result.push(pearsonCorrelation(xShifted, yShifted));
  }
  
  return result;
}

// ==================== Seasonal Decomposition Helpers ====================

export function extractTrend(values: number[], window: number): number[] {
  // Use centered moving average for trend
  return simpleMovingAverage(values, window);
}

export function removeTrend(values: number[], trend: number[]): number[] {
  return values.map((val, i) => isNaN(trend[i]) ? NaN : val - trend[i]);
}

export function extractSeasonality(detrended: number[], period: number): number[] {
  const n = detrended.length;
  const seasonal: number[] = new Array(n).fill(0);
  
  // Calculate average for each position in the cycle
  const cycleMeans: number[] = new Array(period).fill(0);
  const cycleCounts: number[] = new Array(period).fill(0);
  
  detrended.forEach((val, i) => {
    if (!isNaN(val)) {
      const pos = i % period;
      cycleMeans[pos] += val;
      cycleCounts[pos]++;
    }
  });
  
  // Normalize cycle means
  const normalizedCycle = cycleMeans.map((sum, i) => 
    cycleCounts[i] > 0 ? sum / cycleCounts[i] : 0
  );
  
  // Ensure seasonal component sums to zero
  const cycleMean = mean(normalizedCycle);
  const centeredCycle = normalizedCycle.map(val => val - cycleMean);
  
  // Apply seasonal component to all time points
  for (let i = 0; i < n; i++) {
    seasonal[i] = centeredCycle[i % period];
  }
  
  return seasonal;
}

// ==================== Utility Functions ====================

export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

export function removeNaN(values: number[]): number[] {
  return values.filter(v => isValidNumber(v));
}

export function fillNaN(values: number[], method: 'forward' | 'backward' | 'mean' = 'forward'): number[] {
  const result = [...values];
  
  if (method === 'mean') {
    const validValues = removeNaN(values);
    const avg = mean(validValues);
    return result.map(v => isValidNumber(v) ? v : avg);
  }
  
  if (method === 'forward') {
    let lastValid = 0;
    for (let i = 0; i < result.length; i++) {
      if (isValidNumber(result[i])) {
        lastValid = result[i];
      } else {
        result[i] = lastValid;
      }
    }
  } else {
    let lastValid = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      if (isValidNumber(result[i])) {
        lastValid = result[i];
      } else {
        result[i] = lastValid;
      }
    }
  }
  
  return result;
}

export function interpolateLinear(values: number[]): number[] {
  const result = [...values];
  
  for (let i = 0; i < result.length; i++) {
    if (!isValidNumber(result[i])) {
      // Find previous and next valid values
      let prevIdx = i - 1;
      let nextIdx = i + 1;
      
      while (prevIdx >= 0 && !isValidNumber(result[prevIdx])) prevIdx--;
      while (nextIdx < result.length && !isValidNumber(result[nextIdx])) nextIdx++;
      
      if (prevIdx >= 0 && nextIdx < result.length) {
        const prevVal = result[prevIdx];
        const nextVal = result[nextIdx];
        const weight = (i - prevIdx) / (nextIdx - prevIdx);
        result[i] = prevVal + weight * (nextVal - prevVal);
      } else if (prevIdx >= 0) {
        result[i] = result[prevIdx];
      } else if (nextIdx < result.length) {
        result[i] = result[nextIdx];
      }
    }
  }
  
  return result;
}


