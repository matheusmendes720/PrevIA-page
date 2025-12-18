'use client';

import React from 'react';

interface TemporalFiltersProps {
  filters: {
    maintenanceDateRange: { start: string; end: string } | null;
    nextMaintenanceDays: number | null;
    showOverdue: boolean;
    seasonalPattern: 'all' | 'rainy' | 'summer' | 'dry';
  };
  onChange: (filters: TemporalFiltersProps['filters']) => void;
}

export default function TemporalFilters({ filters, onChange }: TemporalFiltersProps) {
  const handleChange = (key: keyof typeof filters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs">
      <h3 className="text-sm font-semibold mb-4 text-brand-cyan">Temporal Filters</h3>

      {/* Maintenance Date Range */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">Maintenance Date Range</label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.maintenanceDateRange?.start || ''}
            onChange={(e) =>
              handleChange('maintenanceDateRange', {
                ...filters.maintenanceDateRange,
                start: e.target.value,
                end: filters.maintenanceDateRange?.end || '',
              })
            }
            className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
          />
          <input
            type="date"
            value={filters.maintenanceDateRange?.end || ''}
            onChange={(e) =>
              handleChange('maintenanceDateRange', {
                ...filters.maintenanceDateRange,
                start: filters.maintenanceDateRange?.start || '',
                end: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
          />
          <button
            onClick={() => handleChange('maintenanceDateRange', null)}
            className="w-full px-3 py-1 bg-brand-light-navy/50 text-brand-lightest-slate rounded hover:bg-brand-light-navy text-xs"
          >
            Clear Range
          </button>
        </div>
      </div>

      {/* Next Maintenance Days */}
      <div className="mb-4">
        <label className="block text-brand-slate mb-2">
          Towers Needing Maintenance (Next X Days)
        </label>
        <input
          type="number"
          min="1"
          max="365"
          value={filters.nextMaintenanceDays || ''}
          onChange={(e) =>
            handleChange('nextMaintenanceDays', e.target.value ? parseInt(e.target.value) : null)
          }
          placeholder="Days"
          className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
        />
      </div>

      {/* Show Overdue */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showOverdue}
            onChange={(e) => handleChange('showOverdue', e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
          <span className="text-brand-lightest-slate">Show Overdue Maintenance</span>
        </label>
      </div>

      {/* Seasonal Pattern */}
      <div>
        <label className="block text-brand-slate mb-2">Seasonal Pattern</label>
        <div className="grid grid-cols-2 gap-2">
          {(['all', 'rainy', 'summer', 'dry'] as const).map((pattern) => (
            <button
              key={pattern}
              onClick={() => handleChange('seasonalPattern', pattern)}
              className={`px-3 py-2 rounded transition capitalize ${
                filters.seasonalPattern === pattern
                  ? 'bg-brand-cyan text-white'
                  : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
              }`}
            >
              {pattern === 'all' ? 'All' : pattern === 'rainy' ? 'Rainy Season' : pattern === 'summer' ? 'Summer' : 'Dry Season'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

