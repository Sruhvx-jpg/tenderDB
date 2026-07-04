'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Provides three subtle motion layers for the hero section:
 * 1. Gentle parallax (scroll-driven translateY, capped at 40px)
 * 2. Slow ambient light (radial gradient drift, ~15s cycle)
 * 3. Soft grain overlay that barely shifts
 *
 * Wraps children and applies parallax to the outer container.
 */
export default function EditorialHeroMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Gentle parallax — content moves up slower than scroll
        const offset = Math.min(scrollY * 0.12, 40);
        el.style.transform = `translateY(${offset}px)`;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Ambient light — slow drifting warm radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 30%, rgba(196, 173, 106, 0.08) 0%, transparent 70%)',
          animation: 'ambientLight 18s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      />

      {/* Grain overlay — barely visible shifting noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'grainShift 4s steps(4) infinite',
        }}
        aria-hidden="true"
      />

      {/* Parallax container */}
      <div ref={containerRef} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}
