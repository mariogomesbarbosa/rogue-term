'use client';

import React from 'react';
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

  return (
    <aside className="hidden md:flex w-64 lg:w-72 h-full bg-stone-950/90 border-r border-stone-800/80 p-4 flex-col justify-between select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20 font-mono">
      {/* Topo: Logo & Identidade Balatro */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <KeycapIcon size="md" label="T" glow />
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
              ROGUE TERM
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">
              Edição Balatro Roguelike
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-stone-800 via-stone-700 to-transparent my-1" />
      </div>

      {/* Painel Central: Status da Run Estilo Console Balatro */}
      <div className="flex flex-col gap-3 my-auto">
        {/* Painel de Teclas [T] (Recurso Vital) */}
        <div
          className={`rounded-xl border p-3 flex flex-col gap-1 transition-all ${
            isLowKeys
              ? 'bg-rose-950/70 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)] animate-pulse'
              : 'bg-stone-900/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Fôlego / Teclas
            </span>
            {isLowKeys && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
          </div>

          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl lg:text-3xl font-black ${isLowKeys ? 'text-rose-400' : 'text-amber-400'}`}>
                {keys}
              </span>
              <span className="text-xs text-stone-500 font-bold">/{maxKeys}</span>
            </div>
            <KeycapIcon size="sm" label="T" glow={isLowKeys} />
          </div>

          <span className="text-[9px] text-stone-500 leading-tight">
            Cada palpite custa 1 Tecla [T]. Acertos recarregam.
          </span>
        </div>

        {/* Painel de Pontuação */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-3 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            Pontuação
          </span>
          <span className="text-xl lg:text-2xl font-black text-amber-400 tracking-wide">
            {score.toLocaleString('pt-BR')}
          </span>
          <span className="text-[9px] text-stone-500">Recorde da Run</span>
        </div>

        {/* Painel de Rodada e Combos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-2.5 flex flex-col">
            <span className="text-[9px] uppercase font-bold text-stone-400">Rodada</span>
            <span className="text-lg font-black text-stone-100">#{round}</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-2.5 flex flex-col">
            <span className="text-[9px] uppercase font-bold text-stone-400">Combo</span>
            <div className="flex items-center gap-1 text-amber-400">
              {streak > 1 && <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span className="text-lg font-black">{streak}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base: Controles e Atalhos */}
      <div className="flex flex-col gap-2 pt-2 border-t border-stone-800/80">
        <button
          onClick={toggleCrt}
          className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            crtEnabled
              ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Filtro CRT: {crtEnabled ? 'LIGADO' : 'DESLIGADO'}</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Deseja reiniciar a sua Run? O progresso atual será zerado.')) {
              startNewRun();
            }
          }}
          className="w-full py-2 px-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar Run</span>
        </button>

        <span className="text-[9px] text-stone-600 text-center mt-1">
          Dica: Clique em qualquer casa do grid para digitar!
        </span>
      </div>
    </aside>
  );
};
