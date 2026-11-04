import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileText, Globe, Lock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toUpperCase();

  if (norm === 'COMPLETED' || norm === 'RESOLVED') {
    return (
      <span className={`b-rep ${className}`} title="Fully parsed and vectorized">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Completed</span>
      </span>
    );
  }

  if (norm === 'INGESTING' || norm === 'PARSING' || norm === 'CHUNKING' || norm === 'EMBEDDING' || norm === 'PENDING') {
    return (
      <span className={`b-warn ${className}`} title="Processing pipeline in progress">
        <Clock className="w-3.5 h-3.5 animate-spin" />
        <span>{norm === 'INGESTING' ? 'Ingesting' : norm}</span>
      </span>
    );
  }

  if (norm === 'METADATA_ONLY') {
    return (
      <span className={`b-cit ${className}`} title="Scholarly metadata only (PDF text pending)">
        <FileText className="w-3.5 h-3.5" />
        <span>Metadata Only</span>
      </span>
    );
  }

  if (norm === 'OPEN_ACCESS') {
    return (
      <span className={`b-cit ${className}`} title="Open Access publication">
        <Globe className="w-3.5 h-3.5" />
        <span>Open Access</span>
      </span>
    );
  }

  if (norm === 'RESTRICTED' || norm === 'PAYWALLED') {
    return (
      <span className={`b-neu ${className}`} title="Paywalled or restricted access publication">
        <Lock className="w-3.5 h-3.5" />
        <span>Restricted Access</span>
      </span>
    );
  }

  if (norm === 'FAILED' || norm === 'ERROR') {
    return (
      <span className={`b-err ${className}`} title="Document parsing or extraction failed">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Failed</span>
      </span>
    );
  }

  return (
    <span className={`b-neu ${className}`}>
      {status}
    </span>
  );
};
