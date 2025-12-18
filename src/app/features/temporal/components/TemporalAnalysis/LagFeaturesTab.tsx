/** Lag Features & Rolling Statistics Tab */
'use client';
import React from 'react';
import { useFilteredData } from '../../context/TemporalDataContext';
import { simpleMovingAverage, exponentialMovingAverage, rollingStd, rollingMin, rollingMax } from '../../utils/temporalCalculations';
import { LineChart } from '../visualizations/LineChart';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function LagFeaturesTab() {
  const filteredData = useFilteredData();
  
  // Calculate various lag features and rolling statistics
  const sma7 = simpleMovingAverage(filteredData.values, 7);
  const sma14 = simpleMovingAverage(filteredData.values, 14);
  const sma30 = simpleMovingAverage(filteredData.values, 30);
  const ema7 = exponentialMovingAverage(filteredData.values, 7);
  const rstd7 = rollingStd(filteredData.values, 7);
  const rstd14 = rollingStd(filteredData.values, 14);
  const rmin7 = rollingMin(filteredData.values, 7);
  const rmax7 = rollingMax(filteredData.values, 7);
  
  // Create lag features (shift by N periods)
  const lag1 = [null, ...filteredData.values.slice(0, -1)];
  const lag7 = [null, null, null, null, null, null, null, ...filteredData.values.slice(0, -7)];
  
  // Calculate rolling volatility (coefficient of variation)
  const rollingCV = sma7.map((mean, i) => {
    if (!mean || mean === 0 || !rstd7[i]) return null;
    return (rstd7[i] / mean) * 100;
  });
  
  // Calculate momentum (rate of change)
  const momentum7 = filteredData.values.map((val, i) => {
    if (i < 7 || !filteredData.values[i - 7]) return null;
    return ((val - filteredData.values[i - 7]) / filteredData.values[i - 7]) * 100;
  });
  
  // Bollinger Bands (SMA ± 2*std)
  const upperBand = sma7.map((ma, i) => ma && rstd7[i] ? ma + 2 * rstd7[i] : 0);
  const lowerBand = sma7.map((ma, i) => ma && rstd7[i] ? ma - 2 * rstd7[i] : 0);
  
  // Current values (last non-NaN)
  const currentSMA7 = sma7.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const currentSMA14 = sma14.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const currentSMA30 = sma30.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const currentStd7 = rstd7.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const currentCV = rollingCV.filter(v => v !== null && !isNaN(v)).slice(-1)[0] || 0;
  const currentMomentum = momentum7.filter(v => v !== null && !isNaN(v)).slice(-1)[0] || 0;
  
  // Window size comparison data
  const windowComparison = [
    { window: '7-day', sma: currentSMA7, std: rstd7.filter(v => !isNaN(v)).slice(-1)[0] || 0 },
    { window: '14-day', sma: currentSMA14, std: rstd14.filter(v => !isNaN(v)).slice(-1)[0] || 0 },
    { window: '30-day', sma: currentSMA30, std: rollingStd(filteredData.values, 30).filter(v => !isNaN(v)).slice(-1)[0] || 0 }
  ];
  
  return (
    <div className="tab-content">
      <h2>⏱️ ML Features: MATERIAL_ELETRICO Forecasting</h2>
      <p>Lag features for XGBoost/LSTM models: lag-1 (yesterday demand), lag-7 (weekly pattern), lag-30 (monthly trend) | Rolling stats: SMA-7 (short-term), EMA-14, Bollinger Bands (volatility zones)</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>7-Day SMA</strong>
          <p>{currentSMA7.toFixed(2)}</p>
          <div className="metric-subtext">
            Short-term trend indicator
          </div>
        </div>
        <div className="metric-card">
          <strong>30-Day SMA</strong>
          <p>{currentSMA30.toFixed(2)}</p>
          <div className="metric-subtext">
            Long-term trend indicator
          </div>
        </div>
        <div className="metric-card">
          <strong>Rolling Volatility</strong>
          <p>{currentCV.toFixed(1)}%</p>
          <div className="metric-subtext">
            Coefficient of Variation (CV)
          </div>
        </div>
        <div className="metric-card">
          <strong>7-Day Momentum</strong>
          <p className={currentMomentum >= 0 ? 'positive' : 'negative'}>
            {currentMomentum >= 0 ? '+' : ''}{currentMomentum.toFixed(1)}%
          </p>
          <div className="metric-subtext">
            Rate of change indicator
          </div>
        </div>
      </div>
      
      {/* Formula Displays */}
      <FormulaDisplay 
        formula="SMA_t = (1/n) × SUM(x_t-n+1 to x_t)    |    EMA_t = alpha×x_t + (1-alpha)×EMA_t-1"
        description="Simple Moving Average (equal weights) vs Exponential Moving Average (recent data weighted more)"
      />
      
      <FormulaDisplay 
        formula="Lag_k(x_t) = x_t-k    |    Rolling_Std_t = sqrt[(1/n)×SUM((x_i - SMA_t)^2)]"
        description="Lag features shift time series by k periods; Rolling standard deviation measures local volatility"
      />
      
      {/* Visualization: Moving Averages */}
      <div className="charts-section">
        <h3>📊 Moving Averages & Bollinger Bands</h3>
        <div className="chart-card">
          <LineChart
            labels={filteredData.timestamps}
            datasets={[
              {
                label: 'Original Series',
                data: filteredData.values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'SMA-7 (Short-term)',
                data: sma7,
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'SMA-14 (Medium-term)',
                data: sma14,
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'SMA-30 (Long-term)',
                data: sma30,
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'Upper Band (SMA+2σ)',
                data: upperBand,
                borderColor: 'rgba(139, 92, 246, 0.5)',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 1,
                borderDash: [5, 5]
              },
              {
                label: 'Lower Band (SMA-2σ)',
                data: lowerBand,
                borderColor: 'rgba(139, 92, 246, 0.5)',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 1,
                borderDash: [5, 5]
              }
            ]}
            title="Multi-Window Moving Averages with Bollinger Bands"
            yAxisLabel="Value"
            height={400}
          />
          <div className="chart-note">
            Bollinger Bands (SMA ± 2σ) show volatility zones. Prices outside bands indicate potential overbought/oversold conditions.
          </div>
        </div>
        
        <h3>📊 Rolling Volatility & Momentum</h3>
        <div className="chart-grid">
          <div className="chart-card">
            <LineChart
              labels={filteredData.timestamps}
              datasets={[
                {
                  label: '7-Day Rolling Std Dev',
                  data: rstd7,
                  borderColor: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  fill: true,
                  borderWidth: 2
                },
                {
                  label: '14-Day Rolling Std Dev',
                  data: rstd14,
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  fill: false,
                  borderWidth: 2
                }
              ]}
              title="Rolling Standard Deviation (Volatility)"
              yAxisLabel="Std Dev"
              height={250}
            />
          </div>
          
          <div className="chart-card">
            <LineChart
              labels={filteredData.timestamps}
              datasets={[
                {
                  label: '7-Day Momentum (%)',
                  data: momentum7,
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  fill: true,
                  borderWidth: 2
                }
              ]}
              title="Momentum (7-Day Rate of Change)"
              yAxisLabel="% Change"
              height={250}
            />
          </div>
        </div>
        
        <h3>📊 Window Size Comparison</h3>
        <div className="chart-card">
          <BarChart
            labels={windowComparison.map(w => w.window)}
            datasets={[
              {
                label: 'Rolling Mean',
                data: windowComparison.map(w => w.sma),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderWidth: 1
              },
              {
                label: 'Rolling Std Dev',
                data: windowComparison.map(w => w.std),
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderWidth: 1
              }
            ]}
            title="Rolling Statistics by Window Size"
            yAxisLabel="Value"
            height={250}
          />
        </div>
      </div>
      
      {/* Lag Features Analysis */}
      <div className="lag-section">
        <h3>🔄 Lag Features Analysis</h3>
        <div className="lag-grid">
          <div className="lag-card">
            <div className="lag-header">
              <strong>Lag-1 (Previous Day)</strong>
              <div className="lag-badge">t-1</div>
            </div>
            <div className="lag-description">
              Most recent historical value. High correlation with current value indicates strong autocorrelation and persistence in the time series.
            </div>
            <div className="lag-formula">
              <code>x_t-1 = {(lag1.filter(v => v !== null).slice(-1)[0] || 0).toFixed(2)}</code>
            </div>
          </div>
          
          <div className="lag-card">
            <div className="lag-header">
              <strong>Lag-7 (Last Week)</strong>
              <div className="lag-badge">t-7</div>
            </div>
            <div className="lag-description">
              Weekly seasonal pattern. Important for capturing day-of-week effects in demand forecasting and procurement planning.
            </div>
            <div className="lag-formula">
              <code>x_t-7 = {(lag7.filter(v => v !== null).slice(-1)[0] || 0).toFixed(2)}</code>
            </div>
          </div>
          
          <div className="lag-card">
            <div className="lag-header">
              <strong>Rolling Min/Max (7-day)</strong>
              <div className="lag-badge">Range</div>
            </div>
            <div className="lag-description">
              Captures local extremes. Range = Max - Min. Useful for identifying breakout patterns and establishing support/resistance levels.
            </div>
            <div className="lag-formula">
              <code>Range = {((rmax7.slice(-1)[0] || 0) - (rmin7.slice(-1)[0] || 0)).toFixed(2)}</code>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Machine Learning Feature Engineering Insights</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Trend Detection:</strong>
            <p>
              SMA crossovers signal trend changes: SMA-7 {currentSMA7 > currentSMA30 ? '>' : '<'} SMA-30 indicates {' '}
              {currentSMA7 > currentSMA30 ? 'upward momentum (bullish)' : 'downward momentum (bearish)'}. {' '}
              Use for dynamic reorder point adjustments - increase safety stock during uptrends, reduce during downtrends.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Volatility Management:</strong>
            <p>
              Current CV of {currentCV.toFixed(1)}% indicates {currentCV < 10 ? 'low volatility (stable demand)' : 
              currentCV < 20 ? 'moderate volatility (normal operations)' : 'high volatility (risk alert)'}. {' '}
              High CV periods require larger safety stock buffers and more frequent forecast updates.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Forecasting Strategy:</strong>
            <p>
              Lag features enable supervised ML models (XGBoost, LSTM). Use lag-1, lag-7, lag-30 as primary features. {' '}
              Add rolling statistics (SMA, std, min, max) as secondary features. Current momentum of {' '}
              {currentMomentum.toFixed(1)}% suggests {Math.abs(currentMomentum) > 5 ? 'dynamic' : 'stable'} demand patterns.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .metric-subtext {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }
        
        .metric-card p.positive {
          color: var(--color-success);
        }
        
        .metric-card p.negative {
          color: var(--color-error);
        }
        
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
        
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .chart-note {
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        
        .lag-section {
          margin: 32px 0;
        }
        
        .lag-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .lag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .lag-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .lag-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .lag-header strong {
          font-size: 14px;
          color: var(--color-primary);
        }
        
        .lag-badge {
          font-size: 11px;
          padding: 4px 8px;
          background: var(--color-primary);
          color: var(--color-bg);
          border-radius: 4px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }
        
        .lag-description {
          font-size: 12px;
          color: var(--color-text);
          line-height: 1.6;
          margin-bottom: 12px;
        }
        
        .lag-formula {
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          border-left: 3px solid var(--color-primary);
        }
        
        .lag-formula code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--color-primary);
          font-weight: 600;
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

