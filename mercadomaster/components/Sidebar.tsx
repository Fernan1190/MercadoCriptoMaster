import React from 'react';
import { BookOpen, LayoutDashboard, Heart, Coins, TrendingUp, ShoppingBag, Trophy, User, Building2 } from 'lucide-react';
import { UserStats } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  stats?: UserStats;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, stats }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'office', label: 'Sede', icon: <Building2 size={20} /> }, // <--- NUEVO BOTÓN
    { id: 'learn', label: 'Aprender', icon: <BookOpen size={20} /> },
    { id: 'shop', label: 'Tienda', icon: <ShoppingBag size={20} /> },
    { id: 'leaderboard', label: 'Ranking', icon: <Trophy size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  const pendingQuests = stats?.dailyQuests.filter(q => !q.completed).length || 0;

  return (
    <div className="fixed bottom-0 w-full md:w-64 md:relative bg-slate-900 border-t md:border-t-0 md:border-r border-slate-700 flex md:flex-col justify-between z-50">
      <div className="flex-1">
        <div className="hidden md:flex items-center gap-2 p-6 text-green-400 font-bold text-2xl tracking-tighter">
          <TrendingUp /> MercadoMaster
        </div>

        {stats && (
          <div className="hidden md:flex px-6 mb-4 gap-3">
             <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-red-400 text-sm font-bold">
                <Heart size={14} fill="currentColor" /> {stats.hearts}
             </div>
             <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-yellow-500 text-sm font-bold">
                <Coins size={14} fill="currentColor" /> {stats.masterCoins}
             </div>
          </div>
        )}
        
        <nav className="flex md:flex-col justify-around md:justify-start w-full p-2 md:p-4 gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              aria-label={item.label} // Para accesibilidad y trucos de click
              className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 relative
                ${currentView === item.id 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              {item.icon}
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
              {item.id === 'dashboard' && pendingQuests > 0 && (
                <span className="absolute top-2 right-2 md:top-3 md:right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="hidden md:block p-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase font-bold mb-2">Versión Beta</p>
          <p className="text-slate-300 text-sm">Impulsado por Gemini 2.5</p>
        </div>
      </div>
    </div>
  );
};