'use client';

/**
 * Gradient Transition Animation
 * Smooth color transitions for weather changes
 */

import React, { useEffect, useRef, useState } from 'react';

interface GradientTransitionAnimationProps {
  map: any;
  enabled: boolean;
  fromColor: string;
  toColor: string;
  duration?: number; // ms
  onComplete?: () => void;
}

export default function GradientTransitionAnimation({
  map,
  enabled,
  fromColor,
  toColor,
  duration = 2000,
  onComplete
}: GradientTransitionAnimationProps) {
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const layerRef = useRef<any>(null);

  // Easing function (cubic ease-in-out)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Interpolate between two colors
  const interpolateColor = (color1: string, color2: string, progress: number): string => {
    // Parse hex colors
    const c1 = parseInt(color1.replace('#', ''), 16);
    const c2 = parseInt(color2.replace('#', ''), 16);
    
    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;
    
    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    if (!enabled || !map) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

    // Create canvas overlay for gradient animation
    const CanvasLayer = L.Layer.extend({
      onAdd: function(map: any) {
        const canvas = L.DomUtil.create('canvas', 'gradient-animation-canvas');
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
        
        map.on('move zoom', this._resize, this);
        this._resize();
      },
      
      onRemove: function(map: any) {
        if (this._canvas) {
          this._canvas.parentNode.removeChild(this._canvas);
        }
        map.off('move zoom', this._resize, this);
      },
      
      _resize: function() {
        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
      },
      
      updateGradient: function(color: string, alpha: number) {
        const ctx = this._canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
      }
    });

    const canvasLayer = new CanvasLayer();
    canvasLayer.addTo(map);
    layerRef.current = canvasLayer;

    // Animation loop
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(rawProgress);
      
      setProgress(easedProgress);

      const currentColor = interpolateColor(fromColor, toColor, easedProgress);
      if (layerRef.current) {
        layerRef.current.updateGradient(currentColor, 0.3);
      }

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = null;
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, enabled, fromColor, toColor, duration, onComplete]);

  return null;
}


