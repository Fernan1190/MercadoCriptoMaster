import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Html, SoftShadows, useCursor, Environment, Float, ContactShadows, Stars, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../context/GameContext';
import { MiningStats, InstalledRack, InstalledMiner } from '../../types';
import { MINERS } from '../data/items';

export interface OfficeVisualProps {
  level: number;
  items: string[];
  league: string;
  skin: { floor: string, wall: string };
  achievements: string[];
  miningFarm: MiningStats;
}

// --- UTILIDADES ---
const ScreenMaterial = ({ color, intensity = 1, animate = false }: { color: string, intensity?: number, animate?: boolean }) => {
    const ref = useRef<any>(null);
    useFrame((state) => {
        if (animate && ref.current) {
            ref.current.emissiveIntensity = intensity + Math.sin(state.clock.elapsedTime * 5) * 0.5;
        }
    });
    return <meshStandardMaterial ref={ref} color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />;
};

function adjustColor(color: string, amount: number) {
    const safeColor = color || '#000000';
    return '#' + safeColor.replace(/^#/, '').replace(/../g, col => ('0' + Math.min(255, Math.max(0, parseInt(col, 16) + amount)).toString(16)).substr(-2));
}

const CinematicCamera = () => {
    const cameraRef = useRef<THREE.OrthographicCamera>(null);
    useFrame((state) => {
        if (!cameraRef.current) return;
        const x = state.pointer.x * 2; 
        const y = state.pointer.y * 2; 
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, 20 + x, 0.05);
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, 20 + x, 0.05); 
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 20 + y, 0.05);
        cameraRef.current.lookAt(0, 2, 0); 
    });
    return <OrthographicCamera ref={cameraRef} makeDefault position={[100, 100, 100]} zoom={35} near={-100} far={500} onUpdate={c => c.lookAt(0, 2, 0)} />;
};

// --- CLIMA REACTIVO ---
const WeatherSystem = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    const isRain = trend === 'down';
    
    return (
        <group>
            {isRain ? (
                <>
                    <Cloud opacity={0.8} speed={0.8} bounds={[10, 2, 10]} segments={40} position={[-10, 15, -10]} color="#1e293b" />
                    <Sparkles count={1000} scale={[30, 30, 30]} size={6} speed={3} opacity={0.6} color="#60a5fa" position={[0, 10, 0]} />
                    <ambientLight intensity={0.2} />
                </>
            ) : (
                <>
                    <Cloud opacity={0.3} speed={0.2} bounds={[10, 2, 10]} segments={20} position={[-10, 15, -10]} color="white" />
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 20, 10]} intensity={1.5} color="#fcd34d" />
                </>
            )}
        </group>
    );
};

