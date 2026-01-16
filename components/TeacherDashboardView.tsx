
import React, { useState } from 'react';
import { User } from '../types';
import { useQuery, useMutation } from 'convex/react';
import { FileText, Plus, List, Trash2, Check, ListChecks, Upload, Search, Settings, Users, BookOpen, BarChart2, ChevronRight, BrainCircuit, LayoutDashboard, ChevronLeft, Menu, LogOut, MoreVertical, GraduationCap, Hash, AlignLeft, CheckSquare, Type, X, Calculator, Edit3, Package } from 'lucide-react';
import ScormManager from './ScormManager';
import ScormPlayer from './ScormPlayer';

interface TeacherDashboardViewProps {
  user: User;
}

type QuestionType = 'MCQ' | 'SELECT_ALL' | 'TRUE_FALSE' | 'NUMBER' | 'SHORT' | 'ESSAY';

interface ManualQuestion {
    id: number;
    type: QuestionType;
    answer: string;
    tags: string;
}

interface QuizDraft {
  mode: 'EXTRACTION' | 'PAPER';
  sourceType: 'TEXT' | 'FILE';
  textInput: string;
  file: File | null;
  questions: { question: string, options: string[], correctAnswerIndex: number }[];
  manualQuestions: ManualQuestion[]; 
}

