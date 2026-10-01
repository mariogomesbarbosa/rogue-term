'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  X,
  Zap,
  Shield,
  Coins,
  Cpu,
  Skull,
  Flame,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  MousePointerClick,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { KeycapIcon } from './KeycapIcon';

export const TutorialModal: React.FC = () => {
  const { isTutorialOpen, closeTutorial, hasSeenTutorial, setHasSeenTutorial } = useGameStore();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const totalSteps = 4;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (dontShowAgain) {
        setHasSeenTutorial(true);
      }
      closeTutorial();
    }
  }, [currentStep, totalSteps, dontShowAgain, setHasSeenTutorial, closeTutorial]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Teclado: Escape fecha, setas navegam, Enter avança
  useEffect(() => {
    if (!isTutorialOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTutorial();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Enter') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialOpen, handleNext, handlePrev, closeTutorial]);

  if (!isTutorialOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none font-mono text-stone-100 overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-stone-950 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col gap-4 my-auto relative overflow-hidden"
        >
          {/* Glows de ambiente */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 uppercase">
                    Manual do Operador
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  Protocolos táticos do terminal cibernético
                </span>
              </div>
            </div>

            <button
              onClick={closeTutorial}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-stone-600 transition-colors cursor-pointer"
              title="Fechar Manual"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Indicador de Passos */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: '1. Teclas [T]', icon: Zap },
              { label: '2. Cores & Grid', icon: Sparkles },
              { label: '3. Cartas & Loja', icon: Coins },
              { label: '4. Chefes', icon: Skull }
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isPassed = currentStep > idx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`py-1.5 px-2 rounded-lg border text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : isPassed
                      ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                      : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo Dinâmico do Slide */}
          <div className="min-h-[260px] sm:min-h-[280px] flex flex-col justify-center bg-stone-900/40 rounded-xl p-3 sm:p-5 border border-stone-800/80">
            {/* ETAPA 1: O FÔLEGO DAS TECLAS [T] */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex items-center gap-3">
                  <KeycapIcon size="lg" label="T" glow />
                  <div className="flex flex-col">
                    <h3 className="text-base font-black text-amber-400 uppercase tracking-wide">
                      Suas Teclas [T] São o Seu Fôlego Vital
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Diferente de jogos diários de palavras, no <span className="text-amber-300 font-bold">Rogue Term</span> seus palpites não são gratuitos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-stone-800 flex flex-col gap-1">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Consumo por Tentativa
                    </span>
                    <p className="text-[11px] text-stone-400 leading-snug">
                      Cada palavra enviada consome <strong className="text-stone-200">1 Tecla [T]</strong> (ou mais durante sobrecargas de Chefes). Se chegar a <strong className="text-rose-400">0</strong>, o hardware queima e é Fim de Jogo!
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-stone-800 flex flex-col gap-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Restauração por Acerto
                    </span>
                    <p className="text-[11px] text-stone-400 leading-snug">
                      Resolver no 1º palpite restaura <strong className="text-emerald-300">+6 Teclas</strong>, no 2º restaura <strong className="text-emerald-300">+5</strong>, no 3º <strong className="text-emerald-300">+4</strong> e no 4º <strong className="text-emerald-300">+3</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Estratégia:</strong> Economize teclas jogando de forma precisa. Na Loja, você poderá comprar Kits de Lubrificante e expansões de chassi.
                  </span>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: FEEDBACK DE CORES & CURSOR */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-3.5"
              >
                <div>
                  <h3 className="text-base font-black text-amber-400 uppercase tracking-wide">
                    Leitura de Sinais & Navegação Tátil
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed mt-0.5">
                    O terminal fornece telemetria instantânea através de cores ao enviar cada palpite:
                  </p>
                </div>

                {/* Exemplo visual de 5 letras */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 border border-emerald-400 text-stone-950 font-black text-lg flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    T
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500 border border-amber-300 text-stone-950 font-black text-lg flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                    E
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 font-black text-lg flex items-center justify-center">
                    R
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 font-black text-lg flex items-center justify-center">
                    M
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 font-black text-lg flex items-center justify-center">
                    O
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 flex flex-col">
                    <span className="font-bold text-emerald-400 uppercase text-[10px]">Verde (Correto)</span>
                    <span className="text-[11px] text-stone-300">Letra correta na posição exata.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/40 flex flex-col">
                    <span className="font-bold text-amber-400 uppercase text-[10px]">Amarelo (Presente)</span>
                    <span className="text-[11px] text-stone-300">Existe na palavra, mas em outra coluna.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 flex flex-col">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">Cinza (Ausente)</span>
                    <span className="text-[11px] text-stone-400">Não pertence à palavra secreta.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200">
                  <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Cursor Livre:</strong> Clique em qualquer quadrante da linha ativa para editar uma letra específica sem precisar apagar as anteriores! Acentos são automáticos (ex: digite <code className="text-white bg-black/40 px-1 rounded">MACAO</code> para <code className="text-white bg-black/40 px-1 rounded">MAÇÃ</code>).
                  </span>
                </div>
              </motion.div>
            )}

            {/* ETAPA 3: DECKBUILDING & LOJA ESTILO BALATRO */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-3"
              >
                <div>
                  <h3 className="text-base font-black text-amber-400 uppercase tracking-wide">
                    Hacks de Teclado & Modificadores de Hardware
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed mt-0.5">
                    Construa um baralho poderoso de habilidades ativas e relíquias passivas:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Cartas Ativas */}
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" /> Cartas Ativas (Hacks)
                      </span>
                      <span className="text-[9px] bg-cyan-900/60 px-1 rounded text-cyan-200">Max 3</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-snug">
                      Hacks pontuais acionados durante a rodada. Ex: <strong className="text-stone-100">Ctrl+Z</strong> (troca uma letra do passado), <strong className="text-stone-100">Sonda</strong> (escaneia 3 letras grátis) ou <strong className="text-stone-100">Lente Térmica</strong> (aponta direção de amarelas).
                    </p>
                  </div>

                  {/* Relíquias Passivas */}
                  <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/40 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-300 uppercase tracking-wide flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-purple-400" /> Relíquias Passivas
                      </span>
                      <span className="text-[9px] bg-purple-900/60 px-1 rounded text-purple-200">Max 5</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-snug">
                      Switches e peças mecânicas que concedem bônus constantes. Ex: <strong className="text-stone-100">Switch Dourado</strong> (dobra créditos de letras raras), <strong className="text-stone-100">Compilador</strong> (descontos na loja) e <strong className="text-stone-100">Pasta Térmica</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>O Mercado do Setor:</strong> Entre fases, gaste seus créditos em novas cartas, kits de manutenção de teclas e rerolls de prateleira.
                  </span>
                </div>
              </motion.div>
            )}

            {/* ETAPA 4: CHEFES & ANOMALIAS */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-950 border border-rose-500 text-rose-400 animate-pulse">
                    <Skull className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-400 uppercase tracking-wide">
                      Palavras-Chefe & Anomalias de Hardware
                    </h3>
                    <p className="text-xs text-stone-300 leading-snug">
                      Na 3ª Fase de cada Setor, o Mainframe ativa uma anomalia severa de proteção:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-black/40 border border-stone-800">
                    <strong className="text-rose-400 block mb-0.5">⚡ Sobrecarga (OVERVOLT)</strong>
                    <span className="text-stone-400">Cada palpite incorreto consome 2 Teclas [T] em vez de 1.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-stone-800">
                    <strong className="text-amber-400 block mb-0.5">🔒 Protocolo Estrito (HARD-CORE)</strong>
                    <span className="text-stone-400">Letras cinzas descartadas são bloqueadas; acertos devem ser mantidos.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-stone-800">
                    <strong className="text-cyan-400 block mb-0.5">🛡️ Firewall (FIREWALL.SYS)</strong>
                    <span className="text-stone-400">Todas as habilidades ativas ficam inoperantes no combate.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-stone-800">
                    <strong className="text-purple-400 block mb-0.5">👻 Ghosting (PHANTOM)</strong>
                    <span className="text-stone-400">Letras amarelas são ocultadas; você só descobre se for verde ou ausente.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Recompensa de Chefe:</strong> Vencer concede bônus massivo de pontos, créditos extras e +3 Teclas [T] imediatas para o próximo Setor!
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Rodapé: Navegação e Checkbox de Lembrança */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-800">
            <label className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Não exibir automaticamente ao iniciar</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex-1 sm:flex-initial py-2 px-3 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-initial py-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95"
              >
                <span>{currentStep === totalSteps - 1 ? 'Iniciar Operação' : 'Próximo'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
