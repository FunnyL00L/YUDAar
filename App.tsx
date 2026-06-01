import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { ARObject } from './components/ARObject';
import { ScannerEffect } from './components/ScannerEffect';
import { analyzeImage } from './services/geminiService';
import { fetchContentData } from './services/contentService';
import { ViewMode, MonumentData, DEFAULT_MONUMENT_INFO } from './types';
import { QuizOverlay } from './components/QuizOverlay';
import { Info, ChevronLeft, MapPin, BookOpen, Trophy, Download, Smartphone, MonitorX, Eye, Image as ImageIcon, X, Move, Maximize } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.SPLASH);
  const [isTargetFound, setIsTargetFound] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [monumentInfo, setMonumentInfo] = useState<MonumentData>(DEFAULT_MONUMENT_INFO);
  
  // Mobile Detection State
  const [isMobile, setIsMobile] = useState(true);
  const [bypassMobileCheck, setBypassMobileCheck] = useState(false);

  const isProcessingRef = useRef(false);

  // -- FETCH CONTENT DATA --
  useEffect(() => {
    const initData = async () => {
        const data = await fetchContentData();
        if (data) {
            setMonumentInfo(data);
        }
    };
    initData();
  }, []);

  // -- MOBILE DETECTION & LOCK SYSTEM --
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|iPad|iPhone|iPod/i.test(userAgent) || window.innerWidth <= 1024;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // -- SPLASH SCREEN LOGIC --
  useEffect(() => {
    if (view === ViewMode.SPLASH) {
      const timer = setTimeout(() => {
        setView(ViewMode.HOME);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // -- CAPTURE LOGIC --
  const triggerCapture = () => {
    const btn = document.getElementById('capture-trigger');
    if (btn) btn.click();
  };

  const handleImageCapture = useCallback(async (imageData: string) => {
    if (isProcessingRef.current || (view !== ViewMode.SCAN && view !== ViewMode.INFO && view !== ViewMode.QUIZ)) return;
    
    // Stop scanning if target found
    if (isTargetFound) return; 
    
    if (view !== ViewMode.SCAN) return;

    isProcessingRef.current = true;
    
    try {
      const data = await analyzeImage(imageData);
      setScanProgress(data.matchPercentage || 0);

      if (data.detected && !isTargetFound) {
        setIsTargetFound(true);
      }
      
    } catch (error) {
      console.error("Vision error:", error);
      setScanProgress(0);
    } finally {
      isProcessingRef.current = false;
    }
  }, [view, isTargetFound]);

  // -- AUTO SCAN LOOP --
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    // Hanya scan jika view SCAN dan Target belum ketemu
    if (view === ViewMode.SCAN && !isTargetFound) {
      intervalId = setInterval(() => {
        if (!isProcessingRef.current) triggerCapture();
      }, 200); 
    }
    return () => clearInterval(intervalId);
  }, [view, isTargetFound]);


  const resetScan = () => {
      setIsTargetFound(false);
      setScanProgress(0);
      setView(ViewMode.HOME);
  }

  // -- BLOCKER --
  if (!isMobile && !bypassMobileCheck) {
    return (
      <div className="w-full h-screen bg-[#111] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-8 border border-gray-700 shadow-2xl animate-pulse">
            <MonitorX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Perangkat Tidak Didukung</h1>
        <p className="text-gray-400 max-w-md leading-relaxed text-sm mb-8">
          Aplikasi <span className="text-orange-500 font-bold">YudamandalaAR</span> memerlukan kamera belakang dan sensor orientasi yang hanya tersedia pada Smartphone.
        </p>
        
        <div className="flex items-center gap-4 bg-gray-900 px-6 py-4 rounded-xl border border-gray-800 mb-8">
             <Smartphone className="w-6 h-6 text-green-500" />
             <div className="text-left">
                <p className="text-white text-xs font-bold uppercase tracking-wider">Gunakan Smartphone</p>
                <p className="text-gray-500 text-[10px]">Android / iOS</p>
             </div>
        </div>

        <button 
            onClick={() => setBypassMobileCheck(true)}
            className="text-gray-600 text-xs hover:text-orange-500 underline transition-colors"
        >
            Lanjutkan di Desktop (Mode Pengujian)
        </button>
      </div>
    );
  }

  const isCameraActive = view === ViewMode.SCAN || view === ViewMode.INFO || view === ViewMode.QUIZ;

  // -- RENDERERS --

  const renderSplash = () => (
    <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-fade-in">
        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            {/* STRICTLY USE /icon.png */}
            <img 
                src="/icon.png" 
                alt="Logo" 
                className="w-28 h-28 object-contain relative z-10 animate-pulse" 
            />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest mb-2">YUDAMANDALA<span className="text-orange-500">AR</span></h1>
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase animate-pulse">Initializing Vision System...</p>
    </div>
  );

  const renderHome = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
      {/* Background with Icon */}
      <div className="absolute inset-0 opacity-30 bg-[url('/icon.png')] bg-cover bg-center blur-sm transform scale-110"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 animate-fade-in">
        
        {/* START SCAN BUTTON */}
        <div className="relative w-40 h-40 mb-8 group cursor-pointer" onClick={() => { setIsTargetFound(false); setView(ViewMode.SCAN); }}>
            <div className="absolute inset-0 bg-orange-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-full border-4 border-orange-500 flex items-center justify-center shadow-[0_0_50px_rgba(234,88,12,0.6)] overflow-hidden transition-transform transform group-hover:scale-105">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <img 
                    src="/icon.png" 
                    alt="Start Scan" 
                    className="w-28 h-28 object-contain drop-shadow-[0_2px_8px_rgba(249,115,22,0.8)]" 
                />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-orange-600 text-[10px] font-black px-3 py-1 rounded-full tracking-widest border border-orange-500 shadow-lg whitespace-nowrap">
                TAP TO START
            </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 text-center">Yudamandala<span className="text-orange-500">AR</span></h1>
        <p className="text-gray-400 text-center mb-8 text-sm">{monumentInfo.title}</p>

        {/* BUTTON GRID - PROPORTIONAL */}
        <div className="grid grid-cols-2 gap-3 w-full mb-4">
           {/* MARKER BUTTON */}
           <button onClick={() => setView(ViewMode.MARKER)} className="glass-panel text-white py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95 col-span-2 border-l-4 border-l-blue-500">
              <ImageIcon className="w-6 h-6 text-blue-400" />
              <div className="flex flex-col items-center leading-none">
                 <span className="text-xs font-bold tracking-wider">LIHAT MARKER</span>
                 <span className="text-[9px] text-gray-500 mt-1">Gambar yang harus discan</span>
              </div>
           </button>

           <button onClick={() => setView(ViewMode.ABOUT)} className="glass-panel text-white py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95 flex-1">
              <BookOpen className="w-6 h-6 text-orange-400" />
              <span className="text-xs font-bold tracking-wider">TENTANG</span>
           </button>
           <button onClick={() => { setIsTargetFound(true); setView(ViewMode.QUIZ); }} className="glass-panel text-white py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95 flex-1">
              <Trophy className="w-6 h-6 text-orange-400" />
              <span className="text-xs font-bold tracking-wider">KUIS</span>
           </button>
        </div>

        {/* BUTTON LIHAT 3D (TANPA SCAN) */}
        <button 
            onClick={() => { 
                setIsTargetFound(true); // Langsung dianggap ketemu agar scanner tidak muncul
                setView(ViewMode.SCAN); 
            }} 
            className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-all w-full justify-center active:scale-95"
        >
            <Eye className="w-4 h-4 text-green-400" />
            <span className="font-bold tracking-wide">LIHAT 3D</span>
        </button>

      </div>
    </div>
  );

  const renderInfoOverlay = () => (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-28 sm:pb-4 pb-[env(safe-area-inset-bottom)] animate-fade-in">
      <div className="bg-gray-900/95 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md mb-12 sm:mb-0">
        <div className="h-24 bg-orange-900/50 relative overflow-hidden flex items-end p-4 border-b border-orange-500/30">
            <h2 className="text-xl font-bold text-white relative z-10">{monumentInfo.title}</h2>
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <MapPin className="w-12 h-12 text-white" />
            </div>
        </div>
        <div className="p-6">
            <div className="flex items-start gap-3 mb-6 bg-white/5 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                <div>
                    <h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Lokasi</h3>
                    <p className="text-white text-sm font-medium">{monumentInfo.location}</p>
                </div>
            </div>
            
            <div className="mb-6 max-h-[200px] overflow-y-auto">
                 <h3 className="text-gray-400 text-[10px] uppercase font-bold mb-2 tracking-wider">Sejarah Singkat</h3>
                 <p className="text-gray-300 text-sm leading-relaxed text-justify whitespace-pre-line">{monumentInfo.history}</p>
            </div>

            <a href={monumentInfo.flipbookUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-orange-600/20 border border-orange-500/50 text-orange-400 py-3 rounded-xl font-bold text-sm mb-4 hover:bg-orange-600 hover:text-white transition-all">
                <Download className="w-4 h-4" />
                DOWNLOAD FLIPBOOK SEJARAH
            </a>

            <button onClick={() => setView(ViewMode.SCAN)} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors text-sm">
                Tutup Informasi
            </button>
        </div>
      </div>
    </div>
  );

  // --- MARKER PREVIEW OVERLAY ---
  const renderMarkerOverlay = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6 animate-fade-in">
        <button onClick={() => setView(ViewMode.HOME)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white">
            <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-white text-xl font-bold mb-2">Target Marker</h2>
        <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">Arahkan kamera ke gambar ini untuk memunculkan objek 3D.</p>
        
        <div className="p-4 bg-white rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.2)] transform hover:scale-105 transition-transform duration-500">
            {/* Displaying icon.png as the 'marker' */}
            <img src="/icon.png" alt="Marker" className="w-64 h-64 object-contain" />
        </div>
        
        <div className="mt-8 flex gap-2 items-center text-orange-500 bg-orange-900/20 px-4 py-2 rounded-full border border-orange-500/20">
            <ImageIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Gambar Referensi</span>
        </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      <div className={`absolute inset-0 transition-opacity duration-1000 ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}>
         <CameraFeed onCapture={handleImageCapture} shouldActive={isCameraActive} />
      </div>

      {isCameraActive && (
        <>
            {/* 3D Scene - HANYA MUNCUL JIKA TARGET DITEMUKAN */}
            {isTargetFound ? (
                <ARObject data={monumentInfo} />
            ) : (
                /* Scanner Effect - HANYA MUNCUL JIKA TARGET BELUM DITEMUKAN */
                <ScannerEffect isLocked={false} progress={scanProgress} />
            )}

            {/* Top Bar with EXIT Button when 3D is Active */}
            <div className="absolute top-0 left-0 w-full p-4 z-40 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                {/* Back Button */}
                <button onClick={resetScan} className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Status Badge - Only show when scanning or if desired in 3D */}
                {!isTargetFound && (
                    <div className="bg-orange-500/20 border border-orange-500/50 px-4 py-1.5 rounded-full backdrop-blur animate-fade-in">
                        <span className="text-orange-400 text-xs font-mono font-bold tracking-widest">SEARCHING...</span>
                    </div>
                )}

                {/* EXIT BUTTON - MANDATORY IN 3D MODE */}
                {isTargetFound ? (
                     <button onClick={resetScan} className="pointer-events-auto w-10 h-10 rounded-full bg-red-600/80 backdrop-blur border border-red-400/50 flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg animate-fade-in">
                        <X className="w-6 h-6" />
                     </button>
                ) : (
                    <div className="w-10"></div>
                )}
            </div>
            
            {/* Gesture Hint when 3D is active */}
            {isTargetFound && (
                <div className="absolute top-20 right-4 flex flex-col gap-2 z-40 pointer-events-none opacity-60">
                    <div className="bg-black/40 p-2 rounded-lg backdrop-blur flex items-center gap-2">
                        <Move className="w-4 h-4 text-white" />
                        <span className="text-[10px] text-white">Geser</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg backdrop-blur flex items-center gap-2">
                        <Maximize className="w-4 h-4 text-white" />
                        <span className="text-[10px] text-white">Zoom</span>
                    </div>
                </div>
            )}

            {/* Bottom Interaction Bar - PROPORTIONAL */}
            {isTargetFound && view === ViewMode.SCAN && (
                <div className="absolute bottom-16 sm:bottom-12 pb-[env(safe-area-inset-bottom)] left-0 w-full px-6 z-40 flex gap-4 justify-center animate-fade-in">
                    <button onClick={() => setView(ViewMode.INFO)} className="flex-1 glass-panel py-4 rounded-2xl flex items-center justify-center gap-2 text-white hover:bg-white/20 active:scale-95 transition-all shadow-lg border-b-4 border-cyan-900/50">
                        <Info className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-sm tracking-wide">INFORMASI</span>
                    </button>
                    <button onClick={() => setView(ViewMode.QUIZ)} className="flex-1 glass-panel py-4 rounded-2xl flex items-center justify-center gap-2 text-white hover:bg-white/20 active:scale-95 transition-all shadow-lg border-b-4 border-yellow-900/50">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-sm tracking-wide">KUIS</span>
                    </button>
                </div>
            )}
        </>
      )}

      {/* 3. Interface Layers */}
      {view === ViewMode.SPLASH && renderSplash()}
      {view === ViewMode.HOME && renderHome()}
      {view === ViewMode.INFO && renderInfoOverlay()}
      {view === ViewMode.QUIZ && <QuizOverlay onClose={() => setView(ViewMode.SCAN)} />}
      {view === ViewMode.MARKER && renderMarkerOverlay()}
      
      {view === ViewMode.ABOUT && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Tentang Aplikasi</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">YudamandalaAR adalah media pembelajaran interaktif yang dibuat untuk melestarikan nilai sejarah Buleleng melalui teknologi modern.</p>
              <div className="mb-8">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Developed By</p>
                  <p className="text-orange-500 font-bold">TRIGANTALAPATI STUDIO</p>
              </div>
              <button onClick={() => setView(ViewMode.HOME)} className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-full text-white font-bold text-sm transition-all">Kembali</button>
          </div>
      )}

    </div>
  );
};

export default App;