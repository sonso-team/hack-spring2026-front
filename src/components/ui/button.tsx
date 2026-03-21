import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import './button.scss';

const buttonVariants = cva('ui-btn', {
  variants: {
    variant: {
      default: 'ui-btn--default',
      outline: 'ui-btn--outline',
      ghost: 'ui-btn--ghost',
      destructive: 'ui-btn--destructive',
    },
    size: {
      sm: 'ui-btn--sm',
      default: 'ui-btn--md',
      lg: 'ui-btn--lg',
    },
    fullWidth: {
      true: 'ui-btn--full',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
