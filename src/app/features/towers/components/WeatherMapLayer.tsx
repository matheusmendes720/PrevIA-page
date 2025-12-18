'use client';

import React, { useEffect, useRef } from 'react';

interface WeatherMapLayerProps {
  map: any; // Leaflet map instance
  enabled: boolean;
  layerType: 'temperature' | 'precipitation' | 'wind' | 'clouds' | 'pressure';
  opacity?: number;
}

/**
 * WeatherMapLayer - Integrates OpenWeatherMap weather map tiles
 * Uses OpenWeatherMap Weather Maps 2.0 API for real-time weather visualization
 */
export default function WeatherMapLayer({
  map,
  enabled,
  layerType,
  opacity = 0.6,
}: WeatherMapLayerProps) {
  const layerRef = useRef<any>(null);
  const OPENWEATHER_API_KEY = '941ae7a1a0e249c20b4926388c6758d8';

  useEffect(() => {
    if (!enabled || !map) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // OpenWeatherMap Weather Maps 2.0 tile URL format
    // Note: This requires a paid subscription. For free tier, we'll use a different approach
    const getTileUrl = (type: string) => {
      // For free tier, we can use Weather Maps 1.0 or create custom overlay
      // Weather Maps 1.0 format: https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
      
      switch (type) {
        case 'temperature':
          return `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
        case 'precipitation':
          return `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
        case 'wind':
          return `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
        case 'clouds':
          return `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
        case 'pressure':
          return `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
        default:
          return `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
      }
    };

    // Remove existing layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Create tile layer
    const weatherTileLayer = L.tileLayer(getTileUrl(layerType), {
      attribution: 'Weather data © OpenWeatherMap',
      opacity: opacity,
      zIndex: 400,
      maxZoom: 18,
    });

    weatherTileLayer.addTo(map);
    layerRef.current = weatherTileLayer;

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [enabled, map, layerType, opacity]);

  return null;
}

