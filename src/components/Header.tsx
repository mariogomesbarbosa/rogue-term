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
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md z-20">
      {/* Título & Logo Balatro Arcade */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <KeycapIcon size="md" label="T" glow />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ROGUE TERM
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-bold -mt-1">
              Edição Balatro Roguelike
            </span>
          </div>
        </div>
      </div>

      {/* Estatísticas Centrais (Rodada, Pontos, Streak) */}
      <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
        {/* Rodada */}
        <div className="bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-md flex flex-col items-center">
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Rodada</span>
          <span className="text-stone-200 font-bold">#{round}</span>
        </div>

        {/* Pontuação */}
        <div className="bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-md flex flex-col items-center">
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Pontos</span>
          <span className="text-amber-400 font-bold tracking-wide">{score.toLocaleString('pt-BR')}</span>
        </div>

        {/* Streak */}
        {streak > 1 && (
          <div className="bg-amber-950/40 border border-amber-800/60 px-2.5 py-1.5 rounded-md flex items-center gap-1 text-amber-400">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">{streak}x</span>
          </div>
        )}
      </div>

      {/* Recurso Vital: TECLAS [ T ] & Botões de Ação */}
      <div className="flex items-center gap-3">
        {/* Contador de Teclas */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            isLowKeys
              ? 'bg-rose-950/60 border-rose-600 animate-bounce text-rose-300'
              : 'bg-stone-900/90 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          }`}
          title="Pool contínuo de Teclas: cada palpite custa 1 Tecla [T]!"
        >
          <KeycapIcon size="sm" label="T" glow={isLowKeys} />
          <div className="flex flex-col font-mono leading-none">
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold">
              Teclas
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-base font-black ${isLowKeys ? 'text-rose-400' : 'text-amber-400'}`}>
                {keys}
              </span>
              <span className="text-xs text-stone-500">/{maxKeys}</span>
            </div>
          </div>
        </div>

        {/* Alternador de Filtro CRT */}
        <button
          onClick={toggleCrt}
          className={`p-2 rounded-md border text-xs font-mono transition-colors flex items-center gap-1 ${
            crtEnabled
              ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title={crtEnabled ? 'Filtro CRT Ativo (Clique para desligar)' : 'Filtro Minimalista (Clique para ativar CRT)'}
        >
          <Tv className="w-4 h-4" />
          <span className="hidden sm:inline">{crtEnabled ? 'CRT ON' : 'CRT OFF'}</span>
        </button>

        {/* Reiniciar Run */}
        <button
          onClick={() => {
            if (confirm('Deseja reiniciar a sua Run? O progresso atual será zerado.')) {
              startNewRun();
            }
          }}
          className="p-2 rounded-md bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
          title="Reiniciar Run"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
