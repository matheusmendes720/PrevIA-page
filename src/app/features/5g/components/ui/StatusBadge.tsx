'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'high' | 'medium' | 'low' | 'critical' | 'warning' | 'success' | 'info';
  percentage?: number;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, percentage, label }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'warning':
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'success':
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'info':
        return 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40';
      default:
        return 'bg-brand-light-navy/50 text-brand-slate border-brand-cyan/20';
    }
  };

  const displayText = label || (percentage !== undefined ? `${percentage}%` : status);

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusStyles()}`}
    >
      {displayText}
    </span>
  );
};

export default React.memo(StatusBadge);


















