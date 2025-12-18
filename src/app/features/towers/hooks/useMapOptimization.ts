'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseMapOptimizationOptions {
  map: any;
  towers: Array<{ lat: number; lng: number; [key: string]: any }>;
  onViewportChange?: (visibleTowers: any[]) => void;
}

export function useMapOptimization({
  map,
  towers,
  onViewportChange,
}: UseMapOptimizationOptions) {
  const [visibleTowers, setVisibleTowers] = useState<any[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getVisibleTowers = useCallback(() => {
    if (!map) return [];

    const bounds = map.getBounds();
    return towers.filter((tower) => {
      return bounds.contains([tower.lat, tower.lng]);
    });
  }, [map, towers]);

  const updateVisibleTowers = useCallback(() => {
    const visible = getVisibleTowers();
    setVisibleTowers(visible);
    onViewportChange?.(visible);
  }, [getVisibleTowers, onViewportChange]);

  useEffect(() => {
    if (!map) return;

    // Initial update
    updateVisibleTowers();

    // Debounced update on map move/zoom
    const handleMapMove = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateVisibleTowers();
      }, 150); // 150ms debounce
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map, updateVisibleTowers]);

  return {
    visibleTowers,
    getVisibleTowers,
  };
}

