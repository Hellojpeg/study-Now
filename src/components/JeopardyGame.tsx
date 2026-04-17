
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, Check, X, Trophy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface JeopardyGameProps {
  questions: Question[];
  onExit: () => void;
}

interface JeopardyCategory {
  title: string;
  questions: {
    question: Question;
    value: number;
    isCompleted: boolean;
    isCorrect?: boolean;
  }[];
}

const JeopardyGame: React.FC<JeopardyGameProps> = ({ questions, onExit }) => {
  const [categories, setCategories] = useState<JeopardyCategory[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<{
    catIndex: number;
    qIndex: number;
    data: Question;
    value: number;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Initialize Board
  useEffect(() => {
    const grouped: Record<string, Question[]> = {};
    
    // Group by Unit
    questions.forEach(q => {
      const unitName = q.unit.split('–')[1] || q.unit; // Clean up name if it has a dash
      if (!grouped[unitName]) grouped[unitName] = [];
      grouped[unitName].push(q);
    });

    // Create Categories (Limit to top 4 categories for screen fit, 5 questions each)
    const boardData: JeopardyCategory[] = Object.keys(grouped)
      .slice(0, 4) // Take first 4 units
      .map(key => {
        return {
          title: key.trim(),
          questions: grouped[key].slice(0, 5).map((q, idx) => ({
            question: q,
            value: (idx + 1) * 100,
            isCompleted: false
          }))
        };
      });

    setCategories(boardData);
  }, [questions]);

  const handleTileClick = (catIndex: number, qIndex: number) => {
    const item = categories[catIndex].questions[qIndex];
    if (item.isCompleted) return;

    setActiveQuestion({
      catIndex,
      qIndex,
      data: item.question,
      value: item.value
    });
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered || !activeQuestion) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === activeQuestion.data.correctAnswerIndex;

    if (isCorrect) {
      playSuccessSound();
      setCurrentScore(prev => prev + activeQuestion.value);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
    } else {
      playFailureSound();
      setCurrentScore(prev => prev - activeQuestion.value);
    }

    // Update Board State
    setTimeout(() => {
      setCategories(prev => {
        const newCats = [...prev];
        newCats[activeQuestion.catIndex].questions[activeQuestion.qIndex] = {
          ...newCats[activeQuestion.catIndex].questions[activeQuestion.qIndex],
          isCompleted: true,
          isCorrect: isCorrect
        };
        return newCats;
      });
      setActiveQuestion(null);
    }, 2000); // Wait 2 seconds to show result before closing modal
  };

  // Check if game over
  const isGameOver = categories.length > 0 && categories.every(cat => cat.questions.every(q => q.isCompleted));

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 animate-fadeIn">
        <div className="bg-blue-100 p-8 rounded-full mb-6">
          <Trophy className="w-24 h-24 text-blue-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4">Game Over!</h1>
        <p className="text-2xl text-slate-600 mb-8">Final Score</p>
        <div className="text-6xl font-mono font-bold text-blue-600 mb-12">
          ${currentScore}
        </div>
        <div className="flex gap-4">
           <button onClick={onExit} className="px-8 py-3 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300">
             Back to Menu
           </button>
           <button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
             Play Again
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-700">
        <button 
          onClick={onExit} 
          className="flex items-center text-slate-300 hover:text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit Game
        </button>
        <div className="text-center">
           <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Current Winnings</div>
           <div className={`text-4xl font-mono font-bold ${currentScore >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
             ${currentScore}
           </div>
        </div>
        <div className="w-24"></div> {/* Spacer for center alignment */}
      </div>

      {/* Jeopardy Grid */}
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl">
          {categories.map((cat, cIdx) => (
            <div key={cIdx} className="flex flex-col gap-3">
              {/* Category Header */}
              <div className="bg-blue-900 text-white p-4 text-center font-bold uppercase tracking-wider text-sm min-h-[4rem] flex items-center justify-center rounded-lg border-2 border-blue-700 shadow-[0_0_15px_rgba(30,58,138,0.5)]">
                {cat.title}
              </div>
              
              {/* Question Tiles */}
              {cat.questions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleTileClick(cIdx, qIdx)}
                  disabled={q.isCompleted}
                  className={`
                    h-24 md:h-32 rounded-lg text-3xl md:text-4xl font-black font-mono shadow-md transition-all duration-300 transform
                    flex items-center justify-center border-2
                    ${q.isCompleted 
                      ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-default scale-95 opacity-50' 
                      : 'bg-blue-600 border-blue-400 text-yellow-300 hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(253,224,71,0.5)] cursor-pointer'}
                  `}
                >
                  {q.isCompleted ? (
                     q.isCorrect ? <Check className="w-8 h-8 text-green-500"/> : <X className="w-8 h-8 text-red-500"/>
                  ) : (
                     `$${q.value}`
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Question Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-blue-800 text-white w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-yellow-400 overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-blue-900 p-6 text-center border-b border-blue-700">
               <div className="text-yellow-400 font-bold uppercase tracking-widest mb-2">
                 For ${activeQuestion.value}
               </div>
               <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
                 {activeQuestion.data.question}
               </h2>
            </div>

            {/* Options */}
            <div className="p-8 grid gap-4 bg-blue-800">
               {activeQuestion.data.options.map((opt, idx) => {
                 let btnClass = "bg-blue-700 border-2 border-blue-500 hover:bg-blue-600 hover:border-yellow-400";
                 
                 if (isAnswered) {
                    if (idx === activeQuestion.data.correctAnswerIndex) {
                        btnClass = "bg-green-600 border-green-400 animate-pulse";
                    } else if (idx === selectedOption) {
                        btnClass = "bg-red-600 border-red-400";
                    } else {
                        btnClass = "bg-blue-900 border-blue-800 opacity-50";
                    }
                 }

                 return (
                   <button
                     key={idx}
                     onClick={() => handleAnswer(idx)}
                     disabled={isAnswered}
                     className={`p-6 rounded-xl text-left text-lg font-semibold transition-all ${btnClass} flex items-center gap-4`}
                   >
                     <span className="bg-black/20 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                       {String.fromCharCode(65 + idx)}
                     </span>
                     {opt}
                   </button>
                 );
               })}
            </div>

            {/* Footer Status */}
            {isAnswered && (
                <div className={`p-4 text-center font-bold text-xl uppercase tracking-widest ${selectedOption === activeQuestion.data.correctAnswerIndex ? 'bg-green-500' : 'bg-red-500'}`}>
                    {selectedOption === activeQuestion.data.correctAnswerIndex ? 'Correct!' : 'Incorrect'}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JeopardyGame;