// --- COMPONENTES MINERÍA ---
const FanBlade = ({ position, rotation = [0, 0, 0], scale = 1, active }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, active: boolean }) => {
    const spinnerRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => { if (active && spinnerRef.current) spinnerRef.current.rotation.z -= delta * 15; });
    return (<group position={position} rotation={rotation as any} scale={[scale, scale, scale]}><group ref={spinnerRef}><mesh rotation={[0, 0, 0]}><boxGeometry args={[0.1, 0.8, 0.02]} /><meshStandardMaterial color="#333" /></mesh><mesh rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.1, 0.8, 0.02]} /><meshStandardMaterial color="#333" /></mesh></group></group>);
};
const GpuMesh = ({ active }: { active: boolean }) => (<group><mesh castShadow receiveShadow><boxGeometry args={[1.5, 0.2, 0.8]} /><meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} /></mesh><mesh position={[0, 0.15, 0]}><boxGeometry args={[1.4, 0.1, 0.7]} /><meshStandardMaterial color="#475569" /></mesh><FanBlade position={[-0.4, 0.21, 0]} scale={0.6} active={active} /><FanBlade position={[0.4, 0.21, 0]} scale={0.6} active={active} /><mesh position={[0, 0, 0.41]}><planeGeometry args={[1.2, 0.05]} /><ScreenMaterial color="#22c55e" intensity={3} animate={active} /></mesh></group>);
const AsicMesh = ({ active }: { active: boolean }) => (<group><mesh castShadow receiveShadow><boxGeometry args={[1.2, 0.6, 0.8]} /><meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} /></mesh><mesh position={[-0.61, 0, 0]} rotation={[0, -Math.PI/2, 0]}><planeGeometry args={[0.6, 0.5]} /><meshStandardMaterial color="#0f172a" /></mesh><FanBlade position={[-0.62, 0, 0]} rotation={[0, -Math.PI/2, 0]} scale={0.5} active={active} /><mesh position={[0.6, 0.1, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.05, 0.05, 0.3]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[-0.6, 0.25, 0.3]}><sphereGeometry args={[0.03]} /><ScreenMaterial color={active ? "#22c55e" : "#ef4444"} intensity={5} /></mesh><mesh position={[-0.6, 0.25, 0.2]}><sphereGeometry args={[0.03]} /><ScreenMaterial color="#3b82f6" intensity={active ? 2 : 0} animate={active} /></mesh></group>);
const QuantumMesh = ({ active }: { active: boolean }) => (<group><Float speed={5} rotationIntensity={2} floatIntensity={0.5}><mesh><octahedronGeometry args={[0.3]} /><ScreenMaterial color="#8b5cf6" intensity={5} animate={active} /></mesh></Float><mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.4, 0.5, 0.1, 8]} /><meshStandardMaterial color="#111" metalness={1} /></mesh><group rotation={[0, 0, Math.PI/4]}><mesh><torusGeometry args={[0.5, 0.02, 8, 32]} /><meshStandardMaterial color="#fff" emissive="#fff" /></mesh></group></group>);

const MinerUnit = ({ miner, position }: { miner: InstalledMiner, position: [number, number, number] }) => {
    const modelInfo = MINERS.find(m => m.id === miner.modelId);
    const type = modelInfo?.type || 'asic';
    const isBroken = miner.condition <= 0;

    return (
        <group position={position}>
            {isBroken && (
                <group position={[0, 0.5, 0]}>
                     <Cloud opacity={0.8} speed={0.2} bounds={[1, 1, 1]} segments={5} color="#111" />
                </group>
            )}
            {miner.modelId.includes('quantum') ? (
                <QuantumMesh active={miner.active && !isBroken} />
            ) : type === 'gpu' ? (
                <GpuMesh active={miner.active && !isBroken} />
            ) : (
                <AsicMesh active={miner.active && !isBroken} />
            )}
        </group>
    );
};

