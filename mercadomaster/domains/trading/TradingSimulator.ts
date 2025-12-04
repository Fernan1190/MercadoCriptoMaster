/**
 * TradingSimulator - Lógica pura de trading
 * ✅ Sin estado, sin contexto, sin side-effects
 * ✅ Totalmente testeable
 */

export interface TradingState {
  portfolio: { [symbol: string]: number };
  balance: number;
  transactions: Transaction[];
  pendingOrders: PendingOrder[];
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  commission: number;
  timestamp: number;
  pnl: number;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  type: 'stop_loss' | 'take_profit';
  triggerPrice: number;
  amount: number;
  createdAt: number;
  status: 'pending' | 'executed' | 'cancelled';
}

export interface TradeResult {
  success: boolean;
  pnl: number;
  newBalance: number;
  message: string;
  executionPrice?: number;
}

export interface SkillBonuses {
  commissionReduction?: number; // 0-1
  slippageReduction?: number;   // 0-1
  xpPercentBonus?: number;      // 0-1
}

export class TradingSimulator {
  private baseCommissionRate = 0.001; // 0.1%
  private baseSlippage = 0.0005; // 0.05%

  /**
   * Compra un activo
   * @param state Estado actual del trading
   * @param symbol Símbolo (BTC, ETH, etc)
   * @param amount Cantidad a comprar
   * @param marketPrice Precio actual de mercado
   * @param skills Bonificaciones por skills
   */
  buyAsset(
    state: TradingState,
    symbol: string,
    amount: number,
    marketPrice: number,
    skills?: SkillBonuses
  ): TradeResult {
    // 1. Validar inputs
    if (amount <= 0 || marketPrice <= 0) {
      return {
        success: false,
        pnl: 0,
        newBalance: state.balance,
        message: 'Cantidad o precio inválido',
      };
    }

    // 2. Calcular slippage (peor precio por volumen)
    const skillSlippageReduction = skills?.slippageReduction ?? 0;
    const effectiveSlippage = this.baseSlippage * (1 - skillSlippageReduction);
    const slippageAmount = marketPrice * effectiveSlippage;
    const executionPrice = marketPrice + slippageAmount;

    // 3. Calcular comisión (afectada por skills)
    const skillCommissionReduction = skills?.commissionReduction ?? 0;
    const effectiveCommission = this.baseCommissionRate * (1 - skillCommissionReduction);

    // 4. Costo total
    const assetCost = amount * executionPrice;
    const commissionCost = assetCost * effectiveCommission;
    const totalCost = assetCost + commissionCost;

    // 5. Validar fondos
    if (state.balance < totalCost) {
      return {
        success: false,
        pnl: 0,
        newBalance: state.balance,
        message: `Fondos insuficientes. Necesitas $${totalCost.toFixed(2)}, tienes $${state.balance.toFixed(2)}`,
        executionPrice,
      };
    }

    // 6. Ejecutar
    const newPortfolio = { ...state.portfolio };
    newPortfolio[symbol] = (newPortfolio[symbol] ?? 0) + amount;

    const newBalance = state.balance - totalCost;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'buy',
      symbol,
      amount,
      price: executionPrice,
      commission: commissionCost,
      timestamp: Date.now(),
      pnl: -commissionCost, // Pérdida por comisión
    };

