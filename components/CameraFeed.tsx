import React, { useEffect, useRef, useState } from 'react';

interface CameraFeedProps {
  onCapture: (imageData: string) => void;
  isPaused: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log("Play interrupted", e));
      }
    }
  }, [isPaused]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-4 text-center">
          <p>{error}</p>
        </div>
      )}
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${isPaused ? 'opacity-50 blur-sm' : 'opacity-100'}`}
      />
      
      {/* Capture trigger wrapper */}
      <div className="hidden">
         <button id="capture-trigger" onClick={() => {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                
                // Downscale image to max 512px width to reduce payload size and prevent XHR/RPC errors
                const MAX_WIDTH = 512;
                const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
                
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    // Use 0.7 quality to further optimize
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    onCapture(dataUrl);
                }
            }
         }} />
      </div>
    </div>
  );
};