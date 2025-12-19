'use client';

/**
 * Gradient Transition Layer - Smooth Interpolation
 * Renders smooth color gradients between regions
 * Uses canvas for performance
 */

import React, { useEffect, useRef } from 'react';

interface GradientPoint {
  lat: number;
  lng: number;
  value: number;
  color: string;
}

interface GradientTransitionLayerProps {
  map: any; // Leaflet map instance
  points: GradientPoint[];
  enabled: boolean;
  opacity?: number;
  metric: 'temperature' | 'precipitation' | 'humidity' | 'wind';
}

export default function GradientTransitionLayer({
  map,
  points,
  enabled,
  opacity = 0.5,
  metric
}: GradientTransitionLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<any>(null);

  // Get color for value based on metric
  const getColorForValue = (value: number, metric: string): [number, number, number, number] => {
    let r = 0, g = 0, b = 0, a = opacity * 255;

    switch (metric) {
      case 'temperature':
        if (value < 15) {
          // Blue (cold)
          r = 59; g = 130; b = 246;
        } else if (value < 20) {
          // Green (cool)
          r = 16; g = 185; b = 129;
        } else if (value < 25) {
          // Yellow (warm)
          r = 251; g = 191; b = 36;
        } else if (value < 30) {
          // Orange (hot)
          r = 249; g = 115; b = 22;
        } else {
          // Red (very hot)
          r = 239; g = 68; b = 68;
        }
        break;
      
      case 'precipitation':
        // Blue gradient based on precipitation
        const precip = Math.min(value / 50, 1);
        r = Math.floor(191 - precip * 130);
        g = Math.floor(219 - precip * 155);
        b = Math.floor(254 - precip * 79);
        break;
      
      case 'humidity':
        // Blue gradient for humidity
        const humid = Math.min((value - 50) / 40, 1);
        r = Math.floor(16 + humid * 43);
        g = Math.floor(185 - humid * 55);
        b = Math.floor(129 + humid * 117);
        break;
      
      case 'wind':
        // Green to red gradient for wind
        const wind = Math.min(value / 40, 1);
        r = Math.floor(16 + wind * 204);
        g = Math.floor(185 - wind * 137);
        b = 129;
        break;
    }

    return [r, g, b, a];
  };

  // IDW interpolation for canvas pixel
  const interpolateValue = (lat: number, lng: number, points: GradientPoint[]): number => {
    if (points.length === 0) return 0;
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const point of points.slice(0, 10)) { // Use nearest 10 points
      const distance = Math.sqrt(
        Math.pow(lat - point.lat, 2) + Math.pow(lng - point.lng, 2)
      );
      
      if (distance < 0.01) return point.value; // Very close to point
      
      const weight = 1 / Math.pow(distance, 2);
      totalWeight += weight;
      weightedSum += point.value * weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  useEffect(() => {
    if (!enabled || !map || points.length === 0) {
      // Remove canvas layer
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Remove existing layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Create canvas overlay
    const CanvasLayer = L.Layer.extend({
      onAdd: function(map: any) {
        const canvas = L.DomUtil.create('canvas', 'gradient-canvas');
        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.pointerEvents = 'none';
        
        this._canvas = canvas;
        this._map = map;
        
        map.getPanes().overlayPane.appendChild(canvas);
        
        // Initial render
        this._render();
        
        // Re-render on map move/zoom
        map.on('move zoom', this._render, this);
      },
      
      onRemove: function(map: any) {
        if (this._canvas) {
          this._canvas.parentNode.removeChild(this._canvas);
        }
        map.off('move zoom', this._render, this);
      },
      
      _render: function() {
        const canvas = this._canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const bounds = this._map.getBounds();
        const size = this._map.getSize();
        
        canvas.width = size.x;
        canvas.height = size.y;
        
        // Create image data
        const imageData = ctx.createImageData(size.x, size.y);
        const data = imageData.data;
        
        // Sample rate (render every N pixels for performance)
        const sampleRate = 4;
        
        for (let y = 0; y < size.y; y += sampleRate) {
          for (let x = 0; x < size.x; x += sampleRate) {
            const point = this._map.containerPointToLatLng([x, y]);
            const lat = point.lat;
            const lng = point.lng;
            
            // Interpolate value at this pixel
            const value = interpolateValue(lat, lng, points);
            const [r, g, b, a] = getColorForValue(value, metric);
            
            // Fill sampleRate x sampleRate block
            for (let dy = 0; dy < sampleRate && y + dy < size.y; dy++) {
              for (let dx = 0; dx < sampleRate && x + dx < size.x; dx++) {
                const index = ((y + dy) * size.x + (x + dx)) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = a;
              }
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
    });

    const canvasLayer = new CanvasLayer();
    canvasLayer.addTo(map);
    layerRef.current = canvasLayer;

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points, enabled, opacity, metric]);

  return null;
}


