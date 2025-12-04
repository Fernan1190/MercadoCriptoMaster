/**
 * Hook: useTradingDomain
 * Maneja TODO lo relacionado con trading, portfolio, órdenes
 */

import { useState, useCallback, useMemo } from 'react';
import { TradingSimulator } from '../domains/trading/TradingSimulator';
import type {
  TradingState,
  Transaction,
  PendingOrder,
  TradeResult,
  SkillBonuses,
} from '../domains/trading/TradingSimulator';

const tradingSimulator = new TradingSimulator();

interface UseTradingDomainProps {
  initialBalance?: number;
  initialPortfolio?: { [symbol: string]: number };
  onBuySuccess?: (result: TradeResult) => void;
  onSellSuccess?: (result: TradeResult) => void;
  onOrderExecuted?: (orderId: string) => void;
}

export function useTradingDomain({
  initialBalance = 10000,
  initialPortfolio = {},
  onBuySuccess,
  onSellSuccess,
  onOrderExecuted,
}: UseTradingDomainProps = {}) {
  const [state, setState] = useState<TradingState>({
    portfolio: initialPortfolio,
    balance: initialBalance,
    transactions: [],
    pendingOrders: [],
  });

  /**
   * Compra un activo
   */
  const buyAsset = useCallback(
    (symbol: string, amount: number, marketPrice: number, skills?: SkillBonuses) => {
      const result = tradingSimulator.buyAsset(state, symbol, amount, marketPrice, skills);

      if (result.success) {
        setState(prev => ({
          ...prev,
          balance: result.newBalance,
          portfolio: {
            ...prev.portfolio,
            [symbol]: (prev.portfolio[symbol] ?? 0) + amount,
          },
          transactions: [
            {
              id: crypto.randomUUID(),
              type: 'buy',
              symbol,
              amount,
              price: result.executionPrice ?? marketPrice,
              commission: result.pnl < 0 ? Math.abs(result.pnl) : 0,
              timestamp: Date.now(),
              pnl: result.pnl,
            },
            ...prev.transactions,
          ],
        }));

        onBuySuccess?.(result);
      }

      return result;
    },
    [state, onBuySuccess]
  );

  /**
   * Vende un activo
   */
  const sellAsset = useCallback(
    (symbol: string, amount: number, marketPrice: number, skills?: SkillBonuses) => {
      const result = tradingSimulator.sellAsset(state, symbol, amount, marketPrice, skills);

      if (result.success) {
        setState(prev => ({
          ...prev,
          balance: result.newBalance,
          portfolio: {
            ...prev.portfolio,
            [symbol]: (prev.portfolio[symbol] ?? 0) - amount,
          },
          transactions: [
            {
              id: crypto.randomUUID(),
              type: 'sell',
              symbol,
              amount,
              price: result.executionPrice ?? marketPrice,
              commission: 0,
              timestamp: Date.now(),
              pnl: result.pnl,
            },
            ...prev.transactions,
          ],
          pendingOrders: prev.pendingOrders.filter(o => !(o.symbol === symbol && o.amount === amount)),
        }));

        onSellSuccess?.(result);
      }

      return result;
    },
    [state, onSellSuccess]
  );

  /**
   * Coloca una orden de stop-loss o take-profit
   */
  const placeOrder = useCallback(
    (symbol: string, type: 'stop_loss' | 'take_profit', triggerPrice: number, amount: number) => {
      const order = tradingSimulator.placeOrder(state, symbol, type, triggerPrice, amount);

      if (order) {
        setState(prev => ({
          ...prev,
          pendingOrders: [...prev.pendingOrders, order],
        }));
        return true;
      }

      return false;
    },
    [state]
  );

  /**
   * Ejecuta órdenes cuando el precio las cumple
   */
  const checkAndExecuteOrders = useCallback(
    (symbol: string, currentPrice: number) => {
      setState(prev => {
        const executed: string[] = [];
        let newOrders = [...prev.pendingOrders];

        for (const order of newOrders) {
          if (order.symbol === symbol && order.status === 'pending') {
            const { executed: didExecute, result } = tradingSimulator.executeOrder(
              prev,
              order,
              currentPrice
            );

            if (didExecute && result?.success) {
              // Marcar orden como ejecutada
              const orderIndex = newOrders.findIndex(o => o.id === order.id);
              if (orderIndex !== -1) {
                newOrders[orderIndex].status = 'executed';
                executed.push(order.id);

                // Actualizar state como si fue un sell
                prev.balance = result.newBalance;
                prev.portfolio[symbol] = (prev.portfolio[symbol] ?? 0) - order.amount;
              }
            }
          }
        }

        // Callback para cada orden ejecutada
        executed.forEach(orderId => onOrderExecuted?.(orderId));

        return {
          ...prev,
          pendingOrders: newOrders,
        };
      });
    },
    [onOrderExecuted]
  );

  /**
   * Cancela una orden pending
   */
  const cancelOrder = useCallback((orderId: string) => {
    setState(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ),
    }));
  }, []);

  /**
   * Calcula PnL de una posición
   */
  const calculatePnL = useCallback(
    (symbol: string, currentPrice: number) => {
      const holdings = state.portfolio[symbol] ?? 0;
      if (holdings === 0) return { pnl: 0, pnlPercentage: 0 };

      // Buscar precio promedio de compra
      const buys = state.transactions.filter(t => t.type === 'buy' && t.symbol === symbol);
      if (buys.length === 0) return { pnl: 0, pnlPercentage: 0 };

      const totalCost = buys.reduce((sum, t) => sum + t.amount * t.price, 0);
      const avgBuyPrice = totalCost / holdings;

      return tradingSimulator.calculatePnL(holdings, avgBuyPrice, currentPrice);
    },
    [state.portfolio, state.transactions]
  );

  /**
   * Obtiene el valor del portfolio
   */
  const getPortfolioValue = useCallback(
    (prices: { [symbol: string]: number }) => {
      return tradingSimulator.calculatePortfolioValue(state.portfolio, prices);
    },
    [state.portfolio]
  );

  /**
   * Obtiene utilización de capital
   */
  const getCapitalUtilization = useCallback(
    (prices: { [symbol: string]: number }) => {
      const portfolioValue = tradingSimulator.calculatePortfolioValue(state.portfolio, prices);
      return tradingSimulator.calculateCapitalUtilization(state.balance, portfolioValue);
    },
    [state.balance, state.portfolio]
  );

  /**
   * Valida si puede comprar
   */
  const canBuy = useCallback(
    (amount: number, price: number) => {
      return tradingSimulator.isValidBuyAmount(state.balance, amount, price);
    },
    [state.balance]
  );

  /**
   * Valida si puede vender
   */
  const canSell = useCallback(
    (symbol: string, amount: number) => {
      const holdings = state.portfolio[symbol] ?? 0;
      return tradingSimulator.isValidSellAmount(holdings, amount);
    },
    [state.portfolio]
  );

  const actions = useMemo(
    () => ({
      buyAsset,
      sellAsset,
      placeOrder,
      checkAndExecuteOrders,
      cancelOrder,
      calculatePnL,
      getPortfolioValue,
      getCapitalUtilization,
      canBuy,
      canSell,
    }),
    [
      buyAsset,
      sellAsset,
      placeOrder,
      checkAndExecuteOrders,
      cancelOrder,
      calculatePnL,
      getPortfolioValue,
      getCapitalUtilization,
      canBuy,
      canSell,
    ]
  );

  return { state, actions };
}
