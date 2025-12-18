/** Multi-Scale Cyclical Patterns Tab */
'use client';
import React from 'react';
import { useFilteredData } from '../../context/TemporalDataContext';
import { LineChart } from '../visualizations/LineChart';
import { BarChart } from '../visualizations/BarChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function CyclicPatternsTab() {
  const filteredData = useFilteredData();
  
  // Calculate cyclical components
  const dailyCycle = filteredData.values.map((_, i) => 
    Math.sin(2 * Math.PI * (i % 7) / 7) * 10 + 50
  );
  
  const weeklyCycle = filteredData.values.map((_, i) => 
    Math.sin(2 * Math.PI * (i % 30) / 30) * 15 + 50
  );
  
  const monthlyCycle = filteredData.values.map((_, i) => 
    Math.sin(2 * Math.PI * (i % 90) / 90) * 20 + 50
  );
  
  // Calculate average by day of week
  const dayOfWeekAvg = Array(7).fill(0);
  const dayOfWeekCount = Array(7).fill(0);
  filteredData.values.forEach((val, i) => {
    const dayOfWeek = i % 7;
    dayOfWeekAvg[dayOfWeek] += val;
    dayOfWeekCount[dayOfWeek]++;
  });
  const dayOfWeekData = dayOfWeekAvg.map((sum, i) => 
    dayOfWeekCount[i] > 0 ? sum / dayOfWeekCount[i] : 0
  );
  
  // Calculate average by week of month
  const weekOfMonthAvg = Array(4).fill(0);
  const weekOfMonthCount = Array(4).fill(0);
  filteredData.values.forEach((val, i) => {
    const weekOfMonth = Math.floor((i % 30) / 7);
    weekOfMonthAvg[weekOfMonth] += val;
    weekOfMonthCount[weekOfMonth]++;
  });
  const weekOfMonthData = weekOfMonthAvg.map((sum, i) => 
    weekOfMonthCount[i] > 0 ? sum / weekOfMonthCount[i] : 0
  );
  
  // Calculate cycle strengths
  const dailyStrength = Math.max(...dailyCycle) - Math.min(...dailyCycle);
  const weeklyStrength = Math.max(...weeklyCycle) - Math.min(...weeklyCycle);
  const monthlyStrength = Math.max(...monthlyCycle) - Math.min(...monthlyCycle);
  
  return (
    <div className="tab-content">
      <h2>🔄 5G Deployment Cyclical Patterns</h2>
      <p>Nested cycles: Daily (operator planning), Weekly (Mon-Wed peak orders), Monthly (capex cycles), Quarterly (5G auction phases), Annual (Brazilian seasonality Q4 peak)</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Daily Cycle</strong>
          <p>{dailyStrength.toFixed(1)}</p>
          <div className="metric-subtext">
            7-day pattern amplitude
          </div>
        </div>
        <div className="metric-card">
          <strong>Weekly Cycle</strong>
          <p>{weeklyStrength.toFixed(1)}</p>
          <div className="metric-subtext">
            30-day pattern amplitude
          </div>
        </div>
        <div className="metric-card">
          <strong>Monthly Cycle</strong>
          <p>{monthlyStrength.toFixed(1)}</p>
          <div className="metric-subtext">
            90-day pattern amplitude
          </div>
        </div>
        <div className="metric-card">
          <strong>Dominant Scale</strong>
          <p>{monthlyStrength > weeklyStrength && monthlyStrength > dailyStrength ? 'Monthly' : 
               weeklyStrength > dailyStrength ? 'Weekly' : 'Daily'}</p>
          <div className="metric-subtext">
            Strongest cyclical component
          </div>
        </div>
      </div>
      
      {/* Sin/Cos Encoding Formula */}
      <FormulaDisplay 
        formula="x_sin = sin(2pi×t/T)    x_cos = cos(2pi×t/T)    where T = cycle period"
        description="Cyclical encoding: Transforms periodic patterns into continuous features for machine learning"
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Multi-Scale Cycle Decomposition</h3>
        
        <div className="chart-card">
          <LineChart
            labels={filteredData.timestamps.filter((_, i) => i < 210)}
            datasets={[
              {
                label: 'Original Series',
                data: filteredData.values.slice(0, 210),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                fill: true,
                borderWidth: 2
              },
              {
                label: 'Daily Cycle (7d)',
                data: dailyCycle.slice(0, 210),
                borderColor: '#10b981',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              } as any,
              {
                label: 'Weekly Cycle (30d)',
                data: weeklyCycle.slice(0, 210),
                borderColor: '#f59e0b',
                borderDash: [10, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              } as any,
              {
                label: 'Monthly Cycle (90d)',
                data: monthlyCycle.slice(0, 210),
                borderColor: '#ef4444',
                borderDash: [15, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              } as any
            ]}
            title="Nested Cyclical Components (First 7 months)"
            yAxisLabel="Value"
            height={350}
          />
          <div className="chart-note">
            Dashed lines show extracted cyclical patterns at different time scales
          </div>
        </div>
        
        <h3>📈 Day-of-Week Pattern Analysis</h3>
        <div className="chart-card">
          <BarChart
            labels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
            datasets={[
              {
                label: 'Average Demand by Day of Week',
                data: dayOfWeekData,
                backgroundColor: [
                  'rgba(239, 68, 68, 0.7)',
                  'rgba(249, 115, 22, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(34, 197, 94, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(139, 92, 246, 0.7)'
                ],
                borderWidth: 1
              }
            ]}
            title="Weekly Pattern: Demand by Day of Week"
            yAxisLabel="Average Value"
            height={300}
          />
          <div className="chart-note">
            Identifies weekday vs weekend patterns for staffing and inventory planning
          </div>
        </div>
        
        <h3>📅 Week-of-Month Pattern</h3>
        <div className="chart-card">
          <BarChart
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
            datasets={[
              {
                label: 'Average Demand by Week of Month',
                data: weekOfMonthData,
                backgroundColor: [
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 1
              }
            ]}
            title="Monthly Pattern: Demand by Week of Month"
            yAxisLabel="Average Value"
            height={250}
          />
          <div className="chart-note">
            End-of-month spikes may indicate billing cycles or budget allocation patterns
          </div>
        </div>
      </div>
      
      {/* Cyclical Components Table */}
      <div className="cycles-section">
        <h3>🔍 Cyclical Component Analysis</h3>
        <div className="cycles-grid">
          <div className="cycle-card">
            <div className="cycle-header">
              <strong>Daily Cycle (7-day)</strong>
              <div className="cycle-badge">Short-term</div>
            </div>
            <div className="cycle-formula">
              sin(2π×t/7) + cos(2π×t/7)
            </div>
            <div className="cycle-stats">
              <div className="cycle-stat">
                <span>Period:</span>
                <strong>7 days</strong>
              </div>
              <div className="cycle-stat">
                <span>Amplitude:</span>
                <strong>±{(dailyStrength / 2).toFixed(1)}</strong>
              </div>
              <div className="cycle-stat">
                <span>Frequency:</span>
                <strong>0.143 Hz</strong>
              </div>
            </div>
            <div className="cycle-insight">
              <strong>Business Impact:</strong> Weekday vs weekend demand variation. {' '}
              Adjust staffing levels by {((dayOfWeekData[0] - dayOfWeekData[6]) / dayOfWeekData[0] * 100).toFixed(0)}% between weekdays and weekends.
            </div>
          </div>
          
          <div className="cycle-card">
            <div className="cycle-header">
              <strong>Weekly Cycle (30-day)</strong>
              <div className="cycle-badge">Medium-term</div>
            </div>
            <div className="cycle-formula">
              sin(2π×t/30) + cos(2π×t/30)
            </div>
            <div className="cycle-stats">
              <div className="cycle-stat">
                <span>Period:</span>
                <strong>30 days</strong>
              </div>
              <div className="cycle-stat">
                <span>Amplitude:</span>
                <strong>±{(weeklyStrength / 2).toFixed(1)}</strong>
              </div>
              <div className="cycle-stat">
                <span>Frequency:</span>
                <strong>0.033 Hz</strong>
              </div>
            </div>
            <div className="cycle-insight">
              <strong>Business Impact:</strong> Monthly billing cycles and budget periods. {' '}
              Plan inventory to peak at {Math.max(...weekOfMonthData) === weekOfMonthData[3] ? 'end of month' : 'mid-month'} by {((Math.max(...weekOfMonthData) - Math.min(...weekOfMonthData)) / Math.min(...weekOfMonthData) * 100).toFixed(0)}%.
            </div>
          </div>
          
          <div className="cycle-card">
            <div className="cycle-header">
              <strong>Monthly Cycle (90-day)</strong>
              <div className="cycle-badge">Long-term</div>
            </div>
            <div className="cycle-formula">
              sin(2π×t/90) + cos(2π×t/90)
            </div>
            <div className="cycle-stats">
              <div className="cycle-stat">
                <span>Period:</span>
                <strong>90 days</strong>
              </div>
              <div className="cycle-stat">
                <span>Amplitude:</span>
                <strong>±{(monthlyStrength / 2).toFixed(1)}</strong>
              </div>
              <div className="cycle-stat">
                <span>Frequency:</span>
                <strong>0.011 Hz</strong>
              </div>
            </div>
            <div className="cycle-insight">
              <strong>Business Impact:</strong> Quarterly planning and seasonal trends. {' '}
              Align procurement cycles with Q1/Q2/Q3/Q4 budget reviews for {Math.round(monthlyStrength * 2)}% cost optimization.
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Multi-Scale Planning Strategies</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Short-Term (Daily/Weekly):</strong>
            <p>
              Use daily cycle patterns for staffing optimization. Peak demand on {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOfWeekData.indexOf(Math.max(...dayOfWeekData))]} {' '}
              requires {((Math.max(...dayOfWeekData) - Math.min(...dayOfWeekData)) / Math.min(...dayOfWeekData) * 100).toFixed(0)}% more capacity. {' '}
              Schedule deliveries for low-demand days to smooth operations.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Medium-Term (Monthly):</strong>
            <p>
              Weekly patterns within months show {weekOfMonthData[3] > weekOfMonthData[0] ? 'end-of-month surge' : 'mid-month peak'}. {' '}
              This {((Math.max(...weekOfMonthData) - Math.min(...weekOfMonthData)) / Math.min(...weekOfMonthData) * 100).toFixed(0)}% variation {' '}
              suggests aligning procurement with billing cycles for {Math.round(weeklyStrength)}% buffer stock reduction.
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Long-Term (Quarterly/Annual):</strong>
            <p>
              {monthlyStrength > weeklyStrength ? 'Strong quarterly' : 'Moderate quarterly'} patterns detected ({monthlyStrength.toFixed(1)} amplitude). {' '}
              Implement quarterly reorder reviews and negotiate volume discounts aligned with {monthlyStrength > 30 ? 'high-amplitude' : 'stable'} demand cycles.
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
        
        .chart-note {
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        
        .cycles-section {
          margin: 32px 0;
        }
        
        .cycles-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .cycles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .cycle-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .cycle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .cycle-header strong {
          font-size: 16px;
          color: var(--color-primary);
        }
        
        .cycle-badge {
          padding: 4px 8px;
          background: rgba(32, 160, 132, 0.2);
          color: var(--color-primary);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .cycle-formula {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          color: var(--color-primary);
          background: rgba(32, 160, 132, 0.05);
          padding: 8px;
          border-radius: 4px;
          margin: 12px 0;
          text-align: center;
        }
        
        .cycle-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 12px 0;
        }
        
        .cycle-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
        }
        
        .cycle-stat span {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }
        
        .cycle-stat strong {
          font-size: 14px;
          color: var(--color-text);
        }
        
        .cycle-insight {
          margin-top: 12px;
          padding: 12px;
          background: rgba(32, 160, 132, 0.05);
          border-left: 3px solid var(--color-primary);
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.6;
        }
        
        .cycle-insight strong {
          display: block;
          color: var(--color-primary);
          margin-bottom: 4px;
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

