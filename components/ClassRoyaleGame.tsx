
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, RoyaleCard, RoyaleUnitInstance } from '../types';
import { ArrowLeft, Zap, Sword, Shield, Trophy, Skull, RefreshCw, HelpCircle, Heart, User, Cpu, BrainCircuit, Timer, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFailureSound } from '../utils/audio';

interface ClassRoyaleGameProps {
  questions: Question[];
  onExit: () => void;
}

const CARDS: RoyaleCard[] = [
    { id: 'c1', name: 'Knight', cost: 3, hp: 80, maxHp: 80, dmg: 15, range: 1, type: 'UNIT', icon: '⚔️', description: 'Tough melee fighter.', evolutionAvailable: true },
    { id: 'c2', name: 'Archers', cost: 3, hp: 40, maxHp: 40, dmg: 10, range: 4, type: 'UNIT', icon: '🏹', description: 'Ranged backup duo.', evolutionAvailable: true },
    { id: 'c3', name: 'Giant', cost: 5, hp: 200, maxHp: 200, dmg: 25, range: 1, type: 'UNIT', icon: '🛡️', description: 'Targets towers only.' },
    { id: 'c4', name: 'Mini P.E.K.K.A', cost: 4, hp: 60, maxHp: 60, dmg: 40, range: 1, type: 'UNIT', icon: '🤖', description: 'Huge single target damage.', evolutionAvailable: true },
    { id: 'c5', name: 'Musketeer', cost: 4, hp: 50, maxHp: 50, dmg: 20, range: 5, type: 'UNIT', icon: '🔫', description: 'Elite long range.' },
    { id: 'c6', name: 'Skeletons', cost: 1, hp: 10, maxHp: 10, dmg: 5, range: 1, type: 'UNIT', icon: '💀', description: 'Fragile distractions.', evolutionAvailable: true },
    { id: 's1', name: 'Fireball', cost: 4, hp: 0, maxHp: 0, dmg: 60, range: 0, type: 'SPELL', icon: '🔥', description: 'Heavy area damage.' },
    { id: 's2', name: 'Arrows', cost: 3, hp: 0, maxHp: 0, dmg: 30, range: 0, type: 'SPELL', icon: '🏹', description: 'Wide area chip damage.' },
];

const MAX_ELIXIR = 10;

interface TowerState {
    id: string;
    hp: number;
    maxHp: number;
    type: 'KING' | 'ARCHER';
    lane: number; // 0: Left, 1: Middle (King), 2: Right
}