const MiningRack3D = ({ rack, position }: { rack: InstalledRack, position: [number, number, number] }) => {
    const [hovered, setHover] = useState(false);
    useCursor(hovered);
    const rackHeight = rack.slots.length * 0.8 + 0.5;
    return (
        <group position={position} onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}>
            <mesh position={[-0.9, rackHeight/2, -0.9]} castShadow><boxGeometry args={[0.1, rackHeight, 0.1]} /><meshStandardMaterial color="#1e293b" metalness={0.8} /></mesh>
            <mesh position={[0.9, rackHeight/2, -0.9]} castShadow><boxGeometry args={[0.1, rackHeight, 0.1]} /><meshStandardMaterial color="#1e293b" metalness={0.8} /></mesh>
            <mesh position={[-0.9, rackHeight/2, 0.9]} castShadow><boxGeometry args={[0.1, rackHeight, 0.1]} /><meshStandardMaterial color="#1e293b" metalness={0.8} /></mesh>
            <mesh position={[0.9, rackHeight/2, 0.9]} castShadow><boxGeometry args={[0.1, rackHeight, 0.1]} /><meshStandardMaterial color="#1e293b" metalness={0.8} /></mesh>
            <mesh position={[0, 0.1, 0]}><boxGeometry args={[2, 0.2, 2]} /><meshStandardMaterial color="#0f172a" /></mesh>
            <mesh position={[0, rackHeight, 0]}><boxGeometry args={[2, 0.1, 2]} /><meshStandardMaterial color="#0f172a" /></mesh>
            {rack.slots.map((miner, index) => (
                miner ? (<MinerUnit key={miner.instanceId} miner={miner} position={[0, 0.6 + (index * 0.8), 0]} />) : (<mesh position={[0, 0.6 + (index * 0.8), 0]} key={`empty-${index}`}><boxGeometry args={[1.8, 0.05, 1.8]} /><meshBasicMaterial color="#334155" transparent opacity={0.1} wireframe /></mesh>)
            ))}
            {hovered && (<Html position={[0, rackHeight + 0.5, 0]} center><div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs border border-blue-500/50 whitespace-nowrap backdrop-blur-md shadow-xl flex flex-col items-center"><span className="font-bold">RACK SYSTEM</span><span className="text-[10px] text-blue-300">{rack.slots.filter(s => s).length} / {rack.slots.length} Slots Ocupados</span></div></Html>)}
        </group>
    );
};

const MiningMonitor = ({ position, hashrate }: { position: [number, number, number], hashrate: number }) => {
    if (hashrate <= 0) return null;
    return (<group position={position} rotation={[0, -Math.PI/2, 0]}><mesh position={[0, 0, 0]} castShadow><boxGeometry args={[4, 2.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh><mesh position={[0, 0, 0.11]}><planeGeometry args={[3.8, 2.3]} /><ScreenMaterial color="#10b981" intensity={1.5} /></mesh><group position={[-1.5, -0.8, 0.12]}>{[...Array(8)].map((_, i) => (<mesh key={i} position={[i * 0.4, Math.random() * 0.5, 0]}><planeGeometry args={[0.3, 0.5 + Math.random()]} /><meshBasicMaterial color="#a7f3d0" /></mesh>))}</group><Html position={[0, 0.5, 0.12]} transform occlude center scale={0.2}><div className="text-center select-none pointer-events-none"><div className="text-4xl font-black text-green-900">MINING_OS</div><div className="text-2xl font-mono text-green-800">{hashrate.toFixed(1)} TH/s</div></div></Html></group>);
};

// --- MUEBLES (SIN CAMBIOS) ---
const Floor = ({ color }: { color: string }) => (<group><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color={color} roughness={0.5} metalness={0.1} /></mesh><ContactShadows position={[0, -0.49, 0]} opacity={0.6} scale={40} blur={2} far={4} resolution={512} color="#000000" /></group>);
const Walls = ({ color }: { color: string }) => { const height = 12; return (<group><mesh position={[-12, height/2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[30, height]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh><mesh position={[0, height/2, -12]} receiveShadow><planeGeometry args={[30, height]} /><meshStandardMaterial color={adjustColor(color, -30)} roughness={0.9} /></mesh></group>); };
const TrophyShelf = ({ achievements }: { achievements: string[] }) => (<group position={[-11, 4, -5]} rotation={[0, Math.PI/2, 0]}><mesh castShadow receiveShadow position={[0, 0, 0]}><boxGeometry args={[4, 0.2, 1]} /><meshStandardMaterial color="#475569" /></mesh>{achievements.slice(0, 5).map((ach, i) => (<mesh key={i} position={[-1.5 + i * 0.8, 0.5, 0]} castShadow><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} /></mesh>))}</group>);
const ArcadeMachine = ({ position }: { position: [number, number, number] }) => (<group position={position} rotation={[0, Math.PI/4, 0]}><mesh castShadow position={[0, 1.5, 0]}><boxGeometry args={[1, 3, 1]} /><meshStandardMaterial color="#6d28d9" /></mesh><mesh position={[0, 2, 0.51]}><planeGeometry args={[0.8, 0.8]} /><ScreenMaterial color="#00ff00" intensity={2} /></mesh></group>);
const Desk = ({ position, items }: { position: [number, number, number], items: string[] }) => { return (<group position={position}>{[-1.8, 1.8].map((x, i) => (<React.Fragment key={i}><mesh position={[x, 1, 0.8]} castShadow receiveShadow><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh><mesh position={[x, 1, -0.8]} castShadow receiveShadow><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh></React.Fragment>))}<mesh position={[0, 2.1, 0]} castShadow receiveShadow><boxGeometry args={[4.2, 0.2, 2.2]} /><meshStandardMaterial color="#334155" roughness={0.7} /></mesh><mesh position={[1.3, 2.6, 0]} castShadow><boxGeometry args={[0.6, 0.8, 1.4]} /><meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} /></mesh>{items.includes('setup_pro') && (<mesh position={[1.3, 2.6, 0.71]}><planeGeometry args={[0.4, 0.6]} /><ScreenMaterial color="#00ff00" intensity={3} /></mesh>)}<group position={[0, 2.85, -0.6]}><mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[2.8, 1.2, 0.1]} /><meshStandardMaterial color="#111" roughness={0.1} /></mesh><mesh position={[0, 0.6, 0.06]}><planeGeometry args={[2.6, 1]} /><ScreenMaterial color="#3b82f6" intensity={2} /></mesh></group><mesh position={[0, 2.21, 0.4]} rotation={[-Math.PI/2, 0, 0]} receiveShadow><planeGeometry args={[1.8, 0.8]} /><meshStandardMaterial color="#1e293b" /></mesh><group position={[0, 2.25, 0.5]}><mesh receiveShadow><boxGeometry args={[1.4, 0.05, 0.5]} /><meshStandardMaterial color="#0f172a" /></mesh>{items.includes('setup_pro') && (<mesh position={[0, 0.03, 0]} rotation={[-0.1, 0, 0]}><planeGeometry args={[1.3, 0.4]} /><ScreenMaterial color="#f472b6" intensity={1} /></mesh>)}</group></group>); };
const Character = ({ position }: { position: [number, number, number] }) => { const group = useRef<THREE.Group>(null); useFrame((state) => { if (group.current) { group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.02; group.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.01; } }); return (<group ref={group} position={position}><group position={[0, 0.1, 0]}><mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.4, 0.5, 1, 8]} /><meshStandardMaterial color="#1f2937" /></mesh><mesh position={[0, 1.8, -0.4]} rotation={[0.1,0,0]} castShadow><boxGeometry args={[1.2, 2.5, 0.2]} /><meshStandardMaterial color="#374151" /></mesh></group><group position={[0, 1.3, 0]}><mesh castShadow><boxGeometry args={[0.9, 1.1, 0.5]} /><meshStandardMaterial color="#2563eb" /></mesh><mesh position={[0, 1, 0]} castShadow><boxGeometry args={[0.6, 0.7, 0.6]} /><meshStandardMaterial color="#ffdbac" /></mesh><group position={[0, 1, 0]}><mesh position={[0.35, 0, 0]}><boxGeometry args={[0.1, 0.4, 0.3]} /><meshStandardMaterial color="#ef4444" /></mesh><mesh position={[-0.35, 0, 0]}><boxGeometry args={[0.1, 0.4, 0.3]} /><meshStandardMaterial color="#ef4444" /></mesh><mesh position={[0, 0.3, 0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.35, 0.05, 8, 16, Math.PI]} /><meshStandardMaterial color="#ef4444" /></mesh></group></group></group>); };
const Decoration = ({ type, position }: { type: string, position: [number, number, number] }) => { const [hovered, setHover] = useState(false); const { actions } = useGame(); useCursor(hovered); const scale = hovered ? 1.2 : 1; const handleClick = () => { if (type === 'cat') actions.activateBuff('lucky_cat', 60000, 1.5); if (type === 'plant') actions.activateBuff('zen_plant', 60000, 1.1); }; return (<group position={position} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)} onClick={handleClick} scale={[scale, scale, scale]}>{type === 'plant' && (<group><mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.4, 0.4, 0.8, 8]} /><meshStandardMaterial color="#78350f" /></mesh><Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}><mesh position={[0, 1.5, 0]} castShadow><dodecahedronGeometry args={[0.7]} /><meshStandardMaterial color="#22c55e" roughness={0.8} /></mesh></Float>{hovered && <Html position={[0,2.5,0]} center><div className="bg-black/80 text-white text-xs p-1 rounded border border-white/20">Planta Feliz 🌿</div></Html>}</group>)}{type === 'cat' && (<group><mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.5, 0.4, 0.7]} /><meshStandardMaterial color="#fb923c" /></mesh><mesh position={[0, 0.7, 0.4]} castShadow><boxGeometry args={[0.4, 0.4, 0.4]} /><meshStandardMaterial color="#fb923c" /></mesh><Float speed={5} rotationIntensity={0.5} floatIntensity={0}><mesh position={[0, 0.6, -0.4]} rotation={[0.5,0,0]}><cylinderGeometry args={[0.05, 0.05, 0.5]} /><meshStandardMaterial color="#fb923c" /></mesh></Float>{hovered && <Html position={[0,1.5,0]} center><div className="bg-black/80 text-white text-xs p-1 rounded border border-white/20">¡Acaríciame! 🐈</div></Html>}</group>)}{type === 'trophy_gold' && (<Float speed={3} rotationIntensity={1.5} floatIntensity={0.5}><group rotation={[0.2, 0.5, 0]}><mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.3, 0.1, 0.8, 16]} /><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} /></mesh><mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.3]} /><ScreenMaterial color="#fbbf24" intensity={3} /></mesh></group></Float>)}</group>); };

