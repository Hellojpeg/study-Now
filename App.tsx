
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './convex/_generated/api';
import StartView from './components/StartView';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView'; 
import TeacherDashboardView from './components/TeacherDashboardView'; 
import AuthView from './components/AuthView'; 
import MatchingGame from './components/MatchingGame';
import FlashCardsGame from './components/FlashCardsGame';
import MultiplayerGame from './components/MultiplayerGame';
import JeopardyGame from './components/JeopardyGame';
import WordleGame from './components/WordleGame';
import BookView from './components/BookView';
import OutlineView from './components/OutlineView';
import CourseModulesView from './components/CourseModulesView';
import BossBattleGame from './components/BossBattleGame';
import CommerceGame from './components/CommerceGame';
import TicTacToeGame from './components/TicTacToeGame';
import HangmanGame from './components/HangmanGame';
import DeductionGame from './components/DeductionGame';
import TowerDefenseGame from './components/TowerDefenseGame';
import WheelFortuneGame from './components/WheelFortuneGame';
import MillionaireGame from './components/MillionaireGame';
import AnalysisGame from './components/AnalysisGame';
import StrategyGame from './components/StrategyGame';
import ClassRoyaleGame from './components/ClassRoyaleGame';
import StudySnakeGame from './components/StudySnakeGame';
import { QuizState, SubjectId, GameMode, Question, User, CourseModule, CourseContent } from './types';
import { QUIZZES, CIVICS_COURSE_CONTENT, CIVICS_MODULES, WORLD_HISTORY_COURSE_CONTENT, WORLD_HISTORY_MODULES, US_HISTORY_MODULES, US_HISTORY_COURSE_CONTENT } from './constants';
import { BookOpen, Users, LogIn, UserCircle, LayoutDashboard, LogOut } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { Id } from './convex/_generated/dataModel';

