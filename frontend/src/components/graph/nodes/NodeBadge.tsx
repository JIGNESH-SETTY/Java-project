import React from 'react';
import type { GraphProvenance } from '../../../types/graph';

interface NodeBadgeProps {
  provenance?: GraphProvenance;
  customLabel?: string;
}

export const NodeBadge: React.FC<NodeBadgeProps> = ({ provenance, customLabel }) => {
  if (customLabel) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-black/10 text-stone-700">
        {customLabel}
      </span>
    );
  }

  switch (provenance) {
    case 'AI_INTERPRETATION':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/20 text-amber-900 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          AI Proposed
        </span>
      );
    case 'HUMAN_REVIEWED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/20 text-emerald-900 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Verified
        </span>
      );
    case 'USER_ASSERTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-indigo-500/20 text-indigo-900 border border-indigo-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          User Asserted
        </span>
      );
    case 'REPORTED_IN_PAPER':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-black/10 text-stone-800">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          Paper Grounded
        </span>
      );
  }
};

