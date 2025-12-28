'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { generateMockTowers, generateMockStats, Tower } from './utils/mockTowerData';
import WeatherLayer from './components/WeatherLayer';
import WeatherControls from './components/WeatherControls';
import WeatherForecastAnimation from './components/WeatherForecastAnimation';
import ParticleWindAnimation from './components/ParticleWindAnimation';
import RainEffectsAnimation from './components/RainEffectsAnimation';
import TemporalPlaybackAnimation from './components/TemporalPlaybackAnimation';
import WeatherMapLayer from './components/WeatherMapLayer';
import ClimateTrends from './components/ClimateTrends';
// New layer imports
import BiomeLayer from './components/layers/BiomeLayer';
import GridCellLayer from './components/layers/GridCellLayer';
import CityWeatherLayer from './components/layers/CityWeatherLayer';
import GradientTransitionLayer from './components/layers/GradientTransitionLayer';
import GradientTransitionAnimation from './components/animations/GradientTransitionAnimation';
import PredictiveForecastOverlay from './components/animations/PredictiveForecastOverlay';
import OperationalImpactOverlay, { generateOperationalAlerts } from './components/correlations/OperationalImpactOverlay';
import { ClimateOperationsProvider } from './context/ClimateOperationsContext';
import { initializeLayerManager, getGranularityForZoom } from './data/climateDataLayers';
import { BRAZILIAN_CITIES } from './data/cityDataBrazil';
import TimeRangeSelector, { TimeRangePreset } from './components/TimeRangeSelector';
import TemporalFilters from './components/TemporalFilters';
import MLFilters from './components/MLFilters';
import TowerCard from './components/TowerCard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import HeatMapLayer from './components/HeatMapLayer';
import MapLayers from './components/MapLayers';
import AlertPanel from './components/AlertPanel';
import { useTemporalAnimation } from './hooks/useTemporalAnimation';
import { useMapOptimization } from './hooks/useMapOptimization';
import { ErrorBoundary } from './components/ErrorBoundary';
import { exportToCSV, exportToJSON, exportToPDF } from './utils/exportUtils';

// Lazy load heavy components
const PredictiveCharts = dynamic(() => import('./components/PredictiveCharts'), { ssr: false });

