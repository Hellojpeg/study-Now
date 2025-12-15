import React, { useState, useEffect, useRef } from 'react';
import { SubjectId, MultiplayerGameState, Player, GameSettings } from '../types';
import { QUIZZES } from '../constants';
import { Users, Monitor, Smartphone, Trophy, Square, Circle, Triangle, Hexagon, ArrowRight, Settings, ToggleLeft, ToggleRight, FastForward, Crown, AlertTriangle, Wifi, Flame, Link, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/audio';
import { io, Socket } from 'socket.io-client';

// --- Constants ---
const SHAPES = [Triangle, Hexagon, Circle, Square];
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];

// Dynamic URL: Allows phones to connect to the computer's IP if the site is accessed via IP
const SERVER_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

interface MultiplayerGameProps {
  subjectId: SubjectId;
  onExit: () => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ subjectId, onExit }) => {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');
  const [gameState, setGameState] = useState<MultiplayerGameState>('MENU');
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
  const [smashCounts, setSmashCounts] = useState<number[]>([0, 0, 0, 0]); 
  
  // Player State
  const [playerName, setPlayerName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(0);
  const [isJoining, setIsJoining] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<any>(null);
  const autoPlayTimeoutRef = useRef<any>(null);
  
  const quiz = QUIZZES[subjectId];
  const currentQuestion = quiz.questions[currentQuestionIdx];

  // --- SOCKET INITIALIZATION ---

  useEffect(() => {
    // Connect to backend
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to backend at', SERVER_URL);
      setIsConnected(true);
      setErrorMessage('');
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setErrorMessage(`Could not connect to ${SERVER_URL}. Is the server running?`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // --- HOST EVENTS ---
    socket.on('player_joined', (player: Player & { socketId: string }) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === player.id)) return prev;
        
        const newPlayer = { 
          ...player, 
          score: 0, 
          streak: 0, 
          lastAnswerCorrect: null,
          rank: prev.length + 1,
          previousRank: prev.length + 1,
          avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
        return [...prev, newPlayer];
      });
      // Force sync to update the new player immediately
      // We rely on the useEffect below monitoring 'players' to broadcast updates
    });

    socket.on('player_answer', (payload) => {
        const { playerId, answerIndex, timeTaken } = payload;
        handlePlayerAnswer(playerId, answerIndex, timeTaken);
    });

    socket.on('player_smash', (payload) => {
        const { playerId, answerIndex } = payload;
        handlePlayerSmash(playerId, answerIndex);
    });

    // --- PLAYER EVENTS ---
    socket.on('update_state', (payload) => {
        setGameState(payload.state);
        setCurrentQuestionIdx(payload.questionIdx);
        
        if (payload.settings) {
            setGameSettings(payload.settings);
        }
        
        if (payload.state === 'QUESTION') {
            setHasAnswered(false);
            setLastAnswerCorrect(null);
            setTimeLeft(payload.timeLeft);
        }

        if (payload.players) {
            const me = payload.players.find((p: Player) => p.id === myPlayerId);
            if (me) {
                setPlayerScore(me.score);
                setPlayerRank(me.rank);
                setLastAnswerCorrect(me.lastAnswerCorrect);
            }
        }
        setIsJoining(false); // If we get a state update, we are in
    });

    socket.on('error_message', (data) => {
        setErrorMessage(data.message);
        setIsJoining(false);
        setRole('NONE');
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []); // Run once on mount


  // --- BROADCAST HELPER (HOST ONLY) ---
  // Triggered whenever relevant game state changes
  useEffect(() => {
    if (role === 'HOST' && isConnected) {
       socketRef.current?.emit('host_update_state', {
           roomCode,
           payload: {
                state: gameState,
                questionIdx: currentQuestionIdx,
                players: players,
                settings: gameSettings,
                timeLeft: timeLeft
           }
       });
    }
  }, [gameState, currentQuestionIdx, players, gameSettings, timeLeft, role, roomCode, isConnected]);


  // --- HOST LOGIC ---

  const handleHostStartGame = () => {
    if (!isConnected) {
        alert("Cannot connect to server.");
        return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    setRole('HOST');
    setGameState('LOBBY');
    socketRef.current?.emit('create_room', code);
  };

  const handleHostStartQuiz = () => {
    startQuestion(0);
  };

  const startQuestion = (idx: number) => {
    setCurrentQuestionIdx(idx);
    setAnswersReceived(0);
    setSmashCounts([0, 0, 0, 0]);
    
    setPlayers(prev => prev.map(p => ({ ...p, lastAnswerCorrect: null, lastAnswerTime: null })));
    
    const time = gameSettings.timerDuration;
    setTimeLeft(time);
    setGameState('QUESTION');

    if (timerRef.current) clearInterval(timerRef.current);
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
    setGameState('RESULT'); // broadcast handled by useEffect
  };

  const handlePlayerAnswer = (playerId: string, answerIndex: number, timeTaken: number) => {
    setAnswersReceived(prev => prev + 1);
    setPlayers(prev => {
       return prev.map(p => {
           if (p.id !== playerId) return p;
           const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
           let points = 0;
           if (isCorrect) {
               const timeBonus = Math.round((1 - (timeTaken / (gameSettings.timerDuration * 1000))) * 1000);
               points = 1000 + Math.max(0, timeBonus);
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

  const handlePlayerSmash = (playerId: string, answerIndex: number) => {
      setSmashCounts(prev => {
          const newCounts = [...prev];
          newCounts[answerIndex] = (newCounts[answerIndex] || 0) + 1;
          return newCounts;
      });

      setPlayers(prev => {
          return prev.map(p => {
              if (p.id !== playerId) return p;
              const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
              return {
                  ...p,
                  score: p.score + (isCorrect ? 10 : 0),
                  lastAnswerCorrect: isCorrect
              };
          });
      });
  };

  const showLeaderboard = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const rankedPlayers = sortedPlayers.map((p, idx) => ({
        ...p,
        previousRank: p.rank,
        rank: idx + 1
    }));
    setPlayers(rankedPlayers);
    setGameState('LEADERBOARD');
  };

  const nextQuestion = () => {
     if (currentQuestionIdx < quiz.questions.length - 1) {
         startQuestion(currentQuestionIdx + 1);
     } else {
         setGameState('PODIUM');
         confetti({ particleCount: 300, spread: 200, origin: { y: 0.6 } });
     }
  };

  // --- Auto-Play Hook ---
  useEffect(() => {
      if (role !== 'HOST' || !gameSettings.autoPlay) return;

      if (gameState === 'RESULT') {
          autoPlayTimeoutRef.current = setTimeout(() => {
              showLeaderboard();
          }, 5000);
      } else if (gameState === 'LEADERBOARD') {
          autoPlayTimeoutRef.current = setTimeout(() => {
              nextQuestion();
          }, 5000);
      }
      return () => {
          if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
      };
  }, [gameState, gameSettings.autoPlay, role]);

  // --- Auto-End Question Hook (Classic) ---
  useEffect(() => {
      if (role === 'HOST' && gameState === 'QUESTION' && gameSettings.gameMode === 'CLASSIC') {
          if (players.length > 0 && answersReceived >= players.length) {
              setTimeout(() => endQuestion(), 1000);
          }
      }
  }, [answersReceived, players.length, gameState, role]);


  // --- PLAYER ACTIONS ---

  const handleJoinInput = () => {
     if (!playerName.trim() || !joinCodeInput.trim() || !isConnected) return;
     const code = joinCodeInput.trim();
     setRoomCode(code);
     const pid = Math.random().toString(36).substr(2, 9);
     setMyPlayerId(pid);
     setRole('PLAYER');
     setIsJoining(true);

     socketRef.current?.emit('join_room', {
         roomCode: code,
         player: { id: pid, name: playerName }
     });
  };

  const sendAnswer = (idx: number) => {
     if (gameSettings.gameMode === 'CLASSIC') {
        if (hasAnswered) return;
        setHasAnswered(true);
        const timeTaken = (gameSettings.timerDuration - timeLeft) * 1000;
        
        socketRef.current?.emit('submit_answer', {
            roomCode,
            payload: { playerId: myPlayerId, answerIndex: idx, timeTaken }
        });

     } else {
         socketRef.current?.emit('submit_smash', {
             roomCode,
             payload: { playerId: myPlayerId, answerIndex: idx }
         });
     }
  };

  // ---------------- UI RENDERING ----------------

  if (errorMessage) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-800">Connection Error</h2>
              <p className="text-slate-600 max-w-lg">{errorMessage}</p>
              <p className="text-sm text-slate-500">Ensure <code>node server.js</code> is running in a separate terminal.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-200 rounded-lg font-bold">Try Again</button>
          </div>
      );
  }

  if (gameState === 'MENU') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fadeIn max-w-5xl mx-auto p-6">
            <h1 className="text-4xl font-black text-slate-800 text-center">
                Classroom Multiplayer
            </h1>
            
            {!isConnected && (
                <div className="bg-orange-100 text-orange-800 p-4 rounded-xl flex items-center gap-2">
                    <Wifi className="w-5 h-5 animate-pulse" /> Connecting to server...
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* HOST CARD */}
                <button 
                    onClick={handleHostStartGame}
                    disabled={!isConnected}
                    className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all group text-left disabled:opacity-50"
                >
                    <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                        <Monitor className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Host a Game</h2>
                    <p className="text-slate-500">Teacher Mode. Open this on the main screen.</p>
                </button>

                {/* PLAYER CARD */}
                <div className="flex-1 bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all group text-left flex flex-col">
                    <div className="bg-emerald-100 p-4 rounded-2xl w-fit mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Join a Game</h2>
                    
                    <div className="space-y-3 mb-4">
                        <input 
                            type="text" 
                            placeholder="Game Code (e.g. 123456)"
                            maxLength={6}
                            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 font-mono font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={joinCodeInput}
                            onChange={e => setJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                        <input 
                            type="text" 
                            placeholder="Your Nickname"
                            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleJoinInput}
                        disabled={!playerName || joinCodeInput.length < 4 || !isConnected}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Join Room
                    </button>
                </div>
            </div>
            <button onClick={onExit} className="text-slate-400 hover:text-slate-600 font-bold mt-4">Exit to Main Menu</button>
        </div>
    );
  }

  // --- HOST UI ---
  if (role === 'HOST') {
      // Calculate background segments for Smash Mode
      const totalSmash = Math.max(1, smashCounts.reduce((a, b) => a + b, 0));
      const smashSegments = smashCounts.map(count => (count / totalSmash) * 100);
      
      const shareUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

      return (
          <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col font-sans">
             <div className="flex justify-between items-center mb-6">
                 <div className="font-black text-xl text-white/50 flex items-center gap-2">
                     <Monitor className="w-5 h-5" /> ROOM: {roomCode}
                 </div>
                 {gameState !== 'LOBBY' && (
                     <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full">
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-white/50">Auto-Play</span>
                            <button onClick={() => setGameSettings(s => ({...s, autoPlay: !s.autoPlay}))}>
                                {gameSettings.autoPlay ? <ToggleRight className="w-8 h-8 text-green-400" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                            </button>
                         </div>
                         <div className="w-px h-6 bg-white/20"></div>
                         <button onClick={gameState === 'QUESTION' ? endQuestion : gameState === 'RESULT' ? showLeaderboard : nextQuestion} className="bg-white/20 p-2 rounded-lg hover:bg-white/30">
                            <FastForward className="w-5 h-5" />
                         </button>
                     </div>
                 )}
                 <div className="bg-white/10 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                     <Users className="w-5 h-5" /> {players.length}
                 </div>
             </div>

             <div className="flex-grow flex items-center justify-center relative">
                 {/* LOBBY */}
                 {gameState === 'LOBBY' && (
                     <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 text-center">
                             <div className="mb-8 bg-white/5 p-8 rounded-3xl border border-white/10">
                                 <div className="flex flex-col items-center gap-4 mb-8">
                                    <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">Join at</div>
                                    <div className="text-3xl font-mono font-bold flex items-center gap-3 bg-black/30 px-6 py-2 rounded-lg border border-white/10">
                                        <Link className="w-6 h-6 text-emerald-400" />
                                        {shareUrl}
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                                            className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Copy Link"
                                        >
                                            <Copy className="w-5 h-5 opacity-70" />
                                        </button>
                                    </div>
                                 </div>

                                 <div className="text-xl font-bold text-blue-400 mb-2 uppercase tracking-widest">Game Code</div>
                                 <div className="text-9xl font-black bg-white text-slate-900 inline-block px-12 py-6 rounded-3xl font-mono tracking-widest shadow-[0_0_60px_rgba(37,99,235,0.5)] animate-pulse">
                                     {roomCode}
                                 </div>
                             </div>
                             <div className="flex flex-wrap justify-center gap-4 mb-12">
                                 {players.map(p => (
                                     <div key={p.id} className={`${p.avatarColor} px-6 py-3 rounded-2xl font-bold text-white shadow-lg animate-fadeIn flex items-center gap-2`}>
                                         <div className="w-2 h-2 bg-white rounded-full animate-bounce" /> {p.name}
                                     </div>
                                 ))}
                                 {players.length === 0 && (
                                     <div className="flex flex-col items-center text-slate-500 italic text-xl gap-2">
                                        <div className="animate-spin"><Settings className="w-8 h-8"/></div>
                                        <span>Waiting for players to join...</span>
                                     </div>
                                 )}
                             </div>
                         </div>
                         <div className="bg-slate-800 p-6 rounded-3xl h-fit border border-slate-700">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h3>
                             <div className="space-y-6">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         <button onClick={() => setGameSettings(s => ({...s, gameMode: 'CLASSIC'}))} className={`p-3 rounded-xl font-bold text-sm border-2 ${gameSettings.gameMode === 'CLASSIC' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-700'}`}>CLASSIC</button>
                                         <button onClick={() => setGameSettings(s => ({...s, gameMode: 'SMASH'}))} className={`p-3 rounded-xl font-bold text-sm border-2 ${gameSettings.gameMode === 'SMASH' ? 'bg-purple-600 border-purple-400' : 'bg-slate-900 border-slate-700'}`}>SMASH</button>
                                     </div>
                                     <p className="text-xs text-slate-500 mt-2">
                                         {gameSettings.gameMode === 'CLASSIC' ? 'Points for speed and accuracy. One answer per person.' : 'Rapid fire! Mash the button to push your team to victory.'}
                                     </p>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timer: {gameSettings.timerDuration}s</label>
                                     <input type="range" min="10" max="60" step="5" value={gameSettings.timerDuration} onChange={(e) => setGameSettings(s => ({...s, timerDuration: parseInt(e.target.value)}))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"/>
                                 </div>
                                 <button onClick={handleHostStartQuiz} className="w-full px-4 py-4 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500 shadow-lg shadow-blue-500/50 mt-4">Start Game</button>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* GAMEPLAY VIEWS (QUESTION, RESULT, LEADERBOARD, PODIUM) */}
                 {gameState === 'QUESTION' && (
                     <div className="w-full max-w-6xl">
                         <div className="flex justify-between mb-8">
                             <div className="bg-white/10 px-6 py-3 rounded-full text-2xl font-bold">{currentQuestionIdx + 1} / {quiz.questions.length}</div>
                             <div className="bg-purple-600 px-6 py-3 rounded-full text-2xl font-bold animate-pulse">{timeLeft}s</div>
                         </div>
                         
                         {/* QUESTION CARD */}
                         <div className="bg-white text-slate-900 p-12 rounded-3xl shadow-2xl mb-8 text-center min-h-[300px] flex flex-col justify-center relative overflow-hidden z-0">
                             {/* SMASH MODE BACKGROUND VISUALIZATION */}
                             {gameSettings.gameMode === 'SMASH' && (
                                 <div className="absolute inset-0 flex opacity-30 z-0">
                                     {smashSegments.map((pct, idx) => (
                                         <div 
                                            key={idx} 
                                            className={`${COLORS[idx]} h-full transition-all duration-300 ease-out`} 
                                            style={{ width: `${pct}%` }} 
                                         />
                                     ))}
                                 </div>
                             )}
                             
                             {gameSettings.gameMode === 'SMASH' && (
                                 <div className="absolute top-2 right-4 z-10 font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider text-xs">
                                     <Flame className="w-4 h-4 text-orange-500" /> Mash it!
                                 </div>
                             )}

                             <h2 className="text-4xl font-black leading-tight z-10 relative">{currentQuestion.question}</h2>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                             {currentQuestion.options.map((opt, idx) => {
                                 const Shape = SHAPES[idx];
                                 return (
                                     <div key={idx} className={`${COLORS[idx]} p-8 rounded-2xl flex items-center gap-6 shadow-lg`}>
                                        <Shape className="w-12 h-12 text-white fill-white/20 flex-shrink-0" />
                                        <span className="text-2xl font-bold text-white flex-grow">{opt}</span>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}

                 {/* RESULT & LEADERBOARD & PODIUM (Keep existing logic visually) */}
                 {gameState === 'RESULT' && (
                     <div className="text-center">
                         <h2 className="text-4xl font-bold mb-8">Correct Answer</h2>
                         <div className={`${COLORS[currentQuestion.correctAnswerIndex]} p-12 rounded-3xl shadow-2xl mb-8 transform scale-110 inline-block`}>
                            <div className="flex flex-col items-center gap-4">
                                {React.createElement(SHAPES[currentQuestion.correctAnswerIndex], { className: "w-20 h-20 text-white" })}
                                <span className="text-4xl font-black text-white">{currentQuestion.options[currentQuestion.correctAnswerIndex]}</span>
                            </div>
                         </div>
                         {!gameSettings.autoPlay && <div className="mt-8"><button onClick={showLeaderboard} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-xl hover:bg-slate-200">Show Leaderboard</button></div>}
                     </div>
                 )}

                 {gameState === 'LEADERBOARD' && (
                     <div className="w-full max-w-4xl">
                         <h2 className="text-4xl font-black text-center mb-8">Leaderboard</h2>
                         <div className="space-y-4 mb-12">
                             {players.slice(0, 5).map((p, idx) => (
                                 <div key={p.id} className="bg-white text-slate-900 p-4 rounded-xl flex items-center shadow-lg transform transition-all hover:scale-105">
                                     <div className={`w-12 text-2xl font-black ${idx === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>#{idx + 1}</div>
                                     <div className="flex-1 font-bold text-xl">{p.name}</div>
                                     <div className="font-mono font-bold bg-slate-900 text-white px-4 py-2 rounded-lg">{p.score}</div>
                                 </div>
                             ))}
                         </div>
                         {!gameSettings.autoPlay && <div className="text-center"><button onClick={nextQuestion} className="px-8 py-4 bg-blue-600 rounded-xl font-bold text-xl">Next Question</button></div>}
                     </div>
                 )}

                 {gameState === 'PODIUM' && (
                     <div className="text-center w-full">
                         <h1 className="text-6xl font-black mb-12 text-yellow-400">PODIUM</h1>
                         <div className="flex justify-center items-end gap-4 h-96">
                             {players[1] && <div className="w-48 bg-slate-700 rounded-t-lg flex flex-col justify-end items-center pb-4 h-2/3"><div className="mb-4 text-2xl font-bold">{players[1].name}</div><div className="text-4xl font-black">2</div><div className="mt-2 font-mono opacity-50">{players[1].score}</div></div>}
                             {players[0] && <div className="w-48 bg-yellow-500 text-yellow-900 rounded-t-lg flex flex-col justify-end items-center pb-8 h-full z-10 relative"><Crown className="w-12 h-12 mb-2 animate-bounce absolute -top-16" /><div className="mb-4 text-3xl font-black">{players[0].name}</div><div className="text-6xl font-black">1</div><div className="mt-2 font-mono font-bold">{players[0].score}</div></div>}
                             {players[2] && <div className="w-48 bg-slate-800 rounded-t-lg flex flex-col justify-end items-center pb-4 h-1/2"><div className="mb-4 text-2xl font-bold">{players[2].name}</div><div className="text-4xl font-black text-orange-700">3</div><div className="mt-2 font-mono opacity-50">{players[2].score}</div></div>}
                         </div>
                         <button onClick={onExit} className="mt-12 px-8 py-4 bg-white/20 rounded-xl font-bold hover:bg-white/30">Return to Menu</button>
                     </div>
                 )}
             </div>
          </div>
      );
  }

  // --- PLAYER UI ---
  if (role === 'PLAYER') {
      if (isJoining) {
          return (
              <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center text-white text-center p-6">
                  <div className="animate-spin mb-4"><Settings className="w-10 h-10 text-emerald-400" /></div>
                  <h2 className="text-2xl font-bold">Joining Room...</h2>
              </div>
          );
      }
      
      if (gameState === 'LOBBY') {
          return (
              <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center text-white text-center p-6">
                  <h1 className="text-4xl font-black mb-4">You're In!</h1>
                  <div className="text-2xl text-blue-300 font-bold mb-8">{playerName}</div>
                  <div className="animate-pulse opacity-50">Watch the big screen...</div>
              </div>
          );
      }

      if (gameState === 'QUESTION') {
          if (hasAnswered && gameSettings.gameMode === 'CLASSIC') {
              return (
                  <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center text-white text-center">
                      <div className="text-6xl mb-4 animate-bounce">🚀</div>
                      <h2 className="text-3xl font-bold">Answer Sent!</h2>
                  </div>
              );
          }
          return (
              <div className="min-h-screen bg-slate-900 p-4 flex flex-col">
                   <div className="flex justify-between text-white mb-4 font-bold">
                       <span>Q: {currentQuestionIdx + 1}</span>
                       <span>{timeLeft}s</span>
                   </div>
                   <div className="flex-grow grid grid-cols-2 gap-4">
                       {COLORS.map((color, idx) => {
                           const Shape = SHAPES[idx];
                           return (
                               <button key={idx} onClick={() => sendAnswer(idx)} className={`${color} rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg`}>
                                   <Shape className="w-20 h-20 text-white fill-white/20" />
                               </button>
                           );
                       })}
                   </div>
              </div>
          );
      }

      if (gameState === 'RESULT' || gameState === 'LEADERBOARD') {
          return (
              <div className={`min-h-screen flex flex-col items-center justify-center text-white p-6 text-center ${lastAnswerCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                  <h2 className="text-4xl font-black mb-2">{lastAnswerCorrect ? 'CORRECT!' : 'INCORRECT'}</h2>
                  {lastAnswerCorrect && <div className="text-xl font-bold opacity-90">+Points</div>}
                  <div className="mt-8 bg-black/20 px-6 py-3 rounded-xl font-mono text-2xl font-bold">Score: {playerScore}</div>
              </div>
          );
      }

      if (gameState === 'PODIUM') {
          return (
              <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                   <Trophy className="w-20 h-20 text-yellow-400 mb-6" />
                   <h1 className="text-4xl font-black mb-4">Game Over</h1>
                   <div className="text-2xl">Rank: <span className="font-bold text-yellow-400">#{playerRank}</span></div>
                   <button onClick={onExit} className="mt-12 text-slate-400 hover:text-white underline">Exit</button>
              </div>
          );
      }
  }

  return null;
};

export default MultiplayerGame;