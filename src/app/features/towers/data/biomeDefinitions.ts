/**
 * Brazilian Biome Definitions
 * Source: IBGE (Brazilian Institute of Geography and Statistics)
 * Data includes boundaries, climate characteristics, and seasonal patterns
 */

export interface BiomeBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ClimateCharacteristics {
  avgTemp: number; // °C
  avgRain: number; // mm/year
  humidity: number; // %
  avgWind: number; // km/h
}

export interface SeasonalPattern {
  rainy: number[]; // months (1-12)
  dry: number[]; // months (1-12)
  peak_rain_month: number;
  peak_dry_month: number;
}

export interface BiomeData {
  id: string;
  name: string;
  namePortuguese: string;
  bounds: BiomeBounds;
  climate: ClimateCharacteristics;
  seasonalPatterns: SeasonalPattern;
  color: string; // For visualization
  description: string;
  area_km2: number;
  states: string[]; // Brazilian state codes
}

export const BRAZILIAN_BIOMES: Record<string, BiomeData> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon Rainforest',
    namePortuguese: 'Amazônia',
    bounds: {
      north: 5.27,
      south: -18.0,
      east: -43.0,
      west: -73.99
    },
    climate: {
      avgTemp: 27,
      avgRain: 2300,
      humidity: 85,
      avgWind: 5
    },
    seasonalPatterns: {
      rainy: [12, 1, 2, 3, 4, 5],
      dry: [6, 7, 8, 9, 10],
      peak_rain_month: 3,
      peak_dry_month: 8
    },
    color: '#2d5016',
    description: 'Tropical rainforest with high biodiversity and rainfall',
    area_km2: 4196943,
    states: ['AC', 'AM', 'RR', 'AP', 'PA', 'RO', 'MT', 'MA']
  },
  cerrado: {
    id: 'cerrado',
    name: 'Cerrado',
    namePortuguese: 'Cerrado',
    bounds: {
      north: -2.0,
      south: -24.0,
      east: -41.0,
      west: -60.0
    },
    climate: {
      avgTemp: 24,
      avgRain: 1500,
      humidity: 70,
      avgWind: 8
    },
    seasonalPatterns: {
      rainy: [10, 11, 12, 1, 2, 3],
      dry: [4, 5, 6, 7, 8, 9],
      peak_rain_month: 1,
      peak_dry_month: 7
    },
    color: '#d4a373',
    description: 'Tropical savanna with distinct wet and dry seasons',
    area_km2: 2036448,
    states: ['GO', 'TO', 'MT', 'MS', 'BA', 'PI', 'MA', 'MG', 'SP', 'DF']
  },
  atlanticForest: {
    id: 'atlanticForest',
    name: 'Atlantic Forest',
    namePortuguese: 'Mata Atlântica',
    bounds: {
      north: -5.0,
      south: -30.0,
      east: -34.5,
      west: -55.0
    },
    climate: {
      avgTemp: 21,
      avgRain: 2000,
      humidity: 80,
      avgWind: 10
    },
    seasonalPatterns: {
      rainy: [11, 12, 1, 2, 3],
      dry: [6, 7, 8],
      peak_rain_month: 1,
      peak_dry_month: 7
    },
    color: '#1a4d2e',
    description: 'Coastal rainforest with high rainfall and biodiversity',
    area_km2: 1110182,
    states: ['BA', 'ES', 'RJ', 'SP', 'PR', 'SC', 'RS', 'MG', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE']
  },
  caatinga: {
    id: 'caatinga',
    name: 'Caatinga',
    namePortuguese: 'Caatinga',
    bounds: {
      north: -2.5,
      south: -17.0,
      east: -34.5,
      west: -46.0
    },
    climate: {
      avgTemp: 28,
      avgRain: 800,
      humidity: 60,
      avgWind: 12
    },
    seasonalPatterns: {
      rainy: [1, 2, 3, 4],
      dry: [5, 6, 7, 8, 9, 10, 11, 12],
      peak_rain_month: 3,
      peak_dry_month: 9
    },
    color: '#c9b037',
    description: 'Semi-arid scrubland with irregular rainfall',
    area_km2: 844453,
    states: ['PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'MG']
  },
  pampas: {
    id: 'pampas',
    name: 'Pampas',
    namePortuguese: 'Pampa',
    bounds: {
      north: -28.5,
      south: -34.0,
      east: -49.5,
      west: -57.5
    },
    climate: {
      avgTemp: 17,
      avgRain: 1400,
      humidity: 75,
      avgWind: 15
    },
    seasonalPatterns: {
      rainy: [5, 6, 7, 8, 9, 10],
      dry: [12, 1, 2],
      peak_rain_month: 9,
      peak_dry_month: 1
    },
    color: '#7c9d3f',
    description: 'Temperate grassland with mild winters',
    area_km2: 176496,
    states: ['RS']
  },
  pantanal: {
    id: 'pantanal',
    name: 'Pantanal',
    namePortuguese: 'Pantanal',
    bounds: {
      north: -15.5,
      south: -22.0,
      east: -54.5,
      west: -58.5
    },
    climate: {
      avgTemp: 25,
      avgRain: 1250,
      humidity: 78,
      avgWind: 7
    },
    seasonalPatterns: {
      rainy: [10, 11, 12, 1, 2, 3],
      dry: [4, 5, 6, 7, 8, 9],
      peak_rain_month: 1,
      peak_dry_month: 7
    },
    color: '#4a7c59',
    description: 'Tropical wetland with seasonal flooding',
    area_km2: 150355,
    states: ['MT', 'MS']
  }
};

/**
 * Get biome for a specific coordinate
 */
export function getBiomeForCoordinate(lat: number, lng: number): BiomeData | null {
  for (const biome of Object.values(BRAZILIAN_BIOMES)) {
    if (
      lat <= biome.bounds.north &&
      lat >= biome.bounds.south &&
      lng >= biome.bounds.west &&
      lng <= biome.bounds.east
    ) {
      return biome;
    }
  }
  return null;
}

/**
 * Get biome by ID
 */
export function getBiomeById(id: string): BiomeData | null {
  return BRAZILIAN_BIOMES[id] || null;
}

/**
 * Get all biomes as array
 */
export function getAllBiomes(): BiomeData[] {
  return Object.values(BRAZILIAN_BIOMES);
}

/**
 * Check if coordinate is in specific biome
 */
export function isInBiome(lat: number, lng: number, biomeId: string): boolean {
  const biome = BRAZILIAN_BIOMES[biomeId];
  if (!biome) return false;
  
  return (
    lat <= biome.bounds.north &&
    lat >= biome.bounds.south &&
    lng >= biome.bounds.west &&
    lng <= biome.bounds.east
  );
}

/**
 * Get seasonal information for current date in biome
 */
export function getSeasonalInfo(biomeId: string, date: Date = new Date()): {
  season: 'rainy' | 'dry' | 'transition';
  month: number;
  description: string;
} {
  const biome = BRAZILIAN_BIOMES[biomeId];
  if (!biome) {
    return { season: 'transition', month: date.getMonth() + 1, description: 'Unknown' };
  }

  const month = date.getMonth() + 1; // 1-12
  
  if (biome.seasonalPatterns.rainy.includes(month)) {
    return {
      season: 'rainy',
      month,
      description: `Rainy season in ${biome.namePortuguese}`
    };
  } else if (biome.seasonalPatterns.dry.includes(month)) {
    return {
      season: 'dry',
      month,
      description: `Dry season in ${biome.namePortuguese}`
    };
  }
  
  return {
    season: 'transition',
    month,
    description: `Transition period in ${biome.namePortuguese}`
  };
}

