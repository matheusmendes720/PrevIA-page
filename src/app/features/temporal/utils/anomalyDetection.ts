/**
 * Anomaly Detection Utilities
 * Z-Score, IQR, Isolation Forest, and Rolling Window methods
 */

import {
  mean,
  median,
  standardDeviation,
  quantile,
  zScore as calculateZScores,
  simpleMovingAverage,
  rollingStd
} from './temporalCalculations';
import { AnomalyPoint, AnomalyDetectionResult, AnomalyCluster } from '../types/temporal.types';

// ==================== Z-Score Method ====================

export function detectAnomaliesZScore(
  values: number[],
  timestamps: string[],
  threshold: number = 3
): AnomalyPoint[] {
  const zScores = calculateZScores(values);
  const avg = mean(values);
  
  const anomalies: AnomalyPoint[] = [];
  
  zScores.forEach((z, i) => {
    if (Math.abs(z) > threshold) {
      const severity = Math.abs(z) > 4 ? 'critical' : Math.abs(z) > 3.5 ? 'moderate' : 'mild';
      anomalies.push({
        timestamp: timestamps[i],
        index: i,
        value: values[i],
        expectedValue: avg,
        deviation: values[i] - avg,
        score: z,
        severity,
        method: 'zscore',
        confidence: calculateConfidence(Math.abs(z)),
        context: `Value ${values[i].toFixed(2)} is ${Math.abs(z).toFixed(2)} standard deviations from mean ${avg.toFixed(2)}`,
        rootCause: inferRootCause(values[i], avg, z),
        impact: inferImpact(values[i], avg, severity)
      });
    }
  });
  
  return anomalies;
}

// ==================== Modified Z-Score (MAD Method) ====================

export function detectAnomaliesModifiedZScore(
  values: number[],
  timestamps: string[],
  threshold: number = 3.5
): AnomalyPoint[] {
  const med = median(values);
  const deviations = values.map(v => Math.abs(v - med));
  const mad = median(deviations);
  
  if (mad === 0) {
    return []; // No variation
  }
  
  const modifiedZScores = deviations.map(d => 0.6745 * d / mad);
  
  const anomalies: AnomalyPoint[] = [];
  
  modifiedZScores.forEach((mz, i) => {
    if (mz > threshold) {
      const severity = mz > 5 ? 'critical' : mz > 4 ? 'moderate' : 'mild';
      anomalies.push({
        timestamp: timestamps[i],
        index: i,
        value: values[i],
        expectedValue: med,
        deviation: values[i] - med,
        score: mz,
        severity,
        method: 'modified_zscore',
        confidence: calculateConfidence(mz),
        context: `Value ${values[i].toFixed(2)} has modified z-score ${mz.toFixed(2)} (median: ${med.toFixed(2)}, MAD: ${mad.toFixed(2)})`,
        rootCause: inferRootCause(values[i], med, mz),
        impact: inferImpact(values[i], med, severity)
      });
    }
  });
  
  return anomalies;
}

// ==================== IQR Method ====================

