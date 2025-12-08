import React from 'react';
import { BookOpen, History, Clock, BrainCircuit, Landmark, Flag, Zap, Layers } from 'lucide-react';
import { SubjectId, GameMode } from '../types';

interface StartViewProps {
  subjectId: SubjectId;
  title: string;
  description: string;
  totalQuestions: number;
  onStart: (mode: GameMode) => void;
}

const StartView: React.FC<StartViewProps> = ({ 
  subjectId, 
  title, 
  description, 
  totalQuestions, 
  onStart 
}) => {
  const getIcon = () => {
    switch(subjectId) {
      case 'civics': return <Landmark className="w-16 h-16 text-blue-600" />;
      case 'us-history': return <Flag className="w-16 h-16 text-red-600" />;
      default: return <History className="w-16 h-16 text-emerald-600" />;
    }
  };

  const isDisabled = totalQuestions === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6 p-6 bg-white rounded-full shadow-lg">
        {getIcon()}
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
        {title} <span className="text-blue-600">Midterm Prep</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-12 max-w-lg mx-auto">
        {description}
      </p>

      {/* Game Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Standard Mode */}
        <button
          onClick={() => onStart('standard')}
          disabled={isDisabled}
          className="bg-white group hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left flex flex-col h-full"
        >
          <div className="p-3 bg-blue-100 rounded-2xl w-fit mb-4 text-blue-600 group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Standard Mode</h3>
          <p className="text-slate-500 text-sm mb-4 flex-grow">
            Classic multiple choice. Learn at your own pace with hints and instant feedback.
          </p>
          <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center text-blue-600 font-bold text-sm">
            Start Standard
          </div>
        </button>

        {/* Speed Mode */}
        <button
          onClick={() => onStart('speed')}
          disabled={isDisabled}
          className="bg-white group hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white text-xs font-bold rounded-bl-xl">
             Hardcore
          </div>
          <div className="p-3 bg-amber-100 rounded-2xl w-fit mb-4 text-amber-600 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Speed Mode</h3>
          <p className="text-slate-500 text-sm mb-4 flex-grow">
            10 seconds per question! Rack up combos to unleash lightning and fire.
          </p>
          <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center text-amber-600 font-bold text-sm">
            Start Speed Run
          </div>
        </button>

        {/* Matching Mode */}
        <button
          onClick={() => onStart('matching')}
          disabled={isDisabled}
          className="bg-white group hover:bg-purple-50 border-2 border-slate-100 hover:border-purple-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left flex flex-col h-full"
        >
          <div className="p-3 bg-purple-100 rounded-2xl w-fit mb-4 text-purple-600 group-hover:scale-110 transition-transform">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Memory Match</h3>
          <p className="text-slate-500 text-sm mb-4 flex-grow">
            Flip cards to match questions with answers. Test your recall memory.
          </p>
          <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center text-purple-600 font-bold text-sm">
            Start Matching
          </div>
        </button>
      </div>
    </div>
  );
};

export default StartView;