'use client';

import React from 'react';

export type ActionBadgeStatus = 'URGENT' | 'IMPORTANT' | 'MONITOR' | 'OK' | 'CRITICAL';

interface ActionBadgeProps {
  status: ActionBadgeStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  CRITICAL: {
    icon: '🚨',
    bgColor: 'rgba(185, 28, 28, 0.2)',
    textColor: '#dc2626',
    borderColor: '#dc2626',
    label: 'CRITICAL'
  },
  URGENT: {
    icon: '🚨',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    textColor: '#ef4444',
    borderColor: '#ef4444',
    label: 'URGENT'
  },
  IMPORTANT: {
    icon: '⚠️',
    bgColor: 'rgba(249, 115, 22, 0.2)',
    textColor: '#f97316',
    borderColor: '#f97316',
    label: 'IMPORTANT'
  },
  MONITOR: {
    icon: '👁️',
    bgColor: 'rgba(234, 179, 8, 0.2)',
    textColor: '#eab308',
    borderColor: '#eab308',
    label: 'MONITOR'
  },
  OK: {
    icon: '✅',
    bgColor: 'rgba(16, 185, 129, 0.2)',
    textColor: '#10b981',
    borderColor: '#10b981',
    label: 'OK'
  }
};

const sizeConfig = {
  sm: { padding: '2px 6px', fontSize: '10px', iconSize: '10px' },
  md: { padding: '4px 10px', fontSize: '11px', iconSize: '12px' },
  lg: { padding: '6px 14px', fontSize: '12px', iconSize: '14px' }
};

const ActionBadge: React.FC<ActionBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-[11px]'
  };

  const statusClasses = {
    CRITICAL: 'bg-red-500/20 text-red-500 border-red-500/50',
    URGENT: 'bg-red-400/20 text-red-400 border-red-400/50',
    IMPORTANT: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
    MONITOR: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    OK: 'bg-green-500/20 text-green-500 border-green-500/50'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider border rounded transition-all duration-300 ${sizeClasses[size]} ${statusClasses[status]} ${className}`}
    >
      {showIcon && (
        <span className="leading-none">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
};

// Helper function to determine status based on value and thresholds
export function getUrgencyStatus(
  value: number,
  thresholds: { critical?: number; urgent: number; important: number; monitor: number }
): ActionBadgeStatus {
  if (thresholds.critical !== undefined && value >= thresholds.critical) return 'CRITICAL';
  if (value >= thresholds.urgent) return 'URGENT';
  if (value >= thresholds.important) return 'IMPORTANT';
  if (value >= thresholds.monitor) return 'MONITOR';
  return 'OK';
}

// Helper for lead time urgency
export function getLeadTimeUrgency(leadTimeDays: number): ActionBadgeStatus {
  if (leadTimeDays > 60) return 'CRITICAL';
  if (leadTimeDays > 45) return 'URGENT';
  if (leadTimeDays > 30) return 'IMPORTANT';
  if (leadTimeDays > 20) return 'MONITOR';
  return 'OK';
}

// Helper for risk score urgency
export function getRiskScoreUrgency(riskScore: number): ActionBadgeStatus {
  if (riskScore >= 9) return 'CRITICAL';
  if (riskScore >= 7) return 'URGENT';
  if (riskScore >= 5) return 'IMPORTANT';
  if (riskScore >= 3) return 'MONITOR';
  return 'OK';
}

// Helper for reliability urgency (inverted - lower is worse)
export function getReliabilityUrgency(reliability: number): ActionBadgeStatus {
  if (reliability < 0.80) return 'CRITICAL';
  if (reliability < 0.85) return 'URGENT';
  if (reliability < 0.90) return 'IMPORTANT';
  if (reliability < 0.95) return 'MONITOR';
  return 'OK';
}

// Helper for reorder status
export function getReorderUrgency(daysUntilReorder: number): ActionBadgeStatus {
  if (daysUntilReorder < 0) return 'CRITICAL';
  if (daysUntilReorder < 3) return 'URGENT';
  if (daysUntilReorder < 7) return 'IMPORTANT';
  if (daysUntilReorder < 14) return 'MONITOR';
  return 'OK';
}

export default ActionBadge;

