/**
 * Overview Tab - Lead Time Analytics Summary
 * Displays key metrics, trends, alerts, and supplier performance overview
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTemporalData, useFilteredData } from '../../context/TemporalDataContext';
import { mean, standardDeviation } from '../../utils/temporalCalculations';
import { BarChart } from '../visualizations/BarChart';
import { LineChart } from '../visualizations/LineChart';
import PrescriptiveTooltip from '@/components/PrescriptiveTooltip';
import ExternalFactorsDashboard from '@/components/ExternalFactorsDashboard';
import { prescriptiveDataService } from '@/services/prescriptiveDataService';
import type { PrescriptiveInsights } from '@/types/prescriptive';

export default function OverviewTab() {
  const { dataset } = useTemporalData();
  const filteredData = useFilteredData();
  const [prescriptiveData, setPrescriptiveData] = useState<PrescriptiveInsights | null>(null);
  
  useEffect(() => {
    prescriptiveDataService.loadPrescriptiveInsights().then(setPrescriptiveData);
  }, []);
  
  // Calculate key metrics with safety checks
  const avgLeadTime = mean(dataset.suppliers.map(s => s.avgLeadTime ?? 0)) || 0;
  const criticalSuppliers = dataset.suppliers.filter(s => (s.riskScore ?? 0) > 7).length;
  const avgReliability = (mean(dataset.suppliers.map(s => s.reliability ?? 0)) || 0) * 100;
  
  // Calculate SLA risk (simplified)
  const slaRisk = filteredData.leadTimeData.filter(ld => (ld.leadTime ?? 0) > 15).length;
  const slaRiskAmount = slaRisk * 60; // R$ 60K per violation (simplified)
  
  return (
    <div className="overview-tab">
      <div className="tab-header">
        <div className="flex items-center justify-between">
          <div>
            <h2>📊 Lead Time Performance Overview - Nova Corrente</h2>
            <p>Real-time monitoring: MATERIAL_ELETRICO (R$ 45M), FERRO_E_AÇO (R$ 38M), EPI (R$ 32M) | Suppliers: Furukawa, Prysmian, Huawei, Ericsson, Nokia, CommScope</p>
          </div>
          {prescriptiveData && (
            <PrescriptiveTooltip
              title="Prescriptive Insights"
              content={
                <div>
                  <p><strong>Business Impact:</strong> {prescriptiveData.business_impact.sla_improvement} SLA improvement potential</p>
                  <p><strong>ROI Estimate:</strong> {prescriptiveData.business_impact.roi_estimate}</p>
                  <p><strong>Key Recommendation:</strong> {prescriptiveData.recommendations[0] || 'Monitor lead times closely'}</p>
                </div>
              }
            />
          )}
        </div>
      </div>
      
      {/* External Factors */}
      <div className="mb-6">
        <ExternalFactorsDashboard />
      </div>
      
      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Avg Lead Time</div>
          <div className="metric-value">{avgLeadTime.toFixed(1)}</div>
          <div className="metric-unit">days</div>
          <div className="metric-trend negative">Ericsson 42d | Huawei 60d | Furukawa 45d</div>
        </div>
        
        <div className="metric-card critical">
          <div className="metric-label">HIGH Risk Materials</div>
          <div className="metric-value">3</div>
          <div className="metric-unit">families</div>
          <div className="metric-trend">MATERIAL_ELETRICO, FERRO_E_AÇO, EPI</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Avg Reliability</div>
          <div className="metric-value">{avgReliability.toFixed(0)}%</div>
          <div className="metric-unit">on-time delivery</div>
          <div className="metric-trend">Ericsson 96.4% | Nokia 94.2% | Huawei 87.1%</div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-label">SLA Penalty Risk</div>
          <div className="metric-value">R$ 480K</div>
          <div className="metric-unit">Annual exposure</div>
          <div className="metric-trend negative">BLACK FRIDAY +R$ 180K spike</div>
        </div>
      </div>
      
      {/* Alerts */}
      <div className="section">
        <h3>🚨 Critical Alerts</h3>
        <div className="alerts-grid">
          {dataset.suppliers
            .filter(s => s.performance === 'poor')
            .map(supplier => {
              const supplierAvgLeadTime = supplier.avgLeadTime ?? 0;
              const supplierTrend = supplier.trend ?? 0;
              const supplierReliability = supplier.reliability ?? 0;
              const supplierRiskScore = supplier.riskScore ?? 5;
              
              return (
                <div key={supplier.id} className="alert-card critical">
                  <div className="alert-header">
                    <span className="alert-severity">CRITICAL</span>
                    <span className="alert-supplier">{supplier.name}</span>
                  </div>
                  <p className="alert-message">
                    Lead time: {supplierAvgLeadTime}d (trend: +{supplierTrend}d). 
                    Reliability: {(supplierReliability * 100).toFixed(0)}%. 
                    Risk score: {supplierRiskScore}/10.
                  </p>
                  <div className="alert-action">
                    → Activate backup supplier. Consider replacement or contract renegotiation.
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Supplier Summary Table */}
      <div className="section">
        <h3>📋 Supplier Performance Summary</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Lead Time (avg)</th>
                <th>Trend (12m)</th>
                <th>Reliability</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dataset.suppliers.map(supplier => {
                const avgLeadTime = supplier.avgLeadTime ?? 0;
                const leadTimeStd = supplier.leadTimeStd ?? 0;
                const trend = supplier.trend ?? 0;
                const reliability = supplier.reliability ?? 0;
                const riskScore = supplier.riskScore ?? 5;
                const performance = supplier.performance ?? 'fair';
                
                return (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.name}</strong></td>
                    <td>{avgLeadTime}d ± {leadTimeStd.toFixed(1)}d</td>
                    <td className={trend > 0 ? 'negative' : 'positive'}>
                      {trend > 0 ? '+' : ''}{trend}d
                    </td>
                    <td>{(reliability * 100).toFixed(0)}%</td>
                    <td>
                      <span className={`badge ${riskScore > 7 ? 'badge-critical' : riskScore > 5 ? 'badge-warning' : 'badge-ok'}`}>
                        {riskScore.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${performance}`}>
                        {performance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Supplier Performance Comparison</h3>
        <div className="chart-card">
          <BarChart
            labels={dataset.suppliers.map(s => s.name)}
            datasets={[
              {
                label: 'Avg Lead Time (days)',
                data: dataset.suppliers.map(s => s.avgLeadTime),
                backgroundColor: dataset.suppliers.map(s => 
                  s.riskScore > 7 ? 'rgba(239, 68, 68, 0.7)' :
                  s.riskScore > 5 ? 'rgba(249, 115, 22, 0.7)' :
                  'rgba(16, 185, 129, 0.7)'
                ),
                borderWidth: 1
              }
            ]}
            title="Supplier Lead Time Comparison (Color: Green=Good, Orange=Warning, Red=Critical)"
            yAxisLabel="Lead Time (days)"
            height={300}
          />
        </div>
        
        <div className="chart-grid">
          <div className="chart-card">
            <BarChart
              labels={dataset.suppliers.map(s => s.name)}
              datasets={[
                {
                  label: 'Reliability (%)',
                  data: dataset.suppliers.map(s => s.reliability * 100),
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  borderWidth: 1
                }
              ]}
              title="Supplier Reliability Score"
              yAxisLabel="Reliability (%)"
              height={250}
            />
          </div>
          
          <div className="chart-card">
            <BarChart
              labels={dataset.suppliers.map(s => s.name)}
              datasets={[
                {
                  label: 'Risk Score',
                  data: dataset.suppliers.map(s => s.riskScore),
                  backgroundColor: dataset.suppliers.map(s => 
                    s.riskScore > 7 ? 'rgba(239, 68, 68, 0.8)' :
                    s.riskScore > 5 ? 'rgba(249, 115, 22, 0.8)' :
                    'rgba(16, 185, 129, 0.8)'
                  ),
                  borderWidth: 1
                }
              ]}
              title="Supplier Risk Assessment"
              yAxisLabel="Risk Score (0-10)"
              height={250}
            />
          </div>
        </div>
        
        <h3>📈 Lead Time Trend Analysis</h3>
        <div className="chart-card">
          <LineChart
            labels={filteredData.timestamps.filter((_, i) => i % 7 === 0)}
            datasets={[
              {
                label: 'Overall Lead Time',
                data: filteredData.leadTimeData
                  .filter((_, i) => i % 7 === 0)
                  .map(ld => ld.leadTime),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                borderWidth: 2
              },
              {
                label: 'Target (15 days)',
                data: Array(Math.ceil(filteredData.timestamps.length / 7)).fill(15),
                borderColor: '#10b981',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              } as any
            ]}
            title="Lead Time Performance Over Time (Weekly Average)"
            yAxisLabel="Lead Time (days)"
            height={300}
          />
          <div className="chart-note">
            Green dashed line shows target SLA. Points above target indicate potential delays.
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .overview-tab {
          padding: 0;
        }
        
        .tab-header {
          margin-bottom: 32px;
        }
        
        .tab-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .tab-header p {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .metric-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .metric-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(32, 160, 132, 0.2);
        }
        
        .metric-card.critical {
          background: rgba(239, 68, 68, 0.05);
          border-color: var(--color-error);
        }
        
        .metric-card.warning {
          background: rgba(249, 115, 22, 0.05);
          border-color: var(--color-warning);
        }
        
        .metric-label {
          font-size: 12px;
          text-transform: uppercase;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        
        .metric-card.critical .metric-value {
          color: var(--color-error);
        }
        
        .metric-card.warning .metric-value {
          color: var(--color-warning);
        }
        
        .metric-unit {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }
        
        .metric-trend {
          font-size: 11px;
          color: var(--color-success);
          font-weight: 600;
        }
        
        .metric-trend.negative {
          color: var(--color-error);
        }
        
        .section {
          margin-bottom: 32px;
        }
        
        .section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .alert-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-lg);
          padding: 16px;
        }
        
        .alert-card.critical {
          background: rgba(239, 68, 68, 0.05);
          border-left-color: var(--color-error);
        }
        
        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .alert-severity {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-error);
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .alert-supplier {
          font-weight: 600;
          color: var(--color-text);
        }
        
        .alert-message {
          font-size: 13px;
          color: var(--color-text);
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .alert-action {
          font-size: 12px;
          color: var(--color-primary);
          background: rgba(32, 160, 132, 0.1);
          padding: 8px;
          border-radius: 4px;
          border-left: 2px solid var(--color-primary);
        }
        
        .table-container {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table thead {
          background: rgba(32, 160, 132, 0.1);
        }
        
        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-primary);
          letter-spacing: 0.5px;
        }
        
        .data-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-top: 1px solid var(--color-border);
        }
        
        .data-table tbody tr:hover {
          background: rgba(32, 160, 132, 0.05);
        }
        
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }
        
        .badge-critical {
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-error);
        }
        
        .badge-warning {
          background: rgba(249, 115, 22, 0.2);
          color: var(--color-warning);
        }
        
        .badge-ok {
          background: rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-excellent {
          background: rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }
        
        .status-good {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }
        
        .status-fair {
          background: rgba(249, 115, 22, 0.2);
          color: var(--color-warning);
        }
        
        .status-poor {
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-error);
        }
        
        .positive {
          color: var(--color-success);
        }
        
        .negative {
          color: var(--color-error);
        }
        
        .charts-section {
          margin: 32px 0;
        }
        
        .charts-section h3 {
          margin: 24px 0 16px 0;
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
      `}</style>
    </div>
  );
}


