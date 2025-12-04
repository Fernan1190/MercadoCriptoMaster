/**
 * Types para el dominio de Progresión
 */

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface ProgressionState {
  xp: number;
  level: number;
  league: League;
  streak: number;
  skillPoints: number;
  unlockedSkills: string[];
}

export interface LevelData {
  level: number;
  progressToNextLevel: number;
  xpInCurrentLevel: number;
  xpForCurrentLevel: number;
  totalXP: number;
}

export interface XPGainBreakdown {
  baseXP: number;
  streakBonus: number;
  skillBonus: number;
  totalXP: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  icon: string;
  category: 'trading' | 'mining' | 'knowledge' | 'general';
  effects: SkillEffect[];
}

export interface SkillEffect {
  type: 'commission_reduction' | 'xp_boost' | 'slippage_reduction' | 'mining_efficiency';
  value: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  condition: (stats: ProgressionState) => boolean;
}

export interface ProgressionActions {
  addXP: (amount: number, multiplier?: number) => number;
  unlockSkill: (skillId: string) => boolean;
  addStreak: () => void;
  resetStreak: () => void;
  checkLevelUp: () => boolean;
}
