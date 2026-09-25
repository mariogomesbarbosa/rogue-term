'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Board } from '@/components/Board';
import { Keyboard } from '@/components/Keyboard';
import { SkillsBar } from '@/components/SkillsBar';
import { CrtOverlay } from '@/components/CrtOverlay';
import { DraftModal } from '@/components/DraftModal';
import { GameOverModal } from '@/components/GameOverModal';
import { NotificationToast } from '@/components/NotificationToast';

export default function GamePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Camada CRT Shader Retrô Balatro */}
      <CrtOverlay />

      {/* Notificações Flutuantes */}
      <NotificationToast />

      {/* Topo / HUD de Recursos e Teclas */}
      <Header />

      {/* Área Central do Jogo */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 py-2 sm:py-4 max-w-4xl mx-auto z-10">
        {/* Barra de Cartas e Atalhos */}
        <SkillsBar />

        {/* Tabuleiro de Palavras */}
        <Board />

        {/* Teclado Virtual / Tátil */}
        <Keyboard />
      </main>

      {/* Rodapé Informativo */}
      <footer className="w-full text-center py-2 text-[10px] font-mono text-stone-600 border-t border-stone-900/60 z-10">
        Rogue Term v0.3 • Digite no teclado físico ou use a tela • Atalhos: Ctrl+Z para editar linhas passadas
      </footer>

      {/* Modais de Fluxo de Jogo */}
      <DraftModal />
      <GameOverModal />
    </div>
  );
}