export default function TowersPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const markerClusterRef = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  
  // Basic filters
  const [filters, setFilters] = useState({
    active: true,
    maintenance: true,
    inactive: true,
    high: true,
    medium: true,
    low: true,
  });
  const [zoneFilters, setZoneFilters] = useState<{ [key: string]: boolean }>({});
  
  // Weather state
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherMetric, setWeatherMetric] = useState<'temperature' | 'precipitation' | 'wind' | 'humidity'>('temperature');
  const [weatherTimeRange, setWeatherTimeRange] = useState<'current' | '24h' | '7d' | '30d'>('current');
  const [showWeatherMapLayer, setShowWeatherMapLayer] = useState(false);
  const [showForecastAnimation, setShowForecastAnimation] = useState(false);
  const [showParticleWind, setShowParticleWind] = useState(false);
  const [showRainEffects, setShowRainEffects] = useState(false);
  const [showTemporalPlayback, setShowTemporalPlayback] = useState(false);
  
  // New layer state for natural distributions
  const [granularity, setGranularity] = useState<'auto' | 'biome' | 'state' | 'city' | 'tower' | 'grid'>('auto');
  const [showBiomeLayer, setShowBiomeLayer] = useState(false);
  const [showCityLayer, setShowCityLayer] = useState(false);
  const [showGridLayer, setShowGridLayer] = useState(false);
  const [showGradientLayer, setShowGradientLayer] = useState(false);
  const [showPredictiveForecast, setShowPredictiveForecast] = useState(false);
  const [showOperationalImpacts, setShowOperationalImpacts] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [layerManager, setLayerManager] = useState<any>(null);
  const [gridCells, setGridCells] = useState<any[]>([]);
  const [operationalAlerts, setOperationalAlerts] = useState<any[]>([]);
  
  // Temporal state
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('30d');
  const [temporalFilters, setTemporalFilters] = useState({
    maintenanceDateRange: null as { start: string; end: string } | null,
    nextMaintenanceDays: null as number | null,
    showOverdue: false,
    seasonalPattern: 'all' as 'all' | 'rainy' | 'summer' | 'dry',
  });
  
  // ML filters state
  const [mlFilters, setMLFilters] = useState({
    maintenanceRiskMin: 0,
    maintenanceRiskMax: 100,
    coverageGap: false,
    highDemand: false,
    lowDemand: false,
    fiveGCandidates: false,
    corrosionRisk: 'all' as 'all' | 'low' | 'medium' | 'high',
    disruptionRisk: 'all' as 'all' | 'low' | 'medium' | 'high',
    highValueRegions: false,
  });
  
  // Map layers state
  const [baseMap, setBaseMap] = useState<'osm' | 'satellite' | 'terrain'>('osm');
  const [showClusters, setShowClusters] = useState(true); // Enabled by default for better visualization
  const [showZoneBoundaries, setShowZoneBoundaries] = useState(false);
  const [showCoverageRadius, setShowCoverageRadius] = useState(false);
  const [heatMapType, setHeatMapType] = useState<'coverage' | 'maintenance' | 'weather' | 'economic' | '5g' | null>(null);
  
  // UI state
  const [showExecutiveDashboard, setShowExecutiveDashboard] = useState(false);
  const [showPredictiveCharts, setShowPredictiveCharts] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'filters' | 'weather' | 'temporal' | 'ml' | 'layers'>('filters');
  const [towerSortBy, setTowerSortBy] = useState<'recent' | 'priority' | 'status' | 'name'>('recent');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Data state
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredTowers, setFilteredTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  });
  
  // Alerts state
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    region?: string;
    towerId?: string;
    read: boolean;
  }>>([]);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Color map for status
  const statusColors = useMemo(() => ({
    active: '#10b981',
    maintenance: '#f97316',
    inactive: '#8892b0'
  }), []);

  // Temporal animation
  const temporalAnimation = useTemporalAnimation({
    startDate: timeRange.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: timeRange.end || new Date().toISOString().split('T')[0],
    speed: 2,
    onDateChange: (date) => {
      // Update visualization based on date
    },
  });

  // Load towers from mock data
  useEffect(() => {
    const loadTowers = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate mock towers (18,500)
        const mockTowers = generateMockTowers();
        setTowers(mockTowers);
        
        // Initialize layer manager with towers
        const manager = initializeLayerManager(mockTowers, granularity);
        setLayerManager(manager);
        setGridCells(manager.gridCells);
        
        // Generate operational alerts from weather data
        const weatherData = mockTowers.slice(0, 100).map(t => {
          const { getMockRealtimeWeather } = require('./utils/mockWeatherData');
          const weather = getMockRealtimeWeather(t.lat, t.lng);
          return {
            lat: t.lat,
            lng: t.lng,
            temperature: weather.temperature,
            precipitation: weather.precipitation,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed
          };
        });
        const alerts = generateOperationalAlerts(weatherData);
        setOperationalAlerts(alerts);
        
        // Generate mock stats
        const mockStats = generateMockStats(mockTowers);
        setStats({
          total: mockStats.total_towers,
          active: mockStats.by_status?.active || 0,
          maintenance: mockStats.by_status?.maintenance || 0,
          inactive: mockStats.by_status?.inactive || 0,
        });
        
        // Setup zone filters from mock data
        const uniqueStates = new Set<string>();
        mockTowers.forEach(tower => {
          if (tower.state && tower.stateName) {
            uniqueStates.add(`${tower.state} - ${tower.stateName}`);
          }
        });
        
        const initialZoneFilters: { [key: string]: boolean } = {};
        uniqueStates.forEach(state => {
          initialZoneFilters[state] = true;
        });
        setZoneFilters(initialZoneFilters);
        
        console.log('✅ Loaded', mockTowers.length, 'mock towers');
        console.log('✅ Initialized', manager.gridCells.length, 'grid cells');
        console.log('✅ Generated', alerts.length, 'operational alerts');
        console.log('📍 Sample coordinates:', mockTowers.slice(0, 5).map(t => `${t.id}: (${t.lat.toFixed(4)}, ${t.lng.toFixed(4)})`));
      } catch (err) {
        console.error('Error loading mock towers:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadTowers();
  }, []);

  // Generate mock alerts
  useEffect(() => {
    if (towers.length > 0) {
      const mockAlerts = [
        {
          id: '1',
          type: 'critical' as const,
          title: 'Tower Down',
          message: 'Tower NCA-000123 is offline',
          timestamp: new Date(),
          towerId: 'NCA-000123',
          region: 'São Paulo Metro',
          read: false,
        },
        {
          id: '2',
          type: 'warning' as const,
          title: 'Maintenance Overdue',
          message: '5 towers require immediate maintenance',
          timestamp: new Date(Date.now() - 3600000),
          read: false,
        },
      ];
      setAlerts(mockAlerts);
    }
  }, [towers.length]);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Standardize font sizes
  useEffect(() => {
    const applyFontSizes = () => {
      // Header h1
      const headerH1 = document.querySelector('.towers-sidebar h1');
      if (headerH1) {
        (headerH1 as HTMLElement).style.setProperty('font-size', '18px', 'important');
        (headerH1 as HTMLElement).style.setProperty('font-weight', '600', 'important');
      }

      // Stats values (text-2xl) - keep at 24px which is correct
      document.querySelectorAll('.towers-sidebar .text-2xl').forEach((el) => {
        (el as HTMLElement).style.setProperty('font-size', '24px', 'important');
        (el as HTMLElement).style.setProperty('font-weight', '600', 'important');
      });
    };

    applyFontSizes();
    const interval = setInterval(applyFontSizes, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || isInitialized || typeof window === 'undefined') return;

    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapContainerRef.current).setView([-14.235, -51.925], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Track zoom changes for auto granularity
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      
      // Auto-adjust granularity based on zoom
      if (granularity === 'auto') {
        const autoGranularity = getGranularityForZoom(zoom);
        console.log(`🔍 Zoom ${zoom} → Auto granularity: ${autoGranularity}`);
      }
    });

    mapRef.current = map;
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeafletLoaded, isInitialized]);

  // Map optimization
  const { visibleTowers } = useMapOptimization({
    map: mapRef.current,
    towers: filteredTowers,
  });

  // Show tower info handler
  const showTowerInfo = useCallback((tower: Tower) => {
    setSelectedTowerId(tower.id);
    const marker = markersRef.current[tower.id];
    if (marker) {
      marker.setRadius(10);
      marker.setStyle({ weight: 3 });
      Object.entries(markersRef.current).forEach(([id, m]: [string, any]) => {
        if (id !== tower.id) {
          m.setRadius(6);
          m.setStyle({ weight: 2 });
        }
      });
    }
  }, []);

  // Add markers to map with clustering
  const addMarkersToMap = useCallback((towersToShow: Tower[]) => {
    if (!mapRef.current || typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L) return;

    // Remove existing cluster group
    if (markerClusterRef.current) {
      mapRef.current.removeLayer(markerClusterRef.current);
      markerClusterRef.current = null;
    }

    // Clear individual markers
    Object.values(markersRef.current).forEach((marker: any) => {
      if (mapRef.current && mapRef.current.hasLayer(marker)) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Create marker cluster group if clustering is enabled and available
    const MarkerClusterGroup = (L as any).markerClusterGroup;
    const shouldCluster = showClusters && MarkerClusterGroup;
    const clusterGroup = shouldCluster ? new MarkerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 100) size = 'large';
        else if (count > 50) size = 'medium';
        
        return L.divIcon({
          html: `<div style="background-color: rgba(6, 182, 212, 0.8); color: white; border-radius: 50%; width: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'}; height: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${size === 'large' ? '14px' : '12px'}; border: 2px solid white;">${count}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(size === 'large' ? 50 : size === 'medium' ? 40 : 30, size === 'large' ? 50 : size === 'medium' ? 40 : 30),
        });
      },
    }) : null;

    // Create markers for all towers
    towersToShow.forEach(tower => {
      // Validate coordinates
      if (isNaN(tower.lat) || isNaN(tower.lng) || tower.lat === 0 || tower.lng === 0) {
        console.warn(`⚠️ Invalid coordinates for tower ${tower.id}: lat=${tower.lat}, lng=${tower.lng}`);
        return; // Skip invalid coordinates
      }

      const marker = L.circleMarker([tower.lat, tower.lng], {
        radius: 6,
        fillColor: statusColors[tower.status],
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.8
      });

      marker.bindPopup(`
        <div style="font-size: 12px; color: #0a192f;">
          <strong>${tower.id}</strong><br>
          Region: ${tower.region}<br>
          State: ${tower.stateName || tower.state}<br>
          Height: ${tower.height.toFixed(1)}m<br>
          Status: <strong>${tower.status.toUpperCase()}</strong>
        </div>
      `);

      marker.on('click', () => showTowerInfo(tower));
      markersRef.current[tower.id] = marker;
      
      // Add to cluster group if clustering enabled, otherwise add directly to map
      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(mapRef.current);
      }
    });

    // Add cluster group to map if clustering enabled
    if (clusterGroup) {
      clusterGroup.addTo(mapRef.current);
      markerClusterRef.current = clusterGroup;
    }

    // Fit map bounds to show all markers
    if (towersToShow.length > 0 && mapRef.current) {
      try {
        const bounds = L.latLngBounds(towersToShow.map(t => [t.lat, t.lng]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [showTowerInfo, statusColors, showClusters]);

  // Filter towers with all filters
  useEffect(() => {
    if (!towers || towers.length === 0) {
      setFilteredTowers([]);
      return;
    }
    
    let filtered = towers.filter(tower => {
      const statusMatch = filters[tower.status];
      const priorityMatch = filters[tower.priority.toLowerCase() as 'high' | 'medium' | 'low'];
      
      const stateName = tower.state && tower.stateName 
        ? `${tower.state} - ${tower.stateName}` 
        : tower.zone;
      const zoneMatch = zoneFilters[stateName] ?? true;
      
      const searchMatch = searchTerm === '' || 
        tower.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tower.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tower.stateName && tower.stateName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Temporal filters
      let temporalMatch = true;
      if (temporalFilters.maintenanceDateRange && tower.nextMaintenance) {
        try {
          const nextDate = new Date(tower.nextMaintenance.split('/').reverse().join('-'));
          const start = new Date(temporalFilters.maintenanceDateRange.start);
          const end = new Date(temporalFilters.maintenanceDateRange.end);
          if (!isNaN(nextDate.getTime()) && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
            temporalMatch = nextDate >= start && nextDate <= end;
          }
        } catch (e) {
          // Invalid date format, skip this filter
        }
      }
      if (temporalFilters.nextMaintenanceDays && tower.nextMaintenance) {
        try {
          const nextDate = new Date(tower.nextMaintenance.split('/').reverse().join('-'));
          if (!isNaN(nextDate.getTime())) {
            const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            temporalMatch = temporalMatch && daysUntil <= temporalFilters.nextMaintenanceDays;
          }
        } catch (e) {
          // Invalid date format, skip this filter
        }
      }
      if (temporalFilters.showOverdue && tower.nextMaintenance) {
        try {
          const nextDate = new Date(tower.nextMaintenance.split('/').reverse().join('-'));
          if (!isNaN(nextDate.getTime())) {
            temporalMatch = temporalMatch && nextDate < new Date();
          }
        } catch (e) {
          // Invalid date format, skip this filter
        }
      }
      
      return statusMatch && priorityMatch && zoneMatch && searchMatch && temporalMatch;
    });

    setFilteredTowers(filtered);
    
    // Add markers to map when initialized and we have filtered towers
    if (isInitialized && filtered.length > 0) {
      console.log('🗺️ Updating map with', filtered.length, 'filtered towers');
      addMarkersToMap(filtered);
    }
  }, [towers, filters, zoneFilters, searchTerm, temporalFilters, isInitialized, addMarkersToMap]);

  useEffect(() => {
    setStats({
      total: filteredTowers.length,
      active: filteredTowers.filter(t => t.status === 'active').length,
      maintenance: filteredTowers.filter(t => t.status === 'maintenance').length,
      inactive: filteredTowers.filter(t => t.status === 'inactive').length,
    });
  }, [filteredTowers]);

  const selectedTower = towers.find(t => t.id === selectedTowerId);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
        onLoad={() => setIsLeafletLoaded(true)}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.min.js"
        onLoad={() => setIsLeafletLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css"
      />

      <div className="towers-container flex h-screen relative">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 left-4 z-[600] bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-2 text-brand-cyan hover:bg-brand-navy transition"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/50 backdrop-blur-sm z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto mb-4"></div>
              <p className="text-brand-cyan">Loading tower data...</p>
            </div>
          </div>
        )}

        {/* Info Banner - Demo Mode */}
        <div className="absolute bottom-4 right-4 bg-brand-cyan/90 text-white px-4 py-2 rounded-lg text-xs z-50 shadow-lg flex items-center gap-2 max-w-[calc(100vw-2rem)]">
          <span>ℹ️</span>
          <span>Demo Mode - {towers.length.toLocaleString('pt-BR')} towers loaded (Mock Data)</span>
        </div>
        
        {/* Error Banner (non-blocking) */}
        {error && !loading && (
          <div className="absolute bottom-16 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg text-xs z-50 shadow-lg flex items-center gap-2 max-w-[calc(100vw-2rem)]">
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Sidebar */}
        <div className={`towers-sidebar bg-brand-navy/75 backdrop-blur-xl border-r border-brand-cyan/40 overflow-y-auto p-5 transition-all duration-300 ${
          isMobile 
            ? `fixed inset-y-0 left-0 z-[550] w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-80'
        }`}>
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1 text-brand-cyan towers-header-h1">🗼 Nova Corrente</h1>
            <p className="text-xs text-brand-slate">Tower Maintenance Network</p>
            {!loading && (
              <p className="text-xs text-brand-slate mt-1">
                {stats.total.toLocaleString('pt-BR')} towers loaded
                {error && <span className="ml-2 text-orange-400">(exemplo)</span>}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-brand-cyan to-brand-cyan/70 p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold mb-1">{stats.total.toLocaleString('pt-BR')}</div>
              <div className="text-xs opacity-90">Total Towers</div>
            </div>
            <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold mb-1">{stats.active.toLocaleString('pt-BR')}</div>
              <div className="text-xs opacity-90">Active</div>
            </div>
            <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold mb-1">{stats.maintenance.toLocaleString('pt-BR')}</div>
              <div className="text-xs opacity-90">Maintenance</div>
            </div>
            <div className="bg-gradient-to-br from-[#ef4444] to-[#dc2626] p-4 rounded-lg text-white text-center">
              <div className="text-2xl font-bold mb-1">{stats.inactive.toLocaleString('pt-BR')}</div>
              <div className="text-xs opacity-90">Inactive</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 mb-4 pb-2 border-b border-brand-cyan/20">
            {(['filters', 'weather', 'temporal', 'ml', 'layers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`px-2 py-2 text-sm font-semibold transition capitalize rounded ${
                  sidebarTab === tab
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-slate hover:bg-brand-light-navy hover:text-brand-lightest-slate'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            className="w-full px-3 py-2 mb-4 bg-brand-light-navy/50 border border-brand-cyan/20 rounded-md text-sm text-brand-lightest-slate placeholder-brand-slate focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            placeholder="Search towers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Tab Content */}
          {sidebarTab === 'filters' && (
            <>
              {/* Status Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-brand-slate">Status Filter</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.active}
                      onChange={(e) => setFilters({ ...filters, active: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    Active <span className="ml-auto px-2 py-0.5 bg-[#10b981] text-white rounded text-xs font-semibold">✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.maintenance}
                      onChange={(e) => setFilters({ ...filters, maintenance: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    Under Maintenance <span className="ml-auto px-2 py-0.5 bg-[#f97316] text-white rounded text-xs font-semibold">⚙</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.inactive}
                      onChange={(e) => setFilters({ ...filters, inactive: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    Inactive <span className="ml-auto px-2 py-0.5 bg-brand-slate text-white rounded text-xs font-semibold">○</span>
                  </label>
                </div>
              </div>

              {/* Zone Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-brand-slate">Zone Filter</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {Object.keys(zoneFilters).map((zoneName) => (
                    <label key={zoneName} className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                      <input
                        type="checkbox"
                        checked={zoneFilters[zoneName]}
                        onChange={(e) => setZoneFilters({ ...zoneFilters, [zoneName]: e.target.checked })}
                        className="accent-brand-cyan cursor-pointer"
                      />
                      {zoneName}
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-brand-slate">Maintenance Priority</h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.high}
                      onChange={(e) => setFilters({ ...filters, high: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    High
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.medium}
                      onChange={(e) => setFilters({ ...filters, medium: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    Medium
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-lightest-slate">
                    <input
                      type="checkbox"
                      checked={filters.low}
                      onChange={(e) => setFilters({ ...filters, low: e.target.checked })}
                      className="accent-brand-cyan cursor-pointer"
                    />
                    Low
                  </label>
                </div>
              </div>
            </>
          )}

          {sidebarTab === 'weather' && (
            <div className="space-y-4">
              <WeatherControls
                enabled={weatherEnabled}
                metric={weatherMetric}
                timeRange={weatherTimeRange}
                showMapLayer={showWeatherMapLayer}
                showForecastAnimation={showForecastAnimation}
                showParticleWind={showParticleWind}
                showRainEffects={showRainEffects}
                showTemporalPlayback={showTemporalPlayback}
                granularity={granularity}
                showBiomeLayer={showBiomeLayer}
                showCityLayer={showCityLayer}
                showGridLayer={showGridLayer}
                showGradientLayer={showGradientLayer}
                showPredictiveForecast={showPredictiveForecast}
                onToggle={setWeatherEnabled}
                onMetricChange={setWeatherMetric}
                onTimeRangeChange={setWeatherTimeRange}
                onMapLayerToggle={setShowWeatherMapLayer}
                onForecastAnimationToggle={setShowForecastAnimation}
                onParticleWindToggle={setShowParticleWind}
                onRainEffectsToggle={setShowRainEffects}
                onTemporalPlaybackToggle={setShowTemporalPlayback}
                onGranularityChange={setGranularity}
                onBiomeLayerToggle={setShowBiomeLayer}
                onCityLayerToggle={setShowCityLayer}
                onGridLayerToggle={setShowGridLayer}
                onGradientLayerToggle={setShowGradientLayer}
                onPredictiveForecastToggle={setShowPredictiveForecast}
              />
              <ClimateTrends
                startDate={timeRange.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                endDate={timeRange.end || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {sidebarTab === 'temporal' && (
            <div className="space-y-4">
              <TimeRangeSelector
                value={timeRange}
                preset={timeRangePreset}
                onChange={(range, preset) => {
                  setTimeRange(range);
                  setTimeRangePreset(preset);
                }}
              />
              <TemporalFilters filters={temporalFilters} onChange={setTemporalFilters} />
            </div>
          )}

          {sidebarTab === 'ml' && (
            <MLFilters filters={mlFilters} onChange={setMLFilters} />
          )}

          {sidebarTab === 'layers' && (
            <MapLayers
              map={mapRef.current}
              baseMap={baseMap}
              showClusters={showClusters}
              showZoneBoundaries={showZoneBoundaries}
              showCoverageRadius={showCoverageRadius}
              onBaseMapChange={setBaseMap}
              onClustersToggle={setShowClusters}
              onZoneBoundariesToggle={setShowZoneBoundaries}
              onCoverageRadiusToggle={setShowCoverageRadius}
            />
          )}

          {/* Recent Towers with Enhanced Cards */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-slate">Recent Towers</h3>
                <p className="text-xs text-brand-slate/70 mt-1">
                  Showing {filteredTowers.length.toLocaleString('pt-BR')} of {towers.length.toLocaleString('pt-BR')} towers
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={towerSortBy}
                  onChange={(e) => setTowerSortBy(e.target.value as any)}
                  className="text-xs bg-brand-light-navy/50 border border-brand-cyan/20 rounded px-2 py-1 text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
                >
                  <option value="recent">Recent</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setShowExecutiveDashboard(!showExecutiveDashboard)}
                  className="text-xs text-brand-cyan hover:text-brand-cyan/80"
                >
                  {showExecutiveDashboard ? 'Hide' : 'Show'} Dashboard
                </button>
              </div>
            </div>
            
            {/* Export Buttons */}
            {filteredTowers.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => exportToCSV(filteredTowers)}
                  className="flex-1 px-2 py-1 bg-brand-light-navy/50 hover:bg-brand-light-navy text-xs text-brand-lightest-slate rounded transition"
                  title="Export to CSV"
                >
                  📥 CSV
                </button>
                <button
                  onClick={() => exportToJSON(filteredTowers)}
                  className="flex-1 px-2 py-1 bg-brand-light-navy/50 hover:bg-brand-light-navy text-xs text-brand-lightest-slate rounded transition"
                  title="Export to JSON"
                >
                  📥 JSON
                </button>
                <button
                  onClick={() => exportToPDF(filteredTowers)}
                  className="flex-1 px-2 py-1 bg-brand-light-navy/50 hover:bg-brand-light-navy text-xs text-brand-lightest-slate rounded transition"
                  title="Export to PDF"
                >
                  📥 PDF
                </button>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {filteredTowers.length > 0 ? (
                (() => {
                  // Sort towers based on selected option
                  let sortedTowers = [...filteredTowers];
                  switch (towerSortBy) {
                    case 'priority':
                      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                      sortedTowers.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                      break;
                    case 'status':
                      sortedTowers.sort((a, b) => a.status.localeCompare(b.status));
                      break;
                    case 'name':
                      sortedTowers.sort((a, b) => a.id.localeCompare(b.id));
                      break;
                    case 'recent':
                    default:
                      // Keep original order (most recent first)
                      break;
                  }
                  return sortedTowers.slice(0, 5).map((tower) => (
                    <TowerCard
                      key={tower.id}
                      tower={tower}
                      selected={selectedTowerId === tower.id}
                      onClick={() => showTowerInfo(tower)}
                      onHover={() => showTowerInfo(tower)}
                    />
                  ));
                })()
              ) : (
                <p className="text-xs text-brand-slate text-center py-4">
                  {loading ? 'Loading towers...' : 'No towers found'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[540]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Map Container */}
        <div className="flex-1 relative min-w-0">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Weather Layer */}
          {weatherEnabled && (
            <WeatherLayer
              map={mapRef.current}
              towers={filteredTowers}
              enabled={weatherEnabled}
              metric={weatherMetric}
            />
          )}

          {/* Weather Map Layer */}
          {showWeatherMapLayer && (
            <WeatherMapLayer
              map={mapRef.current}
              enabled={showWeatherMapLayer}
              layerType={weatherMetric === 'temperature' ? 'temperature' : weatherMetric === 'precipitation' ? 'precipitation' : weatherMetric === 'wind' ? 'wind' : 'clouds'}
              opacity={0.6}
            />
          )}

          {/* Forecast Animation */}
          {showForecastAnimation && (
            <WeatherForecastAnimation
              map={mapRef.current}
              towers={filteredTowers}
              enabled={showForecastAnimation}
              animationSpeed={2000}
            />
          )}

          {/* Particle Wind Animation */}
          {showParticleWind && weatherEnabled && (
            <ParticleWindAnimation
              map={mapRef.current}
              weatherStations={filteredTowers.slice(0, 50).map(t => {
                // Get weather data for each tower
                const { getMockRealtimeWeather } = require('./utils/mockWeatherData');
                const weather = getMockRealtimeWeather(t.lat, t.lng);
                return {
                  lat: t.lat,
                  lng: t.lng,
                  windSpeed: weather.windSpeed,
                  windDirection: weather.windDirection || 180,
                };
              })}
              enabled={showParticleWind}
              particleCount={300}
              windSpeed={1.0}
            />
          )}

          {/* Rain Effects Animation */}
          {showRainEffects && weatherEnabled && (
            <RainEffectsAnimation
              map={mapRef.current}
              weatherStations={filteredTowers.slice(0, 50).map(t => {
                // Get weather data for each tower
                const { getMockRealtimeWeather } = require('./utils/mockWeatherData');
                const weather = getMockRealtimeWeather(t.lat, t.lng);
                return {
                  lat: t.lat,
                  lng: t.lng,
                  precipitation: weather.precipitation,
                };
              })}
              enabled={showRainEffects}
              intensity={1.0}
            />
          )}

          {/* Temporal Playback Animation */}
          {showTemporalPlayback && (
            <TemporalPlaybackAnimation
              map={mapRef.current}
              towers={filteredTowers}
              enabled={showTemporalPlayback}
              timeRange={weatherTimeRange === '24h' ? '24h' : weatherTimeRange === '7d' ? '7d' : '30d'}
            />
          )}

          {/* Heat Map Layer */}
          {heatMapType && (
            <HeatMapLayer
              map={mapRef.current}
              towers={filteredTowers}
              enabled={!!heatMapType}
              type={heatMapType}
            />
          )}

          {/* NEW: Biome Layer */}
          {showBiomeLayer && (
            <BiomeLayer
              map={mapRef.current}
              enabled={showBiomeLayer}
              opacity={0.3}
              showLabels={true}
            />
          )}

          {/* NEW: Grid Cell Layer */}
          {showGridLayer && gridCells.length > 0 && (
            <GridCellLayer
              map={mapRef.current}
              gridCells={gridCells}
              enabled={showGridLayer}
              metric={weatherMetric}
              opacity={0.5}
              showBorders={false}
            />
          )}

          {/* NEW: City Weather Layer */}
          {showCityLayer && (
            <CityWeatherLayer
              map={mapRef.current}
              cities={BRAZILIAN_CITIES}
              enabled={showCityLayer}
              minPopulation={100000}
              opacity={0.7}
            />
          )}

          {/* NEW: Gradient Transition Layer */}
          {showGradientLayer && weatherEnabled && (
            <GradientTransitionLayer
              map={mapRef.current}
              points={filteredTowers.slice(0, 50).map(t => {
                const { getMockRealtimeWeather } = require('./utils/mockWeatherData');
                const weather = getMockRealtimeWeather(t.lat, t.lng);
                return {
                  lat: t.lat,
                  lng: t.lng,
                  value: weatherMetric === 'temperature' ? weather.temperature :
                         weatherMetric === 'precipitation' ? weather.precipitation :
                         weatherMetric === 'humidity' ? weather.humidity : weather.windSpeed,
                  color: '#3b82f6'
                };
              })}
              enabled={showGradientLayer}
              opacity={0.4}
              metric={weatherMetric}
            />
          )}

          {/* NEW: Predictive Forecast Overlay */}
          {showPredictiveForecast && (
            <PredictiveForecastOverlay
              map={mapRef.current}
              enabled={showPredictiveForecast}
              forecastDays={7}
              metric={weatherMetric}
              points={filteredTowers.slice(0, 20).map(t => ({
                lat: t.lat,
                lng: t.lng,
                forecasts: Array.from({ length: 7 }, (_, i) => ({
                  day: i + 1,
                  temperature: 20 + Math.random() * 15,
                  precipitation: Math.random() * 50,
                  humidity: 60 + Math.random() * 30,
                  windSpeed: 5 + Math.random() * 20,
                  confidence: 1 - (i * 0.1) // Decreasing confidence over time
                }))
              }))}
              animationSpeed={1500}
            />
          )}

          {/* NEW: Operational Impact Overlay */}
          {weatherEnabled && operationalAlerts.length > 0 && (
            <OperationalImpactOverlay
              map={mapRef.current}
              enabled={weatherEnabled}
              alerts={operationalAlerts}
              showDemandSpikes={true}
              showCorrosionRisks={true}
              showSLARisks={true}
            />
          )}

          {/* Map Legend */}
          <div className="absolute bottom-5 left-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs z-[400] shadow-lg max-w-[calc(100vw-2rem)] md:max-w-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <span className="text-brand-lightest-slate">Active Tower</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
              <span className="text-brand-lightest-slate">Under Maintenance</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-brand-slate"></div>
              <span className="text-brand-lightest-slate">Inactive</span>
            </div>
            <div className="mt-3 pt-3 border-t border-brand-cyan/20">
              <button
                onClick={() => setHeatMapType(heatMapType === 'coverage' ? null : 'coverage')}
                className={`w-full px-2 py-1 rounded text-xs transition ${
                  heatMapType === 'coverage'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                {heatMapType === 'coverage' ? 'Hide' : 'Show'} Heat Map
              </button>
            </div>
          </div>

          {/* Executive Dashboard */}
          {showExecutiveDashboard && (
            <div className="absolute top-5 left-5 z-[500] max-w-md w-[calc(100vw-2rem)] md:w-auto">
              <ErrorBoundary>
                <ExecutiveDashboard towers={towers} />
              </ErrorBoundary>
            </div>
          )}

          {/* Alert Panel */}
          <div className="absolute top-5 right-5 z-[500] max-w-sm w-[calc(100vw-2rem)] md:w-auto">
            <AlertPanel
              alerts={alerts}
              onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
              onMarkRead={(id) => setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a))}
              filter={alertFilter}
              onFilterChange={setAlertFilter}
            />
          </div>

          {/* Info Panel */}
          {selectedTower && (
            <div className="absolute bottom-5 right-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs z-[400] shadow-lg max-w-xs w-[calc(100vw-2rem)] md:w-auto">
              <h3 className="text-sm font-semibold mb-3 text-brand-cyan">{selectedTower.id}</h3>
              <div className="space-y-2">
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Zone:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.zone}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Type:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.zoneType}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Status:</span>
                  <span className="font-semibold" style={{ color: statusColors[selectedTower.status] }}>
                    {selectedTower.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Priority:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.priority}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Height:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.height.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Signal Strength:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.signalStrength.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Uptime:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Operators:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.operatorCount}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Last Maintenance:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.lastMaintenance}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-brand-cyan/20">
                  <span className="text-brand-slate">Next Maintenance:</span>
                  <span className="font-semibold text-brand-lightest-slate">{selectedTower.nextMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-slate">Coordinates:</span>
                  <span className="font-semibold text-brand-lightest-slate">
                    {selectedTower.lat.toFixed(4)}, {selectedTower.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .towers-header-h1 {
          font-size: 18px !important;
          font-weight: 600 !important;
        }
        .towers-sidebar .text-2xl {
          font-size: 24px !important;
          font-weight: 600 !important;
        }
      `}</style>
    </>
  );
}
