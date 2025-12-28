import React from 'react';

export interface ExternalFactor {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  impact: string;
  source: string;
  icon?: React.ReactNode;
}

interface ExternalFactorsBarProps {
  factors: ExternalFactor[];
}

const ExternalFactorsBar: React.FC<ExternalFactorsBarProps> = ({ factors }) => {
  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-brand-slate';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return '↑';
      case 'decrease':
        return '↓';
      default:
        return '→';
    }
  };

  if (factors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-brand-light-navy/50 rounded-lg border border-brand-cyan/20">
      <h4 className="text-sm font-semibold text-brand-lightest-slate mb-3">Fatores Externos</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {factors.map((factor, index) => (
          <div
            key={index}
            className="bg-brand-navy/50 p-3 rounded border border-brand-cyan/10"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-brand-slate">{factor.name}</span>
              {factor.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-lightest-slate">{factor.value}</span>
              <span className={`text-xs font-semibold ${getChangeColor(factor.changeType)}`}>
                {getChangeIcon(factor.changeType)} {factor.change}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-brand-slate">Impacto: </span>
              <span className="text-xs font-semibold text-brand-cyan">{factor.impact}</span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-brand-slate opacity-75">Fonte: {factor.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExternalFactorsBar;

