import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full min-w-0 px-3 py-2 border rounded-lg bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-[rgb(var(--bg-tertiary))] disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-[rgb(var(--border-color))]'}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-[rgb(var(--text-tertiary))]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
