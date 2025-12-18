'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMockHourlyForecast, WeatherForecast } from '../utils/mockWeatherData';

interface WeatherForecastAnimationProps {
  map: any; // Leaflet map instance
  towers: Array<{ lat: number; lng: number; id: string }>;
  enabled: boolean;
  animationSpeed: number; // milliseconds per forecast step
  onForecastUpdate?: (forecast: WeatherForecast, index: number) => void;
}

export default function WeatherForecastAnimation({
  map,
  towers,
  enabled,
  animationSpeed = 2000,
  onForecastUpdate,
}: WeatherForecastAnimationProps) {
  const [forecasts, setForecasts] = useState<Map<string, WeatherForecast[]>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const markersRef = useRef<{ [key: string]: any }>({});
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define clearMarkers first
  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((marker: any) => {
      if (map) map.removeLayer(marker);
    });
    markersRef.current = {};
  }, [map]);

  // Define updateMarkers before it's used in useEffect
  const updateMarkers = useCallback((index: number) => {
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;

    clearMarkers();

    forecasts.forEach((forecastList, towerId) => {
      if (index >= forecastList.length) return;

      const forecast = forecastList[index];
      const tower = towers.find(t => t.id === towerId);
      if (!tower) return;

      const weather = forecast.weather[0];
      const temp = forecast.temp;
      const precipitation = forecast.rain?.['1h'] || forecast.rain?.['3h'] || forecast.snow?.['1h'] || forecast.snow?.['3h'] || 0;
      const windSpeed = forecast.wind_speed * 3.6; // Convert m/s to km/h

      // Color based on temperature
      let color = '#10b981'; // green (normal)
      if (temp > 35) color = '#ef4444'; // red (hot)
      else if (temp > 30) color = '#f97316'; // orange (warm)
      else if (temp < 15) color = '#3b82f6'; // blue (cold)

      // Size based on precipitation
      const radius = precipitation > 0 ? Math.min(15, 8 + precipitation * 2) : 8;

      // Create animated marker
      const marker = L.circleMarker([tower.lat, tower.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
        className: 'weather-forecast-marker',
      });

      // Add pulsing animation
      marker.setStyle({
        fillOpacity: 0.7,
      });

      // Popup with forecast info
      const forecastTime = new Date(forecast.dt * 1000);
      const popupContent = `
        <div style="font-size: 12px; color: #0a192f; min-width: 180px;">
          <strong>Weather Forecast</strong><br>
          <div style="margin-top: 8px;">
            <div><strong>Time:</strong> ${forecastTime.toLocaleString('pt-BR')}</div>
            <div><strong>Condition:</strong> ${weather.description}</div>
            <div><strong>Temperature:</strong> ${temp.toFixed(1)}°C</div>
            <div><strong>Feels Like:</strong> ${forecast.feels_like.toFixed(1)}°C</div>
            ${precipitation > 0 ? `<div><strong>Precipitation:</strong> ${precipitation.toFixed(1)}mm</div>` : ''}
            <div><strong>Humidity:</strong> ${forecast.humidity}%</div>
            <div><strong>Wind:</strong> ${windSpeed.toFixed(1)} km/h</div>
            <div><strong>Pressure:</strong> ${forecast.pressure} hPa</div>
            ${forecast.visibility ? `<div><strong>Visibility:</strong> ${(forecast.visibility / 1000).toFixed(1)} km</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map);
      markersRef.current[towerId] = marker;

      // Add weather icon if available
      if (weather.icon) {
        const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        const iconMarker = L.marker([tower.lat, tower.lng], {
          icon: L.icon({
            iconUrl,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        });
        iconMarker.addTo(map);
        markersRef.current[`${towerId}-icon`] = iconMarker;
      }

      onForecastUpdate?.(forecast, index);
    });
  }, [map, forecasts, towers, clearMarkers, onForecastUpdate]);

  // Load forecasts for sampled towers
  useEffect(() => {
    if (!enabled || !map || towers.length === 0) {
      clearMarkers();
      return;
    }

    const loadForecasts = () => {
      setLoading(true);
      try {
        // Sample towers (every 20th tower for performance)
        const sampledTowers = towers.filter((_, index) => index % 20 === 0).slice(0, 30);
        
        const forecastMap = new Map<string, WeatherForecast[]>();
        
        sampledTowers.forEach((tower) => {
          try {
            const hourlyForecast = getMockHourlyForecast(tower.lat, tower.lng);
            if (hourlyForecast.length > 0) {
              forecastMap.set(tower.id, hourlyForecast);
            }
          } catch (error) {
            console.error(`Error loading forecast for tower ${tower.id}:`, error);
          }
        });

        setForecasts(forecastMap);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading forecasts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForecasts();
  }, [enabled, map, towers, clearMarkers]);

  // Animation loop
  useEffect(() => {
    if (!enabled || !isPlaying || forecasts.size === 0) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }

    const animate = () => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(...Array.from(forecasts.values()).map(f => f.length - 1));
        const newIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
        return newIndex;
      });
    };

    animationIntervalRef.current = setInterval(animate, animationSpeed);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [enabled, isPlaying, forecasts, animationSpeed]);

  // Update markers when index changes
  useEffect(() => {
    if (enabled && forecasts.size > 0) {
      updateMarkers(currentIndex);
    }
  }, [currentIndex, enabled, forecasts, updateMarkers]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  if (!enabled) {
    clearMarkers();
    return null;
  }

  const maxForecastLength = forecasts.size > 0 
    ? Math.max(...Array.from(forecasts.values()).map(f => f.length))
    : 0;

  return (
    <div className="absolute bottom-20 right-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs z-[500] shadow-lg min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-brand-cyan">Forecast Animation</h3>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
        )}
      </div>

      {forecasts.size > 0 && (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brand-slate">Step:</span>
              <span className="text-brand-lightest-slate font-semibold">
                {currentIndex + 1} / {maxForecastLength}
              </span>
            </div>
            <div className="w-full h-2 bg-brand-light-navy rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-cyan transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / maxForecastLength) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleAnimation}
              className={`flex-1 px-3 py-2 rounded transition ${
                isPlaying
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-brand-cyan text-white hover:bg-brand-cyan/80'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={resetAnimation}
              className="px-3 py-2 bg-brand-light-navy/50 text-brand-lightest-slate rounded hover:bg-brand-light-navy transition"
            >
              ↺ Reset
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-brand-cyan/20">
            <div className="text-brand-slate text-xs">
              {forecasts.size} towers • {animationSpeed / 1000}s per step
            </div>
          </div>
        </>
      )}

      {forecasts.size === 0 && !loading && (
        <div className="text-brand-slate text-xs">No forecast data available</div>
      )}
    </div>
  );
}

