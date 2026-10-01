import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GamePhase, EvaluatedRow, SkillCard, TileStatus, Boss, ShopItem, RoundEarnings, LensHint, RoundScoreDetails, CareerStats } from '@/types/game';
import { getRandomTargetWord, evaluateGuess, normalizeWord, isValidWord, getCanonicalWord } from '@/data/words';
import { ALL_SKILLS, getRandomDraftChoices, generateShopItems, getCardSellValue } from '@/data/skills';
import { generateBossForSector } from '@/data/bosses';
import confetti from 'canvas-confetti';
import { sound } from '@/utils/sound';

interface TargetingState {
  skillId: string;
  step: 'select_tile' | 'choose_replacement' | 'select_swap_second' | 'select_probe_letters';
  rowIndex?: number;
  colIndex?: number;
  selectedLetters?: string[];
}

interface GameState {
  keys: number;
  maxKeys: number;
  score: number;
  coins: number;
  round: number;
  sector: number;
  stage: number;
  maxSectors: number;
  currentBoss: Boss | null;
  endlessMode: boolean;
  streak: number;
  targetWord: string;
  guesses: string[];
  evaluations: EvaluatedRow[];
  currentGuess: string[];
  activeTileCol: number;
  gamePhase: GamePhase;
  activeSkills: SkillCard[];
  passives: SkillCard[];
  draftChoices: SkillCard[];
  shopItems: ShopItem[];
  rerollCost: number;
  lastRoundEarnings: RoundEarnings | null;
  roundStartTime: number;
  lastRoundDuration: number;
  lastRoundScoreDetails: RoundScoreDetails | null;
  lensHint: LensHint | null;
  crtEnabled: boolean;
  soundEnabled: boolean;
  notification: string | null;
  shakeBoard: boolean;
  keyboardStatus: Record<string, TileStatus>;
  targetingState: TargetingState | null;

  // Carreira e Compêndio (Codex)
  careerStats: CareerStats;
  discoveredSkillIds: string[];
  isCodexOpen: boolean;
  openCodex: () => void;
  closeCodex: () => void;

