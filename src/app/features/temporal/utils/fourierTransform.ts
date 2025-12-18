/**
 * Fourier Analysis and Spectral Density Utilities
 * FFT, Periodogram, and Frequency Domain Analysis
 */

import { mean, standardDeviation } from './temporalCalculations';
import { FourierComponent, SpectralDensity, Periodogram } from '../types/temporal.types';

// ==================== FFT Implementation ====================

interface Complex {
  re: number;
  im: number;
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

function complexSubtract(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

function complexMultiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

function complexMagnitude(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

function complexPhase(c: Complex): number {
  return Math.atan2(c.im, c.re);
}

export function fft(values: number[]): Complex[] {
  const n = values.length;
  
  // Base case
  if (n === 1) {
    return [{ re: values[0], im: 0 }];
  }
  
  // Pad to power of 2
  const n2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...values, ...new Array(n2 - n).fill(0)];
  
  return cooleyTukeyFFT(padded.map(v => ({ re: v, im: 0 })));
}

function cooleyTukeyFFT(x: Complex[]): Complex[] {
  const n = x.length;
  
  if (n === 1) {
    return x;
  }
  
  // Divide
  const even = x.filter((_, i) => i % 2 === 0);
  const odd = x.filter((_, i) => i % 2 === 1);
  
  // Conquer
  const fftEven = cooleyTukeyFFT(even);
  const fftOdd = cooleyTukeyFFT(odd);
  
  // Combine
  const result: Complex[] = new Array(n);
  for (let k = 0; k < n / 2; k++) {
    const angle = -2 * Math.PI * k / n;
    const twiddle: Complex = { re: Math.cos(angle), im: Math.sin(angle) };
    const t = complexMultiply(twiddle, fftOdd[k]);
    
    result[k] = complexAdd(fftEven[k], t);
    result[k + n / 2] = complexSubtract(fftEven[k], t);
  }
  
  return result;
}

// ==================== Periodogram ====================

export function calculatePeriodogram(
  values: number[],
  samplingRate: number = 1 // samples per unit time (e.g., 1 per day)
): Periodogram {
  const n = values.length;
  
  // Remove mean (detrend)
  const avg = mean(values);
  const centered = values.map(v => v - avg);
  
  // Calculate FFT
  const fftResult = fft(centered);
  
  // Calculate power spectrum (only positive frequencies)
  const halfN = Math.floor(n / 2);
  const frequencies: number[] = [];
  const power: number[] = [];
  
  for (let k = 0; k <= halfN; k++) {
    const freq = k * samplingRate / n;
    frequencies.push(freq);
    
    // Power = |FFT|^2 / n
    const magnitude = complexMagnitude(fftResult[k]);
    power.push((magnitude * magnitude) / n);
  }
  
  // Find peaks
  const peaks = findPeaks(power, frequencies);
  
  return { frequencies, power, peaks };
}

function findPeaks(
  power: number[],
  frequencies: number[],
  threshold: number = 0.1
): { frequency: number; power: number; period: number }[] {
  const peaks: { frequency: number; power: number; period: number }[] = [];
  const maxPower = Math.max(...power);
  
  for (let i = 1; i < power.length - 1; i++) {
    // Check if local maximum
    if (power[i] > power[i - 1] && power[i] > power[i + 1]) {
      // Check if significant (above threshold)
      if (power[i] > threshold * maxPower) {
        const freq = frequencies[i];
        if (freq > 0) { // Skip DC component
          peaks.push({
            frequency: freq,
            power: power[i],
            period: 1 / freq
          });
        }
      }
    }
  }
  
  // Sort by power (descending)
  peaks.sort((a, b) => b.power - a.power);
  
  return peaks;
}

// ==================== Spectral Density Estimation ====================

export function welchSpectralDensity(
  values: number[],
  windowSize: number = 256,
  overlap: number = 128,
  samplingRate: number = 1
): SpectralDensity {
  const n = values.length;
  const numWindows = Math.floor((n - overlap) / (windowSize - overlap));
  
  let summedPower: number[] = [];
  let frequencies: number[] = [];
  
  for (let i = 0; i < numWindows; i++) {
    const start = i * (windowSize - overlap);
    const end = start + windowSize;
    const window = values.slice(start, end);
    
    // Apply Hamming window
    const windowed = applyHammingWindow(window);
    
    // Calculate periodogram for this window
    const periodogram = calculatePeriodogram(windowed, samplingRate);
    
    if (i === 0) {
      frequencies = periodogram.frequencies;
      summedPower = periodogram.power;
    } else {
      summedPower = summedPower.map((p, j) => p + periodogram.power[j]);
    }
  }
  
  // Average power across windows
  const powerSpectrum = summedPower.map(p => p / numWindows);
  
  // Calculate noise floor (median of power spectrum)
  const sortedPower = [...powerSpectrum].sort((a, b) => a - b);
  const noiseFloor = sortedPower[Math.floor(sortedPower.length / 2)];
  
  // Extract dominant frequencies
  const peaks = findPeaks(powerSpectrum, frequencies, 0.2);
  const dominantFrequencies = peaks.slice(0, 10).map(peak => ({
    frequency: peak.frequency,
    amplitude: Math.sqrt(peak.power),
    phase: 0, // Would need inverse FFT to calculate
    period: peak.period,
    periodLabel: formatPeriod(peak.period),
    strength: (peak.power / Math.max(...powerSpectrum)) * 100,
    interpretation: interpretFrequency(peak.period)
  }));
  
  // Calculate variance explained
  const totalPower = powerSpectrum.reduce((sum, p) => sum + p, 0);
  const topPower = peaks.slice(0, 5).reduce((sum, p) => sum + p.power, 0);
  const varianceExplained = (topPower / totalPower) * 100;
  
  return {
    frequencies,
    powerSpectrum,
    dominantFrequencies,
    noiseFloor,
    varianceExplained
  };
}

function applyHammingWindow(values: number[]): number[] {
  const n = values.length;
  return values.map((v, i) => {
    const windowValue = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1));
    return v * windowValue;
  });
}

