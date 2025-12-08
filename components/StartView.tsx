import React from 'react';
import { BookOpen, History, Clock, BrainCircuit, Landmark, Flag } from 'lucide-react';
import { SubjectId } from '../types';

interface StartViewProps {
  subjectId: SubjectId;
  title: string;
  description: string;
  totalQuestions: number;
  onStart: () => void;
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
      case 'us-history': return <Flag className="w-16 h-16 text-blue-600" />;
      default: return <History className="w-16 h-16 text-blue-600" />;
    }
  };

  const isDisabled = totalQuestions === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8 p-6 bg-blue-100 rounded-full">
        {getIcon()}
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
        {title} <span className="text-blue-600">Midterm Prep</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-10 max-w-lg">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <BookOpen className="w-8 h-8 text-emerald-500 mb-2" />
          <h3 className="font-semibold text-slate-800">Midterm</h3>
          <p className="text-sm text-slate-500">Exam Focus</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <Clock className="w-8 h-8 text-amber-500 mb-2" />
          <h3 className="font-semibold text-slate-800">Quick Study</h3>
          <p className="text-sm text-slate-500">Fast-paced format</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <BrainCircuit className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-semibold text-slate-800">
             {isDisabled ? 'Coming Soon' : `${totalQuestions} Questions`}
          </h3>
          <p className="text-sm text-slate-500">Instant feedback</p>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={isDisabled}
        className={`w-full md:w-auto px-10 py-4 text-xl font-bold rounded-2xl shadow-lg transition-all transform 
          ${isDisabled 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white hover:-translate-y-1'
          }`}
      >
        {isDisabled ? 'Questions Coming Soon' : 'Start Studying'}
      </button>
    </div>
  );
};

export default StartView;