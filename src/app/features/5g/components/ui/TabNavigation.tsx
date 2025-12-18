'use client';

import React from 'react';

interface TabNavigationProps {
  mainTab: string;
  subTab: string;
  onMainTabChange: (tab: string) => void;
  onSubTabChange: (tab: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  mainTab,
  subTab,
  onMainTabChange,
  onSubTabChange,
  className = ''
}) => {
  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard & Métricas' },
    { id: 'insights', label: 'Insights & Prescrições' }
  ];

  const dashboardSubTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'coverage', label: 'Cobertura', icon: '📈' },
    { id: 'regional', label: 'Regional', icon: '🗺️' },
    { id: 'timeline', label: 'Timeline', icon: '⏰' }
  ];

  const insightsSubTabs = [
    { id: 'projections', label: 'Projeções', icon: '🔮' },
    { id: 'estoque', label: 'Estoque', icon: '📦' },
    { id: 'supplychain', label: 'Supply Chain', icon: '🔗' },
    { id: 'actions', label: 'Ações', icon: '✅' },
    { id: 'sales', label: 'Sales', icon: '💰' }
  ];

  const subTabs = mainTab === 'dashboard' ? dashboardSubTabs : insightsSubTabs;

  return (
    <div className={className}>
      {/* Main Tabs */}
      <div className="flex gap-2 mb-4 border-b border-brand-cyan/20">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onMainTabChange(tab.id)}
            className={`px-4 py-2 font-semibold transition-colors relative ${
              mainTab === tab.id
                ? 'text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-brand-slate hover:text-brand-light-slate'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 flex-wrap">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all min-w-[44px] min-h-[44px] flex items-center gap-2 ${
              subTab === tab.id
                ? 'bg-brand-cyan text-brand-navy shadow-lg shadow-brand-cyan/20'
                : 'bg-brand-light-navy/50 text-brand-slate hover:bg-brand-light-navy border border-brand-cyan/20'
            } focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-navy`}
            aria-pressed={subTab === tab.id}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TabNavigation);

















