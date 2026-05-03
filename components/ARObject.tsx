import React, { Suspense, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Text, useGLTF, Center, Html, useProgress } from '@react-three/drei';
import { MonumentData } from '../types';

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Failed to load 3D model:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// --- LOADER COMPONENT ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 rounded-xl border border-orange-500/50 shadow-[0_0_30px_rgba(234,88,12,0.4)]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-orange-400 font-mono text-xs font-bold tracking-widest">MEMUAT MODEL...</p>
        <p className="text-white font-mono text-sm">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// --- FALLBACK MODEL (ERROR STATE) ---
const FallbackModel = () => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="bottom">
        ERROR: FILE 3D TIDAK DITEMUKAN!
      </Text>
      <Text position={[0, 0.9, 0]} fontSize={0.1} color="white" anchorX="center" anchorY="bottom">
        Cek: public/yuda.glb
      </Text>
    </group>
  )
}

// --- 3D MODEL COMPONENT ---
const YudaModel = (props: any) => {
  // CORRECT PATH for public folder files in Vite is absolute root "/"
  const { scene } = useGLTF('/yuda.glb');
  const sceneClone = React.useMemo(() => scene.clone(), [scene]);
  return <primitive object={sceneClone} {...props} />;
};

// Preload to prevent stutter
useGLTF.preload('/yuda.glb');

interface ARObjectProps {
    data: MonumentData;
}

export const ARObject: React.FC<ARObjectProps> = ({ data }) => {
  return (
    <div className="absolute inset-0 z-30 w-full h-full fade-in">
      <Canvas shadows dpr={[1, 2]}>
        {/* 
            CAMERA CONFIG:
            Posisi [0, 1, 10] - Sedikit di atas (y=1) dan mundur (z=10) 
            agar objek terlihat pas di tengah layar seolah berdiri di depan kita.
        */}
        <PerspectiveCamera makeDefault position={[0, 1, 10]} fov={40} />
        
        <ambientLight intensity={1.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color="white" />
        
        <Environment preset="city" />

        <Suspense fallback={<Loader />}>
            <ErrorBoundary fallback={
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                    <FallbackModel />
                </Float>
            }>
                {/* 
                    FLOAT CONFIG: 
                    Dibuat sangat minimal agar terlihat "Menempel" / Solid pada marker.
                    floatingRange sangat kecil [-0.05, 0.05]
                */}
                <Float 
                    speed={1.5} 
                    rotationIntensity={0.1} 
                    floatIntensity={0.1} 
                    floatingRange={[-0.05, 0.05]}
                >
                    {/* 
                      POSISI:
                      - position-y: -2.0 agar kaki objek menapak pas di titik 0 bayangan
                    */}
                    <Center top position={[0, -2.0, 0]}>
                        <YudaModel scale={1.2} rotation={[0, Math.PI / 6, 0]} />
                    </Center>
                </Float>
            </ErrorBoundary>
        </Suspense>

        {/* Shadow dipertebal agar terlihat menapak tanah */}
        <ContactShadows position={[0, -2.1, 0]} opacity={0.7} scale={10} blur={2} far={4} color="black" />

        <OrbitControls 
            enablePan={true}
            enableZoom={true}
            minDistance={4}
            maxDistance={15}
            autoRotate={false}
            target={[0, -1, 0]} /* Target focus di tengah badan objek, bukan di kaki, agar rotasi stabil */
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.6} // Batasi agar tidak tembus lantai
        />
      </Canvas>

      {/* Floating HTML Label */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none w-full flex justify-center">
        <div className="bg-black/60 backdrop-blur-md border-l-4 border-orange-500 px-6 py-3 rounded-r-xl shadow-2xl transform transition-all hover:scale-105">
            <h2 className="text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-1">AR VISUALIZER</h2>
            <h1 className="text-white text-lg font-bold leading-none">{data.title}</h1>
            <p className="text-gray-400 text-[10px] mt-1">Interactive 3D Mode</p>
        </div>
      </div>
    </div>
  );
};