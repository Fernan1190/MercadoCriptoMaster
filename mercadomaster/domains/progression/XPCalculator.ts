/**
 * XPCalculator - Lógica pura de cálculo de XP y niveles
 * ✅ Sin estado, sin contexto, sin side-effects
 * ✅ Totalmente testeable
 */

export interface XPGainBreakdown {
  baseXP: number;
  streakBonus: number;
  skillBonus: number;
  totalXP: number;
}

export interface LevelData {
  level: number;
  progressToNextLevel: number;
  xpInCurrentLevel: number;
  xpForCurrentLevel: number;
  totalXP: number;
}

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export class XPCalculator {
  private baseXPPerTrade = 10;
  private baseXPPerCorrectAnswer = 20;
  private streakBonusPercent = 0.1; // +10% por cada nivel de streak

  /**
   * Calcula XP ganado en un trade
   * @param pnlPercentage Ganancia/pérdida como % (ej: 2.5 = +2.5%)
   * @param riskScore Cuánto % del portfolio arriesgaste (0-1, ej: 0.05 = 5%)
   * @param streak Racha actual (1, 2, 3, ...)
   * @param xpMultiplier Multiplicador global (buffs, etc) - default 1
   * @param commissionReductionSkill Bonificación por skill de comisión (0-1) - default 0
   */
  calculateTradeXP(
    pnlPercentage: number,
    riskScore: number,
    streak: number,
    xpMultiplier: number = 1,
    commissionReductionSkill: number = 0
  ): XPGainBreakdown {
    let baseXP = this.baseXPPerTrade;

    // Bonus por riesgo: si arriesgaste >2% del portfolio
    if (riskScore > 0.02) {
      baseXP *= 1 + riskScore * 20;
    }

    // Bonus por racha
    const streakBonus = streak > 1 ? baseXP * (this.streakBonusPercent * (streak - 1)) : 0;

    // Bonus por skills
    const skillBonus = baseXP * commissionReductionSkill * 0.5;

    // Total
    const totalXP = Math.floor((baseXP + streakBonus + skillBonus) * xpMultiplier);

    return {
      baseXP,
      streakBonus,
      skillBonus,
      totalXP,
    };
  }

  /**
   * Calcula XP por respuesta correcta en lecciones
   */
  calculateQuizXP(
    streak: number,
    difficulty: number = 1,
    xpMultiplier: number = 1
  ): XPGainBreakdown {
    let baseXP = this.baseXPPerCorrectAnswer;

    // Bonus por dificultad
    baseXP *= difficulty / 3;

    // Bonus por racha
    const streakBonus = streak > 1 ? baseXP * (this.streakBonusPercent * (streak - 1)) : 0;

    const totalXP = Math.floor((baseXP + streakBonus) * xpMultiplier);

    return {
      baseXP,
      streakBonus,
      skillBonus: 0,
      totalXP,
    };
  }

  /**
   * Calcula el nivel a partir de XP total
   */
  calculateLevelFromXP(totalXP: number): LevelData {
    let level = 1;
    let xpAccum = 0;

    while (xpAccum + (100 + 50 * level) <= totalXP) {
      xpAccum += 100 + 50 * level;
      level++;
    }

    const xpForLevel = 100 + 50 * level;
    const xpInLevel = totalXP - xpAccum;
    const progress = xpInLevel / xpForLevel;

    return {
      level,
      progressToNextLevel: Math.min(progress, 1),
      xpInCurrentLevel: xpInLevel,
      xpForCurrentLevel: xpForLevel,
      totalXP,
    };
  }

  /**
   * Retorna liga según nivel
   */
  getLeagueFromLevel(level: number): League {
    if (level < 5) return 'Bronze';
    if (level < 10) return 'Silver';
    if (level < 20) return 'Gold';
    if (level < 50) return 'Platinum';
    return 'Diamond';
  }

  /**
   * Calcula skill points ganados al subir de nivel
   */
  getSkillPointsFromLevelUp(newLevel: number, oldLevel: number): number {
    const newPoints = 1 + Math.floor(newLevel / 5);
    const oldPoints = 1 + Math.floor(oldLevel / 5);
    return newPoints - oldPoints;
  }

  /**
   * Calcula si deberías perder streak
   */
  shouldLoseStreak(pnlPercentage: number): boolean {
    return pnlPercentage < 0;
  }

  /**
   * Obtiene XP requerido para llegar a cierto nivel
   */
  getTotalXPForLevel(targetLevel: number): number {
    let total = 0;
    for (let level = 1; level < targetLevel; level++) {
      total += 100 + 50 * level;
    }
    return total;
  }

  /**
   * Valida si una ganancia de XP es razonable
   */
  isValidXPGain(xpGain: number): boolean {
    return xpGain >= 0 && xpGain <= 1000;
  }
}
