import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Html, SoftShadows, useCursor, Environment, Float, ContactShadows, Stars, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../context/GameContext';

export interface OfficeVisualProps {
  level: number;
  items: string[];
  league: string;
  skin: { floor: string, wall: string };
  achievements: string[];
}

// --- UTILIDADES ---
const ScreenMaterial = ({ color, intensity = 1 }: { color: string, intensity?: number }) => (
    <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={intensity * 3} 
        toneMapped={false} 
    />
);

function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
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

const WeatherSystem = ({ isNight }: { isNight: boolean }) => {
    const [weather, setWeather] = useState<'clear' | 'rain' | 'snow'>('clear');
    useEffect(() => {
        const interval = setInterval(() => {
            const r = Math.random();
            if (r > 0.7) setWeather('rain');
            else if (r > 0.4) setWeather('snow');
            else setWeather('clear');
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <group>
            {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            <Cloud opacity={0.5} speed={0.4} bounds={[10, 2, 10]} segments={20} position={[-10, 15, -10]} color={isNight ? "#1e293b" : "white"} />
            <Cloud opacity={0.3} speed={0.2} bounds={[10, 2, 10]} segments={20} position={[15, 12, -15]} color={isNight ? "#0f172a" : "white"} />
            {weather === 'rain' && <Sparkles count={500} scale={[20, 20, 20]} size={4} speed={2} opacity={0.5} color="#60a5fa" position={[0, 10, 0]} />}
            {weather === 'snow' && <Sparkles count={300} scale={[20, 20, 20]} size={8} speed={0.5} opacity={0.8} color="white" position={[0, 10, 0]} />}
        </group>
    );
};

// --- COMPONENTES DE LA SALA ---
const Floor = ({ color }: { color: string }) => (
    <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
        <ContactShadows position={[0, -0.49, 0]} opacity={0.6} scale={40} blur={2} far={4} resolution={512} color="#000000" />
    </group>
);

const Walls = ({ color }: { color: string }) => {
  const height = 12;
  return (
    <group>
      <mesh position={[-12, height/2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, height]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, height/2, -12]} receiveShadow>
        <planeGeometry args={[30, height]} />
        <meshStandardMaterial color={adjustColor(color, -30)} roughness={0.9} />
      </mesh>
    </group>
  );
};

const TrophyShelf = ({ achievements }: { achievements: string[] }) => (
    <group position={[-11, 4, -5]} rotation={[0, Math.PI/2, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[4, 0.2, 1]} />
            <meshStandardMaterial color="#475569" />
        </mesh>
        {achievements.slice(0, 5).map((ach, i) => (
             <mesh key={i} position={[-1.5 + i * 0.8, 0.5, 0]} castShadow>
                 <sphereGeometry args={[0.3]} />
                 <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
             </mesh>
        ))}
    </group>
);

const ArcadeMachine = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0, Math.PI/4, 0]}>
        <mesh castShadow position={[0, 1.5, 0]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color="#6d28d9" />
        </mesh>
        <mesh position={[0, 2, 0.51]}>
            <planeGeometry args={[0.8, 0.8]} />
            <ScreenMaterial color="#00ff00" intensity={2} />
        </mesh>
    </group>
);

// ... (Desk, Character, Decoration se mantienen igual)
const Desk = ({ position, items }: { position: [number, number, number], items: string[] }) => {
  return (
    <group position={position}>
      {[-1.8, 1.8].map((x, i) => (
          <React.Fragment key={i}>
              <mesh position={[x, 1, 0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 2, 0.2]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[x, 1, -0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 2, 0.2]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
          </React.Fragment>
      ))}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.2, 2.2]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* PC Gaming */}
      <mesh position={[1.3, 2.6, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>
      {items.includes('setup_pro') && (
         <mesh position={[1.3, 2.6, 0.71]}>
             <planeGeometry args={[0.4, 0.6]} />
             <ScreenMaterial color="#00ff00" intensity={3} />
         </mesh>
      )}

      {/* Monitor Ultrawide */}
      <group position={[0, 2.85, -0.6]}>
          <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[2.8, 1.2, 0.1]} /> 
              <meshStandardMaterial color="#111" roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.6, 0.06]}>
              <planeGeometry args={[2.6, 1]} />
              <ScreenMaterial color="#3b82f6" intensity={2} />
          </mesh>
      </group>
      
      <mesh position={[0, 2.21, 0.4]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.8, 0.8]} />
          <meshStandardMaterial color="#1e293b" />
      </mesh>
      <group position={[0, 2.25, 0.5]}>
         <mesh receiveShadow>
            <boxGeometry args={[1.4, 0.05, 0.5]} />
            <meshStandardMaterial color="#0f172a" />
         </mesh>
         {items.includes('setup_pro') && (
             <mesh position={[0, 0.03, 0]} rotation={[-0.1, 0, 0]}>
                 <planeGeometry args={[1.3, 0.4]} />
                 <ScreenMaterial color="#f472b6" intensity={1} />
             </mesh>
         )}
      </group>
    </group>
  );
};

