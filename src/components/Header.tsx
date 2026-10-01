'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { KeycapIcon } from './KeycapIcon';
import { RoundTimer } from './RoundTimer';
import { Tv, RotateCcw, Flame, Skull, Volume2, VolumeX, BookOpen, HelpCircle, Heart } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    lives,
    maxLives,
    score,
    coins,
    round,
    sector,
    stage,
    streak,
    crtEnabled,
    toggleCrt,
    soundEnabled,
    toggleSound,
    openCodex,
    openTutorial,
    startNewRun
  } = useGameStore();

  const isLowLives = lives <= 1;

  return (
    // Visível apenas no Mobile / Telas pequenas. No Desktop, o BalatroSidebar assume essa função.
    <header className="md:hidden w-full px-2 py-1 flex items-center justify-between gap-1.5 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md z-20 font-mono text-xs select-none shrink-0">
      {/* Título & Setor/Fase */}
      <div className="flex items-center gap-1.5">
        <KeycapIcon size="sm" label="T" glow={stage === 3} />
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-black text-amber-400 text-xs">S{sector}</span>
            <span
              className={`text-[9px] font-bold px-1 rounded flex items-center gap-0.5 ${
                stage === 3
                  ? 'bg-rose-950 border border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-stone-900 border border-stone-800 text-stone-400'
              }`}
            >
              {stage === 3 ? (
                <>
                  <Skull className="w-2.5 h-2.5 text-rose-400" />
                  <span>CHEFE</span>
                </>
              ) : (
                `${stage}/3`
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-stone-500 font-bold">#{round}</span>
            <RoundTimer compact />
          </div>
        </div>
      </div>

      {/* Recurso Vital: Vidas [❤️] */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all ${
          isLowLives
            ? 'bg-rose-950/80 border-rose-500 animate-pulse text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
            : 'bg-stone-900 border-rose-500/40 text-rose-400'
        }`}
        title={`Vidas restantes: ${lives}/${maxLives}`}
      >
        <span className="text-[10px] text-stone-400 font-bold hidden xs:inline">VIDAS:</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxLives }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-3.5 h-3.5 ${
                idx < lives
                  ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                  : 'text-stone-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Créditos ($) */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-stone-900 border border-stone-800 text-amber-400 font-bold text-[11px]">
        <span className="text-amber-500/70">$</span>
        <span>{coins ?? 0}</span>
      </div>

      {/* Pontuação & Streak */}
      <div className="flex items-center gap-1">
        <div className="bg-stone-900 border border-stone-800 px-2 py-1 rounded-md text-stone-200">
          <span className="text-amber-400 font-bold">{score.toLocaleString('pt-BR')}</span>
        </div>
        {streak > 1 && (
          <div className="bg-amber-950/40 border border-amber-800 px-1.5 py-1 rounded-md flex items-center text-amber-400 text-[10px] font-bold">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{streak}x</span>
          </div>
        )}
      </div>

      {/* Ações (Manual, Compêndio, Som, CRT & Novo Jogo) */}
      <div className="flex items-center gap-1">
        <button
          onClick={openTutorial}
          className="p-1.5 rounded border border-stone-800 bg-stone-900 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-stone-800 transition-colors"
          title="Manual do Operador (Como Jogar)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={openCodex}
          className="p-1.5 rounded border border-stone-800 bg-stone-900 text-amber-400 hover:border-amber-500/50 hover:bg-stone-800 transition-colors"
          title="Ver Compêndio & Estatísticas"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleSound}
          className={`p-1.5 rounded border text-[10px] font-mono transition-colors ${
            soundEnabled
              ? 'bg-amber-950/40 border-amber-600/70 text-amber-400'
              : 'bg-stone-900 border-stone-800 text-stone-500'
          }`}
          title={soundEnabled ? 'Silenciar som de teclado' : 'Ativar som de teclado'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={toggleCrt}
          className={`p-1.5 rounded border text-[10px] font-mono transition-colors ${
            crtEnabled
              ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-400'
              : 'bg-stone-900 border-stone-800 text-stone-400'
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
          className="p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400"
          title="Reiniciar Run"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
