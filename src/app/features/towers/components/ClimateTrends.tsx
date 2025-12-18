'use client';

import React, { useEffect, useState } from 'react';
import { getMockHistoricalClimate, HistoricalClimateData } from '../utils/mockWeatherData';

interface ClimateTrendsProps {
  region?: string;
  startDate: string;
  endDate: string;
}

export default function ClimateTrends({ region, startDate, endDate }: ClimateTrendsProps) {
  const [data, setData] = useState<HistoricalClimateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'precipitation' | 'humidity' | 'wind'>('temperature');

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const climateData = getMockHistoricalClimate(startDate, endDate);
        setData(climateData);
      } catch (error) {
        console.error('Error loading climate trends:', error);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate, region]);

  // Calculate risk indicators
  const riskIndicators = React.useMemo(() => {
    if (data.length === 0) return null;

    const avgTemp = data.reduce((sum, d) => sum + d.temperature_avg, 0) / data.length;
    const totalPrecip = data.reduce((sum, d) => sum + d.precipitation_mm, 0);
    const avgHumidity = data.reduce((sum, d) => sum + d.humidity_percent, 0) / data.length;
    const avgCorrosionRisk = data.reduce((sum, d) => sum + (d.corrosion_risk || 0), 0) / data.length;
    const avgDisruptionRisk = data.reduce((sum, d) => sum + (d.field_work_disruption || 0), 0) / data.length;

    return {
      extremeHeat: avgTemp > 35,
      heavyRain: totalPrecip > 200,
      highHumidity: avgHumidity > 80,
      corrosionRisk: avgCorrosionRisk > 0.7 ? 'high' : avgCorrosionRisk > 0.4 ? 'medium' : 'low',
      disruptionRisk: avgDisruptionRisk > 0.7 ? 'high' : avgDisruptionRisk > 0.4 ? 'medium' : 'low',
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4">
        <p className="text-brand-slate text-sm">No climate data available for selected period</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs">
      <h3 className="text-sm font-semibold mb-4 text-brand-cyan">Climate Trends & Risks</h3>

      {/* Metric Selector */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {(['temperature', 'precipitation', 'humidity', 'wind'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-2 py-1.5 rounded transition capitalize text-xs ${
                selectedMetric === metric
                  ? 'bg-brand-cyan text-white'
                  : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Indicators */}
      {riskIndicators && (
        <div className="mb-4 p-3 bg-brand-light-navy/30 rounded border border-brand-cyan/20">
          <div className="font-semibold mb-2 text-brand-lightest-slate">Risk Indicators</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-brand-slate">Corrosion Risk:</span>
              <span
                className={`font-semibold ${
                  riskIndicators.corrosionRisk === 'high'
                    ? 'text-red-400'
                    : riskIndicators.corrosionRisk === 'medium'
                    ? 'text-orange-400'
                    : 'text-green-400'
                }`}
              >
                {riskIndicators.corrosionRisk.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-slate">Field Work Disruption:</span>
              <span
                className={`font-semibold ${
                  riskIndicators.disruptionRisk === 'high'
                    ? 'text-red-400'
                    : riskIndicators.disruptionRisk === 'medium'
                    ? 'text-orange-400'
                    : 'text-green-400'
                }`}
              >
                {riskIndicators.disruptionRisk.toUpperCase()}
              </span>
            </div>
            {riskIndicators.extremeHeat && (
              <div className="flex items-center gap-2 text-orange-400">
                <span>⚠️</span>
                <span>Extreme Heat Warning</span>
              </div>
            )}
            {riskIndicators.heavyRain && (
              <div className="flex items-center gap-2 text-blue-400">
                <span>🌧️</span>
                <span>Heavy Rain Period</span>
              </div>
            )}
            {riskIndicators.highHumidity && (
              <div className="flex items-center gap-2 text-blue-400">
                <span>💧</span>
                <span>High Humidity</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple Chart Visualization */}
      <div className="mt-4">
        <div className="text-brand-slate mb-2">Trend ({selectedMetric})</div>
        <div className="h-32 bg-brand-light-navy/20 rounded p-2 flex items-end gap-1">
          {data.slice(0, 30).map((point, index) => {
            let value = 0;
            let maxValue = 100;

            switch (selectedMetric) {
              case 'temperature':
                value = point.temperature_avg;
                maxValue = 50;
                break;
              case 'precipitation':
                value = point.precipitation_mm;
                maxValue = 100;
                break;
              case 'humidity':
                value = point.humidity_percent;
                maxValue = 100;
                break;
              case 'wind':
                value = point.wind_speed_kmh;
                maxValue = 60;
                break;
            }

            const height = (value / maxValue) * 100;
            const color =
              selectedMetric === 'temperature'
                ? value > 35
                  ? '#ef4444'
                  : value > 30
                  ? '#f97316'
                  : '#10b981'
                : selectedMetric === 'precipitation'
                ? value > 50
                  ? '#1e40af'
                  : value > 20
                  ? '#3b82f6'
                  : '#60a5fa'
                : '#3b82f6';

            return (
              <div
                key={index}
                className="flex-1 bg-brand-cyan rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(5, height)}%`,
                  backgroundColor: color,
                }}
                title={`${new Date(point.date).toLocaleDateString()}: ${value.toFixed(1)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Brazilian Seasonal Patterns */}
      <div className="mt-4 pt-4 border-t border-brand-cyan/20">
        <div className="text-brand-slate mb-2">Seasonal Patterns</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🌧️</span>
            <span className="text-brand-lightest-slate">Rainy Season: Nov - Apr</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">☀️</span>
            <span className="text-brand-lightest-slate">Summer: Dec - Mar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🎉</span>
            <span className="text-brand-lightest-slate">Carnival: Feb (varies)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

