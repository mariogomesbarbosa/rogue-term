// Motor PRNG Determinístico (Mulberry32) para Rogue Term
// Permite partidas com Seed e o Desafio Diário (Daily Run) perfeitamente reproduzíveis

export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a: number): () => number {
  let state = a >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SeededRNG {
  private nextFloat: () => number;
  public readonly seed: string;

  constructor(seed: string | number) {
    this.seed = String(seed);
    const numericSeed = typeof seed === 'number' ? seed : hashSeed(this.seed);
    this.nextFloat = mulberry32(numericSeed);
  }

  // Retorna float entre [0, 1)
  next(): number {
    return this.nextFloat();
  }

  // Retorna inteiro entre [min, max] inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Seleciona um item aleatório de um array
  pick<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Não é possível selecionar de um array vazio');
    }
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  // Embaralha um array de forma determinística (Fisher-Yates)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }
}

// Retorna a seed do dia no formato ISO local YYYY-MM-DD
export function getDailySeed(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Formata seed de data para exibição elegante: "01/10/2026"
export function formatDailyDate(seed: string): string {
  const parts = seed.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return seed;
}
