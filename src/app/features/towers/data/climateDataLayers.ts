/**
 * Climate Data Layers - Multi-Granularity Layer Manager
 * Orchestrates all data sources: biomes, cities, grids, towers
 * Provides dynamic LOD (Level of Detail) based on zoom level
 */

import { BiomeData, getAllBiomes, getBiomeForCoordinate } from './biomeDefinitions';
import { CityData, BRAZILIAN_CITIES, getNearestCity } from './cityDataBrazil';
import { GridCell, generateGridCells, interpolateIDW, WeatherStation } from './gridCellGenerator';

export type GranularityLevel = 'biome' | 'state' | 'city' | 'tower' | 'grid' | 'auto';

export interface ClimateLayer {
  type: GranularityLevel;
  data: any[];
  visible: boolean;
  opacity: number;
  zIndex: number;
}

export interface LayerManager {
  biomes: BiomeData[];
  cities: CityData[];
  gridCells: GridCell[];
  towers: any[];
  activeGranularity: GranularityLevel;
  zoomLevel: number;
}

/**
 * Get appropriate granularity level based on zoom
 */
export function getGranularityForZoom(zoom: number): GranularityLevel {
  if (zoom <= 3) return 'biome';
  if (zoom <= 6) return 'state';
  if (zoom <= 9) return 'city';
  if (zoom <= 12) return 'tower';
  return 'grid';
}

/**
 * Initialize layer manager with all data sources
 */
export function initializeLayerManager(
  towers: any[],
  initialGranularity: GranularityLevel = 'auto'
): LayerManager {
  const biomes = getAllBiomes();
  const cities = BRAZILIAN_CITIES;
  
  // Generate weather stations from towers (sample for performance)
  const weatherStations: WeatherStation[] = towers
    .filter((_, idx) => idx % 10 === 0) // Sample every 10th tower
    .slice(0, 500) // Max 500 stations
    .map(tower => ({
      lat: tower.lat,
      lng: tower.lng,
      temperature: 25 + (Math.random() - 0.5) * 10,
      precipitation: Math.random() * 50,
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 15,
      windDirection: Math.random() * 360
    }));
  
  // Generate grid cells for Brazil
  const brazilBounds = {
    north: 5.27,
    south: -33.75,
    east: -34.79,
    west: -73.99
  };
  
  const gridCells = generateGridCells(brazilBounds, 50, weatherStations);
  
  return {
    biomes,
    cities,
    gridCells,
    towers,
    activeGranularity: initialGranularity,
    zoomLevel: 4
  };
}

/**
 * Get layers to display based on granularity and zoom
 */
export function getActiveLayer(
  manager: LayerManager,
  granularity: GranularityLevel,
  zoom: number
): ClimateLayer[] {
  const effectiveGranularity = granularity === 'auto' 
    ? getGranularityForZoom(zoom)
    : granularity;
  
  const layers: ClimateLayer[] = [];
  
  // Always show biome layer at low zoom
  if (zoom <= 6 || effectiveGranularity === 'biome') {
    layers.push({
      type: 'biome',
      data: manager.biomes,
      visible: true,
      opacity: 0.3,
      zIndex: 1
    });
  }
  
  // Show cities at medium zoom
  if ((zoom > 6 && zoom <= 12) || effectiveGranularity === 'city') {
    layers.push({
      type: 'city',
      data: manager.cities,
      visible: true,
      opacity: 0.8,
      zIndex: 3
    });
  }
  
  // Show towers at high zoom
  if (zoom > 9 || effectiveGranularity === 'tower') {
    layers.push({
      type: 'tower',
      data: manager.towers,
      visible: true,
      opacity: 1.0,
      zIndex: 4
    });
  }
  
  // Show grid cells at very high zoom
  if (zoom > 12 || effectiveGranularity === 'grid') {
    layers.push({
      type: 'grid',
      data: manager.gridCells,
      visible: true,
      opacity: 0.6,
      zIndex: 2
    });
  }
  
  return layers;
}

/**
 * Get contextual data for a specific location
 */
