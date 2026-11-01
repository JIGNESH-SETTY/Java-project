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
        <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
          <Network className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-[#29282B] tracking-tight">Synthesizing Evidence Network</h4>
      <p className="text-xs text-[#77747A] mt-1.5 max-w-sm leading-relaxed">{message}</p>
    </div>
  );
};

