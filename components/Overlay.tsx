import React from 'react';
import { ARAnalysis } from '../types';

interface OverlayProps {
  data: ARAnalysis;
  onReset: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ data, onReset }) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end pb-24 px-4 sm:pb-8 bg-gradient-to-t from-black/80 via-transparent to-transparent">
      {/* Augmented Reality "HUD" Lines */}
      <div className="absolute top-0 left-0 w-full h-full p-6 opacity-30">
        <div className="w-full h-full border border-cyan-400 rounded-lg relative">
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 -mt-0.5 -ml-0.5"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 -mt-0.5 -mr-0.5"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 -mb-0.5 -ml-0.5"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 -mb-0.5 -mr-0.5"></div>
           <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>
      </div>

      {/* Info Card */}
      <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white shadow-2xl animate-slide-up transform transition-all duration-500">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">{data.category}</span>
            <h2 className="text-2xl font-bold font-sans mt-1">{data.title}</h2>
          </div>
          {data.estimatedValue && (
            <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
              <span className="text-green-400 text-xs font-bold">{data.estimatedValue}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {data.description}
        </p>

        <div className="bg-cyan-900/30 border-l-2 border-cyan-500 p-3 mb-6">
          <p className="text-cyan-200 text-xs italic">
            <span className="font-bold not-italic mr-1">Fun Fact:</span>
            {data.funFact}
          </p>
        </div>

        <button 
          onClick={onReset}
          className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
        >
          Scan New Object
        </button>
      </div>
    </div>
  );
};
