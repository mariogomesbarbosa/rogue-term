'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BalatroSidebar } from '@/components/BalatroSidebar';
import { Board } from '@/components/Board';
import { Keyboard } from '@/components/Keyboard';
import { SkillsBar } from '@/components/SkillsBar';
import { CrtOverlay } from '@/components/CrtOverlay';
import { DraftModal } from '@/components/DraftModal';
import { GameOverModal } from '@/components/GameOverModal';
import { NotificationToast } from '@/components/NotificationToast';

export default function GamePage() {
  return (
    <div className="relative h-dvh max-h-dvh w-full overflow-hidden flex flex-col md:flex-row bg-stone-950 text-stone-100 select-none">
      {/* Camada CRT Shader Retrô Balatro */}
      <CrtOverlay />

      {/* Notificações Flutuantes */}
      <NotificationToast />

      {/* Barra Lateral Balatro (Visível em Desktop md+) */}
      <BalatroSidebar />

      {/* Header Compacto (Visível em Mobile < md) */}
      <Header />

      {/* Área Central / Direita de Jogo (Totalmente sem scroll) */}
      <main className="flex-1 h-full min-h-0 flex flex-col justify-between items-center px-1 sm:px-3 py-1 sm:py-2 overflow-hidden z-10">
        {/* Topo da mesa: Cartas e Atalhos */}
        <SkillsBar />

        {/* Centro da mesa: Tabuleiro de Palavras */}
        <Board />

        {/* Base da mesa: Teclado Virtual Fixo no Bottom */}
        <Keyboard />
      </main>

      {/* Modais de Fluxo de Jogo */}
      <DraftModal />
      <GameOverModal />
    </div>
  );
}
