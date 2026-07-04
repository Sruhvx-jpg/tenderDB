'use client';

import React, { useMemo } from 'react';

// Seedable LCG random number generator to ensure identical server-side and client-side rendering
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function PaperTexture() {
  const fibers = useMemo(() => {
    const list = [];
    const cellSize = 180; // size of grid cells in pixels
    const cellsX = 22;   // covers up to ~4000px width
    const cellsY = 16;   // covers up to ~2900px height
    
    for (let cx = 0; cx < cellsX; cx++) {
      for (let cy = 0; cy < cellsY; cy++) {
        const cellSeed = cx * 1000 + cy + 42; // stable offset seed
        const rand = createRandom(cellSeed);
        
        // Generate 1 to 3 organic fibers per cell
        const numFibers = Math.floor(rand() * 3) + 1;
        for (let i = 0; i < numFibers; i++) {
          const startX = cx * cellSize + rand() * cellSize;
          const startY = cy * cellSize + rand() * cellSize;
          
          const length = 15 + rand() * 40;
          const angle = rand() * Math.PI * 2;
          const curve = (rand() - 0.5) * 12; // curve height
          
          const endX = startX + Math.cos(angle) * length;
          const endY = startY + Math.sin(angle) * length;
          
          // Control point for curved path
          const midX = (startX + endX) / 2 + Math.cos(angle + Math.PI / 2) * curve;
          const midY = (startY + endY) / 2 + Math.sin(angle + Math.PI / 2) * curve;
          
          const type = rand();
          let strokeColor = "#2D3A1F"; // Primary color fiber
          let opacity = 0.006 + rand() * 0.012; // Even fainter (0.6% - 1.8%)
          
          if (type > 0.75) {
            strokeColor = "#FFFFFF"; // Bleached organic fiber
            opacity = 0.03 + rand() * 0.04;
          } else if (type > 0.5) {
            strokeColor = "#C4AD6A"; // Accent/ochre fiber
            opacity = 0.008 + rand() * 0.012;
          }
          
          list.push({
            d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`,
            stroke: strokeColor,
            opacity: opacity.toFixed(3),
            strokeWidth: (0.3 + rand() * 0.6).toFixed(2),
          });
        }
      }
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 -z-50 w-full h-full pointer-events-none select-none overflow-hidden bg-[#FAF8F2]">
      {/* 1. Base Paper Texture Layer with SVG Filter */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="cotton-rag-filter" x="0%" y="0%" width="100%" height="100%">
            {/* Pulp Layer: Large centimeter-scale cloudy noise */}
            <feTurbulence type="fractalNoise" baseFrequency="0.001" numOctaves="4" result="cloudy" />
            
            {/* Soft cream color matrix mapping with subtle color variations */}
            <feColorMatrix type="matrix" values="
              0.03  0.00  0.00  0.00  0.95
              0.00  0.02  0.00  0.00  0.94
              0.00  0.00  0.01  0.00  0.90
              0.00  0.00  0.00  1.00  0.00
            " in="cloudy" result="pulpColor" />

            {/* Cotton Texture Layer: Medium-scale surface roughness */}
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" result="grain" />
            
            {/* Soft lighting on the texture to catch light */}
            <feDiffuseLighting in="grain" lightingColor="#FAF8F2" surfaceScale="1.2" result="pulpLight">
              <feDistantLight azimuth="45" elevation="65" />
            </feDiffuseLighting>
            
            {/* Blend the large color shifts and texture lighting together */}
            <feBlend mode="multiply" in="pulpColor" in2="pulpLight" result="basePaper" />
            
            {/* Displacement: Slightly deform the paper to create soft wrinkles and waviness */}
            <feDisplacementMap in="basePaper" in2="cloudy" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        {/* Render base textured paper */}
        <rect width="100%" height="100%" filter="url(#cotton-rag-filter)" />
        
        {/* 2. Embedded Organic Fibers Layer */}
        <g strokeLinecap="round" fill="none">
          {fibers.map((f, idx) => (
            <path
              key={idx}
              d={f.d}
              stroke={f.stroke}
              strokeWidth={f.strokeWidth}
              strokeOpacity={f.opacity}
            />
          ))}
        </g>
      </svg>
      
      {/* 3. Ambient Soft Edge Darkening Overlay (Vignette) */}
      <div 
        className="absolute inset-0 w-full h-full mix-blend-multiply opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0) 60%, rgba(45,58,31,0.2) 100%)'
        }}
      />
    </div>
  );
}
