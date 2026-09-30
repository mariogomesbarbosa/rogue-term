'use client';

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import {
  Trophy,
  Timer,
  Zap,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  Skull
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KeycapIcon } from './KeycapIcon';

export const RoundVictoryModal: React.FC = () => {
  const {
    gamePhase,
    targetWord,
    score,
    streak,
    keys,
    maxKeys,
    sector,
    stage,
    maxSectors,
    endlessMode,
    currentBoss,
    lastRoundDuration,
    lastRoundScoreDetails,
    lastRoundEarnings,
    proceedFromRoundWin
  } = useGameStore();

  const isBossFight = stage === 3 && !!currentBoss;
  const isFinalVictory = isBossFight && sector >= maxSectors && !endlessMode;

  useEffect(() => {
    if (gamePhase === 'round_won') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // No-op
      }
    }
  }, [gamePhase]);

  // Atalhos de teclado: pressionar Enter ou Espaço para avançar direto
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gamePhase !== 'round_won') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        proceedFromRoundWin();
      }
    },
    [gamePhase, proceedFromRoundWin]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (gamePhase !== 'round_won') return null;

  const duration = lastRoundDuration || 1;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const speedTier = lastRoundScoreDetails?.speedTier || 'tactical';
  const speedLabel = lastRoundScoreDetails?.speedLabel || 'Tático (>60s)';

  const speedBadgeThemes = {
    ultra: {
      badge: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      icon: <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />,
      title: 'Velocidade Ultra Rápida!',
      desc: 'Tempo incrível! Bônus máximo de tempo (+1.200 pts) e +0.5x no multiplicador!'
    },
    fast: {
      badge: 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      icon: <Clock className="w-4 h-4 text-cyan-400" />,
      title: 'Resolução Ágil!',
      desc: 'Excelente ritmo! Bônus de tempo (+700 pts) e +0.25x no multiplicador!'
    },
    steady: {
      badge: 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      icon: <Timer className="w-4 h-4 text-amber-400" />,
      title: 'Ritmo Constante!',
      desc: 'Bom tempo de análise! Bônus de tempo (+350 pts) e +0.1x no multiplicador!'
    },
    tactical: {
      badge: 'bg-stone-900 border-stone-700 text-stone-300',
      icon: <Clock className="w-4 h-4 text-stone-400" />,
      title: 'Abordagem Tática!',
      desc: 'Resolução metódica e precisa (+100 pts de tempo).'
    }
  };

  const currentTheme = speedBadgeThemes[speedTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md select-none font-mono text-stone-100 overflow-y-auto no-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="w-full max-w-lg bg-stone-950 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col gap-4 my-auto relative overflow-hidden"
      >
        {/* Glow de fundo */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                isBossFight
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
              }`}
            >
              {isBossFight ? (
                <>
                  <Skull className="w-3 h-3 text-rose-400" />
                  <span>CHEFE DERROTADO</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>FASE CONCLUÍDA</span>
                </>
              )}
            </span>

            <span className="text-[10px] text-stone-400 font-bold">
              Setor {sector} • Fase {stage}/3
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400">
            {isBossFight ? 'MAINFRAME DERROTADO!' : 'PALAVRA DECIFRADA!'}
          </h2>
        </div>

        {/* Revelação Estilizada da Palavra Secreta em Keycaps 3D */}
        <div className="flex flex-col items-center gap-1.5 bg-stone-900/60 border border-stone-800/90 p-3 sm:p-4 rounded-xl">
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">
            A Palavra Secreta era:
          </span>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-1">
            {targetWord.split('').map((char, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, y: -20, rotate: -8 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                transition={{
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 400,
                  damping: 20
                }}
                className="w-11 h-13 sm:w-13 sm:h-15 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 p-[2px] shadow-[0_5px_0_0_#064e3b,0_8px_16px_rgba(0,0,0,0.6)] border border-emerald-300/60 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-[9px] bg-gradient-to-b from-emerald-500 to-emerald-700 flex items-center justify-center border-t border-emerald-200/50 shadow-inner">
                  <span className="font-mono font-black text-stone-950 text-xl sm:text-2xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    {char}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Destaque do Cronômetro & Fator Tempo */}
        <div className={`p-3 rounded-xl border flex flex-col gap-2 ${currentTheme.badge}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentTheme.icon}
              <span className="text-xs font-black uppercase tracking-wider">
                {currentTheme.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              <Timer className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-sm font-black text-stone-100">{formattedTime}</span>
              <span className="text-[10px] text-stone-400">({duration}s)</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-300 leading-snug">
            {currentTheme.desc}
          </p>

          {/* Avisos de Habilidades de Tempo ativadas */}
          {lastRoundScoreDetails?.timeSkillNotes && lastRoundScoreDetails.timeSkillNotes.length > 0 && (
            <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
              {lastRoundScoreDetails.timeSkillNotes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhamento Completo da Pontuação */}
        <div className="bg-stone-900/70 border border-stone-800 p-3 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Cálculo de Pontuação
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
              <Flame className="w-3.5 h-3.5" />
              <span>Multiplicador: {lastRoundScoreDetails?.multiplier.toFixed(2)}x</span>
            </div>
          </div>

          {/* Grid de Bônus Somados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="flex flex-col bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Base</span>
              <span className="font-bold text-stone-200">
                +{lastRoundScoreDetails?.basePoints.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex flex-col bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Palpite</span>
              <span className="font-bold text-stone-200">
                +{lastRoundScoreDetails?.guessBonus.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex flex-col bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Tempo</span>
              <span className="font-bold text-emerald-400">
                +{lastRoundScoreDetails?.timeBonus.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex flex-col bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-[9px] text-stone-500 uppercase font-bold">
                {isBossFight ? 'Chefe' : 'Fase'}
              </span>
              <span className="font-bold text-amber-400">
                +{lastRoundScoreDetails?.bossBonus ? lastRoundScoreDetails.bossBonus.toLocaleString('pt-BR') : '0'}
              </span>
            </div>
          </div>

          {/* Total da Rodada */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
            <span className="text-xs font-bold text-stone-300">
              Pontos Ganhos na Rodada:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                +{lastRoundScoreDetails?.totalRoundPoints.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-stone-500 font-bold uppercase">pts</span>
            </div>
          </div>
        </div>

        {/* Resumo de Recompensas de Hardware & Economia */}
        <div className="grid grid-cols-2 gap-2">
          {/* Teclas Recuperadas */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
            <KeycapIcon size="sm" label="T" glow />
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Fôlego Restaurado</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-stone-100">{keys}</span>
                <span className="text-[10px] text-stone-500">/{maxKeys} Teclas</span>
              </div>
            </div>
          </div>

          {/* Créditos Ganhos */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Créditos Ganhos</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-amber-400">
                  +${lastRoundEarnings?.total ?? 0}
                </span>
                <span className="text-[10px] text-stone-500 font-bold">Moedas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Avançar */}
        <button
          onClick={proceedFromRoundWin}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-sm tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] mt-1"
        >
          <span>
            {isFinalVictory
              ? 'Ver Conclusão da Run [🏆]'
              : isBossFight
              ? 'Ir para a Loja do Chefe [➜]'
              : 'Avançar para a Loja [➜]'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-950/20 font-bold opacity-80 hidden sm:inline-block">
            Enter ↵
          </span>
        </button>
      </motion.div>
    </div>
  );
};
