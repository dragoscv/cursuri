'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AppLoaderProps {
  onLoadingComplete?: () => void;
}

export default function AppLoader({ onLoadingComplete }: AppLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; yTarget: number; duration: number }>
  >([]);

  useEffect(() => {
    // Generate particles on client side only to avoid hydration mismatch
    setIsMounted(true);
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      yTarget: Math.random() * window.innerHeight,
      duration: Math.random() * 3 + 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 800); // Wait for fade-out animation
          return 100;
        }
        // Fast initial progress, then slow down
        const increment = prev < 60 ? 15 : prev < 90 ? 8 : 3;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {isMounted &&
              particles.map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                  initial={{
                    x: particle.x,
                    y: particle.y,
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, particle.yTarget],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo/Brand animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              {/* Rotating gradient ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 -m-4"
              >
                <div
                  className="w-32 h-32 rounded-full border-4 border-transparent bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] bg-clip-padding"
                  style={{
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />
              </motion.div>

              {/* Pulsing center */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center shadow-2xl"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Loading Your Experience</h2>

              {/* Progress bar */}
              <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"
                />
              </div>

              {/* Progress percentage */}
              <motion.p
                key={progress}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-medium text-gray-400"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                />
              ))}
            </div>
          </div>

          {/* Bottom gradient glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-[color:var(--ai-primary)] to-transparent opacity-20 blur-3xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
