import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Learn } from './components/Learn';
import { Dashboard } from './components/Dashboard';
import { Shop } from './components/Shop'; 
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Office } from './components/Office';
import { AchievementPopup } from './components/AchievementPopup';
import { GameProvider, useGame } from './context/GameContext'; 
import { WarRoom } from './components/WarRoom';
import { CityTradingView } from './components/CityTradingView';
import { MARKET_NODES } from './data/markets';

// Wrapper para capturar el ID de la URL y pasar el objeto market correcto
const CityWrapper = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const market = MARKET_NODES.find(m => m.id === marketId);

  // Si el mercado no existe (url inválida), volvemos al mapa
  if (!market) return <Navigate to="/map" />;
  
  return <CityTradingView market={market} onBack={() => navigate('/map')} />;
};

// Componente Wrapper para Dashboard que requiere prop setView
// (Aunque ahora navegamos por URL, el componente interno podría usarlo para accesos directos)
const DashboardWrapper = () => {
    const navigate = useNavigate();
    return <Dashboard setView={(path) => navigate(path === 'dashboard' ? '/' : `/${path}`)} />;
};

const AppContent = () => {
  const { actions, latestAchievement, clearAchievement, stats } = useGame();

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

      {/* Sidebar de navegación */}
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
        <Routes>
          <Route path="/" element={<DashboardWrapper />} />
          <Route path="/office" element={<Office />} />
          
          {/* Rutas de Mapa y Ciudad */}
          <Route path="/map" element={<WarRoom onEnterMarket={(m) => window.location.href = `/city/${m.id}`} />} /> 
          {/* Nota: WarRoom usa onEnterMarket prop. Lo ideal sería refactorizar WarRoom para usar useNavigate internamente, 
             pero pasándole esto como prop funciona para mantener compatibilidad rápida */}
             
          <Route path="/city/:marketId" element={<CityWrapper />} />
          
          <Route path="/learn" element={<Learn />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/ranking" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </BrowserRouter>
  );
}