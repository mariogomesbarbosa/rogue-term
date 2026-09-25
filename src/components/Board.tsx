'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TileStatus } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

export const Board: React.FC = () => {
  const {
    evaluations,
    currentGuess,
    shakeBoard,
    targetingState,
    cancelTargeting,
    applyRetroEdit,
    applySwapLetters
  } = useGameStore();

  // Estado local para seleção do Ctrl+Z e Anagramador
  const [selectedLetterPos, setSelectedLetterPos] = useState<{ row: number; col: number } | null>(null);
  const [replacementChar, setReplacementChar] = useState('');

  // Total de linhas para renderizar (mínimo 6)
  const totalRows = Math.max(6, evaluations.length + 1);
  const rows = Array.from({ length: totalRows });

  const getTileClasses = (status: TileStatus, isSelectable: boolean, isSelected: boolean) => {
    let base =
      'w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl rounded-lg select-none uppercase transition-all duration-300 ';

    if (isSelected) {
      return base + 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-500/40 animate-pulse scale-105';
    }

    if (isSelectable) {
      return (
        base +
        'cursor-pointer border-2 border-dashed border-amber-400/80 hover:scale-105 hover:border-amber-300 hover:bg-amber-400/10 shadow-[0_0_10px_rgba(245,158,11,0.25)] '
      );
    }

    switch (status) {
      case 'correct':
        return (
          base +
          'bg-emerald-600/90 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
        );
      case 'present':
        return (
          base +
          'bg-amber-600/90 border-2 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
        );
      case 'absent':
        return base + 'bg-stone-800/80 border border-stone-700/80 text-stone-400';
      case 'tbd':
        return (
          base +
          'bg-stone-900/90 border-2 border-stone-500 text-stone-100 shadow-[0_0_10px_rgba(255,255,255,0.08)] animate-pulse'
        );
      case 'empty':
      default:
        return base + 'bg-stone-950/40 border border-stone-800/70 text-transparent';
    }
  };

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    if (!targetingState) return;

    if (targetingState.skillId === 'ctrl_z') {
      setSelectedLetterPos({ row: rowIndex, col: colIndex });
      setReplacementChar('');
    } else if (targetingState.skillId === 'anagramador') {
      if (!selectedLetterPos) {
        // Seleciona a 1ª letra
        setSelectedLetterPos({ row: rowIndex, col: colIndex });
      } else {
        // Seleciona a 2ª letra (mesma linha)
        if (selectedLetterPos.row === rowIndex && selectedLetterPos.col !== colIndex) {
          applySwapLetters(rowIndex, selectedLetterPos.col, colIndex);
          setSelectedLetterPos(null);
        } else if (selectedLetterPos.row !== rowIndex) {
          alert('As duas letras devem ser da mesma linha!');
        }
      }
    }
  };

  const handleConfirmReplacement = () => {
    if (!selectedLetterPos || !replacementChar) return;
    applyRetroEdit(selectedLetterPos.row, selectedLetterPos.col, replacementChar);
    setSelectedLetterPos(null);
    setReplacementChar('');
  };

  return (
    <div className="flex flex-col items-center justify-center my-3 sm:my-5 relative">
      {/* Banner de Modo de Alvo (Habilidade Ativa) */}
      <AnimatePresence>
        {targetingState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 px-4 py-2 rounded-lg bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs sm:text-sm font-mono flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <span>
              {targetingState.skillId === 'ctrl_z'
                ? '🎯 MODO RETRO-EDIÇÃO: Clique em uma letra para trocar.'
                : '↔️ MODO ANAGRAMA: Clique em duas letras da mesma linha para inverter.'}
            </span>
            <button
              onClick={() => {
                cancelTargeting();
                setSelectedLetterPos(null);
              }}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Palavras */}
      <motion.div
        animate={shakeBoard ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="grid grid-rows-6 gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-stone-900/40 border border-stone-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm"
      >
        {rows.map((_, rowIndex) => {
          const isEvaluated = rowIndex < evaluations.length;
          const isCurrent = rowIndex === evaluations.length;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                let char = '';
                let status: TileStatus = 'empty';

                if (isEvaluated) {
                  const letterData = evaluations[rowIndex].letters[colIndex];
                  char = letterData?.char || '';
                  status = letterData?.status || 'empty';
                } else if (isCurrent) {
                  char = currentGuess[colIndex] || '';
                  status = char ? 'tbd' : 'empty';
                }

                const isSelectable = !!targetingState && isEvaluated;
                const isSelected =
                  selectedLetterPos?.row === rowIndex && selectedLetterPos?.col === colIndex;

                return (
                  <motion.div
                    key={colIndex}
                    whileHover={isSelectable ? { scale: 1.08 } : {}}
                    whileTap={isSelectable ? { scale: 0.95 } : {}}
                    onClick={() => isSelectable && handleTileClick(rowIndex, colIndex)}
                    className={getTileClasses(status, isSelectable, isSelected)}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </motion.div>

      {/* Popover / Seletor de Nova Letra (quando selecionado no Ctrl+Z) */}
      <AnimatePresence>
        {selectedLetterPos && targetingState?.skillId === 'ctrl_z' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-40 bg-stone-900 border border-amber-500 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col items-center gap-3 backdrop-blur-md font-mono"
          >
            <div className="flex items-center justify-between w-full border-b border-stone-800 pb-2">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Retro-Edição: Linha {selectedLetterPos.row + 1}, Letra {selectedLetterPos.col + 1}
              </span>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 text-center">
              Escolha ou digite a nova letra para substituir:
            </p>

            {/* Teclado rápido de seleção de letras */}
            <div className="grid grid-cols-7 gap-1 max-w-xs">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                <button
                  key={l}
                  onClick={() => setReplacementChar(l)}
                  className={`w-7 h-8 rounded text-sm font-bold flex items-center justify-center border transition-colors ${
                    replacementChar === l
                      ? 'bg-amber-500 border-amber-400 text-stone-950 scale-105'
                      : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2 w-full">
              <button
                disabled={!replacementChar}
                onClick={handleConfirmReplacement}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Substituir por '{replacementChar}'
              </button>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
