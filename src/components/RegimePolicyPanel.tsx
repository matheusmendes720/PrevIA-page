'use client';

import React from 'react';
import ActionBadge, { ActionBadgeStatus } from './ActionBadge';

interface PolicyAdjustment {
  parameter: string;
  current: number;
  recommended: number;
  unit: string;
  impact: string;
  urgency?: ActionBadgeStatus;
}

interface RegimePolicyPanelProps {
  currentRegime: string;
  regimeStats?: {
    mean: number;
    std: number;
    duration: string;
  };
  adjustments: PolicyAdjustment[];
  totalSavings: number;
  onApplyAdjustment?: (parameter: string) => void;
}

const RegimePolicyPanel: React.FC<RegimePolicyPanelProps> = ({
  currentRegime,
  regimeStats,
  adjustments,
  totalSavings,
  onApplyAdjustment
}) => {
  return (
    <div
      className="regime-policy-panel"
      style={{
        background: 'var(--color-surface, #0f2438)',
        border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '16px'
      }}
    >
      {/* Header */}
      <div
        className="panel-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))'
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text, #e0e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📍</span>
            Current Regime: {currentRegime}
          </h4>
          {regimeStats && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: 'var(--color-text-secondary, #a0aab8)'
              }}
            >
              Demand: {regimeStats.mean.toFixed(0)} ± {regimeStats.std.toFixed(0)} un/d
              {regimeStats.duration && ` • Duration: ${regimeStats.duration}`}
            </p>
          )}
        </div>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--color-success, #10b981)',
            borderRadius: '8px',
            padding: '8px 16px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary, #a0aab8)',
              marginBottom: '2px'
            }}
          >
            Total Annual Savings
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-success, #10b981)'
            }}
          >
            R$ {totalSavings.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Adjustments Section */}
      <div className="adjustments-section">
        <h5
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-primary, #20A084)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🎯</span>
          Recommended Policy Adjustments
        </h5>

        <div
          className="adjustments-table"
          style={{
            background: 'var(--color-bg, #0a1628)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(32, 160, 132, 0.1)'
                }}
              >
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #20A084)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Parameter
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #20A084)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Current
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #20A084)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Recommended
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #20A084)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Impact
                </th>
                {onApplyAdjustment && (
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--color-primary, #20A084)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adj, i) => (
                <tr
                  key={i}
                  style={{
                    borderTop: '1px solid var(--color-border, rgba(255,255,255,0.1))'
                  }}
                >
                  <td
                    style={{
                      padding: '12px 16px',
                      color: 'var(--color-text, #e0e8f0)',
                      fontWeight: 500
                    }}
                  >
                    {adj.parameter}
                    {adj.urgency && (
                      <span style={{ marginLeft: '8px' }}>
                        <ActionBadge status={adj.urgency} size="sm" />
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary, #a0aab8)'
                    }}
                  >
                    {adj.current} {adj.unit}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: 'var(--color-success, #10b981)',
                      fontWeight: 600
                    }}
                  >
                    {adj.recommended} {adj.unit}
                    <span
                      style={{
                        marginLeft: '4px',
                        fontSize: '11px',
                        color:
                          adj.recommended < adj.current
                            ? 'var(--color-success, #10b981)'
                            : adj.recommended > adj.current
                            ? 'var(--color-warning, #f97316)'
                            : 'var(--color-text-secondary, #a0aab8)'
                      }}
                    >
                      ({adj.recommended < adj.current ? '↓' : adj.recommended > adj.current ? '↑' : '='})
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: 'var(--color-text, #e0e8f0)',
                      fontSize: '12px'
                    }}
                  >
                    {adj.impact}
                  </td>
                  {onApplyAdjustment && (
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}
                    >
                      <button
                        onClick={() => onApplyAdjustment(adj.parameter)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'var(--color-primary, #20A084)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div
        className="panel-footer"
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(32, 160, 132, 0.05)',
          borderRadius: '6px',
          borderLeft: '3px solid var(--color-primary, #20A084)'
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--color-text, #e0e8f0)',
            lineHeight: 1.6
          }}
        >
          💡 <strong>Recommendation:</strong> Apply policy adjustments to optimize for the current {currentRegime} regime.
          These adjustments are based on historical regime performance and ML-driven optimization.
        </p>
      </div>
    </div>
  );
};

export default RegimePolicyPanel;

