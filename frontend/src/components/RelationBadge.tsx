import React from 'react';
import { RelationType, ReviewStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRightCircle, MessageSquare, Copy, HelpCircle, ShieldCheck } from 'lucide-react';

interface RelationProps {
  type: RelationType;
  className?: string;
}

export const RelationBadge: React.FC<RelationProps> = ({ type, className = '' }) => {
  const config = {
    SUPPORTS: { cls: 'b-rep', icon: CheckCircle2, label: 'Supports' },
    CONTRADICTS: { cls: 'b-err', icon: XCircle, label: 'Contradicts' },
    QUALIFIES: { cls: 'b-warn', icon: AlertTriangle, label: 'Qualifies' },
    EXTENDS: { cls: 'b-ai', icon: ArrowRightCircle, label: 'Extends' },
    DISCUSSES: { cls: 'b-cit', icon: MessageSquare, label: 'Discusses' },
    DUPLICATES: { cls: 'b-neu', icon: Copy, label: 'Duplicates' },
    UNRELATED: { cls: 'b-neu', icon: HelpCircle, label: 'Unrelated' },
  }[type] || { cls: 'b-neu', icon: HelpCircle, label: type };

  const Icon = config.icon;

  return (
    <span className={`${config.cls} ${className}`}>
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
        <span className={`b-rep ${className}`} title="Reviewed and verified by researcher">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Human reviewed</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`b-err ${className}`} title="Disputed or rejected">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className={`b-unv ${className}`} title="AI-proposed relation pending human review">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Proposed relation</span>
        </span>
      );
  }
};
