
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowLeft, Circle, X, BrainCircuit } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface TicTacToeGameProps {
  questions: Question[];
  onExit: () => void;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ questions, onExit }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const question = questions[qIndex % questions.length];

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  useEffect(() => {
     if (!isPlayerTurn && !winner) {
         // Simple AI Move
         setTimeout(() => {
             const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
             if (emptyIndices.length > 0) {
                 const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                 const newBoard = [...board];
                 newBoard[randomIdx] = 'O';
                 setBoard(newBoard);
                 const w = checkWinner(newBoard);
                 if (w) setWinner(w);
                 else setIsPlayerTurn(true);
             }
         }, 1000);
     }
  }, [isPlayerTurn, board, winner]);

  const handleCellClick = (idx: number) => {
      if (board[idx] || winner || !isPlayerTurn) return;
      setActiveCell(idx);
  };

  const handleAnswer = (idx: number) => {
      if (activeCell === null) return;
      
      if (idx === question.correctAnswerIndex) {
          playSuccessSound();
          const newBoard = [...board];
          newBoard[activeCell] = 'X';
          setBoard(newBoard);
          setActiveCell(null);
          setQIndex(prev => prev + 1);
          
          const w = checkWinner(newBoard);
          if (w) setWinner(w);
          else setIsPlayerTurn(false);
      } else {
          playFailureSound();
          alert("Incorrect! Turn skipped.");
          setActiveCell(null);
          setQIndex(prev => prev + 1);
          setIsPlayerTurn(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onExit} className="p-2 bg-white border rounded-lg hover:bg-slate-100"><ArrowLeft/></button>
                <h1 className="text-2xl font-black text-slate-800">STRATEGY TIC-TAC-TOE</h1>
            </div>

            {winner ? (
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl mb-8">
                    <h2 className="text-4xl font-black mb-4">{winner === 'Draw' ? 'DRAW!' : `${winner} WINS!`}</h2>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Play Again</button>
                </div>
            ) : (
                <div className="aspect-square grid grid-cols-3 gap-2 bg-slate-300 p-2 rounded-2xl mb-8">
                    {board.map((cell, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => handleCellClick(idx)}
                            className="bg-white rounded-xl text-6xl font-black flex items-center justify-center hover:bg-slate-50 text-slate-800"
                        >
                            {cell === 'X' && <X className="w-16 h-16 text-blue-500"/>}
                            {cell === 'O' && <Circle className="w-16 h-16 text-red-500"/>}
                        </button>
                    ))}
                </div>
            )}

            {/* Question Modal */}
            {activeCell !== null && !winner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-3xl max-w-md w-full animate-fadeIn">
                        <div className="text-center mb-6">
                            <BrainCircuit className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                            <h2 className="text-xl font-bold">Answer to place X</h2>
                        </div>
                        <p className="font-medium text-slate-800 mb-6 text-center">{question.question}</p>
                        <div className="space-y-2">
                            {question.options.map((opt, idx) => (
                                <button key={idx} onClick={() => handleAnswer(idx)} className="w-full p-3 border rounded-xl hover:bg-blue-50 hover:border-blue-500 text-left font-medium">
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setActiveCell(null)} className="mt-4 text-slate-400 text-sm w-full">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default TicTacToeGame;
