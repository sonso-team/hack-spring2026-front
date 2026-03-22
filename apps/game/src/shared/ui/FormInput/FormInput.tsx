import { forwardRef, type ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import './FormInput.scss';

const FormInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => (
        <input type={type} className={cn('ui-input', className)} ref={ref} {...props} />
    ),
);
FormInput.displayName = 'FormInput';

export { FormInput };