const ClassRoyaleGame: React.FC<ClassRoyaleGameProps> = ({ questions, onExit }) => {
    const [elixir, setElixir] = useState(4);
    const [playerTowers, setPlayerTowers] = useState<TowerState[]>([
        { id: 'p-l', hp: 300, maxHp: 300, type: 'ARCHER', lane: 0 },
        { id: 'p-k', hp: 500, maxHp: 500, type: 'KING', lane: 1 },
        { id: 'p-r', hp: 300, maxHp: 300, type: 'ARCHER', lane: 2 },
    ]);
    const [cpuTowers, setCpuTowers] = useState<TowerState[]>([
        { id: 'c-l', hp: 300, maxHp: 300, type: 'ARCHER', lane: 0 },
        { id: 'c-k', hp: 500, maxHp: 500, type: 'KING', lane: 1 },
        { id: 'c-r', hp: 300, maxHp: 300, type: 'ARCHER', lane: 2 },
    ]);
    
    const [units, setUnits] = useState<RoyaleUnitInstance[]>([]);
    const [hand, setHand] = useState<RoyaleCard[]>([]);
    const [nextCard, setNextCard] = useState<RoyaleCard | null>(null);
    const [selectedCard, setSelectedCard] = useState<RoyaleCard | null>(null);
    const [evolutionProgress, setEvolutionProgress] = useState<Record<string, number>>({});
    
    const [turn, setTurn] = useState<'PLAYER' | 'CPU'>('PLAYER');
    const [showTrivia, setShowTrivia] = useState(false);
    const [triviaReason, setTriviaReason] = useState<'RECHARGE' | 'EVOLUTION'>('RECHARGE');
    const [pendingPlacement, setPendingPlacement] = useState<{card: RoyaleCard, lane: number} | null>(null);
    
    const [currentTrivia, setCurrentTrivia] = useState<Question | null>(null);
    const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | null>(null);
    const [battleLog, setBattleLog] = useState<string[]>(['Match Start! Select a card and click a lane to deploy.']);

    // Initialize hand and deck
    useEffect(() => {
        const initial = [...CARDS].sort(() => Math.random() - 0.5);
        setHand(initial.slice(0, 4));
        setNextCard(initial[4]);
    }, []);

    const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev].slice(0, 5));

    // --- EVOLUTION HELPERS ---
    const isEvolvedAvailable = (cardId: string) => (evolutionProgress[cardId] || 0) >= 2;

    // --- GAME LOGIC ---

    const handleArenaClick = (lane: number) => {
        if (!selectedCard || turn !== 'PLAYER' || elixir < selectedCard.cost || gameResult) return;

        const evolved = isEvolvedAvailable(selectedCard.id);
        
        if (evolved) {
            setPendingPlacement({ card: selectedCard, lane });
            setTriviaReason('EVOLUTION');
            const q = questions[Math.floor(Math.random() * questions.length)];
            setCurrentTrivia(q);
            setShowTrivia(true);
        } else {
            deployCard(selectedCard, lane, false);
        }
    };

    const deployCard = (card: RoyaleCard, lane: number, isEvolved: boolean) => {
        setElixir(prev => prev - card.cost);
        
        if (card.type === 'UNIT') {
            const stats = isEvolved ? { ...card, hp: card.hp * 1.5, dmg: card.dmg * 1.5 } : card;
            const newUnit: RoyaleUnitInstance = {
                ...stats,
                instanceId: Math.random().toString(),
                owner: 'PLAYER',
                lane,
                position: 0,
                isEvolved
            };
            setUnits(prev => [...prev, newUnit]);
            addLog(`Deployed ${isEvolved ? 'EVOLVED ' : ''}${card.name}!`);
        } else {
            // Spell logic
            setUnits(prev => prev.map(u => 
                u.owner === 'CPU' && (lane === 1 || u.lane === lane) 
                    ? { ...u, hp: u.hp - card.dmg } 
                    : u
            ).filter(u => u.hp > 0));
            setCpuTowers(prev => prev.map(t => 
                (lane === 1 || t.lane === lane) 
                    ? { ...t, hp: Math.max(0, t.hp - (card.dmg / 2)) } 
                    : t
            ));
            addLog(`Used ${card.name} on Lane ${lane === 0 ? 'Left' : lane === 2 ? 'Right' : 'Middle'}!`);
        }

        // Update Evolution Progress
        setEvolutionProgress(prev => ({
            ...prev,
            [card.id]: isEvolved ? 0 : (prev[card.id] || 0) + 1
        }));

        // Rotate Hand
        setHand(prev => {
            const nextIdx = prev.findIndex(c => c.id === card.id);
            const updated = [...prev];
            if (nextCard) {
                updated[nextIdx] = nextCard;
                const remaining = CARDS.filter(c => !updated.map(hc => hc.id).includes(c.id) && c.id !== card.id);
                setNextCard(remaining[Math.floor(Math.random() * remaining.length)] || CARDS[0]);
            }
            return updated;
        });

        setSelectedCard(null);
    };

    const nextTurn = () => {
        if (gameResult) return;
        setTurn('CPU');
        addLog("Battle Phase: Units advancing!");
        setTimeout(() => simulateBattle(), 800);
    };

    const simulateBattle = () => {
        setUnits(prev => {
            let nextUnits = [...prev];
            
            nextUnits = nextUnits.map(u => {
                const isPlayer = u.owner === 'PLAYER';
                const direction = isPlayer ? 1 : -1;
                const enemiesInLane = nextUnits.filter(e => e.owner !== u.owner && e.lane === u.lane);
                const target = enemiesInLane.find(e => Math.abs(u.position - e.position) <= u.range * 10);

                if (target) return u;
                
                const towers = isPlayer ? cpuTowers : playerTowers;
                const archerTower = towers.find(t => t.lane === u.lane && t.type === 'ARCHER');
                const kingTower = towers.find(t => t.type === 'KING');
                
                const canHitArcher = archerTower && archerTower.hp > 0 && (isPlayer ? u.position >= 80 : u.position <= 20);
                const canHitKing = kingTower && kingTower.hp > 0 && (isPlayer ? u.position >= 90 : u.position <= 10);

                if (canHitArcher || canHitKing) return u;

                const newPos = u.position + (direction * 10);
                return { ...u, position: Math.min(100, Math.max(0, newPos)) };
            });

            let finalized: RoyaleUnitInstance[] = [];
            nextUnits.forEach(u => {
                const attackers = nextUnits.filter(a => a.owner !== u.owner && a.lane === u.lane && Math.abs(a.position - u.position) <= a.range * 10);
                const unitDmg = attackers.reduce((acc, a) => acc + a.dmg, 0);
                if (u.hp - unitDmg > 0) finalized.push({ ...u, hp: u.hp - unitDmg });
            });

            finalized.forEach(u => {
                const isPlayer = u.owner === 'PLAYER';
                const towers = isPlayer ? [...cpuTowers] : [...playerTowers];
                const setTowers = isPlayer ? setCpuTowers : setPlayerTowers;
                const archerTower = towers.find(t => t.lane === u.lane && t.type === 'ARCHER');
                const kingTower = towers.find(t => t.type === 'KING');

                if (archerTower && archerTower.hp > 0 && (isPlayer ? u.position >= 80 : u.position <= 20)) {
                    archerTower.hp = Math.max(0, archerTower.hp - u.dmg);
                } else if (kingTower && kingTower.hp > 0 && (isPlayer ? u.position >= 90 : u.position <= 10)) {
                    kingTower.hp = Math.max(0, kingTower.hp - u.dmg);
                }
                setTowers(towers);
            });

            return finalized;
        });

        setTimeout(() => cpuTurn(), 1000);
    };

    const cpuTurn = () => {
        const cpuElixir = 3 + Math.floor(Math.random() * 4);
        const cardToPlay = CARDS.filter(c => c.cost <= cpuElixir && c.type === 'UNIT')[Math.floor(Math.random() * 3)];
        
        if (cardToPlay) {
            const lane = [0, 2][Math.floor(Math.random() * 2)];
            const newUnit: RoyaleUnitInstance = {
                ...cardToPlay,
                instanceId: Math.random().toString(),
                owner: 'CPU',
                lane,
                position: 100
            };
            setUnits(prev => [...prev, newUnit]);
            addLog(`CPU counter-attacked!`);
        }

        setTurn('PLAYER');
        setElixir(prev => Math.min(MAX_ELIXIR, prev + 1));

        if (cpuTowers.find(t => t.type === 'KING')?.hp === 0) { setGameResult('WIN'); confetti(); }
        else if (playerTowers.find(t => t.type === 'KING')?.hp === 0) { setGameResult('LOSE'); }
    };

    const openTriviaRecharge = () => {
        if (turn !== 'PLAYER' || gameResult) return;
        setTriviaReason('RECHARGE');
        const q = questions[Math.floor(Math.random() * questions.length)];
        setCurrentTrivia(q);
        setShowTrivia(true);
    };

    const handleTriviaAnswer = (idx: number) => {
        if (!currentTrivia) return;
        const isCorrect = idx === currentTrivia.correctAnswerIndex;
        
        if (triviaReason === 'RECHARGE') {
            if (isCorrect) {
                playSuccessSound();
                setElixir(prev => Math.min(MAX_ELIXIR, prev + 4));
                addLog("Correct! Elixir charged +4.");
            } else {
                playFailureSound();
                addLog("Wrong! Elixir leaked.");
            }
        } else if (triviaReason === 'EVOLUTION' && pendingPlacement) {
            if (isCorrect) {
                playSuccessSound();
                deployCard(pendingPlacement.card, pendingPlacement.lane, true);
                addLog("Masterful! Evolution deployed.");
            } else {
                playFailureSound();
                deployCard(pendingPlacement.card, pendingPlacement.lane, false);
                addLog("Incorrect! Regular unit deployed instead.");
            }
            setPendingPlacement(null);
        }
        setShowTrivia(false);
    };

    const Lane: React.FC<{ index: number }> = ({ index }) => (
        <div 
            onClick={() => handleArenaClick(index)}
            className={`flex-1 relative cursor-crosshair group/lane transition-colors
                ${selectedCard ? 'hover:bg-blue-500/10' : ''}
                ${index === 1 ? 'z-0' : 'z-10'}
            `}
        >
            {(index === 0 || index === 2) && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 bg-orange-700/80 rounded-sm border-2 border-orange-900 shadow-inner z-20 flex items-center justify-center text-[10px] font-bold text-orange-200">
                    BRIDGE
                </div>
            )}
            
            {units.filter(u => u.lane === index).map(u => (
                <div 
                    key={u.instanceId}
                    className={`absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all duration-700 shadow-lg border-2 
                        ${u.owner === 'PLAYER' ? 'border-blue-500 bg-blue-900/80' : 'border-red-500 bg-red-900/80'}
                        ${u.isEvolved ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900' : ''}
                    `}
                    style={{ bottom: `${u.position}%`, zIndex: u.position }}
                >
                    <span className={u.owner === 'CPU' ? 'scale-x-[-1]' : ''}>{u.icon}</span>
                    <div className="absolute -top-6 w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/20">
                        <div className={`h-full ${u.owner === 'PLAYER' ? 'bg-blue-400' : 'bg-red-400'}`} style={{ width: `${(u.hp / u.maxHp) * 100}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const Tower: React.FC<{ tower: TowerState; isCpu: boolean }> = ({ tower, isCpu }) => (
        <div 
            className={`absolute flex flex-col items-center transition-all duration-500 ${tower.hp <= 0 ? 'opacity-30 grayscale' : ''}`}
            style={{ 
                left: tower.lane === 0 ? '16.6%' : tower.lane === 2 ? '83.3%' : '50%',
                top: isCpu ? (tower.type === 'KING' ? '5%' : '15%') : 'auto',
                bottom: !isCpu ? (tower.type === 'KING' ? '5%' : '15%') : 'auto',
                transform: 'translateX(-50%)'
            }}
        >
            <div className={`text-5xl filter drop-shadow-2xl animate-float-slow`}>
                {tower.type === 'KING' ? (isCpu ? '👑' : '🏰') : '🗼'}
            </div>
            <div className="w-24 h-3 bg-slate-900 rounded-full border-2 border-white/20 overflow-hidden mt-1 shadow-inner">
                <div className={`h-full transition-all duration-1000 ${isCpu ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(tower.hp / tower.maxHp) * 100}%` }}></div>
            </div>
            <div className="text-[12px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/10 mt-1">{tower.hp}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-2 font-sans flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-6xl flex flex-col h-[98vh] relative">
                
                {/* Header Info */}
                <div className="flex justify-between items-center px-4 py-2 z-50">
                    <button onClick={onExit} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft className="w-5 h-5"/></button>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black italic tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">CLASS ROYALE</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Midterm Combat Edition</div>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/5 shadow-xl">
                        <Timer className="w-4 h-4 text-blue-400" />
                        <span className="text-lg font-mono font-black text-blue-400">02:30</span>
                    </div>
                </div>

                {/* MAIN GAMEPLAY AREA */}
                <div className="flex-grow flex flex-col md:flex-row gap-6 mt-4 min-h-0">
                    
                    {/* LEFT PANEL (Hand/Stats) */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col gap-4 flex-grow">
                             <div className="flex justify-between items-center text-[10px] font-black text-purple-400 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2 uppercase tracking-widest"><Zap className="w-4 h-4 fill-purple-500" /> Elixir Supply</div>
                                <div>{elixir} / {MAX_ELIXIR}</div>
                             </div>

                             <div className="h-4 bg-slate-950 rounded-full border-2 border-purple-900/30 overflow-hidden p-0.5 shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-700 rounded-full shadow-[0_0_15px_#d946ef]"
                                    style={{ width: `${(elixir / MAX_ELIXIR) * 100}%` }}
                                ></div>
                             </div>

                             <div className="grid grid-cols-2 gap-3 mt-4">
                                {hand.map((card) => {
                                    const isEvolved = isEvolvedAvailable(card.id);
                                    const isActive = selectedCard?.id === card.id;
                                    return (
                                        <button 
                                            key={card.id}
                                            onClick={() => setSelectedCard(isActive ? null : card)}
                                            disabled={elixir < card.cost || turn === 'CPU'}
                                            className={`
                                                aspect-[3/4] rounded-2xl border-4 transition-all flex flex-col items-center justify-center relative overflow-hidden shadow-xl
                                                ${isActive 
                                                    ? 'border-yellow-400 bg-slate-800 scale-105 shadow-yellow-400/20' 
                                                    : elixir >= card.cost 
                                                        ? 'bg-slate-800 border-white/10 hover:border-blue-500/50 hover:-translate-y-1' 
                                                        : 'bg-slate-900 border-slate-800 opacity-50 grayscale'
                                                }
                                                ${isEvolved ? 'ring-4 ring-purple-500 ring-inset animate-pulse' : ''}
                                            `}
                                        >
                                            <div className="text-4xl mb-2">{card.icon}</div>
                                            <div className="text-[10px] font-black uppercase text-center text-white px-2 leading-tight">{card.name}</div>
                                            
                                            <div className="absolute top-2 right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-900 shadow-md">
                                                {card.cost}
                                            </div>

                                            {isEvolved && (
                                                <div className="absolute top-2 left-2 text-purple-400 drop-shadow-md">
                                                    <Sparkles className="w-5 h-5 fill-current" />
                                                </div>
                                            )}

                                            {/* Evolution Progress Pips */}
                                            {!isEvolved && card.evolutionAvailable && (
                                                <div className="absolute bottom-2 flex gap-1">
                                                    {[0, 1].map(i => (
                                                        <div key={i} className={`w-2 h-2 rounded-full border border-white/20 ${i < (evolutionProgress[card.id] || 0) ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' : 'bg-slate-950'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                             </div>

                             <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-[8px] font-bold text-slate-500 uppercase mb-2">Next Unit</div>
                                    <div className="w-14 h-14 bg-slate-950 rounded-2xl border-2 border-white/5 flex items-center justify-center text-2xl shadow-inner">{nextCard?.icon}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={openTriviaRecharge}
                                        disabled={turn === 'CPU'}
                                        className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 border-b-4 border-blue-900"
                                    >
                                        <BrainCircuit className="w-4 h-4" /> RECHARGE
                                    </button>
                                    <button 
                                        onClick={nextTurn}
                                        disabled={turn === 'CPU'}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-500 active:scale-95 flex items-center gap-2 shadow-lg border-b-4 border-emerald-800"
                                    >
                                        <Sword className="w-4 h-4" /> BATTLE
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* ARENA (Stretches on desktop) */}
                    <div className="flex-1 flex flex-col rounded-[3rem] border-[12px] border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden h-full" 
                        style={{ 
                            background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), #4ade80',
                            backgroundImage: 'radial-gradient(#166534 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}>
                        
                        {/* The River */}
                        <div className="absolute top-1/2 left-0 right-0 h-24 bg-blue-600/60 border-y-8 border-blue-900/30 shadow-inner -translate-y-1/2 flex items-center justify-center overflow-hidden z-10">
                            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/water.png')] bg-repeat"></div>
                        </div>

                        {/* Lane Markings */}
                        <div className="absolute inset-0 flex pointer-events-none opacity-10">
                             <div className="w-1/3 h-full border-r-4 border-white/20"></div>
                             <div className="w-1/3 h-full border-r-4 border-white/20"></div>
                        </div>

                        {/* Towers */}
                        {cpuTowers.map(t => <Tower key={t.id} tower={t} isCpu={true} />)}
                        {playerTowers.map(t => <Tower key={t.id} tower={t} isCpu={false} />)}

                        {/* Battle Field */}
                        <div className="flex-grow flex relative">
                            <Lane index={0} />
                            <Lane index={1} />
                            <Lane index={2} />
                        </div>

                        {/* Battle Log Overlay */}
                        <div className="absolute bottom-6 left-8 w-64 space-y-2 pointer-events-none z-50">
                            {battleLog.map((log, i) => (
                                <div key={i} className="text-xs bg-black/70 backdrop-blur-md px-4 py-2 rounded-full font-bold border border-white/10 text-slate-100 animate-slideUp shadow-xl">
                                    {log}
                                </div>
                            ))}
                        </div>

                        {/* Deployment Tip */}
                        {selectedCard && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-400 text-slate-900 px-8 py-4 rounded-full font-black text-xl animate-bounce shadow-2xl border-4 border-slate-900">
                                SELECT A LANE TO DEPLOY {selectedCard.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* TRIVIA MODAL */}
            {showTrivia && currentTrivia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-lg animate-fadeIn">
                    <div className="bg-slate-900 p-12 rounded-[4rem] max-w-2xl w-full border-[8px] border-blue-500 shadow-[0_0_100px_rgba(59,130,246,0.4)]">
                        <div className="text-center mb-10">
                             <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full font-black text-lg shadow-xl mb-8 border-b-4 
                                ${triviaReason === 'EVOLUTION' ? 'bg-purple-600 text-white border-purple-900' : 'bg-blue-600 text-white border-blue-900'}`}
                             >
                                 {triviaReason === 'EVOLUTION' ? <Sparkles className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                 {triviaReason === 'EVOLUTION' ? 'ACTIVATE EVOLUTION' : 'ELIXIR RECHARGE'}
                             </div>
                             <h3 className="text-3xl font-black text-white leading-tight">
                                 {currentTrivia.question}
                             </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {currentTrivia.options.map((opt, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleTriviaAnswer(i)}
                                    className="p-6 rounded-3xl bg-slate-800 hover:bg-blue-600 text-center font-bold text-xl transition-all border-b-8 border-slate-950 hover:border-blue-800 active:translate-y-2 active:border-b-0"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FINAL RESULT MODAL */}
            {gameResult && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 p-4 animate-fadeIn backdrop-blur-xl">
                    <div className="text-center">
                        <div className="relative mb-12">
                            <Trophy className={`w-64 h-64 mx-auto ${gameResult === 'WIN' ? 'text-yellow-400' : 'text-slate-600'} animate-float-slow drop-shadow-[0_0_50px_rgba(253,224,71,0.3)]`} />
                            {gameResult === 'WIN' && <Crown className="absolute top-0 right-[15%] w-24 h-24 text-yellow-300 rotate-12 drop-shadow-lg" />}
                        </div>
                        <h1 className="text-[120px] leading-none font-black mb-16 italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            {gameResult === 'WIN' ? '3 CROWNS!' : 'GAME OVER'}
                        </h1>
                        <div className="flex gap-8 justify-center">
                            <button onClick={onExit} className="px-12 py-6 bg-white/10 hover:bg-white/20 rounded-[2rem] font-black text-3xl transition-all border-2 border-white/20">EXIT</button>
                            <button onClick={() => window.location.reload()} className="px-16 py-6 bg-blue-600 text-white font-black rounded-[2rem] text-4xl hover:scale-110 shadow-2xl shadow-blue-500/50 transition-transform border-b-8 border-blue-900">REMATCH</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassRoyaleGame;
