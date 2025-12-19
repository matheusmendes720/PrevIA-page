/**
 * Grid Cell Generator
 * Generates interpolated weather grid cells using various algorithms
 * - Voronoi tessellation for organic shapes
 * - IDW (Inverse Distance Weighting) interpolation
 * - Kriging interpolation for precipitation
 */

export interface GridCell {
  id: string;
  centerLat: number;
  centerLng: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  vertices: Array<{ lat: number; lng: number }>;
  weather: {
    temperature: number;
    precipitation: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
  };
  biome?: string;
  confidence: number; // 0-1, interpolation confidence
}

export interface WeatherStation {
  lat: number;
  lng: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
}

/**
 * Generate grid cells using IDW interpolation
 */
export function generateGridCells(
  bounds: { north: number; south: number; east: number; west: number },
  cellSizeKm: number = 50,
  stations: WeatherStation[]
): GridCell[] {
  const cells: GridCell[] = [];
  
  // Calculate approximate cell size in degrees
  const kmPerDegree = 111; // Rough approximation
  const cellSizeDegrees = cellSizeKm / kmPerDegree;
  
  const latSteps = Math.ceil((bounds.north - bounds.south) / cellSizeDegrees);
  const lngSteps = Math.ceil((bounds.east - bounds.west) / cellSizeDegrees);
  
  let cellId = 0;
  
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lngSteps; j++) {
      const south = bounds.south + (i * cellSizeDegrees);
      const north = Math.min(bounds.north, south + cellSizeDegrees);
      const west = bounds.west + (j * cellSizeDegrees);
      const east = Math.min(bounds.east, west + cellSizeDegrees);
      
      const centerLat = (north + south) / 2;
      const centerLng = (east + west) / 2;
      
      // Interpolate weather data for this cell center
      const weather = interpolateIDW(centerLat, centerLng, stations);
      
      // Create cell vertices (rectangle for now, can be Voronoi later)
      const vertices = [
        { lat: north, lng: west },
        { lat: north, lng: east },
        { lat: south, lng: east },
        { lat: south, lng: west }
      ];
      
      cells.push({
        id: `grid-cell-${cellId++}`,
        centerLat,
        centerLng,
        bounds: { north, south, east, west },
        vertices,
        weather,
        confidence: calculateConfidence(centerLat, centerLng, stations)
      });
    }
  }
  
  return cells;
}

/**
 * Inverse Distance Weighting (IDW) interpolation
 * More weight to closer stations
 */
export function interpolateIDW(
  lat: number,
  lng: number,
  stations: WeatherStation[],
  power: number = 2,
  maxDistance: number = 500 // km
): {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
} {
  if (stations.length === 0) {
    return {
      temperature: 25,
      precipitation: 0,
      humidity: 70,
      windSpeed: 10,
      windDirection: 180
    };
  }
  
  let totalWeight = 0;
  let weightedTemp = 0;
  let weightedPrecip = 0;
  let weightedHumidity = 0;
  let weightedWindSpeed = 0;
  let windVectorX = 0;
  let windVectorY = 0;
  
  for (const station of stations) {
    const distance = getDistance(lat, lng, station.lat, station.lng);
    
    // Skip stations too far away
    if (distance > maxDistance) continue;
    
    // Avoid division by zero for exact matches
    const weight = distance < 0.01 ? 1000 : 1 / Math.pow(distance, power);
    
    totalWeight += weight;
    weightedTemp += station.temperature * weight;
    weightedPrecip += station.precipitation * weight;
    weightedHumidity += station.humidity * weight;
    weightedWindSpeed += station.windSpeed * weight;
    
    // Wind direction interpolation (vector averaging)
    const windDir = station.windDirection || 180;
    windVectorX += Math.cos(windDir * Math.PI / 180) * weight;
    windVectorY += Math.sin(windDir * Math.PI / 180) * weight;
  }
  
  if (totalWeight === 0) {
    return {
      temperature: 25,
      precipitation: 0,
      humidity: 70,
      windSpeed: 10,
      windDirection: 180
    };
  }
  
  const windDirection = (Math.atan2(windVectorY, windVectorX) * 180 / Math.PI + 360) % 360;
  
  return {
    temperature: weightedTemp / totalWeight,
    precipitation: weightedPrecip / totalWeight,
    humidity: weightedHumidity / totalWeight,
    windSpeed: weightedWindSpeed / totalWeight,
    windDirection
  };
}

/**
 * Calculate interpolation confidence based on station density
 */
function calculateConfidence(
  lat: number,
  lng: number,
  stations: WeatherStation[]
): number {
  if (stations.length === 0) return 0;
  
  // Find distance to nearest station
  let minDistance = Infinity;
  for (const station of stations) {
    const distance = getDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  // Confidence decreases with distance
  // Full confidence within 50km, drops to 0 at 500km
  const confidence = Math.max(0, Math.min(1, 1 - minDistance / 500));
  return confidence;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
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
 * Add natural variation using simplex noise
 * This prevents uniform blocks and adds organic patterns
 */
export function addNaturalVariation(
  value: number,
  lat: number,
  lng: number,
  variationAmount: number = 0.1
): number {
  // Simple pseudo-random variation based on coordinates
  const seed = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453;
  const noise = (seed - Math.floor(seed)) * 2 - 1; // -1 to 1
  
  const variation = value * variationAmount * noise;
  return value + variation;
}

/**
 * Generate smooth gradient between values
 */
export function generateGradient(
  value1: number,
  value2: number,
  position: number // 0-1
): number {
  // Smooth interpolation using smoothstep
  const smoothPosition = position * position * (3 - 2 * position);
  return value1 + (value2 - value1) * smoothPosition;
}

/**
 * Create Voronoi diagram for organic cell shapes
 * (Simplified version - full implementation would use library like d3-delaunay)
 */
export function createVoronoiCells(
  bounds: { north: number; south: number; east: number; west: number },
  stations: WeatherStation[]
): GridCell[] {
  // This is a placeholder for Voronoi implementation
  // In production, use d3-delaunay or similar library
  
  // For now, return regular grid cells
  return generateGridCells(bounds, 50, stations);
}

/**
 * Kriging interpolation (simplified)
 * Better for precipitation patterns
 */
export function interpolateKriging(
  lat: number,
  lng: number,
  stations: WeatherStation[]
): number {
  // Simplified Kriging - in production, use a proper kriging library
  // For now, use IDW with different power parameter
  const result = interpolateIDW(lat, lng, stations, 1.5);
  return result.precipitation;
}

/**
 * Get color for gradient rendering based on value
 */
export function getGradientColor(
  value: number,
  min: number,
  max: number,
  colorStops: string[]
): string {
  const normalized = (value - min) / (max - min);
  const index = Math.floor(normalized * (colorStops.length - 1));
  const clampedIndex = Math.max(0, Math.min(colorStops.length - 1, index));
  return colorStops[clampedIndex];
}

/**
 * Generate weather stations from existing points
 */
export function createWeatherStationsFromPoints(
  points: Array<{ lat: number; lng: number; [key: string]: any }>
): WeatherStation[] {
  return points.map(point => ({
    lat: point.lat,
    lng: point.lng,
    temperature: point.temperature || 25,
    precipitation: point.precipitation || 0,
    humidity: point.humidity || 70,
    windSpeed: point.windSpeed || 10,
    windDirection: point.windDirection || 180
  }));
}


