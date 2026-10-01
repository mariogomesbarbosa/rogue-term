'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Heart, HeartCrack, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const LifeLostModal: React.FC = () => {
  const {
    gamePhase,
    targetWord,
    lives,
    maxLives,
    bufferDeathPrevented,
    startNextRound
  } = useGameStore();

  useEffect(() => {
    if (gamePhase !== 'life_lost') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startNextRound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, startNextRound]);

  if (gamePhase !== 'life_lost') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-stone-950 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] flex flex-col items-center gap-5 text-center font-mono"
      >
        <div className="w-14 h-14 rounded-full bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
          {bufferDeathPrevented ? (
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          ) : (
            <HeartCrack className="w-8 h-8 text-rose-500" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
            {bufferDeathPrevented ? 'SOBRECARGA ABSORVIDA' : 'VIDA PERDIDA'}
          </h2>
          <p className="text-xs text-stone-400">
            {bufferDeathPrevented
              ? 'O Buffer de Sobrecarga absorveu o dano letal e salvou sua run!'
              : 'Tentativas esgotadas nesta rodada. Uma das suas Vidas foi danificada.'}
          </p>
        </div>

        {/* Visualização de Vidas Restantes */}
        <div className="w-full bg-stone-900/90 border border-stone-800 rounded-xl p-4 flex flex-col items-center gap-2">
          <span className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
            Integridade da Run ({lives}/{maxLives} Vidas)
          </span>
          <div className="flex gap-2 items-center justify-center">
            {Array.from({ length: maxLives }).map((_, idx) => {
              const isAlive = idx < lives;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                    isAlive
                      ? 'bg-rose-950/60 border-rose-500/80 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'bg-stone-950/80 border-stone-800 text-stone-600'
                  }`}
                >
                  {isAlive ? (
                    <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                  ) : (
                    <HeartCrack className="w-6 h-6 text-stone-600" />
                  )}
                </div>
              );
            })}
          </div>
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
                className="w-9 h-10 rounded bg-amber-950/80 border border-amber-500/70 text-amber-200 font-black text-lg flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Botão Continuar */}
        <button
          onClick={startNextRound}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-stone-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all active:scale-95 mt-1"
        >
          <span>Continuar Run ({lives} {lives === 1 ? 'Vida Restante' : 'Vidas Restantes'})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-stone-500">Pressione [Enter ↵] para avançar</span>
      </motion.div>
    </div>
  );
};
