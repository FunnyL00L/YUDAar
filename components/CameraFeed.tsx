import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface CameraFeedProps {
  onCapture: (imageData: string) => void;
  shouldActive: boolean; // Controls whether camera SHOULD be on (lifecycle)
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, shouldActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Function to stop all tracks
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Function to Start Camera
  const startCamera = async () => {
    if (stream) return; // Already running

    setIsInitializing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setPermissionGranted(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure promise play is handled
        videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Izin kamera diperlukan untuk fitur AR.");
      setPermissionGranted(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Lifecycle Effect
  useEffect(() => {
    if (shouldActive) {
      // Only auto-start if permission was previously granted in this session
      // Otherwise, we wait for user to click the button in the UI
      if (permissionGranted) {
          startCamera();
      }
    } else {
      // If we leave the scan area, stop the camera to save battery/privacy
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldActive]);

  // Re-attach stream to video element if stream exists but video is blank (e.g. after tab switch)
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.log(e));
    }
  }, [stream]);

  // If component is inactive, render nothing (or just black background)
  if (!shouldActive) {
    return <div className="fixed inset-0 bg-black z-0" />;
  }

  // PERMISSION UI: If active but no stream/permission
  if (!stream && !isInitializing) {
      return (
        <div className="fixed inset-0 w-full h-full bg-black z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Camera className="w-8 h-8 text-orange-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Akses Kamera Diperlukan</h2>
             <p className="text-gray-400 text-sm mb-8 max-w-xs">
                Untuk memindai Monumen dan menampilkan konten AR, aplikasi memerlukan izin akses kamera Anda.
             </p>
             <button 
                onClick={startCamera}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
             >
                IZINKAN AKSES KAMERA
             </button>
             {error && <p className="text-red-500 text-xs mt-4 bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}
        </div>
      );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0">
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Capture trigger wrapper */}
      <div className="hidden">
         <button id="capture-trigger" onClick={() => {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                
                const MAX_WIDTH = 512;
                const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
                
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    onCapture(dataUrl);
                }
            }
         }} />
      </div>
    </div>
  );
};