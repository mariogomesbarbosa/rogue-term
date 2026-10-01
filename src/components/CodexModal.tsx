'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ALL_SKILLS } from '@/data/skills';
import { Rarity, SkillType } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  BarChart3,
  BookOpen,
  Lock,
  X,
  Flame,
  Shield,
  Zap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Skull,
  HelpCircle,
  Clock,
  Eye,
  Search,
  Cpu
} from 'lucide-react';

export const CodexModal: React.FC = () => {
  const { isCodexOpen, closeCodex, careerStats, discoveredSkillIds } = useGameStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'cards' | 'bosses'>('stats');
  const [cardFilter, setCardFilter] = useState<'all' | 'active' | 'passive' | 'discovered' | 'locked'>('all');

  if (!isCodexOpen) return null;

  const stats = careerStats || {
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

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const totalSkillsCount = ALL_SKILLS.length;
  const discoveredCount = ALL_SKILLS.filter(s => discoveredSkillIds.includes(s.id)).length;
  const collectionPercentage = Math.round((discoveredCount / totalSkillsCount) * 100);

  // Encontrar o maior valor na distribuição de tentativas para dimensionar as barras
  const maxDistributionCount = Math.max(
    1,
    ...Object.values(stats.guessDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 })
  );

  // Filtragem de cartas
  const filteredSkills = ALL_SKILLS.filter(skill => {
    const isDiscovered = discoveredSkillIds.includes(skill.id);
    if (cardFilter === 'active') return skill.type === 'active';
    if (cardFilter === 'passive') return skill.type === 'passive';
    if (cardFilter === 'discovered') return isDiscovered;
    if (cardFilter === 'locked') return !isDiscovered;
    return true;
  });

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case 'common':
        return <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-bold border border-stone-700">Comum</span>;
      case 'uncommon':
        return <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-600">Incomum</span>;
      case 'rare':
        return <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500">Raro</span>;
      case 'legendary':
        return <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]">Lendário</span>;
    }
  };

  const getRarityBorder = (rarity: Rarity, isDiscovered: boolean) => {
    if (!isDiscovered) return 'border-stone-800/80 bg-stone-950/60 opacity-60 border-dashed';
    switch (rarity) {
      case 'common':
        return 'border-stone-700 bg-stone-900/80 hover:border-stone-500';
      case 'uncommon':
        return 'border-emerald-600/70 bg-emerald-950/20 hover:border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.1)]';
      case 'rare':
        return 'border-cyan-500/70 bg-cyan-950/20 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
      case 'legendary':
        return 'border-amber-500/80 bg-amber-950/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
    }
  };

  // Lista dos Chefes do Jogo
  const BOSS_LORE = [
    {
      name: 'OVERVOLT.HEX',
      sector: 'Setor 1-2',
      tagline: 'Sobrecarga de Circuito',
      description: 'Sobrecarga elétrica no terminal. O limite seguro cai para 5 tentativas no combate (em vez das 6 habituais).',
      tactic: 'Pense bem antes de cada tentativa. Você tem 1 chance a menos para decifrar a palavra!',
      color: 'border-amber-500 text-amber-400'
    },
    {
      name: 'HARD-CORE.SYS',
      sector: 'Setor 2-3',
      tagline: 'Protocolo Estrito (Modo Hardcore)',
      description: 'Firmware travado. Letras verdes anteriores devem ser mantidas na posição, amarelas devem ser incluídas, e cinzas descartadas não podem ser reutilizadas.',
      tactic: 'Leia as regras do palpite anterior com atenção. O terminal não aceitará palavras que violem pistas confirmadas.',
      color: 'border-orange-500 text-orange-400'
    },
    {
      name: 'GLITCH-CRT.EXE',
      sector: 'Setor 3-4',
      tagline: 'Monitor Glitchado',
      description: 'Interferência eletromagnética na tela CRT. A 3ª coluna do tabuleiro sofre estática e esconde seu status até o 3º palpite.',
      tactic: 'Use as outras 4 colunas como âncoras. Habilidades como Sonda de Circuito ajudam a deduzir a letra oculta.',
      color: 'border-fuchsia-500 text-fuchsia-400'
    },
    {
      name: 'FIREWALL.DAEMON',
      sector: 'Setor 4-5',
      tagline: 'Firewall Ativo do Sistema',
      description: 'Defesa cibernética impenetrável. Todas as suas habilidades ativas (Ctrl+Z, Sonda, Lente, etc.) ficam desativadas durante o combate.',
      tactic: 'Suas relíquias passivas continuam operantes! Confie no seu vocabulário e na dedução pura sem auxílio de atalhos.',
      color: 'border-rose-500 text-rose-400'
    },
    {
      name: 'PHANTOM-SWITCH',
      sector: 'Setor 5-6',
      tagline: 'Ghosting de Switch',
      description: 'Falha nos sensores físicos do teclado. O terminal não registra letras amarelas — as letras só revelam se forem verdes ou ausentes.',
      tactic: 'Letras que não viraram verdes podem ainda existir na palavra em outra posição. Teste permutações metódicas.',
      color: 'border-indigo-500 text-indigo-400'
    },
    {
      name: 'SHORT-CIRCUIT.ERR',
      sector: 'Setor 6-7',
      tagline: 'Curto-Circuito Crítico',
      description: 'Descarga de alta voltagem. Se um palpite tiver 0 acertos (todas as 5 letras cinzas), queima 1 tentativa extra imediatamente!',
      tactic: 'Garanta pelo menos 1 letra comum (como A, E, O, S, R) em cada tentativa para evitar o curto-circuito.',
      color: 'border-red-500 text-red-400'
    },
    {
      name: 'KERNEL-PANIC // NÚCLEO',
      sector: 'Setor 8 (Chefe Final)',
      tagline: 'Defesa Total do Mainframe Central',
      description: 'Combinação das defesas mais letais do sistema: Ghosting de Switch (sem amarelas) + Limite restrito a 5 tentativas!',
      tactic: 'Utilize toda a sua economia acumulada e upgrades de Vidas máximas para suportar o confronto com o Núcleo.',
      color: 'border-rose-600 text-rose-300 font-black'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-3xl max-h-[90dvh] bg-stone-950 border-2 border-stone-800 rounded-2xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-stone-100 overflow-hidden"
      >
        {/* Topo: Título & Botão Fechar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-black tracking-wider text-amber-400 uppercase">
                Central de Dados & Compêndio
              </h2>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                Registros Operacionais de Rogue Term
              </span>
            </div>
          </div>

          <button
            onClick={closeCodex}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Fechar Compêndio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-900/80 border border-stone-800/80 rounded-xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estatísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'cards'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Compêndio ({discoveredCount}/{totalSkillsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('bosses')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'bosses'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>Ameaças (Chefes)</span>
          </button>
        </div>

        {/* Conteúdo com Scroll Interno */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-4 min-h-0">
          {/* TAB 1: ESTATÍSTICAS DA CARREIRA */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-4">
              {/* Grid de KPIs principais */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Recorde de Pontos
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {stats.highScore.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[9px] text-stone-500">Maior score histórico</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Vitórias da Run
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">{stats.gamesWon}</span>
                    <span className="text-xs text-stone-500">/ {stats.gamesPlayed} partidas</span>
                  </div>
                  <span className="text-[9px] text-stone-500">{winRate}% taxa de vitória</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Maior Sequência
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-orange-400">
                    {stats.maxStreak}x
                  </span>
                  <span className="text-[9px] text-stone-500">Atual: {stats.currentStreak}x</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Palavras Decifradas
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-400">
                    {stats.wordsSolved}
                  </span>
                  <span className="text-[9px] text-stone-500">Total resolvido</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    Chefes Derrotados
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">
                    {stats.bossesDefeated}
                  </span>
                  <span className="text-[9px] text-stone-500">Ameaças neutralizadas</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Setor Mais Alto
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-400">
                    Setor {stats.highestSector}
                  </span>
                  <span className="text-[9px] text-stone-500">Profundidade máxima</span>
                </div>
              </div>

              {/* Distribuição de Palpites (Estilo Wordle / Balatro) */}
              <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800 flex flex-col gap-3">
                <span className="text-xs uppercase font-bold text-stone-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Distribuição de Tentativas por Palavra
                </span>

                <div className="flex flex-col gap-2">
                  {(['1', '2', '3', '4', '5', '6'] as const).map(numStr => {
                    const count = stats.guessDistribution?.[numStr] || 0;
                    const percentage = Math.max(8, Math.round((count / maxDistributionCount) * 100));

                    return (
                      <div key={numStr} className="flex items-center gap-2 text-xs">
                        <span className="w-4 font-bold text-stone-400 text-center">{numStr}</span>
                        <div className="flex-1 bg-stone-950/60 rounded-md h-6 p-0.5 overflow-hidden border border-stone-800/80">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, delay: Number(numStr) * 0.05 }}
                            className={`h-full rounded flex items-center justify-end px-2 font-bold text-[11px] ${
                              numStr === '1'
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-stone-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : numStr === '2'
                                ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-stone-950'
                                : numStr === '3'
                                ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-stone-950'
                                : 'bg-stone-800 text-stone-200'
                            }`}
                          >
                            <span>{count}</span>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPÊNDIO DE CARTAS (CODEX) */}
          {activeTab === 'cards' && (
            <div className="flex flex-col gap-3">
              {/* Barra de Progresso do Deck */}
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-300">Progresso do Compêndio</span>
                  <span className="text-amber-400">{discoveredCount} de {totalSkillsCount} Cartas Descobertas ({collectionPercentage}%)</span>
                </div>
                <div className="w-full bg-stone-950 rounded-full h-2.5 overflow-hidden border border-stone-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${collectionPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  />
                </div>
              </div>

              {/* Filtros de Cartas */}
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'active', label: 'Ativas' },
                  { id: 'passive', label: 'Passivas' },
                  { id: 'discovered', label: 'Descobertas' },
                  { id: 'locked', label: 'Bloqueadas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCardFilter(tab.id as typeof cardFilter)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors ${
                      cardFilter === tab.id
                        ? 'bg-amber-500 border-amber-400 text-stone-950 font-black'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid de Cartas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredSkills.map(skill => {
                  const isDiscovered = discoveredSkillIds.includes(skill.id);

                  if (!isDiscovered) {
                    return (
                      <div
                        key={skill.id}
                        className="p-3 rounded-xl border border-dashed border-stone-800/80 bg-stone-950/40 flex items-center gap-3 opacity-60 select-none"
                      >
                        <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-stone-500 tracking-wider">
                            ??? [DADO CRIPTOGRAFADO]
                          </span>
                          <span className="text-[10px] text-stone-600">
                            Encontre e instale esta carta em uma partida para adicioná-la ao Compêndio.
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={skill.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${getRarityBorder(
                        skill.rarity,
                        true
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-stone-100 tracking-wide">
                            {skill.name}
                          </span>
                          <span className="text-[10px] text-stone-400 font-semibold">
                            {skill.tagline}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                              skill.type === 'active'
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                                : 'bg-purple-950/80 border-purple-500 text-purple-300'
                            }`}
                          >
                            {skill.type === 'active' ? 'Ativa' : 'Passiva'}
                          </span>
                          {getRarityBadge(skill.rarity)}
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 leading-relaxed bg-black/30 p-2 rounded-lg border border-stone-800/50">
                        {skill.description}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-stone-400 pt-1 border-t border-stone-800/40">
                        <span>
                          {skill.type === 'active'
                            ? `Cargas: ${skill.chargesMax}`
                            : 'Efeito Permanente'}
                        </span>
                        <span className="text-amber-400 font-bold">
                          Power Score: {skill.powerScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BANCO DE AMEAÇAS (CHEFES) */}
          {activeTab === 'bosses' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-stone-400">
                O Mainframe protege seus setores com Anomalias de Hardware. Prepare sua build para enfrentar cada uma delas:
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {BOSS_LORE.map(boss => (
                  <div
                    key={boss.name}
                    className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60 flex flex-col gap-2 hover:border-stone-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skull className="w-4 h-4 text-rose-500" />
                        <span className={`text-sm font-black tracking-wider ${boss.color}`}>
                          {boss.name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-bold">
                          ({boss.tagline})
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-bold">
                        {boss.sector}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {boss.description}
                    </p>

                    <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800/80 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-400">Dica Tática:</strong> {boss.tactic}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé: Botão Fechar */}
        <div className="border-t border-stone-800 pt-3 flex justify-end shrink-0">
          <button
            onClick={closeCodex}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold transition-colors"
          >
            Fechar Terminal
          </button>
        </div>
      </motion.div>
    </div>
  );
};
