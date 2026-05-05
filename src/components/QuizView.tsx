
import React, { useState, useRef, useEffect } from 'react';
import { Question, GameMode } from '../types';
import { ArrowRight, CheckCircle, XCircle, AlertCircle, Lightbulb, Zap, Clock, Flame, Square, Triangle, Circle, Target, Book, MessageSquare, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import { WORLD_HISTORY_COURSE_CONTENT, CIVICS_COURSE_CONTENT, US_HISTORY_COURSE_CONTENT } from '../constants';
import * as webllm from '@mlc-ai/web-llm';
import { GoogleGenAI } from '@google/genai';

interface QuizViewProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  energy: number;
  gameMode: GameMode;
  combo: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  question,
  currentNumber,
  totalQuestions,
  energy,
  gameMode,
  combo,
  onAnswer,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [triggerRainbow, setTriggerRainbow] = useState(false);
  const [triggerGreenFlash, setTriggerGreenFlash] = useState(false);
  const [triggerRedFlash, setTriggerRedFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Speed mode timer

  // Dictionary & Tools Feature State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isToolPaneOpen, setIsToolPaneOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'dictionary' | 'lumi'>('dictionary');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wordDefinition, setWordDefinition] = useState<any | null>(null);
  const [isLoadingDef, setIsLoadingDef] = useState(false);

  // Lumi AI Status
  const [lumiEngine, setLumiEngine] = useState<webllm.MLCEngineInterface | null>(null);
  const [isLumiLoading, setIsLumiLoading] = useState(false);
  const [isLumiGenerating, setIsLumiGenerating] = useState(false);
  const [lumiProgress, setLumiProgress] = useState<string>('Not initialized.');
  const [lumiChatInput, setLumiChatInput] = useState('');
  const [lumiMessages, setLumiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [selectedModel, setSelectedModel] = useState<'spark' | 'aria' | 'flash'>('spark');
  const [loadingFact, setLoadingFact] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLumiLoading) return;
    const facts = [
      "Did you know? Octopuses have 3 hearts! 🐙",
      "Brushing up on history... no time travel required! ⏳",
      "Fun fact: Honey never spoils! 🍯",
      "Brewing some digital coffee... ☕",
      "Did you know? Bananas are berries, but strawberries are not! 🍌",
      "Fun fact: The shortest war in history lasted just 38 minutes! 🕰️",
      "Waking up the AI... don't worry, it's a morning person! 🌅",
      "Did you know? Wombats have cube-shaped poop! 🧊",
      "Gathering vast amounts of knowledge from the digital ether... 🧠",
      "Pro tip: Read all the answer choices before deciding! 📝",
      "Reticulating splines... just kidding! 🤖"
    ];
    let idx = Math.floor(Math.random() * facts.length);
    setLoadingFact(facts[idx]);
    
    const interval = setInterval(() => {
      idx = (idx + 1) % facts.length;
      setLoadingFact(facts[idx]);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isLumiLoading]);

  // Timed Memory Unloading when tools pane is closed
  useEffect(() => {
    if (!isToolPaneOpen && lumiEngine) {
      const timer = setTimeout(() => {
        console.log('Unloading WebLLM engine due to inactivity');
        lumiEngine.unload().catch(console.error);
        setLumiEngine(null);
        setLumiProgress("Unloaded to save memory. Click Load Model to wake me up.");
      }, 120000); // 2 minutes
      return () => clearTimeout(timer);
    }
  }, [isToolPaneOpen, lumiEngine]);

  const handleModelSwitch = async (model: 'spark' | 'aria' | 'flash') => {
    if (model === selectedModel) return;
    
    // Properly unload engine from GPU memory before switching
    if (lumiEngine) {
      setLumiProgress('Optimizing memory: unloading previous model...');
      try {
        await lumiEngine.unload();
      } catch (e) {
        console.error('Failed to unload WebLLM engine', e);
      }
    }
    
    setSelectedModel(model);
    setLumiEngine(null);
    setLumiProgress(model === 'flash' ? 'Ready to help via Cloud!' : 'Not initialized.');
    
    if (model === 'flash') {
      setLumiMessages([{ role: 'assistant', content: 'Hi! I am Lumi Flash. I run in the cloud, so I use zero battery. How can I help you today?' }]);
    } else {
      setLumiMessages([]);
    }
  };

  // Clear Cache function for WebLLM
  const clearWebLLMCache = async () => {
    try {
      setLumiProgress('Clearing cache...');
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.includes('webllm')) {
            await caches.delete(name);
          }
        }
      }
      setLumiProgress('Cache cleared! Try loading again.');
    } catch (e) {
      console.error('Failed to clear cache', e);
      setLumiProgress('Failed to clear cache.');
    }
  };

  // Initialize Lumi AI
  const initLumi = async () => {
    if (selectedModel === 'flash') return; // Flash uses cloud API
    if (lumiEngine) return;

    if (!navigator.gpu) {
      setLumiProgress("WebGPU not supported on this browser.");
      setLumiMessages([{ role: 'assistant', content: 'Your browser or device does not support WebGPU, which is required for local models. Please switch to Gemini Flash.' }]);
      return;
    }

    setIsLumiLoading(true);
    setLumiMessages([]);
    try {
      if (navigator.storage && navigator.storage.persist) {
        await navigator.storage.persist();
      }
      setLumiProgress(`0%`);
      const initProgressCallback = (report: webllm.InitProgressReport) => {
        setLumiProgress(`${Math.round(report.progress * 100)}%`);
      };
      
      const modelId = selectedModel === 'spark' 
        ? "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC" 
        : "gemma-2b-it-q4f32_1-MLC";

      // Cap the token context out of the box so weak devices don't crash
      const engine = await webllm.CreateMLCEngine(
        modelId, 
        {
          initProgressCallback,
          context_window_size: 1536
        }
      );
      setLumiEngine(engine);
      setLumiProgress('Ready to help!');
      setLumiMessages([{ role: 'assistant', content: `Hi! I am ${selectedModel === 'spark' ? 'Lumi' : 'Luma'}, powered by the ${selectedModel === 'spark' ? 'Spark' : 'Aria'} model. How can I help you understand this quiz better?` }]);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('Quota exceeded')) {
        setLumiProgress('Storage quota exceeded.');
        setLumiMessages([{ 
          role: 'assistant', 
          content: 'Storage Quota Exceeded! 🛑\n\nYour browser blocked the model from loading because there isn\'t enough permitted storage space. Please click **Clear Cache** below to free up space, and ensure you open this URL (`http://localhost:3000`) directly in a **NEW browser tab** instead of inside the VS Code editor!' 
        }]);
      } else {
        setLumiProgress('Error loading model: ' + error.message);
        setLumiMessages([{ role: 'assistant', content: `Sorry, my engine failed to load. Your browser might not support WebGPU, or there was a loading error.\n\nDetails: ${error.message}` }]);
      }
      console.error(error);
    } finally {
      setIsLumiLoading(false);
    }
  };

  const handleLumiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lumiChatInput.trim() || isLumiGenerating) return;

    if (selectedModel !== 'flash' && !lumiEngine) return;

    const userMessage = lumiChatInput.trim();
    setLumiChatInput('');
    setIsLumiGenerating(true);
    setIsLumiLoading(true);
    const newMessages: {role: 'user' | 'assistant', content: string}[] = [...lumiMessages, { role: 'user', content: userMessage }];
    setLumiMessages(newMessages);

    try {
      // Limit context window to last 5 messages to avoid blowing up memory limits
      const recentMessages = newMessages.length > 5 ? newMessages.slice(newMessages.length - 5) : newMessages;

      if (selectedModel === 'flash') {
          const apiKey = import.meta.env.VITE_API_KEY;
          if (!apiKey) {
            setLumiMessages([
              ...newMessages,
              { role: 'assistant', content: 'Lumi Spark is not configured yet. Please set VITE_API_KEY in your environment to enable Gemini Flash.' }
            ]);
            setIsLumiGenerating(false);
            setIsLumiLoading(false);
            return;
          }

          const ai = new GoogleGenAI({ apiKey });
          const transcript = recentMessages
            .map((m) => `${m.role === 'user' ? 'Student' : 'Lumi'}: ${m.content}`)
            .join('\n');

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Conversation so far:\n${transcript}\n\nRespond to the latest Student message as Lumi. Keep it supportive, brief, and educational.`,
            config: { temperature: 0.4, maxOutputTokens: 320 }
          });

          const modelText = (response.text || '').trim();
          setLumiMessages([...newMessages, { role: 'assistant', content: modelText }]);
          setIsLumiGenerating(false);
          setIsLumiLoading(false);
          return;
      }

      const messagesForEngine: webllm.ChatCompletionMessageParam[] = recentMessages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
      
      const chunks = await lumiEngine!.chat.completions.create({
        messages: messagesForEngine,
        stream: true,
        temperature: 0.7,
        max_tokens: 300,
      });

      let assistantMessageChunks = '';
      setLumiMessages([...newMessages, { role: 'assistant', content: '' }]);

      setIsLumiLoading(false);

      for await (const chunk of chunks) {
        if (chunk.choices[0]?.delta?.content) {
          assistantMessageChunks += chunk.choices[0].delta.content;
          setLumiMessages([...newMessages, { role: 'assistant', content: assistantMessageChunks }]);
        }
      }
    } catch (e: any) {
       console.error(e);
       setLumiMessages([...newMessages, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
       setIsLumiGenerating(false);
       setIsLumiLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lumiMessages]);

  // Find Benchmark Description
  const benchmarkInfo = 
    WORLD_HISTORY_COURSE_CONTENT.benchmarks.find(b => b.code === question.benchmark) ||
    CIVICS_COURSE_CONTENT.benchmarks.find(b => b.code === question.benchmark) ||
    US_HISTORY_COURSE_CONTENT.benchmarks.find(b => b.code === question.benchmark);

  // Reset timer on new question
  useEffect(() => {
    if (gameMode === 'speed') {
      setTimeLeft(10);
      setIsAnswered(false);
      setSelectedOption(null);
    }
  }, [question, gameMode]);

  // Timer Logic
  useEffect(() => {
    if (gameMode !== 'speed' || isAnswered) return;

    if (timeLeft <= 0) {
      // Time run out treated as wrong answer
      handleOptionClick(-1); // -1 indicates no option selected (time out)
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameMode]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctAnswerIndex;
    onAnswer(isCorrect); // Immediate feedback for energy bar

    if (isCorrect) {
      // Play Sound
      playSuccessSound();

      // Trigger standard confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      // Special Effects based on Mode and Combo
      if (gameMode === 'speed') {
         setTriggerGreenFlash(true);
         setTimeout(() => setTriggerGreenFlash(false), 400);
      } else {
         setTriggerRainbow(true);
         setTimeout(() => setTriggerRainbow(false), 800);
      }

      // Combo Effects
      if (combo >= 2) { 
         // Extra visuals if "speed" mode.
         if (gameMode === 'speed' && combo + 1 >= 3) {
            confetti({ particleCount: 50, spread: 120, origin: { y: 0.3 } });
         }
      }

    } else {
      // Play Sound
      playFailureSound();

      // Trigger Explosion
      const explosionColors = ['#ef4444', '#dc2626', '#b91c1c', '#7f1d1d', '#000000'];
      
      confetti({
        particleCount: 150,
        spread: 360,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors: explosionColors,
        shapes: ['circle', 'square'],
        scalar: 1.2,
        drift: 0,
        ticks: 60,
        gravity: 1.5,
        decay: 0.90
      });

      // Trigger Red Flash
      setTriggerRedFlash(true);
      setTimeout(() => setTriggerRedFlash(false), 500);
    }
  };

  const handleNextClick = () => {
    onNext();
    // Reset local state for next question
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setTriggerRainbow(false);
    setTriggerRedFlash(false);
    setTriggerGreenFlash(false);
    setSelectedWord(null);
    setWordDefinition(null);
  };

  const getOptionStyles = (index: number) => {
    const baseStyle =
      "relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full flex items-center justify-between group";

    if (!isAnswered) {
      return `${baseStyle} border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:scale-[0.99]`;
    }

    // If this option is the correct answer
    if (index === question.correctAnswerIndex) {
      return `${baseStyle} border-emerald-500 bg-emerald-50 text-emerald-800 font-medium`;
    }

    // If this option was selected but is wrong
    if (index === selectedOption && selectedOption !== question.correctAnswerIndex) {
      return `${baseStyle} border-red-500 bg-red-50 text-red-800 opacity-70`;
    }

    // Unselected options when answered
    return `${baseStyle} border-slate-100 bg-slate-50 text-slate-400`;
  };

  const handleWordSearch = async (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z\s\-]/g, '').trim().toLowerCase();
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    setIsLoadingDef(true);
    setWordDefinition(null);

    const extractDictionaryApiDefinition = (data: any): any => {
      if (!Array.isArray(data) || data.length === 0) return null;
      
      const entry = data[0];
      const result = {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '',
        meanings: [] as any[]
      };

      if (entry.meanings && Array.isArray(entry.meanings)) {
        entry.meanings.forEach((m: any) => {
          const meaning = {
            partOfSpeech: m.partOfSpeech,
            definitions: m.definitions.map((d: any) => d.definition),
            example: m.definitions.find((d: any) => d.example)?.example || ''
          };
          result.meanings.push(meaning);
        });
      }

      return result.meanings.length > 0 ? result : null;
    };

    const extractDatamuseDefinition = (data: any): string | null => {
      if (!Array.isArray(data) || data.length === 0) return null;

      const defs: unknown = data[0]?.defs;
      if (!Array.isArray(defs) || defs.length === 0) return null;

      const raw = defs[0];
      if (typeof raw !== 'string') return null;

      const pieces = raw.split('\t');
      const parsed = pieces.length > 1 ? pieces[1] : pieces[0];
      return parsed.trim().length > 0 ? parsed : null;
    };

    const fetchWithTimeout = async (url: string, timeoutMs = 7000): Promise<any> => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return await response.json();
      } finally {
        window.clearTimeout(timeout);
      }
    };

    try {
      const encodedWord = encodeURIComponent(cleanWord);

      const sources: Array<() => Promise<any>> = [
        async () => {
          const proxiedUrl = encodeURIComponent(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`);
          const data = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${proxiedUrl}`);
          return extractDictionaryApiDefinition(data);
        },
        async () => {
          const data = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodedWord}&md=d&max=1`);
          return extractDatamuseDefinition(data);
        }
      ];

      let resolvedDefinition: any = null;
      for (const source of sources) {
        try {
          const next = await source();
          if (next) {
            resolvedDefinition = next;
            break;
          }
        } catch {
          // Try next source.
        }
      }

      setWordDefinition(resolvedDefinition ?? "Definition not found.");
    } catch (e) {
      setWordDefinition("Failed to fetch definition.");
    }
    setIsLoadingDef(false);
  };

  const handleMouseUpText = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (text) {
      setSearchQuery(text);
      handleWordSearch(text);
      setIsToolPaneOpen(true);
      setActiveToolTab('dictionary');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleWordSearch(searchQuery);
    }
  };

  const getDynamicHint = () => {
    if (question.hint) return question.hint;
    const correctAns = question.options[question.correctAnswerIndex];
    if (!correctAns) return "Review the options carefully and eliminate the ones that contradict the question.";

    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'with', 'to', 'of', 'for', 'by', 'as', 'is', 'are', 'was', 'were', 'it', 'that', 'this', 'from', 'at', 'about', 'be', 'will', 'would', 'can', 'could', 'should', 'have', 'has', 'had', 'not', 'no', 'they', 'their', 'them', 'each', 'many', 'all', 'some', 'any', 'which', 'what', 'who']);
    
    const words = correctAns.replace(/[^\w\s-]/g, '').split(/\s+/);
    const keywords = words.filter((w: string) => !stopWords.has(w.toLowerCase()) && w.length > 2);
    
    if (keywords.length > 0) {
      const selectedKeywords = keywords.slice(0, 2).map((w: string) => w.toUpperCase());
      return selectedKeywords.length > 1 
        ? `Think about how the concepts of ${selectedKeywords[0]} and ${selectedKeywords[1]} relate to the question.`
        : `Consider how the concept of ${selectedKeywords[0]} plays a role here.`;
    }
    
    return "Think carefully about the keywords in the question.";
  };

  const progressPercentage = ((currentNumber - 1) / totalQuestions) * 100;

  // Energy bar color logic
  const getEnergyColor = () => {
    if (energy > 60) return 'bg-yellow-400';
    if (energy > 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Determine wrapper classes for shake effect
  const wrapperClass = (gameMode === 'speed' && isAnswered && selectedOption === question.correctAnswerIndex) 
    ? "w-full max-w-3xl mx-auto px-4 pb-32 relative z-10 animate-shake" 
    : "w-full max-w-3xl mx-auto px-4 pb-32 relative z-10";

  // Dynamic Background for Speed Mode
  const SpeedModeBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
       {/* Animated Gradient */}
       <div className="absolute inset-0 animate-speed-bg opacity-90"></div>
       
       {/* Floating Shapes */}
       <div className="absolute left-[10%] animate-float" style={{ animationDuration: '8s', animationDelay: '0s' }}>
          <Square className="w-16 h-16 text-white opacity-20 rotate-12" />
       </div>
       <div className="absolute left-[30%] animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }}>
          <Circle className="w-10 h-10 text-yellow-300 opacity-20" />
       </div>
       <div className="absolute left-[60%] animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }}>
          <Triangle className="w-20 h-20 text-blue-200 opacity-20 rotate-45" />
       </div>
       <div className="absolute left-[85%] animate-float" style={{ animationDuration: '10s', animationDelay: '0.5s' }}>
          <Zap className="w-12 h-12 text-purple-300 opacity-20" />
       </div>
       
       {/* Dark overlay pattern to maintain readability */}
       <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
    </div>
  );

  return (
    <>
      {gameMode === 'speed' && <SpeedModeBackground />}
    
      <div className={wrapperClass}>
        {/* Rainbow Flash Overlay */}
        {triggerRainbow && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-rainbow-flash opacity-40 mix-blend-overlay" />
        )}

        {/* Red Flash Overlay */}
        {triggerRedFlash && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-red-flash" />
        )}
        
        {/* Green Flash Overlay (Speed Mode) */}
        {triggerGreenFlash && (
          <div className="fixed inset-0 pointer-events-none z-[100] animate-green-flash" />
        )}

        {/* Combo Effects Overlays */}
        {combo >= 3 && gameMode === 'speed' && (
          <div className="fixed inset-0 pointer-events-none z-[50] animate-lightning opacity-30 mix-blend-screen" />
        )}
        {combo >= 7 && gameMode === 'speed' && (
          <div className="fixed inset-0 pointer-events-none z-[40] animate-blue-fire border-[20px] border-blue-500/20 rounded-none" />
        )}

        {/* Top HUD: Energy & Combo */}
        <div className="flex gap-4 mb-6 relative z-20">
          {/* Energy Bar */}
          <div className="flex-1 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Zap className={`w-6 h-6 ${energy > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                  className={`h-full ${getEnergyColor()} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,0,0.5)]`}
                  style={{ width: `${energy}%` }}
              />
              </div>
              <span className="text-sm font-bold text-slate-600 w-12 text-right">{energy}%</span>
          </div>

          {/* Combo Counter (Speed Mode) */}
          {gameMode === 'speed' && (
             <div className={`p-3 rounded-2xl shadow-sm border flex items-center gap-2 font-bold px-4 transition-all ${combo > 2 ? 'bg-orange-50 border-orange-200 text-orange-600 scale-105 shadow-orange-100' : 'bg-white border-slate-100 text-slate-400'}`}>
                <Flame className={`w-5 h-5 ${combo > 4 ? 'animate-pulse fill-orange-500' : ''}`} />
                x{combo}
             </div>
          )}
        </div>

        {/* Speed Timer */}
        {gameMode === 'speed' && !isAnswered && (
            <div className="flex justify-center mb-6 relative z-20">
                <div className={`
                  flex items-center gap-2 px-8 py-3 rounded-full font-mono text-2xl font-black shadow-lg transition-colors border-4
                  ${timeLeft <= 3 
                    ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                    : 'bg-black/80 border-white/20 text-white animate-neon-pulse'}
                `}>
                    <Clock className="w-6 h-6" />
                    00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>
        )}

        {/* Progress Header */}
        <div className="mb-4 relative z-20">
          <div className="flex justify-between items-end mb-2">
            <span className={`text-sm font-bold tracking-wider uppercase ${gameMode === 'speed' ? 'text-white/80' : 'text-slate-400'}`}>
              {question.unit}
            </span>
            <span className="text-sm font-semibold text-slate-600 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
              {currentNumber} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full transition-all duration-500 ease-out ${gameMode === 'speed' ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-blue-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`
          rounded-3xl shadow-xl overflow-hidden mb-6 relative z-20 transition-all duration-300
          ${gameMode === 'speed' 
             ? 'bg-white/95 backdrop-blur-xl border-4 border-white/40 shadow-2xl shadow-purple-500/20' 
             : 'bg-white border border-slate-100'}
          ${combo >= 7 && gameMode === 'speed' ? 'shadow-blue-500/50 border-blue-400' : ''}
        `}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6 relative">
               <div className="flex-1 mr-4">
                  <h2 
                    onMouseUp={handleMouseUpText}
                    className="text-2xl font-bold text-slate-800 leading-snug cursor-text"
                  >
                    {question.question}
                  </h2>
              </div>
              <div className="flex gap-2">
                 {!isAnswered && gameMode !== 'speed' && (
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="p-2 rounded-full hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 transition-colors"
                      title="Show Hint"
                    >
                        <Lightbulb className={`w-6 h-6 ${showHint ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </button>
                 )}
                 <button 
                    onClick={() => { setIsToolPaneOpen(!isToolPaneOpen); }}
                    className="p-2 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Open Tools"
                  >
                      <Sparkles className="w-6 h-6" />
                  </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${showHint ? 'max-h-32 mb-6 opacity-100' : 'max-h-0 mb-0 opacity-0'}
            `}>
               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 flex gap-3">
                  <Lightbulb className="w-5 h-5 flex-shrink-0" />
                  <p><strong>Hint:</strong> {getDynamicHint()}</p>
               </div>
            </div>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={getOptionStyles(idx)}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                        isAnswered
                          ? idx === question.correctAnswerIndex
                            ? "bg-emerald-200 border-emerald-300 text-emerald-700"
                            : idx === selectedOption
                            ? "bg-red-200 border-red-300 text-red-700"
                            : "bg-slate-100 border-slate-200 text-slate-400"
                          : "bg-white border-slate-300 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                  
                  {isAnswered && idx === question.correctAnswerIndex && (
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== question.correctAnswerIndex && (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Footer */}
          <div className={`
            border-t transition-all duration-300 overflow-hidden
            ${isAnswered ? 'max-h-32 p-4 bg-slate-50' : 'max-h-0'}
          `}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  {selectedOption === question.correctAnswerIndex ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-2 animate-bounce">
                          Correct! Great job.
                      </span>
                  ) : (
                      <span className="text-red-700 font-bold flex items-center gap-2">
                          <AlertCircle className="w-5 h-5"/>
                          Correct: {String.fromCharCode(65 + question.correctAnswerIndex)}
                      </span>
                  )}
               </div>

               <button
                onClick={handleNextClick}
                className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
               >
                 {currentNumber === totalQuestions ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* --- STANDARDS FOOTER (Visible at all times) --- */}
        {question.benchmark && (
            <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-30 transition-all duration-500 ${isAnswered ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-700 shrink-0">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-wide">
                                {question.benchmark}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Standard
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-snug">
                            {benchmarkInfo ? benchmarkInfo.description : 'Standard description loading...'}
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* --- TOOLS SIDE PANEL --- */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-slate-50 shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-[100] flex flex-col ${isToolPaneOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 bg-white border-b border-slate-200">
           <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveToolTab('dictionary')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${activeToolTab === 'dictionary' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Book className="w-4 h-4" /> Dictionary
             </button>
             <button 
                onClick={() => { setActiveToolTab('lumi'); }}
                className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${activeToolTab === 'lumi' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Sparkles className="w-4 h-4" /> AI Helper
             </button>
           </div>
           <button onClick={() => setIsToolPaneOpen(false)} className="text-slate-400 hover:text-slate-800 p-1 rounded-full">
             <XCircle className="w-6 h-6" />
           </button>
        </div>

        {/* Dictionary Tab Panel */}
        <div className={`p-6 flex-1 overflow-y-auto bg-[#fdfbf7] ${activeToolTab === 'dictionary' ? 'block' : 'hidden'}`}>
           <form onSubmit={handleSearchSubmit} className="flex mb-6 opacity-100 transition-opacity">
              <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search dictionary..."
                 className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif"
              />
           </form>
           
           {isLoadingDef ? (
              <div className="flex items-center gap-2 text-slate-500 py-8 justify-center flex-col">
                 <Zap className="w-8 h-8 animate-pulse text-yellow-500 fill-yellow-500 mb-2" />
                 <span className="font-serif">Looking up...</span>
              </div>
           ) : (
              <div className="pr-2 custom-scrollbar">
                 {typeof wordDefinition === 'object' && wordDefinition !== null ? (
                    <div>
                       <div className="mb-4 border-b border-slate-200 pb-3">
                          <h3 className="font-bold text-3xl font-serif capitalize text-slate-800">{wordDefinition.word}</h3>
                          {wordDefinition.phonetic && (
                             <span className="text-slate-500 italic text-base block mt-1">{wordDefinition.phonetic}</span>
                          )}
                       </div>
                       {wordDefinition.meanings.map((meaning: any, index: number) => (
                          <div key={index} className="mb-5">
                             <p className="italic font-serif text-blue-800 font-bold mb-2 text-lg">{meaning.partOfSpeech}</p>
                             <ol className="list-decimal pl-5 space-y-2">
                             {meaning.definitions.map((def: string, i: number) => (
                                <li key={i} className="text-slate-700 leading-relaxed font-serif">{def}</li>
                             ))}
                             </ol>
                             {meaning.example && (
                                <p className="text-slate-500 italic mt-2 pl-4 border-l-2 border-blue-300 ml-1 block">"{meaning.example}"</p>
                             )}
                          </div>
                       ))}
                    </div>
                 ) : (
                    <p className="leading-relaxed text-slate-600 font-serif text-center mt-10">
                       {wordDefinition || "Highlight a word in the quiz or type a word above to see its definition."}
                    </p>
                 )}
              </div>
           )}
        </div>

        {/* Lumi Tab Panel */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden ${activeToolTab === 'lumi' ? 'flex' : 'hidden'}`}>
           
           <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-center gap-2 flex-wrap">
             <button 
               onClick={() => handleModelSwitch('spark')}
               className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedModel === 'spark' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
             >
               Spark (Local)
             </button>
             <button 
               onClick={() => handleModelSwitch('aria')}
               className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedModel === 'aria' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
             >
               Aria (Local)
             </button>
             <button 
               onClick={() => handleModelSwitch('flash')}
               className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedModel === 'flash' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
             >
               Flash (Cloud)
             </button>
           </div>

           {selectedModel !== 'flash' && !lumiEngine && !isLumiLoading && lumiMessages.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <Sparkles className={`w-12 h-12 mb-4 ${selectedModel === 'spark' ? 'text-purple-500' : 'text-blue-500'}`} />
                <h3 className="font-bold text-slate-700 text-lg mb-2">Ready to Load {selectedModel === 'spark' ? 'Lumi Spark' : 'Luma Aria'}</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-[250px]">
                  Load the model directly into your browser's local cache. 
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={initLumi}
                    className={`px-6 py-2 rounded-lg text-white font-bold transition-all shadow-md ${selectedModel === 'spark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Load Model
                  </button>
                  <button 
                    onClick={clearWebLLMCache}
                    className="px-6 py-2 rounded-lg text-slate-600 bg-slate-200 font-bold transition-all shadow-md hover:bg-slate-300"
                  >
                    Clear Cache
                  </button>
                </div>
             </div>
           ) : isLumiLoading && lumiMessages.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <Sparkles className={`w-12 h-12 animate-pulse mb-4 ${selectedModel === 'spark' ? 'text-purple-500' : 'text-blue-500'}`} />
                <h3 className="font-bold text-slate-700 text-lg mb-2">Waking up {selectedModel === 'spark' ? 'Lumi Spark' : 'Luma Aria'}...</h3>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2 mt-4 overflow-hidden">
                   <div className={`h-2 rounded-full transition-all duration-300 ${selectedModel === 'spark' ? 'bg-purple-500' : 'bg-blue-500'}`} style={{width: lumiProgress.includes('%') ? lumiProgress : '100%'}}></div>
                </div>
                <p className="text-xs text-slate-400 font-mono font-bold mb-6">{lumiProgress}</p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-[250px] min-h-[80px] flex items-center justify-center">
                   <p className="text-sm text-slate-600 font-medium italic transition-opacity min-h-[40px]">
                      "{loadingFact}"
                   </p>
                </div>
             </div>
           ) : (
             <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {lumiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm'}`}>
                            {msg.role === 'assistant' && i === lumiMessages.length - 1 && msg.content === '' ? (
                               <span className="flex gap-1 items-center h-4 py-2">
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                               </span>
                            ) : (
                               <p className="text-sm leading-relaxed">{msg.content}</p>
                            )}
                         </div>
                      </div>
                   ))}
                   <div ref={chatBottomRef} />
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                   <form onSubmit={handleLumiSubmit} className="flex gap-2">
                      <input 
                         type="text" 
                         value={lumiChatInput}
                         onChange={(e) => setLumiChatInput(e.target.value)}
                         placeholder="Ask Lumi..."
                         className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                      />
                      <button 
                         type="submit" 
                         disabled={!lumiChatInput.trim() || isLumiGenerating || !lumiEngine}
                         className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                         <Send className="w-5 h-5" />
                      </button>
                   </form>
                </div>
             </>
           )}
        </div>
      </div>

    </>
  );
};

export default QuizView;
