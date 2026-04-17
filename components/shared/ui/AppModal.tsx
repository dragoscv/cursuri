'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AppModalTone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const sizeWidth: Record<AppModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-6xl',
};

const toneRing: Record<AppModalTone, string> = {
  default:
    'from-[color:var(--ai-primary)]/20 via-[color:var(--ai-secondary)]/15 to-[color:var(--ai-accent)]/15',
  primary:
    'from-[color:var(--ai-primary)]/30 via-[color:var(--ai-secondary)]/20 to-[color:var(--ai-primary)]/10',
  success: 'from-emerald-500/25 via-emerald-400/15 to-teal-500/10',
  warning: 'from-amber-500/25 via-orange-400/15 to-amber-500/10',
  danger: 'from-rose-500/25 via-pink-500/15 to-rose-500/10',
};

const toneIconBg: Record<AppModalTone, string> = {
  default: 'bg-[color:var(--ai-primary)]/12 text-[color:var(--ai-primary)]',
  primary: 'bg-[color:var(--ai-primary)]/15 text-[color:var(--ai-primary)]',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  danger: 'bg-rose-500/15 text-rose-500',
};

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: AppModalTone;
  size?: AppModalSize;
  /** Fixed footer content (right-aligned actions). */
  footer?: React.ReactNode;
  /** Hide the default close (X) button in the header. */
  hideCloseButton?: boolean;
  /** Click backdrop to close (default true). */
  isDismissable?: boolean;
  /** Make body scroll instead of whole modal. */
  scrollBehavior?: 'inside' | 'outside';
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  tone = 'default',
  size = 'lg',
  footer,
  hideCloseButton = false,
  isDismissable = true,
  scrollBehavior = 'inside',
  className = '',
  bodyClassName = '',
  children,
}) => {
  // Lock scroll + escape to close
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => isDismissable && onClose()}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={[
              'relative w-full',
              sizeWidth[size],
              scrollBehavior === 'inside' ? 'max-h-[88vh] flex flex-col' : '',
              'rounded-2xl border border-[color:var(--ai-card-border)]',
              'bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)]',
              'shadow-2xl shadow-black/40 overflow-hidden',
              className,
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient ring */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${toneRing[tone]} opacity-80`}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />

            {/* Header */}
            {(title || subtitle || icon || !hideCloseButton) && (
              <div className="relative px-6 pt-5 pb-4 flex items-start gap-4 border-b border-[color:var(--ai-card-border)]/60">
                {icon && (
                  <div
                    className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl ring-1 ring-inset ring-white/5 backdrop-blur-sm ${toneIconBg[tone]}`}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold leading-tight text-[color:var(--ai-foreground)]">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <div className="mt-1 text-xs text-[color:var(--ai-muted)] truncate">
                      {subtitle}
                    </div>
                  )}
                </div>
                {!hideCloseButton && (
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/60 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              className={[
                'relative px-6 py-5',
                scrollBehavior === 'inside' ? 'overflow-y-auto flex-1' : '',
                bodyClassName,
              ].join(' ')}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="relative px-6 py-4 border-t border-[color:var(--ai-card-border)]/60 bg-[color:var(--ai-background)]/40 flex flex-wrap items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default AppModal;
