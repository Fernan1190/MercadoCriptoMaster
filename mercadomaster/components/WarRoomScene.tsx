import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, CatmullRomLine, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MARKET_NODES } from '../data/markets';

interface WarRoomSceneProps {
  unlocked: string[];
  onSelect: (id: string) => void;
}

// --- UTILIDADES ---
const calcPosFromLatLng = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Comprueba horario de mercado (9am - 5pm)
const isMarketOpen = (timezone: string) => {
    try {
        const now = new Date();
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        const hour = localTime.getHours();
        const day = localTime.getDay();
        // Lunes (1) a Viernes (5)
        return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
    } catch (e) { return true; }
};

// --- COMPONENTES VISUALES ---

// 🛰️ SATÉLITES ORBITANDO
const Satellites = () => {
    const groupRef = useRef<THREE.Group>(null);
    const sats = useMemo(() => Array.from({ length: 15 }).map(() => ({
        radius: 6.5 + Math.random() * 1.5,
        speed: 0.05 + Math.random() * 0.1,
        angle: Math.random() * Math.PI * 2,
        inclination: (Math.random() - 0.5) * Math.PI
    })), []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    });

    return (
        <group ref={groupRef}>
            {sats.map((sat, i) => (
                <group key={i} rotation={[sat.inclination, 0, 0]}>
                    <mesh position={[sat.radius * Math.cos(sat.angle), 0, sat.radius * Math.sin(sat.angle)]}>
                        <boxGeometry args={[0.05, 0.05, 0.1]} />
                        <meshBasicMaterial color="#fbbf24" />
                    </mesh>
                    {/* Estela simple */}
                    <mesh position={[sat.radius * Math.cos(sat.angle), 0, sat.radius * Math.sin(sat.angle)]} rotation={[0, sat.angle + Math.PI/2, 0]}>
                         <planeGeometry args={[0.6, 0.02]} />
                         <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// 📡 LÍNEAS DE CONEXIÓN
const DataArc = ({ start, end, color }: { start: THREE.Vector3, end: THREE.Vector3, color: string }) => {
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(start.length() * 1.5);
    const points = useMemo(() => [start, mid, end], [start, end]);
    const ref = useRef<any>(null);
    useFrame((_, delta) => { if (ref.current) ref.current.material.uniforms.dashOffset.value -= delta * 0.5; });

    return <CatmullRomLine ref={ref} points={points} color={color} lineWidth={1} dashed dashScale={20} dashSize={0.2} gapSize={0.5} opacity={0.5} transparent />;
};

// 📍 MARCADOR INTERACTIVO
const MarketMarker = ({ node, isUnlocked, onClick }: any) => {
  const [hovered, setHover] = useState(false);
  const pos = calcPosFromLatLng(node.lat, node.lng, 5.05);
  const isOpen = isMarketOpen(node.timezone);
  
  // Verde si abierto, Naranja si cerrado, Rojo si bloqueado
  const statusColor = !isUnlocked ? "#ef4444" : (isOpen ? "#10b981" : "#f59e0b");

  return (
    <group 
        position={pos} 
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }} 
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }} 
        onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
    >
       {/* Ház de luz */}
       <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
       </mesh>
       
       {/* Icono Flotante */}
       <Float speed={4} floatIntensity={0.2} rotationIntensity={0.5}>
           <mesh position={[0, 1.4, 0]}>
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial color={statusColor} wireframe />
           </mesh>
           
           {/* Etiqueta - Sin backgroundColor para evitar error TS */}
           <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                {hovered && (
                    <group position={[0, 0.6, 0]}>
                        <Text fontSize={0.25} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">
                            {node.name}
                        </Text>
                        <Text fontSize={0.15} color={isOpen ? "#4ade80" : "#f59e0b"} position={[0, -0.2, 0]} anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="black">
                            {isOpen ? "● OPEN" : "○ CLOSED"}
                        </Text>
                    </group>
                )}
           </Billboard>
       </Float>

       {/* Base */}
       <mesh>
           <ringGeometry args={[0.08, 0.12, 32]} />
           <meshBasicMaterial color={statusColor} side={THREE.DoubleSide} />
       </mesh>
    </group>
  );
};

const Globe = ({ unlocked, onSelect }: WarRoomSceneProps) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
     if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.02;
     if (cloudsRef.current) cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
     
     // ☀️ CICLO DÍA/NOCHE: El sol rota alrededor
     if (sunRef.current) {
         const t = clock.getElapsedTime() * 0.1; 
         sunRef.current.position.x = Math.sin(t) * 20;
         sunRef.current.position.z = Math.cos(t) * 20;
         sunRef.current.lookAt(0, 0, 0);
     }
  });

  const nyNode = MARKET_NODES.find(n => n.id === 'ny');
  const otherNodes = MARKET_NODES.filter(n => n.id !== 'ny');

  return (
    <group>
        <directionalLight ref={sunRef} position={[20, 0, 10]} intensity={2.5} color="#ffedd5" />
        <ambientLight intensity={0.05} /> {/* Noche oscura */}

        {/* ATMÓSFERA */}
        <mesh scale={[1.02, 1.02, 1.02]}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* TIERRA */}
        <mesh ref={earthRef}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshPhysicalMaterial 
                color="#0f172a" 
                emissive="#000000"
                roughness={0.8}
                metalness={0.1}
                wireframe={false}
            />
            {/* Grid Táctico sutil */}
            <mesh>
                <sphereGeometry args={[5.01, 24, 24]} />
                <meshBasicMaterial color="#1e40af" wireframe transparent opacity={0.08} />
            </mesh>

            {MARKET_NODES.map(node => (
                <MarketMarker key={node.id} node={node} isUnlocked={unlocked.includes(node.id)} onClick={onSelect} />
            ))}

            {nyNode && otherNodes.map(node => (
                unlocked.includes(node.id) && <DataArc key={`arc-${node.id}`} start={calcPosFromLatLng(nyNode.lat, nyNode.lng, 5)} end={calcPosFromLatLng(node.lat, node.lng, 5)} color="#3b82f6" />
            ))}
        </mesh>

        {/* NUBES */}
        <mesh ref={cloudsRef}>
             <sphereGeometry args={[5.05, 64, 64]} />
             <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
        
        <Satellites />
    </group>
  );
};

export const WarRoomScene: React.FC<WarRoomSceneProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 45 }} shadows>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.2} />
        <Globe {...props} />
        <OrbitControls enablePan={false} enableZoom={true} minDistance={8} maxDistance={25} autoRotate={false} />
    </Canvas>
  );
};