  // Ações
  startNewRun: () => void;
  startNextRound: () => void;
  continueEndless: () => void;
  proceedFromRoundWin: () => void;
  buyShopItem: (itemId: string) => void;
  sellSkillCard: (cardId: string) => void;
  rerollShop: () => void;
  closeShopAndNextRound: () => void;
  setActiveTileCol: (col: number) => void;
  moveCursor: (direction: 'left' | 'right') => void;
  addLetter: (char: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  activateSkill: (skillId: string) => void;
  cancelTargeting: () => void;
  toggleProbeLetter: (letter: string) => void;
  executeProbe: (customLetters?: string[]) => void;
  applyRetroEdit: (rowIndex: number, colIndex: number, newChar: string) => void;
  applySwapLetters: (rowIndex: number, col1: number, col2: number) => void;
  applyThermalLens: (rowIndex: number, colIndex: number) => void;
  applyThermalLensByKey: (key: string) => void;
  chooseDraftCard: (card: SkillCard) => void;
  toggleCrt: () => void;
  toggleSound: () => void;
  setNotification: (msg: string | null) => void;
}

function consumeSkillCharge(activeSkills: SkillCard[], skillId: string): SkillCard[] {
  return activeSkills
    .map(s => (s.id === skillId ? { ...s, chargesCurrent: s.chargesCurrent - 1 } : s))
    .filter(s => s.chargesCurrent > 0);
}

function updateKeyboardStatus(
  currentKeyboard: Record<string, TileStatus>,
  evaluatedRow: EvaluatedRow
): Record<string, TileStatus> {
  const updated = { ...currentKeyboard };
  evaluatedRow.letters.forEach(({ char, status }) => {
    const keyChar = normalizeWord(char);
    const currentStatus = updated[keyChar];
    if (status === 'correct') {
      updated[keyChar] = 'correct';
    } else if (status === 'present' && currentStatus !== 'correct') {
      updated[keyChar] = 'present';
    } else if (status === 'absent') {
      if (currentStatus !== 'correct' && currentStatus !== 'present' && currentStatus !== 'probed_hit') {
        updated[keyChar] = 'absent';
      }
    }
  });
  return updated;
}

interface RoundWinParams {
  state: GameState;
  newGuesses: string[];
  newEvaluations: EvaluatedRow[];
  updatedKeyboard: Record<string, TileStatus>;
  updatedSkills?: SkillCard[];
  guessIndex: number;
  remainingKeys: number;
  customWinMessage?: string;
}

function calculateRoundWinState({
  state,
  newGuesses,
  newEvaluations,
  updatedKeyboard,
  updatedSkills,
  guessIndex,
  remainingKeys,
  customWinMessage
}: RoundWinParams): Partial<GameState> {
  try {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  } catch {
    // No-op if confetti fails
  }
  setTimeout(() => sound.playVictoryFanfare(), 850);

  const { targetWord, passives, maxKeys, round, streak, score, activeSkills, sector, stage, maxSectors, endlessMode, currentBoss } = state;

  const isBossFight = stage === 3 && !!currentBoss;

  // Cálculo de Teclas restauradas
  let keysRestored = 2;
  if (guessIndex === 1) keysRestored = 6;
  else if (guessIndex === 2) keysRestored = 5;
  else if (guessIndex === 3) keysRestored = 4;
  else if (guessIndex === 4) keysRestored = 3;

  // Bônus épico de Teclas ao derrotar o Chefe!
  if (isBossFight) {
    keysRestored += 3;
  }

  // Passiva: Switch Dourado (Letras raras dão +2 teclas extras)
  const hasGoldSwitch = passives.some(p => p.id === 'switch_dourado');
  const hasRareLetter = /[XZKWYJ]/.test(normalizeWord(targetWord));
  if (hasGoldSwitch && hasRareLetter) {
    keysRestored += 2;
  }

  // Cálculo do Tempo gasto na rodada
  const now = Date.now();
  const startTime = state.roundStartTime || now;
  const rawDuration = Math.max(1, Math.round((now - startTime) / 1000));

  // Faixas de velocidade e bônus de tempo base
  let speedTier: 'ultra' | 'fast' | 'steady' | 'tactical' = 'tactical';
  let speedLabel = 'Tático (>60s)';
  let baseTimeBonus = 100;
  let timeMultiplierBonus = 0.0;

  if (rawDuration <= 15) {
    speedTier = 'ultra';
    speedLabel = 'Ultra Rápido (≤15s)';
    baseTimeBonus = 1200;
    timeMultiplierBonus = 0.5;
  } else if (rawDuration <= 30) {
    speedTier = 'fast';
    speedLabel = 'Ágil (≤30s)';
    baseTimeBonus = 700;
    timeMultiplierBonus = 0.25;
  } else if (rawDuration <= 60) {
    speedTier = 'steady';
    speedLabel = 'Constante (≤60s)';
    baseTimeBonus = 350;
    timeMultiplierBonus = 0.1;
  }

  const timeSkillNotes: string[] = [];

  // Passiva: Cronômetro de Quartzo (se <= 30s, dobra bônus de tempo e ganha +$2)
  const hasCronometroQuartzo = passives.some(p => p.id === 'cronometro_quartzo');
  let timeBonus = baseTimeBonus;
  let timeBonusCredits = 0;
  if (hasCronometroQuartzo && rawDuration <= 30) {
    timeBonus = baseTimeBonus * 2;
    timeBonusCredits = 2;
    timeSkillNotes.push('Cronômetro de Quartzo: Bônus de tempo dobrado e +$2 Créditos!');
  }

  // Passiva: Overclock de Switch (se <= 20s, +0.6x multiplicador e +2 Teclas extras)
  const hasOverclock = passives.some(p => p.id === 'overclock_switch');
  if (hasOverclock && rawDuration <= 20) {
    timeMultiplierBonus += 0.6;
    keysRestored += 2;
    timeSkillNotes.push('Overclock de Switch: +0.6x Multiplicador e +2 Teclas [T] extras!');
  }

  const newKeys = Math.min(maxKeys, remainingKeys + keysRestored);

  // Cálculo de Pontuação (Chefes concedem bônus robusto)
  const basePoints = round * 1000;
  const guessBonus = (6 - Math.min(6, guessIndex)) * 250;
  const bossBonusPoints = isBossFight ? 2500 : 0;
  const totalBase = basePoints + guessBonus + bossBonusPoints + timeBonus;

  let multiplier = 1.0;
  if (guessIndex === 1) multiplier = 4.0;
  else if (guessIndex === 2) multiplier = 2.5;
  else if (guessIndex === 3) multiplier = 1.8;
  else if (guessIndex === 4) multiplier = 1.2;

  multiplier += timeMultiplierBonus;

  // Passiva: RGB Sincronizado
  const hasRgb = passives.some(p => p.id === 'rgb_sincronizado');
  if (hasRgb) {
    multiplier += (streak + 1) * 0.3;
  }

  multiplier = Math.round(multiplier * 100) / 100;
  const roundPoints = Math.round(totalBase * multiplier);
  const newScore = score + roundPoints;
  const newStreak = streak + 1;

  // Economia de Créditos ($)
  const baseReward = 3;
  const efficiencyBonus = Math.max(0, 6 - guessIndex);
  const bossBonus = isBossFight ? 5 : 0;
  const goldSwitchBonus = hasGoldSwitch && hasRareLetter ? 4 : 0;
  const currentCoins = state.coins ?? 4;
  const interest = Math.min(5, Math.floor(currentCoins / 5));
  const totalCoinsEarned = baseReward + efficiencyBonus + bossBonus + goldSwitchBonus + timeBonusCredits + interest;
  const newCoins = currentCoins + totalCoinsEarned;

  const roundEarnings: RoundEarnings = {
    baseReward,
    efficiencyBonus,
    bossBonus,
    goldSwitchBonus,
    timeBonusCredits,
    interest,
    total: totalCoinsEarned
  };

  const scoreDetails: RoundScoreDetails = {
    basePoints,
    guessBonus,
    bossBonus: bossBonusPoints,
    timeBonus,
    timeSeconds: rawDuration,
    speedTier,
    speedLabel,
    multiplier,
    totalRoundPoints: roundPoints,
    timeSkillNotes
  };

  const currentSkills = updatedSkills || activeSkills;
  const existingIds = [
    ...currentSkills.map(s => s.id),
    ...passives.map(s => s.id)
  ];
  const newShopItems = generateShopItems(existingIds, sector);

  // Agora vamos sempre para 'round_won' para mostrar a tela de vitória com a palavra, tempo e pontos!
  const isFinalVictory = isBossFight && sector >= maxSectors && !endlessMode;
  const nextGamePhase: GamePhase = 'round_won';

  let winMessage = customWinMessage;
  if (!winMessage) {
    if (isFinalVictory) {
      winMessage = `🏆 VITÓRIA DO SISTEMA! O Mainframe Central foi derrotado no Setor ${sector}!`;
    } else if (isBossFight) {
      winMessage = `💥 CHEFE DERROTADO! +${keysRestored} Teclas, +$${totalCoinsEarned} e +${roundPoints} Pontos!`;
    } else {
      winMessage = `Excelente! +${keysRestored} Teclas [T], +$${totalCoinsEarned} e +${roundPoints} Pontos!`;
    }
  }

  // Atualizar Estatísticas da Carreira e Descobertas
  const currentCareerStats = state.careerStats || {
    gamesPlayed: 0,
    gamesWon: 0,
    wordsSolved: 0,
    highScore: 0,
    highestSector: 1,
    maxStreak: 0,
    currentStreak: 0,
    bossesDefeated: 0,
    guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
  };

  const newDist = { ...(currentCareerStats.guessDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }) };
  const clampedGuess = String(Math.min(6, Math.max(1, guessIndex))) as '1' | '2' | '3' | '4' | '5' | '6';
  newDist[clampedGuess] = (newDist[clampedGuess] || 0) + 1;

  const nextCareerStreak = currentCareerStats.currentStreak + 1;
  const updatedCareerStats: CareerStats = {
    ...currentCareerStats,
    wordsSolved: currentCareerStats.wordsSolved + 1,
    highScore: Math.max(currentCareerStats.highScore, newScore),
    highestSector: Math.max(currentCareerStats.highestSector, sector),
    currentStreak: nextCareerStreak,
    maxStreak: Math.max(currentCareerStats.maxStreak, nextCareerStreak),
    bossesDefeated: currentCareerStats.bossesDefeated + (isBossFight ? 1 : 0),
    gamesWon: currentCareerStats.gamesWon + (isFinalVictory ? 1 : 0),
    gamesPlayed: currentCareerStats.gamesPlayed + (isFinalVictory ? 1 : 0),
    guessDistribution: newDist
  };

  const currentDiscovered = state.discoveredSkillIds || ['ctrl_z', 'sonda_circuito'];
  const newDiscoveredIds = newShopItems
    .filter(i => i.type === 'card' && i.card)
    .map(i => i.card!.id);
  const updatedDiscovered = Array.from(new Set([...currentDiscovered, ...newDiscoveredIds]));

