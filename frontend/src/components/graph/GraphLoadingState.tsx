import React from 'react';
import { Network } from 'lucide-react';

interface GraphLoadingStateProps {
  message?: string;
  className?: string;
}

export const GraphLoadingState: React.FC<GraphLoadingStateProps> = ({
  message = 'Traversing topological connections & assembling citation matrix...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center select-none ${className}`}
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Network className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Synthesizing Evidence Network</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">{message}</p>
    </div>
  );
};
