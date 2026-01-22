import { ARAnalysis } from "../types";

/**
 * LOCAL COMPUTER VISION SERVICE
 * Menggantikan AI dengan algoritma pengenalan bentuk sederhana (Edge Detection).
 * Mendeteksi kompleksitas visual (tepi & kontras) untuk mensimulasikan pengenalan objek.
 */

export const analyzeImage = async (base64Image: string): Promise<ARAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ detected: false, matchPercentage: 0 });
        return;
      }

      // 1. Resize gambar agar proses ringan
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      
      // Draw gambar ke canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // 2. Ambil data pixel
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      let edgeScore = 0;
      
      // 3. Algoritma Deteksi Tepi Sederhana
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size - 1; x++) {
          const i = (y * size + x) * 4;
          
          // Konversi ke Grayscale
          const brightness1 = (data[i] + data[i+1] + data[i+2]) / 3;
          const brightness2 = (data[i+4] + data[i+5] + data[i+6]) / 3;
          
          // Hitung selisih kontras
          const diff = Math.abs(brightness1 - brightness2);
          
          // Akumulasi skor
          edgeScore += diff;
        }
      }

      // Normalisasi skor (Rata-rata perbedaan per pixel)
      const averageEdgeScore = edgeScore / (size * size);
      
      // 4. LOGIKA BARU: TARGET 65%
      // Kita tentukan skor "Sempurna" (100%) adalah 18 (Gambar sangat detail/kontras tinggi)
      const MAX_COMPLEXITY_SCORE = 18; 
      
      // Hitung persentase berdasarkan skor visual saat ini
      let percentage = (averageEdgeScore / MAX_COMPLEXITY_SCORE) * 100;
      
      // Cap di 100% dan Floor di 0%
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;

      // Ambang Batas (Threshold) untuk memicu AR
      // Sesuai permintaan: Hanya muncul jika kemiripan >= 65%
      const REQUIRED_MATCH_PERCENTAGE = 65;
      
      const isDetected = percentage >= REQUIRED_MATCH_PERCENTAGE;

      setTimeout(() => {
          resolve({ 
              detected: isDetected,
              matchPercentage: Math.floor(percentage)
          });
      }, 100);
    };

    img.onerror = () => {
        resolve({ detected: false, matchPercentage: 0 });
    };

    img.src = base64Image;
  });
};