'use client';

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TileStatus } from '@/types/game';
import { normalizeWord } from '@/data/words';
import { Delete, CornerDownLeft, Radio, X, Lock } from 'lucide-react';

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
    applyThermalLensByKey,
    lensHint,
    moveCursor,
    currentBoss
  } = useGameStore();

  const isProbeMode = targetingState?.skillId === 'sonda_circuito';
  const isLensMode = targetingState?.skillId === 'lente_termica';
  const selectedProbeLetters = targetingState?.selectedLetters || [];

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gamePhase !== 'playing') return;

      const normKey = normalizeWord(key);

      // Se estiver no modo Sonda, clicar em uma letra seleciona/deseleciona para a sonda
      if (isProbeMode) {
        if (/^[A-Z]$/.test(normKey)) {
          toggleProbeLetter(normKey);
        }
        return;
      }

      // Se estiver no modo Lente Térmica, clicar em uma letra amarela aciona a análise
      if (isLensMode) {
        if (/^[A-Z]$/.test(normKey)) {
          applyThermalLensByKey(normKey);
        }
        return;
      }

      // Se houver outro modo de mira (ex: Ctrl+Z), não digita no palpite
      if (targetingState) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        removeLetter();
      } else if (/^[A-Z]$/.test(normKey)) {
        addLetter(normKey);
      }
    },
    [addLetter, removeLetter, submitGuess, gamePhase, targetingState, isProbeMode, isLensMode, toggleProbeLetter, applyThermalLensByKey]
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

      const upperKey = e.key.toUpperCase();
      if (upperKey === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (upperKey === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else {
        const normKey = normalizeWord(e.key);
        if (/^[A-Z]$/.test(normKey)) {
          handleKeyPress(normKey);
        }
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
      'relative h-10 sm:h-11 md:h-12 rounded-md font-mono font-bold text-xs sm:text-sm flex items-center justify-center select-none cursor-pointer transition-all duration-150 active:translate-y-0.5 shadow-[0_2px_0_0_#1c1917] ';

    if (isSelectedInProbe) {
      return (
        base +
        'w-8 sm:w-10 md:w-11 bg-cyan-950 border-2 border-cyan-400 text-cyan-200 ring-4 ring-cyan-500/40 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
      );
    }

    if (isLensMode && status === 'present') {
      return (
        base +
        'w-8 sm:w-10 md:w-11 bg-amber-600 border-2 border-dashed border-cyan-300 text-amber-100 ring-4 ring-cyan-500/40 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
      );
    }

    const isLocked = currentBoss?.disabledLetters?.includes(key);

    if (isLocked) {
      return (
        base +
        'w-8 sm:w-10 md:w-11 bg-rose-950/80 border-2 border-rose-600/80 text-rose-400 opacity-60 cursor-not-allowed shadow-none'
      );
    }

    if (isEnter) {
      base += 'w-12 sm:w-[60px] md:w-[66px] bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 text-[11px] sm:text-xs ';
    } else if (isBackspace) {
      base += 'w-8 sm:w-10 md:w-11 bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 text-[11px] sm:text-xs ';
    } else {
      base += 'w-8 sm:w-10 md:w-11 ';
    }

    // Estilos de status
    switch (status) {
      case 'correct':
        return (
          base +
          'bg-emerald-600 border border-emerald-400 text-emerald-100 shadow-[0_3px_0_0_#065f46,0_0_12px_rgba(16,185,129,0.3)]'
        );
      case 'present':
        return (
          base +
          'bg-amber-600 border border-amber-400 text-amber-100 shadow-[0_3px_0_0_#92400e,0_0_12px_rgba(245,158,11,0.3)]'
        );
      case 'probed_hit':
        // Acerto da Sonda: Ciano Neon Elétrico Radar
        return (
          base +
          'bg-cyan-600/90 border-2 border-cyan-300 text-cyan-50 shadow-[0_3px_0_0_#0e7490,0_0_16px_rgba(6,182,212,0.6)] animate-pulse'
        );
      case 'probed_miss':
        // Erro da Sonda: Descartada pelo radar
        return (
          base +
          'bg-stone-900 border border-cyan-950/70 text-stone-600 opacity-40 shadow-none'
        );
      case 'absent':
        return base + 'bg-stone-900 border border-stone-800 text-stone-600 opacity-60';
      default:
        return (
          base +
          (isProbeMode
            ? 'bg-stone-800 border-2 border-dashed border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-950/40'
            : 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 border border-stone-600/60 text-stone-200 hover:border-stone-500')
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

                {/* Badge visual de Tecla Bloqueada pelo Chefe */}
                {currentBoss?.disabledLetters?.includes(key) && (
                  <Lock className="w-2.5 h-2.5 text-rose-400 absolute top-1 right-1" />
                )}

                {/* Badge visual de Lente Térmica no teclado */}
                {lensHint && lensHint.char === key && (
                  <span
                    className="absolute -top-1.5 -right-1 px-1 py-0.5 rounded bg-cyan-400 text-stone-950 text-[9px] font-black shadow border border-cyan-200 animate-bounce leading-none z-10 pointer-events-none"
                    title={`Lente Térmica: ${lensHint.direction}`}
                  >
                    {lensHint.direction === 'left' ? '⬅️' : lensHint.direction === 'right' ? '➡️' : '↔️'}
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
