import React from 'react';
import CardSkeleton from './CardSkeleton';
import ChartSkeleton from './ChartSkeleton';

/**
 * Skeleton component for full dashboard loading states
 * Combines multiple skeleton types for complete dashboard preview
 */
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} height="h-32" showTitle={true} showSubtitle={false} />
        ))}
      </div>
      
      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-80" showTitle={true} showLegend={true} />
        <ChartSkeleton height="h-80" showTitle={true} showLegend={true} />
      </div>
      
      {/* Secondary Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton height="h-64" showTitle={true} showSubtitle={true} />
        <CardSkeleton height="h-64" showTitle={true} showSubtitle={true} />
        <CardSkeleton height="h-64" showTitle={true} showSubtitle={true} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;