const App: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<SubjectId>('world-history');
  const [gameState, setGameState] = useState<QuizState>(QuizState.LANDING);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<number[]>([]);
  const [energy, setEnergy] = useState(0);
  const [combo, setCombo] = useState(0); 
  
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  
  // Auth State - Bypassed: Default to guest user so everyone can use the app
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    // First check localStorage, then sessionStorage for existing user
    try {
      const local = localStorage.getItem('user');
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem('user');
      if (session) return JSON.parse(session);
    } catch (e) {
      // ignore
    }
    // Default guest user - auth bypassed for now
    return {
      id: 'guest',
      name: 'Guest',
      email: 'guest@example.com',
      role: 'STUDENT' as const,
    };
  });

  // ============ CONVEX DATA FETCHING ============
  
  // Fetch all courses from database
  const dbCourses = useQuery(api.functions.courses.list) ?? [];
  
  // Get the current course based on active subject
  const currentCourse = useMemo(() => {
    return dbCourses.find(c => c.subjectId === activeSubject);
  }, [dbCourses, activeSubject]);
  
  // Fetch questions for the current course from database
  const dbQuestions = useQuery(
    api.functions.questions.listByCourse,
    currentCourse ? { courseId: currentCourse._id } : "skip"
  ) ?? [];
  
  // Fetch modules for the current course from database
  const dbModules = useQuery(
    api.functions.modules.listByCourse,
    currentCourse ? { courseId: currentCourse._id } : "skip"
  ) ?? [];
  
  // Progress mutation for recording quiz attempts
  const recordQuizAttempt = useMutation(api.functions.progress.recordQuizAttempt);
  
  // Convert DB questions to Question type with fallback to constants
  const currentQuestions: Question[] = useMemo(() => {
    if (dbQuestions.length > 0) {
      return dbQuestions.map((q, index) => ({
        id: index + 1, // Use index as id since DB uses _id
        unit: q.unit,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        hint: q.hint,
        quarter: q.quarter as Question['quarter'],
        week: q.week,
        image: q.image,
        benchmark: q.benchmark,
        questionType: q.questionType as Question['questionType'],
        bloomLevel: q.bloomLevel as Question['bloomLevel'],
      }));
    }
    // Fallback to constants if database is empty
    return QUIZZES[activeSubject]?.questions || [];
  }, [dbQuestions, activeSubject]);

  // Build current quiz data structure
  const currentQuiz = useMemo(() => {
    const fallbackQuiz = QUIZZES[activeSubject];
    return {
      id: activeSubject,
      title: currentCourse?.name || fallbackQuiz?.title || activeSubject,
      description: currentCourse?.description || fallbackQuiz?.description || '',
      questions: currentQuestions,
    };
  }, [activeSubject, currentCourse, currentQuestions]);

  // Dynamic Content Loading based on Subject - with Convex fallback
  const currentModules: CourseModule[] = useMemo(() => {
    if (dbModules.length > 0) {
      return dbModules.map((m, index) => ({
        id: index + 1,
        title: m.title,
        focus: m.focus,
        keyTopics: m.keyTopics,
        standardCodes: m.standardCodes,
        keyConcepts: m.keyConcepts,
      }));
    }
    // Fallback to constants
    if (activeSubject === 'civics') return CIVICS_MODULES;
    if (activeSubject === 'us-history') return US_HISTORY_MODULES;
    return WORLD_HISTORY_MODULES;
  }, [dbModules, activeSubject]);

  const currentCourseContent: CourseContent = useMemo(() => {
    // For now, fall back to constants for course content
    // TODO: Fetch from lessons/chapters tables
    if (activeSubject === 'civics') return CIVICS_COURSE_CONTENT;
    if (activeSubject === 'us-history') return US_HISTORY_COURSE_CONTENT;
    return WORLD_HISTORY_COURSE_CONTENT;
  }, [activeSubject]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameState, currentQuestionIndex, activeSubject]);

  const handleLandingSelect = (subject: SubjectId) => {
    setActiveSubject(subject);
    setGameState(QuizState.START);
    setScore(0);
    setMissedQuestions([]);
    setEnergy(0);
    setCombo(0);
    setGameQuestions([]);
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
        setGameQuestions([]);
    }
  };

  // Helper to filter questions based on scope
  const getFilteredQuestions = (scope: string) => {
      let filtered = [...currentQuiz.questions];
      
      if (scope === 'ALL') {
          return filtered;
      }

      // 1. Check for specific Q#-W# format (e.g., Q2-W9)
      const weekMatch = scope.match(/^(Q\d)-W(\d)$/);
      if (weekMatch) {
          const targetQuarter = weekMatch[1];
          const targetWeek = parseInt(weekMatch[2]);
          filtered = filtered.filter(q => q.quarter === targetQuarter && q.week === targetWeek);
          
          if (filtered.length === 0) {
              console.warn(`No questions found specifically for ${scope}. Falling back to ${targetQuarter}.`);
              filtered = currentQuiz.questions.filter(q => q.quarter === targetQuarter);
          }
      } 
      else if (['MID', 'FIN', 'Q1', 'Q2', 'Q3', 'Q4'].includes(scope)) {
          filtered = filtered.filter(q => q.quarter === scope);
      } 
      else {
          filtered = filtered.filter(q => q.unit === scope);
      }

      if (filtered.length === 0) {
          alert(`No questions found for section "${scope}". Loading all questions instead.`);
          return [...currentQuiz.questions];
      }

      return filtered;
  };

  const handleStart = (mode: GameMode, scope: string = 'ALL') => {
    if (['textbook', 'outline', 'modules', 'analysis'].includes(mode)) {
        setGameMode(mode);
        setGameState(QuizState.PLAYING);
        return;
    }

    let filteredQuestions = getFilteredQuestions(scope);

    for (let i = filteredQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
    }

    setGameQuestions(filteredQuestions);
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
      setEnergy(prev => Math.min(100, prev + 10)); 
      setCombo(prev => prev + 1); 
    } else {
      if (gameQuestions[currentQuestionIndex]) {
          setMissedQuestions(prev => [...prev, gameQuestions[currentQuestionIndex].id]);
      }
      setEnergy(prev => Math.max(0, prev - 10)); 
      setCombo(0); 
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished - record attempt if we have valid user and course
      handleQuizComplete();
      setGameState(QuizState.FINISHED);
    }
  };

  // Record quiz completion to database
  const handleQuizComplete = async () => {
    // Only record if we have a valid Convex user ID (not guest)
    if (!user || user.id === 'guest' || !currentCourse) {
      console.log('Skipping quiz recording: guest user or no course');
      return;
    }

    try {
      const correctAnswers = score;
      const totalQuestions = gameQuestions.length;
      
      // Note: missedQuestions contains numeric IDs, not Convex IDs
      // For now, we pass an empty array since we can't map them
      await recordQuizAttempt({
        userId: user.id as Id<"users">,
        courseId: currentCourse._id,
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        correctAnswers,
        missedQuestionIds: [], // TODO: Map numeric IDs to Convex IDs
        gameMode,
      });
      console.log('Quiz attempt recorded successfully');
    } catch (err) {
      console.error('Failed to record quiz attempt:', err);
    }
  };

  const handleRestart = () => {
    setGameState(QuizState.START);
    setEnergy(0);
    setCombo(0);
    setGameQuestions([]);
  };

  const handleHomeClick = () => {
    if (user) {
        if (user.role === 'TEACHER') {
            setGameState(QuizState.TEACHER_DASHBOARD);
        } else {
            setGameState(QuizState.DASHBOARD);
        }
    } else {
        setGameState(QuizState.LANDING);
    }
    setScore(0);
    setMissedQuestions([]);
    setEnergy(0);
    setCombo(0);
    setGameQuestions([]);
  };

  const handleMultiplayerClick = () => {
      setGameState(QuizState.MULTIPLAYER);
  }

  const handleLogin = (user: User) => {
      setUser(user);
      setShowAuth(false);
      if (user.role === 'TEACHER') {
          setGameState(QuizState.TEACHER_DASHBOARD);
      } else {
          setGameState(QuizState.DASHBOARD);
      }
  }

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      setGameState(QuizState.LANDING);
  }

  const handleDashboardAssignment = (mode: GameMode, subject: SubjectId) => {
      if (subject !== activeSubject) {
          setActiveSubject(subject);
      }
      handleStart(mode);
  };

  const getTabStyle = (id: SubjectId) => {
    const isActive = activeSubject === id;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
        isActive 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  const renderContent = () => {
    if (gameState === QuizState.LANDING) {
      return <LandingView onSelectSubject={handleLandingSelect} />;
    }

    if (gameState === QuizState.DASHBOARD) {
        return <DashboardView onStartAssignment={handleDashboardAssignment} userName={user?.name || "Student"} />;
    }

    if (gameState === QuizState.TEACHER_DASHBOARD && user?.role === 'TEACHER') {
        return (
            <ErrorBoundary>
                <TeacherDashboardView user={user} />
            </ErrorBoundary>
        );
    }

    if (gameState === QuizState.MULTIPLAYER) {
        return <MultiplayerGame subjectId={activeSubject} onExit={handleHomeClick} />;
    }

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

    if (gameState === QuizState.PLAYING) {
      // Wrap all game modes in ErrorBoundary for graceful error handling
      const renderGameContent = () => {
        if (gameMode === 'textbook') return <BookView content={currentCourseContent} onExit={() => setGameState(QuizState.START)} />;
        if (gameMode === 'outline') return <OutlineView content={currentCourseContent} onExit={() => setGameState(QuizState.START)} />;
        if (gameMode === 'modules') return <CourseModulesView modules={currentModules} courseContent={currentCourseContent} onExit={() => setGameState(QuizState.START)} />;
        if (gameMode === 'matching') return <MatchingGame questions={gameQuestions} onFinish={() => setGameState(QuizState.FINISHED)} onExit={handleHomeClick} />;
        if (gameMode === 'flashcards') return <FlashCardsGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'jeopardy') return <JeopardyGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'wordle') return <WordleGame questions={gameQuestions} onExit={handleHomeClick} />;
        
        // Arcade Modes
        if (gameMode === 'boss') return <BossBattleGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'commerce') return <CommerceGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'tictactoe') return <TicTacToeGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'hangman') return <HangmanGame questions={gameQuestions} onExit={handleHomeClick} />;
        
        // New Strategy Modes
        if (gameMode === 'connect4' || gameMode === 'battleship' || gameMode === 'risk' || gameMode === 'checkers') {
            return <StrategyGame questions={gameQuestions} mode={gameMode} onExit={handleHomeClick} />;
        }

        // New Arcade Modes
        if (gameMode === 'guesswho') return <DeductionGame questions={gameQuestions} mode="guesswho" onExit={handleHomeClick} />;
        if (gameMode === 'guesswhat') return <DeductionGame questions={gameQuestions} mode="guesswhat" onExit={handleHomeClick} />;
        if (gameMode === 'towerdefense') return <TowerDefenseGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'wheel') return <WheelFortuneGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'millionaire') return <MillionaireGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'analysis') return <AnalysisGame onExit={handleHomeClick} />;
        if (gameMode === 'classroyale') return <ClassRoyaleGame questions={gameQuestions} onExit={handleHomeClick} />;
        if (gameMode === 'studysnake') return <StudySnakeGame questions={gameQuestions} onExit={handleHomeClick} />;

        if (gameQuestions.length === 0) return <div className="text-center p-8">Loading...</div>;

        return (
          <QuizView 
            question={gameQuestions[currentQuestionIndex]}
            currentNumber={currentQuestionIndex + 1}
            totalQuestions={gameQuestions.length}
            energy={energy}
            gameMode={gameMode}
            combo={combo}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
          />
        );
      };
      
      // Wrap game content in ErrorBoundary for graceful error handling
      return <ErrorBoundary>{renderGameContent()}</ErrorBoundary>;
    }

    if (gameState === QuizState.FINISHED) {
      return (
        <ResultView 
          result={{ score, totalQuestions: gameQuestions.length, missedQuestions }}
          allQuestions={currentQuiz.questions} 
          onRestart={handleRestart}
        />
      );
    }
  };

  const isImmersiveMode = gameState === QuizState.MULTIPLAYER || gameMode === 'boss' || gameMode === 'towerdefense' || gameMode === 'millionaire' || gameMode === 'wheel' || gameMode === 'analysis' || gameMode === 'connect4' || gameMode === 'battleship' || gameMode === 'risk' || gameMode === 'classroyale' || gameMode === 'studysnake';

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
      {!isImmersiveMode && (
      <nav className="fixed top-4 left-0 right-0 mx-auto max-w-7xl w-[95%] z-50 transition-all duration-300">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/10 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
                <button 
                  onClick={handleHomeClick}
                  className="font-extrabold text-xl text-slate-900 flex items-center gap-3 hover:opacity-70 transition-opacity tracking-tight"
                >
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <span>Mr. Gomez's Class</span>
                </button>

                {gameState !== QuizState.LANDING && gameState !== QuizState.DASHBOARD && gameState !== QuizState.TEACHER_DASHBOARD && (
                  <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50">
                      <button onClick={() => handleSubjectChange('world-history')} className={getTabStyle('world-history')}>World History</button>
                      <button onClick={() => handleSubjectChange('civics')} className={getTabStyle('civics')}>Civics</button>
                      <button onClick={() => handleSubjectChange('us-history')} className={getTabStyle('us-history')}>US History</button>
                  </div>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {user && gameState !== QuizState.DASHBOARD && gameState !== QuizState.TEACHER_DASHBOARD && (
                    <button onClick={handleHomeClick} className="text-slate-600 hover:text-indigo-600 font-bold text-sm px-4 py-2 flex items-center gap-2 hover:bg-slate-50 rounded-xl transition-all">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                )}

                {gameState !== QuizState.LANDING && (
                    <button onClick={handleMultiplayerClick} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                        <Users className="w-4 h-4" /> Multiplayer
                    </button>
                )}
                
                {!user ? (
                    <button onClick={() => setShowAuth(true)} className="text-slate-600 hover:text-indigo-600 font-bold text-sm px-4 py-2 flex items-center gap-2 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-all">
                        <LogIn className="w-4 h-4" /> Log In
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                            <UserCircle className="w-4 h-4 text-emerald-500" />
                            {user.name}
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </nav>
      )}

      {isImmersiveMode && gameState === QuizState.TEACHER_DASHBOARD && (
          <div className="fixed top-4 right-4 z-50">
              <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur-sm transition-all shadow-lg flex items-center gap-2 text-sm font-bold">
                  <LogOut className="w-4 h-4" /> Logout
              </button>
          </div>
      )}

      <main className={`transition-all duration-500 ${isImmersiveMode ? 'pt-0' : 'pt-32'} pb-12 ${gameState === QuizState.TEACHER_DASHBOARD ? '' : 'px-4 md:px-6'}`}>
        {renderContent()}
      </main>

       {showAuth && (
           <AuthView onLogin={handleLogin} onCancel={() => setShowAuth(false)} />
       )}
    </div>
  );
};

export default App;
