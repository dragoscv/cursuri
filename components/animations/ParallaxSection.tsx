'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
    children: React.ReactNode;
    className?: string;
    bgImage?: string;
    bgColor?: string;
    speed?: number;
    direction?: 'up' | 'down';
    overlay?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
}

export default function ParallaxSection({
    children,
    className = '',
    bgImage,
    bgColor = 'transparent',
    speed = 0.5,
    direction = 'up',
    overlay = false,
    overlayColor = '#000',
    overlayOpacity = 0.5,
}: ParallaxSectionProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    // Calculate transform based on direction and speed
    const yValue = direction === 'up' ? speed * 100 : -speed * 100;
    const y = useTransform(scrollYProgress, [0, 1], [0, yValue]);

    // Create styles
    const sectionStyle = {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: bgColor,
    } as React.CSSProperties;

    const backgroundStyle = {
        position: 'absolute',
        inset: '-20%',
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
    } as React.CSSProperties;

    const overlayStyle = overlay ? {
        position: 'absolute',
        inset: 0,
        backgroundColor: overlayColor,
        opacity: overlayOpacity,
        zIndex: 1,
    } as React.CSSProperties : {};

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
    } as React.CSSProperties;

    return (
        <section ref={ref} className={className} style={sectionStyle}>
            <motion.div style={{ ...backgroundStyle, y }} />
            {overlay && <div style={overlayStyle} />}
            <div style={contentStyle}>{children}</div>
        </section>
    );
}