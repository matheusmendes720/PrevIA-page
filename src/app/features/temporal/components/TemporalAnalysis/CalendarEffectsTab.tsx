/** Calendar Effects & Holiday Impact Tab */
'use client';
import React from 'react';
import { useTemporalData, useFilteredData } from '../../context/TemporalDataContext';
import { BarChart } from '../visualizations/BarChart';
import { LineChart } from '../visualizations/LineChart';
import { FormulaDisplay } from '../shared/FormulaDisplay';

export default function CalendarEffectsTab() {
  const { dataset } = useTemporalData();
  const filteredData = useFilteredData();
  
  // Analyze day-of-week patterns
  const dayOfWeekData = Array(7).fill(0).map(() => ({ count: 0, sum: 0 }));
  filteredData.timestamps.forEach((ts, i) => {
    const date = new Date(ts);
    const dow = date.getDay(); // 0 = Sunday, 6 = Saturday
    dayOfWeekData[dow].count++;
    dayOfWeekData[dow].sum += filteredData.values[i];
  });
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekAvg = dayOfWeekData.map((d, i) => ({
    day: dayNames[i],
    avg: d.count > 0 ? d.sum / d.count : 0,
    count: d.count
  }));
  
  // Analyze month-of-year patterns
  const monthData = Array(12).fill(0).map(() => ({ count: 0, sum: 0 }));
  filteredData.timestamps.forEach((ts, i) => {
    const date = new Date(ts);
    const month = date.getMonth(); // 0-11
    monthData[month].count++;
    monthData[month].sum += filteredData.values[i];
  });
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthAvg = monthData.map((d, i) => ({
    month: monthNames[i],
    avg: d.count > 0 ? d.sum / d.count : 0,
    count: d.count
  }));
  
  // Brazilian holidays and major events analysis
  const eventsWithImpact = dataset.events.map(event => {
    // Find values around the event date
    const eventDate = new Date(event.date);
    const eventIndex = filteredData.timestamps.findIndex(ts => new Date(ts).getTime() === eventDate.getTime());
    
    let beforeAvg = 0;
    let afterAvg = 0;
    let actualValue = 0;
    
    if (eventIndex >= 7) {
      // Average of 7 days before
      const beforeValues = filteredData.values.slice(eventIndex - 7, eventIndex);
      beforeAvg = beforeValues.reduce((a, b) => a + b, 0) / beforeValues.length;
      
      // Actual value on event day
      actualValue = filteredData.values[eventIndex];
      
      // Average of 7 days after
      if (eventIndex + 7 < filteredData.values.length) {
        const afterValues = filteredData.values.slice(eventIndex + 1, eventIndex + 8);
        afterAvg = afterValues.reduce((a, b) => a + b, 0) / afterValues.length;
      }
    }
    
    const actualImpact = beforeAvg > 0 ? ((actualValue - beforeAvg) / beforeAvg) * 100 : 0;
    
    return {
      ...event,
      beforeAvg,
      actualValue,
      afterAvg,
      actualImpact,
      recoveryTime: Math.abs(afterAvg - actualValue) / Math.abs(actualValue - beforeAvg) * 7
    };
  });
  
  // Sort events by actual impact
  const topImpactEvents = [...eventsWithImpact].sort((a, b) => Math.abs(b.actualImpact) - Math.abs(a.actualImpact)).slice(0, 5);
  
  // Calculate overall statistics
  const weekdayAvg = dayOfWeekAvg.slice(1, 6).reduce((a, b) => a + b.avg, 0) / 5; // Mon-Fri
  const weekendAvg = (dayOfWeekAvg[0].avg + dayOfWeekAvg[6].avg) / 2; // Sun, Sat
  const weekdayEffect = ((weekdayAvg - weekendAvg) / weekendAvg) * 100;
  
  const highSeasonMonths = monthAvg.filter(m => m.avg > monthAvg.reduce((a, b) => a + b.avg, 0) / 12);
  const avgEventImpact = eventsWithImpact.reduce((a, b) => a + Math.abs(b.actualImpact), 0) / eventsWithImpact.length;
  
  return (
    <div className="tab-content">
      <h2>📅 Calendar Effects & Holiday Impact - Nova Corrente</h2>
      <p>Real Brazilian telecom events: Carnaval, Black Friday (+92% demand), Christmas (+81%), 5G Auction Lote 3 (+145%), Estação Chuvosa (+58% FERRO_E_AÇO)</p>
      
      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <strong>Weekday Effect</strong>
          <p className={weekdayEffect > 0 ? 'positive' : 'negative'}>
            {weekdayEffect > 0 ? '+' : ''}{weekdayEffect.toFixed(1)}%
          </p>
          <div className="metric-subtext">
            Mon-Fri vs Weekend avg
          </div>
        </div>
        <div className="metric-card">
          <strong>High Season Months</strong>
          <p>{highSeasonMonths.length}/12</p>
          <div className="metric-subtext">
            Above-average demand periods
          </div>
        </div>
        <div className="metric-card">
          <strong>Avg Event Impact</strong>
          <p>{avgEventImpact.toFixed(1)}%</p>
          <div className="metric-subtext">
            Holiday demand shift
          </div>
        </div>
        <div className="metric-card">
          <strong>Major Events Tracked</strong>
          <p>{dataset.events.length}</p>
          <div className="metric-subtext">
            Brazilian holidays analyzed
          </div>
        </div>
      </div>
      
      {/* Formula Display */}
      <FormulaDisplay 
        formula="Calendar_Effect = (Actual_Demand - Baseline_Demand) / Baseline_Demand × 100%"
        description="Quantifies the percentage deviation from baseline demand during calendar events (holidays, weekends, seasonal periods)"
      />
      
      {/* Visualizations */}
      <div className="charts-section">
        <h3>📊 Day-of-Week Demand Pattern</h3>
        <div className="chart-card">
          <BarChart
            labels={dayOfWeekAvg.map(d => d.day)}
            datasets={[
              {
                label: 'Average Demand',
                data: dayOfWeekAvg.map(d => d.avg),
                backgroundColor: dayOfWeekAvg.map((d, i) => 
                  i === 0 || i === 6 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'
                ),
                borderWidth: 1
              }
            ]}
            title="Average Demand by Day of Week"
            yAxisLabel="Average Value"
            height={300}
          />
          <div className="chart-note">
            Weekends (red) typically show {weekendAvg > weekdayAvg ? 'higher' : 'lower'} demand than weekdays (green). {' '}
            Consider this for procurement scheduling and warehouse staffing.
          </div>
        </div>
        
        <h3>📊 Monthly Seasonal Pattern</h3>
        <div className="chart-card">
          <BarChart
            labels={monthAvg.map(m => m.month)}
            datasets={[
              {
                label: 'Average Demand',
                data: monthAvg.map(m => m.avg),
                backgroundColor: monthAvg.map(m => {
                  const overallAvg = monthAvg.reduce((a, b) => a + b.avg, 0) / 12;
                  return m.avg > overallAvg ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)';
                }),
                borderWidth: 1
              }
            ]}
            title="Average Demand by Month"
            yAxisLabel="Average Value"
            height={300}
          />
          <div className="chart-note">
            Green months have above-average demand (high season). Orange months are below average (low season). {' '}
            High season months: {highSeasonMonths.map(m => m.month).join(', ')}.
          </div>
        </div>
        
        <h3>📊 Top 5 Holiday Impact Events</h3>
        <div className="chart-card">
          <BarChart
            labels={topImpactEvents.map(e => e.name.substring(0, 20))}
            datasets={[
              {
                label: 'Before (7-day avg)',
                data: topImpactEvents.map(e => e.beforeAvg),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderWidth: 1
              },
              {
                label: 'During Event',
                data: topImpactEvents.map(e => e.actualValue),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderWidth: 1
              },
              {
                label: 'After (7-day avg)',
                data: topImpactEvents.map(e => e.afterAvg),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderWidth: 1
              }
            ]}
            title="Demand Before, During, and After Major Events"
            yAxisLabel="Value"
            height={300}
          />
        </div>
      </div>
      
      {/* Holiday Events Detail */}
      <div className="events-section">
        <h3>🎉 Brazilian Holiday & Event Analysis</h3>
        <div className="events-list">
          {topImpactEvents.map((event, i) => (
            <div key={event.id} className={`event-card ${Math.abs(event.actualImpact) > 20 ? 'high-impact' : ''}`}>
              <div className="event-header">
                <div className="event-badge">#{i + 1}</div>
                <div className="event-name">{event.name}</div>
                <div className="event-impact">
                  {event.actualImpact > 0 ? '↗' : '↘'} {Math.abs(event.actualImpact).toFixed(1)}%
                </div>
              </div>
              <div className="event-date">📅 {event.date}</div>
              <div className="event-narrative">{event.narrative}</div>
              <div className="event-metrics">
                <div className="event-metric">
                  <span>Predicted Impact:</span>
                  <strong>{event.demandImpact > 0 ? '+' : ''}{event.demandImpact}%</strong>
                </div>
                <div className="event-metric">
                  <span>Actual Impact:</span>
                  <strong>{event.actualImpact > 0 ? '+' : ''}{event.actualImpact.toFixed(1)}%</strong>
                </div>
                <div className="event-metric">
                  <span>Recovery Time:</span>
                  <strong>{event.recoveryTime.toFixed(0)} days</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Business Insights */}
      <div className="insights-section">
        <h3>💡 Strategic Calendar-Based Procurement Insights</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <strong>Day-of-Week Strategy (Telecom Procurement):</strong>
            <p>
              {weekdayEffect > 10 ? 'Strong weekday bias detected!' : 'Moderate day-of-week variation.'} {' '}
              Peak operator orders: {dayOfWeekAvg.reduce((max, d) => d.avg > max.avg ? d : max).day} {' '}
              ({dayOfWeekAvg.reduce((max, d) => d.avg > max.avg ? d : max).avg.toFixed(1)} units MATERIAL_ELETRICO). {' '}
              Furukawa/Prysmian deliveries optimal Mon-Wed. Avoid Fri POs (lead time extends over weekend).
            </p>
          </div>
          
          <div className="insight-card warning">
            <strong>Holiday Buffer Planning (Nova Corrente):</strong>
            <p>
              Critical events: Black Friday (+92% demand, R$ 180K penalty risk), Christmas (+81%), 5G Auction (+145%). {' '}
              MATERIAL_ELETRICO safety stock: 25d→40d before Black Friday (Nov 10). {' '}
              EPI +35% for 24/7 teams during Christmas. FERRO_E_AÇO +60% during rainy season (Nov-Apr, corrosão).
            </p>
          </div>
          
          <div className="insight-card">
            <strong>Seasonal Procurement Calendar (5G Rollout):</strong>
            <p>
              Q4 HIGH SEASON ({highSeasonMonths.map(m => m.month).join(', ')}): Black Friday + Christmas = +110% MATERIAL_ELETRICO demand. {' '}
              Q1 LOW: Post-holiday -35% (Carnaval impact). {' '}
              Volume discounts: Negotiate 15% discount with Huawei/Ericsson/Nokia for Q4 pre-orders &gt;R$ 10M. {' '}
              Rainy season (Nov-Apr): FERRO_E_AÇO +58%, logistics delays, increase safety stock 26d→42d.
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
        
        .chart-note {
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        
        .events-section {
          margin: 32px 0;
        }
        
        .events-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .event-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
        }
        
        .event-card.high-impact {
          border-left-color: var(--color-error);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .event-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .event-badge {
          font-size: 14px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          background: var(--color-primary);
          color: var(--color-bg);
        }
        
        .event-name {
          flex: 1;
          font-weight: 600;
          font-size: 15px;
          color: var(--color-text);
        }
        
        .event-impact {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .event-card.high-impact .event-impact {
          color: var(--color-error);
        }
        
        .event-date {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 4px 0;
        }
        
        .event-narrative {
          font-size: 13px;
          color: var(--color-text);
          margin: 8px 0;
          padding: 8px;
          background: var(--color-bg);
          border-radius: 4px;
        }
        
        .event-metrics {
          display: flex;
          gap: 20px;
          margin: 12px 0;
          font-size: 12px;
        }
        
        .event-metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .event-metric span {
          color: var(--color-text-secondary);
        }
        
        .event-metric strong {
          color: var(--color-text);
          font-size: 14px;
        }
        
        .event-considerations {
          font-size: 12px;
          color: var(--color-primary);
          margin-top: 8px;
          padding: 8px;
          background: rgba(32, 160, 132, 0.1);
          border-radius: 4px;
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


