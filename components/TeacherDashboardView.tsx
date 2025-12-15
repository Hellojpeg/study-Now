
import React, { useState } from 'react';
import { User, Classroom, Question } from '../types';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import { LayoutDashboard, Users, BookOpen, Settings, Plus, Search, MoreVertical, Trash2, Edit, Save, Check, X, ClipboardList } from 'lucide-react';

interface TeacherDashboardViewProps {
  user: User;
}

type Tab = 'OVERVIEW' | 'CLASSES' | 'ROSTER' | 'CONTENT';

const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [classes, setClasses] = useState<Classroom[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);
  
  // Content Creator State
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuestions, setNewQuestions] = useState<Partial<Question>[]>([]);

  const handleCreateClass = () => {
      const name = prompt("Enter Class Name (e.g. World History)");
      const section = prompt("Enter Section (e.g. Period 2)");
      if (name && section) {
          const newClass: Classroom = {
              id: Math.random().toString(36).substr(2, 5),
              name,
              section,
              code: `${name.substring(0,2).toUpperCase()}-${section.replace(' ', '')}-${new Date().getFullYear()}`,
              studentCount: 0,
              assignments: []
          };
          setClasses([...classes, newClass]);
      }
  };

  const handleAddQuestion = () => {
      setNewQuestions([...newQuestions, { 
          id: Date.now(), 
          question: '', 
          options: ['', '', '', ''], 
          correctAnswerIndex: 0,
          unit: 'Custom' 
      }]);
  };

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
      const updated = [...newQuestions];
      updated[idx] = { ...updated[idx], [field]: value };
      setNewQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
      const updated = [...newQuestions];
      if (updated[qIdx].options) {
          const newOptions = [...updated[qIdx].options!];
          newOptions[oIdx] = value;
          updated[qIdx].options = newOptions;
          setNewQuestions(updated);
      }
  };

  const saveQuiz = () => {
      if (!newQuizTitle || newQuestions.length === 0) {
          alert("Please enter a title and at least one question.");
          return;
      }
      alert(`Quiz "${newQuizTitle}" created with ${newQuestions.length} questions! (Saved to local state)`);
      setIsCreatingQuiz(false);
      setNewQuizTitle('');
      setNewQuestions([]);
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'OVERVIEW':
              return (
                  <div className="space-y-8 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                              <div className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Total Students</div>
                              <div className="text-4xl font-black text-slate-800">{students.length * 3 + 12}</div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                              <div className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Active Classes</div>
                              <div className="text-4xl font-black text-slate-800">{classes.length}</div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                              <div className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Assignments Due</div>
                              <div className="text-4xl font-black text-indigo-600">5</div>
                          </div>
                      </div>

                      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                          <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h2>
                          <div className="space-y-4">
                              {[1,2,3].map(i => (
                                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                          {['JD', 'AS', 'MC'][i-1]}
                                      </div>
                                      <div>
                                          <div className="font-bold text-slate-800">Student completed "Ancient Greece Quiz"</div>
                                          <div className="text-sm text-slate-500">2 minutes ago • Score: {85 + i * 5}%</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              );
          
          case 'CLASSES':
              return (
                  <div className="animate-fadeIn">
                      <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-bold text-slate-800">Your Classes</h2>
                          <button onClick={handleCreateClass} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
                              <Plus className="w-5 h-5" /> New Class
                          </button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {classes.map(cls => (
                              <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">{cls.section}</div>
                                      <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5"/></button>
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-800 mb-1">{cls.name}</h3>
                                  <div className="text-slate-500 text-sm font-medium mb-6">Code: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{cls.code}</span></div>
                                  
                                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                          <Users className="w-4 h-4" /> {cls.studentCount} Students
                                      </div>
                                      <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );

          case 'ROSTER':
              return (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div className="flex gap-2">
                              <select className="px-4 py-2 border rounded-xl bg-white text-slate-600 font-bold">
                                  <option>All Classes</option>
                                  {classes.map(c => <option key={c.id}>{c.name} - {c.section}</option>)}
                              </select>
                              <button className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2">
                                  <Plus className="w-4 h-4" /> Add Student
                              </button>
                          </div>
                      </div>
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                              <tr>
                                  <th className="px-6 py-4">Name</th>
                                  <th className="px-6 py-4">Email</th>
                                  <th className="px-6 py-4">Performance</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {students.map(s => (
                                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">{s.name.charAt(0)}</div>
                                          {s.name}
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">{s.email}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-emerald-500" style={{width: '85%'}}></div>
                                              </div>
                                              <span className="text-xs font-bold text-slate-600">85%</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              );

          case 'CONTENT':
              if (isCreatingQuiz) {
                  return (
                      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-fadeIn pb-12">
                          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                              <h2 className="text-xl font-bold text-slate-800">Quiz Builder</h2>
                              <div className="flex gap-2">
                                  <button onClick={() => setIsCreatingQuiz(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                                  <button onClick={saveQuiz} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                      <Save className="w-4 h-4" /> Save Quiz
                                  </button>
                              </div>
                          </div>
                          
                          <div className="p-8 max-w-4xl mx-auto">
                              <div className="mb-8">
                                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Quiz Title</label>
                                  <input 
                                    type="text" 
                                    value={newQuizTitle} 
                                    onChange={e => setNewQuizTitle(e.target.value)} 
                                    placeholder="e.g., Unit 5 Review" 
                                    className="w-full text-3xl font-black text-slate-900 border-b-2 border-slate-200 focus:border-indigo-500 focus:outline-none py-2 placeholder-slate-300" 
                                  />
                              </div>

                              <div className="space-y-8">
                                  {newQuestions.map((q, qIdx) => (
                                      <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group">
                                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => {
                                                  const updated = newQuestions.filter((_, i) => i !== qIdx);
                                                  setNewQuestions(updated);
                                              }} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>
                                          </div>
                                          
                                          <div className="mb-4">
                                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question {qIdx + 1}</label>
                                              <textarea 
                                                value={q.question} 
                                                onChange={e => updateQuestion(qIdx, 'question', e.target.value)} 
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                                rows={2}
                                                placeholder="Enter question text here..."
                                              />
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              {q.options?.map((opt, oIdx) => (
                                                  <div key={oIdx} className="flex items-center gap-2">
                                                      <button 
                                                        onClick={() => updateQuestion(qIdx, 'correctAnswerIndex', oIdx)}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${q.correctAnswerIndex === oIdx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-slate-300 hover:border-slate-400'}`}
                                                      >
                                                          <Check className="w-4 h-4" />
                                                      </button>
                                                      <input 
                                                        type="text" 
                                                        value={opt} 
                                                        onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${q.correctAnswerIndex === oIdx ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}
                                                        placeholder={`Option ${oIdx + 1}`}
                                                      />
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              <button onClick={handleAddQuestion} className="w-full py-4 mt-8 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                  <Plus className="w-5 h-5" /> Add Question
                              </button>
                          </div>
                      </div>
                  );
              }

              return (
                  <div className="animate-fadeIn">
                      <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-bold text-slate-800">Content Library</h2>
                          <button onClick={() => setIsCreatingQuiz(true)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
                              <Plus className="w-5 h-5" /> Create Quiz
                          </button>
                      </div>
                      
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                          <div className="text-center text-slate-500 py-12">
                              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                              <p className="text-lg font-medium">No custom quizzes yet.</p>
                              <p className="text-sm">Create your first Question Bank to get started.</p>
                          </div>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col fixed h-full z-20">
          <div className="flex items-center gap-3 mb-10">
              <div className="bg-indigo-600 p-2 rounded-lg"><BookOpen className="w-6 h-6"/></div>
              <span className="font-bold text-xl tracking-tight">Midterm Prep</span>
          </div>

          <div className="space-y-2 flex-1">
              {[
                  { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
                  { id: 'CLASSES', label: 'Classes', icon: BookOpen },
                  { id: 'ROSTER', label: 'Students', icon: Users },
                  { id: 'CONTENT', label: 'Content', icon: ClipboardList },
              ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                      <item.icon className="w-5 h-5" /> {item.label}
                  </button>
              ))}
          </div>

          <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">MG</div>
                  <div className="flex-1 overflow-hidden">
                      <div className="font-bold truncate">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
          <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide opacity-50">{activeTab}</h1>
              <div className="flex gap-4">
                  <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600"><Settings className="w-5 h-5" /></button>
              </div>
          </header>
          {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboardView;
