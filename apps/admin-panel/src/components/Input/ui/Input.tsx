import { forwardRef, type ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

import './Input.scss';

const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn('ui-input', className)} ref={ref} {...props} />
  ),
);
Input.displayName = 'Input';

export { Input };
