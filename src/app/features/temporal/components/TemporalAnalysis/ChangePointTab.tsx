/** Change Point Detection Tab */
'use client';
import React from 'react';
import { useTemporalData, useFilteredData } from '../../context/TemporalDataContext';
import { detectChangePointsCombined } from '../../utils/changePointDetection';
import { LineChart } from '../visualizations/LineChart';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function ChangePointTab() {
  const { dataset } = useTemporalData();
  const filteredData = useFilteredData();
  const result = detectChangePointsCombined(filteredData.values, filteredData.timestamps);
  
  // Create change point markers for visualization
  const changePointMarkers = filteredData.timestamps.map((ts, i) => {
    const isChangePoint = result.changePoints.some(cp => cp.timestamp === ts);
    return isChangePoint ? filteredData.values[i] : null;
  });
  
  // Regime mean lines for each regime
  const regimeDatasets = result.regimes.slice(0, 3).map((regime, idx) => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b'];
    const meanLine = filteredData.timestamps.map((ts, i) => {
      const date = new Date(ts);
      const regimeStart = new Date(regime.startDate);
      const regimeEnd = new Date(regime.endDate);
      if (date >= regimeStart && date <= regimeEnd) {
        return regime.mean;
      }
      return null;
    });
    
    return {
      label: `Regime ${idx + 1} (μ=${regime.mean.toFixed(1)})`,
      data: meanLine,
      borderColor: colors[idx],
      backgroundColor: colors[idx],
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0
    } as any;
  });
  
  return (
    <div className="tab-content">
      <h2>📍 Regime Shifts: Brazilian 5G Rollout Phases</h2>
      <p>Real operational regimes: Pre-5G (850 un/d baseline) → Phase 1 Deployment (+42%, 1210 un/d) → ANATEL Auction (+145%, 2080 un/d peak) → Mature Operations (1450 un/d normalized)</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Change Points</strong>
          <p>{result.changePoints.length}</p>
          <div className="metric-subtext">
            Significant structural breaks detected
          </div>
        </div>
        <div className="metric-card">
          <strong>Regimes</strong>
          <p>{result.regimes.length}</p>
          <div className="metric-subtext">
            Distinct operational periods
          </div>
        </div>
        <div className="metric-card">
          <strong>Largest Shift</strong>
          <p>{Math.max(...result.changePoints.map(cp => Math.abs(cp.changeMagnitude))).toFixed(1)}%</p>
          <div className="metric-subtext">
            Maximum magnitude change
          </div>
        </div>
        <div className="metric-card">
          <strong>Avg Regime Length</strong>
          <p>{Math.round(filteredData.values.length / result.regimes.length)}d</p>
          <div className="metric-subtext">
            Average days per regime
          </div>
        </div>
      </div>
      
      {/* Detection Method Formula */}
      <FormulaDisplay 
        formula="CUSUM: S_t = max(0, S_t-1 + (x_t - mu - k))    |    PELT: min[SUM(cost) + beta×K]"
        description="Change point detection using Cumulative Sum (CUSUM) and Pruned Exact Linear Time (PELT) algorithms"
      />
      
      {/* Visualization */}
      <div className="charts-section">
        <h3>📊 Time Series with Change Points & Regimes</h3>
        <div className="chart-card">
          <LineChart
            labels={filteredData.timestamps}
            datasets={[
              {
                label: 'Original Series',
                data: filteredData.values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                borderWidth: 2
              },
              ...regimeDatasets,
              {
                label: 'Change Points',
                data: changePointMarkers,
                borderColor: '#ef4444',
                backgroundColor: '#ef4444',
                fill: false,
                borderWidth: 0,
                pointRadius: 10,
                pointStyle: 'triangle',
                pointHoverRadius: 12
              } as any
            ]}
            title="Regime Analysis: Time Series Decomposed into Stable Periods"
            yAxisLabel="Value"
            height={400}
          />
          <div className="chart-note">
            Dashed lines show regime means. Red triangles mark structural break points. Each regime represents a distinct operational period.
          </div>
        </div>
        
        <h3>📊 Regime Comparison</h3>
        <div className="chart-card">
          <BarChart
            labels={result.regimes.map((r, i) => `Regime ${i + 1}`)}
            datasets={[
              {
                label: 'Mean Value',
                data: result.regimes.map(r => r.mean),
                backgroundColor: result.regimes.map((r, i) => {
                  const colors = [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                  ];
                  return colors[i % colors.length];
                }),
                borderWidth: 1
              }
            ]}
            title="Average Value by Regime Period"
            yAxisLabel="Mean Value"
            height={250}
          />
        </div>
      </div>
      
      {/* Change Points Details */}
      <div className="changepoints-section">
        <h3>🔍 Detailed Change Point Analysis</h3>
        <div className="cp-list">
          {result.changePoints.map((cp, i) => (
            <div key={i} className={`cp-card ${Math.abs(cp.changeMagnitude) > 20 ? 'critical' : 'moderate'}`}>
              <div className="cp-header">
                <div className="cp-badge">#{i + 1}</div>
                <div className="cp-timestamp">{cp.timestamp}</div>
                <div className="cp-magnitude">
                  {cp.changeDirection === 'increase' ? '↗' : '↘'} {Math.abs(cp.changeMagnitude).toFixed(1)}%
                </div>
              </div>
              <div className="cp-details">
                <div className="cp-metric">
                  <strong>Direction:</strong> {cp.changeDirection}
                </div>
                <div className="cp-metric">
                  <strong>Confidence:</strong> {(cp.confidence * 100).toFixed(0)}%
                </div>
                <div className="cp-metric">
                  <strong>Type:</strong> {cp.changeType.replace('_', ' ')}
                </div>
              </div>
              {cp.cause && (
                <div className="cp-impact">{cp.cause}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Regime Details */}
      <div className="regimes-section">
        <h3>📊 Regime Characteristics</h3>
        <div className="regime-grid">
          {result.regimes.map((regime, i) => (
            <div key={i} className="regime-card">
              <div className="regime-header">
                <strong>Regime {i + 1}</strong>
                <div className="regime-duration">{regime.endIndex - regime.startIndex + 1} days</div>
              </div>
              <div className="regime-period">
                {regime.startDate} → {regime.endDate}
              </div>
              <div className="regime-stats">
                <div className="regime-stat">
                  <span>Mean:</span>
                  <strong>{regime.mean.toFixed(2)}</strong>
                </div>
                <div className="regime-stat">
                  <span>Std Dev:</span>
                  <strong>{regime.std.toFixed(2)}</strong>
                </div>
                <div className="regime-stat">
                  <span>Trend:</span>
                  <strong>{regime.trend || 'N/A'}</strong>
                </div>
              </div>
              {regime.characteristics && (
                <div className="regime-char">{regime.characteristics}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Business Impact & Strategic Recommendations</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>5G Rollout Regime Analysis (Nova Corrente):</strong>
            <p>
              Regime 1 (Oct &apos;23-Nov &apos;23): Pre-5G baseline, 850 un/d MATERIAL_ELETRICO, stable suppliers. {' '}
              Regime 2 (Dec &apos;23-May &apos;24): Phase 1 deployment capitais, +42% demand, Huawei/Ericsson ramping. {' '}
              Regime 3 (Jun &apos;24-Sep &apos;24): ANATEL auction surge +145%, R$ 12.5M pre-orders, lead times critical. {' '}
              Regime 4 (Oct &apos;24+): Normalized 1450 un/d, mature 5G operations, suppliers adapted.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Major Change Points ({result.changePoints.filter(cp => Math.abs(cp.changeMagnitude) > 20).length}):</strong>
            <p>
              Large magnitude shifts ({'>'}20%) require root cause analysis. Common causes: supplier changes, volume discounts kicking in, {' '}
              market disruptions, or operational improvements. Document these events for future forecasting model adjustments.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Regime-Specific Procurement Strategy (2025):</strong>
            <p>
              Current Mature 5G regime: 1450 un/d baseline, stddev 125. MATERIAL_ELETRICO safety stock 25 days sufficient. {' '}
              Watch for next change point triggers: ANATEL 6G pilots (potential +60% demand), New operator licenses (TIM/Claro expansion). {' '}
              Huawei lead time stable 60d, but monitor geopolitical risks. Ericsson (42d) recommended primary for MATERIAL_ELETRICO critical orders.
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
        
        .changepoints-section, .regimes-section {
          margin: 32px 0;
        }
        
        .changepoints-section h3, .regimes-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .cp-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .cp-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .cp-card.critical {
          border-left-color: var(--color-error);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .cp-card.moderate {
          border-left-color: var(--color-warning);
        }
        
        .cp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .cp-badge {
          font-size: 16px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 4px;
          background: var(--color-primary);
          color: var(--color-bg);
        }
        
        .cp-timestamp {
          flex: 1;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .cp-magnitude {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .cp-card.critical .cp-magnitude {
          color: var(--color-error);
        }
        
        .cp-details {
          display: flex;
          gap: 24px;
          margin: 8px 0;
          font-size: 12px;
        }
        
        .cp-metric strong {
          color: var(--color-text-secondary);
        }
        
        .cp-impact {
          font-size: 13px;
          color: var(--color-text);
          margin: 8px 0;
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
        }
        
        .cp-recommendation {
          font-size: 12px;
          color: var(--color-primary);
          margin-top: 8px;
          padding: 8px;
          background: rgba(32, 160, 132, 0.1);
          border-radius: 4px;
        }
        
        .regime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .regime-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .regime-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .regime-header strong {
          font-size: 16px;
          color: var(--color-primary);
        }
        
        .regime-duration {
          font-size: 12px;
          padding: 4px 8px;
          background: var(--color-primary);
          color: var(--color-bg);
          border-radius: 4px;
          font-weight: 600;
        }
        
        .regime-period {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }
        
        .regime-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 12px 0;
        }
        
        .regime-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
        }
        
        .regime-stat span {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }
        
        .regime-stat strong {
          font-size: 16px;
          color: var(--color-text);
        }
        
        .regime-char {
          font-size: 12px;
          color: var(--color-text);
          margin-top: 12px;
          padding: 8px;
          background: rgba(32, 160, 132, 0.05);
          border-radius: 4px;
          border-left: 3px solid var(--color-primary);
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

