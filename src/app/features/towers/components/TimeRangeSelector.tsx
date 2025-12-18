'use client';

import React, { useState } from 'react';

export type TimeRangePreset = 'today' | '7d' | '30d' | '3m' | '1y' | 'custom';

interface TimeRangeSelectorProps {
  value: { start: string; end: string };
  preset: TimeRangePreset;
  onChange: (range: { start: string; end: string }, preset: TimeRangePreset) => void;
}

export default function TimeRangeSelector({ value, preset, onChange }: TimeRangeSelectorProps) {
  const [isCustom, setIsCustom] = useState(preset === 'custom');

  const getPresetRange = (presetValue: TimeRangePreset): { start: string; end: string } => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];

    switch (presetValue) {
      case 'today':
        return { start: end, end };
      case '7d':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return { start: sevenDaysAgo.toISOString().split('T')[0], end };
      case '30d':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { start: thirtyDaysAgo.toISOString().split('T')[0], end };
      case '3m':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return { start: threeMonthsAgo.toISOString().split('T')[0], end };
      case '1y':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        return { start: oneYearAgo.toISOString().split('T')[0], end };
      default:
        return value;
    }
  };

  const handlePresetChange = (newPreset: TimeRangePreset) => {
    if (newPreset === 'custom') {
      setIsCustom(true);
      onChange(value, 'custom');
    } else {
      setIsCustom(false);
      const range = getPresetRange(newPreset);
      onChange(range, newPreset);
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', date: string) => {
    const newValue = { ...value, [field]: date };
    onChange(newValue, 'custom');
  };

  const presets: Array<{ value: TimeRangePreset; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs">
      <h3 className="text-sm font-semibold mb-3 text-brand-cyan">Time Range</h3>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePresetChange(p.value)}
            className={`px-3 py-2 rounded transition ${
              (isCustom && p.value === 'custom') || (!isCustom && preset === p.value)
                ? 'bg-brand-cyan text-white'
                : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {isCustom && (
        <div className="space-y-3">
          <div>
            <label className="block text-brand-slate mb-1">Start Date</label>
            <input
              type="date"
              value={value.start}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="block text-brand-slate mb-1">End Date</label>
            <input
              type="date"
              value={value.end}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded text-brand-lightest-slate focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>
      )}

      {/* Brazilian Calendar Markers */}
      <div className="mt-4 pt-4 border-t border-brand-cyan/20">
        <div className="text-brand-slate mb-2">Upcoming Events</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 text-purple-400">
            <span>🎉</span>
            <span>Carnival: Feb 15-18, 2025</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <span>🌧️</span>
            <span>Rainy Season: Nov - Apr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

