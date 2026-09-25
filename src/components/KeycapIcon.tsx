'use client';

import React from 'react';

interface KeycapIconProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  glow?: boolean;
  className?: string;
}

export const KeycapIcon: React.FC<KeycapIconProps> = ({
  size = 'md',
  label = 'T',
  glow = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-lg'
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      title={`Keycap [ ${label} ]`}
    >
      {/* Glow externo */}
      {glow && (
        <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-lg -z-10 animate-pulse" />
      )}

      {/* Base 3D do Keycap Mecânico */}
      <div className="w-full h-full rounded-md bg-gradient-to-b from-stone-800 via-stone-900 to-black p-[2px] shadow-[0_4px_0_0_#1c1917,0_6px_8px_rgba(0,0,0,0.8)] border border-stone-700/60 active:translate-y-[2px] active:shadow-[0_2px_0_0_#1c1917] transition-all">
        {/* Topo Côncavo do Keycap */}
        <div className="w-full h-full rounded-[3px] bg-gradient-to-b from-stone-700/80 to-stone-900 flex items-center justify-center border-t border-stone-500/50 shadow-inner">
          <span className="font-mono font-black text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wider">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
