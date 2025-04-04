'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'framer-motion';

interface ScrollAnimationWrapperProps {
    children: React.ReactNode;
    variants?: Variants;
    className?: string;
    delay?: number;
    duration?: number;
    once?: boolean;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    viewport?: { once?: boolean; margin?: string; amount?: 'some' | 'all' | number };
}

export default function ScrollAnimationWrapper({
    children,
    className = '',
    delay = 0,
    duration = 0.5,
    once = true,
    direction = 'up',
    viewport = { once: true, margin: '-100px' },
    variants,
}: ScrollAnimationWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, viewport);

    // Default animation variants based on direction
    const defaultVariants: Variants = {
        hidden: {
            y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
            x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
            opacity: 0
        },
        visible: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const animationVariants = variants || defaultVariants;

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={animationVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
}