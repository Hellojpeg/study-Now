import React from 'react';
import { Landmark, Flag, History, ArrowRight } from 'lucide-react';
import { SubjectId } from '../types';
import { QUIZZES } from '../constants';

interface LandingViewProps {
  onSelectSubject: (id: SubjectId) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onSelectSubject }) => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'civics': return <Landmark className="w-12 h-12 text-blue-600" />;
      case 'us-history': return <Flag className="w-12 h-12 text-red-600" />;
      default: return <History className="w-12 h-12 text-emerald-600" />;
    }
  };

  const getColorClasses = (id: string) => {
     switch(id) {
      case 'civics': return 'bg-blue-50 border-blue-100 hover:border-blue-300 hover:shadow-blue-100';
      case 'us-history': return 'bg-red-50 border-red-100 hover:border-red-300 hover:shadow-red-100';
      default: return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fadeIn">
      <div className="text-center mb-12 md:mb-16 space-y-4">
        <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-slate-200 text-slate-600 font-bold text-sm tracking-wide uppercase">
          Mr. Gomez's Class
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          Ace Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Midterms</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Select a subject below to start your rapid-fire study session. 
          Instant feedback, energy tracking, and gamified learning.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(QUIZZES).map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => onSelectSubject(quiz.id)}
            className={`
              relative group p-8 rounded-3xl border-2 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
              ${getColorClasses(quiz.id)}
            `}
          >
            <div className="mb-6 bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              {getIcon(quiz.id)}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
              {quiz.title}
            </h2>
            
            <p className="text-slate-600 font-medium leading-relaxed mb-8 min-h-[4.5rem]">
              {quiz.description}
            </p>

            <div className="flex items-center text-sm font-bold text-slate-800 uppercase tracking-wide">
              Start Studying 
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingView;