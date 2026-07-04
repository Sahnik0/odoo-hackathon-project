import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-[14px] border border-ash bg-surface-raised px-3.5 text-[15px] text-off-black transition-colors',
        'placeholder:text-smoke hover:border-smoke/70',
        'focus-visible:border-lake-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lake-blue/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
