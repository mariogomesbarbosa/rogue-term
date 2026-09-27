'use client';

import React from 'react';
import Image from 'next/image';
import { useGameStore } from '@/store/gameStore';
import { KeycapIcon } from './KeycapIcon';
import { Tv, RotateCcw, Flame, ShieldAlert } from 'lucide-react';

export const BalatroSidebar: React.FC = () => {
  const {
    keys,
    maxKeys,
    score,
    round,
    streak,
    crtEnabled,
    toggleCrt,
    startNewRun
  } = useGameStore();

  const isLowKeys = keys <= 3;
  const keyRatio = Math.max(0, Math.min(1, keys / maxKeys));

  return (
    <aside className="hidden md:flex w-64 lg:w-72 h-full bg-[#0d0e14] border-r-4 border-black p-4 flex-col justify-between select-none shadow-[6px_0_0_#000] z-20 font-pixel">
      {/* Topo: Logo Oficial Pixel Art */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full h-24 sm:h-28 overflow-hidden rounded-xs border-2 border-black shadow-[0_4px_0_#000] bg-black">
          <Image
            src="/images/logo.png"
            alt="ROGUE TERM"
            fill
            className="object-cover pixel-art"
            priority
            unoptimized
          />
        </div>

        <div className="flex items-center justify-between text-[8px] text-amber-400 font-bold tracking-widest uppercase border-b-2 border-stone-800 pb-1">
          <span>ROGUELIKE DECKBUILDER</span>
          <span className="text-stone-500">16-BIT</span>
        </div>
      </div>

      {/* Painel Central: Status da Run Estilo HUD de RPG 16-bits */}
      <div className="flex flex-col gap-3 my-auto">
        {/* Painel de Teclas [T] (Fôlego Vital) */}
        <div
          className={`border-3 border-black p-3 flex flex-col gap-1.5 transition-all shadow-[0_4px_0_#000] ${
            isLowKeys
              ? 'bg-[#2d1218] border-rose-600 animate-pulse'
              : 'bg-[#181926]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-300">
              FÔLEGO / TECLAS
            </span>
            {isLowKeys && <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl lg:text-3xl font-bold ${isLowKeys ? 'text-rose-400' : 'text-amber-400'}`}>
                {keys}
              </span>
              <span className="text-xs text-stone-500 font-bold">/{maxKeys}</span>
            </div>
            <KeycapIcon size="sm" glow={isLowKeys} />
          </div>

          {/* Medidor Segmentado de Teclas (Barras de Vida Pixeladas) */}
          <div className="w-full flex gap-1 h-2 bg-black p-0.5 border border-stone-700">
            {Array.from({ length: 10 }).map((_, i) => {
              const segmentThreshold = (i + 1) / 10;
              const isFilled = keyRatio >= segmentThreshold;
              return (
                <div
                  key={i}
                  className={`flex-1 transition-all ${
                    isFilled
                      ? isLowKeys
                        ? 'bg-rose-500 shadow-[0_0_2px_#f43f5e]'
                        : 'bg-amber-400 shadow-[0_0_2px_#f59e0b]'
                      : 'bg-stone-850 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          <span className="text-[8px] text-stone-400 leading-tight">
            Cada palpite custa 1 Tecla [T]. Acertos recarregam.
          </span>
        </div>

        {/* Painel de Pontuação */}
        <div className="border-3 border-black bg-[#181926] p-3 flex flex-col gap-1 shadow-[0_4px_0_#000]">
          <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">
            PONTUAÇÃO
          </span>
          <span className="text-xl lg:text-2xl font-bold text-amber-300 tracking-wide">
            {score.toLocaleString('pt-BR')} <span className="text-xs text-amber-500">PTS</span>
          </span>
          <span className="text-[8px] text-stone-500">RECORDE DA RUN</span>
        </div>

        {/* Painel de Rodada e Combos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border-3 border-black bg-[#181926] p-2.5 flex flex-col shadow-[0_3px_0_#000]">
            <span className="text-[8px] uppercase font-bold text-stone-400">RODADA</span>
            <span className="text-lg font-bold text-stone-100">#{round}</span>
          </div>

          <div className="border-3 border-black bg-[#181926] p-2.5 flex flex-col shadow-[0_3px_0_#000]">
            <span className="text-[8px] uppercase font-bold text-stone-400">COMBO</span>
            <div className="flex items-center gap-1 text-amber-400">
              {streak > 1 && <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span className="text-lg font-bold">{streak}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base: Controles e Atalhos de Arcade */}
      <div className="flex flex-col gap-2 pt-2 border-t-2 border-stone-800">
        <button
          onClick={toggleCrt}
          className={`w-full py-2 px-3 border-2 text-[10px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 ${
            crtEnabled
              ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400 text-emerald-100 shadow-[0_3px_0_#022c22]'
              : 'bg-[#222433] hover:bg-[#2c2f42] border-black text-stone-300 shadow-[0_3px_0_#000]'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>FILTRO CRT: {crtEnabled ? 'LIGADO' : 'DESLIGADO'}</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Deseja reiniciar a sua Run? O progresso atual será zerado.')) {
              startNewRun();
            }
          }}
          className="w-full py-2 px-3 bg-[#2a1818] hover:bg-[#381f1f] border-2 border-rose-900 text-rose-300 text-[10px] font-bold transition-transform active:translate-y-0.5 shadow-[0_3px_0_#000] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REINICIAR RUN</span>
        </button>
      </div>
    </aside>
  );
};
