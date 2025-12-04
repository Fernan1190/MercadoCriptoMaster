export interface MinerModel {
  id: string;
  name: string;
  type: 'gpu' | 'asic';
  hashrate: number; // TH/s
  power: number; // Watts
  price: number;
  description: string;
}

export interface RackModel {
  id: string;
  name: string;
  slots: number;
  efficiency: number; 
  price: number;
}

export const MINERS: MinerModel[] = [
  { id: 'gpu_old', name: 'GTX 1060 (Usada)', type: 'gpu', hashrate: 0.5, power: 120, price: 200, description: 'Barata y fiable para empezar.' },
  { id: 'gpu_rtx', name: 'RTX 4090', type: 'gpu', hashrate: 4.0, power: 450, price: 1800, description: 'Potencia gráfica bruta.' },
  { id: 'asic_s9', name: 'Antminer S9', type: 'asic', hashrate: 14.0, power: 1300, price: 800, description: 'Ruidoso pero efectivo.' },
  { id: 'asic_pro', name: 'Whatsminer M50', type: 'asic', hashrate: 110.0, power: 3200, price: 4500, description: 'Estándar industrial.' },
  { id: 'quantum_chip', name: 'Q-Bit Prototype', type: 'asic', hashrate: 500.0, power: 1500, price: 15000, description: 'Tecnología experimental.' }
];

export const RACKS: RackModel[] = [
  { id: 'rack_shelf', name: 'Estantería Metálica', slots: 2, efficiency: 0.9, price: 150 },
  { id: 'rack_basic', name: 'Rack Abierto', slots: 4, efficiency: 1.0, price: 600 },
  { id: 'rack_server', name: 'Gabinete Pro', slots: 8, efficiency: 1.1, price: 2000 },
  { id: 'rack_cryo', name: 'Cápsula Criogénica', slots: 12, efficiency: 1.5, price: 8000 }
];