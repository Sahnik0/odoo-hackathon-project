import * as React from 'react';
import { cn } from '@/lib/utils';

// Native <select> — platform date/select controls cover this without pulling
// in Radix Select's extra complexity for a plain filter dropdown.
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-12 rounded-2xl border border-ash bg-parchment px-4 text-[14px] text-off-black',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lake-blue',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export { Select };
