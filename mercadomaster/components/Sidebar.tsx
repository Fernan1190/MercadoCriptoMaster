import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Heart, Coins, TrendingUp, ShoppingBag, Trophy, User, Building2, Globe, Brain } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useGame();

  const menuItems = [
    { id: '/', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: '/office', label: 'Sede', icon: <Building2 size={20} /> },
    { id: '/map', label: 'Mapa Global', icon: <Globe size={20} /> },
    { id: '/learn', label: 'Aprender', icon: <BookOpen size={20} /> },
    { id: '/skills', label: 'Talentos', icon: <Brain size={20} /> }, // <--- NUEVO BOTÓN
    { id: '/shop', label: 'Tienda', icon: <ShoppingBag size={20} /> },
    { id: '/ranking', label: 'Ranking', icon: <Trophy size={20} /> },
    { id: '/profile', label: 'Perfil', icon: <User size={20} /> },
  ];
  
  // ... (Resto del componente igual, el map renderizará el nuevo item)
  // Solo asegúrate de copiar el resto del contenido de tu Sidebar anterior si tienes lógica extra
  // Pero básicamente es añadir ese objeto al array.
  
  const pendingQuests = stats?.dailyQuests.filter(q => !q.completed).length || 0;
  const isActive = (path: string) => {
      if (path === '/' && location.pathname === '/') return true;
      if (path !== '/' && location.pathname.startsWith(path)) return true;
      return false;
  };

  return (
    <div className="fixed bottom-0 w-full md:w-64 md:relative bg-slate-900 border-t md:border-t-0 md:border-r border-slate-700 flex md:flex-col justify-between z-50 shadow-2xl">
      <div className="flex-1">
        <div className="hidden md:flex items-center gap-2 p-6 text-green-400 font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
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
              onClick={() => navigate(item.id)}
              className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 relative group
                ${isActive(item.id)
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              {item.icon}
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              {item.id === '/' && pendingQuests > 0 && (
                <span className="absolute top-2 right-2 md:top-3 md:right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
              {/* Indicador de puntos de habilidad */}
              {item.id === '/skills' && stats.skillPoints > 0 && (
                  <span className="absolute top-2 right-2 md:top-3 md:right-4 w-4 h-4 bg-fuchsia-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-bounce">{stats.skillPoints}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="hidden md:block p-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
          <div className="flex items-center justify-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-slate-300 text-xs font-mono">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};