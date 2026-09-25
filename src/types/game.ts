export type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd' | 'probed_hit' | 'probed_miss';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface EvaluatedLetter {
  char: string;
  status: TileStatus;
}

export interface EvaluatedRow {
  letters: EvaluatedLetter[];
  submittedAt: number;
}

export type SkillType = 'active' | 'passive';

export interface SkillCard {
  id: string;
  name: string;
  type: SkillType;
  rarity: Rarity;
  powerScore: number;
  description: string;
  tagline: string;
  chargesMax: number;
  chargesCurrent: number;
  iconName: string;
  rechargeEveryRounds?: number;
}

export type GamePhase = 'playing' | 'round_won' | 'drafting' | 'game_over';

export interface GameStats {
  wordsSolved: number;
  totalGuessesUsed: number;
  highestRound: number;
  totalScore: number;
  skillsUsedCount: number;
}
