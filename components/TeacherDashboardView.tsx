
import React, { useState, useEffect, useRef } from 'react';
import { User, Classroom, Question } from '../types';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import { LayoutDashboard, Users, BookOpen, Settings, Plus, Search, MoreVertical, Trash2, Edit, Save, Check, X, ClipboardList, Link as LinkIcon, RefreshCw, Globe, Shield, Activity, Database, CheckCircle, AlertTriangle, Key, Copy, Server, Terminal, Lock, Eye, EyeOff } from 'lucide-react';
import { playSuccessSound } from '../utils/audio';

interface TeacherDashboardViewProps {
  user: User;
}

type Tab = 'OVERVIEW' | 'CLASSES' | 'ROSTER' | 'CONTENT' | 'SETTINGS';

interface WebhookLog {
    id: string;
    timestamp: string;
    method: 'POST' | 'GET';
    endpoint: string;
    status: number;
    payload?: string;
}

const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [classes, setClasses] = useState<Classroom[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);
  
  // Content Creator State
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuestions, setNewQuestions] = useState<Partial<Question>[]>([]);

  // LTI Settings State
  const [ltiConfig, setLtiConfig] = useState({
      provider: 'Canvas',
      domain: 'https://midterm-prep.edu',
      clientId: '10000000000001',
      deploymentId: '8f9d2a3b-4c5e-6f7g-8h9i-12345',
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
      syncRoster: true,
      syncGrades: true,
      syncContent: false
  });
  
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Webhook Simulation
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isListening, setIsListening] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of logs
  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [webhookLogs]);

  // Simulate incoming LTI traffic
  useEffect(() => {
      if (!isListening || activeTab !== 'SETTINGS') return;

      const interval = setInterval(() => {
          if (Math.random() > 0.7) {
              const events = [
                  { method: 'POST', endpoint: '/lti/1.3/launch', status: 200, payload: 'Context: World History P1' },
                  { method: 'POST', endpoint: '/lti/1.3/gradebook', status: 201, payload: 'Score Update: 95%' },
                  { method: 'GET', endpoint: '/lti/jwks.json', status: 200, payload: 'Public Key Fetch' },
                  { method: 'POST', endpoint: '/api/roster/sync', status: 200, payload: 'Synced 24 Students' }
              ] as const;
              
              const evt = events[Math.floor(Math.random() * events.length)];
              
              setWebhookLogs(prev => [...prev.slice(-19), {
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date().toLocaleTimeString(),
                  method: evt.method,
                  endpoint: evt.endpoint,
                  status: evt.status,
                  payload: evt.payload
              }]);
          }
      }, 3000);

      return () => clearInterval(interval);
  }, [isListening, activeTab]);

  const handleCopy = (text: string, fieldId: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
  };

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

          case 'SETTINGS':
              return (
                  <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
                      <div className="mb-8 flex justify-between items-end">
                          <div>
                              <h2 className="text-3xl font-black text-slate-900 mb-2">LTI 1.3 Integration</h2>
                              <p className="text-slate-600">Connect to Canvas, Schoology, or Blackboard via LTI 1.3 standards.</p>
                          </div>
                          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
                              <Activity className="w-4 h-4 animate-pulse" /> Gateway Online
                          </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                          
                          {/* Left Column: Configuration */}
                          <div className="space-y-8">
                              
                              {/* Credentials Card */}
                              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                              <Shield className="w-5 h-5" />
                                          </div>
                                          <h3 className="font-bold text-slate-800">App Credentials</h3>
                                      </div>
                                      <select 
                                        value={ltiConfig.provider}
                                        onChange={(e) => setLtiConfig({...ltiConfig, provider: e.target.value})}
                                        className="text-sm border border-slate-300 rounded-lg px-3 py-1 font-bold text-slate-600 focus:outline-none"
                                      >
                                          <option>Canvas</option>
                                          <option>Schoology</option>
                                          <option>Moodle</option>
                                      </select>
                                  </div>
                                  
                                  <div className="p-6 space-y-6">
                                      {/* Client ID */}
                                      <div>
                                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Client ID (Developer Key)</label>
                                          <div className="flex gap-2">
                                              <div className="relative flex-grow">
                                                  <input 
                                                    type="text" 
                                                    value={ltiConfig.clientId}
                                                    readOnly
                                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none"
                                                  />
                                              </div>
                                              <button 
                                                onClick={() => handleCopy(ltiConfig.clientId, 'clientId')}
                                                className={`p-3 rounded-xl border-2 transition-all ${copiedField === 'clientId' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                              >
                                                  {copiedField === 'clientId' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                              </button>
                                          </div>
                                      </div>

                                      {/* Deployment ID */}
                                      <div>
                                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Deployment ID</label>
                                          <div className="flex gap-2">
                                              <div className="relative flex-grow">
                                                  <input 
                                                    type={showSecret ? "text" : "password"}
                                                    value={ltiConfig.deploymentId}
                                                    readOnly
                                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none"
                                                  />
                                                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                      {showSecret ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                                  </button>
                                              </div>
                                              <button 
                                                onClick={() => handleCopy(ltiConfig.deploymentId, 'depId')}
                                                className={`p-3 rounded-xl border-2 transition-all ${copiedField === 'depId' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                              >
                                                  {copiedField === 'depId' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                              </button>
                                          </div>
                                      </div>

                                      {/* Public Key */}
                                      <div>
                                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Public Key (JWK)</label>
                                          <div className="relative">
                                              <textarea 
                                                value={ltiConfig.publicKey}
                                                readOnly
                                                rows={4}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 focus:outline-none resize-none"
                                              />
                                              <button 
                                                onClick={() => handleCopy(ltiConfig.publicKey, 'pk')}
                                                className="absolute top-2 right-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm"
                                              >
                                                  <Copy className="w-4 h-4" />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* URLs Card */}
                              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center gap-3">
                                      <div className="bg-blue-600 p-2 rounded-lg text-white">
                                          <LinkIcon className="w-5 h-5" />
                                      </div>
                                      <h3 className="font-bold text-slate-800">Configuration URLs</h3>
                                  </div>
                                  <div className="p-6 space-y-6">
                                      {[
                                          { label: 'Login URL', val: `${ltiConfig.domain}/lti/login` },
                                          { label: 'Redirect URI', val: `${ltiConfig.domain}/lti/callback` },
                                          { label: 'Keyset URL (JWKS)', val: `${ltiConfig.domain}/.well-known/jwks.json` },
                                          { label: 'Target Link URI (Launch)', val: `${ltiConfig.domain}/lti/launch` },
                                      ].map((field, i) => (
                                          <div key={i}>
                                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{field.label}</label>
                                              <div className="flex gap-2">
                                                  <input 
                                                    type="text" 
                                                    value={field.val} 
                                                    readOnly 
                                                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-600 focus:outline-none"
                                                  />
                                                  <button 
                                                    onClick={() => handleCopy(field.val, `url-${i}`)}
                                                    className={`p-3 rounded-xl border-2 transition-all ${copiedField === `url-${i}` ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                                  >
                                                      {copiedField === `url-${i}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* Right Column: Webhook Console */}
                          <div className="space-y-8 flex flex-col h-full">
                              
                              <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col flex-grow border border-slate-800">
                                  <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                                              <Terminal className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <h3 className="font-bold text-slate-200 text-sm">Webhook Console</h3>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                  </span>
                                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Listening</span>
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => setWebhookLogs([])}
                                        className="text-slate-500 hover:text-white p-2 rounded-lg transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>

                                  <div className="flex-grow p-4 font-mono text-xs space-y-3 overflow-y-auto max-h-[600px] scrollbar-hide bg-slate-900">
                                      {webhookLogs.length === 0 && (
                                          <div className="text-slate-600 text-center py-12 italic">Waiting for incoming requests...</div>
                                      )}
                                      {webhookLogs.map((log) => (
                                          <div key={log.id} className="animate-fadeIn">
                                              <div className="flex items-start gap-3">
                                                  <span className="text-slate-500 min-w-[60px]">{log.timestamp}</span>
                                                  <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                          <span className={`font-bold ${log.method === 'POST' ? 'text-blue-400' : 'text-purple-400'}`}>{log.method}</span>
                                                          <span className="text-slate-300">{log.endpoint}</span>
                                                          <span className={`px-1.5 rounded text-[10px] font-bold ${log.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                              {log.status}
                                                          </span>
                                                      </div>
                                                      {log.payload && (
                                                          <div className="mt-1 text-slate-500 pl-2 border-l-2 border-slate-700">
                                                              {log.payload}
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                      <div ref={logsEndRef} />
                                  </div>
                              </div>

                              {/* Sync Toggles */}
                              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                      <Database className="w-5 h-5 text-purple-600" /> Data Synchronization
                                  </h3>
                                  <div className="space-y-4">
                                      {[
                                          { id: 'syncRoster', label: 'Roster Auto-Sync', desc: 'Automatically import students from LMS roster.' },
                                          { id: 'syncGrades', label: 'Grade Passback', desc: 'Send quiz results directly to the LMS gradebook.' },
                                          { id: 'syncContent', label: 'Deep Linking', desc: 'Allow embedding games as assignments.' }
                                      ].map((opt) => (
                                          <div key={opt.id} className="flex items-center justify-between">
                                              <div>
                                                  <div className="font-bold text-slate-700 text-sm">{opt.label}</div>
                                                  <div className="text-xs text-slate-400">{opt.desc}</div>
                                              </div>
                                              <button 
                                                onClick={() => setLtiConfig({...ltiConfig, [opt.id]: !ltiConfig[opt.id as keyof typeof ltiConfig]})}
                                                className={`w-10 h-6 rounded-full transition-colors relative ${ltiConfig[opt.id as keyof typeof ltiConfig] ? 'bg-purple-600' : 'bg-slate-200'}`}
                                              >
                                                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${ltiConfig[opt.id as keyof typeof ltiConfig] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                              </div>

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
                  <button 
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`p-2 rounded-full shadow-sm border transition-all ${activeTab === 'SETTINGS' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600'}`}
                  >
                      <Settings className="w-5 h-5" />
                  </button>
              </div>
          </header>
          {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboardView;
