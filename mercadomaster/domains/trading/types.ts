/**
 * Types para el dominio de Trading
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
  commissionReduction?: number; // 0-1: cuánto reduces comisiones
  slippageReduction?: number;   // 0-1: cuánto reduces slippage
  xpPercentBonus?: number;      // 0-1: bonificación XP por trades
}

export interface PnLData {
  pnl: number;
  pnlPercentage: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  capitalUtilization: number; // % del capital invertido
  holdingsCount: number;
}

export interface TradingActions {
  buyAsset: (
    symbol: string,
    amount: number,
    marketPrice: number,
    skills?: SkillBonuses
  ) => TradeResult;
  sellAsset: (
    symbol: string,
    amount: number,
    marketPrice: number,
    skills?: SkillBonuses
  ) => TradeResult;
  placeOrder: (
    symbol: string,
    type: 'stop_loss' | 'take_profit',
    triggerPrice: number,
    amount: number
  ) => boolean;
  checkAndExecuteOrders: (symbol: string, currentPrice: number) => void;
  cancelOrder: (orderId: string) => void;
  calculatePnL: (symbol: string, currentPrice: number) => PnLData;
  getPortfolioValue: (prices: { [symbol: string]: number }) => number;
  getCapitalUtilization: (prices: { [symbol: string]: number }) => number;
  canBuy: (amount: number, price: number) => boolean;
  canSell: (symbol: string, amount: number) => boolean;
}
