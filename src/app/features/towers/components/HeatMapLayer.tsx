'use client';

import React, { useEffect, useRef } from 'react';

interface HeatMapLayerProps {
  map: any; // Leaflet map instance
  towers: Array<{ lat: number; lng: number; id: string; [key: string]: any }>;
  enabled: boolean;
  type: 'coverage' | 'maintenance' | 'weather' | 'economic' | '5g';
}

export default function HeatMapLayer({ map, towers, enabled, type }: HeatMapLayerProps) {
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !map || towers.length === 0) {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Create heat map data points
    const heatMapData = towers.map((tower) => {
      let intensity = 0.5;

      switch (type) {
        case 'coverage':
          intensity = (tower.signalStrength || 50) / 100;
          break;
        case 'maintenance':
          intensity = tower.priority === 'High' ? 1 : tower.priority === 'Medium' ? 0.6 : 0.3;
          break;
        case 'weather':
          // This would use actual weather risk data
          intensity = Math.random() * 0.5 + 0.3;
          break;
        case 'economic':
          // This would use economic value data
          intensity = Math.random() * 0.5 + 0.3;
          break;
        case '5g':
          // This would use 5G expansion priority data
          intensity = Math.random() * 0.5 + 0.3;
          break;
      }

      return [tower.lat, tower.lng, intensity];
    });

    // Check if Leaflet.heat plugin is available
    if (typeof (L as any).heatLayer === 'function') {
      // Remove existing layer
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }

      // Create heat layer
      const heatLayer = (L as any).heatLayer(heatMapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: getGradientForType(type),
      });

      heatLayer.addTo(map);
      layerRef.current = heatLayer;
    } else {
      // Fallback: Use circle markers with opacity
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }

      const markerGroup = L.layerGroup();
      heatMapData.forEach(([lat, lng, intensity]) => {
        const color = getColorForIntensity(intensity, type);
        const circle = L.circle([lat, lng], {
          radius: 1000,
          fillColor: color,
          color: color,
          weight: 0,
          fillOpacity: intensity * 0.6,
        });
        circle.addTo(markerGroup);
      });

      markerGroup.addTo(map);
      layerRef.current = markerGroup;
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [enabled, map, towers, type]);

  return null;
}

function getGradientForType(type: string): { [key: number]: string } {
  switch (type) {
    case 'coverage':
      return {
        0.0: 'rgba(239, 68, 68, 0)',
        0.3: 'rgba(239, 68, 68, 0.3)',
        0.6: 'rgba(249, 115, 22, 0.5)',
        1.0: 'rgba(16, 185, 129, 0.8)',
      };
    case 'maintenance':
      return {
        0.0: 'rgba(16, 185, 129, 0)',
        0.3: 'rgba(16, 185, 129, 0.3)',
        0.6: 'rgba(249, 115, 22, 0.5)',
        1.0: 'rgba(239, 68, 68, 0.8)',
      };
    case 'weather':
      return {
        0.0: 'rgba(16, 185, 129, 0)',
        0.3: 'rgba(59, 130, 246, 0.3)',
        0.6: 'rgba(249, 115, 22, 0.5)',
        1.0: 'rgba(239, 68, 68, 0.8)',
      };
    default:
      return {
        0.0: 'rgba(59, 130, 246, 0)',
        0.3: 'rgba(59, 130, 246, 0.3)',
        0.6: 'rgba(139, 92, 246, 0.5)',
        1.0: 'rgba(139, 92, 246, 0.8)',
      };
  }
}

function getColorForIntensity(intensity: number, type: string): string {
  if (intensity > 0.7) {
    return type === 'coverage' ? '#10b981' : '#ef4444';
  } else if (intensity > 0.4) {
    return '#f97316';
  } else {
    return type === 'coverage' ? '#ef4444' : '#10b981';
  }
}

