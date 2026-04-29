
import React, { useState, useEffect } from 'react';
import { BookOpen, History, Landmark, Zap, LayoutGrid, Calendar, Sword, Coins, Shield, DollarSign, Grid3X3, Crosshair, Circle, Swords, MousePointer2 } from 'lucide-react';
import { SubjectId, GameMode } from '../types';
import { QUIZZES } from '../constants';

interface StartViewProps {
  subjectId: SubjectId;
  title: string;
  description: string;
  totalQuestions: number;
  onStart: (mode: GameMode, scope: string) => void;
  isAdmin?: boolean;
  hiddenModes?: GameMode[];
  onToggleGameVisibility?: (mode: GameMode) => void;
}

type ModeCard = {
  id: GameMode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  bg: string;
  description?: string;
  featuredStyle?: string;
};

const FEATURED_MODES: ModeCard[] = [
  {
    id: 'standard',
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Quiz Mode',
    description: 'Standard multiple choice mastery.',
    featuredStyle: 'group bg-white rounded-2xl p-4 border border-slate-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left flex flex-col h-full relative overflow-hidden',
  },
  {
    id: 'classroyale',
    icon: Swords,
    color: 'text-white',
    bg: 'bg-blue-500',
    title: 'Class Royale',
    description: 'Strategy & Deck Combat',
    featuredStyle: 'group bg-slate-900 rounded-2xl p-4 shadow-xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 text-left flex flex-col h-full relative overflow-hidden ring-4 ring-blue-500/10',
  },
  {
    id: 'studysnake',
    icon: MousePointer2,
    color: 'text-white',
    bg: 'bg-white/10',
    title: 'Study Snake',
    description: 'Arcade Rapid Review',
    featuredStyle: 'group bg-emerald-600 rounded-2xl p-4 shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1 text-left flex flex-col h-full relative overflow-hidden ring-4 ring-emerald-500/10',
  },
];

