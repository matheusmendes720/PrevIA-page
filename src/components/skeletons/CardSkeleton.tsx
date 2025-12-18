import React from 'react';

interface CardSkeletonProps {
  height?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
}

/**
 * Skeleton component for card loading states
 * Provides visual feedback while cards are loading
 */
const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  height = 'h-48',
  showTitle = true,
  showSubtitle = false
}) => {
  return (
    <div className={`${height} bg-brand-navy/50 rounded-lg p-6 animate-pulse relative overflow-hidden`}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-brand-light-navy/20 to-transparent"></div>
      
      <div className="space-y-4">
        {showTitle && (
          <div className="h-6 bg-brand-light-navy/50 rounded w-2/3"></div>
        )}
        {showSubtitle && (
          <div className="h-4 bg-brand-light-navy/50 rounded w-1/2"></div>
        )}
        <div className="space-y-3 mt-6">
          <div className="h-4 bg-brand-light-navy/50 rounded"></div>
          <div className="h-4 bg-brand-light-navy/50 rounded w-5/6"></div>
          <div className="h-4 bg-brand-light-navy/50 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
