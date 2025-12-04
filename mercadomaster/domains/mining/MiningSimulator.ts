/**
 * MiningSimulator - Lógica pura de minería
 * ✅ Sin estado, sin contexto, sin side-effects
 * ✅ Totalmente testeable
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
  hashrate: number; // H/s
  power: number; // Watts
  cost: number; // Master Coins
  level: number; // Level requerido
  degradationRate: number; // % por hora
}

export interface RackModel {
  id: string;
  name: string;
  slots: number;
  cost: number; // Balance requerido
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

export interface DegradationData {
  minerInstanceId: string;
  oldCondition: number;
  newCondition: number;
  conditionLoss: number;
  isActive: boolean;
}

export interface RepairCost {
  baseCost: number;
  conditionRestored: number;
  totalCost: number;
}

export interface MiningROI {
  totalInvestment: number;
  dailyProfit: number;
  monthlyProfit: number;
  daysToBreakEven: number;
  annualROI: number;
}

export class MiningSimulator {
  private baseDifficultyMultiplier = 1000000; // 1M: conversión de hashrate a BTC
  private repairCostPerPercent = 10; // 10 coins por 1% de condición
  private minimumConditionToMine = 10; // 10% mínimo para funcionar

  /**
   * Calcula producción de BTC en función del hashrate
   */
  calculateProduction(
    totalHashrate: number,
    bitcoinPrice: number,
    difficulty: number = 1
  ): ProductionMetrics {
    // Fórmula: 1 hashrate = X BTC/segundo (ajustable por dificultad)
    const btcPerSecond = (totalHashrate / this.baseDifficultyMultiplier) * (1 / difficulty);
    const btcPerHour = btcPerSecond * 3600;
    const btcPerDay = btcPerHour * 24;

    return {
      btcPerSecond,
      btcPerHour,
      btcPerDay,
      usdPerSecond: btcPerSecond * bitcoinPrice,
      usdPerHour: btcPerHour * bitcoinPrice,
      usdPerDay: btcPerDay * bitcoinPrice,
    };
  }

  /**
   * Simula degradación de un miner
   * Los miners activos degrade más rápido que los inactivos
   */
  calculateDegradation(
    miner: InstalledMiner,
    minerModel: MinerModel,
    deltaTime: number // segundos desde última actualización
  ): DegradationData {
    let conditionLoss = 0;

    if (!miner.active) {
      // Degradación lenta si está apagado: 0.01% por hora
      const baseDeg = 0.01 / 3600; // % por segundo
      conditionLoss = baseDeg * deltaTime;
    } else {
      // Degradación activa: depende del tipo de miner
      // Miners más potentes degrade más rápido
      const powerIntensity = minerModel.power / 1000; // Normalizar a kW
      const hashrateIntensity = minerModel.hashrate / 1000; // Normalizar
      const degradationRate = minerModel.degradationRate * (powerIntensity * 0.001) * (1 / 3600);

      conditionLoss = degradationRate * deltaTime;
    }

    const newCondition = Math.max(0, miner.condition - conditionLoss);

    return {
      minerInstanceId: miner.instanceId,
      oldCondition: miner.condition,
      newCondition,
      conditionLoss,
      isActive: miner.active,
    };
  }

  /**
   * Calcula qué racks/miners están activos y su hashrate total
   */
  calculateActiveHashrate(
    racks: InstalledRack[],
    minerModels: Map<string, MinerModel>
  ): {
    totalHashrate: number;
    totalPowerConsumption: number;
    activeMinerCount: number;
    brokenMinerCount: number;
  } {
    let totalHashrate = 0;
    let totalPowerConsumption = 0;
    let activeMinerCount = 0;
    let brokenMinerCount = 0;

    for (const rack of racks) {
      for (const miner of rack.slots) {
        if (!miner) continue;

        const model = minerModels.get(miner.modelId);
        if (!model) continue;

        // Solo cuenta si está activo Y tiene condición mínima
        if (miner.active && miner.condition >= this.minimumConditionToMine) {
          totalHashrate += model.hashrate;
          totalPowerConsumption += model.power;
          activeMinerCount++;
        } else {
          brokenMinerCount++;
        }
      }
    }

    return {
      totalHashrate,
      totalPowerConsumption,
      activeMinerCount,
      brokenMinerCount,
    };
  }

  /**
   * Calcula el costo de electricidad diario
   */
  calculateElectricityCost(
    totalPowerConsumption: number,
    costPerWatt: number
  ): number {
    // Consumo 24h en kWh = (watts * 24 * 3600) / 1,000,000
    const kwhPerDay = (totalPowerConsumption * 24 * 3600) / 1_000_000;
    return kwhPerDay * costPerWatt * 1000; // costPerWatt es por kWh
  }

  /**
   * Calcula ROI de la mining farm
   */
  calculateROI(
    racksCost: number,
    minersCost: number,
    dailyProduction: ProductionMetrics,
    bitcoinPrice: number,
    dailyElectricityCost: number
  ): MiningROI {
    const totalInvestment = racksCost + minersCost;
    const dailyRevenueUSD = dailyProduction.usdPerDay;
    const dailyProfit = dailyRevenueUSD - dailyElectricityCost;
    const monthlyProfit = dailyProfit * 30;
    const annualROI = (dailyProfit * 365) / totalInvestment;

    let daysToBreakEven = Infinity;
    if (dailyProfit > 0) {
      daysToBreakEven = totalInvestment / dailyProfit;
    }

    return {
      totalInvestment,
      dailyProfit,
      monthlyProfit,
      daysToBreakEven: daysToBreakEven > 0 ? daysToBreakEven : Infinity,
      annualROI,
    };
  }

  /**
   * Calcula costo de reparación de un miner
   * @param currentCondition Condición actual (0-100)
   * @param targetCondition A qué condición reparar (típicamente 100)
   */
  calculateRepairCost(currentCondition: number, targetCondition: number = 100): RepairCost {
    const conditionToRestore = Math.min(100 - currentCondition, targetCondition - currentCondition);
    const baseCost = conditionToRestore * this.repairCostPerPercent;

    return {
      baseCost,
      conditionRestored: conditionToRestore,
      totalCost: baseCost,
    };
  }

  /**
   * Repara un miner
   */
  repairMiner(miner: InstalledMiner, targetCondition: number = 100): InstalledMiner {
    return {
      ...miner,
      condition: Math.min(100, targetCondition),
      lastRepairTime: Date.now(),
    };
  }

  /**
   * Toggle activo/inactivo de un miner
   */
  toggleMinerActive(miner: InstalledMiner, active: boolean): InstalledMiner {
    return {
      ...miner,
      active,
    };
  }

  /**
   * Calcula cuánto BTC se minó desde última vez
   */
  calculateMinedAmount(
    production: ProductionMetrics,
    elapsedSeconds: number
  ): number {
    return production.btcPerSecond * elapsedSeconds;
  }

  /**
   * Valida si un miner puede minar
   */
  canMine(miner: InstalledMiner): boolean {
    return miner.active && miner.condition >= this.minimumConditionToMine;
  }

  /**
   * Obtiene la salud del miner como porcentaje
   */
  getMinerHealth(miner: InstalledMiner): 'healthy' | 'degraded' | 'critical' | 'broken' {
    if (miner.condition <= 0) return 'broken';
    if (miner.condition < 25) return 'critical';
    if (miner.condition < 60) return 'degraded';
    return 'healthy';
  }

  /**
   * Calcula eficiencia: cuánto produce vs. cuánto consume
   */
  calculateEfficiency(
    dailyProduction: ProductionMetrics,
    totalPowerConsumption: number,
    bitcoinPrice: number
  ): {
    hashPerWatt: number;
    usdPerWatt: number;
    profitability: number; // 0-100 %
  } {
    const hashPerWatt = totalPowerConsumption > 0 ? (dailyProduction.btcPerDay * 1000000) / totalPowerConsumption : 0;
    const usdPerWatt = totalPowerConsumption > 0 ? dailyProduction.usdPerDay / totalPowerConsumption : 0;

    // Profitability: cuánto % de la producción es ganancia pura (sin electricidad)
    const profitability = dailyProduction.usdPerDay > 0 ? Math.min(100, (usdPerWatt / dailyProduction.usdPerDay) * 100) : 0;

    return {
      hashPerWatt,
      usdPerWatt,
      profitability,
    };
  }

  /**
   * Valida si puede comprar un rack
   */
  isValidRackPurchase(balance: number, rackCost: number): boolean {
    return balance >= rackCost && rackCost > 0;
  }

  /**
   * Valida si puede comprar un miner
   */
  isValidMinerPurchase(
    balance: number,
    minerCost: number,
    rackHasSpace: boolean
  ): boolean {
    return balance >= minerCost && minerCost > 0 && rackHasSpace;
  }
}
