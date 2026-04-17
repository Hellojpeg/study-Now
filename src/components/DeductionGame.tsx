
import React, { useState, useEffect } from 'react';
import { Question, DeductionTarget } from '../types';
import { DEDUCTION_TARGETS } from '../constants';
import { ArrowLeft, Search, HelpCircle, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface DeductionGameProps {
  questions: Question[];
  mode: 'guesswho' | 'guesswhat'; // Toggle between People and Objects
  onExit: () => void;
}

const DeductionGame: React.FC<DeductionGameProps> = ({ questions, mode, onExit }) => {
  const [target, setTarget] = useState<DeductionTarget | null>(null);
  const [cluesRevealed, setCluesRevealed] = useState<boolean[]>([false, false, false]);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  
  // Trivia State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeClueIndex, setActiveClueIndex] = useState<number | null>(null); // Which clue we are trying to unlock

  const targets = DEDUCTION_TARGETS.filter(t => mode === 'guesswho' ? t.category === 'person' : t.category === 'object');

  useEffect(() => {
    startNewRound();
  }, [mode]);

  const startNewRound = () => {
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    setTarget(randomTarget);
    setCluesRevealed([false, false, false]);
    setGameStatus('PLAYING');
    setActiveClueIndex(null);
    setCurrentQuestion(null);
  };

  const handleUnlockClue = (index: number) => {
    if (cluesRevealed[index]) return;
    setActiveClueIndex(index);
    // Pick random question
    const q = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(q);
  };

  const handleTriviaAnswer = (idx: number) => {
    if (!currentQuestion || activeClueIndex === null) return;
    
    if (idx === currentQuestion.correctAnswerIndex) {
      playSuccessSound();
      const newRevealed = [...cluesRevealed];
      newRevealed[activeClueIndex] = true;
      setCluesRevealed(newRevealed);
      setCurrentQuestion(null);
      setActiveClueIndex(null);
    } else {
      playFailureSound();
      alert("Incorrect! Try again to unlock this clue.");
      // Pick new question to prevent spamming same one
      const q = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(q);
    }
  };

  const handleGuess = (guessId: string) => {
    if (!target) return;
    
    if (guessId === target.id) {
      setGameStatus('WON');
      playSuccessSound();
      confetti({ particleCount: 200, spread: 100 });
    } else {
      playFailureSound();
      alert("Incorrect Guess! Try revealing more clues.");
    }
  };

  if (!target) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={onExit} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"><ArrowLeft/></button>
          <h1 className="text-3xl font-black text-center uppercase tracking-widest text-blue-400">
            {mode === 'guesswho' ? 'Guess Who?' : 'Guess What?'}
          </h1>
          <button onClick={startNewRound} className="px-4 py-2 bg-blue-600 rounded-lg font-bold text-sm">Skip / Next</button>
        </div>

        {/* Game Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Clues & Trivia */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                  <Search className="w-5 h-5" /> Evidence Log
                </h2>
                
                <div className="space-y-4">
                  {target.clues.map((clue, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-2 transition-all ${cluesRevealed[idx] ? 'bg-slate-700 border-green-500/50' : 'bg-slate-900 border-slate-700 border-dashed'}`}>
                      {cluesRevealed[idx] ? (
                        <div className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <p className="font-medium text-slate-200">{clue}</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUnlockClue(idx)}
                          className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-wider hover:text-blue-400"
                        >
                          <Lock className="w-4 h-4" /> Unlock Clue #{idx + 1}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
             </div>

             {/* Trivia Modal / Inline Area */}
             {currentQuestion && (
               <div className="bg-blue-900 p-6 rounded-3xl border-4 border-blue-500 animate-fadeIn">
                 <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-widest text-xs mb-4">
                    <Unlock className="w-4 h-4" /> Answer to Reveal
                 </div>
                 <h3 className="font-bold text-lg mb-4">{currentQuestion.question}</h3>
                 <div className="grid gap-2">
                    {currentQuestion.options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleTriviaAnswer(i)}
                        className="text-left p-3 rounded-lg bg-blue-800 hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
               </div>
             )}
          </div>

          {/* Right: Grid */}
          <div className="lg:col-span-2">
             {gameStatus === 'WON' ? (
                <div className="h-full flex flex-col items-center justify-center bg-green-900/20 rounded-3xl border-4 border-green-500 p-12 text-center animate-fadeIn">
                    <div className="w-64 h-64 rounded-full overflow-hidden mb-6 border-4 border-white shadow-2xl mx-auto">
                        <img src={target.image} alt={target.name} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-5xl font-black text-white mb-2">{target.name}</h2>
                    <p className="text-xl text-green-300 font-bold uppercase tracking-widest mb-8">{target.description}</p>
                    <button onClick={startNewRound} className="px-8 py-4 bg-white text-green-900 font-black rounded-xl text-xl hover:scale-105 transition-transform">Next Mystery</button>
                </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {targets.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleGuess(t.id)}
                      className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all group text-center flex flex-col items-center gap-4"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-black">
                         {/* In a real game, these might be hidden or blurred until revealed, but for guessing they are visible options */}
                         <img src={t.image} alt="?" className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="font-bold text-slate-300 group-hover:text-white text-sm">{t.name}</div>
                    </button>
                  ))}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeductionGame;
