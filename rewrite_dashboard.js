const fs = require('fs');

const content = `
import React, { useState, useEffect } from 'react';
import { SubjectId, GameMode, Assignment, WeeklyTask, User } from '../types';
import { MOCK_ASSIGNMENTS, MOCK_WEEKLY_TASKS, QUIZZES } from '../constants';
import { Calendar, CheckCircle, Circle, Clock, ChevronRight, BookOpen, BrainCircuit, Target, BarChart2, Star, Zap, History, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface DashboardViewProps {
  onStartAssignment: (mode: GameMode, subject: SubjectId) => void;
  user: User;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onStartAssignment, user }) => {
  const [tasks, setTasks] = useState<WeeklyTask[]>(MOCK_WEEKLY_TASKS);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [weakStandards, setWeakStandards] = useState<{benchmark: string, missedCount: number}[]>([]);
  const [strongStandards, setStrongStandards] = useState<{benchmark: string, successCount: number}[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoadingStats(true);
        const q = query(
          collection(db, 'scores'), 
          where('userId', '==', user.id),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        
        let history: any[] = [];
        let totalScoreSum = 0;
        let totalQuestionsSum = 0;
        let missedCounts: Record<string, number> = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            history.push({
                id: doc.id,
                date: data.timestamp?.toDate()?.toLocaleDateString() || 'Recently',
                score: data.score,
                total: data.totalQuestions,
                percentage: Math.round((data.score / (data.totalQuestions || 1)) * 100),
                subject: data.subjectId
            });
            
            totalScoreSum += data.score;
            totalQuestionsSum += (data.totalQuestions || 0);
            
            // Tally missed standards
            if (data.missedQuestions && Array.isArray(data.missedQuestions)) {
               const questionsBank = QUIZZES[data.subjectId as SubjectId]?.questions || [];
               data.missedQuestions.forEach((qId: number) => {
                   const q = questionsBank.find(x => x.id === qId);
                   if (q && q.benchmark) {
                       missedCounts[q.benchmark] = (missedCounts[q.benchmark] || 0) + 1;
                   }
               });
            }
        });
        
        setTestHistory(history.slice(0, 5)); // Keep only recent 5
        if (totalQuestionsSum > 0) {
            setAverageScore(Math.round((totalScoreSum / totalQuestionsSum) * 100));
        }

        // Sort weak standards
        const sortedWeak = Object.entries(missedCounts)
            .map(([benchmark, count]) => ({ benchmark, missedCount: count }))
            .sort((a, b) => b.missedCount - a.missedCount);
            
        setWeakStandards(sortedWeak.slice(0, 5));
        
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (user?.id) fetchScores();
  }, [user]);

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
                  Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="text-slate-500 font-medium">Ready to conquer the EOC?</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Avg</div>
                  <div className="text-2xl font-black text-emerald-500">{averageScore !== null ? \`\${averageScore}%\` : '--'}</div>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
              <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tests Taken</div>
                  <div className="text-2xl font-black text-blue-500">{testHistory.length || 0}</div>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COL: HISTORY & STATS */}
          <div className="lg:col-span-1 space-y-8">
              
              {/* Test History Widget */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                      <History className="w-5 h-5 text-indigo-500" /> Recent Activity
                  </h2>
                  
                  {loadingStats ? (
                      <p className="text-center text-slate-400 text-sm py-4">Loading history...</p>
                  ) : testHistory.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-4">No quizzes taken yet. Complete some assignments!</p>
                  ) : (
                      <div className="space-y-4">
                          {testHistory.map((test, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                  <div>
                                      <div className="font-bold text-slate-700 capitalize">{test.subject} Quiz</div>
                                      <div className="text-xs text-slate-400 font-medium">{test.date}</div>
                                  </div>
                                  <div className={\`font-black text-lg \${test.percentage >= 80 ? 'text-emerald-500' : test.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}\`}>
                                      {test.score}/{test.total}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Standard Mastery Tracker */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                      <Target className="w-5 h-5 text-red-500" /> Standards Needs Work
                  </h2>
                  {loadingStats ? (
                      <p className="text-center text-slate-400 text-sm py-4">Analyzing standards...</p>
                  ) : weakStandards.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-4">You have no missed standards! Great job.</p>
                  ) : (
                      <div className="space-y-3">
                          {weakStandards.map((std, idx) => (
                              <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                      <div className="font-bold text-red-900 text-sm">{std.benchmark}</div>
                                      <div className="text-xs text-red-600 font-medium">Missed {std.missedCount} {std.missedCount === 1 ? 'time' : 'times'}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
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
              
              {/* Assignments / Study Path */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" /> Recommended Practice
                  </h2>
                  
                  <div className="space-y-4">
                      {assignments.map(assign => (
                          <div key={assign.id} className="group flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-4">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className={\`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md \${assign.subject === 'civics' ? 'bg-blue-500' : 'bg-emerald-500'}\`}>
                                      {assign.type === 'QUIZ' ? <BrainCircuit className="w-6 h-6" /> : assign.type === 'READING' ? <BookOpen className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{assign.title}</h3>
                                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                          <span className="text-blue-600 capitalize">{assign.subject.replace('-', ' ')}</span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> For: {assign.dueDate}</span>
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
                      { label: "Outline", icon: BookOpen, color: "bg-blue-100 text-blue-700", mode: 'outline' },
                      { label: "Test History", icon: BarChart2, color: "bg-slate-100 text-slate-700", mode: 'boss' },
                  ].map((action, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => onStartAssignment(action.mode as GameMode, 'civics')}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 h-32"
                      >
                          <div className={\`p-3 rounded-full \${action.color}\`}>
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
`;

fs.writeFileSync('/workspaces/study-Now/src/components/DashboardView.tsx', content);
