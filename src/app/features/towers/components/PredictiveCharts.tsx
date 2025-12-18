'use client';

import React from 'react';

interface PredictiveChartsProps {
  className?: string;
}

export default function PredictiveCharts({ className }: PredictiveChartsProps) {
  return (
    <div className={`bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs ${className}`}>
      <h3 className="text-sm font-semibold mb-4 text-brand-cyan">Predictive Analytics</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-brand-slate mb-2">Maintenance Demand Forecast (Next 90 Days)</div>
          <div className="h-32 bg-brand-light-navy/20 rounded p-2 flex items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-brand-cyan rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                }}
                title={`Day ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-brand-slate mb-2">Coverage Gap Predictions</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-brand-light-navy/30 rounded">
              <span className="text-brand-lightest-slate">High Priority Gaps</span>
              <span className="text-brand-cyan font-semibold">23</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-brand-light-navy/30 rounded">
              <span className="text-brand-lightest-slate">Medium Priority Gaps</span>
              <span className="text-orange-400 font-semibold">47</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-brand-light-navy/30 rounded">
              <span className="text-brand-lightest-slate">Low Priority Gaps</span>
              <span className="text-green-400 font-semibold">89</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-brand-slate mb-2">Weather Impact Predictions</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-brand-lightest-slate">High Risk Periods</span>
              <span className="text-red-400 font-semibold">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-lightest-slate">Moderate Risk Periods</span>
              <span className="text-orange-400 font-semibold">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

