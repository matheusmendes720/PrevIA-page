import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * Skeleton component for table loading states
 * Provides visual feedback while tables are loading
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <div className="animate-pulse space-y-3">
      {showHeader && (
        <div className="h-12 bg-brand-navy/50 rounded flex items-center px-4 space-x-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-brand-light-navy/50 rounded flex-1"></div>
          ))}
        </div>
      )}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-brand-navy/50 rounded flex items-center px-4 space-x-4 relative overflow-hidden">
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-brand-light-navy/20 to-transparent"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-4 bg-brand-light-navy/50 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
