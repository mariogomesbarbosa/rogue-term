'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Trophy, Flame, RotateCcw, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KeycapIcon } from './KeycapIcon';

export const VictoryModal: React.FC = () => {
  const {
    gamePhase,
    score,
    streak,
    keys,
    maxKeys,
    sector,
    activeSkills,
    passives,
    continueEndless,
    startNewRun
  } = useGameStore();

  useEffect(() => {
    if (gamePhase === 'victory') {
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch {
        // No-op
      }
    }
  }, [gamePhase]);

  if (gamePhase !== 'victory') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-stone-950 border-2 border-emerald-500 rounded-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col gap-5 text-stone-100 font-mono relative overflow-hidden"
      >
        {/* Efeito luminoso de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Trophy className="w-10 h-10 text-emerald-400 animate-bounce" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400 tracking-wider">
            SISTEMA DESCRIPTOGRAFADO!
          </h2>
          <span className="text-xs text-stone-400">
            Você derrotou o Grande Mainframe no Setor {sector} e concluiu a run com maestria!
          </span>
        </div>

        {/* Estatísticas da Vitória */}
        <div className="grid grid-cols-3 gap-2 bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold">Pontuação</span>
            <span className="text-lg sm:text-xl font-black text-amber-400">
              {score.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-bold">Teclas Finais</span>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black text-stone-100">{keys}</span>
              <span className="text-xs text-stone-500 font-bold">/{maxKeys}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold">Combo Máx</span>
            <div className="flex items-center gap-1 text-amber-400 font-black text-lg sm:text-xl">
              <Flame className="w-4 h-4" />
              <span>{streak}x</span>
            </div>
          </div>
        </div>

        {/* Inventário Final */}
        <div className="flex flex-col gap-1.5 bg-stone-900/50 border border-stone-800/80 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Build Final da Run
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[...activeSkills, ...passives].map((card, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  card.type === 'passive'
                    ? 'bg-purple-950/60 border-purple-600/70 text-purple-300'
                    : 'bg-cyan-950/60 border-cyan-600/70 text-cyan-300'
                }`}
              >
                {card.name}
              </span>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={continueEndless}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>Modo Infinito (Setor 9+)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={startNewRun}
            className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-stone-100 font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nova Run</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
