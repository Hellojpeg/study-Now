import React from 'react';
import { QuizResult, Question } from '../types';
import { RotateCcw, Award, AlertTriangle, BookOpenCheck } from 'lucide-react';

interface ResultViewProps {
  result: QuizResult;
  allQuestions: Question[];
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, allQuestions, onRestart }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  let gradeColor = 'text-red-500';
  let gradeBg = 'bg-red-50';
  let message = "Keep studying!";
  
  if (percentage >= 90) {
    gradeColor = 'text-emerald-500';
    gradeBg = 'bg-emerald-50';
    message = "Outstanding! You're ready.";
  } else if (percentage >= 70) {
    gradeColor = 'text-blue-500';
    gradeBg = 'bg-blue-50';
    message = "Good job! A little more review.";
  } else if (percentage >= 50) {
    gradeColor = 'text-amber-500';
    gradeBg = 'bg-amber-50';
    message = "Getting there, review the weak spots.";
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pb-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-8 text-center border-b border-slate-100">
           <div className={`inline-flex items-center justify-center p-4 rounded-full ${gradeBg} mb-4`}>
              <Award className={`w-12 h-12 ${gradeColor}`} />
           </div>
           <h1 className="text-3xl font-bold text-slate-900 mb-2">Session Complete</h1>
           <p className="text-slate-600 font-medium">{message}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
            <div className="bg-white p-6 text-center">
                <span className="block text-4xl font-extrabold text-slate-800 mb-1">{percentage}%</span>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Accuracy</span>
            </div>
            <div className="bg-white p-6 text-center">
                <span className="block text-4xl font-extrabold text-slate-800 mb-1">
                    {result.score}<span className="text-xl text-slate-400">/{result.totalQuestions}</span>
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Score</span>
            </div>
        </div>

        {/* Review Section */}
        <div className="p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                {result.missedQuestions.length > 0 ? (
                    <>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Review Needed ({result.missedQuestions.length})
                    </>
                ) : (
                    <>
                        <BookOpenCheck className="w-5 h-5 text-emerald-500" />
                        Perfect Score!
                    </>
                )}
            </h3>

            {result.missedQuestions.length > 0 ? (
                <div className="space-y-4">
                    {result.missedQuestions.map(id => {
                        const question = allQuestions.find(q => q.id === id);
                        if (!question) return null;
                        return (
                            <div key={id} className="p-4 rounded-xl bg-red-50 border border-red-100">
                                <div className="text-xs font-bold text-red-400 mb-1 uppercase">{question.unit}</div>
                                <p className="font-semibold text-slate-800 mb-2">{question.question}</p>
                                <div className="text-sm text-slate-600 bg-white p-2 rounded border border-red-100">
                                    <span className="font-bold text-emerald-600">Correct Answer: </span>
                                    {question.options[question.correctAnswerIndex]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No errors to review. You are a history master!
                </div>
            )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
            <button
                onClick={onRestart}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
                <RotateCcw className="w-5 h-5" />
                Study Again
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;