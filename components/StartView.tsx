
import React, { useState, useEffect } from 'react';
import { BookOpen, History, Clock, BrainCircuit, Landmark, Flag, Zap, Layers, Copy, GraduationCap, LayoutGrid, Type, Book, List, Library, Calendar, Sword, Coins, Hash, Lock, Search, Shield, RotateCw, DollarSign, PenTool, Map, Grid3X3, Crosshair, Circle } from 'lucide-react';
import { SubjectId, GameMode } from '../types';
import { QUIZZES } from '../constants';

interface StartViewProps {
  subjectId: SubjectId;
  title: string;
  description: string;
  totalQuestions: number;
  onStart: (mode: GameMode, scope: string) => void;
}

const StartView: React.FC<StartViewProps> = ({ 
  subjectId, 
  title, 
  description, 
  totalQuestions, 
  onStart 
}) => {
  const [selectedScope, setSelectedScope] = useState(''); // Default empty to enforce choice
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  useEffect(() => {
    const currentQuiz = QUIZZES[subjectId];
    if (currentQuiz) {
        // Filter out undefined units and remove duplicates
        const units = Array.from(new Set(currentQuiz.questions.map(q => q.unit).filter(Boolean)));
        setAvailableUnits(units);
    }
  }, [subjectId]);

  const getHeaderIcon = () => {
    switch(subjectId) {
      case 'civics': return <Landmark className="w-10 h-10 md:w-12 md:h-12 text-white" />;
      case 'us-history': return <Flag className="w-10 h-10 md:w-12 md:h-12 text-white" />;
      default: return <History className="w-10 h-10 md:w-12 md:h-12 text-white" />;
    }
  };

  const getHeaderColor = () => {
    switch(subjectId) {
      case 'civics': return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30';
      case 'us-history': return 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30';
      default: return 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30';
    }
  };

  const handleStartGame = (mode: GameMode) => {
    if (!selectedScope) {
        // Optional: Shake effect or highlight dropdown could go here
        return; 
    }
    onStart(mode, selectedScope);
  };

  // Helper to generate Week 1-9 options
  const renderQuarterWeeks = (quarter: number) => {
      const weeks = Array.from({length: 9}, (_, i) => i + 1);
      return (
          <optgroup label={`Quarter ${quarter}`}>
              <option value={`Q${quarter}`}>Full Quarter {quarter} Content</option>
              {weeks.map(w => (
                  <option key={`Q${quarter}-W${w}`} value={`Q${quarter}-W${w}`}>
                      Q{quarter} - Week {w}
                  </option>
              ))}
          </optgroup>
      );
  };

  // Helper for disabled state styling
  const getButtonClass = (baseClass: string) => {
      if (!selectedScope) {
          return `${baseClass} opacity-50 grayscale cursor-not-allowed transform-none hover:translate-y-0 hover:shadow-none`;
      }
      return baseClass;
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn max-w-7xl mx-auto px-4 pb-20 w-full">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12 pt-4 md:pt-8 w-full">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 md:mb-8 ${getHeaderColor()}`}>
             {getHeaderIcon()}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            {title} Prep
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-lg font-medium px-4">
            {description}
          </p>
      </div>

      {/* Scope Selector Widget */}
      <div className="w-full max-w-xl mb-12 relative group z-20">
         <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur transition duration-1000 ${selectedScope ? 'opacity-20' : 'opacity-60 animate-pulse'}`}></div>
         <div className="relative bg-white p-2 rounded-2xl shadow-xl flex items-center border border-slate-100">
            <div className={`pl-4 pr-2 ${!selectedScope ? 'text-indigo-500' : 'text-slate-400'}`}>
                <Calendar className="w-6 h-6" />
            </div>
            <select 
                value={selectedScope} 
                onChange={(e) => setSelectedScope(e.target.value)}
                className="w-full p-3 md:p-4 bg-transparent font-bold text-slate-800 text-base md:text-lg focus:outline-none cursor-pointer truncate pr-8"
            >
                <option value="" disabled>Choose a Section...</option>
                
                <optgroup label="Exams">
                    <option value="MID">Midterm Exam (Cumulative)</option>
                    <option value="FIN">Final Exam (Cumulative)</option>
                    <option value="ALL">All Available Questions</option>
                </optgroup>

                {renderQuarterWeeks(1)}
                {renderQuarterWeeks(2)}
                {renderQuarterWeeks(3)}
                {renderQuarterWeeks(4)}

                {availableUnits.length > 0 && (
                    <optgroup label="Specific Units">
                        {availableUnits.map(unit => (
                            <option key={unit} value={unit}>
                               {unit}
                            </option>
                        ))}
                    </optgroup>
                )}
            </select>
            {!selectedScope && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </div>
            )}
         </div>
         {!selectedScope && (
             <div className="text-center mt-3 text-indigo-500 text-sm font-bold animate-bounce">
                 Please select a section to enable game modes below
             </div>
         )}
      </div>

      {/* CORE MODES */}
      <div className="w-full mb-12">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Core Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Standard */}
              <button 
                onClick={() => handleStartGame('standard')} 
                disabled={!selectedScope}
                className={getButtonClass("group bg-white rounded-3xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-full min-h-[160px] relative overflow-hidden")}
              >
                  <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Standard Mode</h3>
                  <p className="text-slate-500 text-sm font-medium">Classic multiple choice.</p>
              </button>
              
              {/* Speed */}
              <button 
                onClick={() => handleStartGame('speed')} 
                disabled={!selectedScope}
                className={getButtonClass("group bg-slate-900 rounded-3xl p-6 shadow-2xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 text-left flex flex-col h-full min-h-[160px] relative overflow-hidden")}
              >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
                  <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform border border-indigo-500/30">
                      <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Speed Run</h3>
                  <p className="text-slate-400 text-sm font-medium">10s timer. High stakes.</p>
              </button>

              {/* Jeopardy */}
              <button 
                onClick={() => handleStartGame('jeopardy')} 
                disabled={!selectedScope}
                className={getButtonClass("group bg-white rounded-3xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-full min-h-[160px] relative overflow-hidden")}
              >
                  <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Jeopardy</h3>
                  <p className="text-slate-500 text-sm font-medium">Board game style.</p>
              </button>
          </div>
      </div>

      {/* ARCADE */}
      <div className="w-full mb-12">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Arcade & Strategy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Tile Component Helper */}
               {[
                 { id: 'boss', icon: Sword, color: 'text-red-500', bg: 'bg-red-50', title: 'Boss Battle', desc: 'RPG Strategy' },
                 { id: 'commerce', icon: Coins, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Tycoon', desc: 'Economy Sim' },
                 { id: 'towerdefense', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50', title: 'Tower Defense', desc: 'Defend & Build' },
                 { id: 'millionaire', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Millionaire', desc: 'Ladder Climb' },
                 { id: 'connect4', icon: Grid3X3, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Connect 4', desc: 'Turn-Based Strategy' },
                 { id: 'battleship', icon: Crosshair, color: 'text-sky-500', bg: 'bg-sky-50', title: 'Battleship', desc: 'Naval Combat' },
                 { id: 'risk', icon: Map, color: 'text-rose-500', bg: 'bg-rose-50', title: 'Conquest', desc: 'Risk-Style Map' },
                 { id: 'checkers', icon: Circle, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Checkers', desc: 'Classic Strategy' },
                 { id: 'guesswho', icon: Search, color: 'text-pink-500', bg: 'bg-pink-50', title: 'Guess Who?', desc: 'Deduction' },
                 { id: 'guesswhat', icon: BrainCircuit, color: 'text-teal-500', bg: 'bg-teal-50', title: 'Guess What?', desc: 'Artifacts' },
                 { id: 'wheel', icon: RotateCw, color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'Wheel', desc: 'Puzzle Spin' },
                 { id: 'tictactoe', icon: Hash, color: 'text-slate-500', bg: 'bg-slate-100', title: 'Tic Tac Toe', desc: 'Classic' },
               ].map(game => (
                   <button 
                     key={game.id}
                     onClick={() => handleStartGame(game.id as GameMode)} 
                     disabled={!selectedScope}
                     className={getButtonClass("flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-left group min-h-[5rem] overflow-hidden")}
                   >
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${game.bg} group-hover:scale-110 transition-transform`}>
                           <game.icon className={`w-6 h-6 ${game.color}`} />
                       </div>
                       <div className="min-w-0">
                           <div className="font-bold text-slate-800 truncate text-sm md:text-base">{game.title}</div>
                           <div className="text-xs text-slate-500 font-medium truncate">{game.desc}</div>
                       </div>
                   </button>
               ))}
          </div>
      </div>

      {/* REVIEW & VOCAB */}
      <div className="w-full mb-12">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Review & Vocab</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
             <button disabled={!selectedScope} onClick={() => handleStartGame('matching')} className={getButtonClass("bg-white/60 p-6 rounded-3xl border border-white/50 hover:bg-white transition-all hover:shadow-lg flex flex-col gap-4 text-left min-h-[140px]")}>
                 <Layers className="w-8 h-8 text-indigo-500" />
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">Memory Match</h3>
                    <p className="text-sm text-slate-500">Flip & Match Terms</p>
                 </div>
             </button>
             <button disabled={!selectedScope} onClick={() => handleStartGame('flashcards')} className={getButtonClass("bg-white/60 p-6 rounded-3xl border border-white/50 hover:bg-white transition-all hover:shadow-lg flex flex-col gap-4 text-left min-h-[140px]")}>
                 <Copy className="w-8 h-8 text-emerald-500" />
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">Flash Cards</h3>
                    <p className="text-sm text-slate-500">Quick Review</p>
                 </div>
             </button>
             <button disabled={!selectedScope} onClick={() => handleStartGame('wordle')} className={getButtonClass("bg-white/60 p-6 rounded-3xl border border-white/50 hover:bg-white transition-all hover:shadow-lg flex flex-col gap-4 text-left min-h-[140px]")}>
                 <Type className="w-8 h-8 text-pink-500" />
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">Wordle</h3>
                    <p className="text-sm text-slate-500">Guess the Term</p>
                 </div>
             </button>
          </div>
      </div>

       {/* Study Resources Section - Available for ALL, NO DISABLED STATE */}
        <div className="w-full">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Digital Textbook (Always Available)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             <button onClick={() => onStart('modules', 'ALL')} className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all text-left flex items-center gap-6 col-span-1 md:col-span-2 lg:col-span-1 relative overflow-hidden min-h-[120px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
              <div className="p-3 bg-white/10 rounded-xl text-indigo-200 flex-shrink-0"><Library className="w-8 h-8" /></div>
              <div className="relative z-10 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate">Interactive Modules</h3>
                  <p className="text-indigo-200 text-sm truncate">Rich curriculum & quizzes.</p>
              </div>
            </button>
             <button onClick={() => onStart('analysis', 'ALL')} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-left flex items-center gap-6 min-h-[120px]">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 flex-shrink-0"><PenTool className="w-8 h-8" /></div>
              <div className="min-w-0"><h3 className="text-xl font-bold text-slate-900 truncate">Document Analysis</h3><p className="text-slate-500 text-sm truncate">Higher order thinking.</p></div>
            </button>
            <button onClick={() => onStart('textbook', 'ALL')} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-left flex items-center gap-6 min-h-[120px]">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 flex-shrink-0"><Book className="w-8 h-8" /></div>
              <div className="min-w-0"><h3 className="text-xl font-bold text-slate-900 truncate">Digital Reader</h3><p className="text-slate-500 text-sm truncate">Focus Mode.</p></div>
            </button>
            <button onClick={() => onStart('outline', 'ALL')} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-left flex items-center gap-6 min-h-[120px]">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 flex-shrink-0"><List className="w-8 h-8" /></div>
              <div className="min-w-0"><h3 className="text-xl font-bold text-slate-900 truncate">Benchmarks</h3><p className="text-slate-500 text-sm truncate">Course standards.</p></div>
            </button>
          </div>
        </div>
    </div>
  );
};

export default StartView;