// ==================== Frequency Analysis ====================

export function extractDominantFrequencies(
  values: number[],
  samplingRate: number = 1,
  topN: number = 5
): FourierComponent[] {
  const periodogram = calculatePeriodogram(values, samplingRate);
  const peaks = periodogram.peaks.slice(0, topN);
  
  const totalPower = periodogram.power.reduce((sum, p) => sum + p, 0);
  
  return peaks.map(peak => ({
    frequency: peak.frequency,
    amplitude: Math.sqrt(peak.power),
    phase: 0,
    period: peak.period,
    periodLabel: formatPeriod(peak.period),
    strength: (peak.power / totalPower) * 100,
    interpretation: interpretFrequency(peak.period)
  }));
}

function formatPeriod(period: number): string {
  if (period < 1) {
    return `${(period * 24).toFixed(1)} hours`;
  } else if (period < 7) {
    return `${period.toFixed(1)} days`;
  } else if (period < 30) {
    return `${(period / 7).toFixed(1)} weeks`;
  } else if (period < 365) {
    return `${(period / 30).toFixed(1)} months`;
  } else {
    return `${(period / 365).toFixed(1)} years`;
  }
}

function interpretFrequency(period: number): string {
  if (period >= 6.5 && period <= 7.5) {
    return 'Weekly cycle (work week pattern)';
  } else if (period >= 3 && period <= 4) {
    return 'Supply cadence (3-4 day cycle)';
  } else if (period >= 13 && period <= 15) {
    return 'Bi-weekly cycle (payroll or billing)';
  } else if (period >= 28 && period <= 32) {
    return 'Monthly cycle (billing or reporting)';
  } else if (period >= 88 && period <= 95) {
    return 'Quarterly cycle (business quarters)';
  } else if (period >= 360 && period <= 370) {
    return 'Annual seasonality';
  } else {
    return `${formatPeriod(period)} cycle`;
  }
}

// ==================== Seasonality Strength ====================

export function calculateSeasonalityStrength(
  values: number[],
  period: number
): number {
  // Use ratio of spectral power at seasonal frequency to total power
  const periodogram = calculatePeriodogram(values);
  const seasonalFreq = 1 / period;
  
  // Find power at seasonal frequency
  let seasonalPower = 0;
  const freqTolerance = 0.1 / period;
  
  for (let i = 0; i < periodogram.frequencies.length; i++) {
    if (Math.abs(periodogram.frequencies[i] - seasonalFreq) < freqTolerance) {
      seasonalPower = Math.max(seasonalPower, periodogram.power[i]);
    }
  }
  
  const totalPower = periodogram.power.reduce((sum, p) => sum + p, 0);
  
  return seasonalPower / totalPower;
}

// ==================== Reconstruct Signal from Frequencies ====================

export function reconstructSignal(
  components: FourierComponent[],
  length: number,
  samplingRate: number = 1
): number[] {
  const signal: number[] = new Array(length).fill(0);
  
  for (let t = 0; t < length; t++) {
    let value = 0;
    for (const comp of components) {
      const angle = 2 * Math.PI * comp.frequency * t / samplingRate + comp.phase;
      value += comp.amplitude * Math.cos(angle);
    }
    signal[t] = value;
  }
  
  return signal;
}

// ==================== Frequency Filtering ====================

export function bandPassFilter(
  values: number[],
  lowFreq: number,
  highFreq: number,
  samplingRate: number = 1
): number[] {
  // Apply FFT
  const fftResult = fft(values);
  const n = fftResult.length;
  
  // Filter frequencies
  const filtered = fftResult.map((c, k) => {
    const freq = k * samplingRate / n;
    if (freq >= lowFreq && freq <= highFreq) {
      return c;
    } else {
      return { re: 0, im: 0 };
    }
  });
  
  // Inverse FFT (simplified - just take real part)
  return ifft(filtered);
}

function ifft(x: Complex[]): number[] {
  const n = x.length;
  
  // Conjugate
  const conjugated = x.map(c => ({ re: c.re, im: -c.im }));
  
  // FFT
  const fftResult = cooleyTukeyFFT(conjugated);
  
  // Conjugate and scale
  return fftResult.map(c => c.re / n);
}

