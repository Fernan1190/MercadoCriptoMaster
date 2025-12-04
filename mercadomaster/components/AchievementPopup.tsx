import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      // Sonido de logro
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Sonido simple de win
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignorar error si no hay interacción

      // Auto cerrar a los 4 segundos
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Esperar animación de salida
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 transition-all duration-500 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-1 rounded-2xl shadow-2xl">
        <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4 min-w-[300px] border border-yellow-500/20 relative overflow-hidden">
          {/* Efecto de brillo */}
          <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/10 animate-pulse pointer-events-none"></div>
          
          <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400">
             <Trophy size={24} fill="currentColor" />
          </div>
          
          <div className="flex-1">
             <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-0.5">¡Logro Desbloqueado!</p>
             <h4 className="text-white font-black text-lg leading-tight">{achievement.title}</h4>
             <p className="text-slate-400 text-xs mt-1">{achievement.description}</p>
          </div>

          <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-white transition-colors">
             <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};