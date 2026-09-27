'use client';

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TileStatus } from '@/types/game';
import { Delete, CornerDownLeft, Radio, X } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACKSPACE'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
];

export const Keyboard: React.FC = () => {
  const {
    addLetter,
    removeLetter,
    submitGuess,
    keyboardStatus,
    gamePhase,
    targetingState,
    cancelTargeting,
    toggleProbeLetter,
    executeProbe,
    moveCursor
  } = useGameStore();

  const isProbeMode = targetingState?.skillId === 'sonda_circuito';
  const selectedProbeLetters = targetingState?.selectedLetters || [];

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gamePhase !== 'playing') return;

      // Se estiver no modo Sonda, clicar em uma letra seleciona/deseleciona para a sonda
      if (isProbeMode) {
        if (/^[A-Z]$/.test(key)) {
          toggleProbeLetter(key);
        }
        return;
      }

      // Se houver outro modo de mira (ex: Ctrl+Z), não digita no palpite
      if (targetingState) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        removeLetter();
      } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
      }
    },
    [addLetter, removeLetter, submitGuess, gamePhase, targetingState, isProbeMode, toggleProbeLetter]
  );

  // Escuta teclado físico do computador
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Escape' && targetingState) {
        cancelTargeting();
        return;
      }

      if (e.key === 'ArrowLeft') {
        moveCursor('left');
        return;
      }

      if (e.key === 'ArrowRight') {
        moveCursor('right');
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress, targetingState, cancelTargeting, moveCursor]);

  const getKeyClasses = (key: string) => {
    const status: TileStatus = keyboardStatus[key];
    const isEnter = key === 'ENTER';
    const isBackspace = key === 'BACKSPACE';
    const isSelectedInProbe = isProbeMode && selectedProbeLetters.includes(key);

    let base =
      'relative h-10 sm:h-11 md:h-12 rounded-md font-mono font-black text-xs sm:text-sm flex items-center justify-center select-none cursor-pointer transition-all duration-100 active:translate-y-0.5 ';

    if (isSelectedInProbe) {
      return (
        base +
        'w-8 sm:w-10 md:w-11 bg-cyan-950 border-2 border-cyan-400 text-cyan-200 ring-4 ring-cyan-500/40 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
      );
    }

    if (isEnter) {
      base += 'w-12 sm:w-[60px] md:w-[66px] text-[11px] sm:text-xs ';
    } else if (isBackspace) {
      base += 'w-8 sm:w-10 md:w-11 text-[11px] sm:text-xs ';
    } else {
      base += 'w-8 sm:w-10 md:w-11 ';
    }

    // Estilos de status com chanfro 2.5D (borda inferior escura para simular curso mecânico da tecla)
    switch (status) {
      case 'correct':
        // Verde fósforo com chanfro mecânico
        return (
          base +
          'bg-gradient-to-b from-emerald-600 to-emerald-800 border-t border-emerald-400 border-x border-emerald-600 border-b-3 border-emerald-950 text-emerald-100 shadow-[0_2px_4px_rgba(0,0,0,0.6),0_0_12px_rgba(16,185,129,0.35)] active:border-b active:translate-y-0.5'
        );
      case 'present':
        // Âmbar fósforo com chanfro mecânico
        return (
          base +
          'bg-gradient-to-b from-amber-600 to-amber-850 border-t border-amber-400 border-x border-amber-600 border-b-3 border-amber-950 text-amber-100 shadow-[0_2px_4px_rgba(0,0,0,0.6),0_0_12px_rgba(245,158,11,0.35)] active:border-b active:translate-y-0.5'
        );
      case 'probed_hit':
        // Acerto da Sonda: Ciano Radar com relevo brilhante
        return (
          base +
          'bg-gradient-to-b from-cyan-600 to-cyan-850 border-t border-cyan-300 border-x border-cyan-500 border-b-3 border-cyan-950 text-cyan-50 shadow-[0_2px_4px_rgba(0,0,0,0.6),0_0_16px_rgba(6,182,212,0.6)] animate-pulse'
        );
      case 'probed_miss':
        // Erro da Sonda: Descartada pelo radar
        return (
          base +
          'bg-[#121216] border border-cyan-950/70 border-b-2 text-stone-600 opacity-40 shadow-none'
        );
      case 'absent':
        // Tecla testada e ausente da palavra: tecla afundada/apagada
        return (
          base +
          'bg-[#131317] border border-stone-850 border-b-2 text-stone-650 opacity-45 shadow-none'
        );
      default:
        // Teclas neutras não testadas: Plástico texturizado industrial com chanfro mecânico
        if (isEnter) {
          return (
            base +
            'bg-gradient-to-b from-amber-500/90 to-amber-600 border-t border-amber-300 border-x border-amber-600 border-b-3 border-amber-900 text-stone-950 font-black shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:brightness-110 active:border-b active:translate-y-0.5'
          );
        }
        if (isBackspace) {
          return (
            base +
            'bg-gradient-to-b from-stone-700 to-stone-850 border-t border-stone-500 border-x border-stone-700 border-b-3 border-stone-950 text-stone-200 shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:bg-stone-700 active:border-b active:translate-y-0.5'
          );
        }
        return (
          base +
          (isProbeMode
            ? 'bg-stone-850 border-2 border-dashed border-cyan-500/60 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-950/40'
            : 'bg-gradient-to-b from-[#2e2f38] via-[#24252d] to-[#1c1d24] border-t border-stone-500/70 border-x border-stone-700 border-b-3 border-stone-950 text-stone-200 hover:brightness-115 active:border-b active:translate-y-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.5)]')
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 flex flex-col gap-1.5 sm:gap-2 select-none z-10">
      {/* Banner de Controle da Sonda de Circuito */}
      {isProbeMode && (
        <div className="mb-2 p-2.5 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold">
              SONDA: Selecione 3 letras no teclado ({selectedProbeLetters.length}/3)
            </span>
            {selectedProbeLetters.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-900 border border-cyan-500 font-black text-cyan-100">
                [{selectedProbeLetters.join(', ')}]
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {selectedProbeLetters.length > 0 ? (
              <button
                onClick={() => executeProbe(selectedProbeLetters)}
                className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-xs transition-colors"
              >
                Escanear Agora
              </button>
            ) : (
              <button
                onClick={() => executeProbe()}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-cyan-300 font-bold text-xs border border-cyan-800 transition-colors"
              >
                Escanear 3 Aleatórias
              </button>
            )}
            <button
              onClick={cancelTargeting}
              className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs"
              title="Cancelar Sonda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Linhas do Teclado */}
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
          {/* Espaçador invisível na linha 3 para centralizar as teclas e alinhar ENVIAR com BACKSPACE */}
          {rowIndex === 2 && (
            <div
              aria-hidden="true"
              className="w-12 sm:w-[60px] md:w-[66px] pointer-events-none select-none invisible"
            />
          )}
          {row.map(key => {
            const isEnter = key === 'ENTER';
            const isBackspace = key === 'BACKSPACE';
            const status = keyboardStatus[key];

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={getKeyClasses(key)}
                type="button"
                aria-label={
                  isEnter
                    ? 'Enviar palpite'
                    : isBackspace
                    ? 'Apagar letra'
                    : `Letra ${key}`
                }
                title={
                  isEnter
                    ? 'Enviar palpite (Enter)'
                    : isBackspace
                    ? 'Apagar letra (Backspace)'
                    : undefined
                }
              >
                {/* Badge visual de acerto da Sonda (Radar Ciano) */}
                {status === 'probed_hit' && (
                  <Radio className="w-2.5 h-2.5 text-cyan-200 absolute top-1 right-1 animate-pulse" />
                )}

                {/* Badge visual de descarte da Sonda (✕ discreto) */}
                {status === 'probed_miss' && (
                  <span className="absolute top-0.5 right-1 text-[8px] text-cyan-800/80 font-mono">
                    ✕
                  </span>
                )}

                {isEnter ? (
                  <span className="flex items-center justify-center gap-1">
                    <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">ENVIAR</span>
                  </span>
                ) : isBackspace ? (
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
