'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMockHistoricalClimate, HistoricalClimateData } from '../utils/mockWeatherData';

interface TemporalPlaybackAnimationProps {
  map: any; // Leaflet map instance
  towers: Array<{ lat: number; lng: number; id: string }>;
  enabled: boolean;
  timeRange: '24h' | '7d' | '30d';
  onTimeUpdate?: (timestamp: Date, data: HistoricalClimateData[]) => void;
}

export default function TemporalPlaybackAnimation({
  map,
  towers,
  enabled,
  timeRange = '7d',
  onTimeUpdate,
}: TemporalPlaybackAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historicalData, setHistoricalData] = useState<HistoricalClimateData[]>([]);
  const [loading, setLoading] = useState(false);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  // Calculate date range
  const getDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '24h':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [timeRange]);

  // Load historical data
  useEffect(() => {
    if (!enabled) return;

    const loadData = () => {
      setLoading(true);
      try {
        const { start, end } = getDateRange();
        const data = getMockHistoricalClimate(start, end);
        setHistoricalData(data);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading historical climate data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [enabled, getDateRange]);

  // Clear markers
  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((marker: any) => {
      if (map) map.removeLayer(marker);
    });
    markersRef.current = {};
  }, [map]);

  // Update markers for current time step
  const updateMarkers = useCallback((index: number) => {
    if (!map || !historicalData.length || !towers.length) return;
    
    const L = (window as any).L;
    if (!L) return;

    clearMarkers();

    const currentData = historicalData[index];
    if (!currentData) return;

    // Sample towers for visualization
    const sampledTowers = towers.filter((_, i) => i % 20 === 0).slice(0, 30);

    sampledTowers.forEach((tower) => {
      // Color based on temperature
      let color = '#10b981'; // green
      if (currentData.temperature_avg > 35) {
        color = '#ef4444'; // red
      } else if (currentData.temperature_avg > 30) {
        color = '#f97316'; // orange
      } else if (currentData.temperature_avg < 15) {
        color = '#3b82f6'; // blue
      }

      const marker = L.circleMarker([tower.lat, tower.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7,
      });

      const popupContent = `
        <div style="font-size: 12px; color: #0a192f; min-width: 150px;">
          <strong>Historical Climate</strong><br>
          <div style="margin-top: 8px;">
            <div><strong>Date:</strong> ${currentData.date}</div>
            <div><strong>Temperature:</strong> ${currentData.temperature_avg.toFixed(1)}°C</div>
            <div><strong>Precipitation:</strong> ${currentData.precipitation_mm.toFixed(1)}mm</div>
            <div><strong>Humidity:</strong> ${currentData.humidity_percent}%</div>
            <div><strong>Wind:</strong> ${currentData.wind_speed_kmh.toFixed(1)} km/h</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map);
      markersRef.current[tower.id] = marker;
    });

    // Notify parent component
    if (onTimeUpdate) {
      const timestamp = new Date(currentData.date);
      onTimeUpdate(timestamp, [currentData]);
    }
  }, [map, historicalData, towers, clearMarkers, onTimeUpdate]);

  // Animation loop
  useEffect(() => {
    if (!enabled || !isPlaying || historicalData.length === 0) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }

    const animate = () => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex >= historicalData.length - 1 ? 0 : prevIndex + 1;
        return newIndex;
      });
    };

    animationIntervalRef.current = setInterval(animate, 1000); // 1 second per step

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [enabled, isPlaying, historicalData.length]);

  // Update markers when index changes
  useEffect(() => {
    if (enabled && historicalData.length > 0) {
      updateMarkers(currentIndex);
    }
  }, [currentIndex, enabled, historicalData.length, updateMarkers]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearMarkers();
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [clearMarkers]);

  if (!enabled) return null;

  const currentData = historicalData[currentIndex];
  const progress = historicalData.length > 0 ? ((currentIndex + 1) / historicalData.length) * 100 : 0;

  return (
    <div className="absolute top-5 left-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-3 text-xs z-[600] shadow-lg min-w-[250px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-brand-cyan">Temporal Playback</h3>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
        )}
      </div>

      {historicalData.length > 0 && (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brand-slate">Time:</span>
              <span className="text-brand-lightest-slate font-semibold">
                {currentData?.date || 'N/A'}
              </span>
            </div>
            <div className="w-full h-2 bg-brand-light-navy rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-cyan transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-brand-slate text-xs mt-1">
              Step {currentIndex + 1} / {historicalData.length}
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 px-3 py-2 rounded transition ${
                isPlaying
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-brand-cyan text-white hover:bg-brand-cyan/80'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-3 py-2 bg-brand-light-navy/50 text-brand-lightest-slate rounded hover:bg-brand-light-navy transition"
            >
              ↺ Reset
            </button>
          </div>

          {currentData && (
            <div className="pt-2 border-t border-brand-cyan/20 text-brand-slate text-xs">
              <div>Temp: {currentData.temperature_avg.toFixed(1)}°C</div>
              <div>Precip: {currentData.precipitation_mm.toFixed(1)}mm</div>
            </div>
          )}
        </>
      )}

      {historicalData.length === 0 && !loading && (
        <div className="text-brand-slate text-xs">No historical data available</div>
      )}
    </div>
  );
}

