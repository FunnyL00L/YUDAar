import React, { useState, useEffect } from 'react';
import { Trophy, Lock, XCircle, User, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { validateTokenAPI, getQuestionsAPI, submitScoreAPI } from '../services/quizService';
import { StudentData, QuizQuestion } from '../types';

interface QuizOverlayProps {
    onClose: () => void;
}

type QuizStage = 'TOKEN' | 'LOADING' | 'CONFIRM' | 'PLAYING' | 'RESULT';

export const QuizOverlay: React.FC<QuizOverlayProps> = ({ onClose }) => {
    // STATE
    const [stage, setStage] = useState<QuizStage>('TOKEN');
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [loadingMsg, setLoadingMsg] = useState("");
    
    const [student, setStudent] = useState<StudentData | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [maxPossibleScore, setMaxPossibleScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // EFFECT: SUBMIT SCORE WHEN RESULT STAGE IS REACHED
    useEffect(() => {
        if (stage === 'RESULT' && student && token) {
            const submit = async () => {
                setIsSubmitting(true);
                // Menggunakan gameId dari data siswa jika ada, default ke YUDA_AR
                const gameId = student.gameId || "YUDA_AR";
                await submitScoreAPI(token, score, gameId);
                setIsSubmitting(false);
            };
            submit();
        }
    }, [stage, student, token, score]);

    // HANDLERS
    const handleCheckToken = async () => {
        if (!token) {
            setError("Mohon isi token terlebih dahulu.");
            return;
        }

        setStage('LOADING');
        setLoadingMsg("Memeriksa Token...");
        setError("");

        try {
            const studentData = await validateTokenAPI(token);
            setStudent(studentData);
            setStage('CONFIRM');
        } catch (err: any) {
            setStage('TOKEN');
            setError(err.message || "Terjadi kesalahan koneksi.");
        }
    };

    const handleStartQuiz = async () => {
        setStage('LOADING');
        setLoadingMsg("Mengunduh Soal...");
        
        try {
            // Menggunakan gameId dari data siswa jika ada, default ke YUDA_AR
            const gameId = student?.gameId || "YUDA_AR";
            const data = await getQuestionsAPI(gameId);
            
            setQuestions(data);
            
            // Hitung total skor maksimal
            const totalPoints = data.reduce((acc, q) => acc + (q.points || 10), 0);
            setMaxPossibleScore(totalPoints);

            setScore(0);
            setCurrentQIndex(0);
            setStage('PLAYING');
        } catch (err: any) {
            setStage('CONFIRM');
            alert(`Gagal memuat soal: ${err.message}`);
        }
    };

    const handleAnswer = (isCorrect: boolean) => {
        const currentQuestion = questions[currentQIndex];
        
        if (isCorrect) {
            // Gunakan poin dari database, fallback ke 10 jika error
            const pointsAwarded = currentQuestion.points || 10;
            setScore(s => s + pointsAwarded); 
        }

        // Delay for visual feedback
        setTimeout(() => {
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
            } else {
                setStage('RESULT');
            }
        }, 300);
    };

    // RENDERERS
    const renderTokenInput = () => (
        <div className="animate-fade-in w-full">
            <div className="bg-black/40 p-4 rounded-xl border border-gray-700 mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Masukkan Token Akses</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 outline-none text-sm font-mono placeholder-gray-600 uppercase"
                        placeholder="TOKEN SISWA"
                    />
                </div>
                {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><XCircle className="w-3 h-3" /> {error}</p>}
                <p className="text-gray-600 text-[10px] mt-2 italic">*Contoh: X7K9P2</p>
            </div>
            <button onClick={handleCheckToken} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                LANJUTKAN <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderLoading = () => (
        <div className="py-10 flex flex-col items-center animate-fade-in">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-300 text-sm font-mono animate-pulse">{loadingMsg}</p>
        </div>
    );

    const renderConfirm = () => (
        <div className="animate-fade-in text-center w-full">
            <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center border-2 border-orange-500 mb-4">
                <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Selamat Datang</h3>
            <h2 className="text-2xl font-bold text-white mb-2">{student?.name}</h2>
            {student?.className && <p className="text-orange-400 text-sm font-mono mb-6">{student.className}</p>}
            
            <div className="bg-gray-800/50 p-3 rounded-lg mb-6 border border-gray-700">
                <p className="text-gray-400 text-xs">Siap mengerjakan kuis tentang<br/><strong className="text-orange-400">Sejarah Monumen Yudha Mandala?</strong></p>
                {student?.gameId === 'SARCO_AR' && (
                     <p className="text-xs text-red-400 mt-2 font-mono">Mode: SARCOPHAGUS (Warning: App Mismatch?)</p>
                )}
            </div>

            <button onClick={handleStartQuiz} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 mb-3">
                MULAI MENGERJAKAN
            </button>
            <button onClick={() => setStage('TOKEN')} className="text-gray-500 text-xs hover:text-white underline">
                Bukan nama Anda? Ganti Token
            </button>
        </div>
    );

    const renderPlaying = () => {
        if (questions.length === 0) return null;
        const q = questions[currentQIndex];
        return (
            <div className="animate-fade-in w-full text-left">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <span className="text-orange-500 text-xs font-bold">SOAL {currentQIndex + 1}/{questions.length}</span>
                    <span className="text-gray-500 text-xs font-mono">Score: {score}</span>
                </div>
                
                <p className="text-white font-medium text-lg mb-6 leading-relaxed">{q.question}</p>
                
                <div className="space-y-3">
                    {q.options.map((opt) => (
                        <button 
                            key={opt.id}
                            onClick={() => handleAnswer(opt.isCorrect)}
                            className="w-full p-4 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent hover:border-orange-500/50 transition-all text-sm text-left active:scale-95 flex items-center gap-3"
                        >
                            <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-600">{opt.id}</span>
                            {opt.text}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderResult = () => {
        // Calculate percentage for display based on dynamic max score
        const finalPercentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;
        const isPass = finalPercentage >= 70;

        return (
            <div className="animate-fade-in text-center w-full">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isPass ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                    {isPass ? <Trophy className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-1">{score} <span className="text-base text-gray-400">/ {maxPossibleScore}</span></h2>
                <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${isPass ? 'text-green-500' : 'text-red-500'}`}>
                    {isPass ? 'Lulus Kuis' : 'Belum Lulus'}
                </p>

                {isSubmitting ? (
                    <p className="text-xs text-orange-400 animate-pulse mb-6">Menyimpan nilai ke server...</p>
                ) : (
                    <p className="text-xs text-gray-500 mb-6">Nilai telah disimpan.</p>
                )}

                <div className="bg-gray-800 p-4 rounded-xl mb-6 text-left text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between"><span>Nama:</span> <span className="text-white">{student?.name}</span></div>
                    <div className="flex justify-between"><span>Poin Total:</span> <span className="text-white">{score}</span></div>
                    <div className="flex justify-between"><span>Total Soal:</span> <span className="text-white">{questions.length} Soal</span></div>
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm">
                        Tutup
                    </button>
                    <button onClick={handleStartQuiz} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Ulangi
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 pb-24 sm:pb-6 animate-fade-in">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-orange-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[80vh] overflow-y-auto mb-10 sm:mb-0">
                {/* HEADER (Hide on result to focus on score) */}
                {stage !== 'RESULT' && (
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Kuis Sejarah</h2>
                    </div>
                )}

                {/* CONTENT */}
                <div className="min-h-[200px] flex items-center w-full">
                    {stage === 'TOKEN' && renderTokenInput()}
                    {stage === 'LOADING' && renderLoading()}
                    {stage === 'CONFIRM' && renderConfirm()}
                    {stage === 'PLAYING' && renderPlaying()}
                    {stage === 'RESULT' && renderResult()}
                </div>

                {/* FOOTER CLOSE (Except Result which has own buttons) */}
                {stage !== 'RESULT' && stage !== 'LOADING' && (
                    <button onClick={onClose} className="mt-6 text-gray-500 text-sm hover:text-white w-full py-2 pb-4">
                        Batalkan
                    </button>
                )}
            </div>
        </div>
    );
};