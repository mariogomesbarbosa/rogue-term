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
      'relative h-10 sm:h-11 md:h-12 font-pixel font-bold text-xs sm:text-sm flex items-center justify-center select-none cursor-pointer transition-transform duration-75 active:translate-y-1 ';

    if (isSelectedInProbe) {
      return (
        base +
        'w-8 sm:w-10 md:w-11 bg-cyan-900 border-2 border-cyan-300 text-cyan-100 shadow-[0_4px_0_#083344] scale-105'
      );
    }

    if (isEnter) {
      base += 'w-12 sm:w-[60px] md:w-[66px] text-[10px] sm:text-xs ';
    } else if (isBackspace) {
      base += 'w-8 sm:w-10 md:w-11 text-[10px] sm:text-xs ';
    } else {
      base += 'w-8 sm:w-10 md:w-11 ';
    }

    // Estilos de status com chanfro pixel art e relevo de botão físico 16-bits
    switch (status) {
      case 'correct':
        return (
          base +
          'bg-emerald-600 border-t-2 border-l-2 border-t-emerald-300 border-l-emerald-300 border-r-2 border-b-2 border-r-emerald-950 border-b-emerald-950 text-emerald-100 shadow-[0_4px_0_#022c22]'
        );
      case 'present':
        return (
          base +
          'bg-amber-600 border-t-2 border-l-2 border-t-amber-300 border-l-amber-300 border-r-2 border-b-2 border-r-amber-950 border-b-amber-950 text-amber-100 shadow-[0_4px_0_#451a03]'
        );
      case 'probed_hit':
        // Acerto da Sonda: Ciano Neon Arcade
        return (
          base +
          'bg-cyan-600 border-t-2 border-l-2 border-t-cyan-300 border-l-cyan-300 border-r-2 border-b-2 border-r-cyan-950 border-b-cyan-950 text-cyan-50 shadow-[0_4px_0_#083344] animate-pulse'
        );
      case 'probed_miss':
        // Erro da Sonda: Descartada pelo radar
        return (
          base +
          'bg-[#12131c] border-2 border-stone-850 text-stone-600 opacity-40 shadow-none'
        );
      case 'absent':
        return (
          base +
          'bg-[#14151e] border-2 border-stone-850 text-stone-600 opacity-50 shadow-none'
        );
      default:
        if (isEnter) {
          return (
            base +
            'bg-amber-500 hover:bg-amber-400 border-t-2 border-l-2 border-t-amber-200 border-l-amber-200 border-r-2 border-b-2 border-r-amber-900 border-b-amber-900 text-stone-950 font-bold shadow-[0_4px_0_#78350f]'
          );
        }
        if (isBackspace) {
          return (
            base +
            'bg-[#3a2020] hover:bg-[#4d2a2a] border-t-2 border-l-2 border-t-rose-400 border-l-rose-400 border-r-2 border-b-2 border-r-rose-950 border-b-rose-950 text-rose-200 shadow-[0_4px_0_#4c0519]'
          );
        }
        return (
          base +
          (isProbeMode
            ? 'bg-[#1b2230] border-2 border-dashed border-cyan-400 text-cyan-200 hover:bg-cyan-950 shadow-[0_4px_0_#000]'
            : 'bg-[#252736] hover:bg-[#2e3144] border-t-2 border-l-2 border-t-stone-500 border-l-stone-500 border-r-2 border-b-2 border-r-black border-b-black text-stone-100 shadow-[0_4px_0_#000]')
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 flex flex-col gap-1.5 sm:gap-2 select-none z-10 font-pixel">
      {/* Banner de Controle da Sonda de Circuito - Estilo Scanner Radar 16-bits */}
      {isProbeMode && (
        <div className="mb-2 p-2.5 bg-[#091f2c] border-2 border-cyan-400 text-cyan-200 text-xs font-pixel flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_0_#000]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold">
              SONDA: SELECIONE 3 LETRAS ({selectedProbeLetters.length}/3)
            </span>
            {selectedProbeLetters.length > 0 && (
              <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-400 font-bold text-cyan-100">
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
