import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Float, CatmullRomLine, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MARKET_NODES } from '../data/markets';

interface WarRoomSceneProps {
  unlocked: string[];
  onSelect: (id: string) => void;
}

// --- UTILIDAD: Lat/Lon a Vector3 ---
const calcPosFromLatLng = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// --- COMPONENTE: LÍNEA DE CONEXIÓN (Arco) ---
const DataArc = ({ start, end, color }: { start: THREE.Vector3, end: THREE.Vector3, color: string }) => {
    // Calculamos un punto medio elevado para curvar la línea
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(start.length() * 1.5);
    
    // Puntos de la curva
    const points = useMemo(() => [start, mid, end], [start, end]);
    
    // Referencia para animar la textura/dash
    const ref = useRef<any>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            // Animamos el offset del patrón punteado para simular flujo de datos
            ref.current.material.uniforms.dashOffset.value -= delta * 1;
        }
    });

    return (
        <CatmullRomLine 
            ref={ref}
            points={points} 
            color={color} 
            lineWidth={1.5} 
            dashed 
            dashScale={10} 
            dashSize={0.5} 
            gapSize={0.5} 
            opacity={0.6}
            transparent
        />
    );
};

// --- COMPONENTE: ANILLOS ORBITALES (Decoración Tech) ---
const OrbitalRings = () => {
    const ringRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ringRef.current) {
            ringRef.current.rotation.y = clock.getElapsedTime() * 0.05;
            ringRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <group ref={ringRef} rotation={[0.5, 0, 0]}>
            {/* Anillo Principal */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[8, 0.02, 16, 100]} />
                <meshBasicMaterial color="#3b82f6" opacity={0.3} transparent />
            </mesh>
            {/* Anillo Secundario punteado (simulado con opacidad baja) */}
            <mesh rotation={[Math.PI / 2.2, 0, 0]}>
                <torusGeometry args={[9, 0.01, 16, 100]} />
                <meshBasicMaterial color="#60a5fa" opacity={0.2} transparent />
            </mesh>
        </group>
    );
};

const MarketMarker = ({ node, isUnlocked, onClick }: any) => {
  const [hovered, setHover] = useState(false);
  const pos = calcPosFromLatLng(node.lat, node.lng, 5.2);
  
  return (
    <group position={pos} onClick={() => onClick(node.id)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
       {/* Ház de luz (Beacon) */}
       <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 1.5, 8]} />
          <meshBasicMaterial color={isUnlocked ? "#10b981" : "#ef4444"} transparent opacity={0.6} />
       </mesh>
       
       {/* Icono Giratorio */}
       <Float speed={5} floatIntensity={0.2}>
           <mesh>
              <octahedronGeometry args={[0.2]} />
              <meshStandardMaterial color={isUnlocked ? "#4ade80" : "#f87171"} wireframe />
           </mesh>
       </Float>

       {/* Etiqueta Flotante (Siempre mira a cámara) */}
       <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            {hovered && (
                <Text fontSize={0.3} color="white" position={[0, 1.2, 0]} anchorX="center" anchorY="middle">
                    {node.name}
                </Text>
            )}
       </Billboard>

       {/* Punto en superficie */}
       <mesh position={[0, -0.1, 0]}>
           <sphereGeometry args={[0.1]} />
           <meshBasicMaterial color={isUnlocked ? "#10b981" : "#ef4444"} />
       </mesh>
    </group>
  );
};

const Globe = ({ unlocked, onSelect }: WarRoomSceneProps) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
     if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.02; // Rotación lenta y majestuosa
     if (cloudsRef.current) cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  // Generar líneas de conexión desde NY (Hub Central) a los otros nodos
  const nyNode = MARKET_NODES.find(n => n.id === 'ny');
  const otherNodes = MARKET_NODES.filter(n => n.id !== 'ny');

  return (
    <group>
        {/* ATMÓSFERA (Glow Effect Simple) */}
        <mesh>
            <sphereGeometry args={[5.2, 64, 64]} />
            <meshBasicMaterial 
                color="#1d4ed8" 
                transparent 
                opacity={0.15} 
                side={THREE.BackSide} // Renderizar por dentro para efecto de borde
                blending={THREE.AdditiveBlending}
            />
        </mesh>

        {/* PLANETA BASE */}
        <mesh ref={earthRef}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshPhysicalMaterial 
                color="#0f172a" 
                emissive="#020617"
                roughness={0.7}
                metalness={0.5}
                map={null} // Aquí podrías poner una textura real de la tierra si quisieras
                wireframe={false}
            />
            
            {/* Hijos del planeta para que roten con él */}
            
            {/* GRID SUPERPUESTO (Efecto Táctico) */}
            <mesh>
                <sphereGeometry args={[5.02, 24, 24]} />
                <meshBasicMaterial color="#1e40af" wireframe transparent opacity={0.1} />
            </mesh>

            {/* MARCADORES */}
            {MARKET_NODES.map(node => (
                <MarketMarker key={node.id} node={node} isUnlocked={unlocked.includes(node.id)} onClick={onSelect} />
            ))}

            {/* LÍNEAS DE CONEXIÓN (ARCOS) */}
            {/* Conectamos todos los nodos desbloqueados con NY para simular la red */}
            {nyNode && otherNodes.map(node => (
                unlocked.includes(node.id) && (
                    <DataArc 
                        key={`link-ny-${node.id}`} 
                        start={calcPosFromLatLng(nyNode.lat, nyNode.lng, 5)} 
                        end={calcPosFromLatLng(node.lat, node.lng, 5)} 
                        color={unlocked.includes(node.id) ? "#3b82f6" : "#475569"} 
                    />
                )
            ))}
        </mesh>

        {/* NUBES / ATMÓSFERA EXTERNA */}
        <mesh ref={cloudsRef}>
             <sphereGeometry args={[5.08, 64, 64]} />
             <meshStandardMaterial color="#60a5fa" transparent opacity={0.05} />
        </mesh>

        {/* ANILLOS ORBITALES (Estáticos respecto a la rotación de la tierra, giran independientes) */}
        <OrbitalRings />
    </group>
  );
};

export const WarRoomScene: React.FC<WarRoomSceneProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        {/* Iluminación Dramática */}
        <ambientLight intensity={0.2} />
        <pointLight position={[15, 10, 10]} intensity={2} color="#60a5fa" />
        <pointLight position={[-10, -5, -10]} intensity={1} color="#c084fc" /> {/* Luz de contra morada */}
        
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        
        <Globe {...props} />
        
        <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={8} 
            maxDistance={25} 
            autoRotate={false} /* Dejamos que el usuario controle o que la tierra rote sola */
        />
    </Canvas>
  );
};