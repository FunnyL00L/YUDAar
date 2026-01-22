import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { ARObject } from './components/ARObject';
import { ScannerEffect } from './components/ScannerEffect';
import { analyzeImage } from './services/geminiService'; // Now acts as Local Vision Service
import { ViewMode, MONUMENT_INFO } from './types';
import { Camera, Info, ChevronLeft, MapPin, BookOpen, Trophy, Download, Lock, CheckCircle, Sword, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.SPLASH);
  const [isTargetFound, setIsTargetFound] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0-100%
  
  // Quiz State
  const [quizToken, setQuizToken] = useState("");
  const [isQuizUnlocked, setIsQuizUnlocked] = useState(false);
  const [quizError, setQuizError] = useState("");

  const isProcessingRef = useRef(false);

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
    // Logic: Only process in SCAN mode.
    if (isProcessingRef.current || (view !== ViewMode.SCAN && view !== ViewMode.INFO && view !== ViewMode.QUIZ)) return;
    
    if (view !== ViewMode.SCAN) return;

    isProcessingRef.current = true;
    
    try {
      // Now calls local vision analysis (fast)
      const data = await analyzeImage(imageData);
      
      // Update visual progress bar (use 0 if undefined)
      setScanProgress(data.matchPercentage || 0);

      // Real-time Update: Show if Detected, Hide if Lost
      if (data.detected) {
        setIsTargetFound(true);
      } else {
        setIsTargetFound(false);
      }
    } catch (error) {
      console.error("Vision error:", error);
      setIsTargetFound(false);
      setScanProgress(0);
    } finally {
      isProcessingRef.current = false;
    }
  }, [view]);

  // -- AUTO SCAN LOOP (FASTER NOW) --
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (view === ViewMode.SCAN) {
      // Karena sekarang pakai Local Vision (ringan), kita bisa scan setiap 300ms
      // Ini membuat efek "Muncul/Hilang" terasa instan.
      intervalId = setInterval(() => {
        if (!isProcessingRef.current) triggerCapture();
      }, 300); 
    }
    return () => clearInterval(intervalId);
  }, [view]);

  // -- HELPERS --
  const checkToken = () => {
    if (quizToken.trim().toUpperCase() === "MERDEKA" || quizToken === "1234") {
        setIsQuizUnlocked(true);
        setQuizError("");
    } else {
        setQuizError("Token salah! Hubungi admin.");
    }
  };

  const closeOverlay = () => {
    setView(ViewMode.SCAN);
    setQuizToken("");
    setIsQuizUnlocked(false);
    setQuizError("");
  };


  // -- RENDERERS --

  const renderSplash = () => (
    <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-fade-in">
        <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-2 border-4 border-white rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sword className="w-12 h-12 text-white -rotate-45" />
            </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest mb-2">YUDAMANDALA<span className="text-orange-500">AR</span></h1>
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase animate-pulse">Initializing Vision System...</p>
        
        <div className="absolute bottom-10 flex flex-col items-center">
            <span className="text-gray-600 text-[10px] uppercase tracking-widest mb-1">Powered by</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-white font-bold tracking-wider">TRIGANTALAPATI STUDIO</span>
            </div>
        </div>
    </div>
  );

  const renderHome = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1552422538-23218579d4ba?q=80&w=1080&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 animate-fade-in">
        
        <div className="relative w-32 h-32 mb-8 group cursor-pointer" onClick={() => setView(ViewMode.SCAN)}>
            <div className="absolute inset-0 bg-orange-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-full border-4 border-orange-500 flex items-center justify-center shadow-[0_0_50px_rgba(234,88,12,0.6)] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="relative z-10 flex items-center justify-center">
                    <Shield className="w-20 h-20 text-gray-800 absolute" fill="#333" />
                    <Sword className="w-16 h-16 text-orange-500 relative z-10 -rotate-45 drop-shadow-[0_2px_8px_rgba(249,115,22,0.8)]" strokeWidth={2.5} />
                </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-orange-600 text-[10px] font-black px-3 py-1 rounded-full tracking-widest border border-orange-500 shadow-lg whitespace-nowrap">
                TAP TO START
            </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 text-center">Yudamandala<span className="text-orange-500">AR</span></h1>
        <p className="text-gray-400 text-center mb-10 text-sm">Monumen Yudha Mandala, Buleleng</p>

        <button onClick={() => setView(ViewMode.SCAN)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg mb-4 ring-1 ring-orange-400/50">
          <Camera className="w-5 h-5" />
          MULAI SCAN AR
        </button>

        <div className="grid grid-cols-2 gap-4 w-full">
           <button onClick={() => setView(ViewMode.ABOUT)} className="glass-panel text-white py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
              <BookOpen className="w-6 h-6 text-orange-400" />
              <span className="text-xs font-bold tracking-wider">TENTANG</span>
           </button>
           <button onClick={() => { setIsTargetFound(true); setView(ViewMode.QUIZ); }} className="glass-panel text-white py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
              <Trophy className="w-6 h-6 text-orange-400" />
              <span className="text-xs font-bold tracking-wider">KUIS</span>
           </button>
        </div>
      </div>
    </div>
  );

  const renderInfoOverlay = () => (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900/95 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="h-24 bg-orange-900/50 relative overflow-hidden flex items-end p-4 border-b border-orange-500/30">
            <h2 className="text-xl font-bold text-white relative z-10">{MONUMENT_INFO.title}</h2>
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <MapPin className="w-12 h-12 text-white" />
            </div>
        </div>
        <div className="p-6">
            <div className="flex items-start gap-3 mb-6 bg-white/5 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                <div>
                    <h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Lokasi</h3>
                    <p className="text-white text-sm font-medium">{MONUMENT_INFO.location}</p>
                </div>
            </div>
            
            <div className="mb-6">
                 <h3 className="text-gray-400 text-[10px] uppercase font-bold mb-2 tracking-wider">Sejarah Singkat</h3>
                 <p className="text-gray-300 text-sm leading-relaxed text-justify">{MONUMENT_INFO.history}</p>
            </div>

            <a href={MONUMENT_INFO.flipbookUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-orange-600/20 border border-orange-500/50 text-orange-400 py-3 rounded-xl font-bold text-sm mb-4 hover:bg-orange-600 hover:text-white transition-all">
                <Download className="w-4 h-4" />
                DOWNLOAD FLIPBOOK SEJARAH
            </a>

            <button onClick={closeOverlay} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors text-sm">
                Tutup Informasi
            </button>
        </div>
      </div>
    </div>
  );

  const renderQuizOverlay = () => (
     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
        <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 text-center border border-orange-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Kuis Sejarah</h2>
            <p className="text-gray-400 text-xs mb-6">Monumen Yudha Mandala Buleleng</p>
            
            {!isQuizUnlocked ? (
                // TOKEN INPUT STATE
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-black/40 p-4 rounded-xl border border-gray-700">
                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Masukkan Token Akses</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={quizToken}
                                    onChange={(e) => setQuizToken(e.target.value)}
                                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 outline-none text-sm font-mono placeholder-gray-600"
                                    placeholder="Ex: MERDEKA"
                                />
                            </div>
                        </div>
                        {quizError && <p className="text-red-500 text-xs mt-2 text-left">{quizError}</p>}
                    </div>
                    <button onClick={checkToken} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                        MULAI KUIS
                    </button>
                    <button onClick={closeOverlay} className="w-full text-gray-500 text-sm py-2 hover:text-white">Batal</button>
                </div>
            ) : (
                // QUIZ QUESTION STATE
                <div className="animate-fade-in">
                     <div className="text-left mb-6">
                        <span className="text-orange-500 text-xs font-bold">PERTANYAAN 1/3</span>
                        <p className="text-white font-medium mt-2 text-lg">Apa makna bambu runcing pada patung Yudha Mandala?</p>
                     </div>
                     
                     <div className="space-y-3 mb-6">
                        <button onClick={() => alert("Kurang Tepat!")} className="w-full p-4 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent hover:border-gray-500 transition-all text-sm text-left">
                            A. Keindahan Seni
                        </button>
                        <button onClick={() => alert("Benar! Melambangkan keberanian.")} className="w-full p-4 rounded-xl bg-gray-800 text-gray-300 hover:bg-green-900/30 border border-transparent hover:border-green-500 transition-all text-sm text-left flex justify-between items-center group">
                            B. Semangat Perjuangan Rakyat
                            <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 text-green-500" />
                        </button>
                        <button onClick={() => alert("Kurang Tepat!")} className="w-full p-4 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent hover:border-gray-500 transition-all text-sm text-left">
                            C. Hiasan Taman
                        </button>
                     </div>

                     <button onClick={closeOverlay} className="text-gray-500 text-sm hover:text-white underline">
                        Keluar dari Kuis
                     </button>
                </div>
            )}
        </div>
     </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* 1. Camera (Always Active for AR background) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${view === ViewMode.HOME || view === ViewMode.SPLASH ? 'opacity-0' : 'opacity-100'}`}>
         <CameraFeed onCapture={handleImageCapture} isPaused={view === ViewMode.HOME || view === ViewMode.SPLASH} />
      </div>

      {/* 2. AR Layers (Only visible in Scan/Info/Quiz) */}
      {(view === ViewMode.SCAN || view === ViewMode.INFO || view === ViewMode.QUIZ) && (
        <>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 z-40 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button onClick={() => { setIsTargetFound(false); setView(ViewMode.HOME); }} className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="bg-orange-500/20 border border-orange-500/50 px-4 py-1.5 rounded-full backdrop-blur">
                    <span className="text-orange-400 text-xs font-mono font-bold tracking-widest">{isTargetFound ? 'TARGET LOCKED' : 'SEARCHING...'}</span>
                </div>
                <div className="w-10"></div>
            </div>

            {/* 3D Scene */}
            {isTargetFound ? <ARObject /> : <ScannerEffect isLocked={false} progress={scanProgress} />}

            {/* Bottom Interaction Bar (Visible only when found and NO overlay active) */}
            {isTargetFound && view === ViewMode.SCAN && (
                <div className="absolute bottom-8 left-0 w-full px-6 z-40 flex gap-4 justify-center animate-fade-in">
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
      {view === ViewMode.QUIZ && renderQuizOverlay()}
      
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