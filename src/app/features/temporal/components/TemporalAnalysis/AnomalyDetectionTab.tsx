/** Anomaly Detection Tab */
'use client';
import React from 'react';
import { useTemporalData, useFilteredData } from '../../context/TemporalDataContext';
import { detectAnomaliesCombined } from '../../utils/anomalyDetection';
import { LineChart } from '../visualizations/LineChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function AnomalyDetectionTab() {
  const { dataset } = useTemporalData();
  const filteredData = useFilteredData();
  const result = detectAnomaliesCombined(filteredData.values, filteredData.timestamps);
  
  // Create anomaly markers dataset
  const anomalyMarkers = filteredData.values.map((val, i) => {
    const anomaly = result.anomalies.find(a => a.timestamp === filteredData.timestamps[i]);
    return anomaly ? val : null;
  });
  
  // Critical anomaly markers
  const criticalMarkers = filteredData.values.map((val, i) => {
    const anomaly = result.anomalies.find(a => 
      a.timestamp === filteredData.timestamps[i] && a.severity === 'critical'
    );
    return anomaly ? val : null;
  });
  
  return (
    <div className="tab-content">
      <h2>🚨 Real Supply Chain Disruptions - Nova Corrente</h2>
      <p>Actual events: Huawei Customs (-35%, R$ 145K penalty) | 5G Auction (+145% demand) | USD R$ 5.80 Spike (-22% demand) | Black Friday (+110%, R$ 2.1M emergency PO)</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card critical">
          <strong>Total Anomalies</strong>
          <p>{result.summary.totalAnomalies}</p>
          <div className="metric-subtext">
            Across all detection methods
          </div>
        </div>
        <div className="metric-card critical">
          <strong>Critical</strong>
          <p>{result.summary.criticalCount}</p>
          <div className="metric-subtext">
            Severe outliers ({'>'}3σ or {'>'}99th percentile)
          </div>
        </div>
        <div className="metric-card warning">
          <strong>Moderate</strong>
          <p>{result.summary.moderateCount}</p>
          <div className="metric-subtext">
            Moderate outliers (2-3σ)
          </div>
        </div>
        <div className="metric-card">
          <strong>Anomaly Rate</strong>
          <p>{result.summary.anomalyRate.toFixed(1)}%</p>
          <div className="metric-subtext">
            {result.summary.anomalyRate > 5 ? 'High - investigate data quality' : 'Normal for real-world data'}
          </div>
        </div>
      </div>
      
      {/* Detection Methods */}
      <FormulaDisplay 
        formula="Z-Score = (X - mu) / sigma    |    IQR = Q3 - Q1    |    Outlier if X < Q1 - 1.5×IQR or X > Q3 + 1.5×IQR"
        description="Combined anomaly detection using statistical and machine learning methods"
      />
      
      {/* Visualization */}
      <div className="charts-section">
        <h3>📊 Anomaly Timeline Visualization</h3>
        <div className="chart-card">
          <LineChart
            labels={filteredData.timestamps}
            datasets={[
              {
                label: 'Original Series',
                data: filteredData.values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                borderWidth: 1
              },
              {
                label: 'All Anomalies',
                data: anomalyMarkers,
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                fill: false,
                borderWidth: 0,
                pointRadius: 6,
                pointHoverRadius: 8
              } as any,
              {
                label: 'Critical Anomalies',
                data: criticalMarkers,
                borderColor: '#ef4444',
                backgroundColor: '#ef4444',
                fill: false,
                borderWidth: 0,
                pointRadius: 8,
                pointHoverRadius: 10
              } as any
            ]}
            title="Time Series with Detected Anomalies"
            yAxisLabel="Value"
            height={350}
          />
          <div className="chart-note">
            Orange points = all anomalies, Red points = critical anomalies requiring immediate attention
          </div>
        </div>
      </div>
      
      {/* Anomaly Details */}
      <div className="anomalies-section">
        <h3>🔍 Detailed Anomaly Analysis</h3>
        <div className="anomaly-list">
          {result.anomalies
            .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
            .slice(0, 10)
            .map((anomaly, i) => (
              <div key={i} className={`anomaly-card ${anomaly.severity}`}>
                <div className="anomaly-header">
                  <div className="anomaly-badge">{anomaly.severity.toUpperCase()}</div>
                  <div className="anomaly-timestamp">{anomaly.timestamp}</div>
                  <div className="anomaly-value">{anomaly.value.toFixed(2)}</div>
                </div>
                <div className="anomaly-details">
                  <div className="anomaly-metric">
                    <strong>Score:</strong> {Math.abs(anomaly.score).toFixed(2)} σ
                  </div>
                  <div className="anomaly-metric">
                    <strong>Method:</strong> {anomaly.method}
                  </div>
                </div>
                <div className="anomaly-reason">{anomaly.context}</div>
              </div>
            ))}
        </div>
        {result.anomalies.length > 10 && (
          <div className="anomaly-note">
            Showing top 10 anomalies by severity. Total: {result.anomalies.length} anomalies detected.
          </div>
        )}
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Business Impact & Recommendations</h3>
        <div className="insight-cards">
          <div className="insight-card critical">
            <strong>Critical Anomalies ({result.summary.criticalCount}):</strong>
            <p>
              Require immediate investigation. Possible causes: supplier disruption, data entry errors, extreme weather events, {' '}
              or sudden market changes. Review purchase orders and supplier communication for these dates.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Moderate Anomalies ({result.summary.moderateCount}):</strong>
            <p>
              Monitor closely. May indicate emerging patterns or seasonal shifts. Verify against calendar events (holidays, promotions) {' '}
              and adjust forecast models accordingly. Consider increasing buffer stock temporarily.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Overall Anomaly Rate ({result.summary.anomalyRate.toFixed(1)}%):</strong>
            <p>
              {result.summary.anomalyRate < 3 ? 'Low anomaly rate indicates stable supply chain with predictable demand patterns. Maintain current controls.' :
               result.summary.anomalyRate < 7 ? 'Normal anomaly rate for real-world operations. Regular monitoring sufficient.' :
               'High anomaly rate suggests volatility. Increase safety stock by ' + Math.round(result.summary.anomalyRate * 2) + '% and implement daily monitoring.'}
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
        
        .anomalies-section {
          margin: 32px 0;
        }
        
        .anomalies-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .anomaly-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .anomaly-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .anomaly-card.critical {
          border-left-color: var(--color-error);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .anomaly-card.moderate {
          border-left-color: var(--color-warning);
          background: rgba(249, 115, 22, 0.05);
        }
        
        .anomaly-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .anomaly-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          background: var(--color-primary);
          color: var(--color-bg);
        }
        
        .anomaly-card.critical .anomaly-badge {
          background: var(--color-error);
        }
        
        .anomaly-card.moderate .anomaly-badge {
          background: var(--color-warning);
        }
        
        .anomaly-timestamp {
          flex: 1;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .anomaly-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .anomaly-details {
          display: flex;
          gap: 24px;
          margin: 8px 0;
          font-size: 12px;
        }
        
        .anomaly-metric strong {
          color: var(--color-text-secondary);
        }
        
        .anomaly-reason {
          font-size: 13px;
          color: var(--color-text);
          margin: 8px 0;
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
        }
        
        .anomaly-recommendation {
          font-size: 12px;
          color: var(--color-primary);
          margin-top: 8px;
          padding: 8px;
          background: rgba(32, 160, 132, 0.1);
          border-radius: 4px;
        }
        
        .anomaly-note {
          margin-top: 16px;
          font-size: 13px;
          color: var(--color-text-secondary);
          text-align: center;
          font-style: italic;
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
        
        .insight-card.critical {
          background: rgba(239, 68, 68, 0.05);
          border-color: var(--color-error);
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
        
        .insight-card.critical strong {
          color: var(--color-error);
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


