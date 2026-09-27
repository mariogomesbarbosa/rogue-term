'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Rarity } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, ChevronRight, Sparkles } from 'lucide-react';

const RARITY_THEMES: Record<Rarity, { border: string; bg: string; badge: string; shadow: string }> = {
  common: {
    border: 'border-stone-600',
    bg: 'bg-[#181926]',
    badge: 'bg-stone-800 text-stone-300 border border-stone-600',
    shadow: '#000000'
  },
  uncommon: {
    border: 'border-cyan-500',
    bg: 'bg-[#111f2c]',
    badge: 'bg-cyan-950 text-cyan-300 border border-cyan-400',
    shadow: '#083344'
  },
  rare: {
    border: 'border-amber-500',
    bg: 'bg-[#261e12]',
    badge: 'bg-amber-950 text-amber-300 border border-amber-400',
    shadow: '#451a03'
  },
  legendary: {
    border: 'border-fuchsia-500',
    bg: 'bg-[#29142b]',
    badge: 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-400 animate-pulse',
    shadow: '#4a044e'
  }
};

export const DraftModal: React.FC = () => {
  const { gamePhase, draftChoices, chooseDraftCard, round } = useGameStore();

  if (gamePhase !== 'drafting' || draftChoices.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto font-pixel">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[92dvh] my-auto bg-[#12131e] border-4 border-black p-4 sm:p-6 shadow-[0_10px_0_#000] flex flex-col items-center gap-3 sm:gap-5 overflow-y-auto"
        >
          {/* Cabeçalho do Draft */}
          <div className="text-center flex flex-col items-center gap-1 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border-2 border-emerald-500 text-emerald-300 text-[10px] font-bold uppercase tracking-wider shadow-[0_2px_0_#000]">
              <Sparkles className="w-3.5 h-3.5" /> PALAVRA DECIFRADA!
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-amber-400 tracking-wider mt-1 drop-shadow-[0_2px_0_#000]">
              DRAFT DO ESCRIBA
            </h2>
            <p className="text-[10px] sm:text-xs text-stone-400 max-w-md">
              Escolha 1 carta para aprimorar sua máquina antes da Rodada {round + 1}.
            </p>
          </div>

          {/* As 3 Cartas Sorteadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
            {draftChoices.map(card => {
              const theme = RARITY_THEMES[card.rarity];
              const isActive = card.type === 'active';

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.1 }}
                  className={`border-3 border-black p-3.5 sm:p-4 flex flex-col justify-between gap-3 ${theme.bg} ${theme.border} relative shadow-[0_6px_0_${theme.shadow}]`}
                >
                  {/* Topo da Carta */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${theme.badge}`}>
                        {card.rarity}
                      </span>
                      <span className="text-[9px] text-stone-300 flex items-center gap-1 font-bold">
                        {isActive ? (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> ATIVA
                          </span>
                        ) : (
                          <span className="text-cyan-400 flex items-center gap-0.5">
                            <Shield className="w-3 h-3" /> PASSIVA
                          </span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wide">
                      {card.name}
                    </h3>
                    {card.tagline && (
                      <span className="text-[10px] text-amber-300 italic -mt-1">
                        &ldquo;{card.tagline}&rdquo;
                      </span>
                    )}
                  </div>

                  {/* Descrição do Efeito */}
                  <p className="text-[10px] text-stone-300 leading-relaxed bg-black/60 p-2.5 border-2 border-stone-800">
                    {card.description}
                  </p>

                  {/* Rodapé da Carta: Power & Botão Escolher */}
                  <div className="flex flex-col gap-2 pt-1 border-t-2 border-stone-800">
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>POWER:</span>
                      <span className="font-bold text-amber-400">+{card.powerScore}</span>
                    </div>

                    <button
                      onClick={() => chooseDraftCard(card)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 border-2 border-amber-300 shadow-[0_3px_0_#78350f] active:translate-y-0.5 transition-transform cursor-pointer"
                    >
                      <span>EQUIPAR CARTA</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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

