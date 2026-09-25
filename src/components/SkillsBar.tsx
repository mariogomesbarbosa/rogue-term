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
  RotateCcw: <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Cpu: <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Delete: <Delete className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  ArrowLeftRight: <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Compass: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Shield: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Coins: <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Zap: <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Activity: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  Layers: <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
};

const RARITY_STYLES: Record<Rarity, { border: string; badge: string; text: string; glow: string }> = {
  common: {
    border: 'border-stone-600/80',
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

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-2 flex flex-col gap-1 select-none font-mono shrink-0">
      {/* Linha horizontal com cards estilo Jokers do Balatro */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 justify-start sm:justify-center">
        {/* Cards Ativos */}
        {activeSkills.map(skill => {
          const style = RARITY_STYLES[skill.rarity];
          const hasCharges = skill.chargesCurrent > 0;
          const isSelected = targetingState?.skillId === skill.id;

          return (
            <motion.div
              key={skill.id}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => hasCharges && handleCardClick(skill)}
              style={{
                boxShadow: isSelected
                  ? '0 0 15px rgba(245,158,11,0.5)'
                  : `0 2px 8px ${style.glow}`
              }}
              className={`relative cursor-pointer rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 border-2 flex flex-col justify-between transition-all shrink-0 min-w-[105px] sm:min-w-[130px] md:min-w-[140px] ${
                style.border
              } ${
                isSelected
                  ? 'bg-amber-950/90 ring-2 ring-amber-400'
                  : hasCharges
                  ? 'bg-stone-900/95 hover:bg-stone-850'
                  : 'bg-stone-950/60 opacity-50 grayscale cursor-not-allowed'
              }`}
              title={skill.description}
            >
              {/* Topo do Card */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 text-stone-200 truncate">
                  {ICON_MAP[skill.iconName] || <Sparkles className="w-3 h-3" />}
                  <span className="text-[11px] sm:text-xs font-black truncate">
                    {skill.name.split(' ')[0]}
                  </span>
                </div>

                <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 border border-stone-700 font-bold shrink-0">
                  {hasCharges ? (
                    <span className="text-amber-400">⚡{skill.chargesCurrent}</span>
                  ) : (
                    <span className="text-stone-500">0</span>
                  )}
                </span>
              </div>

              {/* Rodapé do Card com Raridade e Power */}
              <div className="flex items-center justify-between text-[8px] text-stone-400 mt-0.5">
                <span className={`uppercase font-extrabold px-1 rounded ${style.badge}`}>
                  {skill.rarity}
                </span>
                <span className="text-[7.5px] text-stone-500">P{skill.powerScore}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Cards Passivos (Switches de Hardware) */}
        {passives.map(passive => {
          const style = RARITY_STYLES[passive.rarity];
          return (
            <div
              key={passive.id}
              className={`rounded-lg px-2 py-1 border flex items-center gap-1.5 bg-stone-950/80 shrink-0 ${style.border}`}
              title={passive.description}
            >
              <div className="text-stone-300">{ICON_MAP[passive.iconName] || <Shield className="w-3 h-3" />}</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-200 truncate max-w-[80px]">
                  {passive.name.split(' ')[0]}
                </span>
                <span className="text-[7px] text-cyan-400 uppercase font-semibold">PASSIVA</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
