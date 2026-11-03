import React from 'react';
import { GlassButton } from './GlassButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};
