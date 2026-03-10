/**
 * Modal Component - Dialog overlay
 */

import React from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      className,
      closeButton = true,
    },
    ref
  ) => {
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }

      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto',
            'rounded-lg border border-primary/20 bg-surface p-6 shadow-2xl',
            className
          )}
        >
          {/* Header */}
          {(title || closeButton) && (
            <div className="mb-4 flex items-center justify-between">
              {title && <h2 className="text-xl font-semibold text-primary">{title}</h2>}
              {closeButton && (
                <button
                  onClick={onClose}
                  className="ml-auto inline-flex items-center justify-center p-1 rounded-lg hover:bg-primary/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-primary" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  children: React.ReactNode;
}

export const ModalTrigger = React.forwardRef<
  HTMLButtonElement,
  ModalTriggerProps
>(({ children, ...props }, ref) => {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

ModalTrigger.displayName = 'ModalTrigger';
