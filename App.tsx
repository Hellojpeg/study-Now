
import React, { useState, useEffect } from 'react';
import StartView from './components/StartView';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import LandingView from './components/LandingView';
import MatchingGame from './components/MatchingGame';
import MultiplayerGame from './components/MultiplayerGame'; // Import new component
import { QuizState, SubjectId, GameMode } from './types';
import { QUIZZES } from './constants';
import { BookOpen, Users } from 'lucide-react';

const App: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectId>('world-history');
  const [gameState, setGameState] = useState<QuizState>(QuizState.LANDING);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<number[]>([]);
  const [energy, setEnergy] = useState(0);
  const [combo, setCombo] = useState(0); // Track combo streak

  const currentQuiz = QUIZZES[activeSubject];

  // Reset scroll on state change for better UX
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameState, currentQuestionIndex, activeSubject]);

  const handleLandingSelect = (subject: SubjectId) => {
    setActiveSubject(subject);
    setGameState(QuizState.START);
    // Reset states
    setScore(0);
    setMissedQuestions([]);
    setEnergy(0);
    setCombo(0);
  };

  const handleSubjectChange = (subject: SubjectId) => {
    if (activeSubject !== subject) {
        setActiveSubject(subject);
        setGameState(QuizState.START);
        setCurrentQuestionIndex(0);
        setScore(0);
        setMissedQuestions([]);
        setEnergy(0);
        setCombo(0);
    }
  };

  const handleStart = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(QuizState.PLAYING);
    setCurrentQuestionIndex(0);
    setScore(0);
    setMissedQuestions([]);
    setEnergy(0);
    setCombo(0);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      setEnergy(prev => Math.min(100, prev + 10)); // Increase energy
      setCombo(prev => prev + 1); // Increase combo
    } else {
      setMissedQuestions(prev => [...prev, currentQuiz.questions[currentQuestionIndex].id]);
      setEnergy(prev => Math.max(0, prev - 10)); // Decrease energy
      setCombo(0); // Reset combo
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(QuizState.FINISHED);
    }
  };

  const handleRestart = () => {
    setGameState(QuizState.START);
    setEnergy(0);
    setCombo(0);
  };

  const handleHomeClick = () => {
    setGameState(QuizState.LANDING);
    setScore(0);
    setMissedQuestions([]);
    setEnergy(0);
    setCombo(0);
  };

  const handleMultiplayerClick = () => {
      setGameState(QuizState.MULTIPLAYER);
  }

  const getTabStyle = (id: SubjectId) => {
    const isActive = activeSubject === id;
    return `px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        isActive 
        ? 'bg-slate-800 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
    }`;
  };

  // Render logic based on Game Mode and State
  const renderContent = () => {
    // 1. Landing Page
    if (gameState === QuizState.LANDING) {
      return <LandingView onSelectSubject={handleLandingSelect} />;
    }

    // 2. Multiplayer
    if (gameState === QuizState.MULTIPLAYER) {
        return <MultiplayerGame subjectId={activeSubject} onExit={handleHomeClick} />;
    }

    // 3. Start Screen (Mode Selection)
    if (gameState === QuizState.START) {
      return (
        <StartView 
          subjectId={currentQuiz.id}
          title={currentQuiz.title}
          description={currentQuiz.description}
          totalQuestions={currentQuiz.questions.length}
          onStart={handleStart} 
        />
      );
    }

    // 4. Playing State
    if (gameState === QuizState.PLAYING) {
      if (gameMode === 'matching') {
        return (
          <MatchingGame 
            questions={currentQuiz.questions}
            onFinish={() => setGameState(QuizState.FINISHED)}
            onExit={handleHomeClick}
          />
        );
      }
      
      return (
        <QuizView 
          question={currentQuiz.questions[currentQuestionIndex]}
          currentNumber={currentQuestionIndex + 1}
          totalQuestions={currentQuiz.questions.length}
          energy={energy}
          gameMode={gameMode}
          combo={combo}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
        />
      );
    }

    // 5. Finished State
    if (gameState === QuizState.FINISHED) {
      return (
        <ResultView 
          result={{
            score,
            totalQuestions: currentQuiz.questions.length,
            missedQuestions
          }}
          allQuestions={currentQuiz.questions}
          onRestart={handleRestart}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-200">
      {/* Navbar / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Logo & Title */}
                <button 
                  onClick={handleHomeClick}
                  className="font-bold text-lg text-slate-800 flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">
                        <BookOpen className="w-5 h-5" />
                    </span>
                    <span>Mr. Gomez's Class</span>
                </button>

                {/* Subject Tabs - Only show if NOT on Landing Page */}
                {gameState !== QuizState.LANDING && gameState !== QuizState.MULTIPLAYER && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full overflow-x-auto max-w-full animate-fadeIn">
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
                )}
                
                {/* Multiplayer / Host Tab */}
                {gameState !== QuizState.MULTIPLAYER && gameState !== QuizState.LANDING && (
                    <button 
                        onClick={handleMultiplayerClick}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
                    >
                        <Users className="w-4 h-4" /> Host / Join
                    </button>
                )}

                {/* Score Display (only when playing Standard/Speed) */}
                <div className="hidden sm:block min-w-[80px] text-right">
                    {gameState === QuizState.PLAYING && gameMode !== 'matching' && (
                        <div className="text-sm font-medium text-slate-500">
                        Score: <span className="text-slate-900 font-bold">{score}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`${gameState === QuizState.MULTIPLAYER ? 'p-0' : 'py-8 px-4'}`}>
        {renderContent()}
      </main>

       {/* Simple footer - Hide in multiplayer */}
       {gameState !== QuizState.MULTIPLAYER && (
        <footer className="text-center py-6 text-slate-400 text-sm">
            Mr. Gomez's Class &copy; {new Date().getFullYear()}
        </footer>
       )}
    </div>
  );
};

export default App;
