
import React, { useState } from 'react';
import { CourseContent } from '../types';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Search } from 'lucide-react';

interface OutlineViewProps {
  content: CourseContent;
  onExit: () => void;
}

const OutlineView: React.FC<OutlineViewProps> = ({ content, onExit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredBenchmarks = content.benchmarks.filter(b => 
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <button 
             onClick={onExit} 
             className="flex items-center text-slate-500 hover:text-slate-800 font-bold mb-2 text-sm"
           >
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
           </button>
           <h1 className="text-3xl font-black text-slate-900">Course Outline & Standards</h1>
           <p className="text-slate-600 mt-1">{content.title} — {content.benchmarks.length} Benchmarks</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search standards..." 
            className="pl-10 pr-4 py-3 rounded-xl border border-slate-200 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredBenchmarks.length > 0 ? (
          filteredBenchmarks.map((bench) => (
            <div 
              key={bench.code} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === bench.code ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <button 
                onClick={() => toggleExpand(bench.code)}
                className="w-full text-left p-6 flex items-start gap-4"
              >
                <div className={`mt-1 font-mono text-sm font-bold px-3 py-1 rounded-lg ${expandedId === bench.code ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {bench.code}
                </div>
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-800 leading-snug">{bench.description}</h3>
                </div>
                {expandedId === bench.code ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {/* Clarifications / Details */}
              <div 
                className={`transition-all duration-300 ease-in-out bg-slate-50 border-t border-slate-100 ${expandedId === bench.code ? 'max-h-[500px] opacity-100 p-6' : 'max-h-0 opacity-0 p-0 overflow-hidden'}`}
              >
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Clarifications & Objectives</h4>
                 <ul className="space-y-3">
                   {bench.clarifications.map((clar, idx) => (
                     <li key={idx} className="flex gap-3 text-slate-700 leading-relaxed text-sm">
                       <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                       {clar}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
             No standards found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlineView;
