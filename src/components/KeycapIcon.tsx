'use client';

import React from 'react';
import Image from 'next/image';

interface KeycapIconProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  glow?: boolean;
  className?: string;
  useOfficialIcon?: boolean;
}

export const KeycapIcon: React.FC<KeycapIconProps> = ({
  size = 'md',
  label = 'RT',
  glow = true,
  className = '',
  useOfficialIcon = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-11 h-11 text-base'
  };

  const pixelDimensions = {
    sm: 24,
    md: 32,
    lg: 44
  };

  if (useOfficialIcon) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
        title={`Tecla [ ${label} ]`}
      >
        {glow && (
          <div className="absolute inset-0 bg-emerald-500/30 blur-sm rounded-none -z-10 animate-pulse" />
        )}
        <Image
          src="/images/icon.png"
          alt="Tecla RT Pixel Art"
          width={pixelDimensions[size]}
          height={pixelDimensions[size]}
          className="pixel-art rounded-xs shadow-[0_2px_0_#000]"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none font-pixel ${sizeClasses[size]} ${className}`}
      title={`Keycap [ ${label} ]`}
    >
      {glow && (
        <div className="absolute inset-0 bg-amber-500/25 blur-sm -z-10 animate-pulse" />
      )}
      <div className="w-full h-full bg-[#1b1c28] border-2 border-black border-t-stone-600 border-l-stone-600 shadow-[0_3px_0_#000] flex items-center justify-center">
        <span className="font-bold text-amber-400 drop-shadow-[0_1px_0_#000]">
          {label}
        </span>
      </div>
    </div>
  );
};

