'use client';

import React, { useEffect, useState, memo } from 'react';
import { getMockPredictiveAnalytics, PredictiveAnalytics } from '../utils/mockMLFeatures';
import { Tower } from '../utils/mockTowerData';

interface TowerCardProps {
  tower: Tower;
  selected?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}

function TowerCard({ tower, selected, onClick, onHover }: TowerCardProps) {
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAnalytics = () => {
      setLoading(true);
      try {
        const data = getMockPredictiveAnalytics(tower.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Set default analytics on error to prevent UI breakage
        setAnalytics({
          maintenance_risk_score: 50,
          predicted_next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coverage_impact_score: 50,
          weather_risk: 'low' as 'low' | 'medium' | 'high',
          economic_value_score: 50,
        });
      } finally {
        setLoading(false);
      }
    };

    if (tower.id) {
      loadAnalytics();
    }
  }, [tower.id]);

  const statusColors = {
    active: '#10b981',
    maintenance: '#f97316',
    inactive: '#8892b0',
  };

  const priorityColors = {
    High: '#ef4444',
    Medium: '#f97316',
    Low: '#10b981',
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f97316';
    return '#10b981';
  };

  const isOverdue = () => {
    if (!tower.nextMaintenance) return false;
    const nextDate = new Date(tower.nextMaintenance.split('/').reverse().join('-'));
    return nextDate < new Date();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`p-3 border rounded-md cursor-pointer transition-all text-xs ${
        selected
          ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
          : 'bg-brand-light-navy/30 border-brand-cyan/20 text-brand-lightest-slate hover:bg-brand-light-navy/50 hover:border-brand-cyan'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-semibold mb-1">{tower.id}</div>
          <div className="text-brand-slate text-xs opacity-75">
            {tower.region} • {tower.state}
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[tower.status] }}
        />
      </div>

      {/* Status & Priority */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold"
          style={{
            backgroundColor: statusColors[tower.status] + '20',
            color: statusColors[tower.status],
          }}
        >
          {tower.status.toUpperCase()}
        </span>
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold"
          style={{
            backgroundColor: priorityColors[tower.priority] + '20',
            color: priorityColors[tower.priority],
          }}
        >
          {tower.priority}
        </span>
        {isOverdue() && (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
            OVERDUE
          </span>
        )}
      </div>

      {/* Predictive Analytics */}
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
        </div>
      ) : analytics ? (
        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-brand-slate">Maintenance Risk:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-brand-light-navy rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${analytics.maintenance_risk_score}%`,
                    backgroundColor: getRiskColor(analytics.maintenance_risk_score),
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: getRiskColor(analytics.maintenance_risk_score) }}
              >
                {analytics.maintenance_risk_score}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-brand-slate">Weather Risk:</span>
            <span
              className={`text-xs font-semibold ${
                analytics.weather_risk === 'high'
                  ? 'text-red-400'
                  : analytics.weather_risk === 'medium'
                  ? 'text-orange-400'
                  : 'text-green-400'
              }`}
            >
              {analytics.weather_risk.toUpperCase()}
            </span>
          </div>
          <div className="text-brand-slate text-xs">
            Next Maintenance: {analytics.predicted_next_maintenance}
          </div>
        </div>
      ) : null}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-cyan/20">
        <div>
          <div className="text-brand-slate text-xs">Height</div>
          <div className="font-semibold">{tower.height.toFixed(1)}m</div>
        </div>
        <div>
          <div className="text-brand-slate text-xs">Uptime</div>
          <div className="font-semibold">{tower.uptime.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-brand-slate text-xs">Signal</div>
          <div className="font-semibold">{tower.signalStrength.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-brand-slate text-xs">Operators</div>
          <div className="font-semibold">{tower.operatorCount}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-brand-cyan/20">
        <button
          className="flex-1 px-2 py-1 bg-brand-cyan/20 text-brand-cyan rounded text-xs hover:bg-brand-cyan/30 transition"
          onClick={(e) => {
            e.stopPropagation();
            // Handle schedule maintenance
          }}
        >
          Schedule
        </button>
        <button
          className="flex-1 px-2 py-1 bg-brand-light-navy/50 text-brand-lightest-slate rounded text-xs hover:bg-brand-light-navy transition"
          onClick={(e) => {
            e.stopPropagation();
            // Handle view details
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

export default memo(TowerCard);

