import React from 'react';
import { Network, FilterX, RefreshCw } from 'lucide-react';
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
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[28px] bg-white/80 border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] backdrop-blur-md max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#8E8B92] mb-4 border border-white/90 shadow-xs">
        <FilterX className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-[#29282B] tracking-tight">{title}</h3>
      <p className="text-xs text-[#77747A] mt-2 mb-6 leading-relaxed max-w-xs">{description}</p>

      {onResetFilters && (
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
          onClick={onResetFilters}
        >
          Reset Graph Filters
        </GlassButton>
      )}
    </div>
  );
};

