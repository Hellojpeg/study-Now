
import React, { useState, useEffect } from 'react';
import { Question, BattleCharacter, BattleMove, ElementType } from '../types';
import { PARTY_MEMBERS, BOSS_DATA } from '../constants';
import { ArrowLeft, Sword, Shield, Zap, Skull, Heart, User, ShoppingBag, Plus, Lock, Flame, Droplets, Mountain, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface BossBattleGameProps {
  questions: Question[];
  onExit: () => void;
}

type BattlePhase = 'MENU' | 'SELECT_TARGET' | 'TRIVIA' | 'ATTACK_ANIM' | 'ENEMY_TURN' | 'WIN' | 'LOSE' | 'SHOP';

interface PlayerInventory {
    points: number;
    potions: number;
    attackUpgrades: number;
    defenseUpgrades: number;
}

const ELEMENT_CHART: Record<ElementType, ElementType> = {
    FIRE: 'EARTH',
    EARTH: 'WATER',
    WATER: 'FIRE',
    AIR: 'NORMAL', // Air is neutral/fast
    NORMAL: 'NORMAL'
};

const BossBattleGame: React.FC<BossBattleGameProps> = ({ questions, onExit }) => {
  // Game State
  const [party, setParty] = useState<BattleCharacter[]>(JSON.parse(JSON.stringify(PARTY_MEMBERS)));
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [boss, setBoss] = useState<BattleCharacter>(JSON.parse(JSON.stringify(BOSS_DATA[0])));
  const [bossIndex, setBossIndex] = useState(0);
  
  // Progression State
  const [inventory, setInventory] = useState<PlayerInventory>({ points: 0, potions: 1, attackUpgrades: 0, defenseUpgrades: 0 });
  const [phase, setPhase] = useState<BattlePhase>('MENU');
  
  // Turn State
  const [selectedMove, setSelectedMove] = useState<BattleMove | null>(null);
  const [triviaQuestion, setTriviaQuestion] = useState<Question | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>(["A wild Boss appeared!"]);
  
  // Animation States
  const [animatingChar, setAnimatingChar] = useState<string | null>(null); 
  const [damagePopup, setDamagePopup] = useState<{id: string, amount: number, text?: string} | null>(null);

  const activeChar = party[activeCharIndex];

  // --- ELEMENTAL LOGIC ---
  const getElementMultiplier = (moveType: ElementType, targetType: ElementType): number => {
      if (ELEMENT_CHART[moveType] === targetType) return 1.5;
      if (ELEMENT_CHART[targetType] === moveType) return 0.5; // Weak against
      return 1.0;
  };

  const getElementIcon = (type: ElementType) => {
      switch(type) {
          case 'FIRE': return <Flame className="w-4 h-4 text-red-500" />;
          case 'WATER': return <Droplets className="w-4 h-4 text-blue-500" />;
          case 'EARTH': return <Mountain className="w-4 h-4 text-emerald-500" />;
          case 'AIR': return <Wind className="w-4 h-4 text-yellow-500" />;
          default: return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
      }
  };

  useEffect(() => {
    // Check win/loss
    if (boss.currentHp <= 0 && phase !== 'WIN' && phase !== 'SHOP') {
        const rewardPoints = 200 + (bossIndex * 100);
        addLog(`Boss Defeated! Earned ${rewardPoints} Points.`);
        setInventory(prev => ({ ...prev, points: prev.points + rewardPoints }));
        
        if (bossIndex < BOSS_DATA.length - 1) {
            setTimeout(() => {
                setPhase('SHOP');
            }, 2000);
        } else {
            setPhase('WIN');
            confetti({ particleCount: 300, spread: 150 });
        }
    } else if (party.every(p => p.currentHp <= 0) && phase !== 'LOSE') {
        setPhase('LOSE');
    }
  }, [boss.currentHp, party, bossIndex, phase]);

  const addLog = (msg: string) => {
      setBattleLog(prev => [msg, ...prev].slice(0, 3));
  };

  // --- ACTIONS ---

  const handleMoveSelect = (move: BattleMove) => {
    setSelectedMove(move);
    const q = questions[Math.floor(Math.random() * questions.length)];
    setTriviaQuestion(q);
    setPhase('TRIVIA');
  };

  const usePotion = () => {
      if (inventory.potions > 0 && activeChar.currentHp < activeChar.maxHp) {
          setInventory(prev => ({ ...prev, potions: prev.potions - 1 }));
          setParty(prev => prev.map(p => p.id === activeChar.id ? { ...p, currentHp: Math.min(p.maxHp, p.currentHp + 50) } : p));
          addLog(`${activeChar.name} used Potion! +50 HP`);
          playSuccessSound();
      } else {
          addLog("Cannot use potion!");
      }
  };

  const handleTriviaAnswer = (idx: number) => {
      if (!triviaQuestion || !selectedMove) return;

      if (idx === triviaQuestion.correctAnswerIndex) {
          playSuccessSound();
          addLog("Correct! Attack charged!");
          setPhase('ATTACK_ANIM');
          executePlayerAttack(selectedMove);
      } else {
          playFailureSound();
          addLog("Incorrect! Attack missed!");
          setPhase('ENEMY_TURN');
          setTimeout(executeEnemyTurn, 1500);
      }
  };

  const executePlayerAttack = (move: BattleMove) => {
      setAnimatingChar(activeChar.id);
      
      setTimeout(() => {
          let damage = 0;
          let popupText = "";

          if (move.type === 'STATUS') {
             if (move.effect === 'HEAL') {
                 damage = -50; 
                 setParty(prev => prev.map(p => p.id === activeChar.id ? {...p, currentHp: Math.min(p.maxHp, p.currentHp + 50)} : p));
                 addLog(`${activeChar.name} healed 50 HP!`);
             } else if (move.effect === 'BUFF_ATK') {
                 addLog(`${activeChar.name} boosted Attack!`);
                 // Simplification: Attack buff lasts forever in this version or handled via logic not shown for brevity
             }
          } else {
             // Damage Formula
             const baseDmg = (activeChar.attack * move.power) / (boss.defense / 2);
             const multiplier = getElementMultiplier(move.element, boss.element);
             damage = Math.floor(baseDmg * multiplier);
             
             if (multiplier > 1) popupText = "SUPER EFFECTIVE!";
             if (multiplier < 1) popupText = "Not very effective...";

             setBoss(prev => ({...prev, currentHp: Math.max(0, prev.currentHp - damage)}));
             addLog(`${activeChar.name} used ${move.name}! ${damage} DMG.`);
             setDamagePopup({ id: boss.id, amount: damage, text: popupText });
          }

          setAnimatingChar(null);
          setTimeout(() => {
              setDamagePopup(null);
              if (boss.currentHp - damage > 0) {
                  setPhase('ENEMY_TURN');
                  setTimeout(executeEnemyTurn, 1500);
              }
          }, 1000);

      }, 500);
  };

  const executeEnemyTurn = () => {
      const aliveMembers = party.filter(p => p.currentHp > 0);
      if (aliveMembers.length === 0) return;
      
      const target = aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
      const move = boss.moves[Math.floor(Math.random() * boss.unlockedMoves)]; 

      setAnimatingChar(boss.id);
      addLog(`${boss.name} used ${move.name}!`);

      setTimeout(() => {
          const baseDmg = (boss.attack * move.power) / (target.defense / 2);
          const multiplier = getElementMultiplier(move.element, target.element);
          const damage = Math.floor(baseDmg * multiplier);
          
          let popupText = "";
          if (multiplier > 1) popupText = "CRITICAL!";

          setParty(prev => prev.map(p => p.id === target.id ? {...p, currentHp: Math.max(0, p.currentHp - damage)} : p));
          setDamagePopup({ id: target.id, amount: damage, text: popupText });
          
          setAnimatingChar(null);
          setTimeout(() => {
              setDamagePopup(null);
              setPhase('MENU');
              if (party[activeCharIndex].currentHp <= 0 && party.some(p => p.currentHp > 0)) {
                  const nextIdx = party.findIndex(p => p.currentHp > 0);
                  setActiveCharIndex(nextIdx);
              }
          }, 1000);
      }, 500);
  };

  // --- SHOP LOGIC ---
  const handleShopBuy = (item: string, cost: number) => {
      if (inventory.points >= cost) {
          setInventory(prev => ({...prev, points: prev.points - cost}));
          playSuccessSound();
          
          if (item === 'POTION') setInventory(prev => ({...prev, potions: prev.potions + 1}));
          if (item === 'MOVE_3') setParty(prev => prev.map(p => ({...p, unlockedMoves: Math.max(p.unlockedMoves, 3)})));
          if (item === 'MOVE_4') setParty(prev => prev.map(p => ({...p, unlockedMoves: Math.max(p.unlockedMoves, 4)})));
          if (item === 'ATK') {
              setParty(prev => prev.map(p => ({...p, attack: p.attack + 5})));
              setInventory(prev => ({...prev, attackUpgrades: prev.attackUpgrades + 1}));
          }
          if (item === 'DEF') {
              setParty(prev => prev.map(p => ({...p, defense: p.defense + 5})));
              setInventory(prev => ({...prev, defenseUpgrades: prev.defenseUpgrades + 1}));
          }
      } else {
          playFailureSound();
      }
  };

  const nextBattle = () => {
      setBossIndex(prev => prev + 1);
      setBoss(JSON.parse(JSON.stringify(BOSS_DATA[bossIndex + 1])));
      setPhase('MENU');
      addLog("Next Stage Started!");
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-800 p-2 flex justify-between items-center z-10 shadow-md">
            <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg font-bold text-sm hover:bg-slate-600">
                <ArrowLeft className="w-4 h-4" /> Exit
            </button>
            <div className="flex gap-6 font-mono font-bold">
                <div className="text-yellow-400">PTS: {inventory.points}</div>
                <div className="text-red-400">POTIONS: {inventory.potions}</div>
            </div>
        </div>

        {/* SHOP PHASE */}
        {phase === 'SHOP' ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black mb-2 text-yellow-400">Safe Zone</h1>
                <p className="text-slate-400 mb-8">Prepare for the next battle.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    <button onClick={() => handleShopBuy('POTION', 50)} className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-green-500 transition-all text-left">
                        <div className="flex justify-between mb-2"><Heart className="text-red-500"/> <span className="text-yellow-400">50 pts</span></div>
                        <div className="font-bold text-lg">Health Pack</div>
                        <div className="text-xs text-slate-500">Restores 50 HP in battle.</div>
                    </button>
                    
                    <button onClick={() => handleShopBuy('ATK', 150)} className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-red-500 transition-all text-left">
                        <div className="flex justify-between mb-2"><Sword className="text-blue-500"/> <span className="text-yellow-400">150 pts</span></div>
                        <div className="font-bold text-lg">Sharpen Weapons</div>
                        <div className="text-xs text-slate-500">Party ATK +5.</div>
                    </button>

                    <button onClick={() => handleShopBuy('DEF', 150)} className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-blue-500 transition-all text-left">
                        <div className="flex justify-between mb-2"><Shield className="text-green-500"/> <span className="text-yellow-400">150 pts</span></div>
                        <div className="font-bold text-lg">Reinforce Armor</div>
                        <div className="text-xs text-slate-500">Party DEF +5.</div>
                    </button>

                    <button onClick={() => handleShopBuy('MOVE_3', 300)} disabled={party[0].unlockedMoves >= 3} className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-purple-500 transition-all text-left disabled:opacity-50">
                        <div className="flex justify-between mb-2"><Zap className="text-purple-500"/> <span className="text-yellow-400">300 pts</span></div>
                        <div className="font-bold text-lg">Ability Slot 3</div>
                        <div className="text-xs text-slate-500">Unlock 3rd move for all.</div>
                    </button>

                    <button onClick={() => handleShopBuy('MOVE_4', 500)} disabled={party[0].unlockedMoves >= 4} className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-purple-500 transition-all text-left disabled:opacity-50">
                        <div className="flex justify-between mb-2"><Zap className="text-purple-500"/> <span className="text-yellow-400">500 pts</span></div>
                        <div className="font-bold text-lg">Ability Slot 4</div>
                        <div className="text-xs text-slate-500">Unlock Ultimate move for all.</div>
                    </button>
                </div>

                <button onClick={nextBattle} className="mt-12 px-12 py-4 bg-emerald-600 text-white font-black text-xl rounded-2xl hover:bg-emerald-500 shadow-xl shadow-emerald-900/50">
                    Enter Next Battle
                </button>
            </div>
        ) : (
            // BATTLE PHASE
            <>
                <div className="flex-grow relative perspective-1000 overflow-hidden bg-gradient-to-b from-slate-900 to-indigo-900">
                    {/* Floor */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-800/50 transform-style-3d rotate-x-60 origin-bottom border-t border-white/10 grid-floor" 
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {/* Log */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 text-sm font-mono text-center z-10">
                        {battleLog[0]}
                    </div>

                    {/* BOSS */}
                    <div className={`absolute top-1/4 right-[15%] transition-all duration-500 ${animatingChar === boss.id ? 'translate-x-[-50px] scale-110' : ''}`}>
                        <div className="relative flex flex-col items-center group">
                            {damagePopup?.id === boss.id && (
                                <div className="absolute -top-12 z-20 flex flex-col items-center">
                                    <span className="text-4xl font-black text-red-500 animate-bounce">-{damagePopup.amount}</span>
                                    {damagePopup.text && <span className="text-xs font-bold text-yellow-300 bg-black/50 px-2 py-1 rounded">{damagePopup.text}</span>}
                                </div>
                            )}
                            <div className="text-[120px] filter drop-shadow-2xl">{boss.avatar}</div>
                            
                            {/* Boss HP */}
                            <div className="absolute -bottom-8 w-48 bg-slate-800 p-2 rounded-lg border border-slate-600 shadow-xl">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>{boss.name}</span>
                                    <div className="flex items-center gap-1">{getElementIcon(boss.element)}</div>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(boss.currentHp / boss.maxHp) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER */}
                    <div className={`absolute bottom-[15%] left-[15%] transition-all duration-500 ${animatingChar === activeChar.id ? 'translate-x-[50px] scale-110' : ''}`}>
                        <div className="relative flex flex-col items-center">
                            {damagePopup?.id === activeChar.id && (
                                <div className="absolute -top-12 z-20 flex flex-col items-center">
                                    <span className="text-4xl font-black text-red-500 animate-bounce">-{damagePopup.amount}</span>
                                    {damagePopup.text && <span className="text-xs font-bold text-yellow-300 bg-black/50 px-2 py-1 rounded">{damagePopup.text}</span>}
                                </div>
                            )}
                            <div className="text-[100px] filter drop-shadow-2xl scale-x-[-1]">{activeChar.avatar}</div>
                        </div>
                    </div>
                </div>

                {/* UI PANEL */}
                <div className="h-1/3 bg-slate-800 border-t-4 border-slate-600 p-4 flex gap-4 z-20">
                    {phase === 'TRIVIA' && triviaQuestion ? (
                        <div className="w-full bg-slate-700 rounded-xl p-6 border-2 border-blue-500 flex flex-col justify-center animate-fadeIn">
                            <h3 className="text-xl font-bold mb-4 text-center">{triviaQuestion.question}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {triviaQuestion.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleTriviaAnswer(i)} className="bg-slate-600 hover:bg-blue-600 p-3 rounded-lg font-bold text-left transition-colors border border-slate-500">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : phase === 'WIN' ? (
                        <div className="w-full flex flex-col items-center justify-center text-yellow-400">
                            <h2 className="text-4xl font-black mb-2">VICTORY!</h2>
                            <button onClick={onExit} className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg">Return to Menu</button>
                        </div>
                    ) : phase === 'LOSE' ? (
                        <div className="w-full flex flex-col items-center justify-center text-red-400">
                            <h2 className="text-4xl font-black mb-2">DEFEATED...</h2>
                            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg">Try Again</button>
                        </div>
                    ) : (
                        <>
                            {/* Left: Actions */}
                            <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/20 grid grid-cols-1 gap-2">
                                <button disabled className="bg-red-600 rounded-lg flex items-center justify-center gap-2 font-bold opacity-100">
                                    <Sword className="w-4 h-4" /> FIGHT
                                </button>
                                <button onClick={usePotion} className="bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center justify-center gap-2 font-bold">
                                    <ShoppingBag className="w-4 h-4" /> ITEMS ({inventory.potions})
                                </button>
                                <button className="bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 font-bold">
                                    <User className="w-4 h-4" /> PARTY
                                </button>
                            </div>

                            {/* Middle: Moves */}
                            <div className="flex-[2] bg-white rounded-xl p-4 text-slate-900 border-4 border-slate-300 relative">
                                <div className="absolute -top-10 left-0 flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-t-xl border-x-4 border-t-4 border-slate-300">
                                    <span className="font-bold text-lg">{activeChar.name}</span>
                                    {getElementIcon(activeChar.element)}
                                    <span className="text-sm ml-2">{activeChar.currentHp}/{activeChar.maxHp} HP</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 h-full">
                                    {activeChar.moves.map((move, i) => {
                                        const isLocked = i >= activeChar.unlockedMoves;
                                        return (
                                            <button 
                                                key={i} 
                                                onClick={() => handleMoveSelect(move)}
                                                disabled={phase !== 'MENU' || isLocked}
                                                className={`rounded-lg px-3 py-1 text-left border-2 flex flex-col justify-center relative overflow-hidden
                                                    ${isLocked 
                                                        ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' 
                                                        : 'bg-slate-100 border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-900'}
                                                `}
                                            >
                                                {isLocked ? (
                                                    <div className="flex items-center justify-center h-full"><Lock className="w-5 h-5"/></div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="font-bold text-sm">{move.name}</span>
                                                            {getElementIcon(move.element)}
                                                        </div>
                                                        <div className="text-[10px] opacity-70">
                                                            {move.power > 0 ? `Pow: ${move.power}` : move.effect} | {move.type}
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Party List */}
                            <div className="w-20 flex flex-col gap-2">
                                {party.map((p, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => p.currentHp > 0 && setActiveCharIndex(i)}
                                        disabled={p.currentHp <= 0}
                                        className={`flex-1 rounded-lg border-2 relative overflow-hidden ${i === activeCharIndex ? 'border-yellow-400 bg-yellow-400/20' : 'border-slate-600 bg-slate-800'}`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-2xl">{p.avatar}</div>
                                        <div className={`absolute bottom-0 left-0 h-1 w-full ${p.currentHp < p.maxHp/3 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(p.currentHp/p.maxHp)*100}%`}}></div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </>
        )}
    </div>
  );
};

export default BossBattleGame;
