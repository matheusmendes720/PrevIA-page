import React from 'react';

interface ChartSkeletonProps {
  height?: string;
  showTitle?: boolean;
  showLegend?: boolean;
}

/**
 * Skeleton component for chart loading states
 * Provides visual feedback while charts are loading
 */
const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  height = 'h-64', 
  showTitle = true,
  showLegend = true 
}) => {
  return (
    <div className="animate-pulse space-y-4">
      {showTitle && (
        <div className="h-8 bg-brand-navy/50 rounded w-1/3"></div>
      )}
      <div className={`${height} bg-brand-navy/50 rounded-lg relative overflow-hidden`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-brand-light-navy/20 to-transparent"></div>
      </div>
      {showLegend && (
        <div className="flex space-x-4 justify-center">
          <div className="h-4 bg-brand-navy/50 rounded w-24"></div>
          <div className="h-4 bg-brand-navy/50 rounded w-24"></div>
          <div className="h-4 bg-brand-navy/50 rounded w-24"></div>
        </div>
      )}
    </div>
  );
};

export default ChartSkeleton;
