import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Learn } from './components/Learn';
import { Dashboard } from './components/Dashboard';
import { Shop } from './components/Shop'; 
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Office } from './components/Office';
import { AchievementPopup } from './components/AchievementPopup';
import { GameProvider, useGame } from './context/GameContext'; 

// Importaciones para el sistema de viaje
import { WarRoom } from './components/WarRoom';
import { CityTradingView } from './components/CityTradingView';
import { MarketNode } from './types';

const AppContent = () => {
  const [view, setView] = useState('dashboard');
  const [activeMarket, setActiveMarket] = useState<MarketNode | null>(null); // Guardamos la ciudad activa
  const { stats, actions, latestAchievement, clearAchievement } = useGame();
  
  // Función para viajar a una ciudad específica
  const handleTravelToCity = (market: MarketNode) => {
      setActiveMarket(market);
      setView('city_trading'); // Cambiamos la vista principal
  };

  useEffect(() => {
    const hasGreeted = sessionStorage.getItem('hasGreeted');
    if (!hasGreeted) {
      setTimeout(() => {
        const msg = new SpeechSynthesisUtterance(`Hola Trader, bienvenido de nuevo.`);
        msg.lang = 'es-ES';
        window.speechSynthesis.speak(msg);
        sessionStorage.setItem('hasGreeted', 'true');
      }, 1000);
    }
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden ${actions.getThemeClass()}`}>
      
      {/* Fondo base */}
      <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
      
      <AchievementPopup achievement={latestAchievement} onClose={clearAchievement} />

      {/* La Sidebar se oculta si estamos en "Modo Ciudad" para inmersión total, o puedes dejarla si prefieres */}
      {view !== 'city_trading' && (
          <Sidebar currentView={view} setView={setView} stats={stats} />
      )}
      
      <main className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
        {view === 'dashboard' && <Dashboard setView={setView} />}
        
        {/* VISTA 1: El Mapa Global */}
        {view === 'war_room' && (
            <WarRoom onEnterMarket={handleTravelToCity} />
        )}

        {/* VISTA 2: La Ciudad Específica (Destino del viaje) */}
        {view === 'city_trading' && activeMarket && (
            <CityTradingView 
               market={activeMarket} 
               onBack={() => {
                   setActiveMarket(null);
                   setView('war_room'); // Al volver, regresamos al mapa
               }} 
            />
        )}

        {view === 'office' && <Office />}
        {view === 'learn' && <Learn />}
        {view === 'shop' && <Shop />}
        {view === 'leaderboard' && <Leaderboard />}
        {view === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}