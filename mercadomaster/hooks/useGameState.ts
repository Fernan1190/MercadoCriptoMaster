/**
 * Hook: useGameState
 * Orquestador central - combina todos los dominios
 * Este es el "maestro" que coordina trading + progression + mining + market
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useProgressionDomain } from './useProgressionDomain';
import { useTradingDomain } from './useTradingDomain';
import { useMiningDomain } from './useMiningDomain';
import { useMarketDomain } from './useMarketDomain';
import type { TradeResult } from '../domains/trading/TradingSimulator';

export interface GameStateConfig {
  initialBalance?: number;
  bitcoinPrice?: number;
  onXPGain?: (amount: number) => void;
  onLevelUp?: (level: number) => void;
  onTradeExecuted?: (result: TradeResult) => void;
  onMinerPurchased?: (minerId: string) => void;
}

export function useGameState(config: GameStateConfig = {}) {
  // Inicializar todos los dominios
  const progression = useProgressionDomain({
    onLevelUp: config.onLevelUp,
  });

  const trading = useTradingDomain({
    initialBalance: config.initialBalance ?? 10000,
    onBuySuccess: config.onTradeExecuted,
    onSellSuccess: config.onTradeExecuted,
  });

  const mining = useMiningDomain({
    initialBalance: config.initialBalance ?? 10000,
    bitcoinPrice: config.bitcoinPrice ?? 45000,
    onMinerPurchased: (miner) => {
      config.onMinerPurchased?.(miner.instanceId);
    },
  });

  const market = useMarketDomain({
    initialPrices: { BTC: config.bitcoinPrice ?? 45000, ETH: 2500, ADA: 0.8 },
    onPriceUpdate: (symbol, newPrice) => {
      // Ejecutar órdenes pending si se cumplen
      trading.actions.checkAndExecuteOrders(symbol, newPrice);
    },
  });

  // ────────────────────────────────────────────────────────────────
  // ORQUESTACIÓN: Cómo interactúan los dominios
  // ────────────────────────────────────────────────────────────────

  /**
   * Ejecuta un trade y automáticamente gana XP
   */
  const executeTrade = useCallback(
    (symbol: string, amount: number, tradeType: 'buy' | 'sell') => {
      const currentPrice = market.state.prices[symbol];
      if (!currentPrice) return false;

      let result;
      if (tradeType === 'buy') {
        result = trading.actions.buyAsset(symbol, amount, currentPrice);
      } else {
        result = trading.actions.sellAsset(symbol, amount, currentPrice);
      }

      if (result.success) {
        // 1. Calcular XP basado en el trade
        const portfolioValue = trading.actions.getPortfolioValue(market.state.prices);
        const totalCapital = trading.state.balance + portfolioValue;
        const riskScore = (amount * currentPrice) / totalCapital;

        const xpGain = progression.actions.calculateTradeXP(
          result.pnl > 0 ? 2 : -2, // PnL percentage (simplificado)
          riskScore
        );

        // 2. Agregar XP y chequear level up
        progression.actions.addXP(xpGain.totalXP);
        config.onXPGain?.(xpGain.totalXP);

        // 3. Actualizar streak
        if (result.pnl > 0) {
          progression.actions.addStreak();
        } else {
          progression.actions.handleTradeResult(result.pnl < 0 ? -1 : 1);
        }

        config.onTradeExecuted?.(result);
        return true;
      }

      return false;
    },
    [trading.actions, market.state.prices, progression.actions, trading.state.balance, config]
  );

  /**
   * Actualiza minería (llamar periódicamente)
   */
  const updateMiningProduction = useCallback(() => {
    mining.actions.updateMining(1); // 1 segundo por tick

    // Ganar XP pasivo por minería activa
    const production = mining.actions.calculateProduction();
    if (production.btcPerDay > 0) {
      const passiveXP = Math.floor(production.btcPerDay * 10);
      progression.actions.addXP(passiveXP, 0.1); // 10% XP multiplicador
    }
  }, [mining.actions, progression.actions]);

  /**
   * Vende crypto minada y gana coins
   */
  const sellMinedCryptoAndReward = useCallback(() => {
    const earnings = mining.actions.sellMinedCrypto();

    // Ganar XP por vender
    const xp = Math.floor(earnings / 100); // 1 XP por cada $100
    progression.actions.addXP(xp);

    config.onXPGain?.(xp);
    return earnings;
  }, [mining.actions, progression.actions, config]);

  /**
   * Compra un skill y aplica sus efectos
   */
  const purchaseSkill = useCallback(
    (skillId: string, cost: number, skillEffects?: { commissionReduction?: number }) => {
      if (!progression.actions.unlockSkill(skillId, cost)) {
        return false;
      }

      // Los efectos del skill se aplican automáticamente en los trades
      // (porque usamos progression.state.unlockedSkills en trading)

      return true;
    },
    [progression.actions]
  );

  // ────────────────────────────────────────────────────────────────
  // RETORNO: Estado consolidado
  // ────────────────────────────────────────────────────────────────

  const gameState = useMemo(
    () => ({
      // Estados
      progressionState: progression.state,
      tradingState: trading.state,
      miningState: mining.state,
      marketState: market.state,

      // Acciones orquestadas
      executeTrade,
      updateMiningProduction,
      sellMinedCryptoAndReward,
      purchaseSkill,

      // Acciones de cada dominio (fallback)
      progressionActions: progression.actions,
      tradingActions: trading.actions,
      miningActions: mining.actions,
      marketActions: market.actions,
    }),
    [
      progression.state,
      trading.state,
      mining.state,
      market.state,
      executeTrade,
      updateMiningProduction,
      sellMinedCryptoAndReward,
      purchaseSkill,
      progression.actions,
      trading.actions,
      mining.actions,
      market.actions,
    ]
  );

  return gameState;
}
