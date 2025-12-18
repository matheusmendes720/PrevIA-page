'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ParticleWindAnimationProps {
  map: any; // Leaflet map instance
  weatherStations: Array<{ lat: number; lng: number; windSpeed: number; windDirection?: number }>;
  enabled: boolean;
  particleCount?: number;
  windSpeed?: number; // Animation speed multiplier
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  windDirection: number;
  windSpeed: number;
}

export default function ParticleWindAnimation({
  map,
  weatherStations,
  enabled,
  particleCount = 300,
  windSpeed = 1.0,
}: ParticleWindAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
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

  // Generate particles based on weather stations (with zoom-based count optimization)
  const generateParticles = useCallback(() => {
    if (!map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const particles: Particle[] = [];
    
    // Adjust particle count based on zoom level (performance optimization)
    const zoom = map.getZoom();
    const zoomFactor = zoom < 6 ? 0.5 : zoom < 8 ? 0.75 : 1.0; // Fewer particles at lower zoom
    const adjustedParticleCount = Math.floor(particleCount * zoomFactor);

    // Create particles around weather stations with wind data
    weatherStations.forEach((station) => {
      const pixelPos = latLngToPixel(station.lat, station.lng, map);
      const stationParticleCount = Math.floor(adjustedParticleCount / weatherStations.length) || 5;

      for (let i = 0; i < stationParticleCount; i++) {
        const angle = (station.windDirection || 0) * (Math.PI / 180);
        const speed = (station.windSpeed || 10) * 0.1 * windSpeed;

        particles.push({
          x: pixelPos.x + (Math.random() - 0.5) * 100,
          y: pixelPos.y + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.5,
          life: 100 + Math.random() * 100,
          age: 0,
          windDirection: angle,
          windSpeed: speed,
        });
      }
    });

    particlesRef.current = particles;
  }, [map, weatherStations, particleCount, windSpeed, latLngToPixel]);

  // Animation loop with throttling and viewport culling
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

    // Update canvas size to match map container
    const container = map.getContainer();
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Only resize if dimensions changed (performance optimization)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Get viewport bounds for culling
    const bounds = map.getBounds();
    const sw = map.latLngToContainerPoint(bounds.getSouthWest());
    const ne = map.latLngToContainerPoint(bounds.getNorthEast());
    const viewportPadding = 100; // Padding to render particles slightly outside viewport

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles with viewport culling
    particlesRef.current = particlesRef.current
      .map((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.age += 1;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Viewport culling - only render particles in or near viewport
        const inViewport = particle.x >= sw.x - viewportPadding &&
                          particle.x <= ne.x + viewportPadding &&
                          particle.y >= sw.y - viewportPadding &&
                          particle.y <= ne.y + viewportPadding;

        if (inViewport) {
          // Calculate opacity based on age
          const opacity = Math.max(0, 1 - particle.age / particle.life);

          // Color based on wind speed (blue to red gradient)
          const speedRatio = Math.min(particle.windSpeed / 30, 1);
          const r = Math.floor(59 + speedRatio * 196); // 59-255
          const g = Math.floor(130 - speedRatio * 130); // 130-0
          const b = Math.floor(246 - speedRatio * 246); // 246-0

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`;
          ctx.fill();

          // Draw wind trail (only if visible)
          if (opacity > 0.1) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(
              particle.x - particle.vx * 3,
              particle.y - particle.vy * 3
            );
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Remove dead particles
        if (particle.age >= particle.life) {
          return null;
        }

        return particle;
      })
      .filter((p): p is Particle => p !== null);

    // Regenerate particles if too few
    if (particlesRef.current.length < particleCount * 0.5) {
      generateParticles();
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isPlaying, particleCount, generateParticles]);

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

    generateParticles();
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
  }, [enabled, map, generateParticles, animate]);

  // Handle map move/zoom to update particle positions
  useEffect(() => {
    if (!enabled || !map) return;

    const updateParticles = () => {
      generateParticles();
    };

    map.on('moveend', updateParticles);
    map.on('zoomend', updateParticles);

    return () => {
      map.off('moveend', updateParticles);
      map.off('zoomend', updateParticles);
    };
  }, [enabled, map, generateParticles]);

  if (!enabled) return null;

  return (
    <div className="absolute bottom-5 left-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-2 text-xs z-[600] shadow-lg">
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
          Wind Particles: {particlesRef.current.length}
        </span>
      </div>
    </div>
  );
}

