/**
 * Change Point Detection Utilities
 * CUSUM, PELT, Bayesian, and Statistical Test methods
 */

import {
  mean,
  standardDeviation,
  cumulativeSum
} from './temporalCalculations';
import { ChangePoint, ChangePointDetectionResult } from '../types/temporal.types';

// ==================== CUSUM (Cumulative Sum) ====================

export function cusumDetection(
  values: number[],
  timestamps: string[],
  threshold: number = 5,
  drift: number = 0.5
): ChangePoint[] {
  const n = values.length;
  const avg = mean(values);
  const std = standardDeviation(values);
  
  const cusumHigh: number[] = [0];
  const cusumLow: number[] = [0];
  const changePoints: ChangePoint[] = [];
  
  for (let i = 1; i < n; i++) {
    const normalized = (values[i] - avg) / std;
    
    // Detect upward shifts
    cusumHigh[i] = Math.max(0, cusumHigh[i - 1] + normalized - drift);
    
    // Detect downward shifts
    cusumLow[i] = Math.max(0, cusumLow[i - 1] - normalized - drift);
    
    // Check for change points
    if (cusumHigh[i] > threshold || cusumLow[i] > threshold) {
      const isUpward = cusumHigh[i] > cusumLow[i];
      
      // Calculate before and after statistics
      const beforeStart = Math.max(0, i - 30);
      const beforeValues = values.slice(beforeStart, i);
      const afterValues = values.slice(i, Math.min(n, i + 30));
      
      const beforeMean = mean(beforeValues);
      const afterMean = mean(afterValues);
      const beforeStd = standardDeviation(beforeValues);
      const afterStd = standardDeviation(afterValues);
      
      const changeMagnitude = ((afterMean - beforeMean) / beforeMean) * 100;
      
      changePoints.push({
        timestamp: timestamps[i],
        index: i,
        confidence: Math.min(1, (cusumHigh[i] + cusumLow[i]) / (threshold * 2)),
        beforeMean,
        afterMean,
        beforeStd,
        afterStd,
        changeType: determineChangeType(beforeMean, afterMean, beforeStd, afterStd),
        changeMagnitude: Math.abs(changeMagnitude),
        changeDirection: isUpward ? 'increase' : 'decrease',
        duration: 'Ongoing', // Would need full analysis to determine
        impact: generateImpact(beforeMean, afterMean, changeMagnitude)
      });
      
      // Reset CUSUM
      cusumHigh[i] = 0;
      cusumLow[i] = 0;
    }
  }
  
  return changePoints;
}

// ==================== PELT (Pruned Exact Linear Time) ====================

export function peltDetection(
  values: number[],
  timestamps: string[],
  penalty: number = 10
): ChangePoint[] {
  // Simplified PELT implementation
  const n = values.length;
  const minSegmentLength = 5;
  
  // Calculate optimal segmentation using dynamic programming
  const costs: number[] = new Array(n + 1).fill(Infinity);
  const changePointIndices: number[] = new Array(n + 1).fill(-1);
  costs[0] = -penalty;
  
  for (let t = minSegmentLength; t <= n; t++) {
    for (let s = 0; s < t - minSegmentLength + 1; s++) {
      const segment = values.slice(s, t);
      const segmentCost = calculateSegmentCost(segment);
      const totalCost = costs[s] + segmentCost + penalty;
      
      if (totalCost < costs[t]) {
        costs[t] = totalCost;
        changePointIndices[t] = s;
      }
    }
  }
  
  // Backtrack to find change points
  const detectedIndices: number[] = [];
  let current = n;
  while (current > 0 && changePointIndices[current] !== -1) {
    const prev = changePointIndices[current];
    if (prev > 0) {
      detectedIndices.push(prev);
    }
    current = prev;
  }
  
  detectedIndices.reverse();
  
  // Create change point objects
  const changePoints: ChangePoint[] = detectedIndices.map(idx => {
    const beforeStart = Math.max(0, idx - 20);
    const afterEnd = Math.min(n, idx + 20);
    
    const beforeValues = values.slice(beforeStart, idx);
    const afterValues = values.slice(idx, afterEnd);
    
    const beforeMean = mean(beforeValues);
    const afterMean = mean(afterValues);
    const beforeStd = standardDeviation(beforeValues);
    const afterStd = standardDeviation(afterValues);
    
    const changeMagnitude = Math.abs((afterMean - beforeMean) / beforeMean) * 100;
    
    return {
      timestamp: timestamps[idx],
      index: idx,
      confidence: 0.85, // PELT typically has high confidence
      beforeMean,
      afterMean,
      beforeStd,
      afterStd,
      changeType: determineChangeType(beforeMean, afterMean, beforeStd, afterStd),
      changeMagnitude,
      changeDirection: afterMean > beforeMean ? 'increase' : 'decrease',
      duration: calculateDuration(idx, detectedIndices, n),
      impact: generateImpact(beforeMean, afterMean, changeMagnitude),
      statisticalTests: performStatisticalTests(beforeValues, afterValues)
    };
  });
  
  return changePoints;
}

