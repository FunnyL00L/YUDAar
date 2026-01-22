import React from 'react';

interface ScannerEffectProps {
  isLocked?: boolean;
  progress?: number; // 0 to 100
}

export const ScannerEffect: React.FC<ScannerEffectProps> = ({ isLocked = false, progress = 0 }) => {
  // Determine color based on progress
  // UPDATED: Green logic starts exactly at 65% to match detection logic
  const getColor = () => {
      if (progress < 30) return 'bg-red-500';
      if (progress < 65) return 'bg-yellow-400'; 
      return 'bg-green-400'; // Success color
  };

  const getTextColor = () => {
      if (progress < 30) return 'text-red-400';
      if (progress < 65) return 'text-yellow-300';
      return 'text-green-300';
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
      
      {/* HUD Container */}
      <div className={`relative transition-all duration-500 ${isLocked ? 'scale-100 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Outer Ring - Rotating */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
        
        {/* Inner Ring - Static */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-cyan-500/10 rounded-full"></div>

        {/* Dynamic Brackets */}
        <div className="relative w-[260px] h-[260px]">
          {/* Sweeping Laser Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-[scan-vertical_1.5s_ease-in-out_infinite] shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>

          {/* Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-cyan-400/50"></div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-cyan-400/50"></div>
        </div>

      </div>

      {/* ENHANCED PROGRESS BAR SECTION */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 mt-[160px] w-72 flex flex-col gap-2 transition-opacity duration-300 ${isLocked ? 'opacity-0' : 'opacity-100'}`}>
         <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest animate-pulse">ANALYZING GEOMETRY</span>
            <span className={`text-sm font-mono font-bold ${getTextColor()}`}>{progress}%</span>
         </div>
         
         {/* Main Bar Container */}
         <div className="h-3 w-full bg-black/60 border border-gray-700 rounded-full overflow-hidden backdrop-blur-md p-[2px]">
            {/* Filled Bar */}
            <div 
                className={`h-full rounded-full transition-all duration-200 ease-out shadow-[0_0_15px_rgba(34,211,238,0.6)] ${getColor()}`}
                style={{ width: `${progress}%` }}
            ></div>
         </div>
         
         <div className="flex justify-between text-[9px] text-gray-500 font-mono px-1">
            <span>REQ: 65% MATCH</span>
            <span>STATUS: {progress >= 65 ? 'LOCKED' : 'SCANNING'}</span>
         </div>
      </div>


      {/* Status Badge */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
         <div className={`bg-black/80 backdrop-blur border px-6 py-2 rounded-full flex items-center gap-3 transition-colors duration-300 ${progress >= 65 ? 'border-green-500/50' : 'border-cyan-500/30'}`}>
            <div className="relative w-2 h-2">
                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${progress >= 65 ? 'bg-green-400' : 'bg-cyan-400'}`}></div>
                <div className={`relative w-2 h-2 rounded-full ${progress >= 65 ? 'bg-green-500' : 'bg-cyan-500'}`}></div>
            </div>
            <span className={`font-mono text-xs font-bold tracking-[0.2em] ${progress >= 65 ? 'text-green-400' : 'text-cyan-400'}`}>
                {progress >= 65 ? 'ACQUIRING...' : 'SEARCHING TARGET'}
            </span>
         </div>
      </div>

      <style>{`
        @keyframes scan-vertical {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};