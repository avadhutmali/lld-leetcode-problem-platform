import * as React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'easy' | 'medium' | 'hard' | 'neutral';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'easy' && 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60',
        variant === 'medium' && 'bg-amber-950/40 text-amber-300 border border-amber-800/60',
        variant === 'hard' && 'bg-rose-950/40 text-rose-300 border border-rose-800/60',
        variant === 'neutral' && 'bg-[#161b22] text-[#8b949e] border border-[#30363d]',
        className
      )}
      {...props}
    />
  );
}

