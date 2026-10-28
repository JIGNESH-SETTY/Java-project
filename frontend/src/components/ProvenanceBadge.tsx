import React from 'react';
import { ProvenanceType } from '../types';
import { FileCheck, Sparkles, User, Edit3 } from 'lucide-react';

interface Props {
  provenance: ProvenanceType;
  confidence?: number;
  className?: string;
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, confidence, className = '' }) => {
  switch (provenance) {
    case 'REPORTED_IN_PAPER':
      return (
        <span className={`badge-reported ${className}`} title="Fact extracted directly from source paper text">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reported in paper</span>
          {confidence && <span className="opacity-75 text-[10px]">({Math.round(confidence * 100)}%)</span>}
        </span>
      );
    case 'AI_INTERPRETATION':
      return (
        <span className={`badge-ai ${className}`} title="Synthesized or inferred by AI model (not factual quotation)">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>AI interpretation</span>
          {confidence && <span className="opacity-75 text-[10px]">({Math.round(confidence * 100)}%)</span>}
        </span>
      );
    case 'USER_ANNOTATION':
      return (
        <span className={`badge-annotation ${className}`} title="Subjective note added by user">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>User annotation</span>
        </span>
      );
    case 'USER_ASSERTED':
      return (
        <span className={`badge-asserted ${className}`} title="Directly asserted by human researcher">
          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
          <span>User asserted</span>
        </span>
      );
    default:
      return null;
  }
};