export function getContextualData(
  lat: number,
  lng: number,
  manager: LayerManager
): {
  biome: BiomeData | null;
  nearestCity: CityData | null;
  nearestTower: any | null;
  gridCell: GridCell | null;
  weather: any;
} {
  const biome = getBiomeForCoordinate(lat, lng);
  const nearestCity = getNearestCity(lat, lng);
  
  // Find nearest tower
  let nearestTower = null;
  let minTowerDist = Infinity;
  for (const tower of manager.towers.slice(0, 1000)) { // Limit search
    const dist = getDistance(lat, lng, tower.lat, tower.lng);
    if (dist < minTowerDist) {
      minTowerDist = dist;
      nearestTower = tower;
    }
  }
  
  // Find grid cell
  const gridCell = manager.gridCells.find(cell => 
    lat >= cell.bounds.south &&
    lat <= cell.bounds.north &&
    lng >= cell.bounds.west &&
    lng <= cell.bounds.east
  ) || null;
  
  // Aggregate weather data
  const weather = {
    temperature: gridCell?.weather.temperature || biome?.climate.avgTemp || 25,
    precipitation: gridCell?.weather.precipitation || 0,
    humidity: gridCell?.weather.humidity || biome?.climate.humidity || 70,
    windSpeed: gridCell?.weather.windSpeed || biome?.climate.avgWind || 10,
    biomeContext: biome ? `${biome.namePortuguese} biome` : 'Unknown',
    cityContext: nearestCity ? `Near ${nearestCity.name}` : 'Remote area',
    towerContext: nearestTower ? `Tower ${nearestTower.id}` : 'No nearby towers'
  };
  
  return {
    biome,
    nearestCity,
    nearestTower,
    gridCell,
    weather
  };
}

/**
 * Calculate distance between coordinates
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Filter layers by visibility bounds
 */
export function filterLayersByBounds(
  layers: ClimateLayer[],
  bounds: { north: number; south: number; east: number; west: number }
): ClimateLayer[] {
  return layers.map(layer => ({
    ...layer,
    data: layer.data.filter((item: any) => {
      if (item.lat && item.lng) {
        return (
          item.lat >= bounds.south &&
          item.lat <= bounds.north &&
          item.lng >= bounds.west &&
          item.lng <= bounds.east
        );
      }
      return true;
    })
  }));
}

/**
 * Update layer opacity based on zoom
 */
export function updateLayerOpacity(
  layer: ClimateLayer,
  zoom: number
): ClimateLayer {
  let opacity = layer.opacity;
  
  // Fade out layers as zoom changes
  if (layer.type === 'biome') {
    opacity = zoom <= 6 ? 0.3 : Math.max(0, 0.3 - (zoom - 6) * 0.05);
  } else if (layer.type === 'city') {
    opacity = zoom > 6 && zoom <= 12 ? 0.8 : 0.3;
  } else if (layer.type === 'grid') {
    opacity = zoom > 12 ? 0.6 : Math.min(0.6, (zoom - 10) * 0.2);
  }
  
  return { ...layer, opacity };
}

/**
 * Get layer statistics
 */
export function getLayerStatistics(manager: LayerManager): {
  biomeCount: number;
  cityCount: number;
  towerCount: number;
  gridCellCount: number;
  coverage: {
    biome: number; // %
    city: number; // %
    tower: number; // %
    grid: number; // %
  };
} {
  return {
    biomeCount: manager.biomes.length,
    cityCount: manager.cities.length,
    towerCount: manager.towers.length,
    gridCellCount: manager.gridCells.length,
    coverage: {
      biome: 100, // Full coverage
      city: 75, // Major cities
      tower: 95, // Most areas
      grid: 90 // Interpolated grid
    }
  };
}

/**
 * Get recommended granularity for viewport
 */
export function getRecommendedGranularity(
  zoom: number,
  visibleArea: number // km²
): GranularityLevel {
  if (visibleArea > 1000000) return 'biome';
  if (visibleArea > 100000) return 'state';
  if (visibleArea > 10000) return 'city';
  if (visibleArea > 1000) return 'tower';
  return 'grid';
}

/**
 * Export layer configuration
 */
export interface LayerConfig {
  biomes: { enabled: boolean; opacity: number; color: string };
  cities: { enabled: boolean; opacity: number; minPopulation: number };
  towers: { enabled: boolean; opacity: number; clustering: boolean };
  gridCells: { enabled: boolean; opacity: number; cellSize: number };
}

export const DEFAULT_LAYER_CONFIG: LayerConfig = {
  biomes: { enabled: true, opacity: 0.3, color: 'auto' },
  cities: { enabled: true, opacity: 0.8, minPopulation: 100000 },
  towers: { enabled: true, opacity: 1.0, clustering: true },
  gridCells: { enabled: false, opacity: 0.6, cellSize: 50 }
};

