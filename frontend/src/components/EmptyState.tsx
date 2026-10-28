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
      className={`glass-panel p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};
