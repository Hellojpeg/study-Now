import React, { useState, useEffect } from 'react';
import StartView from './components/StartView';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import { QuizState, SubjectId } from './types';
import { QUIZZES } from './constants';
import { BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectId>('world-history');
  const [gameState, setGameState] = useState<QuizState>(QuizState.START);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<number[]>([]);

  const currentQuiz = QUIZZES[activeSubject];

  // Reset scroll on state change for better UX
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameState, currentQuestionIndex, activeSubject]);

  const handleSubjectChange = (subject: SubjectId) => {
    if (activeSubject !== subject) {
        setActiveSubject(subject);
        setGameState(QuizState.START);
        setCurrentQuestionIndex(0);
        setScore(0);
        setMissedQuestions([]);
    }
  };

  const handleStart = () => {
    setGameState(QuizState.PLAYING);
    setCurrentQuestionIndex(0);
    setScore(0);
    setMissedQuestions([]);
  };

  const handleNextQuestion = (wasCorrect: boolean) => {
    // Update score
    if (wasCorrect) {
      setScore(prev => prev + 1);
    } else {
      setMissedQuestions(prev => [...prev, currentQuiz.questions[currentQuestionIndex].id]);
    }

    // Move to next or finish
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(QuizState.FINISHED);
    }
  };

  const handleRestart = () => {
    setGameState(QuizState.START);
  };

  const getTabStyle = (id: SubjectId) => {
    const isActive = activeSubject === id;
    return `px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        isActive 
        ? 'bg-slate-800 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-200">
      {/* Navbar / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Logo & Title */}
                <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">
                        <BookOpen className="w-5 h-5" />
                    </span>
                    <span>Midterm Prep</span>
                </div>

                {/* Subject Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full overflow-x-auto max-w-full">
                    <button 
                        onClick={() => handleSubjectChange('world-history')} 
                        className={getTabStyle('world-history')}
                    >
                        World History
                    </button>
                    <button 
                        onClick={() => handleSubjectChange('civics')} 
                        className={getTabStyle('civics')}
                    >
                        Civics
                    </button>
                    <button 
                        onClick={() => handleSubjectChange('us-history')} 
                        className={getTabStyle('us-history')}
                    >
                        US History
                    </button>
                </div>

                {/* Score Display (only when playing) */}
                <div className="hidden sm:block min-w-[80px] text-right">
                    {gameState === QuizState.PLAYING && (
                        <div className="text-sm font-medium text-slate-500">
                        Score: <span className="text-slate-900 font-bold">{score}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="py-8 px-4">
        {gameState === QuizState.START && (
          <StartView 
            subjectId={currentQuiz.id}
            title={currentQuiz.title}
            description={currentQuiz.description}
            totalQuestions={currentQuiz.questions.length}
            onStart={handleStart} 
          />
        )}

        {gameState === QuizState.PLAYING && (
          <QuizView 
            question={currentQuiz.questions[currentQuestionIndex]}
            currentNumber={currentQuestionIndex + 1}
            totalQuestions={currentQuiz.questions.length}
            onNext={handleNextQuestion}
          />
        )}

        {gameState === QuizState.FINISHED && (
          <ResultView 
            result={{
              score,
              totalQuestions: currentQuiz.questions.length,
              missedQuestions
            }}
            allQuestions={currentQuiz.questions}
            onRestart={handleRestart}
          />
        )}
      </main>

       {/* Simple footer */}
       <footer className="text-center py-6 text-slate-400 text-sm">
        Midterm Prep Assistant &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;