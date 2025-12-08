
import React, { useState } from 'react';
import { Question } from '../types';
import { ArrowRight, CheckCircle, XCircle, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface QuizViewProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  energy: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  question,
  currentNumber,
  totalQuestions,
  energy,
  onAnswer,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [triggerRainbow, setTriggerRainbow] = useState(false);
  const [triggerRedFlash, setTriggerRedFlash] = useState(false);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctAnswerIndex;
    onAnswer(isCorrect); // Immediate feedback for energy bar

    if (isCorrect) {
      // Play Sound
      playSuccessSound();

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      // Trigger rainbow flash
      setTriggerRainbow(true);
      setTimeout(() => setTriggerRainbow(false), 800);
    } else {
      // Play Sound
      playFailureSound();

      // Trigger Explosion
      const explosionColors = ['#ef4444', '#dc2626', '#b91c1c', '#7f1d1d', '#000000'];
      
      confetti({
        particleCount: 100,
        spread: 360,
        startVelocity: 30,
        origin: { y: 0.5 },
        colors: explosionColors,
        shapes: ['circle', 'square'],
        scalar: 1.2,
        drift: 0,
        ticks: 60,
        gravity: 1.5,
        decay: 0.90
      });

      // Trigger Red Flash
      setTriggerRedFlash(true);
      setTimeout(() => setTriggerRedFlash(false), 500);
    }
  };

  const handleNextClick = () => {
    if (selectedOption === null) return;
    onNext();
    // Reset local state for next question
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setTriggerRainbow(false);
    setTriggerRedFlash(false);
  };

  const getOptionStyles = (index: number) => {
    const baseStyle =
      "relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full flex items-center justify-between group";

    if (!isAnswered) {
      return `${baseStyle} border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:scale-[0.99]`;
    }

    // If this option is the correct answer
    if (index === question.correctAnswerIndex) {
      return `${baseStyle} border-emerald-500 bg-emerald-50 text-emerald-800 font-medium`;
    }

    // If this option was selected but is wrong
    if (index === selectedOption && selectedOption !== question.correctAnswerIndex) {
      return `${baseStyle} border-red-500 bg-red-50 text-red-800 opacity-70`;
    }

    // Unselected options when answered
    return `${baseStyle} border-slate-100 bg-slate-50 text-slate-400`;
  };

  const progressPercentage = ((currentNumber - 1) / totalQuestions) * 100;

  // Energy bar color logic
  const getEnergyColor = () => {
    if (energy > 60) return 'bg-yellow-400';
    if (energy > 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-12 relative">
      {/* Rainbow Flash Overlay */}
      {triggerRainbow && (
        <div className="fixed inset-0 pointer-events-none z-[100] animate-rainbow-flash opacity-40 mix-blend-overlay" />
      )}

      {/* Red Flash Overlay */}
      {triggerRedFlash && (
        <div className="fixed inset-0 pointer-events-none z-[100] animate-red-flash" />
      )}

      {/* Energy Bar */}
      <div className="mb-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Zap className={`w-6 h-6 ${energy > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full ${getEnergyColor()} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,0,0.5)]`}
            style={{ width: `${energy}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-600 w-12 text-right">{energy}%</span>
      </div>

      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-400 tracking-wider uppercase">
            {question.unit}
          </span>
          <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {currentNumber} / {totalQuestions}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6 relative">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
             <h2 className="text-2xl font-bold text-slate-800 leading-snug flex-1 mr-4">
                {question.question}
            </h2>
             {!isAnswered && (
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="p-2 rounded-full hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 transition-colors"
                  title="Show Hint"
                >
                    <Lightbulb className={`w-6 h-6 ${showHint ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                </button>
             )}
          </div>

          {/* Hint Box */}
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${showHint ? 'max-h-32 mb-6 opacity-100' : 'max-h-0 mb-0 opacity-0'}
          `}>
             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 flex gap-3">
                <Lightbulb className="w-5 h-5 flex-shrink-0" />
                <p><strong>Hint:</strong> {question.hint || "Think carefully about the keywords in the question."}</p>
             </div>
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={getOptionStyles(idx)}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                      isAnswered
                        ? idx === question.correctAnswerIndex
                          ? "bg-emerald-200 border-emerald-300 text-emerald-700"
                          : idx === selectedOption
                          ? "bg-red-200 border-red-300 text-red-700"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                        : "bg-white border-slate-300 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
                
                {isAnswered && idx === question.correctAnswerIndex && (
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== question.correctAnswerIndex && (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Footer */}
        <div className={`
          border-t transition-all duration-300 overflow-hidden
          ${isAnswered ? 'max-h-32 p-4 bg-slate-50' : 'max-h-0'}
        `}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                {selectedOption === question.correctAnswerIndex ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-2 animate-bounce">
                        Correct! Great job.
                    </span>
                ) : (
                    <span className="text-red-700 font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5"/>
                        Correct Answer: {String.fromCharCode(65 + question.correctAnswerIndex)}
                    </span>
                )}
             </div>

             <button
              onClick={handleNextClick}
              className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
             >
               {currentNumber === totalQuestions ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
