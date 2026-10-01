'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getDailySeed, formatDailyDate } from '@/utils/rng';
import { sound } from '@/utils/sound';
import {
  Calendar,
  Sparkles,
  Flame,
  Trophy,
  Copy,
  Check,
  Play,
  RotateCcw,
  Hash,
  X,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';

export const DailyRunModal: React.FC = () => {
  const {
    isDailyModalOpen,
    closeDailyModal,
    runMode,
    seed,
    careerStats,
    startDailyRun,
    startCustomSeedRun,
    startNewRun,
    setNotification
  } = useGameStore();

  const [customInput, setCustomInput] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);

  const todaySeed = getDailySeed();
  const formattedToday = formatDailyDate(todaySeed);
  const isCompletedToday = careerStats?.lastDailyDate === todaySeed;

  // Fechar com a tecla ESC
  useEffect(() => {
    if (!isDailyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDailyModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDailyModalOpen, closeDailyModal]);

  if (!isDailyModalOpen) return null;

  const handleCopyCurrentSeed = () => {
    sound.playKeyThock('C');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(seed).then(() => {
        setCopiedSeed(true);
        setTimeout(() => setCopiedSeed(false), 2000);
      });
    }
  };

  const handleStartDaily = () => {
    sound.playVictoryFanfare();
    startDailyRun();
    closeDailyModal();
  };

  const handleStartFree = () => {
    sound.playKeyThock('Enter');
    startNewRun();
    closeDailyModal();
  };

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    sound.playVictoryFanfare();
    startCustomSeedRun(customInput.trim().toUpperCase());
    closeDailyModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-mono select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-stone-800 bg-stone-950/95 text-stone-200 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Topo / Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider text-amber-400 uppercase">
                Protocolos de Operação
              </h2>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                Desafio Diário & Sementes Determinísticas
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playKeyThock('Escape');
              closeDailyModal();
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Card 1: Desafio Diário (Destaque Principal) */}
          <div className="relative rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-stone-900/80 to-stone-950 p-4.5 shadow-[0_0_20px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                  Desafio Diário
                </span>
                <span className="text-stone-400 font-bold text-[11px]">#{formattedToday}</span>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  isCompletedToday
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                }`}
              >
                {isCompletedToday ? '✓ Concluído Hoje' : '● Disponível'}
              </span>
            </div>

            <p className="text-stone-300 leading-relaxed text-[11px] mb-3">
              Todos os operadores no mundo enfrentam rigorosamente o mesmo vocabulário secreto, a mesma sequência de
              chefes e as mesmas ofertas na prateleira da loja.
            </p>

            {/* Métricas do Diário */}
            <div className="grid grid-cols-3 gap-2 p-2.5 mb-3 rounded-lg bg-stone-950/80 border border-stone-800/80">
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mb-0.5">
                  <Flame className="w-3 h-3" />
                  <span>Sequência</span>
                </div>
                <span className="text-sm font-black text-amber-300">
                  {careerStats?.dailyCurrentStreak || 0}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 text-center border-x border-stone-800">
                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mb-0.5">
                  <Trophy className="w-3 h-3" />
                  <span>Recorde</span>
                </div>
                <span className="text-sm font-black text-stone-200">
                  {careerStats?.dailyMaxStreak || 0}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Melhor Pontos</span>
                </div>
                <span className="text-sm font-black text-stone-200">
                  {(careerStats?.dailyHighScore || 0).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartDaily}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                isCompletedToday
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isCompletedToday ? 'Jogar Novamente (Treino)' : 'Iniciar Desafio Diário'}
              </span>
            </button>
          </div>

          {/* Card 2: Modo Livre / Carreira Tradicional */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 hover:border-stone-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-stone-200 text-xs uppercase tracking-wide">
                  Carreira Roguelike (Modo Livre)
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">Sem Limites</span>
            </div>
            <p className="text-stone-400 text-[11px] mb-3 leading-relaxed">
              Jogue partidas ilimitadas com sementes dinâmicas geradas aleatoriamente. Vença os 8 Setores para liberar
              o Modo Infinito.
            </p>
            <button
              onClick={handleStartFree}
              className="w-full py-2 px-3 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Iniciar Nova Carreira Livre</span>
            </button>
          </div>

          {/* Card 3: Semente Customizada (Custom Seed) */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-stone-200 text-xs uppercase tracking-wide">
                Disputar Semente Específica (Custom Seed)
              </h3>
            </div>
            <p className="text-stone-400 text-[11px] mb-3 leading-relaxed">
              Cole o código de uma run para enfrentar o mesmíssimo tabuleiro de um amigo ou recriar uma partida épica.
            </p>

            <form onSubmit={handleStartCustom} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value.toUpperCase())}
                placeholder="EX: TERMO-2026 OU RT-8X2M"
                maxLength={20}
                className="flex-1 px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Carregar
              </button>
            </form>

            {/* Semente da partida atual */}
            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 font-bold">
                Semente em jogo:{' '}
                <span className="text-stone-300 font-mono">{seed || 'NENHUMA'}</span>
                {runMode === 'daily' && (
                  <span className="ml-1 text-[9px] text-amber-400 font-bold">(Diário)</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleCopyCurrentSeed}
                className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition-colors font-bold text-[10px]"
              >
                {copiedSeed ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Seed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com Fechar */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-900/60 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-stone-400" />
            <span>Integridade Determinística Ativa (Mulberry32)</span>
          </div>
          <button
            onClick={closeDailyModal}
            className="px-3 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors"
          >
            Voltar ao Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
