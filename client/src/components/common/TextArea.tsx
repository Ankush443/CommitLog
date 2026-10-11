import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full min-w-0 px-3 py-2 border rounded-lg bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-[rgb(var(--bg-tertiary))] disabled:cursor-not-allowed resize-y
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

TextArea.displayName = 'TextArea';

export default TextArea;
