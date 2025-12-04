/**
 * Hook: useMarketDomain
 * Maneja TODO lo relacionado con precios, eventos, técnicos
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MarketSimulator } from '../domains/market/MarketSimulator';
import type { MarketState, CandleData, MarketEvent } from '../domains/market/MarketSimulator';

const marketSimulator = new MarketSimulator();

interface UseMarketDomainProps {
  initialPrices?: { [symbol: string]: number };
  updateInterval?: number; // ms
  onPriceUpdate?: (symbol: string, newPrice: number) => void;
  onEventTriggered?: (event: MarketEvent) => void;
}

export function useMarketDomain({
  initialPrices = { BTC: 45000, ETH: 2500, ADA: 0.8 },
  updateInterval = 2000,
  onPriceUpdate,
  onEventTriggered,
}: UseMarketDomainProps = {}) {
  const [state, setState] = useState<MarketState>({
    prices: initialPrices,
    history: Object.keys(initialPrices).reduce((acc, symbol) => {
      acc[symbol] = [];
      return acc;
    }, {} as { [symbol: string]: CandleData[] }),
    trend: Object.keys(initialPrices).reduce((acc, symbol) => {
      acc[symbol] = 'neutral';
      return acc;
    }, {} as { [symbol: string]: 'up' | 'down' | 'neutral' }),
    phase: 'accumulation',
    activeEvents: [],
    globalVolatility: 0.002,
  });

  /**
   * Genera la próxima vela para un símbolo
   */
  const generateCandle = useCallback(
    (symbol: string) => {
      const lastCandle = state.history[symbol]?.[state.history[symbol].length - 1];
      const lastPrice = lastCandle?.close ?? state.prices[symbol] ?? 45000;

      // Calcular impacto de eventos
      let eventVolatilityMultiplier = 1;
      let trendBias = 0;

      for (const { event } of state.activeEvents) {
        if (event.impact[symbol]) {
          eventVolatilityMultiplier *= event.impact[symbol];
          trendBias += event.impact[symbol] > 1 ? 0.05 : -0.05;
        }
      }

      const candle = marketSimulator.generateNextCandle(
        lastPrice,
        state.globalVolatility,
        eventVolatilityMultiplier,
        trendBias
      );

      return candle;
    },
    [state.prices, state.history, state.activeEvents, state.globalVolatility]
  );

  /**
   * Actualiza precios de todos los símbolos
   */
  const updatePrices = useCallback(
    (symbols: string[]) => {
      setState(prev => {
        const newPrices = { ...prev.prices };
        const newHistory = { ...prev.history };
        const newTrends = { ...prev.trend };

        for (const symbol of symbols) {
          const candle = generateCandle(symbol);

          newPrices[symbol] = candle.close;
          newHistory[symbol] = [...(newHistory[symbol] || []), candle].slice(-100);
          newTrends[symbol] = marketSimulator.determineTrend(
            candle.close,
            marketSimulator.calculateSMA(newHistory[symbol], 20)
          );

          onPriceUpdate?.(symbol, candle.close);
        }

        // Decrementar ticks de eventos activos
        let newEvents = prev.activeEvents.map(e => ({
          ...e,
          ticksLeft: e.ticksLeft - 1,
        }));

        newEvents = newEvents.filter(e => e.ticksLeft > 0);

        return {
          ...prev,
          prices: newPrices,
          history: newHistory,
          trend: newTrends,
          activeEvents: newEvents,
        };
      });
    },
    [generateCandle, onPriceUpdate]
  );

  /**
   * Triggeriza un evento de mercado
   */
  const triggerEvent = useCallback(
    (event: MarketEvent) => {
      setState(prev => ({
        ...prev,
        activeEvents: [...prev.activeEvents, { event, ticksLeft: event.duration }],
      }));

      onEventTriggered?.(event);
    },
    [onEventTriggered]
  );

  /**
   * Obtiene indicadores técnicos para un símbolo
   */
  const getTechnicalIndicators = useCallback(
    (symbol: string) => {
      const candles = state.history[symbol] ?? [];

      return {
        rsi: marketSimulator.calculateRSI(candles),
        macd: marketSimulator.calculateMACD(candles),
        bollinger: marketSimulator.calculateBollingerBands(candles),
        sma: marketSimulator.calculateSMA(candles),
        volatility: marketSimulator.calculateHistoricalVolatility(candles),
      };
    },
    [state.history]
  );

  /**
   * Obtiene señal de trade para un símbolo
   */
  const getTradeSignal = useCallback(
    (symbol: string) => {
      const indicators = getTechnicalIndicators(symbol);
      return marketSimulator.getTradeSignal(indicators.rsi, indicators.macd.histogram);
    },
    [getTechnicalIndicators]
  );

  /**
   * Loop de actualización de precios cada X ms
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = Object.keys(state.prices);
      updatePrices(symbols);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [state.prices, updatePrices, updateInterval]);

  const actions = useMemo(
    () => ({
      updatePrices,
      triggerEvent,
      getTechnicalIndicators,
      getTradeSignal,
      generateCandle,
    }),
    [updatePrices, triggerEvent, getTechnicalIndicators, getTradeSignal, generateCandle]
  );

  return { state, actions };
}
