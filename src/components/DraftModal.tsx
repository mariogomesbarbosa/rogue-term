'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Rarity } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, ChevronRight, Cpu } from 'lucide-react';

const RARITY_THEMES: Record<Rarity, { border: string; bg: string; badge: string; glow: string; trackColor: string }> = {
  common: {
    border: 'border-stone-600',
    bg: 'from-stone-900 via-[#18181b] to-stone-950',
    badge: 'bg-stone-800 text-stone-300 border border-stone-600',
    glow: 'rgba(168,162,158,0.2)',
    trackColor: 'border-stone-700/60'
  },
  uncommon: {
    border: 'border-cyan-500/80',
    bg: 'from-cyan-950/40 via-[#141d24] to-stone-950',
    badge: 'bg-cyan-950 text-cyan-300 border border-cyan-500/60',
    glow: 'rgba(6,182,212,0.3)',
    trackColor: 'border-cyan-800/60'
  },
  rare: {
    border: 'border-amber-500/80',
    bg: 'from-amber-950/40 via-[#221c13] to-stone-950',
    badge: 'bg-amber-950 text-amber-300 border border-amber-500/60',
    glow: 'rgba(245,158,11,0.35)',
    trackColor: 'border-amber-800/60'
  },
  legendary: {
    border: 'border-fuchsia-500/90',
    bg: 'from-fuchsia-950/50 via-[#261226] to-stone-950',
    badge: 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-400 animate-pulse',
    glow: 'rgba(217,70,239,0.45)',
    trackColor: 'border-fuchsia-800/60'
  }
};

export const DraftModal: React.FC = () => {
  const { gamePhase, draftChoices, chooseDraftCard, round } = useGameStore();

  if (gamePhase !== 'drafting' || draftChoices.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-4xl max-h-[94dvh] my-auto bg-[#0d0e12] border-2 border-amber-500/70 rounded-xl p-3.5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col items-center gap-3 sm:gap-5 font-mono overflow-y-auto relative"
        >
          {/* Parafusos industriais nos 4 cantos da carcaça */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold">
            +
          </div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold">
            +
          </div>
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold">
            +
          </div>
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-[6px] text-stone-400 font-bold">
            +
          </div>

          {/* Cabeçalho do Draft - Estilo Mainframe Boot Routine */}
          <div className="text-center flex flex-col items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-500/60 bg-emerald-950/40 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              &gt; PALAVRA_DECIFRADA // ACESSO_CONCEDIDO
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-amber-400 tracking-wider flex items-center gap-2">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              <span>UPGRADE DE HARDWARE: SLOT {round + 1}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-400 max-w-lg">
              Selecione 1 módulo de expansão para soldar ao barramento antes da próxima execução.
            </p>
          </div>

          {/* Os 3 Cartões de Expansão (PCBs / Cartuchos) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
            {draftChoices.map((card, idx) => {
              const theme = RARITY_THEMES[card.rarity];
              const isActive = card.type === 'active';

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{ boxShadow: `0 8px 24px ${theme.glow}` }}
                  className={`rounded-lg border-2 p-3 sm:p-4 flex flex-col justify-between gap-3 bg-gradient-to-b ${theme.bg} ${theme.border} relative overflow-hidden group shadow-md`}
                >
                  {/* Linhas de trilha de circuito gravadas na placa */}
                  <div className={`absolute top-0 right-0 w-16 h-16 border-b border-l ${theme.trackColor} pointer-events-none opacity-40`} />

                  {/* Topo da Carta: Metadados de Silício */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between text-[8px] text-stone-400 uppercase tracking-widest font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive
                              ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse'
                              : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                          }`}
                        />
                        {isActive ? 'CART-ROM (ATIVA)' : 'IC-CHIP (PASSIVA)'}
                      </span>
                      <span>SLOT-0{idx + 1}</span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
                        {card.rarity}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 font-bold">
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

                    <h3 className="text-sm sm:text-base font-black text-stone-100 tracking-wide mt-0.5 group-hover:text-amber-300 transition-colors">
                      {card.name}
                    </h3>
                    {card.tagline && (
                      <span className="text-[11px] text-amber-400/90 font-medium italic -mt-1">
                        &ldquo;{card.tagline}&rdquo;
                      </span>
                    )}
                  </div>

                  {/* Descrição do Módulo */}
                  <div className="relative z-10 bg-black/60 p-2.5 rounded border border-stone-800/80">
                    <p className="text-xs text-stone-300 leading-relaxed font-sans sm:font-mono">
                      {card.description}
                    </p>
                  </div>

                  {/* Rodapé da Carta: Power & Botão Instalar */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-800/70 pt-1.5">
                      <span>POTÊNCIA DO CHIP:</span>
                      <span className="font-bold text-amber-300">+{card.powerScore} PWR</span>
                    </div>

                    <button
                      onClick={() => chooseDraftCard(card)}
                      className="w-full py-2 sm:py-2.5 rounded bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all cursor-pointer"
                    >
                      <span>INSTALAR MÓDULO</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Conector ISA Dourado na borda inferior da placa */}
                  <div className="flex justify-center gap-1 pt-1.5 border-t border-stone-800/90 overflow-hidden shrink-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-amber-400/90 rounded-t-xs shadow-[0_0_4px_rgba(245,158,11,0.5)] group-hover:bg-amber-300 transition-colors"
                      />
                    ))}
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

