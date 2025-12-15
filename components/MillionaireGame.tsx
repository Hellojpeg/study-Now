
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, Phone, Users, Divide, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface MillionaireGameProps {
  questions: Question[];
  onExit: () => void;
}

const MONEY_LADDER = [
    100, 200, 300, 500, 1000, 
    2000, 4000, 8000, 16000, 32000, 
    64000, 125000, 250000, 500000, 1000000
];

const MillionaireGame: React.FC<MillionaireGameProps> = ({ questions, onExit }) => {
  const [level, setLevel] = useState(0);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  
  // Lifelines
  const [lifelines, setLifelines] = useState({ fifty: true, phone: true, audience: true, swap: true });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); // Indices to hide

  useEffect(() => {
      // Pick random question for the level
      pickQuestion();
  }, [level]);

  const pickQuestion = () => {
      const q = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQ(q);
      setHiddenOptions([]);
  };

  const handleAnswer = (idx: number) => {
      if (!currentQ) return;
      
      if (idx === currentQ.correctAnswerIndex) {
          playSuccessSound();
          if (level === MONEY_LADDER.length - 1) {
              setGameState('WON');
              confetti({ particleCount: 500, spread: 360 });
          } else {
              setLevel(prev => prev + 1);
          }
      } else {
          playFailureSound();
          setGameState('LOST');
      }
  };

  const useFiftyFifty = () => {
      if (!currentQ || !lifelines.fifty) return;
      const wrongIndices = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctAnswerIndex);
      // Hide 2 wrong answers
      const toHide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      setHiddenOptions(toHide);
      setLifelines(prev => ({ ...prev, fifty: false }));
  };

  const usePhoneFriend = () => {
      if (!currentQ || !lifelines.phone) return;
      alert(`Simulation: Your friend thinks the answer is likely "${currentQ.options[currentQ.correctAnswerIndex]}" (80% sure).`);
      setLifelines(prev => ({ ...prev, phone: false }));
  };

  const useAudience = () => {
      if (!currentQ || !lifelines.audience) return;
      alert(`Simulation: The audience voted.\n${currentQ.options[currentQ.correctAnswerIndex]}: 65%\nOthers: Mixed.`);
      setLifelines(prev => ({ ...prev, audience: false }));
  };

  const useSwapQuestion = () => {
      if (!lifelines.swap) return;
      pickQuestion(); // Re-roll
      setLifelines(prev => ({ ...prev, swap: false }));
  };

  if (!currentQ) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white font-sans flex flex-col items-center justify-center p-4">
        {gameState === 'WON' ? (
             <div className="text-center animate-bounce">
                 <h1 className="text-6xl font-black text-yellow-400 mb-6">MILLIONAIRE!</h1>
                 <p className="text-2xl mb-8">You answered all 15 questions correctly.</p>
                 <button onClick={onExit} className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl text-xl">Collect Prize</button>
             </div>
        ) : gameState === 'LOST' ? (
             <div className="text-center">
                 <h1 className="text-6xl font-black text-red-500 mb-6">GAME OVER</h1>
                 <p className="text-2xl mb-8">You walk away with: ${level > 0 ? MONEY_LADDER[level-1] : 0}</p>
                 <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl text-xl">Try Again</button>
             </div>
        ) : (
            <div className="w-full max-w-6xl grid lg:grid-cols-4 gap-6">
                {/* Main Game Area */}
                <div className="lg:col-span-3 flex flex-col justify-end min-h-[80vh]">
                     
                     {/* Image Display */}
                     {currentQ.image && (
                         <div className="mb-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl mx-auto w-full max-w-md h-64">
                             <img src={currentQ.image} alt="Question Visual" className="w-full h-full object-cover" />
                         </div>
                     )}

                     {/* Question */}
                     <div className="bg-blue-900 border-2 border-white/30 p-8 rounded-full text-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                         <h2 className="text-2xl font-bold">{currentQ.question}</h2>
                     </div>

                     {/* Options */}
                     <div className="grid grid-cols-2 gap-4">
                         {currentQ.options.map((opt, i) => (
                             <button 
                                key={i}
                                onClick={() => handleAnswer(i)}
                                disabled={hiddenOptions.includes(i)}
                                className={`
                                    p-6 rounded-full border-2 border-white/30 text-left font-bold text-lg hover:bg-yellow-600 hover:text-black transition-colors relative
                                    ${hiddenOptions.includes(i) ? 'opacity-0 pointer-events-none' : 'bg-black/50'}
                                `}
                             >
                                 <span className="text-yellow-500 mr-2">{String.fromCharCode(65+i)}:</span> {opt}
                             </button>
                         ))}
                     </div>
                </div>

                {/* Sidebar (Ladder & Lifelines) */}
                <div className="lg:col-span-1 flex flex-col-reverse lg:flex-col gap-6">
                    {/* Lifelines */}
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={useFiftyFifty} disabled={!lifelines.fifty} className="aspect-square bg-blue-950 rounded-lg border border-white/30 flex items-center justify-center hover:bg-blue-800 disabled:opacity-20" title="50:50">
                            <Divide className="w-5 h-5" />
                        </button>
                        <button onClick={usePhoneFriend} disabled={!lifelines.phone} className="aspect-square bg-blue-950 rounded-lg border border-white/30 flex items-center justify-center hover:bg-blue-800 disabled:opacity-20" title="Phone a Friend">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button onClick={useAudience} disabled={!lifelines.audience} className="aspect-square bg-blue-950 rounded-lg border border-white/30 flex items-center justify-center hover:bg-blue-800 disabled:opacity-20" title="Ask Audience">
                            <Users className="w-5 h-5" />
                        </button>
                        <button onClick={useSwapQuestion} disabled={!lifelines.swap} className="aspect-square bg-blue-950 rounded-lg border border-white/30 flex items-center justify-center hover:bg-blue-800 disabled:opacity-20" title="Switch Question">
                            <Repeat className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Ladder */}
                    <div className="bg-blue-950/50 p-4 rounded-xl border border-white/10 flex-grow flex flex-col-reverse justify-center gap-1">
                        {MONEY_LADDER.map((amt, i) => (
                            <div key={i} className={`flex justify-between px-2 py-1 rounded ${i === level ? 'bg-orange-500 text-black font-bold scale-105' : i < level ? 'text-green-400' : 'text-orange-200'}`}>
                                <span className="text-xs w-6">{i+1}</span>
                                <span>${amt.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={onExit} className="text-slate-400 hover:text-white text-sm text-center">Walk Away</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default MillionaireGame;
