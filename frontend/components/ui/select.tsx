import * as React from 'react';
import { cn } from '@/lib/utils';

// Native <select> — platform date/select controls cover this without pulling
// in Radix Select's extra complexity for a plain filter dropdown. A custom
// chevron replaces the OS arrow for a consistent look across platforms.
// `className` sizes the wrapper (call sites pass w-fit / max-w-xs etc.); the
// inner control always fills it.
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn('relative inline-flex w-full', className)}>
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-[14px] border border-ash bg-surface-raised pl-3.5 pr-10 text-[14px] text-off-black transition-colors',
          'hover:border-smoke/70 focus-visible:border-lake-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lake-blue/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ),
);
Select.displayName = 'Select';

export { Select };
