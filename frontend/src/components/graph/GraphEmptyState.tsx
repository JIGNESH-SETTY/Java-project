import React from 'react';
import { FilterX, RefreshCw } from 'lucide-react';
import { GlassButton } from '../GlassButton';

interface GraphEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  className?: string;
}

export const GraphEmptyState: React.FC<GraphEmptyStateProps> = ({
  title = 'No Graph Entities Match Your Query',
  description = 'Try widening the publication year range, clearing specific concept type filters, or switching to the demo dataset.',
  onResetFilters,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-slate-700 shadow-xs">
        <FilterX className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed max-w-xs">{description}</p>

      {onResetFilters && (
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          onClick={onResetFilters}
        >
          Reset Graph Filters
        </GlassButton>
      )}
    </div>
  );
};
