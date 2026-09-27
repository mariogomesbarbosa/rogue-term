'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SkillCard, Rarity } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
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
  X
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
  const [selectedPassive, setSelectedPassive] = useState<SkillCard | null>(null);

  const handleCardClick = (card: SkillCard) => {
    if (gamePhase !== 'playing') return;
    activateSkill(card.id);
  };

  if (activeSkills.length === 0 && passives.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-2 flex flex-col gap-1 select-none font-pixel shrink-0">
      {/* Linha 1: Habilidades Utilizáveis (Ativas) - Estilo Slots de Inventário 16-bits */}
      {activeSkills.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 justify-start sm:justify-center">
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
                className={`relative cursor-pointer px-2 py-1 sm:px-2.5 sm:py-1.5 border-2 border-black flex flex-col justify-between transition-all shrink-0 min-w-[105px] sm:min-w-[130px] md:min-w-[140px] shadow-[0_3px_0_#000] ${
                  isSelected
                    ? 'bg-amber-900 border-amber-300 ring-2 ring-amber-400'
                    : hasCharges
                    ? 'bg-[#1a1b29] hover:bg-[#25263a]'
                    : 'bg-[#101016] opacity-50 grayscale cursor-not-allowed'
                }`}
                title={skill.description}
              >
                {/* Topo do Card */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 text-stone-200 truncate">
                    {ICON_MAP[skill.iconName] || <Sparkles className="w-3 h-3" />}
                    <span className="text-[10px] sm:text-xs font-bold truncate">
                      {skill.name.split(' ')[0]}
                    </span>
                  </div>

                  <span className="text-[8px] px-1 py-0.2 bg-black border border-stone-700 font-bold shrink-0">
                    {hasCharges ? (
                      <span className="text-amber-400">⚡{skill.chargesCurrent}</span>
                    ) : (
                      <span className="text-stone-500">0</span>
                    )}
                  </span>
                </div>

                {/* Rodapé do Card com Raridade e Power */}
                <div className="flex items-center justify-between text-[7px] text-stone-400 mt-1 pt-0.5 border-t border-stone-800">
                  <span className={`uppercase font-bold px-1 ${style.badge}`}>
                    {skill.rarity}
                  </span>
                  <span className="text-[7.5px] text-stone-400">PWR {skill.powerScore}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Linha 2: Habilidades Passivas (Estilo Artefatos / Relíquias 16-bits) */}
      {passives.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 justify-start sm:justify-center">
          {passives.map(passive => {
            const style = RARITY_STYLES[passive.rarity];
            return (
              <motion.button
                key={passive.id}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPassive(passive)}
                className={`px-2 py-0.5 sm:py-1 border-2 border-black flex items-center gap-1.5 bg-[#12131e] shrink-0 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 ${style.border}`}
                title={passive.description}
                type="button"
                aria-label={`Ver detalhes da passiva ${passive.name}`}
              >
                <div className="text-cyan-400">{ICON_MAP[passive.iconName] || <Shield className="w-3 h-3" />}</div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-stone-200 truncate max-w-[80px] sm:max-w-[120px]">
                    {passive.name.split(' ')[0]}
                  </span>
                  <span className="text-[7px] text-cyan-400 uppercase font-bold">PASSIVA</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Modal / Caixa de Diálogo de Descrição de Item Passivo (Estilo RPG 16-bits) */}
      <AnimatePresence>
        {selectedPassive && (
          <div
            onClick={() => setSelectedPassive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none font-pixel"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="max-w-xs w-full bg-[#161726] border-4 border-black p-4 shadow-[0_8px_0_#000] flex flex-col gap-2.5 font-pixel"
            >
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="text-amber-400">
                    {ICON_MAP[selectedPassive.iconName] || <Shield className="w-4 h-4" />}
                  </div>
                  <span className="font-bold text-xs text-stone-100 uppercase">
                    {selectedPassive.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPassive(null)}
                  className="p-1 bg-stone-900 border border-stone-700 text-stone-400 hover:text-stone-200 cursor-pointer"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[9px]">
                <span className={`uppercase font-bold px-1.5 py-0.5 ${RARITY_STYLES[selectedPassive.rarity].badge}`}>
                  {selectedPassive.rarity}
                </span>
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[8px]">
                  HABILIDADE PASSIVA
                </span>
              </div>

              {selectedPassive.tagline && (
                <p className="text-[10px] text-amber-300 italic">
                  &ldquo;{selectedPassive.tagline}&rdquo;
                </p>
              )}

              <p className="text-[10px] text-stone-300 leading-relaxed bg-black/60 p-3 border-2 border-stone-800">
                {selectedPassive.description}
              </p>

              <button
                onClick={() => setSelectedPassive(null)}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] uppercase border-2 border-amber-300 shadow-[0_3px_0_#78350f] active:translate-y-0.5 cursor-pointer mt-1"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
