'use client';

import React from 'react';

interface BusinessTranslationProps {
  technical: string;
  business: string;
  action: string;
  impact: string;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

const variantStyles = {
  default: {
    bg: 'rgba(32, 160, 132, 0.05)',
    border: 'var(--color-primary, #20A084)',
    labelColor: 'var(--color-primary, #20A084)'
  },
  warning: {
    bg: 'rgba(249, 115, 22, 0.05)',
    border: 'var(--color-warning, #f97316)',
    labelColor: 'var(--color-warning, #f97316)'
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.05)',
    border: 'var(--color-success, #10b981)',
    labelColor: 'var(--color-success, #10b981)'
  },
  info: {
    bg: 'rgba(99, 102, 241, 0.05)',
    border: '#6366f1',
    labelColor: '#6366f1'
  }
};

const BusinessTranslationCard: React.FC<BusinessTranslationProps> = ({
  technical,
  business,
  action,
  impact,
  variant = 'default'
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className="business-translation-card"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px'
      }}
    >
      <div className="translation-rows" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="translation-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span
            className="label"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary, #a0aab8)',
              minWidth: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            📊 Technical:
          </span>
          <span
            className="value"
            style={{
              fontSize: '13px',
              color: 'var(--color-text, #e0e8f0)',
              flex: 1
            }}
          >
            {technical}
          </span>
        </div>

        <div className="translation-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span
            className="label"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary, #a0aab8)',
              minWidth: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            💼 Business:
          </span>
          <span
            className="value"
            style={{
              fontSize: '13px',
              color: 'var(--color-text, #e0e8f0)',
              flex: 1,
              fontWeight: 500
            }}
          >
            {business}
          </span>
        </div>

        <div className="translation-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span
            className="label"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary, #a0aab8)',
              minWidth: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            🎯 Action:
          </span>
          <span
            className="value action"
            style={{
              fontSize: '13px',
              color: styles.labelColor,
              flex: 1,
              fontWeight: 600
            }}
          >
            {action}
          </span>
        </div>

        <div className="translation-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span
            className="label"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary, #a0aab8)',
              minWidth: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            💰 Impact:
          </span>
          <span
            className="value"
            style={{
              fontSize: '13px',
              color: 'var(--color-success, #10b981)',
              flex: 1,
              fontWeight: 500
            }}
          >
            {impact}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessTranslationCard;

