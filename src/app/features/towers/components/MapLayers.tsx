'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MapLayersProps {
  map: any;
  baseMap: 'osm' | 'satellite' | 'terrain';
  showClusters: boolean;
  showZoneBoundaries: boolean;
  showCoverageRadius: boolean;
  onBaseMapChange: (map: 'osm' | 'satellite' | 'terrain') => void;
  onClustersToggle: (enabled: boolean) => void;
  onZoneBoundariesToggle: (enabled: boolean) => void;
  onCoverageRadiusToggle: (enabled: boolean) => void;
}

export default function MapLayers({
  map,
  baseMap,
  showClusters,
  showZoneBoundaries,
  showCoverageRadius,
  onBaseMapChange,
  onClustersToggle,
  onZoneBoundariesToggle,
  onCoverageRadiusToggle,
}: MapLayersProps) {
  const baseLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove existing base layer
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    // Add new base layer
    let tileUrl = '';
    let attribution = '';

    switch (baseMap) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = '© Esri';
        break;
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = '© OpenTopoMap';
        break;
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '© OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    });

    newLayer.addTo(map);
    baseLayerRef.current = newLayer;
  }, [map, baseMap]);

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs">
      <h3 className="text-sm font-semibold mb-4 text-brand-cyan">Map Layers</h3>

      {/* Base Map Selection */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">Base Map</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onBaseMapChange('osm')}
            className={`px-3 py-2 rounded transition ${
              baseMap === 'osm'
                ? 'bg-brand-cyan text-white'
                : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
            }`}
          >
            OSM
          </button>
          <button
            onClick={() => onBaseMapChange('satellite')}
            className={`px-3 py-2 rounded transition ${
              baseMap === 'satellite'
                ? 'bg-brand-cyan text-white'
                : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => onBaseMapChange('terrain')}
            className={`px-3 py-2 rounded transition ${
              baseMap === 'terrain'
                ? 'bg-brand-cyan text-white'
                : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-brand-lightest-slate">Tower Clusters</span>
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => onClustersToggle(e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-brand-lightest-slate">Zone Boundaries</span>
          <input
            type="checkbox"
            checked={showZoneBoundaries}
            onChange={(e) => onZoneBoundariesToggle(e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-brand-lightest-slate">Coverage Radius</span>
          <input
            type="checkbox"
            checked={showCoverageRadius}
            onChange={(e) => onCoverageRadiusToggle(e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

