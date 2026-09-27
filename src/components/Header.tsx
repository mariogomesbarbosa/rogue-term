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
    <header className="md:hidden w-full px-2 py-1.5 flex items-center justify-between gap-1.5 border-b-2 border-stone-800 bg-[#0d0e12] backdrop-blur-md z-20 font-mono text-xs select-none shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
      {/* Título & Rodada */}
      <div className="flex items-center gap-1.5">
        <KeycapIcon size="sm" label="T" glow />
        <div className="flex flex-col leading-tight">
          <span className="font-black text-amber-400 text-xs tracking-wider">ROGUE-TERM</span>
          <span className="text-[8px] text-stone-400 font-bold">R#{round} {'//'} CHASSIS</span>
        </div>
      </div>

      {/* Recurso Vital: Teclas [T] */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded border-2 transition-all ${
          isLowKeys
            ? 'bg-rose-950/70 border-rose-500 animate-pulse text-rose-300'
            : 'bg-[#15161c] border-amber-500/60 text-amber-300'
        }`}
      >
        <span className="text-[9px] text-stone-400 font-bold">T:</span>
        <span className={`font-black ${isLowKeys ? 'text-rose-400 drop-shadow-[0_0_6px_#f43f5e]' : 'text-amber-400 drop-shadow-[0_0_6px_#f59e0b]'}`}>
          {keys}
        </span>
        <span className="text-[9px] text-stone-500">/{maxKeys}</span>
      </div>

      {/* Pontuação & Streak */}
      <div className="flex items-center gap-1">
        <div className="bg-[#15161c] border border-stone-800 px-2 py-1 rounded text-stone-200">
          <span className="text-amber-300 font-bold">{score.toLocaleString('pt-BR')}</span>
        </div>
        {streak > 1 && (
          <div className="bg-amber-950/40 border border-amber-800 px-1.5 py-1 rounded flex items-center text-amber-400 text-[10px] font-bold">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{streak}x</span>
          </div>
        )}
      </div>

      {/* Ações (CRT & Novo Jogo) */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleCrt}
          className={`p-1.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
            crtEnabled
              ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
              : 'bg-[#15161c] border-stone-800 text-stone-400'
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
          className="p-1.5 rounded bg-[#15161c] border border-stone-800 text-stone-400 hover:text-rose-400 cursor-pointer"
          title="Reiniciar Run"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

