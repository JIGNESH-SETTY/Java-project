import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'row' | 'text' | 'graph';
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  type = 'card',
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'row') {
    return (
      <div className={`space-y-2.5 smooth-page-load ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-[10px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] flex items-center px-4 gap-4"
          >
            <div className="w-8 h-8 rounded-[8px] shimmer-skeleton shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 shimmer-skeleton rounded-[6px] w-1/3" />
              <div className="h-2.5 shimmer-skeleton rounded-[6px] w-1/4" />
            </div>
            <div className="w-20 h-6 shimmer-skeleton rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div className={`h-96 rounded-[12px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] flex flex-col items-center justify-center p-6 smooth-page-load ${className}`}>
        <div className="w-14 h-14 rounded-full shimmer-skeleton mb-4" />
        <div className="h-4 shimmer-skeleton rounded-[6px] w-48 mb-2.5" />
        <div className="h-3 shimmer-skeleton rounded-[6px] w-64" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 smooth-page-load ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="card p-5 space-y-4 flex flex-col justify-between h-48"
        >
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="h-3 shimmer-skeleton rounded-[6px] w-20" />
              <div className="h-5 shimmer-skeleton rounded-full w-24" />
            </div>
            <div className="h-4 shimmer-skeleton rounded-[6px] w-3/4" />
            <div className="h-3 shimmer-skeleton rounded-[6px] w-full" />
            <div className="h-3 shimmer-skeleton rounded-[6px] w-5/6" />
          </div>
          <div className="flex justify-between items-center pt-2.5 border-t border-[#D9E1E9] dark:border-[#1E4656]">
            <div className="h-3 shimmer-skeleton rounded-[6px] w-28" />
            <div className="h-6 shimmer-skeleton rounded-[8px] w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
