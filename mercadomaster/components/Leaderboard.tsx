import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Shield, Crown, TrendingUp, User } from 'lucide-react';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC = () => {
  const { stats } = useGame();

  // Generamos datos falsos pero coherentes con el usuario
  const leaderboardData = useMemo(() => {
    const bots = [
      { name: "Satoshi_N", avatar: "avataaars", league: "Diamond" },
      { name: "Elon_M", avatar: "bottts", league: "Platinum" },
      { name: "WolfOfWallSt", avatar: "avataaars", league: "Gold" },
      { name: "Diamond_Hands", avatar: "bottts", league: "Silver" },
      { name: "CryptoKing", avatar: "avataaars", league: "Bronze" },
      { name: "HODLer_99", avatar: "bottts", league: "Bronze" },
      { name: "Trader_Joe", avatar: "avataaars", league: "Silver" },
      { name: "Luna_Moon", avatar: "bottts", league: "Gold" }
    ];

    // Creamos entradas de leaderboard basadas en la XP del usuario
    const entries: LeaderboardEntry[] = bots.map((bot, i) => {
      // Generamos XP aleatoria cerca del usuario (entre -500 y +800)
      const randomOffset = Math.floor(Math.random() * 1300) - 500; 
      return {
        rank: 0, // Se calcula luego
        username: bot.name,
        xp: Math.max(0, stats.xp + randomOffset), // Para que estén cerca
        avatar: `https://api.dicebear.com/7.x/${bot.avatar}/svg?seed=${bot.name}`,
        isCurrentUser: false,
        league: bot.league
      };
    });

    // Añadimos al usuario real
    entries.push({
      rank: 0,
      username: "Tú (Trader)",
      xp: stats.xp,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${stats.league}`,
      isCurrentUser: true,
      league: stats.league
    });

    // Ordenamos por XP y asignamos ranking
    return entries
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

  }, [stats.xp, stats.league]); // Solo se recalcula si cambia tu XP

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={24} fill="currentColor"/>;
    if (rank === 2) return <Medal className="text-slate-300" size={24} fill="currentColor"/>;
    if (rank === 3) return <Medal className="text-amber-600" size={24} fill="currentColor"/>;
    return <span className="font-bold text-slate-500 w-6 text-center">{rank}</span>;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 animate-fade-in">
      
      {/* Header de la Liga */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-sm font-bold text-white mb-4 backdrop-blur-sm border border-white/20">
               <Shield size={16}/> Liga {stats.league}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Clasificación Semanal</h1>
            <p className="text-indigo-200 text-lg">Los 3 primeros ascienden a la siguiente liga.</p>
         </div>
      </div>

      {/* Lista de Jugadores */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
         {leaderboardData.map((player) => (
            <div 
               key={player.username}
               className={`flex items-center gap-4 p-4 md:p-6 border-b border-slate-800 transition-colors
                  ${player.isCurrentUser ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/50'}
               `}
            >
               {/* Rango */}
               <div className="w-10 flex justify-center shrink-0">
                  {getRankIcon(player.rank)}
               </div>

               {/* Avatar */}
               <img src={player.avatar} alt={player.username} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800" />

               {/* Info */}
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <h3 className={`font-bold truncate ${player.isCurrentUser ? 'text-indigo-400' : 'text-white'}`}>
                        {player.username}
                     </h3>
                     {player.rank === 1 && <Crown size={14} className="text-yellow-400" fill="currentColor"/>}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1">
                     {player.league} Division
                  </div>
               </div>

               {/* XP */}
               <div className="text-right">
                  <div className="text-lg md:text-xl font-black text-white flex items-center justify-end gap-1">
                     {player.xp.toLocaleString()} <span className="text-xs text-slate-500 font-bold">XP</span>
                  </div>
                  {player.isCurrentUser && (
                     <div className="text-[10px] text-green-400 font-bold flex items-center justify-end gap-1">
                        <TrendingUp size={10}/> Tú
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
         La clasificación se reinicia cada Domingo a las 00:00 UTC.
      </div>
    </div>
  );
};