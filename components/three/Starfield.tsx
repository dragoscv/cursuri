'use client';

/**
 * Starfield2D — Canvas 2D drifting starfield.
 * Cinematic intent of R3F starfield, without the bundle/type cost.
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; z: number; r: number; color: string };

type Starfield2DProps = {
  count?: number;
  /** drift speed multiplier */
  speed?: number;
  className?: string;
};

export function Starfield2D({ count = 220, speed = 6, className = '' }: Starfield2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let raf = 0;
    let lastTime = performance.now();
    let stars: Star[] = [];
    let width = 0;
    let height = 0;

    const palette = ['#f8fafc', '#c7d2fe', '#fde68a', '#a78bfa', '#fbbf24'];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 0.7,
        r: 0.4 + Math.random() * 1.4,
        color: palette[Math.floor(Math.random() * palette.length)],
      }));
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        if (!prefersReduced) {
          s.x += speed * s.z * dt * 0.02;
          s.y -= speed * s.z * dt * 0.012;
          if (s.x > width + 2) s.x = -2;
          if (s.y < -2) s.y = height + 2;
        }
        ctx.globalAlpha = 0.45 + 0.5 * s.z;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (prefersReduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
