'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle, Lock, Ghost, Tv, Zap, Cpu } from 'lucide-react';

export const BossAlertBanner: React.FC = () => {
  const { currentBoss, stage, sector } = useGameStore();

  if (stage !== 3 || !currentBoss) return null;

  const renderBossIcon = () => {
    switch (currentBoss.anomaly.id) {
      case 'key_jam':
        return <Lock className="w-5 h-5 text-rose-400 animate-pulse" />;
      case 'switch_ghosting':
        return <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'glitched_crt':
        return <Tv className="w-5 h-5 text-fuchsia-400 animate-pulse" />;
      case 'power_surge':
        return <Zap className="w-5 h-5 text-amber-400 animate-pulse" />;
      default:
        return <Skull className="w-5 h-5 text-rose-400 animate-pulse" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12 }}
        className="w-full max-w-lg mb-2 mx-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 via-stone-950/90 to-rose-950/80 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] backdrop-blur-md font-mono select-none relative overflow-hidden"
      >
        {/* Linha scanline de perigo animada */}
        <div className="absolute inset-0 bg-rose-500/[0.04] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 rounded-lg bg-rose-950 border border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] shrink-0">
            {renderBossIcon()}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 animate-pulse flex items-center gap-1">
                <Skull className="w-3 h-3" />
                PALAVRA-CHEFE // SETOR {sector}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 border border-rose-700/80 text-rose-200 font-bold">
                {currentBoss.name}
              </span>
            </div>

            <p className="text-xs font-bold text-rose-200 mt-0.5 truncate sm:whitespace-normal">
              {currentBoss.anomaly.description}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
