'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { SkillCard, Rarity } from '@/types/game';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Cpu,
  Delete,
  ArrowLeftRight,
  Sparkles,
  Compass,
  Shield,
  Coins,
  Zap,
  Activity,
  Layers,
  ZapOff
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  RotateCcw: <RotateCcw className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Delete: <Delete className="w-4 h-4" />,
  ArrowLeftRight: <ArrowLeftRight className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Coins: <Coins className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />
};

const RARITY_STYLES: Record<Rarity, { border: string; badge: string; text: string; glow: string }> = {
  common: {
    border: 'border-stone-500/80',
    badge: 'bg-stone-700 text-stone-200',
    text: 'text-stone-300',
    glow: 'rgba(168,162,158,0.15)'
  },
  uncommon: {
    border: 'border-cyan-500/80',
    badge: 'bg-cyan-900 text-cyan-200',
    text: 'text-cyan-300',
    glow: 'rgba(6,182,212,0.25)'
  },
  rare: {
    border: 'border-amber-500/80',
    badge: 'bg-amber-900 text-amber-200',
    text: 'text-amber-300',
    glow: 'rgba(245,158,11,0.3)'
  },
  legendary: {
    border: 'border-fuchsia-500/90',
    badge: 'bg-fuchsia-950 text-fuchsia-200',
    text: 'text-fuchsia-300',
    glow: 'rgba(217,70,239,0.4)'
  }
};

export const SkillsBar: React.FC = () => {
  const { activeSkills, passives, activateSkill, targetingState, gamePhase } = useGameStore();

  const handleCardClick = (card: SkillCard) => {
    if (gamePhase !== 'playing') return;
    activateSkill(card.id);
  };

  const isAnyTargeting = !!targetingState;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 my-2 flex flex-col gap-2">
      {/* Atalhos Ativos */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1.5">
          <span>Cartas de Atalho (Ativas)</span>
          <span className="text-[10px] text-amber-400 font-normal">({activeSkills.length}/4)</span>
        </span>
        {passives.length > 0 && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1">
            <span>Switches Passivos:</span>
            <span className="text-cyan-400">{passives.length}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {activeSkills.map(skill => {
          const style = RARITY_STYLES[skill.rarity];
          const hasCharges = skill.chargesCurrent > 0;
          const isSelected = targetingState?.skillId === skill.id;

          return (
            <motion.div
              key={skill.id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => hasCharges && handleCardClick(skill)}
              style={{
                boxShadow: isSelected
                  ? '0 0 20px rgba(245,158,11,0.5)'
                  : `0 4px 12px ${style.glow}`
              }}
              className={`relative cursor-pointer rounded-lg p-2.5 sm:p-3 border-2 flex flex-col gap-1 transition-all min-w-[140px] sm:min-w-[170px] max-w-[200px] select-none font-mono ${
                style.border
              } ${
                isSelected
                  ? 'bg-amber-950/80 ring-2 ring-amber-400'
                  : hasCharges
                  ? 'bg-stone-900/90 hover:bg-stone-850'
                  : 'bg-stone-950/60 opacity-50 grayscale cursor-not-allowed'
              }`}
              title={skill.description}
            >
              {/* Topo do Card: Ícone & Cargas */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-stone-200">
                  {ICON_MAP[skill.iconName] || <Sparkles className="w-4 h-4" />}
                  <span className="text-xs font-black truncate">{skill.name.split(' ')[0]}</span>
                </div>

                {/* Badge de Cargas */}
                <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-bold">
                  {hasCharges ? (
                    <span className="text-amber-400">⚡{skill.chargesCurrent}</span>
                  ) : (
                    <span className="text-stone-500 flex items-center gap-0.5">
                      <ZapOff className="w-2.5 h-2.5" /> 0
                    </span>
                  )}
                </div>
              </div>

              {/* Tagline / Resumo */}
              <p className="text-[10px] text-stone-400 line-clamp-1">{skill.tagline}</p>

              {/* Selo de Raridade */}
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-800/60">
                <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1 rounded ${style.badge}`}>
                  {skill.rarity}
                </span>
                <span className="text-[9px] text-stone-500">Power {skill.powerScore}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Exibição dos Switches Passivos (se houver) */}
        {passives.map(passive => {
          const style = RARITY_STYLES[passive.rarity];
          return (
            <div
              key={passive.id}
              className={`rounded-lg p-2 border flex items-center gap-2 bg-stone-950/80 ${style.border}`}
              title={passive.description}
            >
              <div className="text-stone-300">{ICON_MAP[passive.iconName] || <Shield className="w-3.5 h-3.5" />}</div>
              <div className="flex flex-col font-mono">
                <span className="text-[10px] font-bold text-stone-200">{passive.name}</span>
                <span className="text-[8px] text-cyan-400">PASSIVA</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
