'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Timer, Zap, Clock } from 'lucide-react';

interface RoundTimerProps {
  compact?: boolean;
  className?: string;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({ compact = false, className = '' }) => {
  const { roundStartTime, gamePhase, lastRoundDuration } = useGameStore();
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (gamePhase !== 'playing' || !roundStartTime) {
      if (lastRoundDuration > 0) {
        setElapsed(lastRoundDuration);
      }
      return;
    }

    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - roundStartTime) / 1000));
      setElapsed(diff);
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [roundStartTime, gamePhase, lastRoundDuration]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Cores dinâmicas para guiar o jogador nos bônus de velocidade
  let colorClasses = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
  let tierLabel = 'Ultra Rápido';

  if (elapsed > 60) {
    colorClasses = 'text-stone-400 border-stone-800 bg-stone-900/40';
    tierLabel = 'Tático';
  } else if (elapsed > 30) {
    colorClasses = 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    tierLabel = 'Constante';
  } else if (elapsed > 15) {
    colorClasses = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
    tierLabel = 'Ágil';
  }

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold transition-colors ${colorClasses} ${className}`}
        title={`Tempo na rodada: ${formatted} (${tierLabel})`}
      >
        <Clock className="w-2.5 h-2.5 shrink-0 animate-pulse" />
        <span>{formatted}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between px-2.5 py-1 rounded-lg border font-mono transition-all ${colorClasses} ${className}`}
      title={`Velocidade atual: ${tierLabel}`}
    >
      <div className="flex items-center gap-1.5">
        <Timer className="w-3.5 h-3.5 animate-spin-slow" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Clock
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-black tracking-widest">{formatted}</span>
        <span className="text-[9px] uppercase font-bold opacity-80">({tierLabel})</span>
      </div>
    </div>
  );
};
