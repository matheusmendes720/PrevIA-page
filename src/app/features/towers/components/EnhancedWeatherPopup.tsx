'use client';

import React from 'react';
import { WeatherData, ClimateRisk } from '../utils/mockWeatherData';

interface EnhancedWeatherPopupProps {
  data: WeatherData;
  risk: ClimateRisk;
  metric: 'temperature' | 'precipitation' | 'wind' | 'humidity';
}

export default function EnhancedWeatherPopup({ data, risk, metric }: EnhancedWeatherPopupProps) {
  // Generate mini chart data (last 24 hours simulation)
  const generateChartData = () => {
    const hours = 24;
    const dataPoints: Array<{ hour: number; value: number }> = [];
    
    for (let i = 0; i < hours; i++) {
      let value: number;
      switch (metric) {
        case 'temperature':
          // Temperature varies throughout the day
          value = data.temperature + Math.sin((i - 6) * Math.PI / 12) * 8 + (Math.random() - 0.5) * 3;
          break;
        case 'precipitation':
          value = data.precipitation * (0.5 + Math.random() * 0.5);
          break;
        case 'wind':
          value = data.windSpeed * (0.7 + Math.random() * 0.6);
          break;
        case 'humidity':
          value = data.humidity + (Math.random() - 0.5) * 10;
          break;
        default:
          value = 0;
      }
      dataPoints.push({ hour: i, value: Math.max(0, value) });
    }
    return dataPoints;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));

  // Get alert summary
  const alerts: Array<{ type: string; severity: 'high' | 'medium' | 'low'; icon: string }> = [];
  
  if (risk.thunderstorm_risk !== 'low') {
    alerts.push({ type: 'Thunderstorm', severity: risk.thunderstorm_risk, icon: '⚡' });
  }
  if (risk.wind_gust_risk !== 'low') {
    alerts.push({ type: 'Wind Gusts', severity: risk.wind_gust_risk, icon: '💨' });
  }
  if (risk.hail_risk !== 'low') {
    alerts.push({ type: 'Hail', severity: risk.hail_risk, icon: '🧊' });
  }
  if (risk.corrosion_risk !== 'low') {
    alerts.push({ type: 'Corrosion', severity: risk.corrosion_risk, icon: '⚠️' });
  }
  if (risk.field_work_disruption !== 'low') {
    alerts.push({ type: 'Field Work', severity: risk.field_work_disruption, icon: '🚧' });
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      default: return '#eab308';
    }
  };

  return (
    <div style={{ fontSize: '12px', color: '#0a192f', minWidth: '220px', maxWidth: '280px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
        Weather Station
      </div>

      {/* Current Values */}
      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
          <div>
            <div style={{ color: '#666', fontSize: '10px' }}>Temperature</div>
            <div style={{ fontWeight: 'bold', color: data.temperature > 30 ? '#ef4444' : '#0a192f' }}>
              {data.temperature.toFixed(1)}°C
            </div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '10px' }}>Precipitation</div>
            <div style={{ fontWeight: 'bold', color: data.precipitation > 20 ? '#3b82f6' : '#0a192f' }}>
              {data.precipitation.toFixed(1)}mm
            </div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '10px' }}>Humidity</div>
            <div style={{ fontWeight: 'bold' }}>{data.humidity.toFixed(0)}%</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: '10px' }}>Wind Speed</div>
            <div style={{ fontWeight: 'bold', color: data.windSpeed > 40 ? '#dc2626' : '#0a192f' }}>
              {data.windSpeed.toFixed(1)} km/h
            </div>
          </div>
        </div>
        {data.windDirection !== undefined && (
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#666' }}>
            Wind Direction: {data.windDirection.toFixed(0)}°
          </div>
        )}
      </div>

      {/* Mini Chart */}
      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>
          {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend (24h)
        </div>
        <div style={{ height: '60px', position: 'relative', background: '#f5f5f5', borderRadius: '4px', padding: '4px' }}>
          <svg width="100%" height="100%" style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <line
                key={y}
                x1="0"
                y1={`${y * 100}%`}
                x2="100%"
                y2={`${y * 100}%`}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            {/* Chart line */}
            <polyline
              points={chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 100;
                const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 100;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            {/* Area fill */}
            <polygon
              points={`0%,100% ${chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 100;
                const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 100;
                return `${x}%,${y}%`;
              }).join(' ')} 100%,100%`}
              fill="rgba(59, 130, 246, 0.1)"
            />
          </svg>
          <div style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '9px', color: '#666' }}>
            {minValue.toFixed(1)}
          </div>
          <div style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '9px', color: '#666' }}>
            {maxValue.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Climate Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>
            Climate Alerts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: `${getSeverityColor(alert.severity)}15`,
                  border: `1px solid ${getSeverityColor(alert.severity)}40`,
                }}
              >
                <span style={{ fontSize: '14px' }}>{alert.icon}</span>
                <span style={{ flex: 1, fontSize: '11px' }}>{alert.type}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: getSeverityColor(alert.severity),
                    textTransform: 'uppercase',
                  }}
                >
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
          {risk.lightning_strikes > 0 && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#9333ea' }}>
              ⚡ {risk.lightning_strikes} lightning strikes detected
            </div>
          )}
          {risk.wind_gust_speed > 50 && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#dc2626' }}>
              💨 Wind gusts up to {risk.wind_gust_speed.toFixed(1)} km/h
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0e0e0' }}>
        <div>Pressure: {data.pressure?.toFixed(0) || 'N/A'} hPa</div>
        <div>Visibility: {data.visibility?.toFixed(1) || 'N/A'} km</div>
        {data.uvIndex !== undefined && <div>UV Index: {data.uvIndex}</div>}
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#999' }}>
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