  return {
    guesses: newGuesses,
    evaluations: newEvaluations,
    currentGuess: ['', '', '', '', ''],
    activeTileCol: 0,
    keys: newKeys,
    score: newScore,
    coins: newCoins,
    streak: newStreak,
    keyboardStatus: updatedKeyboard,
    shopItems: newShopItems,
    rerollCost: 2,
    lastRoundEarnings: roundEarnings,
    lastRoundDuration: rawDuration,
    lastRoundScoreDetails: scoreDetails,
    gamePhase: nextGamePhase,
    targetingState: null,
    careerStats: updatedCareerStats,
    discoveredSkillIds: updatedDiscovered,
    ...(updatedSkills ? { activeSkills: updatedSkills } : {}),
    notification: winMessage
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      keys: 15,
      maxKeys: 20,
      score: 0,
      coins: 4,
      round: 1,
      sector: 1,
      stage: 1,
      maxSectors: 8,
      currentBoss: null,
      endlessMode: false,
      streak: 0,
      targetWord: getRandomTargetWord(),
      guesses: [],
      evaluations: [],
      currentGuess: ['', '', '', '', ''],
      activeTileCol: 0,
      gamePhase: 'playing',
      // Começamos o jogador com o icônico Ctrl+Z e a Sonda de Circuito para testar na hora!
      activeSkills: [
        { ...ALL_SKILLS.find(s => s.id === 'ctrl_z')! },
        { ...ALL_SKILLS.find(s => s.id === 'sonda_circuito')! }
      ],
      passives: [],
      draftChoices: [],
      shopItems: [],
      rerollCost: 2,
      lastRoundEarnings: null,
      roundStartTime: Date.now(),
      lastRoundDuration: 0,
      lastRoundScoreDetails: null,
      lensHint: null,
      crtEnabled: true,
      soundEnabled: true,
      notification: null,
      shakeBoard: false,
      keyboardStatus: {},
      targetingState: null,

      careerStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        wordsSolved: 0,
        highScore: 0,
        highestSector: 1,
        maxStreak: 0,
        currentStreak: 0,
        bossesDefeated: 0,
        guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
      },
      discoveredSkillIds: ['ctrl_z', 'sonda_circuito'],
      isCodexOpen: false,
      openCodex: () => set({ isCodexOpen: true }),
      closeCodex: () => set({ isCodexOpen: false }),

      startNewRun: () => {
        const { careerStats, guesses } = get();
        const currentStats = careerStats || {
          gamesPlayed: 0,
          gamesWon: 0,
          wordsSolved: 0,
          highScore: 0,
          highestSector: 1,
          maxStreak: 0,
          currentStreak: 0,
          bossesDefeated: 0,
          guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
        };
        const updatedCareerStats: CareerStats = {
          ...currentStats,
          gamesPlayed: guesses && guesses.length > 0 ? currentStats.gamesPlayed + 1 : currentStats.gamesPlayed,
          currentStreak: 0
        };

        const firstWord = getRandomTargetWord();
        set({
          careerStats: updatedCareerStats,
          keys: 15,
          maxKeys: 20,
          score: 0,
          coins: 4,
          round: 1,
          sector: 1,
          stage: 1,
          maxSectors: 8,
          currentBoss: null,
          endlessMode: false,
          streak: 0,
          targetWord: firstWord,
          guesses: [],
          evaluations: [],
          currentGuess: ['', '', '', '', ''],
          activeTileCol: 0,
          gamePhase: 'playing',
          activeSkills: [
            { ...ALL_SKILLS.find(s => s.id === 'ctrl_z')! },
            { ...ALL_SKILLS.find(s => s.id === 'sonda_circuito')! }
          ],
          passives: [],
          draftChoices: [],
          shopItems: [],
          rerollCost: 2,
          lastRoundEarnings: null,
          roundStartTime: Date.now(),
          lastRoundDuration: 0,
          lastRoundScoreDetails: null,
          lensHint: null,
          notification: 'Setor 1 iniciado! Suas Teclas [T] são o seu fôlego.',
          shakeBoard: false,
          keyboardStatus: {},
          targetingState: null
        });
      },

      proceedFromRoundWin: () => {
        const { stage, sector, maxSectors, endlessMode, currentBoss } = get();
        const isBossFight = stage === 3 && !!currentBoss;
        const isFinalVictory = isBossFight && sector >= maxSectors && !endlessMode;
        if (isFinalVictory) {
          set({ gamePhase: 'victory' });
        } else {
          set({ gamePhase: 'shop' });
        }
      },

      continueEndless: () => {
        const { sector, round, activeSkills, passives } = get();
        const nextSector = sector + 1;
        const nextWord = getRandomTargetWord();
        const existingIds = [
          ...activeSkills.map(s => s.id),
          ...passives.map(s => s.id)
        ];
        const newShopItems = generateShopItems(existingIds, nextSector);

        set({
          endlessMode: true,
          sector: nextSector,
          stage: 1,
          round: round + 1,
          currentBoss: null,
          targetWord: nextWord,
          guesses: [],
          evaluations: [],
          currentGuess: ['', '', '', '', ''],
          activeTileCol: 0,
          gamePhase: 'shop',
          draftChoices: [],
          shopItems: newShopItems,
          rerollCost: 2,
          roundStartTime: Date.now(),
          lastRoundDuration: 0,
          lastRoundScoreDetails: null,
          lensHint: null,
          keyboardStatus: {},
          targetingState: null,
          notification: `MODO INFINITO! Bem-vindo ao Mercado do Setor ${nextSector}!`
        });
      },

      buyShopItem: (itemId: string) => {
        const { shopItems, coins, activeSkills, passives, keys, maxKeys } = get();
        const item = shopItems.find(i => i.id === itemId);
        if (!item || item.bought) return;

        if (coins < item.price) {
          sound.playErrorBuzz();
          set({
            notification: `Créditos insuficientes! Você tem $${coins}, mas precisa de $${item.price}.`,
            shakeBoard: true
          });
          setTimeout(() => set({ shakeBoard: false }), 400);
          return;
        }

        if (item.type === 'card' && item.card) {
          const card = item.card;
          if (card.type === 'active') {
            if (activeSkills.length >= 3) {
              sound.playErrorBuzz();
              set({
                notification: 'Slots de Cartas Ativas cheios (3/3)! Venda uma carta antes de comprar outra.',
                shakeBoard: true
              });
              setTimeout(() => set({ shakeBoard: false }), 400);
              return;
            }
            sound.playCoinCollect();
            set({
              coins: coins - item.price,
              activeSkills: [...activeSkills, card],
              shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
              notification: `Adquirido: [${card.name}] por $${item.price}!`
            });
          } else {
            if (passives.length >= 5) {
              sound.playErrorBuzz();
              set({
                notification: 'Slots de Relíquias Passivas cheios (5/5)! Venda uma relíquia antes de comprar outra.',
                shakeBoard: true
              });
              setTimeout(() => set({ shakeBoard: false }), 400);
              return;
            }
            // Efeito imediato: Keycaps PBT Reforçadas (+10 maxKeys, +3 keys)
            let updatedMaxKeys = maxKeys;
            let updatedKeys = keys;
            if (card.id === 'keycaps_pbt') {
              updatedMaxKeys += 10;
              updatedKeys = Math.min(updatedMaxKeys, keys + 3);
            }

            sound.playCoinCollect();
            set({
              coins: coins - item.price,
              passives: [...passives, card],
              maxKeys: updatedMaxKeys,
              keys: updatedKeys,
              shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
              notification: `Instalado: [${card.name}] por $${item.price}!`
            });
          }
        } else if (item.type === 'key_refill') {
          sound.playCoinCollect();
          const newKeys = Math.min(maxKeys, keys + 3);
          set({
            coins: coins - item.price,
            keys: newKeys,
            shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
            notification: `Manutenção realizada! +3 Teclas [T] restauradas por $${item.price}.`
          });
        } else if (item.type === 'max_keys_upgrade') {
          sound.playCoinCollect();
          const newMax = maxKeys + 5;
          const newKeys = keys + 5;
          set({
            coins: coins - item.price,
            maxKeys: newMax,
            keys: newKeys,
            shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
            notification: `Chassi reforçado! Teto de Teclas expandido para ${newMax} por $${item.price}!`
          });
        }
      },

