import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Pill buttons per DESIGN.md: 100px radius, uppercase mono, no heavy shadow.
// Primary (blue) reserved for the single main action per screen (DESIGN.md
// Don'ts) — most screens should reach for `default` (black) or `ghost`.
// Restyle: crisper hover/active motion, refined focus ring, subtle depth.
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[100px] font-medium uppercase tracking-tight',
    'text-[13px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] select-none',
    'outline-none focus-visible:ring-2 focus-visible:ring-lake-blue focus-visible:ring-offset-2 focus-visible:ring-offset-parchment',
    'disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-lake-blue text-white shadow-sm hover:bg-lake-blue-dark hover:shadow-md',
        default: 'bg-off-black text-white shadow-sm hover:bg-graphite hover:shadow-md',
        ghost: 'border border-ash bg-transparent text-off-black hover:border-off-black hover:bg-off-black/[0.04]',
        subtle: 'bg-off-black/[0.05] text-off-black hover:bg-off-black/[0.09]',
        destructive: 'bg-crimson text-white shadow-sm hover:brightness-95 hover:shadow-md',
        link: 'text-off-black underline-offset-4 hover:underline normal-case tracking-normal',
      },
      size: {
        default: 'h-11 px-6',
        lg: 'h-12 px-8 text-[14px]',
        sm: 'h-9 px-4 text-[12px]',
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