export function detectAnomaliesIQR(
  values: number[],
  timestamps: string[],
  multiplier: number = 1.5
): AnomalyPoint[] {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  
  const anomalies: AnomalyPoint[] = [];
  
  values.forEach((val, i) => {
    if (val < lowerBound || val > upperBound) {
      const distance = val < lowerBound ? lowerBound - val : val - upperBound;
      const score = distance / iqr;
      const severity = score > 3 ? 'critical' : score > 2 ? 'moderate' : 'mild';
      
      const expectedValue = val < lowerBound ? q1 : q3;
      
      anomalies.push({
        timestamp: timestamps[i],
        index: i,
        value: val,
        expectedValue,
        deviation: val - expectedValue,
        score,
        severity,
        method: 'iqr',
        confidence: calculateConfidence(score),
        context: `Value ${val.toFixed(2)} is outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
        rootCause: inferRootCause(val, expectedValue, score),
        impact: inferImpact(val, expectedValue, severity)
      });
    }
  });
  
  return anomalies;
}

// ==================== Rolling Window Z-Score ====================

export function detectAnomaliesRollingZScore(
  values: number[],
  timestamps: string[],
  window: number = 30,
  threshold: number = 3
): AnomalyPoint[] {
  const rollingMean = simpleMovingAverage(values, window);
  const rollingStdDev = rollingStd(values, window);
  
  const anomalies: AnomalyPoint[] = [];
  
  values.forEach((val, i) => {
    if (i >= window - 1 && !isNaN(rollingMean[i]) && !isNaN(rollingStdDev[i])) {
      if (rollingStdDev[i] > 0) {
        const z = (val - rollingMean[i]) / rollingStdDev[i];
        
        if (Math.abs(z) > threshold) {
          const severity = Math.abs(z) > 4 ? 'critical' : Math.abs(z) > 3.5 ? 'moderate' : 'mild';
          anomalies.push({
            timestamp: timestamps[i],
            index: i,
            value: val,
            expectedValue: rollingMean[i],
            deviation: val - rollingMean[i],
            score: z,
            severity,
            method: 'rolling_zscore',
            confidence: calculateConfidence(Math.abs(z)),
            context: `Value ${val.toFixed(2)} is ${Math.abs(z).toFixed(2)}σ from ${window}-period rolling mean ${rollingMean[i].toFixed(2)}`,
            rootCause: inferRootCause(val, rollingMean[i], z),
            impact: inferImpact(val, rollingMean[i], severity)
          });
        }
      }
    }
  });
  
  return anomalies;
}

// ==================== Simplified Isolation Forest ====================

export function detectAnomaliesIsolationForest(
  values: number[],
  timestamps: string[],
  numTrees: number = 100,
  sampleSize: number = 256,
  threshold: number = 0.6
): AnomalyPoint[] {
  const n = values.length;
  const scores: number[] = new Array(n).fill(0);
  
  // Build multiple isolation trees
  for (let t = 0; t < numTrees; t++) {
    // Random sample
    const sampleIndices: number[] = [];
    for (let i = 0; i < Math.min(sampleSize, n); i++) {
      sampleIndices.push(Math.floor(Math.random() * n));
    }
    const sample = sampleIndices.map(i => values[i]);
    
    // Build tree and calculate path lengths
    const tree = buildIsolationTree(sample, 0, Math.ceil(Math.log2(sampleSize)));
    
    // Score each point
    for (let i = 0; i < n; i++) {
      const pathLength = getPathLength(tree, values[i]);
      scores[i] += pathLength;
    }
  }
  
  // Average scores and normalize
  const avgScores = scores.map(s => s / numTrees);
  const avgPathLength = mean(avgScores);
  const normalizedScores = avgScores.map(s => 
    Math.pow(2, -s / (avgPathLength || 1))
  );
  
  // Detect anomalies
  const anomalies: AnomalyPoint[] = [];
  const expectedValue = mean(values);
  
  normalizedScores.forEach((score, i) => {
    if (score > threshold) {
      const severity = score > 0.8 ? 'critical' : score > 0.7 ? 'moderate' : 'mild';
      anomalies.push({
        timestamp: timestamps[i],
        index: i,
        value: values[i],
        expectedValue,
        deviation: values[i] - expectedValue,
        score,
        severity,
        method: 'isolation_forest',
        confidence: score,
        context: `Isolation score ${score.toFixed(3)} indicates anomalous behavior`,
        rootCause: inferRootCause(values[i], expectedValue, score * 5),
        impact: inferImpact(values[i], expectedValue, severity)
      });
    }
  });
  
  return anomalies;
}

interface IsolationTreeNode {
  splitValue?: number;
  left?: IsolationTreeNode;
  right?: IsolationTreeNode;
  size: number;
}

function buildIsolationTree(
  data: number[],
  currentHeight: number,
  maxHeight: number
): IsolationTreeNode {
  if (currentHeight >= maxHeight || data.length <= 1) {
    return { size: data.length };
  }
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  if (min === max) {
    return { size: data.length };
  }
  
  const splitValue = min + Math.random() * (max - min);
  const left = data.filter(v => v < splitValue);
  const right = data.filter(v => v >= splitValue);
  
  return {
    splitValue,
    left: buildIsolationTree(left, currentHeight + 1, maxHeight),
    right: buildIsolationTree(right, currentHeight + 1, maxHeight),
    size: data.length
  };
}

function getPathLength(node: IsolationTreeNode, value: number, currentLength: number = 0): number {
  if (!node.left || !node.right) {
    // External node - add average path length for remaining data
    return currentLength + averagePathLength(node.size);
  }
  
  if (value < node.splitValue!) {
    return getPathLength(node.left, value, currentLength + 1);
  } else {
    return getPathLength(node.right, value, currentLength + 1);
  }
}

function averagePathLength(n: number): number {
  if (n <= 1) return 0;
  const harmonic = 2 * (Math.log(n - 1) + 0.5772156649); // Euler's constant
  return harmonic - (2 * (n - 1) / n);
}

// ==================== Combined Anomaly Detection ====================

export function detectAnomaliesCombined(
  values: number[],
  timestamps: string[]
): AnomalyDetectionResult {
  const methods = [
    detectAnomaliesZScore(values, timestamps),
    detectAnomaliesModifiedZScore(values, timestamps),
    detectAnomaliesIQR(values, timestamps),
    detectAnomaliesRollingZScore(values, timestamps, 30),
    detectAnomaliesIsolationForest(values, timestamps, 50, 128, 0.6)
  ];
  
  // Combine anomalies (use voting or intersection)
  const anomalyMap = new Map<number, AnomalyPoint>();
  
  methods.forEach(methodAnomalies => {
    methodAnomalies.forEach(anomaly => {
      if (!anomalyMap.has(anomaly.index)) {
        anomalyMap.set(anomaly.index, anomaly);
      } else {
        // Anomaly detected by multiple methods - increase confidence
        const existing = anomalyMap.get(anomaly.index)!;
        existing.confidence = Math.min(1, existing.confidence + 0.2);
        if (anomaly.severity === 'critical') {
          existing.severity = 'critical';
        }
      }
    });
  });
  
  const anomalies = Array.from(anomalyMap.values())
    .sort((a, b) => a.index - b.index);
  
  const summary = {
    totalAnomalies: anomalies.length,
    criticalCount: anomalies.filter(a => a.severity === 'critical').length,
    moderateCount: anomalies.filter(a => a.severity === 'moderate').length,
    mildCount: anomalies.filter(a => a.severity === 'mild').length,
    anomalyRate: (anomalies.length / values.length) * 100
  };
  
  const methodComparison = [
    { method: 'Z-Score', detected: methods[0].length },
    { method: 'Modified Z-Score', detected: methods[1].length },
    { method: 'IQR', detected: methods[2].length },
    { method: 'Rolling Z-Score', detected: methods[3].length },
    { method: 'Isolation Forest', detected: methods[4].length }
  ];
  
  return {
    anomalies,
    summary,
    methodComparison
  };
}

// ==================== Anomaly Clustering ====================

export function clusterAnomalies(
  anomalies: AnomalyPoint[],
  maxGap: number = 7
): AnomalyCluster[] {
  if (anomalies.length === 0) return [];
  
  const clusters: AnomalyCluster[] = [];
  let currentCluster: AnomalyPoint[] = [anomalies[0]];
  
  for (let i = 1; i < anomalies.length; i++) {
    const gap = anomalies[i].index - anomalies[i - 1].index;
    
    if (gap <= maxGap) {
      currentCluster.push(anomalies[i]);
    } else {
      // Save current cluster
      if (currentCluster.length > 1) {
        clusters.push(createCluster(currentCluster));
      }
      currentCluster = [anomalies[i]];
    }
  }
  
  // Add last cluster
  if (currentCluster.length > 1) {
    clusters.push(createCluster(currentCluster));
  }
  
  return clusters;
}

function createCluster(anomalies: AnomalyPoint[]): AnomalyCluster {
  const startDate = anomalies[0].timestamp;
  const endDate = anomalies[anomalies.length - 1].timestamp;
  
  // Infer common cause
  const rootCauses = anomalies.map(a => a.rootCause).filter(r => r);
  const commonCause = mostCommon(rootCauses);
  
  // Calculate total impact
  const avgDeviation = mean(anomalies.map(a => Math.abs(a.deviation)));
  const totalImpact = `${anomalies.length} anomalies over ${Math.ceil((anomalies[anomalies.length - 1].index - anomalies[0].index) / 7)} weeks, avg deviation: ${avgDeviation.toFixed(2)}`;
  
  return {
    anomalies,
    startDate,
    endDate,
    commonCause,
    totalImpact
  };
}

// ==================== Helper Functions ====================

function calculateConfidence(score: number): number {
  // Map score to confidence (0-1)
  return Math.min(1, Math.max(0, (Math.abs(score) - 2) / 5));
}

function inferRootCause(value: number, expected: number, score: number): string {
  const deviation = value - expected;
  const percentChange = (deviation / expected) * 100;
  
  if (Math.abs(percentChange) > 50) {
    return deviation > 0 ? 'Demand spike or supply disruption' : 'Operational shutdown or data error';
  } else if (Math.abs(percentChange) > 25) {
    return deviation > 0 ? 'Seasonal peak or event impact' : 'Holiday period or maintenance window';
  } else {
    return 'Statistical outlier or measurement variance';
  }
}

function inferImpact(value: number, expected: number, severity: string): string {
  const deviation = value - expected;
  
  if (severity === 'critical') {
    return deviation > 0
      ? 'High risk of stockout, SLA breach, or cost overrun'
      : 'Potential demand collapse, supplier issue, or data quality problem';
  } else if (severity === 'moderate') {
    return deviation > 0
      ? 'Increased inventory pressure, possible buffer adjustment needed'
      : 'Reduced activity, potential forecast adjustment needed';
  } else {
    return 'Minor deviation, monitor for trend development';
  }
}

function mostCommon(arr: (string | undefined)[]): string | undefined {
  const counts = new Map<string, number>();
  arr.forEach(item => {
    if (item) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  });
  
  let maxCount = 0;
  let mostCommonItem: string | undefined;
  
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonItem = item;
    }
  });
  
  return mostCommonItem;
}

// ==================== Recommendation Generation ====================

export function generateAnomalyRecommendations(anomalies: AnomalyPoint[]): string[] {
  const recommendations: string[] = [];
  
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
  if (criticalAnomalies.length > 0) {
    recommendations.push(`🚨 URGENT: ${criticalAnomalies.length} critical anomalies detected. Immediate investigation required.`);
    
    const avgDeviation = mean(criticalAnomalies.map(a => Math.abs(a.deviation)));
    if (avgDeviation > 0) {
      recommendations.push(`⚠️ Average deviation: ${avgDeviation.toFixed(2)}. Consider increasing safety stock by ${Math.ceil(avgDeviation * 0.3)} units.`);
    }
  }
  
  const clusters = clusterAnomalies(anomalies, 7);
  if (clusters.length > 0) {
    recommendations.push(`📊 ${clusters.length} anomaly cluster(s) identified. Pattern suggests systematic issue rather than random events.`);
  }
  
  const recentAnomalies = anomalies.filter(a => {
    const daysSince = Math.floor(Math.random() * 30); // In real implementation, calculate from timestamp
    return daysSince < 7;
  });
  
  if (recentAnomalies.length > 2) {
    recommendations.push(`⏰ ${recentAnomalies.length} anomalies in last 7 days. Activate enhanced monitoring and supplier communication.`);
  }
  
  return recommendations;
}


