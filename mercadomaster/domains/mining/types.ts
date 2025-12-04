/**
 * Types para el dominio de Mining
 */

export interface InstalledMiner {
  instanceId: string;
  modelId: string;
  condition: number; // 0-100
  active: boolean;
  lastRepairTime: number;
}

export interface InstalledRack {
  instanceId: string;
  modelId: string;
  slots: (InstalledMiner | null)[];
}

export interface MiningFarmState {
  racks: InstalledRack[];
  minedFragments: number;
  totalHashrate: number;
  totalPowerConsumption: number;
  electricityCostPerWatt: number;
}

export interface MinerModel {
  id: string;
  name: string;
  hashrate: number;
  power: number;
  cost: number;
  level: number;
  degradationRate: number;
}

export interface RackModel {
  id: string;
  name: string;
  slots: number;
  cost: number;
  level: number;
}

export interface ProductionMetrics {
  btcPerSecond: number;
  btcPerHour: number;
  btcPerDay: number;
  usdPerSecond: number;
  usdPerHour: number;
  usdPerDay: number;
}

export interface MiningROI {
  totalInvestment: number;
  dailyProfit: number;
  monthlyProfit: number;
  daysToBreakEven: number;
  annualROI: number;
}

export interface MinerHealth {
  minerInstanceId: string;
  condition: number;
  health: 'healthy' | 'degraded' | 'critical' | 'broken';
  isActive: boolean;
}

export interface MiningEfficiency {
  hashPerWatt: number;
  usdPerWatt: number;
  profitability: number;
}

export interface MiningActions {
  buyRack: (rackModelId: string) => boolean;
  buyMiner: (minerModelId: string, rackInstanceId: string) => boolean;
  repairMiner: (rackInstanceId: string, slotIndex: number) => boolean;
  toggleMiner: (rackInstanceId: string, slotIndex: number, active: boolean) => boolean;
  sellMinedCrypto: () => boolean;
  calculateROI: () => MiningROI;
  getEfficiency: () => MiningEfficiency;
}
