/**
 * Tab Navigation Component
 * Comprehensive tab navigation for temporal analytics with 12 tabs
 */

'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon: string;
  category: 'leadtime' | 'temporal';
  badge?: number | string;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  // Group tabs by category
  const leadtimeTabs = tabs.filter(t => t.category === 'leadtime');
  const temporalTabs = tabs.filter(t => t.category === 'temporal');
  
  const renderTab = (tab: Tab) => (
    <button
      key={tab.id}
      onClick={() => !tab.disabled && onTabChange(tab.id)}
      disabled={tab.disabled}
      className={`
        tab-button
        ${activeTab === tab.id ? 'active' : ''}
        ${tab.disabled ? 'disabled' : ''}
      `}
      aria-selected={activeTab === tab.id}
      role="tab"
    >
      <span className="tab-icon">{tab.icon}</span>
      <span className="tab-label">{tab.label}</span>
      {tab.badge !== undefined && (
        <span className="tab-badge">{tab.badge}</span>
      )}
    </button>
  );
  
  return (
    <div className="tab-navigation-container" role="tablist">
      {/* Lead Time & Supply Chain Section */}
      <div className="tab-section">
        <div className="tab-section-header">
          <span className="tab-section-icon">📦</span>
          <span className="tab-section-title">Lead Time & Supply Chain</span>
        </div>
        <div className="tab-section-tabs">
          {leadtimeTabs.map(renderTab)}
        </div>
      </div>
      
      {/* Temporal Analytics Section */}
      <div className="tab-section">
        <div className="tab-section-header">
          <span className="tab-section-icon">📈</span>
          <span className="tab-section-title">Temporal Analytics</span>
        </div>
        <div className="tab-section-tabs">
          {temporalTabs.map(renderTab)}
        </div>
      </div>
      
      <style jsx>{`
        .tab-navigation-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 32px;
          background: linear-gradient(135deg, #0f2438 0%, #1a3a52 100%);
          border: 1px solid rgba(32, 160, 132, 0.2);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .tab-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .tab-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #20A084;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(32, 160, 132, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .tab-section-icon {
          font-size: 16px;
        }
        
        .tab-section-title {
          flex: 1;
        }
        
        .tab-section-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #1a3a52 0%, #0f2438 100%);
          border: 1px solid rgba(32, 160, 132, 0.2);
          border-radius: 8px;
          color: #e0e8f0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            0 1px 2px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
        }
        
        .tab-button::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(32, 160, 132, 0.3), rgba(32, 160, 132, 0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .tab-button:hover:not(.disabled) {
          background: linear-gradient(135deg, #20A084 0%, #1a8a6f 100%);
          color: white;
          border-color: rgba(32, 160, 132, 0.6);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(32, 160, 132, 0.4),
            0 4px 8px rgba(32, 160, 132, 0.2),
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .tab-button:hover:not(.disabled)::before {
          opacity: 1;
        }
        
        .tab-button.active {
          background: linear-gradient(135deg, #20A084 0%, #18967a 100%);
          color: white;
          border-color: rgba(32, 160, 132, 0.8);
          box-shadow: 
            0 6px 20px rgba(32, 160, 132, 0.5),
            0 3px 6px rgba(32, 160, 132, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }
        
        .tab-button.active::before {
          opacity: 1;
        }
        
        .tab-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .tab-icon {
          font-size: 16px;
          line-height: 1;
        }
        
        .tab-label {
          font-weight: 600;
        }
        
        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: var(--color-error, #ef4444);
          color: white;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }
        
        .tab-button.active .tab-badge {
          background: rgba(255, 255, 255, 0.3);
        }
        
        @media (max-width: 1024px) {
          .tab-section-tabs {
            flex-direction: column;
          }
          
          .tab-button {
            width: 100%;
            justify-content: flex-start;
          }
        }
        
        @media (max-width: 768px) {
          .tab-navigation-container {
            padding: 16px;
            gap: 16px;
          }
          
          .tab-section-header {
            font-size: 12px;
          }
          
          .tab-button {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}


