'use client';

import React, { useState } from 'react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  region?: string;
  towerId?: string;
  read: boolean;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
  onMarkRead: (alertId: string) => void;
  filter?: 'all' | 'critical' | 'warning' | 'info';
  onFilterChange?: (filter: 'all' | 'critical' | 'warning' | 'info') => void;
}

export default function AlertPanel({
  alerts,
  onDismiss,
  onMarkRead,
  filter = 'all',
  onFilterChange,
}: AlertPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const filteredAlerts = alerts.filter(
    (alert) => filter === 'all' || alert.type === filter
  );

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.type === 'critical' && !a.read).length;

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500/40 bg-red-500/10';
      case 'warning':
        return 'border-orange-500/40 bg-orange-500/10';
      default:
        return 'border-brand-cyan/40 bg-brand-cyan/10';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-brand-cyan">Alerts</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
              {unreadCount}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-semibold">
              {criticalCount} Critical
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-brand-cyan hover:text-brand-cyan/80"
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <>
          {/* Filter Buttons */}
          {onFilterChange && (
            <div className="flex gap-2 mb-4">
              {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`px-2 py-1 rounded text-xs transition capitalize ${
                    filter === f
                      ? 'bg-brand-cyan text-white'
                      : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="text-brand-slate text-center py-4">No alerts</div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border ${getAlertColor(alert.type)} ${
                    !alert.read ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-brand-lightest-slate mb-1">
                          {alert.title}
                        </div>
                        <div className="text-brand-slate text-xs">{alert.message}</div>
                        {alert.towerId && (
                          <div className="text-brand-slate text-xs mt-1">
                            Tower: {alert.towerId}
                          </div>
                        )}
                        {alert.region && (
                          <div className="text-brand-slate text-xs">Region: {alert.region}</div>
                        )}
                        <div className="text-brand-slate text-xs mt-1">
                          {alert.timestamp.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {!alert.read && (
                      <button
                        onClick={() => onMarkRead(alert.id)}
                        className="px-2 py-1 bg-brand-light-navy/50 text-brand-lightest-slate rounded text-xs hover:bg-brand-light-navy transition"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="px-2 py-1 bg-brand-light-navy/50 text-brand-lightest-slate rounded text-xs hover:bg-brand-light-navy transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