      sellSkillCard: (cardId: string) => {
        const { activeSkills, passives, coins } = get();
        const activeCard = activeSkills.find(s => s.id === cardId);
        const passiveCard = passives.find(s => s.id === cardId);
        const card = activeCard || passiveCard;
        if (!card) return;

        const sellValue = getCardSellValue(card.rarity);
        sound.playCoinCollect();

        if (activeCard) {
          set({
            activeSkills: activeSkills.filter(s => s.id !== cardId),
            coins: coins + sellValue,
            notification: `Vendido: [${card.name}] por +$${sellValue}!`
          });
        } else if (passiveCard) {
          set({
            passives: passives.filter(s => s.id !== cardId),
            coins: coins + sellValue,
            notification: `Desinstalado: [${card.name}] por +$${sellValue}!`
          });
        }
      },

      rerollShop: () => {
        const { coins, rerollCost, sector, activeSkills, passives } = get();
        if (coins < rerollCost) {
          sound.playErrorBuzz();
          set({
            notification: `Créditos insuficientes para Reroll! Custa $${rerollCost}.`,
            shakeBoard: true
          });
          setTimeout(() => set({ shakeBoard: false }), 400);
          return;
        }

        sound.playCoinCollect();
        const existingIds = [
          ...activeSkills.map(s => s.id),
          ...passives.map(s => s.id)
        ];
        const newItems = generateShopItems(existingIds, sector);

        set({
          coins: coins - rerollCost,
          rerollCost: rerollCost + 1,
          shopItems: newItems,
          notification: `Prateleira atualizada! (-$${rerollCost})`
        });
      },

      closeShopAndNextRound: () => {
        get().startNextRound();
      },

      startNextRound: () => {
        const { evaluations, passives, round, sector, stage } = get();
        const nextWord = getRandomTargetWord();
        const nextRound = round + 1;

        let nextSector = sector;
        let nextStage = stage + 1;
        let nextBoss: Boss | null = null;

        if (stage === 3) {
          nextSector = sector + 1;
          nextStage = 1;
        } else if (nextStage === 3) {
          nextBoss = generateBossForSector(nextSector, nextWord);
        }

        const newKeyboardStatus: Record<string, TileStatus> = {};

        // Passiva: Circuito Duplo (Eco) - Letras verdes da palavra anterior que existam na nova palavra começam reveladas
        const hasEco = passives.some(p => p.id === 'eco_grafema');
        if (hasEco && evaluations.length > 0) {
          const lastEval = evaluations[evaluations.length - 1];
          const normNext = normalizeWord(nextWord);
          lastEval.letters.forEach(l => {
            const normChar = normalizeWord(l.char);
            if (l.status === 'correct' && normNext.includes(normChar)) {
              newKeyboardStatus[normChar] = 'correct';
            }
          });
        }

        const notificationMsg = nextBoss
          ? `⚠️ ALERTA DE CHEFE: ${nextBoss.name} detectado! ${nextBoss.anomaly.tagline}`
          : `Setor ${nextSector} - Fase ${nextStage}/3 iniciada!`;

        if (nextBoss) {
          sound.playBossAlert();
        }

        set({
          round: nextRound,
          sector: nextSector,
          stage: nextStage,
          currentBoss: nextBoss,
          targetWord: nextWord,
          guesses: [],
          evaluations: [],
          currentGuess: ['', '', '', '', ''],
          activeTileCol: 0,
          gamePhase: 'playing',
          draftChoices: [],
          roundStartTime: Date.now(),
          lastRoundDuration: 0,
          lastRoundScoreDetails: null,
          keyboardStatus: newKeyboardStatus,
          targetingState: null,
          lensHint: null,
          notification: notificationMsg
        });
      },

      setActiveTileCol: (col: number) => {
        if (col >= 0 && col < 5) {
          set({ activeTileCol: col });
        }
      },

      moveCursor: (direction: 'left' | 'right') => {
        const { activeTileCol } = get();
        if (direction === 'left') {
          set({ activeTileCol: Math.max(0, activeTileCol - 1) });
        } else {
          set({ activeTileCol: Math.min(4, activeTileCol + 1) });
        }
      },

      addLetter: (char: string) => {
        const { currentGuess, activeTileCol, gamePhase, targetingState, currentBoss } = get();
        if (gamePhase !== 'playing' || targetingState) return;

        const clean = normalizeWord(char);
        if (/^[A-Z]$/.test(clean)) {
          // Checar anomalia de Chefe: Bug do Teclado (Key Jam)
          if (currentBoss?.disabledLetters?.includes(clean)) {
            sound.playErrorBuzz();
            set({
              notification: `⚠️ Tecla [${clean}] emperrada pelo Bug do Teclado (${currentBoss.name})!`,
              shakeBoard: true
            });
            setTimeout(() => set({ shakeBoard: false }), 450);
            return;
          }

          sound.playKeyThock(clean);

          const updatedGuess = [...currentGuess];
          updatedGuess[activeTileCol] = clean;

          // Encontra a próxima coluna vazia à direita ou a primeira vazia
          let nextCol = activeTileCol + 1;
          if (nextCol > 4) {
            const firstEmpty = updatedGuess.findIndex(c => !c);
            nextCol = firstEmpty !== -1 ? firstEmpty : 4;
          } else if (updatedGuess[nextCol]) {
            const nextEmpty = updatedGuess.findIndex((c, i) => i > activeTileCol && !c);
            if (nextEmpty !== -1) {
              nextCol = nextEmpty;
            }
          }

          set({
            currentGuess: updatedGuess,
            activeTileCol: Math.min(4, Math.max(0, nextCol))
          });
        }
      },

