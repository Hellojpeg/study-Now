
import React, { useState } from 'react';
import { CourseContent, Chapter } from '../types';
import { Book, ChevronRight, ArrowLeft } from 'lucide-react';

interface BookViewProps {
  content: CourseContent;
  onExit: () => void;
}

const BookView: React.FC<BookViewProps> = ({ content, onExit }) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(content.chapters[0]?.id || '');

  const activeChapter = content.chapters.find(c => c.id === activeChapterId);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-fadeIn">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-slate-800">
             <Book className="w-5 h-5 text-blue-600" />
             Table of Contents
           </div>
           <button onClick={onExit} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">
             <ArrowLeft className="w-5 h-5" />
           </button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
           {content.chapters.map(chapter => (
             <button
               key={chapter.id}
               onClick={() => setActiveChapterId(chapter.id)}
               className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group
                 ${activeChapterId === chapter.id 
                   ? 'bg-blue-50 text-blue-700' 
                   : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
               `}
             >
               {chapter.title}
               {activeChapterId === chapter.id && <ChevronRight className="w-4 h-4" />}
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
         {activeChapter ? (
           <>
             <div className="p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
                <h1 className="text-3xl font-black text-slate-900">{activeChapter.title}</h1>
             </div>
             <div className="p-8 md:p-12 overflow-y-auto text-lg leading-relaxed text-slate-700 space-y-6">
                {activeChapter.content.map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-4xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-1 first-letter:float-left">
                    {paragraph}
                  </p>
                ))}
             </div>
           </>
         ) : (
           <div className="flex items-center justify-center h-full text-slate-400">
             Select a chapter to begin reading.
           </div>
         )}
      </div>
    </div>
  );
};

export default BookView;
