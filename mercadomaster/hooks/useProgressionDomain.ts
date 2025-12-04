/**
 * Hook: useProgressionDomain
 * Maneja TODO lo relacionado con XP, Levels, Skills, Achievements
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { XPCalculator } from '../domains/progression/XPCalculator';
import type { ProgressionState, LevelData, XPGainBreakdown, League } from '../domains/progression/types';

const xpCalc = new XPCalculator();

interface UseProgressionDomainProps {
  initialState?: Partial<ProgressionState>;
  onLevelUp?: (newLevel: number) => void;
  onSkillUnlock?: (skillId: string) => void;
}

export function useProgressionDomain({
  initialState,
  onLevelUp,
  onSkillUnlock,
}: UseProgressionDomainProps = {}) {
  const [state, setState] = useState<ProgressionState>({
    xp: initialState?.xp ?? 0,
    level: initialState?.level ?? 1,
    league: initialState?.league ?? 'Bronze',
    streak: initialState?.streak ?? 1,
    skillPoints: initialState?.skillPoints ?? 0,
    unlockedSkills: initialState?.unlockedSkills ?? [],
  });

  /**
   * Agrega XP y automáticamente chequea level up
   */
  const addXP = useCallback(
    (xpAmount: number, multiplier: number = 1) => {
      const finalXP = Math.floor(xpAmount * multiplier);

      if (!xpCalc.isValidXPGain(finalXP)) {
        console.warn(`[XP] Invalid XP gain detected: ${finalXP}`);
        return 0;
      }

      setState(prev => {
        const newXP = prev.xp + finalXP;
        const levelData = xpCalc.calculateLevelFromXP(newXP);
        const oldLevel = prev.level;
        const newLevel = levelData.level;

        let skillPointsGained = 0;
        if (newLevel > oldLevel) {
          skillPointsGained = xpCalc.getSkillPointsFromLevelUp(newLevel, oldLevel);
          onLevelUp?.(newLevel);
        }

        const newLeague = xpCalc.getLeagueFromLevel(newLevel);

        return {
          ...prev,
          xp: newXP,
          level: newLevel,
          league: newLeague,
          skillPoints: prev.skillPoints + skillPointsGained,
        };
      });

      return finalXP;
    },
    [onLevelUp]
  );

  /**
   * Calcula XP a ganar en un trade (sin aplicarlo)
   */
  const calculateTradeXP = useCallback(
    (pnlPercentage: number, riskScore: number): XPGainBreakdown => {
      return xpCalc.calculateTradeXP(
        pnlPercentage,
        riskScore,
        state.streak,
        1,
        0
      );
    },
    [state.streak]
  );

  /**
   * Calcula XP a ganar en un quiz (sin aplicarlo)
   */
  const calculateQuizXP = useCallback(
    (difficulty: number = 1): XPGainBreakdown => {
      return xpCalc.calculateQuizXP(
        state.streak,
        difficulty,
        1
      );
    },
    [state.streak]
  );

  /**
   * Intenta unlockear un skill
   */
  const unlockSkill = useCallback(
    (skillId: string, cost: number) => {
      if (state.skillPoints < cost) {
        return false;
      }

      setState(prev => ({
        ...prev,
        skillPoints: prev.skillPoints - cost,
        unlockedSkills: [...prev.unlockedSkills, skillId],
      }));

      onSkillUnlock?.(skillId);
      return true;
    },
    [state.skillPoints, onSkillUnlock]
  );

  /**
   * Maneja la lógica de streak
   */
  const handleTradeResult = useCallback(
    (pnlPercentage: number) => {
      setState(prev => {
        const shouldLose = xpCalc.shouldLoseStreak(pnlPercentage);
        const newStreak = shouldLose ? 1 : prev.streak + 1;

        return {
          ...prev,
          streak: newStreak,
        };
      });
    },
    []
  );

  /**
   * Resetea streak manualmente
   */
  const resetStreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      streak: 1,
    }));
  }, []);

  /**
   * Agrega 1 a streak
   */
  const addStreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      streak: prev.streak + 1,
    }));
  }, []);

  /**
   * Retorna los datos del nivel actual
   */
  const getLevelData = useCallback((): LevelData => {
    return xpCalc.calculateLevelFromXP(state.xp);
  }, [state.xp]);

  /**
   * Obtiene cuánto XP falta para el próximo level
   */
  const getXPToNextLevel = useCallback((): number => {
    const levelData = getLevelData();
    return levelData.xpForCurrentLevel - levelData.xpInCurrentLevel;
  }, [getLevelData]);

  /**
   * Valida si un skill está desbloqueado
   */
  const isSkillUnlocked = useCallback(
    (skillId: string): boolean => {
      return state.unlockedSkills.includes(skillId);
    },
    [state.unlockedSkills]
  );

  const actions = useMemo(
    () => ({
      addXP,
      calculateTradeXP,
      calculateQuizXP,
      unlockSkill,
      handleTradeResult,
      resetStreak,
      addStreak,
      getLevelData,
      getXPToNextLevel,
      isSkillUnlocked,
    }),
    [
      addXP,
      calculateTradeXP,
      calculateQuizXP,
      unlockSkill,
      handleTradeResult,
      resetStreak,
      addStreak,
      getLevelData,
      getXPToNextLevel,
      isSkillUnlocked,
    ]
  );

  return { state, actions };
}

/**
 * Helper: Hook para sincronizar con localStorage
 */
export function useProgressionPersistence(
  progressionState: ProgressionState,
  storageKey: string = 'progression'
) {
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progressionState));
    } catch (e) {
      console.error(`[Progression] Failed to save to localStorage:`, e);
    }
  }, [progressionState, storageKey]);

  const loadFromStorage = useCallback((): Partial<ProgressionState> | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error(`[Progression] Failed to load from localStorage:`, e);
      return null;
    }
  }, [storageKey]);

  return { loadFromStorage };
}
