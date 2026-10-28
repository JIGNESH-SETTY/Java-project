import React from 'react';
import { RelationType, ReviewStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRightCircle, MessageSquare, Copy, HelpCircle, ShieldCheck } from 'lucide-react';

interface RelationProps {
  type: RelationType;
  className?: string;
}

export const RelationBadge: React.FC<RelationProps> = ({ type, className = '' }) => {
  const config = {
    SUPPORTS: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2, label: 'Supports' },
    CONTRADICTS: { bg: 'bg-red-50 text-red-800 border-red-200', icon: XCircle, label: 'Contradicts' },
    QUALIFIES: { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle, label: 'Qualifies' },
    EXTENDS: { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: ArrowRightCircle, label: 'Extends' },
    DISCUSSES: { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: MessageSquare, label: 'Discusses' },
    DUPLICATES: { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Copy, label: 'Duplicates' },
    UNRELATED: { bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: HelpCircle, label: 'Unrelated' },
  }[type] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle, label: type };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
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
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Human reviewed</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Proposed relation</span>
        </span>
      );
  }
};
