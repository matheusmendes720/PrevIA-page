'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface RainEffectsAnimationProps {
  map: any; // Leaflet map instance
  weatherStations: Array<{ lat: number; lng: number; precipitation: number }>;
  enabled: boolean;
  intensity?: number; // Rain intensity multiplier
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export default function RainEffectsAnimation({
  map,
  weatherStations,
  enabled,
  intensity = 1.0,
}: RainEffectsAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const raindropsRef = useRef<RainDrop[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Throttle animation to 60fps max (constant)
  const TARGET_FPS = 60;
  const FRAME_DURATION = 1000 / TARGET_FPS;

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = useCallback((lat: number, lng: number, map: any) => {
    if (!map) return { x: 0, y: 0 };
    const point = map.latLngToContainerPoint([lat, lng]);
    return { x: point.x, y: point.y };
  }, []);

  // Generate raindrops based on precipitation
  const generateRaindrops = useCallback(() => {
    if (!map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const raindrops: RainDrop[] = [];

    weatherStations.forEach((station) => {
      if (station.precipitation <= 0) return;

      const pixelPos = latLngToPixel(station.lat, station.lng, map);
      const dropCount = Math.floor(station.precipitation * intensity * 2);

      for (let i = 0; i < dropCount; i++) {
        raindrops.push({
          x: pixelPos.x + (Math.random() - 0.5) * 200,
          y: pixelPos.y + (Math.random() - 0.5) * 200,
          length: 5 + Math.random() * 10,
          speed: 2 + Math.random() * 4 + station.precipitation * 0.5,
          opacity: 0.3 + Math.random() * 0.4,
        });
      }
    });

    raindropsRef.current = raindrops;
  }, [map, weatherStations, intensity, latLngToPixel]);

  // Animation loop with throttling
  const animate = useCallback(() => {
    if (!canvasRef.current || !map || !isPlaying) return;

    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    
    // Throttle to target FPS
    if (deltaTime < FRAME_DURATION) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastUpdateRef.current = now;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update canvas size (only if changed)
    const container = map.getContainer();
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw raindrops
    raindropsRef.current = raindropsRef.current
      .map((drop) => {
        // Update position (falling down)
        drop.y += drop.speed;
        drop.x += Math.sin(drop.y * 0.01) * 0.5; // Slight horizontal movement

        // Wrap around edges
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
        if (drop.x < 0) drop.x = canvas.width;
        if (drop.x > canvas.width) drop.x = 0;

        // Draw raindrop
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(59, 130, 246, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw splash effect at bottom
        if (drop.y > canvas.height - 10) {
          ctx.beginPath();
          ctx.arc(drop.x, canvas.height, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${drop.opacity * 0.5})`;
          ctx.fill();
        }

        return drop;
      })
      .filter((drop) => drop.y < canvas.height + 100);

    // Regenerate raindrops if needed
    if (raindropsRef.current.length < 50) {
      generateRaindrops();
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isPlaying, generateRaindrops]);

  // Initialize canvas overlay
  useEffect(() => {
    if (!enabled || !map) return;

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    canvasRef.current = canvas;

    generateRaindrops();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
    };
  }, [enabled, map, generateRaindrops, animate]);

  // Handle map move/zoom
  useEffect(() => {
    if (!enabled || !map) return;

    const updateRaindrops = () => {
      generateRaindrops();
    };

    map.on('moveend', updateRaindrops);
    map.on('zoomend', updateRaindrops);

    return () => {
      map.off('moveend', updateRaindrops);
      map.off('zoomend', updateRaindrops);
    };
  }, [enabled, map, generateRaindrops]);

  if (!enabled) return null;

  const totalPrecipitation = weatherStations.reduce((sum, s) => sum + s.precipitation, 0);
  const avgPrecipitation = totalPrecipitation / weatherStations.length || 0;

  return (
    <div className="absolute bottom-16 left-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-2 text-xs z-[600] shadow-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-2 py-1 rounded transition ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-brand-cyan text-white'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="text-brand-lightest-slate text-xs">
          🌧️ Rain: {avgPrecipitation.toFixed(1)}mm
        </span>
      </div>
    </div>
  );
}

