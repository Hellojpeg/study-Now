
import React, { useState, useEffect } from 'react';
import { Question, MatchingCard } from '../types';
import { ArrowLeft, Trophy, Globe, Scale, Scroll, Landmark, Feather, Book, GraduationCap, PenTool, Hash, Compass, Anchor, Briefcase, Key, HelpCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/audio';

interface MatchingGameProps {
  questions: Question[];
  onFinish: () => void;
  onExit: () => void;
}

// Extended icon set for more variety
const ICONS = [Globe, Scale, Scroll, Landmark, Feather, Book, GraduationCap, PenTool, Hash, Compass, Anchor, Briefcase, Key];

const MatchingGame: React.FC<MatchingGameProps> = ({ questions, onFinish, onExit }) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [turns, setTurns] = useState(0);

  // Initialize game
  useEffect(() => {
    // Pick 8 random questions for a 4x4 grid (16 cards) - More challenging for 8th graders
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    const newCards: MatchingCard[] = [];
    
    shuffledQuestions.forEach((q, index) => {
      // Question Card
      newCards.push({
        id: `q-${q.id}`,
        content: q.question,
        type: 'question',
        isFlipped: false,
        isMatched: false,
        pairId: q.id,
        iconName: 'question'
      });
      
      // Answer Card
      newCards.push({
        id: `a-${q.id}`,
        content: q.options[q.correctAnswerIndex],
        type: 'answer',
        isFlipped: false,
        isMatched: false,
        pairId: q.id,
        iconName: 'answer'
      });
    });

    // Shuffle cards
    setCards(newCards.sort(() => 0.5 - Math.random()));
  }, [questions]);

  const handleCardClick = (id: string) => {
    if (isProcessing || flippedCards.includes(id) || matchedPairs.includes(cards.find(c => c.id === id)?.pairId || 0)) {
      return;
    }

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    // Flip animation state
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setTurns(t => t + 1);
      setIsProcessing(true);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (currentFlipped: string[]) => {
    const card1 = cards.find(c => c.id === currentFlipped[0]);
    const card2 = cards.find(c => c.id === currentFlipped[1]);

    if (card1 && card2 && card1.pairId === card2.pairId) {
      // Match found
      playSuccessSound();
      const newMatched = [...matchedPairs, card1.pairId];
      setMatchedPairs(newMatched);
      setFlippedCards([]);
      setIsProcessing(false);
      
      setCards(prev => prev.map(c => 
        c.pairId === card1.pairId ? { ...c, isMatched: true, isFlipped: true } : c
      ));

      if (newMatched.length === 8) { // 8 pairs total
        setTimeout(() => {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        }, 500);
      }

    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          currentFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
        ));
        setFlippedCards([]);
        setIsProcessing(false);
      }, 1500);
    }
  };

  const getCardIcon = (id: number) => {
    const Icon = ICONS[id % ICONS.length];
    return <Icon className="w-5 h-5 opacity-40" />;
  };

  const isGameComplete = matchedPairs.length === 8;

  if (isGameComplete) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
            <div className="bg-yellow-100 p-8 rounded-full mb-6 animate-bounce shadow-xl">
                <Trophy className="w-20 h-20 text-yellow-600" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Session Complete!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-md mx-auto">
              You successfully matched all terms in <span className="font-bold text-slate-900">{turns} turns</span>.
            </p>
            <div className="flex gap-4">
                <button onClick={onExit} className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                    Return to Menu
                </button>
                <button onClick={() => window.location.reload()} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Play Again
                </button>
            </div>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onExit} 
          className="flex items-center text-slate-600 hover:text-slate-900 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit Session
        </button>
        <div className="flex items-center gap-4">
           <div className="hidden md:block text-sm font-medium text-slate-500">
             Matches: <span className="text-slate-900 font-bold">{matchedPairs.length} / 8</span>
           </div>
           <div className="bg-slate-900 text-white px-6 py-2 rounded-lg shadow-md font-mono font-bold">
             Turns: {turns}
           </div>
        </div>
      </div>

      {/* Grid: 4 columns for desktop to make 4x4 grid (16 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 perspective-1000">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              relative h-48 w-full cursor-pointer transition-transform duration-500 transform-style-3d
              ${card.isFlipped ? 'rotate-y-180' : ''}
              ${card.isMatched ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}
            `}
          >
            {/* Front of Card (Face Down) - Distinct Colors for Q and A */}
            <div className={`
                absolute inset-0 rounded-xl shadow-md border-4 flex flex-col items-center justify-center backface-hidden group transition-colors
                ${card.type === 'question' 
                    ? 'bg-slate-800 border-blue-600/50 hover:bg-slate-700' 
                    : 'bg-slate-800 border-emerald-600/50 hover:bg-slate-700'}
            `}>
               <div className={`opacity-30 group-hover:opacity-50 transition-opacity mb-2`}>
                 {card.type === 'question' ? <HelpCircle className="w-12 h-12 text-blue-400" /> : <CheckCircle2 className="w-12 h-12 text-emerald-400" />}
               </div>
               <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${card.type === 'question' ? 'text-blue-400' : 'text-emerald-400'}`}>
                 {card.type === 'question' ? 'Question' : 'Answer'}
               </div>
            </div>

            {/* Back of Card (Face Up) - Content */}
            <div className={`
              absolute inset-0 rounded-xl shadow-xl flex flex-col p-5 backface-hidden rotate-y-180 bg-white
              ${card.type === 'question' ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-emerald-500'}
            `}>
               {/* Header: Label + Icon */}
               <div className="flex justify-between items-start mb-2">
                 <span className={`text-[10px] font-black uppercase tracking-wider ${card.type === 'question' ? 'text-blue-600' : 'text-emerald-600'}`}>
                   {card.type === 'question' ? 'Question' : 'Answer'}
                 </span>
                 <div className="text-slate-300">
                    {getCardIcon(card.pairId)}
                 </div>
               </div>

               {/* Content */}
               <div className="flex-grow flex items-center justify-center text-center">
                 <div className="text-slate-800 font-medium text-sm md:text-base leading-snug overflow-y-auto max-h-[110px] scrollbar-hide">
                    {card.content}
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingGame;
