
import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';
import { ArrowLeft, RotateCcw, Delete, CornerDownLeft, HelpCircle, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface WordleGameProps {
  questions: Question[];
  onExit: () => void;
}

interface WordleItem {
  word: string;
  hint: string;
}

const WORD_LENGTH_MIN = 4;
const WORD_LENGTH_MAX = 8;
const MAX_GUESSES = 6;

// Keyboard Layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const WordleGame: React.FC<WordleGameProps> = ({ questions, onExit }) => {
  const [wordList, setWordList] = useState<WordleItem[]>([]);
  const [targetItem, setTargetItem] = useState<WordleItem | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeRow, setShakeRow] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');

  // 1. Extract Words on Mount
  useEffect(() => {
    const items: WordleItem[] = [];
    const seenWords = new Set<string>();
    
    questions.forEach(q => {
      // Get the correct answer string
      const answer = q.options[q.correctAnswerIndex];
      if (!answer) return;

      // Clean string: remove punctuation, uppercase, spaces
      // We only want single words usually, but let's handle simple phrases by removing spaces
      const clean = answer.replace(/[^a-zA-Z]/g, '').toUpperCase();
      
      // If valid length and not already added
      if (clean.length >= WORD_LENGTH_MIN && clean.length <= WORD_LENGTH_MAX && !seenWords.has(clean)) {
        seenWords.add(clean);
        items.push({
            word: clean,
            hint: q.question
        });
      }
    });

    if (items.length > 0) {
      setWordList(items);
      startNewGame(items);
    } else {
      // Fallback if no suitable words found in quiz content
      const fallbacks: WordleItem[] = [
          { word: "CIVICS", hint: "The study of the rights and duties of citizenship." },
          { word: "EGYPT", hint: "Ancient civilization known for pyramids and pharaohs." },
          { word: "RIGHTS", hint: "Moral or legal entitlements to have or obtain something." },
          { word: "SENATE", hint: "The upper house of the United States Congress." }
      ];
      setWordList(fallbacks);
      startNewGame(fallbacks);
    }
  }, [questions]);

  const startNewGame = (items: WordleItem[] = wordList) => {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setTargetItem(randomItem);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !targetItem) return;

      const key = e.key.toUpperCase();
      
      if (key === 'ENTER') {
        handleSubmitGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < targetItem.word.length) {
          setCurrentGuess(prev => prev + key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentGuess, targetItem]);

  const handleSubmitGuess = () => {
    if (!targetItem) return;

    if (currentGuess.length !== targetItem.word.length) {
      triggerShake("Not enough letters");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetItem.word) {
      setGameState('won');
      playSuccessSound();
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      playFailureSound();
    }
  };

  const triggerShake = (msg: string) => {
    setShakeRow(true);
    setInvalidMessage(msg);
    setTimeout(() => {
      setShakeRow(false);
      setInvalidMessage('');
    }, 500);
  };

  // --- Rendering Helpers ---

  const getTileStatus = (letter: string, index: number, word: string) => {
    if (!word.includes(letter)) return 'absent';
    if (word[index] === letter) return 'correct';
    return 'present';
  };

  const getKeyStatus = (key: string) => {
    if (!targetItem) return 'default';
    let status = 'default';
    
    // Check all previous guesses
    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (letter === key) {
           const currentStatus = getTileStatus(letter, i, targetItem.word);
           if (currentStatus === 'correct') {
             status = 'correct'; // Best status wins
             return; 
           }
           if (currentStatus === 'present' && status !== 'correct') {
             status = 'present';
           }
           if (currentStatus === 'absent' && status === 'default') {
             status = 'absent';
           }
        }
      }
    });
    return status;
  };

  // --- Render ---

  if (!targetItem) return <div className="text-center p-8">Loading Words...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col h-[calc(100vh-100px)] min-h-[600px] animate-fadeIn font-sans">
       {/* Header */}
       <div className="flex justify-between items-center mb-2">
         <button onClick={onExit} className="p-2 bg-slate-200 rounded-lg hover:bg-slate-300">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">WORDLE PREP</h1>
         <div className="w-9"></div> {/* Spacer */}
       </div>

       {/* Hint / Question Area */}
       <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center mb-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1 text-blue-600 font-bold text-xs uppercase tracking-widest">
                <Lightbulb className="w-4 h-4" /> Question / Hint
            </div>
            <p className="text-slate-800 font-medium leading-snug">
                {targetItem.hint}
            </p>
       </div>

       {/* Game Board */}
       <div className="flex-grow flex flex-col items-center justify-center gap-2 mb-4 relative">
         {/* Invalid Message Toast */}
         {invalidMessage && (
           <div className="absolute top-0 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm animate-bounce">
             {invalidMessage}
           </div>
         )}

         {/* Guessed Rows */}
         {guesses.map((guess, idx) => (
           <div key={idx} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${targetItem.word.length}, 1fr)` }}>
              {guess.split('').map((letter, letterIdx) => {
                const status = getTileStatus(letter, letterIdx, targetItem.word);
                let bgClass = "bg-slate-500 border-slate-500 text-white";
                if (status === 'correct') bgClass = "bg-emerald-500 border-emerald-500 text-white";
                if (status === 'present') bgClass = "bg-yellow-500 border-yellow-500 text-white";
                if (status === 'absent') bgClass = "bg-slate-400 border-slate-400 text-white";
                
                return (
                  <div key={letterIdx} className={`w-10 h-10 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold uppercase select-none animate-tile-flip ${bgClass}`} style={{ animationDelay: `${letterIdx * 100}ms` }}>
                    {letter}
                  </div>
                );
              })}
           </div>
         ))}

         {/* Current Row */}
         {gameState === 'playing' && (
           <div 
             className={`grid gap-1.5 ${shakeRow ? 'animate-tile-shake' : ''}`} 
             style={{ gridTemplateColumns: `repeat(${targetItem.word.length}, 1fr)` }}
           >
              {Array.from({ length: targetItem.word.length }).map((_, idx) => {
                const letter = currentGuess[idx] || '';
                return (
                  <div key={idx} className={`w-10 h-10 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold uppercase select-none ${letter ? 'border-slate-800 animate-tile-pop' : 'border-slate-300'}`}>
                    {letter}
                  </div>
                );
              })}
           </div>
         )}

         {/* Empty Rows */}
         {Array.from({ length: Math.max(0, MAX_GUESSES - 1 - guesses.length - (gameState === 'playing' ? 0 : -1)) }).map((_, rIdx) => (
            <div key={`empty-${rIdx}`} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${targetItem.word.length}, 1fr)` }}>
              {Array.from({ length: targetItem.word.length }).map((_, cIdx) => (
                 <div key={cIdx} className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-slate-200" />
              ))}
            </div>
         ))}
       </div>

       {/* Result Modal Overlay */}
       {gameState !== 'playing' && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 rounded-xl backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform scale-110 max-w-sm mx-4">
               {gameState === 'won' ? (
                 <div className="flex flex-col items-center">
                   <div className="bg-emerald-100 p-4 rounded-full mb-4">
                     <Trophy className="w-12 h-12 text-emerald-600" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-2">Splendid!</h2>
                   <div className="text-slate-600 mb-6">You found the word</div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                   <div className="bg-red-100 p-4 rounded-full mb-4">
                     <RotateCcw className="w-12 h-12 text-red-600" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-2">Nice Try</h2>
                   <div className="text-slate-600 mb-6">The word was</div>
                 </div>
               )}
               
               <div className="text-4xl font-mono font-black tracking-widest text-blue-600 mb-8 uppercase">
                 {targetItem.word}
               </div>

               <div className="flex gap-4 justify-center">
                  <button onClick={onExit} className="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50">Exit</button>
                  <button onClick={() => startNewGame()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Next Word</button>
               </div>
            </div>
         </div>
       )}

       {/* Keyboard */}
       <div className="w-full max-w-2xl">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 mb-2">
              {row.map((key) => {
                 let status = 'default';
                 if (key.length === 1) status = getKeyStatus(key);
                 
                 let bgClass = "bg-slate-200 text-slate-700 hover:bg-slate-300";
                 if (status === 'correct') bgClass = "bg-emerald-500 text-white";
                 if (status === 'present') bgClass = "bg-yellow-500 text-white";
                 if (status === 'absent') bgClass = "bg-slate-400 text-white opacity-50";

                 const isWide = key.length > 1;

                 return (
                   <button
                     key={key}
                     onClick={() => {
                        if (key === 'ENTER') handleSubmitGuess();
                        else if (key === 'BACKSPACE') setCurrentGuess(prev => prev.slice(0, -1));
                        else if (currentGuess.length < targetItem.word.length) setCurrentGuess(prev => prev + key);
                     }}
                     className={`${bgClass} rounded-md font-bold text-sm select-none transition-colors ${isWide ? 'px-2 py-3 md:px-4 md:py-4 text-xs' : 'flex-1 py-3 md:py-4 max-w-[45px]'} flex items-center justify-center`}
                   >
                     {key === 'BACKSPACE' ? <Delete className="w-5 h-5" /> : key}
                   </button>
                 );
              })}
            </div>
          ))}
       </div>
    </div>
  );
};

export default WordleGame;