    return {
      success: true,
      pnl: -commissionCost,
      newBalance,
      message: `Compra de ${amount} ${symbol} a $${executionPrice.toFixed(2)}`,
      executionPrice,
    };
  }

  /**
   * Vende un activo
   */
  sellAsset(
    state: TradingState,
    symbol: string,
    amount: number,
    marketPrice: number,
    skills?: SkillBonuses
  ): TradeResult {
    // 1. Validar inputs
    if (amount <= 0 || marketPrice <= 0) {
      return {
        success: false,
        pnl: 0,
        newBalance: state.balance,
        message: 'Cantidad o precio inválido',
      };
    }

    // 2. Validar que tenemos suficiente
    const currentQty = state.portfolio[symbol] ?? 0;
    if (currentQty < amount) {
      return {
        success: false,
        pnl: 0,
        newBalance: state.balance,
        message: `No tienes suficiente ${symbol}. Tienes ${currentQty}, intentas vender ${amount}`,
      };
    }

    // 3. Calcular slippage (peor precio al vender)
    const skillSlippageReduction = skills?.slippageReduction ?? 0;
    const effectiveSlippage = this.baseSlippage * (1 - skillSlippageReduction);
    const slippageAmount = marketPrice * effectiveSlippage;
    const executionPrice = marketPrice - slippageAmount; // Precio peor al vender

    // 4. Calcular comisión
    const skillCommissionReduction = skills?.commissionReduction ?? 0;
    const effectiveCommission = this.baseCommissionRate * (1 - skillCommissionReduction);

    // 5. Ganancia bruta
    const grossProceeds = amount * executionPrice;
    const commissionCost = grossProceeds * effectiveCommission;
    const netProceeds = grossProceeds - commissionCost;

    // 6. Ejecutar
    const newPortfolio = { ...state.portfolio };
    newPortfolio[symbol] = currentQty - amount;

    const newBalance = state.balance + netProceeds;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'sell',
      symbol,
      amount,
      price: executionPrice,
      commission: commissionCost,
      timestamp: Date.now(),
      pnl: netProceeds - (amount * marketPrice), // Ganancia/pérdida real
    };

    return {
      success: true,
      pnl: transaction.pnl,
      newBalance,
      message: `Venta de ${amount} ${symbol} a $${executionPrice.toFixed(2)}, ganancia: $${transaction.pnl.toFixed(2)}`,
      executionPrice,
    };
  }

  /**
   * Coloca una orden de stop-loss o take-profit
   */
  placeOrder(
    state: TradingState,
    symbol: string,
    type: 'stop_loss' | 'take_profit',
    triggerPrice: number,
    amount: number
  ): PendingOrder | null {
    // Validar que se puede ejecutar
    const available = state.portfolio[symbol] ?? 0;
    if (available < amount) {
      console.warn(`Cannot place order: only have ${available} ${symbol}`);
      return null;
    }

    return {
      id: crypto.randomUUID(),
      symbol,
      type,
      triggerPrice,
      amount,
      createdAt: Date.now(),
      status: 'pending',
    };
  }

  /**
   * Ejecuta órdenes pending si se cumplen las condiciones
   */
  executeOrder(
    state: TradingState,
    order: PendingOrder,
    currentPrice: number
  ): { executed: boolean; result?: TradeResult } {
    if (order.status !== 'pending') {
      return { executed: false };
    }

    let shouldExecute = false;

    if (order.type === 'stop_loss' && currentPrice <= order.triggerPrice) {
      shouldExecute = true;
    }

    if (order.type === 'take_profit' && currentPrice >= order.triggerPrice) {
      shouldExecute = true;
    }

    if (shouldExecute) {
      const result = this.sellAsset(state, order.symbol, order.amount, currentPrice);
      return { executed: result.success, result };
    }

    return { executed: false };
  }

  /**
   * Calcula PnL de una posición actual
   */
  calculatePnL(
    symbolHoldings: number,
    buyPrice: number,
    currentPrice: number
  ): { pnl: number; pnlPercentage: number } {
    const pnl = (currentPrice - buyPrice) * symbolHoldings;
    const pnlPercentage = ((currentPrice - buyPrice) / buyPrice) * 100;

    return { pnl, pnlPercentage };
  }

  /**
   * Calcula el valor total del portfolio en USD
   */
  calculatePortfolioValue(
    portfolio: { [symbol: string]: number },
    prices: { [symbol: string]: number }
  ): number {
    let total = 0;
    for (const [symbol, amount] of Object.entries(portfolio)) {
      const price = prices[symbol] ?? 0;
      total += amount * price;
    }
    return total;
  }

  /**
   * Calcula el ratio de utilización del capital
   */
  calculateCapitalUtilization(
    balance: number,
    portfolioValue: number
  ): number {
    const totalCapital = balance + portfolioValue;
    if (totalCapital === 0) return 0;
    return (portfolioValue / totalCapital) * 100;
  }

  /**
   * Valida si la cantidad es válida para comprar
   */
  isValidBuyAmount(balance: number, amount: number, price: number): boolean {
    const totalNeeded = amount * price * (1 + this.baseCommissionRate);
    return balance >= totalNeeded && amount > 0 && price > 0;
  }

  /**
   * Valida si la cantidad es válida para vender
   */
  isValidSellAmount(holdings: number, amount: number): boolean {
    return holdings >= amount && amount > 0;
  }
}
