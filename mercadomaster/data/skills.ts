import { SkillNode } from '../../types';

export const SKILL_TREE: SkillNode[] = [
    // RAMA TRADER (Izquierda)
    { id: 'trader_1', title: "Comisiones Bajas", description: "Reduce las comisiones de compra/venta un 20%.", icon: "📉", cost: 1, requires: [], x: -2, y: 1, category: 'trader' },
    { id: 'trader_2', title: "Manos de Diamante", description: "Gana 5% extra al vender con beneficios.", icon: "💎", cost: 2, requires: ['trader_1'], x: -2, y: 2, category: 'trader' },
    { id: 'trader_3', title: "Apalancamiento x2", description: "Permite operar con el doble de tu capital (¡Riesgo!).", icon: "🚀", cost: 3, requires: ['trader_2'], x: -2, y: 3, category: 'trader' },

    // RAMA MINER (Centro)
    { id: 'miner_1', title: "Refrigeración Casera", description: "Los mineros se desgastan un 20% más lento.", icon: "❄️", cost: 1, requires: [], x: 0, y: 1, category: 'miner' },
    { id: 'miner_2', title: "Energía Solar", description: "Reduce el coste eléctrico de la granja un 30%.", icon: "☀️", cost: 2, requires: ['miner_1'], x: 0, y: 2, category: 'miner' },
    { id: 'miner_3', title: "Overclocking", description: "Aumenta el hashrate un 15% (pero desgasta más).", icon: "⚡", cost: 3, requires: ['miner_2'], x: 0, y: 3, category: 'miner' },

    // RAMA SAGE (Derecha)
    { id: 'sage_1', title: "Estudiante Veloz", description: "Gana +10% XP al completar lecciones.", icon: "🧠", cost: 1, requires: [], x: 2, y: 1, category: 'sage' },
    { id: 'sage_2', title: "Ojo de Halcón", description: "Revela las velas futuras en el simulador con un 60% de acierto.", icon: "👁️", cost: 2, requires: ['sage_1'], x: 2, y: 2, category: 'sage' },
    { id: 'sage_3', title: "Gurú del Mercado", description: "Desbloquea lecciones 'Maestras' exclusivas.", icon: "🧘", cost: 3, requires: ['sage_2'], x: 2, y: 3, category: 'sage' }
];