const ARCADE_MODES: ModeCard[] = [
  { id: 'jeopardy', icon: LayoutGrid, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Jeopardy' },
  { id: 'speed', icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Speed Run' },
  { id: 'boss', icon: Sword, color: 'text-red-500', bg: 'bg-red-50', title: 'Boss Battle' },
  { id: 'commerce', icon: Coins, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Tycoon' },
  { id: 'towerdefense', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50', title: 'TD Game' },
  { id: 'millionaire', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Millionaire' },
  { id: 'connect4', icon: Grid3X3, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Connect 4' },
  { id: 'battleship', icon: Crosshair, color: 'text-sky-500', bg: 'bg-sky-50', title: 'Battleship' },
  { id: 'risk', icon: Swords, color: 'text-rose-500', bg: 'bg-rose-50', title: 'Conquest' },
  { id: 'checkers', icon: Circle, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Checkers' },
];

const MANAGED_MODES: GameMode[] = Array.from(new Set([...FEATURED_MODES.map(m => m.id), ...ARCADE_MODES.map(m => m.id)]));

const StartView: React.FC<StartViewProps> = ({ 
  subjectId, 
  title, 
  description, 
  totalQuestions, 
  onStart,
  isAdmin = false,
  hiddenModes = [],
  onToggleGameVisibility,
}) => {
  const [selectedScope, setSelectedScope] = useState(''); // Default empty to enforce choice
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const hiddenSet = new Set(hiddenModes);

  const visibleFeaturedModes = FEATURED_MODES.filter((mode) => isAdmin || !hiddenSet.has(mode.id));
  const visibleArcadeModes = ARCADE_MODES.filter((mode) => isAdmin || !hiddenSet.has(mode.id));

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
      case 'civics': return <Landmark className="w-10 h-10 text-white" />;
      default: return <History className="w-10 h-10 text-white" />;
    }
  };

  const getHeaderColor = () => {
    switch(subjectId) {
      case 'civics': return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30';
      default: return 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30';
    }
  };

    const handleStartGame = (mode: GameMode) => {
    if (!selectedScope) return; 
    onStart(mode, selectedScope);
  };

    const getButtonClass = (baseClass: string, mode: GameMode) => {
      if (!selectedScope) {
          return `${baseClass} opacity-50 grayscale cursor-not-allowed transform-none hover:translate-y-0 hover:shadow-none`;
      }
      if (!isAdmin && hiddenSet.has(mode)) {
        return `${baseClass} hidden`;
      }
      if (isAdmin && hiddenSet.has(mode)) {
        return `${baseClass} opacity-60 border-dashed border-rose-300`;
      }
      return baseClass;
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn max-w-[95vw] mx-auto px-4 pb-12 w-full h-[85vh] overflow-hidden">
      {/* Reduced Header Height to fit Viewport */}
      <div className="flex flex-col items-center text-center mb-4 pt-2 w-full shrink-0">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-xl mb-3 ${getHeaderColor()}`}>
             {getHeaderIcon()}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">
            {title} Prep
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg font-medium px-4">
            {description}
          </p>
      </div>

      {/* Scope Selector Widget */}
      <div className="w-full max-w-lg mb-6 relative group z-20 shrink-0">
         <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur transition duration-1000 ${selectedScope ? 'opacity-20' : 'opacity-60 animate-pulse'}`}></div>
         <div className="relative bg-white p-2 rounded-2xl shadow-xl flex items-center border border-slate-100">
            <div className={`pl-4 pr-2 ${!selectedScope ? 'text-indigo-500' : 'text-slate-400'}`}>
                <Calendar className="w-6 h-6" />
            </div>
            <select 
                value={selectedScope} 
                onChange={(e) => setSelectedScope(e.target.value)}
                className="w-full p-2 md:p-3 bg-transparent font-bold text-slate-800 text-sm md:text-base focus:outline-none cursor-pointer truncate pr-8"
            >
                <option value="" disabled>Select a Unit or Exam Section...</option>
                
                <optgroup label="Exam Review Prep">
                    <option value="MID">Midterm (Q1/Q2 Review)</option>
                    <option value="FIN">EOC Final Exam Practice (Cumulative)</option>
                    <option value="ALL">Complete Question Bank</option>
                </optgroup>

                {availableUnits.length > 0 && (
                    <optgroup label="Specific Study Sections">
                        {availableUnits.map(unit => (
                            <option key={unit} value={unit}>
                               {unit}
                            </option>
                        ))}
                    </optgroup>
                )}
                
                <optgroup label="Quarter Content">
                    <option value="Q1">Quarter 1 Content</option>
                    <option value="Q2">Quarter 2 Content</option>
                    <option value="Q3">Quarter 3 Content</option>
                    <option value="Q4">Quarter 4 Content</option>
                </optgroup>
            </select>
         </div>
         {!selectedScope && (
             <div className="text-center mt-2 text-indigo-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
                 Select a section to unlock game modes
             </div>
         )}
      </div>

      {isAdmin && (
        <div className="w-full max-w-4xl mb-4 p-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 shrink-0">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 mb-2">Admin Game Visibility</div>
          <div className="flex flex-wrap gap-2">
            {MANAGED_MODES.map((mode) => {
              const isHidden = hiddenSet.has(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onToggleGameVisibility?.(mode)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${isHidden ? 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50' : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'}`}
                >
                  {isHidden ? 'Show' : 'Hide'} {mode}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SCROLLABLE MODES AREA to prevent viewport overflow */}
      <div className="w-full overflow-y-auto pr-2 custom-scrollbar flex-grow">
          {/* CORE MODES */}
          <div className="w-full mb-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Featured Modes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {visibleFeaturedModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleStartGame(mode.id)}
                      disabled={!selectedScope}
                      className={getButtonClass(mode.featuredStyle || '', mode.id)}
                    >
                      <div className={`${mode.bg} w-10 h-10 rounded-xl flex items-center justify-center ${mode.color} mb-3 group-hover:scale-110 transition-transform`}>
                        <mode.icon className="w-5 h-5" />
                      </div>
                      <h3 className={`text-base font-bold mb-0.5 ${mode.id === 'standard' ? 'text-slate-900' : 'text-white'}`}>{mode.title}</h3>
                      <p className={`text-[10px] font-bold ${mode.id === 'standard' ? 'text-slate-500 font-medium' : mode.id === 'classroyale' ? 'text-blue-300' : 'text-emerald-100'}`}>{mode.description}</p>
                    </button>
                  ))}
              </div>
          </div>

          {/* ARCADE GRID */}
          <div className="w-full">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">More Ways to Play</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pb-6">
                   {visibleArcadeModes.map(game => (
                       <button 
                         key={game.id}
                         onClick={() => handleStartGame(game.id as GameMode)} 
                         disabled={!selectedScope}
                         className={getButtonClass("flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all text-left group", game.id)}
                       >
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${game.bg} group-hover:scale-110 transition-transform`}>
                               <game.icon className={`w-4 h-4 ${game.color}`} />
                           </div>
                           <div className="min-w-0">
                               <div className="font-bold text-slate-800 truncate text-[11px]">{game.title}</div>
                           </div>
                       </button>
                   ))}
              </div>
              {!isAdmin && visibleFeaturedModes.length + visibleArcadeModes.length === 0 && (
                <div className="text-center text-sm font-semibold text-slate-500 py-6">Games are currently hidden by your teacher.</div>
              )}
          </div>
      </div>
    </div>
  );
};

export default StartView;
