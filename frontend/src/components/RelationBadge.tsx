import React from 'react';
import { RelationType, ReviewStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRightCircle, MessageSquare, Copy, HelpCircle } from 'lucide-react';

interface RelationProps {
  type: RelationType;
  className?: string;
}

export const RelationBadge: React.FC<RelationProps> = ({ type, className = '' }) => {
  const config = {
    SUPPORTS: { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: CheckCircle2, label: 'Supports' },
    CONTRADICTS: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: XCircle, label: 'Contradicts' },
    QUALIFIES: { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: AlertTriangle, label: 'Qualifies' },
    EXTENDS: { bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', icon: ArrowRightCircle, label: 'Extends' },
    DISCUSSES: { bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: MessageSquare, label: 'Discusses' },
    DUPLICATES: { bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: Copy, label: 'Duplicates' },
    UNRELATED: { bg: 'bg-gray-500/15 text-gray-300 border-gray-500/30', icon: HelpCircle, label: 'Unrelated' },
  }[type] || { bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: HelpCircle, label: type };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

interface ReviewStatusProps {
  status: ReviewStatus;
  className?: string;
}

export const ReviewStatusBadge: React.FC<ReviewStatusProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Human-reviewed
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 ${className}`}>
          <XCircle className="w-3 h-3 text-rose-400" />
          Rejected
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 ${className}`}>
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Proposed relation
        </span>
      );
  }
};