function calculateSegmentCost(segment: number[]): number {
  // Cost = negative log-likelihood (simplified as variance)
  if (segment.length === 0) return 0;
  const variance = standardDeviation(segment) ** 2;
  return segment.length * Math.log(variance + 1); // Add 1 to avoid log(0)
}

// ==================== Bayesian Change Point Detection ====================

export function bayesianChangePointDetection(
  values: number[],
  timestamps: string[],
  hazardRate: number = 0.01
): ChangePoint[] {
  // Simplified Bayesian online change point detection
  const n = values.length;
  const changePoints: ChangePoint[] = [];
  
  let runLength = 0;
  let sumX = 0;
  let sumX2 = 0;
  let runLengthProb = 1;
  
  for (let t = 0; t < n; t++) {
    const x = values[t];
    
    runLength++;
    sumX += x;
    sumX2 += x * x;
    
    // Calculate predictive probability
    const meanT = sumX / runLength;
    const varT = Math.max(0.01, (sumX2 / runLength) - (meanT * meanT));
    
    // Simple change point detection based on surprise
    const zScore = runLength > 1 ? Math.abs((x - meanT) / Math.sqrt(varT)) : 0;
    const surprise = Math.exp(-0.5 * zScore * zScore);
    
    // Update run length probability
    runLengthProb *= (1 - hazardRate);
    
    // Detect change point if surprise is low and run length is significant
    if (surprise < 0.01 && runLength > 10) {
      const beforeStart = Math.max(0, t - runLength);
      const afterEnd = Math.min(n, t + 20);
      
      const beforeValues = values.slice(beforeStart, t);
      const afterValues = values.slice(t, afterEnd);
      
      const beforeMean = mean(beforeValues);
      const afterMean = mean(afterValues);
      const beforeStd = standardDeviation(beforeValues);
      const afterStd = standardDeviation(afterValues);
      
      const changeMagnitude = Math.abs((afterMean - beforeMean) / beforeMean) * 100;
      
      changePoints.push({
        timestamp: timestamps[t],
        index: t,
        confidence: 1 - surprise,
        beforeMean,
        afterMean,
        beforeStd,
        afterStd,
        changeType: determineChangeType(beforeMean, afterMean, beforeStd, afterStd),
        changeMagnitude,
        changeDirection: afterMean > beforeMean ? 'increase' : 'decrease',
        duration: `${runLength} periods`,
        impact: generateImpact(beforeMean, afterMean, changeMagnitude)
      });
      
      // Reset run length
      runLength = 0;
      sumX = 0;
      sumX2 = 0;
      runLengthProb = 1;
    }
  }
  
  return changePoints;
}

// ==================== Binary Segmentation ====================

export function binarySegmentation(
  values: number[],
  timestamps: string[],
  minSegmentLength: number = 10,
  threshold: number = 3
): ChangePoint[] {
  const changePoints: ChangePoint[] = [];
  
  function recursiveSegmentation(start: number, end: number) {
    if (end - start < minSegmentLength * 2) {
      return;
    }
    
    let maxStatistic = 0;
    let bestSplit = -1;
    
    // Find the best split point
    for (let split = start + minSegmentLength; split < end - minSegmentLength; split++) {
      const leftSegment = values.slice(start, split);
      const rightSegment = values.slice(split, end);
      
      const leftMean = mean(leftSegment);
      const rightMean = mean(rightSegment);
      const pooledStd = pooledStandardDeviation(leftSegment, rightSegment);
      
      if (pooledStd > 0) {
        const statistic = Math.abs((rightMean - leftMean) / pooledStd) * 
                         Math.sqrt((leftSegment.length * rightSegment.length) / (leftSegment.length + rightSegment.length));
        
        if (statistic > maxStatistic) {
          maxStatistic = statistic;
          bestSplit = split;
        }
      }
    }
    
    // If a significant split is found
    if (maxStatistic > threshold && bestSplit !== -1) {
      const beforeValues = values.slice(start, bestSplit);
      const afterValues = values.slice(bestSplit, end);
      
      const beforeMean = mean(beforeValues);
      const afterMean = mean(afterValues);
      const beforeStd = standardDeviation(beforeValues);
      const afterStd = standardDeviation(afterValues);
      
      const changeMagnitude = Math.abs((afterMean - beforeMean) / beforeMean) * 100;
      
      changePoints.push({
        timestamp: timestamps[bestSplit],
        index: bestSplit,
        confidence: Math.min(1, maxStatistic / (threshold * 2)),
        beforeMean,
        afterMean,
        beforeStd,
        afterStd,
        changeType: determineChangeType(beforeMean, afterMean, beforeStd, afterStd),
        changeMagnitude,
        changeDirection: afterMean > beforeMean ? 'increase' : 'decrease',
        duration: calculateDuration(bestSplit, changePoints.map(cp => cp.index), end),
        impact: generateImpact(beforeMean, afterMean, changeMagnitude),
        statisticalTests: performStatisticalTests(beforeValues, afterValues)
      });
      
      // Recursively segment both parts
      recursiveSegmentation(start, bestSplit);
      recursiveSegmentation(bestSplit, end);
    }
  }
  
  recursiveSegmentation(0, values.length);
  
  // Sort by index
  changePoints.sort((a, b) => a.index - b.index);
  
  return changePoints;
}

