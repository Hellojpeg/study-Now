
import React, { useState } from 'react';
import { SubjectId, GameMode, Assignment, WeeklyTask } from '../types';
import { MOCK_ASSIGNMENTS, MOCK_WEEKLY_TASKS } from '../constants';
import { Calendar, CheckCircle, Circle, Clock, ChevronRight, BookOpen, BrainCircuit, Play, BarChart2, Star, Zap } from 'lucide-react';

interface DashboardViewProps {
  onStartAssignment: (mode: GameMode, subject: SubjectId) => void;
  userName: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onStartAssignment, userName }) => {
  const [tasks, setTasks] = useState<WeeklyTask[]>(MOCK_WEEKLY_TASKS);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);

  const handleCompleteTask = (index: number) => {
      if (tasks[index].isLocked) return;
      const newTasks = [...tasks];
      newTasks[index].isCompleted = !newTasks[index].isCompleted;
      setTasks(newTasks);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  Welcome back, {userName}
              </h1>
              <p className="text-slate-500 font-medium">Here is your agenda for today.</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Grade</div>
                  <div className="text-2xl font-black text-emerald-500">92% A</div>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
              <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">XP Earned</div>
                  <div className="text-2xl font-black text-blue-500">2,450</div>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COL: WEEKLY TASKS & STATS */}
          <div className="lg:col-span-1 space-y-8">
              
              {/* Bell Work Tracker */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-500" /> Weekly Bell Work
                      </h2>
                      <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{completedCount}/5 Done</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-6">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="space-y-3">
                      {tasks.map((task, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleCompleteTask(idx)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer group
                                ${task.isCompleted ? 'bg-purple-50 border-purple-200' : task.isLocked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-purple-300'}
                            `}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${task.isCompleted ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                      {task.day}
                                  </div>
                                  <span className={`font-bold ${task.isCompleted ? 'text-purple-900' : 'text-slate-600'}`}>{task.label}</span>
                              </div>
                              {task.isCompleted ? <CheckCircle className="w-5 h-5 text-purple-500" /> : <Circle className="w-5 h-5 text-slate-300 group-hover:text-purple-400" />}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl text-white">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-300" /> Study Streak</h3>
                  <div className="flex items-end gap-2 mb-2">
                      <span className="text-5xl font-black">12</span>
                      <span className="text-lg font-medium opacity-80 mb-2">days</span>
                  </div>
                  <p className="text-sm opacity-70">Keep it up! You're on fire.</p>
              </div>
          </div>

          {/* RIGHT COL: ASSIGNMENTS & QUICK ACCESS */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Assignments Panel */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" /> Assignments
                  </h2>
                  
                  <div className="space-y-4">
                      {assignments.map(assign => (
                          <div key={assign.id} className="group flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-4">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md
                                      ${assign.subject === 'world-history' ? 'bg-emerald-500' : assign.subject === 'civics' ? 'bg-blue-500' : 'bg-red-500'}
                                  `}>
                                      {assign.type === 'QUIZ' ? <BrainCircuit className="w-6 h-6" /> : assign.type === 'READING' ? <BookOpen className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{assign.title}</h3>
                                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                          <span className={`${assign.subject === 'world-history' ? 'text-emerald-600' : 'text-blue-600'}`}>{assign.subject.replace('-', ' ')}</span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {assign.dueDate}</span>
                                          <span>•</span>
                                          <span>{assign.points} PTS</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <button 
                                onClick={() => onStartAssignment(assign.linkMode, assign.subject)}
                                className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                  Start <ChevronRight className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                      { label: "Quiz Mode", icon: BrainCircuit, color: "bg-purple-100 text-purple-700", mode: 'standard' },
                      { label: "Flashcards", icon: Star, color: "bg-yellow-100 text-yellow-700", mode: 'flashcards' },
                      { label: "Textbook", icon: BookOpen, color: "bg-blue-100 text-blue-700", mode: 'textbook' },
                      { label: "Results", icon: BarChart2, color: "bg-slate-100 text-slate-700", mode: 'outline' }, // Placeholder for results view if separate
                  ].map((action, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => onStartAssignment(action.mode as GameMode, 'world-history')}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 h-32"
                      >
                          <div className={`p-3 rounded-full ${action.color}`}>
                              <action.icon className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;
