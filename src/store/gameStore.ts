import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GamePhase, EvaluatedRow, SkillCard, TileStatus } from '@/types/game';
import { getRandomTargetWord, evaluateGuess, normalizeWord, isValidWord } from '@/data/words';
import { ALL_SKILLS, getRandomDraftChoices } from '@/data/skills';
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
  round: number;
  streak: number;
  targetWord: string;
  guesses: string[];
  evaluations: EvaluatedRow[];
  currentGuess: string;
  gamePhase: GamePhase;
  activeSkills: SkillCard[];
  passives: SkillCard[];
  draftChoices: SkillCard[];
  crtEnabled: boolean;
  notification: string | null;
  shakeBoard: boolean;
  keyboardStatus: Record<string, TileStatus>;
  targetingState: TargetingState | null;

  // Ações
  startNewRun: () => void;
  startNextRound: () => void;
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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      keys: 15,
      maxKeys: 20,
      score: 0,
      round: 1,
      streak: 0,
      targetWord: getRandomTargetWord(),
      guesses: [],
      evaluations: [],
      currentGuess: '',
      gamePhase: 'playing',
      // Começamos o jogador com o icônico Ctrl+Z e a Sonda de Circuito para testar na hora!
      activeSkills: [
        { ...ALL_SKILLS.find(s => s.id === 'ctrl_z')! },
        { ...ALL_SKILLS.find(s => s.id === 'sonda_circuito')! }
      ],
      passives: [],
      draftChoices: [],
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
          round: 1,
          streak: 0,
          targetWord: firstWord,
          guesses: [],
          evaluations: [],
          currentGuess: '',
          gamePhase: 'playing',
          activeSkills: [
            { ...ALL_SKILLS.find(s => s.id === 'ctrl_z')! },
            { ...ALL_SKILLS.find(s => s.id === 'sonda_circuito')! }
          ],
          passives: [],
          draftChoices: [],
          notification: 'Nova Run iniciada! Suas Teclas [T] são o seu fôlego.',
          shakeBoard: false,
          keyboardStatus: {},
          targetingState: null
        });
      },

      startNextRound: () => {
        const { targetWord: prevTarget, evaluations, passives, round } = get();
        const nextWord = getRandomTargetWord();
        const nextRound = round + 1;

        const newKeyboardStatus: Record<string, TileStatus> = {};

        // Passiva: Circuito Duplo (Eco) - Letras verdes da palavra anterior começam reveladas
        const hasEco = passives.some(p => p.id === 'eco_grafema');
        if (hasEco && evaluations.length > 0) {
          const lastEval = evaluations[evaluations.length - 1];
          lastEval.letters.forEach(l => {
            if (l.status === 'correct') {
              newKeyboardStatus[l.char] = 'correct';
            }
          });
        }

        set({
          round: nextRound,
          targetWord: nextWord,
          guesses: [],
          evaluations: [],
          currentGuess: '',
          gamePhase: 'playing',
          draftChoices: [],
          keyboardStatus: newKeyboardStatus,
          targetingState: null,
          notification: `Rodada ${nextRound} iniciada!`
        });
      },

      addLetter: (char: string) => {
        const { currentGuess, gamePhase, targetingState } = get();
        if (gamePhase !== 'playing' || targetingState) return;

        const clean = normalizeWord(char);
        if (/^[A-Z]$/.test(clean) && currentGuess.length < 5) {
          set({ currentGuess: currentGuess + clean });
        }
      },

      removeLetter: () => {
        const { currentGuess, gamePhase, targetingState } = get();
        if (gamePhase !== 'playing' || targetingState) return;
        set({ currentGuess: currentGuess.slice(0, -1) });
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
          streak,
          score,
          round
        } = get();

        if (gamePhase !== 'playing') return;

        if (currentGuess.length < 5) {
          set({ notification: 'A palavra precisa ter 5 letras!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Validação no léxico
        if (!isValidWord(currentGuess)) {
          set({ notification: 'Palavra não encontrada no dicionário!', shakeBoard: true });
          setTimeout(() => set({ shakeBoard: false }), 500);
          return;
        }

        // Checar passiva: Buffer de Teclado (Primeiro palpite grátis se acertar 2+ letras)
        const hasBuffer = passives.some(p => p.id === 'buffer_teclado');
        const evalStatuses = evaluateGuess(currentGuess, targetWord);
        const correctOrPresentCount = evalStatuses.filter(s => s !== 'absent').length;
        const isFreeGuess = hasBuffer && guesses.length === 0 && correctOrPresentCount >= 2;

        const keysCost = isFreeGuess ? 0 : 1;
        const remainingKeys = keys - keysCost;

        // Construir linha avaliada
        const evaluatedRow: EvaluatedRow = {
          letters: currentGuess.split('').map((char, i) => ({
            char,
            status: evalStatuses[i]
          })),
          submittedAt: Date.now()
        };

        const newGuesses = [...guesses, currentGuess];
        const newEvaluations = [...evaluations, evaluatedRow];

        // Atualizar status do teclado
        const updatedKeyboard = { ...keyboardStatus };
        evaluatedRow.letters.forEach(({ char, status }) => {
          const currentStatus = updatedKeyboard[char];
          if (status === 'correct') {
            updatedKeyboard[char] = 'correct';
          } else if (status === 'present' && currentStatus !== 'correct') {
            updatedKeyboard[char] = 'present';
          } else if (status === 'absent') {
            if (currentStatus !== 'correct' && currentStatus !== 'present' && currentStatus !== 'probed_hit') {
              updatedKeyboard[char] = 'absent';
            }
          }
        });

        // Verificar vitória
        const isWin = currentGuess === targetWord;

        if (isWin) {
          // Vitória da rodada!
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          } catch {
            // No-op if confetti fails
          }

          // Cálculo de Teclas restauradas
          const guessIndex = newGuesses.length; // 1, 2, 3...
          let keysRestored = 2;
          if (guessIndex === 1) keysRestored = 6;
          else if (guessIndex === 2) keysRestored = 5;
          else if (guessIndex === 3) keysRestored = 4;
          else if (guessIndex === 4) keysRestored = 3;

          // Passiva: Switch Dourado (Letras raras dão +2 teclas extras)
          const hasGoldSwitch = passives.some(p => p.id === 'switch_dourado');
          const hasRareLetter = /[XZKWYJ]/.test(targetWord);
          if (hasGoldSwitch && hasRareLetter) {
            keysRestored += 2;
          }

          const { maxKeys } = get();
          const newKeys = Math.min(maxKeys, remainingKeys + keysRestored);

          // Cálculo de Pontuação
          const basePoints = round * 1000 + (6 - Math.min(6, guessIndex)) * 250;
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

          // Gerar escolhas do Draft
          const draftChoices = getRandomDraftChoices(3, [
            ...get().activeSkills.map(s => s.id),
            ...get().passives.map(s => s.id)
          ]);

          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: '',
            keys: newKeys,
            score: newScore,
            streak: newStreak,
            keyboardStatus: updatedKeyboard,
            draftChoices,
            gamePhase: 'drafting',
            notification: `Excelente! +${keysRestored} Teclas [T] recuperadas! +${roundPoints} Pontos.`
          });
          return;
        }

        // Verificar derrota por falta de Teclas
        if (remainingKeys <= 0) {
          set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: '',
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
          currentGuess: '',
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

          const updatedSkills = activeSkills.map(s =>
            s.id === skillId ? { ...s, chargesCurrent: s.chargesCurrent - 1 } : s
          );

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
          const updatedSkills = activeSkills.map(s =>
            s.id === skillId ? { ...s, chargesCurrent: s.chargesCurrent - 1 } : s
          );

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

        const updatedSkills = activeSkills.map(s =>
          s.id === 'sonda_circuito' ? { ...s, chargesCurrent: s.chargesCurrent - 1 } : s
        );

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
        const { evaluations, guesses, targetWord, activeSkills } = get();
        const cleanChar = normalizeWord(newChar);

        if (!/^[A-Z]$/.test(cleanChar)) return;

        const targetGuess = guesses[rowIndex];
        const newChars = targetGuess.split('');
        newChars[colIndex] = cleanChar;
        const updatedGuess = newChars.join('');

        // Recalcula cores para aquela linha inteira
        const updatedStatuses = evaluateGuess(updatedGuess, targetWord);
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

        const updatedSkills = activeSkills.map(s =>
          s.id === 'ctrl_z' ? { ...s, chargesCurrent: Math.max(0, s.chargesCurrent - 1) } : s
        );

        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          activeSkills: updatedSkills,
          targetingState: null,
          notification: `Retro-Edição aplicada! Posição ${colIndex + 1} alterada para '${cleanChar}'. Cores recalculadas!`
        });
      },

      applySwapLetters: (rowIndex: number, col1: number, col2: number) => {
        const { evaluations, guesses, targetWord, activeSkills } = get();
        const targetGuess = guesses[rowIndex];
        const chars = targetGuess.split('');
        const temp = chars[col1];
        chars[col1] = chars[col2];
        chars[col2] = temp;
        const updatedGuess = chars.join('');

        const updatedStatuses = evaluateGuess(updatedGuess, targetWord);
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

        const updatedSkills = activeSkills.map(s =>
          s.id === 'anagramador' ? { ...s, chargesCurrent: Math.max(0, s.chargesCurrent - 1) } : s
        );

        set({
          guesses: newGuesses,
          evaluations: newEvaluations,
          activeSkills: updatedSkills,
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
      partialize: state => ({
        crtEnabled: state.crtEnabled
      })
    }
  )
);
