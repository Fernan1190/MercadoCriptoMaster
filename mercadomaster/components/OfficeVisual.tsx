import React, { useState, useEffect } from 'react';
import { User, Cpu, Coffee, DollarSign, Zap } from 'lucide-react';

interface OfficeVisualProps {
  level: number;
  items: string[]; // IDs de items comprados
  league: string;
}

// --- COMPONENTES DE MUEBLES 3D (VOXELS CSS) ---

const IsoCube = ({ x, y, z, w, h, d, color, children, onClick, className }: any) => {
  // Conversión de coordenadas grid a pantalla
  // x, y son coordenadas en el suelo. z es altura.
  const style: React.CSSProperties = {
    width: `${w}px`,
    height: `${d}px`,
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: `translateZ(${z}px)`,
    backgroundColor: color,
    transformStyle: 'preserve-3d',
  };

  // Sombreado simulado
  const sideColor = adjustColor(color, -20);
  const topColor = adjustColor(color, 20);

  return (
    <div className={`group ${className}`} style={style} onClick={onClick}>
      {/* Cara Superior */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: topColor, transform: `translateZ(${h}px)`, backfaceVisibility: 'hidden' }}>
        {children}
      </div>
      {/* Cara Frontal (Sur) */}
      <div style={{ position: 'absolute', width: '100%', height: `${h}px`, background: sideColor, transform: `rotateX(-90deg) translateZ(${d}px)`, transformOrigin: 'bottom' }} />
      {/* Cara Derecha (Este) */}
      <div style={{ position: 'absolute', width: `${d}px`, height: `${h}px`, background: adjustColor(color, -40), transform: `rotateY(90deg) translateZ(${w}px)`, transformOrigin: 'right bottom', right: 0 }} />
       {/* Cara Izquierda (Oeste) */}
       <div style={{ position: 'absolute', width: `${d}px`, height: `${h}px`, background: adjustColor(color, -10), transform: `rotateY(-90deg) translateZ(0px)`, transformOrigin: 'left bottom', left: 0 }} />
    </div>
  );
};

// Helper simple para oscurecer colores hex
function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// --- OBJETOS ESPECÍFICOS ---

const DeskSetup = ({ x, y, hasProSetup }: any) => (
    <g>
        {/* Mesa */}
        <IsoCube x={x} y={y} z={0} w={140} d={60} h={50} color="#475569">
            {/* Ordenador */}
            <div className="absolute right-2 top-2 w-10 h-20 bg-slate-800 border-2 border-slate-600 shadow-lg transform translate-z-10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse m-1"></div>
            </div>
            {/* Monitor */}
            <div className="absolute left-4 top-[-10px] w-24 h-2 bg-black transform rotate-x-[-15deg]">
                <div className="w-full h-16 bg-slate-900 absolute bottom-0 border-2 border-slate-700 overflow-hidden">
                    <div className="w-full h-full bg-green-500/10 animate-code"></div>
                </div>
            </div>
             {/* Monitor 2 (Pro) */}
            {hasProSetup && (
                <div className="absolute right-4 top-[-10px] w-24 h-2 bg-black transform rotate-x-[-15deg] rotate-y-[20deg]">
                    <div className="w-full h-16 bg-slate-900 absolute bottom-0 border-2 border-slate-700 overflow-hidden">
                         <div className="w-full h-full bg-blue-500/10 animate-pulse"></div>
                    </div>
                </div>
            )}
        </IsoCube>
        {/* Silla */}
        <IsoCube x={x + 40} y={y + 70} z={0} w={40} d={40} h={40} color="#1e293b" />
    </g>
);

const ServerRack = ({ x, y }: any) => (
    <IsoCube x={x} y={y} z={0} w={40} d={40} h={120} color="#000000">
        <div className="w-full h-full flex flex-col justify-evenly p-1">
            {[1,2,3,4,5].map(i => (
                <div key={i} className="w-full h-2 bg-slate-800 flex gap-1 px-1 items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{animationDelay: `${i*0.3}s`}}></div>
                </div>
            ))}
        </div>
    </IsoCube>
);

