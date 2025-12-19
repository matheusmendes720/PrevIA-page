/** Autocorrelation Analysis Tab */
'use client';
import React from 'react';
import { useFilteredData } from '../../context/TemporalDataContext';
import { calculateACF, calculatePACF, acfConfidenceInterval } from '../../utils/temporalCalculations';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function AutocorrelationTab() {
  const filteredData = useFilteredData();
  const maxLag = 30;
  
  // Check if we have enough data
  if (!filteredData.values || filteredData.values.length < maxLag + 1) {
    return (
      <div className="tab-content">
        <h2>📉 ACF/PACF: Telecom Procurement Cycles - Nova Corrente</h2>
        <div className="insight-card warning">
          <strong>Insufficient Data</strong>
          <p>Not enough data points for autocorrelation analysis. Need at least {maxLag + 1} data points, but only have {filteredData.values?.length || 0}.</p>
        </div>
      </div>
    );
  }
  
  const acf = calculateACF(filteredData.values, maxLag);
  const pacf = calculatePACF(filteredData.values, maxLag);
  const confidenceInterval = acfConfidenceInterval(filteredData.values.length);
  
  // Safety check for ACF/PACF results
  if (!acf || !pacf || acf.length < maxLag + 1 || pacf.length < maxLag + 1) {
    return (
      <div className="tab-content">
        <h2>📉 ACF/PACF: Telecom Procurement Cycles - Nova Corrente</h2>
        <div className="insight-card warning">
          <strong>Calculation Error</strong>
          <p>Unable to calculate autocorrelation functions. Please check the data quality.</p>
        </div>
      </div>
    );
  }
  
  // Identify significant lags
  const significantACF = acf
    .map((val, lag) => ({ lag, val }))
    .filter(({ val, lag }) => lag > 0 && val !== undefined && Math.abs(val) > confidenceInterval)
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
    .slice(0, 5);
  
  const significantPACF = pacf
    .map((val, lag) => ({ lag, val }))
    .filter(({ val, lag }) => lag > 0 && val !== undefined && Math.abs(val) > confidenceInterval)
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
    .slice(0, 5);
  
  // Create bar colors based on significance
  const acfColors = acf.map((val, i) => 
    val !== undefined && Math.abs(val) > confidenceInterval ? 
      (val > 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)') :
      'rgba(160, 170, 184, 0.5)'
  );
  
  const pacfColors = pacf.map((val, i) => 
    val !== undefined && Math.abs(val) > confidenceInterval ? 
      (val > 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(249, 115, 22, 0.7)') :
      'rgba(160, 170, 184, 0.5)'
  );
  
  return (
    <div className="tab-content">
      <h2>📉 ACF/PACF: Telecom Procurement Cycles - Nova Corrente</h2>
      <p>Identify lag dependencies, seasonal patterns, and optimal ARIMA parameters</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>ACF(1)</strong>
          <p>{(acf[1] ?? 0).toFixed(3)}</p>
          <div className="metric-subtext">
            {acf[1] !== undefined && Math.abs(acf[1]) > confidenceInterval ? 'Significant 1-day lag' : 'Not significant'}
          </div>
        </div>
        <div className="metric-card">
          <strong>ACF(7)</strong>
          <p>{(acf[7] ?? 0).toFixed(3)}</p>
          <div className="metric-subtext">
            {acf[7] !== undefined && Math.abs(acf[7]) > confidenceInterval ? 'Weekly pattern detected' : 'No weekly pattern'}
          </div>
        </div>
        <div className="metric-card">
          <strong>PACF(1)</strong>
          <p>{(pacf[1] ?? 0).toFixed(3)}</p>
          <div className="metric-subtext">
            {pacf[1] !== undefined && Math.abs(pacf[1]) > confidenceInterval ? 'AR(1) component' : 'No AR(1)'}
          </div>
        </div>
        <div className="metric-card">
          <strong>Confidence Band</strong>
          <p>±{confidenceInterval.toFixed(3)}</p>
          <div className="metric-subtext">95% significance threshold</div>
        </div>
      </div>
      
      {/* Formulas */}
      <div className="formula-section">
        <FormulaDisplay 
          formula="rho(k) = Cov(X_t, X_t-k) / Var(X_t)"
          description="Autocorrelation Function (ACF): Correlation between series and its lagged values"
        />
        <FormulaDisplay 
          formula="phi_kk = Corr(X_t, X_t-k | X_t-1, ..., X_t-k+1)"
          description="Partial Autocorrelation Function (PACF): Correlation controlling for intermediate lags"
        />
      </div>
      
      {/* Charts */}
      <div className="charts-section">
        <h3>📊 ACF Plot</h3>
        <div className="chart-card">
          <BarChart
            labels={Array.from({ length: maxLag + 1 }, (_, i) => `${i}`)}
            datasets={[
              {
                label: 'ACF',
                data: acf,
                backgroundColor: acfColors,
                borderColor: acfColors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
              }
            ]}
            title="Autocorrelation Function (ACF)"
            yAxisLabel="Correlation"
            height={300}
          />
          <div className="chart-note">
            Green bars indicate significant positive correlation, red bars indicate significant negative correlation.
            Confidence bands: ±{confidenceInterval.toFixed(3)} (95% level)
          </div>
        </div>
        
        <h3>📊 PACF Plot</h3>
        <div className="chart-card">
          <BarChart
            labels={Array.from({ length: maxLag + 1 }, (_, i) => `${i}`)}
            datasets={[
              {
                label: 'PACF',
                data: pacf,
                backgroundColor: pacfColors,
                borderColor: pacfColors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
              }
            ]}
            title="Partial Autocorrelation Function (PACF)"
            yAxisLabel="Partial Correlation"
            height={300}
          />
          <div className="chart-note">
            Blue bars indicate significant positive partial correlation, orange bars indicate significant negative partial correlation.
          </div>
        </div>
      </div>
      
      {/* Significant Lags */}
      <div className="insights-section">
        <h3>🔍 Significant Lags & Interpretation</h3>
        
        <div className="lag-analysis">
          <div className="lag-column">
            <h4>Significant ACF Lags</h4>
            {significantACF.length > 0 ? (
              <ul>
                {significantACF.map(({ lag, val }) => (
                  <li key={lag}>
                    <strong>Lag {lag}:</strong> {val.toFixed(3)} - {interpretLag(lag)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No significant autocorrelation detected beyond confidence bands.</p>
            )}
          </div>
          
          <div className="lag-column">
            <h4>Significant PACF Lags</h4>
            {significantPACF.length > 0 ? (
              <ul>
                {significantPACF.map(({ lag, val }) => (
                  <li key={lag}>
                    <strong>Lag {lag}:</strong> {val.toFixed(3)} - Suggests AR({lag}) component
                  </li>
                ))}
              </ul>
            ) : (
              <p>No significant partial autocorrelation detected.</p>
            )}
          </div>
        </div>
        
        {/* Business Recommendations */}
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Forecast Horizon:</strong>
            <p>
              High ACF at lag 1 ({(acf[1] ?? 0).toFixed(2)}) indicates strong day-to-day dependency. {' '}
              Short-term forecasts (1-3 days) will be highly accurate. Use for tactical procurement decisions.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Seasonality Detection:</strong>
            <p>
              {Math.abs(acf[7]) > confidenceInterval || Math.abs(acf[14]) > confidenceInterval || Math.abs(acf[30]) > confidenceInterval ?
                `Weekly/monthly cycles detected. Adjust inventory buffers to accommodate ${Math.round(Math.abs(acf[7]) * 100)}% weekly variation.` :
                'No strong weekly/monthly seasonality detected in ACF. Demand is relatively stable week-to-week.'}
            </p>
          </div>
          
          <div className="insight-card">
            <strong>ARIMA Model Suggestion:</strong>
            <p>
              Based on ACF/PACF patterns, consider ARIMA({significantPACF.length > 0 ? Math.min(...significantPACF.map(s => s.lag)) : 0}, 0, {significantACF.length > 0 ? Math.min(3, significantACF.filter(s => s.lag < 10).length) : 0}) {' '}
              for time series forecasting. {significantPACF.length > 0 ? `Strong AR component at lag ${significantPACF[0].lag}.` : ''}
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .formula-section {
          margin: 24px 0;
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
        
        .insights-section {
          margin: 32px 0;
        }
        
        .insights-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .lag-analysis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .lag-column h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-primary);
        }
        
        .lag-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .lag-column li {
          padding: 8px 12px;
          background: var(--color-surface);
          border-left: 3px solid var(--color-primary);
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .lag-column li strong {
          color: var(--color-primary);
          margin-right: 8px;
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
        
        .insight-card strong {
          display: block;
          color: var(--color-primary);
          margin-bottom: 8px;
          font-size: 14px;
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

// Helper function to interpret lag meaning
function interpretLag(lag: number): string {
  if (lag === 1) return 'Strong day-to-day dependency';
  if (lag === 7) return 'Weekly seasonality (7-day cycle)';
  if (lag === 14) return 'Bi-weekly pattern';
  if (lag >= 28 && lag <= 31) return 'Monthly seasonality (~30-day cycle)';
  if (lag >= 89 && lag <= 92) return 'Quarterly pattern (~90-day cycle)';
  if (lag >= 360 && lag <= 370) return 'Annual seasonality';
  return `${lag}-day lag dependency`;
}


