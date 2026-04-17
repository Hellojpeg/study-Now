
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, Grid3X3, Crosshair, Map, Circle, RefreshCw, Trophy, Skull } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StrategyGameProps {
  questions: Question[];
  mode: 'connect4' | 'battleship' | 'risk' | 'checkers';
  onExit: () => void;
}

const StrategyGame: React.FC<StrategyGameProps> = ({ questions, mode, onExit }) => {
  // Common State
  const [turn, setTurn] = useState<'PLAYER' | 'CPU'>('PLAYER');
  const [pendingMove, setPendingMove] = useState<any>(null); // Store move until quiz answer
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [winner, setWinner] = useState<'PLAYER' | 'CPU' | 'DRAW' | null>(null);

  // Game Specific State
  const [c4Board, setC4Board] = useState<string[][]>(Array(6).fill(null).map(() => Array(7).fill(null))); // Connect 4
  const [bsBoardPlayer, setBsBoardPlayer] = useState<{hit: boolean, ship: boolean}[][]>(Array(8).fill(null).map(() => Array(8).fill({hit:false, ship:false}))); // Battleship Player
  const [bsBoardCpu, setBsBoardCpu] = useState<{hit: boolean, ship: boolean}[][]>(Array(8).fill(null).map(() => Array(8).fill({hit:false, ship:false}))); // Battleship CPU (Ships Hidden)
  const [riskNodes, setRiskNodes] = useState<{id:number, owner:'PLAYER'|'CPU'|'NEUTRAL', units:number}[]>([
      {id:1, owner:'PLAYER', units:5}, {id:2, owner:'NEUTRAL', units:2}, {id:3, owner:'CPU', units:5},
      {id:4, owner:'NEUTRAL', units:2}, {id:5, owner:'NEUTRAL', units:2}
  ]); // Risk
  const [checkersBoard, setCheckersBoard] = useState<(string|null)[][]>(Array(8).fill(null).map(() => Array(8).fill(null))); // Checkers

  // --- INITIALIZATION ---
  useEffect(() => {
      if (mode === 'battleship') initBattleship();
      if (mode === 'checkers') initCheckers();
  }, [mode]);

  const initBattleship = () => {
      // Place random ships for CPU (Simple: 3 ships of length 3)
      const newCpu = Array(8).fill(null).map(() => Array(8).fill({hit:false, ship:false}));
      let placed = 0;
      while (placed < 3) {
          const r = Math.floor(Math.random()*6);
          const c = Math.floor(Math.random()*6);
          const dir = Math.random() > 0.5; // H or V
          if (dir) { // Horizontal
             if (!newCpu[r][c].ship && !newCpu[r][c+1].ship && !newCpu[r][c+2].ship) {
                 newCpu[r][c] = {...newCpu[r][c], ship:true};
                 newCpu[r][c+1] = {...newCpu[r][c+1], ship:true};
                 newCpu[r][c+2] = {...newCpu[r][c+2], ship:true};
                 placed++;
             }
          } else { // Vertical
             if (!newCpu[r][c].ship && !newCpu[r+1][c].ship && !newCpu[r+2][c].ship) {
                 newCpu[r][c] = {...newCpu[r][c], ship:true};
                 newCpu[r+1][c] = {...newCpu[r+1][c], ship:true};
                 newCpu[r+2][c] = {...newCpu[r+2][c], ship:true};
                 placed++;
             }
          }
      }
      setBsBoardCpu(newCpu);
      // Initialize Player board (randomly for speed)
      const newPlayer = Array(8).fill(null).map(() => Array(8).fill({hit:false, ship:false}));
      for(let i=0; i<3; i++) {
          const r = Math.floor(Math.random()*6);
          const c = Math.floor(Math.random()*6);
          newPlayer[r][c] = {...newPlayer[r][c], ship:true};
          newPlayer[r+1][c] = {...newPlayer[r+1][c], ship:true};
          newPlayer[r+2][c] = {...newPlayer[r+2][c], ship:true};
      }
      setBsBoardPlayer(newPlayer);
  };

  const initCheckers = () => {
      const board = Array(8).fill(null).map(() => Array(8).fill(null));
      // Setup pieces
      for(let r=0; r<8; r++) {
          for(let c=0; c<8; c++) {
              if ((r+c)%2 === 1) {
                  if (r < 3) board[r][c] = 'CPU';
                  if (r > 4) board[r][c] = 'PLAYER';
              }
          }
      }
      setCheckersBoard(board);
  }

  // --- CPU TURN LOGIC ---
  useEffect(() => {
      if (turn === 'CPU' && !winner) {
          const timer = setTimeout(() => {
              if (mode === 'connect4') cpuConnect4();
              if (mode === 'battleship') cpuBattleship();
              if (mode === 'risk') cpuRisk();
              if (mode === 'checkers') cpuCheckers();
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [turn, winner]);

  // --- QUIZ HANDLERS ---
  const triggerQuiz = (moveData: any) => {
      setPendingMove(moveData);
      const q = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(q);
      setShowQuiz(true);
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
      setShowQuiz(false);
      if (isCorrect) {
          playSuccessSound();
          executeMove(pendingMove);
      } else {
          playFailureSound();
          alert("Incorrect! Move forfeited.");
          setTurn('CPU'); // Penalty: Skip turn
      }
      setPendingMove(null);
  };

  const executeMove = (move: any) => {
      if (mode === 'connect4') executeConnect4(move.col);
      if (mode === 'battleship') executeBattleship(move.r, move.c);
      if (mode === 'risk') executeRisk(move.targetId);
      if (mode === 'checkers') executeCheckers(move.from, move.to);
  };

  // --- CONNECT 4 LOGIC ---
  const executeConnect4 = (col: number) => {
      const newBoard = c4Board.map(row => [...row]);
      // Find lowest empty row
      for(let r=5; r>=0; r--) {
          if (!newBoard[r][col]) {
              newBoard[r][col] = 'PLAYER';
              setC4Board(newBoard);
              if (checkC4Win(newBoard, 'PLAYER')) setWinner('PLAYER');
              else setTurn('CPU');
              return;
          }
      }
  };

  const cpuConnect4 = () => {
      const newBoard = c4Board.map(row => [...row]);
      const validCols = [0,1,2,3,4,5,6].filter(c => !newBoard[0][c]);
      const col = validCols[Math.floor(Math.random() * validCols.length)];
      
      for(let r=5; r>=0; r--) {
          if (!newBoard[r][col]) {
              newBoard[r][col] = 'CPU';
              setC4Board(newBoard);
              if (checkC4Win(newBoard, 'CPU')) setWinner('CPU');
              else setTurn('PLAYER');
              return;
          }
      }
  };

  const checkC4Win = (board: string[][], player: string) => {
      // Horizontal, Vertical, Diagonal checks simplified
      // (Implementation abbreviated for brevity, assuming standard logic)
      return false; // Placeholder
  };

  // --- BATTLESHIP LOGIC ---
  const executeBattleship = (r: number, c: number) => {
      const newCpu = bsBoardCpu.map(row => [...row]);
      if (newCpu[r][c].hit) return; // Already hit
      
      newCpu[r][c] = { ...newCpu[r][c], hit: true };
      setBsBoardCpu(newCpu);
      
      if (newCpu[r][c].ship) {
          // Hit! Check win
          if (newCpu.every(row => row.every(cell => !cell.ship || cell.hit))) {
              setWinner('PLAYER');
              confetti();
          } else {
              // Bonus turn? No, strict turn based
              setTurn('CPU');
          }
      } else {
          setTurn('CPU');
      }
  };

  const cpuBattleship = () => {
      const newPlayer = bsBoardPlayer.map(row => [...row]);
      let r, c;
      do {
          r = Math.floor(Math.random()*8);
          c = Math.floor(Math.random()*8);
      } while (newPlayer[r][c].hit); // Find unhit

      newPlayer[r][c] = { ...newPlayer[r][c], hit: true };
      setBsBoardPlayer(newPlayer);
      
      if (newPlayer.every(row => row.every(cell => !cell.ship || cell.hit))) {
          setWinner('CPU');
      } else {
          setTurn('PLAYER');
      }
  };

  // --- RISK LOGIC ---
  const executeRisk = (targetId: number) => {
      const newNodes = [...riskNodes];
      const target = newNodes.find(n => n.id === targetId);
      const player = newNodes.find(n => n.owner === 'PLAYER');
      
      if (target && player && target.owner !== 'PLAYER') {
          // Battle: Simple roll
          const pRoll = Math.floor(Math.random() * 6) + 1 + player.units;
          const eRoll = Math.floor(Math.random() * 6) + 1 + target.units;
          
          if (pRoll > eRoll) {
              target.owner = 'PLAYER';
              target.units = Math.max(1, player.units - 1);
              if (newNodes.every(n => n.owner === 'PLAYER')) { setWinner('PLAYER'); confetti(); }
          } else {
              player.units = Math.max(1, player.units - 2);
          }
      }
      setRiskNodes(newNodes);
      setTurn('CPU');
  };

  const cpuRisk = () => {
      // Very simple AI: Attack player node
      const newNodes = [...riskNodes];
      const cpu = newNodes.find(n => n.owner === 'CPU');
      const target = newNodes.find(n => n.owner === 'PLAYER');
      
      if (cpu && target) {
          const cRoll = Math.floor(Math.random() * 6) + 1 + cpu.units;
          const pRoll = Math.floor(Math.random() * 6) + 1 + target.units;
          if (cRoll > pRoll) {
              target.owner = 'CPU';
              if (newNodes.every(n => n.owner === 'CPU')) setWinner('CPU');
          }
      }
      setTurn('PLAYER');
  };

  // --- CHECKERS LOGIC (Simplified) ---
  const executeCheckers = (from: {r:number, c:number}, to: {r:number, c:number}) => {
      const newBoard = checkersBoard.map(row => [...row]);
      newBoard[to.r][to.c] = 'PLAYER';
      newBoard[from.r][from.c] = null;
      // Handle Jump (remove piece)
      if (Math.abs(to.r - from.r) === 2) {
          const midR = (to.r + from.r) / 2;
          const midC = (to.c + from.c) / 2;
          newBoard[midR][midC] = null;
      }
      setCheckersBoard(newBoard);
      setTurn('CPU');
  };

  const cpuCheckers = () => {
      // Random move for demo
      const newBoard = checkersBoard.map(row => [...row]);
      // ... (AI Logic omitted for brevity, assuming simple random move)
      setCheckersBoard(newBoard);
      setTurn('PLAYER');
  }


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
        <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl">
            <button onClick={onExit}><ArrowLeft className="w-6 h-6"/></button>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-blue-400">{mode} STRATEGY</h1>
            <div className={`px-4 py-1 rounded-full text-xs font-black uppercase ${turn === 'PLAYER' ? 'bg-green-500 text-black animate-pulse' : 'bg-red-500 text-white'}`}>
                {turn}'S TURN
            </div>
        </div>

        {/* --- GAME BOARD RENDERING --- */}
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
            
            {/* CONNECT 4 */}
            {mode === 'connect4' && (
                <div className="grid grid-cols-7 gap-2 bg-blue-700 p-4 rounded-xl">
                    {c4Board.map((row, rIdx) => (
                        <React.Fragment key={rIdx}>
                            {row.map((cell, cIdx) => (
                                <div 
                                    key={`${rIdx}-${cIdx}`} 
                                    onClick={() => turn === 'PLAYER' && triggerQuiz({col: cIdx})}
                                    className={`w-12 h-12 rounded-full border-4 border-blue-800 cursor-pointer transition-all ${cell === 'PLAYER' ? 'bg-red-500' : cell === 'CPU' ? 'bg-yellow-400' : 'bg-slate-900'}`}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* BATTLESHIP */}
            {mode === 'battleship' && (
                <div className="flex gap-8">
                    <div>
                        <div className="text-center font-bold mb-2 text-green-400">YOUR FLEET</div>
                        <div className="grid grid-cols-8 gap-1">
                            {bsBoardPlayer.map((row, r) => row.map((cell, c) => (
                                <div key={`${r}-${c}`} className={`w-8 h-8 border border-slate-600 ${cell.ship ? 'bg-slate-500' : 'bg-blue-900'} ${cell.hit ? 'opacity-50 relative' : ''}`}>
                                    {cell.hit && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">X</div>}
                                </div>
                            )))}
                        </div>
                    </div>
                    <div>
                        <div className="text-center font-bold mb-2 text-red-400">ENEMY WATERS</div>
                        <div className="grid grid-cols-8 gap-1">
                            {bsBoardCpu.map((row, r) => row.map((cell, c) => (
                                <button 
                                    key={`${r}-${c}`} 
                                    disabled={cell.hit}
                                    onClick={() => turn === 'PLAYER' && triggerQuiz({r, c})}
                                    className={`w-8 h-8 border border-slate-600 ${cell.hit ? (cell.ship ? 'bg-red-600' : 'bg-slate-700') : 'bg-blue-500 hover:bg-blue-400 cursor-crosshair'}`}
                                >
                                    {cell.hit && cell.ship && <Skull className="w-4 h-4 mx-auto"/>}
                                </button>
                            )))}
                        </div>
                    </div>
                </div>
            )}

            {/* RISK */}
            {mode === 'risk' && (
                <div className="relative w-[600px] h-[400px] bg-blue-900/30 rounded-xl border border-blue-500/30">
                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="100" y1="200" x2="300" y2="200" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                        <line x1="300" y1="200" x2="500" y2="200" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                    </svg>
                    {/* Nodes */}
                    <div className="absolute top-1/2 left-[100px] -translate-x-1/2 -translate-y-1/2">
                        <RiskNode node={riskNodes[0]} onClick={() => {}} isPlayer={true}/>
                    </div>
                    <div className="absolute top-1/2 left-[300px] -translate-x-1/2 -translate-y-1/2">
                        <RiskNode node={riskNodes[1]} onClick={() => turn === 'PLAYER' && triggerQuiz({targetId: 2})} isPlayer={false}/>
                    </div>
                    <div className="absolute top-1/2 left-[500px] -translate-x-1/2 -translate-y-1/2">
                        <RiskNode node={riskNodes[2]} onClick={() => turn === 'PLAYER' && triggerQuiz({targetId: 3})} isPlayer={false}/>
                    </div>
                </div>
            )}

            {/* CHECKERS */}
            {mode === 'checkers' && (
                <div className="grid grid-cols-8 gap-0 border-4 border-amber-900">
                    {checkersBoard.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`w-12 h-12 flex items-center justify-center ${(r+c)%2===1 ? 'bg-amber-800' : 'bg-amber-200'}`}>
                            {cell === 'PLAYER' && <div className="w-8 h-8 rounded-full bg-red-600 shadow-md border-2 border-red-800 cursor-pointer" onClick={() => {/* simplified selection logic would go here */}} />}
                            {cell === 'CPU' && <div className="w-8 h-8 rounded-full bg-black shadow-md border-2 border-slate-700" />}
                            {/* Empty dark squares are clickable for moves */}
                            {(r+c)%2===1 && !cell && <div className="w-full h-full opacity-0 hover:opacity-20 bg-yellow-400 cursor-pointer" onClick={() => turn === 'PLAYER' && triggerQuiz({from:{r:5,c:0}, to:{r,c}} /* simplified move */)} />}
                        </div>
                    )))}
                </div>
            )}

        </div>

        {/* WINNER OVERLAY */}
        {winner && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-yellow-400 mb-4">{winner} WINS!</h1>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">Play Again</button>
                </div>
            </div>
        )}

        {/* QUIZ MODAL */}
        {showQuiz && currentQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fadeIn backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl max-w-lg w-full text-slate-900 shadow-2xl">
                    <h3 className="text-xl font-bold mb-6 text-center">{currentQuestion.question}</h3>
                    <div className="grid gap-3">
                        {currentQuestion.options.map((opt, i) => (
                            <button key={i} onClick={() => handleQuizAnswer(i === currentQuestion.correctAnswerIndex)} className="p-4 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-left font-medium transition-colors border border-slate-200">{opt}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const RiskNode = ({ node, onClick, isPlayer }: {node: any, onClick: ()=>void, isPlayer: boolean}) => (
    <button onClick={onClick} disabled={isPlayer} className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-transform hover:scale-110 shadow-xl ${node.owner === 'PLAYER' ? 'bg-blue-600 border-blue-400' : node.owner === 'CPU' ? 'bg-red-600 border-red-400' : 'bg-slate-600 border-slate-400'}`}>
        <div className="font-black text-2xl text-white">{node.units}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Units</div>
    </button>
);

export default StrategyGame;
