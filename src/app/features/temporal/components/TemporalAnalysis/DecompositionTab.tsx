/** Time Series Decomposition Tab */
'use client';
import React, { useState, useEffect } from 'react';
import { useFilteredData } from '../../context/TemporalDataContext';
import { stlDecomposition } from '../../utils/decomposition';
import { LineChart } from '../visualizations/LineChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';
import PrescriptiveTooltip from '@/components/PrescriptiveTooltip';
import { prescriptiveDataService } from '@/services/prescriptiveDataService';
import type { ComprehensivePrescriptive } from '@/types/prescriptive';

export default function DecompositionTab() {
  const filteredData = useFilteredData();
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensivePrescriptive | null>(null);
  
  useEffect(() => {
    prescriptiveDataService.loadComprehensivePrescriptive().then(setComprehensiveData);
  }, []);
  
  // Check if we have enough data
  if (!filteredData.values || filteredData.values.length < 14) {
    return (
      <div className="tab-content">
        <h2>🔬 MATERIAL_ELETRICO Decomposition (STL) - Nova Corrente</h2>
        <div className="insight-card warning">
          <strong>Insufficient Data</strong>
          <p>Need at least 14 data points (2 weeks) for decomposition analysis, but only have {filteredData.values?.length || 0}.</p>
        </div>
      </div>
    );
  }
  
  // Perform decomposition
  const decomposition = stlDecomposition(
    filteredData.values,
    7, // weekly period
    filteredData.timestamps
  );
  
  // Provide defaults if decomposition fails
  const trendStrength = decomposition?.trendStrength ?? 0;
  const seasonalStrength = decomposition?.seasonalStrength ?? 0;
  const residualVariance = decomposition?.residualVariance ?? 0;
  const seasonalPeriod = decomposition?.seasonalPeriod ?? 7;
  
  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2>🔬 MATERIAL_ELETRICO Decomposition (STL) - Nova Corrente</h2>
          <p>Trend: 5G rollout +12.5% YoY (R$ 45M revenue) | Seasonal: Q4 peak +45% (Black Friday, Christmas) | Residuals: Huawei delays, USD shocks, customs issues</p>
        </div>
        {comprehensiveData && (
          <PrescriptiveTooltip
            title="Decomposition Prescriptive Insights"
            content={
              <div>
                <p><strong>Model:</strong> {comprehensiveData.best_model}</p>
                <p><strong>R²:</strong> {(comprehensiveData.model_performance.r2 * 100).toFixed(1)}%</p>
                <p><strong>MAPE:</strong> {(comprehensiveData.model_performance.mape * 100).toFixed(1)}%</p>
                <p><strong>Recommendation:</strong> {comprehensiveData.recommendations.frequency?.recommended_action || 'Monitor trends closely'}</p>
              </div>
            }
          />
        )}
      </div>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Trend Strength</strong>
          <p>{(trendStrength * 100).toFixed(1)}%</p>
          <div className="metric-subtext">
            {trendStrength > 0.7 ? 'Strong trend' : trendStrength > 0.4 ? 'Moderate trend' : 'Weak trend'}
          </div>
        </div>
        <div className="metric-card">
          <strong>Seasonal Strength</strong>
          <p>{(seasonalStrength * 100).toFixed(1)}%</p>
          <div className="metric-subtext">
            {seasonalStrength > 0.7 ? 'Strong seasonality' : seasonalStrength > 0.4 ? 'Moderate seasonality' : 'Weak seasonality'}
          </div>
        </div>
        <div className="metric-card">
          <strong>Residual Variance</strong>
          <p>{residualVariance.toFixed(2)}</p>
          <div className="metric-subtext">
            {residualVariance < 20 ? 'Good fit' : 'High unexplained variance'}
          </div>
        </div>
        <div className="metric-card">
          <strong>Seasonal Period</strong>
          <p>{seasonalPeriod}d</p>
          <div className="metric-subtext">Weekly cycle</div>
        </div>
      </div>
      
      {/* Decomposition Formula */}
      <FormulaDisplay 
        formula="Y(t) = T(t) + S(t) + R(t)"
        description="Additive model: Observed = Trend + Seasonal + Residual"
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Decomposition Components</h3>
        
        <div className="chart-card">
          <LineChart
            labels={decomposition.timestamps}
            datasets={[
              {
                label: 'Original Series',
                data: decomposition.original,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
              }
            ]}
            title="Original Time Series"
            yAxisLabel="Value"
            height={200}
          />
        </div>
        
        <div className="chart-card">
          <LineChart
            labels={decomposition.timestamps}
            datasets={[
              {
                label: 'Trend Component',
                data: decomposition.trend,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                borderWidth: 2
              }
            ]}
            title="Trend Component (Long-term Direction)"
            yAxisLabel="Trend"
            height={200}
          />
        </div>
        
        <div className="chart-card">
          <LineChart
            labels={decomposition.timestamps}
            datasets={[
              {
                label: 'Seasonal Component',
                data: decomposition.seasonal,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true
              }
            ]}
            title="Seasonal Component (Repeating Patterns)"
            yAxisLabel="Seasonal Effect"
            height={200}
          />
        </div>
        
        <div className="chart-card">
          <LineChart
            labels={decomposition.timestamps}
            datasets={[
              {
                label: 'Residual Component',
                data: decomposition.residual,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                borderWidth: 1
              }
            ]}
            title="Residual Component (Unexplained Variance)"
            yAxisLabel="Residuals"
            height={200}
          />
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Business Insights</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Trend Impact:</strong>
            <p>
              The {decomposition.trendStrength > 0.7 ? 'strong' : 'moderate'} trend component ({(decomposition.trendStrength * 100).toFixed(0)}%) indicates {' '}
              systematic growth in demand. Consider adjusting reorder points by {Math.round(decomposition.trendStrength * 15)}% to account for growth trajectory.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Seasonal Planning:</strong>
            <p>
              Seasonal strength of {(decomposition.seasonalStrength * 100).toFixed(0)}% means demand fluctuates predictably. {' '}
              Plan inventory buffers to accommodate {Math.round(decomposition.seasonalStrength * 40)}% seasonal variation.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Residual Analysis:</strong>
            <p>
              Residual variance of {decomposition.residualVariance.toFixed(1)} {decomposition.residualVariance > 25 ? 'is high - ' +
              'investigate unexplained spikes which may indicate supplier issues or external shocks.' : 'indicates good model fit - ' +
              'most variance is explained by trend and seasonality.'}
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .charts-section {
          margin: 32px 0;
        }
        
        .charts-section h3 {
          margin: 0 0 16px 0;
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


