import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { MARKET_NODES } from '../data/markets';

interface WarRoomSceneProps {
  unlocked: string[];
  onSelect: (id: string) => void;
}

// Conversión Lat/Lng a Vector3 (Coordenadas 3D en la esfera)
const calcPosFromLatLng = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z] as [number, number, number];
};

const MarketMarker = ({ node, isUnlocked, onClick }: any) => {
  const [hovered, setHover] = useState(false);
  const pos = calcPosFromLatLng(node.lat, node.lng, 5.2); // Un poco encima de la superficie (radio 5)
  
  return (
    <group position={pos} onClick={() => onClick(node.id)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
       {/* Pilar del marcador */}
       <mesh position={[0, -0.5, 0]} rotation={[0,0,0]}>
          <cylinderGeometry args={[0.05, 0.02, 1, 8]} />
          <meshStandardMaterial color={isUnlocked ? "#10b981" : "#ef4444"} emissive={isUnlocked ? "#10b981" : "#ef4444"} emissiveIntensity={2} />
       </mesh>
       
       {/* Icono Flotante */}
       <Float speed={5} floatIntensity={0.5}>
           <mesh>
              <octahedronGeometry args={[0.3]} />
              <meshStandardMaterial color={isUnlocked ? "#4ade80" : "#f87171"} wireframe={!isUnlocked} />
           </mesh>
       </Float>

       {/* Etiqueta UI */}
       {hovered && (
         <Html distanceFactor={10}>
            <div className={`p-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap backdrop-blur-md border ${isUnlocked ? 'bg-green-900/80 border-green-500 text-green-400' : 'bg-red-900/80 border-red-500 text-red-400'}`}>
               {node.name}
            </div>
         </Html>
       )}
    </group>
  );
};

const Globe = ({ unlocked, onSelect }: WarRoomSceneProps) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
     if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
     if (cloudsRef.current) cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
  });

  return (
    <group>
        {/* Planeta Base (Holográfico) */}
        <mesh ref={earthRef}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshPhysicalMaterial 
                color="#1e3a8a" 
                emissive="#172554"
                emissiveIntensity={0.5}
                roughness={0.1}
                metalness={0.8}
                wireframe={false}
                transparent
                opacity={0.9}
            />
        </mesh>

        {/* Grid Wireframe (Efecto Táctico) */}
        <mesh>
            <sphereGeometry args={[5.05, 32, 32]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
        </mesh>

        {/* Atmósfera / Nubes */}
        <mesh ref={cloudsRef}>
             <sphereGeometry args={[5.1, 64, 64]} />
             <meshStandardMaterial color="#60a5fa" transparent opacity={0.1} />
        </mesh>

        {/* Marcadores de Ciudades */}
        <group rotation={[0, 0, 0]}> {/* Este grupo rotará con la tierra si lo metemos dentro, pero queremos que giren. Lo ideal es añadirlos como hijos del ref de tierra o calcular su posición mundial. Para simplificar, los dejamos estáticos y que la cámara rote o hacemos que el grupo rote. Hagamos que el grupo rote igual que la tierra: */}
            <mesh rotation={[0, 0, 0]}> {/* Hack para agrupar rotación manual */}
                 {/* Nota: En R3F puro, mejor mover la cámara. Aquí rotaremos los marcadores manualmente si queremos, o dejamos que el usuario rote la cámara con OrbitControls */}
                 {MARKET_NODES.map(node => (
                    // Truco: Para que giren con la tierra, deberían ser hijos de earthRef, pero como earthRef es un mesh, mejor usar un Group padre para todo.
                    // Por simplicidad visual interactiva, usaremos OrbitControls y dejaremos la tierra quieta o rotando muy lento, y los marcadores pegados.
                    // Vamos a ponerlos estáticos y que el usuario gire el mundo con el ratón.
                    <MarketMarker key={node.id} node={node} isUnlocked={unlocked.includes(node.id)} onClick={onSelect} />
                 ))}
            </mesh>
        </group>
    </group>
  );
};

export const WarRoomScene: React.FC<WarRoomSceneProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#fbbf24" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        
        <Globe {...props} />
        
        <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={8} 
            maxDistance={20} 
            autoRotate 
            autoRotateSpeed={0.5} 
        />
    </Canvas>
  );
};