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
    activeTileCol,
    setActiveTileCol,
    gamePhase,
    shakeBoard,
    targetingState,
    cancelTargeting,
    applyRetroEdit,
    applySwapLetters
  } = useGameStore();

  // Estado local para seleção do Ctrl+Z e Anagramador
  const [selectedLetterPos, setSelectedLetterPos] = useState<{ row: number; col: number } | null>(null);
  const [replacementChar, setReplacementChar] = useState('');

  // Total de linhas para renderizar (padrão de 6 tentativas, com suporte a mais linhas via scroll)
  const totalRows = Math.max(6, evaluations.length + (gamePhase === 'playing' ? 1 : 0));
  const rows = Array.from({ length: totalRows });

  const getTileClasses = (
    status: TileStatus,
    isSelectable: boolean,
    isSelected: boolean,
    isCurrentActive: boolean,
    isCurrentRow: boolean
  ) => {
    // Tamanhos compactos e responsivos para caber perfeitamente sem scroll (100dvh)
    const base =
      'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 flex items-center justify-center font-pixel font-bold text-lg sm:text-xl md:text-2xl select-none uppercase transition-all duration-75 relative ';

    if (isSelected) {
      return (
        base +
        'bg-amber-500 border-2 border-amber-300 text-stone-950 shadow-[0_4px_0_#78350f] scale-105 animate-pulse z-10'
      );
    }

    if (isSelectable) {
      return (
        base +
        'cursor-pointer border-2 border-dashed border-amber-400 bg-amber-950/40 text-amber-200 hover:scale-105 hover:bg-amber-900/60 shadow-[0_3px_0_#000]'
      );
    }

    if (isCurrentActive) {
      return (
        base +
        'cursor-pointer bg-[#242638] border-2 border-amber-400 text-amber-300 shadow-[0_4px_0_#000] scale-105 z-10'
      );
    }

    if (isCurrentRow) {
      return (
        base +
        'cursor-pointer bg-[#181924] border-2 border-stone-600 text-stone-100 hover:border-amber-400 shadow-[0_3px_0_#000]'
      );
    }

    switch (status) {
      case 'correct':
        // Verde Esmeralda Arcade 16-bits com chanfro sólido
        return (
          base +
          'bg-emerald-600 border-t-2 border-l-2 border-t-emerald-300 border-l-emerald-300 border-r-2 border-b-3 border-r-emerald-950 border-b-emerald-950 text-emerald-100 shadow-[0_3px_0_#022c22]'
        );
      case 'present':
        // Âmbar Dourado Arcade 16-bits com chanfro sólido
        return (
          base +
          'bg-amber-600 border-t-2 border-l-2 border-t-amber-300 border-l-amber-300 border-r-2 border-b-3 border-r-amber-950 border-b-amber-950 text-amber-100 shadow-[0_3px_0_#451a03]'
        );
      case 'absent':
        // Bloco de pedra escura de masmorra
        return (
          base +
          'bg-[#14151e] border-t-2 border-l-2 border-t-stone-700 border-l-stone-700 border-r-2 border-b-2 border-r-black border-b-black text-stone-500 shadow-[0_2px_0_#000] opacity-80'
        );
      case 'tbd':
        // Letra recém-digitada pronta para envio
        return (
          base +
          'bg-[#222533] border-2 border-amber-400/90 text-amber-200 shadow-[0_3px_0_#000]'
        );
      case 'empty':
      default:
        // Célula vazia entalhada
        return (
          base +
          'bg-[#0d0e14] border-2 border-stone-800 text-transparent shadow-[inset_2px_2px_0_#000]'
        );
    }
  };

  const handleTileClick = (rowIndex: number, colIndex: number, isCurrent: boolean) => {
    // Se o jogador clicou na linha atual de digitação: seleciona aquela casa para digitar/editar!
    if (isCurrent && !targetingState) {
      setActiveTileCol(colIndex);
      return;
    }

    if (!targetingState) return;

    if (targetingState.skillId === 'ctrl_z') {
      setSelectedLetterPos({ row: rowIndex, col: colIndex });
      setReplacementChar('');
    } else if (targetingState.skillId === 'anagramador') {
      if (!selectedLetterPos) {
        setSelectedLetterPos({ row: rowIndex, col: colIndex });
      } else {
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
    <div className="flex flex-col items-center justify-center my-auto relative select-none">
      {/* Banner de Modo de Alvo (Habilidade Ativa) - Estilo Pergaminho de RPG 16-bits */}
      <AnimatePresence>
        {targetingState && targetingState.skillId !== 'sonda_circuito' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-2 px-3 py-1.5 bg-[#20180a] border-2 border-amber-400 text-amber-200 text-xs font-pixel flex items-center gap-2.5 shadow-[0_4px_0_#000]"
          >
            <span>
              {targetingState.skillId === 'ctrl_z'
                ? '🎯 MODO RETRO-EDIÇÃO: Selecione a letra para trocar'
                : '↔️ MODO ANAGRAMA: Escolha 2 letras para trocar'}
            </span>
            <button
              onClick={() => {
                cancelTargeting();
                setSelectedLetterPos(null);
              }}
              className="p-1 bg-stone-900 border border-stone-600 hover:bg-stone-800 text-stone-300 cursor-pointer"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Palavras - Moldura de Pedra de Masmorra 16-bits */}
      <motion.div
        animate={shakeBoard ? { x: [-10, 10, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 bg-[#12131c] border-4 border-black shadow-[inset_2px_2px_0_rgba(255,255,255,0.15),inset_-2px_-2px_0_rgba(0,0,0,0.8),0_6px_0_rgba(0,0,0,0.8)] max-h-[50dvh] sm:max-h-[55dvh] overflow-y-auto no-scrollbar"
      >
        {/* Barra superior de status estilo RPG */}
        <div className="flex items-center justify-between text-[9px] text-amber-400 font-pixel tracking-wider pb-1.5 border-b-2 border-stone-800">
          <span>MATRIZ 5×6</span>
          <span className="text-stone-400">
            {evaluations.length < 6 ? `TENTATIVA ${evaluations.length + 1}/6` : 'FINALIZADO'}
          </span>
        </div>

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
                const isCurrentActive = isCurrent && activeTileCol === colIndex && !targetingState;

                return (
                  <motion.div
                    key={colIndex}
                    whileHover={isSelectable || isCurrent ? { scale: 1.05 } : {}}
                    whileTap={isSelectable || isCurrent ? { scale: 0.95 } : {}}
                    onClick={() => handleTileClick(rowIndex, colIndex, isCurrent)}
                    className={getTileClasses(
                      status,
                      isSelectable,
                      isSelected,
                      isCurrentActive,
                      isCurrent
                    )}
                  >
                    {char}
                    {/* Cursor piscante em bloco de pixel na casa ativa */}
                    {isCurrentActive && !char && (
                      <span className="absolute bottom-1 w-3 sm:w-4 h-1 bg-amber-400 animate-pulse shadow-[0_1px_0_#000]" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </motion.div>

      {/* Popover / Seletor de Nova Letra (quando selecionado no Ctrl+Z) - Estilo Menu de RPG 16-bits */}
      <AnimatePresence>
        {selectedLetterPos && targetingState?.skillId === 'ctrl_z' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-40 bg-[#161722] border-3 border-amber-400 p-3 sm:p-4 shadow-[0_6px_0_#000] flex flex-col items-center gap-2.5 font-pixel"
          >
            <div className="flex items-center justify-between w-full border-b-2 border-stone-800 pb-1.5">
              <span className="text-[10px] text-amber-400 font-bold uppercase">
                RETRO-EDIÇÃO: L{selectedLetterPos.row + 1} C{selectedLetterPos.col + 1}
              </span>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[9px] text-stone-300 text-center">
              ESCOLHA A NOVA LETRA:
            </p>

            <div className="grid grid-cols-7 gap-1 max-w-xs">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                <button
                  key={l}
                  onClick={() => setReplacementChar(l)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] font-pixel font-bold flex items-center justify-center border-2 transition-transform cursor-pointer ${
                    replacementChar === l
                      ? 'bg-amber-500 border-amber-300 text-stone-950 shadow-[0_2px_0_#78350f] -translate-y-0.5'
                      : 'bg-[#222433] border-black text-stone-200 hover:bg-[#2c2f42] shadow-[0_2px_0_#000]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1 w-full">
              <button
                disabled={!replacementChar}
                onClick={handleConfirmReplacement}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-pixel text-[10px] flex items-center justify-center gap-1 border-2 border-emerald-400 shadow-[0_3px_0_#022c22] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> TROCAR POR &lsquo;{replacementChar}&rsquo;
              </button>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] font-pixel border border-stone-600 cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
