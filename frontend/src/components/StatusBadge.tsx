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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Completed
      </span>
    );
  }

  if (norm === 'INGESTING' || norm === 'PARSING' || norm === 'CHUNKING' || norm === 'EMBEDDING' || norm === 'PENDING') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        {norm === 'INGESTING' ? 'Ingesting' : norm}
      </span>
    );
  }

  if (norm === 'METADATA_ONLY') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        <FileText className="w-3.5 h-3.5 text-blue-600" />
        Metadata Only
      </span>
    );
  }

  if (norm === 'OPEN_ACCESS') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${className}`}>
        <Globe className="w-3.5 h-3.5 text-teal-600" />
        Open Access
      </span>
    );
  }

  if (norm === 'RESTRICTED' || norm === 'PAYWALLED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
        <Lock className="w-3.5 h-3.5 text-slate-500" />
        Restricted Access
      </span>
    );
  }

  if (norm === 'FAILED' || norm === 'ERROR') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        Failed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      {status}
    </span>
  );
};
