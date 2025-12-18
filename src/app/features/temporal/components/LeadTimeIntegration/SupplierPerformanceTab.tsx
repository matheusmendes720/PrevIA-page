/** Supplier Performance Tab */
'use client';

import React from 'react';
import { useTemporalData } from '../../context/TemporalDataContext';
import { BarChart } from '../visualizations/BarChart';
import { mean } from '../../utils/temporalCalculations';

export default function SupplierPerformanceTab() {
  const { dataset } = useTemporalData();
  
  // Check if we have suppliers
  if (!dataset.suppliers || dataset.suppliers.length === 0) {
    return (
      <div className="tab-content">
        <h2>🤝 Supplier Performance Benchmarking & Analysis</h2>
        <div className="insight-card warning">
          <strong>No Supplier Data</strong>
          <p>No supplier information available for analysis.</p>
        </div>
      </div>
    );
  }
  
  // Calculate performance scores (0-100)
  const supplierScores = dataset.suppliers.map(s => ({
    name: s.name,
    score: ((1 - ((s.avgLeadTime ?? 0) / 20)) * 30 + (s.reliability ?? 0) * 40 + ((10 - (s.riskScore ?? 5)) / 10) * 30)
  }));
  
  // Sort suppliers by performance
  const sortedSuppliers = [...dataset.suppliers].sort((a, b) => 
    ((b.reliability ?? 0) - (a.reliability ?? 0))
  );
  
  // Best and worst suppliers
  const bestSupplier = sortedSuppliers[0];
  const worstSupplier = sortedSuppliers[sortedSuppliers.length - 1];
  
  // Calculate cost impact (simplified)
  const avgLeadTime = mean(dataset.suppliers.map(s => s.avgLeadTime ?? 0));
  const costSavingsBest = (avgLeadTime - (bestSupplier?.avgLeadTime ?? 0)) * 500;
  const costImpactWorst = ((worstSupplier?.avgLeadTime ?? 0) - avgLeadTime) * 500;
  
  return (
    <div className="tab-content">
      <h2>🤝 Supplier Performance Benchmarking & Analysis</h2>
      <p>Comprehensive multi-dimensional supplier comparison with performance scoring and ROI analysis</p>
      
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Best Performer</strong>
          <p>{bestSupplier?.name ?? 'N/A'}</p>
          <div className="metric-subtext">
            {((bestSupplier?.reliability ?? 0) * 100).toFixed(0)}% reliability
          </div>
        </div>
        <div className="metric-card critical">
          <strong>Needs Improvement</strong>
          <p>{worstSupplier?.name ?? 'N/A'}</p>
          <div className="metric-subtext">
            Risk score: {(worstSupplier?.riskScore ?? 0).toFixed(1)}
          </div>
        </div>
        <div className="metric-card">
          <strong>Cost Savings (Best)</strong>
          <p>R$ {(costSavingsBest * 30).toFixed(0)}K</p>
          <div className="metric-subtext">
            Monthly savings vs average
          </div>
        </div>
        <div className="metric-card warning">
          <strong>Cost Impact (Worst)</strong>
          <p>R$ {(costImpactWorst * 30).toFixed(0)}K</p>
          <div className="metric-subtext">
            Monthly excess cost
          </div>
        </div>
      </div>
      
      <div className="charts-section">
        <h3>📊 Multi-Dimensional Performance Comparison</h3>
        
        <div className="chart-card">
          <BarChart
            labels={dataset.suppliers.map(s => s.name)}
            datasets={[
              {
                label: 'Performance Score (0-100)',
                data: supplierScores.map(s => s.score),
                backgroundColor: supplierScores.map(s => 
                  s.score > 70 ? 'rgba(16, 185, 129, 0.7)' :
                  s.score > 50 ? 'rgba(59, 130, 246, 0.7)' :
                  s.score > 30 ? 'rgba(249, 115, 22, 0.7)' :
                  'rgba(239, 68, 68, 0.7)'
                ),
                borderWidth: 1
              }
            ]}
            title="Overall Performance Score (Weighted: Lead Time 30%, Reliability 40%, Risk 30%)"
            yAxisLabel="Score (0-100)"
            height={300}
          />
        </div>
        
        <div className="chart-grid">
          <div className="chart-card">
            <BarChart
              labels={dataset.suppliers.map(s => s.name)}
              datasets={[
                {
                  label: 'Lead Time Variance',
                  data: dataset.suppliers.map(s => s.leadTimeStd),
                  backgroundColor: dataset.suppliers.map(s => 
                    s.leadTimeStd < 2 ? 'rgba(16, 185, 129, 0.7)' :
                    s.leadTimeStd < 4 ? 'rgba(249, 115, 22, 0.7)' :
                    'rgba(239, 68, 68, 0.7)'
                  ),
                  borderWidth: 1
                }
              ]}
              title="Lead Time Consistency"
              yAxisLabel="Standard Deviation (days)"
              height={250}
            />
          </div>
          
          <div className="chart-card">
            <BarChart
              labels={dataset.suppliers.map(s => s.name)}
              datasets={[
                {
                  label: 'Cost per Day',
                  data: dataset.suppliers.map(s => s.avgLeadTime * 500),
                  backgroundColor: 'rgba(139, 92, 246, 0.7)',
                  borderWidth: 1
                }
              ]}
              title="Inventory Holding Cost Impact"
              yAxisLabel="Monthly Cost (R$)"
              height={250}
            />
          </div>
        </div>
        
        <h3>📈 Supplier Reliability Ranking</h3>
        <div className="chart-card">
          <BarChart
            labels={sortedSuppliers.map(s => s.name)}
            datasets={[
              {
                label: 'Reliability %',
                data: sortedSuppliers.map(s => s.reliability * 100),
                backgroundColor: sortedSuppliers.map(s => 
                  s.reliability > 0.85 ? 'rgba(16, 185, 129, 0.8)' :
                  s.reliability > 0.75 ? 'rgba(59, 130, 246, 0.8)' :
                  'rgba(239, 68, 68, 0.8)'
                ),
                borderWidth: 1
              }
            ]}
            title="Supplier Reliability (Sorted High to Low)"
            yAxisLabel="Reliability (%)"
            horizontal={true}
            height={300}
          />
        </div>
      </div>
      
      <div className="suppliers-section">
        <h3>📋 Detailed Supplier Profiles</h3>
        <div className="supplier-grid">
          {sortedSuppliers.map((supplier, i) => {
            const perfScore = supplierScores.find(s => s.name === supplier.name)?.score || 0;
            const riskScore = supplier.riskScore ?? 5;
            return (
              <div key={supplier.id} className={`supplier-card ${riskScore > 7 ? 'critical' : riskScore > 5 ? 'warning' : 'good'}`}>
                <div className="supplier-header">
                  <strong>{supplier.name}</strong>
                  <div className={`rank-badge rank-${i < 2 ? 'top' : i < 4 ? 'mid' : 'low'}`}>
                    #{i + 1}
                  </div>
                </div>
                
                <div className="supplier-metrics">
                  <div className="supplier-metric">
                    <span>Performance Score:</span>
                    <strong>{perfScore.toFixed(0)}/100</strong>
                  </div>
                  <div className="supplier-metric">
                    <span>Avg Lead Time:</span>
                    <strong>{supplier.avgLeadTime ?? 0}d ± {(supplier.leadTimeStd ?? 0).toFixed(1)}d</strong>
                  </div>
                  <div className="supplier-metric">
                    <span>Reliability:</span>
                    <strong>{((supplier.reliability ?? 0) * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="supplier-metric">
                    <span>Risk Score:</span>
                    <strong>{riskScore.toFixed(1)}/10</strong>
                  </div>
                </div>
                
                {supplier.riskScore > 7 && (
                  <div className="supplier-alert">
                    ⚠️ <strong>Action Required:</strong> High risk - consider alternative suppliers
                  </div>
                )}
                
                {supplier.reliability > 0.9 && (
                  <div className="supplier-highlight">
                    ⭐ <strong>Top Performer:</strong> Excellent reliability
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .metric-subtext {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }
        
        .charts-section {
          margin: 32px 0;
        }
        
        .charts-section h3 {
          margin: 24px 0 16px 0;
          font-size: 18px;
          font-weight: 600;
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
        
        .suppliers-section {
          margin: 32px 0;
        }
        
        .suppliers-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .supplier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }
        
        .supplier-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .supplier-card.critical {
          border-left-color: var(--color-error);
          background: rgba(239, 68, 68, 0.03);
        }
        
        .supplier-card.warning {
          border-left-color: var(--color-warning);
        }
        
        .supplier-card.good {
          border-left-color: var(--color-success);
        }
        
        .supplier-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .rank-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }
        
        .rank-badge.rank-top {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
        }
        
        .rank-badge.rank-mid {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .rank-badge.rank-low {
          background: rgba(160, 170, 184, 0.2);
          color: var(--color-text-secondary);
        }
        
        .supplier-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        
        .supplier-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .supplier-metric span {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        
        .supplier-metric strong {
          font-size: 14px;
        }
        
        .supplier-alert {
          margin-top: 12px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid var(--color-error);
          border-radius: 4px;
          font-size: 12px;
        }
        
        .supplier-highlight {
          margin-top: 12px;
          padding: 10px;
          background: rgba(16, 185, 129, 0.1);
          border-left: 3px solid var(--color-success);
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

