import { Achievement, UserStats } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Primeros Pasos',
    description: 'Completa tu primera operación de trading.',
    iconName: 'Footprints',
    condition: (stats: UserStats) => stats.transactions.length >= 1
  },
  {
    id: 'savings_master',
    title: 'Tiburón',
    description: 'Consigue un saldo superior a $15,000.',
    iconName: 'Wallet',
    condition: (stats: UserStats) => stats.balance >= 15000
  },
  {
    id: 'btc_holder',
    title: 'Bitcoiner',
    description: 'Ten al menos 0.5 BTC en tu portafolio.',
    iconName: 'Bitcoin',
    condition: (stats: UserStats) => (stats.portfolio['BTC'] || 0) >= 0.5
  },
  {
    id: 'level_up',
    title: 'Estudiante',
    description: 'Alcanza el Nivel 2 de experiencia.',
    iconName: 'GraduationCap',
    condition: (stats: UserStats) => stats.level >= 2
  },
  {
    id: 'diversified',
    title: 'Diversificado',
    description: 'Ten 3 activos diferentes en tu portafolio.',
    iconName: 'PieChart',
    condition: (stats: UserStats) => Object.keys(stats.portfolio).length >= 3
  }
];