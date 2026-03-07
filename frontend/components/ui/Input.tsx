/**
 * Input Component - Text input field
 */

'use client';

import React, { useId } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10',
            'text-white placeholder-white/40 transition-all duration-200',
            'focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#FF8C00] focus:border-[#FF8C00] focus:ring-[#FF8C00]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#FF8C00]">{error}</p>}
        {helpText && !error && <p className="text-sm text-white/40">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10',
            'text-white placeholder-white/40 transition-all duration-200',
            'focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical min-h-32',
            error && 'border-[#FF8C00] focus:border-[#FF8C00] focus:ring-[#FF8C00]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#FF8C00]">{error}</p>}
        {helpText && !error && <p className="text-sm text-white/40">{helpText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
