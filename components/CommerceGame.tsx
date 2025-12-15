
import React, { useState } from 'react';
import { Question, ShopItem, CommerceState } from '../types';
import { SHOP_ITEMS } from '../constants';
import { ArrowLeft, Coins, TrendingUp, ShoppingBag, Briefcase } from 'lucide-react';
import { playSuccessSound } from '../utils/audio';

interface CommerceGameProps {
  questions: Question[];
  onExit: () => void;
}

const CommerceGame: React.FC<CommerceGameProps> = ({ questions, onExit }) => {
  const [state, setState] = useState<CommerceState>({ money: 0, multiplier: 1, inventory: [] });
  const [qIndex, setQIndex] = useState(0);

  const question = questions[qIndex % questions.length];

  const handleAnswer = (idx: number) => {
      if (idx === question.correctAnswerIndex) {
          playSuccessSound();
          const earnings = 10 * state.multiplier;
          setState(prev => ({ ...prev, money: prev.money + earnings }));
          setQIndex(prev => prev + 1);
      } else {
          // No penalty, just no money (Idle game style)
          setQIndex(prev => prev + 1);
      }
  };

  const buyItem = (item: ShopItem) => {
      if (state.money >= item.cost) {
          setState(prev => ({
              money: prev.money - item.cost,
              multiplier: prev.multiplier + (item.multiplier - 1), // Additive multiplier logic
              inventory: [...prev.inventory, item.id]
          }));
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 h-full">
            
            {/* Left: Work Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                    <button onClick={onExit} className="flex items-center gap-2 text-slate-500 font-bold"><ArrowLeft className="w-5 h-5"/> Exit</button>
                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold">
                        <Coins className="w-5 h-5" /> ${state.money.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-200">
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest mb-6">
                        <Briefcase className="w-5 h-5" /> Work Station
                    </div>
                    <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
                    <div className="grid gap-3">
                        {question.options.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 text-center text-slate-400 text-sm">
                        Earn ${ (10 * state.multiplier).toFixed(2) } per correct answer
                    </div>
                </div>
            </div>

            {/* Right: Shop */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col">
                <div className="flex items-center gap-2 font-bold text-xl mb-6 text-yellow-400">
                    <ShoppingBag className="w-6 h-6" /> Upgrade Shop
                </div>
                
                <div className="flex-grow space-y-4 overflow-y-auto">
                    {SHOP_ITEMS.map(item => {
                        const owned = state.inventory.filter(i => i === item.id).length;
                        return (
                            <button 
                                key={item.id}
                                onClick={() => buyItem(item)}
                                disabled={state.money < item.cost}
                                className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 hover:bg-slate-700 disabled:opacity-50 text-left transition-colors flex items-center gap-4"
                            >
                                <div className="text-3xl">{item.icon}</div>
                                <div className="flex-1">
                                    <div className="font-bold">{item.name}</div>
                                    <div className="text-xs text-slate-400">{item.description}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-emerald-400 font-bold">${item.cost}</div>
                                    <div className="text-xs text-slate-500">Owned: {owned}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Current Multiplier</span>
                        <span className="text-white font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4"/> x{state.multiplier.toFixed(1)}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default CommerceGame;
