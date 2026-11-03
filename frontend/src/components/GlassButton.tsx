import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-full gap-1.5',
    md: 'px-5 py-2 text-xs rounded-full gap-2',
    lg: 'px-6 py-2.5 text-sm rounded-full gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full shadow-2xs transition-all',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all rounded-full border border-transparent hover:border-slate-200',
  }[variant];

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return <span className="shrink-0">{Icon}</span>;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && 'render' in (Icon as any))) {
      const Component = Icon as React.ComponentType<{ className?: string }>;
      const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
      return <Component className={`${iconSizeClass} shrink-0`} />;
    }
    return <span className="shrink-0">{Icon as React.ReactNode}</span>;
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all ${sizeStyles} ${variantStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : 'cursor-pointer active:scale-[0.98]'
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
};
