import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, BookOpen, Repeat, Shuffle } from 'lucide-react';

interface FlashCardsGameProps {
  questions: Question[];
  onExit: () => void;
}

const FlashCardsGame: React.FC<FlashCardsGameProps> = ({ questions, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Question[]>(questions);
  const [isShuffled, setIsShuffled] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % cards.length);
    }, 150); // Small delay so flip resets before content changes if flipped
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    if (!isShuffled) {
      // Shuffle
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setCards(shuffled);
    } else {
      // Reset
      setCards(questions);
    }
    setIsShuffled(!isShuffled);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[80vh] flex flex-col animate-fadeIn">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onExit} 
          className="flex items-center text-slate-600 hover:text-slate-900 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </button>

        <div className="flex items-center gap-2">
           <button 
             onClick={toggleShuffle}
             className={`p-2 rounded-lg border transition-colors ${isShuffled ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}
             title="Toggle Shuffle"
           >
             <Shuffle className="w-5 h-5" />
           </button>
           <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-mono font-bold">
             {currentIndex + 1} / {cards.length}
           </div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-grow flex items-center justify-center py-4 perspective-1000">
        <div 
            className={`
                relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-700 transform-style-3d group
                ${isFlipped ? 'rotate-y-180' : ''}
            `}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            {/* Front (Question) */}
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col backface-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Question</span>
                    <BookOpen className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-grow flex items-center justify-center p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center leading-relaxed">
                        {currentCard.question}
                    </h2>
                </div>
                <div className="p-6 text-center text-slate-400 text-sm font-medium">
                    Click or Space to Flip
                </div>
            </div>

            {/* Back (Answer) */}
            <div className="absolute inset-0 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col backface-hidden rotate-y-180">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Answer</span>
                    <RotateCw className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-12">
                     <div className="bg-emerald-500/10 px-4 py-1 rounded-full text-emerald-400 font-bold mb-6 border border-emerald-500/20">
                        Correct Option: {String.fromCharCode(65 + currentCard.correctAnswerIndex)}
                     </div>
                     <h2 className="text-2xl md:text-4xl font-black text-white text-center leading-relaxed">
                        {currentCard.options[currentCard.correctAnswerIndex]}
                    </h2>
                    <p className="mt-6 text-slate-400 text-center max-w-md">
                        {currentCard.hint && <span className="block text-sm italic opacity-70 mt-2">"{currentCard.hint}"</span>}
                    </p>
                </div>
                <div className="p-6 text-center text-slate-600 text-sm font-medium">
                    Click to Flip Back
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center items-center gap-6 mt-6 md:mt-0 pb-6">
        <button 
            onClick={handlePrev}
            className="p-4 rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:text-blue-600 hover:scale-110 transition-all active:scale-95"
        >
            <ArrowLeft className="w-8 h-8" />
        </button>

        <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
            <Repeat className="w-5 h-5" /> Flip Card
        </button>

        <button 
            onClick={handleNext}
            className="p-4 rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:text-blue-600 hover:scale-110 transition-all active:scale-95"
        >
            <ArrowRight className="w-8 h-8" />
        </button>
      </div>
      
      <div className="text-center text-slate-400 text-sm mt-4 hidden md:block">
        Pro tip: Use Arrow Keys to navigate and Spacebar to flip
      </div>
    </div>
  );
};

export default FlashCardsGame;