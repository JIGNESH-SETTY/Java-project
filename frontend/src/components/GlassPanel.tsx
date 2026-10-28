import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`glass-panel p-6 ${hoverEffect ? 'hover:shadow-lg transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassPanelStrong: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`glass-panel-strong p-6 ${hoverEffect ? 'hover:shadow-lg transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
