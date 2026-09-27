import type { Metadata } from 'next';
import { Geist, Geist_Mono, Silkscreen } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const pixelFont = Silkscreen({
  weight: ['400', '700'],
  variable: '--font-pixel',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rogue Term - O Roguelike do Termo',
  description: 'Um jogo roguelike de adivinhação de palavras com estética 16-bits pixel art, cartas táteis e pool contínuo de Teclas [T].',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950 font-sans">
        {children}
      </body>
    </html>
  );
}
