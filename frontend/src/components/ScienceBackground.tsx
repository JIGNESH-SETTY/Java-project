import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ScienceBackground — Full-viewport SVG science illustration pattern.
 * Used exclusively on authentication pages (Login, Register).
 *
 * Dark theme:  #181C22 base, icons drawn in #393D46 (subtle gray outlines)
 * Light theme: #FAF7F2 base, icons drawn in #C8BEAF (warm muted outlines)
 *
 * Icons: DNA helix, atoms, flasks, molecules, equations, bar charts,
 *        light bulbs, hexagons, plus/minus signs, dashed curves.
 */
export const ScienceBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colors that switch with the theme
  const bgColor = isDark ? '#181C22' : '#FAF7F2';
  const iconColor = isDark ? '#393D46' : '#C8BEAF';
  const iconColorFaint = isDark ? '#2A323D' : '#DDD5C8';

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', background: bgColor }}
      >
        <defs>
          {/* Subtle radial glow at center for depth */}
          <radialGradient id="sciGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={isDark ? '#212832' : '#F5F0E8'} stopOpacity="0.6" />
            <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base fill + subtle glow */}
        <rect width="1200" height="900" fill={bgColor} />
        <rect width="1200" height="900" fill="url(#sciGlow)" />

        {/* ─── DNA Double Helix (top-left) ─── */}
        <g transform="translate(60, 80)" stroke={iconColor} strokeWidth="1.8" fill="none" opacity="0.85">
          {/* Left strand */}
          <path d="M0,0 C15,20 15,40 0,60 C-15,80 -15,100 0,120 C15,140 15,160 0,180" />
          {/* Right strand */}
          <path d="M30,0 C15,20 15,40 30,60 C45,80 45,100 30,120 C15,140 15,160 30,180" />
          {/* Rungs */}
          <line x1="5" y1="15" x2="25" y2="15" strokeWidth="1.2" />
          <line x1="0" y1="45" x2="30" y2="45" strokeWidth="1.2" />
          <line x1="5" y1="75" x2="25" y2="75" strokeWidth="1.2" />
          <line x1="0" y1="105" x2="30" y2="105" strokeWidth="1.2" />
          <line x1="5" y1="135" x2="25" y2="135" strokeWidth="1.2" />
          <line x1="0" y1="165" x2="30" y2="165" strokeWidth="1.2" />
        </g>

        {/* ─── DNA Double Helix (bottom-right, larger) ─── */}
        <g transform="translate(1050, 580) scale(1.3)" stroke={iconColor} strokeWidth="1.8" fill="none" opacity="0.7">
          <path d="M0,0 C18,25 18,50 0,75 C-18,100 -18,125 0,150 C18,175 18,200 0,225" />
          <path d="M35,0 C18,25 18,50 35,75 C52,100 52,125 35,150 C18,175 18,200 35,225" />
          <line x1="5" y1="18" x2="30" y2="18" strokeWidth="1.2" />
          <line x1="0" y1="56" x2="35" y2="56" strokeWidth="1.2" />
          <line x1="5" y1="93" x2="30" y2="93" strokeWidth="1.2" />
          <line x1="0" y1="131" x2="35" y2="131" strokeWidth="1.2" />
          <line x1="5" y1="168" x2="30" y2="168" strokeWidth="1.2" />
          <line x1="0" y1="206" x2="35" y2="206" strokeWidth="1.2" />
        </g>

        {/* ─── Atom (top-center) ─── */}
        <g transform="translate(680, 120)" stroke={iconColor} strokeWidth="1.5" fill="none" opacity="0.8">
          <circle cx="0" cy="0" r="4" fill={iconColor} />
          <ellipse cx="0" cy="0" rx="30" ry="12" />
          <ellipse cx="0" cy="0" rx="30" ry="12" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="30" ry="12" transform="rotate(-60)" />
        </g>

        {/* ─── Atom (bottom-left) ─── */}
        <g transform="translate(180, 700)" stroke={iconColor} strokeWidth="1.5" fill="none" opacity="0.65">
          <circle cx="0" cy="0" r="3.5" fill={iconColor} />
          <ellipse cx="0" cy="0" rx="25" ry="10" />
          <ellipse cx="0" cy="0" rx="25" ry="10" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="25" ry="10" transform="rotate(-60)" />
        </g>

        {/* ─── Erlenmeyer Flask (center-left) ─── */}
        <g transform="translate(280, 420)" stroke={iconColor} strokeWidth="1.6" fill="none" opacity="0.8">
          <path d="M-8,-40 L-8,-15 L-25,20 Q-28,28 -20,30 L20,30 Q28,28 25,20 L8,-15 L8,-40" />
          <line x1="-8" y1="-40" x2="8" y2="-40" />
          {/* Bubbles */}
          <circle cx="-5" cy="10" r="3" />
          <circle cx="6" cy="15" r="2.5" />
          <circle cx="-2" cy="22" r="2" />
          {/* Hatching on flask body */}
          <line x1="-18" y1="22" x2="-10" y2="16" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1="-14" y1="26" x2="-4" y2="20" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1="4" y1="24" x2="14" y2="18" strokeWidth="0.8" strokeDasharray="2,2" />
        </g>

        {/* ─── E = mc² (center) ─── */}
        <g transform="translate(460, 340)" opacity="0.75">
          <text
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontSize="28"
            fontStyle="italic"
            fill={iconColor}
            letterSpacing="1"
          >
            E = mc²
          </text>
        </g>

        {/* ─── a² + b² = c² (lower-center) ─── */}
        <g transform="translate(440, 630)" opacity="0.65">
          <text
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontSize="24"
            fontStyle="italic"
            fill={iconColor}
            letterSpacing="1"
          >
            a² + b² = c²
          </text>
        </g>

        {/* ─── Benzene Ring / Hexagonal Molecule (center-right) ─── */}
        <g transform="translate(820, 440)" stroke={iconColor} strokeWidth="1.5" fill="none" opacity="0.8">
          <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" />
          <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" />
        </g>

        {/* ─── Small Molecule (top-right) ─── */}
        <g transform="translate(950, 200)" stroke={iconColor} strokeWidth="1.4" fill="none" opacity="0.7">
          <circle cx="0" cy="0" r="5" fill={iconColor} />
          <line x1="5" y1="0" x2="20" y2="-10" />
          <circle cx="22" cy="-12" r="4" fill={iconColor} />
          <line x1="5" y1="0" x2="20" y2="10" />
          <circle cx="22" cy="12" r="4" fill={iconColor} />
          <line x1="-5" y1="0" x2="-20" y2="5" />
          <circle cx="-22" cy="6" r="4" fill={iconColor} />
        </g>

        {/* ─── Small Molecule cluster (left-center) ─── */}
        <g transform="translate(120, 480)" stroke={iconColor} strokeWidth="1.3" fill="none" opacity="0.6">
          <circle cx="0" cy="0" r="4" fill={iconColor} />
          <line x1="4" y1="0" x2="18" y2="-8" />
          <circle cx="20" cy="-9" r="3.5" fill={iconColor} />
          <line x1="4" y1="0" x2="18" y2="8" />
          <circle cx="20" cy="9" r="3.5" fill={iconColor} />
          <line x1="-4" y1="0" x2="-16" y2="0" />
          <circle cx="-18" cy="0" r="3.5" fill={iconColor} />
        </g>

        {/* ─── Bar Chart with Trend Arrow (right) ─── */}
        <g transform="translate(900, 600)" stroke={iconColor} strokeWidth="1.5" fill="none" opacity="0.75">
          {/* Bars */}
          <rect x="0" y="30" width="10" height="20" rx="2" fill={iconColorFaint} stroke={iconColor} />
          <rect x="16" y="20" width="10" height="30" rx="2" fill={iconColorFaint} stroke={iconColor} />
          <rect x="32" y="10" width="10" height="40" rx="2" fill={iconColorFaint} stroke={iconColor} />
          <rect x="48" y="0" width="10" height="50" rx="2" fill={iconColorFaint} stroke={iconColor} />
          {/* Trend arrow */}
          <line x1="2" y1="55" x2="56" y2="55" strokeWidth="1" />
          <path d="M45,-5 L62,-12 L58,2" strokeWidth="1.3" />
          <line x1="5" y1="48" x2="55" y2="-8" strokeWidth="1" strokeDasharray="3,3" />
        </g>

        {/* ─── Light Bulb (top-right area) ─── */}
        <g transform="translate(780, 50)" stroke={iconColor} strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M0,-20 C-12,-20 -20,-10 -20,2 C-20,10 -14,16 -10,20 L-10,28 L10,28 L10,20 C14,16 20,10 20,2 C20,-10 12,-20 0,-20 Z" />
          <line x1="-8" y1="28" x2="8" y2="28" />
          <line x1="-6" y1="32" x2="6" y2="32" />
          <line x1="-4" y1="36" x2="4" y2="36" />
          {/* Rays */}
          <line x1="0" y1="-28" x2="0" y2="-35" strokeWidth="1" />
          <line x1="18" y1="-22" x2="24" y2="-28" strokeWidth="1" />
          <line x1="-18" y1="-22" x2="-24" y2="-28" strokeWidth="1" />
          <line x1="24" y1="-4" x2="30" y2="-4" strokeWidth="1" />
          <line x1="-24" y1="-4" x2="-30" y2="-4" strokeWidth="1" />
        </g>

        {/* ─── Hexagon (bottom-center) ─── */}
        <g transform="translate(620, 780)" stroke={iconColor} strokeWidth="1.3" fill="none" opacity="0.55">
          <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" />
        </g>

        {/* ─── Small Hexagon (top area) ─── */}
        <g transform="translate(520, 90)" stroke={iconColorFaint} strokeWidth="1.2" fill="none" opacity="0.5">
          <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" />
        </g>

        {/* ─── Plus Signs scattered ─── */}
        {[
          [160, 180], [380, 140], [550, 500], [720, 320],
          [900, 100], [1020, 420], [300, 750], [750, 750],
          [100, 350], [500, 220], [850, 300], [1100, 150],
          [200, 600], [640, 520], [980, 700],
        ].map(([x, y], i) => (
          <g key={`plus-${i}`} transform={`translate(${x}, ${y})`} stroke={iconColorFaint} strokeWidth="1.2" opacity="0.45">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
          </g>
        ))}

        {/* ─── Minus Signs scattered ─── */}
        {[
          [250, 250], [450, 480], [700, 200], [950, 450],
          [130, 650], [580, 680], [1050, 300], [340, 560],
        ].map(([x, y], i) => (
          <g key={`minus-${i}`} transform={`translate(${x}, ${y})`} stroke={iconColorFaint} strokeWidth="1.2" opacity="0.4">
            <line x1="-5" y1="0" x2="5" y2="0" />
          </g>
        ))}

        {/* ─── Dashed Curves (decorative flow lines) ─── */}
        <path
          d="M200,300 C300,250 400,350 500,280"
          stroke={iconColorFaint}
          strokeWidth="1.3"
          strokeDasharray="6,4"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M700,500 C780,460 850,540 950,480"
          stroke={iconColorFaint}
          strokeWidth="1.3"
          strokeDasharray="6,4"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M100,550 C180,520 240,580 340,530"
          stroke={iconColorFaint}
          strokeWidth="1.2"
          strokeDasharray="5,4"
          fill="none"
          opacity="0.35"
        />

        {/* ─── Small Dots scattered ─── */}
        {[
          [320, 200], [480, 110], [620, 380], [780, 580],
          [900, 350], [1080, 520], [180, 520], [400, 700],
          [560, 150], [720, 680], [1000, 140], [140, 800],
        ].map(([x, y], i) => (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r="1.8"
            fill={iconColorFaint}
            opacity="0.5"
          />
        ))}

        {/* ─── Additional Hexagon grid accent (right-center) ─── */}
        <g transform="translate(1000, 350)" stroke={iconColorFaint} strokeWidth="1" fill="none" opacity="0.35">
          <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" />
          <polygon points="24,-14 36,-7 36,7 24,14 12,7 12,-7" transform="translate(0, 21)" />
        </g>
      </svg>
    </div>
  );
};

