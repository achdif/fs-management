import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-[13px] font-medium text-subtle">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`h-14 w-full rounded-2xl border bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-placeholder focus:border-primary ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  );
});

export default Input;
