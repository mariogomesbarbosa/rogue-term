'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { KeycapIcon } from './KeycapIcon';
import { Tv, RotateCcw, Flame } from 'lucide-react';

export const Header: React.FC = () => {
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

  return (
    // Visível apenas no Mobile / Telas pequenas. No Desktop, o BalatroSidebar assume essa função.
    <header className="md:hidden w-full px-2 py-1.5 flex items-center justify-between gap-1.5 border-b-3 border-black bg-[#0d0e14] z-20 font-pixel text-xs select-none shrink-0 shadow-[0_3px_0_#000]">
      {/* Título & Rodada */}
      <div className="flex items-center gap-1.5">
        <KeycapIcon size="sm" glow />
        <div className="flex flex-col leading-none">
          <span className="font-bold text-amber-400 text-xs">ROGUE</span>
          <span className="text-[8px] text-stone-400 font-bold">R#{round}</span>
        </div>
      </div>

      {/* Recurso Vital: Teclas [T] */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 border-2 border-black transition-all shadow-[0_2px_0_#000] ${
          isLowKeys
            ? 'bg-[#3b151b] border-rose-600 animate-pulse text-rose-300'
            : 'bg-[#181926] text-amber-300'
        }`}
      >
        <span className="text-[9px] text-stone-400 font-bold">T:</span>
        <span className={`font-bold ${isLowKeys ? 'text-rose-400' : 'text-amber-400'}`}>
          {keys}
        </span>
        <span className="text-[9px] text-stone-500">/{maxKeys}</span>
      </div>

      {/* Pontuação & Streak */}
      <div className="flex items-center gap-1">
        <div className="bg-[#181926] border-2 border-black px-2 py-1 text-stone-200 shadow-[0_2px_0_#000]">
          <span className="text-amber-300 font-bold text-[10px]">{score.toLocaleString('pt-BR')}</span>
        </div>
        {streak > 1 && (
          <div className="bg-[#2e1d08] border border-amber-600 px-1 py-1 flex items-center text-amber-400 text-[9px] font-bold">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{streak}x</span>
          </div>
        )}
      </div>

      {/* Ações (CRT & Novo Jogo) */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleCrt}
          className={`p-1.5 border border-black text-[9px] font-pixel transition-transform active:translate-y-0.5 cursor-pointer shadow-[0_2px_0_#000] ${
            crtEnabled
              ? 'bg-emerald-700 border-emerald-400 text-emerald-100'
              : 'bg-[#222433] text-stone-400'
          }`}
          title="Alternar filtro CRT"
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (confirm('Reiniciar Run?')) {
              startNewRun();
            }
          }}
          className="p-1.5 bg-[#2a1818] border border-rose-900 text-rose-300 hover:text-rose-200 active:translate-y-0.5 cursor-pointer shadow-[0_2px_0_#000]"
          title="Reiniciar Run"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
