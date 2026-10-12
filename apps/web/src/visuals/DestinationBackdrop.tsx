/**
 * DestinationBackdrop.tsx – Destination-Specific Visual Backdrops for IGNIS.
 *
 * Implements subtle, low-contrast, destination-reactive backdrops behind the flame:
 *   - Orbital: Slow-drifting starfield + faint curved Earth limb glow.
 *   - Moon: Dark grey crater horizon line + low sun corona glow + sharp stars.
 *   - Mars: Dusty orange-tinted horizon haze + pale butterscotch sky gradient.
 *
 * Constraints & Compliance:
 *   - 500ms smooth CSS crossfade when destination preset changes.
 *   - Zero external textures/models (<50KB footprint, pure CSS & SVG).
 *   - Flame remains the unequivocal focal point (backdrop stays dark and low-contrast).
 *   - 'low' quality tier and prefers-reduced-motion render static gradients only.
 */

import React, { useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useQualityTier } from './useQualityTier';
import { resolveDestination, type DestinationType } from './flameParams';

interface DestinationBackdropProps {
  destination?: DestinationType | string | null;
  gravityEnvironment?: string | null;
  className?: string;
}

// Fixed deterministic star positions (avoids runtime math or re-render jitter)
const ORBITAL_STARS = [
  { x: 12, y: 18, r: 1.0, o: 0.65 },
  { x: 28, y: 12, r: 0.8, o: 0.45 },
  { x: 42, y: 25, r: 1.2, o: 0.75 },
  { x: 68, y: 15, r: 0.7, o: 0.35 },
  { x: 84, y: 22, r: 1.1, o: 0.6 },
  { x: 92, y: 10, r: 0.9, o: 0.5 },
  { x: 18, y: 38, r: 0.8, o: 0.4 },
  { x: 35, y: 45, r: 1.3, o: 0.7 },
  { x: 75, y: 36, r: 0.8, o: 0.45 },
  { x: 88, y: 48, r: 1.0, o: 0.55 },
  { x: 8, y: 62, r: 0.7, o: 0.3 },
  { x: 22, y: 70, r: 1.1, o: 0.5 },
  { x: 80, y: 65, r: 0.9, o: 0.45 },
  { x: 95, y: 72, r: 1.2, o: 0.6 },
];

const LUNAR_STARS = [
  { x: 10, y: 14, r: 1.0, o: 0.8 },
  { x: 24, y: 22, r: 0.8, o: 0.65 },
  { x: 38, y: 10, r: 1.1, o: 0.85 },
  { x: 55, y: 18, r: 0.7, o: 0.55 },
  { x: 72, y: 12, r: 1.0, o: 0.75 },
  { x: 86, y: 26, r: 0.9, o: 0.7 },
  { x: 94, y: 16, r: 1.2, o: 0.9 },
  { x: 16, y: 42, r: 0.8, o: 0.6 },
  { x: 45, y: 35, r: 1.0, o: 0.7 },
  { x: 64, y: 40, r: 0.7, o: 0.5 },
  { x: 82, y: 48, r: 1.1, o: 0.8 },
];

