import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 inset-y-0 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`glass-input w-full ${icon ? '!pl-11 pr-4' : 'px-4'} py-2.5 text-xs sm:text-sm font-medium ${
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, error, helperText, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`glass-select w-full px-4 py-2.5 text-xs sm:text-sm font-medium cursor-pointer ${
            error ? 'border-red-400 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
