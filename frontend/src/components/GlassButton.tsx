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
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-sm transition-all',
    ghost: 'bg-transparent hover:bg-white/50 text-slate-700 transition-all border border-transparent hover:border-slate-200',
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
