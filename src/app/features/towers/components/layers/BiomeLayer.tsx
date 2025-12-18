'use client';

/**
 * Biome Layer - Ecological Region Visualization
 * Renders biome polygons on existing map
 */

import React, { useEffect, useRef } from 'react';
import { BiomeData, getAllBiomes } from '../../data/biomeDefinitions';

interface BiomeLayerProps {
  map: any; // Leaflet map instance
  enabled: boolean;
  opacity?: number;
  showLabels?: boolean;
}

export default function BiomeLayer({
  map,
  enabled,
  opacity = 0.3,
  showLabels = true
}: BiomeLayerProps) {
  const layersRef = useRef<any[]>([]);
  const biomes = getAllBiomes();

  useEffect(() => {
    if (!enabled || !map) {
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

    // Render biome polygons
    biomes.forEach(biome => {
      // Create rectangle polygon for biome bounds
      const bounds = [
        [biome.bounds.south, biome.bounds.west],
        [biome.bounds.north, biome.bounds.east]
      ];

      const polygon = L.rectangle(bounds, {
        color: biome.color,
        fillColor: biome.color,
        fillOpacity: opacity,
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10'
      });

      // Add popup with biome info
      polygon.bindPopup(`
        <div style="font-size: 12px; color: #0a192f; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: ${biome.color};">
            ${biome.namePortuguese}
          </h3>
          <div style="margin-bottom: 8px;">
            <strong>${biome.name}</strong>
          </div>
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
            <div><strong>Climate:</strong></div>
            <div>🌡️ Temperature: ${biome.climate.avgTemp}°C</div>
            <div>🌧️ Rainfall: ${biome.climate.avgRain}mm/year</div>
            <div>💧 Humidity: ${biome.climate.humidity}%</div>
            <div>💨 Wind: ${biome.climate.avgWind}km/h</div>
          </div>
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
            <div><strong>Seasonal Pattern:</strong></div>
            <div>🌧️ Rainy: ${biome.seasonalPatterns.rainy.map(m => `${m}`).join(', ')}</div>
            <div>☀️ Dry: ${biome.seasonalPatterns.dry.map(m => `${m}`).join(', ')}</div>
          </div>
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #666;">
            ${biome.description}
          </div>
          <div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; font-size: 10px; color: #888;">
            Area: ${(biome.area_km2 / 1000).toFixed(0)}k km²
          </div>
        </div>
      `);

      polygon.addTo(map);
      layersRef.current.push(polygon);

      // Add label if enabled
      if (showLabels) {
        const centerLat = (biome.bounds.north + biome.bounds.south) / 2;
        const centerLng = (biome.bounds.east + biome.bounds.west) / 2;

        const label = L.marker([centerLat, centerLng], {
          icon: L.divIcon({
            className: 'biome-label',
            html: `
              <div style="
                background: ${biome.color};
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
              ">
                ${biome.namePortuguese}
              </div>
            `,
            iconSize: [100, 20]
          })
        });

        label.addTo(map);
        layersRef.current.push(label);
      }
    });

    return () => {
      layersRef.current.forEach(layer => {
        if (map) map.removeLayer(layer);
      });
      layersRef.current = [];
    };
  }, [map, enabled, opacity, showLabels, biomes]);

  return null;
}

