'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { KeycapIcon } from './KeycapIcon';
import { RoundTimer } from './RoundTimer';
import { Tv, RotateCcw, Flame, ShieldAlert, Cpu, Skull, Coins, Volume2, VolumeX, BookOpen, HelpCircle, Heart } from 'lucide-react';

export const BalatroSidebar: React.FC = () => {
  const {
    lives,
    maxLives,
    score,
    coins,
    round,
    sector,
    stage,
    maxSectors,
    currentBoss,
    endlessMode,
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
        {/* Painel de Setor & Estágio estilo Ante do Balatro */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300">
                Setor
              </span>
            </div>
            <span className="text-xs font-black text-cyan-400">
              {sector}/{endlessMode ? '∞' : maxSectors}
            </span>
          </div>

          {/* Trilha de 3 Fases do Setor */}
          <div className="grid grid-cols-3 gap-1">
            <div
              className={`py-1 px-1 rounded text-center text-[10px] font-bold border transition-all ${
                stage === 1
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : stage > 1
                  ? 'bg-stone-900/40 border-stone-700/50 text-stone-500'
                  : 'bg-stone-950/40 border-stone-800 text-stone-600'
              }`}
            >
              1. Base
            </div>
            <div
              className={`py-1 px-1 rounded text-center text-[10px] font-bold border transition-all ${
                stage === 2
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : stage > 2
                  ? 'bg-stone-900/40 border-stone-700/50 text-stone-500'
                  : 'bg-stone-950/40 border-stone-800 text-stone-600'
              }`}
            >
              2. Avanço
            </div>
            <div
              className={`py-1 px-1 rounded text-center text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                stage === 3
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-stone-950/40 border-stone-800 text-stone-600'
              }`}
            >
              <Skull className="w-2.5 h-2.5" />
              <span>3. Chefe</span>
            </div>
          </div>

          {/* Alerta de Anomalia do Chefe se estiver na fase 3 */}
          {currentBoss && stage === 3 && (
            <div className="mt-1 p-2 rounded-lg bg-rose-950/60 border border-rose-600/80 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px]">
                <Skull className="w-3 h-3 animate-pulse" />
                <span>{currentBoss.name}</span>
              </div>
              <span className="text-[9px] text-rose-200 leading-tight">
                {currentBoss.anomaly.description}
              </span>
            </div>
          )}
        </div>

        {/* Cronômetro da Rodada (Fator Tempo & Ritmo) */}
        <RoundTimer />

        {/* Painel Duplo: Vidas [❤️] & Créditos ($) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Painel de Vidas [❤️] */}
          <div
            className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all ${
              isLowLives
                ? 'bg-rose-950/70 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)] animate-pulse'
                : 'bg-stone-900/90 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-stone-400">Vidas [❤️]</span>
              {isLowLives ? (
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              ) : (
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: maxLives }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 ${
                    idx < lives
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                      : 'text-stone-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] text-stone-500 mt-1 font-bold">{lives}/{maxLives} Restantes</span>
          </div>

          {/* Painel de Créditos ($) */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-2.5 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="text-[9px] uppercase font-bold text-stone-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              Créditos
            </span>
            <div className="flex items-baseline gap-0.5 mt-1 text-amber-400 font-black">
              <span className="text-sm font-bold text-amber-500/70">$</span>
              <span className="text-2xl font-black tracking-wide">{coins ?? 0}</span>
            </div>
          </div>
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
            <span className="text-[9px] uppercase font-bold text-stone-400">Total Palavras</span>
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
          onClick={openTutorial}
          className="w-full py-2 px-3 rounded-lg border border-stone-800 bg-stone-900/90 hover:bg-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Manual / Como Jogar</span>
        </button>

        <button
          onClick={openCodex}
          className="w-full py-2 px-3 rounded-lg border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 hover:border-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.1)] cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Compêndio & Stats</span>
        </button>

        <button
          onClick={toggleSound}
          className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            soundEnabled
              ? 'bg-amber-950/40 border-amber-600/70 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
          }`}
          title={soundEnabled ? 'Silenciar áudio mecânico' : 'Ativar áudio mecânico'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>Áudio Mecânico: {soundEnabled ? 'LIGADO' : 'MUTADO'}</span>
        </button>

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
