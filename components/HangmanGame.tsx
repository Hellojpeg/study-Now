
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, Lock, Unlock, HelpCircle, Keyboard, AlertTriangle } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface HangmanGameProps {
  questions: Question[];
  onExit: () => void;
}

const HangmanGame: React.FC<HangmanGameProps> = ({ questions, onExit }) => {
  const [targetWord, setTargetWord] = useState('');
  const [mainClue, setMainClue] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [canGuess, setCanGuess] = useState(false); // Must answer question to guess
  const [qIndex, setQIndex] = useState(0);
  
  // Solve Mode State
  const [isSolving, setIsSolving] = useState(false);
  const [solveInput, setSolveInput] = useState('');

  const MAX_MISTAKES = 6;
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  
  // Filter questions to remove the one being used as the target word to avoid confusion
  const triviaQuestions = questions.filter(q => q.question !== mainClue);
  const currentTrivia = triviaQuestions[qIndex % triviaQuestions.length];

  useEffect(() => {
      // Find valid questions where answer is a single word or short phrase suitable for Hangman
      // Regex allows letters and spaces, length 4-15
      const validQs = questions.filter(q => {
          const ans = q.options[q.correctAnswerIndex];
          return /^[a-zA-Z\s]{4,15}$/.test(ans); 
      });

      if (validQs.length > 0) {
          const randomQ = validQs[Math.floor(Math.random() * validQs.length)];
          const ans = randomQ.options[randomQ.correctAnswerIndex];
          setTargetWord(ans.toUpperCase());
          setMainClue(randomQ.question);
      } else {
          // Fallback if no suitable words found
          setTargetWord("LIBERTY");
          setMainClue("The state of being free within society from oppressive restrictions.");
      }
  }, [questions]);

  const handleTriviaAnswer = (idx: number) => {
      if (idx === currentTrivia.correctAnswerIndex) {
          playSuccessSound();
          setCanGuess(true);
          setQIndex(prev => prev + 1);
      } else {
          playFailureSound();
          setMistakes(prev => prev + 1); // Wrong trivia answers hurt hangman too!
          setQIndex(prev => prev + 1);
      }
  };

  const guessLetter = (char: string) => {
      if (!canGuess || guessedLetters.includes(char)) return;
      
      setGuessedLetters(prev => [...prev, char]);
      setCanGuess(false); // Consume guess

      if (!targetWord.includes(char)) {
          setMistakes(prev => prev + 1);
      } else {
          playSuccessSound();
      }
  };

  const handleSolveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (solveInput.toUpperCase().trim() === targetWord.trim()) {
          // Win - Reveal all letters
          const allChars = targetWord.split('').filter(c => c !== ' ');
          setGuessedLetters([...guessedLetters, ...allChars]);
          playSuccessSound();
      } else {
          // Fail
          playFailureSound();
          setMistakes(prev => prev + 2); // Heavy penalty for wrong solve
          setCanGuess(false); // Lose turn
          setIsSolving(false);
          setSolveInput('');
          alert("Incorrect! Penalty: +2 Mistakes.");
      }
  };

  // Check Win/Loss
  // Ignore spaces for win condition
  const lettersToGuess = targetWord.split('').filter(c => c !== ' ');
  const isWon = lettersToGuess.every(char => guessedLetters.includes(char));
  const isLost = mistakes >= MAX_MISTAKES;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center font-sans">
        <div className="w-full max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onExit} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"><ArrowLeft className="w-6 h-6"/></button>
                <div className="text-2xl font-black tracking-tight text-slate-200">HANGMAN TRIVIA</div>
                <div className="w-10"></div>
            </div>

            {/* MAIN CLUE BANNER */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-6 rounded-2xl text-center mb-8 shadow-lg">
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold uppercase tracking-widest text-sm mb-2">
                    <HelpCircle className="w-4 h-4" /> Puzzle Clue
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                    "{mainClue}"
                </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Hangman & Word Display */}
                <div className="text-center flex flex-col">
                    <div className="bg-slate-800 p-8 rounded-3xl mb-8 flex-grow flex flex-col items-center justify-center border border-slate-700 relative overflow-hidden">
                        {/* Status Overlay */}
                        {isWon && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm"><div className="text-5xl font-black text-emerald-400 animate-bounce shadow-black drop-shadow-lg">SOLVED!</div></div>}
                        {isLost && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm"><div className="text-5xl font-black text-red-400 shadow-black drop-shadow-lg">FAILED</div></div>}

                        {/* Hangman SVG */}
                        <svg width="180" height="200" viewBox="0 0 200 200" className="stroke-slate-300 stroke-[4px] fill-none mb-6">
                            <line x1="20" y1="180" x2="180" y2="180" />
                            <line x1="60" y1="180" x2="60" y2="20" />
                            <line x1="60" y1="20" x2="140" y2="20" />
                            <line x1="140" y1="20" x2="140" y2="40" />
                            {mistakes >= 1 && <circle cx="140" cy="60" r="20" className="stroke-red-400" />}
                            {mistakes >= 2 && <line x1="140" y1="80" x2="140" y2="130" className="stroke-red-400" />}
                            {mistakes >= 3 && <line x1="140" y1="90" x2="120" y2="110" className="stroke-red-400" />}
                            {mistakes >= 4 && <line x1="140" y1="90" x2="160" y2="110" className="stroke-red-400" />}
                            {mistakes >= 5 && <line x1="140" y1="130" x2="120" y2="160" className="stroke-red-400" />}
                            {mistakes >= 6 && <line x1="140" y1="130" x2="160" y2="160" className="stroke-red-400" />}
                        </svg>
                        
                        {/* Word Slots */}
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                            {targetWord.split('').map((char, i) => {
                                if (char === ' ') return <div key={i} className="w-6 md:w-10"></div>; // Space
                                return (
                                    <div key={i} className={`w-8 h-10 md:w-12 md:h-14 border-b-4 ${isLost && !guessedLetters.includes(char) ? 'border-red-500 text-red-400' : 'border-white'} text-2xl md:text-4xl font-black flex items-center justify-center transition-all`}>
                                        {guessedLetters.includes(char) || isLost ? char : ''}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reset Button (End Game) */}
                    {(isWon || isLost) && (
                        <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg">
                            Play Another Puzzle
                        </button>
                    )}
                </div>

                {/* Right: Interaction Area */}
                <div>
                    {!isWon && !isLost && (
                        <>
                            {!canGuess ? (
                                /* LOCKED STATE: TRIVIA */
                                <div className="bg-blue-900 p-6 md:p-8 rounded-3xl border-4 border-blue-700 animate-fadeIn h-full">
                                    <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-widest mb-4">
                                        <Lock className="w-5 h-5" /> Answer to Unlock a Guess
                                    </div>
                                    <div className="bg-blue-950/50 p-4 rounded-xl mb-6">
                                        <h3 className="text-lg md:text-xl font-bold leading-snug">{currentTrivia.question}</h3>
                                    </div>
                                    <div className="grid gap-3">
                                        {currentTrivia.options.map((opt, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleTriviaAnswer(idx)}
                                                className="w-full text-left p-4 rounded-xl bg-blue-800 hover:bg-blue-600 font-medium transition-all border border-blue-700 hover:border-blue-400 active:scale-[0.98]"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* UNLOCKED STATE: KEYBOARD OR SOLVE */
                                <div className="bg-slate-800 p-6 md:p-8 rounded-3xl border-4 border-emerald-600/50 animate-fadeIn h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest">
                                            <Unlock className="w-5 h-5" /> Guess a Letter
                                        </div>
                                        <button 
                                            onClick={() => setIsSolving(!isSolving)} 
                                            className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isSolving ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400/10'}`}
                                        >
                                            {isSolving ? 'Cancel Solve' : 'Solve Puzzle'}
                                        </button>
                                    </div>

                                    {isSolving ? (
                                        <form onSubmit={handleSolveSubmit} className="flex flex-col gap-4 flex-grow justify-center animate-fadeIn">
                                            <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/50 flex items-start gap-3">
                                                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                                                <p className="text-sm text-yellow-200">
                                                    <strong>Warning:</strong> Entering the wrong word will cost you <span className="text-white font-bold">2 Mistakes</span> and lose your turn.
                                                </p>
                                            </div>
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={solveInput}
                                                onChange={(e) => setSolveInput(e.target.value)}
                                                placeholder="Type full answer..." 
                                                className="w-full p-4 bg-slate-900 border-2 border-slate-600 rounded-xl text-2xl font-black text-center text-white focus:outline-none focus:border-yellow-500 uppercase tracking-widest"
                                            />
                                            <button type="submit" className="w-full py-4 bg-yellow-500 text-slate-900 font-black rounded-xl hover:bg-yellow-400 transition-colors uppercase tracking-wider text-lg shadow-lg">
                                                Confirm Solve
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 justify-center content-start">
                                            {ALPHABET.map(char => (
                                                <button
                                                    key={char}
                                                    disabled={guessedLetters.includes(char)}
                                                    onClick={() => guessLetter(char)}
                                                    className={`
                                                        w-10 h-12 rounded-lg font-bold text-lg transition-all
                                                        ${guessedLetters.includes(char) 
                                                            ? 'opacity-20 bg-slate-900 cursor-not-allowed' 
                                                            : 'bg-slate-700 hover:bg-white hover:text-slate-900 hover:-translate-y-1 shadow-md'}
                                                    `}
                                                >
                                                    {char}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default HangmanGame;
