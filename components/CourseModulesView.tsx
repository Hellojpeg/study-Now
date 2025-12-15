
import React, { useState, useEffect } from 'react';
import { CourseModule, CourseContent, Lesson, SimpleQuizQuestion } from '../types';
import { ArrowLeft, List, ChevronRight, ChevronDown, Map, Layers, Circle, Target, Key, FileText, Bookmark, GraduationCap, CheckCircle, XCircle, AlertCircle, HelpCircle, Trophy, PenTool, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourseModulesViewProps {
  modules: CourseModule[];
  courseContent: CourseContent;
  onExit: () => void;
}

type ViewType = 'overview' | 'vocab' | 'lesson' | 'chapter-quiz' | 'project';

const CourseModulesView: React.FC<CourseModulesViewProps> = ({ modules, courseContent, onExit }) => {
  // Navigation State
  const [activeModuleId, setActiveModuleId] = useState<number>(modules[0]?.id || 1);
  const [activeViewType, setActiveViewType] = useState<ViewType>('overview');
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  
  // Expansion State for Sidebar
  const [expandedModuleIds, setExpandedModuleIds] = useState<number[]>([modules[0]?.id || 1]);
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);

  // Vocab State
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isVocabFlipped, setIsVocabFlipped] = useState(false);

  // Quiz State
  const [miniQuizAnswers, setMiniQuizAnswers] = useState<Record<string, number | null>>({});
  const [miniQuizResults, setMiniQuizResults] = useState<Record<string, boolean | null>>({});

  const [chapterQuizAnswers, setChapterQuizAnswers] = useState<Record<number, number | null>>({});
  const [chapterQuizSubmitted, setChapterQuizSubmitted] = useState(false);
  const [chapterQuizScore, setChapterQuizScore] = useState(0);

  const activeModule = modules.find(m => m.id === activeModuleId);

  // Initialize defaults when module changes (if needed)
  useEffect(() => {
    if (activeModule && activeViewType === 'lesson' && !activeLessonId && activeModule.chapters && activeModule.chapters.length > 0) {
        // If switched to lesson view but no lesson selected, pick first
        setActiveLessonId(activeModule.chapters[0].lessons[0].id);
        setActiveChapterId(activeModule.chapters[0].id);
    }
    setVocabIndex(0);
    setIsVocabFlipped(false);
    setMiniQuizAnswers({});
    setMiniQuizResults({});
    setChapterQuizAnswers({});
    setChapterQuizSubmitted(false);
  }, [activeModuleId, activeViewType]);


  // --- HANDLERS ---

  const toggleModuleExpand = (id: number) => {
    if (expandedModuleIds.includes(id)) {
      setExpandedModuleIds(prev => prev.filter(mId => mId !== id));
    } else {
      setExpandedModuleIds(prev => [...prev, id]);
    }
  };

  const toggleChapterExpand = (id: string) => {
    if (expandedChapterIds.includes(id)) {
      setExpandedChapterIds(prev => prev.filter(cId => cId !== id));
    } else {
      setExpandedChapterIds(prev => [...prev, id]);
    }
  };

  const handleSelectOverview = (moduleId: number) => {
    setActiveModuleId(moduleId);
    setActiveViewType('overview');
    if (!expandedModuleIds.includes(moduleId)) {
        setExpandedModuleIds(prev => [...prev, moduleId]);
    }
  };

  const handleSelectVocab = (moduleId: number) => {
    setActiveModuleId(moduleId);
    setActiveViewType('vocab');
    if (!expandedModuleIds.includes(moduleId)) {
        setExpandedModuleIds(prev => [...prev, moduleId]);
    }
  };

  const handleSelectProject = (moduleId: number) => {
    setActiveModuleId(moduleId);
    setActiveViewType('project');
    if (!expandedModuleIds.includes(moduleId)) {
        setExpandedModuleIds(prev => [...prev, moduleId]);
    }
  };

  const handleSelectLesson = (moduleId: number, chapterId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveChapterId(chapterId);
    setActiveViewType('lesson');
    setActiveLessonId(lessonId);
    if (!expandedModuleIds.includes(moduleId)) {
        setExpandedModuleIds(prev => [...prev, moduleId]);
    }
    if (!expandedChapterIds.includes(chapterId)) {
        setExpandedChapterIds(prev => [...prev, chapterId]);
    }
  };

  const handleSelectChapterQuiz = (moduleId: number, chapterId: string) => {
    setActiveModuleId(moduleId);
    setActiveChapterId(chapterId);
    setActiveViewType('chapter-quiz');
    if (!expandedModuleIds.includes(moduleId)) {
        setExpandedModuleIds(prev => [...prev, moduleId]);
    }
    if (!expandedChapterIds.includes(chapterId)) {
        setExpandedChapterIds(prev => [...prev, chapterId]);
    }
    // Reset quiz state
    setChapterQuizAnswers({});
    setChapterQuizSubmitted(false);
    setChapterQuizScore(0);
  };

  const handleMiniQuizAnswer = (questionIndex: number, optionIndex: number, correctIndex: number) => {
    setMiniQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    const isCorrect = optionIndex === correctIndex;
    setMiniQuizResults(prev => ({ ...prev, [questionIndex]: isCorrect }));
    
    if (isCorrect) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#10b981'] });
    }
  };

  const handleChapterQuizSelect = (qIndex: number, oIndex: number) => {
      if (chapterQuizSubmitted) return;
      setChapterQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const submitChapterQuiz = (quiz: SimpleQuizQuestion[]) => {
      let score = 0;
      quiz.forEach((q, idx) => {
          if (chapterQuizAnswers[idx] === q.correctIndex) score++;
      });
      setChapterQuizScore(score);
      setChapterQuizSubmitted(true);
      if (score === quiz.length) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
  };

  // --- HELPERS ---

  const getBenchmarkDetails = (code: string) => {
    return courseContent.benchmarks.find(b => b.code === code);
  };

  const getActiveLesson = (): Lesson | undefined => {
      if (!activeModule?.chapters) return undefined;
      for (const chapter of activeModule.chapters) {
          const lesson = chapter.lessons.find(l => l.id === activeLessonId);
          if (lesson) return lesson;
      }
      return undefined;
  };
  
  const getActiveChapterTitle = (): string => {
      if (!activeModule?.chapters) return '';
      for (const chapter of activeModule.chapters) {
          if (chapter.id === activeChapterId) return chapter.title;
      }
      return '';
  };

  const getActiveChapterQuiz = (): SimpleQuizQuestion[] | undefined => {
      if (!activeModule?.chapters) return undefined;
      const chapter = activeModule.chapters.find(c => c.id === activeChapterId);
      return chapter?.quiz;
  };

  return (
    <div className="w-full px-4 md:px-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-fadeIn">
      
      {/* --- UNIFIED SIDEBAR NAVIGATION TREE --- */}
      <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-slate-800">
             <List className="w-5 h-5 text-purple-600" />
             Course Modules
           </div>
           <button onClick={onExit} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500" title="Exit to Menu">
             <ArrowLeft className="w-5 h-5" />
           </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-2">
           {modules.map(mod => {
             const isExpanded = expandedModuleIds.includes(mod.id);
             const isModuleActive = activeModuleId === mod.id;

             return (
               <div key={mod.id} className="mb-1">
                 {/* Module Header */}
                 <button
                   onClick={() => toggleModuleExpand(mod.id)}
                   className={`w-full text-left px-3 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between group
                     ${isModuleActive 
                       ? 'bg-slate-100 text-slate-900' 
                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                   `}
                 >
                   <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${isModuleActive ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {mod.id}
                      </div>
                      <span className="truncate w-48">{mod.title.replace(`Module ${mod.id}: `, '').replace('Unit ', 'U')}</span>
                   </div>
                   {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                 </button>

                 {/* Module Content (Children) */}
                 {isExpanded && (
                   <div className="ml-4 pl-4 border-l-2 border-slate-100 mt-1 space-y-1">
                      {/* 1. Course Map */}
                      <button
                        onClick={() => handleSelectOverview(mod.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors
                            ${isModuleActive && activeViewType === 'overview' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50'}
                        `}
                      >
                          <Map className="w-3 h-3" /> Course Map
                      </button>

                      {/* 2. Vocabulary */}
                      <button
                        onClick={() => handleSelectVocab(mod.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors
                            ${isModuleActive && activeViewType === 'vocab' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'}
                        `}
                      >
                          <Layers className="w-3 h-3" /> Vocabulary
                      </button>

                      {/* 3. Projects (If Any) */}
                      {mod.project && (
                          <button
                            onClick={() => handleSelectProject(mod.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors
                                ${isModuleActive && activeViewType === 'project' ? 'text-amber-700 bg-amber-50' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-50'}
                            `}
                          >
                              <PenTool className="w-3 h-3" /> Projects
                          </button>
                      )}

                      {/* 4. Chapters & Lessons */}
                      {mod.chapters?.map(chapter => {
                          const isChapterExpanded = expandedChapterIds.includes(chapter.id);
                          const isActiveChapter = activeChapterId === chapter.id;
                          return (
                              <div key={chapter.id} className="mt-2">
                                  <button 
                                    onClick={() => toggleChapterExpand(chapter.id)}
                                    className="w-full text-left px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600"
                                  >
                                      <span className="truncate">{chapter.title}</span>
                                      {isChapterExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </button>
                                  
                                  {isChapterExpanded && (
                                      <div className="ml-2 mt-1 space-y-0.5">
                                          {chapter.lessons.map(lesson => (
                                              <button
                                                key={lesson.id}
                                                onClick={() => handleSelectLesson(mod.id, chapter.id, lesson.id)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors
                                                    ${activeLessonId === lesson.id && isModuleActive && activeViewType === 'lesson'
                                                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100' 
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}
                                                `}
                                              >
                                                  <Circle className={`w-1.5 h-1.5 ${activeLessonId === lesson.id && isModuleActive && activeViewType === 'lesson' ? 'fill-blue-600 text-blue-600' : 'text-slate-300'}`} />
                                                  <span className="truncate">{lesson.title}</span>
                                              </button>
                                          ))}
                                          {/* Chapter Quiz Link */}
                                          {chapter.quiz && (
                                              <button
                                                  onClick={() => handleSelectChapterQuiz(mod.id, chapter.id)}
                                                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-colors
                                                      ${isActiveChapter && activeViewType === 'chapter-quiz'
                                                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                                                          : 'text-amber-600 hover:bg-amber-50'}
                                                  `}
                                              >
                                                  <HelpCircle className="w-3 h-3" /> Chapter Quiz
                                              </button>
                                          )}
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                   </div>
                 )}
               </div>
             );
           })}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
         {activeModule ? (
           <div className="flex flex-col h-full">
             
             {/* --- VIEW: COURSE MAP (OVERVIEW) --- */}
             {activeViewType === 'overview' && (
                <div className="h-full overflow-y-auto p-6 md:p-10 animate-fadeIn">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Module {activeModule.id} Overview
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">{activeModule.title.replace(`Module ${activeModule.id}: `, '')}</h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm uppercase tracking-wider mb-3">
                                <Target className="w-4 h-4" /> Focus
                            </div>
                            <p className="text-slate-800 font-medium leading-relaxed">{activeModule.focus}</p>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wider mb-3">
                                <Key className="w-4 h-4" /> Key Topics
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {activeModule.keyTopics.map((topic, idx) => (
                                    <span key={idx} className="bg-white text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Map className="w-5 h-5 text-slate-400" />
                            Standards & Benchmarks
                        </h3>
                        {activeModule.standardCodes.map(code => {
                            const details = getBenchmarkDetails(code);
                            return (
                                <div key={code} className="group hover:bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-100 text-slate-600 font-mono text-xs font-bold px-2 py-1 rounded mt-0.5 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm">
                                            {code}
                                        </div>
                                        <div className="flex-1">
                                            {details ? (
                                                <>
                                                    <p className="text-slate-800 font-bold mb-2">{details.description}</p>
                                                    {details.clarifications.length > 0 && (
                                                        <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside opacity-80 group-hover:opacity-100">
                                                            {details.clarifications.map((clar, i) => (
                                                                <li key={i}>{clar}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-slate-400 italic">Standard details pending.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}

             {/* --- VIEW: PROJECT --- */}
             {activeViewType === 'project' && activeModule.project && (
                 <div className="h-full overflow-y-auto p-6 md:p-12 bg-amber-50/30 animate-fadeIn">
                     <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
                         <div className="bg-amber-100 p-8 border-b border-amber-200">
                             <div className="inline-flex items-center gap-2 bg-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                 <PenTool className="w-4 h-4" /> Hands-On Project
                             </div>
                             <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{activeModule.project.title}</h1>
                             <div className="bg-white/50 p-4 rounded-xl border border-amber-200/50">
                                 <p className="font-bold text-slate-700 italic text-lg">"{activeModule.project.question}"</p>
                             </div>
                         </div>
                         
                         <div className="p-8">
                             <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                                 {activeModule.project.summary}
                             </p>

                             <div className="space-y-8">
                                 {activeModule.project.steps.map((step, idx) => (
                                     <div key={idx} className="relative pl-8 border-l-2 border-slate-200">
                                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                         <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                         <p className="text-slate-600 mb-4">{step.description}</p>
                                         
                                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                 <ClipboardList className="w-4 h-4" /> Checklist
                                             </h4>
                                             <ul className="space-y-2">
                                                 {step.checklist.map((item, i) => (
                                                     <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                                         <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5"></div>
                                                         {item}
                                                     </li>
                                                 ))}
                                             </ul>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- VIEW: LESSON (TEXTBOOK) --- */}
             {activeViewType === 'lesson' && getActiveLesson() && (
                <div className="h-full overflow-y-auto p-6 md:p-12 bg-white animate-fadeIn">
                     <div className="w-full">
                         <div className="mb-4 flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                             <FileText className="w-4 h-4" />
                             {getActiveChapterTitle()}
                         </div>
                         <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                             {getActiveLesson()?.title}
                         </h2>

                         {/* Image / Map */}
                         {getActiveLesson()?.image && (
                             <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                                 <img 
                                    src={getActiveLesson()?.image?.url} 
                                    alt="Lesson Visual" 
                                    className="w-full h-auto object-cover max-h-[400px]"
                                 />
                                 <div className="bg-slate-50 p-3 text-center text-sm text-slate-500 font-medium italic border-t border-slate-100">
                                     {getActiveLesson()?.image?.caption}
                                 </div>
                             </div>
                         )}

                         <div className="prose prose-slate prose-lg text-slate-700 leading-relaxed max-w-none">
                             {getActiveLesson()?.content.map((para, idx) => (
                                 <p key={idx} className="mb-6">{para}</p>
                             ))}
                         </div>

                         {/* Mini Quiz */}
                         {getActiveLesson()?.miniQuiz && (
                            <div className="mt-12 bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-6 h-6" /> Lesson Check
                                </h3>
                                <div className="space-y-6">
                                    {getActiveLesson()?.miniQuiz?.map((q, qIdx) => {
                                        const userAnswer = miniQuizAnswers[qIdx];
                                        const isCorrect = miniQuizResults[qIdx];
                                        return (
                                            <div key={qIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                                                <p className="font-bold text-slate-800 mb-4">{qIdx + 1}. {q.question}</p>
                                                <div className="space-y-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => handleMiniQuizAnswer(qIdx, oIdx, q.correctIndex)}
                                                            disabled={userAnswer !== undefined}
                                                            className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-all
                                                                ${userAnswer === undefined 
                                                                    ? 'bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300' 
                                                                    : userAnswer === oIdx 
                                                                        ? oIdx === q.correctIndex 
                                                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                                                                            : 'bg-red-100 border-red-300 text-red-800'
                                                                        : oIdx === q.correctIndex
                                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                                            : 'opacity-50'
                                                                }
                                                            `}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                                {userAnswer !== undefined && (
                                                    <div className={`mt-3 text-sm p-3 rounded-lg ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                        {isCorrect ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
                                                        <span className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect.'}</span> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                         )}

                         <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
                             <span>End of Lesson</span>
                             <div className="flex gap-2">
                                 <button 
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
                                    onClick={() => handleSelectOverview(activeModule.id)}
                                 >
                                     Back to Map
                                 </button>
                                 <button 
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition-colors"
                                    onClick={() => handleSelectVocab(activeModule.id)}
                                 >
                                     Review Vocab
                                 </button>
                             </div>
                         </div>
                     </div>
                </div>
             )}

             {/* --- VIEW: CHAPTER QUIZ --- */}
             {activeViewType === 'chapter-quiz' && getActiveChapterQuiz() && (
                 <div className="h-full overflow-y-auto p-6 md:p-12 bg-slate-50 animate-fadeIn">
                     <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-amber-200">
                                Chapter Assessment
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{getActiveChapterTitle()} Quiz</h1>
                            <p className="text-slate-600">Test your mastery of this chapter's standards.</p>
                        </div>

                        {!chapterQuizSubmitted ? (
                            <div className="space-y-6">
                                {getActiveChapterQuiz()?.map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex gap-4">
                                            <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-800 mb-4">{q.question}</h3>
                                                <div className="space-y-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => handleChapterQuizSelect(idx, oIdx)}
                                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium
                                                                ${chapterQuizAnswers[idx] === oIdx 
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' 
                                                                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'}
                                                            `}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="text-center pt-8 pb-12">
                                    <button
                                        onClick={() => submitChapterQuiz(getActiveChapterQuiz()!)}
                                        disabled={Object.keys(chapterQuizAnswers).length < (getActiveChapterQuiz()?.length || 0)}
                                        className="px-12 py-4 bg-slate-900 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Assessment
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center border border-slate-200 animate-fadeIn">
                                <Trophy className={`w-24 h-24 mx-auto mb-6 ${chapterQuizScore === getActiveChapterQuiz()!.length ? 'text-yellow-400' : 'text-slate-300'}`} />
                                <h2 className="text-4xl font-black text-slate-900 mb-4">Quiz Complete!</h2>
                                <div className="text-2xl font-bold text-slate-600 mb-8">
                                    You scored <span className={chapterQuizScore === getActiveChapterQuiz()!.length ? 'text-emerald-600' : 'text-blue-600'}>{chapterQuizScore}</span> / {getActiveChapterQuiz()!.length}
                                </div>
                                <div className="space-y-4 text-left max-w-2xl mx-auto mb-12">
                                    {getActiveChapterQuiz()?.map((q, idx) => {
                                        const isCorrect = chapterQuizAnswers[idx] === q.correctIndex;
                                        return (
                                            <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                                <div className="font-bold mb-1">{idx + 1}. {q.question}</div>
                                                <div className={`text-sm ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {isCorrect ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                                                    {q.explanation}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => {
                                        setChapterQuizSubmitted(false);
                                        setChapterQuizAnswers({});
                                    }}
                                    className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 mr-4"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => handleSelectOverview(activeModule.id)}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg"
                                >
                                    Continue
                                </button>
                            </div>
                        )}
                     </div>
                 </div>
             )}

             {/* --- VIEW: VOCABULARY --- */}
             {activeViewType === 'vocab' && (
                <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-100 animate-fadeIn">
                    <div className="mb-8 text-center">
                         <h2 className="text-2xl font-black text-slate-800">Module {activeModule.id} Vocabulary</h2>
                         <p className="text-slate-500">Master the key terms</p>
                    </div>

                    {activeModule.vocabulary && activeModule.vocabulary.length > 0 ? (
                        <div className="w-full max-w-xl perspective-1000">
                            <div 
                                className={`relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${isVocabFlipped ? 'rotate-y-180' : ''}`}
                                onClick={() => setIsVocabFlipped(!isVocabFlipped)}
                            >
                                {/* Front */}
                                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-8 backface-hidden group hover:border-emerald-400 transition-colors">
                                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Term</div>
                                    <h2 className="text-4xl font-black text-slate-800 text-center group-hover:text-emerald-700 transition-colors">{activeModule.vocabulary[vocabIndex].term}</h2>
                                    <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Click to Flip
                                    </div>
                                </div>

                                {/* Back */}
                                <div className="absolute inset-0 bg-emerald-600 rounded-3xl shadow-xl border border-emerald-500 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 text-white">
                                    <div className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-4">Definition</div>
                                    <p className="text-xl font-medium text-center leading-relaxed">
                                        {activeModule.vocabulary[vocabIndex].definition}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8">
                                <button 
                                    onClick={() => {
                                        setIsVocabFlipped(false);
                                        setTimeout(() => setVocabIndex(prev => (prev - 1 + activeModule.vocabulary!.length) % activeModule.vocabulary!.length), 150);
                                    }}
                                    className="p-4 bg-white rounded-full shadow-md text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                                <div className="font-mono font-bold text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                                    {vocabIndex + 1} / {activeModule.vocabulary.length}
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsVocabFlipped(false);
                                        setTimeout(() => setVocabIndex(prev => (prev + 1) % activeModule.vocabulary!.length), 150);
                                    }}
                                    className="p-4 bg-white rounded-full shadow-md text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center text-slate-500">
                             <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                             No vocabulary terms available for this module yet.
                         </div>
                    )}
                </div>
             )}
           </div>
         ) : (
           <div className="flex items-center justify-center h-full text-slate-400">
             <List className="w-12 h-12 mb-4 opacity-20" />
             <p>Select a module from the menu to begin.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default CourseModulesView;
