'use client';

/**
 * Grid Cell Layer - Interpolated Weather Cells
 * Renders 50km x 50km grid cells with smooth gradients
 */

import React, { useEffect, useRef } from 'react';
import { GridCell } from '../../data/gridCellGenerator';

interface GridCellLayerProps {
  map: any; // Leaflet map instance
  gridCells: GridCell[];
  enabled: boolean;
  metric: 'temperature' | 'precipitation' | 'humidity' | 'wind';
  opacity?: number;
  showBorders?: boolean;
}

export default function GridCellLayer({
  map,
  gridCells,
  enabled,
  metric,
  opacity = 0.6,
  showBorders = false
}: GridCellLayerProps) {
  const layersRef = useRef<any[]>([]);

  // Get color based on metric value
  const getColor = (value: number, metric: string): string => {
    const colors = {
      temperature: [
        { threshold: 15, color: '#3b82f6' }, // Blue (cold)
        { threshold: 20, color: '#10b981' }, // Green (cool)
        { threshold: 25, color: '#fbbf24' }, // Yellow (warm)
        { threshold: 30, color: '#f97316' }, // Orange (hot)
        { threshold: Infinity, color: '#ef4444' } // Red (very hot)
      ],
      precipitation: [
        { threshold: 5, color: '#bfdbfe' }, // Light blue
        { threshold: 20, color: '#60a5fa' }, // Blue
        { threshold: 50, color: '#3b82f6' }, // Dark blue
        { threshold: Infinity, color: '#1e40af' } // Very dark blue
      ],
      humidity: [
        { threshold: 60, color: '#10b981' }, // Green (low)
        { threshold: 70, color: '#60a5fa' }, // Light blue
        { threshold: 80, color: '#3b82f6' }, // Blue
        { threshold: Infinity, color: '#1e40af' } // Dark blue (high)
      ],
      wind: [
        { threshold: 10, color: '#10b981' }, // Green (calm)
        { threshold: 20, color: '#fbbf24' }, // Yellow
        { threshold: 30, color: '#f97316' }, // Orange
        { threshold: Infinity, color: '#dc2626' } // Red (strong)
      ]
    };

    const colorScale = colors[metric as keyof typeof colors];
    for (const { threshold, color } of colorScale) {
      if (value < threshold) return color;
    }
    return colorScale[colorScale.length - 1].color;
  };

  // Get value from weather data based on metric
  const getValue = (weather: GridCell['weather'], metric: string): number => {
    switch (metric) {
      case 'temperature': return weather.temperature;
      case 'precipitation': return weather.precipitation;
      case 'humidity': return weather.humidity;
      case 'wind': return weather.windSpeed;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!enabled || !map || gridCells.length === 0) {
      // Clear existing layers
      layersRef.current.forEach(layer => {
        if (map) map.removeLayer(layer);
      });
      layersRef.current = [];
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Clear existing layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    // Render grid cells
    gridCells.forEach(cell => {
      const value = getValue(cell.weather, metric);
      const color = getColor(value, metric);

      // Create rectangle for cell
      const bounds = [
        [cell.bounds.south, cell.bounds.west],
        [cell.bounds.north, cell.bounds.east]
      ];

      const rectangle = L.rectangle(bounds, {
        fillColor: color,
        fillOpacity: opacity * cell.confidence, // Opacity based on confidence
        color: showBorders ? '#666' : color,
        weight: showBorders ? 1 : 0,
        opacity: showBorders ? 0.3 : 0
      });

      // Add popup with cell info
      const unit = metric === 'temperature' ? '°C' : 
                   metric === 'precipitation' ? 'mm' :
                   metric === 'humidity' ? '%' : 'km/h';

      rectangle.bindPopup(`
        <div style="font-size: 12px; color: #0a192f; min-width: 180px;">
          <strong>Grid Cell Weather</strong><br>
          <div style="margin-top: 8px;">
            <div><strong>${metric.charAt(0).toUpperCase() + metric.slice(1)}:</strong> ${value.toFixed(1)}${unit}</div>
            <div style="margin-top: 4px; color: #666;">
              Temperature: ${cell.weather.temperature.toFixed(1)}°C<br>
              Precipitation: ${cell.weather.precipitation.toFixed(1)}mm<br>
              Humidity: ${cell.weather.humidity.toFixed(0)}%<br>
              Wind: ${cell.weather.windSpeed.toFixed(1)}km/h
            </div>
            <div style="margin-top: 8px; border-top: 1px solid #ccc; padding-top: 8px;">
              <div style="color: #666; font-size: 10px;">
                Confidence: ${(cell.confidence * 100).toFixed(0)}%<br>
                Center: ${cell.centerLat.toFixed(2)}, ${cell.centerLng.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      `);

      rectangle.addTo(map);
      layersRef.current.push(rectangle);
    });

    return () => {
      layersRef.current.forEach(layer => {
        if (map) map.removeLayer(layer);
      });
      layersRef.current = [];
    };
  }, [map, gridCells, enabled, metric, opacity, showBorders]);

  return null;
}

