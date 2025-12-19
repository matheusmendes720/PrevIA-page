'use client';

/**
 * Climate Operations Context
 * Unified data context for climate and operational data integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BiomeData, getAllBiomes } from '../data/biomeDefinitions';
import { CityData, BRAZILIAN_CITIES } from '../data/cityDataBrazil';
import { GridCell } from '../data/gridCellGenerator';
import { LayerManager, initializeLayerManager, getContextualData, GranularityLevel } from '../data/climateDataLayers';

export interface WeatherImpacts {
  rainfall_to_demand: number; // +60mm → +40% demand for connectors
  humidity_to_corrosion: number; // >80% humidity → +30% corrosion risk
  temp_to_equipment: number; // >30°C → equipment overheating risk
  wind_to_sla: number; // >12km/h → +8% crew time addition
}

export interface SupplyChainData {
  activeAlerts: number;
  demandSpikes: Array<{
    region: string;
    material: string;
    increase: number;
  }>;
  slaRisks: Array<{
    region: string;
    risk: 'low' | 'medium' | 'high';
    cause: string;
  }>;
}

export interface LeadTimeData {
  averageLeadTime: number;
  criticalSuppliers: string[];
  bufferStockDays: number;
}

export interface ClimateOperationsData {
  // Climate data
  biomes: BiomeData[];
  gridCells: GridCell[];
  cityWeather: CityData[];
  
  // Operational data
  towers: any[];
  supplyChain: SupplyChainData;
  leadTimes: LeadTimeData;
  
  // Correlations
  weatherImpacts: WeatherImpacts;
  
  // Layer management
  layerManager: LayerManager | null;
  
  // Active selection
  selectedLocation: {
    lat: number;
    lng: number;
    contextualData: any;
  } | null;
  
  // Granularity control
  activeGranularity: GranularityLevel;
  
  // Loading state
  isLoading: boolean;
}

interface ClimateOperationsContextType extends ClimateOperationsData {
  updateGranularity: (granularity: GranularityLevel) => void;
  selectLocation: (lat: number, lng: number) => void;
  refreshData: () => void;
  updateTowers: (towers: any[]) => void;
}

const DEFAULT_WEATHER_IMPACTS: WeatherImpacts = {
  rainfall_to_demand: 0.40, // +40% demand per +60mm rainfall
  humidity_to_corrosion: 0.30, // +30% corrosion risk above 80% humidity
  temp_to_equipment: 0.25, // +25% overheating risk above 30°C
  wind_to_sla: 0.08, // +8% crew time per km/h above 12 km/h
};

const DEFAULT_SUPPLY_CHAIN: SupplyChainData = {
  activeAlerts: 0,
  demandSpikes: [],
  slaRisks: []
};

const DEFAULT_LEAD_TIME: LeadTimeData = {
  averageLeadTime: 12.3,
  criticalSuppliers: ['Supplier A', 'Supplier D'],
  bufferStockDays: 21
};

const ClimateOperationsContext = createContext<ClimateOperationsContextType | undefined>(undefined);

export function ClimateOperationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClimateOperationsData>({
    biomes: [],
    gridCells: [],
    cityWeather: [],
    towers: [],
    supplyChain: DEFAULT_SUPPLY_CHAIN,
    leadTimes: DEFAULT_LEAD_TIME,
    weatherImpacts: DEFAULT_WEATHER_IMPACTS,
    layerManager: null,
    selectedLocation: null,
    activeGranularity: 'auto',
    isLoading: true
  });

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const biomes = getAllBiomes();
        const cityWeather = BRAZILIAN_CITIES;
        
        setData(prev => ({
          ...prev,
          biomes,
          cityWeather,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error initializing climate operations data:', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeData();
  }, []);

  const updateGranularity = (granularity: GranularityLevel) => {
    setData(prev => ({ ...prev, activeGranularity: granularity }));
  };

  const selectLocation = (lat: number, lng: number) => {
    if (!data.layerManager) return;
    
    const contextualData = getContextualData(lat, lng, data.layerManager);
    
    setData(prev => ({
      ...prev,
      selectedLocation: {
        lat,
        lng,
        contextualData
      }
    }));
  };

  const refreshData = () => {
    setData(prev => ({ ...prev, isLoading: true }));
    // Simulate data refresh
    setTimeout(() => {
      setData(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  const updateTowers = (towers: any[]) => {
    const layerManager = initializeLayerManager(towers, data.activeGranularity);
    
    setData(prev => ({
      ...prev,
      towers,
      layerManager,
      gridCells: layerManager.gridCells
    }));
  };

  const contextValue: ClimateOperationsContextType = {
    ...data,
    updateGranularity,
    selectLocation,
    refreshData,
    updateTowers
  };

  return (
    <ClimateOperationsContext.Provider value={contextValue}>
      {children}
    </ClimateOperationsContext.Provider>
  );
}

export function useClimateOperations() {
  const context = useContext(ClimateOperationsContext);
  if (context === undefined) {
    throw new Error('useClimateOperations must be used within ClimateOperationsProvider');
  }
  return context;
}

// Utility hooks
export function useWeatherImpactCalculator() {
  const { weatherImpacts } = useClimateOperations();
  
  return {
    calculateDemandImpact: (rainfall: number) => {
      if (rainfall > 60) {
        return rainfall * weatherImpacts.rainfall_to_demand;
      }
      return 0;
    },
    calculateCorrosionRisk: (humidity: number) => {
      if (humidity > 80) {
        return (humidity - 80) * weatherImpacts.humidity_to_corrosion;
      }
      return 0;
    },
    calculateEquipmentRisk: (temperature: number) => {
      if (temperature > 30) {
        return (temperature - 30) * weatherImpacts.temp_to_equipment;
      }
      return 0;
    },
    calculateSLAImpact: (windSpeed: number) => {
      if (windSpeed > 12) {
        return (windSpeed - 12) * weatherImpacts.wind_to_sla;
      }
      return 0;
    }
  };
}

export function useBiomeContext(lat: number, lng: number) {
  const { biomes } = useClimateOperations();
  
  const biome = biomes.find(b => 
    lat <= b.bounds.north &&
    lat >= b.bounds.south &&
    lng >= b.bounds.west &&
    lng <= b.bounds.east
  );
  
  return biome || null;
}


