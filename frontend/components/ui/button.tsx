import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Pill buttons per DESIGN.md: 100px radius, uppercase mono 14px, no shadow.
// Primary (blue) reserved for the single main action per screen (DESIGN.md
// Don'ts) — most screens should reach for `default` (black) or `ghost`.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[100px] text-[14px] uppercase tracking-tight font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-lake-blue text-white hover:opacity-90',
        default: 'bg-off-black text-white hover:opacity-90',
        ghost: 'border border-off-black bg-transparent text-off-black hover:bg-off-black/5',
        destructive: 'bg-crimson text-white hover:opacity-90',
        link: 'text-off-black underline-offset-4 hover:underline normal-case tracking-normal',
      },
      size: {
        default: 'h-12 px-8 py-4',
        sm: 'h-9 px-5 text-[12px]',
        icon: 'h-10 w-10 rounded-full p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
