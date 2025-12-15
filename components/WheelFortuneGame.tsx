
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { WHEEL_PHRASES } from '../constants';
import { ArrowLeft, RotateCw, Check, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface WheelFortuneGameProps {
  questions: Question[];
  onExit: () => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const WHEEL_VALUES = [500, 200, 800, 300, 1000, "BANKRUPT", 400, 600];

const WheelFortuneGame: React.FC<WheelFortuneGameProps> = ({ questions, onExit }) => {
  const [phrase, setPhrase] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'PLAYER' | 'CPU1' | 'CPU2'>('PLAYER');
  const [roundScore, setRoundScore] = useState({ PLAYER: 0, CPU1: 0, CPU2: 0 });
  const [spinValue, setSpinValue] = useState<number | string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  
  // Game State
  const [mustAnswerTrivia, setMustAnswerTrivia] = useState(false);
  const [currentTrivia, setCurrentTrivia] = useState<Question | null>(null);
  const [waitingForConsonant, setWaitingForConsonant] = useState(false);

  useEffect(() => {
      startNewRound();
  }, []);

  // AI Logic
  useEffect(() => {
      if (currentTurn !== 'PLAYER' && !isSpinning && !waitingForConsonant && !mustAnswerTrivia) {
          const timeout = setTimeout(() => {
              // AI Turn Logic
              handleSpin();
          }, 1500);
          return () => clearTimeout(timeout);
      }
  }, [currentTurn, isSpinning, waitingForConsonant, mustAnswerTrivia]);

  // AI Guess Logic
  useEffect(() => {
      if (currentTurn !== 'PLAYER' && waitingForConsonant && typeof spinValue === 'number') {
          const timeout = setTimeout(() => {
              // Simple AI: Pick random available letter
              const available = ALPHABET.filter(l => !guessedLetters.includes(l));
              const pick = available[Math.floor(Math.random() * available.length)];
              handleGuessLetter(pick);
          }, 1500);
          return () => clearTimeout(timeout);
      }
  }, [currentTurn, waitingForConsonant, spinValue]);


  const startNewRound = () => {
      const p = WHEEL_PHRASES[Math.floor(Math.random() * WHEEL_PHRASES.length)];
      setPhrase(p);
      setGuessedLetters([]);
      setRoundScore({ PLAYER: 0, CPU1: 0, CPU2: 0 });
      setCurrentTurn('PLAYER');
      setSpinValue(null);
  };

  const handleSpin = () => {
      if (currentTurn === 'PLAYER') {
          // Trigger trivia check for player before spin
          const q = questions[Math.floor(Math.random() * questions.length)];
          setCurrentTrivia(q);
          setMustAnswerTrivia(true);
      } else {
          // AI skips trivia (simulated success)
          executeSpin();
      }
  };

  const executeSpin = () => {
      setIsSpinning(true);
      const newRot = wheelRotation + 720 + Math.random() * 360;
      setWheelRotation(newRot);
      
      setTimeout(() => {
          setIsSpinning(false);
          const val = WHEEL_VALUES[Math.floor(Math.random() * WHEEL_VALUES.length)];
          setSpinValue(val);
          
          if (val === 'BANKRUPT') {
              setRoundScore(prev => ({ ...prev, [currentTurn]: 0 }));
              nextTurn();
          } else {
              setWaitingForConsonant(true);
          }
      }, 3000);
  };

  const handleTriviaAnswer = (isCorrect: boolean) => {
      setMustAnswerTrivia(false);
      setCurrentTrivia(null);
      if (isCorrect) {
          playSuccessSound();
          executeSpin();
      } else {
          playFailureSound();
          alert("Incorrect! Turn passed.");
          nextTurn();
      }
  };

  const handleGuessLetter = (char: string) => {
      setWaitingForConsonant(false);
      setGuessedLetters(prev => [...prev, char]);
      
      const count = phrase.split('').filter(c => c === char).length;
      
      if (count > 0) {
          playSuccessSound();
          if (typeof spinValue === 'number') {
              setRoundScore(prev => ({ ...prev, [currentTurn]: prev[currentTurn] + (spinValue * count) }));
          }
          if (!phrase.split('').every(c => c === ' ' || guessedLetters.includes(c) || c === char)) {
               nextTurn();
          }
      } else {
          playFailureSound();
          nextTurn();
      }
  };

  const nextTurn = () => {
      setSpinValue(null);
      if (currentTurn === 'PLAYER') setCurrentTurn('CPU1');
      else if (currentTurn === 'CPU1') setCurrentTurn('CPU2');
      else setCurrentTurn('PLAYER');
  };

  const isSolved = phrase.split('').every(c => c === ' ' || guessedLetters.includes(c));

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
        <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onExit}><ArrowLeft/></button>
                <div className="text-2xl font-black text-yellow-400">HISTORY WHEEL</div>
                <div className="w-10"></div>
            </div>

            {/* Scores */}
            <div className="flex justify-center gap-4 mb-12">
                {['PLAYER', 'CPU1', 'CPU2'].map(p => (
                    <div key={p} className={`px-6 py-3 rounded-xl border-2 ${currentTurn === p ? 'bg-yellow-500 border-yellow-400 text-black scale-110' : 'bg-slate-800 border-slate-700 text-slate-400'} transition-all`}>
                        <div className="text-xs font-bold uppercase">{p === 'PLAYER' ? 'YOU' : p}</div>
                        <div className="font-mono text-xl font-bold">${roundScore[p as keyof typeof roundScore]}</div>
                    </div>
                ))}
            </div>

            {/* Puzzle Board */}
            <div className="bg-blue-900 p-8 rounded-3xl border-4 border-blue-500 mb-12 flex flex-wrap justify-center gap-2 shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                {phrase.split('').map((char, i) => (
                    <div key={i} className={`w-12 h-16 flex items-center justify-center text-3xl font-black uppercase border-2 ${char === ' ' ? 'border-transparent' : 'bg-white text-black border-slate-300 shadow-md'}`}>
                        {char === ' ' ? '' : (guessedLetters.includes(char) || isSolved ? char : '')}
                    </div>
                ))}
            </div>

            {/* Action Area */}
            <div className="flex flex-col items-center justify-center min-h-[200px]">
                {isSolved ? (
                    <div className="text-center animate-bounce">
                        <h2 className="text-4xl font-bold text-emerald-400 mb-4">PUZZLE SOLVED!</h2>
                        <button onClick={startNewRound} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl">Next Puzzle</button>
                    </div>
                ) : mustAnswerTrivia && currentTrivia ? (
                    <div className="bg-slate-800 p-6 rounded-2xl max-w-2xl border-4 border-yellow-400 animate-fadeIn">
                        <h3 className="text-lg font-bold mb-4 text-center">Answer to Spin!</h3>
                        <p className="mb-6 font-bold text-xl text-center">{currentTrivia.question}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {currentTrivia.options.map((opt, i) => (
                                <button key={i} onClick={() => handleTriviaAnswer(i === currentTrivia.correctAnswerIndex)} className="p-3 bg-slate-700 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors text-left">{opt}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        {spinValue === null && !isSpinning && currentTurn === 'PLAYER' && (
                            <button onClick={handleSpin} className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 font-black text-2xl text-red-900 shadow-xl hover:scale-105 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 border-4 border-white">
                                <RotateCw className="w-8 h-8" /> SPIN
                            </button>
                        )}

                        {isSpinning && (
                            <div className="text-2xl font-bold text-yellow-400 animate-pulse">WHEEL SPINNING...</div>
                        )}

                        {spinValue && !isSpinning && (
                            <div className="mb-6">
                                <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Result</div>
                                <div className="text-5xl font-black text-white mb-6">{spinValue}</div>
                                {waitingForConsonant && currentTurn === 'PLAYER' && (
                                    <div className="flex flex-wrap gap-1 justify-center max-w-2xl">
                                        {ALPHABET.map(char => (
                                            <button 
                                                key={char} 
                                                disabled={guessedLetters.includes(char)}
                                                onClick={() => handleGuessLetter(char)}
                                                className="w-10 h-12 bg-slate-700 rounded hover:bg-blue-500 disabled:opacity-20 font-bold"
                                            >
                                                {char}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {waitingForConsonant && currentTurn !== 'PLAYER' && (
                                    <div className="text-xl text-slate-400 italic">Thinking...</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default WheelFortuneGame;
