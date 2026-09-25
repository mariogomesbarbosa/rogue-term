'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { SkillCard, Rarity } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';

const RARITY_THEMES: Record<Rarity, { border: string; bg: string; badge: string; glow: string }> = {
  common: {
    border: 'border-stone-500',
    bg: 'from-stone-900 to-stone-950',
    badge: 'bg-stone-700 text-stone-200',
    glow: 'rgba(168,162,158,0.2)'
  },
  uncommon: {
    border: 'border-cyan-500',
    bg: 'from-cyan-950/60 to-stone-950',
    badge: 'bg-cyan-900 text-cyan-200 border border-cyan-400',
    glow: 'rgba(6,182,212,0.3)'
  },
  rare: {
    border: 'border-amber-500',
    bg: 'from-amber-950/60 to-stone-950',
    badge: 'bg-amber-900 text-amber-200 border border-amber-400',
    glow: 'rgba(245,158,11,0.35)'
  },
  legendary: {
    border: 'border-fuchsia-500',
    bg: 'from-fuchsia-950/70 to-stone-950',
    badge: 'bg-fuchsia-900 text-fuchsia-100 border border-fuchsia-300 animate-pulse',
    glow: 'rgba(217,70,239,0.45)'
  }
};

export const DraftModal: React.FC = () => {
  const { gamePhase, draftChoices, chooseDraftCard, round } = useGameStore();

  if (gamePhase !== 'drafting' || draftChoices.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl bg-stone-950/95 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col items-center gap-6 font-mono"
        >
          {/* Cabeçalho do Draft */}
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/60 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Palavra Decifrada!
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 tracking-wider">
              DRAFT DO ESCRIBA
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md">
              Escolha 1 carta para aprimorar sua máquina antes da Rodada {round + 1}.
            </p>
          </div>

          {/* As 3 Cartas Sorteadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {draftChoices.map((card, idx) => {
              const theme = RARITY_THEMES[card.rarity];
              const isActive = card.type === 'active';

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ boxShadow: `0 8px 30px ${theme.glow}` }}
                  className={`rounded-xl border-2 p-5 flex flex-col justify-between gap-4 bg-gradient-to-b ${theme.bg} ${theme.border} relative overflow-hidden group`}
                >
                  {/* Efeito Foil Holográfico em cartas raras */}
                  {card.rarity === 'legendary' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  )}

                  {/* Topo da Carta */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}>
                        {card.rarity}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 font-bold">
                        {isActive ? (
                          <>
                            <Zap className="w-3 h-3 text-amber-400" /> ATIVA
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 text-cyan-400" /> PASSIVA
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-100 tracking-wide mt-1">
                      {card.name}
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold italic">
                      "{card.tagline}"
                    </span>
                  </div>

                  {/* Descrição do Efeito */}
                  <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-lg border border-stone-800">
                    {card.description}
                  </p>

                  {/* Rodapé da Carta: Power & Botão Escolher */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Power Score:</span>
                      <span className="font-bold text-stone-200">{card.powerScore}</span>
                    </div>

                    <button
                      onClick={() => chooseDraftCard(card)}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Equipar Carta</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
