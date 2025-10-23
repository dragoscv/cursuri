'use client';

import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  /**
   * The content to display in the tooltip
   */
  content: ReactNode;

  /**
   * The element that triggers the tooltip
   */
  children: ReactNode;

  /**
   * The position of the tooltip relative to the trigger
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * The delay before showing the tooltip (in ms)
   */
  delay?: number;

  /**
   * Custom classes to apply to the tooltip
   */
  className?: string;
}

export default function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport bounds
    if (left < scrollX + 10) left = scrollX + 10;
    if (left + tooltipRect.width > window.innerWidth + scrollX - 10) {
      left = window.innerWidth + scrollX - tooltipRect.width - 10;
    }

    if (top < scrollY + 10) top = scrollY + 10;
    if (top + tooltipRect.height > window.innerHeight + scrollY - 10) {
      top = window.innerHeight + scrollY - tooltipRect.height - 10;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }

    return undefined; // Return empty cleanup function when tooltip is not visible
  }, [isVisible]);

  // Calculate arrow position and styling based on placement
  const getArrowStyles = () => {
    switch (placement) {
      case 'top':
        return 'bottom-[-5px] left-1/2 transform -translate-x-1/2 rotate-45';
      case 'bottom':
        return 'top-[-5px] left-1/2 transform -translate-x-1/2 rotate-45';
      case 'left':
        return 'right-[-5px] top-1/2 transform -translate-y-1/2 rotate-45';
      case 'right':
        return 'left-[-5px] top-1/2 transform -translate-y-1/2 rotate-45';
      default:
        return '';
    }
  };
  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 rounded-lg text-sm font-medium max-w-xs ${className}`}
            style={{
              top:
                position.top -
                (triggerRef.current?.getBoundingClientRect().top || 0) -
                (window.scrollY || document.documentElement.scrollTop),
              left:
                position.left -
                (triggerRef.current?.getBoundingClientRect().left || 0) -
                (window.scrollX || document.documentElement.scrollLeft),
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
              pointerEvents: 'none',
            }}
          >
            <div className="relative z-10 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent backdrop-blur-lg rounded-lg px-3 py-2 text-[color:var(--ai-foreground)] border border-[color:var(--ai-card-border)]/50">
              {content}
              <div
                className={`absolute w-2.5 h-2.5 bg-inherit border-inherit ${getArrowStyles()}`}
                style={{
                  background: 'inherit',
                  borderStyle: 'solid',
                  borderWidth:
                    placement === 'top' || placement === 'bottom' ? '0 1px 1px 0' : '1px 0 0 1px',
                  borderColor: 'rgba(var(--ai-card-border-rgb, 255, 255, 255), 0.5)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