const Character = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
      if (group.current) {
          group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.02;
          group.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.01;
      }
  });

  return (
    <group ref={group} position={position}>
        <group position={[0, 0.1, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.4, 0.5, 1, 8]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0, 1.8, -0.4]} rotation={[0.1,0,0]} castShadow>
                <boxGeometry args={[1.2, 2.5, 0.2]} />
                <meshStandardMaterial color="#374151" />
            </mesh>
        </group>

        <group position={[0, 1.3, 0]}>
            <mesh castShadow>
                <boxGeometry args={[0.9, 1.1, 0.5]} />
                <meshStandardMaterial color="#2563eb" />
            </mesh>
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[0.6, 0.7, 0.6]} />
                <meshStandardMaterial color="#ffdbac" />
            </mesh>
            <group position={[0, 1, 0]}>
                <mesh position={[0.35, 0, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.3]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
                <mesh position={[-0.35, 0, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.3]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[0,0,Math.PI/2]}>
                    <torusGeometry args={[0.35, 0.05, 8, 16, Math.PI]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
            </group>
        </group>
    </group>
  );
};

const Decoration = ({ type, position }: { type: string, position: [number, number, number] }) => {
    const [hovered, setHover] = useState(false);
    const { actions } = useGame();
    useCursor(hovered);
    const scale = hovered ? 1.2 : 1;

    const handleClick = () => {
        if (type === 'cat') actions.activateBuff('lucky_cat', 60000, 1.5);
        if (type === 'plant') actions.activateBuff('zen_plant', 60000, 1.1);
    };

    return (
        <group 
            position={position} 
            onPointerOver={() => setHover(true)} 
            onPointerOut={() => setHover(false)}
            onClick={handleClick}
            scale={[scale, scale, scale]}
        >
            {type === 'plant' && (
                <group>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
                        <meshStandardMaterial color="#78350f" />
                    </mesh>
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
                        <mesh position={[0, 1.5, 0]} castShadow>
                            <dodecahedronGeometry args={[0.7]} />
                            <meshStandardMaterial color="#22c55e" roughness={0.8} />
                        </mesh>
                    </Float>
                    {hovered && <Html position={[0,2.5,0]} center><div className="bg-black/80 text-white text-xs p-1 rounded border border-white/20">Planta Feliz 🌿</div></Html>}
                </group>
            )}
            
            {type === 'cat' && (
                <group>
                    <mesh position={[0, 0.4, 0]} castShadow>
                        <boxGeometry args={[0.5, 0.4, 0.7]} />
                        <meshStandardMaterial color="#fb923c" />
                    </mesh>
                    <mesh position={[0, 0.7, 0.4]} castShadow>
                        <boxGeometry args={[0.4, 0.4, 0.4]} />
                        <meshStandardMaterial color="#fb923c" />
                    </mesh>
                     <Float speed={5} rotationIntensity={0.5} floatIntensity={0}>
                        <mesh position={[0, 0.6, -0.4]} rotation={[0.5,0,0]}>
                            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
                            <meshStandardMaterial color="#fb923c" />
                        </mesh>
                     </Float>
                     {hovered && <Html position={[0,1.5,0]} center><div className="bg-black/80 text-white text-xs p-1 rounded border border-white/20">¡Acaríciame! 🐈</div></Html>}
                </group>
            )}

            {type === 'trophy_gold' && (
                <Float speed={3} rotationIntensity={1.5} floatIntensity={0.5}>
                    <group rotation={[0.2, 0.5, 0]}>
                        <mesh position={[0, 1, 0]} castShadow>
                            <cylinderGeometry args={[0.3, 0.1, 0.8, 16]} />
                            <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, 1.5, 0]}>
                            <sphereGeometry args={[0.3]} />
                            <ScreenMaterial color="#fbbf24" intensity={3} />
                        </mesh>
                    </group>
                </Float>
            )}
        </group>
    );
};

// --- ESCENA PRINCIPAL ---

const OfficeScene: React.FC<OfficeVisualProps> = ({ level, items, skin, achievements }) => {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
      const checkTime = () => {
          const hour = new Date().getHours();
          setIsNight(hour > 19 || hour < 7);
      };
      checkTime();
      const timer = setInterval(checkTime, 60000);
      return () => clearInterval(timer);
  }, []);

  let tier = 1;
  if (level >= 5) tier = 2;
  if (level >= 10) tier = 3;
  if (level >= 20) tier = 4;
  if (level >= 50) tier = 5;

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <CinematicCamera />
        
        <color attach="background" args={[isNight ? '#020617' : '#f1f5f9']} />
        <WeatherSystem isNight={isNight} />
        <Environment preset={isNight ? "night" : "city"} background={false} blur={0.8} />
        
        <ambientLight intensity={isNight ? 0.2 : 0.6} />
        <directionalLight 
            position={[-10, 20, 10]} 
            intensity={isNight ? 0.5 : 1.5} 
            color={isNight ? "#60a5fa" : "#fff7ed"}
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
        />
        
        <pointLight position={[5, 10, 5]} intensity={0.5} color="#fbbf24" distance={20} />

        <group position={[0, -2, 0]}>
            <Floor color={skin.floor} />
            <Walls color={skin.wall} />
            <Desk position={[0, 0, 0]} items={items} />
            <Character position={[0, 0.1, 1.5]} />
            <TrophyShelf achievements={achievements} />
            <ArcadeMachine position={[-8, 0, 2]} />

            {items.includes('plant') && <Decoration type="plant" position={[5, 0, -4]} />}
            {items.includes('cat') && <Decoration type="cat" position={[-3, 0, 3]} />}
            {items.includes('trophy_gold') && <Decoration type="trophy_gold" position={[-5, 3, -8]} />}
        </group>

        <SoftShadows size={10} samples={10} />
    </Canvas>
  );
};

export default OfficeScene;