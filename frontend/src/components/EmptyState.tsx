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
      className={`glass-panel p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 rounded-[28px] border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-white border border-white/95 flex items-center justify-center text-[#FF6F61] mb-4 shadow-[0_4px_16px_rgba(41,40,43,0.04)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-[#29282B] tracking-tight">{title}</h3>
      <p className="text-xs text-[#77747A] mt-1.5 mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};
