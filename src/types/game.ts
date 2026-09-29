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

export type GamePhase = 'playing' | 'round_won' | 'drafting' | 'shop' | 'game_over' | 'victory';

export interface ShopItem {
  id: string;
  type: 'card' | 'key_refill' | 'max_keys_upgrade';
  price: number;
  card?: SkillCard;
  title: string;
  description: string;
  iconName: string;
  bought: boolean;
}

export interface RoundEarnings {
  baseReward: number;
  efficiencyBonus: number;
  bossBonus: number;
  goldSwitchBonus: number;
  interest: number;
  total: number;
}

export interface LensHint {
  char: string;
  rowIndex: number;
  colIndex: number;
  direction: 'left' | 'right' | 'both';
  targetColumns: number[];
}

export type BossAnomalyId = 'key_jam' | 'switch_ghosting' | 'glitched_crt' | 'power_surge';

export interface BossAnomaly {
  id: BossAnomalyId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  anomaly: BossAnomaly;
  disabledLetters?: string[];
}

export interface GameStats {
  wordsSolved: number;
  totalGuessesUsed: number;
  highestRound: number;
  totalScore: number;
  skillsUsedCount: number;
}