const Employee = ({ x, y, role }: any) => (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translateZ(50px)', width: 40, height: 80, pointerEvents: 'none' }} className="animate-[employee-work_2s_infinite_ease-in-out]">
        {/* Cuerpo simple SVG */}
        <svg viewBox="0 0 40 80" className="drop-shadow-xl">
            <rect x="10" y="30" width="20" height="30" fill={role === 'miner' ? '#eab308' : '#3b82f6'} rx="5" />
            <circle cx="20" cy="20" r="12" fill="#fcd34d" />
            <path d="M10 35 L0 50" stroke="black" strokeWidth="3" strokeLinecap="round" /> {/* Brazo I */}
            <path d="M30 35 L40 50" stroke="black" strokeWidth="3" strokeLinecap="round" /> {/* Brazo D */}
        </svg>
        {/* Bocadillo Estado */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
            {role === 'miner' ? 'BTC...' : 'BUY!'}
        </div>
    </div>
);

export const OfficeVisual: React.FC<OfficeVisualProps> = ({ level, items, league }) => {
  const [zoom, setZoom] = useState(1);
  
  // Lógica de expansión de habitación según nivel
  let roomSize = 400; // Base
  let floorColor = "#1e293b";
  let wallColor = "#334155";
  let windowView = "bg-slate-950"; // Oscuridad sótano

  if (level >= 10) { roomSize = 600; floorColor = "#3f3f46"; windowView = "bg-gradient-to-b from-blue-400 to-blue-200"; } // Oficina día
  if (level >= 30) { roomSize = 800; floorColor = "#0f172a"; windowView = "bg-[url('https://www.transparenttextures.com/patterns/city-lights.png')] bg-black"; } // Penthouse noche

  const scale = Math.max(0.5, Math.min(1.2, 1000 / roomSize)); // Auto-escalado para que quepa

  return (
    <div className="w-full h-full overflow-hidden bg-slate-950 relative cursor-move flex items-center justify-center">
        
        {/* VENTANA / FONDO EXTERIOR */}
        <div className={`absolute inset-0 ${windowView} transition-colors duration-1000`}>
            {/* Sol / Luna */}
            <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-yellow-200 blur-xl opacity-50 animate-pulse"></div>
        </div>

        {/* ESCENA ISOMÉTRICA */}
        <div 
            className="iso-container relative transition-transform duration-500"
            style={{ 
                width: `${roomSize}px`, 
                height: `${roomSize}px`,
                transform: `rotateX(60deg) rotateZ(-45deg) scale(${scale * zoom})`
            }}
        >
            {/* 1. SUELO */}
            <div 
                className="absolute inset-0 shadow-2xl"
                style={{ 
                    backgroundColor: floorColor,
                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03)), linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03))',
                    backgroundSize: '40px 40px',
                    boxShadow: '-50px 50px 100px rgba(0,0,0,0.8)'
                }}
            >
                {/* Alfombra de Entrada */}
                <div className="absolute bottom-0 left-[40%] w-[20%] h-[10%] bg-red-900/80 border-t-2 border-red-700"></div>
            </div>

            {/* 2. PAREDES (Levantadas con transformaciones inversas para simular altura infinita o corte) */}
            <div className="absolute top-0 left-0 w-[20px] h-full bg-slate-700 origin-left transform -rotate-y-90 translate-x-[-20px]"></div> {/* Grosor */}
            <div 
                className="absolute top-0 left-0 w-full h-[300px] bg-slate-700 origin-top transform -rotate-x-90 translate-y-[-300px] border-b-4 border-slate-800"
                style={{ backgroundColor: wallColor }}
            >
                {/* Cuadros / Decoración Pared Trasera */}
                <div className="absolute bottom-20 left-1/4 w-32 h-20 bg-white/10 border-2 border-white/20 p-2">
                    <div className="text-[10px] text-white text-center">STONKS 📈</div>
                    <div className="w-full h-1 bg-green-500 mt-4 transform -rotate-12"></div>
                </div>
            </div>
            
            <div 
                className="absolute top-0 left-0 h-full w-[300px] bg-slate-600 origin-left transform -rotate-y-90 translate-x-[-300px] border-r-4 border-slate-800"
                style={{ backgroundColor: adjustColor(wallColor, -20) }}
            >
                {/* Ventanal Pared Izquierda (si nivel alto) */}
                {level >= 10 && (
                    <div className="absolute top-10 right-10 w-[200px] h-[150px] bg-cyan-500/10 border-4 border-slate-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div> {/* Reflejo */}
                    </div>
                )}
            </div>

            {/* 3. OBJETOS EN LA SALA (Grid based) */}
            
            {/* Tu Escritorio (Siempre en el centro) */}
            <DeskSetup x={roomSize/2 - 70} y={roomSize/2 - 30} hasProSetup={items.includes('setup_pro')} />
            <Employee x={roomSize/2} y={roomSize/2 + 50} role="ceo" />

            {/* Planta */}
            {items.includes('plant') && (
                <IsoCube x={roomSize - 60} y={60} z={0} w={40} d={40} h={60} color="#78350f">
                    <div className="absolute -top-10 left-0 text-4xl">🌿</div>
                </IsoCube>
            )}

            {/* Trofeo */}
            {items.includes('trophy_gold') && (
                <IsoCube x={60} y={roomSize - 60} z={0} w={40} d={40} h={80} color="#000">
                    <div className="absolute -top-8 left-2 text-4xl drop-shadow-[0_0_10px_gold]">🏆</div>
                </IsoCube>
            )}

            {/* Servidores (Nivel > 5) */}
            {level >= 5 && <ServerRack x={40} y={40} />}
            {level >= 20 && <ServerRack x={90} y={40} />}
            {level >= 50 && <ServerRack x={140} y={40} />}

            {/* Gato */}
            {items.includes('cat') && (
                <div className="absolute animate-bounce" style={{ left: roomSize/2 + 100, top: roomSize/2 + 50, transform: 'translateZ(0)' }}>
                    <span className="text-2xl">🐈</span>
                </div>
            )}

        </div>

        {/* Capa de Partículas de Polvo (Ambiente) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="absolute bg-white/20 w-1 h-1 rounded-full animate-float" 
                     style={{
                         left: `${Math.random()*100}%`, 
                         top: `${Math.random()*100}%`,
                         animationDuration: `${5 + Math.random()*10}s`
                     }} 
                />
            ))}
        </div>

    </div>
  );
};