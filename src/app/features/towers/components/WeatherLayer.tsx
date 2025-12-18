'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getMockRealtimeWeather, getMockClimateRisks, WeatherData, ClimateRisk, generateClimateMonitoringPoints } from '../utils/mockWeatherData';
import EnhancedWeatherPopup from './EnhancedWeatherPopup';

interface WeatherLayerProps {
  map: any; // Leaflet map instance
  towers: Array<{ lat: number; lng: number; id: string }>;
  enabled: boolean;
  metric: 'temperature' | 'precipitation' | 'wind' | 'humidity';
}

interface WeatherStation {
  lat: number;
  lng: number;
  data: WeatherData;
  risk: ClimateRisk;
}

export default function WeatherLayer({ map, towers, enabled, metric }: WeatherLayerProps) {
  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>([]);
  const [loading, setLoading] = useState(false);
  const markersRef = useRef<{ [key: string]: any }>({});
  const layersRef = useRef<any[]>([]);

  // Generate spatially distributed weather points (memoized for performance)
  // Uses organic, natural distribution similar to real weather patterns
  const weatherPoints = useMemo(() => {
    if (!enabled || towers.length === 0) return [];
    
    // Limit processing for performance (max 1000 towers considered)
    const towersToProcess = towers.length > 1000 ? towers.slice(0, 1000) : towers;

    // Calculate bounds from towers
    const lats = towersToProcess.map(t => t.lat);
    const lngs = towersToProcess.map(t => t.lng);
    const bounds = {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };

    // Organic sampling: Create natural clusters and sparse areas (like real weather)
    // Strategy: Random sampling with density variations and clustering
    const sampledTowers: Array<{ lat: number; lng: number; id: string }> = [];
    const usedTowerIds = new Set<string>();
    
    // Create 3-5 random cluster centers (like weather systems)
    const numClusters = 3 + Math.floor(Math.random() * 3);
    const clusterCenters: Array<{ lat: number; lng: number; density: number }> = [];
    
    for (let i = 0; i < numClusters; i++) {
      clusterCenters.push({
        lat: bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat),
        lng: bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng),
        density: 0.3 + Math.random() * 0.4, // Varying density per cluster
      });
    }
    
    // Sample towers based on proximity to cluster centers (organic clustering)
    const maxSamples = 50;
    const attempts = towersToProcess.length * 2; // More attempts for better distribution
    
    for (let attempt = 0; attempt < attempts && sampledTowers.length < maxSamples; attempt++) {
      const tower = towersToProcess[Math.floor(Math.random() * towersToProcess.length)];
      
      if (usedTowerIds.has(tower.id)) continue;
      
      // Calculate distance to nearest cluster center
      let minDistance = Infinity;
      let nearestClusterDensity = 0.5;
      
      for (const cluster of clusterCenters) {
        const distance = Math.sqrt(
          Math.pow(tower.lat - cluster.lat, 2) + 
          Math.pow(tower.lng - cluster.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestClusterDensity = cluster.density;
        }
      }
      
      // Normalize distance (0-1 scale based on bounds)
      const maxPossibleDistance = Math.sqrt(
        Math.pow(bounds.maxLat - bounds.minLat, 2) + 
        Math.pow(bounds.maxLng - bounds.minLng, 2)
      );
      const normalizedDistance = minDistance / maxPossibleDistance;
      
      // Probability increases near cluster centers and with cluster density
      // Creates natural clustering with organic falloff
      const clusterInfluence = Math.exp(-normalizedDistance * 5) * nearestClusterDensity;
      const randomFactor = Math.random();
      
      // Also add some completely random points for sparse coverage
      const sparseProbability = 0.15; // 15% chance for random sparse points
      
      if (randomFactor < clusterInfluence || randomFactor < sparseProbability) {
        sampledTowers.push({ lat: tower.lat, lng: tower.lng, id: tower.id });
        usedTowerIds.add(tower.id);
      }
    }

    // Add independent climate monitoring points with organic distribution
    const climatePoints = generateClimateMonitoringPoints(bounds, 250, 0.3);
    const climatePointsArray = climatePoints.map(p => ({ lat: p.lat, lng: p.lng, id: p.id }));

    // Combine tower-based and independent climate points
    return [...sampledTowers, ...climatePointsArray];
  }, [enabled, towers]);

  // Define clearLayers before it's used in useEffect
  const clearLayers = useCallback(() => {
    layersRef.current.forEach((layer) => {
      if (map) map.removeLayer(layer);
    });
    layersRef.current = [];
    
    Object.values(markersRef.current).forEach((marker: any) => {
      if (map) map.removeLayer(marker);
    });
    markersRef.current = {};
  }, [map]);

  // Load weather data for all points
  useEffect(() => {
    if (!enabled || !map || weatherPoints.length === 0) {
      clearLayers();
      return;
    }

    const loadWeatherData = async () => {
      setLoading(true);
      try {
        const stations: WeatherStation[] = weatherPoints.map((point) => {
          try {
            const weather = getMockRealtimeWeather(point.lat, point.lng);
            const risk = getMockClimateRisks(point.lat, point.lng);
            
            return {
              lat: point.lat,
              lng: point.lng,
              data: weather,
              risk,
            };
          } catch (error) {
            console.error(`Error loading weather for point ${point.id}:`, error);
            return null;
          }
        }).filter((s): s is WeatherStation => s !== null);

        setWeatherStations(stations);
      } catch (error) {
        console.error('Error loading weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [enabled, map, weatherPoints, clearLayers]);

  // Render weather indicators on map
  useEffect(() => {
    if (!enabled || !map || weatherStations.length === 0) {
      clearLayers();
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    clearLayers();

    weatherStations.forEach((station) => {
      renderWeatherIndicator(L, map, station, metric);
    });

    return () => {
      clearLayers();
    };
  }, [enabled, map, weatherStations, metric, clearLayers]);

  const renderWeatherIndicator = (
    L: any,
    map: any,
    station: WeatherStation,
    metric: string
  ) => {
    const { data, risk } = station;

    // Color based on metric and severity
    let color = '#10b981'; // green (normal)
    let radius = 8;
    let opacity = 0.6;

    switch (metric) {
      case 'temperature':
        if (data.temperature > 35) {
          color = '#ef4444'; // red (extreme heat)
          opacity = 0.8;
        } else if (data.temperature > 30) {
          color = '#f97316'; // orange (hot)
          opacity = 0.7;
        } else if (data.temperature < 15) {
          color = '#3b82f6'; // blue (cold)
        }
        radius = Math.max(5, Math.min(15, (data.temperature / 40) * 15));
        break;

      case 'precipitation':
        if (data.precipitation > 50) {
          color = '#1e40af'; // dark blue (heavy rain)
          opacity = 0.9;
        } else if (data.precipitation > 20) {
          color = '#3b82f6'; // blue (moderate rain)
          opacity = 0.7;
        } else if (data.precipitation > 0) {
          color = '#60a5fa'; // light blue (light rain)
        }
        radius = Math.max(5, Math.min(20, (data.precipitation / 100) * 20));
        break;

      case 'wind':
        if (data.windSpeed > 50) {
          color = '#dc2626'; // dark red (strong wind)
          opacity = 0.9;
        } else if (data.windSpeed > 30) {
          color = '#f97316'; // orange (moderate wind)
          opacity = 0.7;
        }
        radius = Math.max(5, Math.min(15, (data.windSpeed / 60) * 15));
        break;

      case 'humidity':
        if (data.humidity > 80) {
          color = '#1e40af'; // dark blue (high humidity)
          opacity = 0.8;
        } else if (data.humidity > 60) {
          color = '#3b82f6'; // blue (moderate humidity)
        }
        radius = Math.max(5, Math.min(12, (data.humidity / 100) * 12));
        break;
    }

    // Add risk overlay circles for various alert types
    const alertCircles: Array<{ risk: 'high' | 'medium' | 'low'; color: string }> = [];
    
    if (risk.thunderstorm_risk === 'high') {
      alertCircles.push({ risk: 'high', color: '#9333ea' }); // Purple for storms
    } else if (risk.thunderstorm_risk === 'medium') {
      alertCircles.push({ risk: 'medium', color: '#a855f7' });
    }
    
    if (risk.wind_gust_risk === 'high') {
      alertCircles.push({ risk: 'high', color: '#dc2626' }); // Red for wind
    } else if (risk.wind_gust_risk === 'medium') {
      alertCircles.push({ risk: 'medium', color: '#f97316' });
    }
    
    if (risk.hail_risk === 'high') {
      alertCircles.push({ risk: 'high', color: '#3b82f6' }); // Blue for hail
    } else if (risk.hail_risk === 'medium') {
      alertCircles.push({ risk: 'medium', color: '#60a5fa' });
    }
    
    if (risk.corrosion_risk === 'high' || risk.field_work_disruption === 'high') {
      alertCircles.push({ risk: 'high', color: '#ef4444' }); // Red for general risks
    }

    // Render alert circles (only show highest priority)
    if (alertCircles.length > 0) {
      const highPriority = alertCircles.find(a => a.risk === 'high');
      const alertColor = highPriority ? highPriority.color : alertCircles[0].color;
      const alertRadius = highPriority ? radius * 2.5 : radius * 2;
      
      const riskCircle = L.circle([station.lat, station.lng], {
        radius: alertRadius,
        color: alertColor,
        fillColor: alertColor,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      });
      riskCircle.addTo(map);
      layersRef.current.push(riskCircle);
    }

    // Create weather marker
    const marker = L.circleMarker([station.lat, station.lng], {
      radius,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: opacity,
    });

    // Build alert indicators HTML
    const alertIndicators: string[] = [];
    if (risk.thunderstorm_risk !== 'low') {
      const color = risk.thunderstorm_risk === 'high' ? '#9333ea' : '#a855f7';
      alertIndicators.push(`<div style="color: ${color};"><strong>⚡ Thunderstorm:</strong> ${risk.thunderstorm_risk.toUpperCase()} (${risk.lightning_strikes} strikes)</div>`);
    }
    if (risk.wind_gust_risk !== 'low') {
      const color = risk.wind_gust_risk === 'high' ? '#dc2626' : '#f97316';
      alertIndicators.push(`<div style="color: ${color};"><strong>💨 Wind Gusts:</strong> ${risk.wind_gust_risk.toUpperCase()} (${risk.wind_gust_speed.toFixed(1)} km/h)</div>`);
    }
    if (risk.hail_risk !== 'low') {
      const color = risk.hail_risk === 'high' ? '#3b82f6' : '#60a5fa';
      alertIndicators.push(`<div style="color: ${color};"><strong>🧊 Hail Risk:</strong> ${risk.hail_risk.toUpperCase()}</div>`);
    }
    if (risk.corrosion_risk !== 'low') {
      const color = risk.corrosion_risk === 'high' ? '#ef4444' : '#f97316';
      alertIndicators.push(`<div style="color: ${color};"><strong>Corrosion Risk:</strong> ${risk.corrosion_risk.toUpperCase()}</div>`);
    }
    if (risk.field_work_disruption !== 'low') {
      const color = risk.field_work_disruption === 'high' ? '#ef4444' : '#f97316';
      alertIndicators.push(`<div style="color: ${color};"><strong>Field Work Risk:</strong> ${risk.field_work_disruption.toUpperCase()}</div>`);
    }

    // Generate mini chart data (24-hour trend simulation)
    const generateChartData = () => {
      const hours = 12; // 12 data points for simpler chart
      const dataPoints: number[] = [];
      for (let i = 0; i < hours; i++) {
        let value: number;
        switch (metric) {
          case 'temperature':
            value = data.temperature + Math.sin((i - 3) * Math.PI / 6) * 6 + (Math.random() - 0.5) * 2;
            break;
          case 'precipitation':
            value = data.precipitation * (0.5 + Math.random() * 0.5);
            break;
          case 'wind':
            value = data.windSpeed * (0.7 + Math.random() * 0.6);
            break;
          case 'humidity':
            value = data.humidity + (Math.random() - 0.5) * 8;
            break;
          default:
            value = 0;
        }
        dataPoints.push(Math.max(0, value));
      }
      return dataPoints;
    };

    const chartData = generateChartData();
    const maxValue = Math.max(...chartData, 1);
    const minValue = Math.min(...chartData, 0);
    const range = maxValue - minValue || 1;

    // Generate SVG chart path
    const chartWidth = 200;
    const chartHeight = 50;
    const points = chartData.map((value, i) => {
      const x = (i / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - ((value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    const areaPath = `M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`;

    // Add popup with enhanced weather info and mini chart
    const popupContent = `
      <div style="font-size: 12px; color: #0a192f; min-width: 220px; max-width: 280px;">
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">Weather Station</div>
        
        <!-- Current Values Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">
          <div>
            <div style="color: #666; font-size: 10px;">Temperature</div>
            <div style="font-weight: bold; color: ${data.temperature > 30 ? '#ef4444' : '#0a192f'};">${data.temperature.toFixed(1)}°C</div>
          </div>
          <div>
            <div style="color: #666; font-size: 10px;">Precipitation</div>
            <div style="font-weight: bold; color: ${data.precipitation > 20 ? '#3b82f6' : '#0a192f'};">${data.precipitation.toFixed(1)}mm</div>
          </div>
          <div>
            <div style="color: #666; font-size: 10px;">Humidity</div>
            <div style="font-weight: bold;">${data.humidity.toFixed(0)}%</div>
          </div>
          <div>
            <div style="color: #666; font-size: 10px;">Wind Speed</div>
            <div style="font-weight: bold; color: ${data.windSpeed > 40 ? '#dc2626' : '#0a192f'};">${data.windSpeed.toFixed(1)} km/h</div>
          </div>
        </div>
        
        <!-- Mini Chart -->
        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
          <div style="font-size: 10px; color: #666; margin-bottom: 6px;">${metric.charAt(0).toUpperCase() + metric.slice(1)} Trend (12h)</div>
          <div style="height: 60px; position: relative; background: #f5f5f5; border-radius: 4px; padding: 4px;">
            <svg width="100%" height="100%" style="display: block;">
              <!-- Grid lines -->
              ${[0, 0.25, 0.5, 0.75, 1].map((y) => `
                <line x1="0" y1="${y * 100}%" x2="100%" y2="${y * 100}%" stroke="#e0e0e0" stroke-width="1"/>
              `).join('')}
              <!-- Area fill -->
              <path d="${areaPath}" fill="rgba(59, 130, 246, 0.15)" stroke="none"/>
              <!-- Chart line -->
              <polyline points="${points}" fill="none" stroke="#3b82f6" stroke-width="2"/>
            </svg>
            <div style="position: absolute; bottom: 2px; left: 4px; font-size: 9px; color: #666;">${minValue.toFixed(1)}</div>
            <div style="position: absolute; top: 2px; right: 4px; font-size: 9px; color: #666;">${maxValue.toFixed(1)}</div>
          </div>
        </div>
        
        <!-- Climate Alerts -->
        ${alertIndicators.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 6px; font-weight: bold;">Climate Alerts</div>
            ${alertIndicators.map(alert => `
              <div style="display: flex; align-items: center; gap: 6px; padding: 4px 6px; margin-bottom: 4px; border-radius: 4px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11px;">
                ${alert}
              </div>
            `).join('')}
            ${risk.lightning_strikes > 0 ? `<div style="margin-top: 4px; font-size: 10px; color: #9333ea;">⚡ ${risk.lightning_strikes} lightning strikes detected</div>` : ''}
            ${risk.wind_gust_speed > 50 ? `<div style="margin-top: 4px; font-size: 10px; color: #dc2626;">💨 Wind gusts up to ${risk.wind_gust_speed.toFixed(1)} km/h</div>` : ''}
          </div>
        ` : ''}
        
        <!-- Additional Info -->
        <div style="font-size: 10px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0;">
          <div>Pressure: ${data.pressure?.toFixed(0) || 'N/A'} hPa</div>
          <div>Visibility: ${data.visibility?.toFixed(1) || 'N/A'} km</div>
          ${data.uvIndex !== undefined ? `<div>UV Index: ${data.uvIndex}</div>` : ''}
          <div style="margin-top: 4px; font-size: 9px; color: #999;">Updated: ${new Date(data.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);
    marker.addTo(map);
    markersRef.current[`${station.lat}-${station.lng}`] = marker;
    layersRef.current.push(marker);

    // Add weather icon from OpenWeatherMap if available
    if (data.icon) {
      const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
      const iconMarker = L.marker([station.lat, station.lng], {
        icon: L.icon({
          iconUrl,
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        }),
        zIndexOffset: 1000,
      });
      iconMarker.bindPopup(popupContent);
      iconMarker.addTo(map);
      markersRef.current[`${station.lat}-${station.lng}-icon`] = iconMarker;
      layersRef.current.push(iconMarker);
    }

    // Add alert icons for new alert types
    if (risk.thunderstorm_risk === 'high' || risk.lightning_strikes > 5) {
      const lightningIcon = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: 'lightning-icon',
          html: `<div style="font-size: 24px; color: #9333ea; text-shadow: 0 0 4px rgba(147, 51, 234, 0.8);">⚡</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        zIndexOffset: 1500,
      });
      lightningIcon.addTo(map);
      lightningIcon.bindPopup(popupContent);
      layersRef.current.push(lightningIcon);
    }

    if (risk.wind_gust_risk === 'high' && risk.wind_gust_speed > 50) {
      const windIcon = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: 'wind-gust-icon',
          html: `<div style="font-size: 20px; color: #dc2626; text-shadow: 0 0 4px rgba(220, 38, 38, 0.8);">💨</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
        zIndexOffset: 1400,
      });
      windIcon.addTo(map);
      windIcon.bindPopup(popupContent);
      layersRef.current.push(windIcon);
    }

    if (risk.hail_risk === 'high') {
      const hailIcon = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: 'hail-icon',
          html: `<div style="font-size: 20px; color: #3b82f6; text-shadow: 0 0 4px rgba(59, 130, 246, 0.8);">🧊</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
        zIndexOffset: 1300,
      });
      hailIcon.addTo(map);
      hailIcon.bindPopup(popupContent);
      layersRef.current.push(hailIcon);
    }

    // Add wind direction arrow if wind data available
    if (metric === 'wind' && data.windDirection !== undefined) {
      const arrow = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: 'wind-arrow',
          html: `<div style="transform: rotate(${data.windDirection}deg); font-size: 20px; color: #3b82f6;">→</div>`,
          iconSize: [20, 20],
        }),
        zIndexOffset: 100,
      });
      arrow.addTo(map);
      layersRef.current.push(arrow);
    }
  };

  if (!enabled) return null;

  return (
    <div className="absolute top-20 right-5 bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-3 text-xs z-[500] shadow-lg">
      {loading ? (
        <div className="flex items-center gap-2 text-brand-cyan">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
          <span>Loading weather...</span>
        </div>
      ) : (
        <div className="text-brand-lightest-slate">
          <div className="font-semibold mb-2">Weather Layer: {metric}</div>
          <div className="text-brand-slate text-xs">
            {weatherStations.length} stations active
          </div>
        </div>
      )}
    </div>
  );
}

