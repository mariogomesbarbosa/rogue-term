'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { KeycapIcon } from './KeycapIcon';
import { Tv, RotateCcw, Flame, ShieldAlert, Terminal, Activity } from 'lucide-react';

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
    <aside className="hidden md:flex w-64 lg:w-72 h-full bg-[#0d0e12] border-r-2 border-stone-800 p-4 flex-col justify-between select-none shadow-[6px_0_30px_rgba(0,0,0,0.7)] z-20 font-mono relative overflow-hidden">
      {/* Parafusos industriais nos 4 cantos da carcaça do rack */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold select-none pointer-events-none">
        +
      </div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold select-none pointer-events-none">
        +
      </div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold select-none pointer-events-none">
        +
      </div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold select-none pointer-events-none">
        +
      </div>

      {/* Topo: Logo & Serigrafia Mainframe */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-[7px] text-stone-500 font-mono font-bold tracking-widest uppercase border-b border-stone-850 pb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_#10b981]" />
            <span>&gt; SYS_OK // V2.4</span>
          </span>
          <span>CHASSIS RT-88</span>
        </div>

        <div className="flex items-center gap-2.5">
          <KeycapIcon size="md" label="T" glow />
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-black tracking-wider text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] leading-tight">
              ROGUE TERM
            </h1>
            <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1">
              <Terminal className="w-2.5 h-2.5 text-cyan-400" />
              <span>TERMINAL ROGUELIKE</span>
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-stone-800 via-stone-700 to-transparent my-0.5" />
      </div>

      {/* Painel Central: Status da Run Estilo Console Mainframe */}
      <div className="flex flex-col gap-3 my-auto">
        {/* Painel de Teclas [T] (Recurso Vital / Tensão de Fôlego) */}
        <div
          className={`rounded-lg border-2 p-3 flex flex-col gap-1.5 transition-all relative overflow-hidden ${
            isLowKeys
              ? 'bg-rose-950/60 border-rose-500/80 shadow-[0_0_20px_rgba(225,29,72,0.35)] animate-pulse'
              : 'bg-[#12131a] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>FÔLEGO VITAL / BUFFER</span>
            </span>
            {isLowKeys && <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl lg:text-3xl font-black ${isLowKeys ? 'text-rose-400 drop-shadow-[0_0_8px_#f43f5e]' : 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]'}`}>
                {keys}
              </span>
              <span className="text-xs text-stone-500 font-bold">/{maxKeys} CHAVES</span>
            </div>
            <KeycapIcon size="sm" label="T" glow={isLowKeys} />
          </div>

          {/* Medidor Segmentado de Fôlego (Barras LED retrô) */}
          <div className="w-full flex gap-1 h-2 bg-black/60 p-0.5 rounded border border-stone-800">
            {Array.from({ length: 10 }).map((_, i) => {
              const segmentThreshold = (i + 1) / 10;
              const isFilled = keyRatio >= segmentThreshold;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-2xs transition-all ${
                    isFilled
                      ? isLowKeys
                        ? 'bg-rose-500 shadow-[0_0_4px_#f43f5e]'
                        : 'bg-amber-400 shadow-[0_0_4px_#f59e0b]'
                      : 'bg-stone-850 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          <span className="text-[8.5px] text-stone-500 leading-tight">
            Cada palpite consome 1 Tecla [T]. Palavras decifradas recarregam energia.
          </span>
        </div>

        {/* Painel de Pontuação - Display Fósforo Âmbar */}
        <div className="rounded-lg border-2 border-stone-800 bg-[#12131a] p-3 flex flex-col gap-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
          <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">
            REGISTRADOR DE PONTOS
          </span>
          <span className="text-xl lg:text-2xl font-black text-amber-300 tracking-wider font-mono drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">
            {score.toLocaleString('pt-BR')} <span className="text-xs text-amber-500/70">PTS</span>
          </span>
          <span className="text-[8.5px] text-stone-500">Recorde de Memória da Run</span>
        </div>

        {/* Painel de Rodada e Combos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border-2 border-stone-800 bg-[#12131a] p-2.5 flex flex-col shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
            <span className="text-[8px] uppercase font-bold text-stone-400">RODADA</span>
            <span className="text-lg font-black text-stone-100">#{round}</span>
          </div>

          <div className="rounded-lg border-2 border-stone-800 bg-[#12131a] p-2.5 flex flex-col shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
            <span className="text-[8px] uppercase font-bold text-stone-400">MULTIPLICADOR</span>
            <div className="flex items-center gap-1 text-amber-400">
              {streak > 1 && <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span className="text-lg font-black">{streak}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base: Controles e Atalhos Industriais */}
      <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
        <button
          onClick={toggleCrt}
          className={`w-full py-2 px-3 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            crtEnabled
              ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'bg-[#15161c] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>SCANLINES CRT: {crtEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Deseja reiniciar a sua Run? O progresso atual será zerado.')) {
              startNewRun();
            }
          }}
          className="w-full py-2 px-3 rounded-lg bg-[#15161c] border-2 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-800/80 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REINICIAR RUN</span>
        </button>

        <span className="text-[8px] text-stone-500 text-center mt-0.5">
          &gt; PROMPT: Digite letras pelo teclado ou clique nas teclas.
        </span>
      </div>
    </aside>
  );
};
