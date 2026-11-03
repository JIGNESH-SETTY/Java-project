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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        Completed
      </span>
    );
  }

  if (norm === 'INGESTING' || norm === 'PARSING' || norm === 'CHUNKING' || norm === 'EMBEDDING' || norm === 'PENDING') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
        {norm === 'INGESTING' ? 'Ingesting' : norm}
      </span>
    );
  }

  if (norm === 'METADATA_ONLY') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}>
        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        Metadata Only
      </span>
    );
  }

  if (norm === 'OPEN_ACCESS') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 ${className}`}>
        <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        Open Access
      </span>
    );
  }

  if (norm === 'RESTRICTED' || norm === 'PAYWALLED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 ${className}`}>
        <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        Restricted Access
      </span>
    );
  }

  if (norm === 'FAILED' || norm === 'ERROR') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        Failed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}>
      {status}
    </span>
  );
};
