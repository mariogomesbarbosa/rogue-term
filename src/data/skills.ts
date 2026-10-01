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
  {
    id: 'buffer_congelado',
    name: 'Buffer Congelado',
    type: 'active',
    rarity: 'rare',
    powerScore: 65,
    tagline: 'Pausa no clock',
    description: 'Zera o cronômetro da rodada atual, garantindo a classificação Ultra Rápido e o bônus máximo de tempo ao vencer!',
    chargesMax: 2,
    chargesCurrent: 2,
    iconName: 'Hourglass'
  },
  {
    id: 'debug_log',
    name: 'Log de Depuração (Scanner)',
    type: 'active',
    rarity: 'uncommon',
    powerScore: 40,
    tagline: 'Análise estática do binário',
    description: 'Escaneia a palavra e revela no terminal se o início e o fim são vogais ou consoantes, e se há letras repetidas!',
    chargesMax: 2,
    chargesCurrent: 2,
    iconName: 'Search'
  },
  {
    id: 'injecao_codigo',
    name: 'Injeção de Código',
    type: 'active',
    rarity: 'legendary',
    powerScore: 80,
    tagline: 'Bypass de integridade',
    description: 'Executa um dump de memória e descarta imediatamente 5 letras incorretas do teclado (marcadas como ausentes), sem gastar Teclas!',
    chargesMax: 1,
    chargesCurrent: 1,
    iconName: 'Terminal'
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
    id: 'cronometro_quartzo',
    name: 'Cronômetro de Quartzo',
    type: 'passive',
    rarity: 'uncommon',
    powerScore: 55,
    tagline: 'Recompensa por agilidade',
    description: 'Se decifrar a palavra em até 30 segundos, dobra o bônus de pontos por tempo e concede +$2 créditos extras.',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Clock'
  },
  {
    id: 'overclock_switch',
    name: 'Overclock de Switch',
    type: 'passive',
    rarity: 'rare',
    powerScore: 70,
    tagline: 'Dopamina e cadência',
    description: 'Se decifrar a palavra em até 20 segundos, concede +0.6x de multiplicador de pontuação e restaura +2 Teclas [T] extras!',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Zap'
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
    description: 'Letras verdes acertadas na palavra anterior que existam na próxima palavra já começam reveladas no teclado.',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Layers'
  },
  {
    id: 'compilador_otimizado',
    name: 'Compilador Otimizado',
    type: 'passive',
    rarity: 'uncommon',
    powerScore: 50,
    tagline: 'Refatoração de baixo custo',
    description: 'Reduz o preço de todas as cartas na Loja em -$1 (mínimo $1) e o 1º Reroll de cada visita ao Mercado é Grátis ($0)!',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Cpu'
  },
  {
    id: 'switch_silencioso',
    name: 'Switch Silencioso',
    type: 'passive',
    rarity: 'rare',
    powerScore: 70,
    tagline: 'Operação invisível',
    description: 'Se vencer a rodada sem utilizar nenhuma habilidade ativa, ganha +$4 créditos extras e restaura +2 Teclas [T]!',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'VolumeX'
  },
  {
    id: 'overclock_gpu',
    name: 'Acelerador de Clock (GPU)',
    type: 'passive',
    rarity: 'rare',
    powerScore: 65,
    tagline: 'Renderização ultra veloz',
    description: 'Se decifrar a palavra em até 3 tentativas (1º, 2º ou 3º palpite), concede +0.5x de multiplicador de pontuação na rodada!',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Flame'
  },
  {
    id: 'pasta_termica',
    name: 'Pasta Térmica de Prata',
    type: 'passive',
    rarity: 'common',
    powerScore: 35,
    tagline: 'Dissipação de calor',
    description: 'Se um palpite errar completamente (0 letras acertadas), dissipa o calor e reembolsa a Tecla [T] gasta (1x por rodada).',
    chargesMax: 0,
    chargesCurrent: 0,
    iconName: 'Shield'
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

export function getCardPrice(rarity: Rarity): number {
  switch (rarity) {
    case 'common':
      return 4;
    case 'uncommon':
      return 6;
    case 'rare':
      return 8;
    case 'legendary':
      return 10;
    default:
      return 5;
  }
}

export function getCardSellValue(rarity: Rarity): number {
  return Math.max(1, Math.floor(getCardPrice(rarity) / 2));
}

export function generateShopItems(existingSkillIds: string[], sector: number, hasDiscount: boolean = false): import('@/types/game').ShopItem[] {
  const cardChoices = getRandomDraftChoices(2, existingSkillIds);
  const items: import('@/types/game').ShopItem[] = [];

  // 1. Cartas de Habilidade
  cardChoices.forEach((card, index) => {
    const basePrice = getCardPrice(card.rarity);
    const finalPrice = hasDiscount ? Math.max(1, basePrice - 1) : basePrice;
    items.push({
      id: `shop_card_${card.id}_${Date.now()}_${index}`,
      type: 'card',
      price: finalPrice,
      card,
      title: card.name,
      description: card.description,
      iconName: card.iconName,
      bought: false
    });
  });

  // 2. Serviço de Teclas: Kit de Recarga Rápida (+3 Teclas [T])
  const refillPrice = hasDiscount ? 2 : 3;
  items.push({
    id: `shop_key_refill_${Date.now()}`,
    type: 'key_refill',
    price: refillPrice,
    title: 'Kit de Lubrificante / Recarga',
    description: 'Restaura imediatamente +3 Teclas [T] para o seu fôlego.',
    iconName: 'Zap',
    bought: false
  });

  // 3. Upgrade de Hardware: Expansão de Chassi (+5 Teclas Max & +5 Teclas)
  const chassisPrice = hasDiscount ? 6 : 7;
  items.push({
    id: `shop_max_keys_${Date.now()}`,
    type: 'max_keys_upgrade',
    price: chassisPrice,
    title: 'Chassi Mecânico Reforçado',
    description: 'Aumenta permanentemente o limite máximo em +5 Teclas [T] e restaura +5 Teclas.',
    iconName: 'Shield',
    bought: false
  });

  return items;
}

