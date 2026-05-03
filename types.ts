
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
  ABOUT = 'ABOUT',
  MARKER = 'MARKER' 
}

export interface MonumentData {
  title: string;
  location: string;
  description: string;
  history: string;
  flipbookUrl: string;
}

// --- QUIZ TYPES ---
export interface QuizOption {
    id: string; // A, B, C, or D
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id: number | string;
    question: string;
    points: number;
    options: QuizOption[];
}

export interface StudentData {
    name: string;
    token: string;
    className?: string;
    gameId?: string; 
}

// Default fallback data jika API gagal
export const DEFAULT_MONUMENT_INFO: MonumentData = {
  title: "Monumen Yudha Mandala",
  location: "Buleleng, Bali",
  description: "Monumen perjuangan rakyat Buleleng melawan penjajah.",
  history: "Monumen Yudha Mandala Utama di Buleleng didirikan untuk mengenang jasa para pahlawan yang gugur dalam mempertahankan kemerdekaan. Patung ini menggambarkan sosok pejuang gagah berani memegang bambu runcing/senjata, menyimbolkan semangat 'Puputan' rakyat Bali Utara.",
  flipbookUrl: "https://example.com/sejarah-yudha-mandala.pdf" 
};