function pooledStandardDeviation(sample1: number[], sample2: number[]): number {
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  if (n1 <= 1 || n2 <= 1) return 0;
  
  const var1 = standardDeviation(sample1) ** 2;
  const var2 = standardDeviation(sample2) ** 2;
  
  return Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
}

// ==================== Mann-Kendall Trend Test ====================

export function mannKendallTest(values: number[]): {
  statistic: number;
  pValue: number;
  trend: 'increasing' | 'decreasing' | 'no_trend';
  interpretation: string;
} {
  const n = values.length;
  let S = 0;
  
  // Calculate S statistic
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      S += Math.sign(values[j] - values[i]);
    }
  }
  
  // Calculate variance
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;
  
  // Calculate Z statistic
  let Z: number;
  if (S > 0) {
    Z = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    Z = (S + 1) / Math.sqrt(varS);
  } else {
    Z = 0;
  }
  
  // Approximate p-value using standard normal distribution
  const pValue = 2 * (1 - standardNormalCDF(Math.abs(Z)));
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'no_trend';
  if (pValue < 0.05) {
    trend = Z > 0 ? 'increasing' : 'decreasing';
  } else {
    trend = 'no_trend';
  }
  
  const interpretation = pValue < 0.05
    ? `Significant ${trend} trend detected (p=${pValue.toFixed(4)})`
    : `No significant trend detected (p=${pValue.toFixed(4)})`;
  
  return { statistic: S, pValue, trend, interpretation };
}

