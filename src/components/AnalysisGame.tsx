
import React, { useState, useEffect } from 'react';
import { AnalysisScenario, AnalysisTask, VennItem } from '../types';
import { ANALYSIS_SCENARIOS } from '../constants';
import { ArrowLeft, BookOpen, PenTool, CheckCircle, MessageSquare, AlertCircle, RefreshCw, ChevronRight, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import { GoogleGenAI, Type } from "@google/genai";

interface AnalysisGameProps {
  onExit: () => void;
}

const AnalysisGame: React.FC<AnalysisGameProps> = ({ onExit }) => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  
  // Input States
  const [userResponse, setUserResponse] = useState('');
  const [vennState, setVennState] = useState<VennItem[]>([]);
  
  // Feedback States
  const [isGrading, setIsGrading] = useState(false);
  const [gradeFeedback, setGradeFeedback] = useState<{score: number, message: string} | null>(null);
  const [vennFeedback, setVennFeedback] = useState<string | null>(null);

  const scenario = ANALYSIS_SCENARIOS[activeScenarioIndex];
  const task = scenario.tasks[activeTaskIndex];

  useEffect(() => {
      // Reset state when task changes
      setUserResponse('');
      setGradeFeedback(null);
      setVennFeedback(null);
      if (task.type === 'VENN' && task.vennItems) {
          // Shuffle items initially
          setVennState([...task.vennItems].sort(() => 0.5 - Math.random()));
      }
  }, [activeScenarioIndex, activeTaskIndex, task]);

  // --- SHORT RESPONSE LOGIC ---

  const handleTextSubmit = async () => {
      if (userResponse.length < 20) {
          alert("Please write a more detailed response.");
          return;
      }

      setIsGrading(true);
      
      try {
          // Use AI to grade the response
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `You are an 8th Grade Civics teacher grading a student response.
              
              Task Prompt: "${task.prompt}"
              Rubric Keywords/Concepts: ${task.rubricKeywords?.join(', ')}
              Ideal Sample Answer: "${task.sampleAnswer}"
              
              Student Response: "${userResponse}"
              
              Grade this on a scale of 1-4:
              4: Excellent (Accurate, detailed, uses evidence)
              3: Proficient (Mostly accurate, some detail)
              2: Developing (Partial understanding, vague)
              1: Needs Improvement (Incorrect or irrelevant)
              
              Provide a short, encouraging feedback message (max 2 sentences).`,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          score: { type: Type.INTEGER },
                          message: { type: Type.STRING }
                      },
                      required: ['score', 'message']
                  }
              }
          });

          const result = JSON.parse(response.text || '{}');
          
          if (result.score) {
              setGradeFeedback({ score: result.score, message: result.message });
              if (result.score >= 3) {
                  playSuccessSound();
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } else {
                  playFailureSound();
              }
          } else {
              throw new Error("Invalid AI response");
          }

      } catch (error) {
          console.error("AI Grading Error", error);
          // Fallback to simple keyword matching if AI fails
          const keywords = task.rubricKeywords || [];
          const lowerText = userResponse.toLowerCase();
          
          let matches = 0;
          keywords.forEach(kw => {
              if (lowerText.includes(kw.toLowerCase())) matches++;
          });

          const percentage = matches / keywords.length;
          let score = 1;
          let msg = "Please review the text again. You missed key details.";

          if (percentage > 0.7) {
              score = 4;
              msg = "Excellent analysis! You identified the core concepts accurately.";
              playSuccessSound();
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else if (percentage > 0.4) {
              score = 3;
              msg = "Good effort. Try to include more specific examples from the text.";
              playSuccessSound();
          } else if (percentage > 0.2) {
              score = 2;
              msg = "You're on the right track, but your answer is incomplete.";
          } else {
              playFailureSound();
          }
          setGradeFeedback({ score, message: msg });
      } finally {
          setIsGrading(false);
      }
  };

  // --- VENN DIAGRAM LOGIC ---

  // Cycle zone: None -> A -> Both -> B -> None
  const cycleVennZone = (itemId: string) => {
      if (vennFeedback) return; // Locked if already submitted

      setVennState(prev => prev.map(item => {
          if (item.id !== itemId) return item;
          
          // Current mapping visual logic handled in render, here we assume a 'currentZone' property attached to item for display? 
          // Actually, let's attach a temporary property for the UI state
          const currentZone = (item as any).uiZone || 'NONE';
          let nextZone = 'NONE';
          
          if (currentZone === 'NONE') nextZone = 'A';
          else if (currentZone === 'A') nextZone = 'BOTH';
          else if (currentZone === 'BOTH') nextZone = 'B';
          else if (currentZone === 'B') nextZone = 'NONE';

          return { ...item, uiZone: nextZone };
      }));
  };

  const checkVennDiagram = () => {
      let correctCount = 0;
      let incorrect = false;

      vennState.forEach(item => {
          const placedZone = (item as any).uiZone || 'NONE';
          if (placedZone === item.correctZone) {
              correctCount++;
          } else {
              incorrect = true;
          }
      });

      if (!incorrect && correctCount === vennState.length) {
          setVennFeedback("Perfect! You clearly understand the differences.");
          playSuccessSound();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
          setVennFeedback(`You got ${correctCount}/${vennState.length} correct. Keep trying!`);
          playFailureSound();
      }
  };

  const handleNext = () => {
      if (activeTaskIndex < scenario.tasks.length - 1) {
          setActiveTaskIndex(prev => prev + 1);
      } else if (activeScenarioIndex < ANALYSIS_SCENARIOS.length - 1) {
          setActiveScenarioIndex(prev => prev + 1);
          setActiveTaskIndex(0);
      } else {
          onExit(); // Finished all
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* LEFT PANEL: DOCUMENT / SOURCE */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen p-6 bg-[#fdfbf7] border-r border-stone-200 overflow-y-auto relative shadow-inner">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/5 to-transparent"></div>
          
          <button onClick={onExit} className="mb-6 flex items-center text-stone-500 hover:text-stone-800 font-bold uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Menu
          </button>

          <div className="max-w-2xl mx-auto font-serif">
              <div className="text-center mb-8 pb-4 border-b-2 border-stone-200">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 block">Primary Source Document</span>
                  <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">{scenario.title}</h1>
                  {scenario.source && <p className="text-stone-500 italic">{scenario.source}</p>}
              </div>

              <div className="prose prose-stone prose-lg text-justify leading-loose text-stone-800 p-8 bg-white shadow-sm border border-stone-100 rounded-sm">
                  {/* Drop Cap */}
                  <span className="float-left text-7xl font-black text-stone-300 mr-4 mt-[-10px] leading-none">
                      {scenario.excerpt.charAt(0)}
                  </span>
                  {scenario.excerpt.substring(1)}
              </div>
          </div>
      </div>

      {/* RIGHT PANEL: TASK INTERACTION */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen bg-slate-50 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
              <div className="max-w-xl mx-auto">
                  
                  {/* Task Header */}
                  <div className="flex items-center justify-between mb-6">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200">
                          <PenTool className="w-3 h-3" /> 
                          {task.type === 'SHORT_RESPONSE' ? 'Critical Analysis' : 'Compare & Contrast'}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                          Task {activeTaskIndex + 1} / {scenario.tasks.length}
                      </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 mb-8">{task.prompt}</h2>

                  {/* --- SHORT RESPONSE UI --- */}
                  {task.type === 'SHORT_RESPONSE' && (
                      <div className="space-y-6">
                          <textarea 
                              className="w-full h-48 p-6 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 leading-relaxed resize-none shadow-sm font-medium"
                              placeholder="Type your analysis here..."
                              value={userResponse}
                              onChange={(e) => setUserResponse(e.target.value)}
                              disabled={!!gradeFeedback}
                          ></textarea>

                          {!gradeFeedback && !isGrading && (
                              <button 
                                  onClick={handleTextSubmit}
                                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                              >
                                  Submit to Mr. Gomez
                              </button>
                          )}

                          {isGrading && (
                              <div className="flex items-center justify-center gap-3 text-slate-500 font-bold animate-pulse py-4">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                                  Teacher is grading...
                              </div>
                          )}

                          {gradeFeedback && (
                              <div className={`p-6 rounded-2xl border-2 animate-fadeIn ${gradeFeedback.score >= 3 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                  <div className="flex items-start gap-4">
                                      <div className={`p-3 rounded-full ${gradeFeedback.score >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                          <User className="w-6 h-6" />
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-slate-800 mb-1">Teacher Feedback</h3>
                                          <div className="flex items-center gap-1 mb-2">
                                              {[1,2,3,4].map(star => (
                                                  <div key={star} className={`w-4 h-1 rounded-full ${star <= gradeFeedback.score ? (gradeFeedback.score >=3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-200'}`}></div>
                                              ))}
                                          </div>
                                          <p className="text-slate-600 text-sm leading-relaxed">{gradeFeedback.message}</p>
                                          
                                          {gradeFeedback.score < 3 && task.sampleAnswer && (
                                              <div className="mt-4 pt-4 border-t border-amber-200/50">
                                                  <div className="text-xs font-bold uppercase text-amber-500 mb-1">Model Answer</div>
                                                  <p className="text-xs text-slate-500 italic">"{task.sampleAnswer}"</p>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* --- VENN DIAGRAM UI --- */}
                  {task.type === 'VENN' && task.vennItems && (
                      <div className="space-y-8">
                          {/* Visual Venn Representation (Zones) */}
                          <div className="flex justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                              <div className="flex-1">{task.vennLabels?.a}</div>
                              <div className="flex-1">Both</div>
                              <div className="flex-1">{task.vennLabels?.b}</div>
                          </div>

                          {/* Items List */}
                          <div className="grid gap-3">
                              {vennState.map(item => {
                                  const zone = (item as any).uiZone || 'NONE';
                                  let zoneColor = 'bg-white border-slate-200 text-slate-600';
                                  let align = 'justify-center';
                                  
                                  if (zone === 'A') { 
                                      zoneColor = 'bg-blue-50 border-blue-200 text-blue-700 ml-0 mr-auto w-2/3 shadow-sm';
                                      align = 'justify-start pl-4';
                                  }
                                  else if (zone === 'B') {
                                      zoneColor = 'bg-red-50 border-red-200 text-red-700 ml-auto mr-0 w-2/3 shadow-sm';
                                      align = 'justify-end pr-4';
                                  }
                                  else if (zone === 'BOTH') {
                                      zoneColor = 'bg-purple-50 border-purple-200 text-purple-700 mx-auto w-2/3 shadow-sm';
                                      align = 'justify-center';
                                  }

                                  return (
                                      <button 
                                          key={item.id}
                                          onClick={() => cycleVennZone(item.id)}
                                          disabled={!!vennFeedback}
                                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center ${zoneColor} ${align} hover:scale-[1.02] active:scale-[0.98]`}
                                      >
                                          {item.text}
                                      </button>
                                  );
                              })}
                          </div>
                          
                          <div className="text-center text-xs text-slate-400">Click items to move them between zones</div>

                          {!vennFeedback && (
                              <button 
                                  onClick={checkVennDiagram}
                                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                              >
                                  Check Placements
                              </button>
                          )}

                          {vennFeedback && (
                              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 text-center shadow-sm">
                                  <p className="font-bold text-slate-800 mb-4">{vennFeedback}</p>
                                  <button onClick={() => setVennFeedback(null)} className="text-blue-600 text-sm font-bold flex items-center justify-center gap-1 mx-auto hover:underline">
                                      <RefreshCw className="w-4 h-4" /> Try Again
                                  </button>
                              </div>
                          )}
                      </div>
                  )}

              </div>
          </div>

          {/* NEXT BUTTON FOOTER */}
          {(gradeFeedback?.score && gradeFeedback.score >= 3 || (vennFeedback && vennFeedback.includes("Perfect"))) && (
              <div className="p-6 bg-white border-t border-slate-200 animate-slideUp">
                  <button 
                      onClick={handleNext}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                      Next Task <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default AnalysisGame;
