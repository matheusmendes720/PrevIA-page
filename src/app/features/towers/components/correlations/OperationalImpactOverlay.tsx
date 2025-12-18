'use client';

/**
 * Operational Impact Overlay
 * Shows supply chain and SLA correlations with weather
 */

import React, { useEffect, useRef } from 'react';

interface OperationalAlert {
  lat: number;
  lng: number;
  type: 'demand_spike' | 'corrosion_risk' | 'sla_risk' | 'equipment_risk';
  severity: 'low' | 'medium' | 'high';
  message: string;
  weatherCause: string;
  impact: string;
}

interface OperationalImpactOverlayProps {
  map: any;
  enabled: boolean;
  alerts: OperationalAlert[];
  showDemandSpikes?: boolean;
  showCorrosionRisks?: boolean;
  showSLARisks?: boolean;
}

export default function OperationalImpactOverlay({
  map,
  enabled,
  alerts,
  showDemandSpikes = true,
  showCorrosionRisks = true,
  showSLARisks = true
}: OperationalImpactOverlayProps) {
  const markersRef = useRef<any[]>([]);

  // Get icon and color based on alert type
  const getAlertStyle = (alert: OperationalAlert) => {
    const styles = {
      demand_spike: { icon: '📈', color: '#3b82f6', label: 'Demand Spike' },
      corrosion_risk: { icon: '🦠', color: '#f97316', label: 'Corrosion Risk' },
      sla_risk: { icon: '⚠️', color: '#ef4444', label: 'SLA Risk' },
      equipment_risk: { icon: '🔧', color: '#fbbf24', label: 'Equipment Risk' }
    };
    return styles[alert.type] || styles.sla_risk;
  };

  useEffect(() => {
    if (!enabled || !map || alerts.length === 0) {
      markersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current = [];
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Filter alerts based on toggles
    const filteredAlerts = alerts.filter(alert => {
      if (alert.type === 'demand_spike' && !showDemandSpikes) return false;
      if (alert.type === 'corrosion_risk' && !showCorrosionRisks) return false;
      if (alert.type === 'sla_risk' && !showSLARisks) return false;
      return true;
    });

    // Render alert markers
    filteredAlerts.forEach(alert => {
      const style = getAlertStyle(alert);
      
      // Create pulsing circle for alert area
      const circle = L.circle([alert.lat, alert.lng], {
        radius: alert.severity === 'high' ? 30000 : alert.severity === 'medium' ? 20000 : 10000,
        fillColor: style.color,
        color: style.color,
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.15,
        className: 'pulse-animation'
      });

      circle.addTo(map);
      markersRef.current.push(circle);

      // Create icon marker
      const marker = L.marker([alert.lat, alert.lng], {
        icon: L.divIcon({
          className: 'operational-alert-icon',
          html: `
            <div style="
              background: ${alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f97316' : '#3b82f6'};
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            ">
              ${style.icon}
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
                50% { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
              }
            </style>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      });

      // Add detailed popup
      marker.bindPopup(`
        <div style="font-size: 12px; color: #0a192f; min-width: 220px; max-width: 280px;">
          <div style="
            background: ${style.color};
            color: white;
            margin: -12px -12px 12px -12px;
            padding: 8px 12px;
            border-radius: 4px 4px 0 0;
            font-weight: bold;
          ">
            ${style.icon} ${style.label}
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="
              display: inline-block;
              background: ${alert.severity === 'high' ? '#fee2e2' : alert.severity === 'medium' ? '#fed7aa' : '#dbeafe'};
              color: ${alert.severity === 'high' ? '#dc2626' : alert.severity === 'medium' ? '#ea580c' : '#2563eb'};
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            ">
              ${alert.severity} severity
            </div>
          </div>
          
          <div style="margin-bottom: 8px;">
            <strong>${alert.message}</strong>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            <div style="color: #666; font-size: 11px; margin-bottom: 4px;">
              <strong>Weather Cause:</strong>
            </div>
            <div style="font-size: 11px;">${alert.weatherCause}</div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            <div style="color: #666; font-size: 11px; margin-bottom: 4px;">
              <strong>Operational Impact:</strong>
            </div>
            <div style="font-size: 11px;">${alert.impact}</div>
          </div>
          
          <div style="
            background: #f3f4f6;
            border-radius: 4px;
            padding: 6px 8px;
            margin-top: 8px;
            font-size: 10px;
            color: #4b5563;
          ">
            💡 <strong>Recommendation:</strong> Adjust safety stock and crew scheduling
          </div>
        </div>
      `);

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [map, enabled, alerts, showDemandSpikes, showCorrosionRisks, showSLARisks]);

  return null;
}

/**
 * Generate mock operational alerts based on weather data
 */
export function generateOperationalAlerts(
  weatherData: Array<{ lat: number; lng: number; temperature: number; precipitation: number; humidity: number; windSpeed: number }>
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  weatherData.forEach((weather, idx) => {
    // Demand spike from rainfall
    if (weather.precipitation > 60) {
      alerts.push({
        lat: weather.lat,
        lng: weather.lng,
        type: 'demand_spike',
        severity: weather.precipitation > 100 ? 'high' : 'medium',
        message: `Rainfall spike detected: +${weather.precipitation.toFixed(0)}mm`,
        weatherCause: `Heavy rainfall (${weather.precipitation.toFixed(1)}mm) expected`,
        impact: `+${(weather.precipitation * 0.67).toFixed(0)}% demand increase for connectors`
      });
    }

    // Corrosion risk from humidity
    if (weather.humidity > 80) {
      alerts.push({
        lat: weather.lat,
        lng: weather.lng,
        type: 'corrosion_risk',
        severity: weather.humidity > 90 ? 'high' : 'medium',
        message: `High humidity detected: ${weather.humidity.toFixed(0)}%`,
        weatherCause: `Humidity >80% (currently ${weather.humidity.toFixed(0)}%)`,
        impact: `+${((weather.humidity - 80) * 3).toFixed(0)}% corrosion risk, increase anticorrosive stock by +15%`
      });
    }

    // Equipment risk from temperature
    if (weather.temperature > 30) {
      alerts.push({
        lat: weather.lat,
        lng: weather.lng,
        type: 'equipment_risk',
        severity: weather.temperature > 35 ? 'high' : 'medium',
        message: `High temperature alert: ${weather.temperature.toFixed(1)}°C`,
        weatherCause: `Temperature >30°C (currently ${weather.temperature.toFixed(1)}°C)`,
        impact: `Equipment overheating risk, implement cooling measures`
      });
    }

    // SLA risk from wind
    if (weather.windSpeed > 12) {
      alerts.push({
        lat: weather.lat,
        lng: weather.lng,
        type: 'sla_risk',
        severity: weather.windSpeed > 20 ? 'high' : 'medium',
        message: `High wind conditions: ${weather.windSpeed.toFixed(1)}km/h`,
        weatherCause: `Wind speed >12km/h (currently ${weather.windSpeed.toFixed(1)}km/h)`,
        impact: `+${((weather.windSpeed - 12) * 0.67).toFixed(0)}% crew time addition to SLA calculations`
      });
    }
  });

  // Limit to top 50 alerts by severity
  return alerts
    .sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    .slice(0, 50);
}

