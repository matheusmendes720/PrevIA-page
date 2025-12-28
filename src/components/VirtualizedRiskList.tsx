import React, { useMemo } from 'react';
// Note: react-window not installed - using fallback implementation
// import { FixedSizeList as List } from 'react-window';
import RiskCard from './RiskCard';
import { RiskAssessment } from '../types/prescriptive';

interface VirtualizedRiskListProps {
  riskAssessments: Record<string, RiskAssessment>;
  onRiskClick: (familyName: string, riskData: RiskAssessment) => void;
  height?: number;
}

/**
 * Virtualized list for large risk matrices - improves performance with 100+ items
 */
const VirtualizedRiskList: React.FC<VirtualizedRiskListProps> = ({
  riskAssessments,
  onRiskClick,
  height = 600,
}) => {
  const riskEntries = useMemo(
    () => Object.entries(riskAssessments),
    [riskAssessments]
  );

  if (riskEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-brand-slate">
        Nenhuma avaliação de risco disponível.
      </div>
    );
  }

  // Fallback: render all items (virtualization requires react-window package)
  return (
    <div className="space-y-3 overflow-y-auto" style={{ maxHeight: `${height}px` }}>
      {riskEntries.map(([familyName, riskData], index) => (
        <div key={index} className="px-2">
          <RiskCard
                  family={familyName}
            risk={riskData}
            onCardClick={() => onRiskClick(familyName, riskData)}
          />
        </div>
      ))}
    </div>
  );
};

export default VirtualizedRiskList;

