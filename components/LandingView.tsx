
import React from 'react';
import { Landmark, Flag, History, ArrowRight, Stars } from 'lucide-react';
import { SubjectId } from '../types';
import { QUIZZES } from '../constants';

interface LandingViewProps {
  onSelectSubject: (id: SubjectId) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onSelectSubject }) => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'civics': return <Landmark className="w-10 h-10 text-white" />;
      case 'us-history': return <Flag className="w-10 h-10 text-white" />;
      default: return <History className="w-10 h-10 text-white" />;
    }
  };

  const getGradient = (id: string) => {
    switch(id) {
      case 'civics': return 'from-blue-500 to-indigo-600 shadow-blue-500/30';
      case 'us-history': return 'from-red-500 to-rose-600 shadow-red-500/30';
      default: return 'from-emerald-500 to-teal-600 shadow-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Hero Section */}
      <div className="text-center mb-10 space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-widest shadow-sm">
          <Stars className="w-4 h-4 text-indigo-500" /> Midterm Prep 2024
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">History Midterms</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Rapid-fire study sessions with instant feedback and competitive game modes.
        </p>
      </div>

      {/* Cards Grid - 3 columns for core subjects */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
        {Object.values(QUIZZES).map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => onSelectSubject(quiz.id as SubjectId)}
            className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 text-left transition-all duration-500 hover:bg-white/80 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 flex flex-col h-full"
          >
            {/* Icon Blob */}
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-500
              ${getGradient(quiz.id)}
            `}>
              {getIcon(quiz.id)}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
              {quiz.title}
            </h2>
            
            <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow text-sm">
              {quiz.description}
            </p>

            <div className="flex items-center text-[10px] font-bold text-slate-900 uppercase tracking-widest pt-6 border-t border-slate-100/50">
              Select Units 
              <span className="ml-auto bg-slate-900 text-white rounded-full p-2 group-hover:bg-indigo-600 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingView;
