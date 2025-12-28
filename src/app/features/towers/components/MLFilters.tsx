'use client';

import React, { useState, useEffect } from 'react';

interface MLFiltersProps {
  filters: {
    maintenanceRiskMin: number;
    maintenanceRiskMax: number;
    coverageGap: boolean;
    highDemand: boolean;
    lowDemand: boolean;
    fiveGCandidates: boolean;
    corrosionRisk: 'all' | 'low' | 'medium' | 'high';
    disruptionRisk: 'all' | 'low' | 'medium' | 'high';
    highValueRegions: boolean;
  };
  onChange: (filters: MLFiltersProps['filters']) => void;
}

export default function MLFilters({ filters, onChange }: MLFiltersProps) {
  const handleChange = (key: keyof typeof filters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-sm">
      <h3 className="text-sm font-semibold mb-4 text-brand-cyan">ML-Enhanced Filters</h3>

      {/* Maintenance Risk Score */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">
          Maintenance Risk Score: {filters.maintenanceRiskMin} - {filters.maintenanceRiskMax}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maintenanceRiskMin}
            onChange={(e) => handleChange('maintenanceRiskMin', parseInt(e.target.value))}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maintenanceRiskMax}
            onChange={(e) => handleChange('maintenanceRiskMax', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Coverage Gap */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.coverageGap}
            onChange={(e) => handleChange('coverageGap', e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
          <span className="text-brand-lightest-slate">Coverage Gap Indicators</span>
        </label>
      </div>

      {/* Demand Forecasting */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">Demand Forecasting</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.highDemand}
              onChange={(e) => handleChange('highDemand', e.target.checked)}
              className="accent-brand-cyan cursor-pointer"
            />
            <span className="text-brand-lightest-slate">High Predicted Demand</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.lowDemand}
              onChange={(e) => handleChange('lowDemand', e.target.checked)}
              className="accent-brand-cyan cursor-pointer"
            />
            <span className="text-brand-lightest-slate">Low Predicted Demand</span>
          </label>
        </div>
      </div>

      {/* 5G Expansion */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.fiveGCandidates}
            onChange={(e) => handleChange('fiveGCandidates', e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
          <span className="text-brand-lightest-slate">5G Expansion Candidates</span>
        </label>
      </div>

      {/* Climate Risk Filters */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">Corrosion Risk</label>
        <div className="grid grid-cols-2 gap-2">
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => handleChange('corrosionRisk', risk)}
              className={`px-3 py-2.5 rounded transition capitalize text-sm font-semibold ${
                filters.corrosionRisk === risk
                  ? 'bg-brand-cyan text-white'
                  : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-brand-slate mb-2">Field Work Disruption Risk</label>
        <div className="grid grid-cols-2 gap-2">
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => handleChange('disruptionRisk', risk)}
              className={`px-3 py-2.5 rounded transition capitalize text-sm font-semibold ${
                filters.disruptionRisk === risk
                  ? 'bg-brand-cyan text-white'
                  : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Economic Impact */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.highValueRegions}
            onChange={(e) => handleChange('highValueRegions', e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
          <span className="text-brand-lightest-slate">High-Value Regions</span>
        </label>
      </div>
    </div>
  );
}

