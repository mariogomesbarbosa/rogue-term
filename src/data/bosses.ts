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

export const BOSS_TEMPLATES: BossTemplate[] = [
  {
    id: 'boss_power_surge',
    name: 'OVERVOLT.HEX',
    title: 'Sobrecarga de Circuito',
    anomalyId: 'power_surge',
    tagline: 'Limite de Operação Restrito',
    description: 'Sobrecarga elétrica! O limite seguro do terminal cai para 5 tentativas (em vez de 6).',
    iconName: 'Zap'
  },
  {
    id: 'boss_hard_mode',
    name: 'HARD-CORE.SYS',
    title: 'Protocolo Estrito',
    anomalyId: 'hard_mode',
    tagline: 'Firmware em Modo Estrito',
    description: 'Modo Hardcore! Letras verdes e amarelas devem ser mantidas, e letras cinzas descartadas não podem ser reutilizadas.',
    iconName: 'ShieldAlert'
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
    id: 'boss_firewall_lock',
    name: 'FIREWALL.DAEMON',
    title: 'Firewall do Sistema',
    anomalyId: 'firewall_lock',
    tagline: 'Defesa Cibernética Ativa',
    description: 'O firewall bloqueia todos os atalhos! Habilidades ativas estão desativadas neste combate.',
    iconName: 'ShieldBan'
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
    id: 'boss_short_circuit',
    name: 'SHORT-CIRCUIT.ERR',
    title: 'Curto-Circuito Crítico',
    anomalyId: 'short_circuit',
    tagline: 'Descarga por Erro Total',
    description: 'Curto-circuito crítico! Se um palpite tiver 0 acertos (todas as 5 letras ausentes), queima 1 tentativa extra!',
    iconName: 'Flame'
  }
];

export function generateBossForSector(sector: number, _targetWord: string): Boss {
  // No Setor 8 (Chefe Final da Run regular): Kernel Panic do Mainframe
  if (sector === 8) {
    return {
      id: 'boss_kernel_panic',
      name: 'KERNEL-PANIC // NÚCLEO',
      title: 'O Grande Mainframe',
      anomaly: {
        id: 'kernel_panic',
        name: 'Colapso do Sistema',
        tagline: 'Defesa Máxima do Mainframe',
        description: 'Ghosting (sem letras amarelas) E limite seguro restrito a 5 tentativas!',
        iconName: 'Cpu'
      }
    };
  }

  // Setores 1 a 6 seguem uma curva de progressão calibrada:
  // Setor 1: Sobrecarga de Circuito (tensão imediata de teclas)
  // Setor 2: Protocolo Estrito (Modo Hardcore)
  // Setor 3: Monitor Glitchado (Coluna central oculta temporariamente)
  // Setor 4: Firewall (Desativa habilidades ativas)
  // Setor 5: Ghosting de Switch (Dedução pura sem amarelas)
  // Setor 6: Curto-Circuito (Punição por palpites no escuro)
  // Setor 7: Sorteio entre os mais perigosos (Hard-Core, Firewall, Ghosting)
  // Setor 9+ (Endless): Sorteia aleatoriamente entre todos os chefes
  let template: BossTemplate;

  if (sector >= 1 && sector <= 6) {
    template = BOSS_TEMPLATES[sector - 1];
  } else if (sector === 7) {
    const pool = [BOSS_TEMPLATES[1], BOSS_TEMPLATES[3], BOSS_TEMPLATES[4]]; // Hard-Core, Firewall, Ghosting
    template = pool[Math.floor(Math.random() * pool.length)];
  } else {
    // Endless mode (> 8)
    template = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];
  }

  return {
    id: `${template.id}_s${sector}`,
    name: template.name,
    title: template.title,
    anomaly: {
      id: template.anomalyId,
      name: template.title,
      tagline: template.tagline,
      description: template.description,
      iconName: template.iconName
    }
  };
}
