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
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 inset-y-0 text-[#5B6B7D] dark:text-[#8EB3C2] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`glass-input w-full ${icon ? '!pl-9.5 pr-3.5' : 'px-3.5'} py-2 text-xs sm:text-[13px] font-medium ${
              error ? '!border-[#B3261E] focus:!ring-[#B3261E]/20' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-[#B3261E] font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#5B6B7D] dark:text-[#8EB3C2]">{helperText}</span>}
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
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={selectId} className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`glass-select w-full px-3.5 py-2 text-xs sm:text-[13px] font-medium cursor-pointer ${
            error ? '!border-[#B3261E]' : ''
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-[#122B36] text-[#0B2A33] dark:text-[#E0F2F6]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-[#B3261E] font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#5B6B7D] dark:text-[#8EB3C2]">{helperText}</span>}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
