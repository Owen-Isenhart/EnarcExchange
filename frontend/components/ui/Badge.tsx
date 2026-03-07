/**
 * Badge Component - Status indicator
 */

import React from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30',
      warning: 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30',
      error: 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30',
      info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      default: 'bg-white/10 text-white border border-white/20',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
