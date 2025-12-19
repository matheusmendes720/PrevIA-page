/** Forecast & Reorder Point Calculator Tab */
'use client';
import React, { useState } from 'react';
import { useTemporalData, useFilteredData } from '../../context/TemporalDataContext';
import { mean, standardDeviation } from '../../utils/temporalCalculations';
import { LineChart } from '../visualizations/LineChart';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function ForecastReorderTab() {
  const { dataset } = useTemporalData();
  const filteredData = useFilteredData();
  
  // Interactive calculator state
  const [serviceLevelTarget, setServiceLevelTarget] = useState(95);
  const [leadTimeDays, setLeadTimeDays] = useState(30);
  const [currentInventory, setCurrentInventory] = useState(5000);
  
  // Calculate demand statistics
  const avgDailyDemand = mean(filteredData.values);
  const demandStdDev = standardDeviation(filteredData.values);
  
  // Z-scores for different service levels
  const zScoreMap: { [key: number]: number } = {
    90: 1.28,
    95: 1.65,
    97: 1.88,
    99: 2.33,
    99.5: 2.58
  };
  
  const zScore = zScoreMap[serviceLevelTarget] || 1.65;
  
  // Reorder Point Formula: PP = D×L + SS
  // where SS = Z × σ_demand × √L
  const safetyStock = zScore * demandStdDev * Math.sqrt(leadTimeDays);
  const reorderPoint = avgDailyDemand * leadTimeDays + safetyStock;
  
  // Days until reorder point
  const daysUntilReorder = (currentInventory - reorderPoint) / avgDailyDemand;
  const reorderStatus = daysUntilReorder < 0 ? 'CRITICAL' : daysUntilReorder < 7 ? 'WARNING' : 'OK';
  
  // Stock depletion projection
  const depletionDays = currentInventory / avgDailyDemand;
  const depletionProjection = Array.from({ length: Math.ceil(depletionDays) + 1 }, (_, i) => {
    const projectedStock = Math.max(0, currentInventory - avgDailyDemand * i);
    return {
      day: i,
      stock: projectedStock,
      isReorderPoint: projectedStock <= reorderPoint && projectedStock > reorderPoint - avgDailyDemand
    };
  });
  
  // Service level comparison
  const serviceLevels = [90, 95, 97, 99, 99.5];
  const serviceLevelComparison = serviceLevels.map(sl => {
    const z = zScoreMap[sl];
    const ss = z * demandStdDev * Math.sqrt(leadTimeDays);
    const pp = avgDailyDemand * leadTimeDays + ss;
    return {
      serviceLevel: `${sl}%`,
      safetyStock: ss,
      reorderPoint: pp,
      inventoryCost: ss * 50 // Assume R$50 per unit
    };
  });
  
  // Lead time sensitivity analysis
  const leadTimeSensitivity = [15, 30, 45, 60].map(lt => {
    const ss = zScore * demandStdDev * Math.sqrt(lt);
    const pp = avgDailyDemand * lt + ss;
    return {
      leadTime: `${lt}d`,
      reorderPoint: pp,
      safetyStock: ss
    };
  });
  
  // Calculate stockout risk
  const stockoutProbability = 100 - serviceLevelTarget;
  const expectedStockouts = (stockoutProbability / 100) * 365; // Per year
  const stockoutCost = expectedStockouts * avgDailyDemand * 200; // Assume R$200 penalty per unit
  
  return (
    <div className="tab-content">
      <h2>📈 Reorder Point Calculator - Material Families</h2>
      <p>Real Nova Corrente targets: MATERIAL_ELETRICO (25d safety stock, 2.23x multiplier), FERRO_E_AÇO (26d, 2.27x), EPI (25d, 2.20x) | Calculator uses real demand μ={avgDailyDemand.toFixed(0)} un/d, σ={demandStdDev.toFixed(1)}</p>
      
      {/* Interactive Calculator */}
      <div className="calculator-section">
        <h3>🎛️ Interactive Reorder Point Calculator</h3>
        <div className="calculator-card">
          <div className="calculator-inputs">
            <div className="input-group">
              <label>Service Level Target (%):</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="90"
                  max="99"
                  step="1"
                  value={serviceLevelTarget}
                  onChange={(e) => setServiceLevelTarget(Number(e.target.value))}
                />
                <span className="slider-value">{serviceLevelTarget}%</span>
              </div>
            </div>
            
            <div className="input-group">
              <label>Lead Time (days):</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                />
                <span className="slider-value">{leadTimeDays} days</span>
              </div>
            </div>
            
            <div className="input-group">
              <label>Current Inventory (units):</label>
              <input
                type="number"
                min="0"
                step="100"
                value={currentInventory}
                onChange={(e) => setCurrentInventory(Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>
          
          <div className="calculator-results">
            <div className={`result-card ${reorderStatus.toLowerCase()}`}>
              <div className="result-label">Reorder Point (PP)</div>
              <div className="result-value">{reorderPoint.toFixed(0)} units</div>
              <div className="result-formula">D×L + SS = {(avgDailyDemand * leadTimeDays).toFixed(0)} + {safetyStock.toFixed(0)}</div>
            </div>
            
            <div className="result-card">
              <div className="result-label">Safety Stock (SS)</div>
              <div className="result-value">{safetyStock.toFixed(0)} units</div>
              <div className="result-formula">Z×σ×√L = {zScore}×{demandStdDev.toFixed(1)}×√{leadTimeDays}</div>
            </div>
            
            <div className={`result-card ${reorderStatus.toLowerCase()}`}>
              <div className="result-label">Days Until Reorder</div>
              <div className="result-value">
                {daysUntilReorder >= 0 ? `${daysUntilReorder.toFixed(1)}d` : 'OVERDUE'}
              </div>
              <div className={`result-status ${reorderStatus.toLowerCase()}`}>
                {reorderStatus === 'CRITICAL' && '🚨 URGENT: Order immediately!'}
                {reorderStatus === 'WARNING' && '⚠️ WARNING: Order within 7 days'}
                {reorderStatus === 'OK' && '✅ OK: Sufficient buffer'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formula Display */}
      <FormulaDisplay 
        formula="PP = D × L + SS    where    SS = Z_alpha × sigma_demand × sqrt(L)"
        description="Reorder Point (PP) = Daily Demand × Lead Time + Safety Stock. Safety Stock covers demand variability during lead time at target service level."
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Stock Depletion Timeline</h3>
        <div className="chart-card">
          <LineChart
            labels={depletionProjection.map(p => `Day ${p.day}`)}
            datasets={[
              {
                label: 'Projected Stock Level',
                data: depletionProjection.map(p => p.stock),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                borderWidth: 3
              },
              {
                label: 'Reorder Point',
                data: depletionProjection.map(() => reorderPoint),
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [10, 5]
              } as any,
              {
                label: 'Zero Stock',
                data: depletionProjection.map(() => 0),
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [5, 5]
              }
            ]}
            title={`Stock Depletion: ${depletionDays.toFixed(1)} Days to Stockout`}
            yAxisLabel="Units"
            height={350}
          />
          <div className="chart-note">
            Current trajectory shows stock hitting reorder point in {Math.abs(daysUntilReorder).toFixed(1)} days. {' '}
            Complete stockout projected in {depletionDays.toFixed(1)} days at current consumption rate.
          </div>
        </div>
        
        <h3>📊 Service Level Trade-offs</h3>
        <div className="chart-card">
          <BarChart
            labels={serviceLevelComparison.map(s => s.serviceLevel)}
            datasets={[
              {
                label: 'Reorder Point (units)',
                data: serviceLevelComparison.map(s => s.reorderPoint),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderWidth: 1
              } as any,
              {
                label: 'Inventory Cost (R$)',
                data: serviceLevelComparison.map(s => s.inventoryCost),
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderWidth: 1
              } as any
            ]}
            title="Service Level vs Inventory Investment"
            yAxisLabel="Units / Cost"
            height={300}
          />
          <div className="chart-note">
            Higher service levels require more safety stock. Current {serviceLevelTarget}% service level costs {' '}
            R$ {(safetyStock * 50).toLocaleString('pt-BR')} in safety stock inventory.
          </div>
        </div>
        
        <h3>📊 Lead Time Sensitivity Analysis</h3>
        <div className="chart-card">
          <BarChart
            labels={leadTimeSensitivity.map(l => l.leadTime)}
            datasets={[
              {
                label: 'Reorder Point',
                data: leadTimeSensitivity.map(l => l.reorderPoint),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderWidth: 1
              },
              {
                label: 'Safety Stock',
                data: leadTimeSensitivity.map(l => l.safetyStock),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderWidth: 1
              }
            ]}
            title="Impact of Lead Time on Reorder Point"
            yAxisLabel="Units"
            height={300}
          />
        </div>
      </div>
      
      {/* Risk Analysis */}
      <div className="risk-section">
        <h3>⚠️ Stockout Risk Analysis</h3>
        <div className="risk-grid">
          <div className="risk-card">
            <div className="risk-header">
              <strong>Stockout Probability</strong>
              <div className="risk-value">{stockoutProbability.toFixed(1)}%</div>
            </div>
            <p>
              With {serviceLevelTarget}% service level, there&apos;s a {stockoutProbability}% chance of stockout during lead time. {' '}
              This translates to ~{expectedStockouts.toFixed(0)} stockout events per year.
            </p>
          </div>
          
          <div className="risk-card warning">
            <div className="risk-header">
              <strong>Expected Stockout Cost</strong>
              <div className="risk-value">R$ {stockoutCost.toLocaleString('pt-BR')}</div>
            </div>
            <p>
              Annual cost of stockouts including SLA penalties, emergency orders, and lost sales. {' '}
              Increasing service level to 99% would reduce this by R$ {(stockoutCost * 0.6).toLocaleString('pt-BR')}.
            </p>
          </div>
          
          <div className="risk-card">
            <div className="risk-header">
              <strong>Optimal Order Quantity (EOQ)</strong>
              <div className="risk-value">
                {Math.sqrt((2 * avgDailyDemand * 365 * 500) / 10).toFixed(0)} units
              </div>
            </div>
            <p>
              Economic Order Quantity balances ordering costs (R$500) vs holding costs (R$10/unit/year). {' '}
              Order this quantity when inventory hits reorder point.
            </p>
          </div>
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Strategic Procurement Recommendations</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Current Status:</strong>
            <p>
              Your inventory is {currentInventory.toLocaleString()} units, {' '}
              {daysUntilReorder >= 0 ? `${daysUntilReorder.toFixed(1)} days above` : `${Math.abs(daysUntilReorder).toFixed(1)} days below`} {' '}
              the reorder point. {reorderStatus === 'CRITICAL' && '🚨 IMMEDIATE ACTION REQUIRED: Place order today!'} {' '}
              {reorderStatus === 'WARNING' && '⚠️ Order within 7 days to avoid stockout risk.'} {' '}
              {reorderStatus === 'OK' && '✅ Inventory levels are healthy. Monitor daily.'}
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Service Level Optimization:</strong>
            <p>
              Moving from 95% to 99% service level increases safety stock by {' '}
              {((zScoreMap[99] * demandStdDev * Math.sqrt(leadTimeDays) - safetyStock) / safetyStock * 100).toFixed(0)}%, {' '}
              costing an additional R$ {(((zScoreMap[99] * demandStdDev * Math.sqrt(leadTimeDays) - safetyStock) * 50)).toLocaleString('pt-BR')}, {' '}
              but saving R$ {(stockoutCost * 0.6).toLocaleString('pt-BR')} in annual stockout costs. {' '}
              ROI: {((stockoutCost * 0.6) / ((zScoreMap[99] * demandStdDev * Math.sqrt(leadTimeDays) - safetyStock) * 50) * 100).toFixed(0)}%
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Lead Time Reduction Strategy:</strong>
            <p>
              Reducing lead time from {leadTimeDays} to 15 days would cut reorder point by {' '}
              {((reorderPoint - (avgDailyDemand * 15 + zScore * demandStdDev * Math.sqrt(15))) / reorderPoint * 100).toFixed(0)}%, {' '}
              freeing R$ {((reorderPoint - (avgDailyDemand * 15 + zScore * demandStdDev * Math.sqrt(15))) * 50).toLocaleString('pt-BR')} {' '}
              in working capital. Negotiate with suppliers for faster delivery terms or consider local sourcing alternatives.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .calculator-section {
          margin: 24px 0;
        }
        
        .calculator-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .calculator-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        
        .calculator-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .slider-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .slider-container input[type="range"] {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: var(--color-border);
          outline: none;
          -webkit-appearance: none;
        }
        
        .slider-container input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
        }
        
        .slider-value {
          font-weight: 700;
          color: var(--color-primary);
          min-width: 60px;
          text-align: right;
        }
        
        .number-input {
          padding: 10px 12px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          color: var(--color-text);
          font-size: 14px;
          font-weight: 600;
        }
        
        .calculator-results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .result-card {
          background: var(--color-bg);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .result-card.warning {
          border-color: var(--color-warning);
        }
        
        .result-card.critical {
          border-color: var(--color-error);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .result-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }
        
        .result-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        
        .result-card.warning .result-value {
          color: var(--color-warning);
        }
        
        .result-card.critical .result-value {
          color: var(--color-error);
        }
        
        .result-formula {
          font-size: 11px;
          color: var(--color-text-secondary);
          font-family: 'Courier New', monospace;
        }
        
        .result-status {
          margin-top: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .result-status.ok {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }
        
        .result-status.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }
        
        .result-status.critical {
          background: rgba(239, 68, 68, 0.1);
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
        
        .chart-note {
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        
        .risk-section {
          margin: 32px 0;
        }
        
        .risk-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .risk-card {
          background: var(--color-surface);
          border: 1px solid var(--color-primary);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .risk-card.warning {
          border-color: var(--color-warning);
        }
        
        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .risk-header strong {
          font-size: 14px;
          color: var(--color-primary);
        }
        
        .risk-card.warning .risk-header strong {
          color: var(--color-warning);
        }
        
        .risk-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .risk-card.warning .risk-value {
          color: var(--color-warning);
        }
        
        .risk-card p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text);
          line-height: 1.6;
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


