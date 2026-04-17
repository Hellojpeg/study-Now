
import React, { useState, useEffect } from 'react';
import { Question, GameMode } from '../types';
import { ArrowRight, CheckCircle, XCircle, AlertCircle, Lightbulb, Zap, Clock, Flame, Square, Triangle, Circle, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import { WORLD_HISTORY_COURSE_CONTENT } from '../constants';

interface QuizViewProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  energy: number;
  gameMode: GameMode;
  combo: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  question,
  currentNumber,
  totalQuestions,
  energy,
  gameMode,
  combo,
  onAnswer,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [triggerRainbow, setTriggerRainbow] = useState(false);
  const [triggerGreenFlash, setTriggerGreenFlash] = useState(false);
  const [triggerRedFlash, setTriggerRedFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Speed mode timer

  // Find Benchmark Description
  const benchmarkInfo = WORLD_HISTORY_COURSE_CONTENT.benchmarks.find(b => b.code === question.benchmark);

  // Reset timer on new question
  useEffect(() => {
    if (gameMode === 'speed') {
      setTimeLeft(10);
      setIsAnswered(false);
      setSelectedOption(null);
    }
  }, [question, gameMode]);

  // Timer Logic
  useEffect(() => {
    if (gameMode !== 'speed' || isAnswered) return;

    if (timeLeft <= 0) {
      // Time run out treated as wrong answer
      handleOptionClick(-1); // -1 indicates no option selected (time out)
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameMode]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctAnswerIndex;
    onAnswer(isCorrect); // Immediate feedback for energy bar

    if (isCorrect) {
      // Play Sound
      playSuccessSound();

      // Trigger standard confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      // Special Effects based on Mode and Combo
      if (gameMode === 'speed') {
         setTriggerGreenFlash(true);
         setTimeout(() => setTriggerGreenFlash(false), 400);
      } else {
         setTriggerRainbow(true);
         setTimeout(() => setTriggerRainbow(false), 800);
      }

      // Combo Effects
      if (combo >= 2) { 
         // Extra visuals if "speed" mode.
         if (gameMode === 'speed' && combo + 1 >= 3) {
            confetti({ particleCount: 50, spread: 120, origin: { y: 0.3 } });
         }
      }

    } else {
      // Play Sound
      playFailureSound();

      // Trigger Explosion
      const explosionColors = ['#ef4444', '#dc2626', '#b91c1c', '#7f1d1d', '#000000'];
      
      confetti({
        particleCount: 150,
        spread: 360,
        startVelocity: 45,
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
    onNext();
    // Reset local state for next question
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setTriggerRainbow(false);
    setTriggerRedFlash(false);
    setTriggerGreenFlash(false);
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

  // Determine wrapper classes for shake effect
  const wrapperClass = (gameMode === 'speed' && isAnswered && selectedOption === question.correctAnswerIndex) 
    ? "w-full max-w-3xl mx-auto px-4 pb-32 relative z-10 animate-shake" 
    : "w-full max-w-3xl mx-auto px-4 pb-32 relative z-10";

  // Dynamic Background for Speed Mode
  const SpeedModeBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
       {/* Animated Gradient */}
       <div className="absolute inset-0 animate-speed-bg opacity-90"></div>
       
       {/* Floating Shapes */}
       <div className="absolute left-[10%] animate-float" style={{ animationDuration: '8s', animationDelay: '0s' }}>
          <Square className="w-16 h-16 text-white opacity-20 rotate-12" />
       </div>
       <div className="absolute left-[30%] animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }}>
          <Circle className="w-10 h-10 text-yellow-300 opacity-20" />
       </div>
       <div className="absolute left-[60%] animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>
          <Triangle className="w-20 h-20 text-blue-200 opacity-20 rotate-45" />
       </div>
       <div className="absolute left-[85%] animate-float" style={{ animationDuration: '10s', animationDelay: '0.5s' }}>
          <Zap className="w-12 h-12 text-purple-300 opacity-20" />
       </div>
       
       {/* Dark overlay pattern to maintain readability */}
       <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
    </div>
  );

  return (
    <>
      {gameMode === 'speed' && <SpeedModeBackground />}
    
      <div className={wrapperClass}>
        {/* Rainbow Flash Overlay */}
        {triggerRainbow && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-rainbow-flash opacity-40 mix-blend-overlay" />
        )}

        {/* Red Flash Overlay */}
        {triggerRedFlash && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-red-flash" />
        )}
        
        {/* Green Flash Overlay (Speed Mode) */}
        {triggerGreenFlash && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-green-flash" />
        )}

        {/* Combo Effects Overlays */}
        {combo >= 3 && gameMode === 'speed' && (
          <div className="fixed inset-0 pointer-events-none z-[50] animate-lightning opacity-30 mix-blend-screen" />
        )}
        {combo >= 7 && gameMode === 'speed' && (
          <div className="fixed inset-0 pointer-events-none z-[40] animate-blue-fire border-[20px] border-blue-500/20 rounded-none" />
        )}

        {/* Top HUD: Energy & Combo */}
        <div className="flex gap-4 mb-6 relative z-20">
          {/* Energy Bar */}
          <div className="flex-1 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Zap className={`w-6 h-6 ${energy > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                  className={`h-full ${getEnergyColor()} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,0,0.5)]`}
                  style={{ width: `${energy}%` }}
              />
              </div>
              <span className="text-sm font-bold text-slate-600 w-12 text-right">{energy}%</span>
          </div>

          {/* Combo Counter (Speed Mode) */}
          {gameMode === 'speed' && (
             <div className={`p-3 rounded-2xl shadow-sm border flex items-center gap-2 font-bold px-4 transition-all ${combo > 2 ? 'bg-orange-50 border-orange-200 text-orange-600 scale-105 shadow-orange-100' : 'bg-white border-slate-100 text-slate-400'}`}>
                <Flame className={`w-5 h-5 ${combo > 4 ? 'animate-pulse fill-orange-500' : ''}`} />
                x{combo}
             </div>
          )}
        </div>

        {/* Speed Timer */}
        {gameMode === 'speed' && !isAnswered && (
            <div className="flex justify-center mb-6 relative z-20">
                <div className={`
                  flex items-center gap-2 px-8 py-3 rounded-full font-mono text-2xl font-black shadow-lg transition-colors border-4
                  ${timeLeft <= 3 
                    ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                    : 'bg-black/80 border-white/20 text-white animate-neon-pulse'}
                `}>
                    <Clock className="w-6 h-6" />
                    00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>
        )}

        {/* Progress Header */}
        <div className="mb-4 relative z-20">
          <div className="flex justify-between items-end mb-2">
            <span className={`text-sm font-bold tracking-wider uppercase ${gameMode === 'speed' ? 'text-white/80' : 'text-slate-400'}`}>
              {question.unit}
            </span>
            <span className="text-sm font-semibold text-slate-600 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
              {currentNumber} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full transition-all duration-500 ease-out ${gameMode === 'speed' ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-blue-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`
          rounded-3xl shadow-xl overflow-hidden mb-6 relative z-20 transition-all duration-300
          ${gameMode === 'speed' 
             ? 'bg-white/95 backdrop-blur-xl border-4 border-white/40 shadow-2xl shadow-purple-500/20' 
             : 'bg-white border border-slate-100'}
          ${combo >= 7 && gameMode === 'speed' ? 'shadow-blue-500/50 border-blue-400' : ''}
        `}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-2xl font-bold text-slate-800 leading-snug flex-1 mr-4">
                  {question.question}
              </h2>
               {!isAnswered && gameMode !== 'speed' && (
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
                          Correct: {String.fromCharCode(65 + question.correctAnswerIndex)}
                      </span>
                  )}
               </div>

               <button
                onClick={handleNextClick}
                className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
               >
                 {currentNumber === totalQuestions ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* --- STANDARDS FOOTER (Visible at all times) --- */}
        {question.benchmark && (
            <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-30 transition-all duration-500 ${isAnswered ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-700 shrink-0">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-wide">
                                {question.benchmark}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Standard
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-snug">
                            {benchmarkInfo ? benchmarkInfo.description : 'Standard description loading...'}
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default QuizView;
