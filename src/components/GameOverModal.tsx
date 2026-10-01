'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Skull, BookOpen, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { copyShareResult } from '@/utils/share';

export const GameOverModal: React.FC = () => {
  const {
    gamePhase,
    targetWord,
    round,
    score,
    streak,
    sector,
    stage,
    lives,
    maxLives,
    runMode,
    seed,
    activeSkills,
    startNewRun,
    openCodex
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  if (gamePhase !== 'game_over') return null;

  const handleShare = async () => {
    const success = await copyShareResult({
      runMode,
      seed,
      score,
      sector,
      stage,
      lives,
      maxLives,
      won: false,
      activeSkillNames: activeSkills.map(s => s.name)
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const title = 'SISTEMA COLAPSADO';
  const subtitle = 'Suas Vidas se esgotaram. A memória volátil do terminal foi descarregada.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-stone-950 border-2 border-rose-600/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(225,29,72,0.35)] flex flex-col items-center gap-5 text-center font-mono"
      >
        <div className="w-14 h-14 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.5)]">
          <Skull className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-wider">
            {title}
          </h2>
          <p className="text-xs text-stone-400">
            {subtitle}
          </p>
        </div>

        {/* Palavra revelada */}
        <div className="w-full bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex flex-col items-center gap-1.5">
          <span className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
            A palavra secreta era:
          </span>
          <div className="flex gap-1.5 justify-center">
            {targetWord.split('').map((letter, i) => (
              <span
                key={i}
                className="w-9 h-10 rounded bg-rose-950/80 border border-rose-500/70 text-rose-200 font-black text-lg flex items-center justify-center"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Estatísticas da Run */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="bg-stone-900 border border-stone-800 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase">Setor</span>
            <span className="text-base font-bold text-stone-100">{sector}/8</span>
          </div>

          <div className="bg-stone-900 border border-stone-800 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase">Pontos</span>
            <span className="text-base font-bold text-amber-400">{score.toLocaleString('pt-BR')}</span>
          </div>

          <div className="bg-stone-900 border border-stone-800 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase">Streak</span>
            <span className="text-base font-bold text-cyan-400">{streak}x</span>
          </div>
        </div>

        {/* Botão Reiniciar */}
        <button
          onClick={() => startNewRun()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-stone-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all active:scale-95 mt-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tentar Novamente (2 Vidas)</span>
        </button>

        {/* Botão Compartilhar */}
        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Resultado Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Compartilhar Desempenho</span>
            </>
          )}
        </button>

        <button
          onClick={openCodex}
          className="w-full py-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-400 hover:text-stone-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Ver Estatísticas & Compêndio</span>
        </button>
      </motion.div>
    </div>
  );
};
