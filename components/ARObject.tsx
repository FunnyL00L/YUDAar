import React, { useRef, useState, useEffect } from 'react';
import { MONUMENT_INFO } from '../types';

export const ARObject: React.FC = () => {
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);
  const autoRotateRef = useRef<number>(0);

  // Auto Rotation Logic
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!isDragging) {
        setRotationY((prev) => (prev + 0.5) % 360);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  // Interaction Handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    lastX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - lastX.current;
    setRotationY((prev) => prev + deltaX * 0.5); // Sensitivity
    lastX.current = clientX;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
      
      {/* 3D Scene Area - Interactive */}
      <div 
        className="scene-3d pointer-events-auto cursor-grab active:cursor-grabbing fade-in"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div 
          className="cube" 
          style={{ transform: `rotateX(-10deg) rotateY(${rotationY}deg)` }}
        >
          {/* Faces designed with Yudha Mandala Theme */}
          <div className="cube-face front bg-orange-900/40 border-orange-500">
             <div className="text-3xl font-bold text-orange-400">BALI</div>
             <div className="text-sm">MARGARANA</div>
          </div>
          <div className="cube-face back bg-orange-900/40 border-orange-500">
             <div className="text-4xl font-bold">1946</div>
             <div className="text-xs">PUPUTAN</div>
          </div>
          <div className="cube-face right bg-gray-900/40 border-white">
             <img src="https://api.iconify.design/lucide:sword.svg?color=white" className="w-16 h-16 opacity-80" alt="icon" />
             <div className="mt-2 font-bold tracking-widest">MERDEKA</div>
          </div>
          <div className="cube-face left bg-gray-900/40 border-white">
             <img src="https://api.iconify.design/lucide:flame.svg?color=orange" className="w-16 h-16" alt="icon" />
             <div className="mt-2 font-bold text-orange-500">SEMANGAT</div>
          </div>
          <div className="cube-face top bg-orange-500/20"></div>
          <div className="cube-face bottom bg-orange-500/20 shadow-xl"></div>
        </div>
      </div>

      {/* Floating Label */}
      <div className="mt-12 pointer-events-none fade-in">
        <div className="bg-black/60 backdrop-blur-md border-l-4 border-orange-500 px-6 py-3 rounded-r-xl">
            <h2 className="text-orange-400 text-xs font-bold tracking-widest uppercase">TERDETEKSI</h2>
            <h1 className="text-white text-xl font-bold">{MONUMENT_INFO.title}</h1>
            <p className="text-gray-400 text-xs mt-1">Geser kubus untuk melihat detail 3D</p>
        </div>
      </div>
    </div>
  );
};
