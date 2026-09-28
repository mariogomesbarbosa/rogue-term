import { Boss, BossAnomalyId } from '@/types/game';

interface BossTemplate {
  id: string;
  name: string;
  title: string;
  anomalyId: BossAnomalyId;
  tagline: string;
  description: string;
  iconName: string;
}

const COMMON_LETTERS = ['A', 'E', 'O', 'S', 'R', 'T', 'M', 'I', 'L', 'C', 'U', 'P'];

export const BOSS_TEMPLATES: BossTemplate[] = [
  {
    id: 'boss_key_jam',
    name: 'BUG-KEY.SYS',
    title: 'Bug do Teclado',
    anomalyId: 'key_jam',
    tagline: 'Switches Mecânicos Emperrados',
    description: '3 teclas comuns do alfabeto foram travadas e não podem ser digitadas.',
    iconName: 'Lock'
  },
  {
    id: 'boss_switch_ghosting',
    name: 'PHANTOM-SWITCH',
    title: 'Ghosting de Switch',
    anomalyId: 'switch_ghosting',
    tagline: 'Interferência de Circuito',
    description: 'O terminal não registra letras amarelas! Você só sabe se a letra for verde ou ausente.',
    iconName: 'Ghost'
  },
  {
    id: 'boss_glitched_crt',
    name: 'GLITCH-CRT.EXE',
    title: 'Monitor Glitchado',
    anomalyId: 'glitched_crt',
    tagline: 'Linha de Varredura Quebrada',
    description: 'A 3ª coluna do terminal sofre estática e não revela seu status até o 3º palpite.',
    iconName: 'Tv'
  },
  {
    id: 'boss_power_surge',
    name: 'OVERVOLT.HEX',
    title: 'Sobrecarga de Circuito',
    anomalyId: 'power_surge',
    tagline: 'Dreno Crítico de Energia',
    description: 'Sobrecarga elétrica! Cada palpite incorreto consome 2 Teclas [T] em vez de 1.',
    iconName: 'Zap'
  }
];

export function generateBossForSector(sector: number, targetWord: string): Boss {
  const normTarget = targetWord.toUpperCase();

  // No Setor 8 (Chefe Final da Run regular): Kernel Panic do Mainframe
  if (sector === 8) {
    // Escolhe 2 letras comuns que NÃO bloqueiem a palavra completamente
    const targetLetters = new Set(normTarget.split(''));
    const candidateLetters = COMMON_LETTERS.filter(l => !targetLetters.has(l));
    const disabled = candidateLetters.slice(0, 3);

    return {
      id: 'boss_kernel_panic',
      name: 'KERNEL-PANIC // NÚCLEO',
      title: 'O Grande Mainframe',
      anomaly: {
        id: 'switch_ghosting',
        name: 'Ghosting & Teclas Travadas',
        tagline: 'Defesa Máxima do Mainframe',
        description: `Sem letras amarelas e as teclas [${disabled.join(', ')}] estão bloqueadas!`,
        iconName: 'Cpu'
      },
      disabledLetters: disabled
    };
  }

  // Sorteia um dos 4 templates básicos baseado no setor ou aleatoriamente
  const templateIndex = (sector - 1) % BOSS_TEMPLATES.length;
  const template = BOSS_TEMPLATES[templateIndex];

  let disabledLetters: string[] | undefined = undefined;

  if (template.anomalyId === 'key_jam') {
    // Seleciona 3 letras: garantir que a palavra ainda possa ser resolvida
    // Tentamos travar 1 ou 2 letras que não estão na palavra e no máximo 1 que esteja (se houver alternativas)
    const targetLetters = new Set(normTarget.split(''));
    const nonTargetCandidates = COMMON_LETTERS.filter(l => !targetLetters.has(l));
    const targetCandidates = COMMON_LETTERS.filter(l => targetLetters.has(l));

    const selected: string[] = [];
    if (nonTargetCandidates.length >= 2) {
      selected.push(nonTargetCandidates[0], nonTargetCandidates[1]);
    }
    // Adiciona uma 3ª letra que não inviabilize a resolução
    if (nonTargetCandidates.length >= 3) {
      selected.push(nonTargetCandidates[2]);
    } else if (targetCandidates.length > 0) {
      // Se não houver candidatas não-alvo suficientes, pega mais uma
      selected.push(targetCandidates[0]);
    }

    disabledLetters = selected.slice(0, 3);
  }

  return {
    id: `${template.id}_s${sector}`,
    name: template.name,
    title: template.title,
    anomaly: {
      id: template.anomalyId,
      name: template.title,
      tagline: template.tagline,
      description: template.anomalyId === 'key_jam' && disabledLetters
        ? `As teclas [${disabledLetters.join(', ')}] estão emperradas e não podem ser digitadas!`
        : template.description,
      iconName: template.iconName
    },
    disabledLetters
  };
}
