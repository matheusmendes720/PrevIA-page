'use client';

/**
 * Layer Orchestrator
 * Central layer management for existing map
 * Controls z-index, visibility, opacity of all layers
 */

import React, { useEffect, useCallback } from 'react';

export interface LayerConfig {
  id: string;
  type: 'biome' | 'grid' | 'city' | 'tower' | 'gradient';
  visible: boolean;
  opacity: number;
  zIndex: number;
  component: React.ComponentType<any>;
  props: any;
}

interface LayerOrchestratorProps {
  map: any; // Leaflet map instance
  layers: LayerConfig[];
  onLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange?: (layerId: string, opacity: number) => void;
}

export default function LayerOrchestrator({
  map,
  layers,
  onLayerVisibilityChange,
  onLayerOpacityChange
}: LayerOrchestratorProps) {
  const layerRefs = React.useRef<Map<string, any>>(new Map());

  // Sort layers by zIndex
  const sortedLayers = React.useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  // Render layers in z-index order
  return (
    <>
      {sortedLayers.map((layer) => {
        if (!layer.visible) return null;
        
        const LayerComponent = layer.component;
        
        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: layer.zIndex,
              opacity: layer.opacity,
              pointerEvents: 'none' // Allow clicks to pass through to map
            }}
          >
            <LayerComponent
              map={map}
              {...layer.props}
              opacity={layer.opacity}
            />
          </div>
        );
      })}
    </>
  );
}

/**
 * Hook to manage layer state
 */
export function useLayerManager(initialLayers: LayerConfig[]) {
  const [layers, setLayers] = React.useState<LayerConfig[]>(initialLayers);

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) }
        : layer
    ));
  }, []);

  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible }
        : layer
    ));
  }, []);

  const updateLayerProps = useCallback((layerId: string, props: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, props: { ...layer.props, ...props } }
        : layer
    ));
  }, []);

  return {
    layers,
    toggleLayer,
    setLayerOpacity,
    setLayerVisibility,
    updateLayerProps
  };
}


