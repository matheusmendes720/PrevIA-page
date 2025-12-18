'use client';

/**
 * Predictive Forecast Overlay
 * Visualizes 3-7-14 day weather forecasts with confidence bands
 */

import React, { useEffect, useRef, useState } from 'react';

interface ForecastData {
  lat: number;
  lng: number;
  forecasts: Array<{
    day: number; // 1-14
    temperature: number;
    precipitation: number;
    humidity: number;
    windSpeed: number;
    confidence: number; // 0-1
  }>;
}

interface PredictiveForecastOverlayProps {
  map: any;
  enabled: boolean;
  forecastDays?: 3 | 7 | 14;
  metric: 'temperature' | 'precipitation' | 'humidity' | 'wind';
  points?: ForecastData[];
  animationSpeed?: number; // ms per day
}

export default function PredictiveForecastOverlay({
  map,
  enabled,
  forecastDays = 7,
  metric,
  points = [],
  animationSpeed = 1000
}: PredictiveForecastOverlayProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const layersRef = useRef<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get color based on value and confidence
  const getColor = (value: number, confidence: number, metric: string): string => {
    let baseColor: string;
    
    switch (metric) {
      case 'temperature':
        if (value < 15) baseColor = '#3b82f6';
        else if (value < 25) baseColor = '#10b981';
        else if (value < 30) baseColor = '#f97316';
        else baseColor = '#ef4444';
        break;
      
      case 'precipitation':
        if (value < 10) baseColor = '#bfdbfe';
        else if (value < 30) baseColor = '#3b82f6';
        else baseColor = '#1e40af';
        break;
      
      case 'humidity':
        if (value < 60) baseColor = '#10b981';
        else if (value < 80) baseColor = '#3b82f6';
        else baseColor = '#1e40af';
        break;
      
      case 'wind':
        if (value < 20) baseColor = '#10b981';
        else if (value < 40) baseColor = '#f97316';
        else baseColor = '#dc2626';
        break;
      
      default:
        baseColor = '#3b82f6';
    }
    
    // Adjust opacity based on confidence
    const opacity = confidence * 0.7;
    return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };

  // Render forecast for specific day
  const renderForecastDay = (day: number) => {
    if (!map || points.length === 0) return;
    
    const L = (window as any).L;
    if (!L) return;

    // Clear existing layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    // Render forecast markers for each point
    points.forEach(point => {
      const forecast = point.forecasts.find(f => f.day === day);
      if (!forecast) return;

      let value: number;
      switch (metric) {
        case 'temperature': value = forecast.temperature; break;
        case 'precipitation': value = forecast.precipitation; break;
        case 'humidity': value = forecast.humidity; break;
        case 'wind': value = forecast.windSpeed; break;
        default: value = 0;
      }

      const color = getColor(value, forecast.confidence, metric);
      const radius = 10 + (1 - forecast.confidence) * 5; // Larger = less confident

      // Create circle marker with confidence ring
      const circle = L.circle([point.lat, point.lng], {
        radius: radius * 1000, // meters
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: forecast.confidence,
        fillOpacity: forecast.confidence * 0.6,
        dashArray: forecast.confidence < 0.7 ? '5, 5' : undefined // Dashed if low confidence
      });

      const unit = metric === 'temperature' ? '°C' : 
                   metric === 'precipitation' ? 'mm' : 
                   metric === 'humidity' ? '%' : 'km/h';

      circle.bindPopup(`
        <div style="font-size: 12px; color: #0a192f; min-width: 150px;">
          <strong>Day ${day} Forecast</strong><br>
          <div style="margin-top: 8px;">
            <div><strong>${metric}:</strong> ${value.toFixed(1)}${unit}</div>
            <div style="margin-top: 4px; color: #666; font-size: 11px;">
              Confidence: ${(forecast.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      `);

      circle.addTo(map);
      layersRef.current.push(circle);
    });
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentDay(prev => {
        const next = prev >= forecastDays ? 1 : prev + 1;
        return next;
      });
    }, animationSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, enabled, forecastDays, animationSpeed]);

  // Render current day
  useEffect(() => {
    if (enabled && points.length > 0) {
      renderForecastDay(currentDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, enabled, points, metric]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      layersRef.current.forEach(layer => {
        if (map) map.removeLayer(layer);
      });
      layersRef.current = [];
    };
  }, [map]);

  if (!enabled) return null;

  return (
    <div className="absolute bottom-32 right-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-3 text-xs z-[500] shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-brand-cyan font-semibold">Forecast: Day {currentDay}</span>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-2 py-1 rounded text-xs transition ${
            isPlaying
              ? 'bg-red-500/20 text-red-400'
              : 'bg-brand-cyan text-white'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
      <div className="text-brand-slate text-xs">
        {forecastDays}-day forecast • {points.length} points
      </div>
      <div className="mt-2 w-full h-1 bg-brand-light-navy rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-cyan transition-all duration-300"
          style={{ width: `${(currentDay / forecastDays) * 100}%` }}
        />
      </div>
    </div>
  );
}

