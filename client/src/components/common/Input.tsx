import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full min-w-0 px-3 py-2 border rounded-lg bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-[rgb(var(--bg-tertiary))] disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-[rgb(var(--border-color))]'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-[rgb(var(--text-tertiary))]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
