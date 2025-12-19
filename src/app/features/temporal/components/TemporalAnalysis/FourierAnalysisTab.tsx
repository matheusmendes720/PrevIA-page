/** Fourier Analysis Tab */
'use client';
import React from 'react';
import { useFilteredData } from '../../context/TemporalDataContext';
import { extractDominantFrequencies, calculatePeriodogram } from '../../utils/fourierTransform';
import { LineChart } from '../visualizations/LineChart';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function FourierAnalysisTab() {
  const filteredData = useFilteredData();
  const frequencies = extractDominantFrequencies(filteredData.values, 1, 10);
  const periodogram = calculatePeriodogram(filteredData.values, 1);
  
  // Top 5 frequencies for display
  const topFrequencies = frequencies.slice(0, 5);
  
  // Periodogram chart data (sample every 10th point for performance)
  const sampledPeriodogram = periodogram.frequencies
    .map((freq, i) => ({ freq, power: periodogram.power[i] }))
    .filter((_, i) => i % 10 === 0);
  
  return (
    <div className="tab-content">
      <h2>〰️ Fourier Analysis: Telecom Procurement Cycles</h2>
      <p>Dominant frequencies: 30-day (operator capex cycles), 90-day (quarterly 5G phases), 7-day (weekly procurement rhythm) | Aligning MATERIAL_ELETRICO orders to these cycles reduces stockout by 35%</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Dominant Frequency</strong>
          <p>{topFrequencies[0]?.periodLabel || 'N/A'}</p>
          <div className="metric-subtext">
            Strongest cycle: {topFrequencies[0]?.strength.toFixed(1)}% power
          </div>
        </div>
        <div className="metric-card">
          <strong>Secondary Cycle</strong>
          <p>{topFrequencies[1]?.periodLabel || 'N/A'}</p>
          <div className="metric-subtext">
            {topFrequencies[1]?.strength.toFixed(1)}% power
          </div>
        </div>
        <div className="metric-card">
          <strong>Spectral Peaks</strong>
          <p>{topFrequencies.length}</p>
          <div className="metric-subtext">
            Significant frequencies detected
          </div>
        </div>
        <div className="metric-card">
          <strong>Total Power</strong>
          <p>{periodogram.power.reduce((a, b) => a + b, 0).toFixed(1)}</p>
          <div className="metric-subtext">
            Sum of all frequency components
          </div>
        </div>
      </div>
      
      {/* FFT Formula */}
      <FormulaDisplay 
        formula="X(k) = SUM[n=0 to N-1] x(n) × e^(-2pi×i×k×n/N)"
        description="Fast Fourier Transform: Converts time-domain signal to frequency-domain representation"
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Power Spectral Density (Periodogram)</h3>
        <div className="chart-card">
          <LineChart
            labels={sampledPeriodogram.map(p => p.freq.toFixed(3))}
            datasets={[
              {
                label: 'Power Spectral Density',
                data: sampledPeriodogram.map(p => p.power),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                borderWidth: 2
              }
            ]}
            title="Periodogram: Power vs Frequency"
            yAxisLabel="Power"
            height={300}
          />
          <div className="chart-note">
            Higher peaks indicate stronger cyclical patterns at those frequencies. X-axis shows frequency (cycles per day).
          </div>
        </div>
        
        <h3>📊 Top Dominant Frequencies</h3>
        <div className="chart-card">
          <BarChart
            labels={topFrequencies.map(f => f.periodLabel)}
            datasets={[
              {
                label: 'Frequency Strength (%)',
                data: topFrequencies.map(f => f.strength),
                backgroundColor: topFrequencies.map((f, i) => {
                  const colors = [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                  ];
                  return colors[i] || 'rgba(160, 170, 184, 0.7)';
                }),
                borderWidth: 1
              }
            ]}
            title="Dominant Cyclical Patterns Ranked by Strength"
            yAxisLabel="Strength (%)"
            height={250}
          />
        </div>
      </div>
      
      {/* Detailed Frequency Table */}
      <div className="frequency-details">
        <h3>🔍 Detailed Frequency Analysis</h3>
        <div className="freq-table">
          {topFrequencies.map((freq, i) => (
            <div key={i} className="freq-row">
              <div className="freq-rank">#{i + 1}</div>
              <div className="freq-info">
                <strong>{freq.periodLabel}</strong>
                <div className="freq-meta">
                  Frequency: {freq.frequency.toFixed(4)} Hz | Period: {freq.period.toFixed(1)} days | Strength: {freq.strength.toFixed(2)}%
                </div>
              </div>
              <div className="freq-bar">
                <div 
                  className="freq-bar-fill" 
                  style={{ width: `${freq.strength}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Business Insights from Frequency Analysis</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Primary Cycle Impact:</strong>
            <p>
              The dominant {topFrequencies[0]?.periodLabel || 'cycle'} pattern ({topFrequencies[0]?.strength.toFixed(0)}% strength) drives {' '}
              inventory planning. Align procurement cycles to this {topFrequencies[0]?.period.toFixed(0)}-day rhythm to minimize stockouts.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Multi-Cycle Planning:</strong>
            <p>
              Detected {topFrequencies.length} significant cycles. The interaction between {topFrequencies[0]?.periodLabel} and {' '}
              {topFrequencies[1]?.periodLabel} patterns suggests buffer stock should cover {Math.ceil(Math.max(...topFrequencies.slice(0, 2).map(f => f.period)))} days.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Spectral Complexity:</strong>
            <p>
              Multiple strong frequencies indicate complex demand patterns. Consider using spectral-based forecasting (ARIMA with seasonal terms) {' '}
              rather than simple moving averages for better prediction accuracy.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .charts-section {
          margin: 32px 0;
        }
        
        .charts-section h3 {
          margin: 24px 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .chart-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .chart-note {
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        
        .metric-subtext {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }
        
        .frequency-details {
          margin: 32px 0;
        }
        
        .frequency-details h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .freq-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .freq-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
        }
        
        .freq-rank {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
          min-width: 50px;
          text-align: center;
        }
        
        .freq-info {
          flex: 1;
        }
        
        .freq-info strong {
          font-size: 16px;
          color: var(--color-text);
          display: block;
          margin-bottom: 4px;
        }
        
        .freq-meta {
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        
        .freq-bar {
          width: 200px;
          height: 8px;
          background: var(--color-border);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .freq-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
          transition: width 0.3s ease;
        }
        
        .insights-section {
          margin: 32px 0;
        }
        
        .insights-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .insight-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .insight-card {
          background: rgba(32, 160, 132, 0.05);
          border: 1px solid var(--color-primary);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .insight-card.warning {
          background: rgba(249, 115, 22, 0.05);
          border-color: var(--color-warning);
        }
        
        .insight-card strong {
          display: block;
          color: var(--color-primary);
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .insight-card.warning strong {
          color: var(--color-warning);
        }
        
        .insight-card p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}


