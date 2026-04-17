
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, SnakePoint, SnakeEnemy, SnakeProjectile } from '../types';
import { ArrowLeft, Apple, Zap, Shield, Target, ShoppingCart, Timer, Sword, Ghost, Flame, Trophy, Lock, Skull, Maximize, Sparkles } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StudySnakeGameProps {
  questions: Question[];
  onExit: () => void;
}

// --- CONFIG ---
const GRID_SIZE = 30; // Increased for bigger screen
const INITIAL_SPEED = 180;
const SPEED_INCREMENT = 1.5;

const SKINS = [
    { id: 'classic', name: 'Classic Green', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
    { id: 'neon', name: 'Cyber Neon', color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50', cost: 500 },
    { id: 'gold', name: 'Ancient Gold', color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50', cost: 1500 },
    { id: 'lava', name: 'Volcanic Lava', color: 'bg-red-600', shadow: 'shadow-red-600/50', cost: 3000 },
];

const WEAPONS = [
    { id: 'LASER', name: 'Red Laser', icon: '⚡', cost: 1000 },
    { id: 'ARROW', name: 'Phalanx Arrow', icon: '🏹', cost: 2000 },
    { id: 'POISON', name: 'Greek Fire', icon: '🧪', cost: 5000 },
];

const MAPS = Array.from({ length: 30 }).map((_, i) => {
    const obstacles: SnakePoint[] = [];
    if (i > 5) {
        for(let x=0; x<GRID_SIZE; x++) { obstacles.push({x, y:0}, {x, y:GRID_SIZE-1}); }
        for(let y=0; y<GRID_SIZE; y++) { obstacles.push({x:0, y}, {x:GRID_SIZE-1, y}); }
    }
    if (i > 15) {
        for(let x=8; x<22; x++) obstacles.push({x, y:15});
        for(let y=8; y<22; y++) obstacles.push({x:15, y});
    }
    return { id: i + 1, obstacles };
});

const StudySnakeGame: React.FC<StudySnakeGameProps> = ({ questions, onExit }) => {
    // Game Logic State
    const [snake, setSnake] = useState<SnakePoint[]>([{x: 15, y: 15}, {x: 15, y: 16}, {x: 15, y: 17}]);
    const [direction, setDirection] = useState<SnakePoint>({x: 0, y: -1});
    const [inputQueue, setInputQueue] = useState<SnakePoint[]>([]); 
    const [apples, setApples] = useState<SnakePoint[]>([{x: 10, y: 10}]);
    const [enemies, setEnemies] = useState<SnakeEnemy[]>([]);
    const [projectiles, setProjectiles] = useState<SnakeProjectile[]>([]);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    
    // Unlocks State
    const [currentSkin, setCurrentSkin] = useState(SKINS[0]);
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['classic']);
    const [currentWeapon, setCurrentWeapon] = useState<string | null>(null);
    const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>([]);
    const [shopPoints, setShopPoints] = useState(0);
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Powerup State
    const [invincibility, setInvincibility] = useState(0);
    const [slowMo, setSlowMo] = useState(0);

    // Trivia State
    const [showTrivia, setShowTrivia] = useState(false);
    const [currentTrivia, setCurrentTrivia] = useState<Question | null>(null);
    const [triviaTimer, setTriviaTimer] = useState(10);
    
    const gameLoopRef = useRef<number | null>(null);

    const spawnApple = useCallback(() => {
        const newApple = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        setApples(prev => [...prev, newApple]);
    }, []);

    const spawnEnemy = useCallback(() => {
        const newEnemy: SnakeEnemy = {
            id: Math.random().toString(),
            pos: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
            hp: 2,
            type: Math.random() > 0.5 ? 'GHOST' : 'SPIDER'
        };
        setEnemies(prev => [...prev, newEnemy]);
    }, []);

    const handleGameOver = useCallback(() => {
        setIsGameOver(true);
        setIsPaused(true);
        playFailureSound();
    }, []);

    const moveSnake = useCallback(() => {
        if (isPaused || isGameOver) return;

        let nextDir = direction;
        if (inputQueue.length > 0) {
            nextDir = inputQueue[0];
            setDirection(nextDir);
            setInputQueue(prev => prev.slice(1));
        }

        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };

            const currentMap = MAPS[(round - 1) % 30];
            const hitObstacle = currentMap.obstacles.some(o => o.x === newHead.x && o.y === newHead.y);
            const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;

            if ((hitWall || hitObstacle || prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) && invincibility <= 0) {
                handleGameOver();
                return prevSnake;
            }

            let finalHead = newHead;
            if (hitWall && invincibility > 0) {
                finalHead = { 
                    x: (newHead.x + GRID_SIZE) % GRID_SIZE, 
                    y: (newHead.y + GRID_SIZE) % GRID_SIZE 
                };
            }

            const newSnake = [finalHead, ...prevSnake.slice(0, -1)];

            const appleIdx = apples.findIndex(a => a.x === finalHead.x && a.y === finalHead.y);
            if (appleIdx !== -1) {
                setApples(prev => prev.filter((_, i) => i !== appleIdx));
                triggerTrivia();
                return prevSnake;
            }

            if (enemies.some(e => e.pos.x === finalHead.x && e.pos.y === finalHead.y) && invincibility <= 0) {
                handleGameOver();
                return prevSnake;
            }

            return newSnake;
        });

        setProjectiles(prev => prev.map(p => ({
            ...p,
            pos: { x: p.pos.x + p.dir.x, y: p.pos.y + p.dir.y }
        })).filter(p => p.pos.x >= 0 && p.pos.x < GRID_SIZE && p.pos.y >= 0 && p.pos.y < GRID_SIZE));

        setEnemies(prevEnemies => {
            const nextEnemies = [...prevEnemies];
            setProjectiles(prevProj => {
                const nextProj = [...prevProj];
                nextProj.forEach((p, pIdx) => {
                    const eIdx = nextEnemies.findIndex(e => e.pos.x === Math.round(p.pos.x) && e.pos.y === Math.round(p.pos.y));
                    if (eIdx !== -1) {
                        nextEnemies[eIdx].hp -= 1;
                        nextProj.splice(pIdx, 1);
                        if (nextEnemies[eIdx].hp <= 0) {
                            nextEnemies.splice(eIdx, 1);
                            setScore(s => s + 50);
                            setShopPoints(s => s + 20);
                        }
                    }
                });
                return nextProj;
            });
            return nextEnemies;
        });

        if (invincibility > 0) setInvincibility(v => v - 1);
        if (slowMo > 0) setSlowMo(v => v - 1);
    }, [direction, inputQueue, apples, isPaused, isGameOver, round, invincibility, slowMo, enemies, handleGameOver]);

    useEffect(() => {
        const tick = slowMo > 0 ? speed * 2 : speed;
        gameLoopRef.current = window.setInterval(moveSnake, tick);
        return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }, [moveSnake, speed, slowMo]);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '];
            if (gameKeys.includes(e.key)) e.preventDefault();

            if (showTrivia || isShopOpen || isGameOver) return;

            let newDir: SnakePoint | null = null;
            const lastQueuedDir = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;

            switch(e.key) {
                case 'ArrowUp': case 'w': if (lastQueuedDir.y === 0) newDir = {x:0, y:-1}; break;
                case 'ArrowDown': case 's': if (lastQueuedDir.y === 0) newDir = {x:0, y:1}; break;
                case 'ArrowLeft': case 'a': if (lastQueuedDir.x === 0) newDir = {x:-1, y:0}; break;
                case 'ArrowRight': case 'd': if (lastQueuedDir.x === 0) newDir = {x:1, y:0}; break;
                case ' ': shoot(); break;
            }

            if (newDir) setInputQueue(prev => [...prev.slice(0, 1), newDir!]);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [direction, inputQueue, showTrivia, isShopOpen, isGameOver]);

    const shoot = () => {
        if (!currentWeapon || isPaused) return;
        const head = snake[0];
        const newProj: SnakeProjectile = {
            id: Math.random().toString(),
            pos: { ...head },
            dir: { ...direction },
            type: currentWeapon as any
        };
        setProjectiles(prev => [...prev, newProj]);
    };

    const triggerTrivia = () => {
        const q = questions[Math.floor(Math.random() * questions.length)];
        setCurrentTrivia(q);
        setShowTrivia(true);
        setIsPaused(true);
        setTriviaTimer(10);
    };

    useEffect(() => {
        let t: any;
        if (showTrivia && triviaTimer > 0) {
            t = setInterval(() => setTriviaTimer(v => v - 1), 1000);
        } else if (showTrivia && triviaTimer === 0) {
            handleAnswer(-1);
        }
        return () => clearInterval(t);
    }, [showTrivia, triviaTimer]);

    const handleAnswer = (idx: number) => {
        setShowTrivia(false);
        setIsPaused(false);
        
        if (currentTrivia && idx === currentTrivia.correctAnswerIndex) {
            playSuccessSound();
            setScore(s => s + 100);
            setShopPoints(s => s + 50);
            setRound(r => r + 1);
            setSpeed(s => Math.max(50, s - SPEED_INCREMENT));
            
            setSnake(prev => {
                const tail = prev[prev.length - 1];
                return [...prev, { ...tail }];
            });

            if (round % 5 === 0) {
                spawnEnemy();
                confetti({ particleCount: 50, spread: 60 });
            }

            const rng = Math.random();
            if (rng < 0.1) setInvincibility(20);
            if (rng > 0.9) {
                for(let i=0; i<4; i++) spawnApple();
            }

            spawnApple();
        } else {
            playFailureSound();
            spawnApple();
        }
    };

    const currentMap = MAPS[(round - 1) % 30];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-2 font-sans flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-[98vw] flex flex-col h-[98vh]">
                
                {/* HUD */}
                <div className="flex justify-between items-center bg-slate-900/90 p-4 rounded-3xl border border-white/10 mb-2 backdrop-blur-xl shadow-2xl z-10">
                    <div className="flex items-center gap-6">
                        <button onClick={onExit} className="p-3 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors"><ArrowLeft className="w-8 h-8"/></button>
                        <div className="bg-slate-950 px-6 py-2 rounded-2xl border border-white/5">
                            <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Master Score</div>
                            <div className="text-3xl font-black">{score.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black text-emerald-400 tracking-tighter italic drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">STUDY SNAKE PRO</div>
                        <div className="flex gap-4 mt-1">
                             {invincibility > 0 && <div className="flex items-center gap-1 text-blue-400 font-bold text-xs bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20"><Shield className="w-3 h-3 animate-pulse" /> INVINCIBLE</div>}
                             {slowMo > 0 && <div className="flex items-center gap-1 text-purple-400 font-bold text-xs bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/20"><Timer className="w-3 h-3 animate-pulse" /> SLOW-MO</div>}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right bg-slate-950 px-6 py-2 rounded-2xl border border-white/5">
                            <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Progress</div>
                            <div className="text-3xl font-black">{round}<span className="text-sm opacity-30">/100</span></div>
                        </div>
                        <button onClick={() => setIsShopOpen(true)} className="p-4 bg-yellow-500/10 text-yellow-500 rounded-[1.5rem] border-2 border-yellow-500/20 hover:bg-yellow-500/20 transition-all shadow-lg shadow-yellow-500/10">
                            <ShoppingCart className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* GAME AREA (STRETCHES TO MAX WIDTH) */}
                <div className="flex-grow flex items-center justify-center relative p-2 overflow-hidden">
                    <div 
                        className={`relative rounded-[2.5rem] border-[12px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 ${isGameOver ? 'border-red-500 shadow-red-500/30' : 'border-slate-800 shadow-emerald-500/20'}`}
                        style={{ 
                            width: 'min(95vw, 85vh)', 
                            height: 'min(95vw, 85vh)',
                            display: 'grid',
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                            background: '#020617',
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                            backgroundSize: 'calc(100% / 30) calc(100% / 30)'
                        }}
                    >
                        {/* Obstacles */}
                        {currentMap.obstacles.map((o, i) => (
                            <div key={`obs-${i}`} className="bg-slate-800 border border-slate-700 rounded-sm shadow-inner" style={{ gridColumnStart: o.x + 1, gridRowStart: o.y + 1 }} />
                        ))}

                        {/* Apples */}
                        {apples.map((a, i) => (
                            <div key={`apple-${i}`} className="flex items-center justify-center animate-bounce" style={{ gridColumnStart: a.x + 1, gridRowStart: a.y + 1 }}>
                                <Apple className="w-[80%] h-[80%] text-red-500 fill-red-500 filter drop-shadow-[0_0_12px_#ef4444]" />
                            </div>
                        ))}

                        {/* Enemies */}
                        {enemies.map((e) => (
                            <div key={e.id} className="flex items-center justify-center animate-pulse" style={{ gridColumnStart: e.pos.x + 1, gridRowStart: e.pos.y + 1 }}>
                                {e.type === 'GHOST' ? <Ghost className="w-full h-full text-purple-400 drop-shadow-[0_0_8px_#a855f7]" /> : <Skull className="w-[90%] h-[90%] text-red-400 drop-shadow-[0_0_8px_#ef4444]" />}
                            </div>
                        ))}

                        {/* Projectiles */}
                        {projectiles.map((p) => (
                            <div key={p.id} className="flex items-center justify-center" style={{ gridColumnStart: Math.round(p.pos.x) + 1, gridRowStart: Math.round(p.pos.y) + 1 }}>
                                <div className={`w-[60%] h-[60%] rounded-full shadow-[0_0_15px_currentColor] ${p.type === 'LASER' ? 'text-red-400 bg-red-400' : 'text-yellow-200 bg-yellow-200'}`} />
                            </div>
                        ))}

                        {/* Snake Body */}
                        {snake.map((s, i) => (
                            <div 
                                key={`snake-${i}`} 
                                className={`rounded-sm border border-black/30 transition-all duration-150 ${i === 0 ? 'z-10 scale-125 shadow-2xl ring-2 ring-white/20' : 'opacity-90'} ${currentSkin.color} ${invincibility > 0 ? 'animate-pulse ring-4 ring-blue-400' : ''} ${currentSkin.shadow}`}
                                style={{ gridColumnStart: s.x + 1, gridRowStart: s.y + 1 }} 
                            />
                        ))}

                        {/* Game Over Overlay */}
                        {isGameOver && (
                            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-xl animate-fadeIn">
                                <Skull className="w-32 h-32 text-red-500 mb-8 animate-bounce" />
                                <h2 className="text-[120px] font-black text-white italic tracking-tighter mb-4 uppercase leading-none">WASTED</h2>
                                <p className="text-slate-400 font-mono mb-12 text-4xl">Final Score: {score}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-24 py-8 bg-white text-slate-950 font-black rounded-[2.5rem] text-4xl hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95"
                                >
                                    RESPAWN
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-2 flex justify-between items-center px-12 pb-4">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                            <Flame className="w-6 h-6 text-orange-500" />
                            <span className="text-xl font-mono font-bold text-slate-300">{speed.toFixed(0)}ms Engine</span>
                        </div>
                        {currentWeapon && (
                            <div className="flex items-center gap-3 bg-blue-500/10 px-8 py-3 rounded-2xl border border-blue-500/20 text-blue-400 shadow-inner">
                                <Sword className="w-6 h-6" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">SPACE: FIRE {currentWeapon}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] bg-slate-900/50 px-8 py-3 rounded-2xl border border-white/5">
                            MAP NODE: {currentMap.id} / 30 • SECTOR {Math.ceil(round/10)}
                        </div>
                        <div className="flex items-center gap-2 text-yellow-500 font-black bg-yellow-500/10 px-6 py-3 rounded-2xl border border-yellow-500/20">
                            <Target className="w-5 h-5" /> PTS: {shopPoints}
                        </div>
                    </div>
                </div>
            </div>

            {/* TRIVIA MODAL (MATCHING ROYALE STYLE) */}
            {showTrivia && currentTrivia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-8 backdrop-blur-2xl animate-fadeIn">
                    <div className="bg-slate-900 p-16 rounded-[4rem] max-w-4xl w-full border-[10px] border-emerald-500 shadow-[0_0_150px_rgba(16,185,129,0.4)]">
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-4 bg-emerald-500 text-slate-950 px-8 py-3 rounded-full font-black text-lg uppercase tracking-widest shadow-2xl">
                                <Apple className="w-8 h-8" /> BRAIN POWER GAINED
                            </div>
                            <div className={`flex items-center gap-4 px-8 py-3 rounded-full font-mono font-black text-4xl border-4 shadow-2xl ${triviaTimer < 4 ? 'text-red-500 border-red-500 animate-pulse' : 'text-emerald-500 border-emerald-500'}`}>
                                <Timer className="w-10 h-10" /> 00:{triviaTimer.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <h3 className="text-4xl md:text-5xl font-black text-white leading-tight text-center mb-16 px-8 drop-shadow-lg">
                            {currentTrivia.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            {currentTrivia.options.map((opt, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleAnswer(i)}
                                    className="group relative p-8 rounded-[2rem] bg-slate-800 border-4 border-slate-700 hover:border-emerald-400 hover:bg-slate-750 transition-all text-center overflow-hidden active:scale-[0.97] shadow-2xl"
                                >
                                    <span className="relative z-10 font-bold text-3xl text-slate-200 group-hover:text-white">{opt}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-12 text-center text-slate-500 text-sm font-black uppercase tracking-[0.4em] animate-pulse">
                            CORRECT RESPONSE TRIGGERS CELLULAR GROWTH
                        </div>
                    </div>
                </div>
            )}

            {/* SHOP MODAL (STRETCHED) */}
            {isShopOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-8 backdrop-blur-3xl animate-fadeIn">
                    <div className="bg-slate-900 p-12 rounded-[5rem] max-w-[90vw] w-full border-8 border-yellow-500 shadow-[0_0_200px_rgba(234,179,8,0.2)] flex flex-col h-[90vh]">
                        <div className="flex justify-between items-center mb-16 px-8">
                            <h2 className="text-7xl font-black text-yellow-400 italic tracking-tighter drop-shadow-2xl">EVO-LAB SHOP</h2>
                            <div className="flex items-center gap-12">
                                <div className="text-5xl font-black text-white bg-slate-850 px-12 py-6 rounded-[2.5rem] border-4 border-white/5 shadow-2xl flex items-center gap-4">
                                    <span className="text-yellow-400">CREDITS:</span> {shopPoints}
                                </div>
                                <button onClick={() => setIsShopOpen(false)} className="p-6 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 shadow-2xl border-2 border-white/10"><ArrowLeft className="w-12 h-12"/></button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto px-8 space-y-24 scrollbar-hide pb-20">
                            {/* Skins */}
                            <div>
                                <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.6em] mb-12 flex items-center gap-6">
                                    <Sparkles className="w-10 h-10 text-emerald-400" /> BIO-SHELTER COSMETICS
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                                    {SKINS.map(skin => {
                                        const isUnlocked = unlockedSkins.includes(skin.id);
                                        const isActive = currentSkin.id === skin.id;
                                        return (
                                            <button 
                                                key={skin.id}
                                                onClick={() => isUnlocked ? setCurrentSkin(skin) : (shopPoints >= (skin as any).cost && (setShopPoints(s => s - (skin as any).cost), setUnlockedSkins(u => [...u, skin.id]), setCurrentSkin(skin), playSuccessSound()))}
                                                className={`p-10 rounded-[3rem] border-8 flex flex-col items-center gap-8 transition-all hover:scale-105 active:scale-95 shadow-2xl
                                                    ${isActive ? 'border-emerald-500 bg-emerald-500/10' : isUnlocked ? 'border-slate-700 bg-slate-800' : 'border-slate-800 bg-slate-900 opacity-60'}
                                                `}
                                            >
                                                <div className={`w-32 h-32 rounded-[2rem] ${skin.color} shadow-2xl ring-4 ring-white/10`} />
                                                <div className="text-center">
                                                    <div className="text-3xl font-black tracking-tight mb-2">{skin.name}</div>
                                                    {!isUnlocked && <div className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-2"><Lock className="w-6 h-6"/> {(skin as any).cost}</div>}
                                                    {isActive && <div className="text-sm font-black text-emerald-400 uppercase tracking-[0.4em] bg-emerald-400/10 px-4 py-1 rounded-full">ACTIVE</div>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weapons */}
                            <div>
                                <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.6em] mb-12 flex items-center gap-6">
                                    <Target className="w-10 h-10 text-blue-400" /> DEFENSE SYSTEMS
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    {WEAPONS.map(w => {
                                        const isUnlocked = unlockedWeapons.includes(w.id);
                                        const isActive = currentWeapon === w.id;
                                        return (
                                            <button 
                                                key={w.id}
                                                onClick={() => isUnlocked ? setCurrentWeapon(w.id) : (shopPoints >= w.cost && (setShopPoints(s => s - w.cost), setUnlockedWeapons(u => [...u, w.id]), setCurrentWeapon(w.id), playSuccessSound()))}
                                                className={`p-12 rounded-[4rem] border-8 flex items-center gap-12 transition-all text-left hover:scale-[1.03] active:scale-[0.97] shadow-2xl
                                                    ${isActive ? 'border-blue-500 bg-blue-500/10' : isUnlocked ? 'border-slate-700 bg-slate-800' : 'border-slate-800 bg-slate-900 opacity-60'}
                                                `}
                                            >
                                                <div className="text-[100px] bg-slate-950 w-40 h-40 rounded-[3rem] flex items-center justify-center shadow-inner border-4 border-white/5">{w.icon}</div>
                                                <div>
                                                    <div className="text-4xl font-black tracking-tight mb-4">{w.name}</div>
                                                    {!isUnlocked ? (
                                                        <div className="flex items-center gap-4 text-3xl font-black text-yellow-400 bg-yellow-400/10 px-6 py-2 rounded-2xl">
                                                            <Lock className="w-8 h-8" /> {w.cost} CREDITS
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-black text-blue-400 uppercase tracking-[0.6em] bg-blue-400/10 px-6 py-2 rounded-full inline-block">{isActive ? 'EQUIPPED' : 'OWNED'}</div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-12 border-t-8 border-white/5 text-center">
                            <button onClick={() => setIsShopOpen(false)} className="px-32 py-10 bg-yellow-400 text-slate-950 font-black rounded-[3rem] text-5xl hover:scale-105 transition-transform uppercase tracking-[0.2em] shadow-[0_0_80px_rgba(234,179,8,0.4)] active:scale-95 border-b-[12px] border-yellow-600">CONTINUE SIMULATION</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudySnakeGame;