export const DestinationBackdrop: React.FC<DestinationBackdropProps> = ({
  destination,
  gravityEnvironment,
  className = '',
}) => {
  const activeDest = useMemo(
    () => resolveDestination(destination, gravityEnvironment),
    [destination, gravityEnvironment],
  );

  const reducedMotion = useReducedMotion();
  const quality = useQualityTier();
  const isStaticOnly = reducedMotion || quality.tier === 'low';

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* =================================================================== */}
      {/* 1. ORBITAL BACKDROP: Slow-drifting starfield + curved Earth limb    */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out"
        style={{
          opacity: activeDest === 'orbital' ? 1 : 0,
        }}
      >
        {/* Deep space void base */}
        <div className="absolute inset-0 bg-[#04060E]" />

        {/* Starfield with gentle drift (disabled under static/reduced motion) */}
        <div
          className={`absolute inset-0 w-full h-full ${
            isStaticOnly ? '' : 'transition-transform duration-1000'
          }`}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {ORBITAL_STARS.map((s, idx) => (
              <circle
                key={`orb-star-${idx}`}
                cx={s.x}
                cy={s.y}
                r={s.r * 0.35}
                fill="#E2E8F0"
                opacity={s.o}
              />
            ))}
          </svg>
        </div>

        {/* Curved Earth Limb Glow (SVG arc with atmospheric aura) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 360"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="earthAtmosphereGlow" cx="45%" cy="130%" r="80%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
              <stop offset="35%" stopColor="#0284C7" stopOpacity="0.14" />
              <stop offset="65%" stopColor="#0F172A" stopOpacity="0.04" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="earthLimbLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
              <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Broad Atmospheric Diffuse Haze */}
          <ellipse
            cx="380"
            cy="420"
            rx="460"
            ry="180"
            fill="url(#earthAtmosphereGlow)"
          />

          {/* Curved Horizon Limb Arc */}
          <path
            d="M -40 370 Q 380 260 840 370"
            stroke="url(#earthLimbLine)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Earth Body Occlusion Base */}
          <path
            d="M -40 370 Q 380 260 840 370 L 840 400 L -40 400 Z"
            fill="#030816"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* =================================================================== */}
      {/* 2. MOON BACKDROP: Dark grey crater horizon + low sun glow + stars   */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out"
        style={{
          opacity: activeDest === 'moon' ? 1 : 0,
        }}
      >
        {/* Airless vacuum pitch-black base */}
        <div className="absolute inset-0 bg-[#030408]" />

        {/* Crisp stark non-scintillating lunar stars */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {LUNAR_STARS.map((s, idx) => (
            <circle
              key={`lunar-star-${idx}`}
              cx={s.x}
              cy={s.y}
              r={s.r * 0.3}
              fill="#FFFFFF"
              opacity={s.o}
            />
          ))}
        </svg>

        {/* Lunar Terrain Silhouette & Low Sun Corona */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 360"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="lunarSunGlow" cx="22%" cy="73%" r="35%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="18%" stopColor="#FEF3C7" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Low-Angle Solar Corona Glare */}
          <circle cx="175" cy="264" r="95" fill="url(#lunarSunGlow)" />

          {/* Sun Core Bead */}
          <circle cx="175" cy="264" r="3.5" fill="#FFFFFF" opacity="0.9" />

          {/* Horizontal Lens Sun Glare Streak */}
          <line
            x1="80"
            y1="264"
            x2="270"
            y2="264"
            stroke="#FEF3C7"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />

          {/* Lunar Regolith Crater Ridge Horizon */}
          <path
            d="M 0 268 Q 90 262 175 264 T 340 269 T 520 265 T 700 270 T 800 266 L 800 360 L 0 360 Z"
            fill="#0F141E"
          />

          {/* Subtle Ridge Crest Rim Highlight */}
          <path
            d="M 0 268 Q 90 262 175 264 T 340 269 T 520 265 T 700 270 T 800 266"
            stroke="#263248"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>

      {/* =================================================================== */}
      {/* 3. MARS BACKDROP: Dusty orange horizon haze + pale sky gradient     */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out"
        style={{
          opacity: activeDest === 'mars' ? 1 : 0,
        }}
      >
        {/* Pale butterscotch & dusky salmon sky gradient */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              'linear-gradient(to bottom, #0C0607 0%, #1A0B09 45%, #2B110B 75%, #3D180C 100%)',
          }}
        />

        {/* Dusty Orange Horizon Haze (SVG Radial Diffuser) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 360"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="marsHazeRadial" cx="50%" cy="100%" r="70%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
              <stop offset="35%" stopColor="#C2410C" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#9A3412" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Atmospheric Dust Band Haze */}
          <ellipse
            cx="400"
            cy="340"
            rx="500"
            ry="140"
            fill="url(#marsHazeRadial)"
          />

          {/* Gentle Martian Undulating Dunes / Plateaus Horizon */}
          <path
            d="M 0 274 Q 160 268 320 275 T 600 270 T 800 273 L 800 360 L 0 360 Z"
            fill="#180A07"
          />

          {/* Warm dust inversion line */}
          <path
            d="M 0 274 Q 160 268 320 275 T 600 270 T 800 273"
            stroke="#9A3412"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
        </svg>

        {/* Suspended Ambient Dust Motes (Skipped under reduced motion / low tier) */}
        {!isStaticOnly && (
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
            <span
              className="absolute w-1 h-1 rounded-full bg-orange-400/40 animate-pulse"
              style={{ left: '15%', top: '45%', animationDuration: '4s' }}
            />
            <span
              className="absolute w-1 h-1 rounded-full bg-amber-500/35 animate-pulse"
              style={{ left: '72%', top: '35%', animationDuration: '6s' }}
            />
            <span
              className="absolute w-1 h-1 rounded-full bg-orange-400/30 animate-pulse"
              style={{ left: '42%', top: '65%', animationDuration: '5s' }}
            />
            <span
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-pulse"
              style={{ left: '88%', top: '55%', animationDuration: '7s' }}
            />
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. Laboratory Measurement Grid Layer (Persistent context overlay)   */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #38BDF8 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default DestinationBackdrop;
