
export interface ARAnalysis {
  detected: boolean;
  matchPercentage?: number; // 0 - 100
  category?: string;
  title?: string;
  estimatedValue?: string;
  description?: string;
  funFact?: string;
}

export enum ViewMode {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  SCAN = 'SCAN',
  INFO = 'INFO',
  QUIZ = 'QUIZ',
  ABOUT = 'ABOUT'
}

export interface MonumentData {
  title: string;
  location: string;
  description: string;
  history: string;
  flipbookUrl: string;
}

export const MONUMENT_INFO: MonumentData = {
  title: "Monumen Yudha Mandala",
  location: "Buleleng, Bali",
  description: "Monumen perjuangan rakyat Buleleng melawan penjajah.",
  history: "Monumen Yudha Mandala Utama di Buleleng didirikan untuk mengenang jasa para pahlawan yang gugur dalam mempertahankan kemerdekaan. Patung ini menggambarkan sosok pejuang gagah berani memegang bambu runcing/senjata, menyimbolkan semangat 'Puputan' rakyat Bali Utara.",
  flipbookUrl: "https://example.com/sejarah-yudha-mandala.pdf" 
};
