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
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-white/60 border border-white/70 animate-pulse flex items-center px-4 gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-200/80 rounded w-1/3" />
              <div className="h-2.5 bg-slate-200/60 rounded w-1/4" />
            </div>
            <div className="w-20 h-6 bg-slate-200/60 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div className={`h-96 rounded-2xl bg-white/50 border border-white/70 animate-pulse flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-slate-200/70 mb-4" />
        <div className="h-4 bg-slate-200/80 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200/50 rounded w-64" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="glass-panel p-6 space-y-4 animate-pulse flex flex-col justify-between h-48"
        >
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200/70 rounded w-20" />
              <div className="h-5 bg-slate-200/60 rounded-full w-24" />
            </div>
            <div className="h-4 bg-slate-200/90 rounded w-3/4" />
            <div className="h-3 bg-slate-200/60 rounded w-full" />
            <div className="h-3 bg-slate-200/60 rounded w-5/6" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="h-3 bg-slate-200/70 rounded w-28" />
            <div className="h-7 bg-slate-200/80 rounded-lg w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
