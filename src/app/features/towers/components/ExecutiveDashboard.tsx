'use client';

import React, { useMemo } from 'react';
import { generateMockStats, Tower } from '../utils/mockTowerData';

interface ExecutiveDashboardProps {
  className?: string;
  towers: Tower[];
}

interface TowerStats {
  total_towers: number;
  by_status?: Record<string, number>;
  by_priority?: Record<string, number>;
  by_region?: Record<string, number>;
  by_state?: Record<string, number>;
  by_zone?: Record<string, number>;
  average_height?: number;
  average_signal_strength?: number;
  average_uptime?: number;
}

export default function ExecutiveDashboard({ className, towers }: ExecutiveDashboardProps) {
  // Generate stats from towers
  const stats = useMemo(() => {
    if (towers.length === 0) {
      return {
        total_towers: 0,
        by_status: {},
        by_priority: {},
        by_region: {},
        by_state: {},
        by_zone: {},
      } as TowerStats;
    }
    return generateMockStats(towers);
  }, [towers]);

  // Generate region stats
  const regionStats = useMemo(() => {
    if (towers.length === 0) return [];
    
    const regionMap = new Map<string, { region: string; tower_count: number; total_height: number; total_signal: number; total_uptime: number; count: number }>();
    
    towers.forEach(tower => {
      const existing = regionMap.get(tower.region) || {
        region: tower.region,
        tower_count: 0,
        total_height: 0,
        total_signal: 0,
        total_uptime: 0,
        count: 0,
      };
      
      existing.tower_count++;
      existing.total_height += tower.height;
      existing.total_signal += tower.signalStrength;
      existing.total_uptime += tower.uptime;
      existing.count++;
      
      regionMap.set(tower.region, existing);
    });
    
    return Array.from(regionMap.values()).map(r => ({
      region: r.region,
      tower_count: r.tower_count,
      average_height: r.count > 0 ? r.total_height / r.count : 0,
      average_signal_strength: r.count > 0 ? r.total_signal / r.count : 0,
      average_uptime: r.count > 0 ? r.total_uptime / r.count : 0,
    }));
  }, [towers]);

  if (!stats || stats.total_towers === 0) {
    return (
      <div className={`bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-brand-slate">No data available</div>
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const networkHealthScore = Math.round(
    ((stats.by_status?.active || 0) / stats.total_towers) * 100
  );
  const coveragePercentage = 95; // This would come from actual coverage data
  const maintenanceEfficiency = Math.round(
    ((stats.by_status?.maintenance || 0) / stats.total_towers) * 100
  );

  return (
    <div className={`bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6 text-brand-cyan">Executive Dashboard</h2>

      {/* Key KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-brand-cyan to-brand-cyan/70 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold mb-1">{networkHealthScore}%</div>
          <div className="text-xs opacity-90">Network Health</div>
        </div>
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-4 rounded-lg text-white">
          <div className="text-2xl font-bold mb-1">{coveragePercentage}%</div>
          <div className="text-xs opacity-90">Coverage</div>
        </div>
        <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] p-4 rounded-lg text-white">
          <div className="text-2xl font-bold mb-1">{maintenanceEfficiency}%</div>
          <div className="text-xs opacity-90">Maintenance Efficiency</div>
        </div>
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] p-4 rounded-lg text-white">
          <div className="text-2xl font-bold mb-1">{stats.total_towers.toLocaleString('pt-BR')}</div>
          <div className="text-xs opacity-90">Total Towers</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-brand-lightest-slate">Status Breakdown</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-brand-slate">Active</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-brand-light-navy rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10b981]"
                  style={{
                    width: `${((stats.by_status?.active || 0) / stats.total_towers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-brand-lightest-slate font-semibold w-16 text-right">
                {stats.by_status?.active || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-brand-slate">Maintenance</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-brand-light-navy rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316]"
                  style={{
                    width: `${((stats.by_status?.maintenance || 0) / stats.total_towers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-brand-lightest-slate font-semibold w-16 text-right">
                {stats.by_status?.maintenance || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-brand-slate">Inactive</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-brand-light-navy rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-slate"
                  style={{
                    width: `${((stats.by_status?.inactive || 0) / stats.total_towers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-brand-lightest-slate font-semibold w-16 text-right">
                {stats.by_status?.inactive || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Breakdown */}
      {regionStats.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-brand-lightest-slate">Regional Distribution</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {regionStats.slice(0, 5).map((region, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-brand-light-navy/30 rounded">
                <span className="text-brand-lightest-slate text-sm">{region.region}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-brand-light-navy rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-cyan"
                      style={{
                        width: `${(region.tower_count / stats.total_towers) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-brand-lightest-slate font-semibold w-12 text-right text-sm">
                    {region.tower_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Metrics */}
      <div className="mt-6 pt-6 border-t border-brand-cyan/20 grid grid-cols-3 gap-4">
        <div>
          <div className="text-brand-slate text-xs mb-1">Avg Height</div>
          <div className="text-brand-lightest-slate font-semibold">
            {stats.average_height?.toFixed(1) || 'N/A'}m
          </div>
        </div>
        <div>
          <div className="text-brand-slate text-xs mb-1">Avg Signal</div>
          <div className="text-brand-lightest-slate font-semibold">
            {stats.average_signal_strength?.toFixed(1) || 'N/A'}%
          </div>
        </div>
        <div>
          <div className="text-brand-slate text-xs mb-1">Avg Uptime</div>
          <div className="text-brand-lightest-slate font-semibold">
            {stats.average_uptime?.toFixed(1) || 'N/A'}%
          </div>
        </div>
      </div>
    </div>
  );
}