function standardNormalCDF(z: number): number {
  // Approximation of standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

// ==================== Combined Change Point Detection ====================

export function detectChangePointsCombined(
  values: number[],
  timestamps: string[]
): ChangePointDetectionResult {
  // Run multiple methods
  const cusumResults = cusumDetection(values, timestamps);
  const peltResults = peltDetection(values, timestamps);
  const bayesianResults = bayesianChangePointDetection(values, timestamps);
  const binarySegResults = binarySegmentation(values, timestamps);
  
  // Combine results (use consensus or weighted voting)
  const allChangePoints = [
    ...cusumResults,
    ...peltResults,
    ...bayesianResults,
    ...binarySegResults
  ];
  
  // Remove duplicates (change points within 5 indices of each other)
  const uniqueChangePoints = mergeSimilarChangePoints(allChangePoints, 5);
  
  // Create regimes
  const regimes = createRegimes(uniqueChangePoints, values, timestamps);
  
  return {
    changePoints: uniqueChangePoints,
    regimes,
    method: 'pelt' // Primary method
  };
}

function mergeSimilarChangePoints(changePoints: ChangePoint[], tolerance: number): ChangePoint[] {
  if (changePoints.length === 0) return [];
  
  // Sort by index
  const sorted = [...changePoints].sort((a, b) => a.index - b.index);
  const merged: ChangePoint[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    
    if (current.index - last.index <= tolerance) {
      // Merge - keep the one with higher confidence
      if (current.confidence > last.confidence) {
        merged[merged.length - 1] = current;
      }
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

function createRegimes(
  changePoints: ChangePoint[],
  values: number[],
  timestamps: string[]
): ChangePointDetectionResult['regimes'] {
  const regimes: ChangePointDetectionResult['regimes'] = [];
  const sortedCP = [...changePoints].sort((a, b) => a.index - b.index);
  
  let startIndex = 0;
  
  for (let i = 0; i <= sortedCP.length; i++) {
    const endIndex = i < sortedCP.length ? sortedCP[i].index : values.length;
    const regimeValues = values.slice(startIndex, endIndex);
    
    if (regimeValues.length > 0) {
      const regimeMean = mean(regimeValues);
      const regimeStd = standardDeviation(regimeValues);
      
      // Simple trend calculation
      const firstHalf = regimeValues.slice(0, Math.floor(regimeValues.length / 2));
      const secondHalf = regimeValues.slice(Math.floor(regimeValues.length / 2));
      const trend = mean(secondHalf) - mean(firstHalf);
      
      regimes.push({
        startIndex,
        endIndex,
        startDate: timestamps[startIndex],
        endDate: timestamps[endIndex - 1],
        mean: regimeMean,
        std: regimeStd,
        trend,
        characteristics: generateRegimeCharacteristics(regimeMean, regimeStd, trend)
      });
    }
    
    startIndex = endIndex;
  }
  
  return regimes;
}

// ==================== Helper Functions ====================

function determineChangeType(
  beforeMean: number,
  afterMean: number,
  beforeStd: number,
  afterStd: number
): 'mean_shift' | 'variance_shift' | 'trend_change' | 'regime_change' {
  const meanChange = Math.abs((afterMean - beforeMean) / beforeMean);
  const varChange = Math.abs((afterStd - beforeStd) / beforeStd);
  
  if (meanChange > 0.2 && varChange > 0.2) {
    return 'regime_change';
  } else if (meanChange > 0.15) {
    return 'mean_shift';
  } else if (varChange > 0.15) {
    return 'variance_shift';
  } else {
    return 'trend_change';
  }
}

function generateImpact(beforeMean: number, afterMean: number, changeMagnitude: number): string {
  const direction = afterMean > beforeMean ? 'increase' : 'decrease';
  const severity = changeMagnitude > 30 ? 'Major' : changeMagnitude > 15 ? 'Moderate' : 'Minor';
  
  return `${severity} ${direction} of ${changeMagnitude.toFixed(1)}% from ${beforeMean.toFixed(2)} to ${afterMean.toFixed(2)}`;
}

function generateRegimeCharacteristics(mean: number, std: number, trend: number): string {
  const stability = std / mean < 0.2 ? 'Stable' : std / mean < 0.4 ? 'Moderate variability' : 'High variability';
  const trendDirection = Math.abs(trend) < 0.1 ? 'stationary' : trend > 0 ? 'increasing' : 'decreasing';
  
  return `${stability}, ${trendDirection} (mean: ${mean.toFixed(2)}, std: ${std.toFixed(2)})`;
}

function calculateDuration(index: number, allIndices: number[], maxLength: number): string {
  const nextIndex = allIndices.find(idx => idx > index);
  const duration = nextIndex ? nextIndex - index : maxLength - index;
  
  if (duration < 7) {
    return `${duration} days`;
  } else if (duration < 30) {
    return `${Math.floor(duration / 7)} weeks`;
  } else {
    return `${Math.floor(duration / 30)} months`;
  }
}

function performStatisticalTests(before: number[], after: number[]): ChangePoint['statisticalTests'] {
  // T-test for mean difference
  const tStat = twoSampleTTest(before, after);
  
  // F-test for variance difference
  const fStat = fTest(before, after);
  
  // Mann-Kendall for trend
  const mkTest = mannKendallTest([...before, ...after]);
  
  return {
    tTest: { statistic: tStat.statistic, pValue: tStat.pValue },
    fTest: { statistic: fStat.statistic, pValue: fStat.pValue },
    mannKendall: { statistic: mkTest.statistic, pValue: mkTest.pValue, trend: mkTest.trend }
  };
}

function twoSampleTTest(sample1: number[], sample2: number[]): { statistic: number; pValue: number } {
  const mean1 = mean(sample1);
  const mean2 = mean(sample2);
  const std1 = standardDeviation(sample1);
  const std2 = standardDeviation(sample2);
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  const pooledStd = Math.sqrt((std1 * std1 / n1) + (std2 * std2 / n2));
  const statistic = pooledStd > 0 ? (mean1 - mean2) / pooledStd : 0;
  
  // Approximate p-value (simplified)
  const pValue = 2 * (1 - standardNormalCDF(Math.abs(statistic)));
  
  return { statistic, pValue };
}

function fTest(sample1: number[], sample2: number[]): { statistic: number; pValue: number } {
  const var1 = standardDeviation(sample1) ** 2;
  const var2 = standardDeviation(sample2) ** 2;
  
  const statistic = var2 > 0 ? var1 / var2 : 1;
  
  // Approximate p-value (simplified)
  const pValue = statistic > 2 || statistic < 0.5 ? 0.01 : 0.5;
  
  return { statistic, pValue };
}