const OfficeScene: React.FC<OfficeVisualProps> = ({ level, items, skin, achievements, miningFarm }) => {
  const { market } = useGame();
  const trend = market.trend['BTC'] || 'neutral';

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <CinematicCamera />
        
        {/* COLOR Y CLIMA DEPENDIENTE DEL MERCADO */}
        <color attach="background" args={[trend === 'down' ? '#0f172a' : '#f1f5f9']} />
        <WeatherSystem trend={trend} /> 
        
        <Environment preset={trend === 'down' ? "night" : "city"} background={false} blur={0.8} />
        <ambientLight intensity={trend === 'down' ? 0.2 : 0.6} />
        <directionalLight position={[-10, 20, 10]} intensity={1.5} color={trend === 'down' ? "#60a5fa" : "#fff7ed"} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
        <pointLight position={[5, 10, 5]} intensity={0.5} color="#fbbf24" distance={20} />

        <group position={[0, -2, 0]}>
            <Floor color={skin.floor} />
            <Walls color={skin.wall} />
            
            <Desk position={[0, 0, 0]} items={items} />
            <Character position={[0, 0.1, 1.5]} />
            <TrophyShelf achievements={achievements} />
            <ArcadeMachine position={[-8, 0, 2]} />
            
            {/* RACKS MINEROS */}
            {miningFarm.racks.map((rack, i) => {
                let posX = 5; let posZ = -10;
                if (i < 2) { posX = 8 + (i * 3); posZ = -5; } else { posX = 5 + ((i-2) * 3); posZ = -12; }
                return <MiningRack3D key={rack.instanceId} rack={rack} position={[posX, 0, posZ]} />;
            })}
            
            {/* MONITOR */}
            {miningFarm.totalHashrate > 0 && <MiningMonitor position={[0, 6, -11.8]} hashrate={miningFarm.totalHashrate} />}
            
            {items.includes('plant') && <Decoration type="plant" position={[5, 0, -4]} />}
            {items.includes('cat') && <Decoration type="cat" position={[-3, 0, 3]} />}
            {items.includes('trophy_gold') && <Decoration type="trophy_gold" position={[-5, 3, -8]} />}
        </group>
        <SoftShadows size={10} samples={10} />
    </Canvas>
  );
};

export default OfficeScene;