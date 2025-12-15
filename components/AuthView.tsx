
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { BookOpen, UserCircle, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- TEACHER SECURITY CHECK ---
    // Credentials obfuscated (Base64) to prevent plain text visibility
    // Target: jpgomezmedia@gmail.com / Cathalina1
    const T_HASH_E = "anBnb21lem1lZGlhQGdtYWlsLmNvbQ=="; 
    const T_HASH_P = "Q2F0aGFsaW5hMQ==";

    if (role === 'TEACHER') {
        if (mode === 'SIGNUP') {
            alert("New Teacher registration is restricted. Please contact the administrator.");
            return;
        }

        try {
            // Verify against encoded values
            if (btoa(email) === T_HASH_E && btoa(password) === T_HASH_P) {
                const user: User = {
                    id: 'teacher-gomez',
                    name: 'Mr. Gomez',
                    email: email,
                    role: 'TEACHER'
                };
                onLogin(user);
            } else {
                alert("Invalid Credentials for Teacher Access");
            }
        } catch (e) {
            console.error("Auth Error");
            alert("Authentication failed.");
        }
        return;
    }

    // --- STUDENT SIMULATION ---
    const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: mode === 'LOGIN' ? 'Student' : name,
        email,
        role: 'STUDENT'
    };
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000')] bg-cover opacity-20 blur-sm"></div>
       
       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl grid md:grid-cols-2 relative z-10 animate-fadeIn h-[600px]">
           {/* Left: Branding */}
           <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
               <div>
                   <div className="flex items-center gap-3 mb-8">
                       <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                           <BookOpen className="w-6 h-6 text-white" />
                       </div>
                       <span className="font-bold text-xl tracking-tight">Midterm Prep</span>
                   </div>
                   <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                       {mode === 'LOGIN' ? 'Welcome back!' : 'Join the class.'}
                   </h1>
                   <p className="text-slate-400 text-lg">
                       {mode === 'LOGIN' 
                         ? 'Ready to continue your learning streak? Sign in to access your dashboard.' 
                         : 'Create an account to track progress, join classes, and compete.'}
                   </p>
               </div>
               <div className="text-sm text-slate-500">© 2024 EduPrep Inc.</div>
           </div>

           {/* Right: Form */}
           <div className="p-12 flex flex-col justify-center">
               <button onClick={onCancel} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 font-bold text-sm">
                   <ArrowLeft className="w-4 h-4" /> Back to Home
               </button>

               <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-xl w-fit mx-auto md:mx-0">
                   <button 
                     onClick={() => setMode('LOGIN')}
                     className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'LOGIN' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                       Sign In
                   </button>
                   <button 
                     onClick={() => setMode('SIGNUP')}
                     className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'SIGNUP' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                       Create Account
                   </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-4">
                   {mode === 'SIGNUP' && (
                       <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Full Name</label>
                           <input 
                             type="text" 
                             value={name}
                             onChange={e => setName(e.target.value)}
                             className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                             placeholder="John Doe"
                             required
                           />
                       </div>
                   )}
                   
                   <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Email Address</label>
                       <input 
                         type="email" 
                         value={email}
                         onChange={e => setEmail(e.target.value)}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                         placeholder="you@school.edu"
                         required
                       />
                   </div>

                   <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Password</label>
                       <input 
                         type="password" 
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                         placeholder="••••••••"
                         required
                       />
                   </div>

                   <div className="pt-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">I am a...</label>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                             type="button"
                             onClick={() => setRole('STUDENT')}
                             className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${role === 'STUDENT' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                           >
                               <UserCircle className="w-5 h-5" /> Student
                           </button>
                           <button 
                             type="button"
                             onClick={() => setRole('TEACHER')}
                             className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${role === 'TEACHER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                           >
                               <GraduationCap className="w-5 h-5" /> Teacher
                           </button>
                       </div>
                   </div>

                   <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 mt-6 flex items-center justify-center gap-2">
                       {mode === 'LOGIN' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                   </button>
               </form>
           </div>
       </div>
    </div>
  );
};

export default AuthView;
