import { TileStatus } from '@/types/game';
import lexiconData from './lexicon.json';

// Remove acentos e normaliza para caixa alta sem cedilha
export function normalizeWord(word: string): string {
  return word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ç/g, 'C')
    .trim();
}

// Avaliação oficial estilo Wordle/Termo com suporte a letras repetidas
export function evaluateGuess(guess: string, target: string): TileStatus[] {
  const normGuess = normalizeWord(guess);
  const normTarget = normalizeWord(target);
  const len = normTarget.length;
  const result: TileStatus[] = Array(len).fill('absent');

  const targetLetterCounts: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = normTarget[i];
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // Primeiro passo: identificar acertos perfeitos (Verde / Correct)
  for (let i = 0; i < len; i++) {
    if (normGuess[i] === normTarget[i]) {
      result[i] = 'correct';
      targetLetterCounts[normGuess[i]]--;
    }
  }

  // Segundo passo: identificar letras presentes fora de posição (Amarelo / Present)
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'correct') {
      const char = normGuess[i];
      if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
        result[i] = 'present';
        targetLetterCounts[char]--;
      }
    }
  }

  return result;
}

// Palavras-alvo extraídas do léxico oficial pt-br (fserb/pt-br)
export const TARGET_WORDS: string[] = lexiconData.targetWords;

// Conjunto de todos os palpites válidos aceitos (11.302 palavras de 5 letras)
export const VALID_GUESSES: Set<string> = new Set(lexiconData.validGuesses);

export function isValidWord(word: string): boolean {
  const norm = normalizeWord(word);
  if (norm.length !== 5) return false;
  return VALID_GUESSES.has(norm);
}

export function getRandomTargetWord(): string {
  const randomIndex = Math.floor(Math.random() * TARGET_WORDS.length);
  return TARGET_WORDS[randomIndex];
}
