import React from 'react';
import { X } from 'lucide-react';
import { TradingTerminal } from './TradingTerminal';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketName: string;
  assets: string[]; // Ej: ['AAPL', 'TSLA']
}

export const TradingModal: React.FC<TradingModalProps> = ({ isOpen, onClose, marketName, assets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative animate-bounce-in">
        
        {/* Header del Modal */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              📡 Conexión Establecida: <span className="text-blue-400">{marketName}</span>
            </h2>
            <div className="flex gap-2 mt-1">
                {assets.map(a => (
                    <span key={a} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{a}</span>
                ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Aquí incrustamos tu Terminal existente */}
        <div className="h-[600px] p-4 bg-slate-950">
            {/* Pasamos un prop opcional para forzar el activo inicial si tu terminal lo soporta, 
                si no, simplemente renderiza la terminal estándar */}
            <TradingTerminal /> 
        </div>
      </div>
    </div>
  );
};