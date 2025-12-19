/** Financial Optimization & ROI Analysis Tab */
'use client';
import React from 'react';
import { useTemporalData } from '../../context/TemporalDataContext';
import { BarChart } from '../visualizations/BarChart';
import { LineChart } from '../visualizations/LineChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function FinancialOptimizationTab() {
  const { dataset } = useTemporalData();
  
  // Financial metrics calculations
  const totalInventoryValue = 12400000; // R$ 12.4M
  const holdingCostRate = 0.25; // 25% annual
  const annualHoldingCost = totalInventoryValue * holdingCostRate;
  
  // Working capital scenarios
  const scenarios = [
    {
      name: 'Current State',
      workingCapital: 12400000,
      leadTime: 45,
      serviceLevel: 95,
      holdingCost: 3100000,
      stockoutCost: 480000,
      totalCost: 3580000
    },
    {
      name: 'Optimized (Target)',
      workingCapital: 9200000,
      leadTime: 30,
      serviceLevel: 97,
      holdingCost: 2300000,
      stockoutCost: 180000,
      totalCost: 2480000
    },
    {
      name: 'Aggressive JIT',
      workingCapital: 7500000,
      leadTime: 15,
      serviceLevel: 99,
      holdingCost: 1875000,
      stockoutCost: 50000,
      totalCost: 1925000
    }
  ];
  
  // ROI initiatives (from Lead Time Analytics HTML)
  const initiatives = [
    {
      initiative: 'Consolidar Fornecedores 5G (Huawei→Ericsson+Nokia)',
      investment: 35000,
      annualSavings: 420000,
      roi: 1200,
      paybackMonths: 1,
      impact: 'Reduzir de 15 para 6 suppliers core. Foco: Ericsson (97.8% SLA), Nokia (95.6% SLA). Desconto volume 15% em MATERIAL_ELETRICO (R$ 45M).',
      priority: 'HIGH'
    },
    {
      initiative: 'JIT para FERRAMENTAS_E_EQUIPAMENTOS (Risk 0.30)',
      investment: 120000,
      annualSavings: 3800000,
      roi: 320,
      paybackMonths: 0.4,
      impact: 'Liberar R$ 3.8M working capital (família baixo risco). Armazém -40%. Lead time CommScope 52d→35d com entregas diretas.',
      priority: 'HIGH'
    },
    {
      initiative: 'Otimizar Safety Stock FERRO_E_AÇO (26→21 dias)',
      investment: 85000,
      annualSavings: 280000,
      roi: 228,
      paybackMonths: 3.6,
      impact: 'FERRO_E_AÇO tem risk 0.77 mas excess stock. Modelos ARIMA reduzem safety stock 19% mantendo SLA 95%. Economia R$ 280K/ano.',
      priority: 'MEDIUM'
    },
    {
      initiative: 'Repricing Dinâmico MATERIAL_ELETRICO (USD/BRL hedge)',
      investment: 150000,
      annualSavings: 980000,
      roi: 145,
      paybackMonths: 1.8,
      impact: 'AI pricing: Huawei/Nokia imports sensíveis a USD/BRL. Hedge cambial + repricing +5.5% em picos. Margem protegida.',
      priority: 'MEDIUM'
    },
    {
      initiative: 'Automação Procurement EPI (R$ 32M família)',
      investment: 200000,
      annualSavings: 450000,
      roi: 125,
      paybackMonths: 5.3,
      impact: 'PO automático para EPI (25 dias safety stock, demanda previsível). Reduzir erros manuais 70%, cycle time -35%.',
      priority: 'LOW'
    }
  ];
  
  // Cost breakdown
  const costBreakdown = [
    { category: 'Inventory Holding', cost: 3100000, percentage: 43 },
    { category: 'Stockout Penalties', cost: 480000, percentage: 7 },
    { category: 'Procurement Overhead', cost: 850000, percentage: 12 },
    { category: 'Transportation', cost: 1200000, percentage: 17 },
    { category: 'Warehouse Operations', cost: 900000, percentage: 13 },
    { category: 'Quality/Returns', cost: 570000, percentage: 8 }
  ];
  
  // Margin sensitivity analysis
  const marginImpact = [
    { scenario: 'Current', margin: 18.5, revenue: 25000000, profit: 4625000 },
    { scenario: 'Optimized', margin: 20.8, revenue: 25000000, profit: 5200000 },
    { scenario: 'Best Case', margin: 23.2, revenue: 25000000, profit: 5800000 }
  ];
  
  // Quarterly savings projection
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const savingsProjection = quarters.map((q, i) => {
    const cumulativeSavings = initiatives.slice(0, 3).reduce((sum, init) => 
      sum + (init.annualSavings / 4) * (i + 1), 0
    );
    return {
      quarter: q,
      savings: cumulativeSavings,
      target: 1000000 * (i + 1)
    };
  });
  
  // Calculate totals
  const totalInvestment = initiatives.reduce((sum, i) => sum + i.investment, 0);
  const totalAnnualSavings = initiatives.reduce((sum, i) => sum + i.annualSavings, 0);
  const avgROI = (totalAnnualSavings / totalInvestment) * 100;
  const totalCostReduction = scenarios[0].totalCost - scenarios[2].totalCost;
  
  return (
    <div className="tab-content">
      <h2>💰 Financial Optimization & ROI Analysis</h2>
      <p>Nova Corrente C-Level Dashboard: R$ 165M telecom procurement | MATERIAL_ELETRICO (R$ 45M), FERRO_E_AÇO (R$ 38M), EPI (R$ 32M) | ROI: Supplier consolidation 1,200%, JIT 320%, Buffer optimization 228%</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Total Annual Savings</strong>
          <p className="positive">R$ {(totalAnnualSavings / 1000000).toFixed(1)}M</p>
          <div className="metric-subtext">
            From 5 optimization initiatives
          </div>
        </div>
        <div className="metric-card">
          <strong>Average ROI</strong>
          <p className="positive">{avgROI.toFixed(0)}%</p>
          <div className="metric-subtext">
            Weighted average across all initiatives
          </div>
        </div>
        <div className="metric-card">
          <strong>Working Capital Freed</strong>
          <p className="positive">R$ {((scenarios[0].workingCapital - scenarios[2].workingCapital) / 1000000).toFixed(1)}M</p>
          <div className="metric-subtext">
            From JIT and inventory optimization
          </div>
        </div>
        <div className="metric-card">
          <strong>Margin Improvement</strong>
          <p className="positive">+{(marginImpact[2].margin - marginImpact[0].margin).toFixed(1)}pp</p>
          <div className="metric-subtext">
            From {marginImpact[0].margin}% to {marginImpact[2].margin}%
          </div>
        </div>
      </div>
      
      {/* Formula Display */}
      <FormulaDisplay 
        formula="ROI = (Annual Savings - Investment) / Investment × 100%    |    Payback = Investment / Monthly Savings"
        description="Return on Investment measures efficiency of capital deployment. Payback period shows time to recover initial investment."
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 ROI Ranking by Initiative</h3>
        <div className="chart-card">
          <BarChart
            labels={initiatives.map(i => i.initiative)}
            datasets={[
              {
                label: 'ROI (%)',
                data: initiatives.map(i => i.roi),
                backgroundColor: initiatives.map(i => 
                  i.roi > 300 ? 'rgba(16, 185, 129, 0.7)' : 
                  i.roi > 150 ? 'rgba(245, 158, 11, 0.7)' : 
                  'rgba(99, 102, 241, 0.7)'
                ),
                borderWidth: 1
              }
            ]}
            title="Return on Investment by Optimization Initiative"
            yAxisLabel="ROI (%)"
            height={300}
          />
          <div className="chart-note">
            Supplier consolidation offers exceptional 1,200% ROI with 1-month payback. {' '}
            Top 3 initiatives (green/orange) should be prioritized for immediate implementation.
          </div>
        </div>
        
        <h3>📊 Total Cost Comparison: Current vs Optimized</h3>
        <div className="chart-card">
          <BarChart
            labels={scenarios.map(s => s.name)}
            datasets={[
              {
                label: 'Holding Cost',
                data: scenarios.map(s => s.holdingCost / 1000000),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderWidth: 1
              },
              {
                label: 'Stockout Cost',
                data: scenarios.map(s => s.stockoutCost / 1000000),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderWidth: 1
              }
            ]}
            title="Cost Structure by Scenario (R$ Million)"
            yAxisLabel="Cost (R$ M)"
            height={300}
          />
          <div className="chart-note">
            Aggressive JIT scenario reduces total costs by R$ {(totalCostReduction / 1000000).toFixed(1)}M ({((totalCostReduction / scenarios[0].totalCost) * 100).toFixed(0)}%) {' '}
            while improving service level to 99%. Working capital savings enable strategic reinvestment.
          </div>
        </div>
        
        <h3>📊 Cost Breakdown Analysis</h3>
        <div className="chart-card">
          <BarChart
            labels={costBreakdown.map(c => c.category)}
            datasets={[
              {
                label: 'Annual Cost (R$)',
                data: costBreakdown.map(c => c.cost / 1000000),
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderWidth: 1
              }
            ]}
            title="Current Cost Structure (R$ Million)"
            yAxisLabel="Cost (R$ M)"
            height={300}
          />
        </div>
        
        <h3>📊 Margin Sensitivity Analysis</h3>
        <div className="chart-card">
          <BarChart
            labels={marginImpact.map(m => m.scenario)}
            datasets={[
              {
                label: 'Gross Margin (%)',
                data: marginImpact.map(m => m.margin),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderWidth: 1
              } as any,
              {
                label: 'Gross Profit (R$ M)',
                data: marginImpact.map(m => m.profit / 1000000),
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderWidth: 1
              } as any
            ]}
            title="Margin Improvement Scenarios"
            yAxisLabel="Margin (%) / Profit (R$ M)"
            height={300}
          />
        </div>
        
        <h3>📊 Cumulative Savings Projection (2024)</h3>
        <div className="chart-card">
          <LineChart
            labels={savingsProjection.map(s => s.quarter)}
            datasets={[
              {
                label: 'Actual Savings',
                data: savingsProjection.map(s => s.savings / 1000000),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                borderWidth: 3
              },
              {
                label: 'Target Savings',
                data: savingsProjection.map(s => s.target / 1000000),
                borderColor: '#6366f1',
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [5, 5]
              }
            ]}
            title="Quarterly Savings Trajectory (R$ Million)"
            yAxisLabel="Cumulative Savings (R$ M)"
            height={300}
          />
        </div>
      </div>
      
      {/* Initiative Details */}
      <div className="initiatives-section">
        <h3>🎯 Detailed Initiative Analysis</h3>
        <div className="initiatives-list">
          {initiatives.map((init, i) => (
            <div key={i} className={`initiative-card ${init.priority.toLowerCase()}`}>
              <div className="initiative-header">
                <div className="initiative-rank">#{i + 1}</div>
                <div className="initiative-name">{init.initiative}</div>
                <div className={`initiative-priority ${init.priority.toLowerCase()}`}>
                  {init.priority}
                </div>
              </div>
              <div className="initiative-metrics">
                <div className="initiative-metric">
                  <span>Investment:</span>
                  <strong>R$ {init.investment.toLocaleString('pt-BR')}</strong>
                </div>
                <div className="initiative-metric">
                  <span>Annual Savings:</span>
                  <strong className="positive">R$ {init.annualSavings.toLocaleString('pt-BR')}</strong>
                </div>
                <div className="initiative-metric">
                  <span>ROI:</span>
                  <strong className="positive">{init.roi}%</strong>
                </div>
                <div className="initiative-metric">
                  <span>Payback:</span>
                  <strong>{init.paybackMonths.toFixed(1)} months</strong>
                </div>
              </div>
              <div className="initiative-impact">{init.impact}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Executive Financial Summary & Recommendations</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Quick Wins (0-3 months):</strong>
            <p>
              Implement top 2 initiatives: Supplier Consolidation (R$ 420K savings, 1-month payback) and JIT (R$ 3.8M WC freed). {' '}
              Combined investment of R$ {(initiatives[0].investment + initiatives[1].investment).toLocaleString('pt-BR')} {' '}
              yields R$ {((initiatives[0].annualSavings + initiatives[1].annualSavings) / 1000000).toFixed(1)}M annual savings. {' '}
              Executive approval recommended for immediate deployment in Q1 2024.
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Working Capital Optimization:</strong>
            <p>
              Current WC of R$ 12.4M is {((scenarios[0].workingCapital / 25000000) * 100).toFixed(0)}% of annual revenue—above industry benchmark (30-35%). {' '}
              Aggressive JIT scenario frees R$ {((scenarios[0].workingCapital - scenarios[2].workingCapital) / 1000000).toFixed(1)}M, {' '}
              reducing WC ratio to healthy {((scenarios[2].workingCapital / 25000000) * 100).toFixed(0)}%. {' '}
              Redirected capital enables strategic investments in 5G network expansion and tech upgrades.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Margin Protection Strategy:</strong>
            <p>
              Optimization initiatives improve gross margin from {marginImpact[0].margin}% to {marginImpact[2].margin}% {' '}
              (+{(marginImpact[2].margin - marginImpact[0].margin).toFixed(1)}pp), generating additional {' '}
              R$ {((marginImpact[2].profit - marginImpact[0].profit) / 1000000).toFixed(1)}M annual profit. {' '}
              Margin expansion protects against competitive pricing pressure and economic volatility. {' '}
              Target: achieve 23%+ margin by Q4 2024 through disciplined procurement cost management.
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
        
        .initiatives-section {
          margin: 32px 0;
        }
        
        .initiatives-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .initiatives-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .initiative-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .initiative-card.high {
          border-left-color: var(--color-success);
          background: rgba(16, 185, 129, 0.05);
        }
        
        .initiative-card.medium {
          border-left-color: var(--color-warning);
        }
        
        .initiative-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .initiative-rank {
          font-size: 16px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 50%;
          background: var(--color-primary);
          color: var(--color-bg);
          min-width: 36px;
          text-align: center;
        }
        
        .initiative-name {
          flex: 1;
          font-weight: 600;
          font-size: 15px;
          color: var(--color-text);
        }
        
        .initiative-priority {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .initiative-priority.high {
          background: rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }
        
        .initiative-priority.medium {
          background: rgba(245, 158, 11, 0.2);
          color: var(--color-warning);
        }
        
        .initiative-priority.low {
          background: rgba(99, 102, 241, 0.2);
          color: #6366f1;
        }
        
        .initiative-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin: 12px 0;
          padding: 12px;
          background: var(--color-bg);
          border-radius: 6px;
        }
        
        .initiative-metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .initiative-metric span {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        
        .initiative-metric strong {
          font-size: 14px;
          color: var(--color-text);
        }
        
        .initiative-metric strong.positive {
          color: var(--color-success);
        }
        
        .initiative-impact {
          font-size: 13px;
          color: var(--color-text);
          padding: 10px;
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


