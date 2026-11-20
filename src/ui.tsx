import React from 'react';

interface ParticleFieldProps {
  count?: number;
}

export function ParticleField({ count = 24 }: ParticleFieldProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {Array.from({ length: count }).map((_, i) => {
        const size   = 1 + Math.random() * 2;
        const left   = Math.random() * 100;
        const delay  = Math.random() * 6;
        const dur    = 6 + Math.random() * 8;
        const tx     = (Math.random() - 0.5) * 60;
        return (
          <div
            key={i}
            style={{
              position:   'absolute',
              bottom:     `-${size * 2}px`,
              left:       `${left}%`,
              width:      `${size}px`,
              height:     `${size}px`,
              borderRadius: '50%',
              background: '#E2A76F',
              opacity:    0,
              animation:  `particle-float ${dur}s ${delay}s ease-in infinite`,
              ['--tx' as string]: `${tx}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export function FilmGrain() {
  return <div className="film-grain fixed inset-0 pointer-events-none z-50" />;
}

interface CandleProps {
  style?: React.CSSProperties;
  flameSize?: number;
}

export function CandleIcon({ style, flameSize = 20 }: CandleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      {/* Flame */}
      <div style={{
        width:        flameSize * 0.6,
        height:       flameSize,
        borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%',
        background:   'radial-gradient(ellipse at 50% 70%, #FFF3CD, #FFA94D, #E05A00)',
        animation:    'candle-flicker 1.5s ease-in-out infinite',
        transformOrigin: 'bottom center',
      }} />
      {/* Wick */}
      <div style={{ width: 1, height: 4, background: '#3D2B1A', marginBottom: 2 }} />
      {/* Body */}
      <div style={{
        width:        flameSize * 0.6 + 8,
        height:       flameSize * 1.6,
        background:   'linear-gradient(to bottom, #F5EEDB, #E8D9B5)',
        borderRadius: 2,
      }} />
    </div>
  );
}

export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="divider-gold flex-1" />
      <span style={{ color: '#C9A84C', fontSize: 10 }}>✦</span>
      <div className="divider-gold flex-1" />
    </div>
  );
}
