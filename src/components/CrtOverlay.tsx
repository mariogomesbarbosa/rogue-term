'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

export const CrtOverlay: React.FC = () => {
  const crtEnabled = useGameStore(state => state.crtEnabled);

  if (!crtEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Scanlines horizontais */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Vinheta escura suave nas bordas do tubo CRT */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 75%, rgba(4, 7, 13, 0.6) 100%)',
        }}
      />

      {/* Brilho fósforo sutil / noise */}
      <div className="pointer-events-none absolute inset-0 bg-emerald-500/[0.015] mix-blend-screen" />
    </div>
  );
};
