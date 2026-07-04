'use client';

import React from 'react';

/**
 * A statement organic element — a single large 18th-century copperplate engraving
 * of a butterfly (Papilio machaon style).
 * 
 * Styled with fine stippling, detailed wing venation, and cross-hatching to match 
 * the archival print aesthetic from the user's reference.
 * 
 * Placed once, overlapping the hero's right edge. Slow float animation, low opacity.
 */
interface EditorialOrganicElementProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function EditorialOrganicElement({ className = "", style = {} }: EditorialOrganicElementProps) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        right: '-80px',
        top: '-40px',
        width: '520px',
        height: '520px',
        opacity: 0.11,
        animation: 'botanicalFloat 24s ease-in-out infinite',
        zIndex: 1,
        ...style
      }}
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-[#2D3A1F]"
        aria-hidden="true"
      >
        {/* ================================================
            BUTTERFLY BODY (Center)
            ================================================ */}
        {/* Antennae */}
        <path d="M 250 170 C 235 120, 205 90, 175 80" strokeWidth="0.8" />
        <path d="M 250 170 C 265 120, 295 90, 325 80" strokeWidth="0.8" />
        {/* Antenna tips (clubbed ends) */}
        <circle cx="174" cy="80" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="326" cy="80" r="1.5" fill="currentColor" stroke="none" />

        {/* Head */}
        <circle cx="250" cy="176" r="4.5" strokeWidth="1.2" />
        <circle cx="248" cy="175" r="1" fill="currentColor" stroke="none" />
        <circle cx="252" cy="175" r="1" fill="currentColor" stroke="none" />

        {/* Thorax (Fuzzy/hatched body segment) */}
        <path d="M 250 180 C 243 180, 240 195, 242 210 C 244 220, 247 225, 250 225 C 253 225, 256 220, 258 210 C 260 195, 257 180, 250 180 Z" strokeWidth="1.5" />
        {/* Thorax hatching */}
        {[-3, -1, 1, 3].map((offset) => (
          <path key={`th-${offset}`} d={`M ${250 + offset} 185 C ${250 + offset * 1.5} 195, ${250 + offset * 1.5} 210, ${250 + offset} 220`} strokeWidth="0.4" />
        ))}

        {/* Abdomen (Segmented tail) */}
        <path d="M 250 225 C 246 225, 245 240, 246 260 C 247 280, 248 300, 250 315 C 252 300, 253 280, 254 260 C 255 240, 254 225, 250 225 Z" strokeWidth="1.5" />
        {/* Abdomen segments */}
        {[235, 245, 255, 265, 275, 285, 295, 305].map((y) => (
          <line key={y} x1="247" y1={y} x2="253" y2={y} strokeWidth="0.8" />
        ))}

        {/* ================================================
            FOREWINGS (Top wings)
            ================================================ */}
        {/* LEFT FOREWING */}
        {/* Outer Contour */}
        <path d="M 246 195 C 190 190, 110 160, 60 110 C 45 95, 35 110, 45 135 C 60 170, 95 240, 135 270 C 170 295, 210 290, 240 225" strokeWidth="1.8" />
        
        {/* Primary Venation (Engraved structural ribs) */}
        <path d="M 242 198 C 190 195, 120 170, 65 115" strokeWidth="1.0" />
        <path d="M 242 198 C 170 205, 110 200, 52 140" strokeWidth="0.8" />
        <path d="M 242 198 C 180 220, 130 225, 58 175" strokeWidth="0.8" />
        <path d="M 242 198 C 190 235, 150 250, 72 210" strokeWidth="0.8" />
        <path d="M 242 198 C 200 245, 170 268, 95 240" strokeWidth="0.8" />
        <path d="M 242 198 C 215 248, 190 272, 130 265" strokeWidth="0.8" />

        {/* Intricate Secondary Venation (fine lines) */}
        <path d="M 120 170 C 95 150, 75 135, 60 125" strokeWidth="0.4" />
        <path d="M 140 188 C 115 170, 90 155, 70 145" strokeWidth="0.4" />
        <path d="M 160 205 C 130 185, 105 170, 85 160" strokeWidth="0.4" />
        <path d="M 175 220 C 145 205, 120 190, 100 180" strokeWidth="0.4" />

        {/* RIGHT FOREWING */}
        {/* Outer Contour */}
        <path d="M 254 195 C 310 190, 390 160, 440 110 C 455 95, 465 110, 455 135 C 440 170, 405 240, 365 270 C 330 295, 290 290, 260 225" strokeWidth="1.8" />
        
        {/* Primary Venation */}
        <path d="M 258 198 C 310 195, 380 170, 435 115" strokeWidth="1.0" />
        <path d="M 258 198 C 330 205, 390 200, 448 140" strokeWidth="0.8" />
        <path d="M 258 198 C 320 220, 370 225, 442 175" strokeWidth="0.8" />
        <path d="M 258 198 C 310 235, 350 250, 428 210" strokeWidth="0.8" />
        <path d="M 258 198 C 300 245, 330 268, 365 240" strokeWidth="0.8" />
        <path d="M 258 198 C 285 248, 310 272, 370 265" strokeWidth="0.8" />

        {/* Intricate Secondary Venation */}
        <path d="M 380 170 C 405 150, 425 135, 440 125" strokeWidth="0.4" />
        <path d="M 360 188 C 385 170, 410 155, 430 145" strokeWidth="0.4" />
        <path d="M 340 205 C 370 185, 395 170, 415 160" strokeWidth="0.4" />
        <path d="M 325 220 C 355 205, 380 190, 400 180" strokeWidth="0.4" />


        {/* ================================================
            HINDWINGS (Bottom wings)
            ================================================ */}
        {/* LEFT HINDWING (with swallowtail extension) */}
        {/* Outer Contour */}
        <path d="M 242 228 C 215 285, 175 305, 140 310 C 110 315, 95 340, 105 375 C 115 410, 142 435, 155 450 C 160 455, 162 475, 152 490 C 148 495, 155 498, 162 490 C 178 470, 195 440, 218 435 C 240 430, 245 370, 248 320" strokeWidth="1.8" />
        
        {/* Venation */}
        <path d="M 245 235 C 200 290, 155 330, 115 378" strokeWidth="0.9" />
        <path d="M 245 235 C 210 320, 175 385, 145 445" strokeWidth="0.8" />
        <path d="M 245 235 C 230 330, 210 395, 185 465" strokeWidth="0.8" />
        <path d="M 245 235 C 240 330, 235 390, 222 432" strokeWidth="0.8" />

        {/* RIGHT HINDWING (with swallowtail extension) */}
        {/* Outer Contour */}
        <path d="M 258 228 C 285 285, 325 305, 360 310 C 390 315, 405 340, 395 375 C 385 410, 358 435, 345 450 C 340 455, 338 475, 348 490 C 352 495, 345 498, 338 490 C 322 470, 305 440, 282 435 C 260 430, 255 370, 252 320" strokeWidth="1.8" />
        
        {/* Venation */}
        <path d="M 255 235 C 300 290, 345 330, 385 378" strokeWidth="0.9" />
        <path d="M 255 235 C 290 320, 325 385, 355 445" strokeWidth="0.8" />
        <path d="M 255 235 C 270 330, 290 395, 315 465" strokeWidth="0.8" />
        <path d="M 255 235 C 260 330, 265 390, 278 432" strokeWidth="0.8" />


        {/* ================================================
            INTENSE COPPERPLATE HATCHING & PATTERNS
            ================================================ */}
        {/* Shading/hatching along the margins of left forewing */}
        {[[55,120],[68,140],[85,160],[102,180],[120,200],[135,215]].map(([x,y], i) => (
          <line key={`lh-f-${i}`} x1={x} y1={y} x2={x+6} y2={y-6} strokeWidth="0.35" />
        ))}
        {/* Shading/hatching along the margins of right forewing */}
        {[[445,120],[432,140],[415,160],[398,180],[380,200],[365,215]].map(([x,y], i) => (
          <line key={`rh-f-${i}`} x1={x} y1={y} x2={x-6} y2={y-6} strokeWidth="0.35" />
        ))}

        {/* Intricate concentric stippling & pattern shading (Left Forewing cells) */}
        <circle cx="160" cy="180" r="8" strokeWidth="0.5" strokeDasharray="2,3" />
        <circle cx="160" cy="180" r="4" strokeWidth="0.4" />
        <circle cx="110" cy="210" r="6" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Intricate concentric stippling & pattern shading (Right Forewing cells) */}
        <circle cx="340" cy="180" r="8" strokeWidth="0.5" strokeDasharray="2,3" />
        <circle cx="340" cy="180" r="4" strokeWidth="0.4" />
        <circle cx="390" cy="210" r="6" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Engraving stippling (dots) for realistic texture */}
        {[[120,130],[130,125],[115,145],[150,150],[135,165],[180,185],[190,175],[210,195],[195,215]].map(([cx,cy], i) => (
          <circle key={`std-l-${i}`} cx={cx} cy={cy} r="0.6" fill="currentColor" stroke="none" />
        ))}
        {[[380,130],[370,125],[385,145],[350,150],[365,165],[320,185],[310,175],[290,195],[305,215]].map(([cx,cy], i) => (
          <circle key={`std-r-${i}`} cx={cx} cy={cy} r="0.6" fill="currentColor" stroke="none" />
        ))}

        {/* Hindwing marginal markings (scalloped border patterns) */}
        <path d="M 105 375 Q 115 390 120 405 Q 130 420 140 435" strokeWidth="0.6" strokeDasharray="1,2" />
        <path d="M 395 375 Q 385 390 380 405 Q 370 420 360 435" strokeWidth="0.6" strokeDasharray="1,2" />

        {/* Bottom Hindwing Stippling */}
        {[[140,360],[155,350],[130,380],[150,395],[170,410],[180,380]].map(([cx,cy], i) => (
          <circle key={`std-lh-${i}`} cx={cx} cy={cy} r="0.5" fill="currentColor" stroke="none" />
        ))}
        {[[360,360],[345,350],[370,380],[350,395],[330,410],[320,380]].map(([cx,cy], i) => (
          <circle key={`std-rh-${i}`} cx={cx} cy={cy} r="0.5" fill="currentColor" stroke="none" />
        ))}

        {/* Plate text/label at the bottom */}
        <text
          x="250"
          y="485"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontStyle="italic"
          fontSize="14"
          fill="currentColor"
          stroke="none"
          letterSpacing="0.75"
        >
          Papilio machaon
        </text>
      </svg>
    </div>
  );
}
