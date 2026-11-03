import React from 'react';
import type { GraphProvenance } from '../../../types/graph';

interface NodeBadgeProps {
  provenance?: GraphProvenance;
  customLabel?: string;
}

export const NodeBadge: React.FC<NodeBadgeProps> = ({ provenance, customLabel }) => {
  if (customLabel) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {customLabel}
      </span>
    );
  }

  switch (provenance) {
    case 'AI_INTERPRETATION':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/15 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
          AI Proposed
        </span>
      );
    case 'HUMAN_REVIEWED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Verified
        </span>
      );
    case 'USER_ASSERTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-blue-500/15 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          User Asserted
        </span>
      );
    case 'REPORTED_IN_PAPER':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Paper Grounded
        </span>
      );
  }
};
