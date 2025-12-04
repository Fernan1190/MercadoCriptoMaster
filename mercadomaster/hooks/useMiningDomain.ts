/**
 * Hook: useMiningDomain
 * Maneja TODO lo relacionado con mining farm, racks, miners
 */

import { useState, useCallback, useMemo } from 'react';
import { MiningSimulator } from '../domains/mining/MiningSimulator';
import type {
  MiningFarmState,
  InstalledRack,
  InstalledMiner,
  MinerModel,
  RackModel,
  ProductionMetrics,
  MiningROI,
} from '../domains/mining/MiningSimulator';

const miningSimulator = new MiningSimulator();

interface UseMiningDomainProps {
  initialBalance?: number;
  bitcoinPrice?: number;
  onRackPurchased?: (rack: InstalledRack) => void;
  onMinerPurchased?: (miner: InstalledMiner) => void;
  onRepairComplete?: (minerInstanceId: string) => void;
}

export function useMiningDomain({
  initialBalance = 10000,
  bitcoinPrice = 45000,
  onRackPurchased,
  onMinerPurchased,
  onRepairComplete,
}: UseMiningDomainProps = {}) {
  const [state, setState] = useState<MiningFarmState>({
    racks: [],
    minedFragments: 0,
    totalHashrate: 0,
    totalPowerConsumption: 0,
    electricityCostPerWatt: 0.0001, // $0.0001 por watt
  });

  const [balance, setBalance] = useState(initialBalance);

  /**
   * Compra un rack
   */
  const buyRack = useCallback(
    (rackModel: RackModel) => {
      if (!miningSimulator.isValidRackPurchase(balance, rackModel.cost)) {
        return false;
      }

      const newRack: InstalledRack = {
        instanceId: `rack-${Date.now()}`,
        modelId: rackModel.id,
        slots: Array(rackModel.slots).fill(null),
      };

      setState(prev => ({
        ...prev,
        racks: [...prev.racks, newRack],
      }));

      setBalance(prev => prev - rackModel.cost);
      onRackPurchased?.(newRack);

      return true;
    },
    [balance, onRackPurchased]
  );

  /**
   * Compra un miner y lo instala en un rack
   */
  const buyMiner = useCallback(
    (minerModel: MinerModel, rackInstanceId: string) => {
      // Validar que existe el rack
      const rackIndex = state.racks.findIndex(r => r.instanceId === rackInstanceId);
      if (rackIndex === -1) {
        console.warn('Rack not found');
        return false;
      }

      const rack = state.racks[rackIndex];

      // Validar que hay espacio
      const emptySlot = rack.slots.findIndex(s => s === null);
      if (emptySlot === -1) {
        console.warn('No empty slots in rack');
        return false;
      }

      if (!miningSimulator.isValidMinerPurchase(balance, minerModel.cost, true)) {
        console.warn('Insufficient balance');
        return false;
      }

      const newMiner: InstalledMiner = {
        instanceId: `miner-${Date.now()}`,
        modelId: minerModel.id,
        condition: 100,
        active: true,
        lastRepairTime: Date.now(),
      };

      setState(prev => {
        const newRacks = [...prev.racks];
        const newSlots = [...newRacks[rackIndex].slots];
        newSlots[emptySlot] = newMiner;
        newRacks[rackIndex].slots = newSlots;

        return {
          ...prev,
          racks: newRacks,
          totalHashrate: prev.totalHashrate + minerModel.hashrate,
          totalPowerConsumption: prev.totalPowerConsumption + minerModel.power,
        };
      });

      setBalance(prev => prev - minerModel.cost);
      onMinerPurchased?.(newMiner);

      return true;
    },
    [state.racks, balance, onMinerPurchased]
  );

  /**
   * Repara un miner
   */
  const repairMiner = useCallback(
    (rackInstanceId: string, slotIndex: number, repairCost: number) => {
      const rackIndex = state.racks.findIndex(r => r.instanceId === rackInstanceId);
      if (rackIndex === -1 || balance < repairCost) {
        return false;
      }

      setState(prev => {
        const newRacks = [...prev.racks];
        const miner = newRacks[rackIndex].slots[slotIndex];

        if (miner) {
          miner.condition = 100;
          miner.lastRepairTime = Date.now();
          newRacks[rackIndex].slots[slotIndex] = miner;
        }

        return { ...prev, racks: newRacks };
      });

      setBalance(prev => prev - repairCost);
      onRepairComplete?.(`${rackInstanceId}-${slotIndex}`);

      return true;
    },
    [state.racks, balance, onRepairComplete]
  );

  /**
   * Toggle activo/inactivo de un miner
   */
  const toggleMinerActive = useCallback(
    (rackInstanceId: string, slotIndex: number, active: boolean) => {
      setState(prev => {
        const newRacks = [...prev.racks];
        const rackIndex = newRacks.findIndex(r => r.instanceId === rackInstanceId);

        if (rackIndex !== -1) {
          const miner = newRacks[rackIndex].slots[slotIndex];
          if (miner) {
            miner.active = active;
            newRacks[rackIndex].slots[slotIndex] = miner;
          }
        }

        return { ...prev, racks: newRacks };
      });

      return true;
    },
    []
  );

  /**
   * Calcula producción actual
   */
  const calculateProduction = useCallback((): ProductionMetrics => {
    return miningSimulator.calculateProduction(state.totalHashrate, bitcoinPrice);
  }, [state.totalHashrate, bitcoinPrice]);

  /**
   * Calcula electricidad diaria
   */
  const calculateElectricityCost = useCallback((): number => {
    return miningSimulator.calculateElectricityCost(
      state.totalPowerConsumption,
      state.electricityCostPerWatt
    );
  }, [state.totalPowerConsumption, state.electricityCostPerWatt]);

  /**
   * Calcula ROI
   */
  const calculateROI = useCallback(
    (racksCost: number, minersCost: number): MiningROI => {
      const production = calculateProduction();
      const electricityCost = calculateElectricityCost();

      return miningSimulator.calculateROI(
        racksCost,
        minersCost,
        production,
        bitcoinPrice,
        electricityCost
      );
    },
    [calculateProduction, calculateElectricityCost, bitcoinPrice]
  );

  /**
   * Vende crypto minada
   */
  const sellMinedCrypto = useCallback(() => {
    const production = calculateProduction();
    const earnings = state.minedFragments * bitcoinPrice;

    setBalance(prev => prev + earnings);
    setState(prev => ({
      ...prev,
      minedFragments: 0,
    }));

    return earnings;
  }, [state.minedFragments, bitcoinPrice, calculateProduction]);

  /**
   * Actualiza minería simulada (llamar periódicamente)
   */
  const updateMining = useCallback((deltaSeconds: number) => {
    setState(prev => {
      const production = miningSimulator.calculateProduction(
        prev.totalHashrate,
        bitcoinPrice
      );
      const minedThisInterval = production.btcPerSecond * deltaSeconds;

      return {
        ...prev,
        minedFragments: prev.minedFragments + minedThisInterval,
      };
    });
  }, [bitcoinPrice]);

  const actions = useMemo(
    () => ({
      buyRack,
      buyMiner,
      repairMiner,
      toggleMinerActive,
      calculateProduction,
      calculateElectricityCost,
      calculateROI,
      sellMinedCrypto,
      updateMining,
    }),
    [
      buyRack,
      buyMiner,
      repairMiner,
      toggleMinerActive,
      calculateProduction,
      calculateElectricityCost,
      calculateROI,
      sellMinedCrypto,
      updateMining,
    ]
  );

  return { state, balance, actions };
}
