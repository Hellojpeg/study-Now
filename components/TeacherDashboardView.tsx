
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_CLASSES } from '../constants';
import { FileText, Plus, List, Trash2, Check, ListChecks, Upload, Search, Settings, Users, BookOpen, BarChart2, ChevronRight, BrainCircuit, LayoutDashboard, ChevronLeft, Menu, LogOut, MoreVertical, GraduationCap } from 'lucide-react';

interface TeacherDashboardViewProps {
  user: User;
}

interface QuizDraft {
  mode: 'EXTRACTION' | 'PAPER';
  sourceType: 'TEXT' | 'FILE';
  textInput: string;
  file: File | null;
  questions: { question: string, options: string[], correctAnswerIndex: number }[];
  answerKey: string[];
}

const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CLASSES' | 'STUDENTS' | 'ASSESSMENTS' | 'SETTINGS'>('DASHBOARD');
  
  // Quiz Creator State
  const [quizStep, setQuizStep] = useState<'LIST' | 'SOURCE' | 'EDITOR'>('LIST');
  const [quizDraft, setQuizDraft] = useState<QuizDraft>({
    mode: 'EXTRACTION',
    sourceType: 'TEXT',
    textInput: '',
    file: null,
    questions: [],
    answerKey: Array(5).fill('')
  });

  const handleCreateQuiz = () => {
    setActiveTab('ASSESSMENTS');
    setQuizDraft({
      mode: 'EXTRACTION',
      sourceType: 'TEXT',
      textInput: '',
      file: null,
      questions: [],
      answerKey: Array(5).fill('')
    });
    setQuizStep('SOURCE');
  };

  const handleSourceSubmit = () => {
    // Simulate processing
    if (quizDraft.mode === 'EXTRACTION') {
        // Mock extracted questions
        setQuizDraft(prev => ({
            ...prev,
            questions: [
                { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswerIndex: 2 },
                { question: "Who wrote Romeo and Juliet?", options: ["Shakespeare", "Hemingway", "Austen", "Dickens"], correctAnswerIndex: 0 }
            ]
        }));
    }
    setQuizStep('EDITOR');
  };

  const NavItem = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: typeof activeTab }) => (
      <button 
        onClick={() => { setActiveTab(tab); setQuizStep('LIST'); }}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      >
          <Icon className={`w-5 h-5 ${!isSidebarOpen ? 'mx-auto' : ''}`} />
          {isSidebarOpen && <span className="font-bold text-sm">{label}</span>}
          {activeTab === tab && isSidebarOpen && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
      </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col relative z-30 shadow-2xl`}>
          {/* Header */}
          <div className="p-6 flex items-center justify-between mb-4">
             {isSidebarOpen && (
                 <div className="flex items-center gap-2 text-indigo-400">
                     <BookOpen className="w-6 h-6" />
                     <span className="font-black text-xl tracking-tight text-white">PrepOS</span>
                 </div>
             )}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
             <div className={`px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider ${!isSidebarOpen ? 'text-center' : ''}`}>
                 {isSidebarOpen ? 'Main Menu' : 'Menu'}
             </div>
             <NavItem icon={LayoutDashboard} label="Dashboard" tab="DASHBOARD" />
             <NavItem icon={BookOpen} label="Classes" tab="CLASSES" />
             <NavItem icon={Users} label="Students" tab="STUDENTS" />
             <NavItem icon={FileText} label="Assessments" tab="ASSESSMENTS" />
             
             <div className={`px-3 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider ${!isSidebarOpen ? 'text-center' : ''}`}>
                 {isSidebarOpen ? 'System' : 'Sys'}
             </div>
             <NavItem icon={Settings} label="Settings" tab="SETTINGS" />
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-800">
             <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg">
                     {user.name.charAt(0)}
                 </div>
                 {isSidebarOpen && (
                     <div className="flex-1 overflow-hidden">
                         <div className="font-bold truncate">{user.name}</div>
                         <div className="text-xs text-slate-500 truncate">{user.email}</div>
                     </div>
                 )}
                 {isSidebarOpen && (
                     <button className="text-slate-500 hover:text-red-400 transition-colors"><LogOut className="w-4 h-4" /></button>
                 )}
             </div>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
          <div className="max-w-7xl mx-auto p-8 pb-24">
            
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {activeTab === 'ASSESSMENTS' && quizStep !== 'LIST' ? 'Quiz Creator' : 
                         activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {activeTab === 'DASHBOARD' && "Overview of your classroom performance."}
                        {activeTab === 'CLASSES' && "Manage your active sections and rosters."}
                        {activeTab === 'ASSESSMENTS' && "Create and assign quizzes to students."}
                    </p>
                </div>
                {activeTab === 'DASHBOARD' && (
                    <button 
                        onClick={handleCreateQuiz}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" /> Quick Quiz
                    </button>
                )}
            </div>

            {/* DASHBOARD VIEW */}
            {activeTab === 'DASHBOARD' && (
                <div className="animate-fadeIn space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                <Users className="w-4 h-4" /> Total Students
                            </div>
                            <div className="text-4xl font-black text-slate-800">107</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                <BookOpen className="w-4 h-4" /> Active Quizzes
                            </div>
                            <div className="text-4xl font-black text-slate-800">4</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 font-bold uppercase text-xs tracking-wider">
                                <BarChart2 className="w-4 h-4" /> Avg. Performance
                            </div>
                            <div className="text-4xl font-black text-emerald-500">88%</div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500"/> Active Classes</h2>
                            <div className="space-y-4">
                                {MOCK_CLASSES.map(cls => (
                                    <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
                                        <div>
                                            <div className="font-bold text-slate-800">{cls.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-1">{cls.section} • {cls.studentCount} Students</div>
                                        </div>
                                        <button className="text-slate-400 group-hover:text-indigo-600"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <h2 className="text-xl font-bold mb-4 relative z-10">Quick Actions</h2>
                            <div className="space-y-3 relative z-10">
                                <button onClick={handleCreateQuiz} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl font-bold text-left flex items-center gap-3 transition-all">
                                    <Plus className="w-5 h-5" /> Create New Assessment
                                </button>
                                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl font-bold text-left flex items-center gap-3 transition-all">
                                    <ListChecks className="w-5 h-5" /> Grade Pending Submissions
                                </button>
                                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl font-bold text-left flex items-center gap-3 transition-all">
                                    <Users className="w-5 h-5" /> Manage Roster
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CLASSES VIEW */}
            {activeTab === 'CLASSES' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {MOCK_CLASSES.map(cls => (
                        <div key={cls.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider">{cls.section}</span>
                                <MoreVertical className="w-5 h-5 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{cls.name}</h3>
                            <div className="text-sm font-mono text-slate-500 mb-6 bg-slate-50 inline-block px-2 py-1 rounded">Code: {cls.code}</div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>)}
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{cls.studentCount - 3}</div>
                                </div>
                                <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">View Class →</div>
                            </div>
                        </div>
                    ))}
                    <button className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all min-h-[200px]">
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-bold">Add New Class</span>
                    </button>
                </div>
            )}

            {/* ASSESSMENTS VIEW */}
            {activeTab === 'ASSESSMENTS' && (
                <div className="animate-fadeIn">
                    {quizStep === 'LIST' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Search assessments..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <button 
                                    onClick={() => setQuizStep('SOURCE')}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"
                                >
                                    <Plus className="w-5 h-5" /> New Assessment
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { title: "Ancient Greece Midterm", type: "AI Generated", date: "Oct 24, 2024", status: "Published" },
                                            { title: "Civics: Bill of Rights", type: "Manual", date: "Oct 20, 2024", status: "Draft" },
                                            { title: "US History: Colonies", type: "PDF Extract", date: "Oct 15, 2024", status: "Published" },
                                        ].map((quiz, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4 font-bold text-slate-800">{quiz.title}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                                                    {quiz.type === 'AI Generated' ? <BrainCircuit className="w-4 h-4 text-purple-500"/> : <FileText className="w-4 h-4 text-blue-500"/>}
                                                    {quiz.type}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{quiz.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${quiz.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {quiz.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400 group-hover:text-indigo-600">
                                                    <MoreVertical className="w-5 h-5 ml-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* QUIZ CREATOR FLOW */}
                    {quizStep === 'SOURCE' && (
                        <div className="max-w-2xl mx-auto">
                            <button onClick={() => setQuizStep('LIST')} className="mb-6 flex items-center text-slate-500 font-bold text-sm hover:text-slate-800">
                                <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to List
                            </button>
                            
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Import Content</h2>
                            <p className="text-slate-500 mb-8">Choose how you want to generate questions.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button 
                                    onClick={() => setQuizDraft(prev => ({...prev, mode: 'EXTRACTION'}))}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${quizDraft.mode === 'EXTRACTION' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300'}`}
                                >
                                    <BrainCircuit className={`w-8 h-8 mb-4 ${quizDraft.mode === 'EXTRACTION' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <div className="font-bold text-slate-900 mb-1">AI Extraction</div>
                                    <p className="text-xs text-slate-500">Upload text or PDF and let AI generate questions.</p>
                                </button>
                                <button 
                                    onClick={() => setQuizDraft(prev => ({...prev, mode: 'PAPER'}))}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${quizDraft.mode === 'PAPER' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300'}`}
                                >
                                    <ListChecks className={`w-8 h-8 mb-4 ${quizDraft.mode === 'PAPER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <div className="font-bold text-slate-900 mb-1">Answer Key</div>
                                    <p className="text-xs text-slate-500">Digitize a paper quiz by creating a quick answer key.</p>
                                </button>
                            </div>

                            {quizDraft.mode === 'EXTRACTION' && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex gap-4 mb-4 border-b border-slate-100 pb-4">
                                        <button onClick={() => setQuizDraft(prev => ({...prev, sourceType: 'TEXT'}))} className={`text-sm font-bold pb-2 ${quizDraft.sourceType === 'TEXT' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Paste Text</button>
                                        <button onClick={() => setQuizDraft(prev => ({...prev, sourceType: 'FILE'}))} className={`text-sm font-bold pb-2 ${quizDraft.sourceType === 'FILE' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Upload File</button>
                                    </div>
                                    
                                    {quizDraft.sourceType === 'TEXT' ? (
                                        <textarea 
                                            className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Paste your reading material, article, or notes here..."
                                            value={quizDraft.textInput}
                                            onChange={(e) => setQuizDraft(prev => ({...prev, textInput: e.target.value}))}
                                        ></textarea>
                                    ) : (
                                        <div className="h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="font-bold text-sm">Click to upload PDF / DOCX</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 flex justify-end">
                                <button onClick={handleSourceSubmit} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                    {quizDraft.mode === 'EXTRACTION' ? 'Generate Questions' : 'Create Answer Key'}
                                </button>
                            </div>
                        </div>
                    )}

                    {quizStep === 'EDITOR' && (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{quizDraft.mode === 'EXTRACTION' ? 'Review Questions' : 'Setup Answer Key'}</h2>
                                    <p className="text-slate-500 text-sm">Verify content before publishing.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setQuizStep('SOURCE')} className="px-6 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">Back</button>
                                    <button onClick={() => { alert("Quiz Published!"); setQuizStep('LIST'); }} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Publish Quiz</button>
                                </div>
                            </div>

                            <div className={`flex-1 grid ${quizDraft.mode === 'EXTRACTION' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 min-h-0`}>
                                {/* LEFT: SOURCE VIEW - Hidden in Paper Mode */}
                                {quizDraft.mode === 'EXTRACTION' && (
                                    <div className="bg-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col shadow-lg h-[600px]">
                                        <div className="flex justify-between items-center text-slate-400 mb-4 px-2">
                                            <div className="font-bold text-sm uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4"/> Source Document</div>
                                            <div className="text-xs">{quizDraft.file?.name || "Text Source"}</div>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                                            {/* Mock PDF Visual */}
                                            {quizDraft.sourceType === 'TEXT' ? (
                                                <div className="text-white/80 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                                    {quizDraft.textInput || "No text provided."}
                                                </div>
                                            ) : (
                                                <div className="space-y-4 opacity-50 pointer-events-none select-none">
                                                    <div className="h-8 bg-white/20 w-3/4 rounded mb-8"></div>
                                                    <div className="h-4 bg-white/20 w-full rounded"></div>
                                                    <div className="h-4 bg-white/20 w-5/6 rounded"></div>
                                                    <div className="h-32 bg-white/10 w-full rounded my-4"></div>
                                                    <div className="h-4 bg-white/20 w-full rounded"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RIGHT: EDITOR */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[600px]">
                                    {quizDraft.mode === 'EXTRACTION' ? (
                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            {quizDraft.questions.map((q, idx) => (
                                                <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative group transition-all hover:border-indigo-300">
                                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {idx + 1}</label>
                                                        <input defaultValue={q.question} className="w-full bg-transparent font-bold text-slate-800 border-b border-transparent focus:border-indigo-500 outline-none py-1 text-lg" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {q.options?.map((opt, oIdx) => (
                                                            <div key={oIdx} className="flex items-center gap-3">
                                                                <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${oIdx === q.correctAnswerIndex ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300 text-transparent hover:border-slate-400'}`}>
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                                <input defaultValue={opt} className="flex-1 bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                                <Plus className="w-5 h-5"/> Add Question
                                            </button>
                                        </div>
                                    ) : (
                                        /* PAPER MODE ANSWER KEY */
                                        <div className="flex-1 overflow-y-auto p-6">
                                            <div className="flex justify-between items-center mb-6 bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                                                <div className="flex items-center gap-3 text-yellow-800 font-bold">
                                                    <div className="bg-yellow-100 p-2 rounded-lg"><ListChecks className="w-5 h-5"/></div>
                                                    Answer Key Configuration
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Question Count:</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max="50"
                                                        value={quizDraft.answerKey.length} 
                                                        className="w-20 p-2 border border-slate-300 rounded-lg text-center font-bold" 
                                                        onChange={(e) => {
                                                            const count = Math.max(1, Math.min(50, parseInt(e.target.value) || 0));
                                                            setQuizDraft(prev => ({...prev, answerKey: Array(count).fill('')}));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {quizDraft.answerKey.map((ans, idx) => (
                                                    <div key={idx} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                                                        <span className="font-black text-slate-300 text-sm">#{idx + 1}</span>
                                                        <div className="flex gap-1">
                                                            {['A','B','C','D'].map(opt => (
                                                                <button 
                                                                    key={opt}
                                                                    onClick={() => {
                                                                        const newKey = [...quizDraft.answerKey];
                                                                        newKey[idx] = opt;
                                                                        setQuizDraft(prev => ({...prev, answerKey: newKey}));
                                                                    }}
                                                                    className={`w-8 h-8 rounded-lg font-bold text-sm transition-all shadow-sm ${ans === opt ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Placeholder Views */}
            {activeTab === 'STUDENTS' && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                    <Users className="w-16 h-16 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-600">Student Roster</h2>
                    <p>Select a class to view detailed student analytics.</p>
                </div>
            )}

            {activeTab === 'SETTINGS' && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                    <Settings className="w-16 h-16 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-600">System Preferences</h2>
                    <p>LMS Integration and Grading Standards configuration.</p>
                </div>
            )}

          </div>
      </main>
    </div>
  );
};

export default TeacherDashboardView;
