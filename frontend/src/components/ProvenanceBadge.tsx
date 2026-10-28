import React from 'react';
import { FileCheck, Sparkles, User, Edit3, HelpCircle, CheckCircle } from 'lucide-react';

interface Props {
  provenance: string;
  confidence?: number;
  className?: string;
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, confidence, className = '' }) => {
  const norm = (provenance || '').toUpperCase();

  if (norm.includes('REPORTED') || norm === 'REPORTED_IN_PAPER') {
    return (
      <span className={`badge-reported ${className}`} title="Verbatim factual evidence reported in original paper text">
        <FileCheck className="w-3.5 h-3.5" />
        <span>Reported in paper</span>
        {confidence !== undefined && <span className="opacity-75 text-[10px]">({Math.round(confidence * 100)}%)</span>}
      </span>
    );
  }

  if (norm.includes('AI') || norm === 'AI_INTERPRETATION' || norm === 'SYNTHESIS') {
    return (
      <span className={`badge-ai ${className}`} title="AI generated synthesis or interpretation (not a direct paper fact)">
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI interpretation</span>
        {confidence !== undefined && <span className="opacity-75 text-[10px]">({Math.round(confidence * 100)}%)</span>}
      </span>
    );
  }

  if (norm.includes('ANNOTATION') || norm === 'USER_ANNOTATION') {
    return (
      <span className={`badge-annotation ${className}`} title="User personal annotation or comment">
        <User className="w-3.5 h-3.5" />
        <span>User annotation</span>
      </span>
    );
  }

  if (norm.includes('ASSERTED') || norm === 'USER_ASSERTED') {
    return (
      <span className={`badge-asserted ${className}`} title="Direct assertion by human researcher">
        <Edit3 className="w-3.5 h-3.5" />
        <span>User asserted</span>
      </span>
    );
  }

  if (norm.includes('PROPOSED') || norm === 'PROPOSED_RELATION') {
    return (
      <span className={`badge-proposed ${className}`} title="AI-proposed relation pending human verification">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Proposed relation</span>
      </span>
    );
  }

  if (norm.includes('REVIEWED') || norm === 'HUMAN_REVIEWED') {
    return (
      <span className={`badge-human-reviewed ${className}`} title="Verified and approved by human researcher">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Human reviewed</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {provenance}
    </span>
  );
};
