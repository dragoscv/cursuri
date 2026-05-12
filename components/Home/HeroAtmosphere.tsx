'use client';

/**
 * HeroAtmosphere — Canvas 2D starfield + SVG glow orbs.
 *
 * SCENE BRIEF (same as before, executed in 2D):
 * - Background: drifting starfield with five-color palette
 * - Foreground: 3 SVG glow orbs at calibrated thirds
 *     Cool indigo  — upper-left third
 *     Warm amber   — lower-right third
 *     Violet depth — top-center (far away, small)
 */

import { Starfield2D, GlowOrb2D } from '@/components/three';

export default function HeroAtmosphere() {
  return (
    <>
      <Starfield2D count={220} speed={6} />
      {/* Indigo subject orb — upper-left third */}
      <GlowOrb2D className="left-[8%] top-[18%]" size={420} color="#818cf8" duration={5.4} />
      {/* Amber accent — lower-right third */}
      <GlowOrb2D
        className="right-[10%] bottom-[12%]"
        size={320}
        color="#fbbf24"
        duration={4.2}
        delay={-1.5}
      />
      {/* Violet depth — top-center */}
      <GlowOrb2D
        className="left-1/2 -translate-x-1/2 top-[6%]"
        size={200}
        color="#a78bfa"
        duration={6.4}
        delay={-0.8}
      />
    </>
  );
}
