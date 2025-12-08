import React, { useState, useEffect, useRef } from 'react';
import { SubjectId, Question, MultiplayerGameState, Player, GameSettings, MultiplayerGameMode } from '../types';
import { QUIZZES } from '../constants';
import { Users, Play, Trophy, Square, Circle, Triangle, Hexagon, ArrowRight, UserPlus, Monitor, Smartphone, Crown, Star, KeyRound, Settings, Zap, ToggleLeft, ToggleRight, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/audio';

// --- Constants ---
const SHAPES = [Triangle, Hexagon, Circle, Square];
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
const TEXT_COLORS = ['text-red-500', 'text-blue-500', 'text-yellow-500', 'text-green-500'];

interface MultiplayerGameProps {
  subjectId: SubjectId;
  onExit: () => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ subjectId, onExit }) => {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');
  const [gameState, setGameState] = useState<MultiplayerGameState>('MENU');
  
  // Room State
  const [roomCode, setRoomCode] = useState<string>('');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
      gameMode: 'CLASSIC',
      timerDuration: 20,
      autoPlay: false
  });
  
  // Host State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answersReceived, setAnswersReceived] = useState(0);
  const [smashCounts, setSmashCounts] = useState<number[]>([0, 0, 0, 0]); // For Smash Mode
  
  // Player State
  const [playerName, setPlayerName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(0);

  // Shared
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerRef = useRef<any>(null);
  const autoPlayTimeoutRef = useRef<any>(null);
  
  const quiz = QUIZZES[subjectId];
  const currentQuestion = quiz.questions[currentQuestionIdx];

  // --- Initialization ---
  useEffect(() => {
    // Only connect if we have a room code and a role
    if (!roomCode || role === 'NONE') return;

    const channelName = `mr_gomez_quiz_${roomCode}`;
    console.log(`Connecting to channel: ${channelName}`);
    channelRef.current = new BroadcastChannel(channelName);
    
    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      handleMessage(type, payload);
    };

    return () => {
      channelRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, [role, roomCode]); 

  // --- Auto Advance Logic (Classic Mode) ---
  useEffect(() => {
      if (role === 'HOST' && gameState === 'QUESTION' && gameSettings.gameMode === 'CLASSIC') {
          if (players.length > 0 && answersReceived >= players.length) {
              // Everyone answered, wait a brief moment then end
              setTimeout(() => endQuestion(), 1000);
          }
      }
  }, [answersReceived, players.length, gameState, role, gameSettings.gameMode]);

  // --- Auto Play Logic (Host Only) ---
  useEffect(() => {
      if (role !== 'HOST' || !gameSettings.autoPlay) return;

      if (gameState === 'RESULT') {
          autoPlayTimeoutRef.current = setTimeout(() => {
              showLeaderboard();
          }, 5000); // Show result for 5s
      } else if (gameState === 'LEADERBOARD') {
          autoPlayTimeoutRef.current = setTimeout(() => {
              nextQuestion();
          }, 5000); // Show leaderboard for 5s
      }

      return () => {
          if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
      };
  }, [gameState, gameSettings.autoPlay, role]);


  const handleMessage = (type: string, payload: any) => {
    if (role === 'HOST') {
      if (type === 'JOIN') {
        setPlayers(prev => {
          if (prev.find(p => p.id === payload.id)) return prev;
          return [...prev, { 
            ...payload, 
            score: 0, 
            streak: 0, 
            lastAnswerCorrect: null,
            rank: prev.length + 1,
            previousRank: prev.length + 1,
            avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
          }];
        });
        // Sync new player immediately
        broadcastState('LOBBY', { questionIdx: 0, settings: gameSettings });
      }
      if (type === 'ANSWER') {
        const { playerId, answerIndex, timeTaken } = payload;
        handlePlayerAnswer(playerId, answerIndex, timeTaken);
      }
      if (type === 'SMASH') {
          const { playerId, answerIndex } = payload;
          handlePlayerSmash(playerId, answerIndex);
      }
    } 
    
    if (role === 'PLAYER') {
      if (type === 'UPDATE_STATE') {
        setGameState(payload.state);
        setCurrentQuestionIdx(payload.questionIdx);
        
        // Sync settings if sent
        if (payload.settings) {
            setGameSettings(payload.settings);
        }
        
        if (payload.state === 'QUESTION') {
            setHasAnswered(false);
            setLastAnswerCorrect(null);
            setTimeLeft(payload.timeLeft);
        }

        // If leaderboard update, find my score
        if (payload.players) {
            const me = payload.players.find((p: Player) => p.id === myPlayerId);
            if (me) {
                setPlayerScore(me.score);
                setPlayerRank(me.rank);
                setLastAnswerCorrect(me.lastAnswerCorrect);
            }
        }
      }
    }
  };

  const broadcastState = (state: MultiplayerGameState, extraPayload: any = {}) => {
    setGameState(state);
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'UPDATE_STATE',
        payload: {
          state,
          questionIdx: currentQuestionIdx,
          players: role === 'HOST' ? players : undefined, // Send full player list for leaderboard
          settings: gameSettings,
          ...extraPayload
        }
      });
    }
  };

  // --- Host Logic ---

  const handleHostStartGame = () => {
    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    setRole('HOST');
    setGameState('LOBBY');
  };

  const handleHostStartQuiz = () => {
    startQuestion(0);
  };

  const startQuestion = (idx: number) => {
    setCurrentQuestionIdx(idx);
    setAnswersReceived(0);
    setSmashCounts([0, 0, 0, 0]); // Reset smash counts
    
    // Reset transient player states for this question
    setPlayers(prev => prev.map(p => ({ ...p, lastAnswerCorrect: null, lastAnswerTime: null })));
    
    const time = gameSettings.timerDuration;
    setTimeLeft(time);
    broadcastState('QUESTION', { timeLeft: time });
    
    // Clear existing timer if any
    if (timerRef.current) clearInterval(timerRef.current);

    // Start Timer
    timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                endQuestion();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };

  const endQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    broadcastState('RESULT', { players }); // Show correct/incorrect feedback
  };

  // CLASSIC MODE HANDLER
  const handlePlayerAnswer = (playerId: string, answerIndex: number, timeTaken: number) => {
    setAnswersReceived(prev => prev + 1);
    
    setPlayers(prev => {
       return prev.map(p => {
           if (p.id !== playerId) return p;
           
           const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
           let points = 0;
           
           if (isCorrect) {
               // Base 1000 + Time Bonus (up to 1000)
               const timeBonus = Math.round((1 - (timeTaken / (gameSettings.timerDuration * 1000))) * 1000);
               points = 1000 + Math.max(0, timeBonus);
               // Streak Bonus
               points += (p.streak * 100);
           }

           return {
               ...p,
               score: p.score + points,
               streak: isCorrect ? p.streak + 1 : 0,
               lastAnswerCorrect: isCorrect,
               lastAnswerTime: timeTaken
           };
       });
    });
  };

  // SMASH MODE HANDLER (Tug of War)
  const handlePlayerSmash = (playerId: string, answerIndex: number) => {
      // Update global counts for visualization
      setSmashCounts(prev => {
          const newCounts = [...prev];
          newCounts[answerIndex] = (newCounts[answerIndex] || 0) + 1;
          return newCounts;
      });

      // Update player score (points for every correct click)
      setPlayers(prev => {
          return prev.map(p => {
              if (p.id !== playerId) return p;
              const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
              return {
                  ...p,
                  score: p.score + (isCorrect ? 10 : 0), // 10 points per correct smash
                  lastAnswerCorrect: isCorrect // technically keeps updating
              };
          });
      });
  };

  const showLeaderboard = () => {
    // Sort players and update ranks
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const rankedPlayers = sortedPlayers.map((p, idx) => ({
        ...p,
        previousRank: p.rank,
        rank: idx + 1
    }));
    
    setPlayers(rankedPlayers);
    broadcastState('LEADERBOARD', { players: rankedPlayers });
  };

  const nextQuestion = () => {
     if (currentQuestionIdx < quiz.questions.length - 1) {
         startQuestion(currentQuestionIdx + 1);
     } else {
         // Final Podium
         broadcastState('PODIUM', { players });
         confetti({ particleCount: 300, spread: 200, origin: { y: 0.6 } });
     }
  };

  // --- Player Logic ---

  const handleJoinGame = () => {
     if (!playerName.trim() || !joinCodeInput.trim()) return;
     
     const code = joinCodeInput.trim();
     setRoomCode(code);
     
     const id = Math.random().toString(36).substr(2, 9);
     setMyPlayerId(id);
     setRole('PLAYER');
     setGameState('LOBBY'); // Assume lobby until state update
     
     // Need a slight delay to ensure channel connection is established
     setTimeout(() => {
        if (channelRef.current) {
            console.log("Sending JOIN request");
            channelRef.current.postMessage({
                type: 'JOIN',
                payload: { id, name: playerName }
            });
        }
     }, 100);
  };

  const sendAnswer = (idx: number) => {
     // Classic mode only allows one answer
     if (gameSettings.gameMode === 'CLASSIC') {
        if (hasAnswered) return;
        setHasAnswered(true);
        const timeTaken = (gameSettings.timerDuration - timeLeft) * 1000;
        
        if (channelRef.current) {
            channelRef.current.postMessage({
                type: 'ANSWER',
                payload: { playerId: myPlayerId, answerIndex: idx, timeTaken }
            });
        }
     } else {
         // Smash mode allows infinite clicks
         if (channelRef.current) {
             channelRef.current.postMessage({
                 type: 'SMASH',
                 payload: { playerId: myPlayerId, answerIndex: idx }
             });
         }
     }
  };

  // --- Render Helpers ---
  
  const addBot = () => {
      const botNames = ['SmartyPants', 'HistoryBuff', 'QuizWhiz', 'Speedy', 'Brainiac'];
      const name = botNames[players.length % botNames.length] + (players.length + 1);
      const id = 'bot-' + Math.random();
      
      const newBot: Player = {
          id,
          name,
          score: 0,
          streak: 0,
          lastAnswerCorrect: null,
          lastAnswerTime: 0,
          rank: players.length + 1,
          previousRank: players.length + 1,
          avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      
      setPlayers(prev => [...prev, newBot]);
  };

  // Simulate bots answering (Classic Only)
  useEffect(() => {
     if (role === 'HOST' && gameState === 'QUESTION' && gameSettings.gameMode === 'CLASSIC') {
         const bots = players.filter(p => p.id.startsWith('bot-'));
         bots.forEach(bot => {
             const delay = Math.random() * (gameSettings.timerDuration * 1000 * 0.8) + 1000; 
             const isCorrect = Math.random() > 0.3; // 70% accuracy
             const answerIdx = isCorrect 
                ? currentQuestion.correctAnswerIndex 
                : (currentQuestion.correctAnswerIndex + 1) % 4;

             setTimeout(() => {
                 handlePlayerAnswer(bot.id, answerIdx, delay);
             }, delay);
         });
     }
     
     // Simulate bots smashing (Smash Mode)
     if (role === 'HOST' && gameState === 'QUESTION' && gameSettings.gameMode === 'SMASH') {
         const bots = players.filter(p => p.id.startsWith('bot-'));
         const botInterval = setInterval(() => {
             bots.forEach(bot => {
                 if (Math.random() > 0.5) { // 50% chance to smash per tick
                    const isCorrect = Math.random() > 0.2; // Bots are pretty good smashers
                    const idx = isCorrect ? currentQuestion.correctAnswerIndex : Math.floor(Math.random() * 4);
                    handlePlayerSmash(bot.id, idx);
                 }
             });
         }, 500);
         
         return () => clearInterval(botInterval);
     }
  }, [gameState, role, currentQuestionIdx, gameSettings.gameMode]);


  // ------------------------------------------
  //              RENDER VIEWS
  // ------------------------------------------

  // 1. MAIN MENU
  if (gameState === 'MENU') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fadeIn max-w-5xl mx-auto p-6">
            <h1 className="text-4xl font-black text-slate-800 text-center">
                Join or Host Game
            </h1>
            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* HOST CARD */}
                <button 
                    onClick={handleHostStartGame}
                    className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all group text-left"
                >
                    <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                        <Monitor className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Host a Game</h2>
                    <p className="text-slate-500">Big screen mode. Control the game from your device.</p>
                </button>

                {/* PLAYER CARD */}
                <div className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all group text-left flex flex-col">
                    <div className="bg-emerald-100 p-4 rounded-2xl w-fit mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Join a Game</h2>
                    
                    <div className="space-y-3 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Game Code</label>
                            <input 
                                type="text" 
                                placeholder="123456"
                                maxLength={6}
                                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 font-mono font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                                value={joinCodeInput}
                                onChange={e => setJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nickname</label>
                            <input 
                                type="text" 
                                placeholder="Enter your name"
                                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={playerName}
                                onChange={e => setPlayerName(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleJoinGame}
                        disabled={!playerName || joinCodeInput.length < 4}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Join Room
                    </button>
                </div>
            </div>
            <button onClick={onExit} className="text-slate-400 hover:text-slate-600 font-bold mt-4">
                Back to Menu
            </button>
        </div>
    );
  }

  // 2. HOST VIEW
  if (role === 'HOST') {
      return (
          <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                 <div className="font-black text-xl text-white/50 flex items-center gap-2">
                     <Monitor className="w-5 h-5" /> HOST: {roomCode}
                 </div>
                 
                 {/* In-Game Settings Controls */}
                 {gameState !== 'LOBBY' && (
                     <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full">
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-white/50">Auto-Play</span>
                            <button onClick={() => setGameSettings(s => ({...s, autoPlay: !s.autoPlay}))}>
                                {gameSettings.autoPlay ? <ToggleRight className="w-8 h-8 text-green-400" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                            </button>
                         </div>
                         <div className="w-px h-6 bg-white/20"></div>
                         <button 
                           onClick={gameState === 'QUESTION' ? endQuestion : gameState === 'RESULT' ? showLeaderboard : nextQuestion}
                           className="bg-white/20 p-2 rounded-lg hover:bg-white/30"
                           title="Skip / Next"
                         >
                            <FastForward className="w-5 h-5" />
                         </button>
                     </div>
                 )}

                 <div className="bg-white/10 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                     <Users className="w-5 h-5" /> {players.length}
                 </div>
             </div>

             {/* Content Area */}
             <div className="flex-grow flex items-center justify-center relative">
                 
                 {/* LOBBY */}
                 {gameState === 'LOBBY' && (
                     <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Left: Players */}
                         <div className="lg:col-span-2 text-center">
                             <div className="mb-8">
                                 <div className="text-xl font-bold text-blue-400 mb-2 uppercase tracking-widest">Join at Mr. Gomez's Class</div>
                                 <div className="text-8xl md:text-9xl font-black bg-white text-slate-900 inline-block px-12 py-6 rounded-3xl font-mono tracking-widest shadow-[0_0_60px_rgba(37,99,235,0.5)] animate-pulse">
                                     {roomCode}
                                 </div>
                             </div>
                             
                             <div className="flex flex-wrap justify-center gap-4 mb-12">
                                 {players.map(p => (
                                     <div key={p.id} className={`${p.avatarColor} px-6 py-3 rounded-2xl font-bold text-white shadow-lg animate-fadeIn flex items-center gap-2`}>
                                         <div className="w-2 h-2 bg-white rounded-full animate-bounce" /> {p.name}
                                     </div>
                                 ))}
                                 {players.length === 0 && <div className="text-slate-500 italic text-xl">Waiting for players to join...</div>}
                             </div>
                         </div>

                         {/* Right: Settings */}
                         <div className="bg-slate-800 p-6 rounded-3xl h-fit border border-slate-700">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Game Settings</h3>
                             
                             <div className="space-y-6">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Game Mode</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         <button 
                                            onClick={() => setGameSettings(s => ({...s, gameMode: 'CLASSIC'}))}
                                            className={`p-3 rounded-xl font-bold text-sm border-2 ${gameSettings.gameMode === 'CLASSIC' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                                         >
                                             CLASSIC
                                         </button>
                                         <button 
                                            onClick={() => setGameSettings(s => ({...s, gameMode: 'SMASH'}))}
                                            className={`p-3 rounded-xl font-bold text-sm border-2 ${gameSettings.gameMode === 'SMASH' ? 'bg-purple-600 border-purple-400' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                                         >
                                             SMASH MODE
                                         </button>
                                     </div>
                                     <p className="text-xs text-slate-500 mt-2">
                                         {gameSettings.gameMode === 'CLASSIC' ? 'Standard quiz. Speed & accuracy.' : 'Tug of War. Button mashing madness.'}
                                     </p>
                                 </div>

                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timer (Seconds)</label>
                                     <input 
                                        type="range" min="10" max="60" step="5" 
                                        value={gameSettings.timerDuration}
                                        onChange={(e) => setGameSettings(s => ({...s, timerDuration: parseInt(e.target.value)}))}
                                        className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                     />
                                     <div className="text-right font-bold mt-1">{gameSettings.timerDuration}s</div>
                                 </div>

                                 <div className="flex items-center justify-between">
                                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Play</label>
                                     <button onClick={() => setGameSettings(s => ({...s, autoPlay: !s.autoPlay}))}>
                                         {gameSettings.autoPlay ? <ToggleRight className="w-10 h-10 text-green-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                                     </button>
                                 </div>

                                 <div className="pt-6 border-t border-slate-700 space-y-3">
                                     <button onClick={addBot} className="w-full px-4 py-3 bg-white/5 rounded-xl font-bold text-sm hover:bg-white/10">
                                         + Add Bot
                                     </button>
                                     <button onClick={handleHostStartQuiz} className="w-full px-4 py-4 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500 shadow-lg shadow-blue-500/50">
                                         Start Game
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* QUESTION */}
                 {gameState === 'QUESTION' && (
                     <div className="w-full max-w-6xl">
                         <div className="flex justify-between mb-8">
                             <div className="bg-white/10 px-6 py-3 rounded-full text-2xl font-bold">
                                {currentQuestionIdx + 1} / {quiz.questions.length}
                             </div>
                             <div className="bg-purple-600 px-6 py-3 rounded-full text-2xl font-bold animate-pulse">
                                {timeLeft}s
                             </div>
                         </div>
                         
                         <div className="bg-white text-slate-900 p-12 rounded-3xl shadow-2xl mb-8 text-center min-h-[300px] flex flex-col justify-center relative overflow-hidden">
                             {/* Smash Mode Background Effect */}
                             {gameSettings.gameMode === 'SMASH' && (
                                 <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-100 flex">
                                     {smashCounts.map((count, idx) => {
                                         const total = Math.max(1, smashCounts.reduce((a,b) => a+b, 0));
                                         const percent = (count / total) * 100;
                                         return (
                                             <div key={idx} className={`${COLORS[idx]} transition-all duration-300`} style={{width: `${percent}%`}}></div>
                                         )
                                     })}
                                 </div>
                             )}

                             <h2 className="text-4xl font-black leading-tight z-10">{currentQuestion.question}</h2>
                             {currentQuestion.hint && (
                                 <p className="mt-6 text-slate-500 italic text-xl z-10">Hint: {currentQuestion.hint}</p>
                             )}
                         </div>

                         {/* Options Grid */}
                         <div className="grid grid-cols-2 gap-4">
                             {currentQuestion.options.map((opt, idx) => {
                                 const Shape = SHAPES[idx];
                                 
                                 // Smash Mode Visualization (Bar Chart behind option)
                                 const smashTotal = Math.max(1, smashCounts.reduce((a, b) => a + b, 0));
                                 const smashPercent = gameSettings.gameMode === 'SMASH' ? (smashCounts[idx] / smashTotal) * 100 : 0;

                                 return (
                                     <div key={idx} className={`${COLORS[idx]} p-8 rounded-2xl flex items-center gap-6 shadow-lg relative overflow-hidden`}>
                                         {/* Smash Meter */}
                                         {gameSettings.gameMode === 'SMASH' && (
                                             <div 
                                                className="absolute inset-0 bg-black/20 origin-left transition-transform duration-100" 
                                                style={{transform: `scaleX(${smashPercent / 100})`}}
                                             />
                                         )}
                                         
                                         <div className="relative z-10 flex items-center gap-6 w-full">
                                            <Shape className="w-12 h-12 text-white fill-white/20 flex-shrink-0" />
                                            <span className="text-2xl font-bold text-white flex-grow">{opt}</span>
                                            {gameSettings.gameMode === 'SMASH' && (
                                                <span className="text-3xl font-black text-white/40">{smashCounts[idx]}</span>
                                            )}
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>

                         <div className="text-center mt-8 text-2xl font-bold text-white/50">
                             {gameSettings.gameMode === 'CLASSIC' ? (
                                 <>{answersReceived} Answers Received</>
                             ) : (
                                 <>{smashCounts.reduce((a,b)=>a+b, 0)} Total Smashes</>
                             )}
                         </div>
                     </div>
                 )}

                 {/* RESULT (Correct Answer Reveal) */}
                 {gameState === 'RESULT' && (
                     <div className="w-full max-w-5xl text-center">
                        <h2 className="text-4xl font-bold mb-8">Correct Answer</h2>
                        
                        <div className={`${COLORS[currentQuestion.correctAnswerIndex]} p-12 rounded-3xl shadow-2xl mb-12 transform scale-110 transition-transform`}>
                            <div className="flex flex-col items-center gap-4">
                                {React.createElement(SHAPES[currentQuestion.correctAnswerIndex], { className: "w-20 h-20 text-white" })}
                                <span className="text-4xl font-black text-white">
                                    {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                                </span>
                            </div>
                        </div>
                        
                        {!gameSettings.autoPlay && (
                            <button onClick={showLeaderboard} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-xl hover:bg-slate-200 shadow-lg group">
                                Show Leaderboard <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        {gameSettings.autoPlay && (
                            <div className="text-slate-400 animate-pulse">Auto-playing...</div>
                        )}
                     </div>
                 )}

                 {/* LEADERBOARD */}
                 {gameState === 'LEADERBOARD' && (
                     <div className="w-full max-w-4xl">
                         <h2 className="text-4xl font-black text-center mb-8">Leaderboard</h2>
                         <div className="space-y-4 mb-12">
                             {players.slice(0, 5).map((p, idx) => (
                                 <div key={p.id} className="bg-white text-slate-900 p-4 rounded-xl flex items-center shadow-lg transform transition-all hover:scale-105">
                                     <div className={`w-12 text-2xl font-black ${idx === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>#{idx + 1}</div>
                                     <div className="flex-1 font-bold text-xl">{p.name}</div>
                                     <div className="flex items-center gap-4">
                                         {p.lastAnswerCorrect && <div className="text-green-500 font-bold text-sm bg-green-100 px-2 py-1 rounded">🔥 Streak {p.streak}</div>}
                                         <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-mono font-bold min-w-[80px] text-center">
                                             {p.score}
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <div className="text-center">
                             {!gameSettings.autoPlay && (
                                <button onClick={nextQuestion} className="px-8 py-4 bg-blue-600 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-500 transition-colors">
                                    Next Question
                                </button>
                             )}
                             {gameSettings.autoPlay && (
                                <div className="text-slate-400 animate-pulse">Starting next question...</div>
                             )}
                         </div>
                     </div>
                 )}

                 {/* PODIUM */}
                 {gameState === 'PODIUM' && (
                     <div className="text-center w-full">
                         <h1 className="text-6xl font-black mb-12 text-yellow-400 drop-shadow-lg">PODIUM</h1>
                         <div className="flex justify-center items-end gap-4 h-96">
                             {/* 2nd Place */}
                             {players[1] && (
                                 <div className="w-48 bg-slate-700 rounded-t-lg flex flex-col justify-end items-center pb-4 h-2/3 animate-float" style={{animationDelay: '0.2s'}}>
                                     <div className="mb-4 text-2xl font-bold">{players[1].name}</div>
                                     <div className="text-4xl font-black text-slate-400">2</div>
                                     <div className="mt-2 font-mono opacity-50">{players[1].score}</div>
                                 </div>
                             )}
                             {/* 1st Place */}
                             {players[0] && (
                                 <div className="w-48 bg-yellow-500 text-yellow-900 rounded-t-lg flex flex-col justify-end items-center pb-8 h-full animate-float shadow-[0_0_50px_rgba(234,179,8,0.5)] z-10 relative">
                                     <Crown className="w-12 h-12 mb-2 animate-bounce absolute -top-16" />
                                     <div className="mb-4 text-3xl font-black">{players[0].name}</div>
                                     <div className="text-6xl font-black">1</div>
                                     <div className="mt-2 font-mono font-bold">{players[0].score}</div>
                                 </div>
                             )}
                             {/* 3rd Place */}
                             {players[2] && (
                                 <div className="w-48 bg-slate-800 rounded-t-lg flex flex-col justify-end items-center pb-4 h-1/2 animate-float" style={{animationDelay: '0.4s'}}>
                                     <div className="mb-4 text-2xl font-bold">{players[2].name}</div>
                                     <div className="text-4xl font-black text-orange-700">3</div>
                                     <div className="mt-2 font-mono opacity-50">{players[2].score}</div>
                                 </div>
                             )}
                         </div>
                         <button onClick={onExit} className="mt-12 px-8 py-4 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-colors">
                             Return to Menu
                         </button>
                     </div>
                 )}
             </div>
          </div>
      );
  }

  // 3. PLAYER VIEW
  if (role === 'PLAYER') {
      // Waiting Screen (Lobby or waiting for next Q)
      if (gameState === 'LOBBY' || gameState === 'LEADERBOARD' || gameState === 'RESULT') {
          return (
              <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-6 text-white text-center">
                  <div className="bg-white/10 px-4 py-1 rounded-full text-sm font-mono mb-4">Room: {roomCode}</div>
                  
                  {gameState === 'LOBBY' && (
                     <>
                        <div className="text-2xl font-bold mb-2">You are in!</div>
                        <h1 className="text-4xl font-black mb-8">{playerName}</h1>
                        <div className="animate-pulse text-xl text-blue-300">Waiting for host to start...</div>
                     </>
                  )}

                  {gameState === 'RESULT' && (
                      <div className={`p-8 rounded-3xl mb-8 w-full max-w-md shadow-2xl ${lastAnswerCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                          <h2 className="text-3xl font-black mb-2">
                              {lastAnswerCorrect ? 'Correct!' : 'Incorrect'}
                          </h2>
                          {lastAnswerCorrect ? (
                              <p className="font-bold opacity-90">Great job! Streak: +1</p>
                          ) : (
                              <p className="font-bold opacity-90">Don't give up!</p>
                          )}
                      </div>
                  )}

                  {gameState !== 'LOBBY' && playerScore > 0 && (
                      <div className="bg-white/10 p-4 rounded-xl w-full max-w-xs backdrop-blur-sm border border-white/10">
                          <div className="text-sm opacity-50 uppercase tracking-widest font-bold">Your Score</div>
                          <div className="text-3xl font-mono font-bold">{playerScore}</div>
                          <div className="mt-2 text-sm font-bold bg-white/20 rounded px-2 py-1 inline-block">
                              Rank #{playerRank}
                          </div>
                      </div>
                  )}
              </div>
          );
      }

      // Game Pad
      if (gameState === 'QUESTION') {
          if (hasAnswered && gameSettings.gameMode === 'CLASSIC') {
              return (
                  <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center text-white">
                      <div className="animate-bounce mb-4 text-6xl">🚀</div>
                      <h2 className="text-3xl font-bold">Answer Sent!</h2>
                      <p className="opacity-50 mt-2">Wait for the timer to end...</p>
                  </div>
              );
          }

          return (
              <div className="min-h-screen bg-slate-900 p-4 flex flex-col">
                   <div className="flex justify-between items-center text-white mb-4">
                       <div className="font-bold bg-white/10 px-3 py-1 rounded">Q: {currentQuestionIdx + 1}</div>
                       <div className="font-bold text-xl">{timeLeft}s</div>
                   </div>
                   
                   <div className="flex-grow grid grid-cols-2 gap-4">
                       {COLORS.map((color, idx) => {
                           const Shape = SHAPES[idx];
                           return (
                               <button 
                                key={idx}
                                onClick={() => sendAnswer(idx)}
                                className={`${color} rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-transform shadow-lg border-b-8 border-black/20`}
                               >
                                   <Shape className="w-16 h-16 text-white mb-2 fill-white/20" />
                                   {gameSettings.gameMode === 'SMASH' && (
                                       <span className="text-xs font-black uppercase text-white/50">Smash!</span>
                                   )}
                               </button>
                           );
                       })}
                   </div>
              </div>
          );
      }
      
      if (gameState === 'PODIUM') {
           return (
               <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                   <Trophy className="w-24 h-24 text-yellow-400 mb-6" />
                   <h1 className="text-4xl font-black mb-4">Game Over</h1>
                   <div className="text-2xl mb-8">You placed <span className="font-bold text-yellow-400">#{playerRank}</span></div>
                   <div className="font-mono text-xl opacity-50 bg-white/10 px-6 py-2 rounded-xl">Final Score: {playerScore}</div>
                   <button onClick={onExit} className="mt-12 text-slate-400 hover:text-white underline">Exit</button>
               </div>
           )
      }
  }

  return null;
};

export default MultiplayerGame;