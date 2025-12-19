'use client';

/**
 * City Weather Layer - Municipality-Level Points
 * Renders city markers with weather data
 */

import React, { useEffect, useRef } from 'react';
import { CityData } from '../../data/cityDataBrazil';

interface CityWeatherLayerProps {
  map: any; // Leaflet map instance
  cities: CityData[];
  enabled: boolean;
  minPopulation?: number;
  opacity?: number;
}

export default function CityWeatherLayer({
  map,
  cities,
  enabled,
  minPopulation = 100000,
  opacity = 0.8
}: CityWeatherLayerProps) {
  const markersRef = useRef<any[]>([]);

  // Get color based on temperature
  const getTempColor = (temp: number): string => {
    if (temp < 15) return '#3b82f6';
    if (temp < 20) return '#10b981';
    if (temp < 25) return '#fbbf24';
    if (temp < 30) return '#f97316';
    return '#ef4444';
  };

  useEffect(() => {
    if (!enabled || !map || cities.length === 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current = [];
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Filter cities by population
    const filteredCities = cities.filter(city => city.population >= minPopulation);

    // Render city markers
    filteredCities.forEach(city => {
      const temp = city.climate.avgTemp + city.urbanHeatIslandEffect;
      const color = getTempColor(temp);
      
      // Create marker with city icon
      const marker = L.circleMarker([city.lat, city.lng], {
        radius: Math.log(city.population / 100000) * 3 + 4, // Size based on population
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: opacity,
        fillOpacity: opacity * 0.7
      });

      // Add popup with city info
      marker.bindPopup(`
        <div style="font-size: 12px; color: #0a192f; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: ${color};">
            ${city.name}, ${city.state}
          </h3>
          <div style="margin-bottom: 8px;">
            <strong>${city.stateName}</strong>
          </div>
          
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
            <div><strong>Climate:</strong></div>
            <div>🌡️ Temperature: ${temp.toFixed(1)}°C</div>
            <div style="font-size: 10px; color: #666; margin-left: 20px;">
              (Base: ${city.climate.avgTemp.toFixed(1)}°C + Urban heat: +${city.urbanHeatIslandEffect.toFixed(1)}°C)
            </div>
            <div>🌧️ Rainfall: ${city.climate.avgRain}mm/year</div>
            <div>💧 Humidity: ${city.climate.humidity}%</div>
          </div>
          
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
            <div><strong>Geography:</strong></div>
            <div>Population: ${(city.population / 1000000).toFixed(2)}M</div>
            <div>Elevation: ${city.elevation}m</div>
            <div>Biome: ${city.biome}</div>
          </div>
          
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; font-size: 10px; color: #888;">
            Coordinates: ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}
          </div>
        </div>
      `);

      marker.addTo(map);
      markersRef.current.push(marker);

      // Add city label for major cities (>1M population)
      if (city.population > 1000000) {
        const label = L.marker([city.lat, city.lng], {
          icon: L.divIcon({
            className: 'city-label',
            html: `
              <div style="
                background: rgba(10, 25, 47, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                transform: translateY(-15px);
              ">
                ${city.name}
              </div>
            `,
            iconSize: [80, 15]
          })
        });

        label.addTo(map);
        markersRef.current.push(label);
      }
    });

    return () => {
      markersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [map, cities, enabled, minPopulation, opacity]);

  return null;
}


