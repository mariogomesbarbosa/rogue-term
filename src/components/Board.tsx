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
      'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 flex items-center justify-center font-mono font-black text-xl sm:text-2xl md:text-3xl rounded-md select-none uppercase transition-all duration-150 relative ';

    if (isSelected) {
      return (
        base +
        'bg-amber-950/70 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105 animate-pulse'
      );
    }

    if (isSelectable) {
      return (
        base +
        'cursor-pointer border-2 border-dashed border-amber-400/90 hover:scale-105 hover:border-amber-300 hover:bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.35)] '
      );
    }

    if (isCurrentActive) {
      return (
        base +
        'cursor-pointer bg-[#18181f] border-2 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.45),inset_0_0_8px_rgba(245,158,11,0.2)] scale-105 z-10'
      );
    }

    if (isCurrentRow) {
      return (
        base +
        'cursor-pointer bg-[#13141a]/90 border-2 border-stone-700 text-amber-100 hover:border-amber-500/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]'
      );
    }

    switch (status) {
      case 'correct':
        // Verde fósforo terminal CRT (#00ff66) com glow fosforescente
        return (
          base +
          'bg-gradient-to-b from-emerald-950/90 to-[#062015] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.45),inset_0_0_8px_rgba(16,185,129,0.2)]'
        );
      case 'present':
        // Âmbar fósforo terminal CRT (#ffb000) com glow fosforescente
        return (
          base +
          'bg-gradient-to-b from-amber-950/90 to-[#221204] border-2 border-amber-400 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4),inset_0_0_8px_rgba(245,158,11,0.2)]'
        );
      case 'absent':
        // Fósforo apagado / célula escura
        return (
          base +
          'bg-[#101014] border border-stone-800 text-stone-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] opacity-70'
        );
      case 'tbd':
        // Letra recém-digitada pronta para envio
        return (
          base +
          'bg-[#191921] border-2 border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25),inset_0_1px_2px_rgba(255,255,255,0.1)]'
        );
      case 'empty':
      default:
        return (
          base +
          'bg-[#0b0c10]/80 border border-stone-850 text-transparent shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)]'
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
      {/* Banner de Modo de Alvo (Habilidade Ativa) */}
      <AnimatePresence>
        {targetingState && targetingState.skillId !== 'sonda_circuito' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-2 px-3 py-1.5 rounded-lg bg-amber-950/90 border border-amber-500/80 text-amber-200 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
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
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Palavras - Chassi CRT com Bezel Metálico */}
      <motion.div
        animate={shakeBoard ? { x: [-10, 10, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="flex flex-col p-2.5 sm:p-3.5 rounded-xl bg-[#0e0f14] border-2 border-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] relative max-h-[50dvh] sm:max-h-[55dvh] overflow-y-auto no-scrollbar"
      >
        {/* Barra superior de status do buffer CRT */}
        <div className="flex items-center justify-between text-[8px] text-stone-500 font-mono font-bold tracking-widest pb-1.5 mb-1.5 border-b border-stone-800/80">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_4px_#10b981]" />
            <span>BUFFER-CRT // 5×6 MATRIX</span>
          </span>
          <span className="text-amber-500/70">
            {evaluations.length < 6 ? `LINHA ${evaluations.length + 1}/6` : 'BUFFER_CHEIO'}
          </span>
        </div>

        {/* Linhas de Células */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
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
                      {/* Cursor piscante de terminal retrô na posição ativa de digitação */}
                      {isCurrentActive && !char && (
                        <span className="absolute bottom-1 w-3 sm:w-4 h-1 bg-amber-400 shadow-[0_0_6px_#f59e0b] rounded-xs animate-pulse" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Popover / Seletor de Nova Letra (quando selecionado no Ctrl+Z) */}
      <AnimatePresence>
        {selectedLetterPos && targetingState?.skillId === 'ctrl_z' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-40 bg-stone-900 border border-amber-500 rounded-xl p-3 sm:p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col items-center gap-2.5 backdrop-blur-md font-mono"
          >
            <div className="flex items-center justify-between w-full border-b border-stone-800 pb-1.5">
              <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                Retro-Edição: L{selectedLetterPos.row + 1} C{selectedLetterPos.col + 1}
              </span>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-stone-300 text-center">
              Escolha a nova letra para substituir:
            </p>

            <div className="grid grid-cols-7 gap-1 max-w-xs">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                <button
                  key={l}
                  onClick={() => setReplacementChar(l)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs font-bold flex items-center justify-center border transition-colors ${
                    replacementChar === l
                      ? 'bg-amber-500 border-amber-400 text-stone-950 scale-105'
                      : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
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
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Trocar por &lsquo;{replacementChar}&rsquo;
              </button>
              <button
                onClick={() => setSelectedLetterPos(null)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs"
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
