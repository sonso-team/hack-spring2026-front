import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import './FormButton.scss';

const buttonVariants = cva('ui-btn', {
    variants: {
        variant: {
            default:     'ui-btn--default',
            outline:     'ui-btn--outline',
            ghost:       'ui-btn--ghost',
            destructive: 'ui-btn--destructive',
        },
        size: {
            sm:      'ui-btn--sm',
            default: 'ui-btn--md',
            lg:      'ui-btn--lg',
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

interface FormButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    fullWidth?: boolean;
}

const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
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
FormButton.displayName = 'FormButton';

export { FormButton, buttonVariants };
export type { FormButtonProps };
