import { SkillCard, Rarity } from '@/types/game';

export const ALL_SKILLS: SkillCard[] = [
  // --- ATIVAS (HACKS DE TECLADO) ---
  {
    id: 'ctrl_z',
    name: 'Ctrl+Z (Retro-Edição)',
    type: 'active',
    rarity: 'rare',
    powerScore: 65,
    tagline: 'Desfaça um erro passado',
    description: 'Clique em uma letra de qualquer palpite já enviado e troque-a por outra. As cores daquela linha são recalculadas instantaneamente!',
    chargesMax: 2,
    chargesCurrent: 2,
    iconName: 'RotateCcw'
  },
  {
    id: 'sonda_circuito',
    name: 'Sonda de Circuito',
    type: 'active',
    rarity: 'common',
    powerScore: 25,
    tagline: 'Verificação sem custo',
    description: 'Escolha 3 letras no teclado: o sistema analisa se alguma delas pertence à palavra secreta sem consumir Teclas [T].',
    chargesMax: 3,
    chargesCurrent: 3,
    iconName: 'Cpu'
  },
  {
    id: 'backspace_quantico',
    name: 'Backspace Quântico',
    type: 'active',
    rarity: 'legendary',
    powerScore: 85,
    tagline: 'Apague a história',
    description: 'Apaga a última linha de tentativa errada do tabuleiro e reembolsa a Tecla [T] gasta.',
    chargesMax: 1,
    chargesCurrent: 1,
    iconName: 'Delete'
  },
  {
    id: 'anagramador',
    name: 'Shift Swap (Anagrama)',
    type: 'active',
    rarity: 'uncommon',
    powerScore: 45,
    tagline: 'Permutação de caracteres',
    description: 'Inverta ou troque a posição de duas letras em um palpite anterior para recalcular os acertos.',
    chargesMax: 2,
    chargesCurrent: 2,
    iconName: 'ArrowLeftRight'
  },
  {
    id: 'keycap_iluminado',
    name: 'Keycap Iluminado',
    type: 'active',
    rarity: 'rare',
    powerScore: 60,
    tagline: 'Brilho da verdade',
    description: 'Revela uma vogal da palavra secreta diretamente no tabuleiro com o status Verde!',
    chargesMax: 1,
    chargesCurrent: 1,
    iconName: 'Sparkles'
  },
  {
    id: 'lente_termica',
    name: 'Lente Térmica',
    type: 'active',
    rarity: 'uncommon',
    powerScore: 35,
    tagline: 'Radar de posição',
    description: 'Clique em uma letra amarela: um radar revela se a posição correta dela está mais à esquerda ou à direita.',
    chargesMax: 2,
    chargesCurrent: 2,
    iconName: 'Compass'
  },

  // --- PASSIVAS (HARDWARE & SWITCHES MODIFICADOS) ---
  {
    id: 'keycaps_pbt',
    name: 'Keycaps PBT Reforçadas',
    type: 'passive',
    rarity: 'common',
    powerScore: 30,
    tagline: 'Durabilidade máxima',
    description: 'Aumenta o limite máximo de Teclas em +10 e restaura +4 Teclas imediatamente ao equipar.',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Shield'
  },
  {
    id: 'switch_dourado',
    name: 'Switch Dourado (Midas)',
    type: 'passive',
    rarity: 'uncommon',
    powerScore: 45,
    tagline: 'Ganhos luxuosos',
    description: 'Palavras que contenham letras raras (X, Z, K, W, Y, J) concedem o dobro de pontos e +2 Teclas bônus ao acertar.',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Coins'
  },
  {
    id: 'buffer_teclado',
    name: 'Buffer de Digitação',
    type: 'passive',
    rarity: 'rare',
    powerScore: 65,
    tagline: 'Primeiro palpite grátis',
    description: 'O primeiro palpite de cada rodada não gasta Tecla [T] se encontrar pelo menos 2 letras (amarelas ou verdes).',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Zap'
  },
  {
    id: 'rgb_sincronizado',
    name: 'RGB Sincronizado',
    type: 'passive',
    rarity: 'uncommon',
    powerScore: 50,
    tagline: 'Multiplicador de combo',
    description: 'Cada vitória consecutiva aumenta o multiplicador de pontuação em +0.3x (acumulável!).',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Activity'
  },
  {
    id: 'eco_grafema',
    name: 'Circuito Duplo (Eco)',
    type: 'passive',
    rarity: 'legendary',
    powerScore: 90,
    tagline: 'Memória persistente',
    description: 'Letras verdes acertadas na palavra anterior já começam visíveis como reveladas na próxima palavra.',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Layers'
  }
];

// Sorteador ponderado estilo Balatro para o Draft (3 opções)
export function getRandomDraftChoices(count: number = 3, existingSkillIds: string[] = []): SkillCard[] {
  const available = ALL_SKILLS.filter(s => !existingSkillIds.includes(s.id));
  if (available.length <= count) return available;

  const weights: Record<Rarity, number> = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5
  };

  const pool = [...available];
  const choices: SkillCard[] = [];

  while (choices.length < count && pool.length > 0) {
    // Cálculo da soma ponderada
    const totalWeight = pool.reduce((sum, item) => sum + weights[item.rarity], 0);
    let rand = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      rand -= weights[pool[i].rarity];
      if (rand <= 0) {
        selectedIndex = i;
        break;
      }
    }

    choices.push({ ...pool[selectedIndex] });
    pool.splice(selectedIndex, 1);
  }

  return choices;
}
