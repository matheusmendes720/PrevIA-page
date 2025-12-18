/**
 * Temporal Data Context
 * Centralized state management for temporal analytics
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { generateNovaCorrenteDataset } from '../data/novaCorrenteDataGenerator';
import type { GeneratedDataset, TemporalAnalysisState } from '../types/temporal.types';

interface TemporalDataContextValue {
  // Data
  dataset: GeneratedDataset;
  
  // State
  state: TemporalAnalysisState;
  
  // Actions
  setDateRange: (start: string, end: string) => void;
  setSelectedSupplier: (supplierId: string | null) => void;
  setSelectedMaterial: (material: string | null) => void;
  setActiveTab: (tab: string) => void;
  setLoading: (tab: string, loading: boolean) => void;
  setError: (tab: string, error: string | null) => void;
  cacheResult: (key: string, value: any) => void;
  getCachedResult: (key: string) => any;
  clearCache: () => void;
  regenerateData: () => void;
}

const TemporalDataContext = createContext<TemporalDataContextValue | undefined>(undefined);

interface TemporalDataProviderProps {
  children: ReactNode;
}

export function TemporalDataProvider({ children }: TemporalDataProviderProps) {
  // Get initial dataset with real Nova Corrente data
  const [dataset, setDataset] = useState<GeneratedDataset>(() => generateNovaCorrenteDataset());
  
  // Initialize state with dataset date range
  const initialDateRange = useMemo(() => {
    if (dataset?.timeSeries?.startDate && dataset?.timeSeries?.endDate) {
      return {
        start: dataset.timeSeries.startDate,
        end: dataset.timeSeries.endDate
      };
    }
    // Fallback to default dates if dataset is not properly initialized
    return {
      start: '2023-10-01',
      end: '2025-03-31'
    };
  }, [dataset]);
  
  const [state, setState] = useState<TemporalAnalysisState>({
    dateRange: initialDateRange,
    selectedSupplier: null,
    selectedMaterial: null,
    activeTab: 'overview',
    calculationCache: {},
    loadingStates: {},
    errors: {}
  });
  
  // Actions
  const setDateRange = useCallback((start: string, end: string) => {
    setState(prev => ({
      ...prev,
      dateRange: { start, end },
      calculationCache: {} // Clear cache on date range change
    }));
  }, []);
  
  const setSelectedSupplier = useCallback((supplierId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedSupplier: supplierId
    }));
  }, []);
  
  const setSelectedMaterial = useCallback((material: string | null) => {
    setState(prev => ({
      ...prev,
      selectedMaterial: material
    }));
  }, []);
  
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);
  
  const setLoading = useCallback((tab: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loadingStates: {
        ...prev.loadingStates,
        [tab]: loading
      }
    }));
  }, []);
  
  const setError = useCallback((tab: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [tab]: error
      }
    }));
  }, []);
  
  const cacheResult = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      calculationCache: {
        ...prev.calculationCache,
        [key]: value
      }
    }));
  }, []);
  
  const getCachedResult = useCallback((key: string) => {
    return state.calculationCache[key];
  }, [state.calculationCache]);
  
  const clearCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      calculationCache: {}
    }));
  }, []);
  
  const regenerateData = useCallback(() => {
    const newDataset = generateNovaCorrenteDataset();
    setDataset(newDataset);
    setState(prev => ({
      ...prev,
      dateRange: {
        start: newDataset.timeSeries.startDate,
        end: newDataset.timeSeries.endDate
      },
      calculationCache: {},
      loadingStates: {},
      errors: {}
    }));
  }, []);
  
  const value: TemporalDataContextValue = {
    dataset,
    state,
    setDateRange,
    setSelectedSupplier,
    setSelectedMaterial,
    setActiveTab,
    setLoading,
    setError,
    cacheResult,
    getCachedResult,
    clearCache,
    regenerateData
  };
  
  return (
    <TemporalDataContext.Provider value={value}>
      {children}
    </TemporalDataContext.Provider>
  );
}

export function useTemporalData(): TemporalDataContextValue {
  const context = useContext(TemporalDataContext);
  if (!context) {
    throw new Error('useTemporalData must be used within a TemporalDataProvider');
  }
  return context;
}

// Hook to get filtered data based on current state
export function useFilteredData() {
  const { dataset, state } = useTemporalData();
  
  return useMemo(() => {
    const { dateRange, selectedSupplier, selectedMaterial } = state;
    
    // Ensure dataset and timeSeries exist
    if (!dataset || !dataset.timeSeries || !dataset.timeSeries.data) {
      return {
        timeSeries: [],
        leadTimeData: [],
        demandData: [],
        events: [],
        suppliers: [],
        timestamps: [],
        values: []
      };
    }
    
    // Filter time series data
    const filteredTimeSeries = dataset.timeSeries.data.filter(point => {
      return point.timestamp >= dateRange.start && point.timestamp <= dateRange.end;
    });
    
    // Filter lead time data
    const filteredLeadTime = (dataset.leadTimeData || []).filter(item => {
      const dateMatch = item.timestamp >= dateRange.start && item.timestamp <= dateRange.end;
      const supplierMatch = !selectedSupplier || item.supplierId === selectedSupplier;
      const materialMatch = !selectedMaterial || item.material === selectedMaterial;
      return dateMatch && supplierMatch && materialMatch;
    });
    
    // Filter demand data
    const filteredDemand = (dataset.demandData || []).filter(item => {
      const dateMatch = item.timestamp >= dateRange.start && item.timestamp <= dateRange.end;
      const materialMatch = !selectedMaterial || item.material === selectedMaterial;
      return dateMatch && materialMatch;
    });
    
    // Filter events
    const filteredEvents = (dataset.events || []).filter(event => {
      return event.date >= dateRange.start && event.date <= dateRange.end;
    });
    
    // Filter suppliers
    const filteredSuppliers = selectedSupplier
      ? (dataset.suppliers || []).filter(s => s.id === selectedSupplier)
      : (dataset.suppliers || []);
    
    return {
      timeSeries: filteredTimeSeries,
      leadTimeData: filteredLeadTime,
      demandData: filteredDemand,
      events: filteredEvents,
      suppliers: filteredSuppliers,
      timestamps: filteredTimeSeries.map(p => p.timestamp),
      values: filteredTimeSeries.map(p => p.value)
    };
  }, [dataset, state]);
}

