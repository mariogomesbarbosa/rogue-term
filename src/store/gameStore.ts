import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GamePhase, EvaluatedRow, SkillCard, TileStatus, Boss, ShopItem, RoundEarnings } from '@/types/game';
import { getRandomTargetWord, evaluateGuess, normalizeWord, isValidWord } from '@/data/words';
import { ALL_SKILLS, getRandomDraftChoices, generateShopItems, getCardSellValue } from '@/data/skills';
import { generateBossForSector } from '@/data/bosses';
import confetti from 'canvas-confetti';

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
  crtEnabled: boolean;
  notification: string | null;
  shakeBoard: boolean;
  keyboardStatus: Record<string, TileStatus>;
  targetingState: TargetingState | null;

  // Ações
  startNewRun: () => void;
  startNextRound: () => void;
  continueEndless: () => void;
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
  chooseDraftCard: (card: SkillCard) => void;
  toggleCrt: () => void;
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
    const currentStatus = updated[char];
    if (status === 'correct') {
      updated[char] = 'correct';
    } else if (status === 'present' && currentStatus !== 'correct') {
      updated[char] = 'present';
    } else if (status === 'absent') {
      if (currentStatus !== 'correct' && currentStatus !== 'present' && currentStatus !== 'probed_hit') {
        updated[char] = 'absent';
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
  const hasRareLetter = /[XZKWYJ]/.test(targetWord);
  if (hasGoldSwitch && hasRareLetter) {
    keysRestored += 2;
  }

  const newKeys = Math.min(maxKeys, remainingKeys + keysRestored);

  // Cálculo de Pontuação (Chefes concedem bônus robusto)
  const basePoints = round * 1000 + (6 - Math.min(6, guessIndex)) * 250 + (isBossFight ? 2500 : 0);
  let multiplier = 1.0;
  if (guessIndex === 1) multiplier = 4.0;
  else if (guessIndex === 2) multiplier = 2.5;
  else if (guessIndex === 3) multiplier = 1.8;

  // Passiva: RGB Sincronizado
  const hasRgb = passives.some(p => p.id === 'rgb_sincronizado');
  if (hasRgb) {
    multiplier += (streak + 1) * 0.3;
  }

  const roundPoints = Math.round(basePoints * multiplier);
  const newScore = score + roundPoints;
  const newStreak = streak + 1;

  // Economia de Créditos ($)
  const baseReward = 3;
  const efficiencyBonus = Math.max(0, 6 - guessIndex);
  const bossBonus = isBossFight ? 5 : 0;
  const goldSwitchBonus = hasGoldSwitch && hasRareLetter ? 4 : 0;
  const currentCoins = state.coins ?? 4;
  const interest = Math.min(5, Math.floor(currentCoins / 5));
  const totalCoinsEarned = baseReward + efficiencyBonus + bossBonus + goldSwitchBonus + interest;
  const newCoins = currentCoins + totalCoinsEarned;

  const roundEarnings: RoundEarnings = {
    baseReward,
    efficiencyBonus,
    bossBonus,
    goldSwitchBonus,
    interest,
    total: totalCoinsEarned
  };

  const currentSkills = updatedSkills || activeSkills;
  const existingIds = [
    ...currentSkills.map(s => s.id),
    ...passives.map(s => s.id)
  ];
  const newShopItems = generateShopItems(existingIds, sector);

  // Se venceu o Chefe do Setor 8 e não está no modo infinito -> Vitória da Run!
  const isFinalVictory = isBossFight && sector >= maxSectors && !endlessMode;
  const nextGamePhase: GamePhase = isFinalVictory ? 'victory' : 'shop';

  let winMessage = customWinMessage;
  if (!winMessage) {
    if (isFinalVictory) {
      winMessage = `🏆 VITÓRIA DO SISTEMA! O Mainframe Central foi derrotado no Setor ${sector}!`;
    } else if (isBossFight) {
      winMessage = `💥 CHEFE DERROTADO! +${keysRestored} Teclas, +$${totalCoinsEarned} e +${roundPoints} Pontos! Loja aberta.`;
    } else {
      winMessage = `Excelente! +${keysRestored} Teclas [T], +$${totalCoinsEarned} e +${roundPoints} Pontos!`;
    }
  }

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
    gamePhase: nextGamePhase,
    targetingState: null,
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
      crtEnabled: true,
      notification: null,
      shakeBoard: false,
      keyboardStatus: {},
      targetingState: null,

      startNewRun: () => {
        const firstWord = getRandomTargetWord();
        set({
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
          notification: 'Setor 1 iniciado! Suas Teclas [T] são o seu fôlego.',
          shakeBoard: false,
          keyboardStatus: {},
          targetingState: null
        });
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
              set({
                notification: 'Slots de Cartas Ativas cheios (3/3)! Venda uma carta antes de comprar outra.',
                shakeBoard: true
              });
              setTimeout(() => set({ shakeBoard: false }), 400);
              return;
            }
            set({
              coins: coins - item.price,
              activeSkills: [...activeSkills, card],
              shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
              notification: `Adquirido: [${card.name}] por $${item.price}!`
            });
          } else {
            if (passives.length >= 5) {
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
          const newKeys = Math.min(maxKeys, keys + 3);
          set({
            coins: coins - item.price,
            keys: newKeys,
            shopItems: shopItems.map(i => (i.id === itemId ? { ...i, bought: true } : i)),
            notification: `Manutenção realizada! +3 Teclas [T] restauradas por $${item.price}.`
          });
        } else if (item.type === 'max_keys_upgrade') {
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
          set({
            notification: `Créditos insuficientes para Reroll! Custa $${rerollCost}.`,
            shakeBoard: true
          });
          setTimeout(() => set({ shakeBoard: false }), 400);
          return;
        }

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
          lastEval.letters.forEach(l => {
            if (l.status === 'correct' && nextWord.includes(l.char)) {
              newKeyboardStatus[l.char] = 'correct';
            }
          });
        }

        const notificationMsg = nextBoss
          ? `⚠️ ALERTA DE CHEFE: ${nextBoss.name} detectado! ${nextBoss.anomaly.tagline}`
          : `Setor ${nextSector} - Fase ${nextStage}/3 iniciada!`;

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
          keyboardStatus: newKeyboardStatus,
          targetingState: null,
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
            set({
              notification: `⚠️ Tecla [${clean}] emperrada pelo Bug do Teclado (${currentBoss.name})!`,
              shakeBoard: true
            });
            setTimeout(() => set({ shakeBoard: false }), 450);
            return;
          }

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

        const guessWord = currentGuess.join('');

        if (currentGuess.some(c => !c) || guessWord.length < 5) {
          set({ notification: 'Preencha todas as 5 letras!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Validação no léxico
        if (!isValidWord(guessWord)) {
          set({ notification: 'Palavra não encontrada no dicionário!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Checar passiva: Buffer de Teclado (Primeiro palpite grátis se acertar 2+ letras)
        const hasBuffer = passives.some(p => p.id === 'buffer_teclado');
        let evalStatuses = evaluateGuess(guessWord, targetWord);

        // Checar anomalia de Chefe: Ghosting de Switch (letras amarelas viram ausentes)
        if (currentBoss?.anomaly.id === 'switch_ghosting') {
          evalStatuses = evalStatuses.map(s => (s === 'present' ? 'absent' : s));
        }

        const correctOrPresentCount = evalStatuses.filter(s => s !== 'absent').length;
        const isFreeGuess = hasBuffer && guesses.length === 0 && correctOrPresentCount >= 2;

        // Checar anomalia de Chefe: Sobrecarga de Circuito (Power Surge - consome 2 teclas por palpite incorreto)
        const isPowerSurge = currentBoss?.anomaly.id === 'power_surge';
        const baseCost = isPowerSurge ? 2 : 1;
        const keysCost = isFreeGuess ? 0 : baseCost;
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

        // Verificar vitória
        const isWin = guessWord === targetWord;

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

        // Verificar derrota por limite de 6 tentativas preenchidas no grid
        if (newGuesses.length >= 6) {
          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: ['', '', '', '', ''],
            activeTileCol: 0,
            keys: remainingKeys,
            keyboardStatus: updatedKeyboard,
            gamePhase: 'game_over',
            notification: `Tentativas esgotadas! A palavra era ${targetWord}.`
          });
          return;
        }

        // Verificar derrota por falta de Teclas
        if (remainingKeys <= 0) {
          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: ['', '', '', '', ''],
            activeTileCol: 0,
            keys: 0,
            keyboardStatus: updatedKeyboard,
            gamePhase: 'game_over',
            notification: `Suas Teclas acabaram! A palavra era ${targetWord}.`
          });
          return;
        }

        // Continua jogando a rodada
        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          currentGuess: ['', '', '', '', ''],
          activeTileCol: 0,
          keys: remainingKeys,
          keyboardStatus: updatedKeyboard,
          notification: isFreeGuess ? 'Buffer ativado! Tentativa grátis.' : null
        });
      },

      activateSkill: (skillId: string) => {
        const { activeSkills, targetWord, evaluations, guesses, keys, maxKeys, keyboardStatus } = get();
        const skill = activeSkills.find(s => s.id === skillId);
        if (!skill || skill.chargesCurrent <= 0) {
          set({ notification: 'Esta habilidade não possui cargas restantes!' });
          return;
        }

        // --- Ctrl+Z (Retro-Edição) ---
        if (skillId === 'ctrl_z') {
          if (evaluations.length === 0) {
            set({ notification: 'Você precisa ter feito pelo menos 1 palpite para usar o Ctrl+Z!' });
            return;
          }
          set({
            targetingState: { skillId: 'ctrl_z', step: 'select_tile' },
            notification: 'Modo Ctrl+Z: Clique na letra de uma linha anterior que você deseja substituir!'
          });
          return;
        }

        // --- Shift Swap (Anagramador) ---
        if (skillId === 'anagramador') {
          if (evaluations.length === 0) {
            set({ notification: 'Faça um palpite primeiro para permutar letras!' });
            return;
          }
          set({
            targetingState: { skillId: 'anagramador', step: 'select_tile' },
            notification: 'Selecione a 1ª letra da tentativa para trocar de posição.'
          });
          return;
        }

        // --- Backspace Quântico ---
        if (skillId === 'backspace_quantico') {
          if (evaluations.length === 0) {
            set({ notification: 'Nenhuma tentativa para apagar!' });
            return;
          }
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
          const targetVowels = targetWord.split('').filter(char => vowels.includes(char));

          if (targetVowels.length === 0) {
            set({ notification: 'Esta palavra não contém vogais simples!' });
            return;
          }

          const revealed = targetVowels[0];
          const updatedSkills = consumeSkillCharge(activeSkills, skillId);

          set({
            activeSkills: updatedSkills,
            keyboardStatus: { ...keyboardStatus, [revealed]: 'correct' },
            notification: `Keycap Iluminado! A vogal '${revealed}' brilha em Verde!`
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

        candidateLetters.forEach(char => {
          if (targetWord.includes(char)) {
            if (updatedKeyboard[char] !== 'correct' && updatedKeyboard[char] !== 'present') {
              updatedKeyboard[char] = 'probed_hit';
            }
            hits.push(char);
          } else {
            if (!updatedKeyboard[char]) {
              updatedKeyboard[char] = 'probed_miss';
            }
            misses.push(char);
          }
        });

        const updatedSkills = consumeSkillCharge(activeSkills, 'sonda_circuito');

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
        const newChars = targetGuess.split('');
        newChars[colIndex] = cleanChar;
        const updatedGuess = newChars.join('');

        // Recalcula cores para aquela linha inteira
        let updatedStatuses = evaluateGuess(updatedGuess, targetWord);
        if (currentBoss?.anomaly.id === 'switch_ghosting') {
          updatedStatuses = updatedStatuses.map(s => (s === 'present' ? 'absent' : s));
        }
        const updatedRow: EvaluatedRow = {
          letters: updatedGuess.split('').map((c, i) => ({
            char: c,
            status: updatedStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses];
        newGuesses[rowIndex] = updatedGuess;

        const newEvaluations = [...evaluations];
        newEvaluations[rowIndex] = updatedRow;

        const updatedSkills = consumeSkillCharge(activeSkills, 'ctrl_z');

        const updatedKeyboard = updateKeyboardStatus(keyboardStatus, updatedRow);

        // Se a palavra editada acertou a palavra secreta!
        if (updatedGuess === targetWord) {
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
        const chars = targetGuess.split('');
        const temp = chars[col1];
        chars[col1] = chars[col2];
        chars[col2] = temp;
        const updatedGuess = chars.join('');

        let updatedStatuses = evaluateGuess(updatedGuess, targetWord);
        if (currentBoss?.anomaly.id === 'switch_ghosting') {
          updatedStatuses = updatedStatuses.map(s => (s === 'present' ? 'absent' : s));
        }

        const updatedRow: EvaluatedRow = {
          letters: updatedGuess.split('').map((c, i) => ({
            char: c,
            status: updatedStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses];
        newGuesses[rowIndex] = updatedGuess;

        const newEvaluations = [...evaluations];
        newEvaluations[rowIndex] = updatedRow;

        const updatedSkills = consumeSkillCharge(activeSkills, 'anagramador');

        const updatedKeyboard = updateKeyboardStatus(keyboardStatus, updatedRow);

        // Se a palavra permutada acertou a palavra secreta!
        if (updatedGuess === targetWord) {
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
        keyboardStatus: state.keyboardStatus,
        crtEnabled: state.crtEnabled
      })
    }
  )
);
