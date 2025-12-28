import React from 'react';

export type ScenarioType = 'conservative' | 'baseline' | 'aggressive';

interface ScenarioToggleProps {
  selectedScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
}

const ScenarioToggle: React.FC<ScenarioToggleProps> = ({ selectedScenario, onScenarioChange }) => {
  const scenarios: Array<{ value: ScenarioType; label: string; description: string }> = [
    {
      value: 'conservative',
      label: 'Conservador',
      description: '80% demanda, 1.5x estoque de segurança',
    },
    {
      value: 'baseline',
      label: 'Baseline',
      description: '100% demanda, 1.0x estoque de segurança',
    },
    {
      value: 'aggressive',
      label: 'Agressivo',
      description: '120% demanda, 0.7x estoque de segurança',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      {scenarios.map((scenario) => (
        <button
          key={scenario.value}
          onClick={() => onScenarioChange(scenario.value)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedScenario === scenario.value
              ? 'bg-brand-cyan text-brand-navy'
              : 'bg-brand-light-navy text-brand-slate hover:bg-brand-navy'
          }`}
          aria-pressed={selectedScenario === scenario.value}
          aria-label={`Cenário ${scenario.label}`}
        >
          <div className="font-bold">{scenario.label}</div>
          <div className="text-xs opacity-75">{scenario.description}</div>
        </button>
      ))}
    </div>
  );
};

export default ScenarioToggle;