      removeLetter: () => {
        const { currentGuess, activeTileCol, gamePhase, targetingState } = get();
        if (gamePhase !== 'playing' || targetingState) return;

        sound.playBackspaceClack();

        const updatedGuess = [...currentGuess];

        if (updatedGuess[activeTileCol]) {
          // Se a posição atual tem letra, apaga ela e mantém o cursor aqui
          updatedGuess[activeTileCol] = '';
          set({ currentGuess: updatedGuess });
        } else if (activeTileCol > 0) {
          // Se a posição atual já está vazia, volta 1 posição e apaga a de trás
          const prevCol = activeTileCol - 1;
          updatedGuess[prevCol] = '';
          set({ currentGuess: updatedGuess, activeTileCol: prevCol });
        }
      },

      submitGuess: () => {
        const {
          currentGuess,
          targetWord,
          guesses,
          evaluations,
          keys,
          gamePhase,
          keyboardStatus,
          passives,
          currentBoss
        } = get();

        if (gamePhase !== 'playing') return;

        const rawGuessWord = currentGuess.join('');

        if (currentGuess.some(c => !c) || rawGuessWord.length < 5) {
          sound.playErrorBuzz();
          set({ notification: 'Preencha todas as 5 letras!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Validação no léxico
        if (!isValidWord(rawGuessWord)) {
          sound.playErrorBuzz();
          set({ notification: 'Palavra não encontrada no dicionário!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Checar anomalia de Chefe: Protocolo Estrito (Modo Hardcore)
        if (currentBoss?.anomaly.id === 'hard_mode' && evaluations.length > 0) {
          const normGuess = normalizeWord(rawGuessWord);

          // 1. Letras verdes anteriores devem permanecer na mesma posição
          for (let r = 0; r < evaluations.length; r++) {
            const row = evaluations[r];
            for (let c = 0; c < row.letters.length; c++) {
              if (row.letters[c].status === 'correct') {
                const requiredChar = normalizeWord(row.letters[c].char);
                if (normGuess[c] !== requiredChar) {
                  sound.playErrorBuzz();
                  set({
                    notification: `Protocolo Estrito: A posição ${c + 1} deve manter a letra verde '${requiredChar}'!`,
                    shakeBoard: true
                  });
                  setTimeout(() => set({ shakeBoard: false }), 500);
                  return;
                }
              }
            }
          }

          // 2. Letras amarelas anteriores devem estar presentes no palpite
          const presentChars = new Set<string>();
          for (let r = 0; r < evaluations.length; r++) {
            const row = evaluations[r];
            for (let c = 0; c < row.letters.length; c++) {
              if (row.letters[c].status === 'present') {
                presentChars.add(normalizeWord(row.letters[c].char));
              }
            }
          }
          for (const char of presentChars) {
            if (!normGuess.includes(char)) {
              sound.playErrorBuzz();
              set({
                notification: `Protocolo Estrito: A letra amarela '${char}' deve ser incluída no palpite!`,
                shakeBoard: true
              });
              setTimeout(() => set({ shakeBoard: false }), 500);
              return;
            }
          }

          // 3. Letras cinzas confirmadas não podem ser reutilizadas
          for (let r = 0; r < evaluations.length; r++) {
            const row = evaluations[r];
            for (let c = 0; c < row.letters.length; c++) {
              if (row.letters[c].status === 'absent') {
                const absentChar = normalizeWord(row.letters[c].char);
                if (!presentChars.has(absentChar) && normGuess.includes(absentChar)) {
                  const isGreenElsewhere = evaluations.some(ev =>
                    ev.letters.some(l => l.status === 'correct' && normalizeWord(l.char) === absentChar)
                  );
                  if (!isGreenElsewhere) {
                    sound.playErrorBuzz();
                    set({
                      notification: `Protocolo Estrito: A letra cinza '${absentChar}' já foi descartada e não pode ser usada!`,
                      shakeBoard: true
                    });
                    setTimeout(() => set({ shakeBoard: false }), 500);
                    return;
                  }
                }
              }
            }
          }
        }

        // Submissão válida: Som pesado de Enter
        sound.playEnterThock();

        // Obter a forma canônica com acentos se houver (ex: ALCAR -> ALÇAR, SAUDE -> SAÚDE)
        const guessWord = getCanonicalWord(rawGuessWord);

        // Checar passiva: Buffer de Teclado (Primeiro palpite grátis se acertar 2+ letras)
        const hasBuffer = passives.some(p => p.id === 'buffer_teclado');
        let evalStatuses = evaluateGuess(guessWord, targetWord);

        // Checar anomalia de Chefe: Ghosting de Switch ou Kernel Panic (letras amarelas viram ausentes)
        if (currentBoss?.anomaly.id === 'switch_ghosting' || currentBoss?.anomaly.id === 'kernel_panic') {
          evalStatuses = evalStatuses.map(s => (s === 'present' ? 'absent' : s));
        }

        // Tocar avaliação sequencial de cada letra (flip e tons harmoniosos)
        evalStatuses.forEach((st, idx) => {
          setTimeout(() => sound.playLetterEvaluation(st, idx), idx * 110 + 180);
        });

        const correctOrPresentCount = evalStatuses.filter(s => s !== 'absent').length;
        const isFreeGuess = hasBuffer && guesses.length === 0 && correctOrPresentCount >= 2;

        // Checar anomalia de Chefe: Sobrecarga de Circuito ou Kernel Panic (consome 2 teclas por palpite incorreto)
        const isPowerSurge = currentBoss?.anomaly.id === 'power_surge' || currentBoss?.anomaly.id === 'kernel_panic';
        const baseCost = isPowerSurge ? 2 : 1;

        // Checar anomalia de Chefe: Curto-Circuito (0 acertos em um palpite incorreto queima +2 teclas extras)
        const isWin = normalizeWord(guessWord) === normalizeWord(targetWord);
        const isShortCircuit = currentBoss?.anomaly.id === 'short_circuit' && correctOrPresentCount === 0 && !isWin;
        const extraCost = isShortCircuit ? 2 : 0;

        const keysCost = isFreeGuess ? 0 : (baseCost + extraCost);
        const remainingKeys = keys - keysCost;

        // Construir linha avaliada
        const evaluatedRow: EvaluatedRow = {
          letters: guessWord.split('').map((char, i) => ({
            char,
            status: evalStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses, guessWord];
        const newEvaluations = [...evaluations, evaluatedRow];

        // Atualizar status do teclado
        const updatedKeyboard = updateKeyboardStatus(keyboardStatus, evaluatedRow);

        if (isWin) {
          const winState = calculateRoundWinState({
            state: get(),
            newGuesses,
            newEvaluations,
            updatedKeyboard,
            guessIndex: newGuesses.length,
            remainingKeys
          });
          set(winState);
          return;
        }

        // Helper para atualizar derrota nas estatísticas de carreira
        const recordDefeatStats = (): CareerStats => {
          const currentStats = get().careerStats || {
            gamesPlayed: 0,
            gamesWon: 0,
            wordsSolved: 0,
            highScore: 0,
            highestSector: 1,
            maxStreak: 0,
            currentStreak: 0,
            bossesDefeated: 0,
            guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
          };
          return {
            ...currentStats,
            gamesPlayed: currentStats.gamesPlayed + 1,
            currentStreak: 0
          };
        };

        // Verificar derrota por limite de 6 tentativas preenchidas no grid
        if (newGuesses.length >= 6) {
          sound.playGameOver();
          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: ['', '', '', '', ''],
            activeTileCol: 0,
            keys: remainingKeys,
            keyboardStatus: updatedKeyboard,
            gamePhase: 'game_over',
            careerStats: recordDefeatStats(),
            notification: `Tentativas esgotadas! A palavra era ${targetWord}.`
          });
          return;
        }

        // Verificar derrota por falta de Teclas
        if (remainingKeys <= 0) {
          sound.playGameOver();
          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: ['', '', '', '', ''],
            activeTileCol: 0,
            keys: 0,
            keyboardStatus: updatedKeyboard,
            gamePhase: 'game_over',
            careerStats: recordDefeatStats(),
            notification: `Suas Teclas acabaram! A palavra era ${targetWord}.`
          });
          return;
        }

        const roundNotification = isShortCircuit
          ? '⚡ CURTO-CIRCUITO! Nenhuma letra acertada: -2 Teclas extras queimadas!'
          : isFreeGuess
          ? 'Buffer ativado! Tentativa grátis.'
          : null;

        // Continua jogando a rodada
        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          currentGuess: ['', '', '', '', ''],
          activeTileCol: 0,
          keys: remainingKeys,
          keyboardStatus: updatedKeyboard,
          notification: roundNotification,
          shakeBoard: isShortCircuit
        });
        if (isShortCircuit) {
          setTimeout(() => set({ shakeBoard: false }), 500);
        }
      },

      activateSkill: (skillId: string) => {
        const { activeSkills, targetWord, evaluations, guesses, keys, maxKeys, keyboardStatus, currentBoss } = get();

        // Checar anomalia de Chefe: Firewall Ativo (bloqueia todas as habilidades ativas)
        if (currentBoss?.anomaly.id === 'firewall_lock') {
          sound.playErrorBuzz();
          set({
            notification: '🛡️ FIREWALL ATIVO: Habilidades ativas bloqueadas pelo Chefe!',
            shakeBoard: true
          });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        const skill = activeSkills.find(s => s.id === skillId);
        if (!skill || skill.chargesCurrent <= 0) {
          sound.playErrorBuzz();
          set({ notification: 'Esta habilidade não possui cargas restantes!' });
          return;
        }

        // --- Ctrl+Z (Retro-Edição) ---
        if (skillId === 'ctrl_z') {
          if (evaluations.length === 0) {
            sound.playErrorBuzz();
            set({ notification: 'Você precisa ter feito pelo menos 1 palpite para usar o Ctrl+Z!' });
            return;
          }
          sound.playSkillActivate();
          set({
            targetingState: { skillId: 'ctrl_z', step: 'select_tile' },
            notification: 'Modo Ctrl+Z: Clique na letra de uma linha anterior que você deseja substituir!'
          });
          return;
        }

        // --- Shift Swap (Anagramador) ---
        if (skillId === 'anagramador') {
          if (evaluations.length === 0) {
            sound.playErrorBuzz();
            set({ notification: 'Faça um palpite primeiro para permutar letras!' });
            return;
          }
          sound.playSkillActivate();
          set({
            targetingState: { skillId: 'anagramador', step: 'select_tile' },
            notification: 'Selecione a 1ª letra da tentativa para trocar de posição.'
          });
          return;
        }

        // --- Backspace Quântico ---
        if (skillId === 'backspace_quantico') {
          if (evaluations.length === 0) {
            sound.playErrorBuzz();
            set({ notification: 'Nenhuma tentativa para apagar!' });
            return;
          }
          sound.playSkillActivate();
          const newEvals = evaluations.slice(0, -1);
          const newGuesses = guesses.slice(0, -1);
          const refundedKeys = Math.min(maxKeys, keys + 1);

          const updatedSkills = consumeSkillCharge(activeSkills, skillId);

          set({
            evaluations: newEvals,
            guesses: newGuesses,
            keys: refundedKeys,
            activeSkills: updatedSkills,
            notification: 'Backspace Quântico ativado! Última linha apagada e 1 Tecla [T] recuperada.'
          });
          return;
        }

        // --- Sonda de Circuito ---
        if (skillId === 'sonda_circuito') {
          sound.playSkillActivate();
          set({
            targetingState: {
              skillId: 'sonda_circuito',
              step: 'select_probe_letters',
              selectedLetters: []
            },
            notification: '📡 Modo Sonda: Clique em até 3 letras no teclado para escanear, ou confirme para escanear aleatórias!'
          });
          return;
        }

        // --- Keycap Iluminado ---
        if (skillId === 'keycap_iluminado') {
          const vowels = ['A', 'E', 'I', 'O', 'U'];
          const normTarget = normalizeWord(targetWord);
          const targetVowels = normTarget.split('').filter(char => vowels.includes(char));

          if (targetVowels.length === 0) {
            sound.playErrorBuzz();
            set({ notification: 'Esta palavra não contém vogais simples!' });
            return;
          }

          sound.playSkillActivate();
          const revealed = targetVowels[0];
          const updatedSkills = consumeSkillCharge(activeSkills, skillId);

          set({
            activeSkills: updatedSkills,
            keyboardStatus: { ...keyboardStatus, [revealed]: 'correct' },
            notification: `Keycap Iluminado! A vogal '${revealed}' brilha em Verde!`
          });
          return;
        }

        // --- Lente Térmica ---
        if (skillId === 'lente_termica') {
          if (evaluations.length === 0) {
            sound.playErrorBuzz();
            set({ notification: 'Faça um palpite primeiro para usar a Lente Térmica!' });
            return;
          }
          const hasYellow = evaluations.some(row => row.letters.some(l => l.status === 'present'));
          if (!hasYellow) {
            sound.playErrorBuzz();
            set({ notification: 'Nenhuma letra amarela encontrada para analisar com a Lente Térmica!' });
            return;
          }
          sound.playSkillActivate();
          set({
            targetingState: { skillId: 'lente_termica', step: 'select_tile' },
            notification: '🔍 Modo Lente Térmica: Clique em uma letra AMARELA (no tabuleiro ou teclado) para revelar sua direção!'
          });
          return;
        }

        // --- Buffer Congelado (Pausa no Clock) ---
        if (skillId === 'buffer_congelado') {
          sound.playSkillActivate();
          const updatedSkills = consumeSkillCharge(activeSkills, skillId);
          set({
            roundStartTime: Date.now(),
            activeSkills: updatedSkills,
            notification: '❄️ Buffer Congelado ativado! Cronômetro reiniciado para 0s — bônus de velocidade máxima garantido!'
          });
          return;
        }
      },

      cancelTargeting: () => {
        set({ targetingState: null, notification: 'Ação de habilidade cancelada.' });
      },

      toggleProbeLetter: (letter: string) => {
        const { targetingState, executeProbe } = get();
        if (!targetingState || targetingState.skillId !== 'sonda_circuito') return;

        const clean = letter.toUpperCase();
        const current = targetingState.selectedLetters || [];
        let updated: string[];

        if (current.includes(clean)) {
          updated = current.filter(l => l !== clean);
        } else {
          updated = [...current, clean];
        }

        if (updated.length >= 3) {
          executeProbe(updated);
        } else {
          set({
            targetingState: {
              ...targetingState,
              selectedLetters: updated
            },
            notification: `Sonda: ${updated.length}/3 letras selecionadas [${updated.join(', ')}]. Clique em mais ${3 - updated.length} ou [Escanear Agora].`
          });
        }
      },

      executeProbe: (customLetters?: string[]) => {
        const { activeSkills, targetWord, keyboardStatus, targetingState } = get();
        const skill = activeSkills.find(s => s.id === 'sonda_circuito');
        if (!skill || skill.chargesCurrent <= 0) return;

        let candidateLetters: string[] = [];
        const lettersToUse = customLetters || targetingState?.selectedLetters || [];

        if (lettersToUse.length > 0) {
          candidateLetters = lettersToUse.slice(0, 3);
        } else {
          const availableLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
          const untriedLetters = availableLetters.filter(
            l => !keyboardStatus[l] || keyboardStatus[l] === 'empty'
          );
          const shuffled = [...untriedLetters].sort(() => 0.5 - Math.random());
          candidateLetters = shuffled.slice(0, 3);
        }

        if (candidateLetters.length === 0) {
          set({ notification: 'Todas as letras já foram testadas!', targetingState: null });
          return;
        }

        const updatedKeyboard = { ...keyboardStatus };
        const hits: string[] = [];
        const misses: string[] = [];
        const normTarget = normalizeWord(targetWord);

        candidateLetters.forEach(char => {
          const normChar = normalizeWord(char);
          if (normTarget.includes(normChar)) {
            if (updatedKeyboard[normChar] !== 'correct' && updatedKeyboard[normChar] !== 'present') {
              updatedKeyboard[normChar] = 'probed_hit';
            }
            hits.push(normChar);
          } else {
            if (!updatedKeyboard[normChar]) {
              updatedKeyboard[normChar] = 'probed_miss';
            }
            misses.push(normChar);
          }
        });

        const updatedSkills = consumeSkillCharge(activeSkills, 'sonda_circuito');
        sound.playSkillActivate();

        let msg = '';
        if (hits.length > 0) {
          msg = `📡 Sonda de Circuito: [${hits.join(', ')}] CONFIRMADA(S) na palavra! (Marcadas em Ciano)`;
        } else {
          msg = `📡 Sonda de Circuito: Nenhuma de [${candidateLetters.join(', ')}] existe na palavra. (Descartadas no teclado)`;
        }

        set({
          activeSkills: updatedSkills,
          keyboardStatus: updatedKeyboard,
          targetingState: null,
          notification: msg
        });
      },

      applyRetroEdit: (rowIndex: number, colIndex: number, newChar: string) => {
        const { evaluations, guesses, targetWord, activeSkills, keyboardStatus, keys, currentBoss } = get();
        const cleanChar = normalizeWord(newChar);

        if (!/^[A-Z]$/.test(cleanChar)) return;

        const targetGuess = guesses[rowIndex];
        const rawChars = normalizeWord(targetGuess).split('');
        rawChars[colIndex] = cleanChar;
        const rawUpdated = rawChars.join('');
        const canonicalUpdated = getCanonicalWord(rawUpdated);

        // Recalcula cores para aquela linha inteira
        let updatedStatuses = evaluateGuess(canonicalUpdated, targetWord);
        if (currentBoss?.anomaly.id === 'switch_ghosting' || currentBoss?.anomaly.id === 'kernel_panic') {
          updatedStatuses = updatedStatuses.map(s => (s === 'present' ? 'absent' : s));
        }
        const updatedRow: EvaluatedRow = {
          letters: canonicalUpdated.split('').map((c, i) => ({
            char: c,
            status: updatedStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses];
        newGuesses[rowIndex] = canonicalUpdated;

        const newEvaluations = [...evaluations];
        newEvaluations[rowIndex] = updatedRow;

        const updatedSkills = consumeSkillCharge(activeSkills, 'ctrl_z');
        sound.playSkillActivate();

        const updatedKeyboard = updateKeyboardStatus(keyboardStatus, updatedRow);

        // Se a palavra editada acertou a palavra secreta!
        if (normalizeWord(canonicalUpdated) === normalizeWord(targetWord)) {
          const winState = calculateRoundWinState({
            state: get(),
            newGuesses,
            newEvaluations,
            updatedKeyboard,
            updatedSkills,
            guessIndex: newGuesses.length,
            remainingKeys: keys,
            customWinMessage: `Incrível! Palavra decifrada com Ctrl+Z (Retro-Edição)!`
          });
          set(winState);
          return;
        }

        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          activeSkills: updatedSkills,
          keyboardStatus: updatedKeyboard,
          targetingState: null,
          notification: `Retro-Edição aplicada! Posição ${colIndex + 1} alterada para '${cleanChar}'. Cores recalculadas!`
        });
      },

      applySwapLetters: (rowIndex: number, col1: number, col2: number) => {
        const { evaluations, guesses, targetWord, activeSkills, keyboardStatus, keys, currentBoss } = get();
        const targetGuess = guesses[rowIndex];
        const chars = normalizeWord(targetGuess).split('');
        const temp = chars[col1];
        chars[col1] = chars[col2];
        chars[col2] = temp;
        const rawUpdated = chars.join('');
        const canonicalUpdated = getCanonicalWord(rawUpdated);

        let updatedStatuses = evaluateGuess(canonicalUpdated, targetWord);
        if (currentBoss?.anomaly.id === 'switch_ghosting' || currentBoss?.anomaly.id === 'kernel_panic') {
          updatedStatuses = updatedStatuses.map(s => (s === 'present' ? 'absent' : s));
        }

        const updatedRow: EvaluatedRow = {
          letters: canonicalUpdated.split('').map((c, i) => ({
            char: c,
            status: updatedStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses];
        newGuesses[rowIndex] = canonicalUpdated;

        const newEvaluations = [...evaluations];
        newEvaluations[rowIndex] = updatedRow;

        const updatedSkills = consumeSkillCharge(activeSkills, 'anagramador');
        sound.playSkillActivate();

        const updatedKeyboard = updateKeyboardStatus(keyboardStatus, updatedRow);

        // Se a palavra permutada acertou a palavra secreta!
        if (normalizeWord(canonicalUpdated) === normalizeWord(targetWord)) {
          const winState = calculateRoundWinState({
            state: get(),
            newGuesses,
            newEvaluations,
            updatedKeyboard,
            updatedSkills,
            guessIndex: newGuesses.length,
            remainingKeys: keys,
            customWinMessage: `Incrível! Palavra decifrada com Shift Swap!`
          });
          set(winState);
          return;
        }

        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          activeSkills: updatedSkills,
          keyboardStatus: updatedKeyboard,
          targetingState: null,
          notification: `Shift Swap aplicado! Letras permutadas na linha ${rowIndex + 1}.`
        });
      },

      applyThermalLens: (rowIndex: number, colIndex: number) => {
        const { evaluations, targetWord, activeSkills } = get();
        if (rowIndex < 0 || rowIndex >= evaluations.length) return;
        const letterData = evaluations[rowIndex]?.letters?.[colIndex];
        if (!letterData) return;

        if (letterData.status !== 'present') {
          sound.playErrorBuzz();
          set({ notification: 'Selecione uma letra AMARELA para analisar com a Lente Térmica!' });
          return;
        }

        const char = normalizeWord(letterData.char);
        const targetChars = normalizeWord(targetWord).split('');
        const targetColumns = targetChars
          .map((c, i) => (c === char ? i : -1))
          .filter(i => i !== -1);

        if (targetColumns.length === 0) {
          sound.playErrorBuzz();
          set({ notification: `Não foi possível encontrar a letra [${char}] na palavra secreta.` });
          return;
        }

        const leftCount = targetColumns.filter(c => c < colIndex).length;
        const rightCount = targetColumns.filter(c => c > colIndex).length;

        let direction: 'left' | 'right' | 'both' = 'left';
        if (leftCount > 0 && rightCount > 0) {
          direction = 'both';
        } else if (rightCount > 0) {
          direction = 'right';
        } else {
          direction = 'left';
        }

        const updatedSkills = consumeSkillCharge(activeSkills, 'lente_termica');
        sound.playSkillActivate();
        const directionText =
          direction === 'left'
            ? '⬅️ À ESQUERDA'
            : direction === 'right'
            ? '➡️ À DIREITA'
            : '↔️ EM AMBOS OS LADOS';

        const lensHint: LensHint = {
          char,
          rowIndex,
          colIndex,
          direction,
          targetColumns
        };

        set({
          activeSkills: updatedSkills,
          lensHint,
          targetingState: null,
          notification: `🔍 Lente Térmica: A letra [${char}] na linha ${rowIndex + 1} está posicionada ${directionText} (coluna ${colIndex + 1})!`
        });
      },

      applyThermalLensByKey: (key: string) => {
        const { evaluations } = get();
        const cleanKey = normalizeWord(key);

        // Encontra a ocorrência mais recente da letra amarela nas avaliações
        let foundRow = -1;
        let foundCol = -1;
        for (let r = evaluations.length - 1; r >= 0; r--) {
          for (let c = 0; c < evaluations[r].letters.length; c++) {
            if (normalizeWord(evaluations[r].letters[c].char) === cleanKey && evaluations[r].letters[c].status === 'present') {
              foundRow = r;
              foundCol = c;
              break;
            }
          }
          if (foundRow !== -1) break;
        }

        if (foundRow === -1 || foundCol === -1) {
          set({
            notification: `A tecla [${cleanKey}] não possui nenhuma ocorrência amarela para analisar!`
          });
          return;
        }

        get().applyThermalLens(foundRow, foundCol);
      },

      chooseDraftCard: (card: SkillCard) => {
        const { activeSkills, passives, maxKeys, keys } = get();

        if (card.type === 'active') {
          // Limite de 4 ativas
          const updated = [...activeSkills, card].slice(0, 4);
          set({ activeSkills: updated });
        } else {
          // Passiva
          const updated = [...passives, card];
          let updatedMax = maxKeys;
          let updatedKeys = keys;

          // Se for Keycaps PBT: +10 no teto e +4 teclas imediatas
          if (card.id === 'keycaps_pbt') {
            updatedMax += 10;
            updatedKeys += 4;
          }

          set({ passives: updated, maxKeys: updatedMax, keys: updatedKeys });
        }

        get().startNextRound();
      },

      toggleCrt: () => {
        set(state => ({ crtEnabled: !state.crtEnabled }));
      },

      toggleSound: () => {
        set(state => ({ soundEnabled: !state.soundEnabled }));
      },

      setNotification: (msg: string | null) => {
        set({ notification: msg });
      }
    }),
    {
      name: 'rogue-term-storage',
      version: 1,
      partialize: state => ({
        keys: state.keys,
        maxKeys: state.maxKeys,
        score: state.score,
        coins: state.coins ?? 4,
        round: state.round,
        sector: state.sector ?? 1,
        stage: state.stage ?? 1,
        maxSectors: state.maxSectors ?? 8,
        currentBoss: state.currentBoss ?? null,
        endlessMode: state.endlessMode ?? false,
        streak: state.streak,
        targetWord: state.targetWord,
        guesses: state.guesses,
        evaluations: state.evaluations,
        currentGuess: state.currentGuess,
        activeTileCol: state.activeTileCol,
        gamePhase: state.gamePhase,
        activeSkills: state.activeSkills,
        passives: state.passives,
        draftChoices: state.draftChoices,
        shopItems: state.shopItems ?? [],
        rerollCost: state.rerollCost ?? 2,
        lastRoundEarnings: state.lastRoundEarnings ?? null,
        roundStartTime: state.roundStartTime ?? Date.now(),
        lastRoundDuration: state.lastRoundDuration ?? 0,
        lastRoundScoreDetails: state.lastRoundScoreDetails ?? null,
        keyboardStatus: state.keyboardStatus,
        crtEnabled: state.crtEnabled,
        soundEnabled: state.soundEnabled !== false,
        careerStats: state.careerStats,
        discoveredSkillIds: state.discoveredSkillIds
      })
    }
  )
);
