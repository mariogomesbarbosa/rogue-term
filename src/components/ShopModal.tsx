'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  RefreshCw,
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Layers,
  Skull,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';
import { KeycapIcon } from './KeycapIcon';
import { getCardSellValue } from '@/data/skills';

export const ShopModal: React.FC = () => {
  const {
    gamePhase,
    coins,
    shopItems,
    rerollCost,
    lastRoundEarnings,
    activeSkills,
    passives,
    sector,
    stage,
    keys,
    maxKeys,
    buyShopItem,
    sellSkillCard,
    rerollShop,
    closeShopAndNextRound
  } = useGameStore();

  if (gamePhase !== 'shop') return null;

  const isNextBoss = stage === 2; // se acabou de vencer a fase 2, a próxima é o Chefe (stage 3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto no-scrollbar font-mono text-stone-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-stone-950 border-2 border-stone-800 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 my-auto relative overflow-hidden"
      >
        {/* Cabeçalho da Loja */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">
                  MERCADO DE HARDWARE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-stone-900 border border-stone-700 text-stone-300">
                  Setor {sector}
                </span>
              </div>
              <span className="text-xs text-stone-400">
                Aprimore suas cartas e faça a manutenção das suas Teclas [T]
              </span>
            </div>
          </div>

          {/* Saldo de Moedas & Fôlego */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-400">{coins}</span>
                <span className="text-[10px] text-stone-500 font-bold uppercase">Créditos</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800">
              <KeycapIcon size="sm" label="T" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-stone-200">{keys}</span>
                <span className="text-xs text-stone-500">/{maxKeys}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Ganhos da Última Rodada */}
        {lastRoundEarnings && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-stone-900/60 border border-stone-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-stone-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ganhos da Rodada:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-stone-300">
              <span>Vitória: <strong className="text-emerald-400">+${lastRoundEarnings.baseReward}</strong></span>
              <span>Eficiência: <strong className="text-emerald-400">+${lastRoundEarnings.efficiencyBonus}</strong></span>
              {lastRoundEarnings.bossBonus > 0 && (
                <span>Chefe: <strong className="text-rose-400">+${lastRoundEarnings.bossBonus}</strong></span>
              )}
              {lastRoundEarnings.goldSwitchBonus > 0 && (
                <span>Switch Dourado: <strong className="text-amber-400">+${lastRoundEarnings.goldSwitchBonus}</strong></span>
              )}
              {lastRoundEarnings.timeBonusCredits && lastRoundEarnings.timeBonusCredits > 0 ? (
                <span>Agilidade: <strong className="text-emerald-400">+${lastRoundEarnings.timeBonusCredits}</strong></span>
              ) : null}
              <span>Juros: <strong className="text-cyan-400">+${lastRoundEarnings.interest}</strong></span>
              <span className="border-l border-stone-700 pl-2 font-black text-amber-400">
                Total: +${lastRoundEarnings.total}
              </span>
            </div>
          </div>
        )}

        {/* Prateleira da Loja (Itens à Venda) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black tracking-widest text-stone-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Prateleira de Peças & Cartas
            </span>

            <button
              onClick={rerollShop}
              disabled={coins < rerollCost}
              className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                coins >= rerollCost
                  ? 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-stone-800 hover:border-amber-400'
                  : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reroll (${rerollCost})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {shopItems.map(item => {
              const canAfford = coins >= item.price;
              const isCard = item.type === 'card' && item.card;
              const isPassive = isCard && item.card?.type === 'passive';

              let borderColor = 'border-stone-800';
              let badgeColor = 'bg-stone-800 text-stone-300';

              if (isCard) {
                if (item.card?.rarity === 'legendary') {
                  borderColor = 'border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
                  badgeColor = 'bg-amber-950 border-amber-500 text-amber-300';
                } else if (item.card?.rarity === 'rare') {
                  borderColor = 'border-rose-500/50';
                  badgeColor = 'bg-rose-950 border-rose-500 text-rose-300';
                } else if (item.card?.rarity === 'uncommon') {
                  borderColor = 'border-cyan-500/50';
                  badgeColor = 'bg-cyan-950 border-cyan-500 text-cyan-300';
                }
              } else if (item.type === 'key_refill') {
                borderColor = 'border-emerald-600/50';
                badgeColor = 'bg-emerald-950 border-emerald-500 text-emerald-300';
              } else if (item.type === 'max_keys_upgrade') {
                borderColor = 'border-teal-600/50';
                badgeColor = 'bg-teal-950 border-teal-500 text-teal-300';
              }

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between gap-3 transition-all relative ${borderColor} ${
                    item.bought ? 'opacity-35 bg-stone-950' : 'bg-stone-900/80 hover:border-stone-600'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase ${badgeColor}`}>
                        {item.type === 'card'
                          ? isPassive
                            ? 'Passiva'
                            : 'Ativa'
                          : 'Manutenção'}
                      </span>

                      <div className="flex items-center gap-1 text-amber-400 font-black text-sm">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{item.price}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-stone-100 mt-1 line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-stone-400 leading-snug line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => buyShopItem(item.id)}
                    disabled={item.bought || !canAfford}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      item.bought
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95'
                        : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                    }`}
                  >
                    {item.bought ? (
                      'Comprado'
                    ) : canAfford ? (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span>Comprar (${item.price})</span>
                      </>
                    ) : (
                      <span>Sem Crédito</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gerenciamento do Inventário Atual (Permite Vender) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-stone-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black tracking-widest text-stone-400">
              Seu Inventário Atual (Clique em Vender para liberar slots e ganhar créditos)
            </span>
            <span className="text-[10px] text-stone-500 font-bold">
              Ativas: {activeSkills.length}/3 | Passivas: {passives.length}/5
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[...activeSkills, ...passives].map(card => {
              const sellValue = getCardSellValue(card.rarity);
              const isPassive = card.type === 'passive';

              return (
                <div
                  key={card.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                    isPassive
                      ? 'bg-purple-950/40 border-purple-800/80 text-purple-300'
                      : 'bg-cyan-950/40 border-cyan-800/80 text-cyan-300'
                  }`}
                >
                  <span>{card.name}</span>
                  <button
                    onClick={() => sellSkillCard(card.id)}
                    className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-rose-950 hover:text-rose-300 border border-stone-700 text-[10px] text-stone-400 transition-colors cursor-pointer"
                    title={`Vender ${card.name}`}
                  >
                    Vender (+${sellValue})
                  </button>
                </div>
              );
            })}

            {activeSkills.length === 0 && passives.length === 0 && (
              <span className="text-xs text-stone-600 italic">Nenhuma carta no inventário.</span>
            )}
          </div>
        </div>

        {/* Botão de Fechar a Loja e Seguir em Frente */}
        <div className="pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={closeShopAndNextRound}
            className={`py-3 px-6 rounded-xl font-black text-sm tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isNextBoss
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isNextBoss ? (
              <>
                <Skull className="w-4 h-4" />
                <span>SAIR DA LOJA E ENFRENTAR CHEFE!</span>
              </>
            ) : (
              <>
                <span>PRÓXIMO TERMINAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
