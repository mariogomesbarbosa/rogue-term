// Utilitário de Compartilhamento de Resultados estilo Termo / Wordle / Balatro
import { formatDailyDate } from './rng';

interface ShareRunOptions {
  runMode: 'standard' | 'daily' | 'custom_seed';
  seed: string;
  score: number;
  sector: number;
  stage: number;
  lives: number;
  maxLives: number;
  won: boolean;
  activeSkillNames: string[];
  durationSeconds?: number;
}

export function generateShareText(options: ShareRunOptions): string {
  const { runMode, seed, score, sector, lives, maxLives, won, activeSkillNames, durationSeconds } = options;

  const modeTitle =
    runMode === 'daily'
      ? `Desafio Diário (${formatDailyDate(seed)})`
      : runMode === 'custom_seed'
      ? `Semente [${seed}]`
      : `Carreira (Seed: ${seed})`;

  const outcomeHeader = won ? '🏆 VITÓRIA DO SISTEMA!' : '💀 FIM DA TRANSMISSÃO';
  const sectorText = won ? 'Setor 8/8 [COMPLETO]' : `Setor ${sector}/8`;
  const livesHearts = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, maxLives - lives));

  let timeFormatted = '';
  if (durationSeconds && durationSeconds > 0) {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    timeFormatted = ` • ⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const skillsText =
    activeSkillNames.length > 0
      ? `🎴 Decks: ${activeSkillNames.slice(0, 3).join(', ')}`
      : '🎴 Decks: Padrão';

  return [
    `🕹️ ROGUE TERM • ${modeTitle}`,
    `${outcomeHeader} • ${sectorText}`,
    `🎯 ${score.toLocaleString('pt-BR')} pts • Vidas: ${livesHearts}${timeFormatted}`,
    skillsText,
    '',
    'Jogue agora no navegador:',
    'https://mariogomesbarbosa.github.io/rogue-term/'
  ].join('\n');
}

export async function copyShareResult(options: ShareRunOptions): Promise<boolean> {
  const text = generateShareText(options);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error('Falha ao copiar via Clipboard API:', err);
  }

  // Fallback para navegadores sem permissão de clipboard direta
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