const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CLASSES' | 'STUDENTS' | 'ASSESSMENTS' | 'SCORM' | 'SETTINGS'>('DASHBOARD');
  
  // Quiz Creator State
  const [quizStep, setQuizStep] = useState<'LIST' | 'SOURCE' | 'EDITOR'>('LIST');
  const [quizDraft, setQuizDraft] = useState<QuizDraft>({
    mode: 'EXTRACTION',
    sourceType: 'TEXT',
    textInput: '',
    file: null,
    questions: [],
    manualQuestions: Array.from({ length: 5 }, (_, i) => ({ id: i, type: 'MCQ', answer: '', tags: '' }))
  });

  const handleCreateQuiz = () => {
    setActiveTab('ASSESSMENTS');
    setQuizDraft({
      mode: 'EXTRACTION',
      sourceType: 'TEXT',
      textInput: '',
      file: null,
      questions: [],
      manualQuestions: Array.from({ length: 5 }, (_, i) => ({ id: i, type: 'MCQ', answer: '', tags: '' }))
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

  const updateManualQuestion = (index: number, field: keyof ManualQuestion, value: any) => {
      const updated = [...quizDraft.manualQuestions];
      updated[index] = { ...updated[index], [field]: value };
      setQuizDraft(prev => ({ ...prev, manualQuestions: updated }));
  };

  const addManualQuestion = () => {
      setQuizDraft(prev => ({
          ...prev,
          manualQuestions: [
              ...prev.manualQuestions,
              { id: prev.manualQuestions.length, type: 'MCQ', answer: '', tags: '' }
          ]
      }));
  };

  const removeManualQuestion = (index: number) => {
      const updated = quizDraft.manualQuestions.filter((_, i) => i !== index);
      setQuizDraft(prev => ({ ...prev, manualQuestions: updated }));
  };

  // Convex data & roster management
  const classesList = useQuery("functions/classes:listClassesForTeacher", { teacherId: user.id }) || [];
  const createClass = useMutation("functions/classes:createClass");
  const updateClass = useMutation("functions/classes:updateClass");
  const deleteClassMutation = useMutation("functions/classes:deleteClass");
  const addStudentToClass = useMutation("functions/classes:addStudentToClass");
  const removeStudentFromClass = useMutation("functions/classes:removeStudentFromClass");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [editingClass, setEditingClass] = useState<any>(null);
  const [scormPackage, setScormPackage] = useState<{id: string; url: string} | null>(null);
  const lookupUser = useQuery("functions/users:getUserByEmail", { email: addEmail || '' });
  const rosterUsers = useQuery("functions/classes:getStudentsForClass", { classId: selectedClassId || '' }) || [];

  const handleAddClass = async () => {
    const name = prompt('Class name'); if (!name) return;
    const section = prompt('Section', 'Period 1') || '';
    const code = prompt('Code', `C-${Math.random().toString(36).slice(2,7).toUpperCase()}`) || '';
    await createClass({ name, section, code, teacherId: user.id });
  };

  const handleEditClass = async () => {
    if (!editingClass) return;
    try {
      await updateClass({
        classId: editingClass._id,
        name: editingClass.name,
        section: editingClass.section,
        code: editingClass.code,
      });
      setEditingClass(null);
    } catch (err) {
      console.error('Failed to update class:', err);
      alert('Failed to update class');
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteClassMutation({ classId });
    } catch (err) {
      console.error('Failed to delete class:', err);
      alert('Failed to delete class');
    }
  };

  const openRoster = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleAddStudent = async () => {
    if (!selectedClassId) return;
    if (!lookupUser) { alert('No user found with that email'); return; }
    const sid = (lookupUser as any)._id || (lookupUser as any).id;
    await addStudentToClass({ classId: selectedClassId, studentId: sid });
    setAddEmail('');
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClassId) return;
    await removeStudentFromClass({ classId: selectedClassId, studentId });
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

  // Helper to render the specific input based on question type
  const renderAnswerInput = (q: ManualQuestion, index: number) => {
      switch (q.type) {
          case 'MCQ':
              return (
                  <div className="flex gap-2">
                      {['A','B','C','D','E'].map(opt => (
                          <button
                              key={opt}
                              onClick={() => updateManualQuestion(index, 'answer', opt)}
                              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border-2 ${q.answer === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
              );
          case 'SELECT_ALL':
              return (
                  <div className="flex gap-2">
                      {['A','B','C','D','E'].map(opt => {
                          const isSelected = q.answer.includes(opt);
                          return (
                              <button
                                  key={opt}
                                  onClick={() => {
                                      let newAns = q.answer ? q.answer.split(',') : [];
                                      if (isSelected) newAns = newAns.filter(a => a !== opt);
                                      else newAns.push(opt);
                                      updateManualQuestion(index, 'answer', newAns.join(','));
                                  }}
                                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border-2 ${isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                              >
                                  {opt}
                              </button>
                          );
                      })}
                  </div>
              );
          case 'TRUE_FALSE':
              return (
                  <div className="flex gap-2">
                      <button 
                        onClick={() => updateManualQuestion(index, 'answer', 'T')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${q.answer === 'T' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                          TRUE
                      </button>
                      <button 
                        onClick={() => updateManualQuestion(index, 'answer', 'F')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${q.answer === 'F' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                          FALSE
                      </button>
                  </div>
              );
          case 'NUMBER':
              return (
                  <div className="flex items-center gap-2 relative">
                      <Calculator className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input 
                          type="number" 
                          value={q.answer}
                          onChange={(e) => updateManualQuestion(index, 'answer', e.target.value)}
                          placeholder="Correct Value"
                          className="w-40 pl-9 pr-3 py-2 text-sm font-mono font-bold border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      />
                  </div>
              );
          case 'SHORT':
              return (
                  <div className="w-full">
                      <input 
                          type="text" 
                          value={q.answer}
                          onChange={(e) => updateManualQuestion(index, 'answer', e.target.value)}
                          placeholder="Keywords or Model Answer (Short)"
                          className="w-full p-2.5 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                      />
                  </div>
              );
          case 'ESSAY':
              return (
                  <div className="w-full relative">
                      <textarea 
                          value={q.answer}
                          onChange={(e) => updateManualQuestion(index, 'answer', e.target.value)}
                          placeholder="Enter model response or rubric keywords..."
                          className="w-full p-3 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[80px] resize-none"
                      />
                      <div className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          Min. 3 Sentences
                      </div>
                  </div>
              );
      }
  };

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
             <NavItem icon={Package} label="SCORM Import" tab="SCORM" />
             
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
                         activeTab === 'SCORM' ? 'SCORM Import' :
                         activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {activeTab === 'DASHBOARD' && "Overview of your classroom performance."}
                        {activeTab === 'CLASSES' && "Manage your active sections and rosters."}
                        {activeTab === 'ASSESSMENTS' && "Create and assign quizzes to students."}
                        {activeTab === 'SCORM' && "Import and manage SCORM course packages."}
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
                                {classesList.map((cls: any) => (
                                    <div key={cls._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
                                        <div>
                                            <div className="font-bold text-slate-800">{cls.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-1">{cls.section} • {(cls.studentIds || []).length} Students</div>
                                        </div>
                                        <button onClick={() => openRoster(cls._id)} className="text-slate-400 group-hover:text-indigo-600"><ChevronRight className="w-5 h-5" /></button>
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
                    {classesList.map((cls: any) => (
                      <div key={cls._id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider">{cls.section}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setEditingClass({...cls})} 
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit class"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClass(cls._id, cls.name)} 
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{cls.name}</h3>
                        <div className="text-sm font-mono text-slate-500 mb-6 bg-slate-50 inline-block px-2 py-1 rounded">Code: {cls.code}</div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>)}
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{Math.max(0, (cls.studentIds || []).length - 3)}</div>
                          </div>
                          <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <button onClick={() => openRoster(cls._id)} className="font-bold">Manage Roster →</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleAddClass} className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all min-h-[200px]">
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="font-bold">Add New Class</span>
                    </button>
                  </div>
            )}

            {/* Edit Class Modal */}
            {editingClass && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/40" onClick={() => setEditingClass(null)} />
                <div className="bg-white rounded-2xl p-6 z-50 w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Edit Class</h3>
                    <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                      <input
                        value={editingClass.name}
                        onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                      <input
                        value={editingClass.section}
                        onChange={(e) => setEditingClass({...editingClass, section: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                      <input
                        value={editingClass.code}
                        onChange={(e) => setEditingClass({...editingClass, code: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setEditingClass(null)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditClass}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedClassId && (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedClassId(null)} />
    <div className="bg-white rounded-2xl p-6 z-50 w-full max-w-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Roster</h3>
        <button onClick={() => setSelectedClassId(null)} className="text-slate-500">Close</button>
      </div>
      <div className="mb-4">
        <div className="flex gap-2">
          <input value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="student@example.edu" className="flex-1 p-3 border rounded-lg" />
          <button onClick={handleAddStudent} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Add</button>
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-auto">
        {rosterUsers.length === 0 && <div className="text-sm text-slate-500">No students in this class yet.</div>}
        {rosterUsers.map((s: any) => (
          <div key={(s as any)._id || s.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-slate-500">{s.email}</div>
            </div>
            <button onClick={() => handleRemoveStudent((s as any)._id || s.id)} className="text-red-500">Remove</button>
          </div>
        ))}
      </div>
    </div>
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
                                        /* PAPER MODE ANSWER KEY - NEW TABLE DESIGN */
                                        <div className="flex-1 flex flex-col h-full bg-slate-50">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-[50px_140px_1fr_200px_50px] gap-4 px-6 py-3 bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center sticky top-0 z-10 shadow-sm">
                                                <div className="text-center">#</div>
                                                <div>Type</div>
                                                <div>Answer Key</div>
                                                <div>Tags</div>
                                                <div></div>
                                            </div>

                                            {/* Rows */}
                                            <div className="overflow-y-auto flex-1 p-2">
                                                <div className="space-y-1">
                                                    {quizDraft.manualQuestions.map((q, idx) => (
                                                        <div key={q.id} className="grid grid-cols-[50px_140px_1fr_200px_50px] gap-4 px-4 py-3 bg-white border border-slate-200 rounded-lg items-center shadow-sm hover:border-blue-300 transition-all group">
                                                            {/* Col 1: Number */}
                                                            <div className="font-bold text-slate-700 text-center text-sm">{idx + 1}</div>
                                                            
                                                            {/* Col 2: Type Dropdown */}
                                                            <div>
                                                                <div className="relative">
                                                                    <select 
                                                                        value={q.type}
                                                                        onChange={(e) => updateManualQuestion(idx, 'type', e.target.value)}
                                                                        className="w-full pl-8 pr-2 py-1.5 text-xs font-bold border border-slate-300 rounded-md bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="MCQ">Multiple Choice</option>
                                                                        <option value="SELECT_ALL">Select All</option>
                                                                        <option value="TRUE_FALSE">True / False</option>
                                                                        <option value="NUMBER">Number / Math</option>
                                                                        <option value="SHORT">Short Answer</option>
                                                                        <option value="ESSAY">Long Essay</option>
                                                                    </select>
                                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                                        {q.type === 'MCQ' && <ListChecks className="w-3.5 h-3.5" />}
                                                                        {q.type === 'SELECT_ALL' && <CheckSquare className="w-3.5 h-3.5" />}
                                                                        {q.type === 'TRUE_FALSE' && <Check className="w-3.5 h-3.5" />}
                                                                        {q.type === 'NUMBER' && <Hash className="w-3.5 h-3.5" />}
                                                                        {q.type === 'SHORT' && <AlignLeft className="w-3.5 h-3.5" />}
                                                                        {q.type === 'ESSAY' && <FileText className="w-3.5 h-3.5" />}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Col 3: Answer Input (Dynamic) */}
                                                            <div className="flex items-center">
                                                                {renderAnswerInput(q, idx)}
                                                            </div>

                                                            {/* Col 4: Tags */}
                                                            <div>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Add tags (e.g. Unit 1)" 
                                                                    value={q.tags}
                                                                    onChange={(e) => updateManualQuestion(idx, 'tags', e.target.value)}
                                                                    className="w-full text-xs p-1.5 border border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent focus:bg-white rounded transition-all outline-none"
                                                                />
                                                            </div>

                                                            {/* Col 5: Actions */}
                                                            <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => removeManualQuestion(idx)}
                                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <button 
                                                    onClick={addManualQuestion}
                                                    className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4"/> Add Question
                                                </button>
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

            {/* SCORM Import View */}
            {activeTab === 'SCORM' && (
                <div className="animate-fadeIn">
                    <ScormManager 
                      teacherId={user.id} 
                      onLaunchPackage={(id, url) => setScormPackage({ id, url })}
                    />
                </div>
            )}

            {/* SCORM Player Modal */}
            {scormPackage && (
                <ScormPlayer
                    packageId={scormPackage.id}
                    manifestUrl={scormPackage.url}
                    studentId={user.id}
                    studentName={user.name}
                    onClose={() => setScormPackage(null)}
                />